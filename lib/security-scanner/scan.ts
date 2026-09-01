// ──────────────────────────────────────────────────────────────────────────
// Passive, read-only security scanner for "vibe-coded" websites — the class
// of sites built quickly with AI page builders (v0, Bolt, Lovable, Replit
// Agent, etc.) that commonly ship with secrets hardcoded into client bundles,
// missing security headers, or exposed .env/.git files because the AI
// generator never knew those needed to stay server-side.
//
// Every check here is non-destructive: a handful of plain GET requests to
// the target's own public URLs (the homepage, a few well-known paths, and
// same-origin <script> files already linked from the page) and a small set
// of pattern matches over the returned text. Nothing here sends payloads,
// attempts authentication bypass, or touches anything not already served
// publicly by the site itself — this is the same class of tool as Mozilla
// Observatory or SecurityHeaders.com, not a penetration-testing tool.
//
// Same shape as lib/mobile-checker/audit.ts's AuditCheck on purpose — lets
// this tool reuse components/mobile-checker/audit-ui.tsx's ScoreGauge,
// GradeBadge, CheckRow, IssuesAndFixes, and AuditChecklist components
// without duplicating that UI.
// ──────────────────────────────────────────────────────────────────────────

import * as cheerio from 'cheerio'
import { fetchText, DEFAULT_UA, type FetchOpts } from '@/lib/shared/crawl'

// `fetchText` deliberately discards the response body on non-2xx statuses
// (the right call for its normal "fetch a page" use). The exposed-path and
// error-disclosure probes below specifically need the body *especially* on
// error statuses (a 404/500 page's content is the whole point), so they use
// this local, status-agnostic variant instead.
async function fetchProbe(url: string, timeout = 5000, maxBytes = 50 * 1024): Promise<{ text: string; status: number }> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeout)
  try {
    const res = await fetch(url, { headers: { 'User-Agent': DEFAULT_UA }, redirect: 'follow', signal: ctrl.signal })
    const reader = res.body?.getReader()
    if (!reader) return { text: await res.text(), status: res.status }
    const decoder = new TextDecoder()
    let text = ''
    let bytes = 0
    while (bytes < maxBytes) {
      const { done, value } = await reader.read()
      if (done) break
      text += decoder.decode(value, { stream: true })
      bytes += value.byteLength
    }
    reader.cancel().catch(() => {})
    return { text, status: res.status }
  } catch {
    return { text: '', status: 0 }
  } finally {
    clearTimeout(timer)
  }
}

export type CheckStatus = 'pass' | 'warning' | 'fail' | 'info'
export type CheckConfidence = 'measured' | 'heuristic'

export interface SecurityCheck {
  id: string
  name: string
  category: string
  status: CheckStatus
  confidence: CheckConfidence
  weight: number
  detail: string
  evidence?: string[]
  solution?: string
  solutionCode?: string
}

export type Grade = 'Excellent' | 'Good' | 'Needs Work' | 'Poor'

export interface SecurityScanResult {
  url: string
  score: number
  grade: Grade
  checks: SecurityCheck[]
  passCount: number
  warningCount: number
  failCount: number
}

export const CATEGORY = {
  HEADERS: 'HTTP Security Headers',
  SECRETS: 'Exposed Secrets & Keys',
  LIBRARIES: 'Vulnerable JS Libraries',
  EXPOSURE: 'Exposed Files & Paths',
  DISCLOSURE: 'Information Disclosure',
}

function grade(score: number): Grade {
  if (score >= 90) return 'Excellent'
  if (score >= 70) return 'Good'
  if (score >= 45) return 'Needs Work'
  return 'Poor'
}

// ── Secret patterns ──────────────────────────────────────────────────────

interface SecretPattern {
  id: string
  label: string
  regex: RegExp
  weight: number
  solution: string
}

