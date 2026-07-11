import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ChevronRight, Zap, Calendar, Clock, User, Trophy, ArrowRight,
  CheckCircle2, ExternalLink, ArrowUpRight, Quote, ImageIcon, X,
  Star, Award, Sparkles,
} from 'lucide-react'
import Navbar from '@/components/navbar'

const POST = {
  title: 'Top 10 Free Photo Cropping Tools for Bloggers and Marketers (2026)',
  excerpt:
    'We tested and ranked the most popular free image cropping tools on ease of use, aspect ratio presets, privacy, output quality, and extra features. Here\'s the honest list for content creators in 2026.',
  slug: 'top-10-free-photo-cropping-tools',
  date: '2026-07-11',
  dateDisplay: 'July 11, 2026',
  updated: '2026-07-11',
  readingTime: '11 min read',
  author: 'Ai Ranko Editorial Team',
  category: 'Image Tools',
  url: 'https://airanko.com/blog/top-10-free-photo-cropping-tools',
  image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20and%20converter%20tool%20open%20graph-airanko-fRSh9KtchB104ghNi32hTIxcT2OE87.webp',
}

export const metadata: Metadata = {
  title: `${POST.title} | Ai Ranko Blog`,
  description: POST.excerpt,
  keywords:
    'free photo cropping tools, best image cropper 2026, free image crop online, crop image for instagram, crop image for blog, image resizer crop converter, browser based image editor, no upload image crop, online image cropper no signup, free crop tool blogger, image crop for seo',
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
    type: 'article',
    publishedTime: POST.date,
    modifiedTime: POST.updated,
    authors: [POST.author],
    images: [{ url: POST.image, width: 1200, height: 630, alt: POST.title }],
    locale: 'en_US',
    tags: ['Image Tools', 'Photo Editing', 'SEO', 'Content Marketing', 'Free Tools'],
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
  '@type': 'BlogPosting',
  '@id': POST.url,
  headline: POST.title,
  description: POST.excerpt,
  image: {
    '@type': 'ImageObject',
    url: POST.image,
    width: 1200,
    height: 630,
  },
  author: {
    '@type': 'Organization',
    name: 'Ai Ranko Editorial Team',
    url: 'https://airanko.com',
  },
  publisher: {
    '@type': 'Organization',
    name: 'Ai Ranko',
    url: 'https://airanko.com',
    logo: {
      '@type': 'ImageObject',
      url: 'https://airanko.com/images/ai-ranko-logo.webp',
      width: 200,
      height: 60,
    },
  },
  datePublished: POST.date,
  dateModified: POST.updated,
  mainEntityOfPage: { '@type': 'WebPage', '@id': POST.url },
  inLanguage: 'en-US',
  articleSection: POST.category,
  wordCount: 2200,
  isPartOf: {
    '@type': 'Blog',
    '@id': 'https://airanko.com/blog',
    name: 'Ai Ranko Blog',
    publisher: { '@type': 'Organization', name: 'Ai Ranko', url: 'https://airanko.com' },
  },
  about: [
    { '@type': 'Thing', name: 'Image Cropping' },
    { '@type': 'Thing', name: 'Photo Editing Tools' },
    { '@type': 'Thing', name: 'Content Marketing' },
    { '@type': 'Thing', name: 'SEO' },
  ],
  mentions: [
    { '@type': 'WebApplication', name: 'iLoveIMG',   url: 'https://www.iloveimg.com' },
    { '@type': 'WebApplication', name: 'Ai Ranko Image Resizer', url: 'https://airanko.com/tools/image-resizer' },
    { '@type': 'WebApplication', name: 'Canva',       url: 'https://www.canva.com' },
    { '@type': 'WebApplication', name: 'Adobe Express', url: 'https://www.adobe.com/express' },
    { '@type': 'WebApplication', name: 'Fotor',       url: 'https://www.fotor.com' },
    { '@type': 'WebApplication', name: 'Picsart',     url: 'https://picsart.com' },
    { '@type': 'WebApplication', name: 'BeFunky',     url: 'https://www.befunky.com' },
    { '@type': 'WebApplication', name: 'Pixlr',       url: 'https://pixlr.com' },
    { '@type': 'WebApplication', name: 'Img2Go',      url: 'https://www.img2go.com' },
    { '@type': 'WebApplication', name: 'Photopea',    url: 'https://www.photopea.com' },
  ],
  speakable: {
    '@type': 'SpeakableSpecification',
    cssSelector: ['h1', 'h2', '#final p', '#how-to-choose p'],
  },
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
  description: 'The 10 best free photo cropping tools for bloggers and marketers in 2026, ranked by ease of use, privacy, output quality, and extra features.',
  numberOfItems: 10,
  url: POST.url,
  itemListElement: [
    { '@type': 'ListItem', position: 1,  name: 'iLoveIMG',                           item: { '@type': 'WebApplication', name: 'iLoveIMG',             url: 'https://www.iloveimg.com',                  description: 'Fast and beginner-friendly batch image cropping tool.' } },
    { '@type': 'ListItem', position: 2,  name: 'Ai Ranko Image Resizer',              item: { '@type': 'WebApplication', name: 'Ai Ranko Image Resizer', url: 'https://airanko.com/tools/image-resizer',  description: '100% browser-based image resizer, cropper, converter and compressor with no upload required.' } },
    { '@type': 'ListItem', position: 3,  name: 'Canva',                               item: { '@type': 'WebApplication', name: 'Canva',                 url: 'https://www.canva.com',                     description: 'Design platform with smart crop and template library.' } },
    { '@type': 'ListItem', position: 4,  name: 'Adobe Express',                       item: { '@type': 'WebApplication', name: 'Adobe Express',         url: 'https://www.adobe.com/express',             description: 'Adobe-powered image editor with custom-shape cropping.' } },
    { '@type': 'ListItem', position: 5,  name: 'Fotor',                               item: { '@type': 'WebApplication', name: 'Fotor',                 url: 'https://www.fotor.com',                     description: 'Creative cropping tool with non-standard shapes and quick effects.' } },
    { '@type': 'ListItem', position: 6,  name: 'Picsart',                             item: { '@type': 'WebApplication', name: 'Picsart',               url: 'https://picsart.com',                       description: 'Social-first image editor with extensive template library.' } },
    { '@type': 'ListItem', position: 7,  name: 'BeFunky',                             item: { '@type': 'WebApplication', name: 'BeFunky',               url: 'https://www.befunky.com',                   description: 'Photo editor with composition presets and Golden Ratio crop.' } },
    { '@type': 'ListItem', position: 8,  name: 'Pixlr',                               item: { '@type': 'WebApplication', name: 'Pixlr',                 url: 'https://pixlr.com',                         description: 'Photoshop-like browser editor with layer and mask support.' } },
    { '@type': 'ListItem', position: 9,  name: 'Img2Go',                              item: { '@type': 'WebApplication', name: 'Img2Go',                url: 'https://www.img2go.com',                    description: 'Multi-format image editor supporting cloud storage and URL uploads.' } },
    { '@type': 'ListItem', position: 10, name: 'Photopea',                            item: { '@type': 'WebApplication', name: 'Photopea',              url: 'https://www.photopea.com',                  description: 'Professional-grade browser editor with PSD file support.' } },
  ],
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Does cropping an image reduce its quality?',
      acceptedAnswer: { '@type': 'Answer', text: 'No — cropping itself doesn\'t degrade quality, since you\'re only removing pixels outside the selected area. Quality loss typically happens when you enlarge a cropped image beyond its original resolution, so it\'s best to crop before resizing up, not after.' },
    },
    {
      '@type': 'Question',
      name: 'What\'s the best aspect ratio for blog featured images?',
      acceptedAnswer: { '@type': 'Answer', text: 'Most WordPress and CMS themes render best with a 16:9 or 1.91:1 ratio for featured images, since these match the dimensions used by Facebook, LinkedIn, and Google\'s rich preview cards.' },
    },
    {
      '@type': 'Question',
      name: 'Should I crop before or after compressing an image?',
      acceptedAnswer: { '@type': 'Answer', text: 'Crop first, then compress. Cropping removes pixels, which naturally reduces file size — compressing afterward gets you a smaller, cleaner file without wasting processing on parts of the image you\'re about to delete.' },
    },
    {
      '@type': 'Question',
      name: 'Are browser-based cropping tools actually private?',
      acceptedAnswer: { '@type': 'Answer', text: 'Genuinely browser-based tools (where processing happens via JavaScript on your device) never send your image to a server, so yes — those are private by design. Always check whether a tool says "no upload required" versus one that silently uploads your file in the background.' },
    },
  ],
}

const howToJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Choose the Right Free Photo Cropping Tool',
  description: 'A guide to picking the best free image cropping tool based on your workflow and privacy needs.',
  step: [
    {
      '@type': 'HowToStep',
      position: 1,
      name: 'Identify how often you crop',
      text: 'If you only crop occasionally and want zero learning curve, iLoveIMG or Fotor will get the job done fast.',
    },
    {
      '@type': 'HowToStep',
      position: 2,
      name: 'Assess your privacy requirements',
      text: 'If you handle client images, product photography, or anything sensitive, prioritize a browser-based tool like Ai Ranko that never uploads your files to a server.',
    },
    {
      '@type': 'HowToStep',
      position: 3,
      name: 'Consider your design needs',
      text: 'If you are building full social media graphics with text and branding, Canva or Picsart\'s template libraries will save you more time than a standalone cropper.',
    },
    {
      '@type': 'HowToStep',
      position: 4,
      name: 'Check for all-in-one features',
      text: 'If you need to crop and immediately optimize for page speed and SEO, look for a tool that combines cropping with resizing, compression, and WebP conversion in one step.',
    },
  ],
}

const aiRankoToolJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  '@id': 'https://airanko.com/tools/image-resizer',
  name: 'Ai Ranko Image Resizer, Cropper & Converter',
  applicationCategory: 'MultimediaApplication',
  applicationSubCategory: 'Image Editing',
  operatingSystem: 'Any (browser-based)',
  url: 'https://airanko.com/tools/image-resizer',
  description: '100% browser-based image resizer, cropper, converter and compressor. Crop, resize to custom dimensions, convert to WebP, and compress — all in one tab. No upload, no signup, no limits.',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  featureList: [
    '100% browser-based — images never leave your device',
    'Crop with social media aspect ratio presets (1:1, 16:9, 4:3)',
    'Resize to custom pixel dimensions',
    'Convert to WebP, JPEG, or PNG',
    'Compress images without quality loss',
    'No signup, no watermark, no daily limits',
  ],
  publisher: {
    '@type': 'Organization',
    name: 'Ai Ranko',
    url: 'https://airanko.com',
    logo: { '@type': 'ImageObject', url: 'https://airanko.com/images/ai-ranko-logo.webp' },
  },
  isAccessibleForFree: true,
  browserRequirements: 'Requires a modern web browser with JavaScript enabled',
}

