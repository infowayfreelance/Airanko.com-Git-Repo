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

export interface AiCodeDetectorResult {
  mode: 'url' | 'github' | 'paste'
  inputDisplay: string
  fetchInfo: {
    sourceCount: number
    totalBytes: number
    files?: { path: string; bytes: number }[]
    finalUrl?: string
    contentType?: string
  }
  overall: {
    score: number
    confidence: 'Likely human' | 'Mixed signals' | 'Likely AI-assisted' | 'Strongly AI-generated'
  }
  analyzers: {
    inlineCode:    AnalyzerScore
    cssQuality:    AnalyzerScore
    htmlStructure: AnalyzerScore
    jsPatterns:    AnalyzerScore
    content:       AnalyzerScore
    securityHeaders: AnalyzerScore | null
    images:        AnalyzerScore
    metadata:      AnalyzerScore
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

function confidenceFromScore(score: number): AiCodeDetectorResult['overall']['confidence'] {
  if (score < 25) return 'Likely human'
  if (score < 50) return 'Mixed signals'
  if (score < 75) return 'Likely AI-assisted'
  return 'Strongly AI-generated'
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
    signal: AbortSignal.timeout(15000),
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
    // Some servers reject HEAD — try GET with no body buffering
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: { 'User-Agent': USER_AGENT },
        redirect: 'follow',
        signal: AbortSignal.timeout(10000),
      })
      res.headers.forEach((value, key) => { headers[key.toLowerCase()] = value })
      // Drain body so connection releases
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

  // Prioritize root + src/ + app/ + components/ + public/
  const priority = (p: string) => {
    if (!p.includes('/')) return 0
    if (p.startsWith('src/') || p.startsWith('app/') || p.startsWith('components/')) return 1
    if (p.startsWith('public/') || p.startsWith('pages/')) return 2
    return 3
  }
  candidates.sort((a, b) => priority(a.path) - priority(b.path))

  const toFetch = candidates.slice(0, 30)
  // Skip files larger than 200KB (likely minified/generated)
  const filtered = toFetch.filter((e) => !e.size || e.size < 200_000)

