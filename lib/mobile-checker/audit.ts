// ──────────────────────────────────────────────────────────────────────────
// Mobile-friendliness audit engine — real, deterministic checks computed
// from actual fetched HTML/headers. No external APIs, no guessing: every
// check either measures something directly from the source (marked
// `measured`) or is an explicitly-labeled `heuristic` approximation where a
// real answer would require full browser layout (which a static HTML fetch
// can't provide). We never present a heuristic as if it were measured.
//
// This mirrors the same "real, not guessing" principle used by the Meta
// Pixel Checker and Vibe Code Detector — dedicated, documented rule file,
// separate from the API route that calls it.
//
// Every check that can fail or warn also carries a `solution` — a concrete,
// actionable fix, not a vague suggestion — so the report tells you not just
// what's wrong but exactly how to fix it.
// ──────────────────────────────────────────────────────────────────────────

export type CheckStatus = 'pass' | 'warning' | 'fail' | 'info'
export type CheckConfidence = 'measured' | 'heuristic'

export interface AuditCheck {
  id: string
  name: string
  category: string
  status: CheckStatus
  confidence: CheckConfidence
  /** Points this check is worth toward the overall score. 0 for purely informational checks. */
  weight: number
  detail: string
  evidence?: string[]
  /** Concrete fix for this issue. Present whenever status is 'warning' or 'fail'; omitted for 'pass'/'info'. */
  solution?: string
  /** Optional ready-to-paste code snippet illustrating the fix. */
  solutionCode?: string
}

export type Grade = 'Excellent' | 'Good' | 'Needs Work' | 'Poor'

export interface MobileAuditResult {
  score: number
  grade: Grade
  checks: AuditCheck[]
  passCount: number
  warningCount: number
  failCount: number
}

export const CATEGORY = {
  VIEWPORT: 'Viewport & Scaling',
  READABILITY: 'Readability & Layout',
  COMPATIBILITY: 'Mobile Compatibility',
  PERFORMANCE: 'Performance',
  TECHNICAL: 'Technical SEO',
}

interface AuditInput {
  html: string
  htmlBytes: number
  headers: Record<string, string>
  /** Whether the mobile-UA fetch resolved to a different final URL than the desktop-UA fetch. */
  mobileRedirect: { detected: boolean; mobileUrl: string | null }
}

function countMatches(text: string, regex: RegExp): number {
  return (text.match(regex) ?? []).length
}

function grade(score: number): Grade {
  if (score >= 90) return 'Excellent'
  if (score >= 70) return 'Good'
  if (score >= 50) return 'Needs Work'
  return 'Poor'
}

