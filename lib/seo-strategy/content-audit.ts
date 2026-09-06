// ──────────────────────────────────────────────────────────────────────────
// Phase 2B — deterministic content audit: page-aware word count/thin-content,
// cross-page duplicate/near-duplicate detection (shingling + Jaccard
// similarity), keyword relevance, and search-intent classification.
//
// AI is never the source of truth here either: word count, similarity
// scores, and keyword-token overlap are all computed directly from crawl
// data. Search-intent classification is a deterministic heuristic on
// keyword phrasing + page type (not a live AI call) — see classifySearchIntent
// below — so "AI may assist with intent classification" is satisfied the
// same way Phase 2A satisfied "AI may help with suggestions": template/
// heuristic logic that's inspectable and testable, not a second network
// round-trip. This is documented as a deliberate scope decision, not an
// oversight.
// ──────────────────────────────────────────────────────────────────────────
import type { PageAnalysis } from '@/app/api/seo-strategy/analyze/route'
import { pickHighestSeverity } from './severity'
import type {
  ConfidenceLevel,
  ContentAudit,
  DuplicateStatus,
  KeywordRelevanceResult,
  OnPageStatus,
  PageImportance,
  PageType,
  SearchIntent,
  SearchIntentResult,
  Severity,
  SimilarPageMatch,
} from './types'
import {
  BOILERPLATE_PAGE_FRACTION,
  SHINGLE_SIZE,
  SIMILARITY_POSSIBLE,
  SIMILARITY_VERY_HIGH,
  WORD_COUNT_BY_PAGE_TYPE,
} from './phase2b-thresholds'

// ---------------------------------------------------------------------------
// Duplicate / near-duplicate content — 5-word shingles + Jaccard similarity,
// with sitewide boilerplate (shared nav/footer/CTA/NAP text that leaked into
// "main content") excluded first so two unrelated pages sharing a footer
// never register as duplicates (see phase2b-thresholds.ts).
// ---------------------------------------------------------------------------
function tokenizeForShingles(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean)
}

function buildShingles(text: string, size: number): Set<string> {
  const words = tokenizeForShingles(text)
  const result = new Set<string>()
  for (let i = 0; i + size <= words.length; i++) {
    result.add(words.slice(i, i + size).join(' '))
  }
  return result
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0
  let intersection = 0
  for (const x of a) if (b.has(x)) intersection++
  const union = a.size + b.size - intersection
  return union === 0 ? 0 : intersection / union
}

function findBoilerplateShingles(pageShingles: Set<string>[]): Set<string> {
  if (pageShingles.length < 2) return new Set()
  const counts = new Map<string, number>()
  for (const set of pageShingles) {
    for (const s of set) counts.set(s, (counts.get(s) ?? 0) + 1)
  }
  // On a small crawl, requiring unanimous presence avoids mistaking text
  // that only two or three pages happen to share (a genuine duplicate-
  // content pair) for sitewide chrome. Larger crawls tolerate one page
  // being an exception (e.g. a slightly different footer variant).
  const minPagesForBoilerplate =
    pageShingles.length <= 3 ? pageShingles.length : Math.max(pageShingles.length - 1, Math.ceil(pageShingles.length * BOILERPLATE_PAGE_FRACTION))
  const boilerplate = new Set<string>()
  for (const [shingle, count] of counts) {
    if (count >= minPagesForBoilerplate) boilerplate.add(shingle)
  }
  return boilerplate
}

/** Site-wide similarity matrix: for every page, the other pages whose de-boilerplated content is similar enough to flag, plus an exact/near/unique verdict. Computed once for the whole crawl, not per page. */
export function computeContentSimilarity(
  pages: PageAnalysis[],
): Map<string, { status: DuplicateStatus; matches: SimilarPageMatch[] }> {
  const rawShingles = pages.map((p) => buildShingles(p.mainContentText, SHINGLE_SIZE))
  const boilerplate = findBoilerplateShingles(rawShingles)
  const cleanedShingles = rawShingles.map((set) => {
    const cleaned = new Set<string>()
    for (const s of set) if (!boilerplate.has(s)) cleaned.add(s)
    return cleaned
  })

  const result = new Map<string, { status: DuplicateStatus; matches: SimilarPageMatch[] }>()
  for (let i = 0; i < pages.length; i++) {
    const matches: SimilarPageMatch[] = []
    // A page with almost no unique content after removing boilerplate can't
    // be meaningfully compared — leave it unique rather than risk a false
    // "identical" match against another equally thin page.
    if (cleanedShingles[i].size < 5) {
      result.set(pages[i].url, { status: 'unique', matches: [] })
      continue
    }
    for (let j = 0; j < pages.length; j++) {
      if (i === j) continue
      if (cleanedShingles[j].size < 5) continue
      const similarity = jaccardSimilarity(cleanedShingles[i], cleanedShingles[j])
      if (similarity >= SIMILARITY_POSSIBLE) {
        matches.push({ url: pages[j].url, similarityScore: Math.round(similarity * 100) })
      }
    }
    matches.sort((a, b) => b.similarityScore - a.similarityScore)
    const top = matches[0]
    const status: DuplicateStatus = !top ? 'unique' : top.similarityScore >= SIMILARITY_VERY_HIGH * 100 ? 'exact_duplicate' : 'near_duplicate'
    result.set(pages[i].url, { status, matches })
  }
  return result
}

