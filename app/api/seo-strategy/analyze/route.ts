import * as cheerio from 'cheerio'
import { mapWithConcurrency } from '@/lib/shared/crawl'

export const maxDuration = 60

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
/** One heading element in document order — includes empty-text and H4-H6 headings that the legacy `h1`/`h2`/`h3` arrays below drop, so the on-page audit (lib/seo-strategy/on-page-audit.ts) can detect empty headings and hierarchy skips accurately. */
export interface HeadingNode {
  level: number
  text: string
}

/**
 * One <img> found on a page, excluding tracking pixels/spacers filtered out
 * at extraction time (see isLikelyTrackingOrSpacer). `fileSize`/`probedWidth`/
 * `probedHeight` start null and are filled in by probeImage() during the
 * site-wide post-processing pass in the POST handler below (Phase 2B) —
 * they require a network request per unique image, so they're computed once
 * per unique URL across the whole crawl, not per page.
 */
export interface ImageAsset {
  /** Raw src attribute value, as written in the HTML. */
  src: string
  /** Absolute URL, or null for an inline data: URI or an unparseable src. */
  finalUrl: string | null
  /** null = alt attribute missing entirely; '' = present but empty; string = present with text. */
  alt: string | null
  filename: string
  format: string | null
  /** From the HTML width/height attributes — the browser's layout box, not necessarily the image's true intrinsic pixel size. */
  width: number | null
  height: number | null
  loading: string | null
  /** alt="" or role="presentation"/aria-hidden="true" — a real signal the image is decorative, not necessarily an error needing alt text. */
  isDecorative: boolean
  /** Filled in by probeImage() — null until then, and stays null if the probe failed or was skipped (bounded per crawl). */
  fileSize: number | null
  probedWidth: number | null
  probedHeight: number | null
}

/** One internal <a href> found on a page, classified by its DOM ancestor so nav/header/footer chrome can be told apart from contextual body links (see lib/seo-strategy/internal-link-audit.ts). */
export interface LinkDetail {
  /** Absolute URL, hash stripped, resolved against the page's final URL. */
  href: string
  anchorText: string
  location: 'nav' | 'header' | 'footer' | 'content'
}

export interface PageAnalysis {
  url: string
  status: number
  ok: boolean
  loadTimeMs: number
  byteSize: number
  title: string | null
  titleLength: number
  metaDescription: string | null
  metaDescriptionLength: number
  canonical: string | null
  robotsMeta: string | null
  lang: string | null
  viewport: string | null
  charset: string | null
  h1: string[]
  h2: string[]
  h3: string[]
  ogTags: Record<string, string>
  twitterTags: Record<string, string>
  schemaTypes: string[]
  hasJsonLd: boolean
  imageCount: number
  imagesWithoutAlt: number
  internalLinkCount: number
  externalLinkCount: number
  wordCount: number
  /** First ~1500 chars of visible body text — used for deterministic keyword-to-page relevance scoring (see lib/seo-strategy/keyword-mapping.ts). */
  contentSnippet: string
  /** Every H1-H6 element in document order, including empty ones — used for the on-page heading-structure audit (see lib/seo-strategy/on-page-audit.ts). */
  headingHierarchy: HeadingNode[]
  /** Word count with nav/header/footer/cookie-banner chrome removed — unlike `wordCount` above (kept as-is for backward compatibility), this approximates actual main content for Phase 2B's content/thin-content audit. */
  mainContentWordCount: number
  /** The text `mainContentWordCount` was computed from, capped at ~6000 chars — used for cross-page similarity comparison (see lib/seo-strategy/content-audit.ts). */
  mainContentText: string
  images: ImageAsset[]
  /** Every internal link found on the page, classified nav/header/footer/content — the basis for the internal-link graph (see lib/seo-strategy/internal-link-audit.ts). */
  linkDetails: LinkDetail[]
  /** Number of <link rel="canonical"> tags found — >1 means multiple canonical tags, a real issue `canonical` (which only captures the first) can't surface on its own. */
  canonicalCount: number
  metaRobotsNoindex: boolean
  metaRobotsNofollow: boolean
  /** From the HTTP response's X-Robots-Tag header, if present. */
  xRobotsTag: string | null
  /** Count of <script type="application/ld+json"> blocks that failed to JSON.parse — 0 doesn't mean "valid", it means "none failed" (there may be none at all). */
  jsonLdParseErrorCount: number
  contactInfo: {
    phones: string[]
    emails: string[]
    addresses: string[]
  }
  issues: string[]
}

export interface SiteAnalysis {
  inputUrl: string
  finalUrl: string
  domain: string
  isHttps: boolean
  homepage: PageAnalysis | null
  pages: PageAnalysis[]
  totalPagesCrawled: number
  robotsTxt: {
    found: boolean
    hasSitemap: boolean
    sitemapUrls: string[]
    disallowsAll: boolean
    content: string | null
    /** Disallow path prefixes under `User-agent: *` (excluding a bare `/`, already captured by disallowsAll) — lets downstream code check whether a SPECIFIC page is blocked, not just the whole site. */
    disallowedPaths: string[]
  }
  sitemapXml: {
    found: boolean
    urlCount: number
    sampleUrls: string[]
    /** Actual page URLs from the sitemap (sitemap-index children already resolved), bounded — used for the sitemap audit and, in 'full' crawl mode, as the primary URL discovery source. */
    allUrls: string[]
  }
  htmlSitemap: {
    found: boolean
    url: string | null
  }
  mobileScreenshotUrl: string
  desktopScreenshotUrl: string
  contactInfo: {
    phones: string[]
    emails: string[]
    addresses: string[]
  }
  technicalSummary: {
    httpsEnabled: boolean
    hasCanonicals: number
    missingCanonicals: number
    hasMetaDescriptions: number
    missingMetaDescriptions: number
    hasH1: number
    missingH1: number
    multipleH1: number
    hasSchema: number
    missingSchema: number
    hasOgTags: number
    missingOgTags: number
    hasTwitterTags: number
    missingTwitterTags: number
    averageLoadTimeMs: number
    averageWordCount: number
  }
  /**
   * Every unique internal link target discovered across crawled pages that
   * resolves to a 404/410/5xx status or fails outright — includes targets
   * that were never fully crawled (bounded status-only check; see
   * checkInternalLinkStatuses) as well as broken links to pages that WERE
   * crawled (their own PageAnalysis.status already told us they're broken).
   */
  brokenInternalLinks: {
    source: string
    anchor: string
    target: string
    statusCode: number | null
  }[]
  /**
   * Whether this crawl saw the whole site or only a bounded subset. The
   * crawler always caps at homepage + a handful of internal pages, so this
   * is "full" only when that cap wasn't actually hit — i.e. there was
   * nothing more to find. Orphan-page detection (lib/seo-strategy/
   * internal-link-audit.ts) uses this to qualify its confidence rather than
   * claiming a page is definitely orphaned when the crawl simply didn't
   * reach everywhere.
   */
  crawlCoverage: 'full' | 'partial'
  /**
   * Total unique internal URLs discovered during the crawl (homepage + every
   * unique internal link found on it), before the crawl's page-count cap is
   * applied — always >= pages.length + 1 (homepage). Used only for the
   * on-page report overview's "URLs discovered" stat; never used to imply
   * every discovered URL was actually audited.
   */
  discoveredUrlCount: number
  /** 'quick' (default) = homepage + a handful of linked pages, bounded low. 'full' = prefers the XML sitemap as the discovery source (falling back to homepage links), bounded higher — still never unbounded. Stored so the report can say "Quick Audit" / "Full Site Audit" rather than imply the same coverage either way. */
  crawlMode: 'quick' | 'full'
  /**
   * Phase 5 — transparent crawl coverage. `discovered` mirrors
   * discoveredUrlCount; `crawled`/`failed`/`redirected` describe what
   * actually happened to each URL the crawler attempted; `excluded` is
   * URLs that were discovered but never attempted at all because of the
   * crawl-mode cap; `audited` is how many of the crawled pages made it
   * into the on-page audit (currently always equal to `crawled`, since
   * every successfully crawled page is audited).
   */
  crawlStats: {
    discovered: number
    crawled: number
    failed: number
    redirected: number
    excluded: number
    audited: number
  }
  /** Bounded list of pages whose fetch followed one or more redirects, with the hop chain traced separately from the main crawl (see traceUrlStatus) so a chain/loop is visible even though the main crawl only ever sees the final destination's content. */
  redirects: {
    source: string
    finalUrl: string
    hops: { status: number; location: string }[]
    isLoop: boolean
  }[]
  /** Phase 5 — sitemap health: a bounded set of sitemap URLs status-checked, plus cross-referenced against crawled pages for noindex/canonical issues. Null when no sitemap was found at all. */
  sitemapAudit: SitemapAuditResult | null
}