// ── Tool data ─────────────────────────────────────────────────────────────────

type Tool = {
  rank: number
  name: string
  url: string
  bestFor: string
  pros: string[]
  cons: string[]
  isAiRanko?: boolean
  verdict?: string
}

const tools: Tool[] = [
  {
    rank: 1,
    name: 'iLoveIMG',
    url: 'https://www.iloveimg.com',
    bestFor: 'Simplicity and batch cropping',
    pros: [
      'Extremely fast and beginner-friendly',
      'No watermarks on the free plan',
      'Works well on mobile browsers',
    ],
    cons: [
      'Images are uploaded to iLoveIMG\'s servers (privacy concern)',
      'Limited aspect ratio presets compared to marketing-focused tools',
      'No built-in compression or format conversion in the crop tool itself',
    ],
  },
  {
    rank: 2,
    name: 'Ai Ranko — Image Resizer, Cropper & Converter',
    url: 'https://airanko.com/tools/image-resizer',
    bestFor: 'All-in-one image prep with full privacy — resize, crop, convert, and compress in one tool',
    isAiRanko: true,
    pros: [
      '100% browser-based — no image ever leaves your device',
      'Crop, resize, convert, and compress in one tool (no app-switching)',
      'Built-in social media aspect ratio presets (1:1, 16:9, 4:3, and more)',
      'No signup, no watermark, no daily limits',
      'WebP conversion built in, which directly helps page speed and SEO',
    ],
    cons: [
      'Newer to the market than legacy players like Canva or Adobe',
      'Browser-based only — no dedicated desktop application',
    ],
    verdict:
      'If you want a single tool that handles the entire image-prep pipeline — not just cropping — while keeping your files completely private, Ai Ranko\'s Image Resizer is the most efficient option on this list for bloggers and marketers working at speed.',
  },
  {
    rank: 3,
    name: 'Canva',
    url: 'https://www.canva.com',
    bestFor: 'Marketers who also need design templates',
    pros: [
      'Deep integration with templates, fonts, and design assets',
      'Smart Crop for automatic composition suggestions',
      'Strong brand-kit features for teams',
    ],
    cons: [
      'Best features (brand kits, premium templates) sit behind a paywall',
      'Heavier interface than a dedicated crop tool — overkill for a quick crop',
      'Requires an account to save or export in some cases',
    ],
  },
  {
    rank: 4,
    name: 'Adobe Express',
    url: 'https://www.adobe.com/express',
    bestFor: 'Users already inside the Adobe ecosystem',
    pros: [
      'Reliable, high-quality output backed by Adobe\'s imaging engine',
      'Good template library for social and print formats',
      'Circle, star, and custom-shape cropping',
    ],
    cons: [
      'Some advanced features require an Adobe account or subscription',
      'Interface can feel less intuitive to first-time users',
      'Slower load times compared to lightweight dedicated tools',
    ],
  },
  {
    rank: 5,
    name: 'Fotor',
    url: 'https://www.fotor.com',
    bestFor: 'Creative crop shapes and quick effects',
    pros: [
      'Fun, non-standard crop shapes for creative campaigns',
      'Batch and individual editing supported',
      'Reasonably fast processing',
    ],
    cons: [
      'Lacks advanced format-export options',
      'Some features are gated behind a premium tier',
      'Interface includes upsell prompts that can slow down the workflow',
    ],
  },
  {
    rank: 6,
    name: 'Picsart',
    url: 'https://picsart.com',
    bestFor: 'Social-first content creators',
    pros: [
      'Extensive social media template library',
      'No visible quality loss after cropping',
      'Large creative asset library (stickers, effects)',
    ],
    cons: [
      'Interface can feel cluttered for users who only need a simple crop',
      'Many advanced tools require a Picsart Gold subscription',
      'Mobile app pushes upgrade prompts frequently',
    ],
  },
  {
    rank: 7,
    name: 'BeFunky',
    url: 'https://www.befunky.com',
    bestFor: 'Photo editors who crop as part of a bigger workflow',
    pros: [
      'Golden Ratio and composition-focused presets',
      'Drag-and-drop interface with layer support',
      'Useful for both casual and semi-professional editing',
    ],
    cons: [
      'Many advanced touch-up and filter tools are locked behind a paid plan',
      'No content-aware or AI-assisted cropping',
      'Steeper learning curve than single-purpose crop tools',
    ],
  },
  {
    rank: 8,
    name: 'Pixlr',
    url: 'https://pixlr.com',
    bestFor: 'Users who want a Photoshop-like interface for free',
    pros: [
      'Layer and mask support for more advanced edits',
      'Customizable interface',
      'Works across desktop and mobile browsers',
    ],
    cons: [
      'Free version can run slowly on larger images',
      'Export options are limited without a paid plan',
      'More complex than necessary for a simple crop-and-go workflow',
    ],
  },
  {
    rank: 9,
    name: 'Img2Go',
    url: 'https://www.img2go.com',
    bestFor: 'Multi-format flexibility with cloud storage uploads',
    pros: [
      'Multiple upload methods, including cloud storage and URL import',
      'Combines cropping with watermarking and rotation',
      'Works across devices',
    ],
    cons: [
      'Processing can be slow on the free tier',
      'Interface feels dated compared to newer competitors',
      'Limited export formats without upgrading',
    ],
  },
  {
    rank: 10,
    name: 'Photopea',
    url: 'https://www.photopea.com',
    bestFor: 'Power users who want Photoshop-grade precision for free',
    pros: [
      'Genuine PSD file support — rare among free tools',
      'Extremely precise, professional-grade crop and selection tools',
      'No account required to start editing',
    ],
    cons: [
      'Steep learning curve for non-designers',
      'Interface is dense and can be intimidating for beginners',
      'Overkill for simple, one-off crops',
    ],
  },
]

