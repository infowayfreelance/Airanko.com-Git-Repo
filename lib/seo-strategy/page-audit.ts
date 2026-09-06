// ──────────────────────────────────────────────────────────────────────────
// Phase 2B orchestrator — assembles the FULL per-page audit (Phase 2A's
// meta/heading fields + Phase 2B's content/images/internal-links/technical
// fields) and the site-wide summary, without changing anything about how
// Phase 2A itself works. This is the only place that combines the two;
// on-page-audit.ts's buildOnPageAudits()/aggregateOnPageIssues() stay
// exactly as they were for Phase 2A's own callers/tests.
// ──────────────────────────────────────────────────────────────────────────
import type { PageAnalysis, SiteAnalysis } from '@/app/api/seo-strategy/analyze/route'
import { addToSummary, aggregateOnPageIssues, buildOnPageAudits, derivePageImportance, emptyCategorySummary } from './on-page-audit'
import { attachOnPageSuggestions, type SuggestionOptions } from './on-page-suggestions'
import { computeContentSimilarity, evaluateContent } from './content-audit'
import { evaluateImages } from './image-audit'
import { buildLinkGraph, computeSitewideAnchorCounts, evaluateInternalLinks } from './internal-link-audit'
import { evaluateTechnicalOnPage } from './technical-audit'
import { derivePageType } from './page-type'
import type {
  ContentIssueSummary,
  ImageIssueSummary,
  InternalLinkIssueSummary,
  KeywordPageMapping,
  OnPageSummary,
  PageOnPageAudit,
  TechnicalIssueSummary,
} from './types'

export function buildFullPageAudits(
  analysis: SiteAnalysis,
  pages: PageAnalysis[],
  keywordMappings: KeywordPageMapping[],
  homepageUrl: string | null,
  options: SuggestionOptions,
): PageOnPageAudit[] {
  // Phase 2A — unchanged.
  const metaHeadingAuditsRaw = buildOnPageAudits(pages, keywordMappings, homepageUrl)
  const metaHeadingAudits = attachOnPageSuggestions(metaHeadingAuditsRaw, new Map(pages.map((p) => [p.url, p])), options)

  // Phase 2B — shared, once-per-crawl computations reused across every page.
  const allPagesByUrl = new Map(pages.map((p) => [p.url, p]))
  const similarityByUrl = computeContentSimilarity(pages)
  const linkGraph = buildLinkGraph(pages)
  const sitewideAnchorCounts = computeSitewideAnchorCounts(pages)

  // metaHeadingAudits and pages are both derived from the same `pages` array
  // via .map(), in the same order — safe to zip by index rather than
  // re-looking each page up by URL.
  return metaHeadingAudits.map((base, i) => {
    const page = pages[i]
    const importance = derivePageImportance(page.url, homepageUrl, keywordMappings)
    const pageType = derivePageType(page, homepageUrl, keywordMappings, options.location)
    const similarity = similarityByUrl.get(page.url) ?? { status: 'unique' as const, matches: [] }

    return {
      ...base,
      content: evaluateContent(page, pageType, importance, base.targetKeyword, similarity, options.isLocalBusiness, options.location),
      images: evaluateImages(page),
      internalLinks: evaluateInternalLinks(
        page,
        linkGraph,
        importance,
        analysis.crawlCoverage,
        analysis.brokenInternalLinks,
        sitewideAnchorCounts,
        homepageUrl,
      ),
      technicalOnPage: evaluateTechnicalOnPage(page, allPagesByUrl, importance, pageType, options.isLocalBusiness, analysis.robotsTxt.disallowsAll),
    }
  })
}

function emptyContentIssueSummary(): ContentIssueSummary {
  return { ...emptyCategorySummary(), thinPages: 0, duplicatePages: 0, intentMismatchPages: 0 }
}
function emptyImageIssueSummary(): ImageIssueSummary {
  return { ...emptyCategorySummary(), missingAlt: 0, weakAlt: 0, oversized: 0 }
}
function emptyInternalLinkIssueSummary(): InternalLinkIssueSummary {
  return { ...emptyCategorySummary(), orphanPages: 0, weakPages: 0, brokenLinks: 0 }
}
function emptyTechnicalIssueSummary(): TechnicalIssueSummary {
  return { ...emptyCategorySummary(), canonical: 0, indexability: 0, statusCodes: 0, schema: 0, openGraph: 0, twitter: 0, urlStructure: 0 }
}

/** Site-wide issue counts + affected URLs for every Phase 2A + 2B category — stored for a future on-page overview dashboard (not built in this phase). */
export function aggregateFullPageIssues(audits: PageOnPageAudit[]): OnPageSummary {
  const contentIssues = emptyContentIssueSummary()
  const imageIssues = emptyImageIssueSummary()
  const internalLinkIssues = emptyInternalLinkIssueSummary()
  const technicalIssues = emptyTechnicalIssueSummary()

  for (const a of audits) {
    if (a.content.issues.length > 0) {
      addToSummary(contentIssues, a.content.severity, a.url)
      if (a.content.thinContent) contentIssues.thinPages++
      if (a.content.duplicateStatus === 'exact_duplicate' || a.content.duplicateStatus === 'near_duplicate') contentIssues.duplicatePages++
      if (a.content.searchIntent && !a.content.searchIntent.match) contentIssues.intentMismatchPages++
    }

    if (a.images.issues.length > 0) {
      addToSummary(imageIssues, a.images.severity, a.url)
      imageIssues.missingAlt += a.images.missingAlt
      imageIssues.weakAlt += a.images.weakAlt
      imageIssues.oversized += a.images.oversized
    }

    if (a.internalLinks.issues.length > 0) {
      addToSummary(internalLinkIssues, a.internalLinks.severity, a.url)
      if (a.internalLinks.orphan) internalLinkIssues.orphanPages++
      if (a.internalLinks.weaklyLinked) internalLinkIssues.weakPages++
      internalLinkIssues.brokenLinks += a.internalLinks.brokenLinks.length
    }

    // technicalIssues.total/affectedPages reflect "pages with at least one
    // technical issue" (one addToSummary call per page, using the page's
    // overall technical severity) — the named sub-counters below are
    // separate per-category page counts that can each be smaller than total
    // but, added together, exceed it when a page has issues in more than
    // one technical sub-area.
    const tech = a.technicalOnPage
    if (tech.status !== 'good') addToSummary(technicalIssues, tech.severity, a.url)
    if (tech.canonical.issues.length > 0) technicalIssues.canonical++
    if (tech.indexability.severity !== 'pass' && tech.indexability.severity !== 'not_evaluated') technicalIssues.indexability++
    if (tech.statusCode.issues.length > 0) technicalIssues.statusCodes++
    if (tech.schema.issues.length > 0) technicalIssues.schema++
    if (tech.openGraph.issues.length > 0) technicalIssues.openGraph++
    if (tech.twitter.issues.length > 0) technicalIssues.twitter++
    if (tech.urlStructure.issues.length > 0) technicalIssues.urlStructure++
  }

  // Phase 2A's own aggregator (unchanged) handles title/description/H1/
  // heading-structure — `audits` structurally satisfies MetaHeadingPageAudit[]
  // since PageOnPageAudit extends it, so this is just reused, not redone.
  const metaHeadingSummary = aggregateOnPageIssues(audits)

  return {
    ...metaHeadingSummary,
    contentIssues,
    imageIssues,
    internalLinkIssues,
    technicalIssues,
  }
}
