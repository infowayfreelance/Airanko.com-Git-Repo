import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Zap } from 'lucide-react'
import Navbar from '@/components/navbar'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'
import PlagiarismCheckerTool from '@/components/plagiarism-checker/plagiarism-checker-tool'
import PlagiarismCheckerSeoSections from '@/components/plagiarism-checker-seo-sections'
import { CookieSettingsLink } from '@/components/cookie-consent/cookie-settings-link'

export const metadata: Metadata = {
  title: "Free AI Content Detector & Grammar Checker | Ai Ranko",
  description: "Check text for AI-writing patterns, grammar, readability and weak words in one free analysis. 30–3,000 words, no sign-up. Not a web plagiarism checker.",
  keywords:
    'AI content detector, grammar checker online, readability score checker, AI writing detector, human score checker, word replacement tool, free grammar tool, content quality checker',
  alternates: {
    canonical: 'https://airanko.com/tools/plagiarism-checker',
  },
  openGraph: {
    title: "Free AI Content Detector & Grammar Checker | Ai Ranko",
    description: "Check text for AI-writing patterns, grammar, readability and weak words in one free analysis. 30–3,000 words, no sign-up. Not a web plagiarism checker.",
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
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Free AI Content Detector & Grammar Checker | Ai Ranko",
    description: "Check text for AI-writing patterns, grammar, readability and weak words in one free analysis. 30–3,000 words, no sign-up. Not a web plagiarism checker.",
    images: [
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20and%20converter%20tool%20open%20graph-airanko-fRSh9KtchB104ghNi32hTIxcT2OE87.webp',
    ],
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "@id": "https://airanko.com/tools/plagiarism-checker#app",
  "name": "AI Content Detector & Grammar Checker",
  "url": "https://airanko.com/tools/plagiarism-checker",
  "description": "Check text for AI-writing patterns, grammar and spelling errors, readability and weak words in one free analysis of 30 to 3,000 words. It does not compare text against web pages for plagiarism.",
  "applicationCategory": "UtilityApplication",
  "operatingSystem": "Any",
  "browserRequirements": "Requires JavaScript. Works in modern browsers.",
  "isAccessibleForFree": true,
  "featureList": [
    "AI-writing pattern detection with an AI% and Human% estimate",
    "Grammar and spelling errors with exact corrections",
    "AI-estimated readability score with estimated grade level",
    "Weak-word detection with replacement suggestions",
    "AI signal breakdown",
    "Inline text highlights",
    "AI-estimated overall quality score and improvement tips",
    "No sign-up and no watermark"
  ],
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "GBP"
  },
  "provider": {
    "@id": "https://airanko.com/#organization"
  }
}

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": "https://airanko.com/tools/plagiarism-checker#faq",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What does this tool check?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It runs four checks in one analysis: AI-writing pattern detection (an AI% and Human% estimate), grammar and spelling with exact corrections, a readability score, and weak-word detection with replacement suggestions."
      }
    },
    {
      "@type": "Question",
      "name": "Is this a plagiarism checker that compares my text against the web?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. It does not compare your text against web pages or any database of published documents, so it cannot tell you whether text was copied. To check for copied text, use a dedicated plagiarism checker that searches published sources. This tool checks writing quality and AI-writing patterns."
      }
    },
    {
      "@type": "Question",
      "name": "How accurate is the AI detection?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No AI detector is fully accurate. The tool looks for patterns that often appear in AI-generated writing, such as formulaic transitions, repetitive sentence structure, generic claims and a lack of personal voice. Treat the score as one signal, never as proof that someone used AI, and never as the only basis for a decision about a person."
      }
    },
    {
      "@type": "Question",
      "name": "Why does my own writing score as partly AI-generated?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "If your writing is very structured, uses common transitional phrases or lacks specific personal examples, it can share patterns with AI text. The tool flags patterns, not intent. Open the Signals tab to see exactly what triggered the score."
      }
    },
    {
      "@type": "Question",
      "name": "What readability score should I aim for?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The readability score is an AI estimate, not a separately calculated reading test. A score between 60–80 can be a rough starting point for general web content, but check whether the text suits your readers. Technical content for expert readers may need more specialist language. Treat the suggested grade level as an estimate too."
      }
    },
    {
      "@type": "Question",
      "name": "How many words can I analyse?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Between 30 and 3,000 words per analysis. For longer content, analyse it in sections."
      }
    },
    {
      "@type": "Question",
      "name": "Can I analyse content in languages other than English?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "You can paste text in languages other than English, but the code does not apply language-specific readability formulas or validate language accuracy. Grammar suggestions and readability scores are AI estimates. Check non-English results with someone fluent in the language."
      }
    },
    {
      "@type": "Question",
      "name": "Is my content stored or used for training?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Your text is sent to a third-party AI service through its API to produce the analysis. This tool has no database or browser-storage writes for your text, but error logs may include part of an AI response. The tool code does not establish the provider’s retention or training practices. See our privacy policy for details."
      }
    },
    {
      "@type": "Question",
      "name": "Is this tool free?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. There's no account, subscription or watermark: paste your text and run the analysis."
      }
    },
    {
      "@type": "Question",
      "name": "Will Google penalise content that scores as AI-written?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Google says it rewards helpful, original content however it is produced, and that using automation to produce content mainly to manipulate rankings breaks its spam policies. See Google's guidance on AI-generated content. Use the score to find generic, low-value passages and improve them for your readers, not to chase a number."
      }
    },
    {
      "@type": "Question",
      "name": "What should I do after seeing the results?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Start with the Grammar tab and fix the errors first. Then work through the Words tab and replace weak words. If the AI score is high, review the Signals tab and rewrite those sections with your own experience, specific examples and varied sentence structure. To tighten a page for a target keyword afterwards, try the Content Optimizer."
      }
    }
  ]
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
      />      <Navbar />
      <BreadcrumbSchema items={[{ name: 'Tools', href: '/#tools' }, { name: 'AI Content Detector', href: '/tools/plagiarism-checker' }]} />

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
            <Link href="/blog" className="transition-colors hover:text-foreground">Blog</Link>
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
