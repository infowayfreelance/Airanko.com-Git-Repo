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
import type { PageImportance, PageOnPageAudit, Severity } from './types'

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
  /** One concise, actionable sentence — never long AI prose. */
  fix: string
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

/** Adds `count` raw issues (already known to share `severity`, the category's own worst-issue severity) into a running severity tally — used for both the per-category and sitewide breakdowns so the two always stay consistent. */
function addSeverityCount(
  bySeverity: { critical: number; high: number; medium: number; low: number },
  severity: Severity,
  count: number,
): void {
  if (count <= 0) return
  if (severity === 'critical') bySeverity.critical += count
  else if (severity === 'high') bySeverity.high += count
  else if (severity === 'medium') bySeverity.medium += count
  else if (severity === 'low') bySeverity.low += count
  // 'info' / 'pass' / 'not_evaluated' issues never reach this — categories
  // only carry a non-empty issues[] when there's something to report.
}

/** Records one category's issues on one page into both that category's slice and the sitewide severity tally, in one call so the two can never drift apart. */
function accumulateSlice(
  slice: OnPageCategorySlice,
  bySeverity: OnPageOverview['bySeverity'],
  severity: Severity,
  issueLength: number,
): void {
  if (issueLength <= 0) return
  slice.affectedPages += 1
  slice.issueCount += issueLength
  addSeverityCount(slice.bySeverity, severity, issueLength)
  addSeverityCount(bySeverity, severity, issueLength)
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
    // so its length is already a per-image raw issue count.
    if (a.images.issues.length > 0) {
      accumulateSlice(categories.images, bySeverity, a.images.severity, a.images.issues.length)
      pageHasIssue = true
    }

    if (a.internalLinks.issues.length > 0) {
      accumulateSlice(categories.internalLinks, bySeverity, a.internalLinks.severity, a.internalLinks.issues.length)
      pageHasIssue = true
    }

    // Technical — sum of its 7 sub-checks' own issues[] arrays.
    const tech = a.technicalOnPage
    const techIssueCount =
      tech.canonical.issues.length +
      tech.indexability.reasons.length +
      tech.statusCode.issues.length +
      tech.schema.issues.length +
      tech.openGraph.issues.length +
      tech.twitter.issues.length +
      tech.urlStructure.issues.length
    if (techIssueCount > 0) {
      categories.technical.affectedPages += 1
      categories.technical.issueCount += techIssueCount
      for (const [severity, count] of [
        [tech.canonical.severity, tech.canonical.issues.length],
        [tech.indexability.severity, tech.indexability.reasons.length],
        [tech.statusCode.severity, tech.statusCode.issues.length],
        [tech.schema.severity, tech.schema.issues.length],
        [tech.openGraph.severity, tech.openGraph.issues.length],
        [tech.twitter.severity, tech.twitter.issues.length],
        [tech.urlStructure.severity, tech.urlStructure.issues.length],
      ] as [Severity, number][]) {
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
// ---------------------------------------------------------------------------
function pushCategoryFixes(
  out: (PriorityFix & { importance: PageImportance; issueCount: number })[],
  a: PageOnPageAudit,
  category: string,
  severity: Severity,
  issueCount: number,
  fix: string,
): void {
  if (issueCount <= 0) return
  if (severity !== 'critical' && severity !== 'high' && severity !== 'medium') return
  out.push({ url: a.url, pageName: a.pageName, category, severity, fix, importance: a.importance, issueCount })
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
    pushCategoryFixes(candidates, a, 'Images', a.images.severity, a.images.issues.length, a.images.issues[0]?.issues[0] ?? 'Fix flagged images.')
    pushCategoryFixes(
      candidates,
      a,
      'Internal Linking',
      a.internalLinks.severity,
      a.internalLinks.issues.length,
      a.internalLinks.issues[0] ?? '',
    )
    const tech = a.technicalOnPage
    const techIssue =
      tech.canonical.issues[0] ??
      tech.indexability.reasons[0] ??
      tech.statusCode.issues[0] ??
      tech.schema.issues[0] ??
      tech.openGraph.issues[0] ??
      tech.twitter.issues[0] ??
      tech.urlStructure.issues[0] ??
      ''
    const techIssueCount =
      tech.canonical.issues.length +
      tech.indexability.reasons.length +
      tech.statusCode.issues.length +
      tech.schema.issues.length +
      tech.openGraph.issues.length +
      tech.twitter.issues.length +
      tech.urlStructure.issues.length
    pushCategoryFixes(candidates, a, 'Technical', tech.severity, techIssueCount, techIssue)
  }

  candidates.sort((x, y) => compareBySeverityThenImportance(x, y))

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
