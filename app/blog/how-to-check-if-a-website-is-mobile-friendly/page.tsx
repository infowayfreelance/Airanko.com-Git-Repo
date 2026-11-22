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
  updated: '2026-11-23',
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
    "q": "Does Google still offer its Mobile-Friendly Test?",
    "a": "No. The test, its API and the Search Console Mobile Usability report were retired from 1 December 2023. Use current browser tools and real-device checks instead. Lighthouse can help with diagnostics, but no single report replaces checking whether people can complete tasks on your mobile pages."
  },
  {
    "q": "What is the simplest way to start a mobile check?",
    "a": "Choose a public page and preview it at a phone-sized width. Look for unreadable text, clipped content and controls that cover each other. Then open it on your own phone and try a useful task. Follow up with diagnostics for anything that loads slowly or behaves unexpectedly."
  },
  {
    "q": "Does a good performance score mean my website is mobile-friendly?",
    "a": "No. Performance is only part of the experience. A fast page may still have confusing navigation, overlapping buttons or a broken form. Use performance reports to investigate loading and responsiveness, then check the layout and complete key journeys with touch input."
  },
  {
    "q": "Why can a preview look different from my actual phone?",
    "a": "A preview uses a simulated viewport inside your desktop browser. It cannot reproduce every difference in mobile hardware, browser behaviour, keyboard handling or connection quality. Some sites also block embedded previews. Open the page directly on a real device before deciding whether the site itself is broken."
  },
  {
    "q": "Can I check a website that I do not own?",
    "a": "You can usually inspect public pages with previews or performance tools. A site may block embedding or automated requests, so results are not guaranteed. Only test actions you are allowed to use, and avoid sending orders, enquiries or account changes as part of an informal review."
  },
  {
    "q": "Do I need a separate mobile version of my website?",
    "a": "Usually a responsive layout is the simpler starting point. It adapts the same page to different widths. A separate mobile site adds things to maintain, including content consistency and redirects. Review the existing implementation before making a structural change solely because one page has a layout problem."
  },
  {
    "q": "How often should I repeat mobile testing?",
    "a": "Repeat the important journeys after changes to templates, navigation, forms or third-party components. Keep a small set of representative pages so the review stays practical. Test any reported problem on the affected device where possible, then repeat the same steps after the fix."
  }
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

<p className="mt-3 text-sm text-muted-foreground">Updated November 23, 2026</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"A page can look tidy on your laptop and still be awkward on a phone. A menu may hide the booking button. A form may slide behind the keyboard. A wide image may push everything sideways. You find these problems by trying the page, not just by looking for a green score."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"This guide explains how to check if a website is mobile-friendly using free tools and everyday tasks. Start with a preview, investigate with browser diagnostics, then finish on a real phone. Keep a short fix list so the results lead to useful changes."}</p>
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
<section className="mb-14"><h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"What replaced Google's Mobile-Friendly Test?"}</h2>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Google retired its Mobile-Friendly Test, API and Search Console Mobile Usability report from 1 December 2023. Its "}<Link href="https://developers.google.com/search/blog/2023/04/page-experience-in-search" className="font-semibold text-primary hover:underline">{"announcement about page experience"}</Link>{" pointed to other resources, including Lighthouse. An old test link is therefore no longer a useful way to judge your site."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"There is no single replacement that answers every mobile question. A preview shows layout. Lighthouse helps investigate technical problems. A real phone reveals things such as touch accuracy, keyboard behaviour and browser controls getting in the way. Use the methods together."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Choose a task before opening a tool. On a bakery website, you might find opening hours and send an enquiry. On a software site, you might compare plans and start registration. A page is easier to assess when you know what a visitor needs to finish."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground"><strong>{"What to do next:"}</strong>{" Pick your homepage and one important task page. Write down what success should look like on a phone."}</p></section>
<section className="mb-14"><h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"Step 1: Look for layout problems at different widths"}</h2>
<Image
              src="/blog/how-to-check-if-a-website-is-mobile-friendly/mobile-device-preview-sizes.webp"
              alt={'Browser tool previewing a web page in a phone-sized frame'}
              width={1200}
              height={900}
              className="mb-8 mt-6 w-full rounded-3xl border border-border object-cover"
            />
