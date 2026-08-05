// ──────────────────────────────────────────────────────────────────────────
// Shared server-side crawling helpers — sitemap discovery, bounded-concurrency
// fetching, and URL-list resolution for the "Website (Sitemap) / Single URL /
// Multiple URLs" input pattern used by several tools (Meta Pixel Checker,
// Mobile Checker, ...). Extracted here so every tool that needs "crawl a
// sitemap or take a list of URLs" shares one implementation instead of
// copy-pasting it per tool.
// ──────────────────────────────────────────────────────────────────────────

import * as cheerio from 'cheerio'

export type CrawlMode = 'sitemap' | 'single' | 'bulk'

export const DEFAULT_UA = 'Mozilla/5.0 (compatible; AiRankoBot/1.0; +https://airanko.com/bot)'
export const MOBILE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'

export interface FetchTextResult {
  text: string
  status: number
  finalUrl: string
  headers: Record<string, string>
}

export interface FetchOpts {
  timeout?: number
  maxBytes?: number
  userAgent?: string
}

const DEFAULT_TIMEOUT = 8000
const DEFAULT_MAX_BYTES = 200 * 1024

export async function fetchText(url: string, accept: string, opts: FetchOpts = {}): Promise<FetchTextResult> {
  const timeout = opts.timeout ?? DEFAULT_TIMEOUT
  const maxBytes = opts.maxBytes ?? DEFAULT_MAX_BYTES
  const userAgent = opts.userAgent ?? DEFAULT_UA

  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeout)
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': userAgent, Accept: accept },
      redirect: 'follow',
      signal: ctrl.signal,
    })
    const headers: Record<string, string> = {}
    res.headers.forEach((value, key) => { headers[key.toLowerCase()] = value })

    if (!res.ok) return { text: '', status: res.status, finalUrl: res.url || url, headers }

    const reader = res.body?.getReader()
    if (!reader) return { text: await res.text(), status: res.status, finalUrl: res.url || url, headers }
    const decoder = new TextDecoder()
    let text = ''
    let bytes = 0
    while (bytes < maxBytes) {
      const { done, value } = await reader.read()
      if (done) break
      text += decoder.decode(value, { stream: true })
      bytes += value.byteLength
    }
    reader.cancel().catch(() => {})
    return { text, status: res.status, finalUrl: res.url || url, headers }
  } catch {
    return { text: '', status: 0, finalUrl: url, headers: {} }
  } finally {
    clearTimeout(timer)
  }
}

export async function mapWithConcurrency<T, R>(items: T[], concurrency: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let next = 0
  async function worker() {
    while (next < items.length) {
      const i = next++
      results[i] = await fn(items[i])
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker))
  return results
}

export function normalizeUrl(input: string): string {
  let url = input.trim()
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`
  return url
}

// ── Sitemap discovery ────────────────────────────────────────────────────

async function discoverSitemapUrls(origin: string, fetchOpts: FetchOpts): Promise<string[]> {
  const { text: robots, status: robotsStatus } = await fetchText(`${origin}/robots.txt`, 'text/plain,*/*', fetchOpts)
  const fromRobots: string[] = []
  if (robotsStatus === 200 && robots) {
    for (const line of robots.split(/\r?\n/)) {
      const m = line.match(/^\s*sitemap\s*:\s*(\S+)/i)
      if (m) fromRobots.push(m[1].trim())
    }
  }
  if (fromRobots.length > 0) return fromRobots
  return [`${origin}/sitemap.xml`, `${origin}/sitemap_index.xml`]
}

async function parseSitemapXml(sitemapUrl: string, maxUrls: number, fetchOpts: FetchOpts, depth = 0): Promise<string[]> {
  if (depth > 3) return []
  const { text: xml, status } = await fetchText(sitemapUrl, 'application/xml,text/xml,*/*', fetchOpts)
  if (status !== 200 || !xml.trim()) return []

  const $ = cheerio.load(xml, { xmlMode: true })

  if ($('sitemapindex').length > 0) {
    const children = $('sitemap loc').map((_, el) => $(el).text().trim()).get().filter(Boolean)
    const collected: string[] = []
    for (const child of children.slice(0, 10)) {
      if (collected.length >= maxUrls) break
      const sub = await parseSitemapXml(child, maxUrls - collected.length, fetchOpts, depth + 1)
      collected.push(...sub)
    }
    return collected.slice(0, maxUrls)
  }

  const locs = $('url loc').map((_, el) => $(el).text().trim()).get().filter(Boolean)
  if (locs.length > 0) return locs.slice(0, maxUrls)

  return $('loc').map((_, el) => $(el).text().trim()).get().filter(Boolean).slice(0, maxUrls)
}

export interface ResolveUrlListOk {
  ok: true
  urls: string[]
  source: string | null
  totalDiscovered: number
}
export interface ResolveUrlListErr {
  ok: false
  error: string
  status: number
}

/**
 * Resolves the "Website (Sitemap) / Single URL / Multiple URLs" input pattern
 * into a concrete list of URLs. Discovery for sitemap mode always walks up to
 * `maxUrls` (not `limit`) so the caller can report an accurate
 * totalDiscovered/truncated even when the user has capped the fetch count.
 */
export async function resolveUrlList(
  mode: CrawlMode,
  input: string,
  limit: number,
  maxUrls: number,
  fetchOpts: FetchOpts = {},
): Promise<ResolveUrlListOk | ResolveUrlListErr> {
  if (mode === 'single') {
    return { ok: true, urls: [normalizeUrl(input)], source: 'single', totalDiscovered: 1 }
  }

  if (mode === 'bulk') {
    const urls = Array.from(new Set(
      input.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean).map(normalizeUrl),
    )).slice(0, maxUrls)
    if (urls.length === 0) return { ok: false, error: 'Provide at least one URL.', status: 400 }
    return { ok: true, urls, source: 'bulk', totalDiscovered: urls.length }
  }

  // mode === 'sitemap'
  const site = normalizeUrl(input)
  let origin: string
  try { origin = new URL(site).origin } catch { return { ok: false, error: 'Invalid website URL.', status: 400 } }

  const candidates = await discoverSitemapUrls(origin, fetchOpts)
  let discovered: string[] = []
  let source: string | null = null
  for (const candidate of candidates) {
    discovered = await parseSitemapXml(candidate, maxUrls, fetchOpts)
    if (discovered.length > 0) { source = candidate; break }
  }

  if (discovered.length === 0) {
    return {
      ok: false,
      status: 404,
      error: `No sitemap could be found or parsed for ${origin}. Checked robots.txt, /sitemap.xml, and /sitemap_index.xml. Try "Single URL" or "Multiple URLs" mode instead.`,
    }
  }

  return { ok: true, urls: discovered, source, totalDiscovered: discovered.length }
}
