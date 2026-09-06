// ──────────────────────────────────────────────────────────────────────────
// Phase 4 — deterministic, server-safe SERP pixel-width measurement.
//
// This is deliberately NOT a browser Canvas measurement (unlike
// lib/meta-pixel/measure.ts, used by the standalone Meta Pixel Checker
// tool): the SEO Strategy report is built entirely server-side in
// app/api/seo-strategy/route.ts, before any client component renders, so a
// `document`/canvas-based measurement isn't available where this needs to
// run. Instead this uses real per-glyph Arial/Helvetica width metrics
// (standard, widely published font metrics — the same numbers PDF
// libraries and SERP-snippet tools commonly ship with) so "W" and "i" are
// correctly given very different widths — never a flat
// characters × average-width estimate. The tradeoff is an approximation of
// Arial rendering rather than a live measurement of it; see each function's
// note for where that matters.
// ──────────────────────────────────────────────────────────────────────────
import {
  classifyPixelWidth,
  DESCRIPTION_PIXEL_THRESHOLDS,
  SERP_DESCRIPTION_FONT_SIZE_PX,
  SERP_TITLE_FONT_SIZE_PX,
  TITLE_PIXEL_THRESHOLDS,
  type SerpPixelStatus,
} from './serp-pixel-thresholds'

// ---------------------------------------------------------------------------
// Glyph widths — standard Arial/Helvetica metrics, in units per 1000 em
// (the same core-font metrics widely published and reused across PDF and
// text-measurement libraries). Covers printable ASCII; everything else is
// classified below.
// ---------------------------------------------------------------------------
const ARIAL_WIDTHS_1000: Record<string, number> = {
  ' ': 278, '!': 278, '"': 355, '#': 556, '$': 556, '%': 889, '&': 667, "'": 191, '(': 333, ')': 333,
  '*': 389, '+': 584, ',': 278, '-': 333, '.': 278, '/': 278,
  '0': 556, '1': 556, '2': 556, '3': 556, '4': 556, '5': 556, '6': 556, '7': 556, '8': 556, '9': 556,
  ':': 278, ';': 278, '<': 584, '=': 584, '>': 584, '?': 556, '@': 1015,
  A: 667, B: 667, C: 722, D: 722, E: 667, F: 611, G: 778, H: 722, I: 278, J: 500,
  K: 667, L: 556, M: 833, N: 722, O: 778, P: 667, Q: 778, R: 722, S: 667, T: 611,
  U: 722, V: 667, W: 944, X: 667, Y: 667, Z: 611,
  '[': 278, '\\': 278, ']': 278, '^': 469, _: 556, '`': 333,
  a: 556, b: 556, c: 500, d: 556, e: 556, f: 278, g: 556, h: 556, i: 222, j: 222,
  k: 500, l: 222, m: 833, n: 556, o: 556, p: 556, q: 556, r: 333, s: 500, t: 278,
  u: 556, v: 500, w: 722, x: 500, y: 500, z: 500,
  '{': 334, '|': 260, '}': 334, '~': 584,
}

/** Fallback width for a Latin-ish glyph with no direct/decomposed match — the average of the table above, so an unmapped accented letter or symbol doesn't skew the total. */
const DEFAULT_GLYPH_WIDTH_1000 = 556
/** CJK ideographs, Hangul, fullwidth forms, and emoji render roughly as wide as the font size (a "full-width" glyph), never the same as a narrow Latin letter. */
const WIDE_GLYPH_WIDTH_1000 = 1000

function isWideScriptCodePoint(cp: number): boolean {
  return (
    (cp >= 0x1100 && cp <= 0x115f) || // Hangul Jamo
    (cp >= 0x2e80 && cp <= 0xa4cf) || // CJK radicals .. Yi
    (cp >= 0xac00 && cp <= 0xd7a3) || // Hangul syllables
    (cp >= 0xf900 && cp <= 0xfaff) || // CJK compatibility ideographs
    (cp >= 0xff00 && cp <= 0xff60) || // fullwidth forms
    (cp >= 0x1f300 && cp <= 0x1faff) || // emoji & pictographs
    (cp >= 0x20000 && cp <= 0x3ffff) // CJK extension planes
  )
}

