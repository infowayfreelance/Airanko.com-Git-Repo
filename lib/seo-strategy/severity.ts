// ──────────────────────────────────────────────────────────────────────────
// Centralized, deterministic severity engine.
//
// The AI is never allowed to be the final word on severity for checks we can
// actually verify from the crawl. Each `evaluate*` function below derives a
// severity straight from structured crawl data; `severityToChecklistFields`
// converts that severity into the technicalSeoAudit.checklist's
// status/priority vocabulary so the contradiction checker (see
// contradiction-checker.ts) can force-correct whatever the AI generated.
// ──────────────────────────────────────────────────────────────────────────
import type { SiteAnalysis } from '@/app/api/seo-strategy/analyze/route'
import type { Severity } from './types'

export const SEVERITY_RANK: Record<Severity, number> = {
  critical: 6,
  high: 5,
  medium: 4,
  low: 3,
  info: 2,
  pass: 1,
  not_evaluated: 0,
}

export type ChecklistStatus = 'pass' | 'warning' | 'fail' | 'not-applicable'
export type ChecklistPriority = 'critical' | 'high' | 'medium' | 'low'

/** Maps a deterministic severity onto the AI checklist schema's vocabulary. */
export function severityToChecklistFields(severity: Severity): {
  status: ChecklistStatus
  priority: ChecklistPriority
} {
  switch (severity) {
    case 'critical':
      return { status: 'fail', priority: 'critical' }
    case 'high':
      return { status: 'fail', priority: 'high' }
    case 'medium':
      return { status: 'warning', priority: 'medium' }
    case 'low':
      return { status: 'warning', priority: 'low' }
    case 'info':
      return { status: 'warning', priority: 'low' }
    case 'pass':
      return { status: 'pass', priority: 'low' }
    case 'not_evaluated':
      return { status: 'not-applicable', priority: 'low' }
  }
}

// ---------------------------------------------------------------------------
// Mobile friendliness
//
// A real mobile-friendliness verdict needs actual rendering (Google's
// Mobile-Friendly Test, Lighthouse, etc.). This tool's crawler only fetches
// raw HTML, so a responsive viewport meta tag is the one deterministic
// signal we actually have. It's used as a conservative proxy — enough to
// stop the report from claiming "mobile-friendly" and "critical" at the
// same time, per P0 requirement #3 — never to fabricate a full audit.
// ---------------------------------------------------------------------------
export interface MobileFriendlyResult {
  mobileFriendly: boolean | null
  severity: Severity
  finding: string
}

export function evaluateMobileFriendliness(analysis: SiteAnalysis | null): MobileFriendlyResult {
  const homepage = analysis?.homepage
  if (!homepage) {
    return {
      mobileFriendly: null,
      severity: 'not_evaluated',
      finding: 'Mobile viewport could not be checked — the homepage did not load during the crawl.',
    }
  }
  const viewport = homepage.viewport?.toLowerCase() ?? null
  if (viewport && viewport.includes('width=device-width')) {
    return {
      mobileFriendly: true,
      severity: 'pass',
      finding: 'Homepage has a responsive viewport meta tag (width=device-width).',
    }
  }
  if (viewport) {
    return {
      mobileFriendly: false,
      severity: 'medium',
      finding: `A viewport meta tag is present but isn't the standard responsive directive (found: "${homepage.viewport}").`,
    }
  }
  // No viewport tag is a strong, real signal — but still only a proxy for a
  // full mobile-friendliness test, so it stops at "high", never "critical".
  return {
    mobileFriendly: false,
    severity: 'high',
    finding: 'No viewport meta tag found on the homepage — the page is very likely not mobile-friendly.',
  }
}

// ---------------------------------------------------------------------------
// robots.txt
// ---------------------------------------------------------------------------
export interface RobotsSeverityResult {
  severity: Severity
  finding: string
}

export function evaluateRobotsTxt(robotsTxt: SiteAnalysis['robotsTxt'] | null | undefined): RobotsSeverityResult {
  if (!robotsTxt) {
    return { severity: 'not_evaluated', finding: 'robots.txt could not be checked.' }
  }
  if (robotsTxt.disallowsAll) {
    return {
      severity: 'critical',
      finding: 'robots.txt disallows all crawlers from the entire site (Disallow: / under User-agent: *).',
    }
  }
  if (!robotsTxt.found) {
    // A missing robots.txt does not block crawling or indexing by itself —
    // it's a best-practice gap, not a critical failure.
    return {
      severity: 'low',
      finding: 'No robots.txt file found. Search engines will still crawl the site normally, but a robots.txt is a best practice for controlling crawl behavior and pointing to the sitemap.',
    }
  }
  return { severity: 'pass', finding: 'robots.txt found and does not block the site.' }
}

// ---------------------------------------------------------------------------
// Server / crawl response time
//
// This crawler measures a single fetch's response time, not a full Page
// Speed / Core Web Vitals audit (which needs real browser timing this tool
// doesn't collect). Labeled and thresholded accordingly — a few hundred ms
// is never "high" severity.
// ---------------------------------------------------------------------------
export interface ResponseTimeSeverityResult {
  severity: Severity
  label: string
  finding: string
}

export const RESPONSE_TIME_LABEL = 'Server Response Time'

export function evaluateResponseTime(avgLoadTimeMs: number | null | undefined): ResponseTimeSeverityResult {
  const label = RESPONSE_TIME_LABEL
  if (avgLoadTimeMs == null || Number.isNaN(avgLoadTimeMs)) {
    return { severity: 'not_evaluated', label, finding: 'Server response time could not be measured.' }
  }
  if (avgLoadTimeMs < 1000) {
    return { severity: 'pass', label, finding: `Average server response time is ${avgLoadTimeMs}ms — good.` }
  }
  if (avgLoadTimeMs < 3000) {
    return { severity: 'low', label, finding: `Average server response time is ${avgLoadTimeMs}ms — acceptable, but could be faster.` }
  }
  if (avgLoadTimeMs < 6000) {
    return { severity: 'medium', label, finding: `Average server response time is ${avgLoadTimeMs}ms — noticeably slow.` }
  }
  return { severity: 'high', label, finding: `Average server response time is ${avgLoadTimeMs}ms — very slow, likely affecting SEO and UX.` }
}
