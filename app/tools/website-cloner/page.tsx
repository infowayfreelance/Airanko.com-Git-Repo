import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Zap } from 'lucide-react'
import Navbar from '@/components/navbar'
import ToolSchema from '@/components/ToolSchema'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'
import WebsiteClonerTool from '@/components/website-cloner/website-cloner-tool'

export const metadata: Metadata = {
  title: 'Free Website Cloner — Clone Any Web Page to HTML | Ai Ranko',
  description:
    'Free online website cloner. Enter a URL to instantly clone a web page — inlines CSS and JavaScript into one self-contained HTML file. Live preview + one-click download. No sign-up.',
  keywords:
    'website cloner, webpage cloner, clone website, download webpage html, save webpage offline, web page archiver, website copier tool, html page saver',
  alternates: { canonical: 'https://airanko.com/tools/website-cloner' },
  openGraph: {
    title: 'Free Website Cloner — Clone Any Web Page | Ai Ranko',
    description:
      'Clone a web page to a self-contained HTML file. Inlines CSS & JS, rewrites asset URLs. Live preview and instant download.',
    url: 'https://airanko.com/tools/website-cloner',
    siteName: 'Ai Ranko',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Website Cloner — Clone Any Web Page | Ai Ranko',
    description:
      'Clone a web page to a self-contained HTML file. Inlines CSS & JS, rewrites asset URLs. Live preview and instant download.',
  },
}

export default function WebsiteClonerPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <ToolSchema
        name="Website Cloner"
        slug="website-cloner"
        description="Clone any web page to a self-contained HTML file with inlined CSS and JavaScript. Live preview and one-click download."
      />
      <BreadcrumbSchema
        items={[
          { name: 'Tools', href: '/#tools' },
          { name: 'Website Cloner', href: '/tools/website-cloner' },
        ]}
      />

      {/* Breadcrumb */}
      <div className="border-b border-border bg-card px-4 py-3 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/" className="flex items-center gap-1.5 transition-colors hover:text-foreground">
            <Zap className="h-3.5 w-3.5 text-primary" />
            Ai Ranko
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/#tools" className="transition-colors hover:text-foreground">Tools</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-foreground">Website Cloner</span>
        </div>
      </div>

      <main>
        <WebsiteClonerTool />
      </main>

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
            <Link href="/privacy-policy" className="transition-colors hover:text-foreground">Privacy</Link>
            <Link href="/terms-and-conditions" className="transition-colors hover:text-foreground">Terms</Link>
            <Link href="/contact" className="transition-colors hover:text-foreground">Contact</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
