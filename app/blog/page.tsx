import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Zap, Calendar, Clock, ArrowRight, Smartphone } from 'lucide-react'
import Navbar from '@/components/navbar'

export const metadata: Metadata = {
  title: 'Blog — SEO, AI, and Web Performance Insights | Ai Ranko',
  description:
    'Practical guides on SEO, AI-powered content, mobile performance, and the tools modern marketers use every day. Written by the Ai Ranko team.',
  alternates: { canonical: 'https://airanko.com/blog' },
  openGraph: {
    title: 'Blog — SEO, AI, and Web Performance Insights | Ai Ranko',
    description: 'Practical guides on SEO, AI-powered content, mobile performance, and the tools modern marketers use every day.',
    url: 'https://airanko.com/blog',
    siteName: 'Ai Ranko',
    type: 'website',
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
          </nav>
        </div>
      </footer>
    </div>
  )
}
