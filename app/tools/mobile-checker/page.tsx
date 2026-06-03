import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Zap } from 'lucide-react'
import Navbar from '@/components/navbar'
import MobileCheckerTool from '@/components/mobile-checker/mobile-checker-tool'
import MobileCheckerSeoSections from '@/components/mobile-checker-seo-sections'

export const metadata: Metadata = {
  title: 'Free Mobile Friendliness Checker — Test Any Website Instantly | Ai Ranko',
  description:
    'Check how any website looks on iPhone, Android, tablet, or desktop instantly. Test mobile responsiveness free — no install, no signup required.',
  keywords:
    'mobile friendliness checker, mobile responsive test, website mobile test, mobile preview tool, responsive design tester, mobile-first indexing test, free mobile checker',
  alternates: {
    canonical: 'https://airanko.com/tools/mobile-checker',
  },
  openGraph: {
    title: 'Free Mobile Friendliness Checker — Test Any Website Instantly | Ai Ranko',
    description:
      'Check how any website looks on iPhone, Android, tablet, or desktop instantly. Test mobile responsiveness free — no install, no signup required.',
    url: 'https://airanko.com/tools/mobile-checker',
    siteName: 'AI Ranko',
    images: [
      {
        url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20and%20converter%20tool%20open%20graph-airanko-fRSh9KtchB104ghNi32hTIxcT2OE87.webp',
        width: 1200,
        height: 630,
        alt: 'Free Mobile Friendliness Checker — Test Any Website Instantly | Ai Ranko',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Mobile Friendliness Checker — Test Any Website Instantly | Ai Ranko',
    description:
      'Check how any website looks on iPhone, Android, tablet, or desktop instantly. Test mobile responsiveness free — no install, no signup required.',
    images: [
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20and%20converter%20tool%20open%20graph-airanko-fRSh9KtchB104ghNi32hTIxcT2OE87.webp',
    ],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Free Mobile Friendliness Checker — Test Any Website Instantly',
  description:
    'Check how any website looks on iPhone, Android, tablet, or desktop instantly. Test mobile responsiveness free — no install, no signup required.',
  url: 'https://airanko.com/tools/mobile-checker',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'All',
  browserRequirements: 'Requires JavaScript. Works in modern browsers.',
  featureList: [
    'Preview on Phone, Tablet, and Desktop',
    'Real device screen sizes — iPhone SE, iPhone 14, iPhone 14 Pro Max, Galaxy S23, Pixel 7',
    'Portrait and Landscape orientation toggle',
    'Zoom controls — 50%, 75%, 100%',
    'Instant browser-based preview',
    'No data stored or tracked',
    '100% free with no signup required',
  ],
  creator: {
    '@type': 'Organization',
    name: 'AI Ranko',
    url: 'https://airanko.com',
  },
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is a mobile friendliness checker?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A mobile friendliness checker is a tool that previews any website in real mobile, tablet, or desktop screen sizes. It helps you visually inspect how your site looks and behaves on different devices — before your users experience any issues.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is this mobile friendliness checker completely free?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes — 100% free with no hidden charges, no subscription, and no sign-up required. Just enter any URL and get an instant mobile preview, unlimited times.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which devices can I test my website on?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You can test on iPhone SE, iPhone 14, iPhone 14 Pro Max, Samsung Galaxy S23, and Google Pixel 7. Tablet and Desktop previews are also available — plus Portrait and Landscape orientation for each.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does Google use mobile-friendliness as a ranking factor?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Yes — Google has used mobile-first indexing since 2019, meaning it ranks your site based on its mobile version first. A poor mobile experience directly impacts your search rankings, traffic, and conversions.",
      },
    },
    {
      '@type': 'Question',
      name: 'Do I need to install anything to use this tool?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No installation, no browser extension, and no account is needed. The tool runs entirely in your browser — just open the page, enter a URL, and preview instantly.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I test competitor websites with this tool?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Yes — you can test any publicly accessible website, including competitor sites. It's a great way to benchmark your mobile UX against industry competitors.",
      },
    },
    {
      '@type': 'Question',
      name: 'Is my data safe when using this tool?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Your URL is only used to load the preview — no data is stored, tracked, or shared. Ai Ranko is fully privacy-first. Your browsing activity stays completely private.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the difference between Portrait and Landscape mode?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Portrait mode shows the vertical screen view — how most users hold their phone. Landscape mode shows the horizontal view — useful for catching layout breaks that only appear when the screen rotates.',
      },
    },
    {
      '@type': 'Question',
      name: 'What does the zoom control do?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Zoom controls let you scale the preview to 50%, 75%, or 100% of the actual device size. Use it to inspect small text, buttons, and UI elements more closely or get a wider overall view.',
      },
    },
    {
      '@type': 'Question',
      name: "How is Ai Ranko's mobile checker different from Google's Mobile-Friendly Test?",
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Google's tool only gives a pass/fail report — it doesn't show a live visual preview. Ai Ranko gives you a real-time visual preview across multiple specific devices, orientations, and zoom levels — all in one place.",
      },
    },
  ],
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'AI Ranko', item: 'https://airanko.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://airanko.com/#tools' },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'Mobile Friendliness Checker',
      item: 'https://airanko.com/tools/mobile-checker',
    },
  ],
}

export default function MobileCheckerPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Navbar />

      {/* Breadcrumb */}
      <div className="border-b border-border bg-card px-4 py-3 sm:px-6 lg:px-8">
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
          <span className="text-foreground font-medium">Mobile Checker</span>
        </div>
      </div>

      <main className="flex flex-1 flex-col">
        <MobileCheckerTool />
      </main>

      <MobileCheckerSeoSections />

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
            &copy; {new Date().getFullYear()} Ai Ranko. URL previews are loaded on-demand and never stored.
          </p>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/sitemap" className="hover:text-foreground transition-colors">Sitemap</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Contact</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
