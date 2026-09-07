// ──────────────────────────────────────────────────────────────────────────
// Phase 8 — deterministic Local SEO intelligence. Runs ONLY when the user's
// own "Local Business" toggle is on (isLocalBusiness — never re-derived or
// overridden here); reuses P0's NAP/contact-info crawl data, Phase 2B's
// content-similarity/thin-content audit, Phase 6's competitor location
// gaps, and Phase 7's keyword→page-opportunity engine rather than
// reinventing any of them. Nothing here is AI-generated — see each
// section's own note for what's genuinely new vs reused.
// ──────────────────────────────────────────────────────────────────────────
import type { PageAnalysis, SiteAnalysis } from '@/app/api/seo-strategy/analyze/route'
import type { GapItem } from './competitor-intelligence'
import { buildPageOpportunities, type PageOpportunity } from './page-opportunity'
import type { ConfidenceLevel, KeywordPageMapping, LocalDataSufficiency, PageOnPageAudit } from './types'

export type DataSourceLabel = 'user_provided' | 'crawled' | 'competitor_crawl' | 'verified_api' | 'ai_inferred' | 'not_available'
export type LocalSchemaStatus = 'valid' | 'incomplete' | 'invalid' | 'missing_opportunity' | 'not_evaluated'
export type LocationCoverageStatus = 'covered' | 'partial' | 'opportunity' | 'not_relevant'
export type LocalKeywordAction = 'keep_existing' | 'improve_existing' | 'create_dedicated_page' | 'potential_cannibalization' | 'not_enough_evidence'
export type LocalOpportunityPriority = 'high' | 'medium' | 'low'

export interface NapConflict {
  url: string
  issue: string
}

export interface NapAudit {
  status: 'consistent' | 'conflicting' | 'not_evaluated'
  businessName: string | null
  businessNameSource: DataSourceLabel
  phones: string[]
  addresses: string[]
  contactSource: DataSourceLabel
  conflicts: NapConflict[]
  missingElements: string[]
}

export interface LocalSchemaPageResult {
  url: string
  pageName: string
  status: LocalSchemaStatus
  types: string[]
  missingProperties: string[]
}

export interface LocalSchemaAudit {
  pages: LocalSchemaPageResult[]
  /** The homepage's own result (or the best result found, if the homepage wasn't crawled) — the single most relevant page for sitewide LocalBusiness schema. */
  sitewideStatus: LocalSchemaStatus
}

export interface ServiceLocationCell {
  service: string
  location: string
  status: LocationCoverageStatus
  mappedUrl: string | null
}

export interface LocalKeywordCoverageRow {
  keyword: string
  location: string | null
  service: string
  mappedUrl: string | null
  confidence: ConfidenceLevel
  status: LocationCoverageStatus
  action: LocalKeywordAction
}

export interface LocationPageQualityIssue {
  url: string
  pageName: string
  issues: string[]
  similarTo: string | null
  similarityScore: number | null
  doorwayRisk: boolean
}

export interface LocalOpportunity {
  topic: string
  location: string | null
  priority: LocalOpportunityPriority
  action: string
  reason: string
  evidence: string
  source: DataSourceLabel
}

export interface LocalSeoIntelligence {
  applicable: boolean
  dataSufficiency: LocalDataSufficiency
  nap: NapAudit
  schema: LocalSchemaAudit
  locationCoverage: { existingLocationPages: string[]; competitorLocationGaps: string[] }
  serviceLocationMatrix: ServiceLocationCell[]
  localKeywordCoverage: LocalKeywordCoverageRow[]
  locationPageQuality: LocationPageQualityIssue[]
  googleBusinessProfile: { status: 'not_verified'; checklist: string[] }
  reviewsAndCitations: { status: 'not_evaluated'; recommendations: string[] }
  opportunities: LocalOpportunity[]
}

