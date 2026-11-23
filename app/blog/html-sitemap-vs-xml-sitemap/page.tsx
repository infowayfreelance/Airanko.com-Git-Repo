import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight, Zap, Calendar, Clock, User } from 'lucide-react'
import Navbar from '@/components/navbar'
import { CookieSettingsLink } from '@/components/cookie-consent/cookie-settings-link'

const POST = {
  title:
    "HTML Sitemap vs XML Sitemap: What's the Difference and Do You Need Both?",
  excerpt:
    'XML sitemaps help search engines find your pages; HTML sitemaps help people navigate. Learn the differences, when you need each, and how to create them.',
  slug: 'html-sitemap-vs-xml-sitemap',
  date: '2026-11-22',
  dateDisplay: 'November 22, 2026',
  updated: '2026-11-23',
  readingTime: '9 min read',
  author: 'Ai Ranko',
  category: 'SEO',
  url: 'https://airanko.com/blog/html-sitemap-vs-xml-sitemap',
  image:
    '/blog/html-sitemap-vs-xml-sitemap/html-sitemap-vs-xml-sitemap-featured.webp',
}

export const metadata: Metadata = {
  title: 'HTML Sitemap vs XML Sitemap: Do You Need Both?',
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
    tags: ['SEO', 'HTML Sitemaps', 'XML Sitemaps'],
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
  headline:
    "HTML Sitemap vs XML Sitemap: What's the Difference and Do You Need Both?",
  description:
    'XML sitemaps help search engines find your pages; HTML sitemaps help people navigate. Learn the differences, when you need each, and how to create them.',
  image:
    'https://airanko.com/blog/html-sitemap-vs-xml-sitemap/html-sitemap-vs-xml-sitemap-featured.webp',
  datePublished: '2026-11-22',
  dateModified: '2026-11-23',
  author: {
    '@type': 'Organization',
    name: 'Ai Ranko',
    url: 'https://airanko.com/',
  },
  publisher: {
    '@type': 'Organization',
    name: 'Ai Ranko',
    url: 'https://airanko.com/',
  },
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': 'https://airanko.com/blog/html-sitemap-vs-xml-sitemap',
  },
  url: 'https://airanko.com/blog/html-sitemap-vs-xml-sitemap',
  inLanguage: 'en-GB',
}

const faqs = [
  {
    "q": "What is the main difference between an HTML sitemap and an XML sitemap?",
    "a": "An HTML sitemap is a directory people can browse. An XML sitemap is a structured file search engines can read to discover page URLs. They may share destinations, but they present those links differently and serve different readers."
  },
  {
    "q": "Does every website need both sitemap formats?",
    "a": "No. An XML sitemap can be useful even when the site has good navigation, particularly as it grows. An HTML sitemap is optional. Add it if an organised directory helps visitors, rather than assuming both formats are required for every site."
  },
  {
    "q": "Can I submit an HTML sitemap in Search Console?",
    "a": "The Sitemaps section expects a supported sitemap format, not a normal HTML directory page. Submit an XML sitemap or another supported format there. Keep your HTML sitemap available through ordinary website links so visitors can reach it."
  },
  {
    "q": "Will submitting an XML sitemap get all my pages indexed?",
    "a": "No. Submission provides information about URLs you want discovered. Search engines still decide whether to crawl and index each page. If a page is missing from search, investigate its accessibility, indexing settings and content rather than repeatedly submitting the same file."
  },
  {
    "q": "How many URLs can one XML sitemap contain?",
    "a": "One sitemap can contain at most 50,000 URLs and must be no larger than 50MB uncompressed. Both limits apply. A larger collection needs separate files, which can be referenced in a sitemap index. An online generator may impose a smaller processing limit."
  },
  {
    "q": "Should lastmod change whenever I deploy my website?",
    "a": "Only when the listed page has genuinely received a significant update. Rebuilding unchanged pages is not a content update. Use a reliable page-specific modification date, and omit the optional field if you cannot maintain accurate values."
  },
  {
    "q": "Which pages should I leave out of an XML sitemap?",
    "a": "Leave out unwanted duplicates, tracking variants, redirects, error pages and pages marked noindex. Use the preferred canonical URLs for public pages you want in search. Review private or account-only destinations separately rather than including them just because a crawler found a link."
  }
]
const faqJsonLd = {
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({ '@type': 'Question', name: faq.q, acceptedAnswer: { '@type': 'Answer', text: faq.a } })),
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://airanko.com/',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Blog',
      item: 'https://airanko.com/blog',
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: "HTML Sitemap vs XML Sitemap: What's the Difference and Do You Need Both?",
      item: 'https://airanko.com/blog/html-sitemap-vs-xml-sitemap',
    },
  ],
}

