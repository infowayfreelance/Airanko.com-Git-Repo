// ──────────────────────────────────────────────────────────────────────────
// Deterministic keyword-to-page relevance mapping.
//
// Problem this solves: the AI would happily map "jump start service
// darlington" to /services/refueling just because a services page existed.
// This module scores every crawled page against a keyword using weighted,
// inspectable signals (URL slug, title, H1, H2, page content, location
// mention) and only returns a mapping when a page clears
// RELEVANCE_THRESHOLD. AI can still assist with intent/difficulty/priority
// elsewhere in the strategy, but it never decides the final target page —
// this deterministic scorer does.
// ──────────────────────────────────────────────────────────────────────────
import type { PageAnalysis } from '@/app/api/seo-strategy/analyze/route'
import type { ConfidenceLevel, KeywordPageMapping } from './types'

/**
 * Below this normalized 0-100 relevance score, we refuse to map a keyword to
 * any page at all — an incorrect mapping is worse than admitting no good
 * page exists yet. Single, named, tunable constant per the P0 requirement
 * for "a clear configurable relevance threshold".
 */
export const RELEVANCE_THRESHOLD = 40

const HIGH_CONFIDENCE_SCORE = 75
const MEDIUM_CONFIDENCE_SCORE = 55

// Generic filler words that carry no service or location intent on their
// own, so they're excluded from the "core" tokens used for matching.
const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'of', 'to', 'in', 'on', 'for', 'with', 'near', 'me', 'my',
  'your', 'you', 'service', 'services', 'company', 'best', 'top', 'local', 'get', 'find',
  'call', 'now', 'today', 'cheap', 'affordable',
])

function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/[\s-]+/)
    .map((t) => t.trim())
    .filter(Boolean)
}

function slugTokens(url: string): string[] {
  try {
    const { pathname } = new URL(url)
    return tokenize(pathname.replace(/[/_]/g, ' '))
  } catch {
    return tokenize(url)
  }
}

/** Fraction (0-1) of `needleTokens` that appear in `haystack`, allowing substring matches so "jumpstart" credits both "jump" and "start". */
function overlapScore(needleTokens: string[], haystack: Set<string>): number {
  if (needleTokens.length === 0) return 0
  const haystackArr = Array.from(haystack)
  const hits = needleTokens.filter((t) => haystackArr.some((h) => h === t || h.includes(t) || t.includes(h))).length
  return hits / needleTokens.length
}

/** True if the single most distinguishing keyword token (the longest one) appears verbatim/substring in any of the given page fields — this is the "service intent" signal. */
function strongestTokenMatch(serviceTokens: string[], ...haystacks: Set<string>[]): boolean {
  if (serviceTokens.length === 0) return false
  const strongest = [...serviceTokens].sort((a, b) => b.length - a.length)[0]
  return haystacks.some((h) => Array.from(h).some((tok) => tok.includes(strongest) || strongest.includes(tok)))
}

function describeMatch(scores: {
  slugScore: number
  titleScore: number
  h1Score: number
  contentScore: number
  locationScore: number
  serviceIntentMatch: boolean
}): string {
  const parts: string[] = []
  if (scores.slugScore > 0) parts.push('URL slug')
  if (scores.titleScore > 0) parts.push('title')
  if (scores.h1Score > 0) parts.push('H1')
  if (scores.contentScore > 0) parts.push('page content')
  if (scores.serviceIntentMatch) parts.push('service intent')
  if (scores.locationScore > 0) parts.push('location mention')
  return parts.length > 0 ? `Match found in ${parts.join(', ')}.` : 'No meaningful match found on this page.'
}

export interface KeywordMappingOptions {
  /** Business location (e.g. "Darlington") — used to separate location intent from service intent instead of letting a place name pollute service matching. */
  location?: string
  threshold?: number
}

