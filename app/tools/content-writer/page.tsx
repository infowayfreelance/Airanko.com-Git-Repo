import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Zap } from 'lucide-react'
import Navbar from '@/components/navbar'
import ContentWriterTool from '@/components/content-writer/content-writer-tool'

export const metadata: Metadata = {
  title:
    'AI Content Writer — Built for Google\u2019s 2025 E-E-A-T & Helpful Content Updates | Ai Ranko',
  description:
    'Generate full SEO articles optimized for Google\u2019s latest updates: E-E-A-T scoring, Helpful Content System, AI Overviews citation hooks, FAQ schema, and a pre-publish checklist.',
  keywords:
    'AI content writer, Google E-E-A-T content, helpful content system, AI Overviews SEO, AI article generator, SEO content writer, AI blog writer 2025',
  openGraph: {
    title: 'AI Content Writer — Built for Google\u2019s 2025 SEO Updates',
    description:
      'Generate SEO articles with E-E-A-T signals, AI Overview hooks, FAQ schema, and a complete publishing checklist — tuned for the Helpful Content System.',
  },
  twitter: {
    title: 'AI Content Writer — Built for Google\u2019s 2025 SEO Updates',
    description:
      'Generate SEO articles with E-E-A-T signals, AI Overview hooks, FAQ schema, and a complete publishing checklist — tuned for the Helpful Content System.',
  },
  alternates: {
    canonical: '/tools/content-writer',
  },
}

export default function ContentWriterPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Breadcrumb */}
      <div
        className="border-b border-border bg-card px-4 py-3 sm:px-6 lg:px-8 print:hidden"
        data-print-hide
      >
        <div className="mx-auto flex max-w-7xl items-center gap-1.5 text-sm text-muted-foreground">
          <Link
            href="/"
            className="flex items-center gap-1.5 transition-colors hover:text-foreground"
          >
            <Zap className="h-3.5 w-3.5 text-primary" />
            Ai Ranko
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link
            href="/#tools"
            className="transition-colors hover:text-foreground"
          >
            Tools
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-foreground">AI Content Writer</span>
        </div>
      </div>

      <main>
        <ContentWriterTool />
      </main>

      {/* Footer */}
      <footer
        className="mt-12 border-t border-border bg-card px-4 py-8 sm:px-6 lg:px-8 print:hidden"
        data-print-hide
      >
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <Link href="/" className="flex items-center" aria-label="Ai Ranko home">
            <img
              src="/images/ai-ranko-logo.webp"
              alt="Ai Ranko"
              className="h-7 w-auto"
            />
          </Link>
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Ai Ranko. AI-generated content —
            always fact-check and add your real expertise before publishing.
          </p>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link
              href="#"
              className="transition-colors hover:text-foreground"
            >
              Privacy
            </Link>
            <Link
              href="#"
              className="transition-colors hover:text-foreground"
            >
              Terms
            </Link>
            <Link
              href="#"
              className="transition-colors hover:text-foreground"
            >
              Contact
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