export function runMobileAudit(input: AuditInput): MobileAuditResult {
  const { html, htmlBytes, mobileRedirect } = input
  const head = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i)?.[1] ?? html
  const checks: AuditCheck[] = []

  // ── Viewport & Scaling ────────────────────────────────────────────────
  const viewportMatch = head.match(/<meta[^>]+name=["']viewport["'][^>]*content=["']([^"']*)["']/i)
    ?? head.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']viewport["']/i)
  const viewportContent = viewportMatch?.[1] ?? null

  checks.push({
    id: 'viewport-present',
    name: 'Viewport meta tag present',
    category: CATEGORY.VIEWPORT,
    status: viewportContent !== null ? 'pass' : 'fail',
    confidence: 'measured',
    weight: 15,
    detail: viewportContent !== null
      ? `Found: <meta name="viewport" content="${viewportContent}">`
      : 'No <meta name="viewport"> tag found — without it, mobile browsers render the page at desktop width and shrink it, making text unreadably small.',
    ...(viewportContent === null && {
      solution: 'Add a viewport meta tag inside your <head>. This single tag is the biggest lever for mobile rendering — without it, nothing else on this checklist matters much.',
      solutionCode: '<meta name="viewport" content="width=device-width, initial-scale=1">',
    }),
  })

  if (viewportContent !== null) {
    const hasDeviceWidth = /width\s*=\s*device-width/i.test(viewportContent)
    const hasInitialScale = /initial-scale\s*=\s*1(\.0)?/i.test(viewportContent)
    const blocksZoom = /user-scalable\s*=\s*no/i.test(viewportContent) || /maximum-scale\s*=\s*1(\.0)?[^0-9]/i.test(viewportContent + ' ')
    const deviceWidthOk = hasDeviceWidth && hasInitialScale
    checks.push({
      id: 'viewport-device-width',
      name: 'Viewport configured for device width',
      category: CATEGORY.VIEWPORT,
      status: deviceWidthOk ? 'pass' : hasDeviceWidth ? 'warning' : 'fail',
      confidence: 'measured',
      weight: 10,
      detail: hasDeviceWidth
        ? (hasInitialScale ? 'width=device-width and initial-scale=1 both set — correct configuration.' : 'width=device-width is set, but initial-scale is missing or not 1 — some browsers may still zoom on load.')
        : 'Viewport tag exists but does not set width=device-width, so the page will not scale to the device screen.',
      ...(!deviceWidthOk && {
        solution: 'Update your viewport meta tag to include both width=device-width and initial-scale=1.',
        solutionCode: '<meta name="viewport" content="width=device-width, initial-scale=1">',
      }),
    })
    checks.push({
      id: 'viewport-zoom-allowed',
      name: 'Pinch-to-zoom not disabled',
      category: CATEGORY.VIEWPORT,
      status: blocksZoom ? 'fail' : 'pass',
      confidence: 'measured',
      weight: 8,
      detail: blocksZoom
        ? 'user-scalable=no or maximum-scale=1 detected — this blocks pinch-to-zoom, an accessibility issue Google flags directly in mobile-friendliness testing.'
        : 'Pinch-to-zoom is not disabled by the viewport tag.',
      ...(blocksZoom && {
        solution: 'Remove user-scalable=no and any maximum-scale restriction from your viewport tag. Low-vision users rely on pinch-to-zoom, and Google penalizes pages that block it.',
        solutionCode: '<meta name="viewport" content="width=device-width, initial-scale=1">',
      }),
    })
  }

  // ── Readability & Layout ─────────────────────────────────────────────
  const styleBlocks = (html.match(/<style[^>]*>[\s\S]*?<\/style>/gi) ?? []).join('\n')
  const inlineStyles = (html.match(/\bstyle\s*=\s*["'][^"']+["']/gi) ?? []).join('\n')
  const allInlineCss = styleBlocks + '\n' + inlineStyles

  const tinyFontMatches = Array.from(allInlineCss.matchAll(/font-size\s*:\s*(\d+(?:\.\d+)?)\s*px/gi))
    .map((m) => parseFloat(m[1]))
    .filter((px) => px < 12)
  const fontIssue = tinyFontMatches.length > 0
  checks.push({
    id: 'font-legibility',
    name: 'No illegibly small font sizes',
    category: CATEGORY.READABILITY,
    status: !fontIssue ? 'pass' : tinyFontMatches.length <= 2 ? 'warning' : 'fail',
    confidence: 'heuristic',
    weight: 8,
    detail: !fontIssue
      ? 'No font-size declarations under 12px found in inline/embedded CSS.'
      : `${tinyFontMatches.length} declaration(s) set font-size below 12px (smallest: ${Math.min(...tinyFontMatches)}px) in inline/embedded CSS — Google recommends 12px+ as a legible mobile baseline. This only scans inline/<style> CSS actually present in the fetched HTML, not externally linked stylesheets or computed/rendered sizes.`,
    ...(fontIssue && {
      solution: 'Increase the affected font-size declarations to at least 12px — 16px is the recommended minimum for comfortable body-text reading on mobile without zooming.',
      solutionCode: 'body { font-size: 16px; }\nsmall, .caption { font-size: 12px; } /* never smaller */',
    }),
  })

  const fixedWidthMatches = Array.from(allInlineCss.matchAll(/\bwidth\s*:\s*(\d+)\s*px/gi))
    .map((m) => parseInt(m[1], 10))
    .filter((px) => px > 480)
  const overflowIssue = fixedWidthMatches.length > 0
  checks.push({
    id: 'horizontal-overflow-risk',
    name: 'No oversized fixed-width elements',
    category: CATEGORY.READABILITY,
    status: !overflowIssue ? 'pass' : fixedWidthMatches.length <= 2 ? 'warning' : 'fail',
    confidence: 'heuristic',
    weight: 10,
    detail: !overflowIssue
      ? 'No inline/embedded CSS declarations set a fixed width over 480px that would force horizontal scrolling on a phone.'
      : `${fixedWidthMatches.length} declaration(s) set a fixed width over 480px (largest: ${Math.max(...fixedWidthMatches)}px) — this can force horizontal scrolling on phone-width screens if not wrapped in a responsive container. Estimated from CSS source, not actual rendered layout.`,
    ...(overflowIssue && {
      solution: 'Replace fixed pixel widths with responsive units, or cap them with max-width so they shrink on narrow screens instead of forcing horizontal scroll.',
      solutionCode: '.element {\n  width: 100%;\n  max-width: 480px; /* was a fixed px width */\n}',
    }),
  })

  const mediaQueryCount = countMatches(allInlineCss, /@media[^{]*\(\s*max-width|@media[^{]*\(\s*min-width/gi)
  const noMediaQueries = mediaQueryCount === 0
  checks.push({
    id: 'responsive-css',
    name: 'Responsive CSS (media queries) present',
    category: CATEGORY.READABILITY,
    status: !noMediaQueries ? 'pass' : 'warning',
    confidence: 'measured',
    weight: 6,
    detail: !noMediaQueries
      ? `${mediaQueryCount} width-based @media quer${mediaQueryCount === 1 ? 'y' : 'ies'} found in inline/embedded CSS.`
      : 'No width-based @media queries found in inline/embedded CSS. The page may still be responsive via an external stylesheet (not scanned here) or a utility-CSS framework.',
    ...(noMediaQueries && {
      solution: 'If your layout isn\'t already responsive via an external stylesheet or utility framework (e.g. Tailwind), add breakpoints so your layout adapts at common mobile widths.',
      solutionCode: '@media (max-width: 768px) {\n  .container { flex-direction: column; }\n}',
    }),
  })

  // ── Mobile Compatibility ─────────────────────────────────────────────
  const hasFlash = /<object[^>]*type=["']application\/x-shockwave-flash["']/i.test(html)
    || /<embed[^>]*\.swf/i.test(html)
    || /\.swf(?:["'?]|$)/i.test(html)
  checks.push({
    id: 'no-flash',
    name: 'No Flash or unsupported plugins',
    category: CATEGORY.COMPATIBILITY,
    status: hasFlash ? 'fail' : 'pass',
    confidence: 'measured',
    weight: 10,
    detail: hasFlash
      ? 'Flash content (.swf / application/x-shockwave-flash) detected — no mobile browser supports Flash, so this content is completely inaccessible on phones and tablets.'
      : 'No Flash or legacy plugin content detected.',
    ...(hasFlash && {
      solution: 'Remove the Flash/.swf embed entirely and replace it with an HTML5 equivalent — <video>/<audio> for media, Canvas/SVG or CSS animation for interactive graphics.',
      solutionCode: '<video controls width="100%">\n  <source src="/media/clip.mp4" type="video/mp4">\n</video>',
    }),
  })

  const imgTags = html.match(/<img\b[^>]*>/gi) ?? []
  const responsiveImgCount = imgTags.filter((tag) => /\bsrcset\s*=/i.test(tag)).length
  const imgRatio = imgTags.length === 0 ? 1 : responsiveImgCount / imgTags.length
  const imgIssue = imgTags.length > 0 && imgRatio < 0.5
  checks.push({
    id: 'responsive-images',
    name: 'Responsive images (srcset)',
    category: CATEGORY.COMPATIBILITY,
    status: imgTags.length === 0 ? 'info' : imgRatio >= 0.5 ? 'pass' : responsiveImgCount > 0 ? 'warning' : 'fail',
    confidence: 'measured',
    weight: imgTags.length === 0 ? 0 : 6,
    detail: imgTags.length === 0
      ? 'No <img> elements found on this page.'
      : `${responsiveImgCount}/${imgTags.length} <img> elements use srcset to serve appropriately-sized images per device.`,
    ...(imgIssue && {
      solution: 'Add a srcset (and sizes) attribute to your <img> tags so mobile browsers download a smaller image instead of the full desktop-size file.',
      solutionCode: '<img src="photo-800.jpg"\n     srcset="photo-400.jpg 400w, photo-800.jpg 800w, photo-1200.jpg 1200w"\n     sizes="(max-width: 600px) 400px, 800px"\n     alt="Description">',
    }),
  })

  const touchIconPresent = /<link[^>]+rel=["'](?:apple-touch-icon|icon)["']/i.test(head)
  checks.push({
    id: 'touch-icon',
    name: 'Touch/home-screen icon present',
    category: CATEGORY.COMPATIBILITY,
    status: touchIconPresent ? 'pass' : 'warning',
    confidence: 'measured',
    weight: 4,
    detail: touchIconPresent
      ? 'A touch icon (apple-touch-icon or icon link) is declared for home-screen/bookmark use.'
      : 'No apple-touch-icon or icon link found — the page will use a generic icon if bookmarked or added to a phone home screen.',
    ...(!touchIconPresent && {
      solution: 'Add an apple-touch-icon (and a standard favicon) so the page gets a proper icon when a mobile visitor bookmarks it or adds it to their home screen.',
      solutionCode: '<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">\n<link rel="icon" type="image/png" href="/favicon.png">',
    }),
  })

  // ── Performance ───────────────────────────────────────────────────────
  const htmlKB = htmlBytes / 1024
  const weightIssue = htmlKB >= 100
  checks.push({
    id: 'html-weight',
    name: 'HTML document size',
    category: CATEGORY.PERFORMANCE,
    status: htmlKB < 100 ? 'pass' : htmlKB < 250 ? 'warning' : 'fail',
    confidence: 'measured',
    weight: 6,
    detail: `HTML document is ${htmlKB.toFixed(1)} KB. This measures the HTML document only — not CSS, JS, images, fonts, or other assets, which make up most real-world mobile page weight and would require a full browser to measure.`,
    ...(weightIssue && {
      solution: 'Trim unnecessary inline markup and whitespace, move large inline <script>/<style> blocks into external cached files, and enable server-side HTML minification/compression (gzip or brotli).',
    }),
  })

  const renderBlockingScripts = countMatches(html, /<script(?![^>]*\b(?:async|defer|type=["']module["'])\b)[^>]*\bsrc=["'][^"']+["'][^>]*>/gi)
  const blockingIssue = renderBlockingScripts > 0
  checks.push({
    id: 'render-blocking-scripts',
    name: 'Minimal render-blocking scripts',
    category: CATEGORY.PERFORMANCE,
    status: renderBlockingScripts === 0 ? 'pass' : renderBlockingScripts <= 3 ? 'warning' : 'fail',
    confidence: 'measured',
    weight: 8,
    detail: renderBlockingScripts === 0
      ? 'No external <script> tags without async/defer found — scripts are not blocking initial render.'
      : `${renderBlockingScripts} external script(s) load without async/defer, which can block the page from rendering quickly on slower mobile connections.`,
    ...(blockingIssue && {
      solution: 'Add the defer (or async, for scripts with no dependencies) attribute to external <script> tags so the browser can render the page before they finish downloading.',
      solutionCode: '<script src="/js/app.js" defer></script>',
    }),
  })

  // ── Technical SEO ────────────────────────────────────────────────────
  checks.push({
    id: 'mobile-redirect',
    name: 'Consistent mobile experience',
    category: CATEGORY.TECHNICAL,
    status: mobileRedirect.detected ? 'warning' : 'pass',
    confidence: 'measured',
    weight: 8,
    detail: mobileRedirect.detected
      ? `Requesting this page with a mobile user agent redirects to a different URL (${mobileRedirect.mobileUrl}). Separate mobile URLs (m.example.com) are harder to maintain and can cause indexing/ranking split issues vs. a single responsive URL — Google explicitly recommends responsive design over separate mobile sites.`
      : 'Fetching with a real mobile user agent (iPhone Safari) returned the same URL as a desktop fetch — no separate mobile site detected.',
    ...(mobileRedirect.detected && {
      solution: 'Migrate to a single responsive URL that serves the same HTML to every device and adapts via CSS, instead of redirecting mobile visitors to a separate domain/path. This avoids duplicate-content issues and matches Google\'s official recommendation.',
    }),
  })

  const htmlLangPresent = /<html[^>]+lang=["'][a-zA-Z-]+["']/i.test(html)
  const charsetPresent = /<meta[^>]+charset\s*=/i.test(head)
  const langCharsetIssue = !htmlLangPresent || !charsetPresent
  checks.push({
    id: 'lang-charset',
    name: 'Language and charset declared',
    category: CATEGORY.TECHNICAL,
    status: !langCharsetIssue ? 'pass' : 'warning',
    confidence: 'measured',
    weight: 4,
    detail: `<html lang> ${htmlLangPresent ? 'present' : 'missing'}, <meta charset> ${charsetPresent ? 'present' : 'missing'}.`,
    ...(langCharsetIssue && {
      solution: `Add the missing tag${!htmlLangPresent && !charsetPresent ? 's' : ''} near the very top of your <head> — screen readers and browsers use these to render text and pick the right language correctly.`,
      solutionCode: [!htmlLangPresent && '<html lang="en">', !charsetPresent && '<meta charset="UTF-8">'].filter(Boolean).join('\n'),
    }),
  })

  const ampPresent = /<link[^>]+rel=["']amphtml["']/i.test(head)
  checks.push({
    id: 'amp-version',
    name: 'AMP version available',
    category: CATEGORY.TECHNICAL,
    status: 'info',
    confidence: 'measured',
    weight: 0,
    detail: ampPresent ? 'An AMP version of this page is linked via rel="amphtml".' : 'No AMP version linked (informational only — AMP is optional and not required for mobile-friendliness).',
  })

  // ── Score ─────────────────────────────────────────────────────────────
  const scored = checks.filter((c) => c.status !== 'info')
  const totalWeight = scored.reduce((s, c) => s + c.weight, 0)
  const earned = scored.reduce((s, c) => s + (c.status === 'pass' ? c.weight : c.status === 'warning' ? c.weight * 0.5 : 0), 0)
  const score = totalWeight === 0 ? 0 : Math.round((earned / totalWeight) * 100)

  return {
    score,
    grade: grade(score),
    checks,
    passCount: scored.filter((c) => c.status === 'pass').length,
    warningCount: scored.filter((c) => c.status === 'warning').length,
    failCount: scored.filter((c) => c.status === 'fail').length,
  }
}
