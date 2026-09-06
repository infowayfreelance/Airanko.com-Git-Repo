// ──────────────────────────────────────────────────────────────────────────
// Deterministic page-type classification — drives page-aware word-count /
// thin-content / search-intent expectations elsewhere in Phase 2B. A
// contact page and a service page shouldn't be held to the same content
// bar, so every consumer of "is this page thin?" needs to know what kind of
// page it's looking at first.
//
// Purely heuristic (URL path + a little crawled content), same spirit as
// P0's page-importance derivation: good enough to stop obviously wrong
// penalties, not a content-classification model.
// ──────────────────────────────────────────────────────────────────────────
import type { PageAnalysis } from '@/app/api/seo-strategy/analyze/route'
import type { KeywordPageMapping, PageType } from './types'

const LEGAL_PATH_RE = /\/(privacy|terms|cookie|legal|disclaimer|accessibility)/i
const CONTACT_PATH_RE = /\/(contact|contact-us|get-in-touch)/i
const BLOG_PATH_RE = /\/(blog|news|articles?|guides?)(\/|$)/i
const UTILITY_PATH_RE = /\/(sitemap|search|404|thank-you|thanks|login|signup|register|cart|checkout|faq)/i
/** Location pages usually pair a service/brand word with a place name in the slug — hard to detect generically, so we lean on the P0 keyword mapping's location signal instead (see derivePageType). */
const LOCATION_HINT_RE = /\b(near-me|locations?|areas?-we-cover|service-area)\b/i

export function derivePageType(
  page: PageAnalysis,
  homepageUrl: string | null,
  keywordMappings: KeywordPageMapping[],
  location: string,
): PageType {
  if (homepageUrl && page.url === homepageUrl) return 'homepage'

  let pathname = ''
  try {
    pathname = new URL(page.url).pathname
  } catch {
    pathname = page.url
  }

  if (LEGAL_PATH_RE.test(pathname)) return 'legal'
  if (CONTACT_PATH_RE.test(pathname)) return 'contact'
  if (BLOG_PATH_RE.test(pathname)) return 'blog'
  if (UTILITY_PATH_RE.test(pathname)) return 'utility'

  // A page whose slug/title mentions the business's own location, or whose
  // validated keyword mapping carries a location word, reads as a location
  // page rather than a generic service page.
  const hasLocationMapping = keywordMappings.some(
    (m) => m.status === 'mapped' && m.mappedUrl === page.url && location && m.keyword.toLowerCase().includes(location.toLowerCase()),
  )
  if (LOCATION_HINT_RE.test(pathname) || hasLocationMapping) return 'location'

  return 'service'
}
