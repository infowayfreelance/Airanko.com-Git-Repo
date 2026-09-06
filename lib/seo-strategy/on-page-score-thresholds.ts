// ──────────────────────────────────────────────────────────────────────────
// Centralized config for Phase 3's deterministic on-page scoring + report
// status bands. Same principle as on-page-thresholds.ts / phase2b-thresholds
// .ts: every magic number lives here, not scattered through on-page-overview
// .ts or the UI. The AI never invents or adjusts a score — see that file's
// header comment.
// ──────────────────────────────────────────────────────────────────────────
import type { PageImportance, Severity } from './types'

/** Simple, unambiguous score-status labels for both the site-wide and per-page on-page score — never a vague label. */
export type ScoreStatus = 'excellent' | 'good' | 'needs_improvement' | 'poor' | 'critical'

export const SCORE_STATUS_LABEL: Record<ScoreStatus, string> = {
  excellent: 'Excellent',
  good: 'Good',
  needs_improvement: 'Needs Improvement',
  poor: 'Poor',
  critical: 'Critical',
}

/** Score bands, checked highest-first. */
const SCORE_BANDS: { min: number; status: ScoreStatus }[] = [
  { min: 90, status: 'excellent' },
  { min: 80, status: 'good' },
  { min: 65, status: 'needs_improvement' },
  { min: 50, status: 'poor' },
  { min: 0, status: 'critical' },
]

export function scoreToStatus(score: number): ScoreStatus {
  const band = SCORE_BANDS.find((b) => score >= b.min)
  return band ? band.status : 'critical'
}

/**
 * Points deducted per audit category based on that category's OWN overall
 * severity (the category's single worst issue, already computed by the
 * Phase 2A/2B evaluators) — never per individual raw issue. Deducting once
 * per category, not once per issue, is what keeps a page with e.g. 8
 * missing-alt images (one category, one severity) from scoring far worse
 * than a page with 8 unrelated single-issue categories.
 */
export const SEVERITY_SCORE_PENALTY: Record<Severity, number> = {
  critical: 30,
  high: 18,
  medium: 9,
  low: 4,
  info: 1,
  pass: 0,
  not_evaluated: 0,
}

/**
 * Category weights for the page-level score — technical/indexability and
 * core relevance signals (title, H1, content) matter more to rankings than
 * cosmetic polish (image filenames, minor heading-length nits), per the
 * explicit Phase 3 requirement not to treat them equally.
 */
export const CATEGORY_SCORE_WEIGHT = {
  metaTitle: 1.0,
  metaDescription: 0.8,
  h1: 1.0,
  headings: 0.6,
  content: 1.0,
  images: 0.5,
  internalLinks: 1.0,
  technicalOnPage: 1.3,
} as const

/**
 * Site-wide score weighting by page importance — so a handful of low-
 * importance utility pages with issues can't outweigh problems on the
 * homepage/money pages, and conversely so importance amplifies rather than
 * masks real problems on the pages that matter most.
 */
export const PAGE_IMPORTANCE_SCORE_WEIGHT: Record<PageImportance, number> = {
  high: 1.5,
  medium: 1.0,
  low: 0.7,
}

/** How many items the "Priority On-Page Fixes" list surfaces — a curated top slice, never the full issue list. */
export const PRIORITY_FIX_MIN = 5
export const PRIORITY_FIX_MAX = 10
