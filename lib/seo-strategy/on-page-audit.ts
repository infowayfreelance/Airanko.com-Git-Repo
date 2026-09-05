// ──────────────────────────────────────────────────────────────────────────
// Phase 2A — deterministic on-page audit: meta title, meta description, H1,
// and H2/H3 heading structure, evaluated PAGE BY PAGE from structured crawl
// data (PageAnalysis). No field here — status, severity, character counts,
// duplicate detection, hierarchy validity — is ever decided by the AI; the
// AI's only role (see on-page-suggestions.ts) is optional prose alongside
// suggestions this module already validates deterministically.
//
// Conceptual pipeline (extraction is already done by the crawler):
//   evaluateMetaTitle() / evaluateMetaDescription() / evaluateH1() / evaluateHeadingStructure()
//     -> buildOnPageAudits() (per page)
//     -> aggregateOnPageIssues() (site-wide summary)
// ──────────────────────────────────────────────────────────────────────────
import type { PageAnalysis } from '@/app/api/seo-strategy/analyze/route'
import { SEVERITY_RANK } from './severity'
import type {
  H1Audit,
  HeadingNode,
  HeadingStructureAudit,
  KeywordPageMapping,
  MetaDescriptionAudit,
  MetaTitleAudit,
  OnPageIssueCategorySummary,
  OnPageStatus,
  OnPageSummary,
  PageImportance,
  PageOnPageAudit,
  Severity,
} from './types'
import {
  DESCRIPTION_LENGTH,
  EXCESSIVE_HEADING_COUNT,
  GENERIC_DESCRIPTION_PATTERNS,
  GENERIC_PHRASE_PATTERNS,
  KEYWORD_STUFFING_PROPORTION_THRESHOLD,
  KEYWORD_STUFFING_REPEAT_THRESHOLD,
  LONG_HEADING_LENGTH,
  STUFFING_STOPWORDS,
  SUBSTANTIAL_CONTENT_WORD_COUNT,
  TITLE_LENGTH,
} from './on-page-thresholds'

// ---------------------------------------------------------------------------
// Shared helpers — normalization, duplicate grouping, generic/stuffing
// checks. Exported so on-page-suggestions.ts can validate a generated
// suggestion with the exact same rules used to flag the original issue.
// ---------------------------------------------------------------------------

function decodeCommonEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

/** Trim, lowercase, collapse whitespace, decode common entities — the shared normalization for exact-duplicate comparison across pages. */
export function normalizeForDuplicateCheck(value: string): string {
  return decodeCommonEntities(value).trim().toLowerCase().replace(/\s+/g, ' ')
}

export function isGenericPhrase(text: string): boolean {
  return GENERIC_PHRASE_PATTERNS.some((re) => re.test(text.trim()))
}

function isGenericDescription(text: string): boolean {
  return GENERIC_DESCRIPTION_PATTERNS.some((re) => re.test(text.trim()))
}

/**
 * A single word repeated past a threshold (absolute for short strings,
 * proportional for long ones) reads as keyword stuffing. Used identically
 * for titles, H1s, descriptions, and combined heading text.
 */
export function detectKeywordStuffing(text: string, repeatThreshold = KEYWORD_STUFFING_REPEAT_THRESHOLD): boolean {
  const words = text.toLowerCase().match(/[a-z0-9]+/g) ?? []
  const significant = words.filter((w) => w.length >= 4 && !STUFFING_STOPWORDS.has(w))
  if (significant.length === 0) return false
  const counts = new Map<string, number>()
  for (const w of significant) counts.set(w, (counts.get(w) ?? 0) + 1)
  const max = Math.max(...counts.values())
  return max >= repeatThreshold || max / significant.length > KEYWORD_STUFFING_PROPORTION_THRESHOLD
}

function pickHighestSeverity(severities: Severity[]): Severity {
  if (severities.length === 0) return 'pass'
  return severities.reduce((best, s) => (SEVERITY_RANK[s] > SEVERITY_RANK[best] ? s : best))
}

