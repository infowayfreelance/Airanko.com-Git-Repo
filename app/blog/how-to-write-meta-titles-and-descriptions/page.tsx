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
  updated: '2026-11-23',
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
    "q": "Is there an official Google character limit for title tags or meta descriptions?",
    "a": "No. Google does not set a fixed character limit for either field. Search results can shorten the title link or snippet to suit the available width. Common character ranges are useful drafting guides, not rules that guarantee full display. Use them alongside a preview and your own editorial judgement."
  },
  {
    "q": "Why is my title cut off in search results?",
    "a": "The displayed title may need more room than the result allows. Wide letters and long brand names can use that space quickly. Move the page topic and essential detail earlier, then remove repetition. A pixel preview can highlight likely overflow, although the actual search result may look different."
  },
  {
    "q": "Can Google rewrite my title or ignore my meta description?",
    "a": "Yes. Google can draw its title link from headings and other sources, and it often creates snippets from page content. A changed result does not automatically mean your tags are broken. Confirm the published text, check that it describes the page and avoid chasing every variation you see."
  },
  {
    "q": "Should the title tag and the H1 be identical?",
    "a": "No. They can use different wording while describing the same topic. A compact search title may work alongside a fuller heading for visitors. Make sure both match what the page delivers. Changing a heading to repeat the title exactly will not guarantee that Google keeps your chosen title link."
  },
  {
    "q": "How do I write unique descriptions for many similar pages?",
    "a": "Start with the facts that distinguish each page. These might include a product material, a particular task or a different audience. Templates can help organise the writing, but the result must still read naturally. If you lack useful differences, review the pages rather than adding made-up claims."
  },
  {
    "q": "Do meta titles and descriptions directly improve rankings?",
    "a": "A title helps explain the subject of a page. A description can help readers decide whether to visit. Neither provides a ranking guarantee, and a shorter line alone is not evidence of an improvement. Review these fields as part of useful, accurate content rather than expecting a width score to produce rankings."
  },
  {
    "q": "How can I check pixel width before I publish?",
    "a": "Review drafts in a title and description pixel preview, comparing mobile and desktop views. Treat its thresholds as estimates. Once the page is published, fetch the live URL to confirm the tags. For a group of pages, a bulk scan can make the review easier to organise."
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

            <p className="mt-3 text-sm text-muted-foreground">Updated November 23, 2026</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"A good search result tells someone what waits behind the link. Writing it starts with the page itself. What can a visitor learn, compare or do there? Turn that answer into a clear title, then add a description with a useful reason to visit."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"This guide shows how to write a meta title and meta description, check their width and confirm the published tags. You will use a simple example throughout, so each editing choice has a purpose. The goal is accurate wording that helps readers choose."}</p>
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
<section className="mb-14"><h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"Start with the job of each piece of text"}</h2>
<p className="mt-4 leading-relaxed text-muted-foreground">{"People often call the HTML title element a “meta title” or “SEO title”. It names the page for browsers and provides one source for the clickable title link in Google. The H1 is the main heading visitors read on the page. It can be longer and more conversational than the title tag."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"The meta description is an HTML summary. When Google uses it, it supports the title with more detail. Google may also build the visible snippet from other text on your page. Your saved description and the search result are therefore not always the same."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Imagine a bakery page explaining how customers order celebration cakes. Its title should identify that service. Its description might explain how to choose a design and send an enquiry, if the page covers those steps. A history of the bakery belongs on a different page."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Before drafting, finish this sentence in plain English: “This page helps someone…” If you need several unrelated answers, check whether the page itself needs a clearer focus."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground"><strong>{"What to do next:"}</strong>{" Write down the main task, the intended reader and one detail that makes this page different from neighbouring pages."}</p></section>
<section className="mb-14"><h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"Understand the real limits before counting characters"}</h2>
<p className="mt-4 leading-relaxed text-muted-foreground">{"There is no official meta title character limit that guarantees a complete Google title link. There is also no fixed meta description character limit that guarantees a complete snippet. Google's "}<Link href="https://developers.google.com/search/docs/appearance/title-link" className="font-semibold text-primary hover:underline">{"title-link guidance"}</Link>{" and "}<Link href="https://developers.google.com/search/docs/appearance/snippet" className="font-semibold text-primary hover:underline">{"snippet guidance"}</Link>{" both explain that displayed text can be shortened to fit the device width."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"You will often see suggestions of roughly 50–60 characters for titles and 150–160 for descriptions. These are editing rules of thumb. They can help you notice a draft that is getting long, but they are not requirements from Google. A useful title does not become incorrect because it falls outside either range."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Character counts also hide differences in letter width. W and M usually take more room than i and l. Punctuation, font size and the available result space affect how a line looks. Two equally long drafts can therefore end at different places in a preview."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Use length checks to find words you can cut, rather than adding filler to reach a target. Keep any essential qualification near the beginning. If the last phrase disappears, the remaining text should still give an honest picture of the page."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground"><strong>{"What to do next:"}</strong>{" Draft without a strict counter, then use a preview to decide whether the wording needs shortening."}</p></section>
<section className="mb-14"><h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"Step 1: Build the title around a clear promise"}</h2>
<Image
              src="/blog/how-to-write-meta-titles-and-descriptions/title-tag-draft-checklist.webp"
              alt={'Title tag drafting checklist beside a laptop'}
              width={1200}
              height={900}
              className="mb-8 mt-6 w-full rounded-3xl border border-border object-cover"
            />
