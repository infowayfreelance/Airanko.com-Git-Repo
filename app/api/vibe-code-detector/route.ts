import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 120

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

// ── Types ──────────────────────────────────────────────────────────────────

type Severity = 'Clean' | 'Moderate' | 'Heavy' | 'Excessive'

export interface AnalyzerScore {
  score: number
  severity: Severity
  details: Record<string, unknown>
}

export interface FetchedFile {
  path: string
  content: string
  bytes: number
}

export interface DetectedTool {
  name: string
  type: 'ai-tool' | 'cms' | 'site-builder' | 'framework' | 'library'
  evidence: string[]
}

export interface FingerprintSignal {
  name: string
  found: boolean
  detail: string
}

export interface PlatformDetection {
  classification: 'ai' | 'cms' | 'custom' | 'mixed'
  aiPoints: number
  cmsPoints: number
  detected: DetectedTool[]
  aiSignals: FingerprintSignal[]
  cmsSignals: FingerprintSignal[]
}

export interface VibeCodeDetectorResult {
  mode: 'url' | 'github' | 'paste'
  inputDisplay: string
  fetchInfo: {
    sourceCount: number
    totalBytes: number
    files?: { path: string; bytes: number }[]
    finalUrl?: string
    contentType?: string
  }
  platform: PlatformDetection
  overall: {
    score: number
    confidence: string
    verdictText: string
  }
  analyzers: {
    inlineCode:      AnalyzerScore
    cssQuality:      AnalyzerScore
    htmlStructure:   AnalyzerScore
    jsPatterns:      AnalyzerScore
    content:         AnalyzerScore
    securityHeaders: AnalyzerScore | null
    images:          AnalyzerScore
    metadata:        AnalyzerScore
  }
  generatedAt: string
}

// ── Helpers ────────────────────────────────────────────────────────────────

function severityFromScore(score: number): Severity {
  if (score < 25) return 'Clean'
  if (score < 50) return 'Moderate'
  if (score < 75) return 'Heavy'
  return 'Excessive'
}

function normalizeUrl(input: string): string {
  let url = input.trim()
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`
  return url
}

function countMatches(text: string, regex: RegExp): number {
  const m = text.match(regex)
  return m ? m.length : 0
}

function uniqueMatches(text: string, regex: RegExp, lower = true): string[] {
  const m = text.match(regex) ?? []
  const set = new Set<string>()
  for (const s of m) set.add(lower ? s.toLowerCase() : s)
  return Array.from(set)
}

// ── Fetchers ───────────────────────────────────────────────────────────────

async function fetchUrl(url: string): Promise<{ html: string; finalUrl: string; contentType: string }> {
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'text/html,application/xhtml+xml' },
    redirect: 'follow',
    signal: AbortSignal.timeout(20000),
  })
  if (!res.ok) throw new Error(`Failed to fetch URL (HTTP ${res.status})`)
  const html = await res.text()
  return { html, finalUrl: res.url || url, contentType: res.headers.get('content-type') ?? '' }
}

async function headRequest(url: string): Promise<Record<string, string>> {
  const headers: Record<string, string> = {}
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      headers: { 'User-Agent': USER_AGENT },
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
    })
    res.headers.forEach((value, key) => { headers[key.toLowerCase()] = value })
  } catch {
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: { 'User-Agent': USER_AGENT },
        redirect: 'follow',
        signal: AbortSignal.timeout(10000),
      })
      res.headers.forEach((value, key) => { headers[key.toLowerCase()] = value })
      res.body?.cancel().catch(() => {})
    } catch { /* ignore */ }
  }
  return headers
}

// ── GitHub fetching ────────────────────────────────────────────────────────

const ALLOWED_EXTS = new Set([
  '.html', '.htm', '.jsx', '.tsx', '.js', '.ts', '.mjs', '.cjs',
  '.css', '.scss', '.sass', '.vue', '.svelte', '.php', '.py',
])

interface GhTreeEntry { path: string; type: string; size?: number }

function parseGithubUrl(url: string): { owner: string; repo: string; branch?: string } | null {
  const m = url.match(/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?(?:\/(?:tree|blob)\/([^/]+))?/i)
  if (!m) return null
  return { owner: m[1], repo: m[2].replace(/\.git$/, ''), branch: m[3] }
}

async function fetchGithub(repoUrl: string): Promise<FetchedFile[]> {
  const parsed = parseGithubUrl(repoUrl)
  if (!parsed) throw new Error('Invalid GitHub URL. Expected https://github.com/owner/repo')

  let branch = parsed.branch
  if (!branch) {
    const repoRes = await fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}`, {
      headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'AiRankoBot/1.0' },
      signal: AbortSignal.timeout(10000),
    })
    if (!repoRes.ok) {
      if (repoRes.status === 404) throw new Error('Repository not found or is private.')
      if (repoRes.status === 403) throw new Error('GitHub rate limit exceeded. Try again in a few minutes.')
      throw new Error(`GitHub API error (${repoRes.status})`)
    }
    const repoData = await repoRes.json()
    branch = repoData.default_branch as string
  }

  const treeRes = await fetch(
    `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/git/trees/${branch}?recursive=1`,
    { headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'AiRankoBot/1.0' }, signal: AbortSignal.timeout(15000) },
  )
  if (!treeRes.ok) throw new Error(`Failed to fetch repo tree (${treeRes.status})`)
  const treeData = await treeRes.json() as { tree: GhTreeEntry[]; truncated?: boolean }

  const candidates = (treeData.tree ?? [])
    .filter((e) => e.type === 'blob')
    .filter((e) => {
      const dot = e.path.lastIndexOf('.')
      const ext = dot >= 0 ? e.path.slice(dot).toLowerCase() : ''
      return ALLOWED_EXTS.has(ext)
    })
    .filter((e) => !e.path.includes('node_modules/') && !e.path.includes('.next/') && !e.path.includes('dist/') && !e.path.includes('build/'))

  const priority = (p: string) => {
    if (!p.includes('/')) return 0
    if (p.startsWith('src/') || p.startsWith('app/') || p.startsWith('components/')) return 1
    if (p.startsWith('public/') || p.startsWith('pages/')) return 2
    return 3
  }
  candidates.sort((a, b) => priority(a.path) - priority(b.path))

  const toFetch = candidates.slice(0, 30).filter((e) => !e.size || e.size < 200_000)

  const results: FetchedFile[] = await Promise.all(
    toFetch.map(async (entry) => {
      try {
        const raw = await fetch(
          `https://raw.githubusercontent.com/${parsed.owner}/${parsed.repo}/${branch}/${entry.path}`,
          { signal: AbortSignal.timeout(8000) },
        )
        if (!raw.ok) return null
        const content = await raw.text()
        return { path: entry.path, content, bytes: content.length }
      } catch { return null }
    }),
  ).then((arr) => arr.filter((x): x is FetchedFile => x !== null))

  if (results.length === 0) throw new Error('No analyzable files found in the repo.')
  return results
}

