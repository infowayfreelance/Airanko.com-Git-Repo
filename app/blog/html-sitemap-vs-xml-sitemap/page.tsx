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
  updated: '2026-11-22',
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
  dateModified: '2026-11-22',
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

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is the main difference between an HTML sitemap and an XML sitemap?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'An XML sitemap is a file for search engines that lists the URLs you want discovered. An HTML sitemap is a web page for visitors that lists your important pages as clickable links.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do I need an HTML sitemap for SEO?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Not usually. Search engines can follow links on an HTML sitemap, which can help discovery, but it does not replace an XML sitemap. Add one mainly if it helps visitors find their way around.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I submit an HTML sitemap to Google Search Console?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "No. Google's John Mueller has said an HTML sitemap cannot be processed in the same way as an XML sitemap file. Submit your XML sitemap in Search Console instead.",
      },
    },
    {
      '@type': 'Question',
      name: 'Where should my XML sitemap be located?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Usually at the root of your site, such as /sitemap.xml. Reference it in your robots.txt file and submit it in Google Search Console.',
      },
    },
    {
      '@type': 'Question',
      name: 'How many URLs can an XML sitemap contain?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Google's documentation says one sitemap file can contain up to 50,000 URLs or 50MB uncompressed. Larger sites use several sitemaps listed in a sitemap index.",
      },
    },
    {
      '@type': 'Question',
      name: 'Does Google use priority and changefreq in sitemaps?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Google says it ignores priority and changefreq. It may use lastmod if the dates are consistently accurate.',
      },
    },
    {
      '@type': 'Question',
      name: 'Should every page be in my sitemap?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Include canonical, indexable pages that you want to appear in search. Leave out redirects, error pages, noindex pages and duplicates.',
      },
    },
  ],
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

            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                '"Sitemap" is one of those words that means two different things. Ask a developer and they will probably think of an XML file for search engines. Ask a visitor and they will think of a page of links they can click. Both are called sitemaps, both list the pages on your site, but they do different jobs for different audiences.'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'This guide explains what each one is, how they differ, whether you need both, and how to create and check them, with practical steps you can follow today.'
              }
            </p>
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
          <section className="mb-14">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">
              {'Short answer: HTML sitemap vs XML sitemap'}
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
              <li>
                {'An '}
                <strong className="text-foreground">{'XML sitemap'}</strong>
                {' is a machine-readable file, usually at '}
                <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                  {'/sitemap.xml'}
                </code>
                {
                  ', that lists the URLs you want search engines to discover. Visitors rarely see it.'
                }
              </li>
              <li>
                {'An '}
                <strong className="text-foreground">{'HTML sitemap'}</strong>
                {
                  ' is a normal web page with links to your main pages, organised so that people can find their way around.'
                }
              </li>
            </ul>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'Most websites should have an XML sitemap. An HTML sitemap is optional: it is useful for larger or more complex sites, or as a helpful extra page, but it does not replace an XML sitemap and it is not a fix for poor navigation.'
              }
            </p>
          </section>
          <section className="mb-14">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">
              {'What is an XML sitemap?'}
            </h2>
            <Image
              src="/blog/html-sitemap-vs-xml-sitemap/xml-sitemap-code-editor.webp"
              alt={
                'Code editor showing an XML sitemap with urlset and loc tags'
              }
              width={724}
              height={543}
              className="mb-8 mt-6 w-full rounded-3xl border border-border object-cover"
            />
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'An XML sitemap is a structured file written in XML (Extensible Markup Language). It tells search engines which URLs exist on your site and can include extra details, such as when a page was last changed. A very simple one looks like this:'
              }
            </p>
            <pre className="mt-6 overflow-x-auto rounded-2xl border border-border bg-muted p-5 text-sm">
              <code className="language-xml">
                {
                  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>https://example.com/</loc>\n    <lastmod>2026-11-20</lastmod>\n  </url>\n  <url>\n    <loc>https://example.com/services/</loc>\n  </url>\n</urlset>'
                }
              </code>
            </pre>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {'Key points about XML sitemaps:'}
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
              <li>
                <strong className="text-foreground">
                  {'They are for crawlers, not people.'}
                </strong>
                {
                  ' Search engines read them to discover pages, especially new pages or pages that are not well linked.'
                }
              </li>
              <li>
                <strong className="text-foreground">
                  {'They are submitted to search engines.'}
                </strong>
                {
                  ' You can submit the sitemap in Google Search Console and reference it in your '
                }
                <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                  {'robots.txt'}
                </code>
                {' file with a '}
                <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                  {'Sitemap:'}
                </code>
                {' line.'}
              </li>
              <li>
                <strong className="text-foreground">
                  {'They have limits.'}
                </strong>
                {
                  " Google's documentation says a single sitemap file can hold up to 50,000 URLs or 50MB uncompressed. Bigger sites split their URLs across several sitemaps and list them in a sitemap index file."
                }
              </li>
              <li>
                <strong className="text-foreground">
                  {'Not every tag matters.'}
                </strong>
                {' Google says it ignores the '}
                <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                  {'priority'}
                </code>
                {' and '}
                <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                  {'changefreq'}
                </code>
                {' values, and uses '}
                <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                  {'lastmod'}
                </code>
                {' only when it is consistently accurate.'}
              </li>
              <li>
                <strong className="text-foreground">
                  {'A sitemap is a hint, not a command.'}
                </strong>
                {
                  ' Listing a URL helps discovery, but it does not guarantee the page will be crawled or indexed.'
                }
              </li>
            </ul>
          </section>
          <section className="mb-14">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">
              {'What is an HTML sitemap?'}
            </h2>
            <Image
              src="/blog/html-sitemap-vs-xml-sitemap/html-sitemap-footer-page.webp"
              alt={'Tablet showing an HTML sitemap page with grouped links'}
              width={724}
              height={543}
              className="mb-8 mt-6 w-full rounded-3xl border border-border object-cover"
            />
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'An HTML sitemap is a page on your website, often linked from the footer, that lists your important pages as clickable links. It is usually organised by section, for example Services, Locations, Tools, Blog, so visitors can see the structure of the site at a glance.'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {'Key points about HTML sitemaps:'}
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
              <li>
                <strong className="text-foreground">
                  {'They are for people first.'}
                </strong>
                {
                  ' Visitors use them when they cannot find something through the main menu or search.'
                }
              </li>
              <li>
                <strong className="text-foreground">
                  {'Search engines can follow the links.'}
                </strong>
                {
                  " Google's John Mueller has explained that if a crawler finds an HTML sitemap, it can follow those links like any other links, which can help discovery."
                }
              </li>
              <li>
                <strong className="text-foreground">
                  {'They cannot be submitted as a sitemap file.'}
                </strong>
                {
                  ' Mueller has also said an HTML sitemap is not a replacement for an XML sitemap, because it does not have the strict structure that sitemap processing needs.'
                }
              </li>
              <li>
                <strong className="text-foreground">
                  {'They do not need to list everything.'}
                </strong>
                {
                  ' On a shop, for example, an HTML sitemap might list categories rather than every product.'
                }
              </li>
            </ul>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {"You can see a working example on Ai Ranko's own "}
              <Link
                href={'https://airanko.com/sitemap'}
                className="font-semibold text-primary hover:underline"
              >
                {'HTML sitemap page'}
              </Link>
              {
                ', which lists the tools, blog posts and key pages in one place.'
              }
            </p>
          </section>
          <section className="mb-14">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">
              {'HTML sitemap vs XML sitemap: side by side'}
            </h2>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="border-b border-border px-4 py-3"
                    ></th>
                    <th
                      scope="col"
                      className="border-b border-border px-4 py-3"
                    >
                      {'XML sitemap'}
                    </th>
                    <th
                      scope="col"
                      className="border-b border-border px-4 py-3"
                    >
                      {'HTML sitemap'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border-b border-border px-4 py-3">
                      {'Main audience'}
                    </td>
                    <td className="border-b border-border px-4 py-3">
                      {'Search engine crawlers'}
                    </td>
                    <td className="border-b border-border px-4 py-3">
                      {'Human visitors'}
                    </td>
                  </tr>
                  <tr>
                    <td className="border-b border-border px-4 py-3">
                      {'Format'}
                    </td>
                    <td className="border-b border-border px-4 py-3">
                      {'XML file'}
                    </td>
                    <td className="border-b border-border px-4 py-3">
                      {'Normal web page'}
                    </td>
                  </tr>
                  <tr>
                    <td className="border-b border-border px-4 py-3">
                      {'Typical location'}
                    </td>
                    <td className="border-b border-border px-4 py-3">
                      <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                        {'/sitemap.xml'}
                      </code>
                      {' (or a sitemap index)'}
                    </td>
                    <td className="border-b border-border px-4 py-3">
                      {'A page such as '}
                      <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                        {'/sitemap'}
                      </code>
                      {', linked from the footer'}
                    </td>
                  </tr>
                  <tr>
                    <td className="border-b border-border px-4 py-3">
                      {'Submitted to Google'}
                    </td>
                    <td className="border-b border-border px-4 py-3">
                      {'Yes, via Search Console or '}
                      <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                        {'robots.txt'}
                      </code>
                    </td>
                    <td className="border-b border-border px-4 py-3">{'No'}</td>
                  </tr>
                  <tr>
                    <td className="border-b border-border px-4 py-3">
                      {'Extra data'}
                    </td>
                    <td className="border-b border-border px-4 py-3">
                      {'Optional '}
                      <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                        {'lastmod'}
                      </code>
                      {', plus image, video or news extensions'}
                    </td>
                    <td className="border-b border-border px-4 py-3">
                      {'Page titles and, optionally, short descriptions'}
                    </td>
                  </tr>
                  <tr>
                    <td className="border-b border-border px-4 py-3">
                      {'Includes every indexable URL'}
                    </td>
                    <td className="border-b border-border px-4 py-3">
                      {'Ideally, yes'}
                    </td>
                    <td className="border-b border-border px-4 py-3">
                      {'Usually the important pages or categories'}
                    </td>
                  </tr>
                  <tr>
                    <td className="border-b border-border px-4 py-3">
                      {'Helps visitors navigate'}
                    </td>
                    <td className="border-b border-border px-4 py-3">{'No'}</td>
                    <td className="border-b border-border px-4 py-3">
                      {'Yes'}
                    </td>
                  </tr>
                  <tr>
                    <td className="border-b border-border px-4 py-3">
                      {'Replaces good navigation'}
                    </td>
                    <td className="border-b border-border px-4 py-3">{'No'}</td>
                    <td className="border-b border-border px-4 py-3">{'No'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
          <section className="mb-14">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">
              {'Do you need both?'}
            </h2>
            <h3 className="mt-6 font-heading text-lg font-semibold text-foreground">
              {'You almost always need an XML sitemap'}
            </h3>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'An XML sitemap is low effort and helps search engines find your pages, especially when:'
              }
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
              <li>{'your site is new and has few external links;'}</li>
              <li>
                {
                  'your site is large, with many pages that are several clicks deep;'
                }
              </li>
              <li>
                {
                  'you publish new content often, such as a blog or news section;'
                }
              </li>
              <li>
                {'some pages are not well linked from the rest of the site.'}
              </li>
            </ul>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'Many content management systems and frameworks create one for you. Check that yours exists, is up to date and only includes the pages you want indexed.'
              }
            </p>
            <h3 className="mt-6 font-heading text-lg font-semibold text-foreground">
              {'An HTML sitemap is optional but often useful'}
            </h3>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {'An HTML sitemap is worth adding when:'}
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
              <li>
                {
                  'your site has many sections and the menu cannot show them all;'
                }
              </li>
              <li>
                {
                  'you have a lot of tools, categories or locations that visitors browse;'
                }
              </li>
              <li>
                {
                  'you want a simple, accessible page that lists everything important in one place;'
                }
              </li>
              <li>
                {
                  'you are improving accessibility or usability and want a clear fallback for navigation.'
                }
              </li>
            </ul>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'On a small site with a clear menu, an HTML sitemap adds little. Google\'s Mueller has said HTML sitemaps "should never be needed" if a site\'s navigation is good. In other words: fix navigation first, then add an HTML sitemap if it genuinely helps people.'
              }
            </p>
          </section>
          <section className="mb-14">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">
              {'How to create an XML sitemap'}
            </h2>
            <ol className="mt-4 list-decimal space-y-2 pl-6 text-muted-foreground">
              <li>
                <strong className="text-foreground">
                  {'Check whether you already have one.'}
                </strong>
                {' Try '}
                <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                  {'yourdomain.com/sitemap.xml'}
                </code>
                {' or '}
                <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                  {'yourdomain.com/sitemap_index.xml'}
                </code>
                {', and look for a '}
                <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                  {'Sitemap:'}
                </code>
                {' line in '}
                <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                  {'yourdomain.com/robots.txt'}
                </code>
                {'.'}
              </li>
              <li>
                <strong className="text-foreground">
                  {"Generate one if you don't."}
                </strong>
                {
                  ' Your CMS or a plugin may do it automatically. If not, a crawler-based tool such as the free '
                }
                <Link
                  href={'https://airanko.com/tools/xml-sitemap-generator'}
                  className="font-semibold text-primary hover:underline"
                >
                  {'Ai Ranko XML Sitemap Generator'}
                </Link>
                {' can crawl your site and build the file for you.'}
              </li>
              <li>
                <strong className="text-foreground">
                  {'Include only the right URLs.'}
                </strong>
                {
                  ' List canonical, indexable pages that return a 200 status. Leave out redirects, 404s, '
                }
                <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                  {'noindex'}
                </code>
                {' pages and duplicate versions of the same page.'}
              </li>
              <li>
                <strong className="text-foreground">
                  {'Upload it to your site root'}
                </strong>
                {', so it is available at a stable URL such as '}
                <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                  {'/sitemap.xml'}
                </code>
                {'.'}
              </li>
              <li>
                <strong className="text-foreground">
                  {'Reference it in robots.txt'}
                </strong>
                {' by adding a line like '}
                <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                  {'Sitemap: https://yourdomain.com/sitemap.xml'}
                </code>
                {'.'}
              </li>
              <li>
                <strong className="text-foreground">
                  {'Submit it in Google Search Console'}
                </strong>
                {' under Sitemaps, and check the report for errors.'}
              </li>
              <li>
                <strong className="text-foreground">
                  {'Keep it updated.'}
                </strong>
                {' Regenerate it when you add or remove pages, and keep '}
                <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                  {'lastmod'}
                </code>
                {' dates accurate if you use them.'}
              </li>
            </ol>
          </section>
          <section className="mb-14">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">
              {'How to create an HTML sitemap'}
            </h2>
            <ol className="mt-4 list-decimal space-y-2 pl-6 text-muted-foreground">
              <li>
                <strong className="text-foreground">
                  {'Decide what to include.'}
                </strong>
                {
                  ' List your main sections and important pages. On large sites, link to category or hub pages rather than every single URL.'
                }
              </li>
              <li>
                <strong className="text-foreground">
                  {'Group pages logically'}
                </strong>
                {', for example by section or URL path, with clear headings.'}
              </li>
              <li>
                <strong className="text-foreground">
                  {'Use descriptive link text.'}
                </strong>
                {' Use the page title rather than raw URLs.'}
              </li>
              <li>
                <strong className="text-foreground">
                  {'Generate it or build it by hand.'}
                </strong>
                {' The free '}
                <Link
                  href={'https://airanko.com/tools/html-sitemap-generator'}
                  className="font-semibold text-primary hover:underline"
                >
                  {'Ai Ranko HTML Sitemap Generator'}
                </Link>
                {
                  ' crawls a URL, groups pages automatically and lets you export the result in formats including standalone HTML, an HTML snippet and Markdown, with a live preview.'
                }
              </li>
              <li>
                <strong className="text-foreground">
                  {'Link it from your footer'}
                </strong>
                {' so visitors and crawlers can find it.'}
              </li>
              <li>
                <strong className="text-foreground">
                  {'Review it when your site changes.'}
                </strong>
                {' An HTML sitemap full of broken links is worse than none.'}
              </li>
            </ol>
          </section>
          <section className="mb-14">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">
              {'Common sitemap mistakes to avoid'}
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
              <li>
                <strong className="text-foreground">
                  {'Listing '}
                  <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                    {'noindex'}
                  </code>
                  {' pages in the XML sitemap.'}
                </strong>
                {
                  ' This sends mixed signals: the sitemap says "index this" while the page says "don\'t". Either remove the page from the sitemap or remove the '
                }
                <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                  {'noindex'}
                </code>
                {'.'}
              </li>
              <li>
                <strong className="text-foreground">
                  {'Including redirects and broken URLs.'}
                </strong>
                {
                  ' Every URL in your sitemap should return a 200 status and be the canonical version.'
                }
              </li>
              <li>
                <strong className="text-foreground">
                  {'Using '}
                  <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                    {'lastmod'}
                  </code>
                  {' as a build timestamp.'}
                </strong>
                {
                  ' If every URL shows the same date each time you deploy, the date is not useful. Use the real date each page last changed.'
                }
              </li>
              <li>
                <strong className="text-foreground">
                  {'Mixing http and https, or www and non-www.'}
                </strong>
                {' Use the exact canonical form of each URL.'}
              </li>
              <li>
                <strong className="text-foreground">
                  {'Forgetting to update after a redesign.'}
                </strong>
                {
                  ' Old URLs in the sitemap after a migration can slow down discovery of the new ones.'
                }
              </li>
              <li>
                <strong className="text-foreground">
                  {'Treating an HTML sitemap as a substitute for navigation.'}
                </strong>
                {
                  ' It should be a helpful extra, not the only way to reach important pages.'
                }
              </li>
            </ul>
          </section>
          <section className="mb-14">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">
              {'How to check your sitemaps'}
            </h2>
            <Image
              src="/blog/html-sitemap-vs-xml-sitemap/sitemap-checking-laptop.webp"
              alt={
                'Laptop showing an abstract sitemap status report next to a checklist'
              }
              width={724}
              height={543}
              className="mb-8 mt-6 w-full rounded-3xl border border-border object-cover"
            />
            <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
              <li>
                <strong className="text-foreground">
                  {'Open the XML sitemap in a browser'}
                </strong>
                {' and confirm it loads without errors.'}
              </li>
              <li>
                <strong className="text-foreground">
                  {'Check the Sitemaps report in Search Console'}
                </strong>
                {' for fetch errors and the number of URLs discovered.'}
              </li>
              <li>
                <strong className="text-foreground">{'Spot-check URLs'}</strong>
                {
                  ' to make sure they return a 200 status and are not redirected or blocked.'
                }
              </li>
              <li>
                <strong className="text-foreground">
                  {'Run a site audit'}
                </strong>
                {' to catch broken links, missing pages and '}
                <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                  {'noindex'}
                </code>
                {' conflicts. The free '}
                <Link
                  href={'https://airanko.com/tools/site-audit'}
                  className="font-semibold text-primary hover:underline"
                >
                  {'Ai Ranko Site Audit'}
                </Link>
                {' is a quick way to start; see our guide on '}
                <Link
                  href={
                    'https://airanko.com/blog/how-to-run-a-free-seo-site-audit'
                  }
                  className="font-semibold text-primary hover:underline"
                >
                  {'how to run a free SEO site audit'}
                </Link>
                {' for a step-by-step walkthrough.'}
              </li>
              <li>
                <strong className="text-foreground">
                  {'Extract links from your HTML sitemap'}
                </strong>
                {' and test them. The '}
                <Link
                  href={'https://airanko.com/tools/link-extractor'}
                  className="font-semibold text-primary hover:underline"
                >
                  {'Ai Ranko Link Extractor'}
                </Link>
                {
                  ' can pull every link from a page so you can check them in bulk.'
                }
              </li>
            </ul>
          </section>
          <section className="mb-14">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">
              {'Frequently asked questions'}
            </h2>
            <div className="mt-6 space-y-3">
              <details className="group rounded-2xl border border-border bg-card">
                <summary className="cursor-pointer px-5 py-4 font-heading text-sm font-semibold text-foreground">
                  {
                    'What is the main difference between an HTML sitemap and an XML sitemap?'
                  }
                </summary>
                <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                  {
                    'An XML sitemap is a file for search engines that lists the URLs you want discovered. An HTML sitemap is a web page for visitors that lists your important pages as clickable links.'
                  }
                </p>
              </details>
              <details className="group rounded-2xl border border-border bg-card">
                <summary className="cursor-pointer px-5 py-4 font-heading text-sm font-semibold text-foreground">
                  {'Do I need an HTML sitemap for SEO?'}
                </summary>
                <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                  {
                    'Not usually. Search engines can follow links on an HTML sitemap, which can help discovery, but it does not replace an XML sitemap. Add one mainly if it helps visitors find their way around.'
                  }
                </p>
              </details>
              <details className="group rounded-2xl border border-border bg-card">
                <summary className="cursor-pointer px-5 py-4 font-heading text-sm font-semibold text-foreground">
                  {'Can I submit an HTML sitemap to Google Search Console?'}
                </summary>
                <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                  {
                    "No. Google's John Mueller has said an HTML sitemap cannot be processed in the same way as an XML sitemap file. Submit your XML sitemap in Search Console instead."
                  }
                </p>
              </details>
              <details className="group rounded-2xl border border-border bg-card">
                <summary className="cursor-pointer px-5 py-4 font-heading text-sm font-semibold text-foreground">
                  {'Where should my XML sitemap be located?'}
                </summary>
                <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                  {'Usually at the root of your site, such as '}
                  <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                    {'/sitemap.xml'}
                  </code>
                  {'. Reference it in your '}
                  <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                    {'robots.txt'}
                  </code>
                  {' file and submit it in Google Search Console.'}
                </p>
              </details>
              <details className="group rounded-2xl border border-border bg-card">
                <summary className="cursor-pointer px-5 py-4 font-heading text-sm font-semibold text-foreground">
                  {'How many URLs can an XML sitemap contain?'}
                </summary>
                <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                  {
                    "Google's documentation says one sitemap file can contain up to 50,000 URLs or 50MB uncompressed. Larger sites use several sitemaps listed in a sitemap index."
                  }
                </p>
              </details>
              <details className="group rounded-2xl border border-border bg-card">
                <summary className="cursor-pointer px-5 py-4 font-heading text-sm font-semibold text-foreground">
                  {'Does Google use priority and changefreq in sitemaps?'}
                </summary>
                <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                  {'Google says it ignores '}
                  <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                    {'priority'}
                  </code>
                  {' and '}
                  <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                    {'changefreq'}
                  </code>
                  {'. It may use '}
                  <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                    {'lastmod'}
                  </code>
                  {' if the dates are consistently accurate.'}
                </p>
              </details>
              <details className="group rounded-2xl border border-border bg-card">
                <summary className="cursor-pointer px-5 py-4 font-heading text-sm font-semibold text-foreground">
                  {'Should every page be in my sitemap?'}
                </summary>
                <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                  {
                    'Include canonical, indexable pages that you want to appear in search. Leave out redirects, error pages, '
                  }
                  <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                    {'noindex'}
                  </code>
                  {' pages and duplicates.'}
                </p>
              </details>
            </div>
          </section>
          <section className="mb-14">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">
              {'Create your sitemaps now'}
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'Start by checking that your XML sitemap exists and is clean, then decide whether an HTML sitemap would genuinely help your visitors. You can build both for free with the '
              }
              <Link
                href={'https://airanko.com/tools/xml-sitemap-generator'}
                className="font-semibold text-primary hover:underline"
              >
                {'XML Sitemap Generator'}
              </Link>
              {' and the '}
              <Link
                href={'https://airanko.com/tools/html-sitemap-generator'}
                className="font-semibold text-primary hover:underline"
              >
                {'HTML Sitemap Generator'}
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