function emptyLocalSeoIntelligence(dataSufficiency: LocalDataSufficiency): LocalSeoIntelligence {
  return {
    applicable: false,
    dataSufficiency,
    nap: { status: 'not_evaluated', businessName: null, businessNameSource: 'not_available', phones: [], addresses: [], contactSource: 'not_available', conflicts: [], missingElements: [] },
    schema: { pages: [], sitewideStatus: 'not_evaluated' },
    locationCoverage: { existingLocationPages: [], competitorLocationGaps: [] },
    serviceLocationMatrix: [],
    localKeywordCoverage: [],
    locationPageQuality: [],
    googleBusinessProfile: { status: 'not_verified', checklist: [] },
    reviewsAndCitations: { status: 'not_evaluated', recommendations: [] },
    opportunities: [],
  }
}

// ---------------------------------------------------------------------------
// 1. NAP audit — new logic: compares each crawled page's OWN contactInfo
// against the sitewide set to find pages with a DIFFERENT phone/address
// than the site's dominant value, rather than only reporting the
// aggregate set (which can't reveal a conflict at all).
// ---------------------------------------------------------------------------
function mostCommon(values: string[]): string | null {
  if (values.length === 0) return null
  const counts = new Map<string, number>()
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1)
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0][0]
}

function buildNapAudit(businessName: string, analysis: SiteAnalysis | null, pages: PageAnalysis[]): NapAudit {
  if (!analysis) {
    return { status: 'not_evaluated', businessName: businessName || null, businessNameSource: businessName ? 'user_provided' : 'not_available', phones: [], addresses: [], contactSource: 'not_available', conflicts: [], missingElements: ['phone', 'address'] }
  }

  const allPagePhones = pages.flatMap((p) => p.contactInfo.phones)
  const allPageAddresses = pages.flatMap((p) => p.contactInfo.addresses)
  const dominantPhone = mostCommon(allPagePhones)
  const dominantAddress = mostCommon(allPageAddresses)

  const conflicts: NapConflict[] = []
  for (const p of pages) {
    for (const phone of p.contactInfo.phones) {
      if (dominantPhone && phone !== dominantPhone) {
        conflicts.push({ url: p.url, issue: `Phone number "${phone}" differs from the site's dominant number "${dominantPhone}".` })
      }
    }
    for (const address of p.contactInfo.addresses) {
      if (dominantAddress && address !== dominantAddress) {
        conflicts.push({ url: p.url, issue: `Address "${address}" differs from the site's dominant address "${dominantAddress}".` })
      }
    }
  }

  const missingElements: string[] = []
  if (analysis.contactInfo.phones.length === 0) missingElements.push('phone')
  if (analysis.contactInfo.addresses.length === 0) missingElements.push('address')

  return {
    status: analysis.contactInfo.phones.length === 0 && analysis.contactInfo.addresses.length === 0 ? 'not_evaluated' : conflicts.length > 0 ? 'conflicting' : 'consistent',
    businessName: businessName || null,
    businessNameSource: businessName ? 'user_provided' : 'not_available',
    phones: analysis.contactInfo.phones,
    addresses: analysis.contactInfo.addresses,
    contactSource: 'crawled',
    conflicts,
    missingElements,
  }
}

// ---------------------------------------------------------------------------
// 2. LocalBusiness schema classification — new logic, built on the
// property-presence data captured during crawl (see analyze/route.ts's
// localBusinessSchemaNodes). Only name/address/telephone are required for
// "valid" — url/areaServed are useful but optional, so their absence never
// downgrades a page below "valid" (spec: "do not treat every optional
// property as required").
// ---------------------------------------------------------------------------
function classifyLocalSchemaForPage(page: PageAnalysis): LocalSchemaPageResult {
  const node = page.localBusinessSchemaNodes[0]
  if (!node) {
    const status: LocalSchemaStatus = page.jsonLdParseErrorCount > 0 ? 'invalid' : 'missing_opportunity'
    return { url: page.url, pageName: page.title || page.url, status, types: [], missingProperties: [] }
  }
  const missingProperties: string[] = []
  if (!node.hasName) missingProperties.push('name')
  if (!node.hasAddress) missingProperties.push('address')
  if (!node.hasTelephone) missingProperties.push('telephone')
  const status: LocalSchemaStatus = missingProperties.length === 0 ? 'valid' : 'incomplete'
  return { url: page.url, pageName: page.title || page.url, status, types: node.types, missingProperties }
}

