import { lookup } from 'node:dns/promises'
import { isIP } from 'node:net'
import { request as httpRequest } from 'node:http'
import { request as httpsRequest } from 'node:https'

export class CloneFetchError extends Error {
  constructor(message = 'The page could not be fetched safely.') { super(message); this.name = 'CloneFetchError' }
}
export interface Address { address: string; family: number }
export interface FetchResult { url: string; text: string; contentType: string }
export interface TransferBudget { remaining: number }
export interface WireResponse { status: number; location?: string; contentType: string; text: string }
export interface WireOptions { signal: AbortSignal; maxBytes: number; budget: TransferBudget }
export interface FetchDependencies {
  resolve: (hostname: string) => Promise<Address[]>
  request: (url: URL, address: Address, options: WireOptions) => Promise<WireResponse>
}

// Fail closed on special-purpose, local, multicast, documentation and transition ranges.
export function isPublicAddress(address: string): boolean {
  if (isIP(address) === 4) {
    const [a, b, c] = address.split('.').map(Number)
    return !(a === 0 || a === 10 || a === 127 || a >= 224 ||
      (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) || (a === 192 && (b === 168 || b === 0 || (b === 88 && c === 99))) ||
      (a === 198 && (b === 18 || b === 19 || (b === 51 && c === 100))) ||
      (a === 203 && b === 0 && c === 113))
  }
  if (isIP(address) !== 6 || address.includes('.')) return false
  const halves = address.toLowerCase().split('::')
  const left = halves[0] ? halves[0].split(':') : []
  const right = halves[1] ? halves[1].split(':') : []
  const words = halves.length === 2 ? [...left, ...Array(8 - left.length - right.length).fill('0'), ...right] : left
  if (words.length !== 8) return false
  const [a, b] = words.map(x => parseInt(x, 16))
  return a >= 0x2000 && a <= 0x3fff &&
    !(a === 0x2001 && (b < 0x200 || b === 0xdb8)) && a !== 0x2002 && a !== 0x3fff
}

export function parsePublicUrl(input: string): URL {
  if (input.length > 2048 || /[\u0000-\u0020\u007f\\]/.test(input)) throw new CloneFetchError('Enter a valid public HTTP or HTTPS URL.')
  let url: URL
  try { url = new URL(input) } catch { throw new CloneFetchError('Enter a valid public HTTP or HTTPS URL.') }
  const host = url.hostname.replace(/^\[|\]$/g, '').toLowerCase().replace(/\.$/, '')
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.port ||
      !host || host === 'localhost' || /\.(localhost|local|internal|home|lan|test|invalid|example)$/.test(host) ||
      (!isIP(host) && !host.includes('.')) || (isIP(host) && !isPublicAddress(host))) {
    throw new CloneFetchError('Only public HTTP/HTTPS websites on standard ports are supported.')
  }
  url.hash = ''
  return url
}

async function abortable<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
  signal.throwIfAborted()
  return new Promise<T>((resolve, reject) => {
    const abort = () => reject(new CloneFetchError('The page took too long to respond.'))
    signal.addEventListener('abort', abort, { once: true })
    promise.then(resolve, reject).finally(() => signal.removeEventListener('abort', abort))
  })
}

// Connect to the validated IP, not the hostname: there is no second DNS lookup
// between validation and connection. Host and TLS SNI retain the original name.
export function requestPinned(url: URL, address: Address, options: WireOptions, transport?: typeof httpRequest): Promise<WireResponse> {
  return new Promise((resolve, reject) => {
    const request = transport ?? (url.protocol === 'https:' ? httpsRequest : httpRequest)
    const hostname = url.hostname.replace(/^\[|\]$/g, '')
    const req = request({
      protocol: url.protocol, hostname: address.address, family: address.family,
      port: url.protocol === 'https:' ? 443 : 80, path: url.pathname + url.search,
      ...(url.protocol === 'https:' && !isIP(hostname) ? { servername: hostname } : {}),
      headers: { Host: url.host, 'User-Agent': 'AirankoWebsiteCloner/1.0', Accept: 'text/html,text/css,text/javascript,application/javascript', 'Accept-Encoding': 'identity' },
      agent: false, signal: options.signal, maxHeaderSize: 16384,
    }, res => {
      const status = res.statusCode ?? 0
      const location = res.headers.location
      const contentType = String(res.headers['content-type'] ?? '').split(';')[0].trim().toLowerCase()
      if ([301, 302, 303, 307, 308].includes(status)) {
        res.destroy(); resolve({ status, location, contentType, text: '' }); return
      }
      const encoding = res.headers['content-encoding']
      const length = Number(res.headers['content-length'])
      if (status < 200 || status >= 300 || (encoding && encoding !== 'identity') ||
          (Number.isFinite(length) && (length > options.maxBytes || length > options.budget.remaining))) {
        res.destroy(); reject(new CloneFetchError()); return
      }
      const chunks: Buffer[] = []
      let bytes = 0
      res.on('data', (chunk: Buffer) => {
        bytes += chunk.length
        options.budget.remaining -= chunk.length
        if (bytes > options.maxBytes || options.budget.remaining < 0) {
          res.destroy(new CloneFetchError('The page is too large to clone.')); return
        }
        chunks.push(chunk)
      })
      res.on('end', () => resolve({ status, contentType, text: Buffer.concat(chunks).toString('utf8') }))
      res.on('error', reject)
      res.on('aborted', () => reject(new CloneFetchError()))
    })
    req.on('error', () => reject(new CloneFetchError()))
    req.end()
  })
}

export function createPublicFetcher(deps: FetchDependencies = {
  resolve: hostname => lookup(hostname, { all: true, verbatim: true }), request: requestPinned,
}) {
  return async (input: string, options: WireOptions & { allowedTypes: readonly string[] }): Promise<FetchResult> => {
    let url = parsePublicUrl(input)
    for (let hop = 0; hop <= 3; hop++) {
      options.signal.throwIfAborted()
      const hostname = url.hostname.replace(/^\[|\]$/g, '').replace(/\.$/, '')
      const addresses = isIP(hostname) ? [{ address: hostname, family: isIP(hostname) }] :
        await abortable(deps.resolve(hostname), options.signal)
      if (!addresses.length || addresses.some(a => !isPublicAddress(a.address) || isIP(a.address) !== a.family)) throw new CloneFetchError()
      const response = await deps.request(url, addresses[0], options)
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        if (!response.location || hop === 3) throw new CloneFetchError('Too many redirects.')
        url = parsePublicUrl(new URL(response.location, url).href)
        continue
      }
      if (response.status < 200 || response.status >= 300 || !options.allowedTypes.includes(response.contentType)) throw new CloneFetchError('The website returned an unsupported response.')
      return { url: url.href, text: response.text, contentType: response.contentType }
    }
    throw new CloneFetchError()
  }
}
