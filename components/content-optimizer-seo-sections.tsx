import Link from 'next/link'
import {
  ShieldCheck, Star, Search, Layers, Wand2, Lightbulb, Award, FileText,
  Target, TrendingUp, ArrowRight, Users,
} from 'lucide-react'

const faqs = [
  {
    "q": "What does this tool actually check?",
    "a": "It reviews your text for signs of experience, expertise and trust, how people-first and useful it reads, keyword and related-term coverage, whether the content type matches the search intent, structure and readability, heading quality, on-page basics (title, meta description, URL slug, schema type, internal link ideas) and subtopics you may have missed."
  },
  {
    "q": "What is E-E-A-T and why does it matter?",
    "a": "E-E-A-T stands for Experience, Expertise, Authoritativeness and Trustworthiness. Google's search quality raters use these ideas to assess whether results are helpful, and Google's guidance encourages content that shows them. Google says trust is the most important of the four."
  },
  {
    "q": "Is E-E-A-T a Google ranking factor?",
    "a": "Not directly. Google says E-E-A-T itself isn't a specific ranking factor, but its systems use a mix of signals that can identify content with good E-E-A-T. This tool looks for signs of those qualities in your text, such as first-hand experience, clear sourcing and author information."
  },
  {
    "q": "How is this different from a grammar checker?",
    "a": "A grammar checker fixes spelling and language. This tool looks at whether the content serves the searcher: does it match the intent, cover the topic, show experience and expertise, and have a clear structure? It then suggests specific rewrites and fixes."
  },
  {
    "q": "Does the tool follow Google's rules?",
    "a": "It's built around Google's public guidance on helpful, reliable, people-first content and on-page best practice. It isn't made by Google and can't see how Google ranks a specific page; treat the report as an editor's checklist, not a prediction."
  },
  {
    "q": "How accurate is the E-E-A-T score?",
    "a": "It's an AI estimate based only on the text you paste: things like first-hand experience, original data, credentials, citations and author attribution. It can't see your site's reputation, your authors' track record, links to your site or how real users respond, which also matter."
  },
  {
    "q": "What are related terms (or \"LSI keywords\")?",
    "a": "They're words and phrases a knowledgeable writer would naturally use when covering a topic, for example \"arch support\" and \"cushioning\" in an article about running shoes. The SEO name \"LSI keywords\" is widely used, but what matters is covering the topic properly for the reader, not adding a list of terms."
  },
  {
    "q": "How much content can I analyse?",
    "a": "Between 100 and 4,000 words per analysis. For longer pieces, audit each major section separately for more focused feedback."
  },
  {
    "q": "Is the tool really free?",
    "a": "Yes. The content optimizer is free to use and you don't need to sign up."
  },
  {
    "q": "Will a higher score improve my Google rankings?",
    "a": "Not on its own. The score is a guide to making the content more useful and complete; rankings depend on many things the tool can't measure, including competition, links and how well the page meets searchers' needs. Use the fixes that genuinely improve the page for readers."
  },
  {
    "q": "What should I do after seeing the results?",
    "a": "Start with the critical issues, then apply the heading rewrites that make sense, add missing subtopics as new sections where they help the reader, and use the suggested title and meta as a starting point. Re-run the tool after editing to check what's left."
  }
]

