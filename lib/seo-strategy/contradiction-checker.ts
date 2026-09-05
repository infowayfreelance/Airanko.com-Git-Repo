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
import type { KeywordPageMapping, LocalDataSufficiency, Severity } from './types'
import { normalizeKeyword } from './keyword-mapping'

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
