import Link from 'next/link'
import {
  Bot,
  BookOpen,
  BarChart3,
  Wand2,
  ShieldCheck,
  Zap,
  Eye,
  Copy,
  TrendingUp,
  Users,
  FileText,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react'

export default function PlagiarismCheckerSeoSections() {
  return (
    <>
      {/* ── How It Works ── */}
      <section className="border-t border-border bg-muted/30 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">
              How It Works
            </h2>
            <p className="mt-3 text-muted-foreground">
              Four-layer content analysis in under 20 seconds — no sign-up, no fees.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Paste Your Text',
                description:
                  'Copy and paste any content — blog posts, articles, emails, product descriptions, or social copy. The tool accepts 30 to 3,000 words per analysis.',
                icon: Copy,
              },
              {
                step: '02',
                title: 'GPT-4o Analyzes',
                description:
                  'Our tool sends your content to GPT-4o, which performs a deep multi-layer scan: AI pattern detection, grammar checking, readability calculation, and word quality review — simultaneously.',
                icon: Zap,
              },
              {
                step: '03',
                title: 'See Your Report',
                description:
                  'Results appear in seconds with score gauges, inline text highlights (click any highlight to see the fix), and actionable suggestions you can copy with one click.',
                icon: Eye,
              },
            ].map((step) => (
              <div key={step.step} className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <span className="font-heading text-4xl font-bold text-muted/50">{step.step}</span>
                </div>
                <h3 className="font-heading text-xl font-semibold text-foreground">{step.title}</h3>
                <p className="leading-relaxed text-muted-foreground">{step.description}</p>
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
              Everything in One Analysis
            </h2>
            <p className="mt-3 text-muted-foreground">
              Most tools do one thing. This tool does four — simultaneously, for free.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Bot,
                title: 'AI Content Detection',
                description:
                  'Identifies formulaic structure, repetitive sentence patterns, generic phrasing, and the lack of personal voice that reveal AI authorship. Returns an AI% and Human% score.',
                color: 'text-amber-600',
                bg: 'bg-amber-50',
              },
              {
                icon: BookOpen,
                title: 'Grammar & Spelling',
                description:
                  'Catches subject-verb agreement errors, wrong tenses, misplaced modifiers, run-on sentences, and punctuation mistakes. Shows the exact correction with a one-sentence explanation.',
                color: 'text-red-600',
                bg: 'bg-red-50',
              },
              {
                icon: BarChart3,
                title: 'Readability Score',
                description:
                  'Calculates a Flesch Reading Ease equivalent score (0–100) and tells you the US school grade level. Grade 6–8 is the sweet spot for most web content.',
                color: 'text-blue-600',
                bg: 'bg-blue-50',
              },
              {
                icon: Wand2,
                title: 'Word Replacements',
                description:
                  'Finds weak, vague, or overused words ("very", "good", "things") and suggests 3 precise alternatives per word. Click any suggestion to copy it instantly.',
                color: 'text-primary',
                bg: 'bg-primary/10',
              },
              {
                icon: Eye,
                title: 'Inline Text Highlights',
                description:
                  'Grammar issues are highlighted in red, word replacements in amber — directly inside your text. Click any highlight to jump to its detailed fix in the panel.',
                color: 'text-purple-600',
                bg: 'bg-purple-50',
              },
              {
                icon: ShieldCheck,
                title: 'AI Signal Breakdown',
                description:
                  'Lists the specific patterns in your text that trigger AI detection — so you know exactly which phrases or structures to rewrite for a more human-sounding result.',
                color: 'text-teal-600',
                bg: 'bg-teal-50',
              },
              {
                icon: TrendingUp,
                title: 'Overall Quality Score',
                description:
                  'A single 0–100 score that combines grammar accuracy, readability, word quality, and writing clarity — giving you one number to aim to improve.',
                color: 'text-emerald-600',
                bg: 'bg-emerald-50',
              },
              {
                icon: FileText,
                title: 'Improvement Tips',
                description:
                  'Practical, content-specific tips — not generic advice. Each tip targets a real weakness found in your text, from passive voice to sentence variety.',
                color: 'text-indigo-600',
                bg: 'bg-indigo-50',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-md"
              >
                <div className={`mb-3 inline-flex rounded-xl p-2.5 ${f.bg}`}>
                  <f.icon className={`h-5 w-5 ${f.color}`} />
                </div>
                <h3 className="mb-2 font-heading text-base font-semibold text-foreground">
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Accurate Content Matters for SEO ── */}
      <section className="border-t border-border bg-muted/30 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">
                Why Content Quality Directly Impacts Your Rankings
              </h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Google&apos;s Helpful Content system and E-E-A-T guidelines are designed to reward content
                that reads as genuine, expert, and authoritative. Content that pattern-matches to
                AI-generated text — even if factually accurate — risks being demoted or ignored.
              </p>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Beyond AI detection, readability and word quality directly affect dwell time and
                engagement. Content at a Grade 7–8 reading level consistently outperforms overly complex
                writing because it keeps readers on the page longer, reducing bounce rate — a key indirect
                ranking signal.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Google's 2024 Helpful Content update targeted low-quality AI-generated content at scale",
                  'Readable content (Grade 6–8) has 40–60% higher average time-on-page',
                  'Precise word choices improve click-through rates on meta descriptions',
                  'Grammar errors reduce trust signals — users leave faster from error-heavy pages',
                  'Human-sounding content earns 3× more natural backlinks than generic AI text',
                  'E-E-A-T signals require personal experience and unique perspective — not templates',
                  'Fixing 5–10 grammar issues typically lifts quality score by 15–20 points',
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
                { metric: '40%',  label: 'Higher dwell time', sub: 'when readability is Grade 7–8' },
                { metric: '3×',   label: 'More backlinks',    sub: 'for human-sounding vs generic AI content' },
                { metric: '60%',  label: 'Lower bounce rate', sub: 'on content without grammar errors' },
                { metric: '15pt', label: 'Quality boost',     sub: 'from fixing top grammar issues' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col gap-1 rounded-2xl border border-border bg-card p-5"
                >
                  <span className="font-heading text-3xl font-bold text-primary">{stat.metric}</span>
                  <span className="text-sm font-semibold text-foreground">{stat.label}</span>
                  <span className="text-xs text-muted-foreground">{stat.sub}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Comparison Table ── */}
      <section className="border-t border-border px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">
              How We Compare
            </h2>
            <p className="mt-3 text-muted-foreground">
              Ai Ranko replaces four separate tools — for free.
            </p>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-5 py-4 text-left font-semibold text-foreground">Feature</th>
                  <th className="px-5 py-4 text-center font-semibold text-primary">Ai Ranko</th>
                  <th className="px-5 py-4 text-center font-semibold text-muted-foreground">Grammarly</th>
                  <th className="px-5 py-4 text-center font-semibold text-muted-foreground">Originality.ai</th>
                  <th className="px-5 py-4 text-center font-semibold text-muted-foreground">Hemingway</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['AI content detection',        '✓', '—', '✓', '—'],
                  ['Grammar & spelling check',     '✓', '✓', '—', '—'],
                  ['Readability score',            '✓', '—', '—', '✓'],
                  ['Word replacement suggestions', '✓', '✓', '—', '✓'],
                  ['Inline text highlights',       '✓', '✓', '✓', '✓'],
                  ['AI signal breakdown',          '✓', '—', '✓', '—'],
                  ['Overall quality score',        '✓', '—', '—', '—'],
                  ['No sign-up required',          '✓', '—', '—', '—'],
                  ['100% free',                    '✓', '—', '—', '—'],
                  ['No word-count limits (paid)',  '✓', '—', '—', '—'],
                ].map(([feature, ...cols]) => (
                  <tr key={feature} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-5 py-3.5 font-medium text-foreground">{feature}</td>
                    {cols.map((val, i) => (
                      <td key={i} className={`px-5 py-3.5 text-center ${i === 0 ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Use Cases ── */}
      <section className="border-t border-border bg-muted/30 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">
              Who Uses This Tool
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Users,
                title: 'Content Marketers',
                description:
                  'Check AI-drafted content before publishing. Ensure it passes Google\'s Helpful Content guidelines and reads as authentic expert writing.',
              },
              {
                icon: TrendingUp,
                title: 'SEO Professionals',
                description:
                  'Audit client content for grammar, readability, and AI signals before going live. Catch issues that harm rankings before Google does.',
              },
              {
                icon: FileText,
                title: 'Bloggers & Writers',
                description:
                  'Improve your writing quality before hitting publish. Get specific suggestions to replace weak words and simplify complex sentences.',
              },
              {
                icon: ShieldCheck,
                title: 'Educators & Students',
                description:
                  'Verify the authenticity of submitted work or improve your own writing quality with actionable, specific feedback on every submission.',
              },
            ].map((uc) => (
              <div key={uc.title} className="rounded-2xl border border-border bg-card p-5">
                <div className="mb-3 inline-flex rounded-xl bg-primary/10 p-2.5">
                  <uc.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-2 font-heading text-base font-semibold text-foreground">{uc.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{uc.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="border-t border-border px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-3">
            {[
              {
                q: 'Is this a real plagiarism checker that compares against the web?',
                a: "This tool focuses on AI content detection, grammar quality, readability, and word improvement — not web-based duplicate content checking. It cannot compare your text against a live index of web pages. For web plagiarism detection, Copyscape is the industry standard. This tool's strength is analyzing writing quality and identifying AI-generated patterns.",
              },
              {
                q: 'How accurate is the AI detection?',
                a: 'The detection uses GPT-4o to identify structural and stylistic patterns associated with AI-generated writing — including formulaic transitions, repetitive sentence structure, generic claims, and lack of personal voice. It is highly reliable for identifying typical AI output but should not be used as sole evidence. Highly skilled human editing can reduce AI signals.',
              },
              {
                q: 'What readability score should I aim for?',
                a: 'A score between 60–80 (Standard to Easy) is ideal for most web content. This corresponds to a Grade 6–8 reading level — accessible to most adults without feeling simplistic. Technical content for expert audiences can sit lower without issue.',
              },
              {
                q: 'Why does the AI score my otherwise well-written content as partly AI-generated?',
                a: "AI writing patterns have influenced how many humans write — especially those who use AI tools regularly. If your writing is very structured, uses common transitional phrases, or lacks specific personal examples, it may score higher on AI signals. The tool flags patterns, not intent. Use the AI Signals tab to see exactly what triggered the score.",
              },
              {
                q: 'Can I analyze content in languages other than English?',
                a: 'The tool works best with English content. GPT-4o supports other languages, so it can analyze them, but the grammar corrections and readability scoring are calibrated for English-language standards.',
              },
              {
                q: 'How is this different from Grammarly?',
                a: 'Grammarly focuses on grammar and style corrections. This tool also checks for AI content patterns, calculates a readability score, provides word replacement suggestions, and gives an overall quality score — in a single free analysis with no sign-up required.',
              },
              {
                q: 'Is my content stored or used for training?',
                a: 'Content is sent to the OpenAI API for analysis and is not stored by Ai Ranko. OpenAI\'s data usage policy applies to API usage. We do not use your content for any purpose other than returning your analysis.',
              },
              {
                q: 'What should I do after seeing the results?',
                a: "Start with the Grammar tab — fix all errors first. Then work through the Words tab, replacing weak words with the suggested alternatives (one-click copy). If your AI score is high, review the Signals tab and manually rewrite those sections to add personal perspective, specific examples, and varied sentence structure.",
              },
            ].map((faq) => (
              <details
                key={faq.q}
                className="group rounded-2xl border border-border bg-card"
              >
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
            Ready to Improve Your Content?
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Paste any text above and get your full AI detection, grammar, readability, and word quality report in seconds — completely free.
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
