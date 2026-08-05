import { NextRequest, NextResponse } from 'next/server'
import { fetchText, mapWithConcurrency, resolveUrlList, DEFAULT_UA, MOBILE_UA, type CrawlMode } from '@/lib/shared/crawl'
import { runMobileAudit, type MobileAuditResult } from '@/lib/mobile-checker/audit'

export const maxDuration = 120

const CONCURRENCY = 8
const MAX_URLS = 300

export type Mode = CrawlMode

export interface MobileCheckerResult {
  url: string
  status: 'success' | 'error'
  error?: string
  finalUrl?: string
  audit?: MobileAuditResult
}

export interface MobileCheckerResponse {
  source: string | null
  totalDiscovered: number
  totalReturned: number
  truncated: boolean
  results: MobileCheckerResult[]
}

async function auditOne(url: string): Promise<MobileCheckerResult> {
  let normalized: string
  try {
    normalized = new URL(url).href
  } catch {
    return { url, status: 'error', error: 'Invalid URL' }
  }

  // Fetch with a real desktop UA (the audit HTML source) and a real mobile
  // UA in parallel — the mobile fetch is used only to detect whether the
  // server redirects mobile visitors to a separate URL (e.g. m.example.com).
  const [desktopRes, mobileRes] = await Promise.all([
    fetchText(normalized, 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8', { userAgent: DEFAULT_UA }),
    fetchText(normalized, 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8', { userAgent: MOBILE_UA, timeout: 6000 }),
  ])

  if (desktopRes.status === 0) return { url: normalized, status: 'error', error: 'Request failed or timed out' }
  if (desktopRes.status !== 200) return { url: normalized, status: 'error', error: `HTTP ${desktopRes.status}` }
  if (!desktopRes.text.trim()) return { url: normalized, status: 'error', error: 'Empty response body' }

  const mobileRedirect = mobileRes.status === 200 && mobileRes.finalUrl && mobileRes.finalUrl !== desktopRes.finalUrl
    ? { detected: true, mobileUrl: mobileRes.finalUrl }
    : { detected: false, mobileUrl: null }

  const audit = runMobileAudit({
    html: desktopRes.text,
    htmlBytes: desktopRes.text.length,
    headers: desktopRes.headers,
    mobileRedirect,
  })

  return { url: normalized, status: 'success', finalUrl: desktopRes.finalUrl, audit }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const mode: Mode = body.mode
    const input: string = (body.input ?? '').trim()
    const limitRaw = parseInt(String(body.limit ?? 50), 10)
    const limit = Math.min(Math.max(Number.isFinite(limitRaw) ? limitRaw : 50, 1), MAX_URLS)

    if (!input) return NextResponse.json({ error: 'Input is required.' }, { status: 400 })
    if (!['sitemap', 'single', 'bulk'].includes(mode)) return NextResponse.json({ error: 'Invalid mode.' }, { status: 400 })

    const resolved = await resolveUrlList(mode, input, limit, MAX_URLS)
    if (!resolved.ok) return NextResponse.json({ error: resolved.error }, { status: resolved.status })

    const capped = resolved.urls.slice(0, mode === 'single' ? 1 : limit)
    const results = await mapWithConcurrency(capped, CONCURRENCY, auditOne)

    const response: MobileCheckerResponse = {
      source: resolved.source,
      totalDiscovered: resolved.totalDiscovered,
      totalReturned: results.length,
      truncated: resolved.totalDiscovered > capped.length,
      results,
    }

    return NextResponse.json(response)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[mobile-checker] Error:', message)
    return NextResponse.json({ error: `Analysis failed: ${message}` }, { status: 500 })
  }
}
