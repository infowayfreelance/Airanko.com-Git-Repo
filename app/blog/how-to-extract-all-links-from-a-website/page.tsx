import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight, Zap, Calendar, Clock, User } from 'lucide-react'
import Navbar from '@/components/navbar'
import { CookieSettingsLink } from '@/components/cookie-consent/cookie-settings-link'

const POST = {
  "title": "How to Find and Export Links From a Website (Free, No Code)",
  "excerpt": "Extract internal and external website links without coding. Filter results, export a CSV and use your list to review broken links and site structure.",
  "slug": "how-to-extract-all-links-from-a-website",
  "date": "2026-11-24",
  "dateDisplay": "November 24, 2026",
  "updated": "2026-11-24",
  "readingTime": "9 min read",
  "author": "Ai Ranko",
  "category": "SEO",
  "url": "https://airanko.com/blog/how-to-extract-all-links-from-a-website",
  "image": "/blog/how-to-extract-all-links-from-a-website/how-to-extract-all-links-from-a-website-featured.webp"
}

export const metadata: Metadata = {
  title: 'How to Extract All Links From a Website (Free Guide)',
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
    images: [{ url: POST.image, width: 1200, height: 630, alt: 'Laptop showing a list of website links next to a site structure sketch.' }],
    locale: 'en_US',
    tags: ['SEO', 'Internal Links', 'Website Audits'],
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
    "q": "How do I get a list of all URLs on a website?",
    "a": "Combine a crawl with a known page inventory, such as a CMS export or sitemap. Review crawl limits and missing sections. One crawl may not discover every URL, particularly when pages are unlinked, restricted or dependent on JavaScript."
  },
  {
    "q": "Can I extract website links without coding?",
    "a": "Yes. A browser-based link extractor lets you enter a website address, run a crawl and review results through filters. Check its scope and output before treating the list as a complete website inventory."
  },
  {
    "q": "What is the difference between internal and external links?",
    "a": "Internal links connect pages within the website’s defined scope. External links point elsewhere. Subdomains and different hostnames can complicate classification, so review the crawler’s scope rather than relying solely on the filter name."
  },
  {
    "q": "How do I find orphan pages?",
    "a": "Compare pages you know exist with incoming internal links discovered across the site. Investigate pages with no recorded incoming links. An incomplete crawl can create false candidates, so confirm coverage before deciding a page is orphaned."
  },
  {
    "q": "Why are some links missing from my crawl?",
    "a": "Possible reasons include page limits, shallow depth, access restrictions, failed requests or links created after JavaScript runs. The starting URL and domain scope also matter. A missing result does not prove that the page or link is absent."
  },
  {
    "q": "Can I export website links to Excel?",
    "a": "CSV is suitable for opening in Excel and similar spreadsheet applications. Check that the export contains the fields you need, such as source pages and destinations. Keep the original export unchanged and make your edits in a working copy."
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

export default function ExtractWebsiteLinksBlogPost() {
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
<p className="mt-4 leading-relaxed text-muted-foreground">{"To extract links from a website without coding, enter its public address into a link crawler, review the crawl settings and start the scan. Filter the discovered links, then export the results for review."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"For one page, a manual browser check may be enough. For a whole website, use a crawler that follows internal links and can look for sitemap URLs."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"However, “all links” needs a little care. A crawl can miss pages because of its limits, access restrictions or the way a website loads content. Treat the export as an inventory of what the tool found, then check its coverage before calling it complete."}</p>
          </header>
<Image src="/blog/how-to-extract-all-links-from-a-website/how-to-extract-all-links-from-a-website-featured.webp" alt="Laptop showing a list of website links next to a site structure sketch." width={1200} height={630} priority className="mb-8 mt-6 w-full rounded-3xl border border-border object-cover" />
<section className="mb-14">
<h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"Quick answer: one page or the whole site?"}</h2>
<p className="mt-4 leading-relaxed text-muted-foreground">{"A single-page check examines links on one page. A whole-site crawl starts from an address and visits other pages within its settings. These are different jobs."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"There is also a difference between a "}<strong>{"page inventory"}</strong>{" and a "}<strong>{"link inventory"}</strong>{". A page inventory lists pages. A link inventory records destinations found on those pages, potentially including external websites, documents, email addresses and page anchors."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"The same destination can appear in several places. A contact-page link repeated in the menu is one destination with multiple occurrences."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Decide what you need before starting. For a migration, you need the pages that should move. For an internal-link review, you also need to know which pages link to each destination. A flat list of unique URLs cannot answer both questions equally well."}</p>
</section>
<section className="mb-14">
<h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"How to see links on a single page in your browser"}</h2>
<p className="mt-4 leading-relaxed text-muted-foreground">{"For a few links, open the page and work through its navigation, body content and footer. Use your browser’s link context menu to copy a destination address without following it."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Check expandable menus and other controls too. A link may only become visible after interaction."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Some browsers provide a page-source view where you can search for "}<code className="rounded bg-muted px-1.5 py-0.5 text-sm">{"href="}</code>{". This can help locate links in the returned HTML, but it is not a whole-site extraction method. Relative addresses may also need interpreting, and links added later by JavaScript may not appear there."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"For a larger review, collecting addresses manually becomes difficult to organise. A crawler provides a more practical starting list, provided you understand what it visited."}</p>
</section>
<section className="mb-14">
<h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"How to extract website links with Ai Ranko"}</h2>
<Image src="/blog/how-to-extract-all-links-from-a-website/link-extractor-crawl-settings.webp" alt="Ai Ranko Link Extractor with a website URL and crawl options entered." width={1200} height={800} className="mb-8 mt-6 w-full rounded-3xl border border-border object-cover" />
<h3 className="mt-6 font-heading text-xl font-semibold text-foreground">{"Enter the website address"}</h3>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Open the "}<Link href="https://airanko.com/tools/link-extractor" className="font-semibold text-primary hover:underline">{"Ai Ranko Link Extractor"}</Link>{". The opening interface has a "}<strong>{"Website URL"}</strong>{" field, a "}<strong>{"Crawl Site"}</strong>{" button and a "}<strong>{"Crawl options"}</strong>{" control."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Enter the public starting address. Use your intended website version, including the correct host and HTTPS address."}</p>
<h3 className="mt-6 font-heading text-xl font-semibold text-foreground">{"Review the crawl options"}</h3>
<p className="mt-4 leading-relaxed text-muted-foreground">{"When checked on 24 November 2026, the displayed defaults were "}<strong>{"100 pages, depth 3, same domain and sitemap on"}</strong>{"."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"These are the visible starting settings, not a promise that every website will be fully covered. Other copy on the page mentions a different maximum, so work up to the crawl limit shown in the tool rather than assuming a fixed allowance."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Review the scope before proceeding. A narrow starting section or a shallow crawl may exclude pages you need."}</p>
<h3 className="mt-6 font-heading text-xl font-semibold text-foreground">{"Run the crawl and inspect coverage"}</h3>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Select "}<strong>{"Crawl Site"}</strong>{". During the test, the interface showed progress information for pages crawled, queued pages, unique links and sitemap URLs."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"After completion, review "}<strong>{"All Links"}</strong>{" and "}<strong>{"Pages Crawled"}</strong>{". The latter helps you distinguish a small result from a genuinely wide review."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"The neutral test run reported one crawled page and no links. That confirms the interface completed a run, but does not establish that it found every link. Investigate unexpectedly empty results before using them to make changes."}</p>
</section>
<section className="mb-14">
<h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"Filtering results: internal, external, nofollow and files"}</h2>
<Image src="/blog/how-to-extract-all-links-from-a-website/link-extractor-filter-results.webp" alt="Link Extractor results filtered to show internal links." width={1200} height={800} className="mb-8 mt-6 w-full rounded-3xl border border-border object-cover" />
<p className="mt-4 leading-relaxed text-muted-foreground">{"The results interface provides "}<strong>{"Internal"}</strong>{", "}<strong>{"External"}</strong>{", "}<strong>{"Nofollow"}</strong>{" and "}<strong>{"Files"}</strong>{" filters. It also shows options for email, phone and anchor links."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Use internal links to examine connections within the site’s scope. Use external links to review destinations elsewhere. Check how your chosen scope treats subdomains before combining results."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"The nofollow filter helps identify links carrying that qualification. It does not tell you whether the destination is broken or whether the attribute is appropriate."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"File links can reveal PDFs, documents and other downloadable resources that deserve separate review."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Keep an unfiltered copy of your results before narrowing the list. A filter changes what you are looking at; it does not expand what the crawler discovered."}</p>
</section>
<section className="mb-14">
<h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"Exporting to CSV, TXT or JSON"}</h2>
<p className="mt-4 leading-relaxed text-muted-foreground">{"The interface displays "}<strong>{"CSV"}</strong>{", "}<strong>{"TXT"}</strong>{" and "}<strong>{"JSON"}</strong>{" export controls. On the empty test result, CSV and TXT were disabled."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Use CSV when you want to sort and annotate results in Excel or another spreadsheet. TXT is useful for a simple list. JSON suits workflows that need structured information."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"The tool page describes exports with source pages and occurrence information. Check the downloaded structure rather than assuming every format contains identical detail."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Keep the website address and crawl settings alongside the export. Add columns for the issue, proposed action, owner and review status in your working spreadsheet."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Avoid merging files from different crawls without recording their scope. Otherwise, a missing URL could simply belong to a section that was never scanned."}</p>
</section>
<section className="mb-14">
<h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"Why sitemaps and robots.txt help with discovery"}</h2>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Following links from the homepage is one discovery route. Reading a sitemap provides another list of known URLs, which may include pages the crawler did not reach through navigation."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"A robots.txt file can point to a sitemap through a Sitemap directive. It is not a complete list of website pages, and sitemap discovery does not reveal private content."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Google explains that sitemaps support URL discovery but do not guarantee crawling or indexing. Their contents also depend on how well the website maintains them. "}<Link href="https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview" className="font-semibold text-primary hover:underline">{"developers.google.com"}</Link></p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Read the guide to "}<Link href="https://airanko.com/blog/html-sitemap-vs-xml-sitemap" className="font-semibold text-primary hover:underline">{"HTML sitemaps versus XML sitemaps"}</Link>{" for the difference between a visitor directory and a search-engine file."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"For maintenance, explore the "}<Link href="https://airanko.com/tools/xml-sitemap-generator" className="font-semibold text-primary hover:underline">{"XML sitemap generator"}</Link>{" and review its output against your approved page inventory. An "}<Link href="https://airanko.com/tools/html-sitemap-generator" className="font-semibold text-primary hover:underline">{"HTML sitemap generator"}</Link>{" can help prepare a directory for visitors."}</p>
</section>
<section className="mb-14">
<h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"Five ways to use your link list"}</h2>
<h3 className="mt-6 font-heading text-xl font-semibold text-foreground">{"1. Review potentially broken internal links"}</h3>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Start with important journeys: navigation, enquiry forms, product pages and useful guides."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Check the destination before marking a link broken. A URL appearing in an export is not evidence that it returns an error. Confirm its response and whether it reaches the intended content."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Update links pointing to removed or unsuitable pages. Record the source page so you know where to make the edit."}</p>
<h3 className="mt-6 font-heading text-xl font-semibold text-foreground">{"2. Investigate possible orphan pages"}</h3>
<Image src="/blog/how-to-extract-all-links-from-a-website/site-structure-orphan-page-diagram.webp" alt="Diagram of a website structure with one orphan page not linked from any other page." width={1200} height={800} className="mb-8 mt-6 w-full rounded-3xl border border-border object-cover" />
<p className="mt-4 leading-relaxed text-muted-foreground">{"An orphan page lacks incoming internal links. A link-following crawl alone cannot reliably find something it has no route to discover."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Compare your known page inventory—from your CMS, sitemap or other records—with the incoming links found in the crawl."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"A page missing from the results is a candidate for investigation, not automatically an orphan. Check crawl coverage first, then add a useful contextual link if the page belongs in the site structure."}</p>
<h3 className="mt-6 font-heading text-xl font-semibold text-foreground">{"3. Review external destinations"}</h3>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Check whether linked references still support the surrounding content. An old source may have moved, changed its subject or disappeared."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Replace outdated references with suitable current sources where necessary. Do not label a website harmful merely because it is external or unfamiliar."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"For your own discovered pages, the "}<Link href="https://airanko.com/tools/meta-checker" className="font-semibold text-primary hover:underline">{"meta checker"}</Link>{" can provide another review step for titles and related metadata."}</p>
<h3 className="mt-6 font-heading text-xl font-semibold text-foreground">{"4. Check nofollow in context"}</h3>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Review why each link has its attributes. Do not remove nofollow everywhere in an attempt to improve rankings."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Google recommends "}<code className="rounded bg-muted px-1.5 py-0.5 text-sm">{"sponsored"}</code>{" for paid placements and "}<code className="rounded bg-muted px-1.5 py-0.5 text-sm">{"ugc"}</code>{" for user-generated links, with nofollow applicable in other circumstances. Its "}<Link href="https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links" className="font-semibold text-primary hover:underline">{"outbound-link guidance"}</Link>{" explains the distinctions."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Check the actual source-page link before changing it, particularly when one destination appears in several contexts."}</p>
<h3 className="mt-6 font-heading text-xl font-semibold text-foreground">{"5. Prepare a migration map"}</h3>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Keep old page URLs and their intended new destinations in separate columns. Add the source pages that still link to old addresses."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Review each mapping for relevance instead of sending every removed page to the homepage."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"After the migration, check redirects and update internal links to the intended destinations. Preserve the original inventory so you can investigate omissions."}</p>
</section>
<section className="mb-14">
<h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"Limits to know before trusting the list"}</h2>
<p className="mt-4 leading-relaxed text-muted-foreground">{"JavaScript can add links after the initial HTML loads. Do not assume a crawler renders the page exactly like your browser. Google’s "}<Link href="https://developers.google.com/search/docs/crawling-indexing/links-crawlable" className="font-semibold text-primary hover:underline">{"crawlable-link guidance"}</Link>{" also distinguishes ordinary anchor links from script-only controls."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Login requirements, request restrictions, timeouts, crawl depth and page limits can all reduce coverage. Crawl only permitted public content and respect the website’s access rules."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Keep indexing separate from extraction. A noindex instruction concerns search indexing; it does not make a public page or its links invisible. Google documents this distinction in its "}<Link href="https://developers.google.com/search/docs/crawling-indexing/block-indexing" className="font-semibold text-primary hover:underline">{"noindex guidance"}</Link>{"."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"For a wider review, Ai Ranko’s "}<Link href="https://airanko.com/tools/site-audit" className="font-semibold text-primary hover:underline">{"site audit tool"}</Link>{" provides 25+ checks across up to 15 pages. The "}<Link href="https://airanko.com/blog/how-to-run-a-free-seo-site-audit" className="font-semibold text-primary hover:underline">{"free SEO audit guide"}</Link>{" explains further steps. Link maintenance supports usability and discovery, but does not guarantee ranking improvements."}</p>
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
<h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"Try the Link Extractor"}</h2>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Start with your public homepage in the "}<Link href="https://airanko.com/tools/link-extractor" className="font-semibold text-primary hover:underline">{"Ai Ranko Link Extractor"}</Link>{". Review the crawl options, inspect the pages visited and filter the results for your task. Export the useful information, then verify each proposed change before editing your website."}</p>
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
