import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Zap } from 'lucide-react'
import Navbar from '@/components/navbar'
import ToolSchema from '@/components/ToolSchema'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'
import SiteAuditTool from '@/components/site-audit/site-audit-tool'
import SiteAuditSeoSections, { siteAuditFaqs } from '@/components/site-audit-seo-sections'
import { CookieSettingsLink } from '@/components/cookie-consent/cookie-settings-link'

export const metadata: Metadata = {
  title: "Free AI SEO Audit Tool & Website Audit | Ai Ranko",
  description:
    "Free AI SEO and website audit. Crawl up to 15 pages with 25+ SEO, performance, accessibility and mobile checks, clear fixes and an AI summary.",
  keywords:
    'site audit tool, seo audit, free website audit, technical seo audit, content quality audit, website health check, ai site audit, free seo checker',
  alternates: {
    canonical: 'https://airanko.com/tools/site-audit',
  },
  openGraph: {
    title: "Free AI SEO Audit Tool & Website Audit | Ai Ranko",
    description:
      "Free AI SEO and website audit. Crawl up to 15 pages with 25+ SEO, performance, accessibility and mobile checks, clear fixes and an AI summary.",
    url: 'https://airanko.com/tools/site-audit',
    siteName: 'Ai Ranko',
    images: [
      {
        url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20and%20converter%20tool%20open%20graph-airanko-fRSh9KtchB104ghNi32hTIxcT2OE87.webp',
        width: 1200,
        height: 630,
        alt: 'Free AI Site Audit Tool — Ai Ranko',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Free AI SEO Audit Tool & Website Audit | Ai Ranko",
    description:
      "Free AI SEO and website audit. Crawl up to 15 pages with 25+ SEO, performance, accessibility and mobile checks, clear fixes and an AI summary.",
    images: [
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20and%20converter%20tool%20open%20graph-airanko-fRSh9KtchB104ghNi32hTIxcT2OE87.webp',
    ],
  },
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: siteAuditFaqs.map((faq) => ({
    '@type': 'Question',
    name: faq.q,
    acceptedAnswer: { '@type': 'Answer', text: faq.a },
  })),
}

export default function SiteAuditPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />      <Navbar />
      <ToolSchema name="Free AI SEO Audit Tool" slug="site-audit" description="Free AI SEO and website audit. Crawl up to 15 pages with 25+ SEO, performance, accessibility and mobile checks, clear fixes and an AI summary." />
      <BreadcrumbSchema items={[{ name: 'Tools', href: '/#tools' }, { name: 'Site Audit', href: '/tools/site-audit' }]} />

      {/* Breadcrumb */}
      <div className="border-b border-border bg-card px-4 py-3 sm:px-6 lg:px-8 print:hidden">
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
          <span className="text-foreground font-medium">Site Audit</span>
        </div>
      </div>

      <main>
        <SiteAuditTool />
      </main>

      <SiteAuditSeoSections />

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-12 px-4 py-8 sm:px-6 lg:px-8 print:hidden">
        <div className="mx-auto max-w-7xl flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Link href="/" className="flex items-center" aria-label="Ai Ranko home">
            <img
              src="/images/ai-ranko-logo.webp"
              alt="Ai Ranko"
              className="h-7 w-auto"
            />
          </Link>
          <p className="text-sm text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} Ai Ranko. Audit reports are generated on demand.
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
