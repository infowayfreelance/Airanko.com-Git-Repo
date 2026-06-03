import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Ai Ranko – Free AI-Powered SEO & Image Tools',
  description:
    'Boost your rankings with Ai Ranko — free AI-powered SEO tools and image utilities. Resize, convert & optimize images. Analyze meta tags, track keywords, and grow organic traffic.',
  openGraph: {
    title: 'Ai Ranko – Free AI-Powered SEO & Image Tools',
    description:
      'Boost your rankings with Ai Ranko — free AI-powered SEO tools and image utilities. Resize, convert & optimize images. Analyze meta tags, track keywords, and grow organic traffic.',
  },
  twitter: {
    title: 'Ai Ranko – Free AI-Powered SEO & Image Tools',
    description:
      'Boost your rankings with Ai Ranko — free AI-powered SEO tools and image utilities. Resize, convert & optimize images. Analyze meta tags, track keywords, and grow organic traffic.',
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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Navbar from '@/components/navbar'

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
    description: 'Generate a complete custom SEO strategy with keywords, competitors, content calendar & 6-month action plan.',
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
]

const stats = [
  { value: '5K+', label: 'Active Users' },
  { value: '1.99M+', label: 'Images Processed' },
  { value: '99.9%', label: 'Uptime' },
  { value: '15+', label: 'Free Tools' },
]

const features = [
  'No sign-up required for basic tools',
  'Lightning-fast processing in the browser',
  'Privacy-first — files never leave your device',
  'Export to any format in one click',
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
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
            Join 50,000+ creators and marketers using Ai Ranko to grow their organic presence — completely free.
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
            <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Contact</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
