import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import vm from 'node:vm'
import { createPublicFetcher, CloneFetchError, parsePublicUrl } from '../lib/website-cloner/public-fetch.ts'

const require = createRequire(import.meta.url)
const ts = require('typescript')
const cheerio = require('cheerio')
const source = readFileSync(new URL('../app/api/website-cloner/route.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText
const publicIP = { address: '93.184.216.34', family: 4 }
function loadRoute(fetcher, { fastBodyTimeout = false } = {}) {
  const module = { exports: {} }
  vm.runInNewContext(compiled, {
    module, exports: module.exports, Buffer, URL, AbortSignal, Uint8Array,
    setTimeout: fastBodyTimeout ? (callback, _delay) => setTimeout(callback, 5) : setTimeout,
    clearTimeout,
    require: name => name === '@/lib/website-cloner/public-fetch' ? {
      createPublicFetcher: () => fetcher, CloneFetchError, parsePublicUrl,
    } : require(name),
  }, { filename: 'website-cloner-route.cjs' })
  return module.exports.POST
}
function request(body = { url: 'https://example.com' }, headers = {}, extra = {}) {
  return new Request('https://airanko.com/api/website-cloner', { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: typeof body === 'string' ? body : JSON.stringify(body), ...extra })
}
function fixtureFetcher(routes, seen = []) {
  return createPublicFetcher({
    resolve: async hostname => hostname === 'private.example.net' ? [{ address: '10.0.0.1', family: 4 }] : [publicIP],
    request: async (url, _address, options) => {
      seen.push(url.href)
      const response = routes[url.href]
      if (!response) throw new CloneFetchError()
      const bytes = Buffer.byteLength(response.text ?? '')
      options.budget.remaining -= bytes
      if (bytes > options.maxBytes || options.budget.remaining < 0) throw new CloneFetchError()
      return { status: 200, contentType: 'text/html', text: '', ...response }
    },
  })
}

test('input errors and cross-origin requests never trigger outbound fetch', async () => {
  let calls = 0
  const post = loadRoute(async () => { calls++; throw new Error('must not fetch') })
  for (const body of ['{', '{}', '{"url":5}', JSON.stringify({ url: 'http://127.0.0.1' }), JSON.stringify({ url: 'http://[::ffff:7f00:1]' }), JSON.stringify({ url: 'https://example.com', junk: 'a'.repeat(4096) })]) {
    assert.equal((await post(request(body))).status, 400)
  }
  assert.equal((await post(request({ url: 'https://example.com' }, { Origin: 'https://evil.example.net' }))).status, 403)
  assert.equal(calls, 0)
})

test('redirected document and CSS resource bases are used, unsafe subresources removed', async () => {
  const seen = []
  const routes = {
    'https://example.com/': { status: 302, location: '/new/page' },
    'https://example.com/new/page': { text: '<html><head><link rel="stylesheet" href="styles/site.css"><link rel="stylesheet" href="http://127.0.0.1/secret"><link rel="stylesheet" href="redirect.css"></head><body><script src="app.js"></script><script src="http://private.example.net/a.js"></script></body></html>' },
    'https://example.com/new/styles/site.css': { status: 302, location: 'https://cdn.example.net/css/theme.css' },
    'https://cdn.example.net/css/theme.css': { contentType: 'text/css', text: '.hero { background: url(../image.png) }' },
    'https://example.com/new/redirect.css': { status: 302, location: 'http://169.254.169.254/metadata' },
    'https://example.com/new/app.js': { contentType: 'application/javascript', text: 'window.downloadOnly = true;' },
  }
  const response = await loadRoute(fixtureFetcher(routes, seen))(request())
  assert.equal(response.status, 200)
  const result = await response.json()
  assert.equal(result.stats.cssInlined, 1); assert.equal(result.stats.jsInlined, 1)
  assert.match(result.html, /https:\/\/cdn.example.net\/image.png/)
  assert.match(result.html, /<base href="https:\/\/example.com\/new\/page">/)
  assert.match(result.html, /window.downloadOnly/)
  assert.doesNotMatch(result.html, /127\.0\.0\.1|169\.254\.169\.254|private\.example\.net/)
  assert.ok(seen.includes('https://example.com/new/app.js'))
  assert.ok(!seen.some(url => /127\.0\.0\.1|169\.254|private\.example/.test(url)))
})

test('preview CSP comes first; scripts, frames, srcdoc, refresh and navigable links are removed', async () => {
  const html = '<html><head><meta http-equiv="Content-Security-Policy" content="default-src *"><meta http-equiv="refresh" content="0;url=https://evil.example.net"><base href="https://example.com/assets/" target="_top"></head><body><script>alert(1)</script><iframe srcdoc="hi"></iframe><object data="https://evil.example.net"></object><embed src="https://evil.example.net"><a href="https://evil.example.net" target="_top">go</a><form action="https://evil.example.net"><input></form><div srcdoc="malicious" style="background:url(https://127.0.0.1/x)"></div><img src="https://127.0.0.1/x"></body></html>'
  const response = await loadRoute(fixtureFetcher({ 'https://example.com/': { text: html } }))(request())
  assert.equal(response.status, 200)
  const { previewHtml, html: downloadHtml } = await response.json()
  const $ = cheerio.load(previewHtml)
  assert.equal($('head').children().first().attr('http-equiv'), 'Content-Security-Policy')
  assert.equal($('script,iframe,frame,object,embed,[srcdoc],a[href],form[action],base[target]').length, 0)
  assert.equal($('meta[http-equiv="refresh"]').length, 0)
  const policy = $('meta[http-equiv="Content-Security-Policy"]').attr('content')
  assert.equal($('meta[http-equiv="Content-Security-Policy"]').length, 1)
  for (const directive of ["default-src 'none'", "script-src 'none'", "style-src 'unsafe-inline'", 'img-src data:', 'font-src data:', "connect-src 'none'", "form-action 'none'"]) assert.ok(policy.includes(directive), directive)
  assert.ok(!/img-src[^;]*https:|font-src[^;]*https:|style-src[^;]*https:/.test(policy))
  assert.match(downloadHtml, /alert\(1\)/) // downloadable source remains explicitly untrusted
})

test('serialized response size cap accounts for both HTML copies and JSON escaping', async () => {
  const text = `<html><body><pre>${'\u0001'.repeat(400_000)}</pre></body></html>`
  const response = await loadRoute(fixtureFetcher({ 'https://example.com/': { text } }))(request())
  assert.equal(response.status, 422)
  assert.match((await response.json()).error, /too large/)
})

test('slow input is cancelled and releases an active request slot', async () => {
  let cancelled = false
  const post = loadRoute(async () => { throw new CloneFetchError() }, { fastBodyTimeout: true })
  const body = new ReadableStream({ cancel() { cancelled = true } })
  const response = await post(request('', {}, { body, duplex: 'half' }))
  assert.equal(response.status, 400); assert.equal(cancelled, true)
  // A later invalid request is input-invalid, not stuck in an overload response.
  assert.equal((await post(request('{}'))).status, 400)
})

test('resource counts are bounded and internal errors are not exposed', async () => {
  let calls = 0
  const html = '<head>' + '<link rel="stylesheet" href="/style.css">'.repeat(50) + '</head><body>' + '<script src="/app.js"></script>'.repeat(50) + '</body>'
  const post = loadRoute(async (url) => {
    calls++
    if (url === 'https://example.com/') return { url, text: html, contentType: 'text/html' }
    throw new Error('SECRET_INTERNAL_ADDRESS')
  })
  const response = await post(request()); assert.equal(response.status, 200)
  assert.equal(calls, 19)
  assert.doesNotMatch(JSON.stringify(await response.json()), /SECRET_INTERNAL_ADDRESS/)
  const errorResponse = await loadRoute(async () => { throw new Error('SECRET_TLS_DETAIL') })(request())
  assert.equal(errorResponse.status, 422)
  assert.doesNotMatch(JSON.stringify(await errorResponse.json()), /SECRET_TLS_DETAIL/)
})
