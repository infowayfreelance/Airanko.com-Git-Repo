import { generateText, Output, NoObjectGeneratedError } from 'ai'
import { openai } from '@ai-sdk/openai'
import * as z from 'zod'
import type { SiteAnalysis } from './analyze/route'
import { resolveLocalBusinessContext } from '@/lib/seo-strategy/local-business'
import { mapKeywordsToPages, parseKeywordList, normalizeKeyword } from '@/lib/seo-strategy/keyword-mapping'
import { evaluateMobileFriendliness, evaluateRobotsTxt, evaluateResponseTime } from '@/lib/seo-strategy/severity'
import { sanitizeKpiTargets } from '@/lib/seo-strategy/kpi'
import { runContradictionChecks, runOnPageContradictionChecks, runPhase2BContradictionChecks, runSerpPixelContradictionChecks, runCrawlCoverageContradictionChecks, runCompetitorContradictionChecks, runPageOpportunityContradictionChecks, runLocalSeoContradictionChecks, runOffPageContradictionChecks, findProfileForEntry } from '@/lib/seo-strategy/contradiction-checker'
import { buildFullPageAudits, aggregateFullPageIssues } from '@/lib/seo-strategy/page-audit'
import { attachPageScores, buildOnPageOverview, buildPriorityFixes, emptyOnPageCategorySlice, type OnPageOverview, type PageOnPageAuditWithScore, type PriorityFix } from '@/lib/seo-strategy/on-page-overview'
import { buildTechnicalCrawlSummary, type TechnicalCrawlSummary } from '@/lib/seo-strategy/technical-summary'
import { buildCompetitorIntelligence, type CompetitorIntelligence } from '@/lib/seo-strategy/competitor-intelligence'
import type { CompetitorProfile } from './competitor-analyze/route'
import { buildPageOpportunities, type PageOpportunity } from '@/lib/seo-strategy/page-opportunity'
import { buildLocalSeoIntelligence, type LocalSeoIntelligence } from '@/lib/seo-strategy/local-seo-intelligence'
import { buildOffPageIntelligence, type OffPageIntelligence } from '@/lib/seo-strategy/off-page-intelligence'
import type {
  HealthScoreBreakdown,
  KpiTarget,
  KeywordPageMapping,
  OnPageSummary,
  PageOnPageAudit,
} from '@/lib/seo-strategy/types'

export const maxDuration = 300

// ---------------------------------------------------------------------------
// Strategy schema
//
// IMPORTANT: OpenAI's structured-output strict mode does NOT support
// minItems / maxItems on arrays, min / max on numbers, minLength / maxLength
// on strings, or .optional() (use .nullable()).
//
// If we declare them here, the AI SDK will validate the response against the
// full Zod schema AFTER the model returns. If the model returns fewer items
// than `.min()`, the SDK throws NoObjectGeneratedError, the route fails,
// Next returns an HTML error page, and the client sees:
//     "Unexpected token 'A', "An error o"... is not valid JSON"
//
// We therefore keep the schema permissive, and put the count guidance in the
// prompt itself instead.
// ---------------------------------------------------------------------------
const strategySchema = z.object({
  overallHealthScore: z.number().int(),

  healthScoreBreakdown: z.object({
    technical: z.number().int(),
    onPage: z.number().int(),
    content: z.number().int(),
    offPage: z.number().int(),
    local: z.number().int(),
  }),

  executiveSummary: z.string(),

  criticalIssues: z.array(
    z.object({
      title: z.string(),
      impact: z.enum(['critical', 'high', 'medium']),
      description: z.string(),
      howToFix: z.string(),
      estimatedEffort: z.enum(['low', 'medium', 'high']),
    }),
  ),

  quickWins: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      expectedImpact: z.string(),
    }),
  ),

  technicalSeoAudit: z.object({
    summary: z.string(),
    checklist: z.array(
      z.object({
        item: z.string(),
        status: z.enum(['pass', 'warning', 'fail', 'not-applicable']),
        priority: z.enum(['critical', 'high', 'medium', 'low']),
        finding: z.string(),
        recommendation: z.string(),
      }),
    ),
  }),

  onPageAudit: z.object({
    summary: z.string(),
    metaTitles: z.object({
      finding: z.string(),
      recommendation: z.string(),
    }),
    metaDescriptions: z.object({
      finding: z.string(),
      recommendation: z.string(),
    }),
    headingStructure: z.object({
      finding: z.string(),
      recommendation: z.string(),
    }),
    openGraph: z.object({
      finding: z.string(),
      recommendation: z.string(),
    }),
    twitterCards: z.object({
      finding: z.string(),
      recommendation: z.string(),
    }),
    schemaMarkup: z.object({
      finding: z.string(),
      recommendedTypes: z.array(z.string()),
      recommendation: z.string(),
    }),
    internalLinking: z.object({
      finding: z.string(),
      recommendation: z.string(),
    }),
    imageOptimization: z.object({
      finding: z.string(),
      recommendation: z.string(),
    }),
  }),

  pageByPageAudit: z.array(
    z.object({
      url: z.string(),
      currentTitle: z.string().nullable(),
      suggestedTitle: z.string(),
      currentMetaDescription: z.string().nullable(),
      suggestedMetaDescription: z.string(),
      primaryKeyword: z.string(),
      issues: z.array(z.string()),
      recommendations: z.array(z.string()),
    }),
  ),

  keywordStrategy: z.object({
    summary: z.string(),
    primaryKeywords: z.array(
      z.object({
        keyword: z.string(),
        intent: z.enum(['informational', 'navigational', 'transactional', 'commercial']),
        difficulty: z.enum(['low', 'medium', 'high']),
        priority: z.enum(['high', 'medium', 'low']),
        targetPage: z.string(),
      }),
    ),
    longTailKeywords: z.array(
      z.object({
        keyword: z.string(),
        intent: z.enum(['informational', 'navigational', 'transactional', 'commercial']),
      }),
    ),
    contentClusters: z.array(
      z.object({
        pillarTopic: z.string(),
        pillarKeyword: z.string(),
        supportingKeywords: z.array(z.string()),
      }),
    ),
  }),

  pagesToCreate: z.array(
    z.object({
      suggestedUrl: z.string(),
      title: z.string(),
      targetKeyword: z.string(),
      searchIntent: z.enum(['informational', 'navigational', 'transactional', 'commercial']),
      purpose: z.string(),
      contentBrief: z.string(),
      suggestedWordCount: z.number().int(),
      keyHeadings: z.array(z.string()),
      ctaSuggestion: z.string(),
    }),
  ),

  blogIdeas: z.array(
    z.object({
      title: z.string(),
      targetKeyword: z.string(),
      searchIntent: z.enum(['informational', 'navigational', 'transactional', 'commercial']),
      suggestedWordCount: z.number().int(),
      outline: z.array(z.string()),
      contentBrief: z.string(),
    }),
  ),

  competitorAnalysis: z.array(
    z.object({
      name: z.string(),
      url: z.string(),
      strengths: z.array(z.string()),
      weaknesses: z.array(z.string()),
      opportunitiesToOutrank: z.array(z.string()),
      contentGaps: z.array(z.string()),
    }),
  ),

  localSeo: z.object({
    applicable: z.boolean(),
    napConsistency: z.object({
      websiteNap: z.object({
        name: z.string().nullable(),
        addresses: z.array(z.string()),
        phones: z.array(z.string()),
      }),
      issues: z.array(z.string()),
      recommendations: z.array(z.string()),
    }),
    googleBusinessProfileTips: z.array(z.string()),
    localCitations: z.array(z.string()),
    reviewStrategy: z.string(),
    localContentIdeas: z.array(z.string()),
  }),

  // Phase 9: only a short narrative summary is AI-authored here — every
  // opportunity, priority, citation, risk, and metric is computed
  // deterministically in offPageIntelligence (see below) so the AI can never
  // invent a backlink quota, a DA/DR figure, or an unverified competitor claim.
  offPageStrategy: z.object({
    summary: z.string(),
  }),

  sixMonthRoadmap: z.array(
    z.object({
      month: z.number().int(),
      theme: z.string(),
      focus: z.string(),
      keyTasks: z.array(z.string()),
      deliverables: z.array(z.string()),
      expectedOutcomes: z.array(z.string()),
    }),
  ),

  kpiTargets: z.array(
    z.object({
      metric: z.string(),
      baseline: z.string(),
      month3Target: z.string(),
      month6Target: z.string(),
      month12Target: z.string(),
    }),
  ),

  toolStack: z.object({
    free: z.array(z.string()),
    paid: z.array(z.string()),
  }),

  riskAssessment: z.array(
    z.object({
      risk: z.string(),
      likelihood: z.enum(['low', 'medium', 'high']),
      mitigation: z.string(),
    }),
  ),

  conclusion: z.string(),
})

