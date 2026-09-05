// ──────────────────────────────────────────────────────────────────────────
// Deterministic suggestion generation for the on-page audit (Phase 2A).
//
// Suggestions are template-based rather than a second AI call: this keeps
// "AI may help with suggested title/description/H1" (the spec's wording is
// permissive, not mandatory) satisfied by generating from real page data
// (topic, mapped keyword, location, business name) while making the "do not
// invent unverified claims" and "do not force location into informational
// pages" rules structurally impossible to violate, rather than relying on
// prompting alone. The existing top-level AI strategy call still produces
// its own prose suggestions for pageByPageAudit; those are cross-checked
// against these deterministic ones in the contradiction checker.
//
// Every generated candidate is re-validated with the SAME rules used to
// flag the original issue (see on-page-audit.ts) before being accepted —
// "generate, then validate, then sanitize/regenerate if it fails" per spec.
// ──────────────────────────────────────────────────────────────────────────
import type { PageAnalysis } from '@/app/api/seo-strategy/analyze/route'
import { detectKeywordStuffing, isGenericPhrase } from './on-page-audit'
import { DESCRIPTION_LENGTH, INFORMATIONAL_PATH_PATTERNS, TITLE_LENGTH } from './on-page-thresholds'
import type { PageOnPageAudit } from './types'

export interface SuggestionOptions {
  businessName: string
  location: string
  isLocalBusiness: boolean
}

function isInformationalPath(url: string): boolean {
  try {
    return INFORMATIONAL_PATH_PATTERNS.some((re) => re.test(new URL(url).pathname))
  } catch {
    return false
  }
}

function toTitleCase(s: string): string {
  return s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
}

/**
 * Sanitizes a keyword/topic BEFORE it's woven into a template: if the
 * keyword itself repeats a significant word (e.g. a messy user-provided
 * keyword like "recovery recovery recovery service"), dropping repeats past
 * the 2nd occurrence here stops that stuffing from ever reaching the
 * generated suggestion — validating only the assembled candidate isn't
 * enough, since a last-resort fallback can otherwise still return the raw,
 * stuffed topic untouched.
 */
function dedupeRepeatedWords(text: string): string {
  const words = text.split(/\s+/).filter(Boolean)
  const seenCount = new Map<string, number>()
  const out: string[] = []
  for (const w of words) {
    const key = w.toLowerCase().replace(/[^a-z0-9]/g, '')
    if (key.length >= 4) {
      const count = seenCount.get(key) ?? 0
      if (count >= 2) continue
      seenCount.set(key, count + 1)
    }
    out.push(w)
  }
  return out.join(' ')
}

function truncateToBand(s: string, maxLen: number): string {
  if (s.length <= maxLen) return s
  const truncated = s.slice(0, maxLen)
  const lastSpace = truncated.lastIndexOf(' ')
  return (lastSpace > maxLen * 0.6 ? truncated.slice(0, lastSpace) : truncated).trim()
}

/** Whether location should be woven into a suggestion for this page: only for a local business, only when a location was given, only for pages that aren't purely informational, and only when the topic doesn't already mention it. */
function shouldIncludeLocation(page: PageAnalysis, topic: string, options: SuggestionOptions): boolean {
  if (!options.isLocalBusiness || !options.location.trim()) return false
  if (isInformationalPath(page.url)) return false
  return !topic.toLowerCase().includes(options.location.toLowerCase())
}

// ---------------------------------------------------------------------------
// Title
// ---------------------------------------------------------------------------
function assessCandidateTitle(candidate: string): boolean {
  const len = candidate.length
  if (len < TITLE_LENGTH.veryShort || len > TITLE_LENGTH.long) return false
  if (isGenericPhrase(candidate)) return false
  if (detectKeywordStuffing(candidate)) return false
  return true
}

/**
 * Every candidate — including the last resort — is validated with the same
 * rules used to flag the original issue; a fallback that isn't checked can
 * itself land below the minimum length or read as generic (e.g. a bare
 * "Homepage"), handing back a "suggestion" that fails the very audit it's
 * meant to fix. If nothing validates (topic/business name too short to
 * pad), the longest attempt is returned as a best-effort rather than
 * silently accepting an invalid one.
 */
export function generateTitleSuggestion(page: PageAnalysis, pageName: string, targetKeyword: string | null, options: SuggestionOptions): string {
  const topic = targetKeyword ? toTitleCase(dedupeRepeatedWords(targetKeyword)) : pageName
  const includeLocation = shouldIncludeLocation(page, topic, options)
  const core = includeLocation ? `${topic} ${options.location}` : topic
  const withBrand = options.businessName ? `${core} | ${options.businessName}` : core

  const candidates = [
    truncateToBand(withBrand, TITLE_LENGTH.healthyMax + 5),
    core,
    `${topic} — Learn More`,
    `${topic} — Learn More About This Page`,
  ].map((c) => truncateToBand(c, TITLE_LENGTH.long))

  for (const c of candidates) {
    if (assessCandidateTitle(c)) return c
  }
  return candidates.reduce((longest, c) => (c.length > longest.length ? c : longest))
}

