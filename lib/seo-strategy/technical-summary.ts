// ──────────────────────────────────────────────────────────────────────────
// Phase 5 — deterministic sitewide technical/crawl summary. Pure
// aggregation over already-computed data (SiteAnalysis.crawlStats/
// sitemapAudit/robotsTxt from the crawler, PageOnPageAudit[] technical
// fields from Phase 2B) — never re-derives indexability, canonical
// validity, or schema validity itself. The AI never sees or produces this.
// ──────────────────────────────────────────────────────────────────────────
import type { SiteAnalysis } from '@/app/api/seo-strategy/analyze/route'
import { evaluateImportantPagesBlocked, evaluateRobotsTxt } from './severity'
import type { PageOnPageAudit } from './types'

export interface TechnicalCrawlSummary {
  crawlMode: 'quick' | 'full'
  discovered: number
  crawled: number
  failed: number
  redirected: number
  excluded: number
  audited: number
  /** Never "entire site audited" unless every discovered URL was actually processed. */
  coverageNote: string
  indexable: number
  nonIndexable: number
  blocked: number
  notEvaluatedIndexability: number
  sitemapIssues: number
  robotsIssues: number
  canonicalIssues: number
  brokenUrls: number
  schemaIssues: number
}

export function buildTechnicalCrawlSummary(analysis: SiteAnalysis, onPageAudits: PageOnPageAudit[]): TechnicalCrawlSummary {
  const { crawlStats, crawlMode } = analysis

  let indexable = 0
  let nonIndexable = 0
  let blocked = 0
  let notEvaluatedIndexability = 0
  let canonicalIssues = 0
  let schemaIssues = 0
  for (const a of onPageAudits) {
    const result = a.technicalOnPage.indexability.result
    if (result === 'indexable') indexable++
    else if (result === 'non_indexable') nonIndexable++
    else if (result === 'blocked') blocked++
    else notEvaluatedIndexability++

    if (a.technicalOnPage.canonical.issues.length > 0) canonicalIssues++
    if (a.technicalOnPage.schema.issues.length > 0) schemaIssues++
  }

  const importantPagesBlocked = evaluateImportantPagesBlocked(onPageAudits, analysis.robotsTxt)
  const robotsFinding = evaluateRobotsTxt(analysis.robotsTxt)
  const robotsIssues = (robotsFinding.severity !== 'pass' && robotsFinding.severity !== 'not_evaluated' ? 1 : 0) + importantPagesBlocked.blockedImportantUrls.length

  const sitemapIssues = analysis.sitemapAudit ? analysis.sitemapAudit.flaggedUrls.length : 0

  const coverageNote =
    crawlStats.excluded > 0
      ? `Partial crawl — ${crawlStats.excluded} discovered URL(s) were not attempted within the ${crawlMode === 'full' ? 'full' : 'quick'} crawl's safe limits.`
      : `Full crawl — every discovered URL (excluding the homepage itself) was attempted.`

  return {
    crawlMode,
    discovered: crawlStats.discovered,
    crawled: crawlStats.crawled,
    failed: crawlStats.failed,
    redirected: crawlStats.redirected,
    excluded: crawlStats.excluded,
    audited: crawlStats.audited,
    coverageNote,
    indexable,
    nonIndexable,
    blocked,
    notEvaluatedIndexability,
    sitemapIssues,
    robotsIssues,
    canonicalIssues,
    brokenUrls: analysis.brokenInternalLinks.length,
    schemaIssues,
  }
}
