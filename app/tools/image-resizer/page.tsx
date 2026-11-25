import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Zap } from 'lucide-react'
import Navbar from '@/components/navbar'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'
import ImageResizerTool from '@/components/image-resizer/image-resizer-tool'
import ImageResizerSeoSections from '@/components/image-resizer-seo-sections'
import { CookieSettingsLink } from '@/components/cookie-consent/cookie-settings-link'

export const metadata: Metadata = {
  title: "Free Image Resizer, Converter & Compressor | Ai Ranko",
  description: "Resize, crop, convert and compress PNG, JPEG, WebP and GIF images free in your browser, with social media size presets and no account needed.",
  keywords: 'image resizer, image converter, resize image online, convert to webp, crop image free',
  alternates: { canonical: 'https://airanko.com/tools/image-resizer' },
  openGraph: {
    title: "Free Image Resizer, Converter & Compressor | Ai Ranko",
    description: "Resize, crop, convert and compress PNG, JPEG, WebP and GIF images free in your browser, with social media size presets and no account needed.",
    url: 'https://airanko.com/tools/image-resizer',
    siteName: 'Ai Ranko',
    images: [
      {
        url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20and%20converter%20tool%20open%20graph-airanko-fRSh9KtchB104ghNi32hTIxcT2OE87.webp',
        width: 1200,
        height: 630,
        alt: 'Free Image Resizer, Converter & Compressor — Ai Ranko',
      },
    ],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Free Image Resizer, Converter & Compressor | Ai Ranko",
    description: "Resize, crop, convert and compress PNG, JPEG, WebP and GIF images free in your browser, with social media size presets and no account needed.",
    images: [
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20and%20converter%20tool%20open%20graph-airanko-fRSh9KtchB104ghNi32hTIxcT2OE87.webp',
    ],
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "@id": "https://airanko.com/tools/image-resizer#app",
  "name": "Free Online Image Resizer, Converter & Compressor",
  "url": "https://airanko.com/tools/image-resizer",
  "description": "Free online image resizer: resize by pixels or percentage, crop with aspect ratio presets, convert to PNG, JPEG or WebP, and adjust JPEG or WebP quality in your browser.",
  "applicationCategory": "MultimediaApplication",
  "operatingSystem": "Any",
  "browserRequirements": "Requires JavaScript. Works in modern browsers.",
  "isAccessibleForFree": true,
  "image": "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20Schema%20image-airanko-rf16nYR2GsUsGxjoa14e9AcOoh9RAJ.webp",
  "featureList": [
    "Resize images by pixels or percentage",
    "Lock aspect ratio when changing pixel dimensions",
    "Crop with preset aspect ratios (1:1, 16:9, 4:3 and more)",
    "Convert to PNG, JPEG or WebP using browser canvas",
    "Adjust JPEG or WebP quality to compare file size and appearance",
    "Social media size presets",
    "Open PNG, JPEG, WebP, GIF or BMP files supported by your browser",
    "Preview and download locally without an account"
  ],
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "provider": {
    "@id": "https://airanko.com/#organization"
  }
}

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": "https://airanko.com/tools/image-resizer#faq",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What does the Ai Ranko image resizer do?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It lets you resize, crop, convert and compress an image in one place. Upload a PNG, JPEG, WebP, GIF or BMP file, choose your options, then download the result. It's a free tool and you don't need an account."
      }
    },
    {
      "@type": "Question",
      "name": "How do I resize an image to exact dimensions?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Upload your image, choose the resize option and enter the width and height you need in pixels. With the aspect-ratio lock on, changing one dimension adjusts the other. Crop to the shape you need first, or unlock the ratio to set both dimensions independently; this can stretch the image. Check the preview, then download the resized file. You can also resize by percentage."
      }
    },
    {
      "@type": "Question",
      "name": "Can I resize an image by percentage?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Instead of entering pixel dimensions you can scale the image by a percentage, for example to halve it for a thumbnail. Percentage resizing keeps the proportions of the original image, or of your completed crop if you have cropped it."
      }
    },
    {
      "@type": "Question",
      "name": "Which image formats can I upload and convert to?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "You can open PNG, JPEG, WebP, GIF and BMP files that your browser can decode. PNG, JPEG and WebP output use your browser's canvas encoder. A GIF option is shown, but the tool has no GIF encoder: an unsupported GIF export falls back to PNG data even if its filename ends in .gif. Animated GIFs are processed as a still image, not preserved as an animation. Use PNG, JPEG or WebP for the output."
      }
    },
    {
      "@type": "Question",
      "name": "Are my images uploaded to a server?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The resizer is built to process images in your browser, so the file is not sent to our servers to be resized. Your browser still needs the page itself to load, and the file only stays on your device. Read our privacy policy for how the site handles data in general."
      }
    },
    {
      "@type": "Question",
      "name": "Should I use JPEG, PNG or WebP?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "JPEG suits photos and keeps file sizes small. PNG suits logos, screenshots and images that need a transparent background. WebP is a modern format that can give smaller files than JPEG or PNG and is supported by current browsers. GIF is mainly useful for simple animation."
      }
    },
    {
      "@type": "Question",
      "name": "Does compressing an image reduce its quality?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It can. The quality control applies to JPEG and WebP, where lower quality can remove detail to make the file smaller. It does not apply to PNG. Compare the result with the original before you download it, and keep the original file in case you need it again. A smaller file is not guaranteed for every image or setting."
      }
    },
    {
      "@type": "Question",
      "name": "How do I resize an image for social media?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Use the social media presets to start from a common size for platforms such as Instagram, Twitter and LinkedIn. Platforms change their recommended dimensions from time to time, so check the platform's current guidance if the exact size matters."
      }
    },
    {
      "@type": "Question",
      "name": "Can resizing images help my website's SEO?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It can help indirectly. Large image files slow pages down, and Google measures loading performance, including the Largest Contentful Paint metric, as part of the page experience (see Google's guide to optimising LCP). Resizing is not a ranking shortcut: descriptive file names, alt text and useful content still matter, as Google's image best practices explain."
      }
    },
    {
      "@type": "Question",
      "name": "Can I resize many images at once?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Use the bulk image resizer to process several images in one go, and read our guide on how to bulk resize images for the steps."
      }
    }
  ]
}

export default function ImageResizerPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <Navbar />
      <BreadcrumbSchema items={[{ name: 'Tools', href: '/#tools' }, { name: 'Image Resizer', href: '/tools/image-resizer' }]} />

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
          <span className="text-foreground font-medium">Image Resizer</span>
        </div>
      </div>

      <main>
        <ImageResizerTool />
      </main>

      <ImageResizerSeoSections />

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
            &copy; {new Date().getFullYear()} Ai Ranko. Your images never leave your device.
          </p>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
            <Link href="/sitemap" className="hover:text-foreground transition-colors">Sitemap</Link>
            <Link href="/privacy-policy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms-and-conditions" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
            <CookieSettingsLink className="hover:text-foreground transition-colors" />
          </nav>
        </div>
      </footer>
    </div>
  )
}
