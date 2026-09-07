// ──────────────────────────────────────────────────────────────────────────
// Phase 10 — deterministic KPI & measurement system. Replaces the old AI-
// generated kpiTargets (a metric/baseline/month3/month6/month12 table the
// AI populated freely, including numeric growth projections built on top
// of baselines it had no way to verify) with a fixed, fully deterministic
// catalog: every metric this crawl cannot verify is "not_available" with
// an explicit `requiredIntegration`, and every metric the crawl CAN verify
// (Technical category) carries its real, computed value — never an
// AI-invented number, never a fabricated 0.
//
// Nothing here calls the AI. No numeric target/projection is ever
// generated without a verified or user-provided baseline — see `goal` for
// the qualitative, directional replacement.
// ──────────────────────────────────────────────────────────────────────────
import type { PageOnPageAudit } from './types'
import type { OnPageOverview } from './on-page-overview'
import type { TechnicalCrawlSummary } from './technical-summary'

export type KpiCategory = 'organic_visibility' | 'traffic_engagement' | 'conversions' | 'authority' | 'technical'
export type KpiMeasurementStatus = 'measured' | 'user_provided' | 'estimated' | 'not_available'
export type KpiMeasurementSource = 'crawled' | 'user_provided' | 'verified_api' | 'calculated_from_verified_data' | 'ai_estimated' | 'not_available'
export type RequiredIntegration = 'google_search_console' | 'google_analytics' | 'backlink_provider' | null

export interface MeasurementKpi {
  metric: string
  category: KpiCategory
  /** Never a fabricated 0 — a metric with no verified/user-provided value is always `null`, not zero. */
  value: number | null
  /** Present only when `value` is a percentage rather than a raw count. */
  unit: 'count' | 'percent' | null
  status: KpiMeasurementStatus
  source: KpiMeasurementSource
  requiredIntegration: RequiredIntegration
  /** Directional recommendation — never a numeric forecast/projection. */
  goal: string
}

function notAvailable(metric: string, category: KpiCategory, requiredIntegration: RequiredIntegration, goal: string): MeasurementKpi {
  return { metric, category, value: null, unit: null, status: 'not_available', source: 'not_available', requiredIntegration, goal }
}

function measuredCrawlKpi(metric: string, value: number, unit: 'count' | 'percent', goal: string): MeasurementKpi {
  return { metric, category: 'technical', value, unit, status: 'measured', source: 'crawled', requiredIntegration: null, goal }
}

/**
 * Builds the full KPI catalog. External (GSC/GA4/backlink-provider) rows
 * are always `not_available` today — no integration exists yet (Phase 10
 * deliberately does not add one, see the route.ts prompt/schema changes).
 * DA/DR is intentionally NOT included: it's a third-party metric with no
 * provider connected, so there is nothing to even label "not available"
 * without implying a provider relationship that doesn't exist.
 */
export function buildKpiMeasurement(technicalCrawlSummary: TechnicalCrawlSummary, onPageOverview: OnPageOverview, onPageAudits: PageOnPageAudit[]): MeasurementKpi[] {
  const kpis: MeasurementKpi[] = []

  // ---- Organic Visibility — requires Google Search Console ----
  kpis.push(notAvailable('Organic Clicks', 'organic_visibility', 'google_search_console', 'Increase qualified organic clicks'))
  kpis.push(notAvailable('Organic Impressions', 'organic_visibility', 'google_search_console', 'Improve visibility for priority keywords'))
  kpis.push(notAvailable('Average CTR', 'organic_visibility', 'google_search_console', 'Improve CTR on important pages'))
  kpis.push(notAvailable('Average Position', 'organic_visibility', 'google_search_console', 'Improve average ranking position for priority keywords'))
  kpis.push(notAvailable('Ranking Keywords (Top 10)', 'organic_visibility', 'google_search_console', 'Increase the number of page-1 ranking keywords'))

  // ---- Traffic & Engagement — requires Google Analytics ----
  kpis.push(notAvailable('Organic Sessions/Users', 'traffic_engagement', 'google_analytics', 'Increase qualified organic traffic'))
  kpis.push(notAvailable('Engagement Rate', 'traffic_engagement', 'google_analytics', 'Improve on-site engagement for organic visitors'))

  // ---- Conversions — requires Google Analytics (goal tracking) ----
  kpis.push(notAvailable('Organic Leads/Conversions', 'conversions', 'google_analytics', 'Increase organic conversions'))
  kpis.push(notAvailable('Calls/Form Submissions', 'conversions', 'google_analytics', 'Increase qualified calls/form submissions from organic traffic'))
  kpis.push(notAvailable('Conversion Rate', 'conversions', 'google_analytics', 'Improve organic conversion rate'))

  // ---- Authority — requires a backlink data provider ----
  kpis.push(notAvailable('Backlinks', 'authority', 'backlink_provider', 'Earn additional relevant, legitimate backlinks'))
  kpis.push(notAvailable('Referring Domains', 'authority', 'backlink_provider', 'Increase referring domains from relevant, legitimate sources'))

  // ---- Technical — measured directly by the Ai Ranko crawl ----
  kpis.push(measuredCrawlKpi('Pages Discovered', technicalCrawlSummary.discovered, 'count', 'Maintain full crawlability of the site'))
  kpis.push(measuredCrawlKpi('Pages Crawled', technicalCrawlSummary.crawled, 'count', 'Maintain full crawlability of the site'))
  kpis.push(measuredCrawlKpi('Indexable Pages', technicalCrawlSummary.indexable, 'count', 'Ensure all valuable pages remain indexable'))
  kpis.push(measuredCrawlKpi('Broken Pages', technicalCrawlSummary.brokenUrls, 'count', 'Fix broken internal links and failed pages'))
  kpis.push(measuredCrawlKpi('Critical Issues', onPageOverview.bySeverity.critical, 'count', 'Resolve all outstanding critical-severity issues'))
  kpis.push(measuredCrawlKpi('High-Severity Issues', onPageOverview.bySeverity.high, 'count', 'Resolve outstanding high-severity issues'))
  kpis.push(
    measuredCrawlKpi(
      'Metadata Issues',
      onPageOverview.categories.metaTitle.affectedPages + onPageOverview.categories.metaDescription.affectedPages,
      'count',
      'Fix missing, duplicate, or poorly-sized meta titles and descriptions',
    ),
  )
  kpis.push(measuredCrawlKpi('Internal-Link Issues', onPageOverview.categories.internalLinks.affectedPages, 'count', 'Fix orphan pages, weak internal linking, and broken internal links'))

  const auditedCount = onPageAudits.length
  if (auditedCount > 0) {
    const schemaPresentCount = onPageAudits.filter((a) => a.technicalOnPage.schema.present).length
    const schemaCoveragePct = Math.round((schemaPresentCount / auditedCount) * 100)
    kpis.push(measuredCrawlKpi('Schema Markup Coverage', schemaCoveragePct, 'percent', 'Increase schema markup coverage across key pages'))
  } else {
    kpis.push(notAvailable('Schema Markup Coverage', 'technical', null, 'Increase schema markup coverage across key pages'))
  }

  return kpis
}
