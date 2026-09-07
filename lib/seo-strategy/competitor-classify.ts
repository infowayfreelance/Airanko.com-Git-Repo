// ──────────────────────────────────────────────────────────────────────────
// Phase 6 — deterministic competitor page-type classification. Same
// heuristic posture as page-type.ts's derivePageType() (URL path + a
// little crawled content, not a content-classification model), but for
// competitor pages we don't have a validated P0 keyword mapping to lean
// on, so this also looks at title/H1 text and stores a confidence level
// instead of forcing a guess when the signal is weak.
// ──────────────────────────────────────────────────────────────────────────
import type { ConfidenceLevel } from './types'

export type CompetitorPageType = 'homepage' | 'service' | 'location' | 'blog' | 'about' | 'contact' | 'other'

export interface CompetitorPageClassification {
  type: CompetitorPageType
  confidence: ConfidenceLevel
}

const CONTACT_RE = /\/(contact|contact-us|get-in-touch)(\/|$)/i
const ABOUT_RE = /\/(about|about-us|who-we-are|our-story)(\/|$)/i
const BLOG_RE = /\/(blog|news|articles?|guides?|insights)(\/|$)/i
const LOCATION_PATH_RE = /\b(near-me|locations?|areas?-we-cover|service-area|coverage)\b/i
const SERVICE_PATH_RE = /\/(services?|what-we-do|solutions)(\/|$)/i
const CONTACT_TEXT_RE = /\bcontact us\b/i
const ABOUT_TEXT_RE = /\babout us\b/i

/** A page is a "dedicated" page for content-depth purposes (vs a thin/stub page that merely exists) once it clears this word count — reused from the same spirit as Phase 2B's thin-content bar, kept local here so Phase 6 doesn't reach into Phase 2B's page-aware thresholds (those are tuned for the TARGET site's own content strategy, not for judging an arbitrary competitor's page). */
export const DEDICATED_PAGE_MIN_WORDS = 150

export function classifyCompetitorPage(
  page: { url: string; title: string | null; h1: string[]; wordCount: number },
  isHomepage: boolean,
  targetLocation: string,
): CompetitorPageClassification {
  if (isHomepage) return { type: 'homepage', confidence: 'high' }

  let pathname = ''
  try {
    pathname = new URL(page.url).pathname
  } catch {
    pathname = page.url
  }
  const titleAndH1 = `${page.title ?? ''} ${page.h1.join(' ')}`.toLowerCase()

  if (CONTACT_RE.test(pathname) || CONTACT_TEXT_RE.test(titleAndH1)) return { type: 'contact', confidence: 'high' }
  if (ABOUT_RE.test(pathname) || ABOUT_TEXT_RE.test(titleAndH1)) return { type: 'about', confidence: 'high' }
  if (BLOG_RE.test(pathname)) return { type: 'blog', confidence: 'high' }

  const normalizedLocation = targetLocation.trim().toLowerCase()
  const locationSlug = normalizedLocation.replace(/\s+/g, '-')
  const mentionsTargetLocation =
    normalizedLocation.length > 0 && (pathname.toLowerCase().includes(locationSlug) || titleAndH1.includes(normalizedLocation))
  const hasLocationPathHint = LOCATION_PATH_RE.test(pathname)
  if (hasLocationPathHint || mentionsTargetLocation) {
    return { type: 'location', confidence: hasLocationPathHint && mentionsTargetLocation ? 'high' : 'medium' }
  }

  if (SERVICE_PATH_RE.test(pathname)) return { type: 'service', confidence: 'high' }

  // Weak signal: no path/title/H1 hint at all. Still classify (never leave
  // it unclassified), but mark low confidence rather than pretending
  // certainty — a page with substantial content reads as a probable
  // service page; a very thin one is genuinely ambiguous ("other").
  if (page.wordCount >= DEDICATED_PAGE_MIN_WORDS) return { type: 'service', confidence: 'low' }
  return { type: 'other', confidence: 'low' }
}
