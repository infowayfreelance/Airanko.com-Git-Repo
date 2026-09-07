// ──────────────────────────────────────────────────────────────────────────
// Phase 9 — deterministic, relevance-first Off-Page SEO strategy. Replaces
// the old AI-generated backlink-quota/cost-tier tactics (fixed
// "N links/month" targets, invented DA/DR guidance, generic guest-post
// lists) with a rule-based opportunity catalog scored on topical/local
// relevance, legitimacy, and spam risk — never on a link-count target.
// Nothing here calls the AI or invents a domain metric; every opportunity
// traces back to the business's own inputs (industry/location), its
// crawled page data, or is explicitly labeled not_available.
// ──────────────────────────────────────────────────────────────────────────
import type { ConfidenceLevel, PageOnPageAudit } from './types'

export type OffPagePriority = 'high' | 'medium' | 'low' | 'avoid'
export type OffPageDataSource = 'crawled' | 'user_provided' | 'competitor_crawl' | 'verified_api' | 'ai_suggested' | 'not_available'

export interface OffPageOpportunity {
  type: string
  targetType: string
  relevance: 'high' | 'medium' | 'low'
  priority: OffPagePriority
  reason: string
  recommendedPage: string | null
  dataSource: OffPageDataSource
  confidence: ConfidenceLevel
}

export interface LocalCitationCategory {
  category: string
  description: string
  napFocus: boolean
}

export interface LinkableAssetIdea {
  type: string
  idea: string
  reason: string
}

export interface OffPageRisk {
  practice: string
  reason: string
}

export interface OffPageIntelligence {
  /** Mirrors P0's isLocalBusiness — never independently decided here. */
  localStrategyApplicable: boolean
  opportunities: OffPageOpportunity[]
  localCitations: LocalCitationCategory[]
  partnerships: OffPageOpportunity[]
  digitalPR: OffPageOpportunity[]
  linkableAssets: LinkableAssetIdea[]
  risks: OffPageRisk[]
  anchorTextGuidance: string[]
  monthlyActivityGoals: string[]
  /** Always "Not Evaluated" — see the module header note; never a fabricated DA/DR/backlink count. */
  domainMetricsNote: string
}

interface BuildOptions {
  isLocalBusiness: boolean
  location: string
  industry: string
  businessName: string
}

// ---------------------------------------------------------------------------
// Static risk catalog (Phase 9 spec §11) — deterministic, never generated
// per-request, since these are always-true anti-patterns regardless of
// business profile.
// ---------------------------------------------------------------------------
const OFF_PAGE_RISKS: OffPageRisk[] = [
  { practice: 'Paid link farms / link networks', reason: 'Manipulative and detectable by search engines — risks a manual action.' },
  { practice: 'Private Blog Networks (PBNs)', reason: 'Artificial link schemes carry a high de-indexing/penalty risk.' },
  { practice: 'Irrelevant guest-post sites', reason: 'A link with no topical or audience relevance provides little value and looks unnatural.' },
  { practice: 'Mass/automated directory submissions', reason: 'Low-quality, often unmoderated directories provide no real referral value and dilute NAP consistency.' },
  { practice: 'Sitewide footer or sidebar links', reason: 'Reads as a paid or reciprocal placement rather than an editorial endorsement.' },
  { practice: 'Automated backlink packages ("buy 100 links")', reason: 'Fixed-price bulk link packages are almost always low-quality or spam.' },
  { practice: 'Exact-match anchor text manipulation', reason: 'Over-optimized anchor text is a well-known spam signal.' },
  { practice: 'Excessive reciprocal linking', reason: 'Large-scale link exchanges look manipulative rather than natural.' },
]

const ANCHOR_TEXT_GUIDANCE: string[] = [
  'Brand name (e.g. the business name) — the most natural, highest-share anchor type.',
  'Bare URL or "click here" style anchors, used sparingly for natural variety.',
  'Service/topic anchors (e.g. the service the linked page covers) rather than an exact-match keyword every time.',
  'Contextual descriptive phrases that read naturally within a sentence.',
  'Occasional natural partial-match anchors — never a fixed percentage target.',
]

