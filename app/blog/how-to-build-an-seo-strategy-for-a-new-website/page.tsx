import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight, Zap, Calendar, Clock, User } from 'lucide-react'
import Navbar from '@/components/navbar'
import { CookieSettingsLink } from '@/components/cookie-consent/cookie-settings-link'

const POST = {
  "title": "How to Build an SEO Strategy for a New Website (With a Free AI Strategy Creator)",
  "excerpt": "Build an SEO strategy for a new website: set goals, map keywords, plan pages and content, fix technical basics and try Ai Ranko’s free AI planner.",
  "slug": "how-to-build-an-seo-strategy-for-a-new-website",
  "date": "2026-11-26",
  "dateDisplay": "November 26, 2026",
  "updated": "2026-11-26",
  "readingTime": "10 min read",
  "author": "Ai Ranko",
  "category": "SEO",
  "url": "https://airanko.com/blog/how-to-build-an-seo-strategy-for-a-new-website",
  "image": "/blog/how-to-build-an-seo-strategy-for-a-new-website/seo-strategy-new-website-featured.webp"
}

export const metadata: Metadata = {
  title: 'How to Build an SEO Strategy for a New Website | Ai Ranko',
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
    images: [{ url: POST.image, width: 1200, height: 630, alt: "Planning an SEO strategy for a new website" }],
    locale: 'en_US',
    tags: ['SEO', 'SEO Strategy', 'New Websites'],
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
  {q: "How long does SEO take for a new website?", a: "It varies. Google explains that changes take time to appear in search and may not produce a noticeable effect. A planning schedule is not a ranking deadline; review the evidence rather than expecting results by a fixed date. developers.google.com", content: <>{"It varies. Google explains that changes take time to appear in search and may not produce a noticeable effect. A planning schedule is not a ranking deadline; review the evidence rather than expecting results by a fixed date. "}<Link href="https://developers.google.com/search/docs/fundamentals/seo-starter-guide" className="font-semibold text-primary hover:underline">{"developers.google.com"}</Link></>},
  {q: "What should an SEO strategy include?", a: "Include your audience, business goal, keyword groups, page map, technical priorities, on-page improvements, content calendar, promotion activities and measurement plan. Give important tasks an owner and a way to check completion.", content: <>{"Include your audience, business goal, keyword groups, page map, technical priorities, on-page improvements, content calendar, promotion activities and measurement plan. Give important tasks an owner and a way to check completion."}</>},
  {q: "How many keywords should a new website target?", a: "There is no useful fixed number for every site. Start with relevant groups that match your actual services, products and customer questions. Map related phrases to suitable pages rather than creating a page for each variation.", content: <>{"There is no useful fixed number for every site. Start with relevant groups that match your actual services, products and customer questions. Map related phrases to suitable pages rather than creating a page for each variation."}</>},
  {q: "Can AI create an SEO strategy?", a: "AI can help draft and organise a strategy. You still need to check the inputs, proposed pages, technical findings and business priorities. Do not treat generated recommendations as verified research or a guarantee of rankings.", content: <>{"AI can help draft and organise a strategy. You still need to check the inputs, proposed pages, technical findings and business priorities. Do not treat generated recommendations as verified research or a guarantee of rankings."}</>},
  {q: "Do I need backlinks for a new website?", a: "Links can help people and search engines discover your site, but there is no sensible link quota for every new website. Focus on useful pages and genuine promotion. Avoid buying links to manipulate rankings.", content: <>{"Links can help people and search engines discover your site, but there is no sensible link quota for every new website. Focus on useful pages and genuine promotion. Avoid buying links to manipulate rankings."}</>},
  {q: "How often should I update my SEO plan?", a: "Review it when you have useful new evidence or the business changes. New services, missing pages, indexing problems and search data can all change priorities. Keep a regular review slot, but avoid changing direction after every small movement.", content: <>{"Review it when you have useful new evidence or the business changes. New services, missing pages, indexing problems and search data can all change priorities. Keep a regular review slot, but avoid changing direction after every small movement."}</>}
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

export default function NewWebsiteSeoStrategyBlogPost() {
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
<p className="mt-4 leading-relaxed text-muted-foreground">{"A new website needs a clear SEO plan before it needs a long list of tasks. Without one, you can spend time publishing articles while important service pages remain unfinished, hard to find or unclear about what you offer."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"To build an SEO strategy for a new website, define your audience and business goal, research relevant keywords and group them by search intent. Map those groups to useful pages, check the technical basics, improve your on-page content and create a realistic publishing schedule."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Decide who will complete each task and how you will review progress. An AI planner can help organise your ideas and produce a draft, but you must check its recommendations against your business, website and research before using them."}</p>
          </header>
<Image src="/blog/how-to-build-an-seo-strategy-for-a-new-website/seo-strategy-new-website-featured.webp" alt="Planning an SEO strategy for a new website" width={1200} height={630} priority className="mb-8 mt-6 w-full rounded-3xl border border-border object-cover" />
<section className="mb-14">
<h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"Short answer: the SEO strategy steps for a new site"}</h2>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Build the strategy around what visitors need and what your business can deliver."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Start with this sequence:"}</p>
<ul className="mt-4 space-y-2 pl-6 list-disc text-muted-foreground">
<li className="leading-relaxed">{"Choose a useful business outcome."}</li>
<li className="leading-relaxed">{"Group searches by what people want to do."}</li>
<li className="leading-relaxed">{"Decide which pages answer those needs."}</li>
<li className="leading-relaxed">{"Check access, indexing and on-page basics."}</li>
<li className="leading-relaxed">{"Schedule useful content and genuine promotion."}</li>
<li className="leading-relaxed">{"Review search data and completed enquiries."}</li>
</ul>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Give each task an owner, a priority and a way to check completion. “Improve SEO” is too vague; “publish the delivery page and link it from product pages” gives someone a clear job."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Keep a short backlog rather than treating every recommendation as urgent. Work that helps an important page become usable should usually come before polishing an article nobody needs yet."}</p>
</section>
<section className="mb-14">
<h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"Step 1: Set a clear goal and audience"}</h2>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Choose the action you want the right visitor to take."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"That could be requesting a quote, booking an appointment, buying a product or reading a guide before making an enquiry. Pick a goal that fits how the business actually works."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Describe the audience in ordinary language. What are they looking for? Where can you serve them?"}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Write down what information would help them decide."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"For a hypothetical bakery, someone checking collection arrangements needs different information from someone researching wedding cakes. Those needs should shape the plan before you choose keywords."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Write down what you do not offer too. This helps you reject tempting searches that would attract unsuitable enquiries."}</p>
</section>
<section className="mb-14">
<h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"Step 2: Find keywords and match search intent"}</h2>
<Image src="/blog/how-to-build-an-seo-strategy-for-a-new-website/keyword-intent-planning.webp" alt="Grouping keywords by search intent" width={1200} height={800} className="mb-8 mt-6 w-full rounded-3xl border border-border object-cover" />
<p className="mt-4 leading-relaxed text-muted-foreground">{"Group keywords by the need behind the search, rather than collecting the longest possible list."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Start with your services or products, customer questions, problems and relevant locations. Use the words customers use, including plain descriptions that differ from your internal business terms."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Review current search results manually for important phrases. Notice whether the results mainly offer products, service information, comparisons or instructions. Use that as evidence about the page a searcher may expect."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Separate ideas into useful groups:"}</p>
<ul className="mt-4 space-y-2 pl-6 list-disc text-muted-foreground">
<li className="leading-relaxed">{"Buying or booking searches."}</li>
<li className="leading-relaxed">{"Questions that help someone choose."}</li>
<li className="leading-relaxed">{"Practical questions about using a product or service."}</li>
<li className="leading-relaxed">{"Searches for a particular business or brand."}</li>
</ul>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Do not invent search volumes or difficulty scores when you have no data. Mark uncertain ideas for research instead."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Choose groups you can answer well. A small site does not need a separate page for every variation of the same phrase."}</p>
</section>
<section className="mb-14">
<h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"Step 3: Plan your site structure and pages"}</h2>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Give each distinct search need a clear home on your website."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Sketch the main pages before planning a large blog. Include the homepage, your main service or product pages, useful supporting information and a clear contact or checkout route."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Then map keyword groups to those pages. A simple worksheet can record the page, audience need, main topic, supporting questions and next action."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Avoid creating near-identical pages just to repeat slightly different keywords. If two proposed pages would answer the same question in the same way, consider whether one stronger page would serve the reader better."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"For example, a bakery’s wedding-cake page could explain ordering and collection, while a separate guide answers questions about choosing a cake. Link the guide to the ordering page where that helps someone take the next step."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Plan internal links at the same time. A guide should lead naturally to a relevant service, product or further explanation."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Use our guide to "}<Link href="/blog/html-sitemap-vs-xml-sitemap" className="font-semibold text-primary hover:underline">{"HTML sitemaps versus XML sitemaps"}</Link>{" to distinguish a visitor-facing directory from a file used for URL discovery."}</p>
</section>
<section className="mb-14">
<h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"Step 4: Get the technical basics right"}</h2>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Check that people and search engines can reach the pages your plan depends on."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Open your important pages on desktop and mobile. Test navigation, forms and links. Investigate error pages, accidental indexing restrictions and canonical addresses pointing somewhere unexpected."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Put tasks in dependency order. Fix an inaccessible service page before refining its description, and repair a broken enquiry form before promoting the page."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"This makes the plan easier to follow and gives each check a practical purpose."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Set up Google Search Console and inspect important URLs. Check your robots.txt settings and XML sitemap, but do not assume that submitting a sitemap guarantees indexing."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"The "}<Link href="/tools/xml-sitemap-generator" className="font-semibold text-primary hover:underline">{"XML sitemap generator"}</Link>{" can help prepare a sitemap. Review its output against the pages you actually want discovered before submitting it."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"For a broader first pass, use the "}<Link href="/tools/site-audit" className="font-semibold text-primary hover:underline">{"site audit tool"}</Link>{" and follow the "}<Link href="/blog/how-to-run-a-free-seo-site-audit" className="font-semibold text-primary hover:underline">{"free SEO site audit guide"}</Link>{". Record each important finding against a page and a proposed fix."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Google’s "}<Link href="https://developers.google.com/search/docs/fundamentals/seo-starter-guide" className="font-semibold text-primary hover:underline">{"SEO Starter Guide"}</Link>{" is a useful reference for understanding discovery, site organisation and content basics. Use it to check advice rather than treating an automated report as a rulebook."}</p>
</section>
<section className="mb-14">
<h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"Step 5: Optimise titles, descriptions and on-page basics"}</h2>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Make each page explain its subject clearly before trying to make it sound clever."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Check the title, visible heading, introduction and main sections. A visitor should understand what the page offers and whether it answers their question."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Use descriptive internal links where they help the reader. Add useful image descriptions where appropriate, and make sure important information is available as readable page content."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Give each important page a suitable description, then check what the published page actually serves. The "}<Link href="/tools/meta-checker" className="font-semibold text-primary hover:underline">{"meta checker"}</Link>{" helps you inspect that output."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"For writing advice, use the "}<Link href="/blog/how-to-write-meta-titles-and-descriptions" className="font-semibold text-primary hover:underline">{"guide to meta titles and descriptions"}</Link>{". Keep the planning task separate from the live check: saved settings and published tags can differ."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Avoid promising services, coverage or benefits that the business cannot support. Accurate information matters more than repeating a keyword in every section."}</p>
</section>
<section className="mb-14">
<h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"Step 6: Build a content calendar"}</h2>
<Image src="/blog/how-to-build-an-seo-strategy-for-a-new-website/seo-content-calendar.webp" alt="Content calendar for a new website’s SEO plan" width={1200} height={800} className="mb-8 mt-6 w-full rounded-3xl border border-border object-cover" />
<p className="mt-4 leading-relaxed text-muted-foreground">{"Schedule content that fills a real gap in the pages you have planned."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Start with essential commercial information. A useful delivery, pricing explanation or service page may deserve attention before another general blog post."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"For each content item, record its purpose, target page, reader question, owner, supporting evidence and review status. Choose a schedule your team can maintain."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"A possible sequence for a small site is:"}</p>
<ul className="mt-4 space-y-2 pl-6 list-disc text-muted-foreground">
<li className="leading-relaxed">{"Finish the main service or product pages."}</li>
<li className="leading-relaxed">{"Answer common questions that affect a purchase."}</li>
<li className="leading-relaxed">{"Publish supporting guides."}</li>
<li className="leading-relaxed">{"Update existing pages as you learn what visitors need."}</li>
</ul>
<p className="mt-4 leading-relaxed text-muted-foreground">{"The "}<Link href="/tools/content-writer" className="font-semibold text-primary hover:underline">{"AI content writer"}</Link>{" can help with a draft, while the "}<Link href="/tools/content-optimizer" className="font-semibold text-primary hover:underline">{"content optimizer"}</Link>{" can suggest edits to an existing piece. Check facts, examples and claims yourself before publishing."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Ask the person responsible for each item what they need to finish it. Product details, photographs, permissions or a business decision may be missing."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Record those dependencies instead of filling the calendar with dates that nobody can meet."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Leave room for revisions. A content calendar should include improving existing work, not just adding new URLs. A simple spreadsheet can act as your SEO strategy planner."}</p>
</section>
<section className="mb-14">
<h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"Step 7: Earn authority the right way"}</h2>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Help relevant people discover work that deserves their attention."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Make business information accurate wherever you maintain it. Share useful resources with your existing audience and relevant professional contacts without sending unwanted messages."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Look for genuine reasons another organisation might mention your site: a useful explanation, original information, an event or a relevant collaboration."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Do not buy links to manipulate rankings or agree to large-scale link exchanges. Google’s "}<Link href="https://developers.google.com/search/docs/essentials/spam-policies" className="font-semibold text-primary hover:underline">{"spam policies"}</Link>{" identify these practices as link spam."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Keep a record of outreach and the reason each contact is relevant. A message should offer something useful to its recipient rather than simply ask for a link."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"If the website is not ready to help visitors, improve it before spending your effort promoting it."}</p>
</section>
<section className="mb-14">
<h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"Step 8: Measure, review and adjust"}</h2>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Measure both search visibility and the actions your website exists to support."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Search Console can show impressions, clicks, queries and indexing information. Google’s "}<Link href="https://support.google.com/webmasters/answer/9128668" className="font-semibold text-primary hover:underline">{"Search Console overview"}</Link>{" explains the reports available."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Alongside those reports, track suitable business outcomes through your own records or correctly configured analytics. A search click and a completed enquiry answer different questions."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Use what you find to choose the next investigation. For example, a page receiving impressions but few clicks may need a review of its topic, search appearance or position."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"A page receiving visits without enquiries may need clearer information or a better enquiry process. Check the evidence before deciding which explanation fits."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Record changes so you can interpret later results. Avoid rewriting everything at once and then guessing what helped."}</p>
</section>
<section className="mb-14">
<h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"How to create your SEO plan with Ai Ranko’s free SEO Strategy Creator"}</h2>
<Image src="/blog/how-to-build-an-seo-strategy-for-a-new-website/seo-strategy-creator-form.webp" alt="Ai Ranko SEO Strategy Creator form with website and business name fields" width={1200} height={800} className="mb-8 mt-6 w-full rounded-3xl border border-border object-cover" />
<p className="mt-4 leading-relaxed text-muted-foreground">{"Use the form to organise your website details and research before requesting a plan."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"In a test on 26 November 2026, the tool showed four steps: Website, Keywords, Competitors and Location. The test used "}<code className="rounded bg-muted px-1.5 py-0.5 text-sm">{"example.com"}</code>{" and the fictional name "}<strong>{"Demo Bakery"}</strong>{"."}</p>
<h3 className="mt-6 font-heading text-xl font-semibold text-foreground">{"Enter your website details"}</h3>
<p className="mt-4 leading-relaxed text-muted-foreground">{"The first step required a Website URL and Business Name. It also offered Quick Audit and Full Site Audit choices, an optional Industry / Niche field and a Local business toggle."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Use real details for your own plan. If the site is not public yet, prepare your page map and keyword research first rather than expecting a crawl to inspect an unpublished website."}</p>
<h3 className="mt-6 font-heading text-xl font-semibold text-foreground">{"Add keywords and optional context"}</h3>
<p className="mt-4 leading-relaxed text-muted-foreground">{"The Keywords step accepted two demo terms entered on separate lines. The Competitors step was optional, with a Skip button."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"The final Location step offered a primary location or service area and a current challenges or goals field. It included "}<strong>{"Skip & Generate"}</strong>{" and "}<strong>{"Generate SEO Strategy"}</strong>{" controls."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Include context that changes the plan, such as which services you actually offer or which pages are still missing."}</p>
<h3 className="mt-6 font-heading text-xl font-semibold text-foreground">{"Review the result before using it"}</h3>
<p className="mt-4 leading-relaxed text-muted-foreground">{"The demo reached the audit stage without requiring sign-in, then returned: “We could not finish building your SEO strategy.”"}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"That run did not produce a report, so it could not verify the output."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"The page describes keyword strategy, competitor gaps, a content calendar, a technical checklist and a "}<strong>{"2-month roadmap"}</strong>{". That is the stated scope, not a promise of results."}</p>
</section>
<section className="mb-14">
<h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"Limits of an AI-generated plan"}</h2>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Treat an AI-generated plan as a draft that needs human judgement."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"An SEO strategy generator cannot decide your business priorities for you. Check proposed keywords against your services, verify technical findings on the live page and remove topics you cannot answer responsibly."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Do not assume a suggested competitor is relevant or a missing topic deserves its own page. Check the evidence behind each recommendation."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"An SEO strategy builder can organise ideas, but it cannot guarantee indexing, enquiries or rankings. A 2-month roadmap describes a planning period, not a deadline for SEO success."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Keep your SEO roadmap editable. Add new evidence, mark completed work and remove tasks that no longer serve the business."}</p>
</section>
<section className="mb-14">
<h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"Frequently asked questions"}</h2>
<div className="mt-6 space-y-3">{faqs.map((faq) => (
  <details key={faq.q} className="group rounded-2xl border border-border bg-card">
    <summary className="cursor-pointer px-5 py-4 font-heading text-sm font-semibold text-foreground">{faq.q}</summary>
    <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{faq.content}</p>
  </details>
))}</div>
</section>
<section className="mb-14">
<h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"Try the SEO Strategy Creator"}</h2>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Prepare your website address, business details and keyword groups, then try Ai Ranko’s "}<Link href="/tools/seo-strategy-maker" className="font-semibold text-primary hover:underline">{"free AI SEO strategy creator"}</Link>{". Use the steps above to review any plan it returns and choose the work that matters for your new website."}</p>
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
