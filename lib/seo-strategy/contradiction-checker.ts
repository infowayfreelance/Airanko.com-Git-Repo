// ──────────────────────────────────────────────────────────────────────────
// Final validation pass, run after AI generation and before the report is
// returned to the client.
//
// Priority rule (per P0 spec): structured crawl data > deterministic
// validation > user input > AI-generated narrative. AI text must never
// override verified structured data, so every correction here flows from
// deterministic sources into the AI's output — never the other way.
//
// Structural typing note: the interfaces below intentionally describe only
// the fields this module touches, not the full AI schema. The real
// `SeoStrategy`/AI output type (defined in app/api/seo-strategy/route.ts)
// structurally satisfies them, which avoids a circular import between this
// module and the route.
// ──────────────────────────────────────────────────────────────────────────
import type { SiteAnalysis } from '@/app/api/seo-strategy/analyze/route'
import {
  evaluateMobileFriendliness,
  evaluateRobotsTxt,
  evaluateResponseTime,
  severityToChecklistFields,
  type ChecklistPriority,
  type ChecklistStatus,
} from './severity'
import type { KeywordPageMapping, LocalDataSufficiency, OnPageSummary, PageOnPageAudit, Severity } from './types'
import { normalizeKeyword } from './keyword-mapping'
import { normalizeForDuplicateCheck } from './on-page-audit'
import type { Finding } from './evidence'

export interface ChecklistItemLike {
  item: string
  status: ChecklistStatus
  priority: ChecklistPriority
  finding: string
  recommendation: string
}

export interface PrimaryKeywordLike {
  keyword: string
  targetPage: string
}

/** Corrected target page for one AI-generated primary keyword — deliberately NOT the whole keyword object, so callers can merge this into their own concretely-typed array without losing fields (e.g. intent/difficulty/priority) this module doesn't know about. */
export interface KeywordTargetCorrection {
  keyword: string
  correctedTargetPage: string
}

export interface ContradictionCheckableStrategy {
  executiveSummary: string
  healthScoreBreakdown: { local: number }
  technicalSeoAudit: { summary: string; checklist: ChecklistItemLike[] }
  localSeo: { applicable: boolean }
  keywordStrategy: { primaryKeywords: PrimaryKeywordLike[] }
}

export interface ContradictionCheckInput<T extends ContradictionCheckableStrategy> {
  strategy: T
  isLocalBusiness: boolean
  localDataSufficiency: LocalDataSufficiency
  analysis: SiteAnalysis | null
  keywordMappings: KeywordPageMapping[]
}

export interface ContradictionResult {
  localSeoApplicable: boolean
  healthScoreLocal: number | null
  healthScoreLocalStatus: LocalDataSufficiency
  correctedChecklist: ChecklistItemLike[]
  keywordTargetCorrections: KeywordTargetCorrection[]
  /** Human-readable log of every correction made — dev/debug only, never shown to end users. */
  contradictions: string[]
}

export function runContradictionChecks<T extends ContradictionCheckableStrategy>(
  input: ContradictionCheckInput<T>,
): ContradictionResult {
  const { strategy, analysis } = input
  const contradictions: string[] = []

  const mobile = evaluateMobileFriendliness(analysis)
  const robots = evaluateRobotsTxt(analysis?.robotsTxt ?? null)
  const responseTime = evaluateResponseTime(analysis?.technicalSummary.averageLoadTimeMs ?? null)

  // 1) Local business is decided by the user, never the AI.
  const localSeoApplicable = input.isLocalBusiness
  if (strategy.localSeo.applicable !== localSeoApplicable) {
    contradictions.push(
      `localSeo.applicable was ${strategy.localSeo.applicable}, forced to ${localSeoApplicable} — the user's "Local Business" selection is the source of truth, the AI cannot override it.`,
    )
  }

  // 2) Local health score: never fabricate a 0 when we simply lack data,
  //    and never report a score at all for a non-local business.
  let healthScoreLocal: number | null = strategy.healthScoreBreakdown.local
  const healthScoreLocalStatus: LocalDataSufficiency = input.localDataSufficiency
  if (healthScoreLocalStatus !== 'evaluated') {
    if (healthScoreLocal !== null) {
      contradictions.push(
        `healthScoreBreakdown.local was ${healthScoreLocal} while status is "${healthScoreLocalStatus}" — corrected to null so the UI shows "Not Evaluated"/"Not Applicable" instead of a fabricated score.`,
      )
    }
    healthScoreLocal = null
  }

  // 3) Checklist: mobile / robots / response-time categories must reflect
  //    deterministic ground truth, and a passing check can never carry a
  //    critical/high priority.
  const correctedChecklist = strategy.technicalSeoAudit.checklist.map((raw) =>
    correctChecklistItem(raw, { mobile, robots, responseTime }, contradictions),
  )
  ensureDeterministicChecklistCoverage(correctedChecklist, { mobile, robots }, contradictions)

  // 4) Keyword -> page mapping: deterministic validation wins over
  //    whatever target page the AI invented. Returned as corrections rather
  //    than full keyword objects so callers can merge this into their own
  //    concretely-typed array without losing fields this module doesn't
  //    know about (e.g. intent/difficulty/priority).
  const mappingByKeyword = new Map(input.keywordMappings.map((m) => [normalizeKeyword(m.keyword), m]))
  const keywordTargetCorrections: KeywordTargetCorrection[] = []
  for (const k of strategy.keywordStrategy.primaryKeywords) {
    const mapping = mappingByKeyword.get(normalizeKeyword(k.keyword))
    if (!mapping) continue // keyword wasn't one of the user's mapped keywords (e.g. AI-suggested variant) — leave as-is
    const correctedTargetPage =
      mapping.status === 'mapped' && mapping.mappedUrl
        ? mapping.mappedUrl
        : `No suitable existing page — ${mapping.recommendation ?? 'create a dedicated page'}`
    if (k.targetPage !== correctedTargetPage) {
      contradictions.push(
        `Keyword "${k.keyword}" targetPage corrected from "${k.targetPage}" to "${correctedTargetPage}" (deterministic relevance score ${mapping.relevanceScore}, confidence ${mapping.confidence}).`,
      )
    }
    keywordTargetCorrections.push({ keyword: k.keyword, correctedTargetPage })
  }

  // 5) Narrative sanity checks against structured data. These are logged,
  //    not auto-rewritten — safely correcting free-form AI prose isn't
  //    possible without another generation pass, so we surface them for
  //    debugging instead of silently letting a known contradiction through.
  if (analysis) {
    if (
      /no schema|missing schema|lacks (any )?schema/i.test(strategy.technicalSeoAudit.summary) &&
      analysis.technicalSummary.hasSchema > 0
    ) {
      contradictions.push(
        'technicalSeoAudit.summary claims no schema markup, but the crawl found schema on at least one page.',
      )
    }
    if (
      /robots\.txt (is missing|does not exist|not found)/i.test(strategy.technicalSeoAudit.summary) &&
      analysis.robotsTxt.found
    ) {
      contradictions.push('technicalSeoAudit.summary claims robots.txt is missing, but the crawler found one.')
    }
    if (
      /entire (site|website)|every (single )?page|whole website/i.test(strategy.executiveSummary) &&
      analysis.sitemapXml.found &&
      analysis.sitemapXml.urlCount > analysis.totalPagesCrawled * 2
    ) {
      contradictions.push(
        `executiveSummary implies the entire site was audited, but only ${analysis.totalPagesCrawled}/${analysis.sitemapXml.urlCount} sitemap URLs were actually crawled.`,
      )
    }
  }

  if (contradictions.length > 0 && process.env.NODE_ENV !== 'production') {
    console.warn('[seo-strategy] contradiction checker corrected the following:', contradictions)
  }

  return {
    localSeoApplicable,
    healthScoreLocal,
    healthScoreLocalStatus,
    correctedChecklist,
    keywordTargetCorrections,
    contradictions,
  }
}

