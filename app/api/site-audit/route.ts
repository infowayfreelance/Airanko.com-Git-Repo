import * as cheerio from 'cheerio'
import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 90

const USER_AGENT =
  'Mozilla/5.0 (compatible; AiRankoBot/1.0; +https://airanko.com/bot)'

// ── Types ──────────────────────────────────────────────────────────────────

type IssueSeverity = 'critical' | 'warning' | 'info'
type IssueCategory = 'seo' | 'performance' | 'accessibility' | 'technical' | 'content' | 'mobile'

interface Issue {
  id: string
  category: IssueCategory
  severity: IssueSeverity
  title: string
  description: string
  affectedUrls: string[]
  affectedCount: number
  howToFix: string
  estimatedImpact: 'high' | 'medium' | 'low'
}

interface PageMetrics {
  url: string
  status: number
  loadTimeMs: number
  byteSize: number
  title: string | null
  titleLength: number
  metaDescription: string | null
  metaDescriptionLength: number
  canonical: string | null
  h1Count: number
  h2Count: number
  imageCount: number
  imagesWithoutAlt: number
  internalLinks: number
  externalLinks: number
  wordCount: number
  hasJsonLd: boolean
  hasOgTags: boolean
  hasViewport: boolean
  hasLang: boolean
  hasFavicon: boolean
}

interface AuditScore {
  overall: number
  seo: number
  performance: number
  accessibility: number
  technical: number
  mobile: number
  content: number
}

interface SiteAuditResult {
  inputUrl: string
  finalUrl: string
  domain: string
  pagesCrawled: number
  isHttps: boolean
  hasRobotsTxt: boolean
  hasSitemap: boolean
  sitemapUrlCount: number
  scores: AuditScore
  issues: Issue[]
  pages: PageMetrics[]
  summary: string
  topRecommendations: string[]
  averageLoadTimeMs: number
  totalPageWeight: number
  generatedAt: string
}

// ── Helpers ────────────────────────────────────────────────────────────────

