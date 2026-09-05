// ──────────────────────────────────────────────────────────────────────────
// KPI baseline sanitization.
//
// A plain HTML crawl can never measure organic traffic, clicks,
// impressions, keyword rankings, conversion rate, bounce rate, backlinks,
// or Domain Authority/Rating — those require a connected, verified source
// (Search Console, GA4, Ahrefs/Semrush/Moz, etc.). The AI still generates
// `kpiTargets` (it's useful for suggested goals), but this module strips
// any fabricated *baseline* for metrics we have no way to verify, so the
// report never presents an invented number as measured fact.
// ──────────────────────────────────────────────────────────────────────────
import type { KpiStatus, KpiTarget, SourceType } from './types'

const UNSUPPORTED_METRIC_PATTERNS: RegExp[] = [
  /organic (search )?(traffic|clicks|sessions|visits)/i,
  /impressions/i,
  /click-?through rate|\bctr\b/i,
  /(keyword )?rankings?/i,
  /top\s*\d+\s*keywords?/i,
  /conversion rate/i,
  /bounce rate/i,
  /backlinks?/i,
  /referring domains?/i,
  /domain (authority|rating)/i,
  /\b(da|dr)\b/i,
]

export function isUnsupportedMetric(metricName: string): boolean {
  return UNSUPPORTED_METRIC_PATTERNS.some((re) => re.test(metricName))
}

export interface KpiTargetInput {
  metric: string
  baseline: string
  month3Target: string
  month6Target: string
  month12Target: string
}

/**
 * Never invents data: any metric that needs a verified external source
 * (GSC/GA4/backlink API/etc.) has its baseline forced to "Not Available"
 * regardless of what the AI generated. Metrics we can't classify as
 * unsupported are still labeled `ai_suggested` / `suggested` rather than
 * `verified_api` / `available` — we have no crawl-based way to verify an
 * arbitrary metric name either.
 */
export function sanitizeKpiTargets(kpis: KpiTargetInput[]): KpiTarget[] {
  return kpis.map((k): KpiTarget => {
    if (isUnsupportedMetric(k.metric)) {
      const status: KpiStatus = 'not_available'
      const sourceType: SourceType = 'not_available'
      return { ...k, baseline: 'Not Available', status, source: null, sourceType }
    }
    const status: KpiStatus = 'suggested'
    const sourceType: SourceType = 'ai_suggested'
    return { ...k, status, source: null, sourceType }
  })
}