function correctChecklistItem(
  raw: ChecklistItemLike,
  ctx: {
    mobile: { severity: Severity; finding: string }
    robots: { severity: Severity; finding: string }
    responseTime: { severity: Severity; finding: string }
  },
  contradictions: string[],
): ChecklistItemLike {
  let corrected = raw

  // Speed is checked first and is the most specific pattern: a title like
  // "Mobile Page Speed" would otherwise also match the mobile-friendliness
  // pattern below and get overwritten with a viewport verdict, discarding a
  // genuinely slow response-time finding. robots.txt and mobile categories
  // don't overlap with each other or with speed wording, so their order
  // relative to one another doesn't matter.
  if (/page speed|load time|response time|server speed/i.test(raw.item)) {
    corrected = applyDeterministicSeverity(
      corrected,
      ctx.responseTime.severity,
      ctx.responseTime.finding,
      contradictions,
      'response time',
    )
  } else if (/robots\.txt/i.test(raw.item)) {
    corrected = applyDeterministicSeverity(corrected, ctx.robots.severity, ctx.robots.finding, contradictions, 'robots.txt')
  } else if (/mobile|responsive|viewport/i.test(raw.item)) {
    corrected = applyDeterministicSeverity(corrected, ctx.mobile.severity, ctx.mobile.finding, contradictions, 'mobile-friendliness')
  }

  // Generic contradiction, independent of category: a passing check can
  // never be critical/high severity.
  if (corrected.status === 'pass' && (corrected.priority === 'critical' || corrected.priority === 'high')) {
    contradictions.push(
      `Checklist item "${corrected.item}" was status=pass with priority=${corrected.priority} — clamped priority to low.`,
    )
    corrected = { ...corrected, priority: 'low' }
  }

  return corrected
}

function applyDeterministicSeverity(
  item: ChecklistItemLike,
  severity: Severity,
  finding: string,
  contradictions: string[],
  label: string,
): ChecklistItemLike {
  const { status, priority } = severityToChecklistFields(severity)
  if (item.status !== status || item.priority !== priority) {
    contradictions.push(
      `Checklist item "${item.item}" (${label}) corrected from status=${item.status}/priority=${item.priority} to status=${status}/priority=${priority}.`,
    )
  }
  return { ...item, status, priority, finding }
}

function ensureDeterministicChecklistCoverage(
  checklist: ChecklistItemLike[],
  ctx: { mobile: { severity: Severity; finding: string }; robots: { severity: Severity; finding: string } },
  contradictions: string[],
): void {
  const has = (re: RegExp) => checklist.some((c) => re.test(c.item))
  if (!has(/mobile|responsive|viewport/i)) {
    checklist.push(buildDeterministicItem('Mobile Friendliness (Viewport)', ctx.mobile.severity, ctx.mobile.finding))
    contradictions.push('AI checklist omitted a mobile-friendliness check — deterministic entry added.')
  }
  if (!has(/robots\.txt/i)) {
    checklist.push(buildDeterministicItem('robots.txt', ctx.robots.severity, ctx.robots.finding))
    contradictions.push('AI checklist omitted a robots.txt check — deterministic entry added.')
  }
}