const SCHEMA_STATUS_RANK: Record<LocalSchemaStatus, number> = { valid: 4, incomplete: 3, missing_opportunity: 1, invalid: 0, not_evaluated: 2 }

function buildLocalSchemaAudit(analysis: SiteAnalysis | null, pages: PageAnalysis[]): LocalSchemaAudit {
  if (!analysis) return { pages: [], sitewideStatus: 'not_evaluated' }
  const results = pages.map(classifyLocalSchemaForPage)
  const homepage = analysis.homepage ? results.find((r) => r.url === analysis.homepage!.url) : undefined
  const sitewideStatus = homepage?.status ?? results.reduce<LocalSchemaStatus>((best, r) => (SCHEMA_STATUS_RANK[r.status] > SCHEMA_STATUS_RANK[best] ? r.status : best), 'not_evaluated')
  return { pages: results, sitewideStatus }
}

// ---------------------------------------------------------------------------
// 3. Location coverage + service×location matrix — reuses P0's
// derivePageImportance-adjacent PageOnPageAudit.content.pageType (Phase 2B)
// for existing location pages, and Phase 6's competitor locationGaps for
// "other" locations worth checking. Deliberately limited to the business's
// OWN validated location plus locations competitor evidence actually
// surfaced — never a speculative list of nearby cities (spec: "do not
// recommend every possible combination automatically").
// ---------------------------------------------------------------------------
function buildLocationCoverage(targetPages: PageOnPageAudit[], locationGaps: GapItem[]): { existingLocationPages: string[]; competitorLocationGaps: string[] } {
  return {
    existingLocationPages: targetPages.filter((p) => p.content.pageType === 'location').map((p) => p.url),
    competitorLocationGaps: locationGaps.map((g) => g.topic),
  }
}

function serviceLabelFor(page: PageOnPageAudit): string {
  return page.h1.values[0]?.trim() || page.metaTitle.currentValue?.trim() || page.pageName
}

function buildServiceLocationMatrix(targetPages: PageOnPageAudit[], keywordMappings: KeywordPageMapping[], location: string): ServiceLocationCell[] {
  const servicePages = targetPages.filter((p) => p.content.pageType === 'service')
  if (servicePages.length === 0 || !location.trim()) return []

  return servicePages.slice(0, 8).map((page) => {
    const service = serviceLabelFor(page)
    // A mapped keyword combining this page's own topic with the location
    // means the service is validated as covered for that location; a page
    // exists but no such keyword mapping validates it -> partial.
    const combinedKeyword = `${service} ${location}`.toLowerCase()
    const strongMapping = keywordMappings.find(
      (m) => m.status === 'mapped' && m.mappedUrl === page.url && (m.keyword.toLowerCase().includes(location.toLowerCase()) || combinedKeyword.includes(m.keyword.toLowerCase())),
    )
    return {
      service,
      location,
      status: strongMapping ? 'covered' : ('partial' as LocationCoverageStatus),
      mappedUrl: page.url,
    }
  })
}

// ---------------------------------------------------------------------------
// 4. Local keyword coverage — reuses Phase 7's buildPageOpportunities()
// verbatim (same existing-page-check, cannibalization protection, and
// priority logic) rather than re-deriving keyword actions, then maps its
// action/cannibalizationRisk vocabulary onto Phase 8's local-specific
// labels and keeps only keywords that actually mention the business's own
// location.
// ---------------------------------------------------------------------------
function toLocalAction(o: PageOpportunity): LocalKeywordAction {
  if (o.cannibalizationRisk === 'potential_cannibalization') return 'potential_cannibalization'
  if (o.action === 'optimize') return 'keep_existing'
  if (o.action === 'improve') return 'improve_existing'
  return 'create_dedicated_page'
}

function toLocalStatus(o: PageOpportunity): LocationCoverageStatus {
  if (o.action === 'optimize') return 'covered'
  if (o.action === 'improve') return 'partial'
  return 'opportunity'
}