const comparisonRows = [
  { name: 'iLoveIMG',                   bestFor: 'Simplicity & batch crops',        privacy: 'No',       allInOne: 'No',       freeLimits: 'Watermark-free, but files upload to server' },
  { name: 'Ai Ranko',                   bestFor: 'All-in-one, private editing',      privacy: 'Yes ✓',    allInOne: 'Yes ✓',    freeLimits: 'No watermark, no signup, no limits', isAiRanko: true },
  { name: 'Canva',                       bestFor: 'Design + templates',               privacy: 'No',       allInOne: 'Partial',  freeLimits: 'Premium features paywalled' },
  { name: 'Adobe Express',               bestFor: 'Adobe ecosystem users',            privacy: 'No',       allInOne: 'Partial',  freeLimits: 'Some features need account' },
  { name: 'Fotor',                       bestFor: 'Creative shapes',                  privacy: 'No',       allInOne: 'Partial',  freeLimits: 'Upsells on premium tools' },
  { name: 'Picsart',                     bestFor: 'Social-first creators',            privacy: 'No',       allInOne: 'Partial',  freeLimits: 'Gold tier for advanced tools' },
  { name: 'BeFunky',                     bestFor: 'Photo editing + crop',             privacy: 'No',       allInOne: 'Partial',  freeLimits: 'Touch-up tools paywalled' },
  { name: 'Pixlr',                       bestFor: 'Photoshop-like editing',           privacy: 'Partial',  allInOne: 'Partial',  freeLimits: 'Slower on free tier' },
  { name: 'Img2Go',                      bestFor: 'Cloud/URL uploads',               privacy: 'No',       allInOne: 'Partial',  freeLimits: 'Slower processing on free tier' },
  { name: 'Photopea',                    bestFor: 'PSD/professional editing',         privacy: 'Partial',  allInOne: 'No',       freeLimits: 'Steep learning curve' },
]