/** Groups pages by the normalized value of `selector(page)` — the basis for exact cross-page duplicate detection (title/description/H1). */
function buildDuplicateGroups(pages: PageAnalysis[], selector: (p: PageAnalysis) => string | null): Map<string, string[]> {
  const groups = new Map<string, string[]>()
  for (const p of pages) {
    const raw = selector(p)
    if (!raw || !raw.trim()) continue
    const key = normalizeForDuplicateCheck(raw)
    const list = groups.get(key) ?? []
    list.push(p.url)
    groups.set(key, list)
  }
  return groups
}

function firstH1Text(page: PageAnalysis): string | null {
  const text = page.headingHierarchy.find((h) => h.level === 1 && h.text.length > 0)?.text
  return text ?? null
}

// ---------------------------------------------------------------------------
// Page importance — reuses the P0 "don't build a complex scoring engine"
// posture: the homepage and any page with a validated (P0) keyword mapping
// are "high" importance; everything else is "medium". No separate scoring
// model.
// ---------------------------------------------------------------------------
export function derivePageImportance(
  pageUrl: string,
  homepageUrl: string | null,
  keywordMappings: KeywordPageMapping[],
): PageImportance {
  if (homepageUrl && pageUrl === homepageUrl) return 'high'
  const hasValidatedMapping = keywordMappings.some((m) => m.status === 'mapped' && m.mappedUrl === pageUrl)
  return hasValidatedMapping ? 'high' : 'medium'
}

// ---------------------------------------------------------------------------
// Target keyword connection — ONLY from the P0 validated keyword→page
// mapping. A page with no validated mapping (or whose keyword mapping
// status is "no_suitable_page") never gets a keyword invented for it.
// ---------------------------------------------------------------------------
export function findTargetKeywordForPage(pageUrl: string, keywordMappings: KeywordPageMapping[]): string | null {
  const mapping = keywordMappings.find((m) => m.status === 'mapped' && m.mappedUrl === pageUrl)
  return mapping ? mapping.keyword : null
}

/** null = no keyword to check against; true/false = whether a meaningful majority of the keyword's words appear in the text. Not exact-phrase matching, so word order/minor phrasing differences don't count against the page. */
export function containsKeyword(text: string | null, keyword: string | null): boolean | null {
  if (!keyword) return null
  if (!text || !text.trim()) return false
  const normalizedText = text.toLowerCase()
  const tokens = keyword.toLowerCase().split(/\s+/).filter(Boolean)
  if (tokens.length === 0) return false
  const hits = tokens.filter((t) => normalizedText.includes(t)).length
  return hits / tokens.length >= 0.6
}

export interface OnPageEvalContext {
  keywordMappings: KeywordPageMapping[]
  importanceByUrl: Map<string, PageImportance>
}

// ---------------------------------------------------------------------------
// 1. META TITLE
// ---------------------------------------------------------------------------
function checkTitleLengthBand(len: number): { status: OnPageStatus; issue: string | null } {
  if (len < TITLE_LENGTH.veryShort) return { status: 'poor', issue: `Title is very short (${len} characters).` }
  if (len < TITLE_LENGTH.short) return { status: 'needs_improvement', issue: `Title is on the short side (${len} characters).` }
  if (len <= TITLE_LENGTH.healthyMax) return { status: 'good', issue: null }
  if (len <= TITLE_LENGTH.long)
    return { status: 'needs_improvement', issue: `Title is on the long side (${len} characters) and may be truncated in search results.` }
  return { status: 'poor', issue: `Title is very long (${len} characters) and will likely be truncated in search results.` }
}

