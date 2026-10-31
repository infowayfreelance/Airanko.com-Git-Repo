import { test } from 'node:test'
import assert from 'node:assert/strict'
import { PassThrough } from 'node:stream'
import { EventEmitter } from 'node:events'
// Node 24 strips TypeScript for these dependency-free security unit tests.
import { createPublicFetcher, isPublicAddress, parsePublicUrl, requestPinned } from '../lib/website-cloner/public-fetch.ts'

const options = () => ({ signal: AbortSignal.timeout(1000), maxBytes: 1000, budget: { remaining: 2000 }, allowedTypes: ['text/html'] })
const publicIP = { address: '93.184.216.34', family: 4 }
const ok = { status: 200, contentType: 'text/html', text: '<h1>ok</h1>' }

test('rejects private, mapped, documentation, transition and reserved addresses', () => {
  for (const ip of ['0.0.0.0', '10.0.0.1', '127.0.0.1', '169.254.169.254', '172.16.1.1', '192.168.1.1', '100.64.0.1', '198.18.0.1', '192.0.2.1', '198.51.100.1', '203.0.113.1', '224.0.0.1', '255.255.255.255', '::', '::1', '::ffff:127.0.0.1', '::ffff:7f00:1', 'fc00::1', 'fe80::1', 'ff00::1', '2001:db8::1', '2002:7f00:1::', '64:ff9b::7f00:1', '3fff::1']) assert.equal(isPublicAddress(ip), false, ip)
  for (const ip of ['93.184.216.34', '8.8.8.8', '2606:4700:4700::1111', '2001:4860:4860::8888']) assert.equal(isPublicAddress(ip), true, ip)
})
test('rejects URL bypasses, credentials, nonstandard ports and local names', () => {
  for (const url of ['file:///etc/passwd', 'ftp://example.com', 'http://127.1', 'http://2130706433', 'http://0x7f000001', 'http://[::ffff:7f00:1]', 'http://localhost.', 'http://metadata.internal', 'https://user:pass@example.com', 'http://example.com:3000', 'http://example.com\\@127.0.0.1', 'http://example.com\n']) assert.throws(() => parsePublicUrl(url), undefined, url)
  assert.equal(parsePublicUrl('https://example.com:443/a#fragment').href, 'https://example.com/a')
})
test('pins validated address to request without resolving twice', async () => {
  let lookups = 0
  const fetcher = createPublicFetcher({ resolve: async () => { lookups++; return lookups === 1 ? [publicIP] : [{ address: '127.0.0.1', family: 4 }] }, request: async (url, pin) => { assert.equal(url.hostname, 'example.com'); assert.deepEqual(pin, publicIP); return ok } })
  assert.equal((await fetcher('https://example.com', options())).text, ok.text)
  assert.equal(lookups, 1)
})
test('rejects mixed DNS answers before transport', async () => {
  let requests = 0
  const fetcher = createPublicFetcher({ resolve: async () => [publicIP, { address: '10.0.0.2', family: 4 }], request: async () => { requests++; return ok } })
  await assert.rejects(fetcher('https://example.com', options())); assert.equal(requests, 0)
})
test('validates redirect IPs and DNS again, including protocol-relative redirects', async () => {
  for (const location of ['http://127.0.0.1', '//internal.example.net/private', 'file:///etc/passwd']) {
    let requests = 0
    const fetcher = createPublicFetcher({ resolve: async host => host === 'example.com' ? [publicIP] : [{ address: '169.254.169.254', family: 4 }], request: async () => { requests++; return { ...ok, status: 302, location } } })
    await assert.rejects(fetcher('https://example.com', options())); assert.equal(requests, 1)
  }
})
test('limits redirect chain and keeps final URL for relative assets', async () => {
  let requests = 0
  const deps = { resolve: async () => [publicIP], request: async () => { requests++; return { ...ok, status: 302, location: '/again' } } }
  await assert.rejects(createPublicFetcher(deps)('https://example.com', options())); assert.equal(requests, 4)
  requests = 0
  deps.request = async () => ++requests === 1 ? { ...ok, status: 302, location: '/new/path' } : ok
  assert.equal((await createPublicFetcher(deps)('https://example.com', options())).url, 'https://example.com/new/path')
})
test('rejects unsupported MIME, errors and mismatched address families', async () => {
  for (const response of [{ ...ok, status: 404 }, { ...ok, contentType: 'application/octet-stream' }]) {
    await assert.rejects(createPublicFetcher({ resolve: async () => [publicIP], request: async () => response })('https://example.com', options()))
  }
  await assert.rejects(createPublicFetcher({ resolve: async () => [{ ...publicIP, family: 6 }], request: async () => ok })('https://example.com', options()))
})
test('aborted or hanging DNS cannot reach transport', async () => {
  let requests = 0
  const controller = new AbortController()
  const fetcher = createPublicFetcher({ resolve: () => new Promise(() => {}), request: async () => { requests++; return ok } })
  const result = fetcher('https://example.com', { ...options(), signal: controller.signal })
  controller.abort()
  await assert.rejects(result); assert.equal(requests, 0)
})

function fakeTransport({ headers = { 'content-type': 'text/html' }, status = 200, chunks = [] } = {}, inspect = () => {}) {
  return (config, onResponse) => {
    inspect(config)
    const req = new EventEmitter()
    req.end = () => queueMicrotask(() => {
      const res = new PassThrough()
      res.statusCode = status; res.headers = headers
      onResponse(res)
      for (const chunk of chunks) if (!res.destroyed) res.write(Buffer.from(chunk))
      if (!res.destroyed) res.end()
    })
    return req
  }
}
test('wire transport connects only to pinned IP with original Host and TLS identity', async () => {
  const result = await requestPinned(new URL('https://example.com/path?q=1'), publicIP, options(), fakeTransport({ chunks: ['abc'] }, config => {
    assert.equal(config.hostname, publicIP.address)
    assert.equal(config.servername, 'example.com')
    assert.equal(config.headers.Host, 'example.com')
    assert.equal(config.path, '/path?q=1')
    assert.equal(config.agent, false)
    assert.equal(config.headers['Accept-Encoding'], 'identity')
  }))
  assert.equal(result.text, 'abc')
})
test('wire enforces declared and streamed limits, shared budget, compression rejection', async () => {
  const url = new URL('https://example.com')
  await assert.rejects(requestPinned(url, publicIP, options(), fakeTransport({ headers: { 'content-length': '1001' } })))
  await assert.rejects(requestPinned(url, publicIP, options(), fakeTransport({ chunks: ['x'.repeat(1001)] })))
  await assert.rejects(requestPinned(url, publicIP, { ...options(), budget: { remaining: 2 } }, fakeTransport({ chunks: ['abc'] })))
  await assert.rejects(requestPinned(url, publicIP, options(), fakeTransport({ headers: { 'content-encoding': 'gzip' } })))
  const opts = options()
  await requestPinned(url, publicIP, opts, fakeTransport({ chunks: ['abc', 'def'] }))
  assert.equal(opts.budget.remaining, 1994)
})
test('wire stops redirect response bodies without consuming them', async () => {
  const result = await requestPinned(new URL('https://example.com'), publicIP, options(), fakeTransport({ status: 302, headers: { location: '/next' }, chunks: ['x'.repeat(1001)] }))
  assert.equal(result.location, '/next'); assert.equal(result.text, '')
})
