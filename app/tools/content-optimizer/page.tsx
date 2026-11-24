import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Zap } from 'lucide-react'
import Navbar from '@/components/navbar'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'
import ContentOptimizerTool from '@/components/content-optimizer/content-optimizer-tool'
import ContentOptimizerSeoSections from '@/components/content-optimizer-seo-sections'
import { CookieSettingsLink } from '@/components/cookie-consent/cookie-settings-link'

export const metadata: Metadata = {
  title: "Free AI Content Optimizer: SEO & E-E-A-T Audit | Ai Ranko",
  description: "Paste an article and target keyword for a free AI content audit: E-E-A-T and helpfulness checks, search intent, heading rewrites and a new title and meta.",
  keywords:
    'AI content optimizer, content optimization tool, Google E-E-A-T checker, helpful content checker, on-page SEO optimizer, LSI keyword finder, content scoring tool, search intent matcher, free SEO optimizer',
  alternates: { canonical: 'https://airanko.com/tools/content-optimizer' },
  openGraph: {
    title: "Free AI Content Optimizer: SEO & E-E-A-T Audit | Ai Ranko",
    description: "Paste an article and target keyword for a free AI content audit: E-E-A-T and helpfulness checks, search intent, heading rewrites and a new title and meta.",
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
    title: "Free AI Content Optimizer: SEO & E-E-A-T Audit | Ai Ranko",
    description: "Paste an article and target keyword for a free AI content audit: E-E-A-T and helpfulness checks, search intent, heading rewrites and a new title and meta.",
    images: ['https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20and%20converter%20tool%20open%20graph-airanko-fRSh9KtchB104ghNi32hTIxcT2OE87.webp'],
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "@id": "https://airanko.com/tools/content-optimizer#app",
  "name": "AI Content Optimizer",
  "url": "https://airanko.com/tools/content-optimizer",
  "description": "Paste an article and target keyword for a free AI content audit: E-E-A-T and helpfulness checks, search intent, heading rewrites and a new title and meta.",
  "applicationCategory": "UtilityApplication",
  "operatingSystem": "Any",
  "browserRequirements": "Requires JavaScript.",
  "isAccessibleForFree": true,
  "featureList": [
    "E-E-A-T signals check",
    "Helpfulness (people-first) check",
    "Keyword and related-term analysis",
    "Search intent match",
    "Structure and readability review",
    "Heading rewrites with reasons",
    "Suggested title, meta description, URL slug and schema type",
    "Missing subtopic suggestions",
    "100 to 4,000 words per analysis"
  ],
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "provider": {
    "@id": "https://airanko.com/#organization"
  }
}

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": "https://airanko.com/tools/content-optimizer#faq",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What does this tool actually check?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It reviews your text for signs of experience, expertise and trust, how people-first and useful it reads, keyword and related-term coverage, whether the content type matches the search intent, structure and readability, heading quality, on-page basics (title, meta description, URL slug, schema type, internal link ideas) and subtopics you may have missed."
      }
    },
    {
      "@type": "Question",
      "name": "What is E-E-A-T and why does it matter?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "E-E-A-T stands for Experience, Expertise, Authoritativeness and Trustworthiness. Google's search quality raters use these ideas to assess whether results are helpful, and Google's guidance encourages content that shows them. Google says trust is the most important of the four."
      }
    },
    {
      "@type": "Question",
      "name": "Is E-E-A-T a Google ranking factor?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Not directly. Google says E-E-A-T itself isn't a specific ranking factor, but its systems use a mix of signals that can identify content with good E-E-A-T. This tool looks for signs of those qualities in your text, such as first-hand experience, clear sourcing and author information."
      }
    },
    {
      "@type": "Question",
      "name": "How is this different from a grammar checker?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A grammar checker fixes spelling and language. This tool looks at whether the content serves the searcher: does it match the intent, cover the topic, show experience and expertise, and have a clear structure? It then suggests specific rewrites and fixes."
      }
    },
    {
      "@type": "Question",
      "name": "Does the tool follow Google's rules?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It's built around Google's public guidance on helpful, reliable, people-first content and on-page best practice. It isn't made by Google and can't see how Google ranks a specific page; treat the report as an editor's checklist, not a prediction."
      }
    },
    {
      "@type": "Question",
      "name": "How accurate is the E-E-A-T score?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It's an AI estimate based only on the text you paste: things like first-hand experience, original data, credentials, citations and author attribution. It can't see your site's reputation, your authors' track record, links to your site or how real users respond, which also matter."
      }
    },
    {
      "@type": "Question",
      "name": "What are related terms (or \"LSI keywords\")?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "They're words and phrases a knowledgeable writer would naturally use when covering a topic, for example \"arch support\" and \"cushioning\" in an article about running shoes. The SEO name \"LSI keywords\" is widely used, but what matters is covering the topic properly for the reader, not adding a list of terms."
      }
    },
    {
      "@type": "Question",
      "name": "How much content can I analyse?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Between 100 and 4,000 words per analysis. For longer pieces, audit each major section separately for more focused feedback."
      }
    },
    {
      "@type": "Question",
      "name": "Is the tool really free?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. The content optimizer is free to use and you don't need to sign up."
      }
    },
    {
      "@type": "Question",
      "name": "Will a higher score improve my Google rankings?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Not on its own. The score is a guide to making the content more useful and complete; rankings depend on many things the tool can't measure, including competition, links and how well the page meets searchers' needs. Use the fixes that genuinely improve the page for readers."
      }
    },
    {
      "@type": "Question",
      "name": "What should I do after seeing the results?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Start with the critical issues, then apply the heading rewrites that make sense, add missing subtopics as new sections where they help the reader, and use the suggested title and meta as a starting point. Re-run the tool after editing to check what's left."
      }
    }
  ]
}

export default function ContentOptimizerPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />      <Navbar />
      <BreadcrumbSchema items={[{ name: 'Tools', href: '/#tools' }, { name: 'Content Optimizer', href: '/tools/content-optimizer' }]} />

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
