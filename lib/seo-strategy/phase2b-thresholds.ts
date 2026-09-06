// ──────────────────────────────────────────────────────────────────────────
// Configurable thresholds for Phase 2B (content, images, internal linking,
// technical on-page). Same principle as on-page-thresholds.ts (Phase 2A):
// every magic number lives here, not scattered through the evaluators.
// ──────────────────────────────────────────────────────────────────────────
import type { PageType } from './types'

/**
 * Page-aware word-count guidance. These are NOT hard pass/fail cutoffs —
 * `minHealthy` is the point below which a page of this type starts to look
 * thin; `expectThin` marks page types (contact, legal, utility) that are
 * legitimately allowed to be short without a commercial-content penalty.
 */
export const WORD_COUNT_BY_PAGE_TYPE: Record<PageType, { minHealthy: number; expectThin: boolean }> = {
  homepage: { minHealthy: 300, expectThin: false },
  service: { minHealthy: 300, expectThin: false },
  location: { minHealthy: 250, expectThin: false },
  blog: { minHealthy: 500, expectThin: false },
  contact: { minHealthy: 50, expectThin: true },
  legal: { minHealthy: 100, expectThin: true },
  utility: { minHealthy: 30, expectThin: true },
}

// ── Duplicate / similar content ─────────────────────────────────────────
/** Jaccard similarity (0-1) of 5-word shingles at/above this = very high similarity (near-duplicate). */
export const SIMILARITY_VERY_HIGH = 0.9
/** At/above this (and below VERY_HIGH) = possible near-duplicate worth flagging. */
export const SIMILARITY_POSSIBLE = 0.75
/** Shingle size (in words) used for the Jaccard comparison. */
export const SHINGLE_SIZE = 5
/**
 * A shingle that appears on at least this fraction of all crawled pages
 * (for crawls with more than a handful of pages — see
 * findBoilerplateShingles) is treated as sitewide boilerplate (nav/footer/
 * CTA/NAP text that leaked into the "main content" extraction) and
 * excluded from similarity scoring, so two unrelated pages that merely
 * share a footer don't register as duplicates. Deliberately high: real
 * sitewide chrome appears on nearly every page, not just a majority —
 * a lower bar risks erasing genuinely duplicated content shared by only
 * two or three pages by mistaking it for boilerplate.
 */
export const BOILERPLATE_PAGE_FRACTION = 0.85

// ── Images ───────────────────────────────────────────────────────────────
/** File size (bytes) above which an image "needs review". */
export const IMAGE_SIZE_REVIEW_BYTES = 500 * 1024
/** File size (bytes) above which an image is a "high concern" for standard web content. */
export const IMAGE_SIZE_HIGH_CONCERN_BYTES = 1024 * 1024
/** A larger allowance for images that are plausibly full-width hero/banner images (by rendered/declared width). */
export const HERO_IMAGE_MIN_WIDTH = 1200
export const HERO_IMAGE_SIZE_HIGH_CONCERN_BYTES = 2 * 1024 * 1024

export const MODERN_IMAGE_FORMATS = new Set(['webp', 'avif'])
export const LEGACY_RASTER_FORMATS = new Set(['jpg', 'jpeg', 'png', 'gif'])

/** Generic/low-quality alt text values — exact matches after trimming/lowercasing. */
export const WEAK_ALT_VALUES = new Set([
  'image', 'photo', 'picture', 'img', 'banner', 'hero', 'graphic', 'icon', 'logo',
])
/** Alt text matching these patterns (filename-like, numbered) also reads as weak. */
export const WEAK_ALT_PATTERNS: RegExp[] = [
  /^(image|photo|picture|img)[\s_-]?\d+$/i,
  /^(img|dsc|screenshot|untitled)[\s_-]?\d*$/i,
]
export const MAX_REASONABLE_ALT_LENGTH = 150

/** Filenames that read as camera/CMS-generated rather than descriptive. */
export const WEAK_FILENAME_PATTERNS: RegExp[] = [
  /^img[\s_-]?\d+$/i,
  /^dsc\d+$/i,
  /^image\d*$/i,
  /^photo\d*$/i,
  /^untitled/i,
  /^screenshot/i,
  /^\d+$/,
]

// ── Internal linking ─────────────────────────────────────────────────────
/** An important page (per P0 page-importance) with fewer unique incoming internal links than this is "weakly linked" relative to its importance. */
export const WEAK_INCOMING_LINK_THRESHOLD_IMPORTANT = 2
export const WEAK_INCOMING_LINK_THRESHOLD_DEFAULT = 1

export const GENERIC_ANCHOR_TEXTS = new Set([
  'click here', 'here', 'read more', 'learn more', 'more', 'this page', 'link', 'this link',
])
/** A single anchor text reused this many times or more sitewide (pointing to different targets) reads as excessive exact-match repetition. */
export const EXCESSIVE_ANCHOR_REPETITION = 5

// ── URL structure ────────────────────────────────────────────────────────
export const URL_LENGTH_REVIEW = 100
export const URL_MAX_FOLDER_DEPTH = 5
export const URL_MAX_QUERY_PARAMS = 2
