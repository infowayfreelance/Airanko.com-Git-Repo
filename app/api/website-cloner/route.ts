import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 30

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

// Convert a URL (possibly relative/protocol-relative) to absolute
function toAbsolute(href: string, pageUrl: string): string {
  href = href.trim()
  if (!href) return href
  if (
    href.startsWith('data:') ||
    href.startsWith('blob:') ||
    href.startsWith('#') ||
    href.startsWith('javascript:') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:')
  ) return href
  try {
    if (href.startsWith('//')) return `https:${href}`
    return new URL(href, pageUrl).href
  } catch {
    return href
  }
}

// Safe fetch with timeout — returns empty string on failure
async function safeFetch(url: string, timeoutMs = 6000): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, Accept: 'text/css,text/javascript,*/*' },
      signal: AbortSignal.timeout(timeoutMs),
    })
    if (!res.ok) return ''
    return await res.text()
  } catch {
    return ''
  }
}

// Rewrite url() references inside CSS text
function rewriteCssUrls(css: string, cssUrl: string): string {
  return css.replace(/url\(\s*(['"]?)([^'")\s]+)\1\s*\)/gi, (_, q, u) => {
    try {
      const abs = new URL(u, cssUrl).href
      return `url('${abs}')`
    } catch {
      return `url('${u}')`
    }
  })
}

// Replace a literal substring once (avoids $ special chars in replacement)
function literalReplace(str: string, search: string, replacement: string): string {
  const idx = str.indexOf(search)
  if (idx === -1) return str
  return str.slice(0, idx) + replacement + str.slice(idx + search.length)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const rawUrl: string = (body.url ?? '').trim()

    if (!rawUrl) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    let pageUrl: URL
    try {
      pageUrl = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`)
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
    }

    if (!['http:', 'https:'].includes(pageUrl.protocol)) {
      return NextResponse.json({ error: 'Only HTTP/HTTPS URLs are supported' }, { status: 400 })
    }

    // ── Fetch page HTML ─────────────────────────────────────────────────────────
    let html: string
    try {
      const res = await fetch(pageUrl.href, {
        headers: {
          'User-Agent': UA,
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        signal: AbortSignal.timeout(12000),
        redirect: 'follow',
      })
      if (!res.ok) {
        return NextResponse.json(
          { error: `Failed to fetch page: ${res.status} ${res.statusText}` },
          { status: 422 }
        )
      }
      html = await res.text()
    } catch (e: any) {
      return NextResponse.json(
        { error: `Could not reach the page: ${e?.message ?? 'Network error'}` },
        { status: 422 }
      )
    }

    // ── Inline external stylesheets ──────────────────────────────────────────────
    const linkRegex = /<link\b([^>]*?)>/gi
    const cssLinks: Array<{ full: string; href: string }> = []
    let m: RegExpExecArray | null
    while ((m = linkRegex.exec(html)) !== null) {
      const attrs = m[1]
      if (!/rel=["'][^"']*stylesheet[^"']*["']/i.test(attrs)) continue
      const hrefM = attrs.match(/\bhref=["']([^"']+)["']/i)
      if (hrefM) cssLinks.push({ full: m[0], href: hrefM[1] })
    }

    // Fetch all stylesheets in parallel
    const cssResults = await Promise.all(
      cssLinks.map(async ({ full, href }) => {
        const absUrl = toAbsolute(href, pageUrl.href)
        const css = await safeFetch(absUrl)
        if (!css) return { full, replacement: full, inlined: false }
        const rewritten = rewriteCssUrls(css, absUrl)
        return { full, replacement: `<style>\n${rewritten}\n</style>`, inlined: true }
      })
    )

    let cssInlined = 0
    for (const { full, replacement, inlined } of cssResults) {
      html = literalReplace(html, full, replacement)
      if (inlined) cssInlined++
    }

    // ── Inline external scripts (up to 12 to stay within timeout) ───────────────
    // ES modules (type="module") are inlined too, preserving that attribute
    // — their content is still valid module syntax (import/export), just no
    // longer a cross-origin <script src>. This matters because a browser's
    // module loader always fetches type="module" scripts in CORS mode, even
    // when script-src would otherwise allow it: a target site's own script
    // is normally same-origin from its own page and never needed CORS
    // headers, but embedding it via srcDoc turns that into a cross-origin
    // request and the browser blocks it outright. A plain server-side
    // fetch (below) isn't subject to CORS at all, so inlining is the fix.
    // Any further nested `import`s inside that module still resolve as
    // normal (possibly CORS-blocked) requests — this fixes the common case
    // of a single bundled entry module, not deep code-splitting.
    const scriptRegex = /<script\b([^>]*?)>\s*<\/script>/gi
    const scripts: Array<{ full: string; src: string; isModule: boolean }> = []
    while ((m = scriptRegex.exec(html)) !== null) {
      const attrs = m[1]
      const srcM = attrs.match(/\bsrc=["']([^"']+)["']/i)
      if (srcM) scripts.push({ full: m[0], src: srcM[1], isModule: /\btype=["']module["']/i.test(attrs) })
    }

    const scriptResults = await Promise.all(
      scripts.slice(0, 12).map(async ({ full, src, isModule }) => {
        const absUrl = toAbsolute(src, pageUrl.href)
        const js = await safeFetch(absUrl, 4000)
        if (!js) return { full, replacement: full, inlined: false }
        const escaped = js.replace(/<\/script>/gi, '<\\/script>')
        const openTag = isModule ? '<script type="module">' : '<script>'
        return { full, replacement: `${openTag}\n${escaped}\n</script>`, inlined: true }
      })
    )

    let jsInlined = 0
    for (const { full, replacement, inlined } of scriptResults) {
      html = literalReplace(html, full, replacement)
      if (inlined) jsInlined++
    }

    // ── Rewrite remaining relative href/src/srcset/action to absolute ────────────
    html = html
      .replace(
        /\b(href|src|action|poster|data-src)=(["'])([^"']*)\2/gi,
        (_, attr, q, u) => `${attr}=${q}${toAbsolute(u, pageUrl.href)}${q}`
      )
      .replace(
        /\bsrcset=(["'])([^"']+)\1/gi,
        (_, q, val) => {
          const rewritten = val.replace(/(https?:\/\/[^\s,]+|\/[^\s,]+|\.\.[^\s,]+)/g, (u: string) =>
            toAbsolute(u.trim(), pageUrl.href)
          )
          return `srcset=${q}${rewritten}${q}`
        }
      )
      // url() in inline styles
      .replace(/url\(\s*(['"]?)([^'")\s]+)\1\s*\)/gi, (_, q, u) => {
        try { return `url('${new URL(u, pageUrl.href).href}')` } catch { return `url('${u}')` }
      })

    // Inject or update <base> so any remaining relative URLs resolve correctly
    if (/<base\b/i.test(html)) {
      html = html.replace(/<base\b([^>]*)>/i, `<base href="${pageUrl.href}">`)
    } else {
      html = html.replace(/(<head\b[^>]*>)/i, `$1\n<base href="${pageUrl.href}">`)
    }

    // Remove X-Frame-Options / CSP meta tags that would block the preview iframe
    html = html.replace(/<meta\b[^>]*http-equiv=["']X-Frame-Options["'][^>]*>/gi, '')
    html = html.replace(/<meta\b[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>/gi, '')

    const sizeBytes = Buffer.byteLength(html, 'utf8')

    return NextResponse.json({ html, stats: { cssInlined, jsInlined, sizeBytes } })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Internal error' }, { status: 500 })
  }
}