/** Raw shape the AI is asked to produce. Not exported — the AI's output always goes through the deterministic accuracy layer (severity/local-business/keyword-mapping/KPI corrections) before it becomes a `SeoStrategy`. */
type RawAiStrategy = z.infer<typeof strategySchema>

/**
 * The final, corrected report shape returned to the client and rendered by
 * the UI. Identical to the AI's raw output except:
 * - `healthScoreBreakdown.local` can be `null` (never a fabricated 0) and
 *   carries a `localStatus`.
 * - `kpiTargets` carries `status`/`source`/`sourceType` so unsupported
 *   metrics (organic traffic, DA, conversion rate, etc.) are never
 *   presented as measured baselines.
 * - `keywordPageMappings` is the deterministic keyword→page relevance data
 *   (see lib/seo-strategy/keyword-mapping.ts) that also drives the
 *   corrected `keywordStrategy.primaryKeywords[].targetPage` values.
 * - `onPageAudits`/`onPageSummary` (Phase 2A) are the fully deterministic,
 *   page-by-page meta title/meta description/H1/heading-structure audit
 *   (see lib/seo-strategy/on-page-audit.ts) — the AI never produces these,
 *   it only supplies prose in `pageByPageAudit` that gets cross-checked
 *   against them.
 * - `onPageOverview`/`onPagePriorityFixes` (Phase 3) are the deterministic
 *   sitewide on-page report overview + top actionable fixes (see
 *   lib/seo-strategy/on-page-overview.ts) — pure aggregation/sorting of the
 *   same onPageAudits/onPageSummary data above; the AI never sees or
 *   influences these values. `onPageAudits` here carries the deterministic
 *   per-page `onPageScore`/`onPageScoreStatus` attached by that module.
 */
export type SeoStrategy = Omit<RawAiStrategy, 'healthScoreBreakdown' | 'kpiTargets'> & {
  healthScoreBreakdown: HealthScoreBreakdown
  kpiTargets: KpiTarget[]
  keywordPageMappings: KeywordPageMapping[]
  onPageAudits: PageOnPageAuditWithScore[]
  onPageSummary: OnPageSummary
  onPageOverview: OnPageOverview
  onPagePriorityFixes: PriorityFix[]
  /** Phase 5 — deterministic sitewide crawl/technical summary (lib/seo-strategy/technical-summary.ts). Pure aggregation of analysis.crawlStats/sitemapAudit/robotsTxt + the Phase 2B technical audit; never AI-generated. */
  technicalCrawlSummary: TechnicalCrawlSummary
  /** Phase 6 — deterministic, evidence-based competitor comparison (lib/seo-strategy/competitor-intelligence.ts). The AI's own competitorAnalysis[].strengths/weaknesses/opportunitiesToOutrank/contentGaps are overwritten with content derived from this before the report is returned — see the correction below. */
  competitorIntelligence: CompetitorIntelligence
  /** Phase 7 — deterministic, evidence-based page/content-gap recommendations (lib/seo-strategy/page-opportunity.ts), merging P0's keyword-page mapping with Phase 6's competitor gaps. Presented alongside (not replacing) the AI's own pagesToCreate/blogIdeas prose content briefs. */
  pageOpportunities: PageOpportunity[]
  /** Phase 8 — deterministic Local SEO audit/strategy (lib/seo-strategy/local-seo-intelligence.ts), only populated when the user's own isLocal selection is true. Never AI-generated; the AI's existing localSeo.* fields are left as prose narrative alongside this structured data. */
  localSeoIntelligence: LocalSeoIntelligence
  /** Phase 9 — deterministic, relevance-first off-page strategy (lib/seo-strategy/off-page-intelligence.ts). Replaces AI-invented backlink quotas/DA-DR guidance with a rule-based opportunity catalog scored on topical/local relevance, legitimacy, and spam risk; the AI's remaining offPageStrategy.summary is left as short prose narrative alongside this structured data. */
  offPageIntelligence: OffPageIntelligence
}