<p className="mt-4 leading-relaxed text-muted-foreground">{"Open the "}<Link href="/tools/mobile-checker" className="font-semibold text-primary hover:underline">{"Ai Ranko Mobile Checker"}</Link>{" and enter the public page URL. Try the phone, tablet and desktop previews. Change between portrait and landscape, and use the available zoom settings to inspect the layout. Zoom changes the preview's display scale, so it is not a substitute for testing browser text enlargement."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Work down the page. Check whether paragraphs fit the screen, navigation stays available and images keep their shape. Look for buttons with cut-off labels, wide tables and notices covering useful content. Compare two URLs if you want to inspect a revised page beside the earlier version."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Review the accompanying audit for clues about viewport configuration, text legibility, old Flash content and mobile redirects. These are automated checks of the fetched page, not proof that every control works. The PDF option can help you keep a record for a developer or colleague."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Some sites block their pages from appearing inside another site's frame. A blank or refused preview can be an embedding restriction rather than a broken mobile layout. Open that page directly in a browser before drawing conclusions. Pages needing a login also require direct testing with an authorised account."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground"><strong>{"What to do next:"}</strong>{" Save the URL, screen width and visible symptom for each problem. “Menu covers the enquiry button in portrait” is more useful than “mobile layout bad”."}</p></section>
<section className="mb-14"><h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"Step 2: Use PageSpeed Insights to investigate performance"}</h2>
<Image
              src="/blog/how-to-check-if-a-website-is-mobile-friendly/lighthouse-mobile-audit-laptop.webp"
              alt={
                'Laptop showing a generic mobile audit report with category gauges'
              }
              width={1200}
              height={900}
              className="mb-8 mt-6 w-full rounded-3xl border border-border object-cover"
            />
<p className="mt-4 leading-relaxed text-muted-foreground">{"Run the same URL through "}<Link href="https://pagespeed.web.dev/" className="font-semibold text-primary hover:underline">{"PageSpeed Insights"}</Link>{" and review its mobile results. Use the report to find possible causes of a slow or unstable page. For example, an oversized hero image may delay useful content, while a late-loading banner may move a button just as someone taps."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Keep the two kinds of evidence separate. "}<Link href="https://developers.google.com/speed/docs/insights/v5/about" className="font-semibold text-primary hover:underline">{"Google's PageSpeed documentation"}</Link>{" explains that Lighthouse provides a controlled lab test, while available field data comes from real Chrome users. Some URLs have too little field data. The report may show origin-level information instead, or no field information at all."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Core Web Vitals cover loading, interaction response and visual stability through Largest Contentful Paint, Interaction to Next Paint and Cumulative Layout Shift. An older guide may mention First Input Delay, but INP replaced it in March 2024. These measurements help you investigate experience. They do not confirm that a menu, payment form or account screen works properly."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Read the findings before chasing the overall score. Record the tested URL and whether the evidence describes that page, the wider origin or a simulated run. Repeat a test when a result looks unusual, keeping the conditions as similar as possible."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground"><strong>{"What to do next:"}</strong>{" Select one relevant performance finding and connect it to something visitors can see or feel. Keep it separate from purely visual fixes."}</p></section>
<section className="mb-14"><h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"Step 3: Find the point where the layout breaks"}</h2>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Open the page in Chrome, open DevTools and enable the device toolbar. Choose a device preset or use the responsive width controls. Slowly narrow and widen the page rather than checking only one phone preset."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Watch the navigation, columns and images as the width changes. A layout may work at two familiar sizes and fail between them. Test a long product name, a large heading or a page with more menu items. Real content often exposes problems that a short sample label hides."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Try landscape too. The extra width can help a table, but the reduced height may make a sticky header dominate the screen. Check whether a dialogue can scroll and whether its close button remains reachable. Use network or CPU throttling when investigating how the page behaves under constrained conditions."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground"><Link href="https://developer.chrome.com/docs/devtools/device-mode" className="font-semibold text-primary hover:underline">{"Chrome's device-mode documentation"}</Link>{" describes this as an approximation. A desktop simulation does not become a physical phone just because you choose a device name. Treat it as a convenient way to reproduce a layout issue and inspect its cause."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground"><strong>{"What to do next:"}</strong>{" Note the smallest width that works and the width where the problem appears. Give those details to whoever maintains the page styles."}</p></section>
<section className="mb-14"><h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"Step 4: Complete the task on a real phone"}</h2>
<Image
              src="/blog/how-to-check-if-a-website-is-mobile-friendly/real-phone-tap-test.webp"
              alt={'Hand testing a website contact form on a real smartphone'}
              width={1200}
              height={900}
              className="mb-8 mt-6 w-full rounded-3xl border border-border object-cover"
            />
