import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Zap } from 'lucide-react'
import Navbar from '@/components/navbar'
import ToolSchema from '@/components/ToolSchema'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'
import SecurityScannerTool from '@/components/security-scanner/security-scanner-tool'
import SecurityScannerSeoSections from '@/components/security-scanner-seo-sections'
import { CookieSettingsLink } from '@/components/cookie-consent/cookie-settings-link'

export const metadata: Metadata = {
  title: 'Vibe Code Security Scanner — Free Website Vulnerability Checker | Ai Ranko',
  description:
    'Scan any AI-built ("vibe-coded") website for exposed API keys, missing security headers, leaked .env/.git files, vulnerable JS libraries, and verbose error pages. Passive, read-only checks — free, no signup.',
  keywords:
    'vibe code security scanner, website vulnerability scanner, exposed api key checker, security header checker, free website security scan, exposed env file checker, supabase key leak checker, ai website security audit, vibe coding security risks, security headers scanner',
  authors: [{ name: 'Ai Ranko Editorial Team', url: 'https://airanko.com' }],
  alternates: { canonical: 'https://airanko.com/tools/vibe-code-security-scanner' },
  openGraph: {
    title: 'Vibe Code Security Scanner — Free Website Vulnerability Checker | Ai Ranko',
    description: 'Passive, read-only security scan for AI-built websites — exposed keys, missing headers, leaked .env/.git files, vulnerable JS libraries, and more.',
    url: 'https://airanko.com/tools/vibe-code-security-scanner',
    siteName: 'Ai Ranko',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20and%20converter%20tool%20open%20graph-airanko-fRSh9KtchB104ghNi32hTIxcT2OE87.webp',
        width: 1200, height: 630, alt: 'Vibe Code Security Scanner | Ai Ranko',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vibe Code Security Scanner | Ai Ranko',
    description: 'Passive, read-only security scan for AI-built websites — exposed keys, missing headers, leaked .env/.git files, vulnerable JS libraries, and more.',
    images: ['https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20and%20converter%20tool%20open%20graph-airanko-fRSh9KtchB104ghNi32hTIxcT2OE87.webp'],
  },
}

const jsonLd = {
  '@context': 'https://schema.org', '@type': 'SoftwareApplication',
  name: 'Vibe Code Security Scanner',
  description: 'Free passive security scanner for AI-built ("vibe-coded") websites — checks for exposed API keys, missing security headers, leaked .env/.git files, vulnerable JS libraries, and information disclosure.',
  url: 'https://airanko.com/tools/vibe-code-security-scanner',
  applicationCategory: 'SecurityApplication',
  operatingSystem: 'All',
  browserRequirements: 'Requires JavaScript.',
  featureList: [
    'HTTP security header analysis (CSP, HSTS, X-Frame-Options, CORS, and more)',
    'Exposed API key and secret detection in page source and linked scripts',
    'Supabase / JWT service-role key leak detection',
    'Exposed .env, .git, and source map file detection',
    'Vulnerable JS library version detection (jQuery, Lodash, Moment.js, Bootstrap, AngularJS)',
    'Verbose error / stack trace disclosure detection',
    'Single URL and bulk (up to 15 URLs) scanning',
    'Weighted 0-100 score with letter grade',
    'Every issue paired with a concrete fix',
    'CSV, JSON, and PDF export',
    'Passive, read-only checks only — no exploitation, no injection, no authentication attempts',
    'No sign-up, no watermark, 100% free',
  ],
  creator: { '@type': 'Organization', name: 'Ai Ranko', url: 'https://airanko.com' },
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
}

