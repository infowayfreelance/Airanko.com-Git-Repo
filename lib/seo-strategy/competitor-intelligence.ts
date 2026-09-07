// ──────────────────────────────────────────────────────────────────────────
// Phase 6 — deterministic, evidence-based competitor comparison. Every
// number here comes from an actual crawl (this site's own Phase 2B audit,
// or a competitor's CompetitorProfile from competitor-analyze/route.ts) —
// never AI-guessed. The AI is never the source of truth for competitor
// strengths/weaknesses/gaps/opportunities; see route.ts for how this
// overrides the AI's free-text competitorAnalysis fields.
// ──────────────────────────────────────────────────────────────────────────
import type { CompetitorPageInfo, CompetitorProfile } from '@/app/api/seo-strategy/competitor-analyze/route'
import { DEDICATED_PAGE_MIN_WORDS } from './competitor-classify'
import type { ConfidenceLevel, PageOnPageAudit } from './types'

export type OpportunityPriority = 'high' | 'medium' | 'low'

export interface GapItem {
  topic: string
  opportunity: string
  evidence: string
  competitorUrls: string[]
  confidence: ConfidenceLevel
  priority: OpportunityPriority
}

export interface EvidenceStatement {
  statement: string
  evidence: string
  /** Domain of the competitor this comparison was made against — lets callers (e.g. the per-competitor report card) filter to just their own statements. */
  competitorDomain: string
}

export interface CompetitorComparisonRow {
  domain: string
  status: CompetitorProfile['status']
  servicePages: number | null
  locationPages: number | null
  blogPages: number | null
  schemaCoverage: number | null
}

export interface CompetitorIntelligence {
  target: {
    servicePages: number
    locationPages: number
    blogPages: number
    schemaCoverage: number | null
  }
  comparison: CompetitorComparisonRow[]
  serviceGaps: GapItem[]
  locationGaps: GapItem[]
  contentGaps: GapItem[]
  /** Competitor strengths — always evidence-backed counts, never a vague quality claim. */
  strengths: EvidenceStatement[]
  /** Competitor weaknesses — the same comparisons as `advantages`, framed about the competitor rather than the target. */
  weaknesses: EvidenceStatement[]
  /** The target site's own advantages over competitors — same evidence-based rule. */
  advantages: EvidenceStatement[]
  /** Top opportunities merged from all gap categories, ranked by priority. */
  opportunities: GapItem[]
}

// ---------------------------------------------------------------------------
// Topic matching — simple significant-word overlap, the same "don't build a
// content-classification model" posture as page-type.ts. Good enough to
// tell "Towing Service Darlington" apart from "Contact Us", not a semantic
// similarity model.
// ---------------------------------------------------------------------------
const STOPWORDS = new Set(['the', 'and', 'for', 'with', 'from', 'that', 'this', 'your', 'our', 'you', 'are', 'services', 'service'])

function significantWords(text: string): Set<string> {
  const words = (text.toLowerCase().match(/[a-z0-9]+/g) ?? []).filter((w) => w.length >= 4 && !STOPWORDS.has(w))
  return new Set(words)
}

/** Fraction of `needle`'s significant words also present in `haystack` — asymmetric on purpose: "does the target page's title cover most of the competitor topic's key terms?" */
function topicOverlap(needle: Set<string>, haystack: Set<string>): number {
  if (needle.size === 0) return 0
  let hits = 0
  for (const w of needle) if (haystack.has(w)) hits++
  return hits / needle.size
}

const TOPIC_MATCH_THRESHOLD = 0.5

function targetPageTopicWords(a: PageOnPageAudit): Set<string> {
  return significantWords(`${a.metaTitle.currentValue ?? ''} ${a.h1.values.join(' ')}`)
}

function competitorPageTopicWords(p: CompetitorPageInfo): Set<string> {
  return significantWords(`${p.title ?? ''} ${p.h1 ?? ''}`)
}

function hasTargetMatch(competitorPage: CompetitorPageInfo, targetPages: PageOnPageAudit[]): boolean {
  const needle = competitorPageTopicWords(competitorPage)
  return targetPages.some((t) => topicOverlap(needle, targetPageTopicWords(t)) >= TOPIC_MATCH_THRESHOLD)
}