export default function PhotoCroppingToolsBlogPost() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aiRankoToolJsonLd) }} />
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
          <span className="truncate font-medium text-foreground">Top 10 Free Photo Cropping Tools</span>
        </div>
      </div>

      <article className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">

          {/* Header */}
          <header className="mb-12">
            <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-primary/10 px-2.5 py-1 font-medium text-primary">{POST.category}</span>
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
              If you publish content for a living — whether that&rsquo;s blog posts, Instagram carousels, YouTube thumbnails, or product listings — you already know that a badly framed image can undo hours of good writing. A crooked crop, the wrong aspect ratio, or a subject cut off mid-face is enough to make readers scroll past instead of clicking in.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              The good news: you don&rsquo;t need Photoshop or a design degree to fix this. We tested and researched the most popular options on the market in 2026 and ranked them on five criteria that matter most to content creators.
            </p>
          </header>

          {/* Ranking criteria */}
          <div className="mb-10 rounded-2xl border border-border bg-card p-5 sm:p-6">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">How we ranked them</p>
            <ul className="space-y-2.5">
              {[
                ['Ease of use',         'Can you get a clean crop in under a minute?'],
                ['Aspect ratio presets','Does it include ready-made sizes for Instagram, YouTube, Facebook, etc.?'],
                ['Privacy',             'Does the tool process images in your browser, or upload them to a server?'],
                ['Output quality',      'Does cropping degrade resolution or add watermarks?'],
                ['Extra features',      'Resizing, format conversion, and compression — since most marketers need more than just a crop.'],
              ].map(([label, desc]) => (
                <li key={label as string} className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span><strong className="text-foreground">{label}</strong> — <span className="text-muted-foreground">{desc}</span></span>
                </li>
              ))}
            </ul>
          </div>

          {/* TOC */}
          <nav className="mb-12 rounded-2xl border border-border bg-card p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Table of contents</p>
            <ol className="space-y-1.5 text-sm">
              {[
                ['tool-1',      '#1 iLoveIMG'],
                ['tool-2',      '#2 Ai Ranko — Image Resizer, Cropper & Converter'],
                ['tools-3-10',  '#3–#10 Canva, Adobe Express, Fotor, Picsart, BeFunky, Pixlr, Img2Go, Photopea'],
                ['comparison',  'Quick Comparison Table'],
                ['how-to-choose','How to Choose the Right Tool'],
                ['faq',         'Frequently Asked Questions'],
                ['final',       'Final Thoughts'],
              ].map(([id, label]) => (
                <li key={id as string}>
                  <a href={`#${id}`} className="text-foreground transition-colors hover:text-primary">{label as string}</a>
                </li>
              ))}
            </ol>
          </nav>

          {/* Tool #1 — iLoveIMG */}
          <section id="tool-1" className="mb-10">
            <ToolCard tool={tools[0]} />
          </section>

          {/* Tool #2 — Ai Ranko Spotlight */}
          <section id="tool-2" className="mb-10">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/80 to-primary shadow-md text-primary-foreground">
                <Trophy className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">Editor&rsquo;s Pick — Most Versatile</span>
            </div>

            <div className="rounded-3xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-transparent to-transparent p-6 sm:p-8">
              <div className="mb-1 text-xs font-mono font-semibold text-primary">#2</div>
              <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">
                Ai Ranko — Image Resizer, Cropper &amp; Converter
              </h2>
              <p className="mt-1 text-sm font-medium text-primary">Best for: All-in-one image prep with full privacy</p>

              <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <Quote className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                  <p className="text-sm leading-relaxed text-foreground italic">
                    &ldquo;Bloggers and marketers rarely need <em>just</em> a crop. In practice, you also need to resize the image for your CMS, convert it to WebP for page speed, and shrink the file size before it ever touches your website — and Ai Ranko does all four in a single browser tab.&rdquo;
                  </p>
                </div>
              </div>

              <p className="mt-5 leading-relaxed text-foreground">
                <Link href="/tools/image-resizer" className="font-semibold text-primary hover:underline">Ai Ranko&rsquo;s Image Resizer</Link> earns its spot here because it solves a problem most dedicated cropping tools ignore.
                What sets it apart is that it runs entirely client-side. Your images are cropped and processed directly in your browser and never uploaded to a server, which matters if you&rsquo;re working with client photography, product shots under NDA, or personal images you&rsquo;d rather keep private. For agencies and freelancers handling client media, that&rsquo;s a real differentiator most competitors on this list can&rsquo;t match.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {[
                  { icon: Star,     title: '100% browser-based',         desc: 'Images never leave your device. No upload, no account.' },
                  { icon: Award,    title: 'Social media presets',        desc: '1:1, 16:9, 4:3, and more — all baked in.' },
                  { icon: Sparkles, title: 'Crop + resize + WebP + compress', desc: 'Four tools in one tab. No switching apps.' },
                ].map((f) => (
                  <div key={f.title} className="rounded-2xl border border-border bg-card p-4">
                    <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <f.icon className="h-4 w-4" />
                    </div>
                    <h3 className="font-heading text-sm font-bold text-foreground">{f.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{f.desc}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Pros</p>
                  <ul className="space-y-1.5">
                    {tools[1].pros.map((p) => (
                      <li key={p} className="flex items-start gap-2 text-sm text-foreground">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Cons</p>
                  <ul className="space-y-1.5">
                    {tools[1].cons.map((c) => (
                      <li key={c} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
                <p className="text-sm leading-relaxed text-foreground">
                  <strong>Verdict:</strong> {tools[1].verdict}
                </p>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href="/tools/image-resizer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Try the Image Resizer Free <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/tools/bulk-image-resizer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  Try Bulk Image Resizer <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </section>

          {/* Tools #3–#10 */}
          <section id="tools-3-10">
            <h2 className="mb-6 font-heading text-2xl font-bold tracking-tight text-foreground">#3–#10: The Rest of the Field</h2>
            <p className="mb-8 leading-relaxed text-muted-foreground">
              Each of the following tools excels at something specific. Depending on your workflow, one of them might fit you better than anything above.
            </p>
            <div className="space-y-6">
              {tools.slice(2).map((tool) => (
                <ToolCard key={tool.rank} tool={tool} />
              ))}
            </div>
          </section>

          {/* Comparison table */}
          <section id="comparison" className="mt-16">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">Quick Comparison Table</h2>
            <p className="mt-2 leading-relaxed text-muted-foreground">All 10 tools side-by-side across the five criteria that matter most.</p>
            <div className="mt-6 overflow-x-auto rounded-2xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tool</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Best For</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Browser-Based</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">All-in-One</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Free Plan Limits</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, i) => (
                    <tr
                      key={row.name}
                      className={`border-b border-border last:border-0 ${row.isAiRanko ? 'bg-primary/5' : i % 2 === 0 ? '' : 'bg-muted/20'}`}
                    >
                      <td className={`px-4 py-3 font-semibold ${row.isAiRanko ? 'text-primary' : 'text-foreground'}`}>
                        {row.isAiRanko ? <Link href="/tools/image-resizer" className="hover:underline">{row.name}</Link> : row.name}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{row.bestFor}</td>
                      <td className={`px-4 py-3 text-center font-medium ${row.privacy === 'Yes ✓' ? 'text-emerald-600' : row.privacy === 'Partial' ? 'text-amber-600' : 'text-muted-foreground'}`}>
                        {row.privacy}
                      </td>
                      <td className={`px-4 py-3 text-center font-medium ${row.allInOne === 'Yes ✓' ? 'text-emerald-600' : row.allInOne === 'Partial' ? 'text-amber-600' : 'text-muted-foreground'}`}>
                        {row.allInOne}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{row.freeLimits}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* How to choose */}
          <section id="how-to-choose" className="mt-16">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">How to Choose the Right Cropping Tool for Your Workflow</h2>
            <div className="mt-6 space-y-3">
              {[
                {
                  scenario: 'You only crop occasionally and want zero learning curve',
                  answer: 'iLoveIMG or Fotor will get the job done fast.',
                },
                {
                  scenario: 'You handle client images, product photography, or anything sensitive',
                  answer: 'Prioritize a browser-based tool like Ai Ranko that never uploads your files to a server.',
                },
                {
                  scenario: 'You\'re building full social media graphics with text and branding',
                  answer: 'Canva or Picsart\'s template libraries will save you more time than a standalone cropper.',
                },
                {
                  scenario: 'You need to crop and immediately optimize for page speed and SEO',
                  answer: 'Look for a tool that combines cropping with resizing, compression, and WebP conversion in one step — rather than juggling three separate apps.',
                },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{i + 1}</span>
                  <div>
                    <p className="font-heading text-sm font-semibold text-foreground">{item.scenario}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" className="mt-16">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">Frequently Asked Questions</h2>
            <div className="mt-6 space-y-3">
              {[
                {
                  q: 'Does cropping an image reduce its quality?',
                  a: 'No — cropping itself doesn\'t degrade quality, since you\'re only removing pixels outside the selected area. Quality loss typically happens when you enlarge a cropped image beyond its original resolution, so it\'s best to crop before resizing up, not after.',
                },
                {
                  q: 'What\'s the best aspect ratio for blog featured images?',
                  a: 'Most WordPress and CMS themes render best with a 16:9 or 1.91:1 ratio for featured images, since these match the dimensions used by Facebook, LinkedIn, and Google\'s rich preview cards.',
                },
                {
                  q: 'Should I crop before or after compressing an image?',
                  a: 'Crop first, then compress. Cropping removes pixels, which naturally reduces file size — compressing afterward gets you a smaller, cleaner file without wasting processing on parts of the image you\'re about to delete.',
                },
                {
                  q: 'Are browser-based cropping tools actually private?',
                  a: 'Genuinely browser-based tools (where processing happens via JavaScript on your device) never send your image to a server — those are private by design. Always check whether a tool says "no upload required" versus one that silently uploads your file in the background.',
                },
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

          {/* Final thoughts */}
          <section id="final" className="mt-16">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">Final Thoughts</h2>
            <p className="mt-3 leading-relaxed text-foreground">
              Every tool on this list can crop an image — the differences show up in speed, privacy, and how much extra work you have to do afterward. For bloggers and marketers juggling dozens of images a week, a single tool that crops, resizes, converts, and compresses without uploading your files anywhere isn&rsquo;t just convenient — it&rsquo;s the difference between a five-minute task and a twenty-minute one.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              The best tool is the one that fits your actual workflow. If you only crop occasionally, keep it simple with iLoveIMG or Fotor. If you&rsquo;re working at volume or handling client assets, a browser-based all-in-one like Ai Ranko will save you time on every image, every week.
            </p>
          </section>

          {/* Author */}
          <div className="mt-16 flex items-center gap-4 rounded-3xl border border-border bg-card p-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <User className="h-5 w-5" />
            </div>
            <div>
              <p className="font-heading text-sm font-bold text-foreground">Written by the Ai Ranko Editorial Team</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                We build free, AI-powered SEO and image tools — and write about the practices we use every day. Every tool in this article was tested hands-on.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-10 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-6 sm:p-8">
            <h2 className="font-heading text-xl font-bold text-foreground">Ready to see the difference?</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Try Ai Ranko&rsquo;s free Image Resizer, Cropper &amp; Converter — crop, resize, convert to WebP, and compress, all in one browser tab. No upload, no account, no limits.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/tools/image-resizer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Try Free Image Resizer &amp; Cropper <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/tools/bulk-image-resizer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Try Bulk Image Resizer <ArrowRight className="h-3.5 w-3.5" />
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
          </nav>
        </div>
      </footer>
    </div>
  )
}

// ── Tool card component ───────────────────────────────────────────────────────

function ToolCard({ tool }: { tool: Tool }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6 sm:p-7">
      <div className="flex flex-wrap items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-muted">
          <span className="font-heading text-xl font-bold text-foreground tabular-nums">#{tool.rank}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-heading text-xl font-bold text-foreground">{tool.name}</h2>
            <a href={tool.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
          <p className="mt-0.5 text-sm text-primary font-medium">Best for: {tool.bestFor}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Pros</p>
          <ul className="space-y-1.5">
            {tool.pros.map((p) => (
              <li key={p} className="flex items-start gap-2 text-sm text-foreground">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Cons</p>
          <ul className="space-y-1.5">
            {tool.cons.map((c) => (
              <li key={c} className="flex items-start gap-2 text-sm text-muted-foreground">
                <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
