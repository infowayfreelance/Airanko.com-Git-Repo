import Link from 'next/link'
import {
  Search,
  Target,
  Layers,
  Lightbulb,
  Download,
  Globe,
  HelpCircle,
  CheckCircle2,
  TrendingUp,
  Filter,
  FileText,
  ArrowRight,
  Zap,
  Users,
} from 'lucide-react'

export default function KeywordResearchSeoSections() {
  return (
    <>
      {/* ── How It Works ── */}
      <section className="border-t border-border bg-muted/30 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">How It Works</h2>
            <p className="mt-3 text-muted-foreground">
              Real Google data + AI strategy, in three steps.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              { step: '01', title: 'Enter Seed Keyword', description: 'Type your seed term, pick a country, optionally add your niche. The tool expands it with question prefixes and modifiers to maximize coverage.', icon: Search },
              { step: '02', title: 'Pull Real Google Data', description: 'The backend queries Google Autocomplete with 15+ variations of your seed — returning 50–80 real keyword ideas straight from Google itself. No synthetic data.', icon: Zap },
              { step: '03', title: 'AI Adds Strategy', description: 'GPT-4o classifies each keyword by intent and difficulty, groups them into thematic clusters, extracts PAA questions, and writes ready-to-use content ideas.', icon: Lightbulb },
            ].map((s) => (
              <div key={s.step} className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                    <s.icon className="h-5 w-5" />
                  </div>
                  <span className="font-heading text-4xl font-bold text-muted/50">{s.step}</span>
                </div>
                <h3 className="font-heading text-xl font-semibold text-foreground">{s.title}</h3>
                <p className="leading-relaxed text-muted-foreground">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Key Features ── */}
      <section className="border-t border-border px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">
              Everything You Need to Plan Content
            </h2>
            <p className="mt-3 text-muted-foreground">
              Most keyword tools cost $99/mo or higher. This one is free — and built on the same real Google data.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Search, title: 'Real Google Data', description: 'Keywords pulled directly from Google Autocomplete — the same suggestions Google shows in the search bar. Real searches, not AI inventions.', color: 'text-primary', bg: 'bg-primary/10' },
              { icon: Target, title: 'Intent Classification', description: 'Every keyword tagged informational / commercial / transactional / navigational. Match content to intent to dominate the SERP.', color: 'text-blue-600', bg: 'bg-blue-50' },
              { icon: Layers, title: 'Smart Clustering', description: 'AI groups keywords into 4–6 thematic clusters. One comprehensive article can rank for all keywords in a cluster — saving you weeks of work.', color: 'text-purple-600', bg: 'bg-purple-50' },
              { icon: HelpCircle, title: 'PAA Questions', description: 'Question-style keywords extracted automatically. Perfect for FAQ sections and People Also Ask box targeting.', color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { icon: Lightbulb, title: 'Content Ideas', description: '6–10 ready-to-use content briefs with SEO titles, target keywords, and unique angles — generated from your real keyword data.', color: 'text-amber-600', bg: 'bg-amber-50' },
              { icon: Globe, title: '14+ Countries', description: 'Target keyword research to specific geographies. Google Autocomplete returns region-specific suggestions for accurate local SEO.', color: 'text-teal-600', bg: 'bg-teal-50' },
              { icon: Filter, title: 'Smart Filters', description: 'Filter by cluster, intent, or difficulty in one click. Find quick wins (easy + commercial) or build authority (medium + informational).', color: 'text-indigo-600', bg: 'bg-indigo-50' },
              { icon: Download, title: 'CSV Export', description: 'Export every keyword with its cluster, intent, difficulty, and recommended content type — open in Google Sheets or Excel.', color: 'text-rose-600', bg: 'bg-rose-50' },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-md">
                <div className={`mb-3 inline-flex rounded-xl p-2.5 ${f.bg}`}>
                  <f.icon className={`h-5 w-5 ${f.color}`} />
                </div>
                <h3 className="mb-2 font-heading text-base font-semibold text-foreground">{f.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Keyword Research Matters ── */}
      <section className="border-t border-border bg-muted/30 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">
                Why Keyword Research Decides Whether You Rank
              </h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Publishing without keyword research is publishing to no one. The keywords you target decide which audiences find you, how much traffic you get, and whether your content compounds into compounding organic growth — or sits unread.
              </p>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Real keyword data — sourced from Google itself — surfaces what real people are typing into the search bar right now. AI clustering then turns that raw data into a publishable content plan: which articles to write, in which order, and what each one should target.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  '93% of online experiences start with a search engine — keywords are the entry point',
                  'Long-tail keywords (3+ words) convert 2.5× better than short head terms',
                  'Matching content to search intent is the #1 ranking signal after relevance',
                  'Cluster-based content strategy ranks 47% better than isolated articles',
                  'Question-style keywords are the fastest path to People Also Ask box inclusion',
                  'Local/country-targeted research compounds with hreflang and local SEO',
                  'Real Google Autocomplete data refreshes daily — capturing emerging trends faster than paid tools',
                ].map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-sm text-muted-foreground">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { metric: '93%',   label: 'Online journeys',  sub: 'start with a search engine' },
                { metric: '2.5×',  label: 'Better conversion', sub: 'from long-tail keywords' },
                { metric: '47%',   label: 'Better rankings',   sub: 'with topical clusters' },
                { metric: '80',    label: 'Real keywords',     sub: 'per search on this tool' },
              ].map((s) => (
                <div key={s.label} className="flex flex-col gap-1 rounded-2xl border border-border bg-card p-5">
                  <span className="font-heading text-3xl font-bold text-primary">{s.metric}</span>
                  <span className="text-sm font-semibold text-foreground">{s.label}</span>
                  <span className="text-xs text-muted-foreground">{s.sub}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Comparison ── */}
      <section className="border-t border-border px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">How We Compare</h2>
            <p className="mt-3 text-muted-foreground">
              Free, fast, and focused on what matters for publishing.
            </p>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-5 py-4 text-left font-semibold text-foreground">Feature</th>
                  <th className="px-5 py-4 text-center font-semibold text-primary">Ai Ranko</th>
                  <th className="px-5 py-4 text-center font-semibold text-muted-foreground">Ahrefs</th>
                  <th className="px-5 py-4 text-center font-semibold text-muted-foreground">Semrush</th>
                  <th className="px-5 py-4 text-center font-semibold text-muted-foreground">Ubersuggest</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Real Google Autocomplete data',  '✓', '✓', '✓', '✓'],
                  ['Intent classification',          '✓ AI', 'Manual', 'Manual', '—'],
                  ['Auto thematic clustering',       '✓', '—', 'Add-on', '—'],
                  ['PAA question extraction',        '✓', '✓', '✓', 'Limited'],
                  ['AI-generated content briefs',    '✓', 'Add-on', 'Add-on', '—'],
                  ['CSV export',                     '✓', '✓', '✓', '✓'],
                  ['No sign-up required',            '✓', '—', '—', '—'],
                  ['Free tier limits',               'Unlimited', '3/day', '10/day', '3/day'],
                  ['Cost',                           '$0', '$99+/mo', '$139+/mo', '$29+/mo'],
                ].map(([feat, ...cols]) => (
                  <tr key={feat} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-5 py-3.5 font-medium text-foreground">{feat}</td>
                    {cols.map((v, i) => (
                      <td key={i} className={`px-5 py-3.5 text-center ${i === 0 ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Ai Ranko does not show search volume / CPC / keyword difficulty scores — those require paid SERP APIs. Validate top picks in Google Keyword Planner (free).
          </p>
        </div>
      </section>

      {/* ── Use Cases ── */}
      <section className="border-t border-border bg-muted/30 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">Who Uses This Tool</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Users, title: 'Content Marketers', description: 'Build editorial calendars based on real searches. Cluster keywords by topic and ship full content series, not one-offs.' },
              { icon: TrendingUp, title: 'SEO Pros', description: 'Run rapid niche research for new clients. Identify quick-win clusters before pitching long-term retainers.' },
              { icon: FileText, title: 'Bloggers', description: 'Find topics readers actually search. Stop guessing — write the articles Google Autocomplete proves people want.' },
              { icon: Lightbulb, title: 'Founders', description: 'Validate product positioning. The keywords people search reveal the language to use in landing pages and ads.' },
            ].map((u) => (
              <div key={u.title} className="rounded-2xl border border-border bg-card p-5">
                <div className="mb-3 inline-flex rounded-xl bg-primary/10 p-2.5">
                  <u.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-2 font-heading text-base font-semibold text-foreground">{u.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{u.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="border-t border-border px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {[
              { q: 'Where do the keywords come from?', a: 'Directly from Google Autocomplete — the same suggestions Google shows when you start typing in the search bar. The tool expands your seed with question prefixes (what is, how to, why, etc.) and common modifiers to pull 50–80 real long-tails per query. No AI inventions, no scraped lists.' },
              { q: 'Does this tool show search volume?', a: 'No. Real search-volume numbers require paid APIs like Google Ads Keyword Planner, Ahrefs, or Semrush. This free tool focuses on real keyword ideas + AI-classified intent and difficulty. For volume, validate top picks in Google Keyword Planner (free with a Google Ads account).' },
              { q: 'How accurate is the difficulty estimate?', a: 'Difficulty is a qualitative AI estimate based on keyword length, specificity, and likely competition. It is labeled Easy / Medium / Hard — useful for prioritization, but not a substitute for real KD scores from paid tools.' },
              { q: 'What is intent classification and why does it matter?', a: 'Each keyword is tagged with one of four intents. Informational = research/learning. Commercial = comparing options. Transactional = ready to buy. Navigational = looking for a specific site. Matching your content type to the intent is the #1 ranking factor after relevance — a buying-intent keyword won\'t rank with a "what is" article.' },
              { q: 'How are clusters created?', a: 'GPT-4o groups all the real keywords into 4–6 thematic clusters — like "tutorials", "comparisons", "pricing", "features". Each cluster represents one content opportunity: one comprehensive article can rank for all keywords in a cluster.' },
              { q: 'Can I target a specific country?', a: 'Yes. Choose from 14+ countries. Google Autocomplete returns region-specific suggestions, so "tax filing" in the US returns different keywords than in the UK or India.' },
              { q: 'Is there a sign-up or trial limit?', a: 'No. The tool is completely free. No account, no watermark, unlimited queries.' },
              { q: 'How should I use this with other tools?', a: 'Pick 1–2 clusters that match your business goals. Run the suggested content ideas through our AI Content Writer to draft articles, then check originality with the AI Content Detector before publishing. Round out the workflow with the SEO Strategy Maker.' },
            ].map((faq) => (
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

      {/* ── CTA ── */}
      <section className="border-t border-border bg-gradient-to-br from-primary/5 via-accent/5 to-transparent px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">
            Ready to Plan Your Next Content Sprint?
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Pull 80 real Google keywords + AI clusters + content ideas — instantly, free.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/tools/content-writer"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              AI Content Writer
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/tools/seo-strategy-maker"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              SEO Strategy Maker
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