function buildDeterministicItem(item: string, severity: Severity, finding: string): ChecklistItemLike {
  const { status, priority } = severityToChecklistFields(severity)
  return {
    item,
    status,
    priority,
    finding,
    recommendation:
      severity === 'pass'
        ? 'No action needed.'
        : severity === 'not_evaluated'
          ? 'Re-run the audit once this can be verified.'
          : 'Address this finding based on the details above.',
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Phase 2A — on-page (meta title / meta description / H1 / heading
// structure) contradiction checks. All of title/description/H1 status,
// severity, counts, and duplicate detection are produced entirely by
// lib/seo-strategy/on-page-audit.ts from structured crawl data, so the
// "reject H1 count=0 with status=pass" / "duplicate title=true with
// status=good" / "heading hierarchy invalid with issues=[]" cases the P0
// spec calls out are structurally impossible there — the AI never touches
// those fields. What the AI DOES still produce is the existing
// pageByPageAudit's free-text suggestedTitle/suggestedMetaDescription and
// recommendations, which this section cross-checks against the
// deterministic on-page audit the same way P0 cross-checks keyword target
// pages: deterministic wins, AI's mismatched suggestion is replaced.
// ─────────────────────────────────────────────────────────────────────────
export interface PageByPageAuditItemLike {
  url: string
  currentTitle: string | null
  suggestedTitle: string
  currentMetaDescription: string | null
  suggestedMetaDescription: string
  recommendations: string[]
}

/** Corrected suggestion(s) for one page — undefined fields mean "no correction needed", so callers only overwrite what changed. */
export interface PageByPageSuggestionCorrection {
  url: string
  suggestedTitle?: string
  suggestedMetaDescription?: string
}

const REWRITE_TITLE_PHRASE_RE = /rewrite (the )?title|change (the )?title|update (the )?title|title needs (to be )?(rewritten|changed|updated)/i
const REWRITE_DESCRIPTION_PHRASE_RE =
  /rewrite (the )?(meta )?description|change (the )?(meta )?description|update (the )?(meta )?description|description needs (to be )?(rewritten|changed|updated)/i

function sameValue(a: string | null | undefined, b: string | null | undefined): boolean {
  return normalizeForDuplicateCheck(a ?? '') === normalizeForDuplicateCheck(b ?? '')
}

/**
 * Cross-checks the AI's per-page title/description suggestions against the
 * deterministic on-page audit for that same URL. Returns only the
 * corrections needed — callers merge these into their own concretely-typed
 * pageByPageAudit array (see keywordTargetCorrections above for why this
 * isn't just "the corrected array").
 */
export function runOnPageContradictionChecks(
  pageByPageAudit: PageByPageAuditItemLike[],
  onPageAudits: PageOnPageAudit[],
): { corrections: PageByPageSuggestionCorrection[]; contradictions: string[] } {
  const contradictions: string[] = []
  const onPageByUrl = new Map(onPageAudits.map((a) => [a.url, a]))
  const corrections: PageByPageSuggestionCorrection[] = []

  for (const item of pageByPageAudit) {
    const onPage = onPageByUrl.get(item.url)
    if (!onPage) continue
    const correction: PageByPageSuggestionCorrection = { url: item.url }

    // Title: already good but AI proposed a change -> revert to current.
    // Needs improvement -> the deterministic suggestion is the only one
    // that has passed validation, so ANY AI value that doesn't match it
    // exactly gets replaced — not just a no-op "AI left it unchanged" case.
    // Otherwise an AI rewrite that differs from both the current value and
    // the validated suggestion (an arbitrary, unvalidated rewrite) would
    // silently survive.
    if (onPage.metaTitle.status === 'good') {
      if (item.currentTitle && !sameValue(item.suggestedTitle, item.currentTitle)) {
        contradictions.push(`Page ${item.url}: title is already good but the AI suggested a rewrite — reverted to the current title.`)
        correction.suggestedTitle = item.currentTitle
      }
    } else if (onPage.metaTitle.suggestedValue && !sameValue(item.suggestedTitle, onPage.metaTitle.suggestedValue)) {
      contradictions.push(
        `Page ${item.url}: title needs improvement (${onPage.metaTitle.issues.join('; ')}) — the AI's suggestion ("${item.suggestedTitle}") didn't match the validated deterministic one, so it was used instead.`,
      )
      correction.suggestedTitle = onPage.metaTitle.suggestedValue
    }
    if (onPage.metaTitle.status === 'good' && item.recommendations.some((r) => REWRITE_TITLE_PHRASE_RE.test(r))) {
      contradictions.push(`Page ${item.url}: title is marked good but a recommendation still asks to rewrite it (narrative contradiction, not auto-rewritten).`)
    }

    // Meta description: same pattern.
    if (onPage.metaDescription.status === 'good') {
      if (item.currentMetaDescription && !sameValue(item.suggestedMetaDescription, item.currentMetaDescription)) {
        contradictions.push(
          `Page ${item.url}: description is already good but the AI suggested a rewrite — reverted to the current description.`,
        )
        correction.suggestedMetaDescription = item.currentMetaDescription
      }
    } else if (onPage.metaDescription.suggestedValue && !sameValue(item.suggestedMetaDescription, onPage.metaDescription.suggestedValue)) {
      contradictions.push(
        `Page ${item.url}: description needs improvement (${onPage.metaDescription.issues.join('; ')}) — the AI's suggestion didn't match the validated deterministic one, so it was used instead.`,
      )
      correction.suggestedMetaDescription = onPage.metaDescription.suggestedValue
    }
    if (onPage.metaDescription.status === 'good' && item.recommendations.some((r) => REWRITE_DESCRIPTION_PHRASE_RE.test(r))) {
      contradictions.push(
        `Page ${item.url}: description is marked good but a recommendation still asks to rewrite it (narrative contradiction, not auto-rewritten).`,
      )
    }

    if (correction.suggestedTitle !== undefined || correction.suggestedMetaDescription !== undefined) {
      corrections.push(correction)
    }
  }

  if (contradictions.length > 0 && process.env.NODE_ENV !== 'production') {
    console.warn('[seo-strategy] on-page contradiction checker corrected the following:', contradictions)
  }

  return { corrections, contradictions }
}

// ─────────────────────────────────────────────────────────────────────────
// Phase 2B — narrative sanity checks for the AI's onPageAudit prose
// (imageOptimization/internalLinking/schemaMarkup/openGraph findings)
// against the deterministic content/image/internal-link/technical summary.
// Same posture as P0's narrative checks above: logged for debugging, not
// auto-rewritten — safely correcting free-form prose isn't possible without
// another generation pass.
// ─────────────────────────────────────────────────────────────────────────
export interface Phase2BNarrativeLike {
  onPageAudit: {
    schemaMarkup: { finding: string }
    openGraph: { finding: string }
    imageOptimization: { finding: string }
    internalLinking: { finding: string }
  }
}

export function runPhase2BContradictionChecks(strategy: Phase2BNarrativeLike, onPageSummary: OnPageSummary): string[] {
  const contradictions: string[] = []
  const { onPageAudit } = strategy

  if (onPageSummary.imageIssues.missingAlt > 0 && /no images? (are |is )?missing alt|all images have alt/i.test(onPageAudit.imageOptimization.finding)) {
    contradictions.push(
      `onPageAudit.imageOptimization.finding claims no images are missing alt text, but ${onPageSummary.imageIssues.missingAlt} image(s) sitewide are missing or have an empty alt attribute.`,
    )
  }
  if (
    onPageSummary.internalLinkIssues.brokenLinks > 0 &&
    /no broken (internal )?links|internal links? (are|is) (all )?(working|fine|healthy)/i.test(onPageAudit.internalLinking.finding)
  ) {
    contradictions.push(
      `onPageAudit.internalLinking.finding claims no broken links, but ${onPageSummary.internalLinkIssues.brokenLinks} broken internal link(s) were found.`,
    )
  }
  if (onPageSummary.internalLinkIssues.orphanPages > 0 && /no orphan(ed)? pages/i.test(onPageAudit.internalLinking.finding)) {
    contradictions.push(
      `onPageAudit.internalLinking.finding claims no orphan pages, but ${onPageSummary.internalLinkIssues.orphanPages} orphan-candidate page(s) were found.`,
    )
  }
  if (onPageSummary.technicalIssues.openGraph === 0 && /missing (open graph|og )/i.test(onPageAudit.openGraph.finding)) {
    contradictions.push(
      'onPageAudit.openGraph.finding claims missing Open Graph tags, but the deterministic audit found no Open Graph issues across crawled pages.',
    )
  }
  if (onPageSummary.technicalIssues.schema === 0 && /no (structured data|schema)|lacks schema/i.test(onPageAudit.schemaMarkup.finding)) {
    contradictions.push(
      'onPageAudit.schemaMarkup.finding claims missing schema, but the deterministic audit found no schema opportunities/issues across crawled pages.',
    )
  }

  if (contradictions.length > 0 && process.env.NODE_ENV !== 'production') {
    console.warn('[seo-strategy] Phase 2B narrative contradiction checker found the following:', contradictions)
  }
  return contradictions
}

// ─────────────────────────────────────────────────────────────────────────
// Phase 4 — SERP pixel measurement internal-consistency check. The
// current/suggested pixelWidth/pixelStatus fields are always computed
// together, from the same source string, by lib/seo-strategy/serp-pixel.ts
// (see attachOnPageSuggestions()/evaluateMetaTitle()/evaluateMetaDescription()),
// so a real contradiction here would mean a regression in that wiring, not
// a live AI mismatch — this is a defense-in-depth assertion, logged in
// development, never auto-corrected (there's no independent "wrong" value
// to correct it to).
// ─────────────────────────────────────────────────────────────────────────
export function runSerpPixelContradictionChecks(onPageAudits: PageOnPageAudit[]): string[] {
  const contradictions: string[] = []

  const checkPixelPair = (label: string, pixelWidth: number | null, status: string): void => {
    if (pixelWidth === null && status !== 'not_available') {
      contradictions.push(`${label}: pixelWidth is null but pixelStatus is "${status}" (expected "not_available").`)
    }
    if (pixelWidth !== null && status === 'not_available') {
      contradictions.push(`${label}: pixelWidth is ${pixelWidth}px but pixelStatus is "not_available".`)
    }
  }

  for (const a of onPageAudits) {
    checkPixelPair(`Page ${a.url}: metaTitle`, a.metaTitle.pixelWidth, a.metaTitle.pixelStatus)
    checkPixelPair(`Page ${a.url}: metaDescription`, a.metaDescription.pixelWidth, a.metaDescription.pixelStatus)
    if (a.metaTitle.suggestedValue !== null) {
      checkPixelPair(`Page ${a.url}: metaTitle.suggestedValue`, a.metaTitle.suggestedPixelWidth, a.metaTitle.suggestedPixelStatus ?? 'not_available')
    }
    if (a.metaDescription.suggestedValue !== null) {
      checkPixelPair(
        `Page ${a.url}: metaDescription.suggestedValue`,
        a.metaDescription.suggestedPixelWidth,
        a.metaDescription.suggestedPixelStatus ?? 'not_available',
      )
    }
  }

  if (contradictions.length > 0 && process.env.NODE_ENV !== 'production') {
    console.warn('[seo-strategy] SERP pixel contradiction checker found the following:', contradictions)
  }
  return contradictions
}

// ─────────────────────────────────────────────────────────────────────────
// Phase 5 — crawl coverage. The AI's technicalSeoAudit.summary must never
// claim complete/full-site coverage when the deterministic crawl actually
// skipped discovered URLs (bounded crawl limits — see analyze/route.ts).
// Unlike the purely-logged narrative checks above, this one IS corrected —
// the claim is specific and mechanical enough (a fixed phrase pattern) to
// safely rewrite without another AI generation pass, and "do not allow
// this contradiction into the final report" is an explicit Phase 5
// requirement, not just a diagnostic.
// ─────────────────────────────────────────────────────────────────────────
// Deliberately not global: only the first match is replaced (the phrase is
// vanishingly unlikely to appear twice), and a non-global regex avoids the
// classic `lastIndex` statefulness bug across repeated calls on this
// module-level constant.
const FULL_COVERAGE_CLAIM_RE = /entire site|full site (audit|crawl)|every page (was|has been) (crawled|audited)|all pages (were|have been) (crawled|audited)|whole website was (crawled|audited)/i

export interface CrawlCoverageNarrativeLike {
  technicalSeoAudit: { summary: string }
}

export interface CrawlCoverageCheckResult {
  /** The summary to actually use — identical to the input unless a contradiction was found and corrected. */
  correctedSummary: string
  contradictions: string[]
}

export function runCrawlCoverageContradictionChecks(strategy: CrawlCoverageNarrativeLike, analysis: SiteAnalysis | null): CrawlCoverageCheckResult {
  const contradictions: string[] = []
  let correctedSummary = strategy.technicalSeoAudit.summary

  if (analysis && analysis.crawlStats.excluded > 0 && FULL_COVERAGE_CLAIM_RE.test(correctedSummary)) {
    contradictions.push(
      `technicalSeoAudit.summary claims the entire site/full site was crawled, but ${analysis.crawlStats.excluded} discovered URL(s) were not attempted (crawl mode: ${analysis.crawlMode}) — corrected to reflect a partial crawl.`,
    )
    correctedSummary = `${correctedSummary.replace(FULL_COVERAGE_CLAIM_RE, 'a partial crawl of the site')} (Note: ${analysis.crawlStats.excluded} discovered URL(s) were not attempted within this ${analysis.crawlMode === 'full' ? 'full' : 'quick'} crawl's safe limits.)`
  }

  if (contradictions.length > 0 && process.env.NODE_ENV !== 'production') {
    console.warn('[seo-strategy] Crawl coverage contradiction checker found the following:', contradictions)
  }
  return { correctedSummary, contradictions }
}

// ─────────────────────────────────────────────────────────────────────────
// Phase 6 — competitor intelligence. The AI's free-text competitorAnalysis
// entries are entirely REPLACED with deterministic, evidence-based content
// before the report is returned (see route.ts / competitor-intelligence.ts)
// — a real contradiction can't reach the final report by construction. This
// check exists as a diagnostic/defense-in-depth pass, logged in
// development, so a future change to that override logic doesn't silently
// let one through unnoticed.
// ─────────────────────────────────────────────────────────────────────────
const UNSUPPORTED_CLAIM_RE =
  /\b(backlinks?|domain authority|\bDR\b|higher rank(?:ing|ed)?|better rank(?:ing|ed)?|stronger (?:authority|social|reputation)|wider (?:national|regional) reach|social presence|better reputation)\b/i
const CLAIMS_BLOG_RE = /\bhas a blog\b|\bblog (?:section|content)\b/i
const CLAIMS_NO_SERVICE_PAGE_RE = /\bno (?:dedicated )?service page\b|\blacks? (?:a |any )?service page\b/i

export interface CompetitorAnalysisEntryLike {
  url: string
  strengths: string[]
  weaknesses: string[]
  opportunitiesToOutrank: string[]
  contentGaps: string[]
}

/** Matches an AI competitorAnalysis entry to its crawled profile by domain — falls back to a loose URL substring match since the AI's `url` field is free text, not guaranteed to be an exact echo of the user's input. */
export function findProfileForEntry<T extends { inputUrl: string; domain: string | null }>(entry: CompetitorAnalysisEntryLike, profiles: T[]): T | undefined {
  return profiles.find((p) => {
    if (p.domain && entry.url.toLowerCase().includes(p.domain.toLowerCase())) return true
    return entry.url.trim() !== '' && p.inputUrl.toLowerCase().includes(entry.url.toLowerCase().replace(/^https?:\/\//, '').split('/')[0])
  })
}

export function runCompetitorContradictionChecks<T extends { inputUrl: string; domain: string | null; status: 'evaluated' | 'not_evaluated'; blogPages: number; servicePages: number }>(
  competitorAnalysis: CompetitorAnalysisEntryLike[],
  profiles: T[],
): string[] {
  const contradictions: string[] = []

  for (const entry of competitorAnalysis) {
    const allText = [...entry.strengths, ...entry.weaknesses, ...entry.opportunitiesToOutrank, ...entry.contentGaps]
    for (const line of allText) {
      if (UNSUPPORTED_CLAIM_RE.test(line)) {
        contradictions.push(`competitorAnalysis (${entry.url}) makes an unsupported claim with no verified data source: "${line}"`)
      }
    }

    const profile = findProfileForEntry(entry, profiles)
    if (!profile) continue

    if (profile.status === 'not_evaluated' && allText.length > 0) {
      contradictions.push(`competitorAnalysis (${entry.url}) presents findings as verified, but the competitor crawl could not be evaluated for this URL.`)
    }
    if (profile.status === 'evaluated') {
      if (profile.blogPages === 0 && allText.some((l) => CLAIMS_BLOG_RE.test(l))) {
        contradictions.push(`competitorAnalysis (${entry.url}) claims a blog was found, but the crawl detected 0 blog pages.`)
      }
      if (profile.servicePages > 0 && allText.some((l) => CLAIMS_NO_SERVICE_PAGE_RE.test(l))) {
        contradictions.push(`competitorAnalysis (${entry.url}) claims no service page exists, but the crawl found ${profile.servicePages}.`)
      }
    }
  }

  if (contradictions.length > 0 && process.env.NODE_ENV !== 'production') {
    console.warn('[seo-strategy] Competitor contradiction checker found the following:', contradictions)
  }
  return contradictions
}

// ─────────────────────────────────────────────────────────────────────────
// Phase 7 — content-gap / pages-to-create strategy. Catches the AI's
// pagesToCreate/blogIdeas recommending a brand-new page for a keyword that
// already has a strong existing landing page (P0's own keyword-page
// mapping says so), the same target keyword claimed by more than one
// recommendation, and unsupported keyword-metric claims (search volume,
// CPC, difficulty, traffic/ranking probability) with no verified data
// source. Diagnostic/defense-in-depth, logged in development — the
// deterministic pageOpportunities list (page-opportunity.ts) is the
// report's actual source of truth for these, not this free-text AI content.
// ─────────────────────────────────────────────────────────────────────────
const UNSUPPORTED_METRIC_RE = /\b(search volume|monthly volume|\bCPC\b|cost[- ]per[- ]click|keyword difficulty|traffic potential|ranking probability|likely to rank)\b/i

export interface PageRecommendationLike {
  targetKeyword: string
  purpose?: string
  contentBrief: string
}

const STRONG_MATCH_SCORE = 70

export function runPageOpportunityContradictionChecks(
  pagesToCreate: PageRecommendationLike[],
  blogIdeas: PageRecommendationLike[],
  keywordMappings: KeywordPageMapping[],
): string[] {
  const contradictions: string[] = []
  const mappingByKeyword = new Map(keywordMappings.map((m) => [normalizeKeyword(m.keyword), m]))

  const seenKeywords = new Map<string, string>() // normalized keyword -> first source it was seen in
  for (const [sourceLabel, items] of [
    ['pagesToCreate', pagesToCreate],
    ['blogIdeas', blogIdeas],
  ] as const) {
    for (const item of items) {
      const normalized = normalizeKeyword(item.targetKeyword)
      const mapping = mappingByKeyword.get(normalized)
      if (mapping && mapping.status === 'mapped' && (mapping.relevanceScore >= STRONG_MATCH_SCORE || mapping.confidence === 'high') && sourceLabel === 'pagesToCreate') {
        contradictions.push(
          `${sourceLabel} recommends a new page for "${item.targetKeyword}", but a strong existing page (${mapping.mappedUrl}, relevance ${mapping.relevanceScore}/100) already targets it — should be "improve existing" instead.`,
        )
      }

      const text = `${item.purpose ?? ''} ${item.contentBrief}`
      if (UNSUPPORTED_METRIC_RE.test(text)) {
        contradictions.push(`${sourceLabel} ("${item.targetKeyword}") makes an unsupported keyword-metric claim with no verified data source: "${text.trim()}"`)
      }

      const existingSource = seenKeywords.get(normalized)
      if (existingSource) {
        contradictions.push(`Keyword "${item.targetKeyword}" is targeted by more than one recommendation (${existingSource} and ${sourceLabel}) — duplicate/cannibalizing targeting.`)
      } else {
        seenKeywords.set(normalized, sourceLabel)
      }
    }
  }

  if (contradictions.length > 0 && process.env.NODE_ENV !== 'production') {
    console.warn('[seo-strategy] Page opportunity contradiction checker found the following:', contradictions)
  }
  return contradictions
}

// ─────────────────────────────────────────────────────────────────────────
// Phase 8 — Local SEO. "Local Business ON but report says non-local" is
// already covered by check #1 in runContradictionChecks() above (the same
// localSeo.applicable force-correction serves both phases). This adds:
// - correcting the AI's napConsistency.issues when it claims NAP is
//   consistent while the deterministic crawl-based audit found real
//   conflicts (an actual correction, like the crawl-coverage summary —
//   the exact conflicting URLs are known, so this is safe to rewrite).
// - flagging (logged only — free-form prose can't be safely rewritten)
//   any GBP/review/citation claim that reads as a specific, MEASURED
//   number rather than a generic strategy recommendation, since neither
//   is ever verified without an external API connection.
// ─────────────────────────────────────────────────────────────────────────
const MEASURED_LOCAL_CLAIM_RE =
  /\b\d+(\.\d+)?\s*(reviews?|stars?|ratings?)\b|\byour (gbp|google business profile) (has|currently has|shows)\b|\bfully (optimized|verified|complete)\b|\b100%\s*complete\b|currently ranks?\b/i

export interface NapConsistencyLike {
  issues: string[]
  recommendations: string[]
  websiteNap: { name: string | null; addresses: string[]; phones: string[] }
}

export interface LocalSeoNarrativeLike {
  napConsistency: NapConsistencyLike
  googleBusinessProfileTips: string[]
  reviewStrategy: string
}

export interface LocalNapAuditLike {
  status: 'consistent' | 'conflicting' | 'not_evaluated'
  conflicts: { url: string; issue: string }[]
}

export interface LocalSeoCheckResult {
  correctedNapConsistency: NapConsistencyLike
  contradictions: string[]
}

export function runLocalSeoContradictionChecks(strategy: LocalSeoNarrativeLike, napAudit: LocalNapAuditLike): LocalSeoCheckResult {
  const contradictions: string[] = []
  let correctedNapConsistency = strategy.napConsistency

  if (napAudit.status === 'conflicting' && strategy.napConsistency.issues.length === 0) {
    contradictions.push(
      `localSeo.napConsistency reported no issues, but the deterministic crawl found ${napAudit.conflicts.length} conflicting NAP value(s) — corrected with the exact affected URLs.`,
    )
    correctedNapConsistency = {
      ...strategy.napConsistency,
      issues: [...strategy.napConsistency.issues, ...napAudit.conflicts.map((c) => `${c.url}: ${c.issue}`)],
      recommendations: [...strategy.napConsistency.recommendations, 'Make the business name, address, and phone number identical on every page.'],
    }
  }

  const allText = [...strategy.googleBusinessProfileTips, strategy.reviewStrategy]
  for (const line of allText) {
    if (MEASURED_LOCAL_CLAIM_RE.test(line)) {
      contradictions.push(`Local SEO narrative presents a specific GBP/review metric as measured with no verified data source: "${line}"`)
    }
  }

  if (contradictions.length > 0 && process.env.NODE_ENV !== 'production') {
    console.warn('[seo-strategy] Local SEO contradiction checker found the following:', contradictions)
  }
  return { correctedNapConsistency, contradictions }
}

// ─────────────────────────────────────────────────────────────────────────
// Phase 9 — Off-page SEO. Every opportunity/priority/citation/risk/metric
// in offPageIntelligence is computed deterministically (off-page-
// intelligence.ts) — a real contradiction can't reach it by construction.
// This is diagnostic/defense-in-depth: it scans the AI's remaining free-text
// offPageStrategy.summary for the exact violations Phase 9 exists to
// remove (fabricated link/backlink counts, DA/DR claims, unverified
// competitor backlink comparisons, guaranteed link quotas), and re-checks
// the deterministic structure itself in case a future change to
// off-page-intelligence.ts regresses one of its own invariants.
// ─────────────────────────────────────────────────────────────────────────
const OFF_PAGE_UNSUPPORTED_METRIC_RE =
  /\b\d+[+]?\s*(backlinks?|referring domains?|links?)\b|\bdomain (authority|rating)\b|\bDA\s*\d|\bDR\s*\d+|\bspam score\b/i
const OFF_PAGE_COMPETITOR_BACKLINK_RE =
  /\bcompetitor[’']?s?\b(?=[^.]*\b(?:backlinks?|link profile)\b)(?=[^.]*\b(?:stronger|better|more|higher|weaker)\b)/i
const OFF_PAGE_FIXED_QUOTA_RE = /\bbuild\s+\d+\s+backlinks?\b|\b\d+\s+(backlinks?|links?)\s*(\/|per)\s*month\b|\bguarantee(?:d|s)?\s+\d+\s+links?\b/i

export interface OffPageStrategyLike {
  summary: string
}

export function runOffPageContradictionChecks(
  strategy: OffPageStrategyLike,
  intelligence: { localStrategyApplicable: boolean; opportunities: { relevance: 'high' | 'medium' | 'low'; priority: 'high' | 'medium' | 'low' | 'avoid' }[] },
  isLocalBusiness: boolean,
): string[] {
  const contradictions: string[] = []
  const summary = strategy.summary

  if (OFF_PAGE_UNSUPPORTED_METRIC_RE.test(summary)) {
    contradictions.push(`offPageStrategy.summary presents a backlink/DA/DR/spam-score figure with no verified data source: "${summary}"`)
  }
  if (OFF_PAGE_COMPETITOR_BACKLINK_RE.test(summary)) {
    contradictions.push(`offPageStrategy.summary claims a competitor backlink advantage with no verified backlink data source: "${summary}"`)
  }
  if (OFF_PAGE_FIXED_QUOTA_RE.test(summary)) {
    contradictions.push(`offPageStrategy.summary presents a fixed/guaranteed link quota rather than an activity-based goal: "${summary}"`)
  }

  if (intelligence.localStrategyApplicable !== isLocalBusiness) {
    contradictions.push(
      `offPageIntelligence.localStrategyApplicable (${intelligence.localStrategyApplicable}) does not match the deterministic local-business status (${isLocalBusiness}).`,
    )
  }
  for (const o of intelligence.opportunities) {
    if (o.priority === 'high' && o.relevance === 'low') {
      contradictions.push('An off-page opportunity with low relevance was assigned High priority — irrelevant opportunities must never rank High.')
    }
  }

  if (contradictions.length > 0 && process.env.NODE_ENV !== 'production') {
    console.warn('[seo-strategy] Off-page contradiction checker found the following:', contradictions)
  }
  return contradictions
}

// ─────────────────────────────────────────────────────────────────────────
// Phase 10 — KPI & measurement. Every kpiMeasurement entry is computed
// deterministically (kpi-measurement.ts) — a real contradiction in that
// catalog can't reach the report by construction. This is
// diagnostic/defense-in-depth: it (a) re-validates the deterministic
// catalog's own invariants in case a future change regresses one, and (b)
// scans the AI's remaining free-text narrative (criticalIssues, quickWins,
// conclusion) for the exact fabricated-metric patterns Phase 10 exists to
// remove, since the AI no longer has a structured kpiTargets field to put
// them in but could still slip one into prose.
// ─────────────────────────────────────────────────────────────────────────
const FABRICATED_METRIC_SOURCE =
  '\\b\\d[\\d,]*\\+?\\s*(organic )?(visits?|sessions?|clicks?|impressions?|backlinks?|referring domains?|ranking keywords?)\\b|\\b\\d+(\\.\\d+)?%\\s*(conversion|bounce|engagement|ctr|click[- ]through)\\b|\\bDA\\s*\\d+|\\bDR\\s*\\d+|\\bdomain (authority|rating)\\s*(of\\s*)?\\d+|\\baverage position (of )?\\d+(\\.\\d+)?\\b'
const FABRICATED_METRIC_RE = new RegExp(FABRICATED_METRIC_SOURCE, 'i')
const REDACTION = '[not currently measurable without a connected data source]'

/** Replaces every fabricated-figure match in `text` with a neutral placeholder — a fresh global RegExp per call, never a shared stateful one. */
function redactFabricatedMetrics(text: string): string {
  return text.replace(new RegExp(FABRICATED_METRIC_SOURCE, 'gi'), REDACTION)
}

export interface KpiMeasurementLike {
  metric: string
  category: string
  value: number | null
  status: 'measured' | 'user_provided' | 'estimated' | 'not_available'
  source: 'crawled' | 'user_provided' | 'verified_api' | 'calculated_from_verified_data' | 'ai_estimated' | 'not_available'
  requiredIntegration: 'google_search_console' | 'google_analytics' | 'backlink_provider' | null
}

export interface KpiCriticalIssueLike {
  title: string
  description: string
  howToFix: string
}

export interface KpiQuickWinLike {
  title: string
  description: string
  expectedImpact: string
}

export interface KpiNarrativeLike<C extends KpiCriticalIssueLike = KpiCriticalIssueLike, Q extends KpiQuickWinLike = KpiQuickWinLike> {
  criticalIssues: C[]
  quickWins: Q[]
  conclusion: string
}

export interface KpiCheckResult<C extends KpiCriticalIssueLike = KpiCriticalIssueLike, Q extends KpiQuickWinLike = KpiQuickWinLike> {
  correctedCriticalIssues: C[]
  correctedQuickWins: Q[]
  correctedConclusion: string
  contradictions: string[]
}

/**
 * Unlike the purely diagnostic checks elsewhere in this file, a fabricated
 * metric here is actually rewritten before the report is returned — see
 * Codex's P1 finding on the original Phase 10 PR: logging alone left the
 * fabricated figure in the report the client renders. `correctedStrategy`
 * in route.ts must use `correctedCriticalIssues`/`correctedQuickWins`/
 * `correctedConclusion`, not the AI's raw fields. Generic over the
 * caller's actual item shape so fields beyond title/description/
 * howToFix|expectedImpact (e.g. the AI schema's `impact`/`estimatedEffort`)
 * survive the correction untouched.
 */
export function runKpiContradictionChecks<C extends KpiCriticalIssueLike, Q extends KpiQuickWinLike>(strategy: KpiNarrativeLike<C, Q>, kpis: KpiMeasurementLike[]): KpiCheckResult<C, Q> {
  const contradictions: string[] = []

  for (const kpi of kpis) {
    if (kpi.value !== null && (kpi.status === 'not_available' || kpi.source === 'not_available')) {
      contradictions.push(`KPI "${kpi.metric}" has a numeric value but is marked not_available — a real value must never be paired with an unavailable/not_available status or source.`)
    }
    if (kpi.value === null && kpi.status !== 'not_available') {
      contradictions.push(`KPI "${kpi.metric}" has no value but is marked "${kpi.status}" — a null value must always carry status "not_available", never presented as measured/estimated.`)
    }
    if (kpi.status === 'measured' && kpi.source !== 'crawled' && kpi.source !== 'verified_api' && kpi.source !== 'calculated_from_verified_data') {
      contradictions.push(`KPI "${kpi.metric}" is marked "measured" but its source ("${kpi.source}") is not a verified source — an estimated or unavailable metric must never be labeled Measured.`)
    }
    if (kpi.status === 'not_available' && !kpi.requiredIntegration && kpi.category !== 'technical') {
      contradictions.push(`KPI "${kpi.metric}" is not_available but names no requiredIntegration — the report must say what data source would make it available.`)
    }
    if (/\b(domain authority|domain rating|\bDA\b|\bDR\b)\b/i.test(kpi.metric)) {
      contradictions.push(`KPI "${kpi.metric}" — DA/DR is a third-party metric with no connected provider and must not appear in the KPI catalog at all, even as not_available.`)
    }
  }

  const correctedCriticalIssues = strategy.criticalIssues.map((c) => {
    const combined = `${c.title}. ${c.description} ${c.howToFix}`
    if (!FABRICATED_METRIC_RE.test(combined)) return c
    contradictions.push(`criticalIssues ("${c.title}") stated a specific traffic/ranking/conversion/backlink/DA-DR figure with no verified data source — redacted: "${combined}"`)
    return { ...c, description: redactFabricatedMetrics(c.description), howToFix: redactFabricatedMetrics(c.howToFix) }
  })

  const correctedQuickWins = strategy.quickWins.map((q) => {
    const combined = `${q.title}. ${q.description} ${q.expectedImpact}`
    if (!FABRICATED_METRIC_RE.test(combined)) return q
    contradictions.push(`quickWins ("${q.title}") stated a specific traffic/ranking/conversion/backlink/DA-DR figure with no verified data source — redacted: "${combined}"`)
    return { ...q, description: redactFabricatedMetrics(q.description), expectedImpact: redactFabricatedMetrics(q.expectedImpact) }
  })

  let correctedConclusion = strategy.conclusion
  if (FABRICATED_METRIC_RE.test(strategy.conclusion)) {
    contradictions.push(`conclusion stated a specific traffic/ranking/conversion/backlink/DA-DR figure with no verified data source — redacted: "${strategy.conclusion}"`)
    correctedConclusion = redactFabricatedMetrics(strategy.conclusion)
  }

  if (contradictions.length > 0 && process.env.NODE_ENV !== 'production') {
    console.warn('[seo-strategy] KPI contradiction checker found the following:', contradictions)
  }
  return { correctedCriticalIssues, correctedQuickWins, correctedConclusion, contradictions }
}

// ─────────────────────────────────────────────────────────────────────────
// Phase 11 — Evidence + Confidence system. Every phase's recommendation
// modules (page-opportunity.ts, competitor-intelligence.ts,
// local-seo-intelligence.ts, off-page-intelligence.ts, and now
// on-page-overview.ts's PriorityFix) already carry a `reason`/`evidence`/
// `confidence`/`priority`-shaped record — this doesn't replace any of
// them, it's a single validation pass over a common `Finding` view of all
// of them (see lib/seo-strategy/evidence.ts), so the same invariants are
// enforced everywhere instead of once per module. Diagnostic/defense-in-
// depth: every producer already satisfies these rules by construction, so
// a real violation here means a future change to one of those modules
// regressed an invariant.
// ─────────────────────────────────────────────────────────────────────────
export function runEvidenceContradictionChecks(findings: Finding[], validUrls: Set<string>): string[] {
  const contradictions: string[] = []

  for (const f of findings) {
    const hasEvidence = !!f.evidence && f.evidence.trim().length > 0

    if (f.confidence === 'high' && !hasEvidence) {
      contradictions.push(`Finding "${f.issue}" is marked High confidence but has no evidence — High confidence must always be backed by real evidence.`)
    }
    if (f.source === 'ai_inferred' && f.confidence === 'high') {
      contradictions.push(`Finding "${f.issue}" is sourced ai_inferred but marked High confidence — an AI-assisted interpretation must never be presented as a verified, High-confidence claim.`)
    }
    if (f.source === 'competitor_crawl' && !hasEvidence) {
      contradictions.push(`Finding "${f.issue}" claims competitor evidence (source: competitor_crawl) but has no evidence text — a competitor claim requires verifiable evidence.`)
    }
    if (f.source === 'not_available' && f.confidence !== 'not_evaluated') {
      contradictions.push(`Finding "${f.issue}" is sourced not_available but marked "${f.confidence}" confidence — unavailable data must never be used as factual evidence.`)
    }
    if (f.affectedUrl && !validUrls.has(f.affectedUrl)) {
      contradictions.push(`Finding "${f.issue}" references URL "${f.affectedUrl}", which was never crawled/discovered — a recommendation must not point at a nonexistent URL.`)
    }
  }

  if (contradictions.length > 0 && process.env.NODE_ENV !== 'production') {
    console.warn('[seo-strategy] Evidence contradiction checker found the following:', contradictions)
  }
  return contradictions
}

// ─────────────────────────────────────────────────────────────────────────
// Phase 12 — 2-month roadmap. buildTwoMonthRoadmap (roadmap.ts) only ever
// projects already-validated findings into tasks, so a real contradiction
// can't reach it by construction — this is diagnostic/defense-in-depth,
// re-checking the same invariants Phase 10's KPI rule and Phase 11's
// evidence rule already established, against the roadmap's own task list.
// ─────────────────────────────────────────────────────────────────────────
const ROADMAP_UNSUPPORTED_TARGET_RE =
  /\b\d[\d,]*\+?\s*%?\s*(traffic|visits?|sessions?|clicks?|backlinks?|referring domains?)\b|top\s*\d+\s*rank|\bDA\s*\d+|\bDR\s*\d+|\bdomain (authority|rating)\s*\d+/i

export interface RoadmapTaskLike {
  task: string
  url: string | null
  category: string
  confidence: 'high' | 'medium' | 'low' | 'not_evaluated'
  completionCheck: string
  needsReview: boolean
}

export interface RoadmapWeekLike {
  week: number
  tasks: RoadmapTaskLike[]
}

export interface RoadmapMonthLike {
  month: 1 | 2
  weeks: RoadmapWeekLike[]
}

export interface TwoMonthRoadmapLike {
  months: RoadmapMonthLike[]
}

export function runRoadmapContradictionChecks(roadmap: TwoMonthRoadmapLike, crawledUrls: Set<string>, newPageUrls: Set<string>): string[] {
  const contradictions: string[] = []

  if (roadmap.months.length !== 2) {
    contradictions.push(`Roadmap has ${roadmap.months.length} month(s) — the 2-month roadmap must always have exactly 2.`)
  }
  const totalWeeks = roadmap.months.flatMap((m) => m.weeks).length
  if (totalWeeks > 8) {
    contradictions.push(`Roadmap has ${totalWeeks} weekly stage(s) — the 2-month roadmap must never exceed 8.`)
  }

  const seenTaskKeys = new Set<string>()
  for (const month of roadmap.months) {
    for (const week of month.weeks) {
      for (const t of week.tasks) {
        const key = `${t.category}::${t.url ?? ''}`
        if (seenTaskKeys.has(key)) {
          contradictions.push(`Duplicate roadmap task for category "${t.category}"${t.url ? ` on ${t.url}` : ''} appears more than once.`)
        }
        seenTaskKeys.add(key)

        if (t.category === 'Existing Page' || t.category.startsWith('Meta') || t.category === 'H1' || t.category === 'Content' || t.category === 'Images' || t.category === 'Internal Linking' || t.category === 'Heading Structure') {
          if (t.url && !crawledUrls.has(t.url)) {
            contradictions.push(`Roadmap task "${t.task}" references URL "${t.url}", which was never crawled/discovered.`)
          }
        }
        if (t.category === 'New Page' && t.url && crawledUrls.has(t.url)) {
          contradictions.push(`Roadmap task "${t.task}" proposes creating a new page at "${t.url}", but that URL already exists as a crawled page — conflicts with an existing target page.`)
        }
        if (t.category === 'New Page' && t.url && !newPageUrls.has(t.url)) {
          contradictions.push(`Roadmap task "${t.task}" proposes a new page URL ("${t.url}") that doesn't match any validated page-opportunity suggestion.`)
        }
        if (ROADMAP_UNSUPPORTED_TARGET_RE.test(t.task) || ROADMAP_UNSUPPORTED_TARGET_RE.test(t.completionCheck)) {
          contradictions.push(`Roadmap task "${t.task}" states an unsupported numeric performance target (traffic/ranking/backlink/DA-DR) — completion checks must be task/audit-based only.`)
        }
        if (t.confidence === 'low' && !t.needsReview) {
          contradictions.push(`Roadmap task "${t.task}" is Low confidence but is not flagged needsReview — a Low-confidence finding must never be presented as a definite task.`)
        }
        if (t.confidence === 'low' && !/^review:/i.test(t.task)) {
          contradictions.push(`Roadmap task "${t.task}" is Low confidence but its text doesn't read as a review item — an AI-inferred/low-confidence finding must never be phrased as a definite instruction.`)
        }
      }
    }
  }

  if (contradictions.length > 0 && process.env.NODE_ENV !== 'production') {
    console.warn('[seo-strategy] Roadmap contradiction checker found the following:', contradictions)
  }
  return contradictions
}
