import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Ai Ranko – Free AI-Powered SEO & Image Tools',
  description:
    'Boost your rankings with Ai Ranko — free AI-powered SEO tools and image utilities. Resize, convert & optimize images. Analyze meta tags, track keywords, and grow organic traffic. No signup required.',
  keywords:
    'free SEO tools, AI SEO tools, image resizer online, keyword research tool, meta tag checker, site audit tool, free image converter, content optimizer, AI content writer, website cloner, background remover',
  alternates: { canonical: 'https://airanko.com' },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  openGraph: {
    title: 'Ai Ranko – Free AI-Powered SEO & Image Tools',
    description:
      'Boost your rankings with Ai Ranko — free AI-powered SEO tools and image utilities. Resize, convert & optimize images. Analyze meta tags, track keywords, and grow organic traffic. No signup required.',
    url: 'https://airanko.com',
    siteName: 'Ai Ranko',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20and%20converter%20tool%20open%20graph-airanko-fRSh9KtchB104ghNi32hTIxcT2OE87.webp',
        width: 1200,
        height: 630,
        alt: 'Ai Ranko – Free AI-Powered SEO & Image Tools',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ai Ranko – Free AI-Powered SEO & Image Tools',
    description:
      'Free AI-powered SEO tools and image utilities. No signup. Resize images, research keywords, audit your site, and more.',
    images: [
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20and%20converter%20tool%20open%20graph-airanko-fRSh9KtchB104ghNi32hTIxcT2OE87.webp',
    ],
  },
}
import {
  ImageIcon,
  Search,
  FileText,
  Link2,
  Globe,
  ShieldCheck,
  Cpu,
  ArrowRight,
  Star,
  CheckCircle2,
  Zap,
  Smartphone,
  Images,
  Sparkles,
  PenLine,
  Map,
  Bot,
  FileCode2,
  Ruler,
  Eye,
  Video,
  Tag,
  ShieldAlert,
  ZoomIn,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Navbar from '@/components/navbar'
import { CookieSettingsLink } from '@/components/cookie-consent/cookie-settings-link'

const seoTools = [
  {
    icon: ImageIcon,
    label: 'Image Resizer & Converter',
    description: 'Resize, crop, convert, and optimize images to any format including WebP, PNG, JPEG.',
    badge: 'Popular',
    badgeVariant: 'default' as const,
    href: '/tools/image-resizer',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    icon: Sparkles,
    label: 'SEO Strategy Maker',
    description: 'Generate a complete custom SEO strategy with keywords, competitors, content calendar & 2-month action plan.',
    badge: 'AI Powered',
    badgeVariant: 'secondary' as const,
    href: '/tools/seo-strategy-maker',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    icon: Search,
    label: 'Keyword Research Tool',
    description: 'Pull real keywords from Google Autocomplete, then auto-cluster by intent and difficulty with AI.',
    badge: 'New',
    badgeVariant: 'default' as const,
    href: '/tools/keyword-research',
    color: 'text-teal-600',
    bg: 'bg-teal-50',
  },
  {
    icon: FileText,
    label: 'Bulk Meta & OG Checker',
    description: 'Check meta title, meta description, Open Graph and Twitter Card tags for any URL — one or many at once.',
    badge: 'New',
    badgeVariant: 'default' as const,
    href: '/tools/meta-checker',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    icon: Link2,
    label: 'Link Extractor',
    description: 'Crawl an entire website and extract every link across all pages, including sitemap entries. Export to CSV or JSON.',
    badge: 'New',
    badgeVariant: 'default' as const,
    href: '/tools/link-extractor',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    icon: Globe,
    label: 'Site Audit Tool',
    description: 'Crawl up to 15 pages, run 25+ real SEO/perf/accessibility checks, get AI step-by-step fixes.',
    badge: 'New',
    badgeVariant: 'default' as const,
    href: '/tools/site-audit',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
  },
  {
    icon: Map,
    label: 'HTML Sitemap Generator',
    description: 'Generate a beautiful HTML sitemap from any URL — live preview, 4 themes, 5 layouts, 5 export formats.',
    badge: 'New',
    badgeVariant: 'default' as const,
    href: '/tools/html-sitemap-generator',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    icon: ShieldCheck,
    label: 'AI Content Detector & Grammar Checker',
    description: 'Detect AI-written text, fix grammar mistakes, check readability, and get precise word replacements in one free analysis.',
    badge: 'New',
    badgeVariant: 'default' as const,
    href: '/tools/plagiarism-checker',
    color: 'text-cyan-600',
    bg: 'bg-cyan-50',
  },
  {
    icon: Bot,
    label: 'Vibe Code Detector',
    description: 'Detect vibe-coded sites built with v0, Bolt, Lovable, Cursor or Replit. 8 real audits — utility soup, AI-style comments, generator tags & more.',
    badge: 'New',
    badgeVariant: 'default' as const,
    href: '/tools/vibe-code-detector',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
  },
  {
    icon: ShieldAlert,
    label: 'Vibe Code Security Scanner',
    description: 'Passive security scan for AI-built sites — exposed API keys, missing headers, leaked .env/.git files & vulnerable JS libraries.',
    badge: 'New',
    badgeVariant: 'default' as const,
    href: '/tools/vibe-code-security-scanner',
    color: 'text-red-600',
    bg: 'bg-red-50',
  },
  {
    icon: Globe,
    label: 'Website Cloner',
    description: 'Clone any web page to a self-contained HTML file — inlines CSS & JS, rewrites asset URLs. Live preview and one-click download.',
    badge: 'New',
    badgeVariant: 'default' as const,
    href: '/tools/website-cloner',
    color: 'text-teal-600',
    bg: 'bg-teal-50',
  },
  {
    icon: PenLine,
    label: 'AI Content Writer',
    description: 'Generate SEO articles with E-E-A-T scoring, AI Overview hooks, FAQ schema, and a publish-ready checklist.',
    badge: 'AI Powered',
    badgeVariant: 'secondary' as const,
    href: '/tools/content-writer',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    icon: Cpu,
    label: 'AI Content Optimizer',
    description: 'Audit any article against Google\'s 2024 E-E-A-T + Helpful Content rules. Get scores, missing LSI keywords, heading rewrites & fixes.',
    badge: 'New',
    badgeVariant: 'default' as const,
    href: '/tools/content-optimizer',
    color: 'text-teal-600',
    bg: 'bg-teal-50',
  },
  {
    icon: Smartphone,
    label: 'Mobile Friendliness Checker',
    description: 'Preview any website in mobile, tablet, or desktop view to test responsive design.',
    badge: 'New',
    badgeVariant: 'default' as const,
    href: '/tools/mobile-checker',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    icon: Images,
    label: 'Bulk Image Resizer',
    description: 'Resize and convert unlimited images at once. Apply global settings or tweak each image individually.',
    badge: 'New',
    badgeVariant: 'default' as const,
    href: '/tools/bulk-image-resizer',
    color: 'text-teal-600',
    bg: 'bg-teal-50',
  },
  {
    icon: FileCode2,
    label: 'XML Sitemap Generator',
    description: 'Crawl any site and generate a Google-ready sitemap.xml — up to 500 URLs, changefreq, priority, lastmod & image tags.',
    badge: 'New',
    badgeVariant: 'default' as const,
    href: '/tools/xml-sitemap-generator',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
  {
    icon: Ruler,
    label: 'Meta Pixel Checker',
    description: 'Crawl a sitemap or paste URLs to measure meta title & description pixel width for Google desktop and mobile SERPs — in bulk.',
    badge: 'New',
    badgeVariant: 'default' as const,
    href: '/tools/meta-title-description-bulk-pixel-checker',
    color: 'text-rose-600',
    bg: 'bg-rose-50',
  },
  {
    icon: Tag,
    label: 'Meta Title & Description Generator',
    description: 'AI-generate bulk meta titles & descriptions sized to fit Google Pixel limits for desktop or mobile — with live pixel-width editing.',
    badge: 'AI',
    badgeVariant: 'default' as const,
    href: '/tools/meta-title-description-pixel-generator',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
  },
  {
    icon: Sparkles,
    label: 'AI Background Remover',
    description: 'Instantly remove image backgrounds with on-device AI — no upload, fully private, and free.',
    badge: 'New',
    badgeVariant: 'default' as const,
    href: '/tools/background-remover',
    color: 'text-fuchsia-600',
    bg: 'bg-fuchsia-50',
  },
  {
    icon: ZoomIn,
    label: 'AI Image Upscaler',
    description: 'Enhance image resolution 2x or 4x with on-device AI — no upload, fully private, and free.',
    badge: 'New',
    badgeVariant: 'default' as const,
    href: '/tools/ai-image-upscaler',
    color: 'text-cyan-600',
    bg: 'bg-cyan-50',
    comingSoon: true,
  },
  {
    icon: Eye,
    label: 'AI Logo Generator',
    description: 'Generate clean logo concepts for your brand and export in multiple formats.',
    badge: 'New',
    badgeVariant: 'default' as const,
    href: '/tools/logo-generator',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
  },
  {
    icon: Video,
    label: 'Portfolio Video Recorder',
    description: 'Turn any URL into a smooth scrolling demo video for your portfolio, case study, or social post.',
    badge: 'New',
    badgeVariant: 'default' as const,
    href: '/tools/portfolio-recorder',
    color: 'text-sky-600',
    bg: 'bg-sky-50',
  },
]

const stats = [
  { value: '5K+', label: 'Active Users' },
  { value: '1.99M+', label: 'Images Processed' },
  { value: '99.9%', label: 'Uptime' },
  { value: '20+', label: 'Free Tools' },
]

const features = [
  'No sign-up required for basic tools',
  'Lightning-fast processing in the browser',
  'Privacy-first — files never leave your device',
  'Export to any format in one click',
]

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Ai Ranko',
  url: 'https://airanko.com',
  logo: 'https://airanko.com/images/ai-ranko-logo.webp',
  description: 'Free AI-powered SEO and image tools for marketers, developers, and creators.',
  sameAs: [],
}

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Ai Ranko',
  url: 'https://airanko.com',
  description: 'Free AI-powered SEO and image tools — no signup required.',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://airanko.com/sitemap?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
}

const itemListJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Free SEO & AI Tools by Ai Ranko',
  description: 'Complete list of free, AI-powered SEO and image tools available on Ai Ranko.',
  numberOfItems: 22,
  itemListElement: [
    { '@type': 'ListItem', position: 1,  name: 'SEO Strategy Maker',                     url: 'https://airanko.com/tools/seo-strategy-maker' },
    { '@type': 'ListItem', position: 2,  name: 'Site Audit Tool',                        url: 'https://airanko.com/tools/site-audit' },
    { '@type': 'ListItem', position: 3,  name: 'AI Content Optimizer',                   url: 'https://airanko.com/tools/content-optimizer' },
    { '@type': 'ListItem', position: 4,  name: 'Keyword Research Tool',                  url: 'https://airanko.com/tools/keyword-research' },
    { '@type': 'ListItem', position: 5,  name: 'AI Content Writer',                      url: 'https://airanko.com/tools/content-writer' },
    { '@type': 'ListItem', position: 6,  name: 'AI Content Detector & Grammar Checker', url: 'https://airanko.com/tools/plagiarism-checker' },
    { '@type': 'ListItem', position: 7,  name: 'Bulk Meta & OG Checker',                 url: 'https://airanko.com/tools/meta-checker' },
    { '@type': 'ListItem', position: 8,  name: 'Link Extractor',                         url: 'https://airanko.com/tools/link-extractor' },
    { '@type': 'ListItem', position: 9,  name: 'Mobile Friendliness Checker',            url: 'https://airanko.com/tools/mobile-checker' },
    { '@type': 'ListItem', position: 10, name: 'Image Resizer & Converter',              url: 'https://airanko.com/tools/image-resizer' },
    { '@type': 'ListItem', position: 11, name: 'Bulk Image Resizer',                     url: 'https://airanko.com/tools/bulk-image-resizer' },
    { '@type': 'ListItem', position: 12, name: 'AI Background Remover',                  url: 'https://airanko.com/tools/background-remover' },
    { '@type': 'ListItem', position: 13, name: 'AI Logo Generator',                      url: 'https://airanko.com/tools/logo-generator' },
    { '@type': 'ListItem', position: 14, name: 'Portfolio Video Recorder',               url: 'https://airanko.com/tools/portfolio-recorder' },
    { '@type': 'ListItem', position: 15, name: 'HTML Sitemap Generator',                 url: 'https://airanko.com/tools/html-sitemap-generator' },
    { '@type': 'ListItem', position: 16, name: 'Vibe Code Detector',                     url: 'https://airanko.com/tools/vibe-code-detector' },
    { '@type': 'ListItem', position: 17, name: 'XML Sitemap Generator',                  url: 'https://airanko.com/tools/xml-sitemap-generator' },
    { '@type': 'ListItem', position: 18, name: 'Website Cloner',                         url: 'https://airanko.com/tools/website-cloner' },
    { '@type': 'ListItem', position: 19, name: 'Meta Pixel Checker',                     url: 'https://airanko.com/tools/meta-title-description-bulk-pixel-checker' },
    { '@type': 'ListItem', position: 20, name: 'Meta Title & Description Generator',     url: 'https://airanko.com/tools/meta-title-description-pixel-generator' },
    { '@type': 'ListItem', position: 21, name: 'Vibe Code Security Scanner',             url: 'https://airanko.com/tools/vibe-code-security-scanner' },
    { '@type': 'ListItem', position: 22, name: 'AI Image Upscaler',                      url: 'https://airanko.com/tools/ai-image-upscaler' },
  ],
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-20 pt-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              <Zap className="h-3.5 w-3.5" />
              AI-Powered SEO & Image Tools
            </div>
            <h1 className="font-heading text-4xl font-bold leading-tight tracking-tight text-foreground text-balance sm:text-5xl lg:text-6xl">
              Supercharge Your SEO with{' '}
              <span className="text-primary">Ai Ranko</span>
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground text-pretty">
              Free, fast, and powerful SEO tools and image utilities — built for marketers, developers, and creators who want to rank higher and work smarter.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8"
                asChild
              >
                <Link href="/#tools">
                  Explore Tools <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/tools/image-resizer">Try Image Resizer</Link>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-border bg-card p-5 text-center shadow-sm"
              >
                <p className="font-heading text-3xl font-bold text-primary">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section id="tools" className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <h2 className="font-heading text-3xl font-bold text-foreground text-balance sm:text-4xl">
              All Tools in One Place
            </h2>
            <p className="mt-3 text-muted-foreground text-pretty">
              Everything you need to grow your organic traffic and optimize your content.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {seoTools.map((tool) => {
              const Icon = tool.icon

              const cardContent = (
                <>
                  <Badge
                    variant="outline"
                    className="absolute right-4 top-4 text-xs border-muted-foreground/30 text-muted-foreground"
                  >
                    Coming Soon
                  </Badge>
                  {tool.badge && !tool.comingSoon && (
                    <Badge
                      variant={tool.badgeVariant}
                      className="absolute right-4 top-4 text-xs"
                    >
                      {tool.badge}
                    </Badge>
                  )}
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${tool.bg} ${tool.comingSoon ? 'opacity-50' : ''}`}>
                    <Icon className={`h-5 w-5 ${tool.color}`} />
                  </div>
                  <div>
                    <h3 className={`font-heading font-semibold leading-snug ${tool.comingSoon ? 'text-muted-foreground' : 'text-foreground'}`}>
                      {tool.label}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {tool.description}
                    </p>
                  </div>
                </>
              )

              if (tool.comingSoon) {
                return (
                  <div
                    key={tool.label}
                    className="relative flex flex-col gap-4 rounded-2xl border border-border bg-card/60 p-6 shadow-sm cursor-not-allowed opacity-75"
                  >
                    {cardContent}
                  </div>
                )
              }

              return (
                <Link
                  key={tool.label}
                  href={tool.href}
                  className="group relative flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-primary/40"
                >
                  {tool.badge && (
                    <Badge
                      variant={tool.badgeVariant}
                      className="absolute right-4 top-4 text-xs"
                    >
                      {tool.badge}
                    </Badge>
                  )}
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${tool.bg}`}>
                    <Icon className={`h-5 w-5 ${tool.color}`} />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-foreground leading-snug">
                      {tool.label}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {tool.description}
                    </p>
                  </div>
                  <div className="mt-auto flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    Use Tool <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why Ai Ranko */}
      <section className="bg-card border-y border-border px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="font-heading text-3xl font-bold text-foreground text-balance sm:text-4xl">
                Why teams choose Ai Ranko
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                We combine the power of AI with intuitive design so anyone can optimize their site and media — no technical skills required.
              </p>
              <ul className="mt-8 flex flex-col gap-4">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span className="text-foreground">{f}</span>
                  </li>
                ))}
              </ul>
              <Button className="mt-8 bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                <Link href="/tools/image-resizer">
                  Try for Free <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { title: 'Browser-based', desc: 'All processing happens locally — no uploads to servers.' },
                { title: 'Batch Ready', desc: 'Process multiple files at once to save time.' },
                { title: 'Any Format', desc: 'Convert between PNG, JPEG, WebP, GIF, and more.' },
                { title: 'SEO Boost', desc: 'Smaller, optimized images mean faster pages and better rankings.' },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-border bg-background p-5 shadow-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Star className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="mt-3 font-heading font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-3xl bg-primary px-8 py-14 text-center text-primary-foreground">
          <h2 className="font-heading text-3xl font-bold text-balance sm:text-4xl">
            Start ranking higher today
          </h2>
          <p className="mt-4 text-lg leading-relaxed opacity-85 text-pretty">
            Join 60,000+ creators and marketers using Ai Ranko to grow their organic presence — completely free.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-primary hover:bg-white/90 px-8"
              asChild
            >
              <Link href="/#tools">Get Started Free</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Link href="/" className="flex items-center" aria-label="Ai Ranko home">
            <img
              src="/images/ai-ranko-logo.webp"
              alt="Ai Ranko"
              className="h-7 w-auto"
            />
          </Link>
          <p className="text-sm text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} Ai Ranko. All rights reserved.
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