// ---------------------------------------------------------------------------
// Phase 5 — sitemap audit + redirect tracing types
// ---------------------------------------------------------------------------
export type SitemapUrlIssue = 'unreachable' | 'redirect' | 'client_error' | 'server_error' | 'noindex_in_sitemap' | 'blocked_by_robots' | 'canonical_mismatch'

export interface SitemapFlaggedUrl {
  url: string
  issue: SitemapUrlIssue
  status: number | null
}

export interface SitemapAuditResult {
  /** Total URLs listed in the sitemap(s) (after resolving a sitemap index), before the status-check bound below. */
  totalUrls: number
  /** How many of those `totalUrls` actually had their live status checked — a large sitemap is sampled, not exhaustively probed, to stay within a safe request budget. */
  checkedUrls: number
  valid200: number
  redirects: number
  clientErrors: number
  serverErrors: number
  unreachable: number
  /** Sitemap URLs that were never reached by the crawl at all (checked purely by URL-set membership, not by content). */
  notCrawledCount: number
  /** Bounded list of specific problem URLs with a reason — never just an aggregate count. */
  flaggedUrls: SitemapFlaggedUrl[]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const USER_AGENT =
  'Mozilla/5.0 (compatible; AiRankoBot/1.0; +https://airanko.com/bot)'

function normalizeUrl(input: string): string {
  let url = input.trim()
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`
  }
  return url
}

async function fetchWithTimeout(
  url: string,
  timeoutMs = 12000,
): Promise<{ html: string; status: number; finalUrl: string; loadTimeMs: number; byteSize: number; headers: Record<string, string> } | null> {
  try {
    const start = Date.now()
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'text/html,application/xhtml+xml' },
      redirect: 'follow',
      signal: AbortSignal.timeout(timeoutMs),
    })
    const html = await res.text()
    const headers: Record<string, string> = {}
    res.headers.forEach((value, key) => { headers[key.toLowerCase()] = value })
    return {
      html,
      status: res.status,
      finalUrl: res.url || url,
      loadTimeMs: Date.now() - start,
      byteSize: new Blob([html]).size,
      headers,
    }
  } catch {
    return null
  }
}

async function fetchText(url: string, timeoutMs = 8000): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(timeoutMs),
    })
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  }
}

function extractContactInfo(text: string): {
  phones: string[]
  emails: string[]
  addresses: string[]
} {
  const phoneRegex = /(\+?\d{1,3}[\s.-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/g
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
  // Simple address heuristic — looks for street-style patterns
  const addressRegex =
    /\d{1,5}\s+[A-Za-z0-9.\s,'-]{4,60}(?:Street|St\.?|Avenue|Ave\.?|Road|Rd\.?|Boulevard|Blvd\.?|Lane|Ln\.?|Drive|Dr\.?|Court|Ct\.?|Plaza|Square|Suite|Ste\.?)\b[^\n]{0,80}/gi

  const phones = Array.from(new Set(text.match(phoneRegex) || []))
    .map((p) => p.trim())
    .filter((p) => p.replace(/\D/g, '').length >= 7 && p.replace(/\D/g, '').length <= 15)
    .slice(0, 5)

  const emails = Array.from(new Set(text.match(emailRegex) || []))
    .filter((e) => !e.includes('example.com') && !e.includes('sentry.io'))
    .slice(0, 5)

  const addresses = Array.from(new Set(text.match(addressRegex) || []))
    .map((a) => a.trim().replace(/\s+/g, ' '))
    .slice(0, 3)

  return { phones, emails, addresses }
}

// ---------------------------------------------------------------------------
// Image probing — file size + intrinsic pixel dimensions from a bounded
// partial download. One network request per UNIQUE image URL across the
// whole crawl (see checkImages in the POST handler), never per page, so a
// shared logo/hero image is only probed once.
// ---------------------------------------------------------------------------
const IMAGE_PROBE_MAX_BYTES = 65536

function readUint16BE(buf: Uint8Array, offset: number): number {
  return (buf[offset] << 8) | buf[offset + 1]
}
function readUint32BE(buf: Uint8Array, offset: number): number {
  return (buf[offset] << 24) | (buf[offset + 1] << 16) | (buf[offset + 2] << 8) | buf[offset + 3]
}
function readUint16LE(buf: Uint8Array, offset: number): number {
  return buf[offset] | (buf[offset + 1] << 8)
}

/** Best-effort intrinsic-dimension parser for the formats actually used on the web (PNG, GIF, JPEG, and simple WebP). Returns null — never throws — for anything it doesn't recognize or that's truncated before the relevant header bytes arrived. */
function parseImageDimensions(buf: Uint8Array): { width: number; height: number } | null {
  try {
    // PNG: 8-byte signature, then an IHDR chunk with width/height as two
    // big-endian uint32s starting at byte 16.
    if (buf.length >= 24 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
      return { width: readUint32BE(buf, 16), height: readUint32BE(buf, 20) }
    }
    // GIF: "GIF87a"/"GIF89a" signature, then width/height as little-endian uint16s.
    if (buf.length >= 10 && buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) {
      return { width: readUint16LE(buf, 6), height: readUint16LE(buf, 8) }
    }
    // JPEG: walk the marker segments looking for a Start-Of-Frame marker
    // (0xC0-0xCF, excluding the DHT/JPG/DAC markers which aren't SOF).
    if (buf.length >= 4 && buf[0] === 0xff && buf[1] === 0xd8) {
      let offset = 2
      while (offset + 9 < buf.length) {
        if (buf[offset] !== 0xff) { offset++; continue }
        const marker = buf[offset + 1]
        if (marker === 0xd8 || marker === 0xd9) { offset += 2; continue } // SOI/EOI, no length field
        const isSof = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc
        const segmentLength = readUint16BE(buf, offset + 2)
        if (isSof) {
          return { height: readUint16BE(buf, offset + 5), width: readUint16BE(buf, offset + 7) }
        }
        offset += 2 + segmentLength
      }
      return null
    }
    // WebP: "RIFF....WEBP" container. Simple lossy (VP8 ) and extended
    // (VP8X) chunk layouts are handled; lossless (VP8L)'s bit-packed header
    // is skipped as not worth the complexity here.
    if (buf.length >= 30 && buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46) {
      const chunkType = String.fromCharCode(buf[12], buf[13], buf[14], buf[15])
      if (chunkType === 'VP8X') {
        const width = 1 + (buf[24] | (buf[25] << 8) | (buf[26] << 16))
        const height = 1 + (buf[27] | (buf[28] << 8) | (buf[29] << 16))
        return { width, height }
      }
      if (chunkType === 'VP8 ' && buf.length >= 30) {
        // 3-byte frame tag + 3-byte start code, then width/height as 14-bit
        // little-endian values with 2 high bits reserved for scale flags.
        const width = readUint16LE(buf, 26) & 0x3fff
        const height = readUint16LE(buf, 28) & 0x3fff
        if (width > 0 && height > 0) return { width, height }
      }
      return null
    }
    return null
  } catch {
    return null
  }
}

interface ImageProbeResult {
  fileSize: number | null
  width: number | null
  height: number | null
}

/** Downloads at most IMAGE_PROBE_MAX_BYTES of an image (via Range, with a client-side cap even if the server ignores it) to get its real file size and — best-effort — intrinsic pixel dimensions, without downloading full-size hero images wholesale. */
async function probeImage(url: string, timeoutMs = 5000): Promise<ImageProbeResult> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, Range: `bytes=0-${IMAGE_PROBE_MAX_BYTES - 1}` },
      signal: AbortSignal.timeout(timeoutMs),
    })
    if (!res.ok && res.status !== 206) return { fileSize: null, width: null, height: null }

    const contentRange = res.headers.get('content-range')
    const contentLength = res.headers.get('content-length')
    let fileSize: number | null = null
    const rangeMatch = contentRange?.match(/\/(\d+)$/)
    if (rangeMatch) fileSize = Number(rangeMatch[1])
    else if (contentLength) fileSize = Number(contentLength)

    const reader = res.body?.getReader()
    const chunks: Uint8Array[] = []
    let readBytes = 0
    if (reader) {
      while (readBytes < IMAGE_PROBE_MAX_BYTES) {
        const { done, value } = await reader.read()
        if (done || !value) break
        chunks.push(value)
        readBytes += value.byteLength
      }
      reader.cancel().catch(() => {})
    }
    const buf = new Uint8Array(readBytes)
    let pos = 0
    for (const chunk of chunks) { buf.set(chunk, pos); pos += chunk.byteLength }

    if (fileSize === null) fileSize = buf.byteLength // best-effort lower bound when the server gave us no length at all
    const dims = parseImageDimensions(buf)
    return { fileSize, width: dims?.width ?? null, height: dims?.height ?? null }
  } catch {
    return { fileSize: null, width: null, height: null }
  }
}

/** HEAD-only status check for internal links whose targets weren't already fully crawled — bounded and short-timeout so a handful of slow/dead links can't blow the route's time budget. Falls back to GET if the server rejects HEAD (some misconfigured servers do). */
async function checkLinkStatus(url: string, timeoutMs = 5000): Promise<number | null> {
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      headers: { 'User-Agent': USER_AGENT },
      redirect: 'follow',
      signal: AbortSignal.timeout(timeoutMs),
    })
    if (res.status === 405 || res.status === 501) {
      const getRes = await fetch(url, {
        method: 'GET',
        headers: { 'User-Agent': USER_AGENT },
        redirect: 'follow',
        signal: AbortSignal.timeout(timeoutMs),
      })
      return getRes.status
    }
    return res.status
  } catch {
    return null
  }
}

/**
 * Follows redirects one hop at a time (HEAD, falling back to GET on
 * 405/501) so the actual chain — not just the final destination `fetch`
 * with `redirect: 'follow'` would silently resolve to — is visible: initial
 * status, each hop's status/target, and whether it loops back on itself.
 * Bounded to `maxHops` so a real loop can't hang the request.
 */
async function traceUrlStatus(
  url: string,
  timeoutMs = 5000,
  maxHops = 5,
): Promise<{ initialStatus: number | null; finalStatus: number | null; finalUrl: string; hops: { status: number; location: string }[]; isLoop: boolean }> {
  const hops: { status: number; location: string }[] = []
  const seen = new Set<string>()
  let currentUrl = url
  let initialStatus: number | null = null

  for (let i = 0; i <= maxHops; i++) {
    if (seen.has(currentUrl)) {
      return { initialStatus, finalStatus: null, finalUrl: currentUrl, hops, isLoop: true }
    }
    seen.add(currentUrl)

    let res: Response
    try {
      res = await fetch(currentUrl, {
        method: 'HEAD',
        headers: { 'User-Agent': USER_AGENT },
        redirect: 'manual',
        signal: AbortSignal.timeout(timeoutMs),
      })
      if (res.status === 405 || res.status === 501) {
        res = await fetch(currentUrl, {
          method: 'GET',
          headers: { 'User-Agent': USER_AGENT },
          redirect: 'manual',
          signal: AbortSignal.timeout(timeoutMs),
        })
      }
    } catch {
      return { initialStatus, finalStatus: null, finalUrl: currentUrl, hops, isLoop: false }
    }

    if (initialStatus === null) initialStatus = res.status
    const location = res.headers.get('location')
    if (res.status >= 300 && res.status < 400 && location) {
      let nextUrl: string
      try {
        nextUrl = new URL(location, currentUrl).toString()
      } catch {
        return { initialStatus, finalStatus: null, finalUrl: currentUrl, hops, isLoop: false }
      }
      hops.push({ status: res.status, location: nextUrl })
      currentUrl = nextUrl
      continue
    }
    return { initialStatus, finalStatus: res.status, finalUrl: currentUrl, hops, isLoop: false }
  }
  // Exceeded maxHops without settling — a very long (if not looping) chain; not evaluated further.
  return { initialStatus, finalStatus: null, finalUrl: currentUrl, hops, isLoop: false }
}

/** Tracking pixels, spacer GIFs, and other non-content images the image SEO audit shouldn't waste an "issue" on. */
function isLikelyTrackingOrSpacer(src: string, width: number | null, height: number | null): boolean {
  if (/\b(pixel|1x1|spacer|blank|transparent)\b/i.test(src)) return true
  if (width !== null && height !== null && width <= 2 && height <= 2) return true
  return false
}

function analyzeHtml(
  url: string,
  html: string,
  status: number,
  loadTimeMs: number,
  byteSize: number,
  baseUrl: URL,
  xRobotsTag: string | null = null,
): PageAnalysis {
  const $ = cheerio.load(html)

  const title = $('title').first().text().trim() || null
  const metaDescription =
    $('meta[name="description"]').attr('content')?.trim() || null
  const canonicalLinks = $('link[rel="canonical"]')
  const canonicalCount = canonicalLinks.length
  const canonical = canonicalLinks.first().attr('href')?.trim() || null
  const robotsMeta = $('meta[name="robots"]').attr('content')?.trim() || null
  const metaRobotsNoindex = robotsMeta ? /noindex/i.test(robotsMeta) : false
  const metaRobotsNofollow = robotsMeta ? /nofollow/i.test(robotsMeta) : false
  const lang = $('html').attr('lang')?.trim() || null
  const viewport = $('meta[name="viewport"]').attr('content')?.trim() || null
  const charset = $('meta[charset]').attr('charset')?.trim() || null

  const h1 = $('h1')
    .map((_, el) => $(el).text().trim())
    .get()
    .filter(Boolean)
  const h2 = $('h2')
    .map((_, el) => $(el).text().trim())
    .get()
    .filter(Boolean)
    .slice(0, 20)
  const h3 = $('h3')
    .map((_, el) => $(el).text().trim())
    .get()
    .filter(Boolean)
    .slice(0, 20)

  // Full H1-H6 hierarchy in document order, empty headings included — a
  // comma-selector matches elements in DOM order regardless of tag, so this
  // is safe to use directly for hierarchy-skip detection.
  const headingHierarchy: HeadingNode[] = $('h1, h2, h3, h4, h5, h6')
    .map((_, el) => {
      const tagName = $(el).prop('tagName')
      const level = tagName ? Number(String(tagName).slice(1)) : NaN
      return { level, text: $(el).text().trim() }
    })
    .get()
    .filter((h): h is HeadingNode => Number.isInteger(h.level) && h.level >= 1 && h.level <= 6)
    .slice(0, 100)

  const ogTags: Record<string, string> = {}
  $('meta[property^="og:"]').each((_, el) => {
    const prop = $(el).attr('property')
    const content = $(el).attr('content')
    if (prop && content) ogTags[prop] = content
  })

  const twitterTags: Record<string, string> = {}
  $('meta[name^="twitter:"]').each((_, el) => {
    const name = $(el).attr('name')
    const content = $(el).attr('content')
    if (name && content) twitterTags[name] = content
  })

  const schemaTypes: string[] = []
  let hasJsonLd = false
  let jsonLdParseErrorCount = 0
  $('script[type="application/ld+json"]').each((_, el) => {
    hasJsonLd = true
    try {
      const json = JSON.parse($(el).html() || '{}')
      const items = Array.isArray(json) ? json : [json]
      for (const item of items) {
        if (item['@type']) {
          const types = Array.isArray(item['@type']) ? item['@type'] : [item['@type']]
          schemaTypes.push(...types.map(String))
        }
        if (item['@graph'] && Array.isArray(item['@graph'])) {
          for (const node of item['@graph']) {
            if (node['@type']) {
              const types = Array.isArray(node['@type']) ? node['@type'] : [node['@type']]
              schemaTypes.push(...types.map(String))
            }
          }
        }
      }
    } catch {
      jsonLdParseErrorCount++
    }
  })

  // Microdata
  $('[itemscope][itemtype]').each((_, el) => {
    const type = $(el).attr('itemtype')
    if (type) schemaTypes.push(type.split('/').pop() || '')
  })

  let imageCount = 0
  let imagesWithoutAlt = 0
  const images: ImageAsset[] = []
  $('img').each((_, el) => {
    imageCount++
    const altAttr = $(el).attr('alt')
    if (!altAttr || altAttr.trim() === '') imagesWithoutAlt++

    const srcAttr = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('data-lazy-src') || ''
    const widthAttr = $(el).attr('width')
    const heightAttr = $(el).attr('height')
    const width = widthAttr && /^\d+$/.test(widthAttr) ? Number(widthAttr) : null
    const height = heightAttr && /^\d+$/.test(heightAttr) ? Number(heightAttr) : null
    if (!srcAttr || isLikelyTrackingOrSpacer(srcAttr, width, height)) return

    let finalUrl: string | null = null
    let filename = srcAttr
    let format: string | null = null
    if (srcAttr.startsWith('data:')) {
      filename = '(inline data URI)'
      const mimeMatch = srcAttr.match(/^data:image\/([a-z0-9+.-]+)/i)
      format = mimeMatch ? mimeMatch[1].toLowerCase() : null
    } else {
      try {
        const u = new URL(srcAttr, baseUrl.href)
        finalUrl = u.toString()
        filename = u.pathname.split('/').pop() || srcAttr
        const extMatch = filename.match(/\.([a-z0-9]+)(?:\?|$)/i)
        format = extMatch ? extMatch[1].toLowerCase() : null
      } catch {
        finalUrl = null
      }
    }

    if (images.length < 60) {
      images.push({
        src: srcAttr,
        finalUrl,
        alt: altAttr === undefined ? null : altAttr,
        filename,
        format,
        width,
        height,
        loading: $(el).attr('loading') || null,
        isDecorative: altAttr === '' || $(el).attr('role') === 'presentation' || $(el).attr('aria-hidden') === 'true',
        fileSize: null,
        probedWidth: null,
        probedHeight: null,
      })
    }
  })

  let internalLinkCount = 0
  let externalLinkCount = 0
  const linkDetails: LinkDetail[] = []
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') || ''
    if (
      href.startsWith('#') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      href.startsWith('javascript:')
    )
      return
    try {
      const linkUrl = new URL(href, baseUrl.href)
      if (linkUrl.hostname === baseUrl.hostname) {
        internalLinkCount++
        if (!/\.(jpg|jpeg|png|gif|svg|webp|pdf|zip|mp4|mp3|css|js|ico)$/i.test(linkUrl.pathname) && linkDetails.length < 150) {
          const resolved = new URL(linkUrl.toString())
          resolved.hash = ''
          const anchorText = $(el).text().trim() || $(el).attr('aria-label')?.trim() || $(el).attr('title')?.trim() || ''
          const inNav = $(el).closest('nav').length > 0
          const inFooter = $(el).closest('footer').length > 0
          const inHeader = !inNav && !inFooter && $(el).closest('header').length > 0
          const location: LinkDetail['location'] = inNav ? 'nav' : inFooter ? 'footer' : inHeader ? 'header' : 'content'
          linkDetails.push({ href: resolved.toString(), anchorText, location })
        }
      } else {
        externalLinkCount++
      }
    } catch {
      /* ignore */
    }
  })

  // Word count (visible text)
  $('script, style, noscript').remove()
  const text = $('body').text().replace(/\s+/g, ' ').trim()
  const wordCount = text ? text.split(/\s+/).length : 0

  // Main-content-only text/word count for Phase 2B — nav/header/footer and
  // obvious cookie-consent chrome removed on a clone so the original `text`
  // above (relied on by contentSnippet/keyword-mapping) is untouched.
  const mainContentRoot = $('body').clone()
  mainContentRoot
    .find('nav, header, footer, [role="navigation"], [aria-hidden="true"], [class*="cookie" i], [id*="cookie" i], [class*="consent" i], [id*="consent" i]')
    .remove()
  const mainContentText = mainContentRoot.text().replace(/\s+/g, ' ').trim()
  const mainContentWordCount = mainContentText ? mainContentText.split(/\s+/).length : 0

  const contactInfo = extractContactInfo(text)

  // Issue detection
  const issues: string[] = []
  if (!title) issues.push('Missing <title> tag')
  else if (title.length < 30) issues.push(`Title too short (${title.length} chars, ideal 50-60)`)
  else if (title.length > 65) issues.push(`Title too long (${title.length} chars, ideal 50-60)`)

  if (!metaDescription) issues.push('Missing meta description')
  else if (metaDescription.length < 120)
    issues.push(`Meta description too short (${metaDescription.length} chars, ideal 150-160)`)
  else if (metaDescription.length > 165)
    issues.push(`Meta description too long (${metaDescription.length} chars, ideal 150-160)`)

  if (h1.length === 0) issues.push('No H1 tag')
  else if (h1.length > 1) issues.push(`Multiple H1 tags (${h1.length})`)

  if (!canonical) issues.push('No canonical URL')
  if (!viewport) issues.push('No viewport meta tag (mobile UX issue)')
  if (!hasJsonLd && schemaTypes.length === 0) issues.push('No structured data / schema markup')
  if (Object.keys(ogTags).length < 4) issues.push('Incomplete Open Graph tags (social previews)')
  if (Object.keys(twitterTags).length < 2) issues.push('Missing Twitter Card tags')
  if (imageCount > 0 && imagesWithoutAlt / imageCount > 0.2)
    issues.push(`${imagesWithoutAlt}/${imageCount} images missing alt text`)
  if (loadTimeMs > 3000) issues.push(`Slow page load (${(loadTimeMs / 1000).toFixed(1)}s)`)
  if (wordCount < 300) issues.push(`Thin content (${wordCount} words)`)

  return {
    url,
    status,
    ok: status >= 200 && status < 400,
    loadTimeMs,
    byteSize,
    title,
    titleLength: title?.length || 0,
    metaDescription,
    metaDescriptionLength: metaDescription?.length || 0,
    canonical,
    robotsMeta,
    lang,
    viewport,
    charset,
    h1,
    h2,
    h3,
    ogTags,
    twitterTags,
    schemaTypes: Array.from(new Set(schemaTypes.filter(Boolean))),
    hasJsonLd,
    imageCount,
    imagesWithoutAlt,
    internalLinkCount,
    externalLinkCount,
    wordCount,
    contentSnippet: text.slice(0, 1500),
    headingHierarchy,
    mainContentWordCount,
    mainContentText: mainContentText.slice(0, 6000),
    images,
    linkDetails,
    canonicalCount,
    metaRobotsNoindex,
    metaRobotsNofollow,
    xRobotsTag,
    jsonLdParseErrorCount,
    contactInfo,
    issues,
  }
}

function extractInternalLinks(html: string, baseUrl: URL): string[] {
  const $ = cheerio.load(html)
  const links = new Set<string>()
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') || ''
    if (
      !href ||
      href.startsWith('#') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      href.startsWith('javascript:')
    )
      return
    try {
      const u = new URL(href, baseUrl.href)
      if (u.hostname !== baseUrl.hostname) return
      // Strip hash & query for dedup
      u.hash = ''
      // Skip common non-page assets
      if (/\.(jpg|jpeg|png|gif|svg|webp|pdf|zip|mp4|mp3|css|js|ico)$/i.test(u.pathname)) return
      links.add(u.toString())
    } catch {
      /* ignore */
    }
  })
  return Array.from(links)
}

async function checkRobotsTxt(baseUrl: URL) {
  const robotsUrl = `${baseUrl.protocol}//${baseUrl.hostname}/robots.txt`
  const content = await fetchText(robotsUrl)
  if (!content) {
    return {
      found: false,
      hasSitemap: false,
      sitemapUrls: [],
      disallowsAll: false,
      disallowedPaths: [],
      content: null,
    }
  }
  const sitemapUrls: string[] = []
  const disallowedPaths: string[] = []
  const lines = content.split('\n')
  let disallowsAll = false
  let inUserAgentAll = false
  for (const line of lines) {
    const l = line.trim()
    if (/^sitemap:/i.test(l)) {
      const u = l.replace(/^sitemap:\s*/i, '').trim()
      if (u) sitemapUrls.push(u)
    }
    if (/^user-agent:\s*\*/i.test(l)) inUserAgentAll = true
    else if (/^user-agent:/i.test(l)) inUserAgentAll = false
    if (inUserAgentAll && /^disallow:\s*\/\s*$/i.test(l)) disallowsAll = true
    else if (inUserAgentAll) {
      const m = l.match(/^disallow:\s*(\S+)/i)
      if (m && m[1] !== '/') disallowedPaths.push(m[1].trim())
    }
  }
  return {
    found: true,
    hasSitemap: sitemapUrls.length > 0,
    sitemapUrls,
    disallowsAll,
    disallowedPaths: Array.from(new Set(disallowedPaths)),
    content: content.slice(0, 2000),
  }
}

const SITEMAP_MAX_CHILD_SITEMAPS = 5
const SITEMAP_MAX_URLS = 200

/** A sitemap's <loc> entries are attacker-influenceable content (a misconfigured or malicious sitemap), so every entry — page URL or child-sitemap URL alike — is restricted to safe http(s) URLs on the SAME host being audited before this server ever fetches it or hands it back as a crawl target. */
function isSameSiteHttpUrl(candidate: string, siteHostname: string): boolean {
  try {
    const u = new URL(candidate)
    return (u.protocol === 'http:' || u.protocol === 'https:') && u.hostname === siteHostname
  } catch {
    return false
  }
}

/** Fetches one sitemap document; if it's a sitemap INDEX (not a plain urlset), recurses into a bounded number of child sitemaps so `allUrls` always ends up as actual page URLs, never sub-sitemap URLs. Every URL is filtered to `siteHostname` — see isSameSiteHttpUrl(). */
async function fetchSitemapUrls(sitemapUrl: string, siteHostname: string, depth = 0): Promise<string[]> {
  const content = await fetchText(sitemapUrl, 8000)
  if (!content) return []
  const locs = Array.from(content.matchAll(/<loc>([^<]+)<\/loc>/g))
    .map((m) => m[1].trim())
    .filter((u) => isSameSiteHttpUrl(u, siteHostname))
  if (content.includes('<sitemapindex')) {
    if (depth >= 1) return [] // one level of recursion is enough for the sites this tool targets
    const childSitemaps = locs.slice(0, SITEMAP_MAX_CHILD_SITEMAPS)
    const childResults = await Promise.all(childSitemaps.map((u) => fetchSitemapUrls(u, siteHostname, depth + 1)))
    return childResults.flat().slice(0, SITEMAP_MAX_URLS)
  }
  if (content.includes('<urlset')) return locs.slice(0, SITEMAP_MAX_URLS)
  return []
}

async function checkSitemap(baseUrl: URL, robotsUrls: string[]) {
  const candidates = [
    ...robotsUrls,
    `${baseUrl.protocol}//${baseUrl.hostname}/sitemap.xml`,
    `${baseUrl.protocol}//${baseUrl.hostname}/sitemap_index.xml`,
  ]
  for (const url of candidates) {
    const allUrls = await fetchSitemapUrls(url, baseUrl.hostname)
    if (allUrls.length > 0) {
      return {
        found: true,
        urlCount: allUrls.length,
        sampleUrls: allUrls.slice(0, 10),
        allUrls,
      }
    }
  }
  return { found: false, urlCount: 0, sampleUrls: [], allUrls: [] }
}

async function checkHtmlSitemap(baseUrl: URL) {
  const candidates = [
    `${baseUrl.protocol}//${baseUrl.hostname}/sitemap`,
    `${baseUrl.protocol}//${baseUrl.hostname}/site-map`,
    `${baseUrl.protocol}//${baseUrl.hostname}/sitemap.html`,
  ]
  for (const url of candidates) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT },
        signal: AbortSignal.timeout(6000),
      })
      if (res.ok) return { found: true, url: res.url }
    } catch {
      /* ignore */
    }
  }
  return { found: false, url: null }
}

