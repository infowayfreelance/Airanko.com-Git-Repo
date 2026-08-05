import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'
import { fetchText, mapWithConcurrency, resolveUrlList, type CrawlMode } from '@/lib/shared/crawl'

export const maxDuration = 120

const CONCURRENCY = 10
const MAX_URLS = 300

export type Mode = CrawlMode

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

    const resolved = await resolveUrlList(mode, input, limit, MAX_URLS)
    if (!resolved.ok) return NextResponse.json({ error: resolved.error }, { status: resolved.status })

    const capped = resolved.urls.slice(0, mode === 'single' ? 1 : limit)
    const results = await mapWithConcurrency(capped, CONCURRENCY, fetchOne)

    const response: MetaPixelCheckerResponse = {
      source: resolved.source,
      totalDiscovered: resolved.totalDiscovered,
      totalReturned: results.length,
      truncated: resolved.totalDiscovered > capped.length,
      results,
    }

    return NextResponse.json(response)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[meta-pixel-checker] Error:', message)
    return NextResponse.json({ error: `Analysis failed: ${message}` }, { status: 500 })
  }
}
