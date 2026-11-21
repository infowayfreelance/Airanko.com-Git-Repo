import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight, Zap, Calendar, Clock, User } from 'lucide-react'
import Navbar from '@/components/navbar'
import { CookieSettingsLink } from '@/components/cookie-consent/cookie-settings-link'

const POST = {
  title:
    "How to Check if a Website Is Mobile-Friendly (Now Google's Test Is Gone)",
  excerpt:
    'Google retired its Mobile-Friendly Test in 2023. Here is a practical way to check any website on mobile: previews, Lighthouse, real phones and a fix list.',
  slug: 'how-to-check-if-a-website-is-mobile-friendly',
  date: '2026-11-21',
  dateDisplay: 'November 21, 2026',
  updated: '2026-11-21',
  readingTime: '9 min read',
  author: 'Junaid Mazhar',
  category: 'SEO',
  url: 'https://airanko.com/blog/how-to-check-if-a-website-is-mobile-friendly',
  image:
    '/blog/how-to-check-if-a-website-is-mobile-friendly/how-to-check-if-a-website-is-mobile-friendly-featured.webp',
}

export const metadata: Metadata = {
  title: 'How to Check if a Website Is Mobile-Friendly',
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
    tags: ['SEO', 'Mobile Usability', 'Responsive Design'],
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
  about: [{ '@type': 'Thing', name: 'Mobile-friendly websites' }],
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
    q: 'Does Google still have a Mobile-Friendly Test?',
    a: 'No. Google retired the Mobile-Friendly Test, its API and the Search Console Mobile Usability report from 1 December 2023. Google suggested Lighthouse as an alternative for checking mobile usability.',
  },
  {
    q: 'Is mobile-friendliness a ranking factor?',
    a: 'Google uses mobile-first indexing, so the mobile version of your content is what it mainly indexes and ranks. Google also describes page experience, including mobile usability, as something its systems reward, while stressing that helpful content matters most.',
  },
  {
    q: 'What is the quickest way to check if a site is mobile-friendly?',
    a: 'Load it at real device sizes in a preview tool like the Ai Ranko Mobile Friendliness Checker, then open it on your own phone. Follow up with a Lighthouse audit for technical issues.',
  },
  {
    q: "Can I check a competitor's website?",
    a: 'Yes. Preview tools and PageSpeed Insights work on any publicly accessible URL.',
  },
  {
    q: 'Why does my site look fine in DevTools but not on my phone?',
    a: 'DevTools simulates a mobile viewport but cannot reproduce every detail of a real device, browser and connection. Always confirm on a real phone.',
  },
  {
    q: 'Do I need a separate mobile website?',
    a: 'Usually not. Google recommends responsive web design as the easiest pattern to implement and maintain, with one URL and the same HTML for all devices.',
  },
  {
    q: 'How do I make my website mobile-friendly?',
    a: 'Use a responsive design with a correct viewport tag, readable text, well-spaced buttons, compressed images and the same content on mobile as on desktop. Then test, fix and test again.',
  },
]
const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.q,
    acceptedAnswer: { '@type': 'Answer', text: faq.a },
  })),
}

