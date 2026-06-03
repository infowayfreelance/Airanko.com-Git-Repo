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

  // Specialized SEO + utility tools
  { slug: 'meta-checker',        priority: 0.8, changeFrequency: 'monthly' },
  { slug: 'mobile-checker',      priority: 0.8, changeFrequency: 'monthly' },
  { slug: 'link-extractor',      priority: 0.8, changeFrequency: 'monthly' },
  { slug: 'portfolio-recorder',  priority: 0.8, changeFrequency: 'monthly' },

  // Image tools
  { slug: 'image-resizer',       priority: 0.8, changeFrequency: 'monthly' },
  { slug: 'bulk-image-resizer',  priority: 0.8, changeFrequency: 'monthly' },
  { slug: 'background-remover',  priority: 0.8, changeFrequency: 'monthly' },
  { slug: 'logo-generator',      priority: 0.7, changeFrequency: 'monthly' },
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
    ...tools.map((t) => ({
      url: `${BASE_URL}/tools/${t.slug}`,
      lastModified,
      changeFrequency: t.changeFrequency,
      priority: t.priority,
    })),
  ]
}
