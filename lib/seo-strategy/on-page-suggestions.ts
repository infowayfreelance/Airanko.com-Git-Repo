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

export function generateTitleSuggestion(page: PageAnalysis, pageName: string, targetKeyword: string | null, options: SuggestionOptions): string {
  const topic = targetKeyword ? toTitleCase(dedupeRepeatedWords(targetKeyword)) : pageName
  const includeLocation = shouldIncludeLocation(page, topic, options)
  const core = includeLocation ? `${topic} ${options.location}` : topic
  const withBrand = options.businessName ? `${core} | ${options.businessName}` : core
  const candidate = truncateToBand(withBrand, TITLE_LENGTH.healthyMax + 5)

  if (assessCandidateTitle(candidate)) return candidate

  const brandOnly = options.businessName ? `${core} | ${options.businessName}`.length <= TITLE_LENGTH.long ? `${core} | ${options.businessName}` : core : core
  if (assessCandidateTitle(brandOnly)) return brandOnly

  // Last resort: the bare topic, hard-truncated into the healthy band.
  return truncateToBand(topic, TITLE_LENGTH.healthyMax)
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
  const candidate = truncateToBand(
    `Learn more about ${topic}${locationPhrase}${brandPhrase} and get in touch today.`,
    DESCRIPTION_LENGTH.healthyMax,
  )

  if (assessCandidateDescription(candidate)) return candidate

  const fallback = `Find out more about ${topic}${locationPhrase}.`
  if (assessCandidateDescription(fallback)) return fallback

  const lastResort = truncateToBand(`Information about ${topic}.`, DESCRIPTION_LENGTH.healthyMax)
  return assessCandidateDescription(lastResort) ? lastResort : `Information about ${pageName.toLowerCase()}.`
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
    const needsH1Suggestion = audit.h1.status !== 'good' && audit.h1.status !== 'not_evaluated'

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
