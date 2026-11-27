import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight, Zap, Calendar, Clock, User } from 'lucide-react'
import Navbar from '@/components/navbar'
import { CookieSettingsLink } from '@/components/cookie-consent/cookie-settings-link'

const POST = {"title": "Title Tag Pixel Width Explained — and How to Bulk-Check Yours", "excerpt": "Learn why title pixel width matters more than character count, what estimated limits mean, and how to bulk-check desktop and mobile widths from a sitemap.", "slug": "title-tag-pixel-width-explained", "date": "2026-11-27", "dateDisplay": "November 27, 2026", "updated": "2026-11-27", "readingTime": "9 min read", "author": "Ai Ranko", "category": "SEO", "url": "https://airanko.com/blog/title-tag-pixel-width-explained", "image": "/blog/title-tag-pixel-width-explained/title-tag-pixel-width-explained-featured.webp"}

export const metadata: Metadata = {
  title: { absolute: "Title Tag Pixel Width: How to Bulk-Check Yours" },
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
    images: [{ url: POST.image, width: 1200, height: 630, alt: "Checking how a search title might be cut off" }],
    locale: 'en_GB',
    tags: ['SEO', 'Title Tags', 'Pixel Width'],
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
  '@id': `${POST.url}#article`,
  headline: POST.title,
  description: POST.excerpt,
  image: `https://airanko.com${POST.image}`,
  datePublished: POST.date,
  dateModified: POST.updated,
  author: { '@type': 'Organization', name: 'Ai Ranko', url: 'https://airanko.com/' },
  publisher: {
    '@type': 'Organization', name: 'Ai Ranko', url: 'https://airanko.com/',
    logo: { '@type': 'ImageObject', url: 'https://airanko.com/images/ai-ranko-logo.webp' },
  },
  mainEntityOfPage: { '@type': 'WebPage', '@id': POST.url },
  url: POST.url,
  inLanguage: 'en-GB',
  articleSection: POST.category,
}

const faqs = [{"q": "How is pixel width different from character count?", "a": "Character count measures how many characters a title contains. Pixel width measures their horizontal space using particular font settings. Wide and narrow letters mean two titles with the same character count can have different widths."}, {"q": "Has Google published an official title pixel width?", "a": "No official fixed title pixel limit is published in Google’s title-link guidance. It explains that displayed titles can be shortened to fit device width. A checker’s thresholds are estimates, not Google requirements."}, {"q": "Should I check desktop or mobile widths?", "a": "Check both. Review whether the page’s main purpose stays clear in each preview. Keep useful wording rather than shortening everything simply to obtain a passing status."}, {"q": "Can I bulk-check every page on my site?", "a": "Ai Ranko supports up to 300 pages per scan. Sitemap discovery also has limits, so compare the results with your intended page list. One completed scan does not confirm that an entire large website was checked."}, {"q": "Will fixing pixel width improve my rankings?", "a": "Not by itself. A width check can help you review possible truncation, but fitting an estimated threshold does not guarantee better rankings, clicks or exact search-result wording."}, {"q": "Does the checker render JavaScript?", "a": "No. It reads the returned HTML without running the page’s JavaScript. Metadata added only through JavaScript may therefore be missing from the report."}]

const faqJsonLd = {
  '@context': 'https://schema.org', '@type': 'FAQPage', '@id': `${POST.url}#faq`,
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question', name: faq.q, acceptedAnswer: { '@type': 'Answer', text: faq.a },
  })),
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://airanko.com/' },
    { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://airanko.com/blog' },
    { '@type': 'ListItem', position: 3, name: POST.title, item: POST.url },
  ],
}

export default function TitleTagPixelWidthBlogPost() {
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

            <h1 className="font-heading text-3xl font-bold leading-tight tracking-tight text-balance sm:text-4xl lg:text-5xl">{POST.title}</h1>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Title tag pixel width is the horizontal space your title takes up when displayed in a particular font and size. It is more useful than character count when checking whether a search title might get cut off. Wide letters take more room than narrow ones, so equally long titles can display differently."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Google does not publish an official title pixel limit. A checker measures your wording against estimated thresholds, rather than predicting exactly what every searcher will see. Check desktop and mobile results, put the page’s main purpose early, and review the wording before shortening it."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"With Ai Ranko, you can check titles and descriptions from a sitemap, one URL or a selected list. Here is how to read those measurements and turn them into useful edits."}</p>