function normalizeUrl(input: string): string {
  let url = input.trim()
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`
  return url
}

async function fetchHtml(url: string, timeoutMs = 10000) {
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

async function fetchText(url: string, timeoutMs = 6000): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(timeoutMs),
    })
    if (!res.ok) return null
    return await res.text()
  } catch { return null }
}

// ── Page analysis ──────────────────────────────────────────────────────────

function analyzeHtml(url: string, html: string, status: number, loadTimeMs: number, byteSize: number, baseHost: string): PageMetrics {
  const $ = cheerio.load(html)
  const title = $('title').first().text().trim() || null
  const metaDesc = $('meta[name="description"]').attr('content')?.trim() || null
  const canonical = $('link[rel="canonical"]').attr('href')?.trim() || null
  const h1Count = $('h1').length
  const h2Count = $('h2').length
  const imageCount = $('img').length
  const imagesWithoutAlt = $('img').filter((_: number, el) => {
    const alt = $(el).attr('alt')
    return !alt || alt.trim() === ''
  }).length

  let internalLinks = 0
  let externalLinks = 0
  $('a[href]').each((_: number, el) => {
    const href = $(el).attr('href') || ''
    if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) return
    try {
      const u = new URL(href, url)
      if (u.host === baseHost) internalLinks++
      else externalLinks++
    } catch { /* ignore */ }
  })

  const bodyText = $('body').text().replace(/\s+/g, ' ').trim()
  const wordCount = bodyText.split(/\s+/).filter(Boolean).length

  const hasJsonLd = $('script[type="application/ld+json"]').length > 0
  const hasOgTags = $('meta[property^="og:"]').length > 0
  const hasViewport = $('meta[name="viewport"]').length > 0
  const hasLang = !!$('html').attr('lang')
  const hasFavicon = $('link[rel*="icon"]').length > 0

  return {
    url,
    status,
    loadTimeMs,
    byteSize,
    title,
    titleLength: title?.length ?? 0,
    metaDescription: metaDesc,
    metaDescriptionLength: metaDesc?.length ?? 0,
    canonical,
    h1Count,
    h2Count,
    imageCount,
    imagesWithoutAlt,
    internalLinks,
    externalLinks,
    wordCount,
    hasJsonLd,
    hasOgTags,
    hasViewport,
    hasLang,
    hasFavicon,
  }
}

// ── Discover internal pages to crawl ───────────────────────────────────────

function discoverLinks(homeHtml: string, baseUrl: URL, limit: number): string[] {
  const $ = cheerio.load(homeHtml)
  const found = new Set<string>()
  $('a[href]').each((_: number, el) => {
    const href = $(el).attr('href') || ''
    if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) return
    try {
      const u = new URL(href, baseUrl)
      if (u.host !== baseUrl.host) return
      // Skip files
      if (/\.(pdf|zip|jpg|jpeg|png|gif|svg|webp|mp4|mp3|css|js|xml|ico)$/i.test(u.pathname)) return
      u.hash = ''
      const clean = u.toString()
      if (clean !== baseUrl.toString()) found.add(clean)
    } catch { /* ignore */ }
  })
  return Array.from(found).slice(0, limit)
}

async function discoverFromSitemap(sitemapXml: string, limit: number): Promise<string[]> {
  const urls: string[] = []
  const matches = sitemapXml.match(/<loc>(.*?)<\/loc>/g) ?? []
  for (const m of matches.slice(0, limit * 3)) {
    const u = m.replace(/<\/?loc>/g, '').trim()
    if (u && !/\.(jpg|jpeg|png|gif|svg|webp|pdf|xml)$/i.test(u)) urls.push(u)
    if (urls.length >= limit) break
  }
  return urls
}

// ── Issue extraction ───────────────────────────────────────────────────────

function deriveIssues(pages: PageMetrics[], hasRobotsTxt: boolean, hasSitemap: boolean, isHttps: boolean): Issue[] {
  const issues: Issue[] = []
  const allUrls = pages.map((p) => p.url)

  function add(args: Omit<Issue, 'affectedCount'>) {
    issues.push({ ...args, affectedCount: args.affectedUrls.length })
  }

  // ── Critical site-level ──
  if (!isHttps) {
    add({
      id: 'no-https',
      category: 'technical', severity: 'critical',
      title: 'Site is not served over HTTPS',
      description: 'HTTPS is a confirmed Google ranking signal and required for modern browser features. Users see a "Not Secure" warning.',
      affectedUrls: allUrls,
      howToFix: 'Install an SSL certificate (Let\'s Encrypt is free) and force-redirect all HTTP traffic to HTTPS at the server or CDN level.',
      estimatedImpact: 'high',
    })
  }
  if (!hasRobotsTxt) {
    add({
      id: 'no-robots-txt',
      category: 'technical', severity: 'warning',
      title: 'Missing robots.txt',
      description: 'A robots.txt file tells search engines which pages to crawl. Missing it leaves crawl behavior up to defaults.',
      affectedUrls: [],
      howToFix: 'Create /robots.txt with at minimum: "User-agent: *\\nAllow: /\\nSitemap: https://yourdomain.com/sitemap.xml"',
      estimatedImpact: 'medium',
    })
  }
  if (!hasSitemap) {
    add({
      id: 'no-sitemap',
      category: 'technical', severity: 'warning',
      title: 'Missing XML sitemap',
      description: 'Sitemaps help Google discover and index your pages faster. Without one, indexing depends entirely on internal linking.',
      affectedUrls: [],
      howToFix: 'Generate a sitemap.xml listing all important pages and reference it in robots.txt. Most CMS platforms generate one automatically.',
      estimatedImpact: 'medium',
    })
  }

  // ── Per-page issues (aggregate) ──
  const missingTitle = pages.filter((p) => !p.title)
  if (missingTitle.length) {
    add({
      id: 'missing-title',
      category: 'seo', severity: 'critical',
      title: 'Pages missing <title> tag',
      description: 'Title tags are the single most important on-page SEO element. Pages without one are unlikely to rank for target keywords.',
      affectedUrls: missingTitle.map((p) => p.url),
      howToFix: 'Add a unique, descriptive 50–60 character <title> tag to every page that includes the primary keyword near the start.',
      estimatedImpact: 'high',
    })
  }

  const shortTitle = pages.filter((p) => p.title && p.titleLength < 30)
  if (shortTitle.length) {
    add({
      id: 'short-title',
      category: 'seo', severity: 'warning',
      title: 'Title tags too short',
      description: 'Titles under 30 characters often fail to capture searcher intent and miss keyword opportunities.',
      affectedUrls: shortTitle.map((p) => p.url),
      howToFix: 'Rewrite each title to 50–60 characters, leading with the primary keyword and adding a benefit/modifier.',
      estimatedImpact: 'medium',
    })
  }

  const longTitle = pages.filter((p) => p.titleLength > 65)
  if (longTitle.length) {
    add({
      id: 'long-title',
      category: 'seo', severity: 'warning',
      title: 'Title tags too long (will be truncated in SERP)',
      description: 'Titles over 65 characters get cut off in Google search results, hurting click-through rate.',
      affectedUrls: longTitle.map((p) => p.url),
      howToFix: 'Shorten titles to under 60 characters. Lead with the keyword and remove unnecessary modifiers.',
      estimatedImpact: 'medium',
    })
  }

  const missingDesc = pages.filter((p) => !p.metaDescription)
  if (missingDesc.length) {
    add({
      id: 'missing-meta-description',
      category: 'seo', severity: 'critical',
      title: 'Pages missing meta description',
      description: 'Without a meta description, Google auto-generates one — usually a generic snippet that hurts click-through rate.',
      affectedUrls: missingDesc.map((p) => p.url),
      howToFix: 'Add a unique 140–160 character meta description to every page that summarizes content and includes the primary keyword.',
      estimatedImpact: 'high',
    })
  }

  const shortDesc = pages.filter((p) => p.metaDescription && p.metaDescriptionLength < 70)
  if (shortDesc.length) {
    add({
      id: 'short-meta-description',
      category: 'seo', severity: 'warning',
      title: 'Meta descriptions too short',
      description: 'Descriptions under 70 characters waste valuable SERP real estate that could be used to entice clicks.',
      affectedUrls: shortDesc.map((p) => p.url),
      howToFix: 'Expand descriptions to 140–160 characters with a clear value proposition and call to action.',
      estimatedImpact: 'medium',
    })
  }

  const longDesc = pages.filter((p) => p.metaDescriptionLength > 165)
  if (longDesc.length) {
    add({
      id: 'long-meta-description',
      category: 'seo', severity: 'warning',
      title: 'Meta descriptions too long',
      description: 'Descriptions over 165 characters get truncated mid-sentence in Google search results.',
      affectedUrls: longDesc.map((p) => p.url),
      howToFix: 'Trim descriptions to 140–160 characters. Lead with the most important information.',
      estimatedImpact: 'low',
    })
  }

  const noH1 = pages.filter((p) => p.h1Count === 0)
  if (noH1.length) {
    add({
      id: 'missing-h1',
      category: 'seo', severity: 'critical',
      title: 'Pages missing H1 tag',
      description: 'The H1 is the main visual headline and a major on-page ranking signal. Pages without one confuse search engines.',
      affectedUrls: noH1.map((p) => p.url),
      howToFix: 'Add exactly one <h1> tag per page containing the primary keyword. It should be the largest, most prominent heading.',
      estimatedImpact: 'high',
    })
  }

  const multipleH1 = pages.filter((p) => p.h1Count > 1)
  if (multipleH1.length) {
    add({
      id: 'multiple-h1',
      category: 'seo', severity: 'warning',
      title: 'Pages with multiple H1 tags',
      description: 'Multiple H1s dilute the topical focus and confuse search engines about the main subject.',
      affectedUrls: multipleH1.map((p) => p.url),
      howToFix: 'Keep exactly one H1 per page. Convert additional H1s to H2 or H3 as appropriate for the hierarchy.',
      estimatedImpact: 'medium',
    })
  }

  const missingCanonical = pages.filter((p) => !p.canonical)
  if (missingCanonical.length) {
    add({
      id: 'missing-canonical',
      category: 'technical', severity: 'warning',
      title: 'Pages missing canonical tag',
      description: 'Canonical tags prevent duplicate content issues by telling Google the preferred URL.',
      affectedUrls: missingCanonical.map((p) => p.url),
      howToFix: 'Add <link rel="canonical" href="..."> to every page pointing to the preferred URL (self-canonical for unique pages).',
      estimatedImpact: 'medium',
    })
  }

  const totalMissingAlt = pages.reduce((s, p) => s + p.imagesWithoutAlt, 0)
  const totalImages = pages.reduce((s, p) => s + p.imageCount, 0)
  if (totalMissingAlt > 0) {
    add({
      id: 'images-missing-alt',
      category: 'accessibility', severity: totalMissingAlt > totalImages * 0.3 ? 'critical' : 'warning',
      title: `${totalMissingAlt} images missing alt text`,
      description: 'Alt text is required for screen readers and is read by Google to understand images. Missing alts hurt both accessibility and image SEO.',
      affectedUrls: pages.filter((p) => p.imagesWithoutAlt > 0).map((p) => p.url),
      howToFix: 'Add a descriptive alt attribute to every <img> tag. Describe what the image shows, including any text in it. Decorative images may use alt="".',
      estimatedImpact: totalMissingAlt > totalImages * 0.3 ? 'high' : 'medium',
    })
  }

  const noViewport = pages.filter((p) => !p.hasViewport)
  if (noViewport.length) {
    add({
      id: 'missing-viewport',
      category: 'mobile', severity: 'critical',
      title: 'Pages missing viewport meta tag',
      description: 'Without the viewport tag, mobile browsers render the page at desktop width and zoom out — failing Google\'s mobile-friendly test.',
      affectedUrls: noViewport.map((p) => p.url),
      howToFix: 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> to the <head> of every page.',
      estimatedImpact: 'high',
    })
  }

  const noLang = pages.filter((p) => !p.hasLang)
  if (noLang.length) {
    add({
      id: 'missing-lang',
      category: 'accessibility', severity: 'warning',
      title: 'HTML tag missing lang attribute',
      description: 'The lang attribute helps screen readers pronounce words correctly and helps Google understand content language.',
      affectedUrls: noLang.map((p) => p.url),
      howToFix: 'Add lang="en" (or your site\'s language code) to the <html> tag: <html lang="en">',
      estimatedImpact: 'medium',
    })
  }

  const noJsonLd = pages.filter((p) => !p.hasJsonLd)
  if (noJsonLd.length === pages.length) {
    add({
      id: 'no-schema',
      category: 'seo', severity: 'warning',
      title: 'No structured data (JSON-LD) found',
      description: 'Schema markup unlocks rich SERP features like FAQ snippets, breadcrumbs, ratings, and articles — boosting CTR.',
      affectedUrls: allUrls,
      howToFix: 'Add JSON-LD structured data for your content type (Article, Product, LocalBusiness, FAQPage, etc.). Use Schema.org or Google\'s structured data generator.',
      estimatedImpact: 'high',
    })
  } else if (noJsonLd.length > 0) {
    add({
      id: 'inconsistent-schema',
      category: 'seo', severity: 'warning',
      title: 'Inconsistent structured data coverage',
      description: 'Some pages have schema markup while others don\'t. Consistent schema across all pages maximizes rich-result eligibility.',
      affectedUrls: noJsonLd.map((p) => p.url),
      howToFix: 'Add appropriate JSON-LD to the pages that are missing it. Match the type to the content (Article for blog posts, Product for products, etc.).',
      estimatedImpact: 'medium',
    })
  }

  const noOg = pages.filter((p) => !p.hasOgTags)
  if (noOg.length) {
    add({
      id: 'missing-og-tags',
      category: 'seo', severity: 'warning',
      title: 'Pages missing Open Graph tags',
      description: 'OG tags control how URLs render when shared on Facebook, LinkedIn, Slack, etc. Missing them produces unattractive previews.',
      affectedUrls: noOg.map((p) => p.url),
      howToFix: 'Add og:title, og:description, og:image, and og:url meta tags to the <head> of every page.',
      estimatedImpact: 'medium',
    })
  }

  const noFavicon = pages.filter((p) => !p.hasFavicon)
  if (noFavicon.length === pages.length) {
    add({
      id: 'no-favicon',
      category: 'technical', severity: 'info',
      title: 'No favicon detected',
      description: 'Favicons appear in browser tabs and bookmarks. They\'re a basic trust signal.',
      affectedUrls: allUrls,
      howToFix: 'Add <link rel="icon" href="/favicon.ico"> to the <head>. Use a 32×32 PNG or ICO file.',
      estimatedImpact: 'low',
    })
  }

  const slowPages = pages.filter((p) => p.loadTimeMs > 3000)
  if (slowPages.length) {
    add({
      id: 'slow-pages',
      category: 'performance', severity: 'warning',
      title: `${slowPages.length} pages load in over 3 seconds`,
      description: 'Slow pages hurt Core Web Vitals (LCP), reduce conversions, and frustrate users. 53% of mobile users abandon pages that take over 3s.',
      affectedUrls: slowPages.map((p) => p.url),
      howToFix: 'Compress images, enable browser caching, use a CDN, minify JS/CSS, remove unused JavaScript, and defer non-critical scripts.',
      estimatedImpact: 'high',
    })
  }

  const heavyPages = pages.filter((p) => p.byteSize > 2_000_000)
  if (heavyPages.length) {
    add({
      id: 'heavy-pages',
      category: 'performance', severity: 'warning',
      title: `${heavyPages.length} pages exceed 2MB in HTML weight`,
      description: 'Heavy pages waste mobile data and slow rendering, especially on 3G/4G connections.',
      affectedUrls: heavyPages.map((p) => p.url),
      howToFix: 'Convert images to WebP, lazy-load below-the-fold images, remove unused CSS/JS, and consider server-side rendering for repeated content.',
      estimatedImpact: 'medium',
    })
  }

  const thinContent = pages.filter((p) => p.wordCount < 300 && p.wordCount > 0)
  if (thinContent.length) {
    add({
      id: 'thin-content',
      category: 'content', severity: 'warning',
      title: `${thinContent.length} pages have thin content (<300 words)`,
      description: 'Thin content rarely ranks well because Google can\'t determine relevance. The Helpful Content update penalizes low-value pages.',
      affectedUrls: thinContent.map((p) => p.url),
      howToFix: 'Expand each page to at least 600–1000 words of genuinely useful content. Add examples, data, and answers to related searches.',
      estimatedImpact: 'high',
    })
  }

  const lowInternal = pages.filter((p) => p.internalLinks < 3)
  if (lowInternal.length === pages.length && pages.length > 1) {
    add({
      id: 'low-internal-linking',
      category: 'seo', severity: 'warning',
      title: 'Weak internal linking across the site',
      description: 'Internal links pass PageRank and help Google discover and contextualize pages. Most pages have fewer than 3 internal links.',
      affectedUrls: lowInternal.map((p) => p.url),
      howToFix: 'Add 3–7 contextual internal links per page to related content. Use descriptive anchor text containing target keywords.',
      estimatedImpact: 'medium',
    })
  }

  return issues
}

// ── Scoring ────────────────────────────────────────────────────────────────

function calcScores(pages: PageMetrics[], issues: Issue[], hasRobotsTxt: boolean, hasSitemap: boolean, isHttps: boolean): AuditScore {
  const cat: Record<IssueCategory, { critical: number; warning: number; info: number }> = {
    seo:           { critical: 0, warning: 0, info: 0 },
    performance:   { critical: 0, warning: 0, info: 0 },
    accessibility: { critical: 0, warning: 0, info: 0 },
    technical:     { critical: 0, warning: 0, info: 0 },
    content:       { critical: 0, warning: 0, info: 0 },
    mobile:        { critical: 0, warning: 0, info: 0 },
  }
  for (const i of issues) cat[i.category][i.severity]++

  function score(c: IssueCategory): number {
    const x = cat[c]
    let s = 100
    s -= x.critical * 18
    s -= x.warning * 7
    s -= x.info * 2
    return Math.max(0, Math.min(100, s))
  }

  const seo           = score('seo')
  const performance   = score('performance')
  const accessibility = score('accessibility')
  const technical     = score('technical')
  const content       = score('content')
  const mobile        = score('mobile')

  const overall = Math.round((seo + performance + accessibility + technical + content + mobile) / 6)

  return { overall, seo, performance, accessibility, technical, mobile, content }
}

// ── Main handler ───────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required.' }, { status: 400 })
    }

    const normalized = normalizeUrl(url)
    let baseUrl: URL
    try { baseUrl = new URL(normalized) }
    catch { return NextResponse.json({ error: 'Invalid URL.' }, { status: 400 }) }

    // ── Fetch homepage ──
    const home = await fetchHtml(normalized, 15000)
    if (!home) {
      return NextResponse.json(
        { error: 'Could not reach the site. Check the URL and that the site is publicly accessible.' },
        { status: 502 },
      )
    }

    const finalUrl = home.finalUrl
    const finalBase = new URL(finalUrl)
    const isHttps = finalBase.protocol === 'https:'

    // ── robots.txt + sitemap ──
    const robotsTxt = await fetchText(`${finalBase.origin}/robots.txt`)
    const hasRobotsTxt = !!robotsTxt
    const sitemapUrls: string[] = []
    if (robotsTxt) {
      const matches = robotsTxt.match(/Sitemap:\s*(\S+)/gi) ?? []
      matches.forEach((m) => sitemapUrls.push(m.replace(/Sitemap:\s*/i, '').trim()))
    }
    if (sitemapUrls.length === 0) sitemapUrls.push(`${finalBase.origin}/sitemap.xml`)

    let sitemapXml: string | null = null
    for (const sm of sitemapUrls) {
      const text = await fetchText(sm, 6000)
      if (text && text.includes('<urlset') || text?.includes('<sitemapindex')) {
        sitemapXml = text
        break
      }
    }
    const hasSitemap = !!sitemapXml

    // ── Discover pages: sitemap first, fall back to homepage links ──
    let pageUrls: string[]
    if (sitemapXml) {
      pageUrls = await discoverFromSitemap(sitemapXml, 15)
      if (!pageUrls.includes(finalUrl)) pageUrls.unshift(finalUrl)
    } else {
      pageUrls = [finalUrl, ...discoverLinks(home.html, finalBase, 14)]
    }
    pageUrls = pageUrls.slice(0, 15)

    // ── Crawl all discovered pages (concurrent) ──
    const homepageMetrics = analyzeHtml(finalUrl, home.html, home.status, home.loadTimeMs, home.byteSize, finalBase.host)

    const otherUrls = pageUrls.filter((u) => u !== finalUrl)
    const otherPagesResults = await Promise.all(
      otherUrls.map(async (u) => {
        const r = await fetchHtml(u, 10000)
        if (!r) return null
        return analyzeHtml(u, r.html, r.status, r.loadTimeMs, r.byteSize, finalBase.host)
      }),
    )
    const allPages: PageMetrics[] = [homepageMetrics, ...otherPagesResults.filter((p): p is PageMetrics => p !== null)]

    // ── Derive issues + scores ──
    const issues = deriveIssues(allPages, hasRobotsTxt, hasSitemap, isHttps)
    const scores = calcScores(allPages, issues, hasRobotsTxt, hasSitemap, isHttps)
    const averageLoadTimeMs = Math.round(allPages.reduce((s, p) => s + p.loadTimeMs, 0) / allPages.length)
    const totalPageWeight = allPages.reduce((s, p) => s + p.byteSize, 0)

    // ── GPT-generated summary + top recommendations ──
    let summary = ''
    let topRecommendations: string[] = []
    try {
      const issuesSummary = issues
        .slice(0, 20)
        .map((i) => `[${i.severity.toUpperCase()}] [${i.category}] ${i.title} (${i.affectedCount} pages)`)
        .join('\n')

      const { text: gptText } = await generateText({
        model: openai('gpt-4o-mini'),
        system: 'You are a senior technical SEO consultant. Respond with ONLY a valid JSON object — no markdown, no code fences.',
        prompt: `Site audit results for ${finalUrl}:
- Pages crawled: ${allPages.length}
- Overall score: ${scores.overall}/100
- HTTPS: ${isHttps ? 'yes' : 'NO'}
- robots.txt: ${hasRobotsTxt ? 'yes' : 'NO'}
- Sitemap: ${hasSitemap ? 'yes' : 'NO'}
- Avg load time: ${averageLoadTimeMs}ms
- Total issues: ${issues.length} (${issues.filter((i) => i.severity === 'critical').length} critical, ${issues.filter((i) => i.severity === 'warning').length} warnings)

Top issues:
${issuesSummary}

Return ONLY this JSON:
{
  "summary": "<3-4 sentence executive summary of site health and biggest blockers>",
  "topRecommendations": ["<concrete action 1>", "<concrete action 2>", "<concrete action 3>", "<concrete action 4>", "<concrete action 5>"]
}`,
        maxOutputTokens: 600,
      })
      const stripped = gptText.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim()
      const start = stripped.indexOf('{')
      const end = stripped.lastIndexOf('}')
      if (start !== -1 && end !== -1) {
        const parsed = JSON.parse(stripped.slice(start, end + 1))
        if (typeof parsed.summary === 'string') summary = parsed.summary
        if (Array.isArray(parsed.topRecommendations)) topRecommendations = parsed.topRecommendations.slice(0, 6)
      }
    } catch (e) {
      console.error('[site-audit] GPT summary failed:', e)
    }

    if (!summary) {
      summary = `Audited ${allPages.length} pages on ${finalBase.host}. Overall score: ${scores.overall}/100. Found ${issues.filter((i) => i.severity === 'critical').length} critical issues and ${issues.filter((i) => i.severity === 'warning').length} warnings to address.`
    }
    if (topRecommendations.length === 0) {
      topRecommendations = issues.slice(0, 5).map((i) => i.howToFix)
    }

    const result: SiteAuditResult = {
      inputUrl: normalized,
      finalUrl,
      domain: finalBase.host,
      pagesCrawled: allPages.length,
      isHttps,
      hasRobotsTxt,
      hasSitemap,
      sitemapUrlCount: sitemapXml ? (sitemapXml.match(/<loc>/g)?.length ?? 0) : 0,
      scores,
      issues,
      pages: allPages,
      summary,
      topRecommendations,
      averageLoadTimeMs,
      totalPageWeight,
      generatedAt: new Date().toISOString(),
    }

    return NextResponse.json(result)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[site-audit] Error:', message)
    return NextResponse.json({ error: `Audit failed: ${message}` }, { status: 500 })
  }
}

export type { SiteAuditResult, Issue, PageMetrics, AuditScore, IssueSeverity, IssueCategory }
