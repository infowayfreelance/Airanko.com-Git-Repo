import * as cheerio from 'cheerio'

export const maxDuration = 60

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
/** One heading element in document order — includes empty-text and H4-H6 headings that the legacy `h1`/`h2`/`h3` arrays below drop, so the on-page audit (lib/seo-strategy/on-page-audit.ts) can detect empty headings and hierarchy skips accurately. */
export interface HeadingNode {
  level: number
  text: string
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
): Promise<{ html: string; status: number; finalUrl: string; loadTimeMs: number; byteSize: number } | null> {
  try {
    const start = Date.now()
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'text/html,application/xhtml+xml' },
      redirect: 'follow',
      signal: AbortSignal.timeout(timeoutMs),
    })
    const html = await res.text()
    return {
      html,
      status: res.status,
      finalUrl: res.url || url,
      loadTimeMs: Date.now() - start,
      byteSize: new Blob([html]).size,
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

function analyzeHtml(
  url: string,
  html: string,
  status: number,
  loadTimeMs: number,
  byteSize: number,
  baseUrl: URL,
): PageAnalysis {
  const $ = cheerio.load(html)

  const title = $('title').first().text().trim() || null
  const metaDescription =
    $('meta[name="description"]').attr('content')?.trim() || null
  const canonical = $('link[rel="canonical"]').attr('href')?.trim() || null
  const robotsMeta = $('meta[name="robots"]').attr('content')?.trim() || null
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
      /* ignore parse errors */
    }
  })

  // Microdata
  $('[itemscope][itemtype]').each((_, el) => {
    const type = $(el).attr('itemtype')
    if (type) schemaTypes.push(type.split('/').pop() || '')
  })

  let imageCount = 0
  let imagesWithoutAlt = 0
  $('img').each((_, el) => {
    imageCount++
    const alt = $(el).attr('alt')
    if (!alt || alt.trim() === '') imagesWithoutAlt++
  })

  let internalLinkCount = 0
  let externalLinkCount = 0
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
      if (linkUrl.hostname === baseUrl.hostname) internalLinkCount++
      else externalLinkCount++
    } catch {
      /* ignore */
    }
  })

  // Word count (visible text)
  $('script, style, noscript').remove()
  const text = $('body').text().replace(/\s+/g, ' ').trim()
  const wordCount = text ? text.split(/\s+/).length : 0

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
        return analyzeHtml(url, r.html, r.status, r.loadTimeMs, r.byteSize, finalBase)
      }),
    )
    const pageAnalyses: PageAnalysis[] = crawled.filter((p): p is PageAnalysis => p !== null)

    const allPages = [homepageAnalysis, ...pageAnalyses]

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
    }

    return Response.json({ analysis })
  } catch (err) {
    console.error('[v0] Site analysis error:', err)
    const message = err instanceof Error ? err.message : 'Analysis failed'
    return Response.json({ error: message }, { status: 500 })
  }
}
