// ──────────────────────────────────────────────────────────────────────────
// Phase 4 — centralized SERP pixel-width font approximation + thresholds.
// Same principle as on-page-thresholds.ts / phase2b-thresholds.ts: every
// magic number lives here, not scattered through serp-pixel.ts or the UI.
//
// Google has never published an official pixel spec for title/description
// truncation, and the exact cutoff shifts as Google redesigns the SERP.
// These are directional, industry-standard-style estimates for writing
// safer titles/descriptions — never a guarantee of exactly where Google
// will truncate a given snippet, and never a ranking signal.
// ──────────────────────────────────────────────────────────────────────────

/** Reference font size (px) used to approximate Google's desktop SERP title typography (Arial-like sans-serif). */
export const SERP_TITLE_FONT_SIZE_PX = 20
/** Reference font size (px) used to approximate Google's desktop SERP description typography. */
export const SERP_DESCRIPTION_FONT_SIZE_PX = 14
/** Display-only label for the approximated font — the measurement itself uses real per-glyph Arial/Helvetica metrics (see serp-pixel.ts), not a live font. */
export const SERP_FONT_FAMILY_LABEL = 'Arial'

export type SerpPixelStatus = 'good' | 'borderline_short' | 'borderline_long' | 'too_short' | 'too_long' | 'not_available'

export const SERP_PIXEL_STATUS_LABEL: Record<SerpPixelStatus, string> = {
  good: 'Good',
  borderline_short: 'Slightly Short',
  borderline_long: 'Slightly Long',
  too_short: 'Too Short',
  too_long: 'Too Long',
  not_available: 'Not Available',
}

/** Ascending pixel bands: <= tooShortMax is too_short, <= borderlineShortMax is borderline_short, <= goodMax is good (implicitly starting at goodMin), <= borderlineLongMax is borderline_long, above that is too_long. */
export interface PixelThresholdBand {
  tooShortMax: number
  borderlineShortMax: number
  /** Documentation only (== borderlineShortMax + 1) — classifyPixelWidth() doesn't need it since the ascending checks already imply it. */
  goodMin: number
  goodMax: number
  borderlineLongMax: number
}

/** Title thresholds — approximating Google's desktop SERP title column (~600px before truncation), giving a bit of headroom before "too long". */
export const TITLE_PIXEL_THRESHOLDS: PixelThresholdBand = {
  tooShortMax: 349,
  borderlineShortMax: 399,
  goodMin: 400,
  goodMax: 580,
  borderlineLongMax: 620,
}

/** Description thresholds. Unlike titles, descriptions wrap across lines — `lineWidthPx` is the approximate width of one SERP description line, and estimatedLines = ceil(pixelWidth / lineWidthPx). The good band targets "fits within roughly 2 lines without being extremely short" per the Phase 4 spec. */
export const DESCRIPTION_PIXEL_THRESHOLDS: PixelThresholdBand & { lineWidthPx: number } = {
  lineWidthPx: 600,
  tooShortMax: 450,
  borderlineShortMax: 720,
  goodMin: 721,
  goodMax: 1230,
  borderlineLongMax: 1440,
}

export function classifyPixelWidth(widthPx: number, thresholds: PixelThresholdBand): SerpPixelStatus {
  if (widthPx <= thresholds.tooShortMax) return 'too_short'
  if (widthPx <= thresholds.borderlineShortMax) return 'borderline_short'
  if (widthPx <= thresholds.goodMax) return 'good'
  if (widthPx <= thresholds.borderlineLongMax) return 'borderline_long'
  return 'too_long'
}
