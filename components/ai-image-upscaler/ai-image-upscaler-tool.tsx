'use client'

import { Sparkles, ShieldCheck, Clock, Check, ZoomIn } from 'lucide-react'

export default function AiImageUpscalerTool() {
  return (
    <div className="px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Heading */}
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3 w-3" />
            100% Free · Runs in Your Browser
          </div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            AI Image Upscaler — Enhance Resolution up to 4x, Instantly &amp; Privately
          </h1>
          <p className="mt-3 leading-relaxed text-muted-foreground text-pretty">
            Upscale any image 2x or 4x using on-device AI — no account, no fees, no watermark. Your image never leaves your device, so your files stay 100% private and secure.
          </p>
        </div>

        {/* Coming soon */}
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-border bg-card p-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ZoomIn className="h-7 w-7" />
          </div>
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              Coming Soon
            </p>
            <p className="mt-3 font-heading text-lg font-semibold text-foreground">
              We&apos;re polishing this tool up
            </p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              The AI Image Upscaler will be back online shortly. Check back soon to upscale your images 2x or 4x, right in your browser.
            </p>
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-primary" /> Files stay on your device</span>
            <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary" /> No sign-up</span>
            <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary" /> No watermark</span>
          </div>
        </div>
      </div>
    </div>
  )
}
