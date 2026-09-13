import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Zap } from 'lucide-react'
import Navbar from '@/components/navbar'
import ToolSchema from '@/components/ToolSchema'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'
import SeoStrategyMakerTool from '@/components/seo-strategy-maker/seo-strategy-maker-tool'
import SeoStrategyMakerSeoSections from '@/components/seo-strategy-maker-seo-sections'
import { CookieSettingsLink } from '@/components/cookie-consent/cookie-settings-link'

export const metadata: Metadata = {
  title: 'AI SEO Strategy Maker — Free Custom SEO Plan Generator | Ai Ranko',
  description:
    'Generate a complete SEO strategy in seconds. Get keyword research, competitor analysis, content calendar, technical SEO checklist & a 2-month action plan — 100% free & AI-powered.',
  keywords:
    'SEO strategy maker, SEO plan generator, AI SEO tool, free SEO strategy, keyword strategy, content calendar, SEO roadmap, competitor analysis, technical SEO checklist',
  alternates: {
    canonical: 'https://airanko.com/tools/seo-strategy-maker',
  },
  openGraph: {
    title: 'AI SEO Strategy Maker — Free Custom SEO Plan Generator | Ai Ranko',
    description:
      'Generate a complete SEO strategy in seconds. Get keyword research, competitor analysis, content calendar, technical SEO checklist & a 2-month action plan — 100% free & AI-powered.',
    url: 'https://airanko.com/tools/seo-strategy-maker',
    siteName: 'AI Ranko',
    images: [
      {
        url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20and%20converter%20tool%20open%20graph-airanko-fRSh9KtchB104ghNi32hTIxcT2OE87.webp',
        width: 1200,
        height: 630,
        alt: 'AI SEO Strategy Maker — Free Custom SEO Plan Generator | Ai Ranko',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI SEO Strategy Maker — Free Custom SEO Plan Generator | Ai Ranko',
    description:
      'Generate a complete SEO strategy in seconds. Get keyword research, competitor analysis, content calendar, technical SEO checklist & a 2-month action plan — 100% free & AI-powered.',
    images: [
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20and%20converter%20tool%20open%20graph-airanko-fRSh9KtchB104ghNi32hTIxcT2OE87.webp',
    ],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'AI SEO Strategy Maker — Free Custom SEO Plan Generator',
  description:
    'Generate a complete SEO strategy in seconds. Get keyword research, competitor analysis, content calendar, technical SEO checklist & a 2-month action plan — 100% free & AI-powered.',
  url: 'https://airanko.com/tools/seo-strategy-maker',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'All',
  browserRequirements: 'Requires JavaScript. Works in modern browsers.',
  featureList: [
    'Auto site crawl — meta tags, schema, sitemap, robots.txt',
    'AI-powered keyword strategy',
    'Competitor analysis and ranking gap discovery',
    'Content calendar aligned with search intent',
    'Technical SEO checklist with prioritized fixes',
    '2-month week-by-week SEO action roadmap',
    'Local SEO audit support',
    'Client-ready output — no formatting needed',
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
      name: 'What is an AI SEO strategy maker?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'An AI SEO strategy maker is a tool that automatically analyzes your website and generates a complete SEO plan — including keyword research, competitor analysis, content calendar, technical checklist, and a month-by-month action roadmap.',
      },
    },
    {
      '@type': 'Question',
      name: "Is Ai Ranko's SEO strategy maker really free?",
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, completely free. No credit card, no subscription, and no signup required. Just enter your website URL and get a full AI-generated SEO strategy instantly.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does the AI crawl my website?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Once you enter your URL, Ai Ranko automatically crawls your site's internal pages, meta tags, schema markup, sitemap, and robots.txt — no manual input needed.",
      },
    },
    {
      '@type': 'Question',
      name: 'Can I use this tool without technical SEO knowledge?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Absolutely. The tool is built for marketers, business owners, and bloggers — not just SEO experts. Every recommendation is clear, prioritized, and ready to act on.',
      },
    },
    {
      '@type': 'Question',
      name: 'How is Ai Ranko different from Semrush or Ahrefs?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Semrush and Ahrefs are powerful but expensive, complex, and require months to master. Ai Ranko gives you a complete, client-ready SEO strategy in seconds — for free, with zero setup.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does the tool support local SEO strategy?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Toggle on the local business option and Ai Ranko generates a full local SEO audit — including NAP consistency, geo-relevance signals, and location-based keyword strategy.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is included in the 2-month SEO roadmap?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The roadmap breaks your own audit findings into an 8-week, week-by-week plan — covering what to fix technically, which pages to improve or create, and which local/off-page opportunities to pursue, in the right order.',
      },
    },
    {
      '@type': 'Question',
      name: 'How accurate is the AI-generated SEO strategy?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "The strategy is based on real site crawl data, your target keywords, and competitor analysis. It follows Google's 2025 E-E-A-T guidelines — always validate with your own market research for best results.",
      },
    },
    {
      '@type': 'Question',
      name: 'Can I use this tool for client SEO reporting?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. The output is structured and professional — making it easy to present to clients as a ready-to-execute SEO plan without any additional formatting.',
      },
    },
    {
      '@type': 'Question',
      name: 'How often should I generate a new SEO strategy?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "It's recommended to refresh your SEO strategy every 3–6 months — or whenever you launch new pages, enter a new market, or notice a significant drop in organic traffic.",
      },
    },
  ],
}

export default function SeoStrategyMakerPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />      <Navbar />
      <ToolSchema name="SEO Strategy Maker" slug="seo-strategy-maker" description="Crawl your site and generate a complete AI-powered SEO strategy with keyword research, competitor analysis, content calendar and 2-month roadmap." />
      <BreadcrumbSchema items={[{ name: 'Tools', href: '/#tools' }, { name: 'SEO Strategy Maker', href: '/tools/seo-strategy-maker' }]} />

      {/* Breadcrumb */}
      <div className="border-b border-border bg-card px-4 py-3 sm:px-6 lg:px-8 print:hidden" data-print-hide>
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
          <span className="text-foreground font-medium">SEO Strategy Maker</span>
        </div>
      </div>

      <main>
        <SeoStrategyMakerTool />
      </main>

      <SeoStrategyMakerSeoSections />

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-12 px-4 py-8 sm:px-6 lg:px-8 print:hidden" data-print-hide>
        <div className="mx-auto max-w-7xl flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Link href="/" className="flex items-center" aria-label="Ai Ranko home">
            <img
              src="/images/ai-ranko-logo.webp"
              alt="Ai Ranko"
              className="h-7 w-auto"
            />
          </Link>
          <p className="text-sm text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} Ai Ranko. AI-generated strategies — always validate with your own research.
          </p>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
            <Link href="/sitemap" className="hover:text-foreground transition-colors">Sitemap</Link>
            <Link href="/privacy-policy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms-and-conditions" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
            <CookieSettingsLink className="hover:text-foreground transition-colors" />
          </nav>
        </div>
      </footer>
    </div>
  )
}
