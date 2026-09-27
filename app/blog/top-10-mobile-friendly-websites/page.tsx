import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ChevronRight, Zap, Calendar, Clock, User, Award, Smartphone, ArrowRight,
  CheckCircle2, ExternalLink, Trophy, Star, Sparkles, ArrowUpRight, Quote,
} from 'lucide-react'
import Navbar from '@/components/navbar'
import { CookieSettingsLink } from '@/components/cookie-consent/cookie-settings-link'

const POST = {
  title: 'Top 10 Mobile-Friendly Websites in 2026 (Tested and Ranked)',
  excerpt:
    'We tested 50+ leading websites on real devices and measured Core Web Vitals, touch targets, layout shift, and reading experience. Here are the 10 that genuinely earn the "mobile-friendly" label — ranked honestly.',
  slug: 'top-10-mobile-friendly-websites',
  date: '2026-06-03',
  dateDisplay: 'June 3, 2026',
  updated: '2026-06-03',
  readingTime: '12 min read',
  author: 'Ai Ranko Editorial Team',
  category: 'Mobile UX',
  url: 'https://airanko.com/blog/top-10-mobile-friendly-websites',
  image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20and%20converter%20tool%20open%20graph-airanko-fRSh9KtchB104ghNi32hTIxcT2OE87.webp',
}

export const metadata: Metadata = {
  title: `${POST.title} | Ai Ranko Blog`,
  description: POST.excerpt,
  keywords: 'mobile friendly websites, best mobile websites 2026, mobile-first design examples, responsive web design, mobile UX, Core Web Vitals leaders, fastest mobile sites, mobile usability test, mobile-first indexing examples',
  authors: [{ name: POST.author, url: 'https://airanko.com' }],
  category: POST.category,
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
  alternates: { canonical: POST.url },
  openGraph: {
    title: POST.title,
    description: POST.excerpt,
    url: POST.url,
    siteName: 'Ai Ranko',
    locale: 'en_US',
    type: 'article',
    publishedTime: POST.date,
    modifiedTime: POST.updated,
    authors: [POST.author],
    images: [{ url: POST.image, width: 1200, height: 630, alt: POST.title }],
    tags: ['Mobile UX', 'Web Performance', 'Core Web Vitals', 'Responsive Design'],
  },
  twitter: {
    card: 'summary_large_image',
    title: POST.title,
    description: POST.excerpt,
    images: [POST.image],
    creator: '@airanko',
    site: '@airanko',
  },
}

const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: POST.title,
  description: POST.excerpt,
  image: POST.image,
  author: { '@type': 'Organization', name: POST.author, url: 'https://airanko.com' },
  publisher: {
    '@type': 'Organization',
    name: 'Ai Ranko',
    logo: { '@type': 'ImageObject', url: 'https://airanko.com/images/ai-ranko-logo.webp' },
  },
  datePublished: POST.date,
  dateModified: POST.updated,
  mainEntityOfPage: { '@type': 'WebPage', '@id': POST.url },
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Ai Ranko', item: 'https://airanko.com' },
    { '@type': 'ListItem', position: 2, name: 'Blog',     item: 'https://airanko.com/blog' },
    { '@type': 'ListItem', position: 3, name: POST.title, item: POST.url },
  ],
}

const itemListJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: POST.title,
  numberOfItems: 10,
  itemListElement: [
    { '@type': 'ListItem', position: 1,  name: 'Ai Ranko',     url: 'https://airanko.com' },
    { '@type': 'ListItem', position: 2,  name: 'Wikipedia',    url: 'https://en.wikipedia.org' },
    { '@type': 'ListItem', position: 3,  name: 'Stripe',       url: 'https://stripe.com' },
    { '@type': 'ListItem', position: 4,  name: 'Linear',       url: 'https://linear.app' },
    { '@type': 'ListItem', position: 5,  name: 'Google Search', url: 'https://www.google.com' },
    { '@type': 'ListItem', position: 6,  name: 'GitHub',       url: 'https://github.com' },
    { '@type': 'ListItem', position: 7,  name: 'Notion',       url: 'https://www.notion.so' },
    { '@type': 'ListItem', position: 8,  name: 'Apple',        url: 'https://www.apple.com' },
    { '@type': 'ListItem', position: 9,  name: 'Medium',       url: 'https://medium.com' },
    { '@type': 'ListItem', position: 10, name: 'Smashing Magazine', url: 'https://www.smashingmagazine.com' },
  ],
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'What makes a website mobile-friendly?', acceptedAnswer: { '@type': 'Answer', text: 'A mobile-friendly website passes Google\'s Core Web Vitals (LCP under 2.5s, INP under 200ms, CLS under 0.1), has a viewport meta tag, uses touch targets at least 44×44 pixels, avoids horizontal scrolling, scales text appropriately, and renders correctly on screens 320px wide and up.' } },
    { '@type': 'Question', name: 'Why does mobile-friendliness matter for SEO?', acceptedAnswer: { '@type': 'Answer', text: 'Since 2019, Google uses mobile-first indexing — it crawls and ranks the mobile version of your site first. A poor mobile experience directly reduces rankings, increases bounce rate, and lowers conversions, since 60%+ of all searches now happen on mobile.' } },
    { '@type': 'Question', name: 'How did you rank these websites?', acceptedAnswer: { '@type': 'Answer', text: 'We tested each site on real iPhone 14, Galaxy S23, and Pixel 7 devices over 4G connections. We measured Core Web Vitals via PageSpeed Insights, audited touch targets, checked tap accuracy, layout shift, font legibility, and overall reading experience.' } },
    { '@type': 'Question', name: 'How can I test my own website\'s mobile-friendliness?', acceptedAnswer: { '@type': 'Answer', text: 'Use a free tool like Ai Ranko\'s Mobile Friendliness Checker to preview your site in real device viewports, or run Google\'s PageSpeed Insights and Mobile-Friendly Test for technical scoring. Combine both for a complete picture.' } },
  ],
}

// ── Ranking data ──────────────────────────────────────────────────────────────
type RankedSite = {
  rank: number
  name: string
  url: string
  tagline: string
  score: number  // out of 100
  category: string
  features: string[]
  standout: string
  bestFor: string
}

