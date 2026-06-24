import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

export const maxDuration = 60

const UA = 'Mozilla/5.0 (compatible; AiRankoBot/1.0; +https://airanko.com)'

type ChangeFreq = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'

interface SitemapUrl {
  loc: string
  lastmod?: string
  changefreq?: ChangeFreq
  priority?: string
  images?: { loc: string; title?: string; caption?: string }[]
}

interface GeneratorResult {
  sitemapXml: string
  urlCount: number
  imageCount: number
  crawledPages: { url: string; title: string; status: number }[]
  errors: string[]
  usedSitemapXml: boolean
  isSitemapIndex: boolean
}

const DEFAULT_TIMEOUT = 10_000

async function fetchPage(url: string): Promise<{ html: string; status: number; finalUrl: string }> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), DEFAULT_TIMEOUT)
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' },
      redirect: 'follow',
      signal: ctrl.signal,
    })
    clearTimeout(timer)
    const html = await res.text()
    return { html, status: res.status, finalUrl: res.url }
  } catch {
    clearTimeout(timer)
    return { html: '', status: 0, finalUrl: url }
  }
}

function normalizeUrl(href: string, base: string): string | null {
  try {
    const resolved = new URL(href, base)
    resolved.hash = ''
    // remove trailing slash for comparison but keep root
    const h = resolved.href.replace(/\/$/, '') || resolved.href
    return h
  } catch {
    return null
  }
}

function isSameOrigin(url: string, origin: string): boolean {
  try {
    return new URL(url).origin === origin
  } catch {
    return false
  }
}

function isSkippable(url: string): boolean {
  const ext = url.split('?')[0].split('#')[0].split('.').pop()?.toLowerCase() ?? ''
  const skipExt = ['pdf','doc','docx','xls','xlsx','zip','rar','tar','gz','mp4','mp3','avi','mov','wmv','flv','webm','ogg','wav','exe','dmg','pkg','deb','rpm','jpg','jpeg','png','gif','webp','svg','ico','bmp','tiff','woff','woff2','ttf','eot','otf']
  return skipExt.includes(ext)
}

function extractImages(html: string, baseUrl: string): SitemapUrl['images'] {
  const $ = cheerio.load(html)
  const images: SitemapUrl['images'] = []
  $('img').each((_, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src')
    if (!src) return
    const loc = normalizeUrl(src, baseUrl)
    if (!loc) return
    const title = $(el).attr('title') || $(el).attr('alt') || undefined
    images.push({ loc, title })
  })
  return images
}

function extractLinks(html: string, baseUrl: string): string[] {
  const $ = cheerio.load(html)
  const links: string[] = []
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') ?? ''
    if (!href || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return
    const norm = normalizeUrl(href, baseUrl)
    if (norm) links.push(norm)
  })
  return links
}

async function tryParseSitemapXml(
  sitemapUrl: string,
  maxPages: number,
  includeImages: boolean,
  changeFreq: ChangeFreq,
  priority: string,
  includeLastMod: boolean,
): Promise<{ urls: SitemapUrl[]; isSitemapIndex: boolean } | null> {
  const { html: xml, status } = await fetchPage(sitemapUrl)
  if (status === 0 || status === 404 || !xml.trim()) return null

  const $ = cheerio.load(xml, { xmlMode: true })

  // Sitemap index
  if ($('sitemapindex').length > 0) {
    const childUrls: string[] = []
    $('sitemap loc').each((_, el) => {
      childUrls.push($(el).text().trim())
    })
    const collected: SitemapUrl[] = []
    for (const childUrl of childUrls.slice(0, 5)) {
      const child = await tryParseSitemapXml(childUrl, maxPages - collected.length, includeImages, changeFreq, priority, includeLastMod)
      if (child) collected.push(...child.urls)
      if (collected.length >= maxPages) break
    }
    return { urls: collected.slice(0, maxPages), isSitemapIndex: true }
  }

  // Regular urlset
  if ($('urlset').length > 0 || $('url').length > 0) {
    const urls: SitemapUrl[] = []
    $('url').each((_, el) => {
      if (urls.length >= maxPages) return false
      const loc = $('loc', el).first().text().trim()
      if (!loc) return
      const lastmod = includeLastMod ? ($('lastmod', el).first().text().trim() || new Date().toISOString().split('T')[0]) : undefined
      const entry: SitemapUrl = {
        loc,
        changefreq: changeFreq,
        priority,
        lastmod,
        images: [],
      }
      if (includeImages) {
        $('image\\:image', el).each((_, imgEl) => {
          const imgLoc = $('image\\:loc', imgEl).first().text().trim()
          const imgTitle = $('image\\:title', imgEl).first().text().trim() || undefined
          if (imgLoc) entry.images!.push({ loc: imgLoc, title: imgTitle })
        })
      }
      urls.push(entry)
    })
    return { urls, isSitemapIndex: false }
  }

  return null
}

