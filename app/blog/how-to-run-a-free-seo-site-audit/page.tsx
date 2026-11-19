import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight, Zap, Calendar, Clock, User } from 'lucide-react'
import Navbar from '@/components/navbar'
import { CookieSettingsLink } from '@/components/cookie-consent/cookie-settings-link'

const POST = {
  title: 'How to Run a Free SEO Site Audit in 5 Minutes (Step by Step)',
  excerpt:
    'A practical free SEO site audit: what to check in Search Console, how to crawl key pages, and how to use a free site audit tool without hype.',
  slug: 'how-to-run-a-free-seo-site-audit',
  date: '2026-11-20',
  dateDisplay: 'November 20, 2026',
  updated: '2026-11-20',
  readingTime: '10 min read',
  author: 'Junaid Mazhar',
  category: 'SEO',
  url: 'https://airanko.com/blog/how-to-run-a-free-seo-site-audit',
  image:
    '/blog/how-to-run-a-free-seo-site-audit/how-to-run-a-free-seo-site-audit-featured.webp',
}

export const metadata: Metadata = {
  title: 'How to Run a Free SEO Site Audit (Step by Step) | Ai Ranko Blog',
  description: POST.excerpt,
  authors: [{ name: POST.author }],
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
    tags: ['SEO', 'Site Audit', 'Technical SEO'],
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
    url: `https://airanko.com${POST.image}`,
    width: 1200,
    height: 630,
  },
  author: { '@type': 'Person', name: POST.author },
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
  isPartOf: {
    '@type': 'Blog',
    '@id': 'https://airanko.com/blog',
    name: 'Ai Ranko Blog',
    publisher: {
      '@type': 'Organization',
      name: 'Ai Ranko',
      url: 'https://airanko.com',
    },
  },
  about: [{ '@type': 'Thing', name: 'SEO site audit' }],
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Ai Ranko',
      item: 'https://airanko.com',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Blog',
      item: 'https://airanko.com/blog',
    },
    { '@type': 'ListItem', position: 3, name: POST.title, item: POST.url },
  ],
}

const faqs = [
  {
    q: '1. What is a website SEO audit?',
    a: 'A website SEO audit reviews technical, indexing, on-page, mobile and performance issues. It helps identify improvements that could make your website easier for search engines to access and visitors to use.',
  },
  {
    q: '2. Can I run a site audit for free?',
    a: 'Yes. Free browser-based tools such as Ai Ranko Site Audit can identify common website issues. Google Search Console and PageSpeed Insights also provide useful indexing and performance information without requiring a paid subscription.',
  },
  {
    q: '3. Do I need Google Search Console to audit my site?',
    a: "No. You can run an initial website audit without Search Console. However, it provides important information about Google's indexing and search performance. Using both gives you a more complete understanding than relying on an automated audit alone.",
  },
  {
    q: '4. How many pages should I audit first?',
    a: "Start with your homepage and a few important pages, such as service pages, product pages or popular articles. Ai Ranko's free Site Audit can crawl up to 15 pages. Larger websites may need a full-site crawler for wider coverage.",
  },
  {
    q: '5. Is a site audit the same as a speed test?',
    a: 'No. A site audit reviews several areas, including technical SEO, metadata and accessibility. A speed test focuses mainly on loading performance. PageSpeed Insights is a useful free option for checking website speed.',
  },
  {
    q: '6. How often should I re-run a site audit?',
    a: 'Run another audit after major website changes, such as redesigns, migrations, URL updates or significant content changes. You can also schedule regular reviews based on how frequently your website changes.',
  },
  {
    q: '7. What should I fix first after an audit?',
    a: 'Start with problems that prevent important pages from being accessed or indexed. Next, address broken links, missing metadata, mobile usability and performance issues. Leave minor formatting improvements until the more important problems are resolved.',
  },
]
const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
}