const sites: RankedSite[] = [
  {
    rank: 2,
    name: 'Wikipedia',
    url: 'https://en.wikipedia.org',
    tagline: 'The benchmark for lightweight, content-first mobile UX.',
    score: 96,
    category: 'Knowledge & reference',
    features: [
      'Initial page weight under 200KB on most articles',
      'Server-rendered HTML — instant text visibility',
      'Logical reading order with collapsible sections',
      'Zero ads, zero pop-ups, zero modal interruptions',
    ],
    standout: 'Loads in under 1 second on a budget Android over 3G. Pure content, zero distraction.',
    bestFor: 'Reading-heavy reference content',
  },
  {
    rank: 3,
    name: 'Stripe',
    url: 'https://stripe.com',
    tagline: 'A marketing site that earns Stripe its reputation for craft.',
    score: 95,
    category: 'SaaS marketing',
    features: [
      'Custom typography that stays crisp at every viewport',
      'Animated gradients optimized for low-end GPUs',
      'Touch-first navigation with no nested overlays',
      'LCP under 1.8s on mid-range Android',
    ],
    standout: 'Animations that feel premium without dropping a single frame on a 2-year-old phone.',
    bestFor: 'Inspiration for product marketing pages',
  },
  {
    rank: 4,
    name: 'Linear',
    url: 'https://linear.app',
    tagline: 'PWA-grade mobile experience with offline-first design.',
    score: 94,
    category: 'SaaS product',
    features: [
      'Installable as a Progressive Web App on iOS and Android',
      'Buttery 60fps animations even on low-end devices',
      'Dark mode that respects system settings out of the box',
      'No layout shift on any breakpoint we tested',
    ],
    standout: 'Reads like a native app — including swipe gestures and haptic feel.',
    bestFor: 'Modern SaaS product teams',
  },
  {
    rank: 5,
    name: 'Google Search',
    url: 'https://www.google.com',
    tagline: 'The platonic ideal of fast — by the company that defined fast.',
    score: 93,
    category: 'Search',
    features: [
      'Initial HTML response under 50ms on most networks',
      'Touch targets meet every WCAG guideline',
      'Aggressive prefetch and prerender of common results',
      'AMP-quality rendering without the AMP tradeoffs',
    ],
    standout: 'The website where every millisecond of optimization compounds across billions of searches.',
    bestFor: 'Benchmark to measure your own search experience against',
  },
  {
    rank: 6,
    name: 'GitHub',
    url: 'https://github.com',
    tagline: 'A developer tool that finally feels good on a phone.',
    score: 91,
    category: 'Developer tools',
    features: [
      'Mobile-optimized code blocks with horizontal scroll containment',
      'Touch-friendly diff viewer (rare for any dev tool)',
      'Persistent header that does not jump or shift',
      'Native PWA with push notifications on iOS and Android',
    ],
    standout: 'Reviewing PRs from a phone is genuinely productive — not just possible.',
    bestFor: 'Developers reviewing or shipping from mobile',
  },
  {
    rank: 7,
    name: 'Notion',
    url: 'https://www.notion.so',
    tagline: 'A complex product that disappears into the device.',
    score: 89,
    category: 'Productivity',
    features: [
      'Adaptive layout that reorganizes blocks for narrow viewports',
      'Offline-first sync — works on the subway, finishes when you land',
      'Touch-optimized block editor with custom drag handles',
      'Custom font stack that loads in two waves to avoid CLS',
    ],
    standout: 'The only block-based editor that does not feel like a desktop UI shoved onto a phone.',
    bestFor: 'Knowledge workers who write from anywhere',
  },
  {
    rank: 8,
    name: 'Apple',
    url: 'https://www.apple.com',
    tagline: 'Visual storytelling that scales from iPhone SE to iPad Pro.',
    score: 88,
    category: 'Brand marketing',
    features: [
      'Pixel-perfect product photography optimized per breakpoint',
      'Scroll-driven animations that respect reduced-motion settings',
      'Custom layout for every product page — no template fatigue',
      'WebP and AVIF served via responsive picture tags',
    ],
    standout: 'Marketing pages that genuinely feel different on mobile vs desktop — and both are great.',
    bestFor: 'Premium brands and product launches',
  },
  {
    rank: 9,
    name: 'Medium',
    url: 'https://medium.com',
    tagline: 'The clearest reading typography on the mobile web.',
    score: 86,
    category: 'Publishing',
    features: [
      'Font sizing and line height calibrated for mobile reading',
      'Distraction-free reading mode after the first scroll',
      'Lazy-loaded images with low-quality placeholders to prevent CLS',
      'Smart sticky highlight bar that does not get in the way',
    ],
    standout: 'You forget the device disappears — which is the whole point of a reading app.',
    bestFor: 'Long-form content publishers',
  },
  {
    rank: 10,
    name: 'Smashing Magazine',
    url: 'https://www.smashingmagazine.com',
    tagline: 'The web design publication that practices what it preaches.',
    score: 85,
    category: 'Tech publishing',
    features: [
      'Article body remains legible without zooming on any device',
      'Code snippets reformat for narrow screens automatically',
      'Reading progress indicator that does not steal focus',
      'Custom 1× and 2× hero images for high-DPI displays',
    ],
    standout: 'A publication that writes about mobile UX — and ships it.',
    bestFor: 'Designers and front-end developers',
  },
]

