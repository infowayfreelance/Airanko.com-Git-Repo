import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Zap } from 'lucide-react'
import Navbar from '@/components/navbar'
import MetaCheckerTool from '@/components/meta-checker/meta-checker-tool'
import MetaCheckerSeoSections from '@/components/meta-checker-seo-sections'

export const metadata: Metadata = {
  title: 'Bulk Meta & Open Graph Checker — Free Online Tool | Ai Ranko',
  description:
    'Instantly check meta title, meta description, Open Graph, and Twitter Card tags for any URL — one at a time or in bulk. Free, fast, no login required.',
  keywords:
    'meta tag checker, bulk meta checker, open graph checker, twitter card checker, meta description analyzer, bulk seo checker, OG tag checker, free meta tag tool',
  alternates: {
    canonical: 'https://airanko.com/tools/meta-checker',
  },
  openGraph: {
    title: 'Bulk Meta & Open Graph Checker — Free Online Tool | Ai Ranko',
    description:
      'Instantly check meta title, meta description, Open Graph, and Twitter Card tags for any URL — one at a time or in bulk. Free, fast, no login required.',
    url: 'https://airanko.com/tools/meta-checker',
    siteName: 'AI Ranko',
    images: [
      {
        url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20and%20converter%20tool%20open%20graph-airanko-fRSh9KtchB104ghNi32hTIxcT2OE87.webp',
        width: 1200,
        height: 630,
        alt: 'Bulk Meta & Open Graph Checker — Free Online Tool | Ai Ranko',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bulk Meta & Open Graph Checker — Free Online Tool | Ai Ranko',
    description:
      'Instantly check meta title, meta description, Open Graph, and Twitter Card tags for any URL — one at a time or in bulk. Free, fast, no login required.',
    images: [
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20and%20converter%20tool%20open%20graph-airanko-fRSh9KtchB104ghNi32hTIxcT2OE87.webp',
    ],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Bulk Meta & Open Graph Checker — Free Online Tool',
  description:
    'Instantly check meta title, meta description, Open Graph, and Twitter Card tags for any URL — one at a time or in bulk. Free, fast, no login required.',
  url: 'https://airanko.com/tools/meta-checker',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'All',
  browserRequirements: 'Requires JavaScript. Works in modern browsers.',
  featureList: [
    'Meta title & description checker',
    'Open Graph tag analyzer (og:title, og:description, og:image, og:type)',
    'Twitter Card checker (twitter:card, twitter:title, twitter:description, twitter:image)',
    'Bulk URL support — unlimited URLs',
    'Live tag preview',
    'Server-side fetching',
    'No data stored — 100% private',
    'No signup required',
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
      name: 'What is a meta tag checker?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "A meta tag checker is a tool that reads a webpage's HTML and extracts key SEO tags — including meta title, meta description, Open Graph, and Twitter Card data — so you can audit and optimize them without touching any code.",
      },
    },
    {
      '@type': 'Question',
      name: 'What is the difference between meta tags and Open Graph tags?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Meta tags communicate page information to search engines like Google. Open Graph tags control how your page appears when shared on social platforms like Facebook, LinkedIn, and WhatsApp — they serve different but equally important purposes.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I check multiple URLs at once?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Ai Ranko\'s tool supports bulk URL checking — simply paste multiple URLs separated by commas or newlines and hit "Check Meta Tags" to get results for all of them instantly.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does this tool check Twitter Card tags too?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Along with meta and OG tags, the tool also extracts twitter:card, twitter:title, twitter:description, and twitter:image — so you can verify rich previews before your content goes live on X (Twitter).',
      },
    },
    {
      '@type': 'Question',
      name: 'Is this tool free to use?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '100% free. No subscription, no credit card, and no signup required — just enter your URLs and get instant results.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you store or log the URLs I check?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. All data is fetched server-side in real time and never stored, logged, or shared. Your URLs and meta data remain completely private.',
      },
    },
    {
      '@type': 'Question',
      name: 'Why are Open Graph tags important for SEO?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Open Graph tags directly impact social click-through rates by controlling the title, description, and image shown when your page is shared. Higher social engagement sends positive signals to search engines, indirectly boosting your SEO performance.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can AI tools like ChatGPT or Perplexity read my meta tags?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. AI answer engines and large language models rely on structured meta data to understand, index, and cite your content. Properly set meta and OG tags improve your chances of being surfaced in AI-generated answers.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do I need to install anything to use this tool?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "No. Ai Ranko's Meta & OG Checker is fully browser-based and works on all devices — desktop, tablet, and mobile — with zero installation required.",
      },
    },
    {
      '@type': 'Question',
      name: 'Who should use a bulk meta tag checker?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'SEO professionals, web developers, digital marketers, and content managers — anyone who needs to audit, validate, or optimize meta and Open Graph tags across single pages or entire websites.',
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
      name: 'Meta & OG Checker',
      item: 'https://airanko.com/tools/meta-checker',
    },
  ],
}

export default function MetaCheckerPage() {
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
          <span className="text-foreground font-medium">Meta & OG Checker</span>
        </div>
      </div>

      <main>
        <MetaCheckerTool />
      </main>

      <MetaCheckerSeoSections />

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
            &copy; {new Date().getFullYear()} Ai Ranko. Meta data is fetched server-side and never stored.
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
