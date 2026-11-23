import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Zap } from 'lucide-react'
import Navbar from '@/components/navbar'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'
import MetaTitleDescriptionGeneratorTool from '@/components/meta-title-description-generator/meta-title-description-generator-tool'
import MetaTitleDescriptionPixelGeneratorSeoSections from '@/components/meta-title-description-pixel-generator-seo-sections'
import { CookieSettingsLink } from '@/components/cookie-consent/cookie-settings-link'

export const metadata: Metadata = {
  title: "Free AI Meta Title & Description Generator | Ai Ranko",
  description: "Generate meta titles and descriptions with AI for up to 20 pages per batch, measured against desktop or mobile pixel limits. Free, no signup.",
  keywords:
    'meta title generator, AI meta description generator, bulk meta title generator, meta description pixel width, desktop and mobile meta tags, SEO title generator',
  authors: [{ name: 'Ai Ranko Editorial Team', url: 'https://airanko.com' }],
  alternates: { canonical: 'https://airanko.com/tools/meta-title-description-pixel-generator' },
  openGraph: {
    title: "Free AI Meta Title & Description Generator | Ai Ranko",
    description: "Generate meta titles and descriptions with AI for up to 20 pages per batch, measured against desktop or mobile pixel limits. Free, no signup.",
    url: 'https://airanko.com/tools/meta-title-description-pixel-generator',
    siteName: 'Ai Ranko',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20and%20converter%20tool%20open%20graph-airanko-fRSh9KtchB104ghNi32hTIxcT2OE87.webp',
        width: 1200, height: 630, alt: 'Ai Ranko Meta Title & Description Generator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Free AI Meta Title & Description Generator | Ai Ranko",
    description: "Generate meta titles and descriptions with AI for up to 20 pages per batch, measured against desktop or mobile pixel limits. Free, no signup.",
    images: ['https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20and%20converter%20tool%20open%20graph-airanko-fRSh9KtchB104ghNi32hTIxcT2OE87.webp'],
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "@id": "https://airanko.com/tools/meta-title-description-pixel-generator#app",
  "name": "Meta Title & Description Generator (Pixel Limits)",
  "url": "https://airanko.com/tools/meta-title-description-pixel-generator",
  "description": "Generate meta titles and descriptions with AI for up to 20 pages per batch, measured against desktop or mobile pixel limits. Free, no signup.",
  "applicationCategory": "UtilityApplication",
  "operatingSystem": "Any",
  "browserRequirements": "Requires JavaScript.",
  "isAccessibleForFree": true,
  "featureList": [
    "Generate meta titles, meta descriptions or both",
    "Up to 20 page topics per batch",
    "1 to 5 variants per page",
    "Desktop and mobile pixel-width measurement",
    "Live pixel-width badge while editing",
    "Per-page regenerate",
    "CSV and JSON export"
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
  "@id": "https://airanko.com/tools/meta-title-description-pixel-generator#faq",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How does this tool make sure titles and descriptions fit pixel limits?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "AI writes towards a character target for your chosen device. Each returned variant is then measured with your browser’s canvas text renderer against the same estimated pixel limits used by our Meta Pixel Checker. The badge shows Fits below 92% of the limit, Near limit from 92% up to the limit, and Too long above it. Edit the text to review its width. A fitting badge does not guarantee how Google will display it."
      }
    },
    {
      "@type": "Question",
      "name": "Is there a free AI meta description generator that checks pixel width?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. This free tool combines AI generation with browser-based pixel-width measurement. You can review and edit suggestions here, then use a checker after publishing to confirm the tags served by your live pages."
      }
    },
    {
      "@type": "Question",
      "name": "Can I generate just titles, or just descriptions?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Pick \"Titles\", \"Descriptions\", or \"Both\" before generating — you’ll only get results for what you asked for."
      }
    },
    {
      "@type": "Question",
      "name": "How many variants can I generate per page?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Choose 1 to 5 variants per page with the slider. Each batch accepts up to 20 page topics. The requested variant count is passed to the AI, but the response does not enforce an exact number, so check the returned options."
      }
    },
    {
      "@type": "Question",
      "name": "What’s the difference between optimising for desktop vs mobile pixel limits?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "This tool uses estimated desktop limits of 600px for titles and 920px for descriptions, and mobile limits of 580px and 680px. Switching the device toggle re-measures the existing text without regenerating it. Titles use different font sizes on desktop and mobile, so check both rather than assuming one result applies to the other."
      }
    },
    {
      "@type": "Question",
      "name": "Can I edit the generated titles and descriptions?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Every returned variant is editable. As you type, the pixel-width badge recalculates so you can review the wording against the selected device’s estimated limit."
      }
    },
    {
      "@type": "Question",
      "name": "Is this free and is there a limit?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Free, no sign-up. Each batch accepts up to 20 page topics and requests 1 to 5 variants per selected field. Generation can fail or return fewer options, so review the results before using them."
      }
    },
    {
      "@type": "Question",
      "name": "How long should a meta title or description be?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Google sets no fixed length limit. Its guidance says titles and snippets are shortened as needed to fit the width of the result, which is why this tool measures pixel width instead of counting characters. Put the most important words first so the useful part stays visible if the end is cut off."
      }
    },
    {
      "@type": "Question",
      "name": "Will Google use the title and description I write?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Not always. Google creates title links and snippets automatically and may use text from the page, or a different title, if it describes the page better. Write a title and description that accurately reflect the page, and treat the result as a suggestion to Google, not a guarantee."
      }
    },
    {
      "@type": "Question",
      "name": "Does the generator read my live page?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. You give it a topic, keyword or short brief for each page, and it writes from that. Review each suggestion against what the page actually says before you publish it."
      }
    },
    {
      "@type": "Question",
      "name": "How do I check the titles and descriptions already on my site?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Use our bulk meta title and description pixel checker to review fetched titles and descriptions for missing text and widths that may be cut off. It does not detect duplicate wording. Compare repeated titles and descriptions yourself, then use this generator to draft alternatives."
      }
    }
  ]
}

export default function MetaTitleDescriptionGeneratorPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <div className="print:hidden" data-print-hide>
        <Navbar />
      </div>
      <BreadcrumbSchema items={[{ name: 'Tools', href: '/#tools' }, { name: 'Meta Title & Description Generator', href: '/tools/meta-title-description-pixel-generator' }]} />

      <div className="border-b border-border bg-card px-4 py-3 sm:px-6 lg:px-8 print:hidden" data-print-hide>
        <div className="mx-auto flex max-w-7xl items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/" className="flex items-center gap-1.5 transition-colors hover:text-foreground">
            <Zap className="h-3.5 w-3.5 text-primary" />
            Ai Ranko
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/#tools" className="transition-colors hover:text-foreground">Tools</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-foreground">Meta Title &amp; Description Generator</span>
        </div>
      </div>

      <main>
        <MetaTitleDescriptionGeneratorTool />
      </main>

      <div className="print:hidden" data-print-hide>
        <MetaTitleDescriptionPixelGeneratorSeoSections />
      </div>

      {/* FAQ */}
      <section className="px-4 py-12 sm:px-6 lg:px-8 print:hidden" data-print-hide>
        <div className="mx-auto max-w-3xl">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">Frequently Asked Questions</h2>
          <div className="mt-6 space-y-3">
            {faqJsonLd.mainEntity.map((f) => (
              <details key={f.name} className="group rounded-2xl border border-border bg-card">
                <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 font-heading text-sm font-semibold text-foreground">
                  {f.name}
                  <span className="shrink-0 transition-transform duration-200 group-open:rotate-180">
                    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
                      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </summary>
                <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{f.name === 'How do I check the titles and descriptions already on my site?' ? <>Use our <Link href="/tools/meta-title-description-bulk-pixel-checker" className="text-primary underline underline-offset-4">bulk meta title and description pixel checker</Link>{f.acceptedAnswer.text.split('bulk meta title and description pixel checker')[1]}</> : f.acceptedAnswer.text}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="mt-4 border-t border-border bg-card px-4 py-8 sm:px-6 lg:px-8 print:hidden" data-print-hide>
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <Link href="/" aria-label="Ai Ranko home">
            <img src="/images/ai-ranko-logo.webp" alt="Ai Ranko" className="h-7 w-auto" />
          </Link>
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Ai Ranko. Free AI SEO &amp; image tools — no signup required.
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
