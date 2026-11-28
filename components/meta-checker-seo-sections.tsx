import Link from 'next/link'
import {
  ClipboardList,
  Zap,
  Eye,
  FileSearch,
  Share2,
  Twitter,
  Layers,
  MonitorCheck,
  ShieldCheck,
  TrendingUp,
  Clock,
  AlertCircle,
  ChevronDown,
} from 'lucide-react'

// ─── How It Works ────────────────────────────────────────────────────────────

const steps = [
  {
    icon: ClipboardList,
    step: '01',
    title: 'Enter Your URLs',
    desc: 'Paste one URL or multiple URLs at once — separated by newlines or commas. Bulk paste mode is also available.',
  },
  {
    icon: Zap,
    step: '02',
    title: 'Run the Check',
    desc: 'Hit "Check Meta Tags" and our server fetches the live page from each URL. No browser extensions, no manual digging — the tags are extracted for you.',
  },
  {
    icon: Eye,
    step: '03',
    title: 'Review & Act',
    desc: 'See meta title, meta description, OG tags, and Twitter Card data — all in one clean view. Spot missing tags, weak descriptions, or broken OG images at a glance.',
  },
]

// ─── Key Features ────────────────────────────────────────────────────────────

const features = [
  {
    icon: FileSearch,
    title: 'Meta Title & Description Checker',
    desc: 'Extract and preview the meta title and meta description of any URL, with character counts at a glance. Google may still shorten or rewrite what it shows.',
  },
  {
    icon: Share2,
    title: 'Open Graph Tag Analyser',
    desc: 'Check all OG tags — og:title, og:description, og:image, og:type, and more. See the title, description and image your page gives to platforms such as Facebook, LinkedIn or WhatsApp.',
  },
  {
    icon: Twitter,
    title: 'Twitter Card Checker',
    desc: 'Verify twitter:card, twitter:title, twitter:description, and twitter:image tags. Ensure your content looks sharp every time it\'s shared on X (Twitter).',
  },
  {
    icon: Layers,
    title: 'Bulk URL Support',
    desc: 'Check a list of URLs in one go — paste them comma-separated or line by line. Useful for SEO audits, site migrations and content reviews.',
  },
  {
    icon: MonitorCheck,
    title: 'Live Tag Preview',
    desc: 'See a visual preview of how your meta and OG data renders. Each platform applies its own layout, so treat it as a close guide.',
  },
  {
    icon: ShieldCheck,
    title: 'How Your URLs Are Handled',
    desc: 'URLs are sent to our server to fetch tags, and results stay in the current page session without database or browser-storage writes; hosting logs are not verified by the checker code.',
  },
]

// ─── Why Meta & OG Tags Matter ───────────────────────────────────────────────

const whyPoints = [
  {
    icon: TrendingUp,
    title: 'Clearer Search Results',
    desc: 'A clear, accurate title and description help searchers see what the page is about before they click.',
  },
  {
    icon: Share2,
    title: 'Better Social Sharing',
    desc: 'Correct OG tags ensure your page displays a proper image, title, and description on every platform.',
  },
  {
    icon: Twitter,
    title: 'Stronger Twitter Presence',
    desc: 'Twitter Card tags make your shared links stand out with rich previews instead of plain URLs.',
  },
  {
    icon: Clock,
    title: 'Bulk SEO Audits',
    desc: 'Checking a list of URLs together is quicker than opening each page\'s source during audits, migrations and pre-launch reviews.',
  },
  {
    icon: AlertCircle,
    title: 'Avoid Missing Tags',
    desc: 'Missing or duplicate tags make your search and social previews less clear. Catch them before you publish.',
  },
]

