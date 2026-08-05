// ──────────────────────────────────────────────────────────────────────────
// SERP pixel-width thresholds.
//
// Google has never published an official pixel spec for title/description
// truncation, and the exact cutoff has shifted several times as Google has
// redesigned the SERP (most notably the 2021 mobile "card" redesign, which
// widened the visible snippet significantly). The values below are the
// commonly cited, widely used industry-standard estimates that most SERP
// snippet tools ship with. Treat them as directional guidance for writing
// safer titles/descriptions — not a guarantee of exactly where Google will
// truncate on any given day or query.
// ──────────────────────────────────────────────────────────────────────────

export type Device = 'desktop' | 'mobile'
export type Field = 'title' | 'description'

export interface PixelLimit {
  /** Maximum pixel width before Google is likely to truncate with an ellipsis. */
  maxPx: number
  /** Canvas font string used to measure this field — mirrors Google's SERP typography. */
  font: string
  label: string
  note: string
}

export const PIXEL_LIMITS: Record<Device, Record<Field, PixelLimit>> = {
  desktop: {
    title: {
      maxPx: 600,
      font: '400 20px Arial, Helvetica, sans-serif',
      label: 'Desktop Title',
      note: 'Google desktop SERP title — Arial 20px, ~600px before truncation.',
    },
    description: {
      maxPx: 920,
      font: '400 14px Arial, Helvetica, sans-serif',
      label: 'Desktop Description',
      note: 'Google desktop SERP description — Arial 14px, ~920px per line (up to 2 lines).',
    },
  },
  mobile: {
    title: {
      maxPx: 580,
      font: '400 18px Arial, Helvetica, sans-serif',
      label: 'Mobile Title',
      note: 'Google mobile SERP title — narrower viewport, ~580px before truncation.',
    },
    description: {
      maxPx: 680,
      font: '400 14px Arial, Helvetica, sans-serif',
      label: 'Mobile Description',
      note: 'Google mobile SERP description — narrower viewport, ~680px per line (up to 2 lines).',
    },
  },
}

export type PixelStatus = 'good' | 'warning' | 'over'

/** Warn once a field is within this ratio of its hard limit, before it actually overflows. */
const WARNING_RATIO = 0.92

export function pixelStatus(widthPx: number, limit: PixelLimit): PixelStatus {
  if (widthPx > limit.maxPx) return 'over'
  if (widthPx >= limit.maxPx * WARNING_RATIO) return 'warning'
  return 'good'
}