<p className="mt-4 leading-relaxed text-muted-foreground">{"Begin with the subject and the reason someone would open the page. For our example, “Celebration Cake Orders” is a better starting point than “Welcome to Our Wonderful Website”. It names the task without making a claim about quality."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Next, add a detail that is both useful and supported by the page. “Celebration Cake Orders: Designs and Enquiries” tells readers what they can find. If the business name helps identify the result, try “Celebration Cake Orders | Example Bakery”. These are sample drafts, not promises that either wording will fit every search layout."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Use the words your reader would naturally recognise. A page about replacing a bicycle chain should say that plainly. Repeating “bike chain replacement, replace bike chain, bicycle chains” uses space without clarifying the offer. Read the title aloud. It should sound like a label for a real page."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Check the SEO title vs H1 relationship next. “Celebration Cake Orders | Example Bakery” could sit above an H1 such as “Choose a Celebration Cake and Send an Enquiry”. Both describe the same service, although they serve different reading contexts. A title about ordering would be misleading if the H1 and body only describe cake storage."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Finally, inspect the brand suffix. A long slogan attached to every title can hide the useful part. Keep the name concise and use it once. Review old years, copied product names and leftover template labels before saving."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground"><strong>{"What to do next:"}</strong>{" Write two title options. Choose the one that explains the page most clearly before you compare their pixel widths."}</p></section>
<section className="mb-14"><h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"Step 2: Give the description information the title leaves out"}</h2>
<Image
              src="/blog/how-to-write-meta-titles-and-descriptions/unique-meta-descriptions.webp"
              alt={'Drafting unique descriptions for individual website pages'}
              width={1200}
              height={900}
              className="mb-8 mt-6 w-full rounded-3xl border border-border object-cover"
            />
<p className="mt-4 leading-relaxed text-muted-foreground">{"A title names the topic. A description can answer the next question. What will the visitor find, and what can they do with it? Use details from the page rather than praise such as “the ultimate destination” or “the best solution”."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"For the bakery example, a weak draft would be “Cakes, celebration cakes, cake orders, bakery cakes and more”. It repeats the topic without explaining the next step. A more useful draft is “Explore celebration cake designs, read the ordering steps and send your enquiry to Example Bakery.” Only use this version if those designs, steps and enquiry option actually exist."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"For a guide, describe what it teaches. For a product page, select a relevant feature or use. For a contact page, explain which enquiries it handles. You do not need to fit every benefit, audience and action into one sentence. Choose the information that helps someone decide whether the page meets their need."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Keep the main point early, especially when reviewing mobile previews. Avoid an opening that could apply to any business, such as “Looking for something special?” Readers should not have to reach the final words to learn what the result offers."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Check every claim against the live content. Do not add free delivery, opening hours, credentials or availability because they sound persuasive. Descriptions can become outdated when a service changes. Record who should review those details, particularly if several people edit the site."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground"><strong>{"What to do next:"}</strong>{" Write one natural description, remove anything the page cannot support and make the opening useful on its own."}</p></section>
<section className="mb-14"><h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"Step 3: Preview the words, then shorten with care"}</h2>
<Image
              src="/blog/how-to-write-meta-titles-and-descriptions/meta-pixel-width-preview.webp"
              alt={'Previewing title and description width on a screen'}
              width={1200}
              height={900}
              className="mb-8 mt-6 w-full rounded-3xl border border-border object-cover"
            />
