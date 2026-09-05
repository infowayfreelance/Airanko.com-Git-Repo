// ──────────────────────────────────────────────────────────────────────────
// Shared types for the SEO Strategy Maker's deterministic accuracy layer
// (local business handling, keyword-to-page mapping, severity, KPI
// sourcing, contradiction validation). Kept separate from the AI-facing
// zod schema in app/api/seo-strategy/route.ts so this deterministic logic
// never depends on — or gets pulled around by — whatever shape the AI
// happens to return.
// ──────────────────────────────────────────────────────────────────────────
import type { HeadingNode } from '@/app/api/seo-strategy/analyze/route'
export type { HeadingNode }

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

// ──────────────────────────────────────────────────────────────────────────
// Phase 2A — Meta data + heading structure audit (on-page). All fields here
// are produced entirely by lib/seo-strategy/on-page-audit.ts from structured
// crawl data; the AI is never the source of truth for status, severity,
// counts, or duplicate detection — see that module's header comment.
// ──────────────────────────────────────────────────────────────────────────

export type OnPageStatus = 'good' | 'needs_improvement' | 'poor' | 'not_evaluated'

/** How much weight a page's on-page issues should carry — reuses the same "don't build a complex scoring engine" spirit as P0's severity work. */
export type PageImportance = 'high' | 'medium' | 'low'

export interface MetaTitleAudit {
  currentValue: string | null
  characterCount: number
  status: OnPageStatus
  severity: Severity
  issues: string[]
  isDuplicate: boolean
  duplicateWith: string[]
  targetKeywordPresent: boolean | null
  /** Only populated when status is not "good"/"pass" — see "don't suggest what's already good". */
  suggestedValue: string | null
}

export interface MetaDescriptionAudit {
  currentValue: string | null
  characterCount: number
  status: OnPageStatus
  severity: Severity
  issues: string[]
  isDuplicate: boolean
  duplicateWith: string[]
  targetKeywordPresent: boolean | null
  suggestedValue: string | null
}

export interface H1Audit {
  values: string[]
  count: number
  status: OnPageStatus
  severity: Severity
  issues: string[]
  isDuplicateAcrossPages: boolean
  duplicateWith: string[]
  targetKeywordPresent: boolean | null
  suggestedValue: string | null
}

export interface HeadingStructureAudit {
  totalH2: number
  totalH3: number
  hierarchy: HeadingNode[]
  status: OnPageStatus
  severity: Severity
  issues: string[]
}

export interface PageOnPageAudit {
  url: string
  pageName: string
  importance: PageImportance
  /** The keyword validated (P0 keyword-mapping) as targeting this exact page, or null if none maps here. Never invented for a page with no mapping. */
  targetKeyword: string | null
  metaTitle: MetaTitleAudit
  metaDescription: MetaDescriptionAudit
  h1: H1Audit
  headings: HeadingStructureAudit
}

export interface OnPageIssueCategorySummary {
  /** Number of pages with at least one issue in this category (not a raw issue count — matches `affectedPages.length`). */
  total: number
  critical: number
  high: number
  medium: number
  low: number
  affectedPages: string[]
}

export interface OnPageSummary {
  titleIssues: OnPageIssueCategorySummary
  metaDescriptionIssues: OnPageIssueCategorySummary
  h1Issues: OnPageIssueCategorySummary
  headingStructureIssues: OnPageIssueCategorySummary
}
