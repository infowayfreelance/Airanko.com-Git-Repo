// ──────────────────────────────────────────────────────────────────────────
// Phase 7 — deterministic content-gap / pages-to-create strategy. Merges
// two already-deterministic evidence sources — P0's keyword→page mapping
// (lib/seo-strategy/keyword-mapping.ts) and Phase 6's competitor gap
// analysis (lib/seo-strategy/competitor-intelligence.ts) — into ranked,
// evidence-backed page recommendations. Never invents a keyword, a
// competitor claim, or a priority; every field traces back to one of those
// two sources or to the target site's own crawled pages.
// ──────────────────────────────────────────────────────────────────────────
import { classifySearchIntent } from './content-audit'
import type { GapItem } from './competitor-intelligence'
import type { ConfidenceLevel, KeywordPageMapping, SearchIntent } from './types'

export type PageOpportunityType = 'service' | 'location' | 'service_location' | 'informational' | 'faq' | 'improve_existing'
export type PageOpportunityAction = 'create' | 'improve' | 'optimize'
export type CannibalizationRisk = 'safe_to_create' | 'improve_existing' | 'potential_cannibalization'
export type PageOpportunityPriority = 'high' | 'medium' | 'low'

export interface PageOpportunity {
  pageType: PageOpportunityType
  suggestedTitle: string
  /** Null when the action is to improve/optimize an existing page — there's no new URL to create. */
  suggestedUrl: string | null
  primaryKeyword: string
  secondaryTopics: string[]
  searchIntent: SearchIntent
  priority: PageOpportunityPriority
  action: PageOpportunityAction
  /** URL of the existing page this recommendation is about (improve/optimize) or conflicts with (potential_cannibalization) — null only for a clean new-page recommendation. */
  existingPage: string | null
  /** Concrete evidence text from Phase 6's competitor analysis, or null — never fabricated when no competitor evidence exists. */
  competitorEvidence: string | null
  reason: string
  confidence: ConfidenceLevel
  cannibalizationRisk: CannibalizationRisk
}

interface BuildOptions {
  isLocalBusiness: boolean
  location: string
}

// ---------------------------------------------------------------------------
// Shared word-overlap helpers (same posture as competitor-intelligence.ts —
// good enough to tell topics apart, not a semantic model).
// ---------------------------------------------------------------------------
const STOPWORDS = new Set(['the', 'and', 'for', 'with', 'from', 'that', 'this', 'your', 'our', 'you', 'are', 'services', 'service'])

function significantWords(text: string): Set<string> {
  return new Set((text.toLowerCase().match(/[a-z0-9]+/g) ?? []).filter((w) => w.length >= 4 && !STOPWORDS.has(w)))
}

function overlapFraction(a: Set<string>, b: Set<string>): number {
  if (a.size === 0) return 0
  let hits = 0
  for (const w of a) if (b.has(w)) hits++
  return hits / a.size
}

const STRONG_MATCH_SCORE = 70
const TOPIC_MATCH_THRESHOLD = 0.5

function toTitleCase(s: string): string {
  return s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
}

function slugify(s: string): string {
  return `/${s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')}`
}

// ---------------------------------------------------------------------------
// Page-type classification for a KEYWORD (not a crawled page — there's no
// page yet). Reuses P0's classifySearchIntent() rather than re-deriving
// intent rules; only the informational/faq vs service/location/service+
// location split is new here.
// ---------------------------------------------------------------------------
const FAQ_HINTS = /\b(faq|how to|what is|why|when should|can you|do you)\b/i

function classifyOpportunityType(keyword: string, intent: SearchIntent, options: BuildOptions): PageOpportunityType {
  if (intent === 'informational') return FAQ_HINTS.test(keyword) ? 'faq' : 'informational'

  const location = options.location.trim().toLowerCase()
  if (options.isLocalBusiness && location && keyword.toLowerCase().includes(location)) {
    const remaining = keyword.toLowerCase().replace(location, '').trim()
    return significantWords(remaining).size > 0 ? 'service_location' : 'location'
  }
  return 'service'
}

// ---------------------------------------------------------------------------
// Existing-page check (Phase 7 spec §2) — reuses the SAME KeywordPageMapping
// P0 already computed (mapKeywordsToPages), never re-scored here.
// ---------------------------------------------------------------------------
type ExistingPageOutcome =
  | { kind: 'strong'; url: string; confidence: ConfidenceLevel }
  | { kind: 'weak'; url: string; confidence: ConfidenceLevel }
  | { kind: 'none' }

function checkExistingPage(mapping: KeywordPageMapping): ExistingPageOutcome {
  if (mapping.status !== 'mapped' || !mapping.mappedUrl) return { kind: 'none' }
  if (mapping.relevanceScore >= STRONG_MATCH_SCORE || mapping.confidence === 'high') {
    return { kind: 'strong', url: mapping.mappedUrl, confidence: mapping.confidence }
  }
  return { kind: 'weak', url: mapping.mappedUrl, confidence: mapping.confidence }
}