// ---------------------------------------------------------------------------
// Meta description
// ---------------------------------------------------------------------------
function assessCandidateDescription(candidate: string): boolean {
  const len = candidate.length
  if (len < DESCRIPTION_LENGTH.veryShort) return false
  if (detectKeywordStuffing(candidate)) return false
  return true
}

export function generateDescriptionSuggestion(
  page: PageAnalysis,
  pageName: string,
  targetKeyword: string | null,
  options: SuggestionOptions,
): string {
  const topic = targetKeyword ? dedupeRepeatedWords(targetKeyword) : pageName.toLowerCase()
  const includeLocation = shouldIncludeLocation(page, topic, options)
  const locationPhrase = includeLocation ? ` in ${options.location}` : ''
  const brandPhrase = options.businessName ? ` from ${options.businessName}` : ''

  // Every candidate is validated in order, including the last resort — an
  // unvalidated short fallback (e.g. "Information about home.") can itself
  // land under the minimum length the same audit flags as "very short".
  const candidates = [
    `Learn more about ${topic}${locationPhrase}${brandPhrase} and get in touch today.`,
    `Find out more about ${topic}${locationPhrase} and get in touch with our team today.`,
    `${toTitleCase(topic)}${locationPhrase} — get in touch with our team today to find out more about how we can help.`,
  ].map((c) => truncateToBand(c, DESCRIPTION_LENGTH.healthyMax))

  for (const c of candidates) {
    if (assessCandidateDescription(c)) return c
  }
  return candidates.reduce((longest, c) => (c.length > longest.length ? c : longest))
}

// ---------------------------------------------------------------------------
// H1
// ---------------------------------------------------------------------------
function assessCandidateH1(candidate: string): boolean {
  if (!candidate.trim()) return false
  if (isGenericPhrase(candidate)) return false
  if (detectKeywordStuffing(candidate)) return false
  return true
}

export function generateH1Suggestion(page: PageAnalysis, pageName: string, targetKeyword: string | null, options: SuggestionOptions): string {
  const topic = targetKeyword ? toTitleCase(dedupeRepeatedWords(targetKeyword)) : pageName
  const includeLocation = shouldIncludeLocation(page, topic, options)
  const candidate = includeLocation ? `${topic} in ${options.location}` : topic

  if (assessCandidateH1(candidate)) return candidate
  if (assessCandidateH1(topic)) return topic
  return pageName
}

/**
 * H1 issue text that means the H1's *wording* needs to change. Deliberately
 * excludes purely structural findings (multiple H1 tags present, extra
 * empty H1 tags) — rewriting the main H1's text doesn't fix "there are too
 * many H1 elements"; that needs tags removed/demoted, not new copy. A
 * missing/empty H1 (status "poor") always needs new text regardless, since
 * there's nothing to keep.
 */
const H1_TEXT_QUALITY_ISSUE_RE = /generic|keyword stuffing|target keyword|identical h1 used/i

function h1NeedsTextSuggestion(h1: PageOnPageAudit['h1']): boolean {
  if (h1.status === 'poor') return true
  if (h1.status !== 'needs_improvement') return false
  return h1.issues.some((i) => H1_TEXT_QUALITY_ISSUE_RE.test(i))
}

// ---------------------------------------------------------------------------
// Attach suggestions to already-built audits (kept as a separate pass from
// buildOnPageAudits() in on-page-audit.ts to avoid a circular import — this
// module depends on that one, never the other way around). Only pages whose
// audit status isn't already "good"/"pass" get a suggestion, per "don't
// show a suggestion if the existing value is already good".
// ---------------------------------------------------------------------------
export function attachOnPageSuggestions(
  audits: PageOnPageAudit[],
  pagesByUrl: Map<string, PageAnalysis>,
  options: SuggestionOptions,
): PageOnPageAudit[] {
  return audits.map((audit) => {
    const page = pagesByUrl.get(audit.url)
    if (!page) return audit

    const needsTitleSuggestion = audit.metaTitle.status !== 'good' && audit.metaTitle.status !== 'not_evaluated'
    const needsDescriptionSuggestion = audit.metaDescription.status !== 'good' && audit.metaDescription.status !== 'not_evaluated'
    const needsH1Suggestion = h1NeedsTextSuggestion(audit.h1)

    return {
      ...audit,
      metaTitle: needsTitleSuggestion
        ? { ...audit.metaTitle, suggestedValue: generateTitleSuggestion(page, audit.pageName, audit.targetKeyword, options) }
        : audit.metaTitle,
      metaDescription: needsDescriptionSuggestion
        ? {
            ...audit.metaDescription,
            suggestedValue: generateDescriptionSuggestion(page, audit.pageName, audit.targetKeyword, options),
          }
        : audit.metaDescription,
      h1: needsH1Suggestion
        ? { ...audit.h1, suggestedValue: generateH1Suggestion(page, audit.pageName, audit.targetKeyword, options) }
        : audit.h1,
    }
  })
}
