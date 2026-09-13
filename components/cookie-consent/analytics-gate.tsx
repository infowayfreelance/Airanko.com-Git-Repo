'use client'

import { Analytics } from '@vercel/analytics/next'
import { useCookieConsent } from './cookie-consent-provider'

/**
 * Mounts Vercel Analytics only once the visitor has actually consented to
 * analytics cookies. Previously this ran unconditionally in production —
 * this is the one real tracking mechanism on the site (see the cookie
 * consent audit), so it's the one thing that needs to be consent-gated.
 */
export function AnalyticsGate() {
  const { consent } = useCookieConsent()
  if (!consent.analytics) return null
  return <Analytics />
}
