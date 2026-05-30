import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Zap } from 'lucide-react'
import Navbar from '@/components/navbar'
import PlagiarismCheckerTool from '@/components/plagiarism-checker/plagiarism-checker-tool'
import PlagiarismCheckerSeoSections from '@/components/plagiarism-checker-seo-sections'

export const metadata: Metadata = {
  title: 'Free AI Content Detector & Grammar Checker — Plagiarism + Readability | Ai Ranko',
  description:
    'Detect AI-written content, fix grammar mistakes, measure readability, and get precise word replacement suggestions in one free tool. Powered by GPT-4o. No sign-up needed.',
  keywords:
    'AI content detector, plagiarism checker, grammar checker online, readability score checker, AI writing detector, human score checker, word replacement tool, GPT content detector, free grammar tool, content quality checker',
  alternates: {
    canonical: 'https://airanko.com/tools/plagiarism-checker',
  },
  openGraph: {
    title: 'Free AI Content Detector & Grammar Checker | Ai Ranko',
    description:
      'Detect AI-written content, fix grammar mistakes, measure readability, and get precise word replacement suggestions in one free tool.',
    url: 'https://airanko.com/tools/plagiarism-checker',
    siteName: 'Ai Ranko',
    images: [
      {
        url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20and%20converter%20tool%20open%20graph-airanko-fRSh9KtchB104ghNi32hTIxcT2OE87.webp',
        width: 1200,
        height: 630,
        alt: 'Free AI Content Detector & Grammar Checker | Ai Ranko',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free AI Content Detector & Grammar Checker | Ai Ranko',
    description:
      'Detect AI-written content, fix grammar mistakes, measure readability, and get word replacement suggestions — all free.',
    images: [
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20and%20converter%20tool%20open%20graph-airanko-fRSh9KtchB104ghNi32hTIxcT2OE87.webp',
    ],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Free AI Content Detector & Grammar Checker',
  description:
    'Detect AI-written content, fix grammar mistakes, measure human readability, and get precise word replacement suggestions — all in one free analysis powered by GPT-4o.',
  url: 'https://airanko.com/tools/plagiarism-checker',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'All',
  browserRequirements: 'Requires JavaScript. Works in all modern browsers.',
  featureList: [
    'AI content detection — AI vs human writing percentage score',
    'Grammar and spelling error detection with exact corrections',
    'Human readability score with grade level',
    'Weak word detection with 3 precise replacement suggestions per word',
    'AI writing signal analysis (what patterns reveal AI authorship)',
    'Actionable improvement tips',
    'Inline text highlighting — click any issue to see the fix',
    'No sign-up, no watermark, 100% free',
  ],
  creator: {
    '@type': 'Organization',
    name: 'Ai Ranko',
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
      name: 'What does this tool check?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'This tool performs four checks in one: AI content detection (is the text written by a human or AI?), grammar and spelling error detection, human readability scoring, and weak word identification with replacement suggestions.',
      },
    },
    {
      '@type': 'Question',
      name: 'How accurate is the AI content detection?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The detection is powered by GPT-4o and identifies patterns commonly found in AI-generated text — such as formulaic structure, repetitive sentence patterns, generic phrasing, and lack of personal voice. It is highly reliable for well-structured articles but should not be used as sole evidence of AI authorship.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does this tool check against a live web index for plagiarism?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "No — this tool focuses on AI content detection, grammar quality, readability, and word improvement. It does not compare your text against a database of live web pages. For web-based duplicate content checking, tools like Copyscape are required. This tool's strength is analyzing the quality and authenticity of your writing.",
      },
    },
    {
      '@type': 'Question',
      name: 'What is the readability score?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The readability score is based on the Flesch Reading Ease scale (0–100). A score above 70 means easy to read (Grade 6–8 level), which is ideal for most web content. Scores below 50 indicate complex text that may need simplifying.',
      },
    },
    {
      '@type': 'Question',
      name: 'What are word replacement suggestions?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The tool identifies weak, vague, or overused words in your text — such as "very", "good", "things", "basically" — and suggests 3 stronger, more precise alternatives for each. You can click any suggestion to copy it with one click.',
      },
    },
    {
      '@type': 'Question',
      name: 'How many words can I analyze?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The tool supports between 30 and 3,000 words per analysis. For longer content, analyze it in sections for more detailed feedback.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is this tool free?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, completely free. No account, no subscription, and no watermark. Just paste your text and get instant results.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I use this for SEO content?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Absolutely. Google's Helpful Content and E-E-A-T guidelines favor content that reads as authentic, human, and authoritative. This tool helps you identify and remove patterns that signal AI authorship, fix grammar issues, and improve readability — all factors that contribute to better rankings.",
      },
    },
  ],
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Ai Ranko', item: 'https://airanko.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://airanko.com/#tools' },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'AI Content Detector & Grammar Checker',
      item: 'https://airanko.com/tools/plagiarism-checker',
    },
  ],
}

export default function PlagiarismCheckerPage() {
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
          <Link href="/" className="flex items-center gap-1.5 transition-colors hover:text-foreground">
            <Zap className="h-3.5 w-3.5 text-primary" />
            Ai Ranko
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/#tools" className="transition-colors hover:text-foreground">
            Tools
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-foreground">AI Content Detector & Grammar Checker</span>
        </div>
      </div>

      <main>
        <PlagiarismCheckerTool />
      </main>

      <PlagiarismCheckerSeoSections />

      <footer className="mt-12 border-t border-border bg-card px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <Link href="/" aria-label="Ai Ranko home">
            <img src="/images/ai-ranko-logo.webp" alt="Ai Ranko" className="h-7 w-auto" />
          </Link>
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Ai Ranko. AI analysis — always review results with your own judgement.
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