  const results: FetchedFile[] = await Promise.all(
    filtered.map(async (entry) => {
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
// ANALYZERS
// Every metric is computed from real content. No randomization, no fake data.
// ──────────────────────────────────────────────────────────────────────────

// ─── 1. Inline Code Quality ───────────────────────────────────────────────
function analyzeInlineCode(html: string): AnalyzerScore {
  const inline_scripts = countMatches(html, /<script(?![^>]*\bsrc=)[^>]*>[\s\S]*?<\/script>/gi)
  const inline_styles  = countMatches(html, /\bstyle\s*=\s*"/gi)
  const events_regex = /\bon(?:click|load|submit|change|mouseover|mouseout|mouseenter|mouseleave|focus|blur|keyup|keydown|keypress|input|scroll|resize|error|abort|select|reset|drag|drop|dblclick)\s*=\s*["']/gi
  const inline_events  = countMatches(html, events_regex)
  const html_comments  = countMatches(html, /<!--[\s\S]*?-->/g)

  const inlineScriptScore  = Math.min(inline_scripts * 8, 60)
  const inlineStyleScore   = Math.min(inline_styles * 4, 30)
  const eventHandlerScore  = Math.min(inline_events * 5, 40)
  const commentScore       = Math.min(html_comments * 3, 20)
  const rawScore           = inlineScriptScore + inlineStyleScore + eventHandlerScore + commentScore
  const finalScore         = Math.min(rawScore, 100)

  return {
    score: finalScore,
    severity: severityFromScore(finalScore),
    details: {
      inline_scripts,
      inline_styles,
      inline_events,
      html_comments,
      breakdown: { inlineScriptScore, inlineStyleScore, eventHandlerScore, commentScore },
    },
  }
}

// ─── 2. CSS Quality ───────────────────────────────────────────────────────
function analyzeCss(html: string, externalCss: string[]): AnalyzerScore {
  // Pull style blocks from HTML + concat external CSS
  const styleBlocks = (html.match(/<style[^>]*>[\s\S]*?<\/style>/gi) ?? []).join('\n')
  const className   = (html.match(/\bclass(?:Name)?\s*=\s*["']([^"']+)["']/gi) ?? []).join(' ')
  const css = [styleBlocks, className, externalCss.join('\n')].filter(Boolean).join('\n')

  // Long class names (>30 chars per individual class)
  const allClassNames: string[] = []
  for (const m of html.matchAll(/\bclass(?:Name)?\s*=\s*["']([^"']+)["']/gi)) {
    for (const c of m[1].split(/\s+/)) if (c) allClassNames.push(c)
  }
  // Also from CSS .class selectors
  for (const m of css.matchAll(/\.([A-Za-z_][\w-]+)/g)) allClassNames.push(m[1])
  const long_class_names = allClassNames.filter((c) => c.length > 30)

  // Unique colors
  const hex   = uniqueMatches(css, /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6,8})\b/g)
  const rgb   = uniqueMatches(css, /rgba?\([^)]+\)/g)
  const hsl   = uniqueMatches(css, /hsla?\([^)]+\)/g)
  const named = uniqueMatches(css, /\b(?:aliceblue|antiquewhite|aqua|aquamarine|azure|beige|bisque|black|blanchedalmond|blue|blueviolet|brown|burlywood|cadetblue|chartreuse|chocolate|coral|cornflowerblue|cornsilk|crimson|cyan|darkblue|darkcyan|darkgoldenrod|darkgray|darkgreen|darkkhaki|darkmagenta|darkolivegreen|darkorange|darkorchid|darkred|darksalmon|darkseagreen|darkslateblue|darkslategray|darkturquoise|darkviolet|deeppink|deepskyblue|dimgray|dodgerblue|firebrick|floralwhite|forestgreen|fuchsia|gainsboro|ghostwhite|gold|goldenrod|gray|green|greenyellow|honeydew|hotpink|indianred|indigo|ivory|khaki|lavender|lavenderblush|lawngreen|lemonchiffon|lightblue|lightcoral|lightcyan|lightgoldenrodyellow|lightgray|lightgreen|lightpink|lightsalmon|lightseagreen|lightskyblue|lightslategray|lightsteelblue|lightyellow|lime|limegreen|linen|magenta|maroon|mediumaquamarine|mediumblue|mediumorchid|mediumpurple|mediumseagreen|mediumslateblue|mediumspringgreen|mediumturquoise|mediumvioletred|midnightblue|mintcream|mistyrose|moccasin|navajowhite|navy|oldlace|olive|olivedrab|orange|orangered|orchid|palegoldenrod|palegreen|paleturquoise|palevioletred|papayawhip|peachpuff|peru|pink|plum|powderblue|purple|red|rosybrown|royalblue|saddlebrown|salmon|sandybrown|seagreen|seashell|sienna|silver|skyblue|slateblue|slategray|snow|springgreen|steelblue|tan|teal|thistle|tomato|turquoise|violet|wheat|white|whitesmoke|yellow|yellowgreen)\b/gi)
  const allColors = Array.from(new Set([...hex, ...rgb, ...hsl, ...named]))
  const unique_colors = allColors.length

  // Fonts
  const fontFaces  = countMatches(css, /@font-face/gi)
  const fontImports = uniqueMatches(css, /@import\s+url\([^)]*(?:fonts\.google|fonts\.bunny|typekit)[^)]*\)/gi)
  const fontFamilies = uniqueMatches(css, /font-family\s*:\s*[^;}\n]+/gi).map((s) =>
    s.replace(/font-family\s*:\s*/i, '').replace(/[;\s]+$/, '').toLowerCase(),
  )
  const fontFamilySet = new Set(fontFamilies)
  const font_count = fontFaces + fontImports.length + fontFamilySet.size
  const font_list = Array.from(fontFamilySet).slice(0, 20)

  // Duplicate property values (appears >3 times identically)
  const declMatches = css.matchAll(/([\w-]+)\s*:\s*([^;{}\n]+)\s*;?/g)
  const declCounts = new Map<string, number>()
  for (const m of declMatches) {
    const key = `${m[1].trim().toLowerCase()}:${m[2].trim().toLowerCase()}`
    declCounts.set(key, (declCounts.get(key) ?? 0) + 1)
  }
  const duplicate_props = Array.from(declCounts.values()).filter((c) => c > 3).length

  // Magic numbers in spacing
  let magic_spacing = 0
  for (const m of css.matchAll(/\b(?:margin|padding)(?:-(?:top|right|bottom|left|inline|block))?\s*:\s*([^;}]+)/gi)) {
    const values = m[1].match(/-?\d+(?:\.\d+)?(?:px|rem|em)?/g) ?? []
    for (const v of values) {
      const num = parseFloat(v)
      if (num === 0 || isNaN(num)) continue
      if (num % 4 !== 0 && num % 8 !== 0) magic_spacing++
    }
  }

  const longClassScore = Math.min(long_class_names.length * 3, 30)
  const colorScore     = Math.max(0, (unique_colors - 6) * 4)
  const fontScore      = Math.max(0, (font_count - 2) * 15)
  const duplicateScore = Math.min(duplicate_props * 2, 20)
  const finalScore     = Math.min(longClassScore + colorScore + fontScore + duplicateScore, 100)

  return {
    score: finalScore,
    severity: severityFromScore(finalScore),
    details: {
      long_class_names: long_class_names.slice(0, 10),
      long_class_count: long_class_names.length,
      unique_colors,
      all_colors: allColors.slice(0, 100),
      font_count,
      font_list,
      duplicate_props,
      magic_spacing,
      breakdown: { longClassScore, colorScore, fontScore, duplicateScore },
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

  // Max nesting depth — simple stack walk
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

  // Empty elements
  const empty_elements =
    countMatches(html, /<div[^>]*>\s*<\/div>/gi) +
    countMatches(html, /<p[^>]*>\s*<\/p>/gi) +
    countMatches(html, /<span[^>]*>\s*<\/span>/gi)

  // Landmarks
  const has_main   = semantic_count.main > 0
  const has_nav    = semantic_count.nav > 0
  const has_footer = semantic_count.footer > 0
  const missing_landmarks =
    (has_main ? 0 : 1) + (has_nav ? 0 : 1) + (has_footer ? 0 : 1)

  // ARIA
  const aria_attributes = countMatches(html, /\baria-[a-z]+\s*=/gi)

  // Heading hierarchy
  const headings: number[] = []
  for (const m of html.matchAll(/<h([1-6])\b/gi)) headings.push(parseInt(m[1], 10))
  const has_h1 = headings.includes(1)
  let skipped = false
  for (let i = 1; i < headings.length; i++) {
    if (headings[i] > headings[i - 1] + 1) { skipped = true; break }
  }
  const h_counts = [1, 2, 3, 4, 5, 6].map((n) => ({ level: n, count: headings.filter((h) => h === n).length }))

  const semanticScore         = Math.max(0, 50 - (semantic_percentage * 50))
  const divScore              = Math.min(max_div_depth * 5, 40)
  const emptyScore            = Math.min(empty_elements * 3, 20)
  const missingLandmarkScore  = missing_landmarks * 8
  const finalScore            = Math.min(semanticScore + divScore + emptyScore + missingLandmarkScore, 100)

  return {
    score: finalScore,
    severity: severityFromScore(finalScore),
    details: {
      semantic_percentage: Math.round(semantic_percentage * 100),
      semantic_count,
      div_count,
      max_div_depth,
      empty_elements,
      missing_landmarks: { main: !has_main, nav: !has_nav, footer: !has_footer },
      aria_attributes,
      heading_counts: h_counts,
      has_h1,
      heading_levels_skipped: skipped,
      breakdown: { semanticScore: Math.round(semanticScore), divScore, emptyScore, missingLandmarkScore },
    },
  }
}

// ─── 4. JavaScript Patterns ───────────────────────────────────────────────
function analyzeJs(html: string, externalJs: string[]): AnalyzerScore {
  const inlineJs = (html.match(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi) ?? [])
    .map((b) => b.replace(/^<script[^>]*>|<\/script>$/gi, '')).join('\n')
  const js = [inlineJs, externalJs.join('\n')].filter(Boolean).join('\n')

  const generic_name_regex = /\b(?:const|let|var|function)\s+(data|result|response|output|content|element|item|container|wrapper|temp|val|obj|arr|info|stuff|things|helper|util)\b/g
  const genericMatches = Array.from(js.matchAll(generic_name_regex)).map((m) => m[1])
  const generic_names = genericMatches.length
  const generic_names_list = Array.from(new Set(genericMatches))

  const longNameMatches = Array.from(js.matchAll(/\b(?:const|let|var|function)\s+([a-zA-Z_$][\w$]{25,})\b/g)).map((m) => m[1])
  const overly_descriptive_count = longNameMatches.length
  const overly_descriptive_list = Array.from(new Set(longNameMatches)).slice(0, 10)

  const console_logs = countMatches(js, /\bconsole\.log\s*\(/g)
  const todo_comments = countMatches(js, /\/\/\s*(?:TODO|FIXME|HACK|XXX)\b/gi)
  const todo_list = (js.match(/\/\/\s*(?:TODO|FIXME|HACK|XXX)[^\n]*/gi) ?? []).slice(0, 10)

  const try_catch_count = countMatches(js, /\btry\s*\{/g)
  const event_listeners = countMatches(js, /\baddEventListener\s*\(/g)

  // Magic numbers (excluding 0, 1, -1, 100, and small index-like ints in [for] loops)
  const magic_numbers_raw = (js.match(/\b(?<![\w.])-?\d+(?:\.\d+)?\b/g) ?? [])
  const magic_numbers = magic_numbers_raw.filter((s) => {
    const n = parseFloat(s)
    if (n === 0 || n === 1 || n === -1 || n === 100) return false
    return Math.abs(n) > 10
  }).length

  const namingScore         = Math.min(generic_names * 4, 30)
  const consoleScore        = Math.min(console_logs * 5, 25)
  const todoScore           = Math.min(todo_comments * 8, 20)
  const errorHandlingBonus  = Math.min(try_catch_count * 5, 20)
  const finalScore          = Math.max(0, Math.min(namingScore + consoleScore + todoScore, 100) - errorHandlingBonus)

  return {
    score: finalScore,
    severity: severityFromScore(finalScore),
    details: {
      generic_names,
      generic_names_list,
      overly_descriptive_count,
      overly_descriptive_list,
      console_logs,
      todo_comments,
      todo_list,
      try_catch_count,
      event_listeners,
      magic_numbers,
      breakdown: { namingScore, consoleScore, todoScore, errorHandlingBonus },
    },
  }
}

// ─── 5. Content & Copywriting ─────────────────────────────────────────────
const AI_BUZZWORDS = [
  'seamless', 'scalable', 'robust', 'cutting-edge', 'innovative', 'leverage',
  'synergy', 'comprehensive', 'streamlined', 'holistic', 'empower', 'transformative',
  'revolutionize', 'bespoke', 'best-in-class', 'world-class', 'game-changing',
  'next-level', 'state-of-the-art', 'dynamic', 'actionable', 'utilize',
]
const AI_FILLER_PHRASES = [
  'everything you need', 'all in one place', 'take your business to the next level',
  'we are committed to', 'our team of experts', 'one-stop solution', 'we pride ourselves',
  'dedicated to excellence', 'passion for what we do', 'going above and beyond',
  'tailored to your needs', 'results-driven', 'client-focused', 'industry-leading',
  'trusted partner', 'full-service', 'cutting edge solutions',
]
const VAGUE_CTAS = ['learn more', 'discover', 'find out more', 'explore', 'click here', 'read more']

function stripHtml(html: string): string {
  // Remove script, style, then strip tags, collapse whitespace
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
    const c = (lower.match(new RegExp(`\\b${w}\\b`, 'g')) ?? []).length
    if (c > 0) buzzword_hits.push({ word: w, count: c })
  }
  const buzzword_total = buzzword_hits.reduce((s, b) => s + b.count, 0)

  const filler_hits: { phrase: string; count: number }[] = []
  for (const p of AI_FILLER_PHRASES) {
    const c = (lower.match(new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) ?? []).length
    if (c > 0) filler_hits.push({ phrase: p, count: c })
  }
  const filler_total = filler_hits.reduce((s, f) => s + f.count, 0)

  // Vague CTAs — from anchor and button text
  const ctaTexts: string[] = []
  for (const m of html.matchAll(/<(?:a|button)\b[^>]*>([\s\S]*?)<\/(?:a|button)>/gi)) {
    ctaTexts.push(stripHtml(m[1]).trim().toLowerCase())
  }
  const vague_ctas_list: { label: string; count: number }[] = []
  for (const cta of VAGUE_CTAS) {
    const c = ctaTexts.filter((t) => t === cta).length
    if (c > 0) vague_ctas_list.push({ label: cta, count: c })
  }
  const vague_ctas = vague_ctas_list.reduce((s, v) => s + v.count, 0)

  // Sentence stats
  const sentences = text.split(/[.!?]+\s+/).filter((s) => s.split(/\s+/).length >= 3)
  const sentenceLengths = sentences.map((s) => s.split(/\s+/).filter(Boolean).length)
  const avg_sentence_length = sentenceLengths.length === 0 ? 0 :
    sentenceLengths.reduce((s, l) => s + l, 0) / sentenceLengths.length
  // Standard deviation
  const sentence_variance = sentenceLengths.length === 0 ? 0 :
    Math.sqrt(sentenceLengths.map((l) => (l - avg_sentence_length) ** 2).reduce((s, v) => s + v, 0) / sentenceLengths.length)

  // Distribution buckets
  const lenBuckets = [0, 0, 0, 0, 0] // <10, 10-19, 20-29, 30-39, 40+
  for (const l of sentenceLengths) {
    if (l < 10) lenBuckets[0]++
    else if (l < 20) lenBuckets[1]++
    else if (l < 30) lenBuckets[2]++
    else if (l < 40) lenBuckets[3]++
    else lenBuckets[4]++
  }

  const buzzwordScore = Math.min(buzzword_total * 6, 40)
  const fillerScore   = Math.min(filler_total * 10, 40)
  const ctaScore      = Math.min(vague_ctas * 8, 20)
  const varianceBonus = sentence_variance > 8 ? -10 : 0
  const finalScore    = Math.max(0, Math.min(buzzwordScore + fillerScore + ctaScore + varianceBonus, 100))

  return {
    score: finalScore,
    severity: severityFromScore(finalScore),
    details: {
      word_count,
      buzzword_hits,
      buzzword_total,
      filler_hits,
      filler_total,
      vague_ctas_list,
      vague_ctas,
      avg_sentence_length: Math.round(avg_sentence_length * 10) / 10,
      sentence_variance: Math.round(sentence_variance * 10) / 10,
      sentence_distribution: { '<10': lenBuckets[0], '10-19': lenBuckets[1], '20-29': lenBuckets[2], '30-39': lenBuckets[3], '40+': lenBuckets[4] },
      breakdown: { buzzwordScore, fillerScore, ctaScore, varianceBonus },
    },
  }
}

// ─── 6. Security Headers (URL mode only) ──────────────────────────────────
function analyzeSecurity(headers: Record<string, string>): AnalyzerScore {
  const csp = headers['content-security-policy']
  const xfo = headers['x-frame-options']
  const xcto = headers['x-content-type-options']
  const hsts = headers['strict-transport-security']
  const referrer = headers['referrer-policy']
  const permissions = headers['permissions-policy'] ?? headers['feature-policy']
  const xss = headers['x-xss-protection']

  const checks = [
    { name: 'Content-Security-Policy',  present: !!csp,  value: csp ?? null,        risk: 'Allows arbitrary scripts/styles — XSS exposure.' },
    { name: 'X-Frame-Options',          present: !!xfo && /^(DENY|SAMEORIGIN)$/i.test(xfo), value: xfo ?? null, risk: 'Page can be embedded in malicious iframes (clickjacking).' },
    { name: 'X-Content-Type-Options',   present: xcto?.toLowerCase().trim() === 'nosniff', value: xcto ?? null, risk: 'Browsers may MIME-sniff and execute unintended content types.' },
    { name: 'Strict-Transport-Security',present: !!hsts && /max-age=\d+/i.test(hsts), value: hsts ?? null, risk: 'Browsers may downgrade to HTTP — MITM risk.' },
    { name: 'Referrer-Policy',          present: !!referrer, value: referrer ?? null, risk: 'Full referer leaks to third parties.' },
    { name: 'Permissions-Policy',       present: !!permissions, value: permissions ?? null, risk: 'No restriction on camera/mic/geolocation APIs.' },
  ]
  const xssInfo = { name: 'X-XSS-Protection', present: !!xss, value: xss ?? null, risk: 'Deprecated — informational only.' }
  const missingHeaders = checks.filter((c) => !c.present).length
  const finalScore = Math.round((missingHeaders / 6) * 100)

  // Extract max-age from HSTS if present
  let hsts_max_age: number | null = null
  if (hsts) {
    const m = hsts.match(/max-age=(\d+)/i)
    if (m) hsts_max_age = parseInt(m[1], 10)
  }

  return {
    score: finalScore,
    severity: severityFromScore(finalScore),
    details: {
      checks,
      xss_protection_info: xssInfo,
      missing_count: missingHeaders,
      hsts_max_age,
    },
  }
}

// ─── 7. Images ─────────────────────────────────────────────────────────────
const GENERIC_ALT_TEXT = ['image', 'photo', 'picture', 'banner', 'hero', 'img', 'placeholder', 'thumbnail', 'screenshot', 'graphic', 'illustration', 'icon', 'logo image', 'background']
const AI_FILENAME_SIGNALS = ['placeholder', 'sample', 'hero-image', 'stock', 'default-image', 'image-1', 'img-1', 'image_1', 'img_1', 'photo-1']

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

  // <img> tags
  for (const m of html.matchAll(/<img\b([^>]*)\/?>/gi)) {
    const attrs = m[1]
    const src   = attrs.match(/\bsrc\s*=\s*["']([^"']+)["']/i)?.[1] ?? ''
    const altAttr = attrs.match(/\balt\s*=\s*["']([^"']*)["']/i)
    const widthAttr = /\bwidth\s*=/i.test(attrs)
    const heightAttr = /\bheight\s*=/i.test(attrs)
    const altRaw = altAttr ? altAttr[1] : null
    records.push({
      src,
      alt: altRaw,
      hasAlt: altAttr !== null,
      emptyAlt: altAttr !== null && altRaw === '',
      genericAlt: altAttr !== null && altRaw !== '' && GENERIC_ALT_TEXT.includes(altRaw.toLowerCase().trim()),
      hasDimensions: widthAttr && heightAttr,
      isNextImage: false,
      aiFilename: AI_FILENAME_SIGNALS.some((s) => src.toLowerCase().includes(s)),
    })
  }
  // <Image ...> Next.js components
  for (const m of html.matchAll(/<Image\b([^>]*)\/?>/g)) {
    const attrs = m[1]
    const src   = attrs.match(/\bsrc\s*=\s*["']([^"']+)["']/)?.[1] ??
                  attrs.match(/\bsrc\s*=\s*\{([^}]+)\}/)?.[1] ?? ''
    const altAttr = attrs.match(/\balt\s*=\s*["']([^"']*)["']/)
    const widthAttr = /\bwidth\s*=/.test(attrs)
    const heightAttr = /\bheight\s*=/.test(attrs)
    const altRaw = altAttr ? altAttr[1] : null
    records.push({
      src,
      alt: altRaw,
      hasAlt: altAttr !== null,
      emptyAlt: altAttr !== null && altRaw === '',
      genericAlt: altAttr !== null && altRaw !== '' && GENERIC_ALT_TEXT.includes(altRaw.toLowerCase().trim()),
      hasDimensions: widthAttr && heightAttr,
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

  const missingAltScore   = Math.min(missing_alt * 15, 45)
  const genericAltScore   = Math.min(generic_alt * 8, 32)
  const noWidthHeightScore = Math.min(no_dimensions_count * 4, 20)
  const finalScore = Math.min(missingAltScore + genericAltScore + noWidthHeightScore, 100)

  return {
    score: total === 0 ? 0 : finalScore,
    severity: severityFromScore(finalScore),
    details: {
      total,
      with_alt,
      empty_alt,
      missing_alt,
      generic_alt,
      next_image_count,
      raw_img_count,
      with_dimensions,
      no_dimensions_count,
      ai_filename_count,
      records: records.slice(0, 50),
      breakdown: { missingAltScore, genericAltScore, noWidthHeightScore },
    },
  }
}

// ─── 8. Metadata & SEO Signals ────────────────────────────────────────────
const GENERIC_TITLES = ['home', 'welcome', 'page', 'untitled', 'my website']

function analyzeMetadata(html: string): AnalyzerScore {
  const head = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i)?.[1] ?? html

  const title       = head.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? null
  const description = head.match(/<meta\s+name=["']description["'][^>]*content=["']([^"']*)["']/i)?.[1]?.trim() ?? null
  const generator   = head.match(/<meta\s+name=["']generator["'][^>]*content=["']([^"']*)["']/i)?.[1]?.trim() ?? null
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
  const description_length = description?.length ?? 0
  const generator_present = generator !== null && generator.length > 0
  const missing_og_count = (ogTitle ? 0 : 1) + (ogDescription ? 0 : 1) + (ogImage ? 0 : 1)
  const missing_twitter_count = (twitterCard ? 0 : 1) + (twitterTitle ? 0 : 1)

  const missingTitle      = !title_present ? 20 : 0
  const genericTitle      = title_is_generic ? 15 : 0
  const missingDescription = !description_present ? 15 : 0
  const generatorTag      = generator_present ? 25 : 0
  const missingOG         = missing_og_count * 5
  const finalScore        = Math.min(missingTitle + genericTitle + missingDescription + generatorTag + missingOG, 100)

  return {
    score: finalScore,
    severity: severityFromScore(finalScore),
    details: {
      title: { present: title_present, value: title, length: title_length, generic: title_is_generic, ideal_range: title_length >= 30 && title_length <= 60 },
      description: { present: description_present, value: description, length: description_length, ideal_range: description_length >= 120 && description_length <= 160 },
      generator: { present: generator_present, value: generator },
      open_graph: { title: ogTitle, description: ogDescription, image: ogImage, missing_count: missing_og_count },
      twitter: { card: twitterCard, title: twitterTitle, missing_count: missing_twitter_count },
      canonical,
      robots,
      viewport,
      favicon,
      json_ld_count: jsonLd,
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
    if (ext === '.html' || ext === '.htm') html.push(f.content)
    else if (ext === '.css' || ext === '.scss' || ext === '.sass') externalCss.push(f.content)
    else if (ext === '.jsx' || ext === '.tsx' || ext === '.js' || ext === '.ts' || ext === '.mjs' || ext === '.cjs' || ext === '.vue' || ext === '.svelte') {
      // Treat JSX/TSX as both HTML-ish (for class= scans) and JS
      html.push(f.content)
      externalJs.push(f.content)
    } else {
      externalJs.push(f.content)
    }
  }
  return { html: html.join('\n'), externalCss, externalJs }
}

function overallScoreFromAnalyzers(a: AiCodeDetectorResult['analyzers']): number {
  const items = [a.inlineCode, a.cssQuality, a.htmlStructure, a.jsPatterns, a.content, a.images, a.metadata]
  if (a.securityHeaders) items.push(a.securityHeaders)
  return Math.round(items.reduce((s, x) => s + x.score, 0) / items.length)
}

// ──────────────────────────────────────────────────────────────────────────
// HANDLER
// ──────────────────────────────────────────────────────────────────────────

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
    let fetchInfo: AiCodeDetectorResult['fetchInfo'] = { sourceCount: 1, totalBytes: 0 }

    if (mode === 'url') {
      const url = normalizeUrl(input)
      let parsed: URL
      try { parsed = new URL(url) }
      catch { return NextResponse.json({ error: 'Invalid URL format.' }, { status: 400 }) }
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
      // paste mode
      if (input.length < 100) return NextResponse.json({ error: 'Please paste at least 100 characters.' }, { status: 400 })
      html = input
      // Pasted CSS / JS — if obvious, route appropriately. Heuristic: if no HTML tags, treat as either JS or CSS based on content.
      if (!/<[a-zA-Z]/.test(input)) {
        if (/[{;]\s*$|^\s*\.\w/.test(input) || /:\s*[\w-]+\s*;/.test(input)) {
          externalCss = [input]
        } else {
          externalJs = [input]
        }
      }
      inputDisplay = 'Pasted code'
      fetchInfo = { sourceCount: 1, totalBytes: input.length }
    }

    // ── Run all 8 analyzers ──
    const analyzers: AiCodeDetectorResult['analyzers'] = {
      inlineCode:    analyzeInlineCode(html),
      cssQuality:    analyzeCss(html, externalCss),
      htmlStructure: analyzeHtmlStructure(html),
      jsPatterns:    analyzeJs(html, externalJs),
      content:       analyzeContent(html),
      securityHeaders,
      images:        analyzeImages(html),
      metadata:      analyzeMetadata(html),
    }

    const overallScore = overallScoreFromAnalyzers(analyzers)

    const result: AiCodeDetectorResult = {
      mode,
      inputDisplay,
      fetchInfo,
      overall: { score: overallScore, confidence: confidenceFromScore(overallScore) },
      analyzers,
      generatedAt: new Date().toISOString(),
    }

    return NextResponse.json(result)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[ai-code-detector] Error:', message)
    return NextResponse.json({ error: `Analysis failed: ${message}` }, { status: 500 })
  }
}
