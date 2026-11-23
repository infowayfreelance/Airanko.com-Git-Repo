import Link from 'next/link'
import {
  PenLine,
  SlidersHorizontal,
  Wand2,
  Sparkles,
  Ruler,
  Smartphone,
  RefreshCw,
  Download,
  Tag,
  TrendingUp,
  MousePointerClick,
  ScissorsLineDashed,
  Clock,
  Search,
} from 'lucide-react'

// ─── How It Works ────────────────────────────────────────────────────────────

const steps = [
  {
    icon: PenLine,
    step: '01',
    title: 'Paste Your Topics',
    desc: 'Add one page topic, target keyword, or short brief per line — up to 20 pages in a single batch. No URL required, just what the page is about.',
  },
  {
    icon: SlidersHorizontal,
    step: '02',
    title: 'Choose Fields & Device',
    desc: 'Pick titles, descriptions, or both, set how many variants you need per page, and choose Desktop or Mobile pixel width limits.',
  },
  {
    icon: Wand2,
    step: '03',
    title: 'Generate & Fine-Tune',
    desc: 'AI drafts options towards a length target. Review and edit each line while the badge measures its width against estimated limits.',
  },
]

// ─── Key Features ────────────────────────────────────────────────────────────

const features = [
  {
    icon: Sparkles,
    title: 'AI Meta Title & Description Generator',
    desc: 'Generate meta title and meta description options from a topic, keyword or short brief, in the tone you choose. Review and edit every option before you use it.',
  },
  {
    icon: Ruler,
    title: 'Real Pixel-Width Measurement',
    desc: 'Every variant is measured with the browser\'s real canvas text renderer against the same pixel limits used by our Meta Pixel Checker — not a rough character-count guess.',
  },
  {
    icon: Smartphone,
    title: 'Desktop & Mobile Targeting',
    desc: 'Switch between Desktop and Mobile to re-measure existing variants without regenerating them.',
  },
  {
    icon: RefreshCw,
    title: 'Per-Page Regenerate',
    desc: 'Not happy with one page\'s results? Regenerate just that page without starting the whole batch over.',
  },
  {
    icon: Tag,
    title: 'Bulk Meta Title Generator',
    desc: 'Generate meta titles and descriptions for up to 20 pages — and up to 5 variants of each — in a single AI run.',
  },
  {
    icon: Download,
    title: 'CSV & JSON Export',
    desc: 'CSV exports the input, field, variant number, text, pixel width and status for the selected device. JSON exports the generation settings and result text. Review the files before adding text to your CMS.',
  },
]

// ─── Why It Matters ──────────────────────────────────────────────────────────

const whyPoints = [
  {
    icon: ScissorsLineDashed,
    title: 'Review Possible Truncation',
    desc: 'Titles and descriptions that are too wide can be shortened with an ellipsis in search results, which can cut off the most useful words.',
  },
  {
    icon: MousePointerClick,
    title: 'Complete, Readable Snippets',
    desc: 'Concise wording can help keep the message readable. Google’s advice is to write descriptive titles and snippets that match the page; estimated pixel fit does not guarantee the final result.',
  },
  {
    icon: Smartphone,
    title: 'Check Mobile Too',
    desc: 'Mobile results use different available widths and title font sizes. Switch the device toggle to check both.',
  },
  {
    icon: Clock,
    title: 'Batch Writing and Review',
    desc: 'Draft options for several page topics together, then review the wording and pixel feedback for each page.',
  },
  {
    icon: Search,
    title: 'Every Page Gets a Real Meta Description',
    desc: 'Draft a page-specific description and check it against the content. Google may still create its snippet from the page itself.',
  },
  {
    icon: TrendingUp,
    title: 'Built for SEO Teams at Scale',
    desc: 'Bulk-generate meta tags for new content, site migrations, or an entire backlog of thin meta descriptions — without opening 20 separate browser tabs.',
  },
]

