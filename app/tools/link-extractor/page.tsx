import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Zap } from 'lucide-react'
import Navbar from '@/components/navbar'
import LinkExtractorTool from '@/components/link-extractor/link-extractor-tool'
import LinkExtractorSeoSections from '@/components/link-extractor-seo-sections'

export const metadata: Metadata = {
  title: 'Free Link Extractor — Crawl & Export All Links | Ai Ranko',
  description:
    'Crawl any website and extract every internal, external, nofollow & file link. Export to CSV, JSON, or TXT — free, no signup needed.',
  keywords:
    'link extractor, website crawler, extract all links, internal link checker, external link extractor, nofollow checker, seo link audit, broken link finder, sitemap crawler',
  alternates: {
    canonical: 'https://airanko.com/tools/link-extractor',
  },
  openGraph: {
    title: 'Free Link Extractor — Crawl & Export All Links | Ai Ranko',
    description:
      'Crawl any website and extract every internal, external, nofollow & file link. Export to CSV, JSON, or TXT — free, no signup needed.',
    url: 'https://airanko.com/tools/link-extractor',
    siteName: 'AI Ranko',
    images: [
      {
        url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20and%20converter%20tool%20open%20graph-airanko-fRSh9KtchB104ghNi32hTIxcT2OE87.webp',
        width: 1200,
        height: 630,
        alt: 'Free Link Extractor — Crawl & Export All Links | Ai Ranko',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Link Extractor — Crawl & Export All Links | Ai Ranko',
    description:
      'Crawl any website and extract every internal, external, nofollow & file link. Export to CSV, JSON, or TXT — free, no signup needed.',
    images: [
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20and%20converter%20tool%20open%20graph-airanko-fRSh9KtchB104ghNi32hTIxcT2OE87.webp',
    ],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Free Link Extractor — Crawl & Export All Links',
  description:
    'Crawl any website and extract every internal, external, nofollow & file link. Export to CSV, JSON, or TXT — free, no signup needed.',
  url: 'https://airanko.com/tools/link-extractor',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'All',
  browserRequirements: 'Requires JavaScript. Works in modern browsers.',
  featureList: [
    'Crawl up to 500 pages per run',
    'Sitemap.xml and robots.txt auto-discovery',
    'Internal link filtering and audit',
    'External link filtering and audit',
    'Nofollow link detection',
    'File link extraction (PDF, DOC, etc.)',
    'Export to CSV, JSON, and TXT',
    'No data stored — 100% private',
  ],
  creator: {
    '@type': 'Organization',
    name: 'AI Ranko',
    url: 'https://airanko.com',
  },
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is a link extractor and what does it do?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A link extractor crawls a website and collects every URL found across its pages. It identifies internal links, external links, nofollow links, and file links — all in one audit.',
      },
    },
    {
      '@type': 'Question',
      name: 'How many pages can this tool crawl?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Ai Ranko's Link Extractor crawls up to 500 pages per run, across a depth of 3 levels. It also scans sitemap.xml and robots.txt to find URLs not linked from any visible page.",
      },
    },
    {
      '@type': 'Question',
      name: 'Do I need to create an account to use this tool?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. The Link Extractor is 100% free with no signup, no login, and no subscription required. Just paste your URL and hit crawl.',
      },
    },
    {
      '@type': 'Question',
      name: 'What export formats are supported?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You can download your full link inventory in CSV, TXT, or JSON format. Each export includes source page URLs and occurrence counts for every link found.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can it detect nofollow links?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. The tool automatically identifies and flags nofollow-tagged links across all crawled pages — essential for accurate link equity analysis and SEO audits.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is this tool safe to use? Is my data stored?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'All crawling happens server-side and no data is ever stored on our servers. Your link audit stays completely private and confidential.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I use this tool to find broken links?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. By extracting all internal and external links across your site, you can cross-reference them to identify broken or dead URLs that may be hurting your SEO.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does it work on all websites?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The tool works on any publicly accessible website. Password-protected, login-gated, or JavaScript-heavy sites may have limited crawl results.',
      },
    },
    {
      '@type': 'Question',
      name: 'How is Ai Ranko different from Screaming Frog?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Ai Ranko is fully browser-based — no installation needed. It's free, stores no data, and requires zero setup. Screaming Frog's free version is limited and requires a desktop download.",
      },
    },
    {
      '@type': 'Question',
      name: 'Does this tool work on mobile devices?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Yes. Ai Ranko's Link Extractor works on all devices and browsers — desktop, tablet, and mobile — with no performance difference.",
      },
    },
  ],
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'AI Ranko', item: 'https://airanko.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://airanko.com/#tools' },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'Link Extractor',
      item: 'https://airanko.com/tools/link-extractor',
    },
  ],
}

export default function LinkExtractorPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Navbar />

      {/* Breadcrumb */}
      <div className="border-b border-border bg-card px-4 py-3 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/" className="flex items-center gap-1.5 hover:text-foreground transition-colors">
            <Zap className="h-3.5 w-3.5 text-primary" />
            Ai Ranko
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/#tools" className="hover:text-foreground transition-colors">
            Tools
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-medium">Link Extractor</span>
        </div>
      </div>

      <main>
        <LinkExtractorTool />
      </main>

      <LinkExtractorSeoSections />

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-12 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Link href="/" className="flex items-center" aria-label="Ai Ranko home">
            <img
              src="/images/ai-ranko-logo.webp"
              alt="Ai Ranko"
              className="h-7 w-auto"
            />
          </Link>
          <p className="text-sm text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} Ai Ranko. Pages are fetched server-side and never stored.
          </p>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/sitemap" className="hover:text-foreground transition-colors">Sitemap</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Contact</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
