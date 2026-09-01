import { resolveUrlList, mapWithConcurrency, type CrawlMode } from '@/lib/shared/crawl'
import { runSecurityScan, type SecurityScanResult } from '@/lib/security-scanner/scan'

export const maxDuration = 60

type Mode = Extract<CrawlMode, 'single' | 'bulk'>

export interface SecurityScannerResult {
  url: string
  status: 'success' | 'error'
  error?: string
  scan?: SecurityScanResult
}

export interface SecurityScannerResponse {
  source: string | null
  totalDiscovered: number
  totalReturned: number
  truncated: boolean
  results: SecurityScannerResult[]
}

const MAX_URLS = 15
const CONCURRENCY = 3

async function scanOne(url: string): Promise<SecurityScannerResult> {
  const result = await runSecurityScan({ url, fetchOpts: { timeout: 8000 } })
  if ('error' in result) return { url, status: 'error', error: result.error }
  return { url, status: 'success', scan: result }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const mode: Mode = body.mode === 'bulk' ? 'bulk' : 'single'
    const input: string = typeof body.input === 'string' ? body.input : ''

    if (!input.trim()) {
      return Response.json({ error: 'Provide a URL to scan.' }, { status: 400 })
    }

    const resolved = await resolveUrlList(mode, input, MAX_URLS, MAX_URLS, { timeout: 8000 })
    if (!resolved.ok) {
      return Response.json({ error: resolved.error }, { status: resolved.status })
    }

    const results = await mapWithConcurrency(resolved.urls, CONCURRENCY, scanOne)

    const response: SecurityScannerResponse = {
      source: resolved.source,
      totalDiscovered: resolved.totalDiscovered,
      totalReturned: results.length,
      truncated: resolved.totalDiscovered > results.length,
      results,
    }
    return Response.json(response)
  } catch (err) {
    console.error('[v0] Security Scanner error:', err)
    const message = err instanceof Error ? err.message : 'Failed to run scan'
    return Response.json({ error: message }, { status: 500 })
  }
}
