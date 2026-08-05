// ──────────────────────────────────────────────────────────────────────────
// Client-side pixel measurement. Runs in the browser via a hidden <canvas> —
// this is deliberately NOT done server-side, since accurate text-width
// measurement depends on the actual font rendering available on the client,
// and browsers already ship a fast, correct implementation (CanvasRenderingContext2D.measureText).
// ──────────────────────────────────────────────────────────────────────────

let sharedCanvas: HTMLCanvasElement | null = null

function getContext(): CanvasRenderingContext2D | null {
  if (typeof document === 'undefined') return null
  if (!sharedCanvas) sharedCanvas = document.createElement('canvas')
  return sharedCanvas.getContext('2d')
}

/** Measures the rendered pixel width of `text` set in `font` (a canvas font string). */
export function measureTextWidth(text: string, font: string): number {
  const ctx = getContext()
  if (!ctx || !text) return 0
  ctx.font = font
  return ctx.measureText(text).width
}

/**
 * Simulates how Google truncates an overflowing title/description: cuts at
 * the widest prefix that still fits within `maxPx` once an ellipsis is
 * appended, then backs up to the last whole word for a cleaner break.
 */
export function truncateToPixelWidth(text: string, font: string, maxPx: number): string {
  if (!text) return text
  const ellipsis = '…'
  if (measureTextWidth(text, font) <= maxPx) return text

  let lo = 0
  let hi = text.length
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2)
    const candidate = text.slice(0, mid).trimEnd() + ellipsis
    if (measureTextWidth(candidate, font) <= maxPx) lo = mid
    else hi = mid - 1
  }

  let cut = text.slice(0, lo)
  const lastSpace = cut.lastIndexOf(' ')
  if (lastSpace > cut.length * 0.6) cut = cut.slice(0, lastSpace)
  return cut.trimEnd() + ellipsis
}
