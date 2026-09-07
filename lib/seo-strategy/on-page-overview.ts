// ──────────────────────────────────────────────────────────────────────────
// Phase 3 — deterministic on-page report overview: sitewide stats, category
// breakdowns, the on-page health score, and the priority fix list, all
// derived from the already-computed Phase 2A/2B structured audit data
// (PageOnPageAudit[] / OnPageSummary). Nothing here re-derives severity,
// duplicate detection, keyword relevance, indexability, or broken-link
// status — those stay exactly as Phase 2A/2B computed them. This module
// only AGGREGATES and SORTS that data for presentation; the AI never
// touches any value produced here (see each function's own note).
// ──────────────────────────────────────────────────────────────────────────
import type { SiteAnalysis } from '@/app/api/seo-strategy/analyze/route'
import { pickHighestSeverity, SEVERITY_RANK } from './severity'
import {
  CATEGORY_SCORE_WEIGHT,
  PAGE_IMPORTANCE_SCORE_WEIGHT,
  PRIORITY_FIX_MAX,
  scoreToStatus,
  SEVERITY_SCORE_PENALTY,
  type ScoreStatus,
} from './on-page-score-thresholds'
import type { PageImportance, PageOnPageAudit, Severity, SerpPixelStatus } from './types'
import type { EvidenceSource, FindingConfidence, FindingPriority } from './evidence'

/** Phase 4 — sitewide count of pages whose CURRENT title/description falls into each SERP display-fit bucket (never the raw issue count — one page contributes to at most one bucket, or none if "good"/"not_available"). */
export interface PixelDisplaySummary {
  tooLong: number
  tooShort: number
  /** borderline_short + borderline_long combined, per the Phase 4 overview's flat "Borderline" bucket. */
  borderline: number
}

export interface OnPageCategorySlice {
  /** Number of pages with at least one issue in this category — never the raw issue count. */
  affectedPages: number
  /** Raw count of individual issues in this category, sitewide — never confused with affectedPages (one page can contribute many). */
  issueCount: number
  /** Same `issueCount` total, broken down by the severity each issue's category carried on its page — always sums to `issueCount`. */
  bySeverity: { critical: number; high: number; medium: number; low: number }
}

export interface OnPageOverview {
  pagesDiscovered: number
  pagesCrawled: number
  pagesAudited: number
  pagesWithIssues: number
  totalIssues: number
  bySeverity: { critical: number; high: number; medium: number; low: number }
  categories: {
    metaTitle: OnPageCategorySlice
    metaDescription: OnPageCategorySlice
    headings: OnPageCategorySlice
    content: OnPageCategorySlice
    images: OnPageCategorySlice
    internalLinks: OnPageCategorySlice
    technical: OnPageCategorySlice
  }
  /** Deterministic 0-100 on-page health score — see computeSiteOnPageScore(). Never AI-generated. */
  score: number
  scoreStatus: ScoreStatus
  /** Phase 4 — sitewide SERP pixel-width display-fit counts for current titles/descriptions. */
  titleDisplay: PixelDisplaySummary
  descriptionDisplay: PixelDisplaySummary
}

export interface PageOnPageAuditWithScore extends PageOnPageAudit {
  onPageScore: number
  onPageScoreStatus: ScoreStatus
}

export interface AffectedPageEntry {
  url: string
  pageName: string
  importance: PageImportance
  severity: Severity
  /** Short, plain-language summary of what's wrong — not the full issue detail (that belongs in the page-by-page card). */
  summary: string
}