export default function HtmlVsXmlSitemapBlogPost() {
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
<p className="mt-4 leading-relaxed text-muted-foreground">{"An HTML sitemap and an XML sitemap may contain some of the same links, but they solve different problems. One gives visitors another way to browse a website. The other provides search engines with a structured list of URLs."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"You do not need to choose a winner. Start by asking what is missing from your site: a reliable way to share important URLs with crawlers, a useful directory for people, or both. This guide explains the difference and shows how to create and check each format without treating either as a ranking shortcut."}</p>
          </header>
<Image
            src="/blog/html-sitemap-vs-xml-sitemap/html-sitemap-vs-xml-sitemap-featured.webp"
            alt={
              'Laptop split screen showing XML sitemap code beside an HTML sitemap page'
            }
            width={1672}
            height={940}
            priority
            className="mb-8 mt-6 w-full rounded-3xl border border-border object-cover"
          />
<section className="mb-14"><h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"Short answer: HTML sitemap vs XML sitemap"}</h2>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Use an XML sitemap to list the canonical pages you want search engines to discover. Use an HTML sitemap when a browsable directory would help visitors find useful sections. Keep your normal navigation and contextual links working well whichever format you add."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"For example, a small training website might have an XML file listing its courses and guides. Its HTML sitemap could group links under Courses, Learning Resources and Contact. The two lists need not look identical because their readers have different needs."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"A sitemap can support discovery, but it cannot make an unsuitable page deserve indexing or repair confusing navigation by itself. Treat it as one part of maintaining a clear, accessible website."}</p></section>
<section className="mb-14"><h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"What is an XML sitemap?"}</h2>
<Image
              src="/blog/html-sitemap-vs-xml-sitemap/xml-sitemap-code-editor.webp"
              alt={
                'Code editor showing an XML sitemap with urlset and loc tags'
              }
              width={724}
              height={543}
              className="mb-8 mt-6 w-full rounded-3xl border border-border object-cover"
            />
<p className="mt-4 leading-relaxed text-muted-foreground">{"An XML sitemap is a machine-readable file containing page addresses in a defined structure. It may include information about when a page changed. You will often find one at /sitemap.xml, although websites can use other locations or a sitemap index pointing to several files."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground"><Link href="https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview" className="font-semibold text-primary hover:underline">{"Google's sitemap overview"}</Link>{" explains where these files help. They are particularly useful for large or new sites, and for content that is harder to discover through links. A small, well-linked site may already be easy to crawl. Having an XML file is useful in many cases, but it is not a universal requirement."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Here is a simple example for a fictional website. The date should describe a genuine update to the listed page."}</p><pre className="mt-6 overflow-x-auto rounded-2xl border border-border bg-muted p-4 text-sm"><code>{"<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n  <url>\n    <loc>https://example.com/courses</loc>\n    <lastmod>2026-11-23</lastmod>\n  </url>\n</urlset>"}</code></pre><p className="mt-4 leading-relaxed text-muted-foreground">{"A valid XML file still needs a sensible URL list. If it contains old redirects or unwanted pages, correct the source list rather than assuming successful parsing means everything is ready."}</p></section>
<section className="mb-14"><h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"What is an HTML sitemap?"}</h2>
<Image
              src="/blog/html-sitemap-vs-xml-sitemap/html-sitemap-footer-page.webp"
              alt={'Tablet showing an HTML sitemap page with grouped links'}
              width={724}
              height={543}
              className="mb-8 mt-6 w-full rounded-3xl border border-border object-cover"
            />
