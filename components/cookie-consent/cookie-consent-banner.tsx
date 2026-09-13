'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useCookieConsent } from './cookie-consent-provider'

export function CookieConsentBanner() {
  const { showBanner, acceptAll, rejectOptional, openPreferences } = useCookieConsent()

  if (!showBanner) return null

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      aria-live="polite"
      className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-3 print:hidden sm:px-6 sm:pb-6"
    >
      <div className="w-full max-w-2xl rounded-t-2xl border border-border bg-card/95 p-5 shadow-2xl backdrop-blur-md sm:rounded-2xl sm:p-6">
        <h2 className="font-heading text-base font-semibold text-foreground sm:text-lg">
          We value your privacy
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          We use essential cookies to keep Ai Ranko working properly. With your permission, we may
          also use analytics cookies to understand how the site is used and improve our tools. You
          can accept all, reject optional cookies, or manage your choices.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Read our{' '}
          <Link href="/cookie-policy" className="text-primary hover:underline">
            Cookie Policy
          </Link>{' '}
          and{' '}
          <Link href="/privacy-policy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button onClick={acceptAll} className="sm:order-3">
            Accept All
          </Button>
          <Button variant="outline" onClick={rejectOptional} className="sm:order-2">
            Reject Optional
          </Button>
          <Button variant="secondary" onClick={openPreferences} className="sm:order-1">
            Manage Preferences
          </Button>
        </div>
      </div>
    </div>
  )
}