<p className="mt-4 leading-relaxed text-muted-foreground">{"Open the live page on a phone and follow your chosen task from beginning to end. Use your fingers rather than a mouse. Start with the menu, follow an internal link, return to the previous page and check whether the navigation still makes sense."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Read a paragraph without enlarging the whole page. Try text enlargement through the browser or device settings as an additional check. Tap nearby links and see whether you can reliably choose the intended one. A row of tiny icons may look neat while being hard to use."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"For forms, test labels, validation messages and the on-screen keyboard. Check whether entering an email address or number brings up a suitable keyboard and whether the next field stays visible. Do not send a real order or enquiry just to test a button. Use a safe test process agreed with the site owner."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Open cookie notices, banners and pop-ups. Close them, rotate the phone and return to the task. If possible, repeat an important journey in another mobile browser. A second device can reveal an issue that your own phone does not show."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground"><strong>{"What to do next:"}</strong>{" Record the exact action that failed. Include the phone and browser, the page URL and a screenshot where it helps explain the problem."}</p></section>
<section className="mb-14"><h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"Step 5: Check more than the homepage"}</h2>
<p className="mt-4 leading-relaxed text-muted-foreground">{"A responsive homepage does not prove that the rest of the website works well. Pick representative templates, such as an article, a product page, a contact form and a search result. Add a page with a table or embedded media if your site uses them."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Compare the information available on mobile with the desktop version. Important explanations, links and image descriptions should not disappear simply because the screen is smaller. Google's "}<Link href="https://developers.google.com/search/docs/crawling-indexing/mobile/mobile-sites-mobile-first-indexing" className="font-semibold text-primary hover:underline">{"mobile-first indexing guidance"}</Link>{" explains why the mobile version matters for crawling and indexing, and recommends responsive design as a maintainable approach."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Prioritise paths visitors actually need. A visitor should be able to reach the next step without turning the phone sideways or hunting through a missing menu. Test any shared header or footer fix on several templates, because one change can affect many pages."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground"><strong>{"What to do next:"}</strong>{" Keep a small set of representative URLs and rerun the same journeys after changes to navigation, forms or page templates."}</p></section>
<section className="mb-14"><h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"Turn the findings into a manageable fix list"}</h2>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Describe the symptom, affected URL, evidence, proposed action and owner. Put blocked tasks first. A form that cannot be submitted deserves attention before a slightly uneven image caption. Group repeated symptoms when they come from one shared component."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"For sideways scrolling, inspect fixed-width containers, tables and oversized media. For unreadable text, review font sizing and spacing. For difficult taps, review the controls and the space around them. For slow images, check their displayed dimensions and file sizes before replacing them."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"The "}<Link href="/tools/image-resizer" className="font-semibold text-primary hover:underline">{"image resizer"}</Link>{" can prepare an individual image, while the "}<Link href="/tools/bulk-image-resizer" className="font-semibold text-primary hover:underline">{"bulk image resizer"}</Link>{" helps with several files. Review the resulting image quality and keep an original copy. Smaller files alone will not fix a layout container that is wider than the screen."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"After each fix, repeat the original failing action and check nearby elements. The "}<Link href="/blog/how-to-run-a-free-seo-site-audit" className="font-semibold text-primary hover:underline">{"free SEO site audit guide"}</Link>{" offers a wider review process. Ai Ranko's "}<Link href="/tools/site-audit" className="font-semibold text-primary hover:underline">{"Site Audit"}</Link>{" runs 25+ checks across up to 15 pages, which can help identify further issues without replacing hands-on mobile testing."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground"><strong>{"What to do next:"}</strong>{" Resolve the highest-impact problem, verify it on a phone and record what changed before moving down the list."}</p></section>
<section className="mb-14"><h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"Frequently asked questions"}</h2>
<div className="mt-6 space-y-3">{faqs.map((faq) => (<details key={faq.q} className="group rounded-2xl border border-border bg-card"><summary className="cursor-pointer px-5 py-4 font-heading text-sm font-semibold text-foreground">{faq.q}</summary><p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{faq.a}</p></details>))}</div></section>
<section className="mb-14"><h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"Keep a repeatable mobile check"}</h2>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Save your test URLs and a short record of the main tasks. Review them after a redesign, a template change or a new form integration. Include a real phone in that routine rather than relying entirely on screenshots and reports."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Start your next review with the "}<Link href="/tools/mobile-checker" className="font-semibold text-primary hover:underline">{"Mobile Checker"}</Link>{", then investigate the findings and try the important journeys yourself. More practical walkthroughs are on the "}<Link href="/blog" className="font-semibold text-primary hover:underline">{"Ai Ranko blog"}</Link>{". If you need to ask about a tool, use the "}<Link href="/contact" className="font-semibold text-primary hover:underline">{"contact page"}</Link>{". A good result is a page that people can understand and use, with evidence showing which problems you have fixed."}</p></section>
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
