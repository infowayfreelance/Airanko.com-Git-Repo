import Navbar from '@/components/navbar'
import LogoGeneratorTool from '@/components/logo-generator/logo-generator-tool'
import Link from 'next/link'
import { ChevronRight, Sparkles } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Free Minimalist Logo Generator — Download SVG & PNG | Ai Ranko',
  description:
    'Create a clean, minimalist logo for your brand in seconds. Customize shapes, fonts, colors, and layouts — download as SVG or PNG for free. No signup, no watermark.',
  keywords:
    'free logo generator, minimalist logo maker, logo creator online, brand logo design, SVG logo generator, PNG logo download, free logo design tool, logo maker no signup',
  alternates: { canonical: 'https://airanko.com/tools/logo-generator' },
  openGraph: {
    title: 'Free Minimalist Logo Generator — Download SVG & PNG | Ai Ranko',
    description:
      'Create a clean, minimalist logo for your brand in seconds. Customize shapes, fonts, colors, and layouts — download as SVG or PNG for free.',
    url: 'https://airanko.com/tools/logo-generator',
    siteName: 'Ai Ranko',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20and%20converter%20tool%20open%20graph-airanko-fRSh9KtchB104ghNi32hTIxcT2OE87.webp',
        width: 1200,
        height: 630,
        alt: 'Free Minimalist Logo Generator | Ai Ranko',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Minimalist Logo Generator — Download SVG & PNG | Ai Ranko',
    description:
      'Create a clean, minimalist logo for your brand in seconds. Download as SVG or PNG for free. No signup.',
    images: [
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20and%20converter%20tool%20open%20graph-airanko-fRSh9KtchB104ghNi32hTIxcT2OE87.webp',
    ],
  },
}

export default function LogoGeneratorPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/#tools" className="hover:text-foreground transition-colors">
            Tools
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">Logo Generator</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1.5 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Free — No sign-up required
          </div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground text-balance sm:text-4xl">
            Minimalist Logo Generator
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground text-pretty">
            Design a clean, professional logo in seconds. Choose an icon shape, pick your palette,
            set your typography, and download a crisp SVG or PNG — all in the browser, no account needed.
          </p>
        </div>

        {/* Tool */}
        <LogoGeneratorTool />

        {/* Info cards */}
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {[
            {
              title: 'Fully browser-based',
              desc: 'All logo generation happens locally. Nothing is uploaded to any server.',
            },
            {
              title: 'SVG & PNG exports',
              desc: 'Download a scalable SVG or a high-resolution PNG at 2x or 3x pixel density.',
            },
            {
              title: 'Minimalist by design',
              desc: 'Clean shapes, careful typography, and curated palettes for a timeless look.',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <h3 className="font-heading font-semibold text-foreground">{item.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
