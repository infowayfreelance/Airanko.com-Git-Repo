import { NextRequest } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 300
export const dynamic = 'force-dynamic'

export interface ExtractedLink {
  href: string
  text: string
  type: 'internal' | 'external' | 'mailto' | 'tel' | 'anchor' | 'file'
  rel: string | null
  target: string | null
  isNofollow: boolean
  domain: string
}

export interface CrawledLink extends ExtractedLink {
  foundOn: string[]
  occurrences: number
  firstSeenDepth: number
}

export interface CrawledPage {
  url: string
  status: 'success' | 'error'
  statusCode?: number
  error?: string
  title?: string
  linksFound: number
  depth: number
}

export interface CrawlResult {
  url: string
  finalUrl: string
  status: 'success' | 'error'
  error?: string
  rootTitle?: string
  pagesCrawled: number
  pagesFailed: number
  totalOccurrences: number
  uniqueLinks: number
  internalCount: number
  externalCount: number
  nofollowCount: number
  fileCount: number
  emailCount: number
  phoneCount: number
  domains: string[]
  pages: CrawledPage[]
  links: CrawledLink[]
  sitemapUrlsFound: number
  durationMs: number
}

export type StreamEvent =
  | { type: 'start'; rootUrl: string; finalUrl: string; rootTitle?: string }
  | { type: 'sitemap'; found: number }
  | {
      type: 'progress'
      crawled: number
      queued: number
      uniqueLinks: number
      currentUrl: string
    }
  | {
      type: 'page'
      url: string
      status: 'success' | 'error'
      statusCode?: number
      error?: string
      title?: string
      linksFound: number
      depth: number
    }
  | { type: 'complete'; result: CrawlResult }
  | { type: 'fatal'; error: string }

const DEFAULT_MAX_PAGES = 100
const HARD_MAX_PAGES = 500
const DEFAULT_MAX_DEPTH = 3
const HARD_MAX_DEPTH = 6
const PER_PAGE_TIMEOUT_MS = 12000
const CONCURRENCY = 5
const MAX_BYTES_PER_PAGE = 3 * 1024 * 1024

const FILE_EXTS = new Set([
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
  'zip', 'rar', '7z', 'tar', 'gz',
  'mp3', 'mp4', 'mov', 'avi', 'wav', 'm4a',
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico',
  'csv', 'json', 'xml', 'txt',
])

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
}

function stripTags(s: string): string {
  return s.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function classifyLink(href: string, baseHost: string): ExtractedLink['type'] {
  const lower = href.toLowerCase().trim()
  if (lower.startsWith('mailto:')) return 'mailto'
  if (lower.startsWith('tel:')) return 'tel'
  if (lower.startsWith('#')) return 'anchor'
  const fileExt = lower.split('?')[0].split('#')[0].split('.').pop() || ''
  try {
    const u = new URL(href)
    if (FILE_EXTS.has(fileExt)) return 'file'
    return u.host === baseHost ? 'internal' : 'external'
  } catch {
    return 'internal'
  }
}

function normalizeUrl(href: string): string {
  try {
    const u = new URL(href)
    u.hash = ''
    // Strip common tracking params for de-duplication
    const drop = [
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
      'fbclid', 'gclid', 'mc_cid', 'mc_eid', 'ref', 'ref_src',
    ]
    drop.forEach((k) => u.searchParams.delete(k))
    let s = u.toString()
    if (s.endsWith('/') && u.pathname !== '/') s = s.slice(0, -1)
    return s
  } catch {
    return href
  }
}

async function fetchWithTimeout(
  url: string,
  ms: number,
  accept = 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), ms)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; AiRankoBot/1.0; +https://airanko.com/bot)',
        Accept: accept,
        'Accept-Language': 'en-US,en;q=0.5',
      },
      redirect: 'follow',
    })
    return res
  } finally {
    clearTimeout(timeout)
  }
}

async function readBoundedText(res: Response): Promise<string> {
  const reader = res.body?.getReader()
  if (!reader) return ''
  const decoder = new TextDecoder()
  let out = ''
  let total = 0
  while (total < MAX_BYTES_PER_PAGE) {
    const { done, value } = await reader.read()
    if (done) break
    out += decoder.decode(value, { stream: true })
    total += value.byteLength
  }
  try {
    reader.cancel()
  } catch {}
  return out
}

interface AnchorParsed {
  href: string
  text: string
  rel: string | null
  target: string | null
}

