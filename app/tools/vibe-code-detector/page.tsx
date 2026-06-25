import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Zap } from 'lucide-react'
import Navbar from '@/components/navbar'
import ToolSchema from '@/components/ToolSchema'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'
import VibeCodeDetectorTool from '@/components/vibe-code-detector/vibe-code-detector-tool'
import VibeCodeDetectorSeoSections from '@/components/vibe-code-detector-seo-sections'

export const metadata: Metadata = {
  title: 'Vibe Code Detector — Is This Website Vibe-Coded? Free AI Code Scanner | Ai Ranko',
  description:
    'Free vibe code detector. Detect vibe-coded websites built with v0, Bolt, Lovable, Cursor, Windsurf or Replit. 8 real audits — inline code, CSS utility soup, HTML wrappers, JS naming, AI comments, security headers, images, generator tags. Every score from real counts.',
  keywords:
    'vibe code detector, vibe coding detector, detect vibe coded website, is this vibe coded, vibe code checker, AI vibe code scanner, v0 detector, bolt detector, lovable detector, cursor detector, AI generated code detector, AI website detector',
  alternates: { canonical: 'https://airanko.com/tools/vibe-code-detector' },
  openGraph: {
    title: 'Vibe Code Detector — Is This Site Vibe-Coded? | Ai Ranko',
    description: 'Detect vibe-coded websites built with v0, Bolt, Lovable, Cursor, Windsurf or Replit. 8 real audits, zero fake scores.',
    url: 'https://airanko.com/tools/vibe-code-detector',
    siteName: 'Ai Ranko',
    images: [
      {
        url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20and%20converter%20tool%20open%20graph-airanko-fRSh9KtchB104ghNi32hTIxcT2OE87.webp',
        width: 1200, height: 630, alt: 'Vibe Code Detector | Ai Ranko',
      },
    ],
    locale: 'en_US', type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vibe Code Detector — Is This Site Vibe-Coded?',
    description: 'Detect vibe-coded websites built with v0, Bolt, Lovable, Cursor, Windsurf or Replit. 8 real audits, zero fake scores.',
    images: ['https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20and%20converter%20tool%20open%20graph-airanko-fRSh9KtchB104ghNi32hTIxcT2OE87.webp'],
  },
}

const jsonLd = {
  '@context': 'https://schema.org', '@type': 'SoftwareApplication',
  name: 'Free Vibe Code Detector',
  description: 'Detect vibe-coded websites, GitHub repos, or pasted code. 8 real measurement-based audits. Explicitly identifies v0, Bolt, Lovable, Cursor, Windsurf and Replit output.',
  url: 'https://airanko.com/tools/vibe-code-detector',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'All',
  browserRequirements: 'Requires JavaScript.',
  featureList: [
    'Three input modes: Website URL, GitHub repository, paste code',
    'Real HTML fetch via server-side proxy (no CORS limits)',
    'GitHub API integration — fetches up to 30 prioritized source files',
    'Explicit generator-tag detection for v0, Bolt, Lovable, Cursor, Windsurf, Replit, Devin, GitHub Copilot, ChatGPT, Claude',
    'Inline code analyzer: scripts, styles, event handlers, AI-style comments, data-testid attributes',
    'CSS analyzer: Tailwind utility soup (8+ classes per element), !important abuse, generic CSS variables, fonts',
    'HTML structure analyzer: semantic tag percentage, deep div nesting (>6 levels), wrapper div ratio, missing landmarks, heading hierarchy',
    'JavaScript analyzer: generic naming, AI-style "// Here we…" comments, overly-descriptive identifiers, console.log, TODO/FIXME, async density',
    'Copywriting analyzer: AI buzzwords (delve, leverage, seamless…), filler phrases, low sentence-length variance',
    'Security headers audit (URL mode): CSP, X-Frame-Options, HSTS, Referrer-Policy, Permissions-Policy',
    'Image audit: missing alt, generic alt, dimensions, Next.js Image usage, AI-typical filenames',
    'Metadata audit: title, description, generator tag, OG, Twitter, canonical, robots, JSON-LD count',
    'Premium SaaS-grade UI with real progress animation and per-analyzer score gauges',
    'Full JSON export of the entire Vibe Score report',
    'No sign-up, no watermark, 100% free',
  ],
  creator: { '@type': 'Organization', name: 'Ai Ranko', url: 'https://airanko.com' },
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
}

const faqJsonLd = {
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'What does "vibe code" mean?', acceptedAnswer: { '@type': 'Answer', text: 'Vibe coding is the 2025 term for software shipped largely or entirely from AI coding tools — v0, Bolt, Lovable, Cursor, Windsurf, Replit Agent, GitHub Copilot, Devin, ChatGPT or Claude — without significant human refactor. The Vibe Code Detector looks for the visual and structural fingerprints these tools leave behind.' } },
    { '@type': 'Question', name: 'How does the Vibe Code Detector work?', acceptedAnswer: { '@type': 'Answer', text: 'It fetches your source (HTML from a URL, files from a GitHub repo, or your pasted code) and runs 8 deterministic audits that count real patterns. Every score is calculated from real counts — no AI guessing, no randomization.' } },
    { '@type': 'Question', name: 'What does the Vibe Score actually mean?', acceptedAnswer: { '@type': 'Answer', text: 'Higher = more vibe-code patterns detected. Lower = more hand-crafted. The bands: Likely human-written (0–24), Mixed signals (25–49), Likely vibe-coded (50–74), Strongly vibe-coded (75–100).' } },
    { '@type': 'Question', name: 'Which AI coding tools can it detect?', acceptedAnswer: { '@type': 'Answer', text: 'The metadata analyzer explicitly flags generator tags from v0 (Vercel), Bolt, Lovable, Cursor, Windsurf, Replit, Devin, GitHub Copilot, ChatGPT and Claude. The other 7 analyzers detect generic AI-coding fingerprints regardless of which tool produced them.' } },
    { '@type': 'Question', name: 'Do you store my data?', acceptedAnswer: { '@type': 'Answer', text: 'No. The tool fetches your URL or repo server-side and analyzes the response in memory. Nothing is logged or stored.' } },
    { '@type': 'Question', name: 'Can the Vibe Code Detector be fooled?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. The detector measures patterns commonly associated with AI-generated code, but a skilled developer can write code matching those patterns, and AI tools can be prompted to avoid them. Treat the Vibe Score as a strong signal, not a verdict.' } },
    { '@type': 'Question', name: 'Is it really free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes — no sign-up, no watermark, no rate limits beyond what the underlying services (GitHub API, your target website) impose.' } },
  ],
}

export default function VibeCodeDetectorPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />      <Navbar />
      <ToolSchema name="Vibe Code Detector" slug="vibe-code-detector" description="Detect vibe-coded websites, GitHub repos or pasted code built with v0, Bolt, Lovable, Cursor, Windsurf, Replit and other AI tools." />
      <BreadcrumbSchema items={[{ name: 'Tools', href: '/#tools' }, { name: 'Vibe Code Detector', href: '/tools/vibe-code-detector' }]} />

      <div className="border-b border-border bg-card px-4 py-3 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/" className="flex items-center gap-1.5 transition-colors hover:text-foreground">
            <Zap className="h-3.5 w-3.5 text-primary" />
            Ai Ranko
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/#tools" className="transition-colors hover:text-foreground">Tools</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-foreground">Vibe Code Detector</span>
        </div>
      </div>

      <main>
        <VibeCodeDetectorTool />
      </main>

      <VibeCodeDetectorSeoSections />

      <footer className="mt-12 border-t border-border bg-card px-4 py-8 sm:px-6 lg:px-8">
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
