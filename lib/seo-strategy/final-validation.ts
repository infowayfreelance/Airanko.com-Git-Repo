// ──────────────────────────────────────────────────────────────────────────
// Phase 13 — final validation + report quality control. The single
// checkpoint between "strategy generation" and "report render/export"
// (see the pipeline note in app/api/seo-strategy/route.ts). This module
// does NOT re-implement the many contradiction checks earlier phases
// already run (mobile/critical, noindex/indexable, 404-vs-200 crawl
// coverage, schema, orphan pages, KPI sourcing, competitor evidence, Local
// Business state, cannibalization, roadmap structure — all already
// computed by lib/seo-strategy/contradiction-checker.ts and folded into
// `correctedStrategy` before this ever runs). Its job is to:
//
//  1. Clamp/reconcile the AI's own health-score numbers (the one place
//     with no prior bounds-checking at all — see clampAndReconcileScores).
//  2. Aggregate every phase's already-collected diagnostic messages into
//     the one reportValidation shape the spec asks for, instead of one
//     flat undifferentiated string array.
//  3. Compute a simple, task-based Report Confidence (High/Medium/Limited)
//     — never a second SEO score.
//
// Nothing here invents an SEO finding. `valid` is only ever false for a
// genuine structural defect (a truly malformed roadmap), never merely
// because a lower-severity warning exists — warnings are diagnostic,
// surfaced to developers, never technical stack traces to end users.
// ──────────────────────────────────────────────────────────────────────────
import type { TwoMonthRoadmap } from './roadmap'
import type { MeasurementKpi } from './kpi-measurement'
import type { TechnicalCrawlSummary } from './technical-summary'

export type ReportConfidence = 'high' | 'medium' | 'limited'

export interface ReportValidation {
  valid: boolean
  errors: string[]
  warnings: string[]
  suppressedClaims: string[]
  mergedDuplicates: string[]
  correctedStates: string[]
  confidence: ReportConfidence
  confidenceReason: string
}

export interface HealthScoreBreakdownNumbers {
  technical: number
  onPage: number
  content: number
  offPage: number
}

export interface ScoreCorrectionResult {
  overallHealthScore: number
  healthScoreBreakdown: HealthScoreBreakdownNumbers
  correctedStates: string[]
}

function clamp(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)))
}

/**
 * Phase 13 spec §10/§14 — the AI's overallHealthScore/healthScoreBreakdown
 * numbers have no prior bounds-checking (the zod schema only enforces
 * `z.number().int()`, not a 0-100 range) and `onPage` is a free AI guess
 * never reconciled with Phase 3's own deterministic on-page score
 * (onPageOverview.score). Deterministic crawl data outranks AI narrative
 * (spec §2), so a materially different AI onPage score is replaced with
 * the deterministic one rather than merely clamped.
 */
export function clampAndReconcileScores(
  overallHealthScore: number,
  breakdown: HealthScoreBreakdownNumbers,
  deterministicOnPageScore: number,
): ScoreCorrectionResult {
  const correctedStates: string[] = []

  const clampedOverall = clamp(overallHealthScore)
  if (clampedOverall !== overallHealthScore) {
    correctedStates.push(`overallHealthScore was out of the valid 0-100 range (${overallHealthScore}) — clamped to ${clampedOverall}.`)
  }

  const clampedBreakdown: HealthScoreBreakdownNumbers = {
    technical: clamp(breakdown.technical),
    onPage: clamp(breakdown.onPage),
    content: clamp(breakdown.content),
    offPage: clamp(breakdown.offPage),
  }
  for (const key of ['technical', 'content', 'offPage'] as const) {
    if (clampedBreakdown[key] !== breakdown[key]) {
      correctedStates.push(`healthScoreBreakdown.${key} was out of the valid 0-100 range (${breakdown[key]}) — clamped to ${clampedBreakdown[key]}.`)
    }
  }

  // Reconcile onPage against the deterministic score computed from the
  // actual crawl (Phase 3) — a >15-point gap means the AI's free-floating
  // guess disagrees materially with the site's own audited data.
  const ON_PAGE_RECONCILE_THRESHOLD = 15
  if (Math.abs(clampedBreakdown.onPage - deterministicOnPageScore) > ON_PAGE_RECONCILE_THRESHOLD) {
    correctedStates.push(
      `healthScoreBreakdown.onPage (${clampedBreakdown.onPage}) diverged from the deterministic on-page score (${deterministicOnPageScore}) by more than ${ON_PAGE_RECONCILE_THRESHOLD} points — replaced with the deterministic value.`,
    )
    clampedBreakdown.onPage = clamp(deterministicOnPageScore)
  } else if (clampedBreakdown.onPage !== breakdown.onPage) {
    // Already logged above as an out-of-range clamp; nothing further to add.
  }

  return { overallHealthScore: clampedOverall, healthScoreBreakdown: clampedBreakdown, correctedStates }
}