export interface PriorityFix {
  url: string
  pageName: string
  category: string
  severity: Severity
  /**
   * Phase 11 — how soon to act, distinct from `severity`: derived from
   * severity + the page's own importance (computePriority below), so a
   * low-severity issue on a high-importance page (e.g. the homepage) can
   * still outrank a high-severity issue on a low-importance page.
   */
  priority: FindingPriority
  /** The actual detected fact — e.g. "Missing meta description" — never an instruction. Always the real issue text from the Phase 2A/2B audit, never AI prose. */
  evidence: string
  /** Short, deterministic "why it matters" for this category — never a generic AI paragraph. */
  reason: string
  /** Concrete, specific recommended fix for this category — never "Improve SEO." */
  action: string
  /** Always High: this is a direct, structurally-detected crawl fact (a missing tag, a duplicate H1, etc.), not an inference. */
  confidence: FindingConfidence
  /** Always "crawled": every PriorityFix comes straight from the Phase 2A/2B audit of the live page. */
  source: EvidenceSource
}

// ---------------------------------------------------------------------------
// Category aggregation — issueCount vs affectedPages, kept strictly distinct
// per the explicit Phase 3 requirement (e.g. one page with 5 missing-alt
// images -> affectedPages: 1, issueCount: 5).
// ---------------------------------------------------------------------------
export function emptyOnPageCategorySlice(): OnPageCategorySlice {
  return { affectedPages: 0, issueCount: 0, bySeverity: { critical: 0, high: 0, medium: 0, low: 0 } }
}
const emptySlice = emptyOnPageCategorySlice

/**
 * Only critical/high/medium/low ever count toward affectedPages/issueCount/
 * bySeverity — 'info' (e.g. Twitter Card falling back to Open Graph),
 * 'pass', and 'not_evaluated' are not findings and must never be counted as
 * one in one place (issueCount) while silently dropped in another
 * (bySeverity), which would break the "bySeverity sums to issueCount"
 * invariant. Mirrors the same exclusion list already used by
 * on-page-audit.ts's addToSummary().
 */
function isCountableIssueSeverity(severity: Severity): boolean {
  return severity === 'critical' || severity === 'high' || severity === 'medium' || severity === 'low'
}

/** Adds `count` raw issues (already known to share `severity`, the category's own worst-issue severity) into a running severity tally — used for both the per-category and sitewide breakdowns so the two always stay consistent. */
function addSeverityCount(
  bySeverity: { critical: number; high: number; medium: number; low: number },
  severity: Severity,
  count: number,
): void {
  if (count <= 0 || !isCountableIssueSeverity(severity)) return
  if (severity === 'critical') bySeverity.critical += count
  else if (severity === 'high') bySeverity.high += count
  else if (severity === 'medium') bySeverity.medium += count
  else bySeverity.low += count
}

/** Records one category's issues on one page into both that category's slice and the sitewide severity tally, in one call so the two can never drift apart. Issues whose severity isn't a real finding (info/pass/not_evaluated) never count toward affectedPages or issueCount either — see isCountableIssueSeverity(). */
function accumulateSlice(
  slice: OnPageCategorySlice,
  bySeverity: OnPageOverview['bySeverity'],
  severity: Severity,
  issueLength: number,
): void {
  if (issueLength <= 0 || !isCountableIssueSeverity(severity)) return
  slice.affectedPages += 1
  slice.issueCount += issueLength
  addSeverityCount(slice.bySeverity, severity, issueLength)
  addSeverityCount(bySeverity, severity, issueLength)
}

/** Total raw issue count across a page's flagged images — each ImageIssueDetail can itself carry multiple findings (missing alt, oversized, legacy format, weak filename, …), so the count is the sum of each entry's own `issues.length`, never the number of flagged images. */
function countImageIssues(images: PageOnPageAudit['images']): number {
  return images.issues.reduce((sum, detail) => sum + detail.issues.length, 0)
}

/** The indexability sub-check always populates `reasons` with exactly one entry — including the positive "No blocking directive found…" reason on a pass, and a "couldn't be evaluated" reason when not_evaluated — so its raw count only reflects a real finding when its severity is one of critical/high/medium/low. */
function countIndexabilityIssues(indexability: PageOnPageAudit['technicalOnPage']['indexability']): number {
  return isCountableIssueSeverity(indexability.severity) ? indexability.reasons.length : 0
}

function emptyPixelDisplaySummary(): PixelDisplaySummary {
  return { tooLong: 0, tooShort: 0, borderline: 0 }
}