// ---------------------------------------------------------------------------
// Word count / thin content — page-type-aware, not one fixed threshold.
// ---------------------------------------------------------------------------
function checkWordCount(
  wordCount: number,
  pageType: PageType,
  importance: PageImportance,
): { thinContent: boolean; issue: string | null; severity: Severity } {
  const config = WORD_COUNT_BY_PAGE_TYPE[pageType]

  if (config.expectThin) {
    // Contact/legal/utility pages are not held to commercial content
    // thresholds — a short page here is expected, not an SEO problem.
    if (wordCount < 10) {
      return { thinContent: true, issue: `Very little content (${wordCount} words), even accounting for this being a ${pageType} page.`, severity: 'low' }
    }
    return { thinContent: false, issue: null, severity: 'pass' }
  }

  if (wordCount < config.minHealthy * 0.4) {
    return {
      thinContent: true,
      issue: `Content is thin for a ${pageType} page (${wordCount} words; expected at least roughly ${config.minHealthy}).`,
      severity: importance === 'high' ? 'high' : 'medium',
    }
  }
  if (wordCount < config.minHealthy) {
    return {
      thinContent: true,
      issue: `Content is on the light side for a ${pageType} page (${wordCount} words; expected at least roughly ${config.minHealthy}).`,
      severity: importance === 'high' ? 'medium' : 'low',
    }
  }
  return { thinContent: false, issue: null, severity: 'pass' }
}

// ---------------------------------------------------------------------------
// Keyword relevance — weighted topical-term overlap (title/H1/headings/body),
// not keyword density. Only ever evaluated when P0 validated a keyword for
// this exact page.
// ---------------------------------------------------------------------------
function tokenize(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean)
}

export function evaluateKeywordRelevance(page: PageAnalysis, targetKeyword: string | null): KeywordRelevanceResult | null {
  if (!targetKeyword) return null
  const tokens = tokenize(targetKeyword).filter((t) => t.length >= 3)
  if (tokens.length === 0) return { score: 0, status: 'not_evaluated' }

  const titleTokens = new Set(tokenize(page.title || ''))
  const h1Tokens = new Set(tokenize(page.headingHierarchy.filter((h) => h.level === 1).map((h) => h.text).join(' ')))
  const headingTokens = new Set(tokenize(page.headingHierarchy.map((h) => h.text).join(' ')))
  const bodyTokens = new Set(tokenize(page.mainContentText || page.contentSnippet || ''))

  const coverage = (haystack: Set<string>) => tokens.filter((t) => haystack.has(t)).length / tokens.length

  // Weighted toward the strongest topical signals (title/H1); body coverage
  // rewards the keyword's topic actually being discussed, not how many
  // times the exact phrase repeats (that's keyword-stuffing territory).
  const weighted = coverage(titleTokens) * 30 + coverage(h1Tokens) * 25 + coverage(headingTokens) * 15 + coverage(bodyTokens) * 30
  const score = Math.max(0, Math.min(100, Math.round(weighted)))
  const status: OnPageStatus = score >= 70 ? 'good' : score >= 40 ? 'needs_improvement' : 'poor'
  return { score, status }
}