function parseAnchors(html: string): AnchorParsed[] {
  const out: AnchorParsed[] = []
  const re = /<a\b([^>]*?)>([\s\S]*?)<\/a\s*>/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(html)) !== null) {
    const attrs = m[1]
    const inner = m[2]
    const hrefMatch = attrs.match(/\bhref\s*=\s*["']([^"']*)["']/i)
    if (!hrefMatch) continue
    const rawHref = decodeEntities(hrefMatch[1]).trim()
    if (!rawHref) continue
    if (/^javascript:/i.test(rawHref)) continue
    const relMatch = attrs.match(/\brel\s*=\s*["']([^"']*)["']/i)
    const targetMatch = attrs.match(/\btarget\s*=\s*["']([^"']*)["']/i)
    out.push({
      href: rawHref,
      text: decodeEntities(stripTags(inner)) || '(no text)',
      rel: relMatch ? relMatch[1].trim() : null,
      target: targetMatch ? targetMatch[1].trim() : null,
    })
  }
  return out
}

function findBaseHref(html: string, fallback: string): string {
  const m = html.match(/<base[^>]+href=["']([^"']+)["'][^>]*>/i)
  if (!m) return fallback
  try {
    return new URL(m[1], fallback).toString()
  } catch {
    return fallback
  }
}

function findTitle(html: string): string | undefined {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  if (!m) return undefined
  return decodeEntities(stripTags(m[1])).slice(0, 300) || undefined
}

async function fetchSitemapUrls(origin: string): Promise<string[]> {
  const found = new Set<string>()
  const seenSitemaps = new Set<string>()

  const tryRobots = async (): Promise<string[]> => {
    try {
      const res = await fetchWithTimeout(`${origin}/robots.txt`, 6000, 'text/plain')
      if (!res.ok) return []
      const text = await res.text()
      const lines = text.split(/\r?\n/)
      const sitemaps: string[] = []
      for (const ln of lines) {
        const m = ln.match(/^\s*sitemap\s*:\s*(\S+)/i)
        if (m) sitemaps.push(m[1])
      }
      return sitemaps
    } catch {
      return []
    }
  }

  const parseSitemap = async (sitemapUrl: string, depth = 0): Promise<void> => {
    if (depth > 3) return
    if (seenSitemaps.has(sitemapUrl)) return
    seenSitemaps.add(sitemapUrl)
    try {
      const res = await fetchWithTimeout(
        sitemapUrl,
        8000,
        'application/xml,text/xml,*/*',
      )
      if (!res.ok) return
      const text = await readBoundedText(res)
      // Sitemap index?
      const isIndex = /<sitemapindex[\s>]/i.test(text)
      if (isIndex) {
        const childRe = /<sitemap>[\s\S]*?<loc>([^<]+)<\/loc>[\s\S]*?<\/sitemap>/gi
        let m: RegExpExecArray | null
        const children: string[] = []
        while ((m = childRe.exec(text)) !== null) {
          children.push(decodeEntities(m[1]).trim())
        }
        // Limit fan-out
        for (const c of children.slice(0, 20)) {
          await parseSitemap(c, depth + 1)
        }
      } else {
        const locRe = /<loc>([^<]+)<\/loc>/gi
        let m: RegExpExecArray | null
        while ((m = locRe.exec(text)) !== null) {
          const u = decodeEntities(m[1]).trim()
          if (u) found.add(u)
          if (found.size >= 1000) break
        }
      }
    } catch {
      // ignore
    }
  }

  const robotsSitemaps = await tryRobots()
  const candidates =
    robotsSitemaps.length > 0
      ? robotsSitemaps
      : [
          `${origin}/sitemap.xml`,
          `${origin}/sitemap_index.xml`,
          `${origin}/sitemap-index.xml`,
        ]
  for (const s of candidates) {
    await parseSitemap(s)
    if (found.size >= 1000) break
  }
  return Array.from(found)
}

interface CrawlOptions {
  maxPages: number
  maxDepth: number
  sameDomainOnly: boolean
  useSitemap: boolean
}