/** Tallies one page's CURRENT title/description pixel status into the sitewide display-fit summary — "good" and "not_available" contribute to neither bucket. */
function addPixelDisplayStatus(summary: PixelDisplaySummary, status: SerpPixelStatus): void {
  if (status === 'too_long') summary.tooLong += 1
  else if (status === 'too_short') summary.tooShort += 1
  else if (status === 'borderline_short' || status === 'borderline_long') summary.borderline += 1
}

export function buildOnPageOverview(analysis: SiteAnalysis, audits: PageOnPageAudit[]): OnPageOverview {
  const categories: OnPageOverview['categories'] = {
    metaTitle: emptySlice(),
    metaDescription: emptySlice(),
    headings: emptySlice(),
    content: emptySlice(),
    images: emptySlice(),
    internalLinks: emptySlice(),
    technical: emptySlice(),
  }
  const bySeverity = { critical: 0, high: 0, medium: 0, low: 0 }
  const titleDisplay = emptyPixelDisplaySummary()
  const descriptionDisplay = emptyPixelDisplaySummary()
  let pagesWithIssues = 0

  for (const a of audits) {
    let pageHasIssue = false

    // Meta title / description — one issues[] array per page, one severity.
    if (a.metaTitle.issues.length > 0) {
      accumulateSlice(categories.metaTitle, bySeverity, a.metaTitle.severity, a.metaTitle.issues.length)
      pageHasIssue = true
    }
    if (a.metaDescription.issues.length > 0) {
      accumulateSlice(categories.metaDescription, bySeverity, a.metaDescription.severity, a.metaDescription.issues.length)
      pageHasIssue = true
    }
    // Phase 4 — SERP display-fit is a separate signal from the semantic
    // quality issues above (see types.ts's MetaTitleAudit note), so it's
    // tallied independently rather than folded into the metaTitle/
    // metaDescription category slices.
    addPixelDisplayStatus(titleDisplay, a.metaTitle.pixelStatus)
    addPixelDisplayStatus(descriptionDisplay, a.metaDescription.pixelStatus)

    // Headings — combines H1 + H2/H3 structure into a single presentation
    // category per the Phase 3 overview shape; each keeps its own severity.
    const headingIssueCount = a.h1.issues.length + a.headings.issues.length
    if (headingIssueCount > 0) {
      categories.headings.affectedPages += 1
      categories.headings.issueCount += headingIssueCount
      addSeverityCount(categories.headings.bySeverity, a.h1.severity, a.h1.issues.length)
      addSeverityCount(categories.headings.bySeverity, a.headings.severity, a.headings.issues.length)
      addSeverityCount(bySeverity, a.h1.severity, a.h1.issues.length)
      addSeverityCount(bySeverity, a.headings.severity, a.headings.issues.length)
      pageHasIssue = true
    }

    if (a.content.issues.length > 0) {
      accumulateSlice(categories.content, bySeverity, a.content.severity, a.content.issues.length)
      pageHasIssue = true
    }

    // Images — issues[] is ImageIssueDetail[] (one entry per flagged image),
    // and each entry can itself carry several findings (missing alt,
    // oversized, legacy format, weak filename, …) — count them all, not
    // just the number of flagged images.
    const imageIssueCount = countImageIssues(a.images)
    if (imageIssueCount > 0) {
      accumulateSlice(categories.images, bySeverity, a.images.severity, imageIssueCount)
      pageHasIssue = true
    }

    if (a.internalLinks.issues.length > 0) {
      accumulateSlice(categories.internalLinks, bySeverity, a.internalLinks.severity, a.internalLinks.issues.length)
      pageHasIssue = true
    }

    // Technical — sum of its 7 sub-checks' own issues[] arrays. Each pair is
    // filtered through isCountableIssueSeverity() inside addSeverityCount()/
    // accumulateSlice() (indexability's `reasons` in particular always has
    // one entry even on a pass, via countIndexabilityIssues()), so an
    // info/pass/not_evaluated sub-check never inflates the technical count.
    const tech = a.technicalOnPage
    const techSubChecks: [Severity, number][] = [
      [tech.canonical.severity, tech.canonical.issues.length],
      [tech.indexability.severity, countIndexabilityIssues(tech.indexability)],
      [tech.statusCode.severity, tech.statusCode.issues.length],
      [tech.schema.severity, tech.schema.issues.length],
      [tech.openGraph.severity, tech.openGraph.issues.length],
      [tech.twitter.severity, tech.twitter.issues.length],
      [tech.urlStructure.severity, tech.urlStructure.issues.length],
    ]
    const techIssueCount = techSubChecks.reduce(
      (sum, [severity, count]) => sum + (isCountableIssueSeverity(severity) ? count : 0),
      0,
    )
    if (techIssueCount > 0) {
      categories.technical.affectedPages += 1
      categories.technical.issueCount += techIssueCount
      for (const [severity, count] of techSubChecks) {
        addSeverityCount(categories.technical.bySeverity, severity, count)
        addSeverityCount(bySeverity, severity, count)
      }
      pageHasIssue = true
    }

    if (pageHasIssue) pagesWithIssues += 1
  }

  const totalIssues = bySeverity.critical + bySeverity.high + bySeverity.medium + bySeverity.low
  const score = computeSiteOnPageScore(audits)

  return {
    pagesDiscovered: analysis.discoveredUrlCount,
    pagesCrawled: analysis.totalPagesCrawled,
    pagesAudited: audits.length,
    pagesWithIssues,
    totalIssues,
    bySeverity,
    categories,
    score,
    scoreStatus: scoreToStatus(score),
    titleDisplay,
    descriptionDisplay,
  }
}

