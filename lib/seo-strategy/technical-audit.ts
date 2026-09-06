// ──────────────────────────────────────────────────────────────────────────
// Phase 2B — deterministic technical on-page audit: canonical, indexability,
// status code, schema, Open Graph, Twitter Card, and URL structure. Every
// field comes straight from crawl data (PageAnalysis) — the AI never
// decides HTTP status, canonical existence, indexability directives, or
// schema/OG/Twitter presence.
// ──────────────────────────────────────────────────────────────────────────
import type { PageAnalysis } from '@/app/api/seo-strategy/analyze/route'
import { pickHighestSeverity } from './severity'
import type {
  CanonicalAudit,
  IndexabilityAudit,
  IndexabilityResult,
  OnPageStatus,
  OpenGraphAudit,
  PageImportance,
  PageType,
  SchemaAudit,
  Severity,
  StatusCodeAudit,
  TechnicalOnPageAudit,
  TwitterCardAudit,
  UrlStructureAudit,
} from './types'
import { URL_MAX_FOLDER_DEPTH, URL_MAX_QUERY_PARAMS, URL_LENGTH_REVIEW } from './phase2b-thresholds'

// ---------------------------------------------------------------------------
// Canonical
// ---------------------------------------------------------------------------
function evaluateCanonical(page: PageAnalysis, allPagesByUrl: Map<string, PageAnalysis>): CanonicalAudit {
  const issues: string[] = []
  const severities: Severity[] = []
  const exists = !!page.canonical
  const multiple = page.canonicalCount > 1
  let isSelfReferencing: boolean | null = null
  let targetStatus: number | null = null

  if (multiple) {
    issues.push(`Multiple canonical tags found (${page.canonicalCount}) — conflicting canonical signals can confuse search engines.`)
    severities.push('high')
  }

  if (!exists) {
    // Not automatically critical — severity depends on context (P0 spec).
    issues.push('No canonical tag found.')
    severities.push('low')
  } else {
    let canonicalUrl: URL | null = null
    try {
      canonicalUrl = new URL(page.canonical as string, page.url)
    } catch {
      canonicalUrl = null
    }
    if (!canonicalUrl) {
      issues.push('Canonical tag value is malformed and could not be resolved to a URL.')
      severities.push('medium')
    } else {
      const normalizedCanonical = canonicalUrl.toString().replace(/\/$/, '')
      const normalizedPage = page.url.replace(/\/$/, '')
      isSelfReferencing = normalizedCanonical === normalizedPage
      if (!isSelfReferencing) {
        const target = allPagesByUrl.get(canonicalUrl.toString())
        targetStatus = target ? target.status : null
        if (target && !target.ok) {
          issues.push(`Canonical points to ${canonicalUrl.toString()}, which itself returned HTTP ${target.status}.`)
          severities.push('high')
        } else {
          issues.push(`Canonical points to a different URL (${canonicalUrl.toString()}) rather than this page — confirm this is intentional.`)
          severities.push('low')
        }
      }
    }
  }

  if (issues.length === 0) severities.push('pass')
  const worst = pickHighestSeverity(severities)
  const status: OnPageStatus = issues.length === 0 ? 'good' : worst === 'high' || worst === 'critical' ? 'poor' : 'needs_improvement'
  return { exists, url: page.canonical, isSelfReferencing, multiple, targetStatus, status, severity: worst, issues }
}

// ---------------------------------------------------------------------------
// Indexability
// ---------------------------------------------------------------------------
function evaluateIndexability(
  page: PageAnalysis,
  importance: PageImportance,
  pageType: PageType,
  robotsTxtBlocksAll: boolean,
): IndexabilityAudit {
  const reasons: string[] = []
  let result: IndexabilityResult
  let severity: Severity

  if (robotsTxtBlocksAll) {
    result = 'blocked'
    reasons.push('robots.txt disallows all crawlers sitewide.')
    severity = 'critical'
  } else if (page.metaRobotsNoindex || /noindex/i.test(page.xRobotsTag ?? '')) {
    result = 'non_indexable'
    reasons.push(page.metaRobotsNoindex ? 'The page\'s meta robots tag contains noindex.' : 'The X-Robots-Tag response header contains noindex.')
    if (importance === 'high') severity = 'critical'
    else if (pageType === 'legal' || pageType === 'utility') severity = 'pass' // intentional exclusion on these page types is normal, not a finding
    else severity = 'medium'
  } else if (!page.ok) {
    result = 'not_evaluated'
    reasons.push(`Page returned HTTP ${page.status}, so indexability couldn't be meaningfully evaluated.`)
    severity = 'not_evaluated'
  } else {
    result = 'indexable'
    reasons.push('No blocking directive found in robots.txt, meta robots, or X-Robots-Tag.')
    severity = 'pass'
  }

  const status: OnPageStatus = severity === 'pass' ? 'good' : severity === 'not_evaluated' ? 'not_evaluated' : 'poor'
  return { result, reasons, status, severity }
}