<p className="mt-4 leading-relaxed text-muted-foreground">{"A pixel preview helps you see where a draft may run out of room. It is a writing aid, not a copy of Google's final result. Search layouts, wording and device conditions can differ from the preview you see."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Open Ai Ranko's "}<Link href="/tools/meta-title-description-pixel-generator" className="font-semibold text-primary hover:underline">{"meta title and description pixel generator"}</Link>{". Use its generation options to prepare suggestions for your page, then review the editable results and pixel feedback. Check the topic and facts before accepting any suggested wording. A short line is only useful if it describes the page properly."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Compare the desktop and mobile views. If a useful phrase is likely to disappear, move it forward. Remove repeated words, shorten a long brand suffix or replace an unclear phrase with a simpler one. Do not remove a necessary detail just to make a width indicator look better."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"For several published pages, use the "}<Link href="/tools/meta-title-description-bulk-pixel-checker" className="font-semibold text-primary hover:underline">{"bulk meta title and description pixel checker"}</Link>{". It accepts website sitemap scans, one URL or a pasted list. Choose a suitable scan limit and review the returned metadata before editing. It reports missing fields, but does not automatically flag duplicate titles or descriptions, so review repeated wording yourself."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground"><strong>{"What to do next:"}</strong>{" Save the chosen title and description beside their page URL. Keep a note of any detail you still need to confirm before publication."}</p></section>
<section className="mb-14"><h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"Step 4: Check what the live page actually serves"}</h2>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Your draft may be correct while the published tags are wrong. A site template can append the brand twice. A content editor may save a description in a social field instead of the search field. An old default can remain after a page is renamed."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"After publishing your own edits, enter the URL in the "}<Link href="/tools/meta-checker" className="font-semibold text-primary hover:underline">{"meta checker"}</Link>{". Compare the fetched title and description with your saved draft. Review related social tags too, because sharing previews may use different fields. If the results disagree, inspect the page settings and template before rewriting the text again."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Keep a small review sheet with columns for URL, page purpose, title, description and review status. Sort the text columns to find repeated wording. For similar products, use real differences such as material, size or intended use. For guides, identify the distinct question each one answers. Do not invent differences simply to make descriptions unique."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"You can reuse a writing pattern across many pages, but each result still needs useful page-specific information. Start with the pages that matter most to visitors. A careful review of important pages is more helpful than filling every empty field with generic text."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground"><strong>{"What to do next:"}</strong>{" Recheck the published URLs and mark each one complete only when its tags match the intended wording."}</p></section>
<section className="mb-14"><h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"Frequently asked questions"}</h2>
<div className="mt-6 space-y-3">{faqs.map((faq) => (<details key={faq.q} className="group rounded-2xl border border-border bg-card"><summary className="cursor-pointer px-5 py-4 font-heading text-sm font-semibold text-foreground">{faq.q}</summary><p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{faq.a}</p></details>))}</div></section>
<section className="mb-14"><h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"Make metadata review part of normal page editing"}</h2>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Titles and descriptions need another look when a page changes its purpose, product details or main heading. Keep the review close to the content update, so outdated wording does not survive simply because it sits in a separate settings panel."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Once the metadata is clean, the "}<Link href="/blog/how-to-run-a-free-seo-site-audit" className="font-semibold text-primary hover:underline">{"free SEO site audit guide"}</Link>{" explains a wider first pass. Ai Ranko's "}<Link href="/tools/site-audit" className="font-semibold text-primary hover:underline">{"Site Audit"}</Link>{" runs 25+ checks across up to 15 pages. Use it to investigate further issues rather than expecting metadata edits to explain every search problem."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Start with the "}<Link href="/tools/meta-title-description-pixel-generator" className="font-semibold text-primary hover:underline">{"pixel generator"}</Link>{", then confirm your published tags with the "}<Link href="/tools/meta-checker" className="font-semibold text-primary hover:underline">{"meta checker"}</Link>{". Both are available without signup. Preview tools can help you catch awkward wording and overflow. They cannot guarantee rankings or prevent Google from choosing different text."}</p></section>
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