// ---------------------------------------------------------------------------
// Scoring — deterministic, weighted by category importance and page
// importance, normalized per-category (one deduction per category based on
// its OWN worst severity, not per raw issue) so a page with many low-
// severity findings in one category can't crater its score, and so a single
// low-importance page can't crater the sitewide score either.
// ---------------------------------------------------------------------------
export function computePageOnPageScore(audit: PageOnPageAudit): number {
  const deductions =
    SEVERITY_SCORE_PENALTY[audit.metaTitle.severity] * CATEGORY_SCORE_WEIGHT.metaTitle +
    SEVERITY_SCORE_PENALTY[audit.metaDescription.severity] * CATEGORY_SCORE_WEIGHT.metaDescription +
    SEVERITY_SCORE_PENALTY[audit.h1.severity] * CATEGORY_SCORE_WEIGHT.h1 +
    SEVERITY_SCORE_PENALTY[audit.headings.severity] * CATEGORY_SCORE_WEIGHT.headings +
    SEVERITY_SCORE_PENALTY[audit.content.severity] * CATEGORY_SCORE_WEIGHT.content +
    SEVERITY_SCORE_PENALTY[audit.images.severity] * CATEGORY_SCORE_WEIGHT.images +
    SEVERITY_SCORE_PENALTY[audit.internalLinks.severity] * CATEGORY_SCORE_WEIGHT.internalLinks +
    SEVERITY_SCORE_PENALTY[audit.technicalOnPage.severity] * CATEGORY_SCORE_WEIGHT.technicalOnPage

  return Math.max(0, Math.min(100, Math.round(100 - deductions)))
}

export function attachPageScores(audits: PageOnPageAudit[]): PageOnPageAuditWithScore[] {
  return audits.map((a) => {
    const onPageScore = computePageOnPageScore(a)
    return { ...a, onPageScore, onPageScoreStatus: scoreToStatus(onPageScore) }
  })
}

/** Sitewide score = page scores averaged, weighted by page importance — see PAGE_IMPORTANCE_SCORE_WEIGHT. */
export function computeSiteOnPageScore(audits: PageOnPageAudit[]): number {
  if (audits.length === 0) return 0
  let weightedSum = 0
  let totalWeight = 0
  for (const a of audits) {
    const weight = PAGE_IMPORTANCE_SCORE_WEIGHT[a.importance]
    weightedSum += computePageOnPageScore(a) * weight
    totalWeight += weight
  }
  return Math.max(0, Math.min(100, Math.round(weightedSum / totalWeight)))
}