export default function MobileFriendlyBlogPost() {
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
                'For years, the quickest answer to "is my website mobile-friendly?" was Google\'s Mobile-Friendly Test. You pasted in a URL and got a simple pass or fail. That tool no longer exists. Google retired the Mobile-Friendly Test, the Mobile-Friendly Test API and the Mobile Usability report in Search Console from 1 December 2023.'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                "Mobile usability still matters, though. Google uses mobile-first indexing, which means it mainly uses the mobile version of a page's content for indexing and ranking. And most importantly, real people use your site on phones."
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'This guide gives you a practical, repeatable way to check whether a website is mobile-friendly today, using free tools and a real phone, and a short list of the most common fixes.'
              }
            </p>
          </header>
          <Image
            src="/blog/how-to-check-if-a-website-is-mobile-friendly/how-to-check-if-a-website-is-mobile-friendly-featured.webp"
            alt={
              'Laptop and phones showing the same website at different screen sizes'
            }
            width={1600}
            height={900}
            priority
            className="mb-8 mt-6 w-full rounded-3xl border border-border object-cover"
          />
          <section className="mb-14">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">
              {'Short answer: how to check mobile-friendliness today'}
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {'Use three layers of checking, from fastest to most thorough:'}
            </p>
            <ol className="mt-4 list-decimal space-y-2 pl-6 text-muted-foreground">
              <li>
                <strong className="text-foreground">
                  {'Preview the page at real device sizes'}
                </strong>
                {' in a browser-based tool such as the '}
                <Link
                  href={'https://airanko.com/tools/mobile-checker'}
                  className="font-semibold text-primary hover:underline"
                >
                  {'Ai Ranko Mobile Friendliness Checker'}
                </Link>
                {', to spot layout breaks quickly.'}
              </li>
              <li>
                <strong className="text-foreground">
                  {'Run an automated audit'}
                </strong>
                {
                  ' with Lighthouse, which is built into Chrome DevTools and also powers PageSpeed Insights.'
                }
              </li>
              <li>
                <strong className="text-foreground">
                  {'Test on a real phone'}
                </strong>
                {
                  ', tapping through the menu, forms and key actions like a visitor would.'
                }
              </li>
            </ol>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'No single tool gives a complete answer. Previews show you what breaks, audits flag technical problems, and real-device testing catches the things that only appear in your hand.'
              }
            </p>
          </section>
          <section className="mb-14">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">
              {'What "mobile-friendly" actually means'}
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'A mobile-friendly page is one that people can comfortably read and use on a small touchscreen without zooming, scrolling sideways or mis-tapping. In practice, that usually means:'
              }
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
              <li>
                <strong className="text-foreground">
                  {'A responsive layout'}
                </strong>
                {
                  ' that adapts to the screen width, set up with a viewport meta tag such as '
                }
                <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                  {
                    '<meta name="viewport" content="width=device-width, initial-scale=1">'
                  }
                </code>
                {'.'}
              </li>
              <li>
                <strong className="text-foreground">{'Readable text'}</strong>
                {' without pinching to zoom.'}
              </li>
              <li>
                <strong className="text-foreground">{'Tap targets'}</strong>
                {' (buttons and links) that are large enough and spaced apart.'}
              </li>
              <li>
                <strong className="text-foreground">
                  {'No horizontal scrolling'}
                </strong>
                {', because content fits the screen.'}
              </li>
              <li>
                <strong className="text-foreground">
                  {'Navigation that works'}
                </strong>
                {' on touch, including menus that open and close properly.'}
              </li>
              <li>
                <strong className="text-foreground">
                  {'Forms that are usable'}
                </strong>
                {
                  ', with fields that are easy to tap and the right keyboard for each input.'
                }
              </li>
              <li>
                <strong className="text-foreground">
                  {'The same important content'}
                </strong>
                {
                  ' on mobile as on desktop, because Google indexes the mobile version.'
                }
              </li>
              <li>
                <strong className="text-foreground">
                  {'Reasonable performance'}
                </strong>
                {' on mobile connections.'}
              </li>
            </ul>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                "Google's own documentation on mobile-first indexing recommends that the mobile site has the same content as the desktop site, including text, images, structured data and metadata. If content is hidden or removed on mobile, Google may not see it."
              }
            </p>
          </section>
          <section className="mb-14">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">
              {'Step 1: Preview the page at real device sizes'}
            </h2>
            <Image
              src="/blog/how-to-check-if-a-website-is-mobile-friendly/mobile-device-preview-sizes.webp"
              alt={'Browser tool previewing a web page in a phone-sized frame'}
              width={1200}
              height={900}
              className="mb-8 mt-6 w-full rounded-3xl border border-border object-cover"
            />
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'The fastest first check is a visual one. Load the page at the screen sizes your visitors actually use and look for anything that breaks.'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {'With the '}
              <Link
                href={'https://airanko.com/tools/mobile-checker'}
                className="font-semibold text-primary hover:underline"
              >
                {'Ai Ranko Mobile Friendliness Checker'}
              </Link>
              {' you can:'}
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
              <li>
                {
                  'enter any public URL and preview it at a range of phone, tablet and desktop sizes;'
                }
              </li>
              <li>{'switch between portrait and landscape;'}</li>
              <li>{'zoom the preview to inspect small text and buttons;'}</li>
              <li>
                {
                  'run a mobile-friendliness audit from the page source, covering points such as the viewport and legibility;'
                }
              </li>
              <li>{'compare two URLs and export a PDF report.'}</li>
            </ul>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {'It works in the browser with no install or sign-up.'}
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              <strong className="text-foreground">
                {'What to look for in the preview:'}
              </strong>
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
              <li>{'text that is too small to read comfortably;'}</li>
              <li>
                {
                  'elements that overflow the screen and cause sideways scrolling;'
                }
              </li>
              <li>{'images or tables that are cut off;'}</li>
              <li>{'buttons that sit too close together;'}</li>
              <li>
                {
                  'headers, cookie banners or pop-ups that cover most of the screen;'
                }
              </li>
              <li>{'menus that do not open or overlap other content.'}</li>
            </ul>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              <strong className="text-foreground">{'What to do next:'}</strong>
              {
                ' note every problem with the device size where it appeared. That list becomes your fix list.'
              }
            </p>
          </section>
          <section className="mb-14">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">
              {'Step 2: Run a Lighthouse audit'}
            </h2>
            <Image
              src="/blog/how-to-check-if-a-website-is-mobile-friendly/lighthouse-mobile-audit-laptop.webp"
              alt={
                'Laptop showing a generic mobile audit report with category gauges'
              }
              width={1200}
              height={900}
              className="mb-8 mt-6 w-full rounded-3xl border border-border object-cover"
            />
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                "Lighthouse is Google's open-source tool for auditing web pages. When Google retired the Mobile-Friendly Test, it pointed people to Lighthouse as an alternative. You can run it two ways:"
              }
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
              <li>
                <strong className="text-foreground">
                  {'In PageSpeed Insights:'}
                </strong>
                {
                  ' enter a URL and look at the mobile results. You get a Lighthouse lab report, and for pages with enough traffic, real-user field data from the Chrome User Experience Report.'
                }
              </li>
              <li>
                <strong className="text-foreground">
                  {'In Chrome DevTools:'}
                </strong>
                {
                  ' open the page in Chrome, open DevTools, choose the Lighthouse panel, select the mobile device option and run the report.'
                }
              </li>
            </ul>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'Lighthouse reports scores for categories such as performance, accessibility, best practices and SEO, with specific audits you can expand. Pay particular attention to:'
              }
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
              <li>
                {'whether the page has a correctly set viewport meta tag;'}
              </li>
              <li>
                {
                  'accessibility issues such as low contrast or small touch targets;'
                }
              </li>
              <li>
                {
                  'performance problems on mobile, such as large images or render-blocking resources.'
                }
              </li>
            </ul>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'Treat the score as a guide, not a grade. A lab test runs under set conditions, and results can vary between runs.'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              <strong className="text-foreground">{'What to do next:'}</strong>
              {
                ' add the failed or flagged audits to your fix list, with the page URL.'
              }
            </p>
          </section>
          <section className="mb-14">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">
              {'Step 3: Use device mode in Chrome DevTools'}
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'Chrome DevTools has a device mode (the device toolbar) that simulates mobile viewports. It is useful for developers and anyone comfortable inspecting a page.'
              }
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
              <li>
                {
                  'Toggle the device toolbar and pick a device or a custom width.'
                }
              </li>
              <li>
                {
                  'Resize the viewport slowly and watch for the point where the layout breaks.'
                }
              </li>
              <li>
                {
                  'Throttle the network to see how the page behaves on a slower connection.'
                }
              </li>
            </ul>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                "Chrome's documentation is clear that device mode is a simulation. It does not perfectly reproduce how a page behaves on a real phone, so always finish with a real-device test."
              }
            </p>
          </section>
          <section className="mb-14">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">
              {'Step 4: Test on a real phone'}
            </h2>
            <Image
              src="/blog/how-to-check-if-a-website-is-mobile-friendly/real-phone-tap-test.webp"
              alt={'Hand testing a website contact form on a real smartphone'}
              width={1200}
              height={900}
              className="mb-8 mt-6 w-full rounded-3xl border border-border object-cover"
            />
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'Real phones reveal problems that simulators miss: how a sticky header feels while scrolling, whether a form keyboard covers the submit button, or whether a tap on a small link hits the wrong item.'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {'On at least one iPhone and one Android phone, if you can:'}
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
              <li>
                {
                  'open the homepage and two or three of the most important pages;'
                }
              </li>
              <li>{'use the menu to move between pages;'}</li>
              <li>
                {
                  'complete a key action, such as a contact form, a booking or a checkout up to the payment step;'
                }
              </li>
              <li>{'rotate the phone to landscape;'}</li>
              <li>{'read a full paragraph without zooming.'}</li>
            </ul>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              <strong className="text-foreground">{'What to do next:'}</strong>
              {
                ' record anything that felt awkward, even if it technically works.'
              }
            </p>
          </section>
          <section className="mb-14">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">
              {'Step 5: Check more than one page'}
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'Mobile problems are often template-specific. A homepage might be fine while blog posts, product pages or forms break. Check at least one example of each page type.'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'For a wider view of technical issues across several pages, run the '
              }
              <Link
                href={'https://airanko.com/tools/site-audit'}
                className="font-semibold text-primary hover:underline"
              >
                {'Ai Ranko Site Audit'}
              </Link>
              {', and read our guide on '}
              <Link
                href={
                  'https://airanko.com/blog/how-to-run-a-free-seo-site-audit'
                }
                className="font-semibold text-primary hover:underline"
              >
                {'how to run a free SEO site audit'}
              </Link>
              {' for a step-by-step process.'}
            </p>
          </section>
          <section className="mb-14">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">
              {'Mobile-friendly is not the same as fast'}
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                "A page can fit the screen perfectly and still feel poor on a phone because it loads slowly or jumps around. Google's Core Web Vitals measure three parts of that experience:"
              }
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
              <li>
                <strong className="text-foreground">
                  {'Largest Contentful Paint (LCP):'}
                </strong>
                {' how quickly the main content appears.'}
              </li>
              <li>
                <strong className="text-foreground">
                  {'Interaction to Next Paint (INP):'}
                </strong>
                {
                  ' how quickly the page responds when someone taps or types. INP replaced First Input Delay as a Core Web Vital in March 2024.'
                }
              </li>
              <li>
                <strong className="text-foreground">
                  {'Cumulative Layout Shift (CLS):'}
                </strong>
                {' how much the layout moves unexpectedly while loading.'}
              </li>
            </ul>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'PageSpeed Insights shows these metrics for real users when there is enough data for a URL, and Lighthouse estimates related lab metrics. Search Console also has a Core Web Vitals report for sites with enough traffic.'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'For mobile visitors, the usual culprits are large images, heavy fonts, too many third-party scripts and adverts or banners that load late and push content down. Reserve space for images and embeds so the layout does not shift, and load non-essential scripts later.'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              <strong className="text-foreground">{'What to do next:'}</strong>
              {
                ' if your layout passes but the page feels slow, treat speed as a separate fix list and re-test after each change.'
              }
            </p>
          </section>
          <section className="mb-14">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">
              {'Common mobile problems and how to fix them'}
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              <strong className="text-foreground">
                {'Missing or incorrect viewport tag'}
              </strong>
              {'\nAdd '}
              <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                {
                  '<meta name="viewport" content="width=device-width, initial-scale=1">'
                }
              </code>
              {
                ' to the page head. Without it, phones may show a shrunken desktop layout.'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              <strong className="text-foreground">{'Text too small'}</strong>
              {
                '\nUse a sensible base font size and relative units, and avoid tiny text in footers and captions.'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              <strong className="text-foreground">
                {'Buttons and links too close together'}
              </strong>
              {
                '\nIncrease padding and spacing on touch targets, especially in menus and footers.'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              <strong className="text-foreground">
                {'Horizontal scrolling'}
              </strong>
              {
                '\nLook for fixed-width elements, wide tables, large images or embedded content. Use responsive widths (for example '
              }
              <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                {'max-width: 100%'}
              </code>
              {
                ' on images) and allow tables to scroll inside their own container.'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              <strong className="text-foreground">{'Intrusive pop-ups'}</strong>
              {
                '\nLarge interstitials that cover content on mobile frustrate visitors. Use smaller banners and make them easy to dismiss.'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              <strong className="text-foreground">{'Heavy images'}</strong>
              {'\nResize and compress images before upload. The free '}
              <Link
                href={'https://airanko.com/tools/image-resizer'}
                className="font-semibold text-primary hover:underline"
              >
                {'Ai Ranko Image Resizer'}
              </Link>
              {' and '}
              <Link
                href={'https://airanko.com/tools/bulk-image-resizer'}
                className="font-semibold text-primary hover:underline"
              >
                {'Bulk Image Resizer'}
              </Link>
              {' can help.'}
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              <strong className="text-foreground">
                {'Different content on mobile'}
              </strong>
              {
                '\nMake sure important text, links and structured data are present on the mobile version, not only on desktop.'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              <strong className="text-foreground">{'What to do next:'}</strong>
              {
                ' fix one problem at a time, then re-test the same page at the same device sizes to confirm the change worked.'
              }
            </p>
          </section>
          <section className="mb-14">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">
              {'How often should you check?'}
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {'Check mobile-friendliness:'}
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
              <li>{'before launching a new site or redesign;'}</li>
              <li>{'after changing a theme, page builder or template;'}</li>
              <li>
                {'after adding new plugins, pop-ups or third-party scripts;'}
              </li>
              <li>
                {
                  'whenever you add a new type of page, such as a landing page or product template.'
                }
              </li>
            </ul>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'A short monthly spot check of your most important pages is a sensible habit for most sites.'
              }
            </p>
          </section>
          <section className="mb-14">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">
              {'Frequently asked questions'}
            </h2>
            <div className="mt-6 space-y-3">
              <details className="group rounded-2xl border border-border bg-card">
                <summary className="cursor-pointer px-5 py-4 font-heading text-sm font-semibold text-foreground">
                  {'Does Google still have a Mobile-Friendly Test?'}
                </summary>
                <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                  {
                    'No. Google retired the Mobile-Friendly Test, its API and the Search Console Mobile Usability report from 1 December 2023. Google suggested Lighthouse as an alternative for checking mobile usability.'
                  }
                </p>
              </details>
              <details className="group rounded-2xl border border-border bg-card">
                <summary className="cursor-pointer px-5 py-4 font-heading text-sm font-semibold text-foreground">
                  {'Is mobile-friendliness a ranking factor?'}
                </summary>
                <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                  {
                    'Google uses mobile-first indexing, so the mobile version of your content is what it mainly indexes and ranks. Google also describes page experience, including mobile usability, as something its systems reward, while stressing that helpful content matters most.'
                  }
                </p>
              </details>
              <details className="group rounded-2xl border border-border bg-card">
                <summary className="cursor-pointer px-5 py-4 font-heading text-sm font-semibold text-foreground">
                  {
                    'What is the quickest way to check if a site is mobile-friendly?'
                  }
                </summary>
                <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                  {'Load it at real device sizes in a preview tool like the '}
                  <Link
                    href={'https://airanko.com/tools/mobile-checker'}
                    className="font-semibold text-primary hover:underline"
                  >
                    {'Ai Ranko Mobile Friendliness Checker'}
                  </Link>
                  {
                    ', then open it on your own phone. Follow up with a Lighthouse audit for technical issues.'
                  }
                </p>
              </details>
              <details className="group rounded-2xl border border-border bg-card">
                <summary className="cursor-pointer px-5 py-4 font-heading text-sm font-semibold text-foreground">
                  {"Can I check a competitor's website?"}
                </summary>
                <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                  {
                    'Yes. Preview tools and PageSpeed Insights work on any publicly accessible URL.'
                  }
                </p>
              </details>
              <details className="group rounded-2xl border border-border bg-card">
                <summary className="cursor-pointer px-5 py-4 font-heading text-sm font-semibold text-foreground">
                  {
                    'Why does my site look fine in DevTools but not on my phone?'
                  }
                </summary>
                <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                  {
                    'DevTools simulates a mobile viewport but cannot reproduce every detail of a real device, browser and connection. Always confirm on a real phone.'
                  }
                </p>
              </details>
              <details className="group rounded-2xl border border-border bg-card">
                <summary className="cursor-pointer px-5 py-4 font-heading text-sm font-semibold text-foreground">
                  {'Do I need a separate mobile website?'}
                </summary>
                <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                  {
                    'Usually not. Google recommends responsive web design as the easiest pattern to implement and maintain, with one URL and the same HTML for all devices.'
                  }
                </p>
              </details>
              <details className="group rounded-2xl border border-border bg-card">
                <summary className="cursor-pointer px-5 py-4 font-heading text-sm font-semibold text-foreground">
                  {'How do I make my website mobile-friendly?'}
                </summary>
                <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                  {
                    'Use a responsive design with a correct viewport tag, readable text, well-spaced buttons, compressed images and the same content on mobile as on desktop. Then test, fix and test again.'
                  }
                </p>
              </details>
            </div>
          </section>
          <section className="mb-14">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">
              {'Check your website now'}
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {'Start with a quick preview in the free '}
              <Link
                href={'https://airanko.com/tools/mobile-checker'}
                className="font-semibold text-primary hover:underline"
              >
                {'Ai Ranko Mobile Friendliness Checker'}
              </Link>
              {
                ', then run Lighthouse and finish on a real phone. If you want a wider look at your site, try the free '
              }
              <Link
                href={'https://airanko.com/tools/site-audit'}
                className="font-semibold text-primary hover:underline"
              >
                {'Site Audit'}
              </Link>
              {'. For more guides, visit the '}
              <Link
                href={'https://airanko.com/blog'}
                className="font-semibold text-primary hover:underline"
              >
                {'Ai Ranko blog'}
              </Link>
              {', or '}
              <Link
                href={'https://airanko.com/contact'}
                className="font-semibold text-primary hover:underline"
              >
                {'get in touch'}
              </Link>
              {' if you have a question about the tools.'}
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