export default function FreeSeoSiteAuditBlogPost() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Navbar />
      {/* Breadcrumb */}
      <div className="border-b border-border bg-card px-4 py-3 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-4xl items-center gap-1.5 text-sm text-muted-foreground">
          <Link
            href="/"
            className="flex items-center gap-1.5 transition-colors hover:text-foreground"
          >
            <Zap className="h-3.5 w-3.5 text-primary" />
            Ai Ranko
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link
            href="/blog"
            className="transition-colors hover:text-foreground"
          >
            Blog
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="truncate font-medium text-foreground">
            {POST.title}
          </span>
        </div>
      </div>

      <article className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <header className="mb-8">
            <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-primary/10 px-2.5 py-1 font-medium text-primary">
                {POST.category}
              </span>
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

            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'Your website might look professional and work perfectly for visitors, but that does not mean everything is working well behind the scenes. Important pages could be missing from Google, page titles might be duplicated, links may lead to errors, or mobile pages could be slow. These problems are not always easy to notice when you simply browse your website.'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                "A free SEO site audit helps you identify issues that could affect your website's visibility and user experience. You do not need expensive software to get started. Several free tools can help you check technical SEO, indexing, page information, mobile usability and performance."
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                "In this guide, you will learn how to run a free SEO site audit in five minutes using Ai Ranko, investigate important problems with Google's tools and turn your findings into a practical improvement plan."
              }
            </p>
          </header>
          <Image
            src={POST.image}
            alt="Laptop showing a website audit dashboard on a clean desk"
            width={1200}
            height={630}
            priority
            className="mb-12 mt-8 w-full rounded-3xl border border-border object-cover"
          />
          <section className="mb-14">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">
              {'What a Site Audit Is and What It Cannot Tell You'}
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'A website SEO audit is a review of your website that helps identify problems affecting its visibility, accessibility and user experience. A typical audit examines several areas:'
              }
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
              <li>
                <strong className="text-foreground">{'Technical SEO:'}</strong>
                {
                  ' Whether search engines can access important pages and follow links.'
                }
              </li>
              <li>
                <strong className="text-foreground">{'On-page SEO:'}</strong>
                {
                  ' Whether pages have useful titles, meta descriptions and headings.'
                }
              </li>
              <li>
                <strong className="text-foreground">{'Indexing:'}</strong>
                {' Whether important pages can appear in search results.'}
              </li>
              <li>
                <strong className="text-foreground">
                  {'Mobile usability:'}
                </strong>
                {' Whether your website works properly on smaller screens.'}
              </li>
              <li>
                <strong className="text-foreground">{'Performance:'}</strong>
                {' Whether pages load efficiently.'}
              </li>
              <li>
                <strong className="text-foreground">{'Accessibility:'}</strong>
                {
                  ' Whether different visitors can access and use website content.'
                }
              </li>
            </ul>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                "An audit can highlight potential problems, but it cannot explain everything about your search performance. An automated tool cannot fully judge content quality, understand every visitor's needs or explain why Google ranks one page above another."
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'A limited free audit is also not a complete website crawl. It does not replace Google Search Console or a full-site crawler.'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'Think of an automated audit as a starting point. It helps you discover problems and decide which ones deserve further investigation.'
              }
            </p>
          </section>
          <section className="mb-14">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">
              {'A 5-Minute First Pass in the Browser'}
            </h2>
            <Image
              src="/blog/how-to-run-a-free-seo-site-audit/free-seo-audit-browser-steps.webp"
              alt={'Hands entering a website URL in a laptop browser'}
              width={1200}
              height={900}
              className="mt-6 w-full rounded-3xl border border-border object-cover"
            />
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'A browser-based audit is a simple way to begin. You do not need to install desktop software or configure complicated settings.'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {'The Ai Ranko '}
              <Link
                href={'/tools/site-audit'}
                className="font-semibold text-primary hover:underline"
              >
                {'Site Audit'}
              </Link>
              {
                ' is free to use and can crawl up to 15 pages. It performs 25+ real SEO, performance, accessibility, mobile and technical checks.'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {'Follow these steps to get started.'}
            </p>
            <h3 className="mt-6 font-heading text-lg font-semibold text-foreground">
              {'Step 1: Open the Site Audit tool'}
            </h3>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {'Visit the Ai Ranko Site Audit page in your browser.'}
            </p>
            <h3 className="mt-6 font-heading text-lg font-semibold text-foreground">
              {'Step 2: Enter your website URL'}
            </h3>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'Enter the full address of the website you want to examine. For example: '
              }
              <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                {'https://example.com'}
              </code>
              {'.'}
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'Use the correct website version, including HTTPS if your website has a secure connection.'
              }
            </p>
            <h3 className="mt-6 font-heading text-lg font-semibold text-foreground">
              {'Step 3: Start the audit'}
            </h3>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'Start the audit and allow the tool to examine the available pages. The crawl can cover up to 15 pages, making it useful for an initial review of a small website or selected pages on a larger one.'
              }
            </p>
            <h3 className="mt-6 font-heading text-lg font-semibold text-foreground">
              {'Step 4: Review the results'}
            </h3>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'When the report is ready, look for missing SEO information, technical issues, performance recommendations, accessibility findings and mobile-related problems.'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'Not every warning has the same importance. Some findings may need immediate attention, while others are simply opportunities to improve an already functional page.'
              }
            </p>
            <h3 className="mt-6 font-heading text-lg font-semibold text-foreground">
              {'Step 5: Record important findings'}
            </h3>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'Write down the problems you want to investigate. Start with issues that could affect important pages, search engine access or visitor experience.'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'Remember that a 15-page audit cannot examine every URL on a large website. Use Google Search Console for indexing information and a suitable full-site crawler when you need wider technical coverage.'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              <strong className="text-foreground">{'What to do next:'}</strong>
              {
                ' Make a short list of your main findings. Then investigate whether Google can discover and index your important pages.'
              }
            </p>
          </section>
          <section className="mb-14">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">
              {'Step 1: Can Google Find and Index Your Pages?'}
            </h2>
            <Image
              src="/blog/how-to-run-a-free-seo-site-audit/seo-indexing-search-console-concept.webp"
              alt={
                'Workspace with search analytics and website pages on two monitors'
              }
              width={1200}
              height={900}
              className="mt-6 w-full rounded-3xl border border-border object-cover"
            />
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                "A page can be published and accessible to visitors without appearing in Google's search results. This is why indexing should be one of the first areas you investigate."
              }
            </p>
            <h3 className="mt-6 font-heading text-lg font-semibold text-foreground">
              {'Use a Google site search'}
            </h3>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {'Open Google and search: '}
              <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                {'site:yourdomain.com'}
              </code>
              {'.'}
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {'Replace yourdomain.com with your actual domain. For example: '}
              <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                {'site:example.com'}
              </code>
              {'.'}
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'Google may display pages from your website that it has indexed. Look for your homepage, important service or product pages, and articles. If an important page is missing, investigate further.'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'However, a site search is only a quick indication. It does not provide a complete list of indexed URLs.'
              }
            </p>
            <h3 className="mt-6 font-heading text-lg font-semibold text-foreground">
              {'Check Google Search Console'}
            </h3>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'If you own the website, set up Google Search Console. Open the Pages report to review indexing information. Look at which pages are indexed, which are not indexed and the reasons Google gives for their exclusion.'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'Not every non-indexed page is a problem. Duplicate pages and pages intentionally marked with a noindex directive may not need to appear in search results. Focus on pages you actually want Google to index.'
              }
            </p>
            <h3 className="mt-6 font-heading text-lg font-semibold text-foreground">
              {'Check your XML sitemap'}
            </h3>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'An XML sitemap helps search engines discover important URLs on your website. Check whether your sitemap exists and includes the pages you want search engines to find. You can also review its submission through Google Search Console.'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'Remember that submitting a sitemap does not guarantee indexing. Google still evaluates pages before deciding whether to include them in search results.'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              <strong className="text-foreground">{'What to do next:'}</strong>
              {
                " Investigate important pages missing from Google's index. Check their accessibility, indexing settings and sitemap coverage before moving on."
              }
            </p>
          </section>
          <section className="mb-14">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">
              {
                'Step 2: Check Titles, Meta Descriptions, Headings and Broken Links'
              }
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'After checking indexing, review the information that search engines and visitors see when they interact with your pages.'
              }
            </p>
            <h3 className="mt-6 font-heading text-lg font-semibold text-foreground">
              {'Review page titles and meta descriptions'}
            </h3>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'Every important page should have a clear title that explains its subject. For example, a local bakery\'s contact page should have a descriptive title that identifies the business and the purpose of the page, rather than a generic title such as "Home" or "Page 2".'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'Check for missing titles, duplicated titles, unclear descriptions and metadata that does not accurately describe the page.'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'Your meta description should briefly explain what visitors can expect. Google may generate its own search-result description, so it does not always display the text you provide.'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {'You can use the Ai Ranko '}
              <Link
                href={'/tools/meta-checker'}
                className="font-semibold text-primary hover:underline"
              >
                {'Meta Checker'}
              </Link>
              {' to review your page metadata.'}
            </p>
            <h3 className="mt-6 font-heading text-lg font-semibold text-foreground">
              {'Check your heading structure'}
            </h3>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'Headings organise content into clear sections. A typical page uses an H1 for its main topic, H2 headings for major sections and H3 headings for smaller topics.'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'Check that headings accurately describe the information below them. For example, a SaaS pricing page should have clear headings for its plans, features and payment information.'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'Avoid unnecessary keyword repetition. Headings should help visitors understand the page.'
              }
            </p>
            <h3 className="mt-6 font-heading text-lg font-semibold text-foreground">
              {'Find broken links'}
            </h3>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'Broken links lead visitors to pages that no longer exist or cannot be accessed. Check your navigation, internal links, article links and important external links. Make sure buttons also lead to their intended destinations.'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'Update incorrect URLs and replace links pointing to outdated pages.'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              <strong className="text-foreground">{'What to do next:'}</strong>
              {
                ' Correct missing or duplicated metadata, improve unclear headings and repair important broken links. Then check your website on mobile devices.'
              }
            </p>
          </section>
          <section className="mb-14">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">
              {'Step 3: Check Mobile Experience and Page Speed'}
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'Your website should work properly on desktop and mobile devices. A page that looks good on a large monitor may still be difficult to use on a smartphone. Check mobile usability and page performance separately.'
              }
            </p>
            <h3 className="mt-6 font-heading text-lg font-semibold text-foreground">
              {'Test your pages with PageSpeed Insights'}
            </h3>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'Google provides a free tool called PageSpeed Insights. Enter your website URL and run a test. It provides performance information for mobile and desktop experiences.'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'Pay attention to loading performance, how quickly the page responds to interactions and whether the layout moves unexpectedly. PageSpeed Insights also reports on Core Web Vitals, which measure aspects of loading, interactivity and visual stability.'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'Do not focus only on the overall score. Read the recommendations to understand what causes problems. Large images, unnecessary scripts and poorly optimised resources may affect performance.'
              }
            </p>
            <h3 className="mt-6 font-heading text-lg font-semibold text-foreground">
              {'Check the mobile layout'}
            </h3>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                "Open your website on a smartphone or use your browser's mobile preview. Check whether text is easy to read, buttons are comfortable to tap, navigation works properly and images fit the screen. Also test forms and make sure visitors do not need unnecessary horizontal scrolling."
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {'You can use the Ai Ranko '}
              <Link
                href={'/tools/mobile-checker'}
                className="font-semibold text-primary hover:underline"
              >
                {'Mobile Checker'}
              </Link>
              {' as an additional check. For more ideas, see our guide to '}
              <Link
                href={'/blog/top-10-mobile-friendly-websites'}
                className="font-semibold text-primary hover:underline"
              >
                {'Top 10 Mobile-Friendly Websites'}
              </Link>
              {'.'}
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'Automated checks cannot fully replace testing your website on real devices.'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              <strong className="text-foreground">{'What to do next:'}</strong>
              {
                ' Fix problems that make important pages slow or difficult to use on mobile. Test the updated pages again to review your changes.'
              }
            </p>
          </section>
          <section className="mb-14">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">
              {'Step 4: Turn Your Audit Findings Into a Fix List'}
            </h2>
            <Image
              src="/blog/how-to-run-a-free-seo-site-audit/seo-audit-fix-priority.webp"
              alt={'Notebook with an SEO checklist beside a laptop and coffee'}
              width={1200}
              height={900}
              className="mt-6 w-full rounded-3xl border border-border object-cover"
            />
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'An audit may produce several warnings and recommendations. Trying to fix everything at once can waste time. Instead, organise your findings by priority.'
              }
            </p>
            <h3 className="mt-6 font-heading text-lg font-semibold text-foreground">
              {'High-priority issues'}
            </h3>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'Start with problems that may prevent search engines or visitors from accessing important pages. Examples include accidental noindex settings, important pages blocked from crawling, pages returning errors and broken links affecting key website sections.'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {'Investigate these before spending time on minor improvements.'}
            </p>
            <h3 className="mt-6 font-heading text-lg font-semibold text-foreground">
              {'Medium-priority issues'}
            </h3>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'Next, review problems affecting page quality and usability. These may include missing or duplicated titles, poor meta descriptions, unclear headings, mobile usability problems and performance issues.'
              }
            </p>
            <h3 className="mt-6 font-heading text-lg font-semibold text-foreground">
              {'Low-priority issues'}
            </h3>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'Finally, review smaller opportunities, such as minor descriptive improvements, non-critical accessibility recommendations and formatting inconsistencies.'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'The number of warnings does not automatically determine how serious a problem is. One indexing issue affecting your main product page may deserve more attention than several minor formatting recommendations.'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {'You can record your findings in a simple spreadsheet:'}
            </p>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="border-b border-border px-4 py-3"
                    >
                      {'Issue'}
                    </th>
                    <th
                      scope="col"
                      className="border-b border-border px-4 py-3"
                    >
                      {'Priority'}
                    </th>
                    <th
                      scope="col"
                      className="border-b border-border px-4 py-3"
                    >
                      {'Action'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border-b border-border px-4 py-3">
                      {'Important page not indexed'}
                    </td>
                    <td className="border-b border-border px-4 py-3">
                      {'High'}
                    </td>
                    <td className="border-b border-border px-4 py-3">
                      {'Investigate indexing settings'}
                    </td>
                  </tr>
                  <tr>
                    <td className="border-b border-border px-4 py-3">
                      {'Duplicate page titles'}
                    </td>
                    <td className="border-b border-border px-4 py-3">
                      {'Medium'}
                    </td>
                    <td className="border-b border-border px-4 py-3">
                      {'Rewrite titles'}
                    </td>
                  </tr>
                  <tr>
                    <td className="border-b border-border px-4 py-3">
                      {'Minor formatting issue'}
                    </td>
                    <td className="border-b border-border px-4 py-3">
                      {'Low'}
                    </td>
                    <td className="border-b border-border px-4 py-3">
                      {'Review later'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              <strong className="text-foreground">{'What to do next:'}</strong>
              {
                ' Fix the highest-impact problems first. Record your changes so you can review their effects during your next audit.'
              }
            </p>
          </section>
          <section className="mb-14">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">
              {'How This Fits Into a Wider SEO Plan'}
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'A website audit is an important part of SEO, but it is not the entire process. Once you have corrected technical and on-page problems, think about the wider strategy.'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'Your next activities might include researching relevant keywords, creating useful content, improving internal links, reviewing your website structure and monitoring organic search performance.'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'Google Search Console can help you understand which search queries bring visitors to your website and how your pages perform in search results.'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'If you need help organising your next SEO activities, try the Ai Ranko '
              }
              <Link
                href={'/tools/seo-strategy-maker'}
                className="font-semibold text-primary hover:underline"
              >
                {'SEO Strategy Creator'}
              </Link>
              {
                '. It can help you organise your priorities and plan your next steps.'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'Remember that finding an issue does not guarantee that fixing it will improve rankings. SEO results depend on several factors, and improvements take time.'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              <strong className="text-foreground">{'What to do next:'}</strong>
              {
                ' Turn your audit findings into a realistic improvement plan. Review your progress and use Search Console to monitor actual search performance.'
              }
            </p>
          </section>
          <section className="mb-14">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">
              {'Frequently asked questions'}
            </h2>
            <div className="mt-6 space-y-3">
              {faqs.map((f) => (
                <details
                  key={f.q}
                  className="group rounded-2xl border border-border bg-card"
                >
                  <summary className="cursor-pointer px-5 py-4 font-heading text-sm font-semibold text-foreground">
                    {f.q}
                  </summary>
                  <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </section>
          <section className="mb-14">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">
              {'Try a Free Audit on Your Site'}
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'You do not need complicated software to take the first step towards a healthier website. Start with your homepage, review the findings and identify problems that deserve attention.'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'Ai Ranko offers a free browser-based Site Audit that crawls up to 15 pages and performs 25+ real SEO, performance, accessibility, mobile and technical checks. It is a useful starting point, not a replacement for Google Search Console or a full-site crawler.'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              <strong className="text-foreground">
                {'Ready to check your website?'}
              </strong>{' '}
              <Link
                href={'/tools/site-audit'}
                className="font-semibold text-primary hover:underline"
              >
                {'Try the free Ai Ranko Site Audit'}
              </Link>
              {' and find out what you can improve.'}
            </p>
          </section>
        </div>
      </article>
      <footer className="mt-12 border-t border-border bg-card px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <Link href="/" aria-label="Ai Ranko home">
            <img
              src="/images/ai-ranko-logo.webp"
              alt="Ai Ranko"
              className="h-7 w-auto"
            />
          </Link>
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Ai Ranko. Free AI SEO &amp; image
            tools — no signup required.
          </p>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link
              href="/sitemap"
              className="transition-colors hover:text-foreground"
            >
              Sitemap
            </Link>
            <Link
              href="/blog"
              className="transition-colors hover:text-foreground"
            >
              Blog
            </Link>
            <Link
              href="/privacy-policy"
              className="transition-colors hover:text-foreground"
            >
              Privacy
            </Link>
            <Link
              href="/terms-and-conditions"
              className="transition-colors hover:text-foreground"
            >
              Terms
            </Link>
            <Link
              href="/contact"
              className="transition-colors hover:text-foreground"
            >
              Contact
            </Link>
            <CookieSettingsLink className="transition-colors hover:text-foreground" />
          </nav>
        </div>
      </footer>
    </div>
  )
}
