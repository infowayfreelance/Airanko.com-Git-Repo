import type { MetadataRoute } from 'next'
import fs from 'fs'
import path from 'path'

const BASE_URL = 'https://airanko.com'

// ──────────────────────────────────────────────────────────────────────────
// Tool & blog URLs are discovered dynamically from the app directory
// structure (app/tools/<slug>/page.tsx, app/blog/<slug>/page.tsx) instead
// of a hand-maintained list — a new tool or blog post folder is picked up
// automatically the next time this route is requested, so the sitemap can
// no longer silently drift out of sync with what's actually live.
//
// Priority/changeFrequency still come from a small override map below (some
// tools genuinely deserve higher priority than others), but that map only
// ever *tunes* an entry that's already guaranteed to be present — it can
// never cause a live route to be missing from the sitemap.
// ──────────────────────────────────────────────────────────────────────────

type ChangeFreq = MetadataRoute.Sitemap[number]['changeFrequency']

const DEFAULT_TOOL_PRIORITY = 0.8
const DEFAULT_TOOL_CHANGEFREQ: ChangeFreq = 'monthly'
const DEFAULT_BLOG_PRIORITY = 0.7
const DEFAULT_BLOG_CHANGEFREQ: ChangeFreq = 'monthly'

// Flagship, deeply-documented, AI-powered tools — worth a higher crawl priority.
const HIGH_PRIORITY_TOOLS = new Set([
  'seo-strategy-maker',
  'site-audit',
  'content-optimizer',
  'content-writer',
  'plagiarism-checker',
  'html-sitemap-generator',
  'vibe-code-detector',
  'vibe-code-security-scanner',
  'xml-sitemap-generator',
])

// Lower-priority utility tools.
const LOW_PRIORITY_TOOLS = new Set(['website-cloner'])

const BLOG_PRIORITY_OVERRIDES: Record<string, number> = {
  'top-10-free-photo-cropping-tools': 0.8,
  'top-10-mobile-friendly-websites': 0.8,
}

function toolPriority(slug: string): number {
  if (HIGH_PRIORITY_TOOLS.has(slug)) return 0.9
  if (LOW_PRIORITY_TOOLS.has(slug)) return 0.7
  return DEFAULT_TOOL_PRIORITY
}

/** Route groups like (marketing) and files like _components should never surface as URLs. */
function isRoutableSlug(name: string): boolean {
  return !name.startsWith('(') && !name.startsWith('_') && !name.startsWith('.')
}

/** A page.tsx whose body is just a redirect isn't real content — it 30x's straight to another sitemap entry. */
function isRedirectOnlyPage(pageFile: string): boolean {
  try {
    const content = fs.readFileSync(pageFile, 'utf-8')
    return /\b(permanentRedirect|redirect)\s*\(/.test(content)
  } catch {
    return false
  }
}

function discoverSlugs(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && isRoutableSlug(entry.name))
    .map((entry) => entry.name)
    .filter((slug) => {
      const pageFile = path.join(dir, slug, 'page.tsx')
      return fs.existsSync(pageFile) && !isRedirectOnlyPage(pageFile)
    })
    .sort()
}

const toolSlugs = discoverSlugs(path.join(process.cwd(), 'app', 'tools'))
const blogSlugs = discoverSlugs(path.join(process.cwd(), 'app', 'blog'))

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  return [
    {
      url: BASE_URL,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/sitemap`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/privacy-policy`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms-and-conditions`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/cookie-policy`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    ...blogSlugs.map((slug) => ({
      url: `${BASE_URL}/blog/${slug}`,
      lastModified,
      changeFrequency: DEFAULT_BLOG_CHANGEFREQ,
      priority: BLOG_PRIORITY_OVERRIDES[slug] ?? DEFAULT_BLOG_PRIORITY,
    })),
    ...toolSlugs.map((slug) => ({
      url: `${BASE_URL}/tools/${slug}`,
      lastModified,
      changeFrequency: DEFAULT_TOOL_CHANGEFREQ,
      priority: toolPriority(slug),
    })),
  ]
}
