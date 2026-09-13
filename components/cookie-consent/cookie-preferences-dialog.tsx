'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { useCookieConsent } from './cookie-consent-provider'

export function CookiePreferencesDialog() {
  const { isPreferencesOpen, closePreferences, consent, savePreferences, acceptAll } = useCookieConsent()

  // Local draft so toggling doesn't take effect until "Save Preferences" —
  // resets to the current stored choice (or the off-by-default value)
  // every time the dialog opens.
  const [analyticsDraft, setAnalyticsDraft] = useState(consent.analytics)
  useEffect(() => {
    if (isPreferencesOpen) setAnalyticsDraft(consent.analytics)
  }, [isPreferencesOpen, consent.analytics])

  return (
    <Dialog open={isPreferencesOpen} onOpenChange={(open) => !open && closePreferences()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Cookie Preferences</DialogTitle>
          <DialogDescription>
            Choose which optional cookies Ai Ranko can use. You can change this anytime from the
            &ldquo;Cookie Settings&rdquo; link in the footer.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-muted/40 p-4">
            <div>
              <p className="font-medium text-foreground">Essential Cookies</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Required for the site to work — like remembering this cookie choice and keeping the
                site secure. These can&apos;t be disabled.
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1.5">
              <Switch checked disabled aria-label="Essential cookies — always active" />
              <span className="text-[11px] font-medium text-muted-foreground">Always Active</span>
            </div>
          </div>

          <div className="flex items-start justify-between gap-4 rounded-xl border border-border p-4">
            <div>
              <p className="font-medium text-foreground">Analytics Cookies</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Help us understand how visitors use Ai Ranko (via Vercel Analytics) so we can improve
                our tools. Off by default.
              </p>
            </div>
            <Switch
              checked={analyticsDraft}
              onCheckedChange={setAnalyticsDraft}
              aria-label="Toggle analytics cookies"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => savePreferences({ analytics: analyticsDraft })}>
            Save Preferences
          </Button>
          <Button onClick={acceptAll}>Accept All</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
