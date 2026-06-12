import * as cheerio from 'cheerio'
import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 90

const USER_AGENT =
  'Mozilla/5.0 (compatible; AiRankoBot/1.0; +https://airanko.com/bot)'

// ── Types ──────────────────────────────────────────────────────────────────

export interface SitemapPage {
  url: string
  path: string
  title: string | null
  description: string | null
  lastModified: string | null
  category: string
  depth: number
}

export interface SitemapCategory {
  name: string
  slug: string
  pages: SitemapPage[]
}

export interface HtmlSitemapResult {
  inputUrl: string
  domain: string
  pageCount: number
  source: 'sitemap.xml' | 'crawl' | 'manual'
  categories: SitemapCategory[]
  pages: SitemapPage[]
  generatedAt: string
}

// ── Helpers ────────────────────────────────────────────────────────────────

function normalizeUrl(input: string): string {
  let url = input.trim()
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`
  return url
}

async function fetchText(url: string, timeoutMs = 8000): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'text/html,application/xhtml+xml,application/xml' },
      redirect: 'follow',
      signal: AbortSignal.timeout(timeoutMs),
    })
    if (!res.ok) return null
    return await res.text()
  } catch { return null }
}

async function fetchHtml(url: string, timeoutMs = 8000) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'text/html,application/xhtml+xml' },
      redirect: 'follow',
      signal: AbortSignal.timeout(timeoutMs),
    })
    return {
      html: await res.text(),
      status: res.status,
      finalUrl: res.url || url,
    }
  } catch { return null }
}

// ── Sitemap.xml parsing ────────────────────────────────────────────────────

function parseSitemapXml(xml: string): { url: string; lastmod: string | null }[] {
  const results: { url: string; lastmod: string | null }[] = []
  const urlMatches = xml.matchAll(/<url>([\s\S]*?)<\/url>/g)
  for (const m of urlMatches) {
    const block = m[1]
    const loc = block.match(/<loc>(.*?)<\/loc>/)?.[1]?.trim()
    const lastmod = block.match(/<lastmod>(.*?)<\/lastmod>/)?.[1]?.trim() ?? null
    if (loc) results.push({ url: loc, lastmod })
  }
  // Fallback: standalone <loc> tags in sitemap index
  if (results.length === 0) {
    const locOnly = xml.matchAll(/<loc>(.*?)<\/loc>/g)
    for (const m of locOnly) {
      results.push({ url: m[1].trim(), lastmod: null })
    }
  }
  return results
}

// ── Recursive sitemap index resolution ─────────────────────────────────────

async function resolveSitemap(url: string, maxPages: number, visited = new Set<string>()): Promise<{ url: string; lastmod: string | null }[]> {
  if (visited.has(url)) return []
  visited.add(url)
  const xml = await fetchText(url, 8000)
  if (!xml) return []

  const isIndex = /<sitemapindex/i.test(xml)
  if (isIndex) {
    const childMatches = xml.matchAll(/<sitemap>([\s\S]*?)<\/sitemap>/g)
    const children: string[] = []
    for (const m of childMatches) {
      const loc = m[1].match(/<loc>(.*?)<\/loc>/)?.[1]?.trim()
      if (loc) children.push(loc)
    }
    const all: { url: string; lastmod: string | null }[] = []
    for (const child of children.slice(0, 10)) {
      if (all.length >= maxPages) break
      const childResults = await resolveSitemap(child, maxPages - all.length, visited)
      all.push(...childResults)
    }
    return all
  }

  return parseSitemapXml(xml)
}

// ── Crawl fallback ─────────────────────────────────────────────────────────

function extractInternalLinks(html: string, baseUrl: URL): string[] {
  const $ = cheerio.load(html)
  const found = new Set<string>()
  $('a[href]').each((_: number, el) => {
    const href = $(el).attr('href') || ''
    if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) return
    try {
      const u = new URL(href, baseUrl)
      if (u.host !== baseUrl.host) return
      if (/\.(pdf|zip|jpg|jpeg|png|gif|svg|webp|mp4|mp3|css|js|xml|ico)(\?|$)/i.test(u.pathname)) return
      u.hash = ''
      u.search = ''
      found.add(u.toString())
    } catch { /* ignore */ }
  })
  return Array.from(found)
}

async function crawlSite(startUrl: string, maxPages: number, maxDepth: number): Promise<string[]> {
  const startUrlObj = new URL(startUrl)
  const visited = new Set<string>([startUrl])
  const queue: { url: string; depth: number }[] = [{ url: startUrl, depth: 0 }]
  const collected: string[] = [startUrl]

  while (queue.length > 0 && collected.length < maxPages) {
    const { url, depth } = queue.shift()!
    if (depth >= maxDepth) continue

    const result = await fetchHtml(url, 8000)
    if (!result) continue

    const links = extractInternalLinks(result.html, startUrlObj)
    for (const link of links) {
      if (visited.has(link)) continue
      visited.add(link)
      collected.push(link)
      if (collected.length >= maxPages) break
      if (depth + 1 < maxDepth) queue.push({ url: link, depth: depth + 1 })
    }
  }

  return collected.slice(0, maxPages)
}

// ── Page metadata extraction ───────────────────────────────────────────────

async function extractPageMeta(url: string): Promise<{ title: string | null; description: string | null }> {
  const result = await fetchHtml(url, 6000)
  if (!result) return { title: null, description: null }
  const $ = cheerio.load(result.html)
  return {
    title: $('title').first().text().trim() || null,
    description:
      $('meta[name="description"]').attr('content')?.trim() ||
      $('meta[property="og:description"]').attr('content')?.trim() ||
      null,
  }
}

// ── Category inference from URL path ───────────────────────────────────────

function categorizeUrl(url: string, baseHost: string): { category: string; depth: number } {
  try {
    const u = new URL(url)
    const segments = u.pathname.split('/').filter(Boolean)
    if (segments.length === 0) return { category: 'Home', depth: 0 }

    const first = segments[0]
    const cleaned = first
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())

    return { category: cleaned, depth: segments.length }
  } catch {
    return { category: 'Other', depth: 0 }
  }
}

// ── Main handler ───────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const url: string = body.url
    const maxPages: number = Math.max(5, Math.min(100, body.maxPages ?? 50))
    const maxDepth: number = Math.max(1, Math.min(5, body.maxDepth ?? 3))
    const sourceMode: 'auto' | 'sitemap' | 'crawl' = body.sourceMode ?? 'auto'
    const includeMeta: boolean = body.includeMeta ?? true

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required.' }, { status: 400 })
    }

    const normalized = normalizeUrl(url)
    let baseUrl: URL
    try { baseUrl = new URL(normalized) }
    catch { return NextResponse.json({ error: 'Invalid URL.' }, { status: 400 }) }

    // ── Verify site is reachable ──
    const home = await fetchHtml(normalized, 12000)
    if (!home) {
      return NextResponse.json(
        { error: 'Could not reach the site. Check the URL and that the site is publicly accessible.' },
        { status: 502 },
      )
    }

    const finalUrl = home.finalUrl
    const finalBase = new URL(finalUrl)

    // ── Discover URLs ──
    let discoveredUrls: { url: string; lastmod: string | null }[] = []
    let source: 'sitemap.xml' | 'crawl' = 'crawl'

    if (sourceMode === 'sitemap' || sourceMode === 'auto') {
      // Try robots.txt first for sitemap location
      const robotsTxt = await fetchText(`${finalBase.origin}/robots.txt`, 5000)
      const sitemapUrls: string[] = []
      if (robotsTxt) {
        const matches = robotsTxt.match(/Sitemap:\s*(\S+)/gi) ?? []
        matches.forEach((m) => sitemapUrls.push(m.replace(/Sitemap:\s*/i, '').trim()))
      }
      if (sitemapUrls.length === 0) sitemapUrls.push(`${finalBase.origin}/sitemap.xml`)

      for (const sm of sitemapUrls) {
        const fromSitemap = await resolveSitemap(sm, maxPages)
        if (fromSitemap.length > 0) {
          discoveredUrls = fromSitemap.slice(0, maxPages)
          source = 'sitemap.xml'
          break
        }
      }
    }

    if (discoveredUrls.length === 0 && (sourceMode === 'crawl' || sourceMode === 'auto')) {
      const crawled = await crawlSite(finalUrl, maxPages, maxDepth)
      discoveredUrls = crawled.map((u) => ({ url: u, lastmod: null }))
      source = 'crawl'
    }

    if (discoveredUrls.length === 0) {
      return NextResponse.json(
        { error: 'No pages discovered. Try a different source mode or a larger max-pages value.' },
        { status: 404 },
      )
    }

    // ── Extract metadata (titles + descriptions) — concurrent, limited ──
    const pageMetas = new Map<string, { title: string | null; description: string | null }>()
    if (includeMeta) {
      // Limit concurrent fetches — be polite
      const batchSize = 8
      for (let i = 0; i < discoveredUrls.length; i += batchSize) {
        const batch = discoveredUrls.slice(i, i + batchSize)
        const metas = await Promise.all(
          batch.map(async (entry) => ({
            url: entry.url,
            meta: await extractPageMeta(entry.url),
          })),
        )
        for (const m of metas) {
          pageMetas.set(m.url, m.meta)
        }
      }
    }

    // ── Build page list with categories ──
    const pages: SitemapPage[] = discoveredUrls.map((entry) => {
      let pathStr = '/'
      try { pathStr = new URL(entry.url).pathname }
      catch { /* keep '/' */ }
      const meta = pageMetas.get(entry.url) ?? { title: null, description: null }
      const { category, depth } = categorizeUrl(entry.url, finalBase.host)
      return {
        url: entry.url,
        path: pathStr,
        title: meta.title,
        description: meta.description,
        lastModified: entry.lastmod,
        category,
        depth,
      }
    })

    // ── Group by category ──
    const categoryMap = new Map<string, SitemapPage[]>()
    for (const p of pages) {
      if (!categoryMap.has(p.category)) categoryMap.set(p.category, [])
      categoryMap.get(p.category)!.push(p)
    }

    const categories: SitemapCategory[] = Array.from(categoryMap.entries())
      .map(([name, pgs]) => ({
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        pages: pgs.sort((a, b) => a.path.localeCompare(b.path)),
      }))
      .sort((a, b) => {
        // Home first, then alphabetical
        if (a.name === 'Home') return -1
        if (b.name === 'Home') return 1
        return a.name.localeCompare(b.name)
      })

    const result: HtmlSitemapResult = {
      inputUrl: normalized,
      domain: finalBase.host,
      pageCount: pages.length,
      source,
      categories,
      pages,
      generatedAt: new Date().toISOString(),
    }

    return NextResponse.json(result)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[html-sitemap-generator] Error:', message)
    return NextResponse.json(
      { error: `Generation failed: ${message}` },
      { status: 500 },
    )
  }
}