</header>
<Image src="/blog/title-tag-pixel-width-explained/title-tag-pixel-width-explained-featured.webp" alt="Checking how a search title might be cut off" width={1200} height={630} priority className="mb-8 mt-6 w-full rounded-3xl border border-border object-cover" />
<section className="mb-14">
<h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"Short answer: why pixel width matters more than character count"}</h2>
<Image src="/blog/title-tag-pixel-width-explained/wide-vs-narrow-letter-title.webp" alt="Wide and narrow letters that change a title's width" width={1200} height={800} className="mb-8 mt-6 w-full rounded-3xl border border-border object-cover" />
<p className="mt-4 leading-relaxed text-muted-foreground">{"A character count tells you how many letters, spaces and symbols a title contains. Pixel width tells you how much horizontal space that text uses under the checker’s chosen display settings."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Consider wide letters such as W and M beside narrow letters such as i and l. Repeating either group can produce very different widths, even when the character counts match."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Capital letters, punctuation and spaces also contribute to the final measurement. This makes a fixed character target a rough guide rather than a dependable way to predict truncation."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"A title tag length checker can help you spot unusually long wording. A pixel measurement adds another useful check: whether the important words fit within the tool’s estimated display space."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Neither measurement tells you whether the title describes the page well. A short, vague title can fit comfortably while giving a searcher very little reason to choose the page."}</p>
</section>
<section className="mb-14">
<h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"What Google actually says about title length"}</h2>
<p className="mt-4 leading-relaxed text-muted-foreground"><Link href="https://developers.google.com/search/docs/appearance/title-link" className="font-semibold text-primary hover:underline">{"Google’s title-link guidance"}</Link>{" says there is no length limit for the title element. Search results may shorten the displayed title to fit the available device width. That differs from having a fixed character allowance."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"It helps to separate two things: the title stored in your page’s HTML and the title link someone sees in Google."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Your HTML provides information Google can use. The search result is Google’s presentation of the page, which may use different wording."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Treat a Google title tag pixel width checker as a way to review your supplied text. It cannot promise that Google will display that exact text, font or layout."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Descriptions need the same care. "}<Link href="https://developers.google.com/search/docs/appearance/snippet" className="font-semibold text-primary hover:underline">{"Google’s snippet guidance"}</Link>{" explains that snippets mainly come from page content, although Google sometimes uses the meta description. The displayed text can vary with the search query."}</p>
</section>
<section className="mb-14">
<h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"The estimated limits this checker uses (and why they are estimates)"}</h2>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Ai Ranko’s meta title and description pixel checker uses these estimated thresholds:"}</p>
<div className="mt-6 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr><th className="border-b border-border p-3">{"Text"}</th><th className="border-b border-border p-3">{"Desktop estimate"}</th><th className="border-b border-border p-3">{"Mobile estimate"}</th></tr></thead><tbody><tr><td className="border-b border-border p-3">{"Title"}</td><td className="border-b border-border p-3">{"600px"}</td><td className="border-b border-border p-3">{"580px"}</td></tr><tr><td className="border-b border-border p-3">{"Description"}</td><td className="border-b border-border p-3">{"920px"}</td><td className="border-b border-border p-3">{"680px"}</td></tr></tbody></table></div>
<p className="mt-4 leading-relaxed text-muted-foreground">{"These are the tool’s working estimates, not official Google limits. A result within them does not guarantee that the full wording will appear in search."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"There is also a difference between measuring text and predicting Google’s display. The checker measures text using your browser’s canvas text renderer. Its thresholds and search previews remain approximate."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"The live page states that it uses Arial, with Helvetica and sans-serif fallbacks. It measures titles at different desktop and mobile font sizes, while descriptions use the same font size for both."}</p>
<h3 className="mt-8 font-heading text-xl font-semibold text-foreground">{"Check desktop and mobile separately"}</h3>
<Image src="/blog/title-tag-pixel-width-explained/mobile-and-desktop-serp-preview.webp" alt="Comparing desktop and mobile search previews" width={1200} height={800} className="mb-8 mt-6 w-full rounded-3xl border border-border object-cover" />
<p className="mt-4 leading-relaxed text-muted-foreground">{"Do not assume a comfortable desktop result means the mobile version needs no attention."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Read both previews and look at where the important meaning sits. If a page’s purpose only becomes clear at the end, shortening an opening phrase may help preserve that meaning."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Avoid removing useful details simply to get a passing badge. A title still needs to identify the page clearly. The preview helps you judge that trade-off; it does not make the decision for you."}</p>
</section>
<section className="mb-14">
<h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"How to bulk-check titles and descriptions (sitemap, one URL, or a list)"}</h2>
<Image src="/blog/title-tag-pixel-width-explained/bulk-pixel-checker-results-blurred.webp" alt="Reviewing a bulk title and description scan" width={1200} height={800} className="mb-8 mt-6 w-full rounded-3xl border border-border object-cover" />
<p className="mt-4 leading-relaxed text-muted-foreground">{"The checker is free to use without signing up. It supports three input modes, with bulk scans covering up to 300 pages per scan."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Choose the mode that matches your task. A sitemap scan helps review a group of published pages. A single URL suits a recent edit. A selected list keeps attention on a particular set of pages."}</p>
<h3 className="mt-8 font-heading text-xl font-semibold text-foreground">{"Scan pages from a sitemap"}</h3>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Choose "}<strong>{"Website (Sitemap)"}</strong>{" and enter your website’s home address."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Select a page limit of 25, 50, 100, 200 or 300. The default is 50. Then select "}<strong>{"Check Pixel Widths"}</strong>{"."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"The tool checks Sitemap directives in robots.txt. If none are listed, it tries "}<code>{"/sitemap.xml"}</code>{" and "}<code>{"/sitemap_index.xml"}</code>{". It uses the first sitemap candidate that returns URLs, then fetches pages up to the selected limit."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"The live instructions also state that nested indexes are followed up to three levels below the first sitemap, with up to ten child sitemaps per index."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"This is a limited scan, not proof that every page on the website has been checked. Compare the returned URLs with the pages you intended to review."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"If your site has no suitable sitemap, the "}<Link href="/tools/xml-sitemap-generator" className="font-semibold text-primary hover:underline">{"XML sitemap generator"}</Link>{" can help you prepare one. Our "}<Link href="/blog/html-sitemap-vs-xml-sitemap" className="font-semibold text-primary hover:underline">{"HTML sitemap versus XML sitemap guide"}</Link>{" explains which type this workflow needs."}</p>
<h3 className="mt-8 font-heading text-xl font-semibold text-foreground">{"Check one URL"}</h3>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Choose "}<strong>{"Single URL"}</strong>{", enter the full public page address and run the check."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"This is useful after editing one page, or when you want to understand the report before scanning a larger group."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"In a live test for this guide, example.com returned the title “Example Domain”. The report also flagged a missing description. That is a useful reminder: a short title and a successful fetch do not mean all metadata is present."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"For your own page, compare the returned title and description with what you expected to publish. Investigate unexpected wording before deciding that the width itself needs fixing."}</p>
<h3 className="mt-8 font-heading text-xl font-semibold text-foreground">{"Check a selected list"}</h3>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Choose "}<strong>{"Multiple URLs"}</strong>{" and enter addresses one per line or separated by commas."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Use this mode for pages affected by a shared template change, a group of articles or a set of service pages. Pasted lists also use the selected scan limit."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Keep a copy of the intended URL list. After scanning, compare it with the report so that a missing or unsuccessful result does not quietly disappear from your review."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"The tool fetches public pages. It does not sign into your website to inspect protected content."}</p>
</section>
<section className="mb-14">
<h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"How to read the results and export them"}</h2>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Start with the scan summary, then review individual rows. Check fetch errors and missing metadata before working through width warnings."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"A report can contain several different problems. Treating them all as “titles too long” can lead to unnecessary edits while leaving the real issue untouched."}</p>
<h3 className="mt-8 font-heading text-xl font-semibold text-foreground">{"Read width badges alongside the actual text"}</h3>
<p className="mt-4 leading-relaxed text-muted-foreground">{"The checker uses "}<strong>{"Good"}</strong>{", "}<strong>{"Near limit"}</strong>{" and "}<strong>{"Too long"}</strong>{" statuses to compare measured widths with its estimated thresholds."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Open a result and read the desktop and mobile previews. Ask whether a searcher can understand the page’s purpose from the words that remain visible."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Check the description separately. A clear title does not make an unclear description useful, and a comfortable meta description pixel width does not confirm that its wording matches the page."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Missing text measures no width. That means a width reading alone cannot confirm that metadata is complete. The live page also states that duplicate titles and descriptions are not flagged."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Review repeated wording yourself when comparing related pages. Several titles can fit their estimated space while still being difficult to tell apart."}</p>
<h3 className="mt-8 font-heading text-xl font-semibold text-foreground">{"Check missing descriptions and fetch errors"}</h3>
<p className="mt-4 leading-relaxed text-muted-foreground">{"The checker reads returned HTML without running the page’s JavaScript. If your site adds metadata only after JavaScript runs, the report may not contain the wording you see in your browser."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"It also uses the Open Graph description when the standard meta description is empty or missing."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"That fallback matters when interpreting a populated description field. Do not assume that seeing description text proves a standard meta description exists. Our guide to "}<Link href="/blog/how-to-check-meta-tags-on-any-website" className="font-semibold text-primary hover:underline">{"checking meta tags on any website"}</Link>{" covers that separate inspection."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"A fetch error means the checker could not successfully read the page. Check the address and whether it opens publicly before rewriting anything."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"A redirect can create another complication. If a protected page sends visitors to a public sign-in screen, the returned metadata may describe that screen."}</p>
<h3 className="mt-8 font-heading text-xl font-semibold text-foreground">{"Export a useful fix list"}</h3>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Use "}<strong>{"CSV"}</strong>{" when you want to review the scan in a spreadsheet. The export includes URLs, fetch status, errors, titles, descriptions, character counts, and desktop and mobile pixel widths."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Use "}<strong>{"JSON"}</strong>{" when you need the scan details and metadata in a structured format."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Add your own columns for the proposed wording, person responsible and review notes. Keep the original text beside the proposed edit so changes are easy to compare."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Group similar pages before making bulk changes. If the same long ending appears across many titles, investigate the shared template rather than editing each page without checking the cause."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Save the original export, publish the approved changes, then scan the same URLs again. Compare the returned text as well as the widths."}</p>
</section>
<section className="mb-14">
<h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"What to do if Google rewrites your title"}</h2>
<p className="mt-4 leading-relaxed text-muted-foreground">{"A different search title does not automatically mean your pixel measurement was wrong."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Google can build title links from several sources, including the title element and prominent page text. Its documentation discusses changes involving unclear, repeated or outdated titles. "}<Link href="https://developers.google.com/search/docs/appearance/title-link" className="font-semibold text-primary hover:underline">{"developers.google.com"}</Link></p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"First, check that the published title accurately describes the page. Then compare it with the main heading and the page’s visible subject."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Look for wording left behind after a content update. Also check whether a shared template gives many pages almost identical titles."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Do not repeatedly shorten a clear title just because Google displayed different wording for one query. Width is only one part of this review."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"If the wording needs work, use our guide to "}<Link href="/blog/how-to-write-meta-titles-and-descriptions" className="font-semibold text-primary hover:underline">{"writing meta titles and descriptions"}</Link>{". Keep the task here focused on measuring and checking the published result."}</p>
</section>
<section className="mb-14">
<h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"Related tools"}</h2>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Use the "}<Link href="/tools/meta-title-description-pixel-generator" className="font-semibold text-primary hover:underline">{"meta title and description generator"}</Link>{" when you need draft wording to review against estimated widths. Check its suggestions for accuracy and relevance before publishing."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"The "}<Link href="/tools/meta-checker" className="font-semibold text-primary hover:underline">{"Meta Checker"}</Link>{" is useful when your question concerns metadata and social sharing tags, rather than width alone."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"For a wider review, the "}<Link href="/tools/site-audit" className="font-semibold text-primary hover:underline">{"Site Audit tool"}</Link>{" offers 25+ checks across up to 15 pages. Our "}<Link href="/blog/how-to-run-a-free-seo-site-audit" className="font-semibold text-primary hover:underline">{"free SEO site audit walkthrough"}</Link>{" explains how to organise the findings."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Keep these jobs separate in your fix list. A width check reviews display space. Checking tag presence and investigating technical issues answer different questions about the same page."}</p>
</section>
<section className="mb-14">
<h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"Frequently asked questions"}</h2>
<div className="mt-6 space-y-3">{faqs.map((faq) => (
<details key={faq.q} className="group rounded-2xl border border-border bg-card">
<summary className="cursor-pointer px-5 py-4 font-heading text-sm font-semibold text-foreground">{faq.q}</summary>
<p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
</details>))}</div>
</section>
<section className="mb-14">
<h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"Check your title pixel widths"}</h2>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Start with a few important pages. Review missing metadata and fetch errors, compare desktop and mobile widths, and shorten wording only where it helps preserve the page’s meaning."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Open the free "}<Link href="/tools/meta-title-description-bulk-pixel-checker" className="font-semibold text-primary hover:underline">{"Ai Ranko bulk title and description pixel checker"}</Link>{", choose a sitemap, one URL or a selected list, and run your check."}</p>
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
