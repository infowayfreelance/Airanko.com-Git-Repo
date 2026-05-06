import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Zap } from 'lucide-react'
import Navbar from '@/components/navbar'
import LinkExtractorTool from '@/components/link-extractor/link-extractor-tool'

export const metadata: Metadata = {
  title: 'Free Link Extractor — Extract All Links from Any Website | Ai Ranko',
  description:
    'Paste any website URL and instantly extract every link on the page. Filter internal, external, nofollow, and file links. Export to CSV or JSON. Free and fast.',
  keywords:
    'link extractor, extract links from website, url extractor, internal external links, nofollow checker, scrape links, seo link audit',
  openGraph: {
    title: 'Free Link Extractor — Extract All Links from Any Website | Ai Ranko',
    description:
      'Paste any website URL and instantly extract every link on the page. Filter internal, external, nofollow, and file links. Export to CSV or JSON.',
  },
  twitter: {
    title: 'Free Link Extractor — Extract All Links from Any Website',
    description:
      'Paste any website URL and instantly extract every link on the page. Free and fast.',
  },
}

export default function LinkExtractorPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Breadcrumb */}
      <div className="border-b border-border bg-card px-4 py-3 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center gap-1.5 text-sm text-muted-foreground">
          <Link
            href="/"
            className="flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <Zap className="h-3.5 w-3.5 text-primary" />
            Ai Ranko
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/#tools" className="hover:text-foreground transition-colors">
            Tools
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-medium">Link Extractor</span>
        </div>
      </div>

      <main>
        <LinkExtractorTool />
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-12 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Link href="/" className="flex items-center" aria-label="Ai Ranko home">
            <img
              src="/images/ai-ranko-logo.webp"
              alt="Ai Ranko"
              className="h-7 w-auto"
            />
          </Link>
          <p className="text-sm text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} Ai Ranko. Pages are fetched
            server-side and never stored.
          </p>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Contact
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
