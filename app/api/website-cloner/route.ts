import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'
import { CloneFetchError, createPublicFetcher, parsePublicUrl } from '@/lib/website-cloner/public-fetch'

export const runtime = 'nodejs'
export const maxDuration = 30
const fetchPublic = createPublicFetcher()
// Per-instance overload protection only; production-wide limits belong at the gateway.
let activeClones = 0
const MAX_RESPONSE_BYTES = 4_000_000

async function readInput(req: NextRequest): Promise<string> {
  if (!req.headers.get('content-type')?.toLowerCase().startsWith('application/json')) throw new CloneFetchError('Send a JSON request with a URL.')
  const reader = req.body?.getReader()
  if (!reader) throw new CloneFetchError('URL is required.')
  let timedOut = false
  const bodyTimeout = setTimeout(() => { timedOut = true; void reader.cancel().catch(() => {}) }, 3000)
  const chunks: Uint8Array[] = []
  let size = 0
  try {
    while (true) {
      const { value, done } = await reader.read()
      if (timedOut) throw new CloneFetchError('Request timed out.')
      if (done) break
      size += value.byteLength
      if (size > 4096) throw new CloneFetchError('Request is too large.')
      chunks.push(value)
    }
  } finally { clearTimeout(bodyTimeout); await reader.cancel().catch(() => {}); reader.releaseLock() }
  let body: unknown
  try { body = JSON.parse(Buffer.concat(chunks).toString('utf8')) } catch { throw new CloneFetchError('Invalid JSON request.') }
  if (!body || typeof body !== 'object' || !('url' in body) || typeof body.url !== 'string' || !body.url.trim()) throw new CloneFetchError('URL is required.')
  const input = body.url.trim()
  return parsePublicUrl(/^[a-z][a-z\d+.-]*:/i.test(input) ? input : `https://${input}`).href
}

function rewriteCss(css: string, base: string): string {
  return css.replace(/url\(\s*(['"]?)([^'"\)\s]+)\1\s*\)/gi, (_match, _quote, target: string) => {
    if (target.startsWith('data:') || target.startsWith('#')) return `url(${JSON.stringify(target)})`
    try { return `url(${JSON.stringify(parsePublicUrl(new URL(target, base).href).href)})` } catch { return 'url("")' }
  }).replace(/@import\s+(['"])([^'"]+)\1/gi, (_match, _quote, target: string) => {
    try { return `@import ${JSON.stringify(parsePublicUrl(new URL(target, base).href).href)}` } catch { return '@import ""' }
  }).replace(/<\/style/gi, '<\\/style')
}

async function mapLimited<T>(items: T[], work: (item: T) => Promise<void>) {
  let next = 0
  await Promise.all(Array.from({ length: Math.min(3, items.length) }, async () => {
    while (next < items.length) await work(items[next++])
  }))
}

export async function POST(req: NextRequest) {
  // Block cross-site browser invocation; API clients still need gateway quotas.
  const origin = req.headers.get('origin')
  if (origin && origin !== new URL(req.url).origin) return NextResponse.json({ error: 'Cross-site requests are not supported.' }, { status: 403 })
  if (activeClones >= 2) return NextResponse.json({ error: 'The cloner is busy. Please try again shortly.' }, { status: 429, headers: { 'Retry-After': '15' } })
  activeClones++
  try {
    let input: string
    try { input = await readInput(req) } catch { return NextResponse.json({ error: 'Enter a valid public HTTP/HTTPS URL in a JSON request (maximum 4 KB).' }, { status: 400 }) }
    const signal = AbortSignal.any([req.signal, AbortSignal.timeout(25_000)])
    const budget = { remaining: 2_000_000 }
    const page = await fetchPublic(input, { signal, budget, maxBytes: 1_000_000, allowedTypes: ['text/html', 'application/xhtml+xml'] })
    const $ = cheerio.load(page.text)
    // Resolve all relative resources against the final redirected URL, including
    // an original document base if it is safe. Never allow a target override.
    let resourceBase = page.url
    const originalBase = $('base[href]').first().attr('href')
    if (originalBase) {
      try { resourceBase = parsePublicUrl(new URL(originalBase, page.url).href).href } catch { /* use final URL */ }
    }
    $('base').remove()
    $('head').prepend($('<base>').attr('href', resourceBase))
    // Meta refresh could navigate an opaque preview to an attacker-controlled page.
    $('meta[http-equiv]').each((_i, el) => {
      if (/^(refresh|content-security-policy|x-frame-options)$/i.test($(el).attr('http-equiv') ?? '')) $(el).remove()
    })
    let cssInlined = 0
    let jsInlined = 0
    const styles = $('link[rel~="stylesheet"][href]').toArray()
    // Resource count, concurrency, per-resource bytes and total bytes are bounded.
    styles.slice(10).forEach(el => $(el).remove())
    await mapLimited(styles.slice(0, 10), async el => {
      try {
        const asset = await fetchPublic(new URL($(el).attr('href')!, resourceBase).href, {
          signal, budget, maxBytes: 128_000, allowedTypes: ['text/css'],
        })
        const style = $('<style>').text(rewriteCss(asset.text, asset.url))
        const media = $(el).attr('media')
        if (media) style.attr('media', media)
        $(el).replaceWith(style); cssInlined++
      } catch { $(el).remove() }
    })
    const scripts = $('script[src]').toArray()
    scripts.slice(8).forEach(el => $(el).remove())
    await mapLimited(scripts.slice(0, 8), async el => {
      try {
        const asset = await fetchPublic(new URL($(el).attr('src')!, resourceBase).href, {
          signal, budget, maxBytes: 128_000,
          allowedTypes: ['application/javascript', 'text/javascript', 'application/ecmascript', 'text/ecmascript'],
        })
        $(el).removeAttr('src').removeAttr('integrity').removeAttr('crossorigin')
          .text(asset.text.replace(/<\/script/gi, '<\\/script'))
        jsInlined++
      } catch { $(el).remove() }
    })
    signal.throwIfAborted()
    const html = $.html()
    // Preview is deliberately static; downloaded HTML remains untrusted active
    // source. The iframe MUST also have an empty sandbox (no same-origin/scripts).
    const preview = cheerio.load(html)
    preview('script, iframe, frame, object, embed').remove()
    preview('[srcdoc]').removeAttr('srcdoc')
    // No browser-side requests to untrusted addresses: the static preview uses
    // only server-validated inline CSS and embedded data assets.
    preview('a, area').removeAttr('href').removeAttr('target')
    preview('form').removeAttr('action').removeAttr('target')
    preview('link').remove()
    const policy = "default-src 'none'; script-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src data:; media-src 'none'; connect-src 'none'; frame-src 'none'; object-src 'none'; form-action 'none'; base-uri https: http:"
    preview('head').prepend(preview('<meta>').attr('http-equiv', 'Content-Security-Policy').attr('content', policy))
    const payload = { html, previewHtml: preview.html(), stats: { cssInlined, jsInlined, sizeBytes: Buffer.byteLength(html) } }
    // Measure JSON, not just HTML: escaping and the separate preview add bytes.
    const json = JSON.stringify(payload)
    if (Buffer.byteLength(json) > MAX_RESPONSE_BYTES) throw new CloneFetchError('The cloned page is too large. Try a smaller page.')
    return new NextResponse(json, { headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } })
  } catch (error) {
    // Never leak addresses, DNS errors, TLS internals or remote response text.
    return NextResponse.json({ error: error instanceof CloneFetchError ? error.message : 'The page could not be cloned safely. Try another public website.' }, { status: 422, headers: { 'Cache-Control': 'no-store' } })
  } finally { activeClones-- }
}