// ---------------------------------------------------------------------------
// Status code
// ---------------------------------------------------------------------------
function evaluateStatusCode(page: PageAnalysis): StatusCodeAudit {
  const issues: string[] = []
  let severity: Severity = 'pass'
  let category: StatusCodeAudit['category'] = 'other'

  if (page.status >= 200 && page.status < 300) category = '2xx'
  else if (page.status >= 300 && page.status < 400) category = '3xx'
  else if (page.status >= 400 && page.status < 500) category = '4xx'
  else if (page.status >= 500) category = '5xx'

  if (category === '3xx') {
    issues.push(`Page returned a redirect (HTTP ${page.status}).`)
    severity = 'low'
  } else if (page.status === 404 || page.status === 410) {
    issues.push(`Page returned HTTP ${page.status}.`)
    severity = 'high'
  } else if (category === '4xx') {
    issues.push(`Page returned HTTP ${page.status}.`)
    severity = 'high'
  } else if (category === '5xx') {
    issues.push(`Page returned a server error (HTTP ${page.status}).`)
    severity = 'critical'
  }

  const status: OnPageStatus = severity === 'pass' ? 'good' : 'poor'
  return { code: page.status, category, status, severity, issues }
}

// ---------------------------------------------------------------------------
// Schema — "missing opportunity", never "error", for optional types.
// ---------------------------------------------------------------------------
const RECOMMENDED_SCHEMA_BY_PAGE_TYPE: Record<PageType, string[]> = {
  homepage: ['Organization'],
  service: ['Service'],
  location: ['LocalBusiness'],
  blog: ['Article'],
  contact: [],
  legal: [],
  utility: [],
}

function evaluateSchema(page: PageAnalysis, pageType: PageType, isLocalBusiness: boolean): SchemaAudit {
  const issues: string[] = []
  const severities: Severity[] = []
  const present = page.hasJsonLd || page.schemaTypes.length > 0
  const validJsonLd = page.jsonLdParseErrorCount === 0

  if (page.jsonLdParseErrorCount > 0) {
    issues.push(`${page.jsonLdParseErrorCount} structured-data block(s) failed to parse as valid JSON-LD.`)
    severities.push('medium')
  }

  const typeCounts = new Map<string, number>()
  for (const t of page.schemaTypes) typeCounts.set(t, (typeCounts.get(t) ?? 0) + 1)
  const duplicateTypes = Array.from(typeCounts.entries()).filter(([, c]) => c > 1).map(([t]) => t)
  if (duplicateTypes.length > 0) {
    issues.push(`Duplicate schema type(s) found: ${duplicateTypes.join(', ')}.`)
    severities.push('low')
  }

  const recommended = pageType === 'homepage' && isLocalBusiness ? ['Organization', 'LocalBusiness'] : RECOMMENDED_SCHEMA_BY_PAGE_TYPE[pageType]
  const missingOpportunities = recommended.filter((r) => !page.schemaTypes.some((t) => t.toLowerCase().includes(r.toLowerCase())))

  if (!present && recommended.length > 0) {
    issues.push(`No structured data found — ${recommended.join('/')} schema could be a relevant addition for this page type.`)
    severities.push('low')
  } else if (present && missingOpportunities.length > 0) {
    issues.push(`${missingOpportunities.join('/')} schema could be a relevant addition alongside what's already present.`)
    severities.push('low')
  }

  if (issues.length === 0) severities.push('pass')
  const status: OnPageStatus = issues.length === 0 ? 'good' : 'needs_improvement'
  return { present, types: page.schemaTypes, validJsonLd, parseErrorCount: page.jsonLdParseErrorCount, duplicateTypes, missingOpportunities, status, severity: pickHighestSeverity(severities), issues }
}

// ---------------------------------------------------------------------------
// Open Graph — usually medium/low, never critical.
// ---------------------------------------------------------------------------
function evaluateOpenGraph(page: PageAnalysis): OpenGraphAudit {
  const present = {
    'og:title': !!page.ogTags['og:title'],
    'og:description': !!page.ogTags['og:description'],
    'og:url': !!page.ogTags['og:url'],
    'og:image': !!page.ogTags['og:image'],
    'og:type': !!page.ogTags['og:type'],
  }
  const missing = (Object.keys(present) as (keyof typeof present)[]).filter((k) => !present[k])
  const majorMissing = missing.filter((k) => k === 'og:title' || k === 'og:description' || k === 'og:image')

  const issues: string[] = []
  let severity: Severity = 'pass'
  if (majorMissing.length > 0) {
    issues.push(`Missing major Open Graph field(s): ${majorMissing.join(', ')}.`)
    severity = 'medium'
  } else if (missing.length > 0) {
    issues.push(`Missing Open Graph field(s): ${missing.join(', ')}.`)
    severity = 'low'
  }

  const status: OnPageStatus = issues.length === 0 ? 'good' : 'needs_improvement'
  return { present, status, severity, issues }
}