function confidenceFor(score: number): ConfidenceLevel {
  if (score >= HIGH_CONFIDENCE_SCORE) return 'high'
  if (score >= MEDIUM_CONFIDENCE_SCORE) return 'medium'
  return 'low'
}

export function mapKeywordToPage(
  keyword: string,
  pages: PageAnalysis[],
  options: KeywordMappingOptions = {},
): KeywordPageMapping {
  const threshold = options.threshold ?? RELEVANCE_THRESHOLD
  const rawTokens = tokenize(keyword)
  const locationTokens = new Set(options.location ? tokenize(options.location) : [])
  const serviceTokens = rawTokens.filter((t) => !STOPWORDS.has(t) && !locationTokens.has(t))

  let best: { page: PageAnalysis; score: number; reason: string } | null = null

  for (const page of pages) {
    const slug = new Set(slugTokens(page.url))
    const title = new Set(tokenize(page.title || ''))
    const h1 = new Set(tokenize(page.h1.join(' ')))
    const h2 = new Set(tokenize(page.h2.join(' ')))
    const content = new Set(tokenize(page.contentSnippet || ''))

    const slugScore = overlapScore(serviceTokens, slug)
    const titleScore = overlapScore(serviceTokens, title)
    const h1Score = overlapScore(serviceTokens, h1)
    const h2Score = overlapScore(serviceTokens, h2)
    const contentScore = overlapScore(serviceTokens, content)
    const serviceIntentMatch = strongestTokenMatch(serviceTokens, slug, title, h1)
    const locationScore =
      locationTokens.size > 0
        ? overlapScore(Array.from(locationTokens), new Set([...slug, ...title, ...h1, ...content]))
        : 0

    // Weighted sum, normalized to 0-100. See task's suggested weighting
    // concept: URL/title/H1/content = high, service-intent = very high,
    // location = medium, supporting headings (H2) = medium.
    const weighted =
      slugScore * 20 +
      titleScore * 20 +
      h1Score * 18 +
      h2Score * 7 +
      contentScore * 15 +
      (serviceIntentMatch ? 15 : 0) +
      locationScore * 5

    const score = Math.max(0, Math.min(100, Math.round(weighted)))

    if (!best || score > best.score) {
      best = {
        page,
        score,
        reason: describeMatch({ slugScore, titleScore, h1Score, contentScore, locationScore, serviceIntentMatch }),
      }
    }
  }

  if (!best || best.score < threshold) {
    return {
      keyword,
      mappedUrl: null,
      relevanceScore: best?.score ?? 0,
      confidence: 'low',
      status: 'no_suitable_page',
      reason: 'No crawled page reached the minimum relevance threshold for this keyword.',
      recommendation: `Create a dedicated page targeting "${keyword}".`,
    }
  }

  return {
    keyword,
    mappedUrl: best.page.url,
    relevanceScore: best.score,
    confidence: confidenceFor(best.score),
    status: 'mapped',
    reason: best.reason,
    recommendation: null,
  }
}

export function mapKeywordsToPages(
  keywords: string[],
  pages: PageAnalysis[],
  options: KeywordMappingOptions = {},
): KeywordPageMapping[] {
  return keywords.map((k) => mapKeywordToPage(k, pages, options))
}

/**
 * Parses the freeform "keywords" textarea into a clean list. Handles
 * newline-separated lists and CSV-style exports from Semrush/Ahrefs/Google
 * Keyword Planner (keyword,volume,difficulty,...) by taking only the first
 * column. Deduplicates case-insensitively and caps the count so mapping
 * stays bounded.
 */
export function parseKeywordList(raw: string, max = 40): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const line of raw.split(/\r?\n/)) {
    const firstField = line.split(',')[0]?.trim()
    if (!firstField) continue
    const key = firstField.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(firstField)
    if (out.length >= max) break
  }
  return out
}

export function normalizeKeyword(k: string): string {
  return k.trim().toLowerCase().replace(/\s+/g, ' ')
}