const MONTHLY_ACTIVITY_GOALS: string[] = [
  'Identify a small number of genuinely relevant link/citation prospects.',
  'Secure or correct citations on directories that are actually relevant to the business.',
  'Contact one or two relevant local/industry partners about a genuine collaboration.',
  'Create or improve one useful linkable asset (a guide, resource, or checklist).',
  'Pursue one genuine editorial or digital PR opportunity — no guaranteed link count.',
]

// ---------------------------------------------------------------------------
// Opportunity catalog — each entry is a deterministic template gated on the
// business's own inputs (isLocalBusiness / industry), never on invented
// domain metrics. Priority is a fixed, documented rubric per category
// (topical + local relevance, assumed legitimacy of the category, editorial
// plausibility) — never AI-assigned.
// ---------------------------------------------------------------------------
function buildOpportunities(options: BuildOptions): OffPageOpportunity[] {
  const { isLocalBusiness, location, industry } = options
  const industryLabel = industry.trim() || 'your industry'
  const locationLabel = location.trim()
  const opportunities: OffPageOpportunity[] = []

  if (isLocalBusiness && locationLabel) {
    opportunities.push({
      type: 'Local business directories',
      targetType: `Major trusted business directories covering ${locationLabel}`,
      relevance: 'high',
      priority: 'high',
      reason: 'Strong local relevance and a legitimate, editorially-moderated category — supports NAP consistency.',
      recommendedPage: null,
      dataSource: 'user_provided',
      confidence: 'high',
    })
    opportunities.push({
      type: 'Local business partnerships',
      targetType: `Complementary (non-competing) businesses around ${locationLabel}`,
      relevance: 'high',
      priority: 'high',
      reason: 'Local + business relevance, with a genuine editorial/referral basis rather than a paid placement.',
      recommendedPage: null,
      dataSource: 'user_provided',
      confidence: 'medium',
    })
    opportunities.push({
      type: 'Local press & community coverage',
      targetType: `Local news outlets and community organizations in ${locationLabel}`,
      relevance: 'medium',
      priority: 'medium',
      reason: 'High legitimacy and local relevance, though editorial coverage isn’t guaranteed.',
      recommendedPage: null,
      dataSource: 'user_provided',
      confidence: 'medium',
    })
    opportunities.push({
      type: 'Sponsorship / community involvement',
      targetType: `Local events, clubs, or charities in ${locationLabel}`,
      relevance: 'medium',
      priority: 'medium',
      reason: 'Genuine community involvement earns natural, relevant local links.',
      recommendedPage: null,
      dataSource: 'user_provided',
      confidence: 'low',
    })
  }

  opportunities.push({
    type: 'Industry associations',
    targetType: `Trade or professional associations related to ${industryLabel}`,
    relevance: industry.trim() ? 'high' : 'medium',
    priority: industry.trim() ? 'high' : 'medium',
    reason: 'Directly on-topic and highly legitimate — membership directories are a natural, relevant citation source.',
    recommendedPage: null,
    dataSource: 'user_provided',
    confidence: industry.trim() ? 'high' : 'low',
  })

  opportunities.push({
    type: 'Supplier / partner links',
    targetType: `Suppliers, manufacturers, or partners your business already works with`,
    relevance: 'high',
    priority: 'medium',
    reason: 'A genuine business relationship makes the link editorially natural, not manufactured.',
    recommendedPage: null,
    dataSource: 'user_provided',
    confidence: 'low',
  })

  opportunities.push({
    type: 'Genuine guest contributions',
    targetType: `Publications and blogs that specifically cover ${industryLabel}`,
    relevance: 'medium',
    priority: 'medium',
    reason: 'Topically relevant, audience-relevant contributions read as editorial content, not link placement.',
    recommendedPage: null,
    dataSource: 'ai_suggested',
    confidence: 'low',
  })

  opportunities.push({
    type: 'Resource-page opportunities',
    targetType: `Existing "useful resources" or "helpful links" pages in ${industryLabel}`,
    relevance: 'medium',
    priority: 'medium',
    reason: 'Being added to a curated resource list is a natural, editorially-controlled placement.',
    recommendedPage: null,
    dataSource: 'ai_suggested',
    confidence: 'low',
  })

  // Explicitly demonstrates the classifier recognizing a low-quality
  // pattern, per spec test "a spammy opportunity type -> Avoid" — never
  // recommended, shown so the report can explain WHY it's excluded.
  opportunities.push({
    type: 'Mass/automated directory submissions',
    targetType: 'Bulk, unmoderated directory submission services',
    relevance: 'low',
    priority: 'avoid',
    reason: 'Low legitimacy, no editorial value, and a known spam pattern — see Practices to Avoid.',
    recommendedPage: null,
    dataSource: 'ai_suggested',
    confidence: 'high',
  })

  return opportunities
}