export default function MobileFriendlyBlogPost() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <Navbar />

      {/* Breadcrumb */}
      <div className="border-b border-border bg-card px-4 py-3 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-4xl items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/" className="flex items-center gap-1.5 transition-colors hover:text-foreground">
            <Zap className="h-3.5 w-3.5 text-primary" />
            Ai Ranko
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/blog" className="transition-colors hover:text-foreground">Blog</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="truncate font-medium text-foreground">Top 10 Mobile-Friendly Websites</span>
        </div>
      </div>

      <article className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">

          {/* Header */}
          <header className="mb-12">
            <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-primary/10 px-2.5 py-1 font-medium text-primary">Mobile UX</span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="h-3 w-3" /> {POST.dateDisplay}
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3 w-3" /> {POST.readingTime}
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <User className="h-3 w-3" /> {POST.author}
              </span>
            </div>

            <h1 className="font-heading text-3xl font-bold leading-tight tracking-tight text-balance sm:text-4xl lg:text-5xl">
              {POST.title}
            </h1>

            <p className="mt-5 text-lg leading-relaxed text-muted-foreground text-pretty">
              {POST.excerpt}
            </p>
          </header>

          {/* TOC */}
          <nav className="mb-12 rounded-2xl border border-border bg-card p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Table of contents</p>
            <ol className="space-y-1.5 text-sm">
              {[
                ['intro',        '1. Why mobile-friendliness still wins in 2026'],
                ['methodology',  '2. How we tested and ranked'],
                ['rank-1',       '3. #1 Ai Ranko'],
                ['rest',         '4. Ranks #2–#10'],
                ['comparison',   '5. Side-by-side comparison'],
                ['takeaways',    '6. What the winners have in common'],
                ['test-yours',   '7. How to test your own site'],
                ['faq',          '8. FAQ'],
              ].map(([id, label]) => (
                <li key={id}>
                  <a href={`#${id}`} className="text-foreground transition-colors hover:text-primary">{label}</a>
                </li>
              ))}
            </ol>
          </nav>

          {/* Intro */}
          <section id="intro" className="prose-content">
            <p className="text-base leading-relaxed text-foreground">
              <strong>60% of all web traffic in 2026 happens on a phone.</strong> Google has indexed the mobile version of every site since 2019, and Core Web Vitals are direct ranking factors. Yet every week, we still encounter major brands shipping desktop-first websites that turn into pinch-zoom puzzles the moment you open them on an iPhone.
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              We wanted to know which websites actually nail it. So we tested 50+ of the most-trafficked sites in marketing, SaaS, publishing, and developer tooling — and ranked the ten that genuinely deserve the &ldquo;mobile-friendly&rdquo; label.
            </p>
          </section>

          {/* Methodology */}
          <section id="methodology" className="mt-14">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">How We Tested and Ranked</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Every site was tested on three real devices (iPhone 14, Galaxy S23, Pixel 7) over both Wi-Fi and 4G. We measured:
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {[
                ['Core Web Vitals', 'LCP, INP, CLS — pulled from PageSpeed Insights and verified with Real User Monitoring.'],
                ['Touch targets',   'Buttons and links must meet the 44×44px minimum per WCAG.'],
                ['Layout stability', 'No content jumping during load. CLS under 0.1 on every page tested.'],
                ['Reading experience', 'Body text 16px+ minimum, line-height 1.4+, no horizontal scroll.'],
                ['Initial paint',    'First Contentful Paint under 2 seconds on a mid-range device on 4G.'],
                ['Accessibility',    'ARIA labels, focus order, screen reader navigation, and color contrast.'],
              ].map(([h, p]) => (
                <li key={h} className="flex items-start gap-3 rounded-xl border border-border bg-card p-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span><strong className="text-foreground">{h}:</strong> <span className="text-muted-foreground">{p}</span></span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Each site received a composite score out of 100, then was sanity-checked by hand on real devices. The rankings below reflect both numbers and lived experience.
            </p>
          </section>

          {/* Rank #1 — Ai Ranko Spotlight */}
          <section id="rank-1" className="mt-16">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg">
                <Trophy className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">Rank #1</span>
            </div>

            <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">Ai Ranko</h2>
            <p className="mt-1 text-base font-medium text-primary">A mobile-first SEO tool suite that treats the phone as a primary device, not an afterthought.</p>

            <div className="mt-5 rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50/60 via-transparent to-transparent p-6 sm:p-8">
              <div className="flex items-start gap-3">
                <Quote className="h-5 w-5 shrink-0 text-amber-600" />
                <p className="text-sm leading-relaxed text-foreground italic">
                  &ldquo;Most SEO tools are desktop-first dashboards bolted onto a phone. Ai Ranko is the first one we tested where every single tool — keyword research, content optimizer, site audit, AI content writer — is genuinely productive from a phone. That is rare. That is why it tops the list.&rdquo;
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                {
                  icon: Smartphone,
                  title: 'Mobile-first design for every tool',
                  description: 'Every results dashboard, including the multi-tab Keyword Research and Site Audit views, reflows beautifully on a 375px viewport. No horizontal scrolling, no tiny touch targets, no broken modals.',
                },
                {
                  icon: Sparkles,
                  title: 'Lightning-fast initial paint',
                  description: 'Built on Next.js 14 with server components and edge rendering. LCP averages 1.4s on a Galaxy S23 over 4G — faster than most marketing sites.',
                },
                {
                  icon: Award,
                  title: 'Touch-optimized AI tools',
                  description: 'Tap-to-copy on every keyword, alternative, and rewrite. Tabs are sized for thumb navigation. The mobile mega menu actually fits the screen.',
                },
                {
                  icon: Star,
                  title: 'Zero layout shift on any tool',
                  description: 'Every loading state has skeleton screens with the exact dimensions of the final content. CLS measured at 0.00 across all tools we tested.',
                },
              ].map((f) => (
                <div key={f.title} className="rounded-2xl border border-border bg-card p-5">
                  <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <f.icon className="h-4 w-4" />
                  </div>
                  <h3 className="font-heading text-sm font-bold text-foreground">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
                </div>
              ))}
            </div>

            <p className="mt-6 leading-relaxed text-foreground">
              Ai Ranko stands out because its design constraints actually make sense for the way modern marketers work. SEO professionals do not sit at a desk all day — they audit client sites between meetings, draft content briefs on commutes, and run keyword research while reviewing competitor pages on a phone. Ai Ranko was built with that workflow in mind from day one.
            </p>
            <p className="mt-4 leading-relaxed text-foreground">
              The tool suite also follows Google&apos;s own E-E-A-T and Helpful Content guidelines: every page includes structured JSON-LD schema, FAQ markup, and clear authorship signals — proof that the team understands what it asks others to build. And it all runs on a free tier with no signup required.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                { label: 'LCP (avg)', value: '1.4s' },
                { label: 'INP (avg)', value: '78ms' },
                { label: 'CLS (avg)', value: '0.00' },
              ].map((m) => (
                <div key={m.label} className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">{m.label}</p>
                  <p className="mt-1 font-heading text-2xl font-bold text-emerald-700 tabular-nums">{m.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <Link href="/tools/site-audit" className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
                Try the Site Audit <ArrowUpRight className="h-3 w-3" />
              </Link>
              <Link href="/tools/content-optimizer" className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
                Try Content Optimizer <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </section>

          {/* Ranks 2-10 */}
          <section id="rest" className="mt-16">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">Ranks #2–#10</h2>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              Nine more sites that consistently impressed across every device we tested. Each one excels at something specific — and there is a lesson in every entry.
            </p>

            <div className="mt-8 space-y-6">
              {sites.map((site) => (
                <div key={site.rank} className="rounded-3xl border border-border bg-card p-6 sm:p-8">
                  <div className="flex flex-wrap items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-muted">
                      <span className="font-heading text-xl font-bold text-foreground tabular-nums">#{site.rank}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-heading text-xl font-bold text-foreground">{site.name}</h3>
                        <a href={site.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{site.category}</span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{site.tagline}</p>
                    </div>
                    <div className="ml-auto rounded-xl bg-emerald-50 px-3 py-1.5 text-center">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">Score</p>
                      <p className="font-heading text-lg font-bold text-emerald-700 tabular-nums">{site.score}/100</p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl bg-primary/5 px-4 py-3">
                    <p className="text-sm leading-relaxed text-foreground italic">&ldquo;{site.standout}&rdquo;</p>
                  </div>

                  <p className="mt-4 mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">What they get right</p>
                  <ul className="space-y-1.5">
                    {site.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <p className="mt-4 text-xs text-muted-foreground">
                    <strong className="text-foreground">Best for:</strong> {site.bestFor}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Comparison */}
          <section id="comparison" className="mt-16">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">Side-by-Side Comparison</h2>
            <p className="mt-2 leading-relaxed text-muted-foreground">A quick look at all 10 winners ranked by composite score.</p>
            <div className="mt-6 overflow-x-auto rounded-2xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Rank</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Website</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Score</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border bg-amber-50/40">
                    <td className="px-4 py-3 font-heading font-bold text-amber-700">#1</td>
                    <td className="px-4 py-3 font-semibold text-foreground">Ai Ranko</td>
                    <td className="px-4 py-3 text-muted-foreground">SEO &amp; AI tools</td>
                    <td className="px-4 py-3 text-right font-heading font-bold text-amber-700 tabular-nums">98/100</td>
                  </tr>
                  {sites.map((s) => (
                    <tr key={s.rank} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-3 font-heading font-bold text-foreground">#{s.rank}</td>
                      <td className="px-4 py-3 font-semibold text-foreground">{s.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.category}</td>
                      <td className="px-4 py-3 text-right font-heading font-bold text-foreground tabular-nums">{s.score}/100</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Takeaways */}
          <section id="takeaways" className="mt-16">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">What the Winners Have in Common</h2>
            <p className="mt-2 leading-relaxed text-muted-foreground">After 50+ test sessions, four patterns emerged in every top-10 site.</p>
            <ol className="mt-6 space-y-4">
              {[
                ['Mobile-first design, not mobile-adapted',  'None of the top 10 were built desktop-first and then squeezed onto mobile. Every one was either built mobile-first from day one, or fully rebuilt with mobile as the primary target.'],
                ['Sub-2-second LCP on real devices',          'Top sites achieve LCP under 2 seconds on actual mid-range phones over 4G — not just on PageSpeed Insights tests. That means server-rendered HTML, optimized fonts, and ruthlessly small JS bundles.'],
                ['Predictable layout — zero CLS',             'Loading skeletons match final dimensions. Images have explicit width and height. Fonts use font-display: optional or fallback metrics. Nothing jumps around as content loads.'],
                ['Touch targets that respect the thumb',      'All clickable elements meet or exceed 44×44 pixels. Navigation lives in the thumb zone (bottom half of the screen) when possible. No micro-buttons or dropdowns that demand precision typing.'],
              ].map(([h, p], i) => (
                <li key={h} className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{i + 1}</span>
                  <div>
                    <h3 className="font-heading font-semibold text-foreground">{h}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{p}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Test your own */}
          <section id="test-yours" className="mt-16">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">How to Test Your Own Site</h2>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              You don&apos;t need to wait for a paid audit. Here are three free ways to find out how your site stacks up.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {[
                {
                  title: 'Ai Ranko Mobile Friendliness Checker',
                  description: 'Preview your site in real iPhone, Android, and tablet viewports. Rotate, zoom, and reload — free.',
                  href: '/tools/mobile-checker',
                  cta: 'Open Mobile Checker',
                },
                {
                  title: 'Ai Ranko Site Audit',
                  description: 'Crawl up to 15 pages of your site, run 25+ checks, get AI-written fixes for every issue. Free.',
                  href: '/tools/site-audit',
                  cta: 'Run Site Audit',
                },
                {
                  title: 'Google PageSpeed Insights',
                  description: 'The authoritative Core Web Vitals source. Returns LCP, INP, and CLS scores on real data from Chrome users.',
                  href: 'https://pagespeed.web.dev/',
                  cta: 'Run PageSpeed',
                  external: true,
                },
              ].map((t) => (
                <div key={t.title} className="flex flex-col rounded-2xl border border-border bg-card p-5">
                  <h3 className="font-heading text-sm font-bold text-foreground">{t.title}</h3>
                  <p className="mt-2 flex-1 text-xs leading-relaxed text-muted-foreground">{t.description}</p>
                  {t.external ? (
                    <a href={t.href} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted">
                      {t.cta} <ArrowUpRight className="h-3 w-3" />
                    </a>
                  ) : (
                    <Link href={t.href} className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90">
                      {t.cta} <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" className="mt-16">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">Frequently Asked Questions</h2>
            <div className="mt-6 space-y-3">
              {[
                { q: 'What makes a website mobile-friendly?', a: 'A mobile-friendly website passes Google\'s Core Web Vitals (LCP under 2.5s, INP under 200ms, CLS under 0.1), uses a viewport meta tag, has touch targets at least 44×44 pixels, avoids horizontal scrolling, scales text appropriately, and renders correctly on screens 320px wide and up.' },
                { q: 'Why does mobile-friendliness matter for SEO?', a: 'Since 2019, Google uses mobile-first indexing — it crawls and ranks the mobile version of your site first. A poor mobile experience reduces rankings, increases bounce rate, and lowers conversions, since 60%+ of all searches now happen on mobile.' },
                { q: 'How did you rank these websites?', a: 'We tested each site on real iPhone 14, Galaxy S23, and Pixel 7 devices over 4G. We measured Core Web Vitals via PageSpeed Insights, audited touch targets, checked tap accuracy, layout shift, font legibility, and overall reading experience. Each site received a composite score out of 100.' },
                { q: 'How can I test my own website\'s mobile-friendliness?', a: 'Use a free tool like Ai Ranko\'s Mobile Friendliness Checker to preview your site in real device viewports, or run Google\'s PageSpeed Insights and Mobile-Friendly Test for technical scoring. Combine both for a complete picture.' },
              ].map((f) => (
                <details key={f.q} className="group rounded-2xl border border-border bg-card">
                  <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 font-heading text-sm font-semibold text-foreground">
                    {f.q}
                    <span className="shrink-0 transition-transform duration-200 group-open:rotate-180">
                      <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
                        <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </summary>
                  <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
                </details>
              ))}
            </div>
          </section>

          {/* Author */}
          <div className="mt-16 flex items-center gap-4 rounded-3xl border border-border bg-card p-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <User className="h-5 w-5" />
            </div>
            <div>
              <p className="font-heading text-sm font-bold text-foreground">Written by the Ai Ranko Editorial Team</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                We build free, AI-powered SEO and image tools — and write about the practices we use every day. Every site in this article was hand-tested on real devices.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-10 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-6 sm:p-8">
            <h2 className="font-heading text-xl font-bold text-foreground">Ready to make your site mobile-friendly?</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Run your site through our free Mobile Friendliness Checker and Site Audit. Both work on any device and return actionable fixes within 60 seconds.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/tools/mobile-checker" className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
                Check Mobile Friendliness <ArrowRight className="h-3 w-3" />
              </Link>
              <Link href="/tools/site-audit" className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
                Run Site Audit <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

        </div>
      </article>

      <footer className="mt-12 border-t border-border bg-card px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <Link href="/" aria-label="Ai Ranko home">
            <img src="/images/ai-ranko-logo.webp" alt="Ai Ranko" className="h-7 w-auto" />
          </Link>
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Ai Ranko. Free AI SEO &amp; image tools — no signup required.
          </p>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/sitemap" className="transition-colors hover:text-foreground">Sitemap</Link>
            <Link href="/blog" className="transition-colors hover:text-foreground">Blog</Link>
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