// ---------------------------------------------------------------------------
// Twitter Card — mainly social-sharing metadata; low/info in most cases.
// ---------------------------------------------------------------------------
function evaluateTwitter(page: PageAnalysis, og: OpenGraphAudit): TwitterCardAudit {
  const present = {
    'twitter:card': !!page.twitterTags['twitter:card'],
    'twitter:title': !!page.twitterTags['twitter:title'],
    'twitter:description': !!page.twitterTags['twitter:description'],
    'twitter:image': !!page.twitterTags['twitter:image'],
  }
  const ogFallbackAvailable = og.present['og:title'] && og.present['og:description'] && og.present['og:image']
  const missing = (Object.keys(present) as (keyof typeof present)[]).filter((k) => !present[k])

  const issues: string[] = []
  let severity: Severity = 'pass'
  if (missing.length > 0) {
    issues.push(
      ogFallbackAvailable
        ? `Missing Twitter Card field(s): ${missing.join(', ')} (Open Graph tags can serve as a fallback).`
        : `Missing Twitter Card field(s): ${missing.join(', ')}.`,
    )
    severity = ogFallbackAvailable ? 'info' : 'low'
  }

  const status: OnPageStatus = issues.length === 0 ? 'good' : 'needs_improvement'
  return { present, ogFallbackAvailable, status, severity, issues }
}

// ---------------------------------------------------------------------------
// URL structure
// ---------------------------------------------------------------------------
function evaluateUrlStructure(url: string): UrlStructureAudit {
  let parsed: URL | null = null
  try {
    parsed = new URL(url)
  } catch {
    return { url, status: 'not_evaluated', severity: 'not_evaluated', issues: ['URL could not be parsed.'] }
  }

  const issues: string[] = []
  const severities: Severity[] = []

  if (url.length > URL_LENGTH_REVIEW) {
    issues.push(`URL is quite long (${url.length} characters).`)
    severities.push('low')
  }
  if (/[A-Z]/.test(parsed.pathname)) {
    issues.push('URL contains uppercase characters.')
    severities.push('low')
  }
  if (/%20/.test(parsed.pathname)) {
    issues.push('URL contains encoded spaces.')
    severities.push('low')
  }
  const paramCount = Array.from(parsed.searchParams.keys()).length
  if (paramCount > URL_MAX_QUERY_PARAMS) {
    issues.push(`URL has ${paramCount} query parameters — a cleaner path-based structure is usually preferable.`)
    severities.push('low')
  }
  const segments = parsed.pathname.split('/').filter(Boolean)
  if (segments.length > URL_MAX_FOLDER_DEPTH) {
    issues.push(`URL has ${segments.length} folder levels — consider a flatter structure.`)
    severities.push('low')
  }
  if (/_/.test(parsed.pathname)) {
    issues.push('URL uses underscores where hyphens are generally preferred.')
    severities.push('low')
  }
  const words = parsed.pathname.toLowerCase().match(/[a-z0-9]+/g) ?? []
  const wordCounts = new Map<string, number>()
  for (const w of words) if (w.length >= 4) wordCounts.set(w, (wordCounts.get(w) ?? 0) + 1)
  if (Math.max(0, ...wordCounts.values()) >= 3) {
    issues.push('URL repeats the same word excessively — may read as keyword stuffing.')
    severities.push('low')
  }
  if (/\bid=\d+\b/i.test(parsed.search) || /\/\d{4,}(\/|$)/.test(parsed.pathname)) {
    issues.push('URL contains a meaningless numeric ID rather than a descriptive slug.')
    severities.push('low')
  }

  if (issues.length === 0) severities.push('pass')
  const status: OnPageStatus = issues.length === 0 ? 'good' : 'needs_improvement'
  return { url, status, severity: pickHighestSeverity(severities), issues }
}

// ---------------------------------------------------------------------------
// Assembly
// ---------------------------------------------------------------------------
export function evaluateTechnicalOnPage(
  page: PageAnalysis,
  allPagesByUrl: Map<string, PageAnalysis>,
  importance: PageImportance,
  pageType: PageType,
  isLocalBusiness: boolean,
  robotsTxtBlocksAll: boolean,
): TechnicalOnPageAudit {
  const canonical = evaluateCanonical(page, allPagesByUrl)
  const indexability = evaluateIndexability(page, importance, pageType, robotsTxtBlocksAll)
  const statusCode = evaluateStatusCode(page)
  const schema = evaluateSchema(page, pageType, isLocalBusiness)
  const openGraph = evaluateOpenGraph(page)
  const twitter = evaluateTwitter(page, openGraph)
  const urlStructure = evaluateUrlStructure(page.url)

  const severity = pickHighestSeverity([
    canonical.severity,
    indexability.severity,
    statusCode.severity,
    schema.severity,
    openGraph.severity,
    twitter.severity,
    urlStructure.severity,
  ])
  const anyPoor = [canonical.status, indexability.status, statusCode.status].some((s) => s === 'poor')
  const allGood = [canonical.status, indexability.status, statusCode.status, schema.status, openGraph.status, twitter.status, urlStructure.status].every(
    (s) => s === 'good' || s === 'not_evaluated',
  )
  const status: OnPageStatus = allGood ? 'good' : anyPoor ? 'poor' : 'needs_improvement'

  return { canonical, indexability, statusCode, schema, openGraph, twitter, urlStructure, status, severity }
}
