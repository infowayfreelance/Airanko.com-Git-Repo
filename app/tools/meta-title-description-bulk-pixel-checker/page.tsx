import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Zap } from 'lucide-react'
import Navbar from '@/components/navbar'
import MetaPixelCheckerSeoSections from '@/components/meta-pixel-checker-seo-sections'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'
import MetaPixelCheckerTool from '@/components/meta-pixel-checker/meta-pixel-checker-tool'
import { CookieSettingsLink } from '@/components/cookie-consent/cookie-settings-link'

export const metadata: Metadata = {
  title: "Free Bulk Meta Title & Description Pixel Checker | Ai Ranko",
  description: "Check meta title and description pixel width in bulk. Crawl a sitemap or paste URLs, see desktop and mobile widths, export CSV or JSON. Free, no signup.",
  keywords:
    'meta title pixel checker, meta description pixel width, serp snippet checker, bulk meta pixel checker, title length checker pixels, google serp preview tool, sitemap meta checker, pixel width calculator seo',
  authors: [{ name: 'Ai Ranko Editorial Team', url: 'https://airanko.com' }],
  alternates: { canonical: 'https://airanko.com/tools/meta-title-description-bulk-pixel-checker' },
  openGraph: {
    title: "Free Bulk Meta Title & Description Pixel Checker | Ai Ranko",
    description: "Check meta title and description pixel width in bulk. Crawl a sitemap or paste URLs, see desktop and mobile widths, export CSV or JSON. Free, no signup.",
    url: 'https://airanko.com/tools/meta-title-description-bulk-pixel-checker',
    siteName: 'Ai Ranko',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20and%20converter%20tool%20open%20graph-airanko-fRSh9KtchB104ghNi32hTIxcT2OE87.webp',
        width: 1200, height: 630, alt: 'Meta Title & Description Pixel Checker | Ai Ranko',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Free Bulk Meta Title & Description Pixel Checker | Ai Ranko",
    description: "Check meta title and description pixel width in bulk. Crawl a sitemap or paste URLs, see desktop and mobile widths, export CSV or JSON. Free, no signup.",
    images: ['https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20and%20converter%20tool%20open%20graph-airanko-fRSh9KtchB104ghNi32hTIxcT2OE87.webp'],
  },
}

const jsonLd = {
  '@context': 'https://schema.org', '@type': 'WebApplication',
  name: 'Bulk Meta Title & Description Pixel Checker',
  description: metadata.description,
  url: 'https://airanko.com/tools/meta-title-description-bulk-pixel-checker',
  applicationCategory: 'UtilityApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript.',
  '@id': 'https://airanko.com/tools/meta-title-description-bulk-pixel-checker#app',
  isAccessibleForFree: true,
  featureList: [
    'Sitemap discovery via robots.txt, /sitemap.xml and /sitemap_index.xml, including bounded nested sitemap indexes',
    'Bulk crawl and analysis of up to 300 URLs',
    'Single URL and pasted multi-URL input modes',
    'Real pixel-width measurement via canvas text metrics for desktop and mobile',
    'Good, Near limit and Too long status for each title and description',
    'Simulated Google SERP preview cards for desktop and mobile',
    'CSV and JSON export',
  ],
  provider: { '@id': 'https://airanko.com/#organization' },
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
}

const faqJsonLd = {
  '@context': 'https://schema.org', '@type': 'FAQPage',
  '@id': 'https://airanko.com/tools/meta-title-description-bulk-pixel-checker#faq',
  mainEntity: [
    { '@type': 'Question', name: 'How is meta title/description pixel width different from character count?', acceptedAnswer: { '@type': 'Answer', text: 'Google truncates titles and descriptions based on rendered pixel width, not character count. Because letters like "i" and "l" are much narrower than "W" or "M", two titles with the same character count can render at very different widths — pixel width is the more accurate way to check if your snippet will get cut off.' } },
    { '@type': 'Question', name: 'What are the pixel limits this tool uses?', acceptedAnswer: { '@type': 'Answer', text: 'By default: desktop title 600px, desktop description 920px, mobile title 580px, mobile description 680px. Google has never published an official spec and these limits shift as Google redesigns its results pages, so treat them as industry-standard estimates, not guarantees.' } },
    { '@type': 'Question', name: 'How does the sitemap crawl work?', acceptedAnswer: { '@type': 'Answer', text: 'Enter your website URL and the tool checks robots.txt for Sitemap directives. If none are listed, it tries /sitemap.xml and /sitemap_index.xml. It follows nested sitemap indexes within its limits and fetches pages up to your selected scan limit. Titles and descriptions from successful responses are measured in your browser.' } },
    { '@type': 'Question', name: 'Can I check just one page, or a specific list of pages?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Switch to "Single URL" for one page, or "Multiple URLs" to paste a list (one per line or comma-separated) — no sitemap required.' } },
    { '@type': 'Question', name: 'Is this free and is there a page limit?', acceptedAnswer: { '@type': 'Answer', text: 'Completely free, no sign-up. Sitemap and bulk modes support up to 300 pages per scan to keep results fast.' } },
    {"@type": "Question", "name": "Why does Google show a different title from the one I wrote?", "acceptedAnswer": {"@type": "Answer", "text": "Google creates title links automatically. It usually uses your title element, but it can also use the main heading, other prominent text on the page or links pointing to it, especially if your title is very long, repeated across pages or doesn't describe the page well. A clear, unique title that fits the width is the one most likely to be shown as written."}},
    {"@type": "Question", "name": "Will fixing pixel width improve my rankings?", "acceptedAnswer": {"@type": "Answer", "text": "Not by itself. Pixel width affects how much of your title and description people can see in the results, which can help them understand the page and decide to click. Rankings depend mainly on how well the page answers the search."}},
    {"@type": "Question", "name": "Can I check pages that need a login?", "acceptedAnswer": {"@type": "Answer", "text": "No. The checker cannot sign in or send your login cookies. It can only measure metadata in the public response, which may be a sign-in page, a paywall or an error rather than your protected content. For those pages, copy the title and description into the single-page generator instead."}},
    {"@type": "Question", "name": "Should I write for the desktop or the mobile limit?", "acceptedAnswer": {"@type": "Answer", "text": "Aim for the narrower mobile limit if you can. A title and description that fit the mobile width will usually display in full on desktop as well. Put the most important words first in case the end is cut off."}},

  ],
}

export default function MetaPixelCheckerPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <div className="print:hidden" data-print-hide>
        <Navbar />
      </div>
      <BreadcrumbSchema items={[{ name: 'Tools', href: '/#tools' }, { name: 'Meta Pixel Checker', href: '/tools/meta-title-description-bulk-pixel-checker' }]} />

      <div className="border-b border-border bg-card px-4 py-3 sm:px-6 lg:px-8 print:hidden" data-print-hide>
        <div className="mx-auto flex max-w-7xl items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/" className="flex items-center gap-1.5 transition-colors hover:text-foreground">
            <Zap className="h-3.5 w-3.5 text-primary" />
            Ai Ranko
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/#tools" className="transition-colors hover:text-foreground">Tools</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-foreground">Meta Pixel Checker</span>
        </div>
      </div>

      <main>
        <MetaPixelCheckerTool />
      </main>

      <MetaPixelCheckerSeoSections />

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
                <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{f.name === 'Can I check pages that need a login?' ? <>{f.acceptedAnswer.text.split('the single-page generator')[0]}<Link href="/tools/meta-title-description-pixel-generator" className="text-primary underline underline-offset-4">the single-page generator</Link>{f.acceptedAnswer.text.split('the single-page generator')[1]}</> : f.acceptedAnswer.text}</p>
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