export function evaluateMetaTitle(
  page: PageAnalysis,
  ctx: OnPageEvalContext,
  duplicateGroups: Map<string, string[]>,
  targetKeyword: string | null,
): MetaTitleAudit {
  const issues: string[] = []
  const severities: Severity[] = []
  const title = page.title
  const characterCount = title?.length ?? 0
  const targetKeywordPresent = containsKeyword(title, targetKeyword)

  const dupKey = title ? normalizeForDuplicateCheck(title) : null
  const duplicateWith = (dupKey ? duplicateGroups.get(dupKey) ?? [] : []).filter((u) => u !== page.url)
  const isDuplicate = duplicateWith.length > 0

  let status: OnPageStatus

  if (!title || !title.trim()) {
    status = 'poor'
    severities.push('high')
    issues.push(title === null ? 'Missing <title> tag.' : 'Title tag is present but empty.')
  } else {
    const lengthCheck = checkTitleLengthBand(characterCount)
    status = lengthCheck.status
    if (lengthCheck.issue) {
      issues.push(lengthCheck.issue)
      severities.push('medium')
    }

    if (isGenericPhrase(title)) {
      issues.push('Title is generic and does not describe this specific page.')
      severities.push('medium')
      status = status === 'good' ? 'needs_improvement' : status
    }

    if (detectKeywordStuffing(title)) {
      issues.push('Title repeats the same word(s) excessively (keyword stuffing).')
      severities.push('medium')
      status = 'poor'
    }

    if (targetKeywordPresent === false) {
      issues.push(`Target keyword "${targetKeyword}" is not clearly represented in the title.`)
      severities.push('medium')
      status = status === 'good' ? 'needs_improvement' : status
    }

    if (isDuplicate) {
      const importantDuplicate =
        ctx.importanceByUrl.get(page.url) === 'high' || duplicateWith.some((u) => ctx.importanceByUrl.get(u) === 'high')
      issues.push(
        `Identical title used on ${duplicateWith.length} other page${duplicateWith.length === 1 ? '' : 's'}: ${duplicateWith.join(', ')}.`,
      )
      severities.push(importantDuplicate ? 'high' : 'medium')
      status = 'needs_improvement'
    }
  }

  if (issues.length === 0) severities.push('pass')

  return {
    currentValue: title,
    characterCount,
    status,
    severity: pickHighestSeverity(severities),
    issues,
    isDuplicate,
    duplicateWith,
    targetKeywordPresent,
    suggestedValue: null,
  }
}

// ---------------------------------------------------------------------------
// 2. META DESCRIPTION
// ---------------------------------------------------------------------------
function checkDescriptionLengthBand(len: number): { status: OnPageStatus; issue: string | null; isVeryShort: boolean } {
  if (len < DESCRIPTION_LENGTH.veryShort)
    return { status: 'needs_improvement', issue: `Description is very short (${len} characters).`, isVeryShort: true }
  if (len < DESCRIPTION_LENGTH.short)
    return { status: 'needs_improvement', issue: `Description is on the short side (${len} characters).`, isVeryShort: false }
  if (len <= DESCRIPTION_LENGTH.healthyMax) return { status: 'good', issue: null, isVeryShort: false }
  return {
    status: 'needs_improvement',
    issue: `Description is long (${len} characters) and may be truncated in search results.`,
    isVeryShort: false,
  }
}