const faqJsonLd = {
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Is this a penetration testing / hacking tool?', acceptedAnswer: { '@type': 'Answer', text: 'No. This scanner only performs passive, read-only checks — fetching the page you already serve publicly, reading its response headers, and checking a handful of well-known paths (like /.env). It never attempts to exploit a vulnerability, inject payloads, brute-force credentials, or bypass authentication. It\'s the same category of tool as Mozilla Observatory or SecurityHeaders.com, not a penetration-testing tool.' } },
    { '@type': 'Question', name: 'What is "vibe coding" and why does it create security risks?', acceptedAnswer: { '@type': 'Answer', text: 'Vibe coding refers to building an app primarily by prompting an AI tool (v0, Bolt, Lovable, Replit Agent, Cursor, etc.) rather than writing code by hand. These tools are excellent at shipping working features fast, but they don\'t always know which values must stay server-side — so API keys, database credentials, and admin-level keys sometimes end up hardcoded directly into the client-side bundle that ships to every visitor\'s browser.' } },
    { '@type': 'Question', name: 'What kinds of exposed secrets does this tool look for?', acceptedAnswer: { '@type': 'Answer', text: 'It checks page source and linked same-origin JavaScript files for patterns matching OpenAI API keys, Stripe secret keys, AWS access keys, Google API keys, Slack tokens, private key blocks, database connection strings with credentials, and Supabase/JWT service-role keys (which bypass Row Level Security entirely if leaked).' } },
    { '@type': 'Question', name: 'Should I only scan my own website?', acceptedAnswer: { '@type': 'Answer', text: 'Yes — only scan sites you own or have explicit permission to test. The checks themselves are non-destructive and passive, but running any automated scan against a site you don\'t control without permission may violate its terms of service.' } },
    { '@type': 'Question', name: 'Can I scan multiple pages at once?', acceptedAnswer: { '@type': 'Answer', text: 'Yes — switch to "Multiple URLs" and paste up to 15 page URLs, one per line or comma-separated, to get a scored report across all of them.' } },
    { '@type': 'Question', name: 'How is the security score calculated?', acceptedAnswer: { '@type': 'Answer', text: 'Every check is weighted by real-world severity — an exposed .env file or a leaked service-role key weighs far more than a missing Referrer-Policy header. The score is the percentage of total weight earned across every check that applies to your page, graded Excellent / Good / Needs Work / Poor.' } },
    { '@type': 'Question', name: 'Is this free and is there a limit?', acceptedAnswer: { '@type': 'Answer', text: 'Completely free, no sign-up. Scans support up to 15 URLs per batch to keep results fast and reliable.' } },
  ],
}

export default function VibeCodeSecurityScannerPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <div className="print:hidden" data-print-hide>
        <Navbar />
      </div>
      <ToolSchema name="Vibe Code Security Scanner" slug="vibe-code-security-scanner" description="Free passive security scanner for AI-built websites — checks for exposed API keys, missing security headers, leaked .env/.git files, and vulnerable JS libraries." />
      <BreadcrumbSchema items={[{ name: 'Tools', href: '/#tools' }, { name: 'Vibe Code Security Scanner', href: '/tools/vibe-code-security-scanner' }]} />

      <div className="border-b border-border bg-card px-4 py-3 sm:px-6 lg:px-8 print:hidden" data-print-hide>
        <div className="mx-auto flex max-w-7xl items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/" className="flex items-center gap-1.5 transition-colors hover:text-foreground">
            <Zap className="h-3.5 w-3.5 text-primary" />
            Ai Ranko
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/#tools" className="transition-colors hover:text-foreground">Tools</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-foreground">Vibe Code Security Scanner</span>
        </div>
      </div>

      <div className="border-b border-border bg-card px-4 py-5 sm:px-6 lg:px-8 print:hidden" data-print-hide>
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <svg className="h-4.5 w-4.5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /></svg>
            </div>
            <h1 className="font-heading text-xl font-bold text-foreground sm:text-2xl">Vibe Code Security Scanner</h1>
          </div>
          <p className="mt-1 ml-11 max-w-2xl text-sm text-muted-foreground">
            A free, passive security scan for AI-built websites — catches the exposed keys, missing headers, and leaked files that AI page builders commonly leave behind.
          </p>
        </div>
      </div>

      <main>
        <SecurityScannerTool />
      </main>

      <div className="print:hidden" data-print-hide>
        <SecurityScannerSeoSections />
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
            <CookieSettingsLink className="transition-colors hover:text-foreground" />
          </nav>
        </div>
      </footer>
    </div>
  )
}