// ---------------------------------------------------------------------------
// Severity-based sorting — Critical -> High -> Medium -> Low -> Info -> Pass,
// then by page importance (high first), then by issue count. Reuses
// SEVERITY_RANK (severity.ts) rather than re-deriving a severity order.
// ---------------------------------------------------------------------------
const IMPORTANCE_RANK: Record<PageImportance, number> = { high: 2, medium: 1, low: 0 }

export function compareBySeverityThenImportance(
  a: { severity: Severity; importance: PageImportance; issueCount: number },
  b: { severity: Severity; importance: PageImportance; issueCount: number },
): number {
  const severityDiff = SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity]
  if (severityDiff !== 0) return severityDiff
  const importanceDiff = IMPORTANCE_RANK[b.importance] - IMPORTANCE_RANK[a.importance]
  if (importanceDiff !== 0) return importanceDiff
  return b.issueCount - a.issueCount
}

/** Builds the sorted "affected pages" list for one category — shared by every category card/list in the report so sort order is identical everywhere. */
export function buildAffectedPageList(
  audits: PageOnPageAudit[],
  getIssues: (a: PageOnPageAudit) => { severity: Severity; count: number; summary: string },
): AffectedPageEntry[] {
  const entries: (AffectedPageEntry & { issueCount: number })[] = []
  for (const a of audits) {
    const { severity, count, summary } = getIssues(a)
    if (count <= 0) continue
    entries.push({ url: a.url, pageName: a.pageName, importance: a.importance, severity, summary, issueCount: count })
  }
  entries.sort((x, y) => compareBySeverityThenImportance(x, y))
  return entries.map(({ issueCount: _issueCount, ...rest }) => rest)
}

// ---------------------------------------------------------------------------
// Priority fix list — top 5-10 highest-value fixes, sorted deterministically
// (severity, then page importance, then issue count). The AI never reorders
// or selects this list.
//
// Phase 11 — `priority` is computed from severity + page importance, kept
// strictly separate from `severity` itself (spec §5): a low/medium-severity
// issue on a high-importance page (e.g. the homepage) can still land at
// Medium/High priority, exactly like the spec's own example.
// ---------------------------------------------------------------------------
const FIX_SEVERITY_WEIGHT: Record<Severity, number> = { critical: 4, high: 3, medium: 2, low: 1, info: 0, pass: 0, not_evaluated: 0 }
const FIX_IMPORTANCE_WEIGHT: Record<PageImportance, number> = { high: 2, medium: 1, low: 0 }

function computeFixPriority(severity: Severity, importance: PageImportance): FindingPriority {
  if (severity === 'critical') return 'high'
  const score = FIX_SEVERITY_WEIGHT[severity] + FIX_IMPORTANCE_WEIGHT[importance]
  if (score >= 4) return 'high'
  if (score >= 2) return 'medium'
  return 'low'
}

/**
 * Codex fix — the list must actually be ordered (and truncated to
 * PRIORITY_FIX_MAX) by the computed `priority`, not just labeled with it.
 * Sorting by severity/importance alone let a Medium-priority fix on a
 * high-severity/low-importance page rank above a High-priority fix on a
 * medium-severity/high-importance page, and could drop the High-priority
 * one past the truncation cutoff entirely.
 */
const FIX_PRIORITY_RANK: Record<FindingPriority, number> = { high: 3, medium: 2, low: 1 }

function compareByPriorityThenSeverity(
  x: { priority: FindingPriority; severity: Severity; importance: PageImportance; issueCount: number },
  y: { priority: FindingPriority; severity: Severity; importance: PageImportance; issueCount: number },
): number {
  const priorityDiff = FIX_PRIORITY_RANK[y.priority] - FIX_PRIORITY_RANK[x.priority]
  if (priorityDiff !== 0) return priorityDiff
  return compareBySeverityThenImportance(x, y)
}