function buildLocalKeywordCoverage(opportunities: PageOpportunity[], location: string): LocalKeywordCoverageRow[] {
  if (!location.trim()) return []
  const locationLower = location.toLowerCase()
  return opportunities
    .filter((o) => o.primaryKeyword.toLowerCase().includes(locationLower))
    .map((o) => ({
      keyword: o.primaryKeyword,
      location,
      service: o.primaryKeyword.toLowerCase().replace(locationLower, '').trim() || o.primaryKeyword,
      mappedUrl: o.existingPage,
      confidence: o.confidence,
      status: toLocalStatus(o),
      action: toLocalAction(o),
    }))
}

// ---------------------------------------------------------------------------
// 5. Location page quality — pure presentation of ALREADY-computed Phase 2B
// content-similarity/thin-content/internal-linking data for pages
// classified as 'location'. Never recalculates similarity itself.
// ---------------------------------------------------------------------------
function buildLocationPageQuality(targetPages: PageOnPageAudit[]): LocationPageQualityIssue[] {
  const locationPages = targetPages.filter((p) => p.content.pageType === 'location')
  const results: LocationPageQualityIssue[] = []
  for (const p of locationPages) {
    const issues: string[] = []
    if (p.content.thinContent) issues.push('Thin content for a location page.')
    if (p.content.duplicateStatus === 'near_duplicate' || p.content.duplicateStatus === 'exact_duplicate') {
      issues.push('Near-duplicate content shared with another page — likely a templated city-swap page.')
    }
    if (p.internalLinks.weaklyLinked) issues.push('Weakly linked internally for a page of its importance.')
    if (issues.length === 0) continue
    const topMatch = p.content.similarPages[0] ?? null
    results.push({
      url: p.url,
      pageName: p.pageName,
      issues,
      similarTo: topMatch?.url ?? null,
      similarityScore: topMatch?.similarityScore ?? null,
      // "Doorway page" risk = near-duplicate location content with thin substance — the classic templated-city-page pattern search engines penalize.
      doorwayRisk: p.content.thinContent && (p.content.duplicateStatus === 'near_duplicate' || p.content.duplicateStatus === 'exact_duplicate'),
    })
  }
  return results
}

// ---------------------------------------------------------------------------
// 6. Priority opportunities — merges the local-specific keyword coverage
// gaps (already prioritized by Phase 7) with schema/NAP findings unique to
// Phase 8. Deterministic, never AI-assigned.
// ---------------------------------------------------------------------------
const PRIORITY_RANK: Record<LocalOpportunityPriority, number> = { high: 3, medium: 2, low: 1 }

function buildOpportunities(
  localKeywordCoverage: LocalKeywordCoverageRow[],
  opportunitiesByKeyword: Map<string, PageOpportunity>,
  nap: NapAudit,
  schema: LocalSchemaAudit,
): LocalOpportunity[] {
  const opportunities: LocalOpportunity[] = []

  for (const row of localKeywordCoverage) {
    if (row.action !== 'create_dedicated_page' && row.action !== 'potential_cannibalization') continue
    const source = opportunitiesByKeyword.get(row.keyword.toLowerCase().trim())
    if (!source) continue
    opportunities.push({
      topic: row.keyword,
      location: row.location,
      priority: source.priority,
      action: row.action === 'potential_cannibalization' ? 'Improve existing page (avoid duplicate)' : 'Create dedicated page',
      reason: source.reason,
      evidence: source.competitorEvidence ?? `No suitable existing page targets "${row.keyword}".`,
      source: source.competitorEvidence ? 'competitor_crawl' : 'crawled',
    })
  }

  if (nap.status === 'conflicting') {
    opportunities.push({
      topic: 'NAP consistency',
      location: null,
      priority: 'high',
      action: 'Fix conflicting business name/address/phone across pages',
      reason: 'Inconsistent NAP data confuses both users and local search algorithms.',
      evidence: `${nap.conflicts.length} conflicting NAP value(s) found across crawled pages.`,
      source: 'crawled',
    })
  }

  if (schema.sitewideStatus === 'missing_opportunity' || schema.sitewideStatus === 'invalid') {
    opportunities.push({
      topic: 'LocalBusiness schema',
      location: null,
      priority: schema.sitewideStatus === 'invalid' ? 'high' : 'medium',
      action: schema.sitewideStatus === 'invalid' ? 'Fix invalid LocalBusiness JSON-LD' : 'Add LocalBusiness schema to the homepage',
      reason: 'LocalBusiness structured data helps search engines understand the business identity, address, and service area.',
      evidence: schema.sitewideStatus === 'invalid' ? 'The homepage JSON-LD failed to parse.' : 'No LocalBusiness schema was detected on the homepage.',
      source: 'crawled',
    })
  } else if (schema.sitewideStatus === 'incomplete') {
    opportunities.push({
      topic: 'LocalBusiness schema',
      location: null,
      priority: 'medium',
      action: 'Complete the LocalBusiness schema (name/address/telephone)',
      reason: 'A partial LocalBusiness schema is less useful to search engines than a complete one.',
      evidence: 'LocalBusiness schema was found but is missing required properties.',
      source: 'crawled',
    })
  }

  return opportunities.sort((a, b) => PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority]).slice(0, 10)
}

