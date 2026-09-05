// ──────────────────────────────────────────────────────────────────────────
// Deterministic local-business handling.
//
// The user's explicit "Local Business" toggle is the single source of truth
// for whether this is a local business — the AI must never infer or
// override it. This module only decides whether we have *enough crawled
// contact data* to actually score local SEO; it never decides whether the
// business itself is local.
// ──────────────────────────────────────────────────────────────────────────
import type { SiteAnalysis } from '@/app/api/seo-strategy/analyze/route'
import type { LocalDataSufficiency } from './types'

export interface LocalBusinessContext {
  /** Deterministic, user-input-derived — pass this through the whole pipeline. */
  isLocalBusiness: boolean
  dataSufficiency: LocalDataSufficiency
  reason: string
}

export function resolveLocalBusinessContext(
  isLocal: boolean,
  analysis: SiteAnalysis | null,
): LocalBusinessContext {
  if (!isLocal) {
    return {
      isLocalBusiness: false,
      dataSufficiency: 'not_applicable',
      reason: 'Not marked as a local business — local SEO scoring does not apply.',
    }
  }

  // NAP = Name/Address/Phone. An email address alone isn't NAP evidence —
  // it doesn't establish a physical presence or a contactable local phone
  // number, so it must not be enough to mark local data as "evaluated".
  const hasNapSignal =
    !!analysis && (analysis.contactInfo.phones.length > 0 || analysis.contactInfo.addresses.length > 0)

  return {
    isLocalBusiness: true,
    dataSufficiency: hasNapSignal ? 'evaluated' : 'not_evaluated',
    reason: hasNapSignal
      ? 'A phone number or address was found on the crawled pages.'
      : "No phone number or address was found on the crawled pages (an email alone isn't sufficient NAP evidence), so the local score can't be fully evaluated. This is still treated as a local business per the user's selection.",
  }
}