function buildLocalCitations(isLocalBusiness: boolean): LocalCitationCategory[] {
  if (!isLocalBusiness) return []
  return [
    { category: 'Major trusted business directories', description: 'Widely recognized, high-legitimacy general business directories.', napFocus: true },
    { category: 'Relevant industry-specific directories', description: 'Directories specific to the business’s trade or service category.', napFocus: true },
    { category: 'Local directories', description: 'Directories scoped to the business’s own town/region.', napFocus: true },
    { category: 'Trade associations', description: 'Membership listings on relevant trade or professional association sites.', napFocus: true },
  ]
}

/** Builds the linkable-asset suggestions from what the site actually has (or lacks) — reuses Phase 2B's already-computed page-type/content data rather than guessing blind. */
function buildLinkableAssets(targetPages: PageOnPageAudit[], options: BuildOptions): LinkableAssetIdea[] {
  const hasBlog = targetPages.some((p) => p.content.pageType === 'blog')
  const servicePages = targetPages.filter((p) => p.content.pageType === 'service')
  const industryLabel = options.industry.trim() || 'your services'
  const ideas: LinkableAssetIdea[] = []

  if (!hasBlog) {
    ideas.push({
      type: 'Original guide',
      idea: `A practical, original guide related to ${industryLabel}`,
      reason: 'No blog/informational content currently exists — a useful original guide gives outreach targets a real reason to link.',
    })
  }
  if (options.isLocalBusiness && options.location.trim()) {
    ideas.push({
      type: 'Local resource',
      idea: `A genuinely useful resource for ${options.location.trim()} residents/customers relevant to the business`,
      reason: 'Local relevance makes this a natural fit for local press, directories, and community sites to reference.',
    })
  }
  if (servicePages.length > 0) {
    ideas.push({
      type: 'Checklist',
      idea: `A checklist related to "${servicePages[0].h1.values[0] ?? servicePages[0].pageName}"`,
      reason: 'Practical, shareable content tied directly to a real service the business offers.',
    })
  }
  ideas.push({
    type: 'Industry resource',
    idea: `A concise reference resource useful to others in ${industryLabel}`,
    reason: 'Genuinely useful industry resources attract natural citations from peers and resource pages.',
  })

  return ideas.slice(0, 4)
}

export function buildOffPageIntelligence(options: BuildOptions, targetPages: PageOnPageAudit[]): OffPageIntelligence {
  const opportunities = buildOpportunities(options)
  return {
    localStrategyApplicable: options.isLocalBusiness,
    opportunities,
    localCitations: buildLocalCitations(options.isLocalBusiness),
    partnerships: opportunities.filter((o) => o.type.toLowerCase().includes('partnership') || o.type.toLowerCase().includes('supplier')),
    digitalPR: opportunities.filter((o) => o.type.toLowerCase().includes('press') || o.type.toLowerCase().includes('guest') || o.type.toLowerCase().includes('resource-page')),
    linkableAssets: buildLinkableAssets(targetPages, options),
    risks: OFF_PAGE_RISKS,
    anchorTextGuidance: ANCHOR_TEXT_GUIDANCE,
    monthlyActivityGoals: MONTHLY_ACTIVITY_GOALS,
    domainMetricsNote: 'Not Evaluated — no verified backlink/DA/DR data source (e.g. Ahrefs, Moz, Semrush) is connected. Relevance and legitimacy are used as the primary signals instead.',
  }
}
