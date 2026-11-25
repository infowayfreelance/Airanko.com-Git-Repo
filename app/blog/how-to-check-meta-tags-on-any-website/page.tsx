import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight, Zap, Calendar, Clock, User } from 'lucide-react'
import Navbar from '@/components/navbar'
import { CookieSettingsLink } from '@/components/cookie-consent/cookie-settings-link'

const POST = {
  "title": "How to Check Meta Tags on Any Website (Title, Description, Open Graph and More)",
  "excerpt": "Check any page's title, description, robots, canonical and Open Graph tags three ways: page source, DevTools and a free bulk meta tag checker.",
  "slug": "how-to-check-meta-tags-on-any-website",
  "date": "2026-11-25",
  "dateDisplay": "November 25, 2026",
  "updated": "2026-11-25",
  "readingTime": "9 min read",
  "author": "Ai Ranko",
  "category": "SEO",
  "url": "https://airanko.com/blog/how-to-check-meta-tags-on-any-website",
  "image": "/blog/how-to-check-meta-tags-on-any-website/how-to-check-meta-tags-featured.webp"
}

export const metadata: Metadata = {
  title: 'How to Check Meta Tags on Any Website (Free Guide)',
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
    images: [{ url: POST.image, width: 1200, height: 630, alt: "Checking a web page's meta tags on a laptop." }],
    locale: 'en_US',
    tags: ['SEO', 'Meta Tags', 'Open Graph'],
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

const faqs = [
  {
    "q": "How do I see the meta tags of a website?",
    "a": "Open the page source and search for the tag names, inspect <head> in DevTools, or enter the URL into a meta tag checker. Compare source and rendered results when they disagree."
  },
  {
    "q": "How do I check Open Graph tags before sharing a link?",
    "a": "Inspect og:title, og:type, og:image and og:url, then review the description where present. Open the image address and test the link on the intended platform."
  },
  {
    "q": "Why does my link preview show the wrong image or title?",
    "a": "The page may contain old or conflicting tags, the image may be inaccessible, or the platform may have cached an earlier preview. Check the live metadata before requesting a refresh."
  },
  {
    "q": "Can I check meta tags for many URLs at once?",
    "a": "Yes. Ai Ranko provides URL List and Bulk Paste modes. Enter addresses separated by newlines or commas, run the check and review each result. Investigate failed requests separately."
  },
  {
    "q": "Does Google always use my meta description?",
    "a": "No. Google may create a snippet from the page’s content and show different text for different searches. A different snippet does not automatically mean your description tag is broken."
  },
  {
    "q": "What is the difference between View Source and Inspect for meta tags?",
    "a": "View Source shows the HTML returned for the page. Inspect shows the browser’s current document structure, which scripts can change after loading. Comparing them can reveal metadata added or replaced later."
  }
]

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

export default function CheckMetaTagsBlogPost() {
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
<p className="mt-4 leading-relaxed text-muted-foreground">{"A page can look right while its metadata tells a different story. An old title, missing description or wrong sharing image may stay hidden until someone finds the page in search or shares its link."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"You can check meta tags without writing code. View the page source, inspect the rendered page in your browser, or use a meta tag checker to review several URLs. This guide explains all three methods and shows how to investigate a broken link preview."}</p>
          </header>
<Image src="/blog/how-to-check-meta-tags-on-any-website/how-to-check-meta-tags-featured.webp" alt="Checking a web page's meta tags on a laptop." width={1200} height={630} priority className="mb-8 mt-6 w-full rounded-3xl border border-border object-cover" />
<section className="mb-14">
<h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"Short answer: three ways to check meta tags"}</h2>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Use page source for the returned HTML, DevTools for the current page structure, and an online checker for a clearer review across URLs."}</p>
<div className="mt-6 overflow-x-auto rounded-2xl border border-border"><table className="w-full text-left text-sm"><thead><tr>
<th className="border-b border-border bg-muted px-4 py-3 font-semibold">{"Method"}</th>
<th className="border-b border-border bg-muted px-4 py-3 font-semibold">{"Best starting point"}</th>
</tr></thead><tbody>
<tr><td className="border-b border-border px-4 py-3 leading-relaxed text-muted-foreground">{"View page source"}</td><td className="border-b border-border px-4 py-3 leading-relaxed text-muted-foreground">{"Check what the server sends before page scripts change it."}</td></tr>
<tr><td className="border-b border-border px-4 py-3 leading-relaxed text-muted-foreground">{"DevTools"}</td><td className="border-b border-border px-4 py-3 leading-relaxed text-muted-foreground">{"Investigate tags added or changed after loading."}</td></tr>
<tr><td className="border-b border-border px-4 py-3 leading-relaxed text-muted-foreground">{"Meta tag checker"}</td><td className="border-b border-border px-4 py-3 leading-relaxed text-muted-foreground">{"Review extracted values and compare several pages."}</td></tr>
</tbody></table></div>
<p className="mt-4 leading-relaxed text-muted-foreground">{"These methods answer slightly different questions. If their results disagree, keep both findings rather than assuming one must be wrong."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Start with the exact public URL you want to check. A homepage, product page and article can each have different metadata, even when they share the same website template."}</p>
</section>
<section className="mb-14">
<h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"Which tags should you check?"}</h2>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Check the tags that describe the page, guide indexing and shape shared-link previews."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"People often call all of these “meta tags”. Strictly speaking, the page title uses a "}<code className="rounded bg-muted px-1.5 py-0.5 text-sm">{"<title>"}</code>{" element, while a canonical address normally uses a "}<code className="rounded bg-muted px-1.5 py-0.5 text-sm">{"<link>"}</code>{" element. They still belong in the same practical audit."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"The "}<Link href="https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta" className="font-semibold text-primary hover:underline">{"MDN meta element reference"}</Link>{" explains how metadata names and values work."}</p>
<div className="mt-6 overflow-x-auto rounded-2xl border border-border"><table className="w-full text-left text-sm"><thead><tr>
<th className="border-b border-border bg-muted px-4 py-3 font-semibold">{"Item"}</th>
<th className="border-b border-border bg-muted px-4 py-3 font-semibold">{"What to look for"}</th>
</tr></thead><tbody>
<tr><td className="border-b border-border px-4 py-3 leading-relaxed text-muted-foreground"><code className="rounded bg-muted px-1.5 py-0.5 text-sm">{"<title>"}</code></td><td className="border-b border-border px-4 py-3 leading-relaxed text-muted-foreground">{"A clear title for this particular page."}</td></tr>
<tr><td className="border-b border-border px-4 py-3 leading-relaxed text-muted-foreground"><code className="rounded bg-muted px-1.5 py-0.5 text-sm">{"meta name=\"description\""}</code></td><td className="border-b border-border px-4 py-3 leading-relaxed text-muted-foreground">{"A useful summary that matches the content."}</td></tr>
<tr><td className="border-b border-border px-4 py-3 leading-relaxed text-muted-foreground"><code className="rounded bg-muted px-1.5 py-0.5 text-sm">{"meta name=\"robots\""}</code></td><td className="border-b border-border px-4 py-3 leading-relaxed text-muted-foreground">{"Indexing instructions, especially an unexpected "}<code className="rounded bg-muted px-1.5 py-0.5 text-sm">{"noindex"}</code>{"."}</td></tr>
<tr><td className="border-b border-border px-4 py-3 leading-relaxed text-muted-foreground"><code className="rounded bg-muted px-1.5 py-0.5 text-sm">{"link rel=\"canonical\""}</code></td><td className="border-b border-border px-4 py-3 leading-relaxed text-muted-foreground">{"The intended preferred address for this content."}</td></tr>
<tr><td className="border-b border-border px-4 py-3 leading-relaxed text-muted-foreground"><code className="rounded bg-muted px-1.5 py-0.5 text-sm">{"meta name=\"viewport\""}</code></td><td className="border-b border-border px-4 py-3 leading-relaxed text-muted-foreground">{"A mobile viewport setting."}</td></tr>
<tr><td className="border-b border-border px-4 py-3 leading-relaxed text-muted-foreground">{"Open Graph tags"}</td><td className="border-b border-border px-4 py-3 leading-relaxed text-muted-foreground">{"The intended social title, image, page type and URL."}</td></tr>
<tr><td className="border-b border-border px-4 py-3 leading-relaxed text-muted-foreground">{"Twitter Card tags"}</td><td className="border-b border-border px-4 py-3 leading-relaxed text-muted-foreground">{"Card settings and any separate title, description or image."}</td></tr>
</tbody></table></div>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Do not confuse the title tag with the visible H1. They may use similar wording, but checking the heading alone does not reveal the document title."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Also check whether each value belongs to the page you opened. A valid tag containing another product’s name is still a problem."}</p>
</section>
<section className="mb-14">
<h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"Method 1: view the page source"}</h2>
<Image src="/blog/how-to-check-meta-tags-on-any-website/view-page-source-meta-tags.webp" alt="Page source showing the meta tags in the head section." width={1200} height={800} className="mb-8 mt-6 w-full rounded-3xl border border-border object-cover" />
<p className="mt-4 leading-relaxed text-muted-foreground">{"View Source lets you inspect the HTML your browser received for the page."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"On a desktop browser, open the page and look for "}<strong>{"View page source"}</strong>{" in the right-click menu. Menu wording and availability vary between browsers. In Chrome on Windows, the usual shortcut is "}<strong>{"Ctrl+U"}</strong>{"."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Use the source window’s search function to find:"}</p>
<ul className="mt-4 space-y-2 pl-6 list-disc text-muted-foreground">
<li className="leading-relaxed"><code className="rounded bg-muted px-1.5 py-0.5 text-sm">{"<title"}</code></li>
<li className="leading-relaxed"><code className="rounded bg-muted px-1.5 py-0.5 text-sm">{"name=\"description\""}</code></li>
<li className="leading-relaxed"><code className="rounded bg-muted px-1.5 py-0.5 text-sm">{"name=\"robots\""}</code></li>
<li className="leading-relaxed"><code className="rounded bg-muted px-1.5 py-0.5 text-sm">{"rel=\"canonical\""}</code></li>
<li className="leading-relaxed"><code className="rounded bg-muted px-1.5 py-0.5 text-sm">{"name=\"viewport\""}</code></li>
<li className="leading-relaxed"><code className="rounded bg-muted px-1.5 py-0.5 text-sm">{"og:"}</code></li>
<li className="leading-relaxed"><code className="rounded bg-muted px-1.5 py-0.5 text-sm">{"twitter:"}</code></li>
</ul>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Search for the tag names rather than expecting an exact layout. Websites may use single quotes, different spacing or attributes in a different order."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"For each match, read the value beside it. In a description tag, that is normally the "}<code className="rounded bg-muted px-1.5 py-0.5 text-sm">{"content"}</code>{" value. In a canonical link, look at "}<code className="rounded bg-muted px-1.5 py-0.5 text-sm">{"href"}</code>{"."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Check the surrounding markup too. A tag name inside a script or code example is not necessarily an active tag for the page."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Record missing values and suspicious duplicates. Do not edit the source window expecting to update the website; this method is for inspection."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Source inspection is especially useful when a social preview looks wrong. It gives you a starting point for checking whether the intended sharing tags are present before browser scripts run."}</p>
</section>
<section className="mb-14">
<h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"Method 2: inspect the rendered head in DevTools"}</h2>
<p className="mt-4 leading-relaxed text-muted-foreground">{"DevTools shows the page structure your browser is currently using, including changes made after loading."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Right-click the page and choose "}<strong>{"Inspect"}</strong>{". Open the "}<strong>{"Elements"}</strong>{" panel, find "}<code className="rounded bg-muted px-1.5 py-0.5 text-sm">{"<head>"}</code>{" and expand it. Search within that panel for the same tag names you checked in the source."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"The browser represents the page as a document structure called the DOM. Scripts can change that structure, which explains why it may differ from the original HTML. "}<Link href="https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model" className="font-semibold text-primary hover:underline">{"developer.mozilla.org"}</Link></p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Compare a few important values between the two views:"}</p>
<ul className="mt-4 space-y-2 pl-6 list-disc text-muted-foreground">
<li className="leading-relaxed">{"Does the title change after the page loads?"}</li>
<li className="leading-relaxed">{"Does a description appear only in DevTools?"}</li>
<li className="leading-relaxed">{"Are extra Open Graph tags added later?"}</li>
<li className="leading-relaxed">{"Does navigating to another page leave old metadata behind?"}</li>
</ul>
<p className="mt-4 leading-relaxed text-muted-foreground">{"A difference is a clue, not a complete diagnosis. Some preview crawlers may miss tags added by JavaScript, so do not assume they see everything your browser shows."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"If you manage the website, pass the comparison to the person responsible for its templates or metadata settings."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Changes made directly in DevTools affect your local view. Publish the correction through the website’s normal editor or code before testing it again."}</p>
</section>
<section className="mb-14">
<h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"Method 3: check one or many URLs with a free meta tag checker"}</h2>
<Image src="/blog/how-to-check-meta-tags-on-any-website/ai-ranko-meta-checker-results.webp" alt="Ai Ranko meta tag checker results for several URLs." width={1200} height={800} className="mb-8 mt-6 w-full rounded-3xl border border-border object-cover" />
<p className="mt-4 leading-relaxed text-muted-foreground">{"Use the "}<Link href="/tools/meta-checker" className="font-semibold text-primary hover:underline">{"free bulk meta tag checker"}</Link>{" when you want extracted values without searching through HTML."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Ai Ranko’s page offers "}<strong>{"URL List"}</strong>{" and "}<strong>{"Bulk Paste"}</strong>{" modes. You can add URL rows or enter addresses separated by newlines or commas. The action button is labelled "}<strong>{"Check Meta Tags"}</strong>{"."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"A practical workflow is:"}</p>
<ol className="mt-4 space-y-2 pl-6 list-decimal text-muted-foreground">
<li className="leading-relaxed">{"Enter the public page address."}</li>
<li className="leading-relaxed">{"Check that it is the intended URL."}</li>
<li className="leading-relaxed">{"Select "}<strong>{"Check Meta Tags"}</strong>{"."}</li>
<li className="leading-relaxed">{"Review the result and its status."}</li>
<li className="leading-relaxed">{"Open the "}<strong>{"Meta Tags"}</strong>{", "}<strong>{"Open Graph"}</strong>{" and "}<strong>{"Twitter Card"}</strong>{" tabs."}</li>
</ol>
<p className="mt-4 leading-relaxed text-muted-foreground">{"During a check on 25 November 2026, "}<code className="rounded bg-muted px-1.5 py-0.5 text-sm">{"https://example.com"}</code>{" returned "}<strong>{"Success"}</strong>{". The result showed the title "}<strong>{"Example Domain"}</strong>{", with a title count of 14 characters. The Description field showed "}<strong>{"Not set"}</strong>{"."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"The results also included a "}<strong>{"SERP PREVIEW"}</strong>{" and an "}<strong>{"Export JSON"}</strong>{" option. Treat the preview as an illustration of the extracted data, rather than a promise about the final search result."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"For a larger review, prepare your URL list first. The "}<Link href="/tools/link-extractor" className="font-semibold text-primary hover:underline">{"website link extractor"}</Link>{" can help collect links, but review the list for repeated addresses and unrelated destinations before submitting it."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Use manageable batches and inspect unsuccessful results separately. A failed fetch does not prove that a page has no metadata."}</p>
</section>
<section className="mb-14">
<h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"What to look for: missing, duplicate, too long or wrong tags"}</h2>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Review the meaning of each finding before changing the page."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground"><strong>{"Missing tags:"}</strong>{" Decide whether the missing field matters for that page. A missing description needs a different response from an accidental "}<code className="rounded bg-muted px-1.5 py-0.5 text-sm">{"noindex"}</code>{". Do not treat every empty field as equally urgent."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground"><strong>{"Duplicate tags on one page:"}</strong>{" Look for competing titles, descriptions or social values. A template and an SEO plugin may both be adding metadata. Correct the source of the conflict rather than adding another tag."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground"><strong>{"Repeated descriptions across pages:"}</strong>{" Compare distinct pages side by side. A single-page check cannot establish how many other pages use the same description. Record the values in a spreadsheet if you need a cross-page comparison."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground"><strong>{"Overlong text:"}</strong>{" Review whether the main message is clear before shortening it. Character counts are useful clues, but they do not guarantee how much text will appear on every screen."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Google’s "}<Link href="https://developers.google.com/search/docs/appearance/title-link" className="font-semibold text-primary hover:underline">{"title-link guidance"}</Link>{" explains that it can build search titles from several sources and truncate them to fit the available width."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Use the "}<Link href="/tools/meta-title-description-bulk-pixel-checker" className="font-semibold text-primary hover:underline">{"bulk title and description pixel checker"}</Link>{" for a separate width review. This article focuses on checking the live tags rather than setting writing limits."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"For replacement copy, try the "}<Link href="/tools/meta-title-description-pixel-generator" className="font-semibold text-primary hover:underline">{"meta title and description generator"}</Link>{", or follow the "}<Link href="/blog/how-to-write-meta-titles-and-descriptions" className="font-semibold text-primary hover:underline">{"guide to writing meta titles and descriptions"}</Link>{"."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground"><strong>{"Wrong values:"}</strong>{" Check for staging domains, old product names, unrelated images and canonical URLs pointing somewhere unexpected."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground"><strong>{"Indexing instructions:"}</strong>{" Investigate unexpected "}<code className="rounded bg-muted px-1.5 py-0.5 text-sm">{"noindex"}</code>{" values carefully. Missing robots metadata does not prove there are no restrictions: instructions can also arrive through an "}<code className="rounded bg-muted px-1.5 py-0.5 text-sm">{"X-Robots-Tag"}</code>{" HTTP response header. Google documents both methods in its "}<Link href="https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag" className="font-semibold text-primary hover:underline">{"robots guidance"}</Link>{"."}</p>
</section>
<section className="mb-14">
<h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"Why a shared link preview looks wrong"}</h2>
<Image src="/blog/how-to-check-meta-tags-on-any-website/link-preview-broken-vs-fixed.webp" alt="Broken and fixed link previews after correcting Open Graph tags." width={1200} height={800} className="mb-8 mt-6 w-full rounded-3xl border border-border object-cover" />
<p className="mt-4 leading-relaxed text-muted-foreground">{"A wrong preview may come from the page’s tags, an inaccessible image or a previously cached result."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Check the published page before changing the image repeatedly. Otherwise, you may replace a correct file while the real problem remains in the metadata."}</p>
<h3 className="mt-6 font-heading text-xl font-semibold text-foreground">{"Check the page address and social tags"}</h3>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Copy the exact address you are sharing. Open it and check where it ends up after any redirect."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Then inspect "}<code className="rounded bg-muted px-1.5 py-0.5 text-sm">{"og:title"}</code>{", "}<code className="rounded bg-muted px-1.5 py-0.5 text-sm">{"og:type"}</code>{", "}<code className="rounded bg-muted px-1.5 py-0.5 text-sm">{"og:image"}</code>{" and "}<code className="rounded bg-muted px-1.5 py-0.5 text-sm">{"og:url"}</code>{". These are the four basic properties defined by the "}<Link href="https://ogp.me/" className="font-semibold text-primary hover:underline">{"Open Graph protocol"}</Link>{". Also review "}<code className="rounded bg-muted px-1.5 py-0.5 text-sm">{"og:description"}</code>{" where present."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Make sure the values describe the same page. The title should not name an older article, and the image URL should point to the intended file."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Check Twitter Card fields separately if the platform you are testing uses them. Different services may choose different fields or display them differently."}</p>
<h3 className="mt-6 font-heading text-xl font-semibold text-foreground">{"Check image access and cached previews"}</h3>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Open the image URL in a private browser window. If it requires a login, returns an error or shows the wrong file, investigate that before requesting another preview."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"This browser check is useful evidence, but it cannot prove that every platform’s crawler can fetch the image. Access rules may affect different clients differently."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"If the live tags and image are correct, use the platform’s own preview inspection or refresh option where available. Previously fetched data may remain cached after your website changes."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Test a fresh share after the refresh. Do not add random URL parameters as your main fix; identify whether the problem is the page data, image access or stored preview."}</p>
</section>
<section className="mb-14">
<h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"After you fix tags: re-check and keep a record"}</h2>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Re-check the public page after publishing, then record what changed and what you observed."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Use the same URL and inspection methods as before. Compare the source, rendered head and checker result where they previously disagreed."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"A simple record needs these fields:"}</p>
<ul className="mt-4 space-y-2 pl-6 list-disc text-muted-foreground">
<li className="leading-relaxed">{"Page URL."}</li>
<li className="leading-relaxed">{"Date checked."}</li>
<li className="leading-relaxed">{"Original value or problem."}</li>
<li className="leading-relaxed">{"Published correction."}</li>
<li className="leading-relaxed">{"Follow-up result."}</li>
<li className="leading-relaxed">{"Any remaining uncertainty."}</li>
</ul>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Check another page using the same template. A shared setting may have changed several pages, or a page-level override may still be replacing the intended value."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Keep search results separate from live metadata. Google may select page text for a snippet rather than display your description, as its "}<Link href="https://developers.google.com/search/docs/appearance/snippet" className="font-semibold text-primary hover:underline">{"snippet documentation"}</Link>{" explains."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"For a wider review, use the "}<Link href="/tools/site-audit" className="font-semibold text-primary hover:underline">{"site audit tool"}</Link>{" and the "}<Link href="/blog/how-to-run-a-free-seo-site-audit" className="font-semibold text-primary hover:underline">{"free SEO site audit guide"}</Link>{". Metadata checks are one part of understanding a website."}</p>
</section>
<section className="mb-14">
<h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"Frequently asked questions"}</h2>
<div className="mt-6 space-y-3">{faqs.map((faq) => (
  <details key={faq.q} className="group rounded-2xl border border-border bg-card">
    <summary className="cursor-pointer px-5 py-4 font-heading text-sm font-semibold text-foreground">{faq.q}</summary>
    <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
  </details>
))}</div>
</section>
<section className="mb-14">
<h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"Check your meta tags now"}</h2>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Start with a page you recently published or a link whose preview looks wrong. Run it through the "}<Link href="/tools/meta-checker" className="font-semibold text-primary hover:underline">{"Ai Ranko Meta & Open Graph Checker"}</Link>{", review the extracted values and verify any correction on the live page."}</p>
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