export function evaluateMetaDescription(
  page: PageAnalysis,
  ctx: OnPageEvalContext,
  duplicateGroups: Map<string, string[]>,
  targetKeyword: string | null,
): MetaDescriptionAudit {
  const issues: string[] = []
  const severities: Severity[] = []
  const description = page.metaDescription
  const characterCount = description?.length ?? 0
  const targetKeywordPresent = containsKeyword(description, targetKeyword)
  const importance = ctx.importanceByUrl.get(page.url) ?? 'medium'

  const dupKey = description ? normalizeForDuplicateCheck(description) : null
  const duplicateWith = (dupKey ? duplicateGroups.get(dupKey) ?? [] : []).filter((u) => u !== page.url)
  const isDuplicate = duplicateWith.length > 0

  let status: OnPageStatus

  if (!description || !description.trim()) {
    status = 'poor'
    severities.push(importance === 'high' ? 'high' : 'medium')
    issues.push(description === null ? 'Missing meta description.' : 'Meta description tag is present but empty.')
  } else {
    const lengthCheck = checkDescriptionLengthBand(characterCount)
    status = lengthCheck.status
    if (lengthCheck.issue) {
      issues.push(lengthCheck.issue)
      severities.push(lengthCheck.isVeryShort ? 'medium' : 'low')
    }

    if (isGenericDescription(description)) {
      issues.push('Description is generic boilerplate rather than describing this specific page.')
      severities.push('medium')
      status = 'needs_improvement'
    }

    if (detectKeywordStuffing(description)) {
      issues.push('Description repeats the same word(s) excessively (keyword stuffing).')
      severities.push('medium')
      status = 'needs_improvement'
    }

    if (targetKeywordPresent === false) {
      issues.push(`Target keyword "${targetKeyword}" is not represented in the description.`)
      severities.push('low')
      status = status === 'good' ? 'needs_improvement' : status
    }

    if (isDuplicate) {
      const importantDuplicate = importance === 'high' || duplicateWith.some((u) => ctx.importanceByUrl.get(u) === 'high')
      issues.push(`Identical meta description used on ${duplicateWith.length} other page(s): ${duplicateWith.join(', ')}.`)
      severities.push(importantDuplicate ? 'high' : 'medium')
      status = 'needs_improvement'
    }
  }

  if (issues.length === 0) severities.push('pass')

  return {
    currentValue: description,
    characterCount,
    status,
    severity: pickHighestSeverity(severities),
    issues,
    isDuplicate,
    duplicateWith,
    targetKeywordPresent,
    suggestedValue: null,
  }
}

// ---------------------------------------------------------------------------
// 3. H1
// ---------------------------------------------------------------------------
export function evaluateH1(
  page: PageAnalysis,
  ctx: OnPageEvalContext,
  duplicateGroups: Map<string, string[]>,
  targetKeyword: string | null,
): H1Audit {
  const issues: string[] = []
  const severities: Severity[] = []
  const h1Elements = page.headingHierarchy.filter((h) => h.level === 1)
  const values = h1Elements.map((h) => h.text).filter((t) => t.length > 0)
  const emptyCount = h1Elements.length - values.length
  const mainH1 = values[0] ?? null
  const targetKeywordPresent = containsKeyword(mainH1, targetKeyword)

  const dupKey = mainH1 ? normalizeForDuplicateCheck(mainH1) : null
  const duplicateWith = (dupKey ? duplicateGroups.get(dupKey) ?? [] : []).filter((u) => u !== page.url)
  const isDuplicateAcrossPages = duplicateWith.length > 0

  let status: OnPageStatus = 'good'

  if (h1Elements.length === 0) {
    status = 'poor'
    severities.push('high')
    issues.push('No H1 tag found on this page.')
  } else if (values.length === 0) {
    status = 'poor'
    severities.push('high')
    issues.push('An H1 tag exists but contains no text.')
  } else {
    if (emptyCount > 0) {
      issues.push(`${emptyCount} additional empty H1 tag(s) found.`)
      severities.push('medium')
      status = 'needs_improvement'
    }

    // Multiple H1s are a "review" signal, not automatically critical — some
    // HTML5 sectioning patterns legitimately use more than one.
    if (values.length > 1) {
      issues.push(`Multiple H1 tags found (${values.length}) — review whether this is intentional.`)
      severities.push('medium')
      status = status === 'good' ? 'needs_improvement' : status
    }

    if (mainH1 && isGenericPhrase(mainH1)) {
      issues.push('H1 is generic and does not clearly describe this page.')
      severities.push('medium')
      status = 'needs_improvement'
    }

    if (mainH1 && detectKeywordStuffing(mainH1)) {
      issues.push('H1 repeats the same word(s) excessively (keyword stuffing).')
      severities.push('medium')
      status = 'needs_improvement'
    }

    if (targetKeywordPresent === false) {
      issues.push(`Target keyword "${targetKeyword}" is not clearly represented in the H1.`)
      severities.push('medium')
      status = status === 'good' ? 'needs_improvement' : status
    }

    if (isDuplicateAcrossPages) {
      issues.push(`Identical H1 used on ${duplicateWith.length} other page(s): ${duplicateWith.join(', ')}.`)
      severities.push('medium')
      status = status === 'good' ? 'needs_improvement' : status
    }
  }

  if (issues.length === 0) severities.push('pass')

  return {
    values,
    count: values.length,
    status,
    severity: pickHighestSeverity(severities),
    issues,
    isDuplicateAcrossPages,
    duplicateWith,
    targetKeywordPresent,
    suggestedValue: null,
  }
}

