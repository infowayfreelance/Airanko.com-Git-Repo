import { NextRequest, NextResponse } from 'next/server'
import { runDetectionEngine } from '@/lib/vibe-detector/engine'
import type { SignalContext, ImageRef, FetchedImageSample, DetectionResult } from '@/lib/vibe-detector/types'

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

/**
 * NOTE: platform/verdict detection has moved to lib/vibe-detector/{signals,engine}.ts.
 * This route now only (a) fetches/prepares content, (b) runs the legacy
 * pattern-audit analyzers below for the "Detailed code audits" report
 * section, and (c) builds a SignalContext and hands it to the detection
 * engine for the probabilistic AI / Human / CMS / Hybrid verdict.
 */
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
  detection: DetectionResult
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

/** Minimal PNG tEXt/iTXt chunk reader — no external deps. Used to catch the
 * Stable Diffusion WebUI "parameters" chunk and EXIF-adjacent text fields
 * (Software/CreatorTool/Author/Comment/Description) embedded by many AI
 * image generators and editors. */
function parsePngTextChunks(buf: Buffer): { keyword: string; text: string }[] {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  if (buf.length < 8 || !buf.subarray(0, 8).equals(sig)) return []
  const chunks: { keyword: string; text: string }[] = []
  let offset = 8
  while (offset + 8 <= buf.length) {
    const length = buf.readUInt32BE(offset)
    const type = buf.toString('ascii', offset + 4, offset + 8)
    const dataStart = offset + 8
    const dataEnd = dataStart + length
    if (length < 0 || dataEnd + 4 > buf.length) break
    if (type === 'tEXt') {
      const data = buf.subarray(dataStart, dataEnd)
      const nullIdx = data.indexOf(0)
      if (nullIdx > -1) chunks.push({ keyword: data.subarray(0, nullIdx).toString('latin1'), text: data.subarray(nullIdx + 1).toString('latin1') })
    } else if (type === 'iTXt') {
      const data = buf.subarray(dataStart, dataEnd)
      const nullIdx = data.indexOf(0)
      if (nullIdx > -1) {
        const keyword = data.subarray(0, nullIdx).toString('latin1')
        let p = nullIdx + 1 + 2 // skip compression-flag + compression-method bytes
        const langEnd = data.indexOf(0, p)
        if (langEnd > -1) {
          p = langEnd + 1
          const transEnd = data.indexOf(0, p)
          if (transEnd > -1) chunks.push({ keyword, text: data.subarray(transEnd + 1).toString('utf8') })
        }
      }
    } else if (type === 'IEND') break
    offset = dataEnd + 4
  }
  return chunks
}

/** Downloads a capped sample of the page's own images and prepares them for
 * the AI-image-forensics signal — raw bytes as latin1 text (so embedded
 * EXIF/XMP ASCII fields are regex-searchable without a binary parser) plus
 * parsed PNG text chunks. URL mode only. */
async function fetchImageSamples(html: string, baseUrl: string): Promise<FetchedImageSample[]> {
  const srcs = new Set<string>()
  for (const m of html.matchAll(/<img\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/gi)) srcs.add(m[1])
  for (const m of html.matchAll(/<Image\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/g)) srcs.add(m[1])

  const absolute = Array.from(srcs)
    .filter((s) => !s.startsWith('data:'))
    .map((s) => { try { return new URL(s, baseUrl).href } catch { return null } })
    .filter((s): s is string => !!s)
    .slice(0, 10)

  const picked = absolute.slice(0, 6)
  const results = await Promise.all(picked.map(async (url): Promise<FetchedImageSample | null> => {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(5000), headers: { 'User-Agent': USER_AGENT } })
      if (!res.ok) return null
      const contentType = res.headers.get('content-type') ?? ''
      if (!contentType.startsWith('image/')) return null
      const arrayBuf = await res.arrayBuffer()
      if (arrayBuf.byteLength > 4_000_000) return null
      const buf = Buffer.from(arrayBuf)
      return {
        url,
        contentType,
        bytes: buf.length,
        latin1: buf.toString('latin1'),
        pngTextChunks: contentType.includes('png') ? parsePngTextChunks(buf) : [],
      }
    } catch { return null }
  }))
  return results.filter((r): r is FetchedImageSample => r !== null)
}

// ── GitHub fetching ────────────────────────────────────────────────────────

const ALLOWED_EXTS = new Set([
  '.html', '.htm', '.jsx', '.tsx', '.js', '.ts', '.mjs', '.cjs',
  '.css', '.scss', '.sass', '.vue', '.svelte', '.php', '.py',
])

interface GhTreeEntry { path: string; type: string; size?: number }

interface GithubFetchResult {
  files: FetchedFile[]
  allFilePaths: string[]
  packageJson: Record<string, unknown> | null
  hasComponentsJson: boolean
  readme: string | null
}

function parseGithubUrl(url: string): { owner: string; repo: string; branch?: string } | null {
  const m = url.match(/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?(?:\/(?:tree|blob)\/([^/]+))?/i)
  if (!m) return null
  return { owner: m[1], repo: m[2].replace(/\.git$/, ''), branch: m[3] }
}

async function fetchRawFile(owner: string, repo: string, branch: string, path: string): Promise<string | null> {
  try {
    const res = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) return null
    return await res.text()
  } catch { return null }
}