const SECRET_PATTERNS: SecretPattern[] = [
  {
    id: 'secret-openai',
    label: 'OpenAI API key',
    regex: /\bsk-[A-Za-z0-9]{20,}\b/,
    weight: 22,
    solution: 'Move this key server-side immediately and rotate it in your OpenAI dashboard — any hardcoded client-side key is already compromised the moment the page is deployed. Call OpenAI from an API route/serverless function instead, never from browser JS.',
  },
  {
    id: 'secret-stripe',
    label: 'Stripe secret key',
    regex: /\bsk_live_[0-9a-zA-Z]{20,}\b/,
    weight: 22,
    solution: 'Rotate this key in your Stripe dashboard immediately — a live secret key exposed client-side lets anyone move money through your account. Only Stripe *publishable* keys (pk_live_...) are safe to ship to the browser.',
  },
  {
    id: 'secret-aws',
    label: 'AWS access key ID',
    regex: /\bAKIA[0-9A-Z]{16}\b/,
    weight: 22,
    solution: 'Deactivate and rotate this AWS key immediately in IAM, then audit CloudTrail for unauthorized use. Never embed AWS credentials in frontend code — use short-lived, scoped credentials issued by your backend instead.',
  },
  {
    id: 'secret-private-key',
    label: 'Private key block (PEM)',
    regex: /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/,
    weight: 25,
    solution: 'Remove this private key from the deployed bundle and rotate whatever it authenticates immediately — a leaked private key is a full compromise of anything it protects.',
  },
  {
    id: 'secret-google',
    label: 'Google API key',
    regex: /\bAIza[0-9A-Za-z\-_]{35}\b/,
    weight: 14,
    solution: 'Restrict this key in the Google Cloud Console (HTTP referrer + API restrictions) if it must stay client-side, or move server-only APIs behind your own backend so the key never ships to the browser at all.',
  },
  {
    id: 'secret-slack',
    label: 'Slack token',
    regex: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/,
    weight: 18,
    solution: 'Revoke this token in your Slack app settings and reissue it. Slack tokens should only ever be used from a server, never bundled into client-side JavaScript.',
  },
  {
    id: 'secret-db-connection',
    label: 'Database connection string with credentials',
    regex: /\b(postgres(?:ql)?|mysql|mongodb(?:\+srv)?):\/\/[^:\s'"]+:[^@\s'"]+@[^\s'"]+/i,
    weight: 25,
    solution: 'Rotate the database password immediately — this exposes direct, authenticated access to your database. Database credentials must only ever live in server-side environment variables, never in code shipped to the browser.',
  },
  {
    id: 'secret-generic-assignment',
    label: 'Hardcoded secret/token variable',
    regex: /\b(secret|api[_-]?key|access[_-]?token|auth[_-]?token)\s*[:=]\s*['"][A-Za-z0-9_\-]{16,}['"]/i,
    weight: 8,
    solution: 'Review this value — if it\'s a real secret, move it to a server-side environment variable and rotate it. If it\'s a public/publishable key, you can safely ignore this warning.',
  },
]

function findJwtServiceRole(text: string): string | null {
  const jwtRegex = /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g
  const matches = text.match(jwtRegex) ?? []
  for (const token of matches.slice(0, 40)) {
    const parts = token.split('.')
    if (parts.length < 2) continue
    try {
      const payloadB64 = parts[1].replace(/-/g, '+').replace(/_/g, '/').padEnd(parts[1].length + (4 - (parts[1].length % 4)) % 4, '=')
      const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString('utf-8'))
      if (payload && (payload.role === 'service_role' || payload.role === 'supabase_admin')) return token
    } catch { /* not a decodable JWT payload — skip */ }
  }
  return null
}

// ── Vulnerable JS library signatures (small curated set, version-based) ──

interface LibrarySignature {
  name: string
  match: RegExp
  safeAtLeast: string
  advisory: string
}

