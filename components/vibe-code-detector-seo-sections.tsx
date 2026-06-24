import Link from 'next/link'
import {
  Globe, Github, FileCode2, ShieldCheck, Cpu, Palette, ListTree, MessageSquare,
  Image as ImageIcon, FileText, ArrowRight, CheckCircle2, Code, Search,
} from 'lucide-react'

export default function VibeCodeDetectorSeoSections() {
  return (
    <>
      {/* ── How It Works ── */}
      <section className="border-t border-border bg-muted/30 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">How the Vibe Code Detector Works</h2>
            <p className="mt-3 text-muted-foreground">Three inputs, eight real audits, one honest verdict on whether your site is vibe-coded.</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              { step: '01', title: 'Provide Source',     description: 'Paste a URL, GitHub repo URL, or your raw code. URL mode fetches HTML + HTTP headers, GitHub mode pulls up to 30 prioritized source files, paste mode analyzes verbatim.', icon: FileCode2 },
              { step: '02', title: 'Real Vibe-Code Audit', description: 'We count actual patterns linked to AI tools like v0, Bolt, Lovable, Cursor, Windsurf and Replit: data-testid attributes, AI-style "// Here we…" comments, overly-descriptive variable names, generator meta tags, Tailwind utility soup and more. Every number is a real count.', icon: Search },
              { step: '03', title: 'Vibe Score Report',  description: 'Eight per-analyzer cards with score gauges, exact counts, color palettes, heading trees, sentence distribution, security tables, image audits and metadata checklists. Export the full report as JSON.', icon: FileText },
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
            <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">8 Real Vibe-Code Analyzers</h2>
            <p className="mt-3 text-muted-foreground">Each one counts something real in your source. No randomization, no hidden estimates, no LLM guessing.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Code,          title: 'Inline Code',     description: 'Counts inline scripts, style attributes, event handlers, HTML comments, AI-style comments inside scripts, and data-testid attributes (a strong vibe-code signal).', color: 'text-primary',    bg: 'bg-primary/10' },
              { icon: Palette,       title: 'CSS Quality',     description: 'Tailwind utility soup (elements with 8+ classes), !important abuse, generic CSS variable names, long class names, and fonts — the real fingerprints of v0/Lovable output.',  color: 'text-purple-600', bg: 'bg-purple-50' },
              { icon: ListTree,      title: 'HTML Structure',  description: 'Semantic tag percentage, deep div nesting (>6 levels), wrapper div ratio, empty elements, missing landmarks, broken heading hierarchy.', color: 'text-blue-600',   bg: 'bg-blue-50' },
              { icon: Cpu,           title: 'JavaScript',      description: 'Generic variable names, AI-style "// Here we…" comments, overly-descriptive identifiers (>25 chars), leftover console.logs, TODO/FIXME, magic numbers, async density.', color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { icon: MessageSquare, title: 'Copywriting',     description: 'AI buzzwords (seamless, leverage, delve, robust, harness…), filler phrases, vague CTAs, low sentence-length variance — the verbal fingerprints of ChatGPT/Claude copy.',     color: 'text-amber-600',  bg: 'bg-amber-50' },
              { icon: ShieldCheck,   title: 'Security Headers',description: 'URL-mode only. Inspects CSP, X-Frame-Options, HSTS, Referrer-Policy, Permissions-Policy and more — vibe-coded sites almost always ship with zero security headers.', color: 'text-red-600',    bg: 'bg-red-50' },
              { icon: ImageIcon,     title: 'Image Quality',   description: 'Missing alt, generic alt, dimensions, Next.js Image usage, and AI-typical filenames like "placeholder.jpg" or "hero-image.png".', color: 'text-teal-600',   bg: 'bg-teal-50' },
              { icon: FileText,      title: 'Metadata & SEO',  description: 'Title length, description, generator tag (huge red flag — explicitly detects v0, Bolt, Lovable, Cursor, Replit), Open Graph, Twitter, canonical, robots, JSON-LD.',  color: 'text-rose-600',   bg: 'bg-rose-50' },
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
            <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">Three Ways to Detect Vibe Code</h2>
            <p className="mt-3 text-muted-foreground">Pick the input that matches your audit goal.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: Globe,     title: 'Website URL', description: 'Fetched server-side with a realistic User-Agent. Follows redirects. Gets HTML + HTTP security headers — the fastest way to check if a live site is vibe-coded.', best: 'Best for: checking if a competitor or client site was built with v0, Bolt, or Lovable.' },
              { icon: Github,    title: 'GitHub Repo', description: 'Pulls up to 30 source files prioritized by location (root, src/, app/, components/). Handles any default branch automatically.', best: 'Best for: auditing your own repo or any public repo for vibe-code patterns.' },
              { icon: FileCode2, title: 'Paste Code',  description: 'Analyzes any HTML, CSS, JavaScript, JSX, or mixed source you paste — minimum 100 characters.', best: 'Best for: a quick "is this vibe-coded?" check on a snippet.' },
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
              <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">What Is &ldquo;Vibe Coding&rdquo; — And Why Detect It?</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Vibe coding is the 2025 term for shipping software written end-to-end by AI tools — v0, Bolt, Lovable, Cursor, Windsurf, Replit Agent, Devin — with little or no human refactoring. The output works, but it leaves a fingerprint: utility-class soup, deep wrapper divs, &ldquo;// Here we handle…&rdquo; comments, generic naming and missing security headers.
              </p>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Most AI detectors output one black-box probability. The Vibe Code Detector does the opposite — every number traces back to a count, a regex match or an HTTP header you can read in the report and audit yourself.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'Every score is computed from real counts — no model probabilities, no random seeds',
                  'Each analyzer card shows the raw measurements that drove its score',
                  'Re-running on the same input always returns the same Vibe Score',
                  'Full JSON export gives you the entire decision trail',
                  'Severity bands map to fixed score ranges, not guesses',
                  'Explicitly detects v0, Bolt, Lovable, Cursor, Windsurf and Replit generator tags',
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
                { metric: '8',    label: 'Real audits',      sub: 'every metric counted' },
                { metric: '30',   label: 'Files per repo',   sub: 'GitHub mode' },
                { metric: '11',   label: 'AI tools detected',sub: 'v0, Bolt, Lovable…' },
                { metric: '0',    label: 'Fake scores',      sub: 'zero estimation' },
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
              { q: 'What does "vibe code" mean?', a: 'Vibe coding is the 2025 term for software shipped largely or entirely from AI coding tools — v0, Bolt, Lovable, Cursor, Windsurf, Replit Agent, GitHub Copilot, Devin, ChatGPT or Claude — without significant human refactor. The Vibe Code Detector looks for the visual and structural fingerprints these tools leave behind.' },
              { q: 'How does the Vibe Code Detector work?', a: 'It fetches your source (HTML from a URL, files from a GitHub repo, or your pasted code) and runs 8 deterministic audits that count real patterns. Every score is calculated from real counts — no AI guessing, no randomization. The minimum analysis window is 10 seconds so the result reflects real measurement, not a coin flip.' },
              { q: 'What does the Vibe Score actually mean?', a: 'Higher = more vibe-code patterns detected. Lower = more hand-crafted. The bands: Likely human-written (0–24), Mixed signals (25–49), Likely vibe-coded (50–74), Strongly vibe-coded (75–100).' },
              { q: 'Which AI coding tools can it detect?', a: 'The metadata analyzer explicitly flags generator tags from v0 (Vercel), Bolt, Lovable, Cursor, Windsurf, Replit, Devin, GitHub Copilot, ChatGPT and Claude. The other 7 analyzers detect generic AI-coding fingerprints regardless of which tool produced them.' },
              { q: 'Do you store my data?', a: 'No. The tool fetches your URL or repo server-side and analyzes the response in memory. Nothing is logged or stored.' },
              { q: 'What GitHub repos can I analyze?', a: 'Any public repository. Private repos require auth which the tool does not currently support. The unauthenticated GitHub API has a 60-requests-per-hour limit, so heavy use may briefly rate-limit.' },
              { q: 'Why does Security Headers only run for URLs?', a: 'Security headers are HTTP response headers — they only exist when a live server responds. Pasted code and GitHub files have no associated HTTP response. Worth noting: vibe-coded sites almost always ship with zero security headers, so URL mode catches one of the strongest signals.' },
              { q: 'Can the Vibe Code Detector be fooled?', a: 'Yes. The detector measures patterns commonly associated with AI-generated code, but a skilled developer can write code matching those patterns, and AI tools can be prompted to avoid them. Treat the Vibe Score as a strong signal, not a verdict.' },
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
          <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">Is It Vibe-Coded? Find Out Now.</h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Paste a URL, a GitHub repo, or your raw code — and get a real, measurement-based Vibe Score report in under a minute.
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
