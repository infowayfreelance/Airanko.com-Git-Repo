'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  type CookieConsent,
  DEFAULT_CONSENT,
  readStoredConsent,
  writeStoredConsent,
} from '@/lib/cookie-consent'

type ConsentStatus = 'loading' | 'unset' | 'set'

type CookieConsentContextValue = {
  consent: CookieConsent
  /** True once we've checked localStorage and found no valid (unexpired) prior choice — i.e. the banner should show. */
  showBanner: boolean
  isPreferencesOpen: boolean
  openPreferences: () => void
  closePreferences: () => void
  acceptAll: () => void
  rejectOptional: () => void
  savePreferences: (next: CookieConsent) => void
}

const CookieConsentContext = createContext<CookieConsentContextValue | null>(null)

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<ConsentStatus>('loading')
  const [consent, setConsent] = useState<CookieConsent>(DEFAULT_CONSENT)
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false)

  // Read localStorage only after mount — it's unavailable during SSR and
  // reading it during render would cause a hydration mismatch.
  useEffect(() => {
    const stored = readStoredConsent()
    if (stored) {
      setConsent(stored)
      setStatus('set')
    } else {
      setStatus('unset')
    }
  }, [])

  const persist = useCallback((next: CookieConsent) => {
    setConsent(next)
    writeStoredConsent(next)
    setStatus('set')
    setIsPreferencesOpen(false)
  }, [])

  const acceptAll = useCallback(() => persist({ analytics: true }), [persist])
  const rejectOptional = useCallback(() => persist({ analytics: false }), [persist])
  const savePreferences = useCallback((next: CookieConsent) => persist(next), [persist])

  const openPreferences = useCallback(() => setIsPreferencesOpen(true), [])
  const closePreferences = useCallback(() => setIsPreferencesOpen(false), [])

  const value = useMemo<CookieConsentContextValue>(
    () => ({
      consent,
      showBanner: status === 'unset' && !isPreferencesOpen,
      isPreferencesOpen,
      openPreferences,
      closePreferences,
      acceptAll,
      rejectOptional,
      savePreferences,
    }),
    [consent, status, isPreferencesOpen, openPreferences, closePreferences, acceptAll, rejectOptional, savePreferences],
  )

  return <CookieConsentContext.Provider value={value}>{children}</CookieConsentContext.Provider>
}

export function useCookieConsent() {
  const ctx = useContext(CookieConsentContext)
  if (!ctx) {
    throw new Error('useCookieConsent must be used within a CookieConsentProvider')
  }
  return ctx
}
