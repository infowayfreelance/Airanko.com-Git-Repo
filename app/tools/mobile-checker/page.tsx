import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Zap } from 'lucide-react'
import Navbar from '@/components/navbar'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'
import MobileCheckerTool from '@/components/mobile-checker/mobile-checker-tool'
import MobileCheckerSeoSections, { mobileCheckerFaqs } from '@/components/mobile-checker-seo-sections'
import { CookieSettingsLink } from '@/components/cookie-consent/cookie-settings-link'

export const metadata: Metadata = {
  title: 'Mobile Friendliness Checker: Preview & Audit | Ai Ranko',
  description:
    'Preview any page at phone, tablet and desktop sizes and audit viewport, text size and more. Free, no sign-up. Compare two URLs or audit a sitemap.',
  keywords:
    'mobile friendliness checker, mobile friendliness audit, mobile responsive test, website mobile test, mobile preview tool, responsive design tester, mobile-first indexing test, free mobile checker, bulk mobile audit, sitemap mobile audit',
  alternates: {
    canonical: 'https://airanko.com/tools/mobile-checker',
  },
  openGraph: {
    title: 'Mobile Friendliness Checker: Preview & Audit | Ai Ranko',
    description:
      'Preview any page at phone, tablet and desktop sizes and run a mobile-friendliness audit. Compare two URLs or audit a sitemap. Free, no sign-up.',
    url: 'https://airanko.com/tools/mobile-checker',
    siteName: 'Ai Ranko',
    images: [
      {
        url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20and%20converter%20tool%20open%20graph-airanko-fRSh9KtchB104ghNi32hTIxcT2OE87.webp',
        width: 1200,
        height: 630,
        alt: 'Mobile Friendliness Checker: Preview & Audit | Ai Ranko',
      },
    ],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mobile Friendliness Checker: Preview & Audit | Ai Ranko',
    description:
      'Preview any page at phone, tablet and desktop sizes and run a mobile-friendliness audit. Compare two URLs or audit a sitemap. Free, no sign-up.',
    images: [
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20and%20converter%20tool%20open%20graph-airanko-fRSh9KtchB104ghNi32hTIxcT2OE87.webp',
    ],
  },
}

const jsonLd = {"@context": "https://schema.org", "@type": "WebApplication", "@id": "https://airanko.com/tools/mobile-checker#app", "name": "Mobile Friendliness Checker", "url": "https://airanko.com/tools/mobile-checker", "description": "Preview a public web page at phone, tablet and desktop screen sizes and run a mobile-friendliness audit of viewport, text size, plugins, responsive images and mobile redirects. Compare two URLs or audit up to 200 pages from a sitemap. Free, no sign-up.", "applicationCategory": "UtilityApplication", "operatingSystem": "Any", "browserRequirements": "Requires JavaScript. Works in modern browsers.", "isAccessibleForFree": true, "featureList": ["Preview at phone, tablet and desktop screen sizes, in portrait or landscape", "Zoom the preview to 50%, 75% or 100%", "Mobile-friendliness audit of the page's HTML: viewport, pinch-to-zoom, font sizes, fixed-width elements, plugins, responsive images, render-blocking scripts and mobile redirects", "Compare two URLs side by side", "Bulk audit from a sitemap, up to 200 pages per run", "Export CSV or JSON results; print or save a PDF through your browser"], "offers": {"@type": "Offer", "price": "0", "priceCurrency": "GBP"}, "provider": {"@id": "https://airanko.com/#organization"}}

const faqJsonLd = {
 "@context": "https://schema.org", "@type": "FAQPage", "@id": "https://airanko.com/tools/mobile-checker#faq",
 mainEntity: mobileCheckerFaqs.map(faq => ({ "@type": "Question", name: faq.q, acceptedAnswer: { "@type": "Answer", text: faq.a } }))
}

export default function MobileCheckerPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />      <div className="print:hidden" data-print-hide>
        <Navbar />
      </div>
      <BreadcrumbSchema items={[{ name: 'Tools', href: '/#tools' }, { name: 'Mobile Checker', href: '/tools/mobile-checker' }]} />

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
          <span className="text-foreground font-medium">Mobile Checker</span>
        </div>
      </div>

      <main className="flex flex-1 flex-col">
        <MobileCheckerTool />
      </main>

      <div className="print:hidden" data-print-hide>
        <MobileCheckerSeoSections />
      </div>

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
            &copy; {new Date().getFullYear()} Ai Ranko. URL previews are loaded on-demand and never stored.
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
