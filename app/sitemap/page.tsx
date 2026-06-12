import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ChevronRight, Zap, Search, FileText, Globe, ShieldCheck, Cpu, Smartphone,
  Images, Sparkles, PenLine, ImageIcon, Link2, Video, Eye, Map,
} from 'lucide-react'
import Navbar from '@/components/navbar'

export const metadata: Metadata = {
  title: 'HTML Sitemap — All Tools & Pages | Ai Ranko',
  description:
    'Complete list of every page and free SEO + AI tool on Ai Ranko, organized by category. Find what you need fast.',
  alternates: { canonical: 'https://airanko.com/sitemap' },
  openGraph: {
    title: 'HTML Sitemap — All Tools & Pages | Ai Ranko',
    description: 'Complete list of every page and free SEO + AI tool on Ai Ranko.',
    url: 'https://airanko.com/sitemap',
    siteName: 'Ai Ranko',
    type: 'website',
  },
}

type ToolEntry = {
  href: string
  label: string
  description: string
  icon: typeof Search
}

type Section = {
  title: string
  subtitle: string
  tools: ToolEntry[]
}

const sections: Section[] = [
  {
    title: 'SEO AI Tools',
    subtitle: 'Strategy, audits, and rank-driven analysis powered by AI.',
    tools: [
      { href: '/tools/seo-strategy-maker', label: 'SEO Strategy Maker',  description: 'Full AI-generated SEO plan with keywords, content calendar & 6-month roadmap.', icon: Sparkles },
      { href: '/tools/site-audit',         label: 'Site Audit Tool',     description: 'Crawl up to 15 pages, run 25+ checks, get AI step-by-step fixes for every issue.', icon: Globe },
      { href: '/tools/keyword-research',   label: 'Keyword Research Tool', description: 'Pull 150+ real keywords from Google Autocomplete + AI clustering by intent.', icon: Search },
      { href: '/tools/meta-checker',       label: 'Bulk Meta & OG Checker', description: 'Audit meta tags, Open Graph, and Twitter Card for one URL or many.', icon: FileText },
      { href: '/tools/link-extractor',     label: 'Link Extractor',      description: 'Crawl any website and extract every link with sitemap entries — export to CSV/JSON.', icon: Link2 },
      { href: '/tools/mobile-checker',     label: 'Mobile Friendliness Checker', description: 'Preview any website in real mobile, tablet, and desktop view.', icon: Smartphone },
      { href: '/tools/html-sitemap-generator', label: 'HTML Sitemap Generator',  description: 'Generate styled HTML sitemap from any URL — live preview + 5 export formats.', icon: Map },
    ],
  },
  {
    title: 'AI Content Tools',
    subtitle: 'Write, optimize, and verify content against Google guidelines.',
    tools: [
      { href: '/tools/content-writer',      label: 'AI Content Writer',           description: 'Generate SEO articles with E-E-A-T scoring, AI Overview hooks, and FAQ schema.', icon: PenLine },
      { href: '/tools/content-optimizer',   label: 'AI Content Optimizer',        description: 'Audit existing content against Google 2024 E-E-A-T + Helpful Content rules.', icon: Cpu },
      { href: '/tools/plagiarism-checker',  label: 'AI Content Detector & Grammar Checker', description: 'Detect AI text, fix grammar, check readability, get word replacements.', icon: ShieldCheck },
    ],
  },
  {
    title: 'Image AI Tools',
    subtitle: 'Edit, optimize, and convert images entirely in your browser.',
    tools: [
      { href: '/tools/image-resizer',       label: 'Image Resizer & Converter',   description: 'Resize, crop, convert & optimize images to WebP, PNG, JPEG.', icon: ImageIcon },
      { href: '/tools/bulk-image-resizer',  label: 'Bulk Image Resizer',          description: 'Process unlimited images at once with global or per-image settings.', icon: Images },
      { href: '/tools/background-remover',  label: 'AI Background Remover',       description: 'Instantly remove backgrounds with on-device AI — private and free.', icon: Sparkles },
      { href: '/tools/logo-generator',      label: 'AI Logo Generator',           description: 'Generate logo concepts and export in multiple formats.', icon: Eye },
    ],
  },
  {
    title: 'Utilities',
    subtitle: 'Essential tools for marketers, founders, and creators.',
    tools: [
      { href: '/tools/portfolio-recorder',  label: 'Portfolio Video Recorder',    description: 'Turn any URL into a smooth scrolling demo video for portfolio or social.', icon: Video },
    ],
  },
]

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Ai Ranko', item: 'https://airanko.com' },
    { '@type': 'ListItem', position: 2, name: 'Sitemap',  item: 'https://airanko.com/sitemap' },
  ],
}

