// ──────────────────────────────────────────────────────────────────────────
// Phase 2B — deterministic image SEO audit: missing/weak alt, oversized
// files, format opportunity, filename quality, and (best-effort) intrinsic-
// vs-rendered dimension mismatch. Tracking pixels/spacers are already
// filtered out at extraction time (see analyze/route.ts's
// isLikelyTrackingOrSpacer) — everything reaching here is a "meaningful
// content image" candidate.
//
// AI never decides alt presence, file size, dimensions, or format — those
// come straight from the crawl (see PageAnalysis.images and its probeImage
// step). AI may only help suggest better alt text in later phases.
// ──────────────────────────────────────────────────────────────────────────
import type { ImageAsset, PageAnalysis } from '@/app/api/seo-strategy/analyze/route'
import { pickHighestSeverity } from './severity'
import type { ImageIssueDetail, ImagesAudit, OnPageStatus, Severity } from './types'
import {
  HERO_IMAGE_MIN_WIDTH,
  HERO_IMAGE_SIZE_HIGH_CONCERN_BYTES,
  IMAGE_SIZE_HIGH_CONCERN_BYTES,
  IMAGE_SIZE_REVIEW_BYTES,
  LEGACY_RASTER_FORMATS,
  MAX_REASONABLE_ALT_LENGTH,
  MODERN_IMAGE_FORMATS,
  WEAK_ALT_PATTERNS,
  WEAK_ALT_VALUES,
  WEAK_FILENAME_PATTERNS,
} from './phase2b-thresholds'

type AltCategory = 'missing' | 'empty_decorative' | 'empty_meaningful' | 'weak' | 'ok'

/**
 * Differentiates "missing alt" / "empty decorative alt" (valid) / "empty alt
 * on a meaningful image" (an issue) / "weak generic alt" per the spec — a
 * blanket "empty alt = error" rule would wrongly flag legitimately
 * decorative images.
 */
function classifyAlt(img: ImageAsset): { issue: string | null; severity: Severity; category: AltCategory } {
  const width = img.probedWidth ?? img.width
  // Unknown size errs toward "meaningful" (safer to flag than silently miss
  // a real content image); small images (icons/dividers) lean decorative.
  const looksMeaningful = width === null || width >= 80

  if (img.alt === null) {
    return { issue: 'Missing alt attribute.', severity: looksMeaningful ? 'medium' : 'low', category: 'missing' }
  }
  if (img.alt === '') {
    if (img.isDecorative || !looksMeaningful) {
      return { issue: null, severity: 'pass', category: 'empty_decorative' }
    }
    return { issue: 'Meaningful image has an empty alt attribute.', severity: 'medium', category: 'empty_meaningful' }
  }

  const trimmed = img.alt.trim().toLowerCase()
  const isWeakValue = WEAK_ALT_VALUES.has(trimmed) || WEAK_ALT_PATTERNS.some((re) => re.test(trimmed))
  const filenameBase = img.filename.replace(/\.[a-z0-9]+$/i, '').toLowerCase()
  const looksLikeFilename = trimmed === filenameBase && filenameBase.length > 0

  if (isWeakValue || looksLikeFilename) {
    return { issue: `Generic or filename-derived alt text: "${img.alt}".`, severity: 'low', category: 'weak' }
  }
  if (img.alt.length > MAX_REASONABLE_ALT_LENGTH) {
    return { issue: `Alt text is excessively long (${img.alt.length} characters).`, severity: 'low', category: 'weak' }
  }
  return { issue: null, severity: 'pass', category: 'ok' }
}

/** File size AND declared/rendered usage both matter — a full-width hero gets a larger allowance than a small card image, per spec. */
function classifyOversized(img: ImageAsset): string | null {
  if (img.fileSize === null) return null
  const width = img.probedWidth ?? img.width ?? 0
  const isHero = width >= HERO_IMAGE_MIN_WIDTH
  const highConcern = isHero ? HERO_IMAGE_SIZE_HIGH_CONCERN_BYTES : IMAGE_SIZE_HIGH_CONCERN_BYTES
  if (img.fileSize >= highConcern) {
    return `Large file size (${(img.fileSize / 1024 / 1024).toFixed(1)}MB) — high concern for standard web content.`
  }
  if (img.fileSize >= IMAGE_SIZE_REVIEW_BYTES) {
    return `File size (${Math.round(img.fileSize / 1024)}KB) is larger than ideal — needs review.`
  }
  return null
}