const LIBRARY_SIGNATURES: LibrarySignature[] = [
  { name: 'jQuery', match: /jquery[\s.\-]*(?:core[\s.\-]*)?v?\s*(\d+\.\d+\.\d+)/i, safeAtLeast: '3.5.0', advisory: 'jQuery versions before 3.5.0 are vulnerable to XSS via cross-domain AJAX and HTML manipulation methods (CVE-2020-11022, CVE-2020-11023).' },
  { name: 'Lodash', match: /lodash[\s.\-]*v?\s*(\d+\.\d+\.\d+)/i, safeAtLeast: '4.17.21', advisory: 'Lodash versions before 4.17.21 are vulnerable to prototype pollution (CVE-2020-8203, CVE-2021-23337).' },
  { name: 'Moment.js', match: /moment(?:\.js)?[\s.\-]*v?\s*(\d+\.\d+\.\d+)/i, safeAtLeast: '2.29.4', advisory: 'Moment.js versions before 2.29.4 are vulnerable to a ReDoS via crafted locale strings (CVE-2022-31129).' },
  { name: 'Bootstrap', match: /bootstrap[\s.\-]*v?\s*(\d+\.\d+\.\d+)/i, safeAtLeast: '4.3.1', advisory: 'Bootstrap versions before 4.3.1 have a known XSS issue via the tooltip/popover data-template attribute (CVE-2019-8331).' },
  { name: 'AngularJS', match: /angular(?:\.js)?[\s.\-]*v?\s*(1\.\d+\.\d+)/i, safeAtLeast: '1.8.0', advisory: 'AngularJS (1.x) reached end-of-life in January 2022 and versions before 1.8.0 have multiple known sandbox-bypass XSS vulnerabilities. Consider migrating off AngularJS entirely.' },
]

function isVersionBelow(version: string, minSafe: string): boolean {
  const a = version.split('.').map((n) => parseInt(n, 10) || 0)
  const b = minSafe.split('.').map((n) => parseInt(n, 10) || 0)
  for (let i = 0; i < 3; i++) {
    if ((a[i] ?? 0) !== (b[i] ?? 0)) return (a[i] ?? 0) < (b[i] ?? 0)
  }
  return false
}

// ── Info-disclosure signatures ───────────────────────────────────────────

const STACK_TRACE_PATTERNS = [
  /at\s+[\w$.<>]+\s+\([^)]*:\d+:\d+\)/,
  /node_modules[\\/][\w@.-]+/,
  /\bUnhandled Runtime Error\b/,
  /__next_error__/,
  /Warning: Failed prop type/,
  /Fatal error:.*in\s+\/.*\.php on line \d+/i,
  /Traceback \(most recent call last\)/,
]

export interface SecurityScanInput {
  url: string
  fetchOpts?: FetchOpts
}