export default function HtmlSitemapPage() {
  const totalTools = sections.reduce((s, c) => s + c.tools.length, 0)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Navbar />

      {/* Breadcrumb */}
      <div className="border-b border-border bg-card px-4 py-3 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/" className="flex items-center gap-1.5 transition-colors hover:text-foreground">
            <Zap className="h-3.5 w-3.5 text-primary" />
            Ai Ranko
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-foreground">Sitemap</span>
        </div>
      </div>

      <main className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">

          {/* Header */}
          <div className="mb-12 text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <FileText className="h-3 w-3" />
              {totalTools} free tools across {sections.length} categories
            </div>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              Ai Ranko Sitemap
            </h1>
            <p className="mt-3 text-pretty text-muted-foreground">
              Every page and free tool on the site, organized by category.
            </p>
          </div>

          {/* Top-level pages */}
          <div className="mb-10 rounded-3xl border border-border bg-card p-6 sm:p-8">
            <h2 className="font-heading text-lg font-bold text-foreground">Main Pages</h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { href: '/',          label: 'Homepage',     description: 'Free AI-powered SEO & image tools' },
                { href: '/#tools',    label: 'All Tools',    description: 'Browse the full tool grid' },
                { href: '/blog',      label: 'Blog',         description: 'SEO, AI, and mobile UX guides' },
                { href: '/sitemap',   label: 'HTML Sitemap', description: 'You are here' },
              ].map((p) => (
                <li key={p.label}>
                  <Link href={p.href} className="flex items-start gap-3 rounded-xl border border-border bg-background p-3 transition-colors hover:border-primary/40 hover:bg-muted/30">
                    <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-primary" />
                    <div>
                      <span className="block font-heading text-sm font-semibold text-foreground">{p.label}</span>
                      <span className="block text-xs text-muted-foreground">{p.description}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tool sections */}
          <div className="space-y-10">
            {sections.map((section) => (
              <div key={section.title}>
                <div className="mb-4">
                  <h2 className="font-heading text-xl font-bold text-foreground">{section.title}</h2>
                  <p className="text-sm text-muted-foreground">{section.subtitle}</p>
                </div>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {section.tools.map((tool) => (
                    <li key={tool.href}>
                      <Link
                        href={tool.href}
                        className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-sm"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <tool.icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-heading text-sm font-bold text-foreground">{tool.label}</p>
                          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{tool.description}</p>
                          <p className="mt-1.5 truncate font-mono text-[10px] text-primary/70">airanko.com{tool.href}</p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Crawler-friendly references */}
          <div className="mt-12 rounded-3xl border border-border bg-muted/30 p-6 sm:p-8">
            <h2 className="font-heading text-base font-bold text-foreground">For Search Engines &amp; AI</h2>
            <p className="mt-1 text-sm text-muted-foreground">Machine-readable formats of this same information.</p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-3">
              {[
                { href: '/sitemap.xml', label: 'XML Sitemap',   description: 'For Google, Bing & other crawlers' },
                { href: '/robots.txt',  label: 'robots.txt',    description: 'Crawler access rules' },
                { href: '/llms.txt',    label: 'llms.txt',      description: 'For AI systems & LLMs' },
              ].map((p) => (
                <li key={p.label}>
                  <a href={p.href} className="block rounded-xl border border-border bg-background p-3 transition-colors hover:border-primary/40">
                    <span className="block font-mono text-sm font-semibold text-foreground">{p.label}</span>
                    <span className="block text-xs text-muted-foreground">{p.description}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>

      <footer className="mt-12 border-t border-border bg-card px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <Link href="/" aria-label="Ai Ranko home">
            <img src="/images/ai-ranko-logo.webp" alt="Ai Ranko" className="h-7 w-auto" />
          </Link>
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Ai Ranko. Free AI SEO &amp; image tools — no signup required.
          </p>
        </div>
      </footer>
    </div>
  )
}