function classifyFormatOpportunity(img: ImageAsset): string | null {
  if (!img.format || img.format === 'svg') return null // SVG is fine for suitable graphics/icons
  if (MODERN_IMAGE_FORMATS.has(img.format)) return null
  if (LEGACY_RASTER_FORMATS.has(img.format)) {
    return `Modern format opportunity — ${img.format.toUpperCase()} could potentially be served as WebP/AVIF for a smaller file size.`
  }
  return null
}

function classifyFilename(img: ImageAsset): string | null {
  const base = img.filename.replace(/\.[a-z0-9]+$/i, '')
  return WEAK_FILENAME_PATTERNS.some((re) => re.test(base)) ? `Non-descriptive filename: "${img.filename}".` : null
}

/** Only flags when we actually have both an intrinsic (probed) and a declared/rendered width — never guesses when rendered dimensions are unavailable, per spec. */
function classifyDimensionMismatch(img: ImageAsset): string | null {
  if (img.probedWidth === null || img.width === null || img.width <= 0) return null
  if (img.probedWidth > img.width * 2 && img.probedWidth - img.width > 200) {
    return `Intrinsic image width (${img.probedWidth}px) is much larger than its displayed width (${img.width}px) — consider serving a properly sized image.`
  }
  return null
}

export function evaluateImages(page: PageAnalysis): ImagesAudit {
  const issues: ImageIssueDetail[] = []
  const severities: Severity[] = []
  let missingAlt = 0
  let weakAlt = 0
  let oversized = 0
  let modernFormatCount = 0
  let legacyFormatCount = 0

  for (const img of page.images) {
    const imgIssues: string[] = []

    const alt = classifyAlt(img)
    if (alt.category === 'missing' || alt.category === 'empty_meaningful') {
      missingAlt++
      if (alt.issue) imgIssues.push(alt.issue)
      severities.push(alt.severity)
    } else if (alt.category === 'weak') {
      weakAlt++
      if (alt.issue) imgIssues.push(alt.issue)
      severities.push(alt.severity)
    }

    const sizeIssue = classifyOversized(img)
    if (sizeIssue) {
      oversized++
      imgIssues.push(sizeIssue)
      severities.push(sizeIssue.includes('high concern') ? 'medium' : 'low')
    }

    const formatIssue = classifyFormatOpportunity(img)
    if (formatIssue) {
      imgIssues.push(formatIssue)
      severities.push('low')
    }
    if (img.format && MODERN_IMAGE_FORMATS.has(img.format)) modernFormatCount++
    else if (img.format && LEGACY_RASTER_FORMATS.has(img.format)) legacyFormatCount++

    const filenameIssue = classifyFilename(img)
    if (filenameIssue) {
      imgIssues.push(filenameIssue)
      severities.push('low')
    }

    const dimIssue = classifyDimensionMismatch(img)
    if (dimIssue) {
      imgIssues.push(dimIssue)
      severities.push('low')
    }

    if (imgIssues.length > 0) {
      issues.push({
        src: img.src,
        filename: img.filename,
        alt: img.alt,
        width: img.probedWidth ?? img.width,
        height: img.probedHeight ?? img.height,
        fileSize: img.fileSize,
        format: img.format,
        issues: imgIssues,
      })
    }
  }

  if (severities.length === 0) severities.push('pass')
  const worst = pickHighestSeverity(severities)
  const status: OnPageStatus = issues.length === 0 ? 'good' : worst === 'high' || worst === 'critical' ? 'poor' : 'needs_improvement'

  return {
    total: page.images.length,
    missingAlt,
    weakAlt,
    oversized,
    modernFormatCount,
    legacyFormatCount,
    issues,
    status,
    severity: worst,
  }
}
