import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight, Zap, Calendar, Clock, User } from 'lucide-react'
import Navbar from '@/components/navbar'
import { CookieSettingsLink } from '@/components/cookie-consent/cookie-settings-link'

const POST = {
  title:
    'How to Write Meta Titles and Descriptions That Fit in Google Search Results',
  excerpt:
    'A practical guide to writing unique title tags and meta descriptions, including why pixel width matters more than a strict character count.',
  slug: 'how-to-write-meta-titles-and-descriptions',
  date: '2026-11-20',
  dateDisplay: 'November 20, 2026',
  updated: '2026-11-20',
  readingTime: '10 min read',
  author: 'Junaid Mazhar',
  category: 'SEO',
  url: 'https://airanko.com/blog/how-to-write-meta-titles-and-descriptions',
  image:
    '/blog/how-to-write-meta-titles-and-descriptions/how-to-write-meta-titles-and-descriptions-featured.webp',
}

export const metadata: Metadata = {
  title: 'How to Write Meta Titles and Descriptions',
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
    tags: ['SEO', 'Title Tags', 'Meta Descriptions'],
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
  about: [{ '@type': 'Thing', name: 'Title tags and meta descriptions' }],
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
    q: 'Is there an official Google character limit for title tags or meta descriptions?',
    a: "No. Google's documentation states that there is no official length limit for the <title> element or the meta description. The title link and the snippet are truncated as needed, typically to fit the device width. Ranges such as 50–60 or 150–160 characters are rules of thumb only.",
  },
  {
    q: 'Why is my title cut off in search results?',
    a: 'Because the title link is shortened to fit the available width on that device. Wide letters, a long brand suffix or a title that only becomes specific at the end are common reasons the useful words disappear. Preview pixel width, and put the important words first.',
  },
  {
    q: 'Can Google rewrite my title or ignore my meta description?',
    a: 'Yes. Google may build the title link from the <title>, the visible heading, og:title or other sources, and may rewrite titles that are vague, stuffed, boilerplate or a poor match for the page. Snippets are primarily taken from page content; the meta description is used only when Google finds it more accurate.',
  },
  {
    q: 'Should the title tag and the H1 be identical?',
    a: 'They should describe the same page, but they do not have to use the same wording. Keep one clear main heading, and avoid a visible title that contradicts the <title> tag. Agreement reduces the chance of an unexpected title link; it does not prevent every rewrite.',
  },
  {
    q: 'How do I write unique descriptions for many similar pages?',
    a: 'Reuse a short, honest pattern, then change the details that actually differ — the product, the city, the topic, a date or a key fact. Google allows programmatic descriptions when they stay human-readable and diverse. Avoid one template sentence with a single swapped noun. Prioritise your most important URLs first.',
  },
  {
    q: 'Do meta titles and descriptions directly improve rankings?',
    a: 'They are not a reliable ranking lever on their own. Their main job is to describe the page clearly and help the right people click. Poor or stuffed titles can also be rewritten. No preview tool can promise a ranking change.',
  },
  {
    q: 'How can I check pixel width before I publish?',
    a: "Paste the draft into a pixel preview such as Ai Ranko's meta title and description pixel generator, or use the bulk pixel checker for several pages. After you publish, confirm the live tags with the meta checker. Treat the preview as an estimate, not an official limit.",
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

export default function MetaTitlesAndDescriptionsBlogPost() {
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
                'A clear title and description will not, on their own, move a page to the top of Google. They do something more ordinary and more useful: they help a person scanning a results page decide whether to click.'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {'The title tag is the text you put in the HTML '}
              <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                {'<title>'}
              </code>
              {
                " element. Google uses it as one source when it builds the title link — the headline of the result. The meta description is a short summary in the page's HTML. Google sometimes uses it as the snippet under that headline, and sometimes writes the snippet from the page itself."
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                "This guide is a practical writing process. It starts with what Google actually documents: there is no official character limit, and text is truncated to fit the device. The familiar ranges of about 50–60 characters for a title and 150–160 for a description are only rules of thumb. You will then draft unique titles and descriptions, preview them by pixel width with Ai Ranko's free tools, and check what is already live. The tools cannot promise better rankings, and they cannot stop Google rewriting a title."
              }
            </p>
          </header>
          <Image
            src="/blog/how-to-write-meta-titles-and-descriptions/how-to-write-meta-titles-and-descriptions-featured.webp"
            alt={
              'Laptop showing a generic search result with a title and snippet'
            }
            width={1600}
            height={900}
            priority
            className="mb-8 mt-6 w-full rounded-3xl border border-border object-cover"
          />
          <section className="mb-14">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">
              {'Short answer: what a meta title and meta description are for'}
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {'The meta title (the '}
              <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                {'<title>'}
              </code>
              {
                ' tag) and the meta description are the two short pieces of text you control that most often influence how a page appears in a search result. The title link is usually the first thing someone reads. The snippet is the short supporting line underneath.'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'They are there to describe the page accurately and to help the right person click. They are not a hidden ranking switch. A stuffed or boilerplate title can even work against you, because Google may choose different text, and because people skip results that look unhelpful.'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'Write a unique, descriptive title for every important page, with the most useful words first. Write a unique description that pitches the page in plain language and, where it helps, includes a fact a reader would want to know.'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'What to do next: before you start counting characters, read what Google actually says about length.'
              }
            </p>
          </section>
          <section className="mb-14">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">
              {'What Google actually says about length'}
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                "Google's Search Central documentation is more precise than most blog checklists, and more modest."
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {'On '}
              <Link
                href={
                  'https://developers.google.com/search/docs/appearance/title-link'
                }
                className="font-semibold text-primary hover:underline"
              >
                {'title links'}
              </Link>
              {', Google says every page should have a '}
              <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                {'<title>'}
              </code>
              {
                ' element, and that the text should be descriptive and concise. There is no limit on how long that element can be. The title link is truncated in search results as needed, typically to fit the device width. Google also says it may build the title link from other sources — including the main visual title, heading elements, '
              }
              <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                {'og:title'}
              </code>
              {
                ', prominent text and links — and that it may generate a different title when the '
              }
              <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                {'<title>'}
              </code>
              {' is missing, outdated, inaccurate, stuffed or repetitive.'}
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {'On '}
              <Link
                href={
                  'https://developers.google.com/search/docs/appearance/snippet'
                }
                className="font-semibold text-primary hover:underline"
              >
                {'meta descriptions and snippets'}
              </Link>
              {
                ', Google says snippets are primarily created from the page content. The meta description is sometimes used when it would give a more accurate description than a pull from the body. There is, again, no official length limit. The snippet is truncated to fit the device width.'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'That is why a single character target is only a rule of thumb. Many editors still start with roughly 50–60 characters for a title and 150–160 for a description, then check how the line actually looks. Mobile and desktop can cut at different points. A string of wide letters will overflow sooner than the same number of narrow ones.'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'What to do next: draft for clarity first. Then preview the width, rather than treating a character count as a Google rule.'
              }
            </p>
          </section>
          <section className="mb-14">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">
              {'How to write a clear title tag'}
            </h2>
            <Image
              src="/blog/how-to-write-meta-titles-and-descriptions/title-tag-draft-checklist.webp"
              alt={'Title tag drafting checklist beside a laptop'}
              width={1200}
              height={900}
              className="mb-8 mt-6 w-full rounded-3xl border border-border object-cover"
            />
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'Write the title as if someone will only read the first few words — because, on a phone, they might.'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'Start with the unique point of the page, not a brand slogan. "How to write meta titles and descriptions" tells a reader what they will get. "Welcome | Home | Official site" does not. Google specifically advises against vague titles such as "Home" or "Profile", and against repeating the same uninformative phrase on every page.'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'Keep the title descriptive and concise. Put the important words first, so they still appear if the line is cut short. If you include the site name, do it once, at the beginning or the end, separated by a hyphen, colon or pipe. Google suggests concise branding of that kind, and warns that a long slogan on every page looks repetitive when several of your results appear together.'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'Do not stuff keywords. A few precise terms help; the same phrase repeated in several forms does not. Google\'s own example of this problem is a title that lists "Foobar, foo bar, foobars, foo bars". That kind of list can make the result look spammy to people and to Google, and it is a common reason the title link gets rewritten.'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'The title tag and the H1 should agree on the topic, but they do not have to be identical. Google looks at both, along with other prominent text. If the '
              }
              <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                {'<title>'}
              </code>
              {
                ' says one thing and the visible heading says another, or if several headings share the same visual weight, Google may choose unexpected text. Keep one clear main heading, and make sure the title and the H1 describe the same page.'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'Common mistakes include boilerplate titles that only change a product name, outdated years left in a reused template, and titles written as a list of keywords rather than a phrase a person would say.'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'What to do next: write a title for one real page. Then draft the description to support it, rather than repeating the title word for word.'
              }
            </p>
          </section>
          <section className="mb-14">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">
              {'How to write a useful meta description'}
            </h2>
            <Image
              src="/blog/how-to-write-meta-titles-and-descriptions/unique-meta-descriptions.webp"
              alt={'Drafting unique descriptions for individual website pages'}
              width={1200}
              height={900}
              className="mb-8 mt-6 w-full rounded-3xl border border-border object-cover"
            />
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'Treat the description as a short pitch, not a second title and not a list of keywords.'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                "Google's advice is to write unique descriptions that accurately describe the specific page. Identical or near-identical text across a site is not helpful when several pages appear in the results. If you cannot write a description for every URL, start with the home page and the pages people actually land on."
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'The description does not have to be a single formal sentence. Google notes that it is a good place to bring together facts that might otherwise be scattered: an author and date on an article, or a key product detail on a product page. Front-load the point, because the snippet may be cut off on a smaller screen. A reader should understand what the page offers even if only the first clause survives.'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'Avoid long strings of keywords. Google says those do not give people a clear idea of the page, and that they are less likely to be shown as the snippet. A useful test is simple: would you be comfortable reading the line out loud to a customer?'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'On large, database-driven sites, writing every description by hand may be unrealistic. Google encourages programmatic descriptions in that case, as long as they stay human-readable and diverse, and use page-specific data rather than the same sentence with one word changed.'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'What to do next: take the title and description you have drafted and preview their width, instead of stopping at a character count.'
              }
            </p>
          </section>
          <section className="mb-14">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">
              {'Why pixel width matters more than a strict character count'}
            </h2>
            <Image
              src="/blog/how-to-write-meta-titles-and-descriptions/meta-pixel-width-preview.webp"
              alt={'Previewing title and description width on a screen'}
              width={1200}
              height={900}
              className="mb-8 mt-6 w-full rounded-3xl border border-border object-cover"
            />
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'Search results are laid out in pixels, not in a fixed number of letters. A title full of wide characters such as W and M takes more horizontal space than the same number of narrow characters such as i and l. Two titles with the same character count can therefore wrap or truncate differently. That is the main reason a 60-character "limit" is only a starting point.'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                "A practical way to check this is to paste your draft into a pixel preview, rather than trusting a character counter alone. Ai Ranko's "
              }
              <Link
                href={
                  'https://airanko.com/tools/meta-title-description-pixel-generator'
                }
                className="font-semibold text-primary hover:underline"
              >
                {'meta title and description pixel generator'}
              </Link>
              {
                ' lets you type a title and description and see an estimate of how they sit at typical desktop and mobile widths. You can use it without creating an account. If you have more than one page to review, the '
              }
              <Link
                href={
                  'https://airanko.com/tools/meta-title-description-bulk-pixel-checker'
                }
                className="font-semibold text-primary hover:underline"
              >
                {'bulk pixel checker'}
              </Link>
              {' is the same idea at a small scale.'}
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'Treat any pixel or character target shown in a preview as an estimate, not as a Google rule. The live result can still be cut differently, and Google can still choose a different title or snippet. The preview is there to catch obvious overflow before you publish, not to certify a result.'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'What to do next: once the draft looks reasonable, check the tags that are already on the live page, in case a template or CMS is publishing something else.'
              }
            </p>
          </section>
          <section className="mb-14">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">
              {'Check the live page, then keep titles unique'}
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'Drafts in a document and tags on the live page are not always the same thing. A theme, a plugin or a social-sharing field can overwrite what you thought you had published.'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {"Ai Ranko's "}
              <Link
                href={'https://airanko.com/tools/meta-checker'}
                className="font-semibold text-primary hover:underline"
              >
                {'meta checker'}
              </Link>
              {
                ' reads a live URL and shows the title, meta description and related tags as they are served. It is free to use without signup, and it is a useful QA step after you upload a change. It will not tell you how Google will finally write the title link, and it is not a substitute for Google Search Console.'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'If the metadata is in good shape and you want a wider first pass on the site, the '
              }
              <Link
                href={
                  'https://airanko.com/blog/how-to-run-a-free-seo-site-audit'
                }
                className="font-semibold text-primary hover:underline"
              >
                {'guide to running a free SEO site audit'}
              </Link>
              {" walks through the next checks. Ai Ranko's "}
              <Link
                href={'https://airanko.com/tools/site-audit'}
                className="font-semibold text-primary hover:underline"
              >
                {'Site Audit'}
              </Link>
              {
                ' crawls up to 15 pages and runs 25+ real SEO, performance, accessibility, mobile and technical checks. It is a starting point, not a full-site crawl.'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'If the title and H1 agree but the body copy still feels thin or off-topic, you can tighten the page itself in the '
              }
              <Link
                href={'https://airanko.com/tools/content-optimizer'}
                className="font-semibold text-primary hover:underline"
              >
                {'content optimizer'}
              </Link>
              {
                '. That is optional, and it is about the page content that should support the title, not a way to force a search snippet.'
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
                  {
                    'Is there an official Google character limit for title tags or meta descriptions?'
                  }
                </summary>
                <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                  {
                    "No. Google's documentation states that there is no official length limit for the "
                  }
                  <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                    {'<title>'}
                  </code>
                  {
                    ' element or the meta description. The title link and the snippet are truncated as needed, typically to fit the device width. Ranges such as 50–60 or 150–160 characters are rules of thumb only.'
                  }
                </p>
              </details>
              <details className="group rounded-2xl border border-border bg-card">
                <summary className="cursor-pointer px-5 py-4 font-heading text-sm font-semibold text-foreground">
                  {'Why is my title cut off in search results?'}
                </summary>
                <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                  {
                    'Because the title link is shortened to fit the available width on that device. Wide letters, a long brand suffix or a title that only becomes specific at the end are common reasons the useful words disappear. Preview pixel width, and put the important words first.'
                  }
                </p>
              </details>
              <details className="group rounded-2xl border border-border bg-card">
                <summary className="cursor-pointer px-5 py-4 font-heading text-sm font-semibold text-foreground">
                  {'Can Google rewrite my title or ignore my meta description?'}
                </summary>
                <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                  {'Yes. Google may build the title link from the '}
                  <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                    {'<title>'}
                  </code>
                  {', the visible heading, '}
                  <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                    {'og:title'}
                  </code>
                  {
                    ' or other sources, and may rewrite titles that are vague, stuffed, boilerplate or a poor match for the page. Snippets are primarily taken from page content; the meta description is used only when Google finds it more accurate.'
                  }
                </p>
              </details>
              <details className="group rounded-2xl border border-border bg-card">
                <summary className="cursor-pointer px-5 py-4 font-heading text-sm font-semibold text-foreground">
                  {'Should the title tag and the H1 be identical?'}
                </summary>
                <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                  {
                    'They should describe the same page, but they do not have to use the same wording. Keep one clear main heading, and avoid a visible title that contradicts the '
                  }
                  <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                    {'<title>'}
                  </code>
                  {
                    ' tag. Agreement reduces the chance of an unexpected title link; it does not prevent every rewrite.'
                  }
                </p>
              </details>
              <details className="group rounded-2xl border border-border bg-card">
                <summary className="cursor-pointer px-5 py-4 font-heading text-sm font-semibold text-foreground">
                  {'How do I write unique descriptions for many similar pages?'}
                </summary>
                <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                  {
                    'Reuse a short, honest pattern, then change the details that actually differ — the product, the city, the topic, a date or a key fact. Google allows programmatic descriptions when they stay human-readable and diverse. Avoid one template sentence with a single swapped noun. Prioritise your most important URLs first.'
                  }
                </p>
              </details>
              <details className="group rounded-2xl border border-border bg-card">
                <summary className="cursor-pointer px-5 py-4 font-heading text-sm font-semibold text-foreground">
                  {'Do meta titles and descriptions directly improve rankings?'}
                </summary>
                <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                  {
                    'They are not a reliable ranking lever on their own. Their main job is to describe the page clearly and help the right people click. Poor or stuffed titles can also be rewritten. No preview tool can promise a ranking change.'
                  }
                </p>
              </details>
              <details className="group rounded-2xl border border-border bg-card">
                <summary className="cursor-pointer px-5 py-4 font-heading text-sm font-semibold text-foreground">
                  {'How can I check pixel width before I publish?'}
                </summary>
                <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                  {"Paste the draft into a pixel preview such as Ai Ranko's "}
                  <Link
                    href={
                      'https://airanko.com/tools/meta-title-description-pixel-generator'
                    }
                    className="font-semibold text-primary hover:underline"
                  >
                    {'meta title and description pixel generator'}
                  </Link>
                  {', or use the '}
                  <Link
                    href={
                      'https://airanko.com/tools/meta-title-description-bulk-pixel-checker'
                    }
                    className="font-semibold text-primary hover:underline"
                  >
                    {'bulk pixel checker'}
                  </Link>
                  {
                    ' for several pages. After you publish, confirm the live tags with the '
                  }
                  <Link
                    href={'https://airanko.com/tools/meta-checker'}
                    className="font-semibold text-primary hover:underline"
                  >
                    {'meta checker'}
                  </Link>
                  {'. Treat the preview as an estimate, not an official limit.'}
                </p>
              </details>
            </div>
          </section>
          <section className="mb-14">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">
              {'Try the free preview tools'}
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'You do not need a paid platform to improve how your titles and descriptions are written. Draft unique text, put the important words first, then preview the width and check the live page.'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {"Ai Ranko's "}
              <Link
                href={
                  'https://airanko.com/tools/meta-title-description-pixel-generator'
                }
                className="font-semibold text-primary hover:underline"
              >
                {'pixel generator'}
              </Link>
              {' and '}
              <Link
                href={'https://airanko.com/tools/meta-checker'}
                className="font-semibold text-primary hover:underline"
              >
                {'meta checker'}
              </Link>
              {
                ' are free to use in the browser without signup. They help you catch overflow and publishing mistakes. They cannot promise better rankings, and they cannot stop Google choosing a different title link or snippet.'
              }
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {
                'If you need a hand finding a tool or have a question about the site, use the '
              }
              <Link
                href={'https://airanko.com/contact'}
                className="font-semibold text-primary hover:underline"
              >
                {'contact'}
              </Link>
              {' page. More practical guides are on the '}
              <Link
                href={'https://airanko.com/blog'}
                className="font-semibold text-primary hover:underline"
              >
                {'Ai Ranko blog'}
              </Link>
              {'.'}
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