// ---------------------------------------------------------------------------
// Input validation
// ---------------------------------------------------------------------------
const inputSchema = z.object({
  websiteUrl: z.string().min(1),
  businessName: z.string().min(1),
  gmbUrl: z.string(),
  isLocal: z.boolean(),
  keywords: z.string(),
  competitors: z.array(z.string()),
  location: z.string(),
  industry: z.string(),
  notes: z.string(),
  analysis: z.any(),
  /** Phase 6 — pre-crawled competitor profiles from /api/seo-strategy/competitor-analyze, one per input.competitors entry that resolved. Optional/untyped here (validated shape-wise by the crawler route itself) so an older client that hasn't crawled competitors yet still works — competitorIntelligence just comes back empty. */
  competitorProfiles: z.array(z.any()).optional(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = inputSchema.safeParse(body)

    if (!parsed.success) {
      return Response.json(
        { error: 'Invalid input', issues: parsed.error.issues },
        { status: 400 },
      )
    }

    const input = parsed.data
    const analysis = input.analysis as SiteAnalysis | null

    // -----------------------------------------------------------------------
    // Deterministic accuracy layer — computed BEFORE the AI call so the
    // prompt can hand the model verified facts instead of asking it to
    // guess, and again used AFTER generation (see runContradictionChecks
    // below) to force-correct anything the AI got wrong anyway. The AI is
    // never the source of truth for these.
    // -----------------------------------------------------------------------
    const localCtx = resolveLocalBusinessContext(input.isLocal, analysis)

    const keywordList = parseKeywordList(input.keywords)
    const pagesForMapping = analysis ? [analysis.homepage, ...analysis.pages].filter((p) => p !== null) : []
    const keywordMappings = mapKeywordsToPages(keywordList, pagesForMapping, { location: input.location })

    const mobile = evaluateMobileFriendliness(analysis)
    const robots = evaluateRobotsTxt(analysis?.robotsTxt ?? null)
    const responseTime = evaluateResponseTime(analysis?.technicalSummary.averageLoadTimeMs ?? null)

    // Phase 2A + 2B — deterministic page-by-page audit (meta title/
    // description/H1/heading structure, content, images, internal linking,
    // technical on-page), computed the same way as everything else above:
    // entirely from crawl data before the AI ever runs. `analysis` is only
    // needed for its crawl-wide fields (crawlCoverage, brokenInternalLinks,
    // robotsTxt), which are never touched when there's nothing to crawl.
    const suggestionOptions = { businessName: input.businessName, location: input.location, isLocalBusiness: localCtx.isLocalBusiness }
    const onPageAuditsRaw: PageOnPageAudit[] = analysis
      ? buildFullPageAudits(analysis, pagesForMapping, keywordMappings, analysis.finalUrl, suggestionOptions)
      : []
    const onPageSummary: OnPageSummary = aggregateFullPageIssues(onPageAuditsRaw)

    // Phase 3 — deterministic on-page report overview + priority fix list,
    // pure aggregation/sorting on top of the Phase 2A/2B audit above. Never
    // computed by, or shown to, the AI.
    const onPageAudits: PageOnPageAuditWithScore[] = attachPageScores(onPageAuditsRaw)
    const onPageOverview: OnPageOverview = analysis
      ? buildOnPageOverview(analysis, onPageAuditsRaw)
      : {
          pagesDiscovered: 0,
          pagesCrawled: 0,
          pagesAudited: 0,
          pagesWithIssues: 0,
          totalIssues: 0,
          bySeverity: { critical: 0, high: 0, medium: 0, low: 0 },
          categories: {
            metaTitle: emptyOnPageCategorySlice(),
            metaDescription: emptyOnPageCategorySlice(),
            headings: emptyOnPageCategorySlice(),
            content: emptyOnPageCategorySlice(),
            images: emptyOnPageCategorySlice(),
            internalLinks: emptyOnPageCategorySlice(),
            technical: emptyOnPageCategorySlice(),
          },
          score: 0,
          scoreStatus: 'critical',
          titleDisplay: { tooLong: 0, tooShort: 0, borderline: 0 },
          descriptionDisplay: { tooLong: 0, tooShort: 0, borderline: 0 },
        }
    const onPagePriorityFixes: PriorityFix[] = buildPriorityFixes(onPageAuditsRaw)

    // Phase 5 — deterministic sitewide crawl/technical summary. Never
    // computed by, or shown to, the AI.
    const technicalCrawlSummary: TechnicalCrawlSummary = analysis
      ? buildTechnicalCrawlSummary(analysis, onPageAuditsRaw)
      : {
          crawlMode: 'quick',
          discovered: 0,
          crawled: 0,
          failed: 0,
          redirected: 0,
          excluded: 0,
          audited: 0,
          coverageNote: 'No automated site analysis was performed.',
          indexable: 0,
          nonIndexable: 0,
          blocked: 0,
          notEvaluatedIndexability: 0,
          sitemapIssues: 0,
          robotsIssues: 0,
          canonicalIssues: 0,
          brokenUrls: 0,
          schemaIssues: 0,
        }

    // Phase 6 — deterministic, evidence-based competitor comparison. Built
    // from this site's own Phase 2B page-type/schema audit plus whatever
    // competitor profiles the client already crawled via
    // /api/seo-strategy/competitor-analyze — never AI-guessed.
    // `competitorProfiles` comes from the client's own earlier crawl calls
    // (untyped in the request schema — see inputSchema above), so a
    // malformed or missing entry (a client bug, or a caller bypassing the
    // UI) is filtered out here rather than trusted — a null/non-object
    // entry would otherwise crash buildCompetitorIntelligence() when it
    // reads `.status`.
    const isValidCompetitorProfile = (p: unknown): p is CompetitorProfile =>
      typeof p === 'object' && p !== null && 'status' in p && ((p as { status: unknown }).status === 'evaluated' || (p as { status: unknown }).status === 'not_evaluated')
    const competitorProfiles: CompetitorProfile[] = Array.isArray(input.competitorProfiles) ? input.competitorProfiles.filter(isValidCompetitorProfile) : []
    const competitorIntelligence: CompetitorIntelligence = buildCompetitorIntelligence(onPageAuditsRaw, competitorProfiles)

    // Phase 7 — deterministic content-gap / pages-to-create strategy.
    // Merges P0's keyword→page mapping with Phase 6's competitor gaps —
    // never a fresh AI guess at what pages to build.
    const pageOpportunities: PageOpportunity[] = buildPageOpportunities(
      keywordMappings,
      { serviceGaps: competitorIntelligence.serviceGaps, locationGaps: competitorIntelligence.locationGaps, contentGaps: competitorIntelligence.contentGaps },
      { isLocalBusiness: localCtx.isLocalBusiness, location: input.location },
    ).opportunities

    // Phase 8 — deterministic Local SEO intelligence. Only runs when the
    // user's own "Local Business" toggle is on; reuses P0's NAP/contact
    // crawl data, Phase 2B's content-similarity audit, Phase 6's
    // competitor location gaps, and Phase 7's page-opportunity engine.
    const localSeoIntelligence: LocalSeoIntelligence = buildLocalSeoIntelligence(
      localCtx.isLocalBusiness,
      localCtx.dataSufficiency,
      input.businessName,
      input.location,
      analysis,
      onPageAuditsRaw,
      keywordMappings,
      competitorIntelligence.locationGaps,
    )

    // Phase 9 — deterministic, relevance-first off-page strategy. Replaces
    // AI-invented backlink quotas/DA-DR guidance with a rule-based
    // opportunity catalog scored on topical/local relevance and legitimacy;
    // reuses P0's local-business context and Phase 2B's page-type data.
    const offPageIntelligence: OffPageIntelligence = buildOffPageIntelligence(
      { isLocalBusiness: localCtx.isLocalBusiness, location: input.location, industry: input.industry, businessName: input.businessName },
      onPageAuditsRaw,
    )

    const analysisDigest = analysis
      ? buildAnalysisDigest(analysis)
      : 'No automated site analysis available. Generate strategy based on the business inputs alone.'

    const competitorList =
      input.competitors.filter(Boolean).length > 0
        ? input.competitors.filter(Boolean).join(', ')
        : 'None provided.'

    const keywordsSection = input.keywords.trim()
      ? `User-provided keywords (from Semrush/Ahrefs/Google Keyword Planner — use these as the foundation):\n${input.keywords.trim()}`
      : 'No user keywords provided. Generate realistic keywords based on the business and analyzed content.'

    const localContext = localCtx.isLocalBusiness
      ? input.gmbUrl
        ? `LOCAL BUSINESS (fixed — do not change this) — GMB URL: ${input.gmbUrl}. Location: ${input.location || 'not specified'}. Pay close attention to NAP consistency between the website and Google Business Profile. Recommend a thorough local SEO strategy including citations, reviews, and local content.`
        : `LOCAL BUSINESS (fixed — do not change this) — Location: ${input.location || 'not specified'}. No GMB URL provided — recommend setting one up.`
      : 'Not a local business — set localSeo.applicable to false but still populate every array with at least 1 brief generic best-practice item so the schema is valid.'

    const keywordMappingLines = keywordMappings
      .map((m) =>
        m.status === 'mapped'
          ? `- "${m.keyword}" → ${m.mappedUrl} (relevance ${m.relevanceScore}/100, confidence ${m.confidence})`
          : `- "${m.keyword}" → NO SUITABLE EXISTING PAGE (best match only ${m.relevanceScore}/100). Recommend creating a dedicated page instead of using an unrelated one.`,
      )
      .join('\n')

    const deterministicFactsBlock = `DETERMINISTIC GROUND TRUTH — verified by code, not by you. Your job is to narrate and strategize around these facts, never to contradict, restate differently, or override them:
- Local business status: ${localCtx.isLocalBusiness ? 'YES — treat as local throughout the entire report' : 'NO — this is not a local business'}. This is fixed by the client's own selection; do not say the opposite anywhere in the report, and do not decide this yourself from the crawled content.
- Local data sufficiency: ${localCtx.dataSufficiency} (${localCtx.reason})
- Mobile friendliness (viewport-based check): ${mobile.mobileFriendly === null ? 'could not be evaluated' : mobile.mobileFriendly ? 'PASS' : 'FAIL'} — ${mobile.finding}
- robots.txt: ${robots.finding}
- Server response time: ${responseTime.finding}
- Keyword → page mapping (validated deterministically — reuse these EXACT target pages verbatim in keywordStrategy.primaryKeywords; the system will overwrite anything else anyway):
${keywordMappingLines || '  (no keywords provided)'}
- Metrics with NO verified data source available (no GSC/GA4/backlink API connected): organic traffic, impressions, click-through rate, keyword rankings, conversion rate, bounce rate, backlinks, referring domains, Domain Authority/Rating. Do not invent baseline numbers for these in kpiTargets — use "Not Available" as the baseline, or a suggested future target only, never a fabricated current measurement.`

    const onPageAuditLines = onPageAudits
      .map((a) => {
        const titleLine =
          a.metaTitle.status === 'good'
            ? `Title OK ("${a.metaTitle.currentValue}", ${a.metaTitle.characterCount} chars) — do not suggest a different title.`
            : `Title needs work (${a.metaTitle.issues.join('; ') || 'see status'}). Deterministic suggestion already generated: "${a.metaTitle.suggestedValue}" — reuse it verbatim as suggestedTitle.`
        const descLine =
          a.metaDescription.status === 'good'
            ? `Description OK (${a.metaDescription.characterCount} chars) — do not suggest a different description.`
            : `Description needs work (${a.metaDescription.issues.join('; ') || 'see status'}). Deterministic suggestion already generated: "${a.metaDescription.suggestedValue}" — reuse it verbatim as suggestedMetaDescription.`
        return `- ${a.url}\n  ${titleLine}\n  ${descLine}`
      })
      .join('\n')

    const onPageFactsBlock = `ON-PAGE AUDIT GROUND TRUTH (per page — deterministic, do not re-decide any of this):
${onPageAuditLines || '  (no crawled pages)'}
For pageByPageAudit: when a page is listed as "OK", set suggestedTitle/suggestedMetaDescription equal to the current value (no change) — never rewrite something that's already good. When a page "needs work", the deterministic suggestion given above has already passed length/genericness/keyword-stuffing validation — reuse it verbatim rather than inventing your own. A later automated pass will overwrite anything that doesn't match this anyway.`

    // Phase 2B — content/images/internal-linking/technical facts, so the
    // AI's onPageAudit.imageOptimization/internalLinking/schemaMarkup
    // narrative and pageByPageAudit issues/recommendations describe what
    // was actually found rather than generic statements.
    const phase2bCriticalHighLines = onPageAudits
      .flatMap((a) => {
        const lines: string[] = []
        if (a.technicalOnPage.statusCode.severity === 'critical' || a.technicalOnPage.statusCode.severity === 'high') {
          lines.push(`- ${a.url}: HTTP ${a.technicalOnPage.statusCode.code}.`)
        }
        if (a.technicalOnPage.indexability.severity === 'critical' || a.technicalOnPage.indexability.severity === 'high') {
          lines.push(`- ${a.url}: ${a.technicalOnPage.indexability.result} — ${a.technicalOnPage.indexability.reasons.join('; ')}.`)
        }
        if (a.internalLinks.brokenLinks.length > 0) {
          lines.push(
            `- ${a.url}: ${a.internalLinks.brokenLinks.length} broken internal link(s) — ${a.internalLinks.brokenLinks
              .map((b) => `"${b.anchor || '(no anchor text)'}" → ${b.target} (${b.statusCode ?? 'request failed'})`)
              .join(', ')}.`,
          )
        }
        if (a.content.severity === 'critical' || a.content.severity === 'high') {
          lines.push(`- ${a.url}: ${a.content.issues.join('; ')}.`)
        }
        return lines
      })
      .slice(0, 20)
      .join('\n')

    const phase2bFactsBlock = `PHASE 2B AUDIT GROUND TRUTH — deterministic, sitewide (content, images, internal linking, technical on-page). Reflect these exact facts in onPageAudit.imageOptimization/internalLinking/schemaMarkup findings and in pageByPageAudit issues/recommendations — never claim a page has no image/content/link/schema/OG issues if the data below says otherwise, and never call a page "orphaned" or a link "broken" unless it's listed here:
- Content: ${onPageSummary.contentIssues.total} page(s) with issues (${onPageSummary.contentIssues.thinPages} thin, ${onPageSummary.contentIssues.duplicatePages} duplicate/near-duplicate, ${onPageSummary.contentIssues.intentMismatchPages} intent mismatch).
- Images: ${onPageSummary.imageIssues.total} page(s) with issues — ${onPageSummary.imageIssues.missingAlt} images missing/empty alt, ${onPageSummary.imageIssues.weakAlt} weak/generic alt, ${onPageSummary.imageIssues.oversized} oversized.
- Internal linking: ${onPageSummary.internalLinkIssues.total} page(s) with issues — ${onPageSummary.internalLinkIssues.orphanPages} orphan candidate(s), ${onPageSummary.internalLinkIssues.weakPages} weakly-linked, ${onPageSummary.internalLinkIssues.brokenLinks} broken internal link(s) sitewide.
- Technical: ${onPageSummary.technicalIssues.total} page(s) with issues — canonical: ${onPageSummary.technicalIssues.canonical}, indexability: ${onPageSummary.technicalIssues.indexability}, status codes: ${onPageSummary.technicalIssues.statusCodes}, schema: ${onPageSummary.technicalIssues.schema}, Open Graph: ${onPageSummary.technicalIssues.openGraph}, Twitter: ${onPageSummary.technicalIssues.twitter}, URL structure: ${onPageSummary.technicalIssues.urlStructure}.
Specific critical/high findings by page:
${phase2bCriticalHighLines || '  (none)'}`

    const prompt = `You are a senior SEO strategist with 15+ years of experience producing client-ready strategy reports. Generate a comprehensive, professional, data-driven SEO strategy that will impress an enterprise client.

CLIENT INFORMATION
- Business Name: ${input.businessName}
- Website: ${input.websiteUrl}
- Industry: ${input.industry || 'Infer from analyzed content'}
- Primary Location: ${input.location || 'Not specified'}
- Local Business: ${input.isLocal ? 'Yes' : 'No'}
- Google Business Profile: ${input.gmbUrl || 'Not provided'}
- Competitors: ${competitorList}
- Additional Notes: ${input.notes || 'None'}

${localContext}

${keywordsSection}

${deterministicFactsBlock}

${onPageFactsBlock}

${phase2bFactsBlock}

LIVE SITE ANALYSIS (real data crawled from the actual website — base your audit on this)
${analysisDigest}

OUTPUT REQUIREMENTS — every field is required. Use these counts as targets:
- criticalIssues: 4-6 items
- quickWins: 4-6 items
- technicalSeoAudit.checklist: 10-12 items
- pageByPageAudit: 4-8 items (one per crawled URL)
- keywordStrategy.primaryKeywords: 8-12 items, longTailKeywords: 8-12 items, contentClusters: 2-4 items (each with 4-6 supportingKeywords)
- pagesToCreate: 4-6 items (suggestedWordCount between 800-3000)
- blogIdeas: 8-10 items (suggestedWordCount between 1000-3000, outline 5-8 H2 items each)
- competitorAnalysis: one entry per competitor provided (or empty array if none)
- localSeo arrays: at least 2 items each
- offPageStrategy.summary: 2-4 sentences, relevance-first framing (no link-count targets, no DA/DR figures)
- sixMonthRoadmap: EXACTLY 6 items, month=1 through 6, in order
- kpiTargets: 6-8 items
- toolStack.free: 4-6, toolStack.paid: 4-6
- riskAssessment: 3-5 items
- onPageAudit.schemaMarkup.recommendedTypes: 3-6 items

Important content rules:
1. criticalIssues + quickWins must reference real numbers from the live analysis (load times, missing tags, etc.)
2. technicalSeoAudit.checklist statuses must reflect the real state of the site
3. pageByPageAudit must use the actual URLs from the crawled pages with rewritten title (50-60 chars) and meta description (140-160 chars)
4. offPageStrategy.summary must frame off-page work as relevance-first (topical/local relevance, legitimacy, editorial value) — never mention a target link count, Domain Authority/Rating figure (e.g. "DR40+"), or any other unverified backlink metric.
5. sixMonthRoadmap progression: M1 foundation/fixes → M2 on-page + content launch → M3 content scaling + first link building → M4 authority + technical refinement → M5 content + outreach → M6 consolidation, conversion optimization, reporting.
6. overallHealthScore: be honest. 0-100 — sites with many critical issues = 30-50, polished sites = 70-90.
7. Tone: confident, prescriptive, professional. No fluff.

Hard rules — a later automated validation pass checks these and will overwrite anything that violates them, so following them the first time avoids a corrected/inconsistent-looking report:
1. Do not override the deterministic findings above (local business status, mobile-friendliness, robots.txt, keyword→page mappings).
2. Do not invent metrics or numeric baselines you cannot verify from the live site analysis.
3. Do not invent crawl results (pages, tags, schema, etc.) beyond what LIVE SITE ANALYSIS shows.
4. Do not change the local business state from what DETERMINISTIC GROUND TRUTH states.
5. Do not assign a keyword to a different URL than its validated mapping above.
6. Do not claim something was verified (e.g. "audited the entire site") if it was not.
7. Use "Not Available" for KPI baselines you cannot verify, and reflect "not evaluated" findings honestly rather than guessing.
8. Keep factual findings (what the crawl found) separate from strategic recommendations (what to do about it).
9. Follow the ON-PAGE AUDIT GROUND TRUTH above exactly for suggestedTitle/suggestedMetaDescription — do not propose a change for a page marked OK, and do not invent your own rewrite for a page that needs one when a deterministic suggestion is already given.
10. Do not invent technical findings — image alt/size issues, broken links, orphan pages, canonical/indexability/schema/OG/Twitter status all come from the PHASE 2B AUDIT GROUND TRUTH above. Match your narrative to those exact counts and per-page findings; never claim a page is clean when it's listed there, and never invent an issue on a page not listed there.`

    let strategy: RawAiStrategy
    try {
      const { output } = await generateText({
        model: openai('gpt-4o-mini'),
        output: Output.object({ schema: strategySchema }),
        prompt,
        maxOutputTokens: 16000,
      })
      strategy = output
    } catch (err) {
      // If the model returned text but it didn't validate against the schema,
      // try to recover the partial JSON instead of failing the whole request.
      if (NoObjectGeneratedError.isInstance(err)) {
        console.error('[v0] NoObjectGeneratedError', {
          cause: err.cause,
          textPreview: err.text?.slice(0, 500),
        })
        // Attempt to parse the raw text as JSON and validate softly
        if (err.text) {
          try {
            const raw = extractJson(err.text)
            const partial = strategySchema.partial().safeParse(raw)
            if (partial.success && partial.data) {
              return Response.json({
                error:
                  'The AI returned a partially-valid response. Some sections may be missing — please regenerate.',
                partial: partial.data,
              }, { status: 502 })
            }
          } catch {
            // fall through to generic error
          }
        }
        return Response.json(
          {
            error:
              'The AI did not return a valid strategy object. This usually means the model timed out or rate-limited. Please try again — keeping the keyword list under ~200 lines helps.',
          },
          { status: 502 },
        )
      }
      throw err
    }

    // -----------------------------------------------------------------------
    // Contradiction validation + final corrections. This runs on every
    // response — the AI output above is treated as a draft, never as the
    // source of truth for local-business status, severities, keyword→page
    // targets, or KPI baselines. See lib/seo-strategy/contradiction-checker.ts
    // for the priority rule this enforces.
    // -----------------------------------------------------------------------
    const contradictionResult = runContradictionChecks({
      strategy,
      isLocalBusiness: localCtx.isLocalBusiness,
      localDataSufficiency: localCtx.dataSufficiency,
      analysis,
      keywordMappings,
    })

    const targetPageCorrectionByKeyword = new Map(
      contradictionResult.keywordTargetCorrections.map((c) => [normalizeKeyword(c.keyword), c.correctedTargetPage]),
    )

    // Phase 2A — cross-check the AI's per-page title/description
    // suggestions against the deterministic on-page audit computed earlier.
    const onPageContradictionResult = runOnPageContradictionChecks(strategy.pageByPageAudit, onPageAudits)
    const suggestionCorrectionByUrl = new Map(onPageContradictionResult.corrections.map((c) => [c.url, c]))

    // Phase 2B — narrative sanity checks (logged, not auto-rewritten — see
    // contradiction-checker.ts) for the AI's onPageAudit prose against the
    // deterministic content/image/internal-link/technical summary.
    const phase2bContradictions = runPhase2BContradictionChecks(strategy, onPageSummary)

    // Phase 4 — defense-in-depth check that pixelWidth/pixelStatus stayed
    // internally consistent (see contradiction-checker.ts's header note).
    const serpPixelContradictions = runSerpPixelContradictionChecks(onPageAudits)

    // Phase 5 — the AI must never claim complete/full-site crawl coverage
    // when the deterministic crawl actually skipped discovered URLs. Unlike
    // the other narrative checks, this one's correction is actually applied
    // below (technicalSeoAudit.summary), not just logged.
    const crawlCoverageResult = runCrawlCoverageContradictionChecks(strategy, analysis)

    // Phase 6 — the AI's free-text competitorAnalysis[].strengths/
    // weaknesses/opportunitiesToOutrank/contentGaps are entirely replaced
    // with deterministic, evidence-based content. The AI schema doesn't
    // enforce ordering, so each entry is matched to its crawled profile by
    // normalized domain/URL (findProfileForEntry — the same matcher the
    // contradiction checker below uses), never by array position. A
    // competitor the AI listed but that was never crawled (an older
    // client, or a competitor whose crawl failed) keeps only what's
    // actually verifiable: its name/URL, with empty finding arrays rather
    // than fabricated ones.
    const competitorContradictions = runCompetitorContradictionChecks(strategy.competitorAnalysis, competitorProfiles)

    // Phase 7 — diagnostic-only check of the AI's pagesToCreate/blogIdeas
    // prose against P0's keyword-page mapping (the deterministic
    // pageOpportunities list above is what the report actually shows).
    const pageOpportunityContradictions = runPageOpportunityContradictionChecks(strategy.pagesToCreate, strategy.blogIdeas, keywordMappings)

    // Phase 8 — corrects the AI's napConsistency.issues when it claims NAP
    // is consistent while the deterministic audit found real conflicts;
    // logs (never rewrites) any specific GBP/review metric claimed with no
    // verified data source.
    const localSeoResult = runLocalSeoContradictionChecks(strategy.localSeo, localSeoIntelligence.nap)

    // Phase 9 — diagnostic-only check of the AI's remaining offPageStrategy
    // summary prose (backlink counts, DA/DR claims, unverified competitor
    // backlink comparisons, guaranteed link quotas) plus a defense-in-depth
    // structural check of the deterministic offPageIntelligence itself.
    const offPageContradictions = runOffPageContradictionChecks(strategy.offPageStrategy, offPageIntelligence, localCtx.isLocalBusiness)

    const correctedCompetitorAnalysis = strategy.competitorAnalysis.map((entry) => {
      const profile = findProfileForEntry(entry, competitorProfiles)
      const domain = profile?.domain
      const forDomain = (s: { competitorDomain: string }) => domain !== undefined && domain !== null && s.competitorDomain === domain
      return {
        ...entry,
        strengths: profile?.status === 'evaluated' ? competitorIntelligence.strengths.filter(forDomain).map((s) => `${s.statement} ${s.evidence}`) : [],
        weaknesses: profile?.status === 'evaluated' ? competitorIntelligence.weaknesses.filter(forDomain).map((s) => `${s.statement} ${s.evidence}`) : [],
        opportunitiesToOutrank:
          profile?.status === 'evaluated'
            ? competitorIntelligence.opportunities.filter((o) => o.competitorUrls.some((u) => profile.pages.some((p) => p.url === u))).map((o) => o.opportunity)
            : [],
        contentGaps:
          profile?.status === 'evaluated'
            ? competitorIntelligence.contentGaps.filter((g) => g.competitorUrls.some((u) => profile.pages.some((p) => p.url === u))).map((g) => g.opportunity)
            : [],
      }
    })

    const correctedStrategy: SeoStrategy = {
      ...strategy,
      localSeo: { ...strategy.localSeo, applicable: contradictionResult.localSeoApplicable, napConsistency: localSeoResult.correctedNapConsistency },
      healthScoreBreakdown: {
        ...strategy.healthScoreBreakdown,
        local: contradictionResult.healthScoreLocal,
        localStatus: contradictionResult.healthScoreLocalStatus,
      },
      technicalSeoAudit: {
        ...strategy.technicalSeoAudit,
        checklist: contradictionResult.correctedChecklist,
        summary: crawlCoverageResult.correctedSummary,
      },
      keywordStrategy: {
        ...strategy.keywordStrategy,
        primaryKeywords: strategy.keywordStrategy.primaryKeywords.map((k) => {
          const correctedTargetPage = targetPageCorrectionByKeyword.get(normalizeKeyword(k.keyword))
          return correctedTargetPage ? { ...k, targetPage: correctedTargetPage } : k
        }),
      },
      pageByPageAudit: strategy.pageByPageAudit.map((p) => {
        const correction = suggestionCorrectionByUrl.get(p.url)
        if (!correction) return p
        return {
          ...p,
          suggestedTitle: correction.suggestedTitle ?? p.suggestedTitle,
          suggestedMetaDescription: correction.suggestedMetaDescription ?? p.suggestedMetaDescription,
        }
      }),
      kpiTargets: sanitizeKpiTargets(strategy.kpiTargets),
      keywordPageMappings: keywordMappings,
      onPageAudits,
      onPageSummary,
      onPageOverview,
      onPagePriorityFixes,
      technicalCrawlSummary,
      competitorAnalysis: correctedCompetitorAnalysis,
      competitorIntelligence,
      pageOpportunities,
      localSeoIntelligence,
      offPageIntelligence,
    }

    // Contradiction details are diagnostic-only — never exposed to
    // production users, only helpful in development.
    const allContradictions = [
      ...contradictionResult.contradictions,
      ...onPageContradictionResult.contradictions,
      ...phase2bContradictions,
      ...serpPixelContradictions,
      ...crawlCoverageResult.contradictions,
      ...competitorContradictions,
      ...pageOpportunityContradictions,
      ...localSeoResult.contradictions,
      ...offPageContradictions,
    ]
    const debug =
      process.env.NODE_ENV !== 'production' && allContradictions.length > 0 ? { contradictions: allContradictions } : undefined

    return Response.json({ strategy: correctedStrategy, ...(debug ? { debug } : {}) })
  } catch (err) {
    console.error('[v0] SEO strategy generation error:', err)
    const message =
      err instanceof Error ? err.message : 'Failed to generate strategy'
    return Response.json({ error: message }, { status: 500 })
  }
}

// Try to pull a JSON object out of a string that may have markdown fences etc.
function extractJson(text: string): unknown {
  const trimmed = text.trim()
  // Strip markdown code fences if present
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)
  const candidate = fenced ? fenced[1] : trimmed
  // Find first { and last }
  const first = candidate.indexOf('{')
  const last = candidate.lastIndexOf('}')
  if (first === -1 || last === -1) throw new Error('No JSON object found')
  return JSON.parse(candidate.slice(first, last + 1))
}

