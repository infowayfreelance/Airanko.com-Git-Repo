// Cookie consent storage — plain localStorage, not a cookie itself. Storing
// the visitor's own consent choice is considered strictly-necessary under
// GDPR/ePrivacy (it's what lets us honor "reject optional" at all), so it
// doesn't need its own opt-out.
//
// Categories are intentionally limited to what this site actually does:
// Essential (always on, nothing to gate) and Analytics (Vercel Analytics,
// see components/cookie-consent/analytics-gate.tsx). There is no marketing/
// advertising tracking and no functional-cookie usage beyond consent storage
// itself — do not add categories here without first confirming a real
// script/cookie exists to gate.

export type CookieConsent = {
  analytics: boolean
}

type StoredConsent = CookieConsent & {
  version: number
  timestamp: number
}

export const COOKIE_CONSENT_STORAGE_KEY = 'ai-ranko-cookie-consent'
const COOKIE_CONSENT_VERSION = 1
// Matches the "12 months" duration already published in the Cookie Policy —
// after this, the stored choice is treated as expired and the banner
// reappears.
const CONSENT_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000

export const DEFAULT_CONSENT: CookieConsent = {
  analytics: false,
}

function isValidStoredConsent(value: unknown): value is StoredConsent {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return (
    v.version === COOKIE_CONSENT_VERSION &&
    typeof v.timestamp === 'number' &&
    Date.now() - v.timestamp <= CONSENT_MAX_AGE_MS &&
    typeof v.analytics === 'boolean'
  )
}

/** Returns the visitor's stored consent, or null if none/expired/invalid — meaning the banner should show. */
export function readStoredConsent(): CookieConsent | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!isValidStoredConsent(parsed)) return null
    return { analytics: parsed.analytics }
  } catch {
    return null
  }
}

/** Persists consent. Silently no-ops if storage is unavailable (private browsing, disabled storage) — the banner will simply reappear next visit. */
export function writeStoredConsent(consent: CookieConsent): void {
  if (typeof window === 'undefined') return
  const stored: StoredConsent = { ...consent, version: COOKIE_CONSENT_VERSION, timestamp: Date.now() }
  try {
    window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(stored))
  } catch {
    // Ignored — see doc comment above.
  }
}