const GBP_CHECKLIST = [
  'Claim and verify your Google Business Profile listing.',
  'Ensure the business name, address, and phone number exactly match your website.',
  'Select the most accurate primary and secondary categories.',
  'Add high-quality photos of your premises, team, and work.',
  'Post updates regularly and respond to all reviews.',
]

const REVIEW_CITATION_RECOMMENDATIONS = [
  'Set up a consistent process for requesting reviews from satisfied customers.',
  'Ensure your NAP is identical across major local directories (this website\'s own NAP consistency is audited above).',
  'List the business on relevant industry-specific and local directories.',
]

export function buildLocalSeoIntelligence(
  isLocalBusiness: boolean,
  dataSufficiency: LocalDataSufficiency,
  businessName: string,
  location: string,
  analysis: SiteAnalysis | null,
  targetPages: PageOnPageAudit[],
  keywordMappings: KeywordPageMapping[],
  competitorLocationGaps: GapItem[],
): LocalSeoIntelligence {
  if (!isLocalBusiness) return emptyLocalSeoIntelligence(dataSufficiency)

  const pages = analysis ? [analysis.homepage, ...analysis.pages].filter((p): p is PageAnalysis => p !== null) : []
  const nap = buildNapAudit(businessName, analysis, pages)
  const schema = buildLocalSchemaAudit(analysis, pages)
  const locationCoverage = buildLocationCoverage(targetPages, competitorLocationGaps)
  const serviceLocationMatrix = buildServiceLocationMatrix(targetPages, keywordMappings, location)

  // Reuses Phase 7's engine directly rather than re-deriving keyword
  // actions/cannibalization/priority.
  const pageOpportunities = buildPageOpportunities(keywordMappings, { serviceGaps: [], locationGaps: competitorLocationGaps, contentGaps: [] }, { isLocalBusiness, location }).opportunities
  const localKeywordCoverage = buildLocalKeywordCoverage(pageOpportunities, location)
  const opportunitiesByKeyword = new Map(pageOpportunities.map((o) => [o.primaryKeyword.toLowerCase().trim(), o]))

  const locationPageQuality = buildLocationPageQuality(targetPages)
  const opportunities = buildOpportunities(localKeywordCoverage, opportunitiesByKeyword, nap, schema)

  return {
    applicable: true,
    dataSufficiency,
    nap,
    schema,
    locationCoverage,
    serviceLocationMatrix,
    localKeywordCoverage,
    locationPageQuality,
    googleBusinessProfile: { status: 'not_verified', checklist: GBP_CHECKLIST },
    reviewsAndCitations: { status: 'not_evaluated', recommendations: REVIEW_CITATION_RECOMMENDATIONS },
    opportunities,
  }
}