// ──────────────────────────────────────────────────────────────────────────
// PLATFORM & TOOL FINGERPRINTING
// The core of the verdict. CMS/site-builder markup (WordPress + Elementor,
// Wix, Shopify, …) is template-generated — messy HTML there does NOT mean
// vibe-coded. Conversely, v0 / Lovable / Bolt / shadcn stacks are direct
// evidence of AI generation.
// ──────────────────────────────────────────────────────────────────────────

const AI_GENERATOR_NAMES = ['v0', 'vercel v0', 'bolt', 'lovable', 'cursor', 'windsurf', 'replit', 'devin', 'github copilot', 'chatgpt', 'claude', 'gpt-engineer']

// shadcn/ui semantic design tokens — the signature class vocabulary emitted by
// v0, Lovable, Bolt and most AI site builders. Almost never hand-typed at scale
// outside that ecosystem.
const SHADCN_TOKENS = [
  'text-muted-foreground', 'bg-background', 'text-foreground', 'border-border',
  'bg-card', 'text-card-foreground', 'text-primary-foreground', 'bg-muted',
  'ring-offset-background', 'bg-popover', 'text-popover-foreground',
  'bg-accent', 'text-accent-foreground', 'bg-destructive', 'text-destructive-foreground',
  'bg-secondary', 'text-secondary-foreground',
]

