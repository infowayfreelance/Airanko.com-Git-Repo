import { NextRequest, NextResponse } from 'next/server'

export interface MetaResult {
  url: string
  status: 'success' | 'error'
  error?: string
  // Basic meta
  title?: string
  description?: string
  canonical?: string
  robots?: string
  viewport?: string
  // Open Graph
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  ogUrl?: string
  ogType?: string
  ogSiteName?: string
  ogLocale?: string
  // Twitter Card
  twitterCard?: string
  twitterTitle?: string
  twitterDescription?: string
  twitterImage?: string
  twitterSite?: string
  twitterCreator?: string
  // Extra
  favicon?: string
  themeColor?: string
  keywords?: string
}

function getMeta(doc: string, attr: string, value: string, content = 'content'): string | undefined {
  // Matches <meta name="..." content="..."> or <meta property="..." content="...">
  const regex = new RegExp(
    `<meta[^>]+(?:${attr})=["']${value}["'][^>]+${content}=["']([^"']+)["'][^>]*>|<meta[^>]+${content}=["']([^"']+)["'][^>]+(?:${attr})=["']${value}["'][^>]*>`,
    'i'
  )
  const m = doc.match(regex)
  return m ? (m[1] || m[2] || undefined) : undefined
}

function getTag(doc: string, tag: string, attr?: string): string | undefined {
  if (attr) {
    const regex = new RegExp(`<${tag}[^>]+${attr}=["']([^"']+)["'][^>]*>`, 'i')
    const m = doc.match(regex)
    return m ? m[1] : undefined
  }
  const regex = new RegExp(`<${tag}[^>]*>([^<]+)<\/${tag}>`, 'i')
  const m = doc.match(regex)
  return m ? m[1].trim() : undefined
}

function resolveUrl(base: string, path: string): string {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  try {
    return new URL(path, base).toString()
  } catch {
    return path
  }
}

export async function POST(req: NextRequest) {
  let urls: string[] = []

  try {
    const body = await req.json()
    urls = body.urls
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!Array.isArray(urls) || urls.length === 0) {
    return NextResponse.json({ error: 'Provide at least one URL' }, { status: 400 })
  }

  const results: MetaResult[] = await Promise.all(
    urls.map(async (rawUrl): Promise<MetaResult> => {
      // Normalise URL
      let url = rawUrl.trim()
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url
      }

      try {
        new URL(url) // validate
      } catch {
        return { url, status: 'error', error: 'Invalid URL format' }
      }

      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 10000)

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
          return {
            url,
            status: 'error',
            error: `HTTP ${response.status} ${response.statusText}`,
          }
        }

        const contentType = response.headers.get('content-type') || ''
        if (!contentType.includes('text/html')) {
          return { url, status: 'error', error: 'URL does not return an HTML page' }
        }

        // Read only first 200kb to keep things fast
        const reader = response.body?.getReader()
        let html = ''
        let totalBytes = 0
        const maxBytes = 200 * 1024

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

        // Parse favicon from link tags
        const faviconMatch = html.match(
          /<link[^>]+rel=["'](?:shortcut icon|icon)["'][^>]+href=["']([^"']+)["'][^>]*>/i
        ) || html.match(
          /<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:shortcut icon|icon)["'][^>]*>/i
        )
        const faviconHref = faviconMatch ? faviconMatch[1] : '/favicon.ico'

        const result: MetaResult = {
          url,
          status: 'success',
          // Basic
          title: getTag(html, 'title'),
          description: getMeta(html, 'name', 'description'),
          canonical: (() => {
            const m = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/i)
              || html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["'][^>]*>/i)
            return m ? m[1] : undefined
          })(),
          robots: getMeta(html, 'name', 'robots'),
          viewport: getMeta(html, 'name', 'viewport'),
          keywords: getMeta(html, 'name', 'keywords'),
          themeColor: getMeta(html, 'name', 'theme-color'),
          favicon: resolveUrl(url, faviconHref),
          // Open Graph
          ogTitle: getMeta(html, 'property', 'og:title'),
          ogDescription: getMeta(html, 'property', 'og:description'),
          ogImage: getMeta(html, 'property', 'og:image'),
          ogUrl: getMeta(html, 'property', 'og:url'),
          ogType: getMeta(html, 'property', 'og:type'),
          ogSiteName: getMeta(html, 'property', 'og:site_name'),
          ogLocale: getMeta(html, 'property', 'og:locale'),
          // Twitter Card
          twitterCard: getMeta(html, 'name', 'twitter:card'),
          twitterTitle: getMeta(html, 'name', 'twitter:title'),
          twitterDescription: getMeta(html, 'name', 'twitter:description'),
          twitterImage: getMeta(html, 'name', 'twitter:image'),
          twitterSite: getMeta(html, 'name', 'twitter:site'),
          twitterCreator: getMeta(html, 'name', 'twitter:creator'),
        }

        return result
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.name === 'AbortError'
              ? 'Request timed out after 10s'
              : err.message
            : 'Unknown error'
        return { url, status: 'error', error: message }
      }
    })
  )

  return NextResponse.json({ results })
}