const SITEMAP_STATUS_CHECK_LIMIT = 30
const SITEMAP_FLAGGED_URL_LIMIT = 20

function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, '')
}

/** A page's path is blocked if it starts with any robots.txt Disallow prefix for `User-agent: *`. */
function isPathDisallowed(pathname: string, disallowedPaths: string[]): boolean {
  return disallowedPaths.some((p) => pathname.startsWith(p))
}

/**
 * Phase 5 — sitemap health check. Status-checks a bounded sample of sitemap
 * URLs (never the whole sitemap for a large site — that's a request budget
 * a single report generation can't afford) and cross-references sitemap
 * URLs that WERE crawled against their own noindex/canonical data, which we
 * already have for free from the crawl itself.
 */
async function auditSitemap(
  sitemapUrls: string[],
  crawledByUrl: Map<string, PageAnalysis>,
  disallowedPaths: string[],
  disallowsAll: boolean,
): Promise<SitemapAuditResult> {
  const toCheck = sitemapUrls.slice(0, SITEMAP_STATUS_CHECK_LIMIT)
  const traces = await mapWithConcurrency(toCheck, 6, (u) => traceUrlStatus(u))

  let valid200 = 0
  let redirects = 0
  let clientErrors = 0
  let serverErrors = 0
  let unreachable = 0
  const flaggedUrls: SitemapFlaggedUrl[] = []

  for (let i = 0; i < toCheck.length; i++) {
    const url = toCheck[i]
    const { finalStatus, hops } = traces[i]

    // traceUrlStatus() already FOLLOWS redirects to reach a final status, so
    // an ordinary 301->200 sitemap URL has finalStatus 200 — classify by
    // whether any hop actually happened, not just by the terminal status.
    if (finalStatus === null) {
      unreachable++
      flaggedUrls.push({ url, issue: 'unreachable', status: null })
    } else if (hops.length > 0) {
      redirects++
      flaggedUrls.push({ url, issue: 'redirect', status: finalStatus })
    } else if (finalStatus >= 200 && finalStatus < 300) {
      valid200++
    } else if (finalStatus >= 400 && finalStatus < 500) {
      clientErrors++
      flaggedUrls.push({ url, issue: 'client_error', status: finalStatus })
    } else {
      serverErrors++
      flaggedUrls.push({ url, issue: 'server_error', status: finalStatus })
    }

    // robots.txt blocking only needs the sitemap URL + parsed rules, not a
    // crawl — most sitemap entries in a quick audit (or excluded/failed
    // entries in a full one) never get crawled, and a blocked URL should
    // still be flagged.
    let pathname: string | null = null
    try {
      pathname = new URL(url).pathname
    } catch {
      /* ignore */
    }
    if (pathname && (disallowsAll || isPathDisallowed(pathname, disallowedPaths))) {
      flaggedUrls.push({ url, issue: 'blocked_by_robots', status: finalStatus })
    }

    const crawledPage = crawledByUrl.get(url)
    if (crawledPage) {
      const noindex = crawledPage.metaRobotsNoindex || /noindex/i.test(crawledPage.xRobotsTag ?? '')
      if (noindex) flaggedUrls.push({ url, issue: 'noindex_in_sitemap', status: finalStatus })
      if (crawledPage.canonical) {
        let resolvedCanonical: string | null = null
        try {
          resolvedCanonical = new URL(crawledPage.canonical, crawledPage.url).toString()
        } catch {
          /* malformed canonical — already flagged by the deterministic canonical audit elsewhere */
        }
        if (resolvedCanonical && stripTrailingSlash(resolvedCanonical) !== stripTrailingSlash(url)) {
          flaggedUrls.push({ url, issue: 'canonical_mismatch', status: finalStatus })
        }
      }
    }
  }

  const crawledUrlSet = new Set(crawledByUrl.keys())
  const notCrawledCount = sitemapUrls.filter((u) => !crawledUrlSet.has(u)).length

  return {
    totalUrls: sitemapUrls.length,
    checkedUrls: toCheck.length,
    valid200,
    redirects,
    clientErrors,
    serverErrors,
    unreachable,
    notCrawledCount,
    flaggedUrls: flaggedUrls.slice(0, SITEMAP_FLAGGED_URL_LIMIT),
  }
}