export async function runSecurityScan({ url, fetchOpts = {} }: SecurityScanInput): Promise<SecurityScanResult | { error: string }> {
  let origin: string
  try { origin = new URL(url).origin } catch { return { error: 'Invalid URL.' } }

  const home = await fetchText(url, 'text/html,*/*', fetchOpts)
  if (home.status === 0) return { error: 'Could not reach this URL — it may be down, blocking automated requests, or the domain may not exist.' }
  if (home.status >= 400) return { error: `Site returned HTTP ${home.status} for this URL.` }

  const checks: SecurityCheck[] = []
  const $ = cheerio.load(home.text)
  const headers = home.headers

  // ── HTTP Security Headers ────────────────────────────────────────────
  const csp = headers['content-security-policy']
  checks.push({
    id: 'header-csp', name: 'Content-Security-Policy header', category: CATEGORY.HEADERS,
    status: csp ? 'pass' : 'fail', confidence: 'measured', weight: 15,
    detail: csp ? `CSP is set: ${csp.length > 100 ? csp.slice(0, 100) + '…' : csp}` : 'No Content-Security-Policy header found. CSP is the strongest single defense against XSS and data-injection attacks.',
    ...(!csp && {
      solution: 'Add a Content-Security-Policy header restricting which scripts, styles, and origins your page can load from. Start with a conservative default-src \'self\' and loosen only what you need.',
      solutionCode: "Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none'",
    }),
  })

  const hsts = headers['strict-transport-security']
  checks.push({
    id: 'header-hsts', name: 'Strict-Transport-Security (HSTS)', category: CATEGORY.HEADERS,
    status: hsts ? 'pass' : 'warning', confidence: 'measured', weight: 10,
    detail: hsts ? `HSTS is set: ${hsts}` : 'No Strict-Transport-Security header — browsers won\'t be forced to use HTTPS for future visits, leaving a window for downgrade/man-in-the-middle attacks.',
    ...(!hsts && {
      solution: 'Add an HSTS header so browsers always connect over HTTPS after the first visit.',
      solutionCode: 'Strict-Transport-Security: max-age=63072000; includeSubDomains; preload',
    }),
  })

  const xcto = headers['x-content-type-options']
  checks.push({
    id: 'header-xcto', name: 'X-Content-Type-Options', category: CATEGORY.HEADERS,
    status: xcto?.toLowerCase() === 'nosniff' ? 'pass' : 'warning', confidence: 'measured', weight: 6,
    detail: xcto?.toLowerCase() === 'nosniff' ? 'X-Content-Type-Options: nosniff is set.' : 'Missing X-Content-Type-Options: nosniff — browsers may MIME-sniff responses, letting a malicious upload be executed as a different content type.',
    ...(xcto?.toLowerCase() !== 'nosniff' && {
      solution: 'Add this header so browsers trust your declared Content-Type instead of guessing.',
      solutionCode: 'X-Content-Type-Options: nosniff',
    }),
  })

  const xfo = headers['x-frame-options']
  const cspFrameAncestors = csp?.includes('frame-ancestors')
  const clickjackProtected = !!xfo || !!cspFrameAncestors
  checks.push({
    id: 'header-clickjacking', name: 'Clickjacking protection (X-Frame-Options / frame-ancestors)', category: CATEGORY.HEADERS,
    status: clickjackProtected ? 'pass' : 'warning', confidence: 'measured', weight: 8,
    detail: clickjackProtected ? `Protected via ${xfo ? `X-Frame-Options: ${xfo}` : 'CSP frame-ancestors'}.` : 'No X-Frame-Options or CSP frame-ancestors directive — this page can be embedded in an invisible iframe on another site for clickjacking attacks.',
    ...(!clickjackProtected && {
      solution: 'Add X-Frame-Options (or a CSP frame-ancestors directive) so your pages can\'t be framed by other sites.',
      solutionCode: 'X-Frame-Options: SAMEORIGIN',
    }),
  })

  const referrerPolicy = headers['referrer-policy']
  checks.push({
    id: 'header-referrer-policy', name: 'Referrer-Policy header', category: CATEGORY.HEADERS,
    status: referrerPolicy ? 'pass' : 'warning', confidence: 'measured', weight: 5,
    detail: referrerPolicy ? `Referrer-Policy is set: ${referrerPolicy}` : 'No Referrer-Policy header — full URLs (potentially including query-string tokens) may leak to third parties via the Referer header on outbound links.',
    ...(!referrerPolicy && {
      solution: 'Add a Referrer-Policy header to control how much URL information is sent to other sites.',
      solutionCode: 'Referrer-Policy: strict-origin-when-cross-origin',
    }),
  })

  const permissionsPolicy = headers['permissions-policy']
  checks.push({
    id: 'header-permissions-policy', name: 'Permissions-Policy header', category: CATEGORY.HEADERS,
    status: permissionsPolicy ? 'pass' : 'info', confidence: 'measured', weight: 0,
    detail: permissionsPolicy ? `Permissions-Policy is set: ${permissionsPolicy}` : 'No Permissions-Policy header set (informational — restricts access to browser features like camera, microphone, and geolocation).',
  })

  const serverHeader = headers['server']
  const poweredBy = headers['x-powered-by']
  const leaksVersion = /\d+\.\d+/.test(serverHeader ?? '') || !!poweredBy
  checks.push({
    id: 'header-info-leak', name: 'Server/framework version disclosure', category: CATEGORY.HEADERS,
    status: leaksVersion ? 'info' : 'pass', confidence: 'measured', weight: 0,
    detail: leaksVersion
      ? `Server response headers reveal implementation details: ${[serverHeader && `Server: ${serverHeader}`, poweredBy && `X-Powered-By: ${poweredBy}`].filter(Boolean).join(', ')}. Low risk, but gives attackers a head start on which known vulnerabilities to try.`
      : 'No Server or X-Powered-By version information disclosed in response headers.',
  })

  const acao = headers['access-control-allow-origin']
  const acac = headers['access-control-allow-credentials']
  const corsMisconfigured = acao === '*' && acac?.toLowerCase() === 'true'
  checks.push({
    id: 'header-cors', name: 'CORS configuration', category: CATEGORY.HEADERS,
    status: corsMisconfigured ? 'fail' : acao ? 'info' : 'pass', confidence: 'measured', weight: corsMisconfigured ? 15 : 0,
    detail: corsMisconfigured
      ? 'Access-Control-Allow-Origin: * is combined with Access-Control-Allow-Credentials: true — this combination lets any website read authenticated responses from this origin on behalf of a logged-in visitor.'
      : acao ? `Access-Control-Allow-Origin: ${acao} (informational — fine for public, non-authenticated APIs).` : 'No permissive CORS headers detected on this response.',
    ...(corsMisconfigured && {
      solution: 'Never combine a wildcard origin with credentialed requests. Either restrict Access-Control-Allow-Origin to an explicit allow-list of trusted origins, or drop Access-Control-Allow-Credentials if the endpoint doesn\'t need cookies/auth headers.',
      solutionCode: 'Access-Control-Allow-Origin: https://yourtrustedapp.com\nAccess-Control-Allow-Credentials: true',
    }),
  })

  // ── Exposed Secrets & Keys ───────────────────────────────────────────
  const inlineScripts = $('script:not([src])').map((_, el) => $(el).text()).get().join('\n')
  const scriptSrcs = Array.from(new Set(
    $('script[src]').map((_, el) => $(el).attr('src')).get()
      .filter((src): src is string => !!src)
      .map((src) => { try { return new URL(src, url).href } catch { return null } })
      .filter((href): href is string => !!href && new URL(href).origin === origin)
      .slice(0, 6),
  ))
  const bundleTexts = await Promise.all(scriptSrcs.map((src) => fetchText(src, 'text/javascript,*/*', { ...fetchOpts, maxBytes: 300 * 1024 })))
  const combinedJs = [inlineScripts, ...bundleTexts.map((b) => b.text)].join('\n')
  const combinedAll = `${home.text}\n${combinedJs}`

  for (const pattern of SECRET_PATTERNS) {
    const match = combinedAll.match(pattern.regex)
    checks.push({
      id: pattern.id, name: pattern.label, category: CATEGORY.SECRETS,
      status: match ? 'fail' : 'pass', confidence: 'measured', weight: pattern.weight,
      detail: match ? `Found a string matching the pattern for a ${pattern.label.toLowerCase()} in page source or a linked script.` : `No ${pattern.label.toLowerCase()} pattern found in page source or linked same-origin scripts.`,
      evidence: match ? [`${match[0].slice(0, 6)}${'•'.repeat(Math.max(0, Math.min(match[0].length - 10, 24)))}${match[0].slice(-4)}`] : undefined,
      ...(match && { solution: pattern.solution }),
    })
  }

  const serviceRoleJwt = findJwtServiceRole(combinedAll)
  checks.push({
    id: 'secret-supabase-service-role', name: 'Exposed Supabase/JWT service-role key', category: CATEGORY.SECRETS,
    status: serviceRoleJwt ? 'fail' : 'pass', confidence: 'measured', weight: 25,
    detail: serviceRoleJwt ? 'Found a JWT with a "service_role" (or "supabase_admin") claim in page source or a linked script — this key bypasses Row Level Security entirely.' : 'No service-role JWT found in page source or linked same-origin scripts.',
    evidence: serviceRoleJwt ? [`${serviceRoleJwt.slice(0, 12)}…${serviceRoleJwt.slice(-6)}`] : undefined,
    ...(serviceRoleJwt && {
      solution: 'Rotate this key in your Supabase project settings immediately. The service-role key bypasses all Row Level Security policies and must only ever be used in server-side code — never in a browser bundle. Use the anon/public key client-side instead, protected by RLS policies.',
    }),
  })

  // ── Vulnerable JS Libraries ───────────────────────────────────────────
  const detectedLibs: { name: string; version: string; advisory: string; vulnerable: boolean }[] = []
  for (const lib of LIBRARY_SIGNATURES) {
    const m = combinedAll.match(lib.match)
    if (m?.[1]) detectedLibs.push({ name: lib.name, version: m[1], advisory: lib.advisory, vulnerable: isVersionBelow(m[1], lib.safeAtLeast) })
  }
  if (detectedLibs.length === 0) {
    checks.push({
      id: 'libs-none-detected', name: 'JS library version scan', category: CATEGORY.LIBRARIES,
      status: 'info', confidence: 'heuristic', weight: 0,
      detail: 'No commonly-fingerprinted JS libraries (jQuery, Lodash, Moment.js, Bootstrap, AngularJS) were detected by version signature on this page.',
    })
  } else {
    for (const lib of detectedLibs) {
      checks.push({
        id: `lib-${lib.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`, name: `${lib.name} version`, category: CATEGORY.LIBRARIES,
        status: lib.vulnerable ? 'fail' : 'pass', confidence: 'heuristic', weight: 15,
        detail: lib.vulnerable ? `Detected ${lib.name} v${lib.version}, which has known vulnerabilities. ${lib.advisory}` : `Detected ${lib.name} v${lib.version} — no known vulnerabilities for this version in our signature set.`,
        ...(lib.vulnerable && { solution: `Update ${lib.name} to the latest version. ${lib.advisory}` }),
      })
    }
  }

  // ── Exposed Files & Paths ────────────────────────────────────────────
  const probeToken = `airanko-probe-${Math.random().toString(36).slice(2)}`
  const baseline = await fetchProbe(`${origin}/${probeToken}`, fetchOpts.timeout)
  const baselineLen = baseline.text.length

  function looksLikeFallback(body: string): boolean {
    if (baseline.status !== 200) return false
    if (body.length === 0) return true
    const diff = Math.abs(body.length - baselineLen)
    return diff < Math.max(50, baselineLen * 0.05)
  }

  const envProbe = await fetchProbe(`${origin}/.env`, fetchOpts.timeout)
  const envExposed = envProbe.status === 200 && !looksLikeFallback(envProbe.text) && /^[A-Z0-9_]+\s*=/m.test(envProbe.text)
  checks.push({
    id: 'exposure-env', name: 'Exposed .env file', category: CATEGORY.EXPOSURE,
    status: envExposed ? 'fail' : 'pass', confidence: 'measured', weight: 25,
    detail: envExposed ? 'A publicly accessible .env file was found at /.env — this typically contains API keys, database URLs, and other secrets in plaintext.' : 'No publicly accessible .env file found at /.env.',
    ...(envExposed && {
      solution: 'Remove .env from your deployed output immediately and rotate every credential it contained. Add .env to your build\'s exclude list / server routing so it can never be served as a static file, and confirm it\'s in .gitignore.',
    }),
  })

  const gitProbe = await fetchProbe(`${origin}/.git/config`, fetchOpts.timeout)
  const gitExposed = gitProbe.status === 200 && !looksLikeFallback(gitProbe.text) && /\[core\]|repositoryformatversion/i.test(gitProbe.text)
  checks.push({
    id: 'exposure-git', name: 'Exposed .git directory', category: CATEGORY.EXPOSURE,
    status: gitExposed ? 'fail' : 'pass', confidence: 'measured', weight: 20,
    detail: gitExposed ? 'The .git directory is publicly accessible at /.git/config — this can expose your entire commit history, including any secrets ever committed, even ones later removed.' : 'No publicly accessible .git directory found.',
    ...(gitExposed && {
      solution: 'Block access to .git in your web server or hosting config immediately, and treat any secret ever committed to this repo\'s history as compromised — rotate it, even if it was later removed from the latest commit.',
    }),
  })

  const dsStoreProbe = await fetchProbe(`${origin}/.DS_Store`, fetchOpts.timeout)
  const dsStoreExposed = dsStoreProbe.status === 200 && !looksLikeFallback(dsStoreProbe.text) && dsStoreProbe.text.slice(0, 4).includes('\x00\x00\x00\x01')
  checks.push({
    id: 'exposure-dsstore', name: 'Exposed .DS_Store file', category: CATEGORY.EXPOSURE,
    status: dsStoreExposed ? 'warning' : 'pass', confidence: 'measured', weight: 4,
    detail: dsStoreExposed ? 'A macOS .DS_Store file is publicly accessible — low risk on its own, but it can reveal internal file and folder names not otherwise linked publicly.' : 'No publicly accessible .DS_Store file found.',
    ...(dsStoreExposed && { solution: 'Remove .DS_Store from your deployed output and add it to .gitignore so it never gets published again.' }),
  })

  // Exposed source maps
  const scriptTags = $('script[src]').map((_, el) => $(el).attr('src')).get().filter((s): s is string => !!s)
  let exposedMap: string | null = null
  for (const src of scriptTags.slice(0, 6)) {
    try {
      const abs = new URL(src, url).href
      if (new URL(abs).origin !== origin) continue
      const mapUrl = `${abs}.map`
      const mapRes = await fetchText(mapUrl, 'application/json,*/*', { ...fetchOpts, maxBytes: 2000 })
      if (mapRes.status === 200 && mapRes.text.trim().startsWith('{') && mapRes.text.includes('"sources"')) { exposedMap = mapUrl; break }
    } catch { /* skip unparseable script src */ }
  }
  checks.push({
    id: 'exposure-sourcemap', name: 'Exposed production source maps', category: CATEGORY.EXPOSURE,
    status: exposedMap ? 'warning' : 'pass', confidence: 'measured', weight: 8,
    detail: exposedMap ? `A source map is publicly accessible (e.g. ${exposedMap}), which can expose your original, unminified source code and internal comments.` : 'No publicly accessible source maps (.map files) found for the scripts checked on this page.',
    ...(exposedMap && { solution: 'Disable source map generation for production builds, or configure your hosting to block direct access to .map files.' }),
  })

  // ── Information Disclosure ───────────────────────────────────────────
  const leaksStackTrace = STACK_TRACE_PATTERNS.some((re) => re.test(baseline.text))
  checks.push({
    id: 'disclosure-stack-trace', name: 'Verbose error / stack trace disclosure', category: CATEGORY.DISCLOSURE,
    status: leaksStackTrace ? 'fail' : 'pass', confidence: 'heuristic', weight: 12,
    detail: leaksStackTrace ? 'Requesting a nonexistent path returned what looks like a stack trace or debug error page — this can leak internal file paths, framework internals, and dependency versions to anyone.' : 'Requesting a nonexistent path did not return a visible stack trace or debug error page.',
    ...(leaksStackTrace && {
      solution: 'Ensure production builds run with debug/development mode disabled so error pages show a generic message instead of a stack trace. In Next.js this means deploying a production build (next build && next start), not next dev.',
    }),
  })

  // ── Score ─────────────────────────────────────────────────────────────
  const scored = checks.filter((c) => c.status !== 'info')
  const totalWeight = scored.reduce((s, c) => s + c.weight, 0)
  const earned = scored.reduce((s, c) => s + (c.status === 'pass' ? c.weight : c.status === 'warning' ? c.weight * 0.5 : 0), 0)
  const score = totalWeight === 0 ? 100 : Math.round((earned / totalWeight) * 100)

  return {
    url,
    score,
    grade: grade(score),
    checks,
    passCount: scored.filter((c) => c.status === 'pass').length,
    warningCount: scored.filter((c) => c.status === 'warning').length,
    failCount: scored.filter((c) => c.status === 'fail').length,
  }
}