export default function ContentOptimizerSeoSections() {
  return (
    <>
      <section className="border-t border-border bg-muted/30 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">How It Works</h2>
            <p className="mt-3 text-muted-foreground">From pasted draft to a prioritised list of fixes.</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              { step: '01', title: 'Paste Content + Keyword', description: 'Paste your existing article and enter the target keyword you want to rank for. Optionally pick the content type (blog post, landing page, review, etc.).', icon: FileText },
              { step: '02', title: 'AI Reviews Your Content', description: 'Our AI reviews your content against Google\'s public guidance on helpful content and E-E-A-T, plus on-page SEO best practice, and gives you a set of scores and an overall grade.', icon: ShieldCheck },
              { step: '03', title: 'Apply Concrete Fixes', description: 'Get specific rewrites: a new title, new meta description, heading rewrites, missing related terms, and a prioritised list of issues with exact fixes. Copy and paste, then re-run.', icon: Wand2 },
            ].map((s) => (
              <div key={s.step} className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground"><s.icon className="h-5 w-5" /></div>
                  <span className="font-heading text-4xl font-bold text-muted/50">{s.step}</span>
                </div>
                <h3 className="font-heading text-xl font-semibold text-foreground">{s.title}</h3>
                <p className="leading-relaxed text-muted-foreground">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">What the Audit Checks</h2>
            <p className="mt-3 text-muted-foreground">Built around Google&apos;s public guidance for creating helpful content.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: ShieldCheck, title: 'E-E-A-T Score',         description: 'Experience, Expertise, Authoritativeness, and Trustworthiness. The qualities Google\'s search quality raters use to assess whether content is helpful and reliable.', color: 'text-purple-600', bg: 'bg-purple-50' },
              { icon: Star,        title: 'Helpful Content Score', description: 'Detects "people-first" vs "search-engine-first" signals. Identifies generic claims, recycled summaries, and missing unique perspective.',                                color: 'text-amber-600',  bg: 'bg-amber-50' },
              { icon: Search,      title: 'Keyword + Related Terms', description: 'Primary keyword usage and placement, plus related terms readers may expect the article to cover.',                                              color: 'text-primary',    bg: 'bg-primary/10' },
              { icon: Target,      title: 'Search Intent Match',   description: 'Detects whether the keyword is informational, commercial, transactional, or navigational — and whether your content type matches.',                                            color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { icon: Layers,      title: 'Structure + Readability', description: 'Paragraph length, H2/H3 hierarchy, AI-estimated reading ease, word count vs intent. Returns an estimated reading grade and structure issues.',                                                  color: 'text-blue-600',   bg: 'bg-blue-50' },
              { icon: Wand2,       title: 'Heading Rewrites',      description: 'Asks the AI to rewrite 4-8 existing headings for SEO and clarity, with a reason for each change.',                                                                  color: 'text-rose-600',   bg: 'bg-rose-50' },
              { icon: FileText,    title: 'On-Page SEO',           description: 'New optimised title (50-60 chars), meta description (140-160 chars), URL slug, recommended schema type, and internal linking suggestions.',                                     color: 'text-teal-600',   bg: 'bg-teal-50' },
              { icon: Lightbulb,   title: 'Missing Topics',        description: 'Suggests 3-6 subtopics that articles on this topic often cover and yours doesn\'t, with a suggested H2 for each.',                                                                          color: 'text-indigo-600', bg: 'bg-indigo-50' },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-md">
                <div className={`mb-3 inline-flex rounded-xl p-2.5 ${f.bg}`}><f.icon className={`h-5 w-5 ${f.color}`} /></div>
                <h3 className="mb-2 font-heading text-base font-semibold text-foreground">{f.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-muted/30 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">What Google Says About Helpful Content</h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">Google&apos;s advice is simple to state and harder to follow: create content for people first, not to attract search visits. Its guide to <Link href="https://developers.google.com/search/docs/fundamentals/creating-helpful-content" className="text-primary hover:underline">creating helpful, reliable, people-first content</Link> suggests asking <strong>Who</strong> created the content, <strong>How</strong> it was made and <strong>Why</strong> it exists.</p>
          <p className="mt-4 leading-relaxed text-muted-foreground">A few points from Google&apos;s own documentation that this tool is built around:</p>
          <ul className="mt-6 space-y-3 list-disc pl-6">
          <li className="text-sm leading-relaxed text-muted-foreground"><strong>The helpful content system is now part of core ranking.</strong> It was announced in 2022, and in March 2024 it became part of Google&apos;s core ranking systems (<Link href="https://developers.google.com/search/docs/appearance/ranking-systems-guide" className="text-primary hover:underline">ranking systems guide</Link>).</li>
          <li className="text-sm leading-relaxed text-muted-foreground"><strong>E-E-A-T isn&apos;t a single ranking factor.</strong> Google says E-E-A-T itself isn&apos;t a specific ranking factor, but its systems use a mix of signals that can identify content with good experience, expertise, authoritativeness and trust, and that of the four, trust is most important (<Link href="https://developers.google.com/search/docs/fundamentals/creating-helpful-content" className="text-primary hover:underline">helpful content guide</Link>; background: <Link href="https://developers.google.com/search/blog/2022/12/google-raters-guidelines-e-e-a-t" className="text-primary hover:underline">Google on E-E-A-T</Link>).</li>
          <li className="text-sm leading-relaxed text-muted-foreground"><strong>There is no preferred word count.</strong> Google says so directly in the same helpful-content guide, so this tool judges depth against the topic and intent, not a target length.</li>
          <li className="text-sm leading-relaxed text-muted-foreground"><strong>AI-assisted content is judged like any other content.</strong> Google says it focuses on the quality of content rather than how it is produced (<Link href="https://developers.google.com/search/blog/2023/02/google-search-and-ai-content" className="text-primary hover:underline">Google Search and AI content</Link>; see also <Link href="https://developers.google.com/search/docs/fundamentals/using-gen-ai-content" className="text-primary hover:underline">guidance on generative AI content</Link>).</li>
          </ul>
        </div>
      </section>

      <section className="border-t border-border bg-muted/30 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">What the Scores Can&apos;t See</h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">The optimizer only sees the text you paste. It can&apos;t see:</p>
          <ul className="mt-6 space-y-3 list-disc pl-6">
          <li className="text-sm leading-relaxed text-muted-foreground">your site&apos;s reputation, your authors&apos; track record or links pointing to your site;</li>
          <li className="text-sm leading-relaxed text-muted-foreground">how real visitors use the page;</li>
          <li className="text-sm leading-relaxed text-muted-foreground">what currently ranks for your keyword;</li>
          <li className="text-sm leading-relaxed text-muted-foreground">facts: it can flag claims that need a source, but it can&apos;t verify them.</li>
          </ul>
          <p className="mt-4 leading-relaxed text-muted-foreground">Treat the scores as an editor&apos;s checklist. A higher score doesn&apos;t guarantee better rankings; making the page more useful for the reader is the goal.</p>
          <p className="mt-4 leading-relaxed text-muted-foreground">Your pasted text and keyword are sent to a third-party AI service for analysis; the tool code does not save them to a database or browser storage, but error logs may include part of an AI response, and the code does not establish the service’s retention policy.</p>
        </div>
      </section>

      <section className="border-t border-border bg-muted/30 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">How to Act on the Report</h2>
          <ol className="mt-6 space-y-3 list-decimal pl-6">
          <li className="text-sm leading-relaxed text-muted-foreground">Fix anything marked critical first, such as a mismatch between your content type and the search intent.</li>
          <li className="text-sm leading-relaxed text-muted-foreground">Add first-hand detail only you can provide: what you tested, saw or measured, with photos or data where you have them.</li>
          <li className="text-sm leading-relaxed text-muted-foreground">Apply the heading rewrites that make the structure clearer; skip any that don&apos;t fit.</li>
          <li className="text-sm leading-relaxed text-muted-foreground">Add missing subtopics as new sections only where they help the reader.</li>
          <li className="text-sm leading-relaxed text-muted-foreground">Use the suggested title and meta as a starting point, then check their width with the <Link href="/tools/meta-title-description-pixel-generator" className="text-primary hover:underline">meta title &amp; description generator</Link> or the <Link href="/tools/meta-title-description-bulk-pixel-checker" className="text-primary hover:underline">bulk pixel checker</Link>.</li>
          <li className="text-sm leading-relaxed text-muted-foreground">Re-run the optimizer to see what&apos;s left.</li>
          </ol>
        </div>
      </section>

      <section className="border-t border-border bg-muted/30 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">Content Optimizer, Writer or Detector?</h2>
          <ul className="mt-6 space-y-3 list-disc pl-6">
          <li className="text-sm leading-relaxed text-muted-foreground"><strong>Use this content optimizer</strong> when you already have a draft and want to know how to improve it.</li>
          <li className="text-sm leading-relaxed text-muted-foreground"><strong>Use the <Link href="/tools/content-writer" className="text-primary hover:underline">AI content writer</Link></strong> when you&apos;re starting from scratch.</li>
          <li className="text-sm leading-relaxed text-muted-foreground"><strong>Use the <Link href="/tools/plagiarism-checker" className="text-primary hover:underline">AI content detector &amp; grammar checker</Link></strong> to check readability and grammar before you publish.</li>
          <li className="text-sm leading-relaxed text-muted-foreground"><strong>Use the <Link href="/tools/seo-strategy-maker" className="text-primary hover:underline">SEO strategy maker</Link></strong> to plan which topics to write about in the first place, and the <Link href="/tools/site-audit" className="text-primary hover:underline">site audit tool</Link> to check the technical side of the site.</li>
          </ul>
        </div>
      </section>

      <section className="border-t border-border bg-muted/30 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">Who Uses This Tool</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: TrendingUp, title: 'SEO Managers',    description: 'Audit articles before they\'re published and catch thin or off-intent content early.' },
              { icon: Users,      title: 'Content Marketers', description: 'Score AI-drafted articles before shipping. Check for experience and expertise signals and add useful subtopics you missed.' },
              { icon: FileText,   title: 'Bloggers',         description: 'Get one-click rewrites for titles, headings, and metas. Replace generic phrases with specific, clearer alternatives.' },
              { icon: Award,      title: 'Agencies',         description: 'Run client content through a consistent audit and share clear, specific fixes.' },
            ].map((u) => (
              <div key={u.title} className="rounded-2xl border border-border bg-card p-5">
                <div className="mb-3 inline-flex rounded-xl bg-primary/10 p-2.5"><u.icon className="h-5 w-5 text-primary" /></div>
                <h3 className="mb-2 font-heading text-base font-semibold text-foreground">{u.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{u.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="border-t border-border px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <details key={faq.q} className="group rounded-2xl border border-border bg-card">
                <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-4 font-heading text-sm font-semibold text-foreground">
                  {faq.q}
                  <span className="shrink-0 transition-transform duration-200 group-open:rotate-180">
                    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
                      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </summary>
                <p className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-gradient-to-br from-primary/5 via-accent/5 to-transparent px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">Ready to Improve Your Content?</h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Paste any article and get a content audit with concrete rewrites — free.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/tools/content-writer" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted">
              AI Content Writer <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/tools/plagiarism-checker" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted">
              AI Content Detector <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/tools/seo-strategy-maker" className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
              SEO Strategy Maker <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
