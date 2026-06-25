import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Zap } from 'lucide-react'
import Navbar from '@/components/navbar'
import ToolSchema from '@/components/ToolSchema'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'
import SiteAuditTool from '@/components/site-audit/site-audit-tool'
import SiteAuditSeoSections from '@/components/site-audit-seo-sections'

export const metadata: Metadata = {
  title: 'Free AI Site Audit Tool — 90+ SEO, Performance & Security Checks | AI Ranko',
  description:
    'Run a complete website audit in under 60 seconds. Free AI-powered tool with 90+ checks across technical SEO, Core Web Vitals, E-E-A-T content, and security. No signup.',
  keywords:
    'site audit tool, seo audit, free website audit, technical seo audit, core web vitals audit, content quality audit, website health check, ai site audit, free seo checker',
  alternates: {
    canonical: 'https://airanko.com/tools/site-audit',
  },
  openGraph: {
    title: 'Free AI Site Audit Tool — 90+ SEO, Performance & Security Checks | AI Ranko',
    description:
      'Run a complete website audit in under 60 seconds. 90+ checks across technical SEO, Core Web Vitals, E-E-A-T content, and security. Free, no signup.',
    url: 'https://airanko.com/tools/site-audit',
    siteName: 'AI Ranko',
    images: [
      {
        url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20and%20converter%20tool%20open%20graph-airanko-fRSh9KtchB104ghNi32hTIxcT2OE87.webp',
        width: 1200,
        height: 630,
        alt: 'Free AI Site Audit Tool — AI Ranko',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free AI Site Audit Tool — 90+ SEO, Performance & Security Checks | AI Ranko',
    description:
      'Run a complete website audit in under 60 seconds. 90+ checks across technical SEO, Core Web Vitals, E-E-A-T content, and security. Free, no signup.',
    images: [
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20and%20converter%20tool%20open%20graph-airanko-fRSh9KtchB104ghNi32hTIxcT2OE87.webp',
    ],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Free AI Site Audit Tool',
  description:
    'Run a complete website audit in under 60 seconds. 90+ checks across technical SEO, Core Web Vitals, E-E-A-T content quality, accessibility, and security. Free, with prioritized fix recommendations.',
  url: 'https://airanko.com/tools/site-audit',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'All',
  browserRequirements: 'Requires JavaScript. Works in modern browsers.',
  featureList: [
    'Technical SEO audit — meta tags, schema, sitemap, robots.txt, canonicals',
    'Core Web Vitals and performance scoring',
    'On-page content and E-E-A-T scoring',
    'Broken link detection and link health audit',
    'Security headers and HTTPS validation',
    'WCAG accessibility checks',
    'AI-powered fix recommendations',
    'Prioritized issue list with severity and impact',
    'Unlimited free audits — no signup required',
  ],
  creator: {
    '@type': 'Organization',
    name: 'AI Ranko',
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
      name: 'What is a site audit tool?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "A site audit tool is software that crawls a website and analyzes it across technical SEO, performance, content quality, and security factors — surfacing issues that hurt rankings, user experience, and conversions. AI Ranko's tool runs 90+ checks per site and delivers a prioritized action plan.",
      },
    },
    {
      '@type': 'Question',
      name: 'Is the site audit tool really free?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes — completely free with no credit card, no subscription, and no signup required. Unlike Semrush or Ahrefs, there are no monthly audit limits or paywalls on any feature.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long does a site audit take?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Most audits finish in under 60 seconds. The tool crawls your sitemap and internal links, runs all 90+ checks in parallel, and renders your full report instantly — no waiting.',
      },
    },
    {
      '@type': 'Question',
      name: 'What does the site audit actually check?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The audit covers four categories: (1) Technical SEO — meta tags, schema, canonicals, sitemap, robots.txt. (2) Performance — Core Web Vitals, render-blocking resources, image weight. (3) Content & E-E-A-T — depth, readability, heading structure, author signals. (4) Links, accessibility & security — broken links, security headers, WCAG checks.',
      },
    },
    {
      '@type': 'Question',
      name: 'How is this different from Google Search Console?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Google Search Console only shows issues Google's crawler reports after the fact. AI Ranko's site audit proactively tests your site in real time — including issues Search Console never reports, like content thinness, E-E-A-T gaps, or accessibility problems.",
      },
    },
    {
      '@type': 'Question',
      name: "Does the tool follow Google's 2025 ranking guidelines?",
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Yes. Every check is aligned with Google's latest E-E-A-T framework, Helpful Content System, Core Web Vitals thresholds, and 2024–2025 spam policies. We update the audit engine as Google publishes new guidance.",
      },
    },
    {
      '@type': 'Question',
      name: 'Will my data be stored or shared?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. All crawling happens server-side in real time. URLs are never logged, stored, or shared with third parties. Your audit stays completely private.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I audit competitor websites?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Yes — you can audit any publicly accessible website, including competitors. It's the fastest way to benchmark your site against industry leaders and find gaps you can exploit.",
      },
    },
    {
      '@type': 'Question',
      name: 'Do I need SEO experience to understand the report?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Every issue includes a plain-language description and a step-by-step "How to fix" recommendation. The tool is designed for marketers, founders, and content creators — not just technical SEOs.',
      },
    },
    {
      '@type': 'Question',
      name: "How is AI Ranko's audit different from Screaming Frog?",
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Screaming Frog is a desktop application that requires installation, eats system resources, and limits free use to 500 URLs. AI Ranko runs entirely in your browser, has no install or signup, includes AI-powered fix suggestions, and adds modern checks Screaming Frog doesn't cover — like E-E-A-T scoring and accessibility audits.",
      },
    },
  ],
}

export default function SiteAuditPage() {
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
      <ToolSchema name="Site Audit Tool" slug="site-audit" description="Real-crawl SEO audit. Up to 15 pages, 25+ checks across SEO, performance, accessibility, mobile and content with AI fixes per issue." />
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
            &copy; {new Date().getFullYear()} Ai Ranko. Audit data is fetched on-demand and never stored.
          </p>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
            <Link href="/sitemap" className="hover:text-foreground transition-colors">Sitemap</Link>
            <Link href="/privacy-policy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms-and-conditions" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