/** Combining marks, zero-width joiners, and variation selectors contribute no width of their own — they modify the glyph before them. */
function isZeroWidthCodePoint(cp: number): boolean {
  return (cp >= 0x0300 && cp <= 0x036f) || cp === 0x200d || cp === 0xfe0f
}

function decodeCommonHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

/** Width for one grapheme: direct table lookup, then the NFD-decomposed base letter (so "é" reads as "e"'s width rather than falling back to the average), then the default. */
function widthForGlyph(ch: string): number {
  const direct = ARIAL_WIDTHS_1000[ch]
  if (direct !== undefined) return direct
  const base = ch.normalize('NFD')[0]
  if (base !== undefined) {
    const baseWidth = ARIAL_WIDTHS_1000[base]
    if (baseWidth !== undefined) return baseWidth
  }
  return DEFAULT_GLYPH_WIDTH_1000
}

/**
 * Deterministic approximate rendered pixel width of `text` at `fontSizePx`
 * in an Arial-like sans-serif. Never throws on emoji, non-Latin scripts, or
 * malformed input — unrecognized scripts fall back to a full-width or
 * average-width estimate rather than crashing or mis-measuring as zero.
 */
export function measureArialPixelWidth(text: string, fontSizePx: number): number {
  const decoded = decodeCommonHtmlEntities(text)
  let totalUnits = 0
  for (const ch of decoded) {
    const cp = ch.codePointAt(0) ?? 0
    if (isZeroWidthCodePoint(cp)) continue
    totalUnits += isWideScriptCodePoint(cp) ? WIDE_GLYPH_WIDTH_1000 : widthForGlyph(ch)
  }
  return Math.round((totalUnits / 1000) * fontSizePx)
}

// ---------------------------------------------------------------------------
// Title
// ---------------------------------------------------------------------------

/** Approximate SERP title pixel width, or null for empty/missing text — never a fabricated 0px. */
export function measureTitleWidth(text: string | null): number | null {
  const trimmed = text?.trim()
  if (!trimmed) return null
  return measureArialPixelWidth(trimmed, SERP_TITLE_FONT_SIZE_PX)
}

export function evaluateTitlePixelStatus(pixelWidth: number | null): SerpPixelStatus {
  if (pixelWidth === null) return 'not_available'
  return classifyPixelWidth(pixelWidth, TITLE_PIXEL_THRESHOLDS)
}

export interface TitlePixelMeasurement {
  pixelWidth: number | null
  pixelStatus: SerpPixelStatus
}

export function measureTitlePixels(text: string | null): TitlePixelMeasurement {
  const pixelWidth = measureTitleWidth(text)
  return { pixelWidth, pixelStatus: evaluateTitlePixelStatus(pixelWidth) }
}

// ---------------------------------------------------------------------------
// Meta description — wraps across lines in the SERP, so a line-count
// estimate is stored alongside the raw total pixel width; see
// serp-pixel-thresholds.ts for how the good/borderline/too-long bands map
// onto that estimate. This is an approximation of likely SERP wrapping, not
// a claim about exactly how Google will wrap any given description.
// ---------------------------------------------------------------------------

/** Approximate total SERP description pixel width (as if laid out on one line), or null for empty/missing text. */
export function measureDescriptionWidth(text: string | null): number | null {
  const trimmed = text?.trim()
  if (!trimmed) return null
  return measureArialPixelWidth(trimmed, SERP_DESCRIPTION_FONT_SIZE_PX)
}

export function evaluateDescriptionPixelStatus(pixelWidth: number | null): SerpPixelStatus {
  if (pixelWidth === null) return 'not_available'
  return classifyPixelWidth(pixelWidth, DESCRIPTION_PIXEL_THRESHOLDS)
}

export function estimateDescriptionLines(pixelWidth: number | null): number | null {
  if (pixelWidth === null) return null
  return Math.max(1, Math.ceil(pixelWidth / DESCRIPTION_PIXEL_THRESHOLDS.lineWidthPx))
}

export interface DescriptionPixelMeasurement {
  pixelWidth: number | null
  estimatedLines: number | null
  pixelStatus: SerpPixelStatus
}

export function measureDescriptionPixels(text: string | null): DescriptionPixelMeasurement {
  const pixelWidth = measureDescriptionWidth(text)
  return { pixelWidth, estimatedLines: estimateDescriptionLines(pixelWidth), pixelStatus: evaluateDescriptionPixelStatus(pixelWidth) }
}