async function fetchGithub(repoUrl: string): Promise<GithubFetchResult> {
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

  const allBlobs = (treeData.tree ?? []).filter((e) => e.type === 'blob')
  const allFilePaths = allBlobs.map((e) => e.path).slice(0, 3000)

  const candidates = allBlobs
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

  const [filesResults, packageJsonRaw, readmeRaw] = await Promise.all([
    Promise.all(
      toFetch.map(async (entry) => {
        const content = await fetchRawFile(parsed.owner, parsed.repo, branch!, entry.path)
        if (content === null) return null
        return { path: entry.path, content, bytes: content.length }
      }),
    ).then((arr) => arr.filter((x): x is FetchedFile => x !== null)),
    allBlobs.some((e) => e.path === 'package.json') ? fetchRawFile(parsed.owner, parsed.repo, branch, 'package.json') : Promise.resolve(null),
    (() => {
      const readmePath = allBlobs.find((e) => /^readme(\.md|\.mdx|\.txt)?$/i.test(e.path))?.path
      return readmePath ? fetchRawFile(parsed.owner, parsed.repo, branch!, readmePath) : Promise.resolve(null)
    })(),
  ])

  if (filesResults.length === 0) throw new Error('No analyzable files found in the repo.')

  let packageJson: Record<string, unknown> | null = null
  if (packageJsonRaw) {
    try { packageJson = JSON.parse(packageJsonRaw) } catch { packageJson = null }
  }
  const hasComponentsJson = allBlobs.some((e) => /(?:^|\/)components\.json$/i.test(e.path))

  return { files: filesResults, allFilePaths, packageJson, hasComponentsJson, readme: readmeRaw }
}

// ──────────────────────────────────────────────────────────────────────────
// LEGACY PATTERN-AUDIT ANALYZERS
// These power the "Detailed code audits" report section (unchanged design).
// They no longer decide the verdict on their own — see lib/vibe-detector/
// for the signal registry + engine that now produce the AI/Human/CMS/Hybrid
// probabilities. Kept here because they're informational/report-only.
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
const AI_GENERATOR_NAMES = ['v0', 'vercel v0', 'bolt', 'lovable', 'cursor', 'windsurf', 'replit', 'devin', 'github copilot', 'chatgpt', 'claude', 'gpt-engineer']

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
    let headers: Record<string, string> = {}
    let finalUrl: string | undefined
    let hostname: string | undefined
    let fetchedImageSamples: FetchedImageSample[] = []
    let githubExtra: { allFilePaths: string[]; packageJson: Record<string, unknown> | null; hasComponentsJson: boolean; readme: string | null } | undefined

    if (mode === 'url') {
      const url = normalizeUrl(input)
      let parsed: URL
      try { parsed = new URL(url) } catch { return NextResponse.json({ error: 'Invalid URL format.' }, { status: 400 }) }
      const { html: fetchedHtml, finalUrl: fu, contentType } = await fetchUrl(url)
      html = fetchedHtml
      inputDisplay = parsed.host
      hostname = parsed.hostname
      finalUrl = fu
      fetchInfo = { sourceCount: 1, totalBytes: fetchedHtml.length, finalUrl: fu, contentType }
      headers = await headRequest(fu)
      securityHeaders = analyzeSecurity(headers)
      fetchedImageSamples = await fetchImageSamples(html, fu)
    } else if (mode === 'github') {
      const gh = await fetchGithub(input)
      const combined = combineFromFiles(gh.files)
      html = combined.html
      externalCss = combined.externalCss
      externalJs = combined.externalJs
      const parsed = parseGithubUrl(input)
      inputDisplay = parsed ? `${parsed.owner}/${parsed.repo}` : input
      fetchInfo = {
        sourceCount: gh.files.length,
        totalBytes: gh.files.reduce((s, f) => s + f.bytes, 0),
        files: gh.files.map((f) => ({ path: f.path, bytes: f.bytes })),
      }
      githubExtra = { allFilePaths: gh.allFilePaths, packageJson: gh.packageJson, hasComponentsJson: gh.hasComponentsJson, readme: gh.readme }
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

    const imageRefs: ImageRef[] = (analyzers.images.details.records as ImageRecord[]).map((r) => ({
      src: r.src, alt: r.alt, hasAlt: r.hasAlt, hasDimensions: r.hasDimensions, isNextImage: r.isNextImage,
    }))

    const headHtml = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i)?.[1] ?? html
    const combinedJs = [
      (html.match(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi) ?? []).map((b) => b.replace(/^<script[^>]*>|<\/script>$/gi, '')).join('\n'),
      externalJs.join('\n'),
    ].filter(Boolean).join('\n')
    const combinedCss = [
      (html.match(/<style[^>]*>[\s\S]*?<\/style>/gi) ?? []).join('\n'),
      externalCss.join('\n'),
    ].filter(Boolean).join('\n')

    const signalContext: SignalContext = {
      mode,
      html,
      htmlLower: html.toLowerCase(),
      headHtml,
      css: combinedCss,
      js: combinedJs,
      generatorValues: generators,
      headers,
      finalUrl,
      hostname,
      images: imageRefs,
      fetchedImageSamples,
      files: undefined,
      packageJson: githubExtra?.packageJson ?? null,
      allFilePaths: githubExtra?.allFilePaths,
      hasComponentsJson: githubExtra?.hasComponentsJson ?? false,
      readme: githubExtra?.readme ?? null,
    }

    const detection = runDetectionEngine(signalContext)

    const result: VibeCodeDetectorResult = {
      mode,
      inputDisplay,
      fetchInfo,
      detection,
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