// ---------------------------------------------------------------------------
// Main analyze handler
// ---------------------------------------------------------------------------
const QUICK_DISCOVER_CAP = 12
const QUICK_CRAWL_CAP = 8
const FULL_DISCOVER_CAP = 60
const FULL_CRAWL_CAP = 40
/** Bound on how many redirected pages get their full chain traced (see traceUrlStatus) — the redirect itself is already known from the main crawl fetch; this only bounds the extra diagnostic hop-tracing requests. */
const REDIRECT_TRACE_LIMIT = 15

export async function POST(req: Request) {
  try {
    const { websiteUrl, crawlMode: crawlModeInput } = (await req.json()) as { websiteUrl: string; crawlMode?: string }
    if (!websiteUrl) {
      return Response.json({ error: 'websiteUrl is required' }, { status: 400 })
    }
    const crawlMode: 'quick' | 'full' = crawlModeInput === 'full' ? 'full' : 'quick'

    const normalized = normalizeUrl(websiteUrl)
    let baseUrl: URL
    try {
      baseUrl = new URL(normalized)
    } catch {
      return Response.json({ error: 'Invalid URL' }, { status: 400 })
    }

    // Fetch homepage
    const home = await fetchWithTimeout(normalized, 15000)
    if (!home) {
      return Response.json(
        { error: 'Could not fetch the website. Check the URL or its accessibility.' },
        { status: 502 },
      )
    }

    const finalUrl = home.finalUrl
    const finalBase = new URL(finalUrl)

    // Analyze homepage
    const homepageAnalysis = analyzeHtml(
      finalUrl,
      home.html,
      home.status,
      home.loadTimeMs,
      home.byteSize,
      finalBase,
      home.headers['x-robots-tag'] ?? null,
    )

    // Discover internal links from homepage. `allDiscoveredLinks` is kept
    // uncapped for the report's "URLs discovered" stat — `internalLinks`
    // itself is capped to bound how many pages get crawled below, and using
    // its already-capped length would understate discovery on any site with
    // more than 12 internal links found on the homepage.
    const allDiscoveredLinks = extractInternalLinks(home.html, finalBase).filter((u) => u !== finalUrl)

    // Robots / sitemap / html sitemap — moved ahead of the crawl-list
    // decision below because 'full' mode prefers the sitemap (a far more
    // complete URL list than homepage-only link extraction) as its
    // discovery source when one is available.
    const [robotsTxt, htmlSitemap] = await Promise.all([
      checkRobotsTxt(finalBase),
      checkHtmlSitemap(finalBase),
    ])
    const sitemapXml = await checkSitemap(finalBase, robotsTxt.sitemapUrls)

    let internalLinks: string[]
    if (crawlMode === 'full') {
      const sitemapPageUrls = sitemapXml.allUrls.filter((u) => u !== finalUrl)
      const source = sitemapPageUrls.length > 0 ? sitemapPageUrls : allDiscoveredLinks
      internalLinks = source.slice(0, FULL_DISCOVER_CAP)
    } else {
      internalLinks = allDiscoveredLinks.slice(0, QUICK_DISCOVER_CAP)
    }

    // Crawl the selected internal pages in parallel, tracking success/
    // failure/redirect per URL so crawl coverage can be reported honestly
    // instead of silently dropping failed fetches.
    const toCrawl = internalLinks.slice(0, crawlMode === 'full' ? FULL_CRAWL_CAP : QUICK_CRAWL_CAP)
    const crawlResults = await Promise.all(
      toCrawl.map(async (url) => {
        const r = await fetchWithTimeout(url, 10000)
        if (!r) return { url, ok: false as const }
        const page = analyzeHtml(url, r.html, r.status, r.loadTimeMs, r.byteSize, finalBase, r.headers['x-robots-tag'] ?? null)
        return { url, ok: true as const, page, redirected: stripTrailingSlash(r.finalUrl) !== stripTrailingSlash(url) }
      }),
    )
    const pageAnalyses: PageAnalysis[] = crawlResults.filter((c): c is Extract<typeof c, { ok: true }> => c.ok).map((c) => c.page)
    const failedCrawlCount = crawlResults.filter((c) => !c.ok).length
    const redirectedCrawlUrls = crawlResults.filter((c): c is Extract<typeof c, { ok: true }> => c.ok && c.redirected).map((c) => c.url)

    const allPages = [homepageAnalysis, ...pageAnalyses]

    // Phase 5 — redirect chain tracing. The main crawl fetch above already
    // tells us WHETHER a URL redirected (r.finalUrl !== url); this traces
    // the actual hop-by-hop chain (and loop detection) for a bounded subset
    // of those, plus the homepage itself if the input URL redirected.
    // A bare-domain input like "https://example.com" is normalized by the
    // browser/fetch spec to "https://example.com/" in Response.url even
    // with zero real redirects — compare with trailing slashes stripped so
    // that alone isn't counted as a redirect.
    const homeRedirected = stripTrailingSlash(home.finalUrl) !== stripTrailingSlash(normalized)
    const urlsToTrace = [...(homeRedirected ? [normalized] : []), ...redirectedCrawlUrls].slice(0, REDIRECT_TRACE_LIMIT)
    const redirectTraces = await mapWithConcurrency(urlsToTrace, 6, (u) => traceUrlStatus(u))
    const redirects: SiteAnalysis['redirects'] = urlsToTrace
      .map((source, i) => ({ source, finalUrl: redirectTraces[i].finalUrl, hops: redirectTraces[i].hops, isLoop: redirectTraces[i].isLoop }))
      .filter((r) => r.hops.length > 0 || r.isLoop)

    // -----------------------------------------------------------------------
    // Phase 2B — image probing (file size + intrinsic dimensions).
    // One probe per UNIQUE image URL across the whole crawl, bounded so a
    // page with dozens of images can't blow the route's time budget; a
    // shared logo/hero reused across pages is only downloaded once.
    // -----------------------------------------------------------------------
    const uniqueImageUrls = Array.from(
      new Set(allPages.flatMap((p) => p.images.map((img) => img.finalUrl).filter((u): u is string => u !== null))),
    ).slice(0, 30)
    const probeResults = await mapWithConcurrency(uniqueImageUrls, 6, (imgUrl) => probeImage(imgUrl))
    const probeByUrl = new Map(uniqueImageUrls.map((imgUrl, i) => [imgUrl, probeResults[i]]))
    for (const page of allPages) {
      for (const img of page.images) {
        if (!img.finalUrl) continue
        const probe = probeByUrl.get(img.finalUrl)
        if (!probe) continue
        img.fileSize = probe.fileSize
        img.probedWidth = probe.width
        img.probedHeight = probe.height
      }
    }

    // -----------------------------------------------------------------------
    // Phase 2B — broken internal link detection. Links to pages that WERE
    // crawled already have a real status (the crawl itself is the check);
    // for everything else discovered via linkDetails, do a bounded,
    // status-only check so a large site's long tail of links doesn't need a
    // full page crawl just to know whether it 404s.
    // -----------------------------------------------------------------------
    const crawledUrlSet = new Set(allPages.map((p) => p.url))
    const crawledStatusByUrl = new Map(allPages.map((p) => [p.url, p.status]))
    const uncrawledLinkTargets = Array.from(
      new Set(allPages.flatMap((p) => p.linkDetails.map((l) => l.href)).filter((href) => !crawledUrlSet.has(href))),
    ).slice(0, 30)
    const linkStatusResults = await mapWithConcurrency(uncrawledLinkTargets, 6, (href) => checkLinkStatus(href))
    const linkStatusByUrl = new Map(uncrawledLinkTargets.map((href, i) => [href, linkStatusResults[i]]))

    const brokenInternalLinks: SiteAnalysis['brokenInternalLinks'] = []
    for (const page of allPages) {
      for (const link of page.linkDetails) {
        const statusCode = crawledStatusByUrl.get(link.href) ?? linkStatusByUrl.get(link.href) ?? undefined
        if (statusCode === undefined) continue // never checked (beyond the bounded cap above) — not evaluated, not reported as broken
        if (statusCode === null || statusCode === 404 || statusCode === 410 || statusCode >= 500) {
          brokenInternalLinks.push({ source: page.url, anchor: link.anchorText, target: link.href, statusCode: statusCode ?? null })
        }
      }
    }

    // A bounded crawl only counts as "full" coverage when there was nothing
    // more to find — otherwise orphan-page claims need to be qualified as
    // lower-confidence.
    const crawlCoverage: SiteAnalysis['crawlCoverage'] = internalLinks.length <= toCrawl.length ? 'full' : 'partial'

    // Phase 5 — sitemap audit: status-check a bounded sample of sitemap URLs
    // and cross-reference against the pages we actually crawled.
    const crawledByUrl = new Map(allPages.map((p) => [p.url, p]))
    const sitemapAudit: SiteAnalysis['sitemapAudit'] = sitemapXml.found
      ? await auditSitemap(sitemapXml.allUrls, crawledByUrl, robotsTxt.disallowedPaths, robotsTxt.disallowsAll)
      : null

    // Phase 5 — transparent crawl coverage. `discovered` reflects the
    // sitemap-driven count in 'full' mode when a sitemap was used as the
    // discovery source, otherwise the homepage-link-based count — matching
    // whichever source actually determined `internalLinks` above.
    const discoveredUrlCount =
      crawlMode === 'full' && sitemapXml.allUrls.filter((u) => u !== finalUrl).length > 0
        ? sitemapXml.allUrls.length
        : allDiscoveredLinks.length + 1
    const crawlStats: SiteAnalysis['crawlStats'] = {
      discovered: discoveredUrlCount,
      crawled: allPages.length,
      failed: failedCrawlCount,
      redirected: redirectedCrawlUrls.length + (homeRedirected ? 1 : 0),
      excluded: Math.max(0, discoveredUrlCount - 1 - toCrawl.length),
      audited: allPages.length,
    }

    // Aggregate contact info from all pages
    const allPhones = new Set<string>()
    const allEmails = new Set<string>()
    const allAddresses = new Set<string>()
    for (const p of allPages) {
      p.contactInfo.phones.forEach((x) => allPhones.add(x))
      p.contactInfo.emails.forEach((x) => allEmails.add(x))
      p.contactInfo.addresses.forEach((x) => allAddresses.add(x))
    }

    // Technical summary
    const technicalSummary = {
      httpsEnabled: finalBase.protocol === 'https:',
      hasCanonicals: allPages.filter((p) => p.canonical).length,
      missingCanonicals: allPages.filter((p) => !p.canonical).length,
      hasMetaDescriptions: allPages.filter((p) => p.metaDescription).length,
      missingMetaDescriptions: allPages.filter((p) => !p.metaDescription).length,
      hasH1: allPages.filter((p) => p.h1.length === 1).length,
      missingH1: allPages.filter((p) => p.h1.length === 0).length,
      multipleH1: allPages.filter((p) => p.h1.length > 1).length,
      hasSchema: allPages.filter((p) => p.hasJsonLd || p.schemaTypes.length > 0).length,
      missingSchema: allPages.filter((p) => !p.hasJsonLd && p.schemaTypes.length === 0).length,
      hasOgTags: allPages.filter((p) => Object.keys(p.ogTags).length >= 4).length,
      missingOgTags: allPages.filter((p) => Object.keys(p.ogTags).length < 4).length,
      hasTwitterTags: allPages.filter((p) => Object.keys(p.twitterTags).length >= 2).length,
      missingTwitterTags: allPages.filter((p) => Object.keys(p.twitterTags).length < 2).length,
      averageLoadTimeMs: Math.round(
        allPages.reduce((s, p) => s + p.loadTimeMs, 0) / allPages.length,
      ),
      averageWordCount: Math.round(
        allPages.reduce((s, p) => s + p.wordCount, 0) / allPages.length,
      ),
    }

    const encodedUrl = encodeURIComponent(finalUrl)

    const analysis: SiteAnalysis = {
      inputUrl: websiteUrl,
      finalUrl,
      domain: finalBase.hostname,
      isHttps: finalBase.protocol === 'https:',
      homepage: homepageAnalysis,
      pages: pageAnalyses,
      totalPagesCrawled: allPages.length,
      robotsTxt,
      sitemapXml,
      htmlSitemap,
      // WordPress mshots — free, no API key, no CORS issues, served from public CDN
      mobileScreenshotUrl: `https://s.wordpress.com/mshots/v1/${encodedUrl}?w=414&h=896`,
      desktopScreenshotUrl: `https://s.wordpress.com/mshots/v1/${encodedUrl}?w=1280&h=800`,
      contactInfo: {
        phones: Array.from(allPhones).slice(0, 5),
        emails: Array.from(allEmails).slice(0, 5),
        addresses: Array.from(allAddresses).slice(0, 3),
      },
      technicalSummary,
      brokenInternalLinks,
      crawlCoverage,
      discoveredUrlCount,
      crawlMode,
      crawlStats,
      redirects,
      sitemapAudit,
    }

    return Response.json({ analysis })
  } catch (err) {
    console.error('[v0] Site analysis error:', err)
    const message = err instanceof Error ? err.message : 'Analysis failed'
    return Response.json({ error: message }, { status: 500 })
  }
}