/** Deterministic, category-level "why it matters" / "recommended action" text — never AI-generated, never a generic "Improve SEO." */
const CATEGORY_REASON: Record<string, string> = {
  'Meta Title': 'The title tag is a primary ranking and click-through signal in search results.',
  'Meta Description': 'The meta description influences click-through rate from search results even though it is not a direct ranking factor.',
  H1: "The H1 heading helps both users and search engines understand the page's main topic.",
  'Heading Structure': 'A clear heading hierarchy helps search engines parse page structure and content relevance.',
  Content: "Thin or duplicate content reduces the page's ability to rank for its target topic.",
  Images: 'Missing alt text and oversized images hurt accessibility, image search visibility, and page speed.',
  'Internal Linking': 'Internal links help both users and search engines discover and understand the importance of this page.',
  Technical: 'Technical issues can prevent the page from being properly crawled, indexed, or understood by search engines.',
}

const CATEGORY_ACTION: Record<string, string> = {
  'Meta Title': 'Rewrite the title to be unique, descriptive, and roughly 50-60 characters.',
  'Meta Description': 'Add or rewrite a unique meta description roughly 140-160 characters long.',
  H1: "Add a single, descriptive H1 that reflects the page's main topic.",
  'Heading Structure': 'Fix the heading hierarchy so H2s/H3s follow a logical order without skipping levels.',
  Content: 'Expand thin content, or de-duplicate content that overlaps with another page.',
  Images: 'Add descriptive alt text to affected images and compress oversized files.',
  'Internal Linking': 'Add 2-3 relevant contextual internal links from related pages.',
  Technical: 'Resolve the specific technical issue named above (canonical, indexability, status code, schema, Open Graph, Twitter, or URL structure).',
}

function pushCategoryFixes(
  out: (PriorityFix & { importance: PageImportance; issueCount: number })[],
  a: PageOnPageAudit,
  category: string,
  severity: Severity,
  issueCount: number,
  evidence: string,
  overrides?: { confidence?: FindingConfidence; action?: string },
): void {
  if (issueCount <= 0) return
  if (severity !== 'critical' && severity !== 'high' && severity !== 'medium') return
  out.push({
    url: a.url,
    pageName: a.pageName,
    category,
    severity,
    priority: computeFixPriority(severity, a.importance),
    evidence,
    reason: CATEGORY_REASON[category] ?? '',
    action: overrides?.action ?? CATEGORY_ACTION[category] ?? '',
    confidence: overrides?.confidence ?? 'high',
    source: 'crawled',
    importance: a.importance,
    issueCount,
  })
}

/**
 * Codex fix — the category's fixed action text assumed every Internal
 * Linking issue was an orphan page needing more inbound links, but the
 * category also covers broken outgoing links and weak linking, each of
 * which needs a different fix. Chooses the action from the actual audit
 * fields, never from a single fixed string for the whole category.
 */
function internalLinkingAction(links: PageOnPageAudit['internalLinks']): string {
  if (links.brokenLinks.length > 0) return 'Fix or remove the broken internal link(s) identified in the evidence above.'
  if (links.orphan) return 'Add 2-3 relevant contextual internal links pointing to this page from related pages.'
  if (links.weaklyLinked) return 'Add more contextual internal links pointing to this page to strengthen its internal link equity.'
  return 'Review and resolve the flagged internal-linking issue.'
}

/**
 * Codex fix — an apparent orphan page is only Medium confidence when the
 * crawl coverage was partial (orphanConfidence, set by the Phase 2B
 * internal-link audit itself, reflects exactly this) — a missing inbound
 * link can be a crawl artifact rather than a real orphan in that case, so
 * it must never be presented at the same High confidence as a directly
 * observed fact.
 */
function internalLinkingConfidence(links: PageOnPageAudit['internalLinks']): FindingConfidence {
  if (links.orphan && links.orphanConfidence) return links.orphanConfidence
  return 'high'
}

