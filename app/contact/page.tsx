import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Zap, Mail, Clock } from 'lucide-react'
import Navbar from '@/components/navbar'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'
import ContactForm from '@/components/contact/contact-form'

export const metadata: Metadata = {
  title: 'Contact – Ai Ranko',
  description: 'Contact the Ai Ranko team for support, bug reports, feature requests, or partnerships. We usually respond within 24 hours.',
  alternates: { canonical: 'https://airanko.com/contact' },
  openGraph: {
    title: 'Contact – Ai Ranko',
    description: 'Contact the Ai Ranko team for support, bug reports, feature requests, or partnerships.',
    url: 'https://airanko.com/contact',
    siteName: 'Ai Ranko',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20and%20converter%20tool%20open%20graph-airanko-fRSh9KtchB104ghNi32hTIxcT2OE87.webp',
        width: 1200,
        height: 630,
        alt: 'Contact Ai Ranko',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact – Ai Ranko',
    description: 'Contact the Ai Ranko team for support, bug reports, feature requests, or partnerships.',
    images: [
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20and%20converter%20tool%20open%20graph-airanko-fRSh9KtchB104ghNi32hTIxcT2OE87.webp',
    ],
  },
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <BreadcrumbSchema items={[{ name: 'Contact', href: '/contact' }]} />

      {/* Breadcrumb */}
      <div className="border-b border-border bg-card px-4 py-3 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/" className="flex items-center gap-1.5 transition-colors hover:text-foreground">
            <Zap className="h-3.5 w-3.5 text-primary" />
            Ai Ranko
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-foreground">Contact</span>
        </div>
      </div>

      {/* Header */}
      <header className="border-b border-border bg-gradient-to-br from-primary/5 via-accent/5 to-transparent px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            <Mail className="h-3 w-3" />
            Contact
          </div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">Get in Touch</h1>
          <p className="mt-3 text-pretty text-muted-foreground">
            Have a question, found a bug, or want to collaborate? We&rsquo;d love to hear from you.
          </p>
        </div>
      </header>

      <main className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">

          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
            <ContactForm />
          </div>

          {/* Info cards */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Mail className="h-4 w-4" />
              </div>
              <h2 className="font-heading text-base font-semibold text-foreground">Email</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                General:&nbsp;
                <a className="text-primary hover:underline" href="mailto:support@airanko.com">support@airanko.com</a>
              </p>
              <p className="text-sm text-muted-foreground">
                Privacy / Legal:&nbsp;
                <a className="text-primary hover:underline" href="mailto:privacy@airanko.com">privacy@airanko.com</a>
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Clock className="h-4 w-4" />
              </div>
              <h2 className="font-heading text-base font-semibold text-foreground">Response Time</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                We typically respond within <strong className="text-foreground">1&ndash;2 business days</strong>. Privacy enquiries within 7 business days.
              </p>
            </div>
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
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/privacy-policy" className="transition-colors hover:text-foreground">Privacy</Link>
            <Link href="/terms-and-conditions" className="transition-colors hover:text-foreground">Terms</Link>
            <Link href="/cookie-policy" className="transition-colors hover:text-foreground">Cookies</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
