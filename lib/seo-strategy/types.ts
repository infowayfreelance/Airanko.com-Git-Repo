// ──────────────────────────────────────────────────────────────────────────
// Shared types for the SEO Strategy Maker's deterministic accuracy layer
// (local business handling, keyword-to-page mapping, severity, KPI
// sourcing, contradiction validation). Kept separate from the AI-facing
// zod schema in app/api/seo-strategy/route.ts so this deterministic logic
// never depends on — or gets pulled around by — whatever shape the AI
// happens to return.
// ──────────────────────────────────────────────────────────────────────────
import type { HeadingNode } from '@/app/api/seo-strategy/analyze/route'
import type { SerpPixelStatus } from './serp-pixel-thresholds'
export type { HeadingNode }
export type { SerpPixelStatus }

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
  /** Phase 4 — approximate Google desktop SERP pixel width (Arial-metric based, deterministic). Null only when currentValue is missing/empty. */
  pixelWidth: number | null
  /** Phase 4 — SERP display-fit status, a signal SEPARATE from `status`/`severity` (semantic quality) — a title can be pixel-good but semantically poor, or vice versa. See lib/seo-strategy/serp-pixel.ts. */
  pixelStatus: SerpPixelStatus
  status: OnPageStatus
  severity: Severity
  issues: string[]
  isDuplicate: boolean
  duplicateWith: string[]
  targetKeywordPresent: boolean | null
  /** Only populated when status is not "good"/"pass" — see "don't suggest what's already good". */
  suggestedValue: string | null
  suggestedCharacterCount: number | null
  /** Phase 4 — measured from the same validated suggestedValue shown to the user; never independently generated, so it can't contradict what's displayed. */
  suggestedPixelWidth: number | null
  suggestedPixelStatus: SerpPixelStatus | null
}

