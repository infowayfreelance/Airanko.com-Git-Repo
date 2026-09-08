// ──────────────────────────────────────────────────────────────────────────
// Phase 6 — competitor crawl. A lighter-weight sibling of
// ../analyze/route.ts's main site crawl: same fetch/parse building blocks
// (fetchWithTimeout, analyzeHtml, extractInternalLinks — reused, not
// reimplemented), but bounded smaller and without image probing / broken-
// link checking / sitemap auditing, since a competitor comparison only
// needs page counts, types, titles/H1s, word counts, schema, and internal
// link counts — not a full technical audit of a site we don't own.
//
// Never invents competitor facts: a crawl failure (or a competitor input
// that fails to resolve) returns status: 'not_evaluated' with zero
// fabricated counts, rather than guessing.
// ──────────────────────────────────────────────────────────────────────────
import { analyzeHtml, extractInternalLinks, fetchWithTimeout, normalizeUrl } from '../analyze/route'
import { mapWithConcurrency } from '@/lib/shared/crawl'
import { classifyCompetitorPage, type CompetitorPageType } from '@/lib/seo-strategy/competitor-classify'
import type { ConfidenceLevel } from '@/lib/seo-strategy/types'

export interface CompetitorPageInfo {
  url: string
  title: string | null
  h1: string | null
  wordCount: number
  pageType: CompetitorPageType
  confidence: ConfidenceLevel
  schemaTypes: string[]
  internalLinkCount: number
}

export interface CompetitorProfile {
  inputUrl: string
  domain: string | null
  status: 'evaluated' | 'not_evaluated'
  /** Why the crawl couldn't be evaluated — only set when status is 'not_evaluated'. */
  reason: string | null
  pagesDiscovered: number
  pagesCrawled: number
  pagesFailed: number
  servicePages: number
  locationPages: number
  blogPages: number
  /** Percentage (0-100) of crawled pages carrying detected schema — null when not_evaluated. */
  schemaCoverage: number | null
  averageWordCount: number | null
  pages: CompetitorPageInfo[]
}

const COMPETITOR_DISCOVER_CAP = 30
const COMPETITOR_CRAWL_CAP = 15
const COMPETITOR_PAGES_OUTPUT_CAP = 40

function notEvaluatedProfile(inputUrl: string, reason: string): CompetitorProfile {
  return {
    inputUrl,
    domain: null,
    status: 'not_evaluated',
    reason,
    pagesDiscovered: 0,
    pagesCrawled: 0,
    pagesFailed: 0,
    servicePages: 0,
    locationPages: 0,
    blogPages: 0,
    schemaCoverage: null,
    averageWordCount: null,
    pages: [],
  }
}

export async function POST(req: Request) {
  try {
    const { url, location } = (await req.json()) as { url: string; location?: string }
    if (!url || typeof url !== 'string') {
      return Response.json({ error: 'url is required' }, { status: 400 })
    }
    const targetLocation = typeof location === 'string' ? location : ''

    const normalized = normalizeUrl(url)
    let baseUrl: URL
    try {
      baseUrl = new URL(normalized)
    } catch {
      return Response.json({ profile: notEvaluatedProfile(url, 'Invalid URL.') })
    }

    const home = await fetchWithTimeout(normalized, 12000)
    if (!home.ok) {
      return Response.json({ profile: notEvaluatedProfile(url, 'Could not reach the competitor site — it may block automated requests or be temporarily unavailable.') })
    }
    // fetchWithTimeout() only fails (ok:false) on a network-level failure —
    // an error/blocked page (403 from bot protection, 429 rate limit, 404,
    // 5xx) still comes back as a normal result. Treating that as an
    // "evaluated" competitor would classify an error document as pages and
    // report fabricated weaknesses/advantages from its near-zero counts.
    if (home.status < 200 || home.status >= 300) {
      return Response.json({
        profile: notEvaluatedProfile(url, `The competitor site returned HTTP ${home.status} — the crawl could not be evaluated.`),
      })
    }

    const finalUrl = home.finalUrl
    const finalBase = new URL(finalUrl)
    const homepage = analyzeHtml(finalUrl, home.html, home.status, home.loadTimeMs, home.byteSize, finalBase, home.headers['x-robots-tag'] ?? null)

    const discoveredLinks = extractInternalLinks(home.html, finalBase).filter((u) => u !== finalUrl)
    const toCrawl = discoveredLinks.slice(0, COMPETITOR_DISCOVER_CAP).slice(0, COMPETITOR_CRAWL_CAP)

    const crawlResults = await mapWithConcurrency(toCrawl, 5, async (pageUrl) => {
      const r = await fetchWithTimeout(pageUrl, 8000)
      if (!r.ok || r.status < 200 || r.status >= 300) return null
      return analyzeHtml(pageUrl, r.html, r.status, r.loadTimeMs, r.byteSize, finalBase, r.headers['x-robots-tag'] ?? null)
    })
    const crawledPages = crawlResults.filter((p): p is NonNullable<typeof p> => p !== null)
    const pagesFailed = toCrawl.length - crawledPages.length

    const allPages = [homepage, ...crawledPages]
    const pageInfos: CompetitorPageInfo[] = allPages.map((p, i) => {
      const classification = classifyCompetitorPage(
        { url: p.url, title: p.title, h1: p.h1, wordCount: p.wordCount },
        i === 0,
        targetLocation,
      )
      return {
        url: p.url,
        title: p.title,
        h1: p.h1[0] ?? null,
        wordCount: p.wordCount,
        pageType: classification.type,
        confidence: classification.confidence,
        schemaTypes: p.schemaTypes,
        internalLinkCount: p.internalLinkCount,
      }
    })

    const servicePages = pageInfos.filter((p) => p.pageType === 'service').length
    const locationPages = pageInfos.filter((p) => p.pageType === 'location').length
    const blogPages = pageInfos.filter((p) => p.pageType === 'blog').length
    const pagesWithSchema = allPages.filter((p) => p.hasJsonLd || p.schemaTypes.length > 0).length
    const schemaCoverage = allPages.length > 0 ? Math.round((pagesWithSchema / allPages.length) * 100) : null
    const averageWordCount = allPages.length > 0 ? Math.round(allPages.reduce((s, p) => s + p.wordCount, 0) / allPages.length) : null

    const profile: CompetitorProfile = {
      inputUrl: url,
      domain: finalBase.hostname,
      status: 'evaluated',
      reason: null,
      pagesDiscovered: discoveredLinks.length + 1,
      pagesCrawled: allPages.length,
      pagesFailed,
      servicePages,
      locationPages,
      blogPages,
      schemaCoverage,
      averageWordCount,
      pages: pageInfos.slice(0, COMPETITOR_PAGES_OUTPUT_CAP),
    }

    return Response.json({ profile })
  } catch (err) {
    console.error('[v0] Competitor analysis error:', err)
    return Response.json({ error: 'We could not analyze this competitor website.' }, { status: 500 })
  }
}