// ---------------------------------------------------------------------------
// 4. H2/H3 HEADING STRUCTURE
// ---------------------------------------------------------------------------
function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max)}…` : text
}

/**
 * A "skip" is a heading level jump of 2+ (e.g. H2 -> H4). A jump of exactly
 * 2 is a minor/low-severity issue; 3+ (e.g. H1 -> H4) is treated as a major
 * hierarchy problem. The very first heading on the page is never flagged —
 * a page's opening heading not being H1 is already covered by evaluateH1.
 */
function checkHierarchySkips(hierarchy: HeadingNode[]): { issue: string; severity: Severity }[] {
  const results: { issue: string; severity: Severity }[] = []
  for (let i = 1; i < hierarchy.length; i++) {
    const prev = hierarchy[i - 1]
    const curr = hierarchy[i]
    const diff = curr.level - prev.level
    if (diff >= 2) {
      results.push({
        issue: `Heading level skips from H${prev.level} to H${curr.level} near "${truncate(curr.text || '(empty)', 60)}".`,
        severity: diff >= 3 ? 'medium' : 'low',
      })
    }
  }
  return results
}

export function evaluateHeadingStructure(page: PageAnalysis): HeadingStructureAudit {
  const issues: string[] = []
  const severities: Severity[] = []
  const hierarchy = page.headingHierarchy
  const h2Nodes = hierarchy.filter((h) => h.level === 2)
  const h3Nodes = hierarchy.filter((h) => h.level === 3)
  const totalH2 = h2Nodes.length
  const totalH3 = h3Nodes.length

  let status: OnPageStatus = 'good'

  if (totalH2 === 0 && page.wordCount >= SUBSTANTIAL_CONTENT_WORD_COUNT) {
    issues.push('No H2 headings found despite substantial page content — content may be poorly organized for readers and search engines.')
    severities.push('medium')
    status = 'needs_improvement'
  }

  const emptyH2H3 = [...h2Nodes, ...h3Nodes].filter((h) => h.text.length === 0).length
  if (emptyH2H3 > 0) {
    issues.push(`${emptyH2H3} empty H2/H3 heading(s) found.`)
    severities.push('medium')
    status = 'needs_improvement'
  }

  const h2TextCounts = new Map<string, number>()
  for (const h of h2Nodes) {
    if (!h.text) continue
    const key = normalizeForDuplicateCheck(h.text)
    h2TextCounts.set(key, (h2TextCounts.get(key) ?? 0) + 1)
  }
  const repeatedH2 = Array.from(h2TextCounts.entries()).filter(([, count]) => count > 1)
  if (repeatedH2.length > 0) {
    issues.push(`Repeated H2 text found on this page: ${repeatedH2.map(([textKey]) => `"${textKey}"`).join(', ')}.`)
    severities.push('low')
    status = status === 'good' ? 'needs_improvement' : status
  }

  if (hierarchy.length > EXCESSIVE_HEADING_COUNT) {
    issues.push(`Very high number of headings on this page (${hierarchy.length}) — consider simplifying page structure.`)
    severities.push('low')
    status = status === 'good' ? 'needs_improvement' : status
  }

  const longHeadings = hierarchy.filter((h) => h.level >= 2 && h.text.length > LONG_HEADING_LENGTH)
  if (longHeadings.length > 0) {
    issues.push(`${longHeadings.length} heading(s) are unusually long (over ${LONG_HEADING_LENGTH} characters) — headings should be concise.`)
    severities.push('low')
    status = status === 'good' ? 'needs_improvement' : status
  }

  const combinedHeadingText = hierarchy.map((h) => h.text).join(' ')
  if (combinedHeadingText && detectKeywordStuffing(combinedHeadingText, KEYWORD_STUFFING_REPEAT_THRESHOLD + 2)) {
    issues.push('Headings on this page repeat the same word(s) excessively across sections (possible keyword stuffing).')
    severities.push('medium')
    status = 'needs_improvement'
  }

  for (const skip of checkHierarchySkips(hierarchy)) {
    issues.push(skip.issue)
    severities.push(skip.severity)
    status = 'needs_improvement'
  }

  if (issues.length === 0) severities.push('pass')

  return {
    totalH2,
    totalH3,
    hierarchy,
    status,
    severity: pickHighestSeverity(severities),
    issues,
  }
}

// ---------------------------------------------------------------------------
// Per-page assembly + site-wide aggregation
// ---------------------------------------------------------------------------
function buildPageName(url: string): string {
  try {
    const { pathname } = new URL(url)
    if (pathname === '/' || pathname === '') return 'Homepage'
    const slug = pathname.replace(/\/$/, '').split('/').pop() || pathname
    return slug
      .split('-')
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
  } catch {
    return url
  }
}

export function buildOnPageAudits(
  pages: PageAnalysis[],
  keywordMappings: KeywordPageMapping[],
  homepageUrl: string | null,
): PageOnPageAudit[] {
  const importanceByUrl = new Map(pages.map((p) => [p.url, derivePageImportance(p.url, homepageUrl, keywordMappings)]))
  const ctx: OnPageEvalContext = { keywordMappings, importanceByUrl }

  const titleDuplicates = buildDuplicateGroups(pages, (p) => p.title)
  const descriptionDuplicates = buildDuplicateGroups(pages, (p) => p.metaDescription)
  const h1Duplicates = buildDuplicateGroups(pages, (p) => firstH1Text(p))

  return pages.map((page) => {
    const targetKeyword = findTargetKeywordForPage(page.url, keywordMappings)
    return {
      url: page.url,
      pageName: buildPageName(page.url),
      importance: importanceByUrl.get(page.url) ?? 'medium',
      targetKeyword,
      metaTitle: evaluateMetaTitle(page, ctx, titleDuplicates, targetKeyword),
      metaDescription: evaluateMetaDescription(page, ctx, descriptionDuplicates, targetKeyword),
      h1: evaluateH1(page, ctx, h1Duplicates, targetKeyword),
      headings: evaluateHeadingStructure(page),
    }
  })
}

function emptyCategorySummary(): OnPageIssueCategorySummary {
  return { total: 0, critical: 0, high: 0, medium: 0, low: 0, affectedPages: [] }
}

function addToSummary(summary: OnPageIssueCategorySummary, severity: Severity, url: string): void {
  if (severity === 'pass' || severity === 'not_evaluated' || severity === 'info') return
  summary.total += 1
  if (severity === 'critical') summary.critical += 1
  else if (severity === 'high') summary.high += 1
  else if (severity === 'medium') summary.medium += 1
  else if (severity === 'low') summary.low += 1
  if (!summary.affectedPages.includes(url)) summary.affectedPages.push(url)
}

/** Site-wide issue counts + affected URLs per category, for future report phases (e.g. an on-page overview dashboard — not built in this phase). */
export function aggregateOnPageIssues(audits: PageOnPageAudit[]): OnPageSummary {
  const summary: OnPageSummary = {
    titleIssues: emptyCategorySummary(),
    metaDescriptionIssues: emptyCategorySummary(),
    h1Issues: emptyCategorySummary(),
    headingStructureIssues: emptyCategorySummary(),
  }
  for (const audit of audits) {
    if (audit.metaTitle.issues.length > 0) addToSummary(summary.titleIssues, audit.metaTitle.severity, audit.url)
    if (audit.metaDescription.issues.length > 0) addToSummary(summary.metaDescriptionIssues, audit.metaDescription.severity, audit.url)
    if (audit.h1.issues.length > 0) addToSummary(summary.h1Issues, audit.h1.severity, audit.url)
    if (audit.headings.issues.length > 0) addToSummary(summary.headingStructureIssues, audit.headings.severity, audit.url)
  }
  return summary
}