function topicLabel(p: CompetitorPageInfo): string {
  return p.title?.trim() || p.h1?.trim() || p.url
}

// ---------------------------------------------------------------------------
// Priority scoring — deterministic, never AI-assigned (Phase 6 spec §11).
// Weighted by how many competitors share the gap and how commercially
// important the page type typically is (service > location > blog/other).
// ---------------------------------------------------------------------------
function priorityFromScore(competitorCount: number, pageType: CompetitorPageInfo['pageType']): OpportunityPriority {
  const typeWeight = pageType === 'service' ? 3 : pageType === 'location' ? 2 : 1
  const score = competitorCount * 2 + typeWeight
  // A single competitor with dedicated service coverage already scores high
  // (1*2 + 3 = 5) — commercial service gaps don't need multiple
  // competitors' worth of evidence to matter. A single location gap (4) or
  // blog/content gap (3) needs corroboration from more competitors before
  // it crosses into high, reflecting their lower commercial urgency.
  if (score >= 5) return 'high'
  if (score >= 3) return 'medium'
  return 'low'
}

/** Groups one page type's dedicated-content gaps across all evaluated competitors into one GapItem per distinct topic (so 3 competitors covering the same topic produce one prioritized opportunity, not three). */
function buildGapsForType(
  pageType: CompetitorPageInfo['pageType'],
  competitors: CompetitorProfile[],
  targetPages: PageOnPageAudit[],
): GapItem[] {
  const byTopic = new Map<string, { pages: CompetitorPageInfo[] }>()

  for (const c of competitors) {
    if (c.status !== 'evaluated') continue
    for (const p of c.pages) {
      if (p.pageType !== pageType) continue
      if (p.wordCount < DEDICATED_PAGE_MIN_WORDS) continue // a passing mention isn't a dedicated page — Phase 6 spec §5
      if (hasTargetMatch(p, targetPages)) continue
      const label = topicLabel(p)
      const key = label.toLowerCase()
      const entry = byTopic.get(key) ?? { pages: [] }
      entry.pages.push(p)
      byTopic.set(key, entry)
    }
  }

  const gaps: GapItem[] = []
  for (const [, { pages }] of byTopic) {
    const label = topicLabel(pages[0])
    const competitorCount = pages.length
    const confidence: ConfidenceLevel = pages.some((p) => p.confidence === 'high') ? 'high' : pages.every((p) => p.confidence === 'low') ? 'low' : 'medium'
    gaps.push({
      topic: label,
      opportunity: `Create a dedicated ${pageType} page covering "${label}".`,
      evidence: `${competitorCount} competitor page${competitorCount === 1 ? '' : 's'} (${pages.map((p) => `${p.wordCount} words`).join(', ')}) cover this topic with a dedicated page; no equivalent page was found on your site.`,
      competitorUrls: pages.map((p) => p.url),
      confidence,
      priority: priorityFromScore(competitorCount, pageType),
    })
  }

  gaps.sort((a, b) => (a.priority === b.priority ? b.competitorUrls.length - a.competitorUrls.length : PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority]))
  return gaps
}

const PRIORITY_RANK: Record<OpportunityPriority, number> = { high: 2, medium: 1, low: 0 }

