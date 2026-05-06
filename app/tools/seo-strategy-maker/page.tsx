import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Zap } from 'lucide-react'
import Navbar from '@/components/navbar'
import SeoStrategyMakerTool from '@/components/seo-strategy-maker/seo-strategy-maker-tool'

export const metadata: Metadata = {
  title: 'AI SEO Strategy Maker — Free Custom SEO Plan Generator | Ai Ranko',
  description:
    'Generate a complete, custom SEO strategy in seconds. Get keyword research, competitor analysis, content calendar, technical checklist, and a 6-month action plan — all powered by AI.',
  keywords:
    'SEO strategy maker, SEO plan generator, AI SEO tool, free SEO strategy, keyword strategy, content calendar, SEO roadmap',
  openGraph: {
    title: 'AI SEO Strategy Maker — Free Custom SEO Plan Generator',
    description:
      'Generate a complete, custom SEO strategy in seconds with AI. Keywords, competitors, content calendar, and a full action plan.',
  },
  twitter: {
    title: 'AI SEO Strategy Maker — Free Custom SEO Plan Generator',
    description:
      'Generate a complete, custom SEO strategy in seconds with AI. Keywords, competitors, content calendar, and a full action plan.',
  },
}

export default function SeoStrategyMakerPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Breadcrumb */}
      <div className="border-b border-border bg-card px-4 py-3 sm:px-6 lg:px-8 print:hidden" data-print-hide>
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
          <span className="text-foreground font-medium">SEO Strategy Maker</span>
        </div>
      </div>

      <main>
        <SeoStrategyMakerTool />
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-12 px-4 py-8 sm:px-6 lg:px-8 print:hidden" data-print-hide>
        <div className="mx-auto max-w-7xl flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Link href="/" className="flex items-center" aria-label="Ai Ranko home">
            <img
              src="/images/ai-ranko-logo.webp"
              alt="Ai Ranko"
              className="h-7 w-auto"
            />
          </Link>
          <p className="text-sm text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} Ai Ranko. AI-generated strategies — always validate with your own research.
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
