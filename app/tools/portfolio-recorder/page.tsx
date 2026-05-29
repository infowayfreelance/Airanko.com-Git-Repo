import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Zap } from 'lucide-react'
import Navbar from '@/components/navbar'
import PortfolioRecorderTool from '@/components/portfolio-recorder/portfolio-recorder-tool'
import PortfolioRecorderSeoSections from '@/components/portfolio-recorder-seo-sections'

export const metadata: Metadata = {
  title: 'Free Website Portfolio Video Recorder — Turn Any URL Into a Demo Video | AI Ranko',
  description:
    'Record a smooth scrolling video of any website or web app in desktop, tablet, or mobile view. Choose a 10–60s duration, no signup, no watermark. Free browser-based portfolio video maker.',
  keywords:
    'website portfolio video recorder, website screen recorder online, url to video, website demo video maker, web app demo video, scrolling website video, portfolio video generator, record website video free',
  alternates: {
    canonical: 'https://airanko.com/tools/portfolio-recorder',
  },
  openGraph: {
    title: 'Free Website Portfolio Video Recorder — Turn Any URL Into a Demo Video | AI Ranko',
    description:
      'Record a smooth scrolling video of any website or web app in desktop, tablet, or mobile view. Choose a 10–60s duration, no signup, no watermark.',
    url: 'https://airanko.com/tools/portfolio-recorder',
    siteName: 'AI Ranko',
    images: [
      {
        url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20and%20converter%20tool%20open%20graph-airanko-fRSh9KtchB104ghNi32hTIxcT2OE87.webp',
        width: 1200,
        height: 630,
        alt: 'Free Website Portfolio Video Recorder — AI Ranko',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Website Portfolio Video Recorder — Turn Any URL Into a Demo Video | AI Ranko',
    description:
      'Record a smooth scrolling video of any website or web app in desktop, tablet, or mobile view. Choose a 10–60s duration, no signup, no watermark.',
    images: [
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20and%20converter%20tool%20open%20graph-airanko-fRSh9KtchB104ghNi32hTIxcT2OE87.webp',
    ],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Free Website Portfolio Video Recorder',
  description:
    'Turn any website URL into a smooth scrolling demo video. Record in desktop, tablet, or mobile view with a custom 10–60 second duration. Free, browser-based, no watermark.',
  url: 'https://airanko.com/tools/portfolio-recorder',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'All',
  browserRequirements: 'Requires a Chromium-based browser with screen capture support.',
  featureList: [
    'Record any website or web app from a URL',
    'Desktop, tablet, and mobile device frames',
    'Custom video duration from 10 to 60 seconds',
    'Smooth eased or constant-speed auto-scroll',
    'Adjustable scroll depth',
    'Instant WebM video download',
    'No watermark, no signup, runs in your browser',
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
      name: 'What is a website portfolio video recorder?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "It's a tool that turns any website URL into a smooth, scrolling demo video. Instead of manually scrolling and screen-recording, you paste a link, choose a device view and duration, and the tool auto-scrolls the page while capturing a clean clip — perfect for portfolios, case studies, and social posts.",
      },
    },
    {
      '@type': 'Question',
      name: 'Is this tool free? Do I need to sign up?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Yes, it's completely free with no signup, no watermark, and no limits. Everything runs in your browser — your URL and recording never get uploaded to our servers.",
      },
    },
    {
      '@type': 'Question',
      name: 'How long can my video be?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You can record any duration between 10 and 60 seconds. Use the slider or the quick presets (10s, 15s, 30s, 45s, 60s). The scroll speed automatically adapts so the full page fits your chosen length.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I record in mobile and desktop views?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Choose Desktop (1280×720), Tablet, or Mobile (390px) and the site loads inside that exact device frame. It is the easiest way to showcase a responsive design.',
      },
    },
    {
      '@type': 'Question',
      name: 'Why does it ask to share my screen or tab?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Browsers only allow recording external website content through the native screen-capture permission. When prompted, choose "This Tab" and allow sharing — the tool then auto-scrolls and stops on its own, so you don\'t touch anything during the recording.',
      },
    },
    {
      '@type': 'Question',
      name: 'What video format do I get?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You get a high-bitrate WebM file (VP9 where supported), which plays in modern browsers and can be converted to MP4 with any free converter if a client needs it.',
      },
    },
    {
      '@type': 'Question',
      name: "Some websites won't load in the preview — why?",
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A few sites send X-Frame-Options or Content-Security-Policy headers that block embedding. For those, try a staging link or your own deployment. Most marketing sites, portfolios, and web apps embed fine.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does the recording include sound?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No — this tool captures a clean, silent visual scroll of your site. You can add a voiceover or music afterward in any video editor if you would like.',
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
      name: 'Portfolio Video Recorder',
      item: 'https://airanko.com/tools/portfolio-recorder',
    },
  ],
}

export default function PortfolioRecorderPage() {
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
          <span className="text-foreground font-medium">Portfolio Video Recorder</span>
        </div>
      </div>

      <main>
        <PortfolioRecorderTool />
      </main>

      <PortfolioRecorderSeoSections />

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
            &copy; {new Date().getFullYear()} Ai Ranko. Recordings are created in your browser and never uploaded.
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
