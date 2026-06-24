import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Zap } from 'lucide-react'
import Navbar from '@/components/navbar'
import AiCodeDetectorTool from '@/components/ai-code-detector/ai-code-detector-tool'
import AiCodeDetectorSeoSections from '@/components/ai-code-detector-seo-sections'

export const metadata: Metadata = {
  title: 'Free AI Code Detector — Analyze Websites, GitHub Repos, or Pasted Code | Ai Ranko',
  description:
    'Detect AI-generated code patterns in any website, GitHub repository, or pasted source. 8 real audits — inline code, CSS, HTML structure, JavaScript, copywriting, security headers, images, metadata. Every metric from real measurement.',
  keywords:
    'AI code detector, AI generated code detector, AI website detector, code quality analyzer, GitHub repo analyzer, AI content detector, free SEO audit',
  alternates: { canonical: 'https://airanko.com/tools/ai-code-detector' },
  openGraph: {
    title: 'Free AI Code Detector — 8 Real Audits, Zero Fake Scores | Ai Ranko',
    description: 'Analyze a URL, GitHub repo, or pasted code and get a real, premium-grade AI-likelihood report.',
    url: 'https://airanko.com/tools/ai-code-detector',
    siteName: 'Ai Ranko',
    images: [
      {
        url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20and%20converter%20tool%20open%20graph-airanko-fRSh9KtchB104ghNi32hTIxcT2OE87.webp',
        width: 1200, height: 630, alt: 'AI Code Detector | Ai Ranko',
      },
    ],
    locale: 'en_US', type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free AI Code Detector — 8 Real Audits, Zero Fake Scores',
    description: 'Analyze a URL, GitHub repo, or pasted code and get a real, premium-grade AI-likelihood report.',
    images: ['https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20and%20converter%20tool%20open%20graph-airanko-fRSh9KtchB104ghNi32hTIxcT2OE87.webp'],
  },
}

const jsonLd = {
  '@context': 'https://schema.org', '@type': 'SoftwareApplication',
  name: 'Free AI Code Detector',
  description: 'Detect AI-generated patterns in websites, GitHub repos, or pasted code. 8 real measurement-based audits.',
  url: 'https://airanko.com/tools/ai-code-detector',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'All',
  browserRequirements: 'Requires JavaScript.',
  featureList: [
    'Three input modes: Website URL, GitHub repository, paste code',
    'Real HTML fetch via server-side proxy (no CORS limits)',
    'GitHub API integration — fetches up to 30 prioritized source files',
    'Inline code analyzer: counts inline scripts, styles, event handlers, HTML comments',
    'CSS analyzer: unique colors, font count, long class names, magic spacing values',
    'HTML structure analyzer: semantic tag percentage, max div nesting depth, empty elements, missing landmarks, heading hierarchy',
    'JavaScript analyzer: generic naming patterns, console.log, TODO/FIXME, try/catch, magic numbers',
    'Copywriting analyzer: AI buzzwords, filler phrases, vague CTAs, sentence length variance',
    'Security headers audit (URL mode): CSP, X-Frame-Options, X-Content-Type-Options, HSTS, Referrer-Policy, Permissions-Policy',
    'Image audit: missing alt, generic alt, dimensions, Next.js Image usage, AI-typical filenames',
    'Metadata audit: title, description, generator tag (red flag), OG, Twitter, canonical, robots, viewport, JSON-LD count',
    'Premium SaaS-grade UI with real-time progress bar and per-analyzer score gauges',
    'Full JSON export of the entire report',
    'No sign-up, no watermark, 100% free',
  ],
  creator: { '@type': 'Organization', name: 'Ai Ranko', url: 'https://airanko.com' },
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
}

const faqJsonLd = {
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'How does the AI Code Detector work?', acceptedAnswer: { '@type': 'Answer', text: 'It fetches your source content (HTML from a URL, files from a GitHub repo, or your pasted code) and runs 8 deterministic audits that count real patterns: inline scripts, unique colors, semantic tag usage, generic variable names, AI buzzwords, security headers, image alt quality, and metadata signals. Every score is calculated from real counts — no AI guessing, no randomization.' } },
    { '@type': 'Question', name: 'What does the score actually mean?', acceptedAnswer: { '@type': 'Answer', text: 'A higher score (closer to 100) means more AI-typical patterns were detected. A lower score means the code looks more human-crafted. The four bands are Likely human (0–24), Mixed signals (25–49), Likely AI-assisted (50–74), and Strongly AI-generated (75–100).' } },
    { '@type': 'Question', name: 'Is the URL mode safe? Do you store my data?', acceptedAnswer: { '@type': 'Answer', text: 'The tool fetches the public URL server-side and analyzes the response in memory. Nothing is logged or stored. The fetch identifies as AiRankoBot/1.0 in the User-Agent.' } },
    { '@type': 'Question', name: 'What GitHub repos can I analyze?', acceptedAnswer: { '@type': 'Answer', text: 'Any public repository. We use GitHub\'s unauthenticated REST API which has a 60-requests-per-hour limit, so heavy use across many repos can rate-limit briefly. Private repos require auth which the tool does not currently support.' } },
    { '@type': 'Question', name: 'Which files are pulled from a GitHub repo?', acceptedAnswer: { '@type': 'Answer', text: 'Up to 30 source files with extensions .html, .jsx, .tsx, .js, .ts, .css, .scss, .vue, .php, .py. Priority is given to files in the root, src/, app/, components/, and pages/ directories. Files in node_modules, .next, dist, and build are skipped, as are files larger than 200 KB.' } },
    { '@type': 'Question', name: 'Why does the Security Headers audit only run on URLs?', acceptedAnswer: { '@type': 'Answer', text: 'Security headers are HTTP response headers — they only exist when there is a live server response to inspect. Pasted code and GitHub source files have no associated HTTP response.' } },
    { '@type': 'Question', name: 'Can the detector be fooled?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. The detector measures patterns commonly associated with AI-generated code, but a skilled developer can write code that matches those patterns, and AI tools can be prompted to avoid them. Treat the score as a useful signal, not a verdict.' } },
    { '@type': 'Question', name: 'Is it really free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes — no sign-up, no watermark, no rate limits beyond what the underlying services (GitHub API, your target website) impose.' } },
  ],
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Ai Ranko', item: 'https://airanko.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools',    item: 'https://airanko.com/#tools' },
    { '@type': 'ListItem', position: 3, name: 'AI Code Detector', item: 'https://airanko.com/tools/ai-code-detector' },
  ],
}

export default function AiCodeDetectorPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <Navbar />

      <div className="border-b border-border bg-card px-4 py-3 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/" className="flex items-center gap-1.5 transition-colors hover:text-foreground">
            <Zap className="h-3.5 w-3.5 text-primary" />
            Ai Ranko
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/#tools" className="transition-colors hover:text-foreground">Tools</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-foreground">AI Code Detector</span>
        </div>
      </div>

      <main>
        <AiCodeDetectorTool />
      </main>

      <AiCodeDetectorSeoSections />

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
            <Link href="#" className="transition-colors hover:text-foreground">Privacy</Link>
            <Link href="#" className="transition-colors hover:text-foreground">Terms</Link>
            <Link href="#" className="transition-colors hover:text-foreground">Contact</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