export async function POST(req: NextRequest) {
  let body: {
    url?: string
    maxPages?: number
    maxDepth?: number
    sameDomainOnly?: boolean
    useSitemap?: boolean
  } = {}
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const rawUrl = (body.url || '').trim()
  if (!rawUrl) {
    return new Response(JSON.stringify({ error: 'Provide a URL' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const opts: CrawlOptions = {
    maxPages: Math.min(
      Math.max(1, Math.floor(body.maxPages ?? DEFAULT_MAX_PAGES)),
      HARD_MAX_PAGES,
    ),
    maxDepth: Math.min(
      Math.max(0, Math.floor(body.maxDepth ?? DEFAULT_MAX_DEPTH)),
      HARD_MAX_DEPTH,
    ),
    sameDomainOnly: body.sameDomainOnly !== false,
    useSitemap: body.useSitemap !== false,
  }

  let normalized = rawUrl
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = 'https://' + normalized
  }
  let rootParsed: URL
  try {
    rootParsed = new URL(normalized)
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid URL' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const encoder = new TextEncoder()
  const startedAt = Date.now()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: StreamEvent) => {
        try {
          controller.enqueue(encoder.encode(JSON.stringify(event) + '\n'))
        } catch {
          // controller may be closed
        }
      }

      try {
        // Initial fetch of the seed URL
        let firstResp: Response
        try {
          firstResp = await fetchWithTimeout(normalized, PER_PAGE_TIMEOUT_MS)
        } catch (err) {
          send({
            type: 'fatal',
            error:
              err instanceof Error
                ? err.name === 'AbortError'
                  ? 'Initial request timed out'
                  : err.message
                : 'Failed to fetch the URL',
          })
          controller.close()
          return
        }

        if (!firstResp.ok) {
          send({
            type: 'fatal',
            error: `Initial request failed: HTTP ${firstResp.status} ${firstResp.statusText}`,
          })
          controller.close()
          return
        }

        const finalUrl = firstResp.url || normalized
        const finalParsed = (() => {
          try {
            return new URL(finalUrl)
          } catch {
            return rootParsed
          }
        })()
        const baseHost = finalParsed.host
        const origin = `${finalParsed.protocol}//${finalParsed.host}`

        const ct = firstResp.headers.get('content-type') || ''
        if (!ct.includes('text/html') && !ct.includes('xml')) {
          send({
            type: 'fatal',
            error: 'URL does not return an HTML page',
          })
          controller.close()
          return
        }

        const firstHtml = await readBoundedText(firstResp)
        const rootTitle = findTitle(firstHtml)

        send({ type: 'start', rootUrl: rawUrl, finalUrl, rootTitle })

        // Optional sitemap discovery
        let sitemapUrlsFound = 0
        let sitemapSeeds: string[] = []
        if (opts.useSitemap) {
          try {
            const sm = await fetchSitemapUrls(origin)
            sitemapSeeds = sm
            sitemapUrlsFound = sm.length
            send({ type: 'sitemap', found: sm.length })
          } catch {
            send({ type: 'sitemap', found: 0 })
          }
        } else {
          send({ type: 'sitemap', found: 0 })
        }

        // Crawl state
        type QueueItem = { url: string; depth: number }
        const visited = new Set<string>()
        const queued = new Set<string>()
        const queue: QueueItem[] = []

        const enqueue = (u: string, depth: number) => {
          const norm = normalizeUrl(u)
          if (queued.has(norm) || visited.has(norm)) return
          if (depth > opts.maxDepth) return
          try {
            const parsed = new URL(norm)
            if (opts.sameDomainOnly && parsed.host !== baseHost) return
            if (!/^https?:$/.test(parsed.protocol)) return
          } catch {
            return
          }
          queued.add(norm)
          queue.push({ url: norm, depth })
        }

        // Seed: root + sitemap pages (depth 0 or 1)
        enqueue(finalUrl, 0)
        for (const s of sitemapSeeds) {
          enqueue(s, 1)
        }

        const pages: CrawledPage[] = []
        const linkMap = new Map<string, CrawledLink>()
        let totalOccurrences = 0
        let pagesFailed = 0

        const processPage = async (item: QueueItem, html?: string) => {
          const { url: pageUrl, depth } = item
          visited.add(pageUrl)

          try {
            let pageHtml = html
            let statusCode: number | undefined
            if (!pageHtml) {
              const resp = await fetchWithTimeout(pageUrl, PER_PAGE_TIMEOUT_MS)
              statusCode = resp.status
              if (!resp.ok) {
                pages.push({
                  url: pageUrl,
                  status: 'error',
                  statusCode,
                  error: `HTTP ${resp.status}`,
                  linksFound: 0,
                  depth,
                })
                pagesFailed++
                send({
                  type: 'page',
                  url: pageUrl,
                  status: 'error',
                  statusCode,
                  error: `HTTP ${resp.status}`,
                  linksFound: 0,
                  depth,
                })
                return
              }
              const respCt = resp.headers.get('content-type') || ''
              if (!respCt.includes('text/html') && !respCt.includes('xml')) {
                pages.push({
                  url: pageUrl,
                  status: 'error',
                  statusCode,
                  error: 'Non-HTML content',
                  linksFound: 0,
                  depth,
                })
                pagesFailed++
                send({
                  type: 'page',
                  url: pageUrl,
                  status: 'error',
                  statusCode,
                  error: 'Non-HTML content',
                  linksFound: 0,
                  depth,
                })
                return
              }
              pageHtml = await readBoundedText(resp)
            }

            const baseForResolve = findBaseHref(pageHtml, pageUrl)
            const title = findTitle(pageHtml)
            const anchors = parseAnchors(pageHtml)

            let linksFound = 0
            for (const a of anchors) {
              let resolved = a.href
              if (
                !a.href.startsWith('mailto:') &&
                !a.href.startsWith('tel:') &&
                !a.href.startsWith('#')
              ) {
                try {
                  resolved = new URL(a.href, baseForResolve).toString()
                } catch {
                  resolved = a.href
                }
              }
              const norm = a.href.startsWith('mailto:') ||
                a.href.startsWith('tel:') ||
                a.href.startsWith('#')
                ? resolved
                : normalizeUrl(resolved)

              const type = classifyLink(norm, baseHost)
              let domain = ''
              try {
                domain = new URL(norm).host
              } catch {}

              const isNofollow = !!a.rel && /\bnofollow\b/i.test(a.rel)

              const existing = linkMap.get(norm)
              if (existing) {
                existing.occurrences++
                totalOccurrences++
                if (!existing.foundOn.includes(pageUrl)) {
                  existing.foundOn.push(pageUrl)
                }
              } else {
                linkMap.set(norm, {
                  href: norm,
                  text:
                    a.text.length > 300
                      ? a.text.slice(0, 300) + '…'
                      : a.text,
                  type,
                  rel: a.rel,
                  target: a.target,
                  isNofollow,
                  domain,
                  foundOn: [pageUrl],
                  occurrences: 1,
                  firstSeenDepth: depth,
                })
                totalOccurrences++
              }
              linksFound++

              // Enqueue internal HTML pages for further crawling
              if (type === 'internal') {
                enqueue(norm, depth + 1)
              }
            }

            pages.push({
              url: pageUrl,
              status: 'success',
              statusCode,
              title,
              linksFound,
              depth,
            })

            send({
              type: 'page',
              url: pageUrl,
              status: 'success',
              statusCode,
              title,
              linksFound,
              depth,
            })
          } catch (err) {
            const message =
              err instanceof Error
                ? err.name === 'AbortError'
                  ? 'Timed out'
                  : err.message
                : 'Unknown error'
            pages.push({
              url: pageUrl,
              status: 'error',
              error: message,
              linksFound: 0,
              depth,
            })
            pagesFailed++
            send({
              type: 'page',
              url: pageUrl,
              status: 'error',
              error: message,
              linksFound: 0,
              depth,
            })
          }
        }

        // Process root immediately using the already-fetched HTML
        const rootItem = queue.shift()!
        await processPage(rootItem, firstHtml)
        send({
          type: 'progress',
          crawled: pages.length,
          queued: queue.length,
          uniqueLinks: linkMap.size,
          currentUrl: rootItem.url,
        })

        // Worker pool BFS
        let active = 0
        const next = (): QueueItem | null => {
          while (queue.length > 0) {
            const item = queue.shift()!
            if (visited.has(item.url)) continue
            if (pages.length + active >= opts.maxPages) return null
            return item
          }
          return null
        }

        await new Promise<void>((resolve) => {
          const tick = () => {
            // Spawn up to CONCURRENCY workers
            while (
              active < CONCURRENCY &&
              pages.length + active < opts.maxPages
            ) {
              const item = next()
              if (!item) break
              active++
              processPage(item)
                .catch(() => {})
                .finally(() => {
                  active--
                  send({
                    type: 'progress',
                    crawled: pages.length,
                    queued: queue.length,
                    uniqueLinks: linkMap.size,
                    currentUrl: item.url,
                  })
                  if (
                    active === 0 &&
                    (queue.length === 0 || pages.length >= opts.maxPages)
                  ) {
                    resolve()
                  } else {
                    tick()
                  }
                })
            }
            if (active === 0 && queue.length === 0) resolve()
          }
          tick()
        })

        const links = Array.from(linkMap.values())
        const domains = Array.from(
          new Set(links.map((l) => l.domain).filter(Boolean)),
        ).sort()
        const internalCount = links.filter((l) => l.type === 'internal').length
        const externalCount = links.filter((l) => l.type === 'external').length
        const nofollowCount = links.filter((l) => l.isNofollow).length
        const fileCount = links.filter((l) => l.type === 'file').length
        const emailCount = links.filter((l) => l.type === 'mailto').length
        const phoneCount = links.filter((l) => l.type === 'tel').length

        const result: CrawlResult = {
          url: rawUrl,
          finalUrl,
          status: 'success',
          rootTitle,
          pagesCrawled: pages.length,
          pagesFailed,
          totalOccurrences,
          uniqueLinks: links.length,
          internalCount,
          externalCount,
          nofollowCount,
          fileCount,
          emailCount,
          phoneCount,
          domains,
          pages,
          links,
          sitemapUrlsFound,
          durationMs: Date.now() - startedAt,
        }

        send({ type: 'complete', result })
        controller.close()
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Unknown error during crawl'
        send({ type: 'fatal', error: message })
        try {
          controller.close()
        } catch {}
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-store, no-transform',
      'X-Accel-Buffering': 'no',
    },
  })
}