<p className="mt-4 leading-relaxed text-muted-foreground">{"An HTML sitemap is a normal web page with organised links. Visitors can read it, follow a category and jump to another part of the site. It usually works best as a clear directory, with labels that explain the destinations."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"For a training business, “Courses” is a more useful heading than “Pages 1–50”. Within that group, descriptive course names help people decide where to go. A directory of unrelated URLs with vague labels is harder to use, even when every link technically works."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"You can see an example of a visitor-facing directory on the "}<Link href="/sitemap" className="font-semibold text-primary hover:underline">{"Ai Ranko sitemap page"}</Link>{". Your own version should reflect your website's structure. A short site may only need a few groups. A larger catalogue may benefit from category directories instead of one very long list."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Search engines can follow ordinary HTML links, but this page is not the XML file you submit in Search Console."}</p></section>
<section className="mb-14"><h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"HTML sitemap vs XML sitemap: side by side"}</h2>
<div className="mt-6 overflow-x-auto"><table className="w-full border-collapse text-left text-sm"><thead><tr><th className="border border-border bg-muted px-4 py-3">Question</th><th className="border border-border bg-muted px-4 py-3">HTML sitemap</th><th className="border border-border bg-muted px-4 py-3">XML sitemap</th></tr></thead><tbody><tr><td className="border border-border px-4 py-3">Main reader</td><td className="border border-border px-4 py-3">Website visitors</td><td className="border border-border px-4 py-3">Search-engine crawlers</td></tr><tr><td className="border border-border px-4 py-3">Format</td><td className="border border-border px-4 py-3">A normal HTML page</td><td className="border border-border px-4 py-3">A structured XML file</td></tr><tr><td className="border border-border px-4 py-3">Organisation</td><td className="border border-border px-4 py-3">Groups and descriptive link labels</td><td className="border border-border px-4 py-3">URL entries and optional metadata</td></tr><tr><td className="border border-border px-4 py-3">Typical location</td><td className="border border-border px-4 py-3">A directory linked from the footer</td><td className="border border-border px-4 py-3">A public file such as /sitemap.xml</td></tr><tr><td className="border border-border px-4 py-3">Search Console submission</td><td className="border border-border px-4 py-3">Not a supported sitemap file</td><td className="border border-border px-4 py-3">Supported sitemap format</td></tr><tr><td className="border border-border px-4 py-3">Main review</td><td className="border border-border px-4 py-3">Useful labels and working links</td><td className="border border-border px-4 py-3">Valid syntax and appropriate URLs</td></tr></tbody></table></div><p className="mt-4 leading-relaxed text-muted-foreground">{"The overlap is the need for accurate links. Both formats become less useful when they point at removed pages or overlook important new sections. Give each one a clear maintenance process rather than adding it once and forgetting it."}</p></section>
<section className="mb-14"><h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"Do you need both?"}</h2>
<p className="mt-4 leading-relaxed text-muted-foreground">{"An XML sitemap is often a practical addition, especially when your content changes regularly or your site has many pages. First check whether your CMS already produces one. Maintaining two competing files by hand can create avoidable confusion about which list is current."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"An HTML sitemap is optional. Add one when it provides a useful route through your content. It may help visitors who prefer browsing categories, or who reach the footer without finding their destination. It is less useful when it merely repeats a short, clear menu."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Before creating a new directory, review the underlying navigation. Can someone reach the main categories from the homepage? Do related articles link to each other? Is the contact page easy to find? Those questions remain important even if your sitemaps are complete."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"If you maintain both, let them share a reliable source of page information where possible. They can still apply different selection rules: the XML file lists search destinations, while the HTML page groups links around what people need."}</p></section>
<section className="mb-14"><h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"How to create an XML sitemap"}</h2>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Begin with your CMS or website framework. Find out whether it already generates a sitemap and updates it when content changes. If it does, review that output before installing another generator."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"For a separate file, use the "}<Link href="/tools/xml-sitemap-generator" className="font-semibold text-primary hover:underline">{"Ai Ranko XML sitemap generator"}</Link>{" as a starting point. It can read an existing sitemap or discover pages through a bounded crawl. Check its current options and limits, then review the URLs it returns. A generator's output is not proof that each page should be indexed."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Keep the preferred public URL for each page. Remove destinations that redirect, return errors, require a login or are marked noindex. Avoid tracking variations and duplicate versions. Confirm that the remaining addresses use the intended host and protocol."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground"><Link href="https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap" className="font-semibold text-primary hover:underline">{"Google's build-and-submit guidance"}</Link>{" describes the file requirements. A single sitemap must stay within both the URL-count and uncompressed-size limits. Large sites can use multiple files and an index. These are protocol requirements, separate from any free tool's crawl allowance."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Upload the finished file to a public location, commonly the site root. Reference its address in robots.txt and submit it through Search Console's Sitemaps section. Read any processing errors before considering the task complete."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground"><strong>{"What to do next:"}</strong>{" Open the uploaded file directly and check a sample of its URLs against the pages you meant to include."}</p></section>
<section className="mb-14"><h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"How to create an HTML sitemap"}</h2>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Plan the directory before generating its markup. Write down the sections visitors recognise, such as Services, Products, Guides and Support. Use your actual site categories rather than forcing everything into a generic template."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"The "}<Link href="/tools/html-sitemap-generator" className="font-semibold text-primary hover:underline">{"Ai Ranko HTML sitemap generator"}</Link>{" can help prepare a starting list. Review its output and edit the groups and link labels for your audience. Do not publish the raw list simply because the tool found the URLs."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Link to useful destinations, with text that makes sense out of context. “Returns and Refunds” explains more than “Read More”. For a large catalogue, link to helpful category pages instead of making visitors scan every product in one directory."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Place the HTML sitemap where people can find it, often through a footer link. Check it on a phone as well as a desktop. Headings, spacing and keyboard access should make the list easy to browse. Avoid hiding the whole directory behind a control that is difficult to operate."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground"><strong>{"What to do next:"}</strong>{" Ask someone to locate a specific page using the directory. If they cannot tell which group to choose, improve the labels before adding more links."}</p></section>
<section className="mb-14"><h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"Common sitemap mistakes to avoid"}</h2>
<p className="mt-4 leading-relaxed text-muted-foreground"><strong>{"Listing URLs you do not want indexed."}</strong>{" An XML sitemap should support your preferred search destinations. A noindex page sends a conflicting message. Review the page's purpose and settings rather than removing a directive just to silence a sitemap warning."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground"><strong>{"Keeping outdated addresses."}</strong>{" When a page moves, update sitemap entries and internal links to the destination you intend people and crawlers to use. A redirect can serve a migration purpose, but it should not become a permanent excuse for stale lists."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground"><strong>{"Giving every page today's date."}</strong>{" A deployment or file rebuild does not mean every article changed. Store a real content-modification date for each page where possible. If you cannot provide a reliable lastmod value, leaving the optional field out is better than repeatedly publishing a misleading one."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground"><strong>{"Expecting settings to force crawling."}</strong>{" Priority and changefreq are not instructions that make Google visit a page on demand. Do not spend time adjusting those fields while the site has broken links or missing content."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground"><strong>{"Treating an HTML directory as a repair for orphan pages."}</strong>{" A link there may help discovery, but an important page should also fit naturally into the relevant section of your site. Add useful links where readers would expect them."}</p></section>
<section className="mb-14"><h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"How to check your sitemaps"}</h2>
<Image
              src="/blog/html-sitemap-vs-xml-sitemap/sitemap-checking-laptop.webp"
              alt={
                'Laptop showing an abstract sitemap status report next to a checklist'
              }
              width={724}
              height={543}
              className="mb-8 mt-6 w-full rounded-3xl border border-border object-cover"
            />
<p className="mt-4 leading-relaxed text-muted-foreground">{"Open the XML file in a browser and confirm that it loads. Check Search Console for processing information. Then inspect a sample of the actual destinations. Include a recently added page, a recently updated page and an older important page rather than choosing only the homepage."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"For the HTML version, follow links from each group. The "}<Link href="/tools/link-extractor" className="font-semibold text-primary hover:underline">{"link extractor"}</Link>{" can help list links on a page for review. You still need to check whether those destinations are appropriate and whether the labels describe them clearly."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Keep a small record of problems and who will fix them. After publishing the changes, repeat the same checks. For a wider review, try the "}<Link href="/tools/site-audit" className="font-semibold text-primary hover:underline">{"site audit tool"}</Link>{" or follow the "}<Link href="/blog/how-to-run-a-free-seo-site-audit" className="font-semibold text-primary hover:underline">{"free SEO audit guide"}</Link>{". Sitemap maintenance is one part of that work, rather than a replacement for checking the pages themselves."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground"><strong>{"What to do next:"}</strong>{" Repeat this review after a migration, a category restructure or a large content update, when stale URLs are more likely to appear."}</p></section>
<section className="mb-14"><h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"Frequently asked questions"}</h2>
<div className="mt-6 space-y-3">{faqs.map((faq) => (<details key={faq.q} className="group rounded-2xl border border-border bg-card"><summary className="cursor-pointer px-5 py-4 font-heading text-sm font-semibold text-foreground">{faq.q}</summary><p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{faq.a}</p></details>))}</div></section>
<section className="mb-14"><h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"Create your sitemaps now"}</h2>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Check what your website already provides, then fill the useful gap. Start with the "}<Link href="/tools/xml-sitemap-generator" className="font-semibold text-primary hover:underline">{"XML sitemap generator"}</Link>{" for a search-engine URL list, or the "}<Link href="/tools/html-sitemap-generator" className="font-semibold text-primary hover:underline">{"HTML sitemap generator"}</Link>{" for a visitor directory. Review either result before publishing it."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Keep ownership of the update process clear so new pages and removed content are handled consistently. For more practical guides, visit the "}<Link href="/blog" className="font-semibold text-primary hover:underline">{"Ai Ranko blog"}</Link>{". You can also use the "}<Link href="/contact" className="font-semibold text-primary hover:underline">{"contact page"}</Link>{" to ask about a tool. The aim is a maintained, understandable website with accurate links, not simply another file to tick off a checklist."}</p></section>
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