export interface MetaDescriptionAudit {
  currentValue: string | null
  characterCount: number
  pixelWidth: number | null
  /** Phase 4 — approximate line count if laid out in the SERP (ceil(pixelWidth / lineWidthPx)) — an estimate of likely wrapping, not a guarantee. Null only when currentValue is missing/empty. */
  estimatedLines: number | null
  pixelStatus: SerpPixelStatus
  status: OnPageStatus
  severity: Severity
  issues: string[]
  isDuplicate: boolean
  duplicateWith: string[]
  targetKeywordPresent: boolean | null
  suggestedValue: string | null
  suggestedCharacterCount: number | null
  suggestedPixelWidth: number | null
  suggestedEstimatedLines: number | null
  suggestedPixelStatus: SerpPixelStatus | null
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

/** Phase 2A's per-page shape — what lib/seo-strategy/on-page-audit.ts's buildOnPageAudits() actually produces, before the Phase 2B fields below exist. */
export interface MetaHeadingPageAudit {
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

/** The full per-page audit — Phase 2A's meta/heading fields plus Phase 2B's content/images/internal-links/technical fields, assembled by lib/seo-strategy/page-audit.ts. This is the shape exposed on SeoStrategy.onPageAudits. */
export interface PageOnPageAudit extends MetaHeadingPageAudit {
  content: ContentAudit
  images: ImagesAudit
  internalLinks: InternalLinksAudit
  technicalOnPage: TechnicalOnPageAudit
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

// ──────────────────────────────────────────────────────────────────────────
// Phase 2B — content, images, internal linking, and technical on-page audit.
// Same rule as Phase 2A: every field here is produced by
// lib/seo-strategy/{content,image,internal-link,technical}-audit.ts from
// structured crawl data (PageAnalysis). The AI never decides HTTP status,
// file size, dimensions, alt presence, link counts, broken-link status,
// canonical existence, indexability, schema/OG/Twitter existence, URL
// syntax, or duplicate-content similarity — see each module's header.
// ──────────────────────────────────────────────────────────────────────────

/** How a page is used — drives page-aware word-count/thin-content expectations (a contact page and a service page shouldn't be held to the same bar). */
export type PageType = 'homepage' | 'service' | 'location' | 'contact' | 'legal' | 'blog' | 'utility'

export type SearchIntent = 'transactional' | 'commercial' | 'informational' | 'navigational' | 'local_transactional'

export type DuplicateStatus = 'unique' | 'exact_duplicate' | 'near_duplicate' | 'not_evaluated'

export interface SimilarPageMatch {
  url: string
  similarityScore: number
}

export interface KeywordRelevanceResult {
  score: number
  status: OnPageStatus
}

export interface SearchIntentResult {
  intent: SearchIntent
  /** Whether the page's content plausibly satisfies the intent (service explanation/CTA for transactional, depth for informational, etc.) — a deterministic heuristic, not a live AI judgement (see content-audit.ts). */
  match: boolean
  confidence: ConfidenceLevel
}

export interface ContentAudit {
  wordCount: number
  pageType: PageType
  thinContent: boolean
  duplicateStatus: DuplicateStatus
  similarPages: SimilarPageMatch[]
  /** null when the page has no validated P0 keyword mapping — never penalized for a keyword it was never assigned. */
  keywordRelevance: KeywordRelevanceResult | null
  searchIntent: SearchIntentResult | null
  status: OnPageStatus
  severity: Severity
  issues: string[]
}

export interface ImageIssueDetail {
  src: string
  filename: string
  alt: string | null
  width: number | null
  height: number | null
  fileSize: number | null
  format: string | null
  issues: string[]
}

export interface ImagesAudit {
  total: number
  missingAlt: number
  weakAlt: number
  oversized: number
  modernFormatCount: number
  legacyFormatCount: number
  issues: ImageIssueDetail[]
  status: OnPageStatus
  severity: Severity
}

export interface BrokenLinkRecord {
  source: string
  anchor: string
  target: string
  statusCode: number | null
}

export interface AnchorIssue {
  target: string
  anchor: string
  issue: string
}

export interface InternalLinksAudit {
  outgoing: number
  uniqueOutgoing: number
  incoming: number
  uniqueIncoming: number
  contextualOutgoing: number
  contextualIncoming: number
  orphan: boolean
  /** Only meaningful when `orphan` is true — null otherwise. Reflects whether the crawl had full site coverage (see SiteAnalysis.crawlCoverage). */
  orphanConfidence: ConfidenceLevel | null
  weaklyLinked: boolean
  brokenLinks: BrokenLinkRecord[]
  anchorIssues: AnchorIssue[]
  status: OnPageStatus
  severity: Severity
  issues: string[]
}

export interface CanonicalAudit {
  exists: boolean
  url: string | null
  isSelfReferencing: boolean | null
  multiple: boolean
  /** HTTP status of the canonical target, when it points to a different (crawled or checked) URL — null if not checked or self-referencing. */
  targetStatus: number | null
  status: OnPageStatus
  severity: Severity
  issues: string[]
}

export type IndexabilityResult = 'indexable' | 'non_indexable' | 'blocked' | 'not_evaluated'

export interface IndexabilityAudit {
  result: IndexabilityResult
  reasons: string[]
  status: OnPageStatus
  severity: Severity
}

export interface StatusCodeAudit {
  code: number
  category: '2xx' | '3xx' | '4xx' | '5xx' | 'other'
  status: OnPageStatus
  severity: Severity
  issues: string[]
}

export interface SchemaAudit {
  present: boolean
  types: string[]
  validJsonLd: boolean
  parseErrorCount: number
  duplicateTypes: string[]
  /** Schema types that would be relevant for this page's type but weren't found — a "missing opportunity", never an "error" (see technical-audit.ts). */
  missingOpportunities: string[]
  status: OnPageStatus
  severity: Severity
  issues: string[]
}

export interface OpenGraphAudit {
  present: Record<'og:title' | 'og:description' | 'og:url' | 'og:image' | 'og:type', boolean>
  status: OnPageStatus
  severity: Severity
  issues: string[]
}

export interface TwitterCardAudit {
  present: Record<'twitter:card' | 'twitter:title' | 'twitter:description' | 'twitter:image', boolean>
  /** Whether Open Graph tags could stand in for the missing Twitter tags (a valid fallback per Twitter/X's own card spec). */
  ogFallbackAvailable: boolean
  status: OnPageStatus
  severity: Severity
  issues: string[]
}

export interface UrlStructureAudit {
  url: string
  status: OnPageStatus
  severity: Severity
  issues: string[]
}

export interface TechnicalOnPageAudit {
  canonical: CanonicalAudit
  indexability: IndexabilityAudit
  statusCode: StatusCodeAudit
  schema: SchemaAudit
  openGraph: OpenGraphAudit
  twitter: TwitterCardAudit
  urlStructure: UrlStructureAudit
  status: OnPageStatus
  severity: Severity
}

export interface ContentIssueSummary extends OnPageIssueCategorySummary {
  thinPages: number
  duplicatePages: number
  intentMismatchPages: number
}

export interface ImageIssueSummary extends OnPageIssueCategorySummary {
  missingAlt: number
  weakAlt: number
  oversized: number
}

export interface InternalLinkIssueSummary extends OnPageIssueCategorySummary {
  orphanPages: number
  weakPages: number
  brokenLinks: number
}

export interface TechnicalIssueSummary extends OnPageIssueCategorySummary {
  canonical: number
  indexability: number
  statusCodes: number
  schema: number
  openGraph: number
  twitter: number
  urlStructure: number
}

/** What lib/seo-strategy/on-page-audit.ts's aggregateOnPageIssues() (Phase 2A) actually produces. */
export interface MetaHeadingSummary {
  titleIssues: OnPageIssueCategorySummary
  metaDescriptionIssues: OnPageIssueCategorySummary
  h1Issues: OnPageIssueCategorySummary
  headingStructureIssues: OnPageIssueCategorySummary
}

/** The full site-wide summary — Phase 2A's categories plus Phase 2B's, assembled by lib/seo-strategy/page-audit.ts. This is the shape exposed on SeoStrategy.onPageSummary. */
export interface OnPageSummary extends MetaHeadingSummary {
  contentIssues: ContentIssueSummary
  imageIssues: ImageIssueSummary
  internalLinkIssues: InternalLinkIssueSummary
  technicalIssues: TechnicalIssueSummary
}