// ---------------------------------------------------------------------------
// Report Confidence (spec §15) — a simple, task-based signal, never a
// second SEO score. Weighted on: how much of the site was actually
// crawled, how many checks could be evaluated at all (vs not_evaluated),
// and how many unresolved diagnostic warnings remain.
// ---------------------------------------------------------------------------
function computeReportConfidence(technicalCrawlSummary: TechnicalCrawlSummary, kpiMeasurement: MeasurementKpi[], warningCount: number): { confidence: ReportConfidence; reason: string } {
  const discovered = technicalCrawlSummary.discovered
  const crawled = technicalCrawlSummary.crawled
  const coverageFraction = discovered > 0 ? crawled / discovered : 0

  const evaluatedKpis = kpiMeasurement.filter((k) => k.status !== 'not_available').length
  const totalKpis = kpiMeasurement.length
  const evaluatedFraction = totalKpis > 0 ? evaluatedKpis / totalKpis : 0

  let score = coverageFraction * 50 + evaluatedFraction * 30
  score += warningCount === 0 ? 20 : warningCount <= 3 ? 10 : 0

  const confidence: ReportConfidence = score >= 65 ? 'high' : score >= 35 ? 'medium' : 'limited'
  const reason =
    discovered > 0
      ? `${crawled}/${discovered} discovered URL(s) crawled, ${evaluatedKpis}/${totalKpis || 0} measurable checks evaluated, ${warningCount} unresolved validation note(s).`
      : `No automated crawl was performed; the report is based on user-provided inputs only, with ${warningCount} unresolved validation note(s).`

  return { confidence, reason }
}

// ---------------------------------------------------------------------------
// Classification of already-collected diagnostic messages (spec §13) — every
// message here was produced by an earlier phase's own contradiction checker
// (see contradiction-checker.ts); this only sorts them into the shape the
// spec asks for instead of one flat, undifferentiated list.
// ---------------------------------------------------------------------------
const DUPLICATE_MESSAGE_RE = /\bduplicate\b/i
const SUPPRESSED_CLAIM_RE = /redacted|not currently measurable|unsupported|not_available|must never be presented|fabricated|no verified data source|not a verified source/i

function classifyContradictions(allContradictions: string[]): { warnings: string[]; suppressedClaims: string[]; mergedDuplicates: string[] } {
  const warnings: string[] = []
  const suppressedClaims: string[] = []
  const mergedDuplicates: string[] = []
  for (const msg of allContradictions) {
    if (DUPLICATE_MESSAGE_RE.test(msg)) mergedDuplicates.push(msg)
    else if (SUPPRESSED_CLAIM_RE.test(msg)) suppressedClaims.push(msg)
    else warnings.push(msg)
  }
  return { warnings, suppressedClaims, mergedDuplicates }
}

export interface FinalValidationInput {
  allContradictions: string[]
  technicalCrawlSummary: TechnicalCrawlSummary
  kpiMeasurement: MeasurementKpi[]
  twoMonthRoadmap: TwoMonthRoadmap
  scoreCorrections: string[]
}

/** The single entry point called once, after every other phase's output has already been corrected/merged into `correctedStrategy` — the last step before the report is returned to the client for render/export. */
export function runFinalValidation(input: FinalValidationInput): ReportValidation {
  const { warnings, suppressedClaims, mergedDuplicates } = classifyContradictions(input.allContradictions)
  const errors: string[] = []

  // A genuine structural defect (not a soft diagnostic) — the roadmap
  // builder is supposed to always produce exactly 2 months (Phase 12);
  // if it somehow doesn't, that's a real bug worth surfacing as an error
  // rather than a warning.
  if (input.twoMonthRoadmap.months.length !== 2) {
    errors.push(`Roadmap has ${input.twoMonthRoadmap.months.length} month(s) instead of exactly 2 — structural defect.`)
  }

  const totalWarnings = warnings.length + suppressedClaims.length + mergedDuplicates.length
  const { confidence, reason } = computeReportConfidence(input.technicalCrawlSummary, input.kpiMeasurement, totalWarnings)

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    suppressedClaims,
    mergedDuplicates,
    correctedStates: input.scoreCorrections,
    confidence,
    confidenceReason: reason,
  }
}