export function buildPriorityFixes(audits: PageOnPageAudit[]): PriorityFix[] {
  const candidates: (PriorityFix & { importance: PageImportance; issueCount: number })[] = []

  for (const a of audits) {
    pushCategoryFixes(candidates, a, 'Meta Title', a.metaTitle.severity, a.metaTitle.issues.length, a.metaTitle.issues[0] ?? '')
    pushCategoryFixes(
      candidates,
      a,
      'Meta Description',
      a.metaDescription.severity,
      a.metaDescription.issues.length,
      a.metaDescription.issues[0] ?? '',
    )
    pushCategoryFixes(candidates, a, 'H1', a.h1.severity, a.h1.issues.length, a.h1.issues[0] ?? '')
    pushCategoryFixes(candidates, a, 'Heading Structure', a.headings.severity, a.headings.issues.length, a.headings.issues[0] ?? '')
    pushCategoryFixes(candidates, a, 'Content', a.content.severity, a.content.issues.length, a.content.issues[0] ?? '')
    pushCategoryFixes(
      candidates,
      a,
      'Images',
      a.images.severity,
      countImageIssues(a.images),
      a.images.issues[0]?.issues[0] ?? 'Fix flagged images.',
    )
    pushCategoryFixes(
      candidates,
      a,
      'Internal Linking',
      a.internalLinks.severity,
      a.internalLinks.issues.length,
      a.internalLinks.issues[0] ?? '',
      { confidence: internalLinkingConfidence(a.internalLinks), action: internalLinkingAction(a.internalLinks) },
    )
    const tech = a.technicalOnPage
    // Pick the fix text from whichever sub-check actually carries `tech.severity`
    // (its worst finding) — not just the first sub-check with any array
    // content, which can be a pass-state reason (e.g. indexability's "No
    // blocking directive found…") that outranks a real medium/high issue.
    const techSubChecksForFix: { severity: Severity; text: string | undefined; count: number }[] = [
      { severity: tech.canonical.severity, text: tech.canonical.issues[0], count: tech.canonical.issues.length },
      { severity: tech.indexability.severity, text: tech.indexability.reasons[0], count: countIndexabilityIssues(tech.indexability) },
      { severity: tech.statusCode.severity, text: tech.statusCode.issues[0], count: tech.statusCode.issues.length },
      { severity: tech.schema.severity, text: tech.schema.issues[0], count: tech.schema.issues.length },
      { severity: tech.openGraph.severity, text: tech.openGraph.issues[0], count: tech.openGraph.issues.length },
      { severity: tech.twitter.severity, text: tech.twitter.issues[0], count: tech.twitter.issues.length },
      { severity: tech.urlStructure.severity, text: tech.urlStructure.issues[0], count: tech.urlStructure.issues.length },
    ]
    const techIssueCount = techSubChecksForFix.reduce(
      (sum, s) => sum + (isCountableIssueSeverity(s.severity) ? s.count : 0),
      0,
    )
    const worstTechSubCheck = techSubChecksForFix.find((s) => s.severity === tech.severity && s.text)
    const techIssue = worstTechSubCheck?.text ?? techSubChecksForFix.find((s) => isCountableIssueSeverity(s.severity) && s.text)?.text ?? ''
    pushCategoryFixes(candidates, a, 'Technical', tech.severity, techIssueCount, techIssue)
  }

  candidates.sort((x, y) => compareByPriorityThenSeverity(x, y))

  return candidates.slice(0, PRIORITY_FIX_MAX).map(({ importance: _importance, issueCount: _issueCount, ...rest }) => rest)
}

/** Re-exported for pages that only need the highest severity across a page's categories (e.g. the page-by-page card header) without re-deriving it. */
export function pageOverallSeverity(a: PageOnPageAudit): Severity {
  return pickHighestSeverity([
    a.metaTitle.severity,
    a.metaDescription.severity,
    a.h1.severity,
    a.headings.severity,
    a.content.severity,
    a.images.severity,
    a.internalLinks.severity,
    a.technicalOnPage.severity,
  ])
}