// ---------------------------------------------------------------------------
// Build a compact text digest of the live site analysis for the prompt
// ---------------------------------------------------------------------------
function buildAnalysisDigest(a: SiteAnalysis): string {
  const lines: string[] = []
  lines.push(`Domain: ${a.domain}`)
  lines.push(`HTTPS: ${a.isHttps ? 'Yes' : 'NO — critical issue'}`)
  lines.push(`Pages crawled: ${a.totalPagesCrawled}`)
  lines.push(`Avg load time: ${a.technicalSummary.averageLoadTimeMs}ms`)
  lines.push(`Avg word count: ${a.technicalSummary.averageWordCount}`)
  lines.push('')
  lines.push('TECHNICAL SUMMARY:')
  lines.push(`- robots.txt: ${a.robotsTxt.found ? 'found' : 'MISSING'}${a.robotsTxt.disallowsAll ? ' (DISALLOWS ALL — critical!)' : ''}`)
  lines.push(`- XML sitemap: ${a.sitemapXml.found ? `found (${a.sitemapXml.urlCount} URLs)` : 'MISSING'}`)
  lines.push(`- HTML sitemap: ${a.htmlSitemap.found ? 'found' : 'missing'}`)
  lines.push(`- Pages with canonical: ${a.technicalSummary.hasCanonicals}/${a.totalPagesCrawled}`)
  lines.push(`- Pages with meta description: ${a.technicalSummary.hasMetaDescriptions}/${a.totalPagesCrawled}`)
  lines.push(`- Pages with single H1: ${a.technicalSummary.hasH1}/${a.totalPagesCrawled} (missing: ${a.technicalSummary.missingH1}, multiple: ${a.technicalSummary.multipleH1})`)
  lines.push(`- Pages with schema markup: ${a.technicalSummary.hasSchema}/${a.totalPagesCrawled}`)
  lines.push(`- Pages with full Open Graph: ${a.technicalSummary.hasOgTags}/${a.totalPagesCrawled}`)
  lines.push(`- Pages with Twitter cards: ${a.technicalSummary.hasTwitterTags}/${a.totalPagesCrawled}`)
  lines.push('')
  lines.push('NAP / CONTACT INFO EXTRACTED FROM SITE:')
  lines.push(`- Phones: ${a.contactInfo.phones.join(' | ') || 'none found'}`)
  lines.push(`- Emails: ${a.contactInfo.emails.join(' | ') || 'none found'}`)
  lines.push(`- Addresses: ${a.contactInfo.addresses.join(' | ') || 'none found'}`)
  lines.push('')
  lines.push('PAGES CRAWLED:')
  const allPages = [a.homepage, ...a.pages].filter(Boolean)
  for (const p of allPages.slice(0, 10)) {
    if (!p) continue
    lines.push(`* ${p.url}`)
    lines.push(`  - Title (${p.titleLength} chars): ${p.title || 'MISSING'}`)
    lines.push(`  - Meta desc (${p.metaDescriptionLength} chars): ${p.metaDescription || 'MISSING'}`)
    lines.push(`  - H1 (${p.h1.length}): ${p.h1.slice(0, 2).join(' | ') || 'MISSING'}`)
    lines.push(`  - H2 count: ${p.h2.length}, H3 count: ${p.h3.length}`)
    lines.push(`  - Word count: ${p.wordCount}`)
    lines.push(`  - Schema: ${p.schemaTypes.join(', ') || 'none'}`)
    lines.push(`  - OG tags: ${Object.keys(p.ogTags).length}, Twitter tags: ${Object.keys(p.twitterTags).length}`)
    lines.push(`  - Images: ${p.imageCount} (${p.imagesWithoutAlt} missing alt)`)
    lines.push(`  - Internal links: ${p.internalLinkCount}, External: ${p.externalLinkCount}`)
    lines.push(`  - Load time: ${p.loadTimeMs}ms`)
    if (p.issues.length > 0) lines.push(`  - Issues: ${p.issues.join('; ')}`)
  }
  return lines.join('\n')
}