// ---------------------------------------------------------------------------
// Strengths / advantages — one evidence-backed statement per meaningfully
// large gap in a measured metric. "Meaningful" requires BOTH a raw
// difference of at least `minDiff` AND a meaningful difference in rate
// (count / pages crawled) — the target's crawl (quick mode: ~9 pages) and
// a competitor's crawl (up to 16 pages) are different-sized samples, so
// comparing raw counts alone would make a competitor's larger sample look
// "ahead" on every metric regardless of the actual site. Percentage
// metrics (schema coverage) are already rates, so they skip the ratio
// check and use `minDiff` as a point-difference threshold directly.
// ---------------------------------------------------------------------------
function compareMetric(
  label: string,
  targetValue: number,
  targetSampleSize: number,
  competitorValue: number,
  competitorSampleSize: number,
  competitorDomain: string,
  minDiff = 2,
  isRate = false,
): { strength?: EvidenceStatement; weakness?: EvidenceStatement; advantage?: EvidenceStatement } {
  const diff = competitorValue - targetValue
  const targetRate = isRate ? targetValue : targetSampleSize > 0 ? targetValue / targetSampleSize : 0
  const competitorRate = isRate ? competitorValue : competitorSampleSize > 0 ? competitorValue / competitorSampleSize : 0
  const rateDiff = competitorRate - targetRate
  const minRateDiff = isRate ? minDiff : 0.1 // a >=10-percentage-point difference in share of crawled pages

  if (diff >= minDiff && rateDiff >= minRateDiff) {
    // Competitor ahead on this metric — a strength for them.
    return {
      strength: {
        statement: `${competitorDomain} has more ${label} than your site.`,
        evidence: `${competitorValue} ${label} detected on ${competitorDomain} (of ${competitorSampleSize} pages crawled) vs ${targetValue} on your site (of ${targetSampleSize} pages crawled).`,
        competitorDomain,
      },
    }
  }
  if (-diff >= minDiff && -rateDiff >= minRateDiff) {
    // Target ahead on this metric — a weakness for the competitor, and an advantage for the target (same fact, two framings for two report sections).
    const evidence = `${targetValue} ${label} detected on your site (of ${targetSampleSize} pages crawled) vs ${competitorValue} on ${competitorDomain} (of ${competitorSampleSize} pages crawled).`
    return {
      weakness: { statement: `${competitorDomain} has fewer ${label} than your site.`, evidence, competitorDomain },
      advantage: { statement: `Your site has more ${label} than ${competitorDomain}.`, evidence, competitorDomain },
    }
  }
  return {}
}

export function buildCompetitorIntelligence(targetPages: PageOnPageAudit[], competitors: CompetitorProfile[]): CompetitorIntelligence {
  const target = {
    servicePages: targetPages.filter((p) => p.content.pageType === 'service').length,
    locationPages: targetPages.filter((p) => p.content.pageType === 'location').length,
    blogPages: targetPages.filter((p) => p.content.pageType === 'blog').length,
    schemaCoverage:
      targetPages.length > 0 ? Math.round((targetPages.filter((p) => p.technicalOnPage.schema.present).length / targetPages.length) * 100) : null,
  }

  const comparison: CompetitorComparisonRow[] = competitors.map((c) => ({
    domain: c.domain ?? c.inputUrl,
    status: c.status,
    servicePages: c.status === 'evaluated' ? c.servicePages : null,
    locationPages: c.status === 'evaluated' ? c.locationPages : null,
    blogPages: c.status === 'evaluated' ? c.blogPages : null,
    schemaCoverage: c.status === 'evaluated' ? c.schemaCoverage : null,
  }))

  const serviceGaps = buildGapsForType('service', competitors, targetPages)
  const locationGaps = buildGapsForType('location', competitors, targetPages)
  const contentGaps = buildGapsForType('blog', competitors, targetPages)

  const strengths: EvidenceStatement[] = []
  const weaknesses: EvidenceStatement[] = []
  const advantages: EvidenceStatement[] = []
  for (const c of competitors) {
    if (c.status !== 'evaluated') continue
    const domain = c.domain ?? c.inputUrl
    const metrics: [string, number, number][] = [
      ['dedicated service pages', target.servicePages, c.servicePages],
      ['location pages', target.locationPages, c.locationPages],
      ['blog/content pages', target.blogPages, c.blogPages],
    ]
    for (const [label, targetValue, competitorValue] of metrics) {
      const { strength, weakness, advantage } = compareMetric(label, targetValue, targetPages.length, competitorValue, c.pagesCrawled, domain)
      if (strength) strengths.push(strength)
      if (weakness) weaknesses.push(weakness)
      if (advantage) advantages.push(advantage)
    }
    if (target.schemaCoverage !== null && c.schemaCoverage !== null) {
      const { strength, weakness, advantage } = compareMetric(
        'schema coverage (%)',
        target.schemaCoverage,
        targetPages.length,
        c.schemaCoverage,
        c.pagesCrawled,
        domain,
        15,
        true,
      )
      if (strength) strengths.push(strength)
      if (weakness) weaknesses.push(weakness)
      if (advantage) advantages.push(advantage)
    }
  }

  const opportunities = [...serviceGaps, ...locationGaps, ...contentGaps]
    .sort((a, b) => PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority])
    .slice(0, 10)

  return { target, comparison, serviceGaps, locationGaps, contentGaps, strengths, weaknesses, advantages, opportunities }
}
