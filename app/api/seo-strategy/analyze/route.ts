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
  }
  sitemapXml: {
    found: boolean
    urlCount: number
    sampleUrls: string[]
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
      content: null,
    }
  }
  const sitemapUrls: string[] = []
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
  }
  return {
    found: true,
    hasSitemap: sitemapUrls.length > 0,
    sitemapUrls,
    disallowsAll,
    content: content.slice(0, 2000),
  }
}

async function checkSitemap(baseUrl: URL, robotsUrls: string[]) {
  const candidates = [
    ...robotsUrls,
    `${baseUrl.protocol}//${baseUrl.hostname}/sitemap.xml`,
    `${baseUrl.protocol}//${baseUrl.hostname}/sitemap_index.xml`,
  ]
  for (const url of candidates) {
    const content = await fetchText(url, 8000)
    if (content && content.includes('<urlset') || (content && content.includes('<sitemapindex'))) {
      const urls = Array.from(content.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1])
      return {
        found: true,
        urlCount: urls.length,
        sampleUrls: urls.slice(0, 10),
      }
    }
  }
  return { found: false, urlCount: 0, sampleUrls: [] }
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

// ---------------------------------------------------------------------------
// Main analyze handler
// ---------------------------------------------------------------------------
export async function POST(req: Request) {
  try {
    const { websiteUrl } = (await req.json()) as { websiteUrl: string }
    if (!websiteUrl) {
      return Response.json({ error: 'websiteUrl is required' }, { status: 400 })
    }

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

    // Discover internal links from homepage
    const internalLinks = extractInternalLinks(home.html, finalBase)
      .filter((u) => u !== finalUrl)
      .slice(0, 12)

    // Crawl up to 8 internal pages in parallel
    const toCrawl = internalLinks.slice(0, 8)
    const crawled = await Promise.all(
      toCrawl.map(async (url) => {
        const r = await fetchWithTimeout(url, 10000)
        if (!r) return null
        return analyzeHtml(url, r.html, r.status, r.loadTimeMs, r.byteSize, finalBase, r.headers['x-robots-tag'] ?? null)
      }),
    )
    const pageAnalyses: PageAnalysis[] = crawled.filter((p): p is PageAnalysis => p !== null)

    const allPages = [homepageAnalysis, ...pageAnalyses]

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

    // A bounded crawl (homepage + up to 8 internal pages) only counts as
    // "full" coverage when there was nothing more to find — otherwise
    // orphan-page claims need to be qualified as lower-confidence.
    const crawlCoverage: SiteAnalysis['crawlCoverage'] = internalLinks.length <= toCrawl.length ? 'full' : 'partial'

    // Robots / sitemap / html sitemap
    const [robotsTxt, htmlSitemap] = await Promise.all([
      checkRobotsTxt(finalBase),
      checkHtmlSitemap(finalBase),
    ])
    const sitemapXml = await checkSitemap(finalBase, robotsTxt.sitemapUrls)

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
    }

    return Response.json({ analysis })
  } catch (err) {
    console.error('[v0] Site analysis error:', err)
    const message = err instanceof Error ? err.message : 'Analysis failed'
    return Response.json({ error: message }, { status: 500 })
  }
}
