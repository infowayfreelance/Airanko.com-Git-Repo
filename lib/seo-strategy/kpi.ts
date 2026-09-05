// ──────────────────────────────────────────────────────────────────────────
// KPI baseline sanitization.
//
// A plain HTML crawl can never measure organic traffic, clicks,
// impressions, keyword rankings, conversion rate, bounce rate, backlinks,
// or Domain Authority/Rating — those require a connected, verified source
// (Search Console, GA4, Ahrefs/Semrush/Moz, etc.). The AI still generates
// `kpiTargets` (it's useful for suggested goals), but this module strips
// any fabricated *baseline* for metrics we have no way to verify.
//
// Deliberately an ALLOWLIST, not a blocklist: a metric name the AI phrases
// in a way no pattern anticipates (e.g. "Total website traffic", "Organic
// users") must still lose its baseline. Defaulting to "keep unless flagged
// unsupported" lets exactly that kind of fabricated number through — so the
// default here is "clear unless explicitly recognized as something this
// crawler can plausibly speak to".
// ──────────────────────────────────────────────────────────────────────────
import type { KpiStatus, KpiTarget, SourceType } from './types'

const CRAWL_VERIFIABLE_METRIC_PATTERNS: RegExp[] = [
  /pages? (indexed|crawled|audited)/i,
  /meta descriptions?/i,
  /title tags?/i,
  /schema( markup)?/i,
  /canonical( tags?| urls?)?/i,
  /h1 tags?/i,
  /word count/i,
  /(page |server )?(load|response) time/i,
  /https|ssl/i,
  /sitemap/i,
  /alt text|image optimi[sz]ation/i,
  /open graph|og tags?/i,
  /twitter (cards?|tags?)/i,
  /internal link/i,
]

export function isCrawlVerifiableMetric(metricName: string): boolean {
  return CRAWL_VERIFIABLE_METRIC_PATTERNS.some((re) => re.test(metricName))
}

export interface KpiTargetInput {
  metric: string
  baseline: string
  month3Target: string
  month6Target: string
  month12Target: string
}

/**
 * Never invents data: unless a metric matches the crawl-verifiable
 * allowlist above, its baseline is forced to "Not Available" regardless of
 * what the AI generated — this covers named unmeasurable metrics (organic
 * traffic, rankings, conversion/bounce rate, backlinks, DA/DR) AND any
 * other metric name the AI comes up with that this crawler has no way to
 * verify. Allowlisted metrics are still only labeled `ai_suggested` /
 * `suggested`, never `verified_api` / `available` — this module doesn't
 * cross-check the AI's specific number against the real crawl data, it
 * only judges whether the *category* of metric is even plausible from a
 * crawl.
 */
export function sanitizeKpiTargets(kpis: KpiTargetInput[]): KpiTarget[] {
  return kpis.map((k): KpiTarget => {
    if (!isCrawlVerifiableMetric(k.metric)) {
      const status: KpiStatus = 'not_available'
      const sourceType: SourceType = 'not_available'
      return { ...k, baseline: 'Not Available', status, source: null, sourceType }
    }
    const status: KpiStatus = 'suggested'
    const sourceType: SourceType = 'ai_suggested'
    return { ...k, status, source: null, sourceType }
  })
}
