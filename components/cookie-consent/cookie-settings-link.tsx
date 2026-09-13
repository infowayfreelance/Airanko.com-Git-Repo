'use client'

import { useCookieConsent } from './cookie-consent-provider'

/**
 * Footer trigger that reopens the cookie preferences dialog, letting a
 * returning visitor change or withdraw consent at any time. Styled as a
 * plain `<button>` so callers can pass the exact same className used by the
 * sibling footer `<Link>`s for a visually identical fit.
 */
export function CookieSettingsLink({ className }: { className?: string }) {
  const { openPreferences } = useCookieConsent()
  return (
    <button type="button" onClick={openPreferences} className={className}>
      Cookie Settings
    </button>
  )
}
