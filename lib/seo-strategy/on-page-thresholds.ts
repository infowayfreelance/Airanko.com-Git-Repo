// ──────────────────────────────────────────────────────────────────────────
// Configurable thresholds for the on-page audit (Phase 2A). Centralized here
// so nothing in on-page-audit.ts / on-page-suggestions.ts hard-codes a magic
// number — tune the site-wide behavior by editing this file only.
//
// These are guidance bands, not hard pass/fail cutoffs: quality (is it
// descriptive, unique, keyword-relevant?) always matters more than raw
// character count. Pixel-width calculation is intentionally out of scope
// for this phase.
// ──────────────────────────────────────────────────────────────────────────

/** Character-count bands for <title>. */
export const TITLE_LENGTH = {
  /** Below this: flagged as very short. */
  veryShort: 20,
  /** Below this (and >= veryShort): flagged as on the short side. */
  short: 30,
  /** Up to this: the healthy range. */
  healthyMax: 60,
  /** Up to this (and > healthyMax): flagged as on the long side. */
  long: 70,
  // Above `long` is flagged as very long.
} as const

/** Character-count bands for the meta description. */
export const DESCRIPTION_LENGTH = {
  veryShort: 70,
  short: 120,
  healthyMax: 165,
} as const

/** A single word repeated at least this many times in a short string (title/H1) reads as keyword stuffing. */
export const KEYWORD_STUFFING_REPEAT_THRESHOLD = 3

/** For longer strings (descriptions, combined heading text), stuffing is judged proportionally instead — a repeated word making up more than this fraction of all significant words. */
export const KEYWORD_STUFFING_PROPORTION_THRESHOLD = 0.35

/** Common filler words excluded from stuffing detection so normal phrasing ("in", "and", "for") never trips it. */
export const STUFFING_STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'from', 'that', 'this', 'your', 'our', 'you', 'are', 'was',
  'were', 'have', 'has', 'been', 'will', 'can', 'all', 'more', 'about', 'into',
])

/** Boilerplate phrases that indicate a title/H1/description isn't describing this specific page. */
export const GENERIC_PHRASE_PATTERNS: RegExp[] = [
  /^home$/i,
  /^homepage$/i,
  /^welcome( to)?/i,
  /^untitled/i,
  /^new page$/i,
  /^document$/i,
  /^index of/i,
  /^page \d+$/i,
]

export const GENERIC_DESCRIPTION_PATTERNS: RegExp[] = [
  /^welcome to our website/i,
  /^this is (the |a |our )?(home ?page|website)/i,
  /^lorem ipsum/i,
  /^enter (a |your )?description/i,
]

/** Heading count above which a single page is considered to have an excessive number of headings. */
export const EXCESSIVE_HEADING_COUNT = 40

/** Individual heading text longer than this (H2+) is considered too long to be a useful heading. */
export const LONG_HEADING_LENGTH = 100

/** Word-count threshold above which a page is considered to have "substantial content" that should be organized with H2s. */
export const SUBSTANTIAL_CONTENT_WORD_COUNT = 300

/** URL path segments that mark a page as informational/non-transactional — location intent should not be forced into titles/descriptions/H1s for these. */
export const INFORMATIONAL_PATH_PATTERNS: RegExp[] = [
  /\/blog\//i,
  /\/about/i,
  /\/contact/i,
  /\/privacy/i,
  /\/terms/i,
  /\/faq/i,
  /\/careers?/i,
  /\/sitemap/i,
  /\/cookie/i,
]
