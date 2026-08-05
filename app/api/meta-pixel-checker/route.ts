import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

export const maxDuration = 120

const UA = 'Mozilla/5.0 (compatible; AiRankoBot/1.0; +https://airanko.com/bot)'
const FETCH_TIMEOUT = 8000
const CONCURRENCY = 10
const MAX_URLS = 300
const MAX_HTML_BYTES = 200 * 1024

export type Mode = 'sitemap' | 'single' | 'bulk'

export interface MetaPixelResult {
  url: string
  status: 'success' | 'error'
  error?: string
  title: string | null
  description: string | null
}

export interface MetaPixelCheckerResponse {
  source: string | null
  totalDiscovered: number
  totalReturned: number
  truncated: boolean
  results: MetaPixelResult[]
}

// ── Helpers ────────────────────────────────────────────────────────────────

async function fetchText(url: string, accept: string): Promise<{ text: string; status: number }> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT)
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, Accept: accept },
      redirect: 'follow',
      signal: ctrl.signal,
    })
    if (!res.ok) return { text: '', status: res.status }

    // Cap how much we read to keep large pages fast.
    const reader = res.body?.getReader()
    if (!reader) return { text: await res.text(), status: res.status }
    const decoder = new TextDecoder()
    let text = ''
    let bytes = 0
    while (bytes < MAX_HTML_BYTES) {
      const { done, value } = await reader.read()
      if (done) break
      text += decoder.decode(value, { stream: true })
      bytes += value.byteLength
    }
    reader.cancel().catch(() => {})
    return { text, status: res.status }
  } catch {
    return { text: '', status: 0 }
  } finally {
    clearTimeout(timer)
  }
}

async function mapWithConcurrency<T, R>(items: T[], concurrency: number, fn: (item: T) => Promise<R>): Promise<R[]> {
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

function normalizeUrl(input: string): string {
  let url = input.trim()
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`
  return url
}

// ── Sitemap discovery ────────────────────────────────────────────────────

async function discoverSitemapUrls(origin: string): Promise<string[]> {
  // 1) robots.txt "Sitemap:" directives
  const { text: robots, status: robotsStatus } = await fetchText(`${origin}/robots.txt`, 'text/plain,*/*')
  const fromRobots: string[] = []
  if (robotsStatus === 200 && robots) {
    for (const line of robots.split(/\r?\n/)) {
      const m = line.match(/^\s*sitemap\s*:\s*(\S+)/i)
      if (m) fromRobots.push(m[1].trim())
    }
  }
  if (fromRobots.length > 0) return fromRobots

  // 2) conventional locations
  return [`${origin}/sitemap.xml`, `${origin}/sitemap_index.xml`]
}

async function parseSitemapXml(sitemapUrl: string, maxUrls: number, depth = 0): Promise<string[]> {
  if (depth > 3) return []
  const { text: xml, status } = await fetchText(sitemapUrl, 'application/xml,text/xml,*/*')
  if (status !== 200 || !xml.trim()) return []

  const $ = cheerio.load(xml, { xmlMode: true })

  if ($('sitemapindex').length > 0) {
    const children = $('sitemap loc').map((_, el) => $(el).text().trim()).get().filter(Boolean)
    const collected: string[] = []
    for (const child of children.slice(0, 10)) {
      if (collected.length >= maxUrls) break
      const sub = await parseSitemapXml(child, maxUrls - collected.length, depth + 1)
      collected.push(...sub)
    }
    return collected.slice(0, maxUrls)
  }

  const locs = $('url loc').map((_, el) => $(el).text().trim()).get().filter(Boolean)
  if (locs.length > 0) return locs.slice(0, maxUrls)

  // Some sitemaps omit the <url> wrapper checks above if malformed; fall back to any <loc>.
  return $('loc').map((_, el) => $(el).text().trim()).get().filter(Boolean).slice(0, maxUrls)
}

// ── Meta extraction ──────────────────────────────────────────────────────

function extractMeta(html: string): { title: string | null; description: string | null } {
  const $ = cheerio.load(html)
  const title = $('title').first().text().trim() || null
  const description =
    $('meta[name="description" i]').attr('content')?.trim() ||
    $('meta[property="og:description" i]').attr('content')?.trim() ||
    null
  return { title, description }
}

async function fetchOne(url: string): Promise<MetaPixelResult> {
  let normalized: string
  try {
    normalized = new URL(url).href
  } catch {
    return { url, status: 'error', error: 'Invalid URL', title: null, description: null }
  }

  const { text: html, status } = await fetchText(normalized, 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8')
  if (status === 0) return { url: normalized, status: 'error', error: 'Request failed or timed out', title: null, description: null }
  if (status !== 200) return { url: normalized, status: 'error', error: `HTTP ${status}`, title: null, description: null }
  if (!html.trim()) return { url: normalized, status: 'error', error: 'Empty response body', title: null, description: null }

  const { title, description } = extractMeta(html)
  return { url: normalized, status: 'success', title, description }
}

// ── Handler ───────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const mode: Mode = body.mode
    const input: string = (body.input ?? '').trim()
    const limitRaw = parseInt(String(body.limit ?? 50), 10)
    const limit = Math.min(Math.max(Number.isFinite(limitRaw) ? limitRaw : 50, 1), MAX_URLS)

    if (!input) return NextResponse.json({ error: 'Input is required.' }, { status: 400 })
    if (!['sitemap', 'single', 'bulk'].includes(mode)) return NextResponse.json({ error: 'Invalid mode.' }, { status: 400 })

    let urls: string[] = []
    let source: string | null = null

    if (mode === 'single') {
      urls = [normalizeUrl(input)]
      source = 'single'
    } else if (mode === 'bulk') {
      urls = Array.from(new Set(
        input.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean).map(normalizeUrl),
      )).slice(0, MAX_URLS)
      if (urls.length === 0) return NextResponse.json({ error: 'Provide at least one URL.' }, { status: 400 })
      source = 'bulk'
    } else {
      const site = normalizeUrl(input)
      let origin: string
      try { origin = new URL(site).origin } catch { return NextResponse.json({ error: 'Invalid website URL.' }, { status: 400 }) }

      // Discover up to the hard ceiling (not just `limit`) so totalDiscovered/truncated
      // accurately reflect the sitemap's real size — the fetch step below is what
      // actually respects the user's page-limit.
      const candidates = await discoverSitemapUrls(origin)
      let discovered: string[] = []
      for (const candidate of candidates) {
        discovered = await parseSitemapXml(candidate, MAX_URLS)
        if (discovered.length > 0) { source = candidate; break }
      }

      if (discovered.length === 0) {
        return NextResponse.json({
          error: `No sitemap could be found or parsed for ${origin}. Checked robots.txt, /sitemap.xml, and /sitemap_index.xml. Try "Single URL" or "Multiple URLs" mode instead.`,
        }, { status: 404 })
      }
      urls = discovered
    }

    const totalDiscovered = urls.length
    const capped = urls.slice(0, mode === 'single' ? 1 : limit)
    const results = await mapWithConcurrency(capped, CONCURRENCY, fetchOne)

    const response: MetaPixelCheckerResponse = {
      source,
      totalDiscovered,
      totalReturned: results.length,
      truncated: totalDiscovered > capped.length,
      results,
    }

    return NextResponse.json(response)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[meta-pixel-checker] Error:', message)
    return NextResponse.json({ error: `Analysis failed: ${message}` }, { status: 500 })
  }
}