// ---------------------------------------------------------------------------
// Search intent — deterministic classification from keyword phrasing + page
// type + local-business context, then a lightweight check for whether the
// page's content plausibly satisfies that intent.
// ---------------------------------------------------------------------------
const INFORMATIONAL_HINTS = /\b(how to|what is|why|guide|tips|checklist|when should)\b/i
const COMMERCIAL_HINTS = /\b(best|top \d+|review|vs\.?|comparison|compare)\b/i
const TRANSACTIONAL_HINTS = /\b(buy|book|hire|order|quote|price|cost|24 hour|emergency|near me)\b/i
const CTA_CONTENT_HINTS = /\b(contact|call|book|quote|get in touch|enquire|inquire|request a|speak to)\b/i

export function classifySearchIntent(keyword: string, pageType: PageType, isLocalBusiness: boolean, location: string): SearchIntent {
  if (pageType === 'blog' || INFORMATIONAL_HINTS.test(keyword)) return 'informational'
  if (COMMERCIAL_HINTS.test(keyword)) return 'commercial'

  const hasLocationMention = !!location && keyword.toLowerCase().includes(location.toLowerCase())
  if (isLocalBusiness && (hasLocationMention || pageType === 'location' || pageType === 'service')) {
    return 'local_transactional'
  }
  if (TRANSACTIONAL_HINTS.test(keyword)) return 'transactional'
  return pageType === 'homepage' ? 'navigational' : 'informational'
}

function evaluateIntentMatch(page: PageAnalysis, intent: SearchIntent, thinContent: boolean): { match: boolean; confidence: ConfidenceLevel } {
  if (thinContent) return { match: false, confidence: 'medium' }
  if (intent === 'transactional' || intent === 'local_transactional' || intent === 'commercial') {
    const hasCta = CTA_CONTENT_HINTS.test(page.mainContentText) || page.contactInfo.phones.length > 0
    return { match: hasCta, confidence: hasCta ? 'high' : 'medium' }
  }
  if (intent === 'informational') {
    return { match: page.mainContentWordCount >= 300, confidence: 'medium' }
  }
  // navigational — a page existing and loading is basically the whole bar.
  return { match: true, confidence: 'low' }
}

// ---------------------------------------------------------------------------
// Assembly
// ---------------------------------------------------------------------------
export function evaluateContent(
  page: PageAnalysis,
  pageType: PageType,
  importance: PageImportance,
  targetKeyword: string | null,
  similarity: { status: DuplicateStatus; matches: SimilarPageMatch[] },
  isLocalBusiness: boolean,
  location: string,
): ContentAudit {
  const issues: string[] = []
  const severities: Severity[] = []

  const wc = checkWordCount(page.mainContentWordCount, pageType, importance)
  if (wc.issue) {
    issues.push(wc.issue)
    severities.push(wc.severity)
  }

  if (similarity.status === 'exact_duplicate') {
    issues.push(
      `This page's content is a very high match (${similarity.matches[0]?.similarityScore ?? 90}%+) with ${similarity.matches[0]?.url ?? 'another crawled page'}.`,
    )
    severities.push(importance === 'high' ? 'high' : 'medium')
  } else if (similarity.status === 'near_duplicate') {
    issues.push(
      `High content similarity detected with ${similarity.matches.map((m) => `${m.url} (${m.similarityScore}%)`).join(', ')}.`,
    )
    severities.push('medium')
  }

  const keywordRelevance = evaluateKeywordRelevance(page, targetKeyword)
  if (keywordRelevance && keywordRelevance.status !== 'good') {
    issues.push(`Content weakly covers the target keyword "${targetKeyword}" (relevance score ${keywordRelevance.score}/100).`)
    severities.push('medium')
  }

  let searchIntent: SearchIntentResult | null = null
  if (targetKeyword) {
    const intent = classifySearchIntent(targetKeyword, pageType, isLocalBusiness, location)
    const { match, confidence } = evaluateIntentMatch(page, intent, wc.thinContent)
    searchIntent = { intent, match, confidence }
    if (!match) {
      issues.push(`Content may not fully satisfy the ${intent.replace('_', ' ')} intent behind "${targetKeyword}".`)
      severities.push('medium')
    }
  }

  if (issues.length === 0) severities.push('pass')
  const status: OnPageStatus = issues.length === 0 ? 'good' : wc.severity === 'high' || wc.severity === 'critical' ? 'poor' : 'needs_improvement'

  return {
    wordCount: page.mainContentWordCount,
    pageType,
    thinContent: wc.thinContent,
    duplicateStatus: similarity.status,
    similarPages: similarity.matches,
    keywordRelevance,
    searchIntent,
    status,
    severity: pickHighestSeverity(severities),
    issues,
  }
}
