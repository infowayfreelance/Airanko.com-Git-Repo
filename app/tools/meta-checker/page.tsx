import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Zap } from 'lucide-react'
import Navbar from '@/components/navbar'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'
import MetaCheckerTool from '@/components/meta-checker/meta-checker-tool'
import MetaCheckerSeoSections, { metaCheckerFaqs } from '@/components/meta-checker-seo-sections'
import { CookieSettingsLink } from '@/components/cookie-consent/cookie-settings-link'

export const metadata: Metadata = {
  title: 'Bulk Meta & Open Graph Checker — Free Online Tool | Ai Ranko',
  description:
    'Bulk meta tag checker: see meta titles, descriptions, Open Graph and Twitter Card tags for one URL or a list, with character counts. Free, no login.',
  keywords:
    'meta tag checker, bulk meta checker, open graph checker, twitter card checker, meta description analyser, bulk seo checker, OG tag checker, free meta tag tool',
  alternates: {
    canonical: 'https://airanko.com/tools/meta-checker',
  },
  openGraph: {
    title: 'Bulk Meta & Open Graph Checker — Free Online Tool | Ai Ranko',
    description:
      'Bulk meta tag checker: see meta titles, descriptions, Open Graph and Twitter Card tags for one URL or a list, with character counts. Free, no login.',
    url: 'https://airanko.com/tools/meta-checker',
    siteName: 'AI Ranko',
    images: [
      {
        url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20and%20converter%20tool%20open%20graph-airanko-fRSh9KtchB104ghNi32hTIxcT2OE87.webp',
        width: 1200,
        height: 630,
        alt: 'Bulk Meta & Open Graph Checker — Free Online Tool | Ai Ranko',
      },
    ],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bulk Meta & Open Graph Checker — Free Online Tool | Ai Ranko',
    description:
      'Bulk meta tag checker: see meta titles, descriptions, Open Graph and Twitter Card tags for one URL or a list, with character counts. Free, no login.',
    images: [
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20and%20converter%20tool%20open%20graph-airanko-fRSh9KtchB104ghNi32hTIxcT2OE87.webp',
    ],
  },
}

const jsonLd = {"@context": "https://schema.org", "@type": "WebApplication", "@id": "https://airanko.com/tools/meta-checker#app", "name": "Bulk Meta & OG Checker", "url": "https://airanko.com/tools/meta-checker", "description": "Check meta title, meta description, Open Graph and Twitter Card tags for one URL or a list of URLs, with character counts and a live tag preview. Free, no sign-up.", "applicationCategory": "UtilityApplication", "operatingSystem": "Any", "browserRequirements": "Requires JavaScript. Works in modern browsers.", "isAccessibleForFree": true, "featureList": ["Meta title and description checker with character counts", "Open Graph tag checker (og:title, og:description, og:image, og:type)", "Twitter Card checker (twitter:card, twitter:title, twitter:description, twitter:image)", "Bulk URL checking: paste URLs separated by commas or new lines", "Live tag preview", "Server-side fetching"], "offers": {"@type": "Offer", "price": "0", "priceCurrency": "GBP"}, "provider": {"@id": "https://airanko.com/#organization"}}

const faqJsonLd = {
 "@context": "https://schema.org", "@type": "FAQPage", "@id": "https://airanko.com/tools/meta-checker#faq",
 mainEntity: metaCheckerFaqs.map(faq => ({ "@type": "Question", name: faq.q, acceptedAnswer: { "@type": "Answer", text: faq.a } }))
}

export default function MetaCheckerPage() {
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
      <BreadcrumbSchema items={[{ name: 'Tools', href: '/#tools' }, { name: 'Meta Checker', href: '/tools/meta-checker' }]} />

      {/* Breadcrumb */}
      <div className="border-b border-border bg-card px-4 py-3 sm:px-6 lg:px-8">
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
          <span className="text-foreground font-medium">Meta & OG Checker</span>
        </div>
      </div>

      <main>
        <MetaCheckerTool />
      </main>

      <MetaCheckerSeoSections />

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-12 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Link href="/" className="flex items-center" aria-label="Ai Ranko home">
            <img
              src="/images/ai-ranko-logo.webp"
              alt="Ai Ranko"
              className="h-7 w-auto"
            />
          </Link>
          <p className="text-sm text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} Ai Ranko. Meta data is fetched server-side and held in the current page session.
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
