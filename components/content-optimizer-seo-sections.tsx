import Link from 'next/link'
import {
  ShieldCheck, Star, Search, Layers, Wand2, Lightbulb, Award, FileText,
  Target, TrendingUp, CheckCircle2, ArrowRight, Users, BookOpen,
} from 'lucide-react'

export default function ContentOptimizerSeoSections() {
  return (
    <>
      <section className="border-t border-border bg-muted/30 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">How It Works</h2>
            <p className="mt-3 text-muted-foreground">From paste to publish-ready in under a minute.</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              { step: '01', title: 'Paste Content + Keyword', description: 'Paste your existing article and enter the target keyword you want to rank for. Optionally pick the content type (blog post, landing page, review, etc.).', icon: FileText },
              { step: '02', title: 'AI Audits Against Google', description: 'GPT-4o scores your content against Google\'s 2024 Search Quality Rater Guidelines, Helpful Content System, and on-page SEO best practices. Six scores. One overall grade.', icon: ShieldCheck },
              { step: '03', title: 'Apply Concrete Fixes', description: 'Get specific rewrites: a new title, new meta description, heading rewrites, missing LSI keywords, and a prioritized list of issues with exact fixes. Copy and paste, then re-run.', icon: Wand2 },
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
            <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">Audits 7 Google Ranking Dimensions</h2>
            <p className="mt-3 text-muted-foreground">Built around what Google&apos;s public guidelines actually say.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: ShieldCheck, title: 'E-E-A-T Score',         description: 'Experience, Expertise, Authoritativeness, and Trustworthiness. The framework used by Google\'s Quality Raters since 2014 — and reinforced in every 2024 update.', color: 'text-purple-600', bg: 'bg-purple-50' },
              { icon: Star,        title: 'Helpful Content Score', description: 'Detects "people-first" vs "search-engine-first" signals. Identifies generic claims, recycled summaries, and missing unique perspective.',                                color: 'text-amber-600',  bg: 'bg-amber-50' },
              { icon: Search,      title: 'Keyword + LSI Analysis', description: 'Primary keyword usage, density, and placement. Identifies 5-10 missing semantic terms that signal topical authority to Google.',                                              color: 'text-primary',    bg: 'bg-primary/10' },
              { icon: Target,      title: 'Search Intent Match',   description: 'Detects whether the keyword is informational, commercial, transactional, or navigational — and whether your content type matches.',                                            color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { icon: Layers,      title: 'Structure + Readability', description: 'Paragraph length, H2/H3 hierarchy, Flesch Reading Ease, word count vs intent. Returns reading grade and structure issues.',                                                  color: 'text-blue-600',   bg: 'bg-blue-50' },
              { icon: Wand2,       title: 'Heading Rewrites',      description: 'Picks 4-8 of your existing headings and rewrites each one for SEO + clarity, with the reason for each change.',                                                                  color: 'text-rose-600',   bg: 'bg-rose-50' },
              { icon: FileText,    title: 'On-Page SEO',           description: 'New optimized title (50-60 chars), meta description (140-160 chars), URL slug, recommended schema type, and internal linking suggestions.',                                     color: 'text-teal-600',   bg: 'bg-teal-50' },
              { icon: Lightbulb,   title: 'Missing Topics',        description: 'Identifies 3-6 subtopics your competitors cover that you don\'t — with a suggested H2 heading for each.',                                                                          color: 'text-indigo-600', bg: 'bg-indigo-50' },
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
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">
                Why Google Rules Decide Whether You Rank
              </h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Google&apos;s 2024 Helpful Content update and E-E-A-T framework aren&apos;t marketing buzzwords — they are the algorithms deciding which pages get traffic and which get buried. Content that fails E-E-A-T checks gets demoted across entire sites, even if individual articles are technically optimized.
              </p>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                This tool grades your content against the same signals Google&apos;s Search Quality Raters look for, then writes the exact fixes — heading by heading, missing topic by missing topic — so you can ship publish-ready content that respects the rules.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'Helpful Content Updates demote entire sites with low-quality content, not just individual pages',
                  'E-E-A-T signals are now in core ranking systems — not just Quality Rater documents',
                  'Content matching search intent ranks 50%+ better than mismatched format',
                  'Comprehensive topic coverage beats keyword density for modern semantic search',
                  'First-hand experience markers ("I tested", "we measured") are the strongest E-E-A-T signal',
                  'Generic AI-generated content without expertise is now actively penalized',
                  'Internal linking + topical clusters compound ranking gains across the site',
                ].map((p) => (
                  <li key={p} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-sm text-muted-foreground">{p}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { metric: '2024',   label: 'Helpful Content', sub: 'system version this tool tracks' },
                { metric: '4',      label: 'E-E-A-T pillars', sub: 'Experience, Expertise, Authority, Trust' },
                { metric: '7',      label: 'Score dimensions', sub: 'audited per analysis' },
                { metric: '8-15',   label: 'Issues + fixes',  sub: 'returned per content piece' },
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

      <section className="border-t border-border px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">How We Compare</h2>
            <p className="mt-3 text-muted-foreground">Most content optimizers cost $99+/mo. This one is free and Google-rule-aware.</p>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-5 py-4 text-left font-semibold text-foreground">Feature</th>
                  <th className="px-5 py-4 text-center font-semibold text-primary">Ai Ranko</th>
                  <th className="px-5 py-4 text-center font-semibold text-muted-foreground">SurferSEO</th>
                  <th className="px-5 py-4 text-center font-semibold text-muted-foreground">Frase</th>
                  <th className="px-5 py-4 text-center font-semibold text-muted-foreground">Clearscope</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['E-E-A-T scoring (per pillar)',     '✓', '—', 'Partial', '—'],
                  ['Helpful Content score',           '✓', '—', '—', '—'],
                  ['Search intent classification',    '✓', '✓', '✓', '—'],
                  ['Keyword + LSI analysis',          '✓', '✓', '✓', '✓'],
                  ['Heading rewrites with reasons',   '✓', 'Add-on', 'Add-on', '—'],
                  ['Missing topic detection',         '✓', '✓', '✓', '✓'],
                  ['Title + meta generation',         '✓', 'Add-on', '✓', '—'],
                  ['Schema type suggestion',          '✓', '—', '—', '—'],
                  ['No sign-up required',             '✓', '—', '—', '—'],
                  ['Cost',                            '$0', '$89+/mo', '$45+/mo', '$170+/mo'],
                ].map(([f, ...cols]) => (
                  <tr key={f} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-5 py-3.5 font-medium text-foreground">{f}</td>
                    {cols.map((v, i) => (
                      <td key={i} className={`px-5 py-3.5 text-center ${i === 0 ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-muted/30 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">Who Uses This Tool</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: TrendingUp, title: 'SEO Managers',    description: 'Audit every article before publish. Stop the Helpful Content updates from wrecking client traffic by catching low-quality content before Google does.' },
              { icon: Users,      title: 'Content Marketers', description: 'Score AI-drafted articles before shipping. Hit E-E-A-T baseline and add the missing topics competitors are ranking for.' },
              { icon: FileText,   title: 'Bloggers',         description: 'Get one-click rewrites for titles, headings, and metas. Replace generic phrases with specific, ranking-friendly alternatives.' },
              { icon: Award,      title: 'Agencies',         description: 'Run client content through a consistent Google-rules audit. Deliver client-ready optimization reports without paying SurferSEO or Clearscope subscriptions.' },
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

      <section className="border-t border-border px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {[
              { q: 'What does this tool actually check?', a: 'It audits your content against Google\'s 2024 Search Quality Rater Guidelines and Helpful Content System: E-E-A-T signals, keyword + LSI coverage, search intent match, structure and readability, on-page SEO (title, meta, slug, schema), missing topics, heading quality, and content depth.' },
              { q: 'What is E-E-A-T?', a: 'E-E-A-T stands for Experience, Expertise, Authoritativeness, and Trustworthiness — Google\'s official quality framework. Content that signals real first-hand experience, expert credentials, and trust markers ranks higher and is less likely to be demoted by Helpful Content updates.' },
              { q: 'How is this different from a grammar checker?', a: 'Grammar checkers fix language. This tool grades content against Google\'s actual ranking factors — search intent match, topical coverage, E-E-A-T signals, on-page optimization — and writes the specific rewrites and fixes.' },
              { q: 'How accurate is the E-E-A-T score?', a: 'The score uses GPT-4o to detect concrete signals in your text — first-person experience markers, original data, expert credentials, citations, author attribution. It is a calibrated estimate; final E-E-A-T also depends on author/site reputation measured externally by Google.' },
              { q: 'What are LSI keywords and why do I need them?', a: 'LSI (Latent Semantic Indexing) keywords are semantically related terms that signal topical depth. An article about "best running shoes" should also mention "pronation", "arch support", "midsole cushioning". Including these tells Google you cover the topic comprehensively, not superficially.' },
              { q: 'How much content can I analyze?', a: 'Between 100 and 4,000 words per analysis. For longer pieces, audit each major section separately for more focused feedback.' },
              { q: 'Is it really free?', a: 'Yes — no sign-up, no credit card, no watermark, unlimited analyses.' },
              { q: 'What do I do after seeing the results?', a: 'Start with the Issues tab and fix all Critical issues first. Apply heading rewrites (one click to copy each). Add missing LSI keywords naturally. Replace your title/meta with the suggested versions. Add missing topics as new H2 sections. Re-run the tool to verify your score went up.' },
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

      <section className="border-t border-border bg-gradient-to-br from-primary/5 via-accent/5 to-transparent px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">Ready to Pass Google&apos;s Bar?</h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Paste any article, get a Google-rules audit + concrete rewrites in under a minute — free.
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
