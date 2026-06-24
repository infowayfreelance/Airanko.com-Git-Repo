import Link from 'next/link'
import {
  Globe, Github, FileCode2, ShieldCheck, Cpu, Palette, ListTree, MessageSquare,
  Image as ImageIcon, FileText, ArrowRight, CheckCircle2, Code, Search,
} from 'lucide-react'

export default function AiCodeDetectorSeoSections() {
  return (
    <>
      {/* ── How It Works ── */}
      <section className="border-t border-border bg-muted/30 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">How It Works</h2>
            <p className="mt-3 text-muted-foreground">Three inputs, eight real audits, one detailed report.</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              { step: '01', title: 'Provide Source',     description: 'Paste a URL, GitHub repo URL, or your code directly. Each mode fetches different data — URL gets HTML + HTTP headers, GitHub gets up to 30 prioritized source files, paste analyzes verbatim.', icon: FileCode2 },
              { step: '02', title: 'Real Measurement',   description: 'We count actual patterns in the source: inline scripts, unique colors, semantic tags, generic variable names, AI buzzwords, security headers, image alt quality, generator meta tags. Every score is deterministic.',                        icon: Search },
              { step: '03', title: 'Detailed Report',    description: 'Eight per-analyzer cards with score gauges, exact counts, color palettes, heading trees, sentence distribution, security tables, image audits, and metadata checklists. Export the full report as JSON.', icon: FileText },
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

      {/* ── 8 Analyzers ── */}
      <section className="border-t border-border px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">8 Real Analyzers</h2>
            <p className="mt-3 text-muted-foreground">Each one counts something real in your source. No randomization, no hidden estimates.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Code,          title: 'Inline Code',     description: 'Counts every inline script, style attribute, event handler, and HTML comment in the raw source.', color: 'text-primary',    bg: 'bg-primary/10' },
              { icon: Palette,       title: 'CSS Quality',     description: 'Unique colors, fonts, long class names, and magic spacing values that don\'t snap to a 4/8 grid.',  color: 'text-purple-600', bg: 'bg-purple-50' },
              { icon: ListTree,      title: 'HTML Structure',  description: 'Semantic tag percentage, max div nesting depth, empty elements, missing landmarks, heading hierarchy tree.', color: 'text-blue-600',   bg: 'bg-blue-50' },
              { icon: Cpu,           title: 'JavaScript',      description: 'Generic variable names, leftover console.logs, TODO/FIXME comments, try/catch coverage, magic numbers.', color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { icon: MessageSquare, title: 'Copywriting',     description: 'AI buzzwords, filler phrases, vague CTAs, sentence length distribution + variance (low = AI signal).',     color: 'text-amber-600',  bg: 'bg-amber-50' },
              { icon: ShieldCheck,   title: 'Security Headers',description: 'URL-mode only. Inspects CSP, X-Frame-Options, HSTS, Referrer-Policy, Permissions-Policy, and more — factual data.', color: 'text-red-600',    bg: 'bg-red-50' },
              { icon: ImageIcon,     title: 'Image Quality',   description: 'Missing alt, generic alt, dimensions, Next.js Image usage, and AI-typical filenames like "placeholder.jpg".', color: 'text-teal-600',   bg: 'bg-teal-50' },
              { icon: FileText,      title: 'Metadata & SEO',  description: 'Title length, description, generator tag (red flag), Open Graph, Twitter, canonical, robots, JSON-LD count.',  color: 'text-rose-600',   bg: 'bg-rose-50' },
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

      {/* ── Three input modes ── */}
      <section className="border-t border-border bg-muted/30 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">Three Ways to Analyze</h2>
            <p className="mt-3 text-muted-foreground">Pick the input that matches your audit goal.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: Globe,     title: 'Website URL', description: 'Fetched server-side with a realistic User-Agent. Follows redirects. Gets HTML + HTTP security headers.', best: 'Best for: auditing a published site or competitor.' },
              { icon: Github,    title: 'GitHub Repo', description: 'Pulls up to 30 source files prioritized by location (root, src/, app/, components/). Handles any default branch automatically.', best: 'Best for: auditing your own codebase or any public repo.' },
              { icon: FileCode2, title: 'Paste Code',  description: 'Analyzes any HTML, CSS, JavaScript, JSX, or mixed source you paste — minimum 100 characters.', best: 'Best for: quick spot-checks on a snippet or AI-generated page.' },
            ].map((m) => (
              <div key={m.title} className="rounded-2xl border border-border bg-card p-5">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><m.icon className="h-5 w-5" /></div>
                <h3 className="mb-2 font-heading text-base font-semibold text-foreground">{m.title}</h3>
                <p className="mb-3 text-sm leading-relaxed text-muted-foreground">{m.description}</p>
                <p className="text-xs font-medium text-primary">{m.best}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why honest measurement matters ── */}
      <section className="border-t border-border px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">Why &ldquo;Real&rdquo; Beats &ldquo;Smart&rdquo;</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Most AI detectors output a single black-box probability. That makes them feel magical and unverifiable in equal measure. This tool does the opposite: every number traces back to a count, a regex match, or an HTTP header value that you can read in the report and audit yourself.
              </p>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                That deterministic approach is more useful in practice. You see <em>which</em> patterns triggered the score, can prioritize fixes, and re-run after changes to see the score move — predictably and explainably.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'Every score is computed from real counts — no model probabilities, no random seeds',
                  'Each analyzer card shows the raw measurements that drove its score',
                  'Re-running on the same input always returns the same score',
                  'Full JSON export gives you the entire decision trail',
                  'Severity bands (Clean / Moderate / Heavy / Excessive) map to fixed score ranges',
                  'Security header audit is pure factual reporting of server responses',
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
                { metric: '8',    label: 'Real audits',     sub: 'every metric counted' },
                { metric: '30',   label: 'Files per repo',  sub: 'GitHub mode' },
                { metric: '6',    label: 'Security checks', sub: 'on URL mode' },
                { metric: '0',    label: 'Fake scores',     sub: 'zero estimation' },
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

      {/* ── FAQ ── */}
      <section className="border-t border-border bg-muted/30 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {[
              { q: 'How does the AI Code Detector work?', a: 'It fetches your source (HTML from a URL, files from a GitHub repo, or your pasted code) and runs 8 deterministic audits that count real patterns. Every score is calculated from real counts — no AI guessing, no randomization.' },
              { q: 'What does the score actually mean?', a: 'Higher = more AI-typical patterns detected. Lower = more human-crafted. The bands: Likely human (0–24), Mixed signals (25–49), Likely AI-assisted (50–74), Strongly AI-generated (75–100).' },
              { q: 'Do you store my data?', a: 'No. The tool fetches your URL or repo server-side and analyzes the response in memory. Nothing is logged or stored.' },
              { q: 'What GitHub repos can I analyze?', a: 'Any public repository. Private repos require auth which the tool does not currently support. The unauthenticated GitHub API has a 60-requests-per-hour limit, so heavy use may briefly rate-limit.' },
              { q: 'Which files are pulled from a GitHub repo?', a: 'Up to 30 source files with extensions .html, .jsx, .tsx, .js, .ts, .css, .scss, .vue, .php, .py. Priority order: root, src/, app/, components/, pages/. node_modules, .next, dist, build are skipped.' },
              { q: 'Why does Security Headers only run for URLs?', a: 'Security headers are HTTP response headers — they only exist when a live server responds. Pasted code and GitHub files have no associated HTTP response.' },
              { q: 'Can the detector be fooled?', a: 'Yes. The detector measures patterns commonly associated with AI-generated code, but a skilled developer can write code that matches those patterns, and AI tools can be prompted to avoid them. Treat the score as a useful signal, not a verdict.' },
              { q: 'Is it really free?', a: 'Yes — no sign-up, no watermark, no rate limits beyond what the underlying services impose.' },
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
          <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">Ready to Audit Your Code?</h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Paste a URL, a GitHub repo, or your raw code — and get a real, measurement-based AI-likelihood report in under a minute.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/tools/site-audit" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted">
              Site Audit Tool <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/tools/plagiarism-checker" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted">
              AI Content Detector <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/tools/content-optimizer" className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
              AI Content Optimizer <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
