import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Zap } from 'lucide-react'
import Navbar from '@/components/navbar'
import ContentOptimizerTool from '@/components/content-optimizer/content-optimizer-tool'
import ContentOptimizerSeoSections from '@/components/content-optimizer-seo-sections'

export const metadata: Metadata = {
  title: 'Free AI Content Optimizer — Google E-E-A-T + Helpful Content Audit | Ai Ranko',
  description:
    'Optimize existing content against Google\'s 2024 Helpful Content + E-E-A-T guidelines. Get E-E-A-T scores, keyword + LSI analysis, heading rewrites, missing topics & ready-to-paste title/meta — free.',
  keywords:
    'AI content optimizer, content optimization tool, Google E-E-A-T checker, helpful content checker, on-page SEO optimizer, LSI keyword finder, content scoring tool, search intent matcher, free SEO optimizer',
  alternates: { canonical: 'https://airanko.com/tools/content-optimizer' },
  openGraph: {
    title: 'Free AI Content Optimizer — Google E-E-A-T + Helpful Content Audit',
    description: 'Score content against Google\'s 2024 ranking guidelines + get concrete rewrites and fixes. Free.',
    url: 'https://airanko.com/tools/content-optimizer',
    siteName: 'Ai Ranko',
    images: [
      {
        url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20and%20converter%20tool%20open%20graph-airanko-fRSh9KtchB104ghNi32hTIxcT2OE87.webp',
        width: 1200, height: 630, alt: 'AI Content Optimizer | Ai Ranko',
      },
    ],
    locale: 'en_US', type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free AI Content Optimizer — Google E-E-A-T + Helpful Content Audit',
    description: 'Score content against Google\'s 2024 ranking guidelines + get concrete rewrites and fixes.',
    images: ['https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20and%20converter%20tool%20open%20graph-airanko-fRSh9KtchB104ghNi32hTIxcT2OE87.webp'],
  },
}

const jsonLd = {
  '@context': 'https://schema.org', '@type': 'SoftwareApplication',
  name: 'Free AI Content Optimizer',
  description: 'Audit and optimize existing content against Google\'s 2024 Helpful Content + E-E-A-T guidelines.',
  url: 'https://airanko.com/tools/content-optimizer',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'All',
  browserRequirements: 'Requires JavaScript.',
  featureList: [
    'Google E-E-A-T scoring (Experience, Expertise, Authority, Trust)',
    'Helpful Content System audit (people-first scoring)',
    'Search intent detection and content-match recommendation',
    'Primary keyword + LSI/semantic keyword analysis',
    'Keyword density check with stuffing detection',
    'Heading rewrites with reasons',
    'Missing topic identification with suggested H2s',
    'AI-generated title (50-60 chars) + meta description (140-160 chars)',
    'URL slug recommendation + schema type suggestion',
    'Internal linking suggestions',
    'Structure + readability scoring',
    '8-15 prioritized issues with severity, category, fix, and example',
    'No sign-up, 100% free, no watermark',
  ],
  creator: { '@type': 'Organization', name: 'Ai Ranko', url: 'https://airanko.com' },
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
}

const faqJsonLd = {
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'What does this tool actually check?', acceptedAnswer: { '@type': 'Answer', text: 'It audits your content against Google\'s 2024 Search Quality Rater Guidelines and Helpful Content System: E-E-A-T signals, keyword + LSI coverage, search intent match, structure and readability, on-page SEO (title, meta, slug, schema), missing topics, heading quality, and content depth.' } },
    { '@type': 'Question', name: 'What is E-E-A-T and why does it matter?', acceptedAnswer: { '@type': 'Answer', text: 'E-E-A-T stands for Experience, Expertise, Authoritativeness, and Trustworthiness — Google\'s official quality framework used by Search Quality Raters and baked into ranking systems. Content that signals real first-hand experience, expert credentials, and trust markers ranks higher and is less likely to be hit by Helpful Content updates.' } },
    { '@type': 'Question', name: 'How is this different from a grammar checker?', acceptedAnswer: { '@type': 'Answer', text: 'Grammar checkers fix language. This tool grades content against Google\'s actual ranking factors: does it demonstrate experience, match search intent, cover the right semantic topics, use the keyword correctly, follow good structure, and include the right on-page elements? Then it writes specific rewrites and fixes.' } },
    { '@type': 'Question', name: 'Does the tool follow Google\'s rules?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. The analysis is based on Google\'s published Search Quality Rater Guidelines (2024 update), the Helpful Content System documentation, Reviews System guidelines, and confirmed spam policy updates.' } },
    { '@type': 'Question', name: 'How accurate is the E-E-A-T score?', acceptedAnswer: { '@type': 'Answer', text: 'The E-E-A-T score uses GPT-4o to detect concrete signals in your content — first-person experience markers ("I tested", "we measured"), original data, expert credentials, citations, author attribution. It is a calibrated estimate; final E-E-A-T also depends on author/site reputation Google measures externally.' } },
    { '@type': 'Question', name: 'What are LSI keywords and why do I need them?', acceptedAnswer: { '@type': 'Answer', text: 'LSI (Latent Semantic Indexing) keywords are semantically related terms that signal topical depth. For example, an article about "best running shoes" should also mention "pronation", "arch support", "midsole cushioning". Including these tells Google you cover the topic comprehensively, not superficially.' } },
    { '@type': 'Question', name: 'How much content can I analyze?', acceptedAnswer: { '@type': 'Answer', text: 'Between 100 and 4,000 words per analysis. For longer pieces, audit each major section separately for more focused feedback.' } },
    { '@type': 'Question', name: 'Is the tool really free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes — no sign-up, no credit card, no watermark, unlimited analyses.' } },
    { '@type': 'Question', name: 'What should I do after seeing the results?', acceptedAnswer: { '@type': 'Answer', text: 'Start with the Issues tab and fix all Critical issues first. Then apply the heading rewrites (one click to copy). Add the missing LSI keywords naturally. Replace the existing title/meta with the suggested versions. Add the missing topics as new H2 sections. Re-run the tool to verify improvements.' } },
  ],
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Ai Ranko', item: 'https://airanko.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://airanko.com/#tools' },
    { '@type': 'ListItem', position: 3, name: 'AI Content Optimizer', item: 'https://airanko.com/tools/content-optimizer' },
  ],
}

export default function ContentOptimizerPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <Navbar />

      <div className="border-b border-border bg-card px-4 py-3 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/" className="flex items-center gap-1.5 transition-colors hover:text-foreground">
            <Zap className="h-3.5 w-3.5 text-primary" />
            Ai Ranko
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/#tools" className="transition-colors hover:text-foreground">Tools</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-foreground">AI Content Optimizer</span>
        </div>
      </div>

      <main>
        <ContentOptimizerTool />
      </main>

      <ContentOptimizerSeoSections />

      <footer className="mt-12 border-t border-border bg-card px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <Link href="/" aria-label="Ai Ranko home">
            <img src="/images/ai-ranko-logo.webp" alt="Ai Ranko" className="h-7 w-auto" />
          </Link>
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Ai Ranko. Analysis follows Google Search Quality Rater Guidelines.
          </p>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link href="#" className="transition-colors hover:text-foreground">Privacy</Link>
            <Link href="#" className="transition-colors hover:text-foreground">Terms</Link>
            <Link href="#" className="transition-colors hover:text-foreground">Contact</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