async function crawlSite(
  startUrl: string,
  maxPages: number,
  crawlDepth: number,
  includeImages: boolean,
  changeFreq: ChangeFreq,
  priority: string,
  includeLastMod: boolean,
  excludePatterns: string[],
): Promise<{ urls: SitemapUrl[]; pages: { url: string; title: string; status: number }[]; errors: string[] }> {
  const origin = new URL(startUrl).origin
  const visited = new Set<string>()
  const queue: { url: string; depth: number }[] = [{ url: startUrl, depth: 0 }]
  const urls: SitemapUrl[] = []
  const pages: { url: string; title: string; status: number }[] = []
  const errors: string[] = []

  const today = new Date().toISOString().split('T')[0]

  while (queue.length > 0 && urls.length < maxPages) {
    const item = queue.shift()!
    const { url, depth } = item

    const norm = normalizeUrl(url, url) ?? url
    if (visited.has(norm)) continue
    visited.add(norm)

    if (!isSameOrigin(norm, origin)) continue
    if (isSkippable(norm)) continue
    if (excludePatterns.some((p) => norm.includes(p))) continue

    const { html, status, finalUrl } = await fetchPage(norm)
    if (status === 0) {
      errors.push(`Failed to fetch: ${norm}`)
      continue
    }

    const $ = cheerio.load(html)
    const title = $('title').first().text().trim() || norm

    pages.push({ url: norm, title, status })

    const images: SitemapUrl['images'] = includeImages ? extractImages(html, finalUrl) : []

    urls.push({
      loc: norm,
      lastmod: includeLastMod ? today : undefined,
      changefreq: changeFreq,
      priority,
      images,
    })

    if (depth < crawlDepth) {
      const links = extractLinks(html, finalUrl)
      for (const link of links) {
        if (!visited.has(link) && isSameOrigin(link, origin) && !isSkippable(link)) {
          queue.push({ url: link, depth: depth + 1 })
        }
      }
    }
  }

  return { urls, pages, errors }
}

function buildXml(urls: SitemapUrl[], includeImages: boolean): string {
  const hasImages = includeImages && urls.some((u) => (u.images?.length ?? 0) > 0)

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"`
  if (hasImages) {
    xml += `\n        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"`
  }
  xml += `>\n`

  for (const u of urls) {
    xml += `  <url>\n`
    xml += `    <loc>${escapeXml(u.loc)}</loc>\n`
    if (u.lastmod) xml += `    <lastmod>${u.lastmod}</lastmod>\n`
    if (u.changefreq) xml += `    <changefreq>${u.changefreq}</changefreq>\n`
    if (u.priority) xml += `    <priority>${u.priority}</priority>\n`
    if (includeImages && u.images?.length) {
      for (const img of u.images) {
        xml += `    <image:image>\n`
        xml += `      <image:loc>${escapeXml(img.loc)}</image:loc>\n`
        if (img.title) xml += `      <image:title>${escapeXml(img.title)}</image:title>\n`
        if (img.caption) xml += `      <image:caption>${escapeXml(img.caption)}</image:caption>\n`
        xml += `    </image:image>\n`
      }
    }
    xml += `  </url>\n`
  }

  xml += `</urlset>`
  return xml
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      url,
      maxPages = 100,
      changeFreq = 'monthly',
      priority = '0.8',
      includeImages = false,
      includeLastMod = true,
      crawlDepth = 2,
      excludePatterns = '',
    } = body

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    let parsedOrigin: string
    try {
      parsedOrigin = new URL(url).origin
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
    }

    const safeMaxPages = Math.min(Math.max(parseInt(String(maxPages), 10) || 100, 10), 500)
    const safeDepth = Math.min(Math.max(parseInt(String(crawlDepth), 10) || 2, 1), 4)
    const excludeList: string[] = excludePatterns
      ? String(excludePatterns).split(',').map((s: string) => s.trim()).filter(Boolean)
      : []

    const sitemapXmlUrl = `${parsedOrigin}/sitemap.xml`
    let sitemapUrls: SitemapUrl[] = []
    let isSitemapIndex = false
    let usedSitemapXml = false
    let crawledPages: { url: string; title: string; status: number }[] = []
    const errors: string[] = []

    const sitemapResult = await tryParseSitemapXml(
      sitemapXmlUrl,
      safeMaxPages,
      includeImages,
      changeFreq as ChangeFreq,
      priority,
      includeLastMod,
    )

    if (sitemapResult && sitemapResult.urls.length > 0) {
      sitemapUrls = sitemapResult.urls
      isSitemapIndex = sitemapResult.isSitemapIndex
      usedSitemapXml = true
      crawledPages = sitemapUrls.map((u) => ({ url: u.loc, title: u.loc, status: 200 }))
    } else {
      const crawlResult = await crawlSite(
        url,
        safeMaxPages,
        safeDepth,
        includeImages,
        changeFreq as ChangeFreq,
        priority,
        includeLastMod,
        excludeList,
      )
      sitemapUrls = crawlResult.urls
      crawledPages = crawlResult.pages
      errors.push(...crawlResult.errors)
    }

    const imageCount = sitemapUrls.reduce((acc, u) => acc + (u.images?.length ?? 0), 0)
    const sitemapXml = buildXml(sitemapUrls, includeImages)

    const result: GeneratorResult = {
      sitemapXml,
      urlCount: sitemapUrls.length,
      imageCount,
      crawledPages,
      errors,
      usedSitemapXml,
      isSitemapIndex,
    }

    return NextResponse.json(result)
  } catch (err) {
    console.error('XML sitemap generator error:', err)
    return NextResponse.json({ error: 'Generation failed. Please try again.' }, { status: 500 })
  }
}
