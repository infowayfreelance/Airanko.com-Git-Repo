import { NextRequest, NextResponse } from 'next/server'

export interface ExtractedLink {
  href: string
  text: string
  type: 'internal' | 'external' | 'mailto' | 'tel' | 'anchor' | 'file'
  rel: string | null
  target: string | null
  isNofollow: boolean
  domain: string
}

export interface LinkExtractResult {
  url: string
  finalUrl: string
  status: 'success' | 'error'
  error?: string
  pageTitle?: string
  totalLinks: number
  uniqueLinks: number
  internalCount: number
  externalCount: number
  nofollowCount: number
  domains: string[]
  links: ExtractedLink[]
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
}

function stripTags(s: string): string {
  return s.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function classifyLink(
  href: string,
  baseHost: string,
): ExtractedLink['type'] {
  const lower = href.toLowerCase().trim()
  if (lower.startsWith('mailto:')) return 'mailto'
  if (lower.startsWith('tel:')) return 'tel'
  if (lower.startsWith('#')) return 'anchor'

  const fileExt = lower.split('?')[0].split('#')[0].split('.').pop() || ''
  const fileExts = [
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
    'zip', 'rar', '7z', 'tar', 'gz',
    'mp3', 'mp4', 'mov', 'avi', 'wav', 'm4a',
    'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico',
    'csv', 'json', 'xml', 'txt',
  ]

  try {
    const u = new URL(href)
    const isFile = fileExts.includes(fileExt)
    if (isFile) return 'file'
    return u.host === baseHost ? 'internal' : 'external'
  } catch {
    return 'internal'
  }
}

export async function POST(req: NextRequest) {
  let rawUrl = ''

  try {
    const body = await req.json()
    rawUrl = (body.url || '').trim()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!rawUrl) {
    return NextResponse.json({ error: 'Provide a URL' }, { status: 400 })
  }

  let url = rawUrl
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url
  }

  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
  } catch {
    const errResult: LinkExtractResult = {
      url: rawUrl,
      finalUrl: url,
      status: 'error',
      error: 'Invalid URL format',
      totalLinks: 0,
      uniqueLinks: 0,
      internalCount: 0,
      externalCount: 0,
      nofollowCount: 0,
      domains: [],
      links: [],
    }
    return NextResponse.json(errResult, { status: 200 })
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; AiRankoBot/1.0; +https://airanko.com/bot)',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      redirect: 'follow',
    })
    clearTimeout(timeout)

    if (!response.ok) {
      const errResult: LinkExtractResult = {
        url: rawUrl,
        finalUrl: response.url || url,
        status: 'error',
        error: `HTTP ${response.status} ${response.statusText}`,
        totalLinks: 0,
        uniqueLinks: 0,
        internalCount: 0,
        externalCount: 0,
        nofollowCount: 0,
        domains: [],
        links: [],
      }
      return NextResponse.json(errResult, { status: 200 })
    }

    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('text/html') && !contentType.includes('xml')) {
      const errResult: LinkExtractResult = {
        url: rawUrl,
        finalUrl: response.url || url,
        status: 'error',
        error: 'URL does not return an HTML page',
        totalLinks: 0,
        uniqueLinks: 0,
        internalCount: 0,
        externalCount: 0,
        nofollowCount: 0,
        domains: [],
        links: [],
      }
      return NextResponse.json(errResult, { status: 200 })
    }

    // Read up to ~3MB to support larger pages
    const reader = response.body?.getReader()
    let html = ''
    let totalBytes = 0
    const maxBytes = 3 * 1024 * 1024

    if (reader) {
      const decoder = new TextDecoder()
      while (totalBytes < maxBytes) {
        const { done, value } = await reader.read()
        if (done) break
        html += decoder.decode(value, { stream: true })
        totalBytes += value.byteLength
      }
      reader.cancel()
    }

    const finalUrl = response.url || url
    let baseHost = parsedUrl.host
    try {
      baseHost = new URL(finalUrl).host
    } catch {
      // ignore
    }

    // Page title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const pageTitle = titleMatch ? decodeEntities(titleMatch[1]).trim() : undefined

    // Detect <base href="...">
    const baseMatch = html.match(/<base[^>]+href=["']([^"']+)["'][^>]*>/i)
    let baseForResolve = finalUrl
    if (baseMatch) {
      try {
        baseForResolve = new URL(baseMatch[1], finalUrl).toString()
      } catch {
        // ignore
      }
    }

    // Extract anchor tags with attributes and inner content
    // Capture: full tag, then process attrs + inner text
    const anchorRegex =
      /<a\b([^>]*?)>([\s\S]*?)<\/a\s*>/gi

    const links: ExtractedLink[] = []
    let match: RegExpExecArray | null

    while ((match = anchorRegex.exec(html)) !== null) {
      const attrs = match[1]
      const inner = match[2]

      const hrefMatch = attrs.match(/\bhref\s*=\s*["']([^"']*)["']/i)
      if (!hrefMatch) continue
      const rawHref = decodeEntities(hrefMatch[1]).trim()
      if (!rawHref) continue

      // Skip JS pseudo-links
      if (/^javascript:/i.test(rawHref)) continue

      let resolved = rawHref
      if (
        !rawHref.startsWith('mailto:') &&
        !rawHref.startsWith('tel:') &&
        !rawHref.startsWith('#')
      ) {
        try {
          resolved = new URL(rawHref, baseForResolve).toString()
        } catch {
          resolved = rawHref
        }
      }

      const relMatch = attrs.match(/\brel\s*=\s*["']([^"']*)["']/i)
      const targetMatch = attrs.match(/\btarget\s*=\s*["']([^"']*)["']/i)
      const rel = relMatch ? relMatch[1].trim() : null
      const target = targetMatch ? targetMatch[1].trim() : null
      const isNofollow = !!rel && /\bnofollow\b/i.test(rel)

      const text = decodeEntities(stripTags(inner)) || '(no text)'

      const type = classifyLink(resolved, baseHost)

      let domain = ''
      try {
        domain = new URL(resolved).host
      } catch {
        domain = ''
      }

      links.push({
        href: resolved,
        text: text.length > 300 ? text.slice(0, 300) + '…' : text,
        type,
        rel,
        target,
        isNofollow,
        domain,
      })
    }

    // Compute uniqueness by href
    const seen = new Set<string>()
    const uniqueLinks = links.filter((l) => {
      if (seen.has(l.href)) return false
      seen.add(l.href)
      return true
    })

    const domains = Array.from(
      new Set(uniqueLinks.map((l) => l.domain).filter(Boolean)),
    ).sort()

    const internalCount = uniqueLinks.filter((l) => l.type === 'internal').length
    const externalCount = uniqueLinks.filter((l) => l.type === 'external').length
    const nofollowCount = uniqueLinks.filter((l) => l.isNofollow).length

    const result: LinkExtractResult = {
      url: rawUrl,
      finalUrl,
      status: 'success',
      pageTitle,
      totalLinks: links.length,
      uniqueLinks: uniqueLinks.length,
      internalCount,
      externalCount,
      nofollowCount,
      domains,
      links: uniqueLinks,
    }

    return NextResponse.json(result)
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.name === 'AbortError'
          ? 'Request timed out after 15s'
          : err.message
        : 'Unknown error'

    const errResult: LinkExtractResult = {
      url: rawUrl,
      finalUrl: url,
      status: 'error',
      error: message,
      totalLinks: 0,
      uniqueLinks: 0,
      internalCount: 0,
      externalCount: 0,
      nofollowCount: 0,
      domains: [],
      links: [],
    }
    return NextResponse.json(errResult, { status: 200 })
  }
}