/** Cannibalization protection (Phase 7 spec §7) — compares the proposed keyword against every OTHER validated mapping's keyword for high topical overlap pointing at a different existing page than the one already matched. */
function checkCannibalization(
  keyword: string,
  existingUrlForThisKeyword: string | null,
  allMappings: KeywordPageMapping[],
): { risk: CannibalizationRisk; conflictingUrl: string | null } {
  const needle = significantWords(keyword)
  for (const other of allMappings) {
    if (other.keyword === keyword || other.status !== 'mapped' || !other.mappedUrl) continue
    if (other.mappedUrl === existingUrlForThisKeyword) continue // the same page we already matched isn't a conflict
    const overlap = overlapFraction(needle, significantWords(other.keyword))
    if (overlap >= TOPIC_MATCH_THRESHOLD) {
      return { risk: 'potential_cannibalization', conflictingUrl: other.mappedUrl }
    }
  }
  return { risk: existingUrlForThisKeyword ? 'improve_existing' : 'safe_to_create', conflictingUrl: null }
}

/** Competitor evidence lookup (Phase 6 gaps) — null when nothing matches, never fabricated. */
function findCompetitorEvidence(keyword: string, gaps: GapItem[]): GapItem | null {
  const needle = significantWords(keyword)
  let best: { gap: GapItem; score: number } | null = null
  for (const gap of gaps) {
    const score = overlapFraction(needle, significantWords(gap.topic))
    if (score >= TOPIC_MATCH_THRESHOLD && (!best || score > best.score)) best = { gap, score }
  }
  return best?.gap ?? null
}

// ---------------------------------------------------------------------------
// Priority engine (Phase 7 spec §10) — deterministic score from commercial
// intent, existing-page gap, competitor coverage, and page-type relevance;
// capped at 'medium' when there's a real cannibalization risk so a risky
// duplicate is never pushed as the top priority.
// ---------------------------------------------------------------------------
const PRIORITY_RANK: Record<PageOpportunityPriority, number> = { high: 3, medium: 2, low: 1 }

function computePriority(
  intent: SearchIntent,
  opportunityType: PageOpportunityType,
  existingOutcome: ExistingPageOutcome,
  hasCompetitorEvidence: boolean,
  cannibalizationRisk: CannibalizationRisk,
): PageOpportunityPriority {
  let score = 0
  if (intent === 'local_transactional' || intent === 'transactional') score += 3
  else if (intent === 'commercial') score += 2
  else score += 1

  if (opportunityType === 'service' || opportunityType === 'service_location') score += 2
  else if (opportunityType === 'location') score += 1

  if (existingOutcome.kind === 'none') score += 2
  if (hasCompetitorEvidence) score += 2

  let priority: PageOpportunityPriority = score >= 6 ? 'high' : score >= 3 ? 'medium' : 'low'
  if (cannibalizationRisk === 'potential_cannibalization' && priority === 'high') priority = 'medium'
  return priority
}

function buildFromMapping(mapping: KeywordPageMapping, allMappings: KeywordPageMapping[], competitorGaps: GapItem[], options: BuildOptions): PageOpportunity {
  const existingOutcome = checkExistingPage(mapping)
  const intent = classifySearchIntent(mapping.keyword, 'service', options.isLocalBusiness, options.location)
  const opportunityType = classifyOpportunityType(mapping.keyword, intent, options)
  const gap = findCompetitorEvidence(mapping.keyword, competitorGaps)

  const existingUrl = existingOutcome.kind === 'none' ? null : existingOutcome.url
  const { risk, conflictingUrl } = checkCannibalization(mapping.keyword, existingUrl, allMappings)

  let action: PageOpportunityAction
  let suggestedUrl: string | null
  let reason: string
  if (existingOutcome.kind === 'strong') {
    action = 'optimize'
    suggestedUrl = null
    reason = `A strong existing page (${existingOutcome.url}) already targets this keyword (relevance ${mapping.relevanceScore}/100) — optimize it rather than creating a duplicate.`
  } else if (existingOutcome.kind === 'weak' || risk === 'potential_cannibalization') {
    action = 'improve'
    suggestedUrl = null
    reason =
      risk === 'potential_cannibalization'
        ? `Creating a new page risks cannibalizing ${conflictingUrl} — improve the existing closest match instead.`
        : `A partial match exists (${existingOutcome.kind === 'weak' ? existingOutcome.url : ''}, relevance ${mapping.relevanceScore}/100) — improve it before considering a new dedicated page.`
  } else {
    action = 'create'
    suggestedUrl = slugify(mapping.keyword)
    reason = gap
      ? `No suitable existing page targets this keyword, and competitor coverage exists — a dedicated page is likely to perform.`
      : `No suitable existing page targets this keyword.`
  }

  const priority = computePriority(intent, opportunityType, existingOutcome, gap !== null, risk)

  return {
    pageType: action === 'optimize' || action === 'improve' ? 'improve_existing' : opportunityType,
    suggestedTitle: toTitleCase(mapping.keyword),
    suggestedUrl,
    primaryKeyword: mapping.keyword,
    secondaryTopics: [],
    searchIntent: intent,
    priority,
    action,
    existingPage: existingUrl ?? conflictingUrl,
    competitorEvidence: gap?.evidence ?? null,
    reason,
    confidence: mapping.confidence,
    cannibalizationRisk: risk,
  }
}

