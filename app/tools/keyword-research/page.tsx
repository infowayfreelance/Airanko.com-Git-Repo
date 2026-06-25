import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Zap } from 'lucide-react'
import Navbar from '@/components/navbar'
import ToolSchema from '@/components/ToolSchema'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'
import KeywordResearchTool from '@/components/keyword-research/keyword-research-tool'
import KeywordResearchSeoSections from '@/components/keyword-research-seo-sections'

export const metadata: Metadata = {
  title: 'Free Keyword Research Tool — Real Google Data + AI Clustering | Ai Ranko',
  description:
    'Pull real keyword ideas from Google Autocomplete, then auto-classify by intent, difficulty & content type. Get clusters, PAA questions & content ideas — 100% free, no sign-up.',
  keywords:
    'free keyword research tool, keyword generator, Google autocomplete keywords, AI keyword research, keyword clustering, search intent classifier, long-tail keyword finder, free SEO keyword tool, keyword ideas generator',
  alternates: {
    canonical: 'https://airanko.com/tools/keyword-research',
  },
  openGraph: {
    title: 'Free Keyword Research Tool — Real Google Data + AI Clustering | Ai Ranko',
    description:
      'Real Google Autocomplete keywords + AI intent classification, clustering, and content ideas. Free, no sign-up.',
    url: 'https://airanko.com/tools/keyword-research',
    siteName: 'Ai Ranko',
    images: [
      {
        url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20and%20converter%20tool%20open%20graph-airanko-fRSh9KtchB104ghNi32hTIxcT2OE87.webp',
        width: 1200,
        height: 630,
        alt: 'Free Keyword Research Tool | Ai Ranko',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Keyword Research Tool — Real Google Data + AI Clustering',
    description: 'Real Google Autocomplete keywords + AI intent classification. Free, no sign-up.',
    images: [
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20and%20converter%20tool%20open%20graph-airanko-fRSh9KtchB104ghNi32hTIxcT2OE87.webp',
    ],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Free Keyword Research Tool',
  description:
    'Pull real keyword ideas straight from Google Autocomplete, then auto-classify by intent and difficulty, group into clusters, and generate content ideas — all free.',
  url: 'https://airanko.com/tools/keyword-research',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'All',
  browserRequirements: 'Requires JavaScript. Works in all modern browsers.',
  featureList: [
    'Real keyword data from Google Autocomplete',
    'AI-powered intent classification (informational/commercial/transactional/navigational)',
    'Qualitative difficulty estimates per keyword',
    'Automatic thematic clustering',
    'People-Also-Ask question extraction',
    'AI-generated content ideas with titles and angles',
    'Country/region targeting',
    'CSV export and one-click copy',
    'No sign-up, no watermark, 100% free',
  ],
  creator: { '@type': 'Organization', name: 'Ai Ranko', url: 'https://airanko.com' },
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Where do the keywords come from?', acceptedAnswer: { '@type': 'Answer', text: 'Keywords come directly from Google Autocomplete — the same suggestions Google shows when you start typing in the search bar. They are real searches, not AI inventions. The tool expands the seed by adding question prefixes (what is, how to, why, etc.) and common modifiers to pull 50–80 real long-tails per query.' } },
    { '@type': 'Question', name: 'Does this tool show search volume?', acceptedAnswer: { '@type': 'Answer', text: 'No. Real search-volume numbers require paid APIs like Google Ads Keyword Planner, Ahrefs, or Semrush. This free tool focuses on real keyword ideas + AI-classified intent and difficulty. For volume, validate top picks in Google Keyword Planner (free with a Google Ads account).' } },
    { '@type': 'Question', name: 'How is difficulty estimated?', acceptedAnswer: { '@type': 'Answer', text: 'Difficulty is a qualitative AI estimate based on keyword length, specificity, and likely competition. It is labeled Easy / Medium / Hard — useful for prioritization, but not a substitute for real KD scores from paid tools.' } },
    { '@type': 'Question', name: 'What is intent classification?', acceptedAnswer: { '@type': 'Answer', text: 'Each keyword is tagged with one of four intents: informational (research/learning), commercial (comparing options), transactional (ready to buy), or navigational (looking for a specific site). Matching content to intent is the #1 ranking factor after relevance.' } },
    { '@type': 'Question', name: 'How are clusters created?', acceptedAnswer: { '@type': 'Answer', text: 'The AI groups all the real keywords into 4–6 thematic clusters — like "tutorials", "comparisons", "pricing", "features". Each cluster represents a content opportunity: one comprehensive piece can rank for all keywords in a cluster.' } },
    { '@type': 'Question', name: 'Can I target a specific country?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Choose from 14+ countries. Google Autocomplete returns region-specific suggestions, so a search for "tax filing" in the US returns different keywords than the UK or India.' } },
    { '@type': 'Question', name: 'Is this tool really free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. No sign-up, no account, no watermark. Run unlimited keyword research queries.' } },
    { '@type': 'Question', name: 'What should I do after exporting keywords?', acceptedAnswer: { '@type': 'Answer', text: 'Pick 1–2 clusters that match your business goals. Pair them with the suggested content ideas, run them through our AI Content Writer to draft articles, then check originality with the AI Content Detector before publishing.' } },
  ],
}

export default function KeywordResearchPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />      <Navbar />
      <ToolSchema name="Keyword Research Tool" slug="keyword-research" description="Pull 150+ real keyword ideas from Google Autocomplete, YouTube and Wikipedia. AI clusters by intent and generates content briefs." />
      <BreadcrumbSchema items={[{ name: 'Tools', href: '/#tools' }, { name: 'Keyword Research', href: '/tools/keyword-research' }]} />

      <div className="border-b border-border bg-card px-4 py-3 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/" className="flex items-center gap-1.5 transition-colors hover:text-foreground">
            <Zap className="h-3.5 w-3.5 text-primary" />
            Ai Ranko
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/#tools" className="transition-colors hover:text-foreground">Tools</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-foreground">Keyword Research Tool</span>
        </div>
      </div>

      <main>
        <KeywordResearchTool />
      </main>

      <KeywordResearchSeoSections />

      <footer className="mt-12 border-t border-border bg-card px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <Link href="/" aria-label="Ai Ranko home">
            <img src="/images/ai-ranko-logo.webp" alt="Ai Ranko" className="h-7 w-auto" />
          </Link>
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Ai Ranko. Real keywords + AI clustering — validate volume with Google Keyword Planner.
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