export const metaCheckerFaqs = [
  { q: "What is a meta tag checker?", a: "A meta tag checker is a tool that reads a webpage's HTML and extracts key SEO tags — including meta title, meta description, Open Graph, and Twitter Card data — so you can audit and optimise them without touching any code.", content: <>{"A meta tag checker is a tool that reads a webpage's HTML and extracts key SEO tags — including meta title, meta description, Open Graph, and Twitter Card data — so you can audit and optimise them without touching any code."}</> },
  { q: "What is the difference between meta tags and Open Graph tags?", a: "Meta tags communicate page information to search engines like Google. Open Graph tags control how your page appears when shared on social platforms like Facebook, LinkedIn, and WhatsApp — they serve different but equally important purposes.", content: <>{"Meta tags communicate page information to search engines like Google. Open Graph tags control how your page appears when shared on social platforms like Facebook, LinkedIn, and WhatsApp — they serve different but equally important purposes."}</> },
  { q: "Can I check multiple URLs at once?", a: "Yes. Ai Ranko's tool supports bulk URL checking — simply paste multiple URLs separated by commas or newlines and hit \"Check Meta Tags\" to get results for all of them.", content: <>{"Yes. Ai Ranko's tool supports bulk URL checking — simply paste multiple URLs separated by commas or newlines and hit \"Check Meta Tags\" to get results for all of them."}</> },
  { q: "Does this tool check Twitter Card tags too?", a: "Yes. Along with meta and OG tags, the tool also extracts twitter:card, twitter:title, twitter:description, and twitter:image — so you can verify rich previews before your content goes live on X (Twitter).", content: <>{"Yes. Along with meta and OG tags, the tool also extracts twitter:card, twitter:title, twitter:description, and twitter:image — so you can verify rich previews before your content goes live on X (Twitter)."}</> },
  { q: "Is this tool free to use?", a: "Yes. It's free to use, with no subscription, no credit card and no sign-up required. Enter your URLs and check them.", content: <>{"Yes. It's free to use, with no subscription, no credit card and no sign-up required. Enter your URLs and check them."}</> },
  { q: "Do you store or log the URLs I check?", a: "Each URL is fetched by our server so the tags can be read. The checker holds URLs and results in memory for the current page session; its code does not write them to a database or browser storage, or explicitly log them. Hosting-level request logging and retention are not established by this code. See our privacy policy for details.", content: <>{"Each URL is fetched by our server so the tags can be read. The checker holds URLs and results in memory for the current page session; its code does not write them to a database or browser storage, or explicitly log them. Hosting-level request logging and retention are not established by this code. See our "}<Link href="/privacy-policy" className="font-semibold text-primary hover:underline">{"privacy policy"}</Link>{" for details."}</> },
  { q: "Why are Open Graph tags important?", a: "Open Graph tags control the title, description and image shown when your page is shared, so a missing or wrong og:image or og:title gives you a poor-looking link preview. They are for social and messaging previews; Google's search snippets come mainly from your page content and meta description (Google Search Central).", content: <>{"Open Graph tags control the title, description and image shown when your page is shared, so a missing or wrong og:image or og:title gives you a poor-looking link preview. They are for social and messaging previews; Google's search snippets come mainly from your page content and meta description ("}<Link href="https://developers.google.com/search/docs/appearance/snippet" target="_blank" rel="noopener" className="font-semibold text-primary hover:underline">{"Google Search Central"}</Link>{")."}</> },
  { q: "Do I need to install anything to use this tool?", a: "No. Ai Ranko's Meta & OG Checker is fully browser-based and works on all devices — desktop, tablet, and mobile — with zero installation required.", content: <>{"No. Ai Ranko's Meta & OG Checker is fully browser-based and works on all devices — desktop, tablet, and mobile — with zero installation required."}</> },
  { q: "Who should use a bulk meta tag checker?", a: "SEO professionals, web developers, digital marketers, and content managers — anyone who needs to audit, validate, or optimise meta and Open Graph tags across single pages or entire websites.", content: <>{"SEO professionals, web developers, digital marketers, and content managers — anyone who needs to audit, validate, or optimise meta and Open Graph tags across single pages or entire websites."}</> },
  { q: "Which Open Graph tags does every page need?", a: "The Open Graph protocol lists four required properties for every page: og:title, og:type, og:image and og:url (ogp.me). og:description is optional but worth adding, and the checker shows which of these each URL has.", content: <>{"The Open Graph protocol lists four required properties for every page: og:title, og:type, og:image and og:url ("}<Link href="https://ogp.me/" target="_blank" rel="noopener" className="font-semibold text-primary hover:underline">{"ogp.me"}</Link>{"). og:description is optional but worth adding, and the checker shows which of these each URL has."}</> },
  { q: "How long should a meta title and description be?", a: "Google doesn't set a character limit for either; it shortens title links and snippets as needed to fit the device width (Google Search Central). The checker shows character counts; for measured pixel widths and estimated display limits, use our bulk pixel checker.", content: <>{"Google doesn't set a character limit for either; it shortens title links and snippets as needed to fit the device width ("}<Link href="https://developers.google.com/search/docs/appearance/title-link" target="_blank" rel="noopener" className="font-semibold text-primary hover:underline">{"Google Search Central"}</Link>{"). The checker shows character counts; for measured pixel widths and estimated display limits, use our "}<Link href="/tools/meta-title-description-bulk-pixel-checker" className="font-semibold text-primary hover:underline">{"bulk pixel checker"}</Link>{"."}</> },
  { q: "Why does Google show a different title or description from my tags?", a: "Google builds title links from your title element and other sources on the page, and creates snippets mainly from page content, using your meta description when it describes the page more accurately (Google Search Central). Clear, page-specific tags that match the content give yours the best chance of being used.", content: <>{"Google builds title links from your title element and other sources on the page, and creates snippets mainly from page content, using your meta description when it describes the page more accurately ("}<Link href="https://developers.google.com/search/docs/appearance/snippet" target="_blank" rel="noopener" className="font-semibold text-primary hover:underline">{"Google Search Central"}</Link>{"). Clear, page-specific tags that match the content give yours the best chance of being used."}</> },
  { q: "Should every page have unique meta tags?", a: "Yes. Google advises a unique description for each page, because identical or similar descriptions aren't helpful when several of your pages appear in results. Checking a list of URLs together makes repeated titles and descriptions easy to spot.", content: <>{"Yes. Google advises a unique description for each page, because identical or similar descriptions aren't helpful when several of your pages appear in results. Checking a list of URLs together makes repeated titles and descriptions easy to spot."}</> },
  { q: "Why might a URL return no tags or the wrong tags?", a: "Some sites block automated requests or need a login, and tags added by JavaScript after the page loads may not be in the HTML that is fetched. The checker reads returned HTML without running JavaScript and reads only an initial portion of the response, so tags later in a large document can be missed. It follows redirects, which can return a sign-in page's tags instead. If a result looks wrong, open the page source in your browser to compare.", content: <>{"Some sites block automated requests or need a login, and tags added by JavaScript after the page loads may not be in the HTML that is fetched. The checker reads returned HTML without running JavaScript and reads only an initial portion of the response, so tags later in a large document can be missed. It follows redirects, which can return a sign-in page's tags instead. If a result looks wrong, open the page source in your browser to compare."}</> },
  { q: "How do I check meta tags without a tool?", a: "You can view the page source in your browser and search for title, description and og: tags. Our guide on how to check meta tags on any website walks through it; this checker is quicker when you have more than one URL.", content: <>{"You can view the page source in your browser and search for title, description and og: tags. Our guide on "}<Link href="/blog/how-to-check-meta-tags-on-any-website" className="font-semibold text-primary hover:underline">{"how to check meta tags on any website"}</Link>{" walks through it; this checker is quicker when you have more than one URL."}</> }
]