/** Builds a create-page recommendation directly from a Phase 6 competitor gap that isn't already covered by a keyword-mapping-derived recommendation (checked by the caller via topic overlap dedup). */
function buildFromCompetitorGap(gap: GapItem, opportunityType: 'service' | 'location' | 'informational', allMappings: KeywordPageMapping[], options: BuildOptions): PageOpportunity {
  const intent = classifySearchIntent(gap.topic, 'service', options.isLocalBusiness, options.location)
  const { risk, conflictingUrl } = checkCannibalization(gap.topic, null, allMappings)
  const priority = computePriority(intent, opportunityType, { kind: 'none' }, true, risk)

  return {
    pageType: opportunityType,
    suggestedTitle: toTitleCase(gap.topic),
    suggestedUrl: risk === 'potential_cannibalization' ? null : slugify(gap.topic),
    primaryKeyword: gap.topic,
    secondaryTopics: [],
    searchIntent: intent,
    priority,
    action: risk === 'potential_cannibalization' ? 'improve' : 'create',
    existingPage: conflictingUrl,
    competitorEvidence: gap.evidence,
    reason:
      risk === 'potential_cannibalization'
        ? `Competitor coverage exists for this topic, but it overlaps an existing page (${conflictingUrl}) — improve that page instead of creating a new one.`
        : `Competitor coverage exists for this topic and no existing page targets it.`,
    confidence: gap.confidence,
    cannibalizationRisk: risk,
  }
}

export interface PageOpportunityResult {
  opportunities: PageOpportunity[]
}

export function buildPageOpportunities(
  keywordMappings: KeywordPageMapping[],
  competitorGaps: { serviceGaps: GapItem[]; locationGaps: GapItem[]; contentGaps: GapItem[] },
  options: BuildOptions,
): PageOpportunityResult {
  const allGaps = [...competitorGaps.serviceGaps, ...competitorGaps.locationGaps, ...competitorGaps.contentGaps]
  const fromKeywords = keywordMappings.map((m) => buildFromMapping(m, keywordMappings, allGaps, options))

  const coveredTopics = fromKeywords.map((o) => significantWords(o.primaryKeyword))
  const isAlreadyCovered = (topic: string) => {
    const words = significantWords(topic)
    return coveredTopics.some((c) => overlapFraction(words, c) >= TOPIC_MATCH_THRESHOLD)
  }

  const fromGaps: PageOpportunity[] = [
    ...competitorGaps.serviceGaps.filter((g) => !isAlreadyCovered(g.topic)).map((g) => buildFromCompetitorGap(g, 'service', keywordMappings, options)),
    ...competitorGaps.locationGaps.filter((g) => !isAlreadyCovered(g.topic)).map((g) => buildFromCompetitorGap(g, 'location', keywordMappings, options)),
    ...competitorGaps.contentGaps.filter((g) => !isAlreadyCovered(g.topic)).map((g) => buildFromCompetitorGap(g, 'informational', keywordMappings, options)),
  ]

  // Dedupe by suggestedUrl (Phase 7 spec: never propose the same URL twice)
  // and by primary keyword (never target the same keyword from two
  // recommendations) — first occurrence wins, since the keyword-mapping
  // source is built first and is the more authoritative one.
  const seenUrls = new Set<string>()
  const seenKeywords = new Set<string>()
  const deduped: PageOpportunity[] = []
  for (const o of [...fromKeywords, ...fromGaps]) {
    const keywordKey = o.primaryKeyword.toLowerCase().trim()
    if (seenKeywords.has(keywordKey)) continue
    if (o.suggestedUrl && seenUrls.has(o.suggestedUrl)) continue
    seenKeywords.add(keywordKey)
    if (o.suggestedUrl) seenUrls.add(o.suggestedUrl)
    deduped.push(o)
  }

  // Commercial pages first (Phase 7 spec §3): sort by priority, then by
  // page-type commercial value, never by generic blog volume.
  const TYPE_ORDER: Record<PageOpportunityType, number> = {
    service: 5,
    service_location: 4,
    location: 3,
    improve_existing: 2,
    faq: 1,
    informational: 0,
  }
  deduped.sort((a, b) => PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority] || TYPE_ORDER[b.pageType] - TYPE_ORDER[a.pageType])

  return { opportunities: deduped }
}
