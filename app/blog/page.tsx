import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Zap, Calendar, Clock, ArrowRight, Smartphone, ImageIcon, Bot, Search } from 'lucide-react'
import Navbar from '@/components/navbar'
import { CookieSettingsLink } from '@/components/cookie-consent/cookie-settings-link'

export const metadata: Metadata = {
  title: 'Blog — SEO, AI, and Web Performance Insights | Ai Ranko',
  description:
    'Practical guides on SEO, AI-powered content, mobile performance, and the tools modern marketers use every day. Written by the Ai Ranko team.',
  keywords:
    'SEO blog, AI content tips, mobile performance guides, free SEO tools blog, image optimization, content marketing, web performance, digital marketing tips',
  alternates: { canonical: 'https://airanko.com/blog' },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large', 'max-video-preview': -1 },
  },
  openGraph: {
    title: 'Blog — SEO, AI, and Web Performance Insights | Ai Ranko',
    description: 'Practical guides on SEO, AI-powered content, mobile performance, and the tools modern marketers use every day.',
    url: 'https://airanko.com/blog',
    siteName: 'Ai Ranko',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20and%20converter%20tool%20open%20graph-airanko-fRSh9KtchB104ghNi32hTIxcT2OE87.webp',
        width: 1200,
        height: 630,
        alt: 'Ai Ranko Blog — SEO, AI, and Web Performance Insights',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog — SEO, AI, and Web Performance Insights | Ai Ranko',
    description: 'Practical guides on SEO, AI-powered content, mobile performance, and the tools modern marketers use every day.',
    images: [
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20and%20converter%20tool%20open%20graph-airanko-fRSh9KtchB104ghNi32hTIxcT2OE87.webp',
    ],
  },
}

type Post = {
  slug: string
  title: string
  excerpt: string
  date: string
  readingTime: string
  category: string
  icon: typeof Smartphone
}

const posts: Post[] = [
  {
    "slug": "title-tag-pixel-width-explained",
    "title": "Title Tag Pixel Width Explained — and How to Bulk-Check Yours",
    "excerpt": "Learn why title pixel width matters more than character count, what estimated limits mean, and how to bulk-check desktop and mobile widths from a sitemap.",
    "readingTime": "9 min read",
    "category": "SEO",
    "date": "November 27, 2026",
    icon: Search,
  },
  {
    "slug": "how-to-build-an-seo-strategy-for-a-new-website",
    "title": "How to Build an SEO Strategy for a New Website (With a Free AI Strategy Creator)",
    "excerpt": "Build an SEO strategy for a new website: set goals, map keywords, plan pages and content, fix technical basics and try Ai Ranko’s free AI planner.",
    "readingTime": "10 min read",
    "category": "SEO",
    "date": "November 26, 2026",
    icon: Search,
  },
  {
    "slug": "how-to-check-meta-tags-on-any-website",
    "title": "How to Check Meta Tags on Any Website (Title, Description, Open Graph and More)",
    "excerpt": "Check any page's title, description, robots, canonical and Open Graph tags three ways: page source, DevTools and a free bulk meta tag checker.",
    "readingTime": "9 min read",
    "category": "SEO",
    "date": "November 25, 2026",
    icon: Search,
  },
  {
    "slug": "how-to-extract-all-links-from-a-website",
    "title": "How to Find and Export Links From a Website (Free, No Code)",
    "excerpt": "Extract internal and external website links without coding. Filter results, export a CSV and use your list to review broken links and site structure.",
    "readingTime": "9 min read",
    "category": "SEO",
    "date": "November 24, 2026",
    icon: Search,
  },
  {
    "slug": "how-to-bulk-resize-images",
    "title": "How to Bulk Resize Images (Free, in Your Browser, Without Uploading Them)",
    "excerpt": "Resize dozens of images at once for web, ecommerce or social. Pick the right size and format, keep aspect ratio and keep files on your own device.",
    "readingTime": "9 min read",
    "category": "Images & Web Performance",
    "date": "November 23, 2026",
    icon: ImageIcon,
  },
  {
    "slug": "html-sitemap-vs-xml-sitemap",
    "title": "HTML Sitemap vs XML Sitemap: What's the Difference and Do You Need Both?",
    "excerpt": "XML sitemaps help search engines find your pages; HTML sitemaps help people navigate. Learn the differences, when you need each, and how to create them.",
    "readingTime": "9 min read",
    "category": "SEO",
    "date": "November 22, 2026",
    icon: Search,
  },
  {
    "slug": "how-to-check-if-a-website-is-mobile-friendly",
    "title": "How to Check if a Website Is Mobile-Friendly (Now Google's Test Is Gone)",
    "excerpt": "Google retired its Mobile-Friendly Test in 2023. Here is a practical way to check any website on mobile: previews, Lighthouse, real phones and a fix list.",
    "readingTime": "9 min read",
    "category": "SEO",
    "date": "November 21, 2026",
    icon: Smartphone,
  },
  {
    "slug": "how-to-write-meta-titles-and-descriptions",
    "title": "How to Write Meta Titles and Descriptions That Fit in Google Search Results",
    "excerpt": "A practical guide to writing unique title tags and meta descriptions, including why pixel width matters more than a strict character count.",
    "readingTime": "10 min read",
    "category": "SEO",
    "date": "November 20, 2026",
    icon: Search,
  },
  {
    "slug": "how-to-run-a-free-seo-site-audit",
    "title": "How to Run a Free SEO Site Audit in 5 Minutes (Step by Step)",
    "excerpt": "A practical free SEO site audit: what to check in Search Console, how to crawl key pages, and how to use a free site audit tool without hype.",
    "date": "November 20, 2026",
    "readingTime": "10 min read",
    "category": "SEO",
    icon: Search,
  },
  {
    slug: 'how-to-check-if-a-website-is-vibe-coded',
    title: 'How to Check If a Website Is Vibe Coded',
    excerpt:
      'AI tools are changing how websites get built. Learn practical, step-by-step methods to check whether a website may have been vibe coded — from technology stack to source code, content, and SEO signals.',
    date: 'September 27, 2026',
    readingTime: '9 min read',
    category: 'AI & Web Development',
    icon: Bot,
  },
  {
    slug: 'top-10-free-photo-cropping-tools',
    title: 'Top 10 Free Photo Cropping Tools for Bloggers and Marketers (2026)',
    excerpt:
      'We tested the most popular free image cropping tools and ranked them on ease of use, aspect ratio presets, privacy, output quality, and extra features. Here\'s the honest list for content creators.',
    date: 'July 11, 2026',
    readingTime: '11 min read',
    category: 'Image Tools',
    icon: ImageIcon,
  },
  {
    slug: 'top-10-mobile-friendly-websites',
    title: 'Top 10 Mobile-Friendly Websites in 2026 (Tested and Ranked)',
    excerpt:
      'We tested 50+ leading websites on real devices and measured Core Web Vitals, touch targets, layout shift, and reading experience. Here are the 10 that genuinely earn the "mobile-friendly" label — ranked.',
    date: 'June 3, 2026',
    readingTime: '12 min read',
    category: 'Mobile UX',
    icon: Smartphone,
  },
]

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Ai Ranko', item: 'https://airanko.com' },
    { '@type': 'ListItem', position: 2, name: 'Blog',     item: 'https://airanko.com/blog' },
  ],
}

const blogJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  name: 'Ai Ranko Blog',
  description: 'Practical guides on SEO, AI-powered content, and mobile performance.',
  url: 'https://airanko.com/blog',
  publisher: {
    '@type': 'Organization',
    name: 'Ai Ranko',
    url: 'https://airanko.com',
    logo: { '@type': 'ImageObject', url: 'https://airanko.com/images/ai-ranko-logo.webp' },
  },
}

export default function BlogIndexPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }} />
      <Navbar />

      <div className="border-b border-border bg-card px-4 py-3 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/" className="flex items-center gap-1.5 transition-colors hover:text-foreground">
            <Zap className="h-3.5 w-3.5 text-primary" />
            Ai Ranko
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-foreground">Blog</span>
        </div>
      </div>

      <main className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h1 className="font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">Ai Ranko Blog</h1>
            <p className="mt-3 max-w-2xl mx-auto text-pretty text-muted-foreground">
              Tested, opinionated guides on SEO, AI-powered content, and mobile performance — written for marketers and creators who ship.
            </p>
          </div>

          <div className="grid gap-5">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group block rounded-3xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-md sm:p-8"
              >
                <div className="flex items-start gap-5">
                  <div className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary sm:flex">
                    <post.icon className="h-7 w-7" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center gap-2 text-xs">
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">{post.category}</span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {post.date}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {post.readingTime}
                      </span>
                    </div>
                    <h2 className="font-heading text-xl font-bold text-foreground group-hover:text-primary sm:text-2xl">
                      {post.title}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>
                    <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                      Read article <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <footer className="mt-16 border-t border-border bg-card px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <Link href="/" aria-label="Ai Ranko home">
            <img src="/images/ai-ranko-logo.webp" alt="Ai Ranko" className="h-7 w-auto" />
          </Link>
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Ai Ranko. Free AI SEO &amp; image tools — no signup required.
          </p>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/sitemap" className="transition-colors hover:text-foreground">Sitemap</Link>
            <Link href="/privacy-policy" className="transition-colors hover:text-foreground">Privacy</Link>
            <Link href="/terms-and-conditions" className="transition-colors hover:text-foreground">Terms</Link>
            <Link href="/contact" className="transition-colors hover:text-foreground">Contact</Link>
            <CookieSettingsLink className="transition-colors hover:text-foreground" />
          </nav>
        </div>
      </footer>
    </div>
  )
}