export default function MetaCheckerSeoSections() {
  return (
    <div className="border-t border-border bg-background">

      {/* ── How It Works ── */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="font-heading text-2xl font-bold text-foreground text-balance sm:text-3xl">
              How It Works
            </h2>
            <p className="mt-2 text-muted-foreground text-pretty">
              Three simple steps to check meta tags, Open Graph, and Twitter Card data for any URL.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {steps.map((s) => {
              const Icon = s.icon
              return (
                <div
                  key={s.step}
                  className="relative flex flex-col items-start gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm"
                >
                  <span className="font-heading text-4xl font-bold text-primary/15 select-none leading-none">
                    {s.step}
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-foreground">{s.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Key Features ── */}
      <section className="border-t border-border bg-card px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="font-heading text-2xl font-bold text-foreground text-balance sm:text-3xl">
              Key Features
            </h2>
            <p className="mt-2 text-muted-foreground text-pretty">
              Everything you need to audit, analyse, and review your meta and Open Graph tags — in one place.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => {
              const Icon = f.icon
              return (
                <div
                  key={f.title}
                  className="flex flex-col gap-3 rounded-2xl border border-border bg-background p-5 shadow-sm"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-foreground">{f.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Why Meta & OG Tags Matter ── */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="font-heading text-2xl font-bold text-foreground text-balance sm:text-3xl">
              Why Meta &amp; OG Tags Matter
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-muted-foreground leading-relaxed text-pretty">
              Meta tags tell search engines what your page is about. Open Graph tags control how your content looks when shared on social media. Both shape the preview people see before they click.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {whyPoints.map((b) => {
              const Icon = b.icon
              return (
                <div
                  key={b.title}
                  className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-foreground">{b.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{b.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

<section className="px-4 py-16 sm:px-6 lg:px-8"><div className="mx-auto max-w-5xl"><h2 className="font-heading text-2xl font-bold text-foreground text-balance sm:text-3xl">{"Meta and Open Graph Tags Every Page Should Have"}</h2><ul className="flex flex-col gap-3"><li className="text-sm text-muted-foreground leading-relaxed"><><strong className="text-foreground">{"Title element:"}</strong>{" a descriptive, concise title for every page. Google has no character limit but shortens title links to fit the screen ("}<Link href="https://developers.google.com/search/docs/appearance/title-link" target="_blank" rel="noopener" className="font-semibold text-primary hover:underline">{"Google Search Central"}</Link>{")."}</></li><li className="text-sm text-muted-foreground leading-relaxed"><><strong className="text-foreground">{"Meta description:"}</strong>{" a short, accurate summary that is unique to the page ("}<Link href="https://developers.google.com/search/docs/appearance/snippet" target="_blank" rel="noopener" className="font-semibold text-primary hover:underline">{"Google Search Central"}</Link>{")."}</></li><li className="text-sm text-muted-foreground leading-relaxed"><><strong className="text-foreground">{"Open Graph:"}</strong>{" og:title, og:type, og:image and og:url are the four required properties; og:description is optional ("}<Link href="https://ogp.me/" target="_blank" rel="noopener" className="font-semibold text-primary hover:underline">{"ogp.me"}</Link>{")."}</></li><li className="text-sm text-muted-foreground leading-relaxed"><><strong className="text-foreground">{"Twitter Card:"}</strong>{" a twitter:card tag sets the type of card shown when your link is shared on X."}</></li></ul></div></section>
<section className="border-t border-border bg-card px-4 py-16 sm:px-6 lg:px-8"><div className="mx-auto max-w-5xl"><h2 className="font-heading text-2xl font-bold text-foreground text-balance sm:text-3xl">{"What the Meta Checker Shows (and What It Doesn't)"}</h2><ul className="flex flex-col gap-3"><li className="text-sm text-muted-foreground leading-relaxed"><><strong className="text-foreground">{"Search tags:"}</strong>{" the title element and meta description for each URL, with character counts; canonical URL, robots, viewport, keywords and theme colour are also shown. The favicon is used in the result header."}</></li><li className="text-sm text-muted-foreground leading-relaxed"><><strong className="text-foreground">{"Open Graph:"}</strong>{" og:title, og:description, og:image, og:url, og:type, og:site_name and og:locale, plus a preview of the link card."}</></li><li className="text-sm text-muted-foreground leading-relaxed"><><strong className="text-foreground">{"Twitter Card:"}</strong>{" twitter:card, twitter:title, twitter:description, twitter:image, twitter:site and twitter:creator."}</></li><li className="text-sm text-muted-foreground leading-relaxed"><><strong className="text-foreground">{"Not shown:"}</strong>{" how Google will actually display your page (Google can shorten or rewrite titles and snippets), your rankings, or a full site audit. For pixel width use the "}<Link href="/tools/meta-title-description-bulk-pixel-checker" className="font-semibold text-primary hover:underline">{"bulk pixel checker"}</Link>{"; for a whole-site review use the "}<Link href="/tools/site-audit" className="font-semibold text-primary hover:underline">{"site audit"}</Link>{"."}</></li></ul><p className="mt-3 text-muted-foreground leading-relaxed text-pretty"><></></p><p className="mt-3 text-muted-foreground leading-relaxed text-pretty"><>{"\nThe checker reads returned HTML without running JavaScript. Its previews can use fallback text, so check the tag fields as well as the preview. There is no explicit per-run URL count cap in the current interface or route; practical request and hosting limits still apply. Repeated titles and descriptions need manual comparison; the tool does not flag duplicates automatically."}</></p></div></section>
<section className="px-4 py-16 sm:px-6 lg:px-8"><div className="mx-auto max-w-3xl"><h2 className="font-heading text-2xl font-bold text-foreground text-balance sm:text-3xl">{"Check Meta Tags in Bulk Before You Publish"}</h2><p className="mt-3 text-muted-foreground leading-relaxed text-pretty"><>{"A "}<strong className="text-foreground">{"meta tag checker"}</strong>{" fetches and displays the key SEO tags inside a webpage's HTML — meta title, meta description, Open Graph and Twitter Card data — in one view."}</></p><p className="mt-3 text-muted-foreground leading-relaxed text-pretty"><>{"Checking them one page at a time is slow during site audits, content migrations or pre-launch reviews, so Ai Ranko's "}<strong className="text-foreground">{"bulk meta & OG checker"}</strong>{" lets you paste a list of URLs and see every result together, with no sign-up and no software to install."}</></p><p className="mt-3 text-muted-foreground leading-relaxed text-pretty"><>{"Whether you're an SEO, a developer or a content marketer, it's a simple "}<strong className="text-foreground">{"free meta tag audit tool"}</strong>{" for catching missing, repeated or overlong tags before they go live."}</></p></div></section>
<section className="px-4 py-16 sm:px-6 lg:px-8"><div className="mx-auto max-w-5xl"><h2 className="font-heading text-2xl font-bold text-foreground text-balance sm:text-3xl">{"How to Use Bulk Results in an Audit or Migration"}</h2><ol className="flex flex-col gap-3"><li className="text-sm text-muted-foreground leading-relaxed"><>{"1. "}<strong className="text-foreground">{"Collect your URLs:"}</strong>{" take them from your sitemap (build one with our "}<Link href="/tools/xml-sitemap-generator" className="font-semibold text-primary hover:underline">{"XML sitemap generator"}</Link>{" if you need to) or your CMS, and paste them in."}</></li><li className="text-sm text-muted-foreground leading-relaxed"><>{"2. "}<strong className="text-foreground">{"Look for gaps:"}</strong>{" URLs with no description, no og:image or no twitter:card."}</></li><li className="text-sm text-muted-foreground leading-relaxed"><>{"3. "}<strong className="text-foreground">{"Look for repeats:"}</strong>{" the same title or description on several pages. Rewrite each so it describes that page."}</></li><li className="text-sm text-muted-foreground leading-relaxed"><>{"4. "}<strong className="text-foreground">{"Check length:"}</strong>{" very long titles and descriptions; confirm the width in the "}<Link href="/tools/meta-title-description-bulk-pixel-checker" className="font-semibold text-primary hover:underline">{"bulk pixel checker"}</Link>{"."}</></li><li className="text-sm text-muted-foreground leading-relaxed"><>{"5. "}<strong className="text-foreground">{"Fix and re-check:"}</strong>{" update the tags in your CMS, clear any cache, then run the same list again."}</></li></ol><p className="mt-3 text-muted-foreground leading-relaxed text-pretty"><>{"For a single page you can also check the tags by hand; see our guide on "}<Link href="/blog/how-to-check-meta-tags-on-any-website" className="font-semibold text-primary hover:underline">{"how to check meta tags on any website"}</Link>{"."}</></p></div></section>
      {/* ── FAQ ── */}
      <section className="border-t border-border bg-card px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 text-center">
            <h2 className="font-heading text-2xl font-bold text-foreground text-balance sm:text-3xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-muted-foreground text-pretty">
              Everything you need to know about Ai Ranko&apos;s Bulk Meta &amp; OG Checker.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {metaCheckerFaqs.map((faq, i) => (
              <details
                key={i}
                className="group rounded-2xl border border-border bg-background shadow-sm"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-heading font-semibold text-foreground hover:text-primary transition-colors">
                  {faq.q}
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <div className="border-t border-border px-5 py-4 text-sm leading-relaxed text-muted-foreground">
                  {faq.content}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
