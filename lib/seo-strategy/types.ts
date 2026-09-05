// ──────────────────────────────────────────────────────────────────────────
// Shared types for the SEO Strategy Maker's deterministic accuracy layer
// (local business handling, keyword-to-page mapping, severity, KPI
// sourcing, contradiction validation). Kept separate from the AI-facing
// zod schema in app/api/seo-strategy/route.ts so this deterministic logic
// never depends on — or gets pulled around by — whatever shape the AI
// happens to return.
// ──────────────────────────────────────────────────────────────────────────

/** Centralized severity enum. AI-generated text must never set this directly. */
export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info' | 'pass' | 'not_evaluated'

export type ConfidenceLevel = 'high' | 'medium' | 'low'

/** Whether a KPI's baseline is real, merely suggested, or unavailable. */
export type KpiStatus = 'available' | 'not_available' | 'suggested'

/** Where a piece of data actually came from — never left implicit. */
export type SourceType = 'crawled' | 'user_provided' | 'verified_api' | 'ai_suggested' | 'not_available'

export type KeywordMappingStatus = 'mapped' | 'no_suitable_page'

export interface KeywordPageMapping {
  keyword: string
  mappedUrl: string | null
  relevanceScore: number
  confidence: ConfidenceLevel
  reason: string
  status: KeywordMappingStatus
  recommendation: string | null
}

export type LocalDataSufficiency = 'evaluated' | 'not_evaluated' | 'not_applicable'

export interface HealthScoreBreakdown {
  technical: number
  onPage: number
  content: number
  offPage: number
  /** null when local SEO couldn't be scored — never fabricated as 0. */
  local: number | null
  localStatus: LocalDataSufficiency
}

export interface KpiTarget {
  metric: string
  baseline: string
  month3Target: string
  month6Target: string
  month12Target: string
  status: KpiStatus
  source: string | null
  sourceType: SourceType
}
