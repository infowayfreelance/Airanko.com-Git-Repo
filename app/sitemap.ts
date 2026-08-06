import type { MetadataRoute } from 'next'

const BASE_URL = 'https://airanko.com'

// ── Tool pages ─────────────────────────────────────────────────────────────
// changeFrequency + priority chosen by traffic potential and update cadence.
const tools: { slug: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  // High-priority flagship tools (AI-powered, deeply documented)
  { slug: 'seo-strategy-maker',  priority: 0.9, changeFrequency: 'monthly' },
  { slug: 'site-audit',          priority: 0.9, changeFrequency: 'monthly' },
  { slug: 'content-optimizer',   priority: 0.9, changeFrequency: 'monthly' },
  { slug: 'keyword-research',    priority: 0.9, changeFrequency: 'monthly' },
  { slug: 'content-writer',      priority: 0.9, changeFrequency: 'monthly' },
  { slug: 'plagiarism-checker',  priority: 0.9, changeFrequency: 'monthly' },
  { slug: 'html-sitemap-generator', priority: 0.9, changeFrequency: 'monthly' },
  { slug: 'vibe-code-detector',  priority: 0.9, changeFrequency: 'monthly' },
  { slug: 'xml-sitemap-generator', priority: 0.9, changeFrequency: 'monthly' },

  // Specialized SEO + utility tools
  { slug: 'meta-checker',        priority: 0.8, changeFrequency: 'monthly' },
  { slug: 'meta-title-description-bulk-pixel-checker', priority: 0.8, changeFrequency: 'monthly' },
  { slug: 'meta-title-description-pixel-generator', priority: 0.8, changeFrequency: 'monthly' },
  { slug: 'mobile-checker',      priority: 0.8, changeFrequency: 'monthly' },
  { slug: 'link-extractor',      priority: 0.8, changeFrequency: 'monthly' },
  { slug: 'portfolio-recorder',  priority: 0.8, changeFrequency: 'monthly' },
  { slug: 'website-cloner',      priority: 0.7, changeFrequency: 'monthly' },

  // Image tools
  { slug: 'image-resizer',       priority: 0.8, changeFrequency: 'monthly' },
  { slug: 'bulk-image-resizer',  priority: 0.8, changeFrequency: 'monthly' },
  { slug: 'background-remover',  priority: 0.8, changeFrequency: 'monthly' },
  { slug: 'logo-generator',      priority: 0.7, changeFrequency: 'monthly' },
]

// ── Blog posts ─────────────────────────────────────────────────────────────
const blogPosts: { slug: string; priority: number }[] = [
  { slug: 'top-10-free-photo-cropping-tools', priority: 0.8 },
  { slug: 'top-10-mobile-friendly-websites', priority: 0.8 },
]

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
    ...blogPosts.map((p) => ({
      url: `${BASE_URL}/blog/${p.slug}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: p.priority,
    })),
    ...tools.map((t) => ({
      url: `${BASE_URL}/tools/${t.slug}`,
      lastModified,
      changeFrequency: t.changeFrequency,
      priority: t.priority,
    })),
  ]
}
