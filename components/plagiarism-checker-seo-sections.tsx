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
  ArrowRight,
} from 'lucide-react'

const faqs = [
{ q: "What does this tool check?", a: "It runs four checks in one analysis: AI-writing pattern detection (an AI% and Human% estimate), grammar and spelling with exact corrections, a readability score, and weak-word detection with replacement suggestions.", content: <>{"It runs four checks in one analysis: AI-writing pattern detection (an AI% and Human% estimate), grammar and spelling with exact corrections, a readability score, and weak-word detection with replacement suggestions."}</> },
{ q: "Is this a plagiarism checker that compares my text against the web?", a: "No. It does not compare your text against web pages or any database of published documents, so it cannot tell you whether text was copied. To check for copied text, use a dedicated plagiarism checker that searches published sources. This tool checks writing quality and AI-writing patterns.", content: <>{"No. It does not compare your text against web pages or any database of published documents, so it cannot tell you whether text was copied. To check for copied text, use a dedicated plagiarism checker that searches published sources. This tool checks writing quality and AI-writing patterns."}</> },
{ q: "How accurate is the AI detection?", a: "No AI detector is fully accurate. The tool looks for patterns that often appear in AI-generated writing, such as formulaic transitions, repetitive sentence structure, generic claims and a lack of personal voice. Treat the score as one signal, never as proof that someone used AI, and never as the only basis for a decision about a person.", content: <>{"No AI detector is fully accurate. The tool looks for patterns that often appear in AI-generated writing, such as formulaic transitions, repetitive sentence structure, generic claims and a lack of personal voice. Treat the score as one signal, never as proof that someone used AI, and never as the only basis for a decision about a person."}</> },
{ q: "Why does my own writing score as partly AI-generated?", a: "If your writing is very structured, uses common transitional phrases or lacks specific personal examples, it can share patterns with AI text. The tool flags patterns, not intent. Open the Signals tab to see exactly what triggered the score.", content: <>{"If your writing is very structured, uses common transitional phrases or lacks specific personal examples, it can share patterns with AI text. The tool flags patterns, not intent. Open the Signals tab to see exactly what triggered the score."}</> },
{ q: "What readability score should I aim for?", a: "The readability score is an AI estimate, not a separately calculated reading test. A score between 60–80 can be a rough starting point for general web content, but check whether the text suits your readers. Technical content for expert readers may need more specialist language. Treat the suggested grade level as an estimate too.", content: <>{"The readability score is an AI estimate, not a separately calculated reading test. A score between 60–80 can be a rough starting point for general web content, but check whether the text suits your readers. Technical content for expert readers may need more specialist language. Treat the suggested grade level as an estimate too."}</> },
{ q: "How many words can I analyse?", a: "Between 30 and 3,000 words per analysis. For longer content, analyse it in sections.", content: <>{"Between 30 and 3,000 words per analysis. For longer content, analyse it in sections."}</> },
{ q: "Can I analyse content in languages other than English?", a: "You can paste text in languages other than English, but the code does not apply language-specific readability formulas or validate language accuracy. Grammar suggestions and readability scores are AI estimates. Check non-English results with someone fluent in the language.", content: <>{"You can paste text in languages other than English, but the code does not apply language-specific readability formulas or validate language accuracy. Grammar suggestions and readability scores are AI estimates. Check non-English results with someone fluent in the language."}</> },
{ q: "Is my content stored or used for training?", a: "Your text is sent to a third-party AI service through its API to produce the analysis. This tool has no database or browser-storage writes for your text, but error logs may include part of an AI response. The tool code does not establish the provider’s retention or training practices. See our privacy policy for details.", content: <>{"Your text is sent to a third-party AI service through its API to produce the analysis. This tool has no database or browser-storage writes for your text, but error logs may include part of an AI response. The tool code does not establish the provider’s retention or training practices. See our "}<Link href="/privacy-policy" className="text-primary hover:underline">{"privacy policy"}</Link>{" for details."}</> },
{ q: "Is this tool free?", a: "Yes. There's no account, subscription or watermark: paste your text and run the analysis.", content: <>{"Yes. There's no account, subscription or watermark: paste your text and run the analysis."}</> },
{ q: "Will Google penalise content that scores as AI-written?", a: "Google says it rewards helpful, original content however it is produced, and that using automation to produce content mainly to manipulate rankings breaks its spam policies. See Google's guidance on AI-generated content. Use the score to find generic, low-value passages and improve them for your readers, not to chase a number.", content: <>{"Google says it rewards helpful, original content however it is produced, and that using automation to produce content mainly to manipulate rankings breaks its spam policies. See "}<Link href="https://developers.google.com/search/blog/2023/02/google-search-and-ai-content" target="_blank" rel="noopener" className="text-primary hover:underline">{"Google's guidance on AI-generated content"}</Link>{". Use the score to find generic, low-value passages and improve them for your readers, not to chase a number."}</> },
{ q: "What should I do after seeing the results?", a: "Start with the Grammar tab and fix the errors first. Then work through the Words tab and replace weak words. If the AI score is high, review the Signals tab and rewrite those sections with your own experience, specific examples and varied sentence structure. To tighten a page for a target keyword afterwards, try the Content Optimizer.", content: <>{"Start with the Grammar tab and fix the errors first. Then work through the Words tab and replace weak words. If the AI score is high, review the Signals tab and rewrite those sections with your own experience, specific examples and varied sentence structure. To tighten a page for a target keyword afterwards, try the "}<Link href="/tools/content-optimizer" className="text-primary hover:underline">{"Content Optimizer"}</Link>{"."}</> }
]

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
              Four checks in one analysis, with no sign-up and no fees.
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
                title: 'We Analyse Your Text',
                description:
                  'Your text is sent securely to our AI analysis, which checks AI-writing patterns, grammar, readability and word quality in one pass.',
                icon: Zap,
              },
              {
                step: '03',
                title: 'See Your Report',
                description:
                  'Your report shows score gauges, inline text highlights (click any highlight to see the fix), and suggestions you can copy with one click.',
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
              Four checks in one free analysis.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Bot,
                title: 'AI Content Detection',
                description:
                  'Identifies formulaic structure, repetitive sentence patterns, generic phrasing, and a lack of personal voice that often appear in AI-written text. Returns an AI% and Human% score.',
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
                  'Returns an AI-estimated Flesch Reading Ease-style score (0–100) and an estimated US school grade level. Review the text for your own audience.',
                color: 'text-blue-600',
                bg: 'bg-blue-50',
              },
              {
                icon: Wand2,
                title: 'Word Replacements',
                description:
                  'Finds weak, vague, or overused words ("very", "good", "things") and suggests 3 precise alternatives per word. Click any suggestion to copy it.',
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
                  'An AI-estimated 0–100 assessment of writing quality. Use it alongside the specific feedback and your own judgement.',
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

<section className="border-t border-border bg-muted/30 px-4 py-16 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl">
<h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">{"AI Content, Helpful Content and Google"}</h2>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Google's position is that it rewards helpful, original content, however it was produced, and that using automation mainly to manipulate search rankings breaks its spam policies ("}<Link href="https://developers.google.com/search/blog/2023/02/google-search-and-ai-content" target="_blank" rel="noopener" className="text-primary hover:underline">{"Google Search's guidance about AI-generated content"}</Link>{"). Its guide to "}<Link href="https://developers.google.com/search/docs/fundamentals/creating-helpful-content" target="_blank" rel="noopener" className="text-primary hover:underline">{"creating helpful, reliable, people-first content"}</Link>{" asks whether a page shows first-hand experience, adds original information and leaves the reader satisfied."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"That's how to use this tool: not to \"beat\" a detector, but to find the generic, repetitive passages a reader would skim past, fix the grammar that undermines trust, and make the text easier to read. Then add what only you can: real examples, your own data and your experience."}</p>
</div></section>
<section className="border-t border-border bg-muted/30 px-4 py-16 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl">
<h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">{"How to Read Your Results"}</h2>
<ul className="mt-6 space-y-3">
<li className="text-sm leading-relaxed text-muted-foreground"><strong>{"AI% and Human%:"}</strong>{" an estimate of how closely the text matches common AI-writing patterns. It is an AI estimate, not a calibrated probability or proof. Formal, translated or non-native writing can score higher without any AI involved."}</li>
<li className="text-sm leading-relaxed text-muted-foreground"><strong>{"AI Signals:"}</strong>{" the specific phrases and structures behind the score. Rewrite these first if you want the text to sound more like you."}</li>
<li className="text-sm leading-relaxed text-muted-foreground"><strong>{"Grammar:"}</strong>{" each error with the exact correction and a one-sentence explanation."}</li>
<li className="text-sm leading-relaxed text-muted-foreground"><strong>{"Readability:"}</strong>{" an AI-estimated Flesch Reading Ease-style score (0–100) and grade level. Check the text against your audience’s needs rather than treating the number as a measured reading test."}</li>
<li className="text-sm leading-relaxed text-muted-foreground"><strong>{"Words:"}</strong>{" weak or vague words with stronger alternatives you can copy."}</li>
<li className="text-sm leading-relaxed text-muted-foreground"><strong>{"Overall quality score:"}</strong>{" an AI-estimated 0–100 assessment of the writing. The code does not calculate a fixed weighted score from grammar, readability or word quality. Use it as feedback alongside your own review."}</li>
</ul>
<p className="mt-4 leading-relaxed text-muted-foreground">{"The report also includes a Tips tab for improvement suggestions. All scores and text statistics come from the AI response; they are not independently verified measurements."}</p>
</div></section>
<section className="border-t border-border bg-muted/30 px-4 py-16 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl">
<h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">{"Looking for a Plagiarism Checker?"}</h2>
<p className="mt-4 leading-relaxed text-muted-foreground">{"This tool doesn't compare your text against web pages or published papers, so it can't tell you whether something was copied. If you need that, use a dedicated plagiarism checker that searches published sources and shows each match. Use this tool alongside it to check the quality of the writing itself: AI-writing patterns, grammar, readability and word choice."}</p>
</div></section>
<section className="border-t border-border bg-muted/30 px-4 py-16 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl">
<h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">{"More Free Content Tools"}</h2>
<ul className="mt-6 space-y-3">
<li className="text-sm leading-relaxed text-muted-foreground"><Link href="/tools/content-optimizer" className="text-primary hover:underline">{"Content Optimizer"}</Link>{": improve a page for its target keyword."}</li>
<li className="text-sm leading-relaxed text-muted-foreground"><Link href="/tools/content-writer" className="text-primary hover:underline">{"AI Content Writer"}</Link>{": draft a first version to edit and make your own."}</li>
<li className="text-sm leading-relaxed text-muted-foreground"><Link href="/tools/meta-title-description-pixel-generator" className="text-primary hover:underline">{"Meta Title & Description Pixel Generator"}</Link>{": draft titles and descriptions and review their estimated search-result width."}</li>
</ul>
</div></section>
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
                  'Check AI-drafted content before publishing. Check it reads clearly and adds your own experience before it goes live.',
              },
              {
                icon: TrendingUp,
                title: 'SEO Professionals',
                description:
                  'Audit client content for grammar, readability, and AI signals before going live. Catch weak, generic passages before they go live.',
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
                  'Improve your own writing with specific feedback, or review a draft alongside other evidence. A detector score alone should never be used to judge someone\'s work.',
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
      <section id="faq" className="border-t border-border px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq) => (
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
                <p className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">{faq.content}</p>
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
            Paste any text above and get your full AI detection, grammar, readability, and word quality report, free and without sign-up.
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