export default function MetaTitleDescriptionPixelGeneratorSeoSections() {
  return (
    <div className="border-t border-border bg-background">

      {/* ── How It Works ── */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="font-heading text-2xl font-bold text-foreground text-balance sm:text-3xl">How It Works</h2>
            <p className="mt-2 text-muted-foreground text-pretty">
              Three steps to draft and review title and description options against estimated pixel limits.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {steps.map((s) => {
              const Icon = s.icon
              return (
                <div key={s.step} className="relative flex flex-col items-start gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <span className="font-heading text-4xl font-bold text-primary/15 select-none leading-none">{s.step}</span>
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
            <h2 className="font-heading text-2xl font-bold text-foreground text-balance sm:text-3xl">Key Features</h2>
            <p className="mt-2 text-muted-foreground text-pretty">
              Generate options, review their pixel widths and export the text for editing or publishing.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => {
              const Icon = f.icon
              return (
                <div key={f.title} className="flex flex-col gap-3 rounded-2xl border border-border bg-background p-5 shadow-sm">
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

      {/* ── Why It Matters ── */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="font-heading text-2xl font-bold text-foreground text-balance sm:text-3xl">
              Why Pixel Width Matters for Meta Tags
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-muted-foreground leading-relaxed text-pretty">
              Google truncates titles and descriptions by rendered pixel width, not character count — so two titles with the same length can display completely differently in search results.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {whyPoints.map((b) => {
              const Icon = b.icon
              return (
                <div key={b.title} className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-foreground">{b.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{b.desc}{b.title === 'Built for SEO Teams at Scale' && <> Auditing a whole site? See the <Link href="/tools/site-audit" className="text-primary underline underline-offset-4">site audit tool</Link>.</>}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-card px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-16">
          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">What Makes a Good Meta Title and Description</h2>
            <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground">
              <p>Google does not set a fixed length limit for titles or descriptions. Its guidance on <Link href="https://developers.google.com/search/docs/appearance/title-link" className="text-primary underline underline-offset-4">title links</Link> asks for descriptive, concise titles that reflect each page, with distinct wording and no keyword stuffing. Its guidance on <Link href="https://developers.google.com/search/docs/appearance/snippet" className="text-primary underline underline-offset-4">snippets</Link> explains that descriptions are mainly built from page content. A meta description may be used when it provides a better summary.</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>Put the main topic first and keep the brand concise, so useful words remain visible if the end is cut off.</li>
                <li>Write a different title and description for every page.</li>
                <li>Describe what is really on the page. Do not promise things the page does not deliver.</li>
                <li>Use a natural phrase a person would search for. Avoid repeating the same keyword.</li>
              </ul>
            </div>
          </section>
          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">Why Google May Show a Different Title or Description</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">Google generates title links and snippets automatically. It can shorten text to fit the device width or choose wording from headings, page content and other sources. Keep the title and H1 consistent, and use the generated variants to find an accurate description of the page. Clear wording can help, but it does not guarantee the final search result.</p>
          </section>
          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">How to Use the Variants You Generate</h2>
            <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-muted-foreground">
              <li>Paste one topic or short brief per line, up to 20. Add the location or audience if relevant, and use the optional brand field when you want the name considered.</li>
              <li>Choose Titles, Descriptions or Both, request 1 to 5 variants and pick Desktop or Mobile. Choose a tone: Balanced / Professional, Persuasive &amp; benefit-driven, Concise &amp; direct, Friendly &amp; conversational, or Authoritative &amp; expert.</li>
              <li>Read every returned option. Pick wording that matches the page and edit it while reviewing the Fits, Near limit or Too long badge. Use Regenerate to request new options for a single page.</li>
              <li>Switch the device toggle to check the other screen size. Existing text is measured again without making another generation request.</li>
              <li>Export CSV or JSON, or copy the text, then add your chosen wording to the correct fields in your CMS.</li>
              <li>After publishing, use the <Link href="/tools/meta-title-description-bulk-pixel-checker" className="text-primary underline underline-offset-4">bulk meta title and description pixel checker</Link> to review fetched tags for missing text and possible width problems. It does not detect duplicate wording, so compare repeated titles and descriptions yourself.</li>
            </ol>
            <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground">
              <p>Widths are measured using browser canvas text metrics with Arial, then Helvetica and sans-serif fallbacks. Desktop titles use 20px and mobile titles use 18px. Descriptions use 14px on both. The estimated desktop limits are 600px for titles and 920px for descriptions; mobile limits are 580px and 680px.</p>
              <p>Fits means below 92% of the selected limit. Near limit starts at 92% and includes the limit itself. Too long means above the limit. These badges report width, not accuracy or completeness.</p>
              <p>Blank lines are ignored and an empty topic list disables generation. Only the first 20 non-empty lines are submitted by the form. Invalid API input returns an error. A generation failure shows an error and returns to the input form; if the AI response is not valid, try fewer topics or variants. Per-page regeneration can leave the existing results unchanged when it fails.</p>
            </div>
          </section>
          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">Generator or Checker: Which Tool Do You Need?</h2>
            <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-relaxed text-muted-foreground">
              <li><strong>Use this generator</strong> when you need new titles or descriptions. It requests options for up to 20 page topics and measures the returned text.</li>
              <li><strong>Use the <Link href="/tools/meta-title-description-bulk-pixel-checker" className="text-primary underline underline-offset-4">bulk pixel checker</Link></strong> to fetch existing titles and descriptions and review missing text or widths that may be cut off. Duplicate wording needs a separate manual review.</li>
              <li><strong>Use the <Link href="/tools/meta-checker" className="text-primary underline underline-offset-4">bulk meta &amp; Open Graph checker</Link></strong> to review meta, Open Graph and Twitter Card tags from public pages.</li>
              <li>Writing a whole page? Try the <Link href="/tools/content-writer" className="text-primary underline underline-offset-4">AI content writer</Link>, and read our guide to <Link href="/blog/how-to-write-meta-titles-and-descriptions" className="text-primary underline underline-offset-4">writing meta titles and descriptions</Link>.</li>
            </ul>
          </section>
          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">What This Tool Can&apos;t Do</h2>
            <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-relaxed text-muted-foreground">
              <li>It does not read your live page. It writes from the topic or brief you provide, so check every option against the page.</li>
              <li>AI output can be generic, inaccurate or incomplete. Review the wording and the number of returned options before publishing.</li>
              <li>Pixel limits are estimates. Google publishes no official spec and can change its layout.</li>
              <li>Google may still show a different title or description.</li>
              <li>One batch accepts up to 20 page topics and requests 1 to 5 variants per selected field. The API prompts for the count rather than enforcing exact output-array lengths.</li>
            </ul>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">Your topics, optional brand and tone are sent to a third-party AI service; this endpoint does not save them to a database, but error logs may include generated text. Avoid confidential information.</p>
          </section>
        </div>
      </section>


      {/* ── SEO Content Block ── */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-heading text-2xl font-bold text-foreground text-balance sm:text-3xl">
            A Free AI Meta Title &amp; Description Generator That Checks Pixel Width
          </h2>
          <div className="mt-5 flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <p>{"Titles and descriptions need to explain the page clearly. Character counts alone do not capture the difference between wide and narrow letters, so this generator also measures the text’s pixel width."}</p>
            <p>{"The browser uses the same canvas measurement functions as our Meta Pixel Checker. The text width is measured for the configured fonts, while the display limits are estimates rather than an official Google specification."}</p>
            <p>{"Paste up to 20 topics, keywords or short briefs and request 1 to 5 variants per selected field. Check each option for accuracy and edit it before using it on a live page."}</p>
            <p>{"The generator can support a content launch, a migration or a review of older meta descriptions. It does not fetch your website or update your CMS, and it cannot guarantee which title or snippet Google will show."}</p>
          </div>
        </div>
      </section>

    </div>
  )
}