function detectPlatform(html: string, generatorValues: string[]): PlatformDetection {
  const L = html.toLowerCase()
  const gen = generatorValues.join(' | ').toLowerCase()
  const detected: DetectedTool[] = []
  let aiPoints = 0
  let cmsPoints = 0

  const addTool = (name: string, type: DetectedTool['type'], evidence: string[]) => {
    const existing = detected.find((d) => d.name === name)
    if (existing) existing.evidence.push(...evidence.filter((e) => !existing.evidence.includes(e)))
    else detected.push({ name, type, evidence })
  }

  // ── CMS: WordPress ecosystem ──
  const wpEvidence: string[] = []
  if (L.includes('/wp-content/'))  wpEvidence.push('wp-content asset paths')
  if (L.includes('/wp-includes/')) wpEvidence.push('wp-includes core scripts')
  if (L.includes('/wp-json'))      wpEvidence.push('wp-json REST API endpoint')
  if (gen.includes('wordpress'))   wpEvidence.push('generator meta tag: WordPress')
  const isWordPress = wpEvidence.length > 0
  if (isWordPress) { addTool('WordPress', 'cms', wpEvidence); cmsPoints += 60 }

  const hasElementor = /class=["'][^"']*elementor|data-elementor-type|elementor-frontend/i.test(html)
  if (hasElementor) { addTool('Elementor', 'site-builder', ['elementor-* classes / data-elementor attributes']); cmsPoints += 25 }
  const hasDivi = L.includes('et_pb_')
  if (hasDivi) { addTool('Divi Builder', 'site-builder', ['et_pb_* module classes']); cmsPoints += 25 }
  const hasWpBakery = L.includes('vc_row')
  if (hasWpBakery) { addTool('WPBakery', 'site-builder', ['vc_row layout classes']); cmsPoints += 25 }
  const hasGutenberg = L.includes('wp-block-')
  if (hasGutenberg) { addTool('Gutenberg', 'site-builder', ['wp-block-* block classes']); cmsPoints += 15 }
  if (L.includes('woocommerce')) { addTool('WooCommerce', 'cms', ['woocommerce classes/assets']); cmsPoints += 10 }

  // ── Other CMS / hosted site builders ──
  const otherCms: { name: string; test: boolean; ev: string; type: DetectedTool['type'] }[] = [
    { name: 'Shopify',     test: L.includes('cdn.shopify.com') || L.includes('/cdn/shop/') || L.includes('shopify.theme'), ev: 'Shopify CDN / theme runtime', type: 'cms' },
    { name: 'Wix',         test: L.includes('wixstatic.com') || L.includes('parastorage.com'), ev: 'Wix static asset domains', type: 'site-builder' },
    { name: 'Squarespace', test: L.includes('squarespace.com') || L.includes('sqs-block') || gen.includes('squarespace'), ev: 'Squarespace assets / sqs-block classes', type: 'site-builder' },
    { name: 'Webflow',     test: L.includes('website-files.com') || L.includes('data-wf-page') || gen.includes('webflow'), ev: 'Webflow asset CDN / data-wf attributes', type: 'site-builder' },
    { name: 'Framer',      test: L.includes('framerusercontent.com'), ev: 'Framer user-content CDN', type: 'site-builder' },
    { name: 'Drupal',      test: gen.includes('drupal') || L.includes('/sites/default/files'), ev: 'Drupal generator / default file paths', type: 'cms' },
    { name: 'Joomla',      test: gen.includes('joomla') || L.includes('/media/jui/'), ev: 'Joomla generator / media paths', type: 'cms' },
    { name: 'Ghost',       test: gen.includes('ghost'), ev: 'Ghost generator meta tag', type: 'cms' },
    { name: 'Blogger',     test: L.includes('blogger.com/static') || gen.includes('blogger'), ev: 'Blogger static assets', type: 'cms' },
    { name: 'Duda',        test: L.includes('dudaone') || L.includes('duda_website_builder'), ev: 'Duda builder runtime', type: 'site-builder' },
    { name: 'Weebly',      test: L.includes('weebly.com'), ev: 'Weebly assets', type: 'site-builder' },
  ]
  for (const c of otherCms) {
    if (c.test) { addTool(c.name, c.type, [c.ev]); cmsPoints += 60 }
  }

  // ── Traditional-stack libraries (mild human/CMS signal — AI tools rarely emit these today) ──
  const hasJquery = /<script[^>]*src=["'][^"']*jquery[^"']*["']/i.test(html)
  if (hasJquery) { addTool('jQuery', 'library', ['jQuery script include']); cmsPoints += 10 }
  const hasBootstrap = /<link[^>]*href=["'][^"']*bootstrap[^"']*["']|class=["'][^"']*\b(?:navbar-expand|col-md-|col-lg-)/i.test(html)
  if (hasBootstrap) { addTool('Bootstrap', 'library', ['Bootstrap CSS / grid classes']); cmsPoints += 10 }

  // ── AI-tool fingerprints ──
  const aiGenerator = generatorValues.find((g) => AI_GENERATOR_NAMES.some((n) => g.toLowerCase().includes(n))) ?? null
  if (aiGenerator) { addTool(aiGenerator, 'ai-tool', [`generator meta tag: ${aiGenerator}`]); aiPoints += 60 }

  const hasV0 = L.includes('data-v0-t') || L.includes('v0.dev') || L.includes('v0.app')
  if (hasV0) { addTool('v0 by Vercel', 'ai-tool', ['data-v0-t attribute / v0.dev references']); aiPoints += 55 }

  const hasLovable = L.includes('gptengineer') || L.includes('gpt-engineer') || L.includes('lovable.dev') || L.includes('lovable-badge') || L.includes('lovableproject.com')
  if (hasLovable) { addTool('Lovable', 'ai-tool', ['Lovable / GPT-Engineer script or badge']); aiPoints += 55 }

  const hasBolt = L.includes('bolt.new')
  if (hasBolt) { addTool('Bolt', 'ai-tool', ['bolt.new references']); aiPoints += 45 }

  const hasBase44 = L.includes('base44')
  if (hasBase44) { addTool('Base44', 'ai-tool', ['base44 references']); aiPoints += 45 }

  const hasReplit = L.includes('.repl.co') || L.includes('replit.dev') || L.includes('replit-badge')
  if (hasReplit) { addTool('Replit', 'ai-tool', ['Replit hosting / badge markers']); aiPoints += 35 }

  // shadcn/ui token vocabulary
  let shadcnTotal = 0
  const shadcnFound: string[] = []
  for (const token of SHADCN_TOKENS) {
    const c = countMatches(L, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'))
    if (c > 0) { shadcnFound.push(token); shadcnTotal += c }
  }
  const shadcnStrong = shadcnFound.length >= 4 && shadcnTotal >= 8
  const shadcnModerate = !shadcnStrong && shadcnFound.length >= 2
  if (shadcnStrong)   { addTool('shadcn/ui', 'ai-tool', [`${shadcnFound.length} design tokens × ${shadcnTotal} uses (${shadcnFound.slice(0, 4).join(', ')}…)`]); aiPoints += 40 }
  else if (shadcnModerate) { addTool('shadcn/ui (partial)', 'ai-tool', [`${shadcnFound.length} design tokens found`]); aiPoints += 20 }

  const hasRadix = L.includes('data-radix-') || L.includes('id="radix-') || L.includes("id='radix-")
  if (hasRadix) { addTool('Radix UI', 'library', ['data-radix-* / radix element ids']); aiPoints += 15 }

  const hasLucide = L.includes('class="lucide') || L.includes('lucide lucide-')
  if (hasLucide) { addTool('Lucide icons', 'library', ['lucide-* SVG icon classes']); aiPoints += 10 }

  const hasTailwindCdn = L.includes('cdn.tailwindcss.com')
  if (hasTailwindCdn) { addTool('Tailwind CDN', 'library', ['cdn.tailwindcss.com script (prototype-style build)']); aiPoints += 25 }

  // ── Frameworks (neutral context) ──
  if (L.includes('id="__next"') || L.includes('/_next/') || L.includes('self.__next_f')) addTool('Next.js', 'framework', ['__next root / _next assets'])
  else if (L.includes('data-reactroot') || L.includes('id="root"') && L.includes('react')) addTool('React', 'framework', ['React root markers'])
  if (L.includes('__nuxt')) addTool('Nuxt', 'framework', ['__nuxt root'])
  if (/ng-version=/i.test(html)) addTool('Angular', 'framework', ['ng-version attribute'])
  if (L.includes('astro-island')) addTool('Astro', 'framework', ['astro-island elements'])
  if (L.includes('___gatsby')) addTool('Gatsby', 'framework', ['___gatsby root'])

  aiPoints = Math.min(aiPoints, 100)
  cmsPoints = Math.min(cmsPoints, 100)

  // ── Fixed signal checklists (for the report UI) ──
  const aiSignals: FingerprintSignal[] = [
    { name: 'AI generator meta tag',          found: !!aiGenerator,            detail: aiGenerator ? `"${aiGenerator}"` : 'No v0 / Lovable / Bolt generator tag' },
    { name: 'v0 by Vercel fingerprint',       found: hasV0,                    detail: hasV0 ? 'data-v0-t attribute or v0.dev reference' : 'Not found' },
    { name: 'Lovable / GPT-Engineer script',  found: hasLovable,               detail: hasLovable ? 'Lovable badge or gptengineer script' : 'Not found' },
    { name: 'Bolt / Base44 / Replit markers', found: hasBolt || hasBase44 || hasReplit, detail: hasBolt || hasBase44 || hasReplit ? 'AI builder hosting references' : 'Not found' },
    { name: 'shadcn/ui design tokens',        found: shadcnStrong || shadcnModerate, detail: shadcnFound.length > 0 ? `${shadcnFound.length} tokens, ${shadcnTotal} uses` : 'None of the signature token classes' },
    { name: 'Radix UI primitives',            found: hasRadix,                 detail: hasRadix ? 'data-radix-* attributes present' : 'Not found' },
    { name: 'Lucide icon set',                found: hasLucide,                detail: hasLucide ? 'lucide-* SVG classes present' : 'Not found' },
    { name: 'Tailwind CDN prototype build',   found: hasTailwindCdn,           detail: hasTailwindCdn ? 'cdn.tailwindcss.com included' : 'Not found' },
  ]

  const anyOtherCms = otherCms.some((c) => c.test)
  const cmsSignals: FingerprintSignal[] = [
    { name: 'WordPress core assets',          found: isWordPress,   detail: isWordPress ? wpEvidence.join(', ') : 'No wp-content / wp-includes paths' },
    { name: 'Page builder markup',            found: hasElementor || hasDivi || hasWpBakery, detail: hasElementor ? 'Elementor' : hasDivi ? 'Divi' : hasWpBakery ? 'WPBakery' : 'No Elementor / Divi / WPBakery classes' },
    { name: 'Gutenberg block classes',        found: hasGutenberg,  detail: hasGutenberg ? 'wp-block-* classes present' : 'Not found' },
    { name: 'Hosted CMS / site builder',      found: anyOtherCms,   detail: anyOtherCms ? otherCms.filter((c) => c.test).map((c) => c.name).join(', ') : 'No Shopify / Wix / Squarespace / Webflow markers' },
    { name: 'Traditional stack (jQuery / Bootstrap)', found: hasJquery || hasBootstrap, detail: hasJquery || hasBootstrap ? [hasJquery && 'jQuery', hasBootstrap && 'Bootstrap'].filter(Boolean).join(', ') : 'Not found' },
  ]

  // ── Classification ──
  let classification: PlatformDetection['classification']
  if (aiPoints >= 50) classification = 'ai'
  else if (cmsPoints >= 50) classification = 'cms'
  else if (aiPoints >= 25) classification = 'mixed'
  else classification = 'custom'

  return { classification, aiPoints, cmsPoints, detected, aiSignals, cmsSignals }
}

// ──────────────────────────────────────────────────────────────────────────
// SUPPORTING ANALYZERS
// Heuristic code-pattern audits. These support the verdict but never decide
// it alone — CMS-generated markup triggers many of the same patterns.
// ──────────────────────────────────────────────────────────────────────────

// ─── 1. Inline Code Quality ───────────────────────────────────────────────
function analyzeInlineCode(html: string): AnalyzerScore {
  const inline_scripts = countMatches(html, /<script(?![^>]*\bsrc=)[^>]*>[\s\S]*?<\/script>/gi)
  const inline_styles = countMatches(html, /\bstyle\s*=\s*["'][^"']+["']/gi)
  const inline_events = countMatches(html, /\bon(?:click|load|submit|change|mouseover|mouseout|mouseenter|mouseleave|focus|blur|keyup|keydown|input|scroll|resize)\s*=\s*["']/gi)
  const html_comments = countMatches(html, /<!--[\s\S]*?-->/g)

  const scriptContents = (html.match(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi) ?? []).join('\n')
  const ai_comments_in_inline = countMatches(scriptContents, /\/\/\s*(?:this function|here we|this code|this will|this handles|this is a|the following|this method|below we|let's|let me|now we|step \d)/gi)
  const console_logs_inline = countMatches(scriptContents, /\bconsole\.(log|warn|error|info)\s*\(/gi)
  const data_testid = countMatches(html, /\bdata-testid\s*=\s*["']/gi)

  const inlineScriptScore  = Math.min(inline_scripts * 8, 30)
  const inlineStyleScore   = Math.min(inline_styles * 1, 10)
  const eventHandlerScore  = Math.min(inline_events * 4, 20)
  const commentScore       = Math.min(html_comments * 1, 10)
  const aiCommentScore     = Math.min(ai_comments_in_inline * 10, 40)
  const consoleScore       = Math.min(console_logs_inline * 6, 20)
  const testidScore        = Math.min(data_testid * 3, 15)

  const rawScore = inlineScriptScore + inlineStyleScore + eventHandlerScore + commentScore + aiCommentScore + consoleScore + testidScore
  const finalScore = Math.min(rawScore, 100)

  return {
    score: finalScore,
    severity: severityFromScore(finalScore),
    details: {
      inline_scripts, inline_styles, inline_events, html_comments,
      ai_comments_in_inline, console_logs_inline, data_testid,
      breakdown: { inlineScriptScore, inlineStyleScore, eventHandlerScore, commentScore, aiCommentScore, consoleScore, testidScore },
    },
  }
}

// ─── 2. CSS Quality ───────────────────────────────────────────────────────
function analyzeCss(html: string, externalCss: string[]): AnalyzerScore {
  const styleBlocks = (html.match(/<style[^>]*>[\s\S]*?<\/style>/gi) ?? []).join('\n')
  const css = [styleBlocks, externalCss.join('\n')].filter(Boolean).join('\n')

  const allClassNames: string[] = []
  for (const m of html.matchAll(/\bclass(?:Name)?\s*=\s*["']([^"']+)["']/gi)) {
    for (const c of m[1].split(/\s+/)) if (c) allClassNames.push(c)
  }

  let heavy_utility_elements = 0
  for (const m of html.matchAll(/\bclass(?:Name)?\s*=\s*["']([^"']+)["']/gi)) {
    const classes = m[1].split(/\s+/).filter(Boolean)
    if (classes.length >= 8) heavy_utility_elements++
  }

  const long_class_names = allClassNames.filter((c) => c.length > 30)
  const important_count = countMatches(css, /!important\b/gi)

  const declMatches = css.matchAll(/([\w-]+)\s*:\s*([^;{}\n]+)\s*;?/g)
  const declCounts = new Map<string, number>()
  for (const m of declMatches) {
    const key = `${m[1].trim().toLowerCase()}:${m[2].trim().toLowerCase()}`
    declCounts.set(key, (declCounts.get(key) ?? 0) + 1)
  }
  const duplicate_props = Array.from(declCounts.values()).filter((c) => c > 3).length

  const fontFaces  = countMatches(css, /@font-face/gi)
  const fontImports = uniqueMatches(css, /@import\s+url\([^)]*(?:fonts\.google|fonts\.bunny|typekit)[^)]*\)/gi)
  const fontFamilies = uniqueMatches(css, /font-family\s*:\s*[^;}\n]+/gi).map((s) =>
    s.replace(/font-family\s*:\s*/i, '').replace(/[;\s]+$/, '').toLowerCase(),
  )
  const font_count = fontFaces + fontImports.length + new Set(fontFamilies).size
  const font_list = Array.from(new Set(fontFamilies)).slice(0, 20)

  const generic_css_vars = countMatches(css, /--(?:color|bg|background|text|font|size|space|gap|border|shadow|radius)-?\d+\b/gi)

  const heavyUtilityScore = Math.min(heavy_utility_elements * 3, 40)
  const longClassScore    = Math.min(long_class_names.length * 3, 25)
  const importantScore    = Math.min(important_count * 2, 15)
  const duplicateScore    = Math.min(duplicate_props * 1, 10)
  const fontScore         = Math.min(Math.max(0, (font_count - 3) * 5), 15)
  const genericVarScore   = Math.min(generic_css_vars * 2, 10)

  const finalScore = Math.min(heavyUtilityScore + longClassScore + importantScore + duplicateScore + fontScore + genericVarScore, 100)

  const hex  = uniqueMatches(html + '\n' + css, /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6,8})\b/g)
  const rgb  = uniqueMatches(css, /rgba?\([^)]+\)/g)
  const all_colors = Array.from(new Set([...hex, ...rgb])).slice(0, 60)

  return {
    score: finalScore,
    severity: severityFromScore(finalScore),
    details: {
      heavy_utility_elements,
      long_class_count: long_class_names.length,
      long_class_names: long_class_names.slice(0, 10),
      important_count, duplicate_props, font_count, font_list, generic_css_vars, all_colors,
      breakdown: { heavyUtilityScore, longClassScore, importantScore, duplicateScore, fontScore, genericVarScore },
    },
  }
}

// ─── 3. HTML Structure ────────────────────────────────────────────────────
function analyzeHtmlStructure(html: string): AnalyzerScore {
  const semanticTags = ['nav', 'main', 'article', 'section', 'aside', 'header', 'footer', 'figure', 'figcaption', 'time', 'address']
  const semantic_count: Record<string, number> = {}
  for (const tag of semanticTags) {
    semantic_count[tag] = countMatches(html, new RegExp(`<${tag}\\b`, 'gi'))
  }
  const div_count = countMatches(html, /<div\b/gi)
  const totalBlocks = div_count + Object.values(semantic_count).reduce((s, v) => s + v, 0)
  const semantic_percentage = totalBlocks === 0 ? 0 :
    Object.values(semantic_count).reduce((s, v) => s + v, 0) / totalBlocks

  let max_div_depth = 0
  let cur_div_depth = 0
  const tagPattern = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*?>/g
  let tm
  while ((tm = tagPattern.exec(html)) !== null) {
    const tag = tm[1].toLowerCase()
    const isClose = tm[0].startsWith('</')
    const isSelfClose = tm[0].endsWith('/>')
    if (tag === 'div') {
      if (isClose) cur_div_depth = Math.max(0, cur_div_depth - 1)
      else if (!isSelfClose) { cur_div_depth++; if (cur_div_depth > max_div_depth) max_div_depth = cur_div_depth }
    }
  }

  const empty_elements =
    countMatches(html, /<div[^>]*>\s*<\/div>/gi) +
    countMatches(html, /<p[^>]*>\s*<\/p>/gi) +
    countMatches(html, /<span[^>]*>\s*<\/span>/gi)

  const has_main   = semantic_count.main > 0
  const has_nav    = semantic_count.nav > 0
  const has_footer = semantic_count.footer > 0
  const missing_landmarks = (has_main ? 0 : 1) + (has_nav ? 0 : 1) + (has_footer ? 0 : 1)

  const aria_attributes = countMatches(html, /\baria-[a-z]+\s*=/gi)

  const headings: number[] = []
  for (const m of html.matchAll(/<h([1-6])\b/gi)) headings.push(parseInt(m[1], 10))
  const has_h1 = headings.includes(1)
  let skipped = false
  for (let i = 1; i < headings.length; i++) {
    if (headings[i] > headings[i - 1] + 1) { skipped = true; break }
  }
  const h_counts = [1, 2, 3, 4, 5, 6].map((n) => ({ level: n, count: headings.filter((h) => h === n).length }))

  const wrapperRatio = totalBlocks > 0 ? div_count / Math.max(1, totalBlocks) : 0

  const semanticScore         = Math.max(0, Math.round((1 - semantic_percentage) * 30))
  const divNestScore          = Math.min(Math.max(0, max_div_depth - 8) * 5, 25)
  const emptyScore            = Math.min(empty_elements * 3, 15)
  const missingLandmarkScore  = missing_landmarks * 7
  const wrapperScore          = wrapperRatio > 0.9 ? 12 : wrapperRatio > 0.75 ? 6 : 0

  const finalScore = Math.min(semanticScore + divNestScore + emptyScore + missingLandmarkScore + wrapperScore, 100)

  return {
    score: finalScore,
    severity: severityFromScore(finalScore),
    details: {
      semantic_percentage: Math.round(semantic_percentage * 100),
      semantic_count, div_count, max_div_depth, empty_elements,
      missing_landmarks: { main: !has_main, nav: !has_nav, footer: !has_footer },
      aria_attributes,
      heading_counts: h_counts,
      has_h1,
      heading_levels_skipped: skipped,
      breakdown: { semanticScore, divNestScore, emptyScore, missingLandmarkScore, wrapperScore },
    },
  }
}

// ─── 4. JavaScript Patterns ───────────────────────────────────────────────
function analyzeJs(html: string, externalJs: string[]): AnalyzerScore {
  const inlineJs = (html.match(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi) ?? [])
    .map((b) => b.replace(/^<script[^>]*>|<\/script>$/gi, '')).join('\n')
  const js = [inlineJs, externalJs.join('\n')].filter(Boolean).join('\n')

  const generic_name_regex = /\b(?:const|let|var|function)\s+(data|result|response|output|content|element|item|container|wrapper|temp|val|obj|arr|info|stuff|things|helper|util|value|param|config|options|settings|handler|callback|payload|body|res|req)\b/g
  const genericMatches = Array.from(js.matchAll(generic_name_regex)).map((m) => m[1])
  const generic_names = genericMatches.length
  const generic_names_list = Array.from(new Set(genericMatches))

  const longNameMatches = Array.from(js.matchAll(/\b(?:const|let|var|function)\s+([a-zA-Z_$][\w$]{25,})\b/g)).map((m) => m[1])
  const overly_descriptive_count = longNameMatches.length
  const overly_descriptive_list = Array.from(new Set(longNameMatches)).slice(0, 10)

  const console_logs = countMatches(js, /\bconsole\.log\s*\(/g)

  const todo_comments = countMatches(js, /\/\/\s*(?:TODO|FIXME|HACK|XXX|NOTE:|IMPORTANT:|STEP \d|STEP:)\b/gi)
  const todo_list = (js.match(/\/\/\s*(?:TODO|FIXME|HACK|XXX|NOTE:|IMPORTANT:|STEP)[^\n]*/gi) ?? []).slice(0, 10)

  const ai_comment_patterns = countMatches(js, /\/\/\s*(?:this function|here we|this code|this will|this handles|this is|the following|this method|let's|now we|step \d:|first,|then,|finally,|next,)/gi)
  const ai_comment_list = (js.match(/\/\/\s*(?:this function|here we|this code|this will|this handles|the following|let's|now we|step \d:)[^\n]*/gi) ?? []).slice(0, 5)

  const jsdoc_blocks = countMatches(js, /\/\*\*[\s\S]*?\*\//g)
  const try_catch_count = countMatches(js, /\btry\s*\{/g)
  const event_listeners = countMatches(js, /\baddEventListener\s*\(/g)
  const async_funcs = countMatches(js, /\basync\s+(?:function|\([^)]*\)\s*=>|[a-zA-Z_$][\w$]*\s*=>)/g)

  const namingScore      = Math.min(generic_names * 2, 20)
  const longNameScore    = Math.min(overly_descriptive_count * 4, 20)
  const consoleScore     = Math.min(console_logs * 5, 25)
  const todoScore        = Math.min(todo_comments * 6, 20)
  const aiCommentScore   = Math.min(ai_comment_patterns * 8, 35)
  const finalScore = Math.max(0, Math.min(namingScore + longNameScore + consoleScore + todoScore + aiCommentScore, 100))

  return {
    score: finalScore,
    severity: severityFromScore(finalScore),
    details: {
      generic_names, generic_names_list, overly_descriptive_count, overly_descriptive_list,
      console_logs, todo_comments, todo_list, ai_comment_patterns, ai_comment_list,
      jsdoc_blocks, try_catch_count, event_listeners, async_funcs,
      breakdown: { namingScore, longNameScore, consoleScore, todoScore, aiCommentScore },
    },
  }
}

// ─── 5. Content & Copywriting ─────────────────────────────────────────────
const AI_BUZZWORDS = [
  'seamless', 'scalable', 'robust', 'cutting-edge', 'innovative', 'leverage',
  'synergy', 'comprehensive', 'streamlined', 'holistic', 'empower', 'transformative',
  'revolutionize', 'bespoke', 'best-in-class', 'world-class', 'game-changing',
  'next-level', 'state-of-the-art', 'actionable', 'utilize',
  'elevate', 'supercharge', 'unlock', 'reimagine', 'delve', 'fostering',
  'pivotal', 'harness', 'tailor-made', 'data-driven', 'frictionless',
  'user-centric', 'paradigm', 'disruptive',
]
const AI_FILLER_PHRASES = [
  'everything you need', 'all in one place', 'take your business to the next level',
  'we are committed to', 'our team of experts', 'one-stop solution', 'we pride ourselves',
  'dedicated to excellence', 'passion for what we do', 'going above and beyond',
  'tailored to your needs', 'results-driven', 'client-focused', 'industry-leading',
  'trusted partner', 'full-service', 'cutting edge solutions', 'get in touch today',
  'start your journey', 'in today\'s fast-paced', 'in the digital age',
  'look no further', 'at the forefront',
]
const VAGUE_CTAS = ['learn more', 'discover', 'find out more', 'explore', 'click here', 'read more', 'get started', 'contact us', 'see more']

function stripHtml(html: string): string {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function analyzeContent(html: string): AnalyzerScore {
  const text = stripHtml(html)
  const lower = text.toLowerCase()
  const words = text.split(/\s+/).filter(Boolean)
  const word_count = words.length

  const buzzword_hits: { word: string; count: number }[] = []
  for (const w of AI_BUZZWORDS) {
    const c = (lower.match(new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g')) ?? []).length
    if (c > 0) buzzword_hits.push({ word: w, count: c })
  }
  const buzzword_total = buzzword_hits.reduce((s, b) => s + b.count, 0)

  const filler_hits: { phrase: string; count: number }[] = []
  for (const p of AI_FILLER_PHRASES) {
    const c = (lower.match(new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) ?? []).length
    if (c > 0) filler_hits.push({ phrase: p, count: c })
  }
  const filler_total = filler_hits.reduce((s, f) => s + f.count, 0)

  const ctaTexts: string[] = []
  for (const m of html.matchAll(/<(?:a|button)\b[^>]*>([\s\S]*?)<\/(?:a|button)>/gi)) {
    ctaTexts.push(stripHtml(m[1]).trim().toLowerCase())
  }
  const vague_ctas_list: { label: string; count: number }[] = []
  for (const cta of VAGUE_CTAS) {
    const c = ctaTexts.filter((t) => t === cta || t.startsWith(cta)).length
    if (c > 0) vague_ctas_list.push({ label: cta, count: c })
  }
  const vague_ctas = vague_ctas_list.reduce((s, v) => s + v.count, 0)

  const sentences = text.split(/[.!?]+\s+/).filter((s) => s.split(/\s+/).length >= 3)
  const sentenceLengths = sentences.map((s) => s.split(/\s+/).filter(Boolean).length)
  const avg_sentence_length = sentenceLengths.length === 0 ? 0 :
    sentenceLengths.reduce((s, l) => s + l, 0) / sentenceLengths.length
  const sentence_variance = sentenceLengths.length === 0 ? 0 :
    Math.sqrt(sentenceLengths.map((l) => (l - avg_sentence_length) ** 2).reduce((s, v) => s + v, 0) / Math.max(1, sentenceLengths.length))

  const lenBuckets = [0, 0, 0, 0, 0]
  for (const l of sentenceLengths) {
    if (l < 10) lenBuckets[0]++
    else if (l < 20) lenBuckets[1]++
    else if (l < 30) lenBuckets[2]++
    else if (l < 40) lenBuckets[3]++
    else lenBuckets[4]++
  }

  const lowVarianceScore = sentence_variance < 5 && sentenceLengths.length > 5 ? 15 : 0

  const buzzwordScore = Math.min(buzzword_total * 4, 35)
  const fillerScore   = Math.min(filler_total * 7, 35)
  const ctaScore      = Math.min(vague_ctas * 3, 15)
  const finalScore    = Math.max(0, Math.min(buzzwordScore + fillerScore + ctaScore + lowVarianceScore, 100))

  return {
    score: finalScore,
    severity: severityFromScore(finalScore),
    details: {
      word_count, buzzword_hits, buzzword_total, filler_hits, filler_total,
      vague_ctas_list, vague_ctas,
      avg_sentence_length: Math.round(avg_sentence_length * 10) / 10,
      sentence_variance: Math.round(sentence_variance * 10) / 10,
      sentence_distribution: { '<10': lenBuckets[0], '10-19': lenBuckets[1], '20-29': lenBuckets[2], '30-39': lenBuckets[3], '40+': lenBuckets[4] },
      breakdown: { buzzwordScore, fillerScore, ctaScore, lowVarianceScore },
    },
  }
}

// ─── 6. Security Headers (informational — not part of the vibe score) ─────
function analyzeSecurity(headers: Record<string, string>): AnalyzerScore {
  const csp = headers['content-security-policy']
  const xfo = headers['x-frame-options']
  const xcto = headers['x-content-type-options']
  const hsts = headers['strict-transport-security']
  const referrer = headers['referrer-policy']
  const permissions = headers['permissions-policy'] ?? headers['feature-policy']
  const xss = headers['x-xss-protection']

  const checks = [
    { name: 'Content-Security-Policy',   present: !!csp, value: csp ?? null, risk: 'Missing CSP allows arbitrary script execution — major XSS exposure.' },
    { name: 'X-Frame-Options',           present: !!xfo && /^(DENY|SAMEORIGIN)$/i.test(xfo), value: xfo ?? null, risk: 'Page can be embedded in malicious iframes (clickjacking).' },
    { name: 'X-Content-Type-Options',    present: xcto?.toLowerCase().trim() === 'nosniff', value: xcto ?? null, risk: 'Browsers may MIME-sniff and execute unintended content types.' },
    { name: 'Strict-Transport-Security', present: !!hsts && /max-age=\d+/i.test(hsts), value: hsts ?? null, risk: 'Missing HSTS allows HTTP downgrade attacks (MITM).' },
    { name: 'Referrer-Policy',           present: !!referrer, value: referrer ?? null, risk: 'Full Referer header leaks to third-party requests.' },
    { name: 'Permissions-Policy',        present: !!permissions, value: permissions ?? null, risk: 'No restrictions on camera, microphone, or geolocation APIs.' },
  ]
  const xssInfo = { name: 'X-XSS-Protection', present: !!xss, value: xss ?? null, risk: 'Deprecated header — informational only.' }
  const missingHeaders = checks.filter((c) => !c.present).length
  const finalScore = Math.round((missingHeaders / 6) * 100)

  let hsts_max_age: number | null = null
  if (hsts) {
    const m = hsts.match(/max-age=(\d+)/i)
    if (m) hsts_max_age = parseInt(m[1], 10)
  }

  return {
    score: finalScore,
    severity: severityFromScore(finalScore),
    details: { checks, xss_protection_info: xssInfo, missing_count: missingHeaders, hsts_max_age },
  }
}

// ─── 7. Images (informational — not part of the vibe score) ───────────────
const GENERIC_ALT_TEXT = [
  'image', 'photo', 'picture', 'banner', 'hero', 'img', 'placeholder',
  'thumbnail', 'screenshot', 'graphic', 'illustration', 'icon', 'logo image',
  'background', 'decorative', 'image of', 'photo of',
]
const AI_FILENAME_SIGNALS = [
  'placeholder', 'sample', 'hero-image', 'stock', 'default-image',
  'image-1', 'img-1', 'image_1', 'img_1', 'photo-1', 'unsplash', 'pexels',
]

interface ImageRecord {
  src: string
  alt: string | null
  hasAlt: boolean
  emptyAlt: boolean
  genericAlt: boolean
  hasDimensions: boolean
  isNextImage: boolean
  aiFilename: boolean
}

function analyzeImages(html: string): AnalyzerScore {
  const records: ImageRecord[] = []

  for (const m of html.matchAll(/<img\b([^>]*)\/?>/gi)) {
    const attrs = m[1]
    const src   = attrs.match(/\bsrc\s*=\s*["']([^"']+)["']/i)?.[1] ?? ''
    const altAttr = attrs.match(/\balt\s*=\s*["']([^"']*)["']/i)
    const altRaw = altAttr ? altAttr[1] : null
    records.push({
      src,
      alt: altRaw,
      hasAlt: altAttr !== null,
      emptyAlt: altAttr !== null && altRaw === '',
      genericAlt: altAttr !== null && altRaw !== '' && GENERIC_ALT_TEXT.some((g) => (altRaw ?? '').toLowerCase().trim() === g || (altRaw ?? '').toLowerCase().startsWith(g + ' ')),
      hasDimensions: /\bwidth\s*=/i.test(attrs) && /\bheight\s*=/i.test(attrs),
      isNextImage: false,
      aiFilename: AI_FILENAME_SIGNALS.some((s) => src.toLowerCase().includes(s)),
    })
  }
  for (const m of html.matchAll(/<Image\b([^>]*)\/?>/g)) {
    const attrs = m[1]
    const src = attrs.match(/\bsrc\s*=\s*["']([^"']+)["']/)?.[1] ?? attrs.match(/\bsrc\s*=\s*\{([^}]+)\}/)?.[1] ?? ''
    const altAttr = attrs.match(/\balt\s*=\s*["']([^"']*)["']/)
    const altRaw = altAttr ? altAttr[1] : null
    records.push({
      src,
      alt: altRaw,
      hasAlt: altAttr !== null,
      emptyAlt: altAttr !== null && altRaw === '',
      genericAlt: altAttr !== null && altRaw !== '' && GENERIC_ALT_TEXT.some((g) => (altRaw ?? '').toLowerCase().trim() === g),
      hasDimensions: /\bwidth\s*=/.test(attrs) && /\bheight\s*=/.test(attrs),
      isNextImage: true,
      aiFilename: AI_FILENAME_SIGNALS.some((s) => src.toLowerCase().includes(s)),
    })
  }

  const total = records.length
  const with_alt = records.filter((r) => r.hasAlt).length
  const empty_alt = records.filter((r) => r.emptyAlt).length
  const missing_alt = records.filter((r) => !r.hasAlt).length
  const generic_alt = records.filter((r) => r.genericAlt).length
  const next_image_count = records.filter((r) => r.isNextImage).length
  const raw_img_count = total - next_image_count
  const with_dimensions = records.filter((r) => r.hasDimensions).length
  const no_dimensions_count = total - with_dimensions
  const ai_filename_count = records.filter((r) => r.aiFilename).length

  const missingAltScore    = Math.min(missing_alt * 12, 40)
  const genericAltScore    = Math.min(generic_alt * 8, 30)
  const noWidthHeightScore = Math.min(no_dimensions_count * 3, 20)
  const aiFilenameScore    = Math.min(ai_filename_count * 5, 10)
  const finalScore         = total === 0 ? 0 : Math.min(missingAltScore + genericAltScore + noWidthHeightScore + aiFilenameScore, 100)

  return {
    score: finalScore,
    severity: severityFromScore(finalScore),
    details: {
      total, with_alt, empty_alt, missing_alt, generic_alt,
      next_image_count, raw_img_count, with_dimensions, no_dimensions_count, ai_filename_count,
      records: records.slice(0, 50),
      breakdown: { missingAltScore, genericAltScore, noWidthHeightScore, aiFilenameScore },
    },
  }
}

// ─── 8. Metadata & SEO Signals ────────────────────────────────────────────
const GENERIC_TITLES = ['home', 'welcome', 'page', 'untitled', 'my website', 'website', 'homepage']

function extractGenerators(html: string): string[] {
  const values: string[] = []
  for (const m of html.matchAll(/<meta\s+name=["']generator["'][^>]*content=["']([^"']*)["']/gi)) {
    if (m[1].trim()) values.push(m[1].trim())
  }
  // also handle content-before-name attribute order
  for (const m of html.matchAll(/<meta\s+content=["']([^"']*)["'][^>]*name=["']generator["']/gi)) {
    if (m[1].trim() && !values.includes(m[1].trim())) values.push(m[1].trim())
  }
  return values
}

function analyzeMetadata(html: string): AnalyzerScore {
  const head = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i)?.[1] ?? html

  const title         = head.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? null
  const description   = head.match(/<meta\s+name=["']description["'][^>]*content=["']([^"']*)["']/i)?.[1]?.trim() ?? null
  const generator     = extractGenerators(html)[0] ?? null
  const ogTitle       = head.match(/<meta\s+property=["']og:title["'][^>]*content=["']([^"']*)["']/i)?.[1]?.trim() ?? null
  const ogDescription = head.match(/<meta\s+property=["']og:description["'][^>]*content=["']([^"']*)["']/i)?.[1]?.trim() ?? null
  const ogImage       = head.match(/<meta\s+property=["']og:image["'][^>]*content=["']([^"']*)["']/i)?.[1]?.trim() ?? null
  const twitterCard   = head.match(/<meta\s+name=["']twitter:card["'][^>]*content=["']([^"']*)["']/i)?.[1]?.trim() ?? null
  const twitterTitle  = head.match(/<meta\s+name=["']twitter:title["'][^>]*content=["']([^"']*)["']/i)?.[1]?.trim() ?? null
  const canonical     = head.match(/<link\s+rel=["']canonical["'][^>]*href=["']([^"']*)["']/i)?.[1]?.trim() ?? null
  const robots        = head.match(/<meta\s+name=["']robots["'][^>]*content=["']([^"']*)["']/i)?.[1]?.trim() ?? null
  const viewport      = head.match(/<meta\s+name=["']viewport["'][^>]*content=["']([^"']*)["']/i)?.[1]?.trim() ?? null
  const favicon       = !!head.match(/<link\s+rel=["'](?:icon|shortcut icon|apple-touch-icon)["']/i)
  const jsonLd        = countMatches(head, /<script\s+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi)

  const title_present = title !== null && title.length > 0
  const title_length  = title?.length ?? 0
  const title_is_generic = title !== null && (GENERIC_TITLES.includes(title.toLowerCase().trim()) || title_length < 10)
  const description_present = description !== null && description.length > 0
  const description_length  = description?.length ?? 0
  const generator_present   = generator !== null && generator.length > 0
  const is_ai_generator = generator ? AI_GENERATOR_NAMES.some((g) => generator.toLowerCase().includes(g)) : false
  const missing_og_count = (ogTitle ? 0 : 1) + (ogDescription ? 0 : 1) + (ogImage ? 0 : 1)

  const missingTitle       = !title_present ? 20 : 0
  const genericTitle       = title_is_generic ? 15 : 0
  const missingDescription = !description_present ? 15 : 0
  const generatorTag       = is_ai_generator ? 50 : 0   // CMS generator tags are NOT a vibe signal
  const missingOG          = missing_og_count * 5
  const finalScore         = Math.min(missingTitle + genericTitle + missingDescription + generatorTag + missingOG, 100)

  return {
    score: finalScore,
    severity: severityFromScore(finalScore),
    details: {
      title: { present: title_present, value: title, length: title_length, generic: title_is_generic, ideal_range: title_length >= 30 && title_length <= 60 },
      description: { present: description_present, value: description, length: description_length, ideal_range: description_length >= 120 && description_length <= 160 },
      generator: { present: generator_present, value: generator, is_ai_generator },
      open_graph: { title: ogTitle, description: ogDescription, image: ogImage, missing_count: missing_og_count },
      twitter: { card: twitterCard, title: twitterTitle },
      canonical, robots, viewport, favicon, json_ld_count: jsonLd,
      breakdown: { missingTitle, genericTitle, missingDescription, generatorTag, missingOG },
    },
  }
}

// ── Combiner ───────────────────────────────────────────────────────────────

function combineFromFiles(files: FetchedFile[]): { html: string; externalCss: string[]; externalJs: string[] } {
  const html: string[] = []
  const externalCss: string[] = []
  const externalJs: string[] = []
  for (const f of files) {
    const ext = f.path.slice(f.path.lastIndexOf('.')).toLowerCase()
    if (ext === '.html' || ext === '.htm') {
      html.push(f.content)
    } else if (ext === '.css' || ext === '.scss' || ext === '.sass') {
      externalCss.push(f.content)
    } else if (['.jsx', '.tsx', '.js', '.ts', '.mjs', '.cjs', '.vue', '.svelte'].includes(ext)) {
      html.push(f.content)
      externalJs.push(f.content)
    } else {
      externalJs.push(f.content)
    }
  }
  return { html: html.join('\n'), externalCss, externalJs }
}

// ── Verdict ────────────────────────────────────────────────────────────────
// Direct platform fingerprints decide the verdict. Code-pattern heuristics
// only nudge the score — they never turn a CMS site into a "vibe-coded" one.

function computeVerdict(
  platform: PlatformDetection,
  analyzers: VibeCodeDetectorResult['analyzers'],
): VibeCodeDetectorResult['overall'] {
  // Weighted heuristic base (security & images excluded — not vibe signals)
  const a = analyzers
  const base =
    a.jsPatterns.score    * 0.25 +
    a.cssQuality.score    * 0.25 +
    a.inlineCode.score    * 0.15 +
    a.content.score       * 0.15 +
    a.htmlStructure.score * 0.10 +
    a.metadata.score      * 0.10

  const { aiPoints, cmsPoints, classification, detected } = platform

  let score: number
  let confidence: string
  let verdictText: string

  const aiTools  = detected.filter((d) => d.type === 'ai-tool').map((d) => d.name)
  const cmsTools = detected.filter((d) => d.type === 'cms' || d.type === 'site-builder').map((d) => d.name)

  if (classification === 'cms') {
    score = Math.min(18, Math.round(6 + aiPoints * 0.2))
    confidence = 'Not vibe-coded — CMS build'
    verdictText = `This site is built with ${cmsTools.join(' + ')}. Its markup is generated by CMS templates and page-builder tooling — patterns like deep div nesting or inline styles here come from the CMS, not from an AI coding tool. This is not a vibe-coded website.`
  } else if (classification === 'ai') {
    score = Math.min(97, Math.max(75, Math.round(55 + aiPoints * 0.3 + base * 0.15)))
    confidence = 'Vibe-coded'
    verdictText = `Direct AI-tool fingerprints detected${aiTools.length ? ` (${aiTools.join(', ')})` : ''}. This site carries the signature stack and markup of AI coding tools — it was very likely vibe-coded.`
  } else if (classification === 'mixed') {
    score = Math.min(74, Math.max(45, Math.round(35 + aiPoints * 0.5 + base * 0.2)))
    confidence = 'Possibly vibe-coded'
    verdictText = `Some AI-tool signals were found${aiTools.length ? ` (${aiTools.join(', ')})` : ''}, but no definitive fingerprint. Parts of this site may have been AI-generated, or it shares libraries popular with AI tools.`
  } else {
    // No direct fingerprints either way — heuristics alone, heavily damped
    score = Math.min(44, Math.round(base * 0.45 + aiPoints))
    confidence = score >= 30 ? 'Probably human-coded' : 'Likely human-coded'
    verdictText = cmsTools.length
      ? `Built with ${cmsTools.join(' + ')} and no AI-tool fingerprints were found. This looks like a conventionally built site.`
      : `No CMS or AI-tool fingerprints were found, and the code patterns look conventional. This site appears to be human-coded.`
  }

  return { score, confidence, verdictText }
}

// ── Handler ────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const mode: 'url' | 'github' | 'paste' = body.mode
    const input: string = (body.input ?? '').trim()

    if (!input) return NextResponse.json({ error: 'Input is required.' }, { status: 400 })
    if (!['url', 'github', 'paste'].includes(mode)) return NextResponse.json({ error: 'Invalid mode.' }, { status: 400 })

    let html = ''
    let externalCss: string[] = []
    let externalJs: string[] = []
    let securityHeaders: AnalyzerScore | null = null
    let inputDisplay = ''
    let fetchInfo: VibeCodeDetectorResult['fetchInfo'] = { sourceCount: 1, totalBytes: 0 }

    if (mode === 'url') {
      const url = normalizeUrl(input)
      let parsed: URL
      try { parsed = new URL(url) } catch { return NextResponse.json({ error: 'Invalid URL format.' }, { status: 400 }) }
      const { html: fetchedHtml, finalUrl, contentType } = await fetchUrl(url)
      html = fetchedHtml
      inputDisplay = parsed.host
      fetchInfo = { sourceCount: 1, totalBytes: fetchedHtml.length, finalUrl, contentType }
      const headers = await headRequest(finalUrl)
      securityHeaders = analyzeSecurity(headers)
    } else if (mode === 'github') {
      const files = await fetchGithub(input)
      const combined = combineFromFiles(files)
      html = combined.html
      externalCss = combined.externalCss
      externalJs = combined.externalJs
      const parsed = parseGithubUrl(input)
      inputDisplay = parsed ? `${parsed.owner}/${parsed.repo}` : input
      fetchInfo = {
        sourceCount: files.length,
        totalBytes: files.reduce((s, f) => s + f.bytes, 0),
        files: files.map((f) => ({ path: f.path, bytes: f.bytes })),
      }
    } else {
      if (input.length < 100) return NextResponse.json({ error: 'Please paste at least 100 characters.' }, { status: 400 })
      html = input
      if (!/<[a-zA-Z]/.test(input)) {
        if (/[{;]\s*$|^\s*\.\w/.test(input) || /:\s*[\w-]+\s*;/.test(input)) externalCss = [input]
        else externalJs = [input]
      }
      inputDisplay = 'Pasted code'
      fetchInfo = { sourceCount: 1, totalBytes: input.length }
    }

    const generators = extractGenerators(html)
    const platform = detectPlatform([html, externalCss.join('\n'), externalJs.join('\n')].join('\n'), generators)

    const analyzers: VibeCodeDetectorResult['analyzers'] = {
      inlineCode:      analyzeInlineCode(html),
      cssQuality:      analyzeCss(html, externalCss),
      htmlStructure:   analyzeHtmlStructure(html),
      jsPatterns:      analyzeJs(html, externalJs),
      content:         analyzeContent(html),
      securityHeaders,
      images:          analyzeImages(html),
      metadata:        analyzeMetadata(html),
    }

    const overall = computeVerdict(platform, analyzers)

    const result: VibeCodeDetectorResult = {
      mode,
      inputDisplay,
      fetchInfo,
      platform,
      overall,
      analyzers,
      generatedAt: new Date().toISOString(),
    }

    return NextResponse.json(result)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[vibe-code-detector] Error:', message)
    return NextResponse.json({ error: `Analysis failed: ${message}` }, { status: 500 })
  }
}
