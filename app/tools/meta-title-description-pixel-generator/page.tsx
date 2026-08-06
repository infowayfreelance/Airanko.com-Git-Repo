import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Zap } from 'lucide-react'
import Navbar from '@/components/navbar'
import ToolSchema from '@/components/ToolSchema'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'
import MetaTitleDescriptionGeneratorTool from '@/components/meta-title-description-generator/meta-title-description-generator-tool'

export const metadata: Metadata = {
  title: 'AI Meta Title & Description Generator — Google Pixel Limits (Bulk) — Free | Ai Ranko',
  description:
    'Generate SEO meta titles and descriptions in bulk with AI — sized to fit Google Pixel width limits for desktop or mobile SERPs. Pick titles, descriptions, or both, choose how many variants you need, and fine-tune each one with live Google Pixel-width feedback. Free, no signup.',
  keywords:
    'meta title generator, google pixel meta title generator, ai meta description generator, google pixel description generator, bulk meta title generator, meta title google pixel checker, pixel perfect meta description generator, google serp pixel width generator, seo title generator, chatgpt meta description generator',
  authors: [{ name: 'Ai Ranko Editorial Team', url: 'https://airanko.com' }],
  alternates: { canonical: 'https://airanko.com/tools/meta-title-description-pixel-generator' },
  openGraph: {
    title: 'AI Meta Title & Description Generator — Google Pixel Limits (Bulk) | Ai Ranko',
    description: 'AI-generated meta titles and descriptions sized to fit Google Pixel width limits for desktop or mobile SERPs — in bulk, with live pixel-width editing.',
    url: 'https://airanko.com/tools/meta-title-description-pixel-generator',
    siteName: 'Ai Ranko',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20and%20converter%20tool%20open%20graph-airanko-fRSh9KtchB104ghNi32hTIxcT2OE87.webp',
        width: 1200, height: 630, alt: 'AI Meta Title & Description Generator — Google Pixel Limits | Ai Ranko',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Meta Title & Description Generator — Google Pixel Limits | Ai Ranko',
    description: 'AI-generated meta titles and descriptions sized to fit Google Pixel width limits for desktop or mobile SERPs — in bulk, with live pixel-width editing.',
    images: ['https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20and%20converter%20tool%20open%20graph-airanko-fRSh9KtchB104ghNi32hTIxcT2OE87.webp'],
  },
}

const jsonLd = {
  '@context': 'https://schema.org', '@type': 'SoftwareApplication',
  name: 'AI Meta Title & Description Generator — Google Pixel Limits',
  description: 'Bulk-generates AI meta titles and descriptions sized to fit Google Pixel width limits for desktop or mobile SERPs, with live pixel-width editing and CSV/JSON export.',
  url: 'https://airanko.com/tools/meta-title-description-pixel-generator',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'All',
  browserRequirements: 'Requires JavaScript.',
  featureList: [
    'AI-generated meta titles and/or descriptions, in bulk (up to 20 pages per batch)',
    'Choose titles only, descriptions only, or both',
    'Choose how many variants to generate per page (1-5)',
    'Optimize for Google Pixel width limits on desktop or mobile SERPs',
    'Real Google Pixel-width measurement via canvas text metrics, updated live as you edit',
    'Inline editing of every generated variant with instant pass/near-limit/over-limit feedback',
    'Per-page regenerate without starting over',
    'Optional brand name and tone controls',
    'CSV and JSON export',
    'No sign-up, no watermark, 100% free',
  ],
  creator: { '@type': 'Organization', name: 'Ai Ranko', url: 'https://airanko.com' },
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
}

const faqJsonLd = {
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'How does this tool make sure titles and descriptions fit Google Pixel limits?', acceptedAnswer: { '@type': 'Answer', text: 'AI writes to a character target for your chosen device, then every variant is measured with the browser’s real canvas text renderer against the same Google Pixel-width limits used by our Meta Pixel Checker — not an estimate. You get an instant Fits / Near limit / Too long badge on every variant, and can edit the text directly to see the pixel width update live.' } },
    { '@type': 'Question', name: 'Is there a free AI meta description generator that checks Google Pixel width?', acceptedAnswer: { '@type': 'Answer', text: 'Yes — this tool is completely free and combines AI generation with real Google Pixel-width measurement in one step, so you don’t need a separate pixel checker afterward.' } },
    { '@type': 'Question', name: 'Can I generate just titles, or just descriptions?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Pick "Titles", "Descriptions", or "Both" before generating — you’ll only get results for what you asked for.' } },
    { '@type': 'Question', name: 'How many variants can I generate per page?', acceptedAnswer: { '@type': 'Answer', text: 'Choose 1 to 5 variants per page with the slider. Each batch supports up to 20 pages at once, so with 5 variants and 20 pages you can generate up to 100 titles and 100 descriptions in a single run.' } },
    { '@type': 'Question', name: 'What’s the difference between optimizing for desktop vs mobile Google Pixel limits?', acceptedAnswer: { '@type': 'Answer', text: 'Google’s desktop and mobile search results render titles and descriptions at different pixel widths (roughly 600px / 920px on desktop vs 580px / 680px on mobile). Switching the device toggle re-measures every already-generated variant instantly against the selected device’s Google Pixel limits — no need to regenerate.' } },
    { '@type': 'Question', name: 'Can I edit the generated titles and descriptions?', acceptedAnswer: { '@type': 'Answer', text: 'Yes — every variant is a live editable field. As you type, the Google Pixel-width badge recalculates in real time so you can fine-tune wording until it fits perfectly.' } },
    { '@type': 'Question', name: 'Is this free and is there a limit?', acceptedAnswer: { '@type': 'Answer', text: 'Completely free, no sign-up. Each batch supports up to 20 page topics and up to 5 variants per field to keep generations fast and reliable.' } },
  ],
}

export default function MetaTitleDescriptionGeneratorPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <div className="print:hidden" data-print-hide>
        <Navbar />
      </div>
      <ToolSchema name="AI Meta Title & Description Generator — Google Pixel Limits" slug="meta-title-description-pixel-generator" description="Bulk-generate AI meta titles and descriptions sized to fit Google Pixel width limits for desktop or mobile SERPs, with live pixel-width editing." />
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
                <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{f.acceptedAnswer.text}</p>
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
          </nav>
        </div>
      </footer>
    </div>
  )
}
