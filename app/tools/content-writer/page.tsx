import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Zap } from 'lucide-react'
import Navbar from '@/components/navbar'
import ToolSchema from '@/components/ToolSchema'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'
import ContentWriterTool from '@/components/content-writer/content-writer-tool'
import ContentWriterSeoSections from '@/components/content-writer-seo-sections'

export const metadata: Metadata = {
  title: 'AI Content Writer — Free SEO Article Generator | Ai Ranko',
  description:
    'Free AI content writer with E-E-A-T signals, FAQ schema & AI Overview hooks. No signup needed. Built for Google\'s 2025 updates.',
  keywords:
    'AI content writer, free SEO article generator, E-E-A-T content, AI Overviews SEO, helpful content system, FAQ schema generator, AI blog writer 2025, Google 2025 content',
  alternates: {
    canonical: 'https://airanko.com/tools/content-writer',
  },
  openGraph: {
    title: 'AI Content Writer — Free SEO Article Generator | Ai Ranko',
    description:
      'Free AI content writer with E-E-A-T signals, FAQ schema & AI Overview hooks. No signup needed. Built for Google\'s 2025 updates.',
    url: 'https://airanko.com/tools/content-writer',
    siteName: 'AI Ranko',
    images: [
      {
        url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20and%20converter%20tool%20open%20graph-airanko-fRSh9KtchB104ghNi32hTIxcT2OE87.webp',
        width: 1200,
        height: 630,
        alt: 'AI Content Writer — Free SEO Article Generator | Ai Ranko',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Content Writer — Free SEO Article Generator | Ai Ranko',
    description:
      'Free AI content writer with E-E-A-T signals, FAQ schema & AI Overview hooks. No signup needed. Built for Google\'s 2025 updates.',
    images: [
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20and%20converter%20tool%20open%20graph-airanko-fRSh9KtchB104ghNi32hTIxcT2OE87.webp',
    ],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'AI Content Writer — Free SEO Article Generator',
  description:
    'Free AI content writer with E-E-A-T signals, FAQ schema & AI Overview hooks. No signup needed. Built for Google\'s 2025 updates.',
  url: 'https://airanko.com/tools/content-writer',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'All',
  browserRequirements: 'Requires JavaScript. Works in modern browsers.',
  featureList: [
    'E-E-A-T signal optimization',
    'AI Overviews / SGE citation hooks',
    'FAQ schema generator',
    'Helpful Content System aligned',
    '10+ content types',
    'Tone & format control',
    'Pre-publish SEO checklist',
    'Google 2025 spam policy aligned',
    'No watermark — content is yours',
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
      name: "What is Ai Ranko's AI Content Writer?",
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Ai Ranko's AI Content Writer is a free, browser-based tool that generates complete, SEO-optimized articles. It is built around Google's 2025 E-E-A-T framework, Helpful Content System, and AI Overviews optimization — so every article is ready to rank from day one.",
      },
    },
    {
      '@type': 'Question',
      name: 'Is the AI Content Writer free to use?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, completely free. No subscription, no credit card, and no signup required. Just enter your topic, set your preferences, and generate a fully optimized article instantly.',
      },
    },
    {
      '@type': 'Question',
      name: 'How is this different from ChatGPT or other AI writers?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Most AI writers just generate text. Ai Ranko's content writer generates ranking-ready content — with E-E-A-T signals, FAQ schema, AI Overview hooks, and a pre-publish SEO checklist built into every article automatically.",
      },
    },
    {
      '@type': 'Question',
      name: 'What types of content can I generate?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You can generate Blog Posts, In-Depth Guides, How-To Tutorials, Listicles, Comparison Articles, Product Reviews, Service Pages, Landing Pages, Pillar Pages, and News Updates — all from one tool.',
      },
    },
    {
      '@type': 'Question',
      name: 'Will this content rank on Google in 2025?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Every article is scored against Google's Helpful Content System, E-E-A-T criteria, and 2024 spam policies. Content is structured for people first and search engines second — which is exactly what Google rewards in 2025.",
      },
    },
    {
      '@type': 'Question',
      name: 'What is E-E-A-T and why does it matter?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "E-E-A-T stands for Experience, Expertise, Authoritativeness, and Trustworthiness. It is the framework Google's quality raters use to evaluate content quality. Without E-E-A-T signals, even well-written content struggles to rank on competitive keywords.",
      },
    },
    {
      '@type': 'Question',
      name: 'Can this tool help me get featured in AI Overviews?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Yes. Every article is structured with direct-answer formatting and citation hooks — the two key elements that increase your chances of being pulled and featured in Google's AI Overviews results.",
      },
    },
    {
      '@type': 'Question',
      name: 'Do I need any SEO knowledge to use this tool?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. The tool handles keyword placement, E-E-A-T signals, FAQ schema, and the SEO checklist automatically. Even complete beginners can generate and publish ranking-ready content without any prior SEO experience.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long does it take to generate an article?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Most articles are generated within seconds. You fill in four simple steps — Topic, Audience, E-E-A-T, and Details — and the tool delivers a complete, publish-ready article instantly.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does the generated content have any watermark or restrictions?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No watermark, no usage restrictions. The content you generate is yours — copy it, edit it, publish it anywhere without any limitations.',
      },
    },
  ],
}

export default function ContentWriterPage() {
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
      <ToolSchema name="AI Content Writer" slug="content-writer" description="Generate SEO articles tuned for Google E-E-A-T, AI Overview hooks, FAQ schema, and a publish-ready checklist." />
      <BreadcrumbSchema items={[{ name: 'Tools', href: '/#tools' }, { name: 'Content Writer', href: '/tools/content-writer' }]} />

      {/* Breadcrumb */}
      <div
        className="border-b border-border bg-card px-4 py-3 sm:px-6 lg:px-8 print:hidden"
        data-print-hide
      >
        <div className="mx-auto flex max-w-7xl items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/" className="flex items-center gap-1.5 transition-colors hover:text-foreground">
            <Zap className="h-3.5 w-3.5 text-primary" />
            Ai Ranko
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/#tools" className="transition-colors hover:text-foreground">
            Tools
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-foreground">AI Content Writer</span>
        </div>
      </div>

      <main>
        <ContentWriterTool />
      </main>

      <ContentWriterSeoSections />

      {/* Footer */}
      <footer
        className="mt-12 border-t border-border bg-card px-4 py-8 sm:px-6 lg:px-8 print:hidden"
        data-print-hide
      >
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <Link href="/" className="flex items-center" aria-label="Ai Ranko home">
            <img
              src="/images/ai-ranko-logo.webp"
              alt="Ai Ranko"
              className="h-7 w-auto"
            />
          </Link>
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Ai Ranko. AI-generated content —
            always fact-check and add your real expertise before publishing.
          </p>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/blog" className="transition-colors hover:text-foreground">Blog</Link>
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
