import {
  Link2,
  ShieldCheck,
  Eye,
  KeyRound,
  Lock,
  FileWarning,
  PackageSearch,
  Bug,
  Download,
  Sparkles,
  AlertTriangle,
  Wand2,
  Check,
  X,
  ChevronDown,
} from 'lucide-react'

// ─── How It Works ────────────────────────────────────────────────────────────

const steps = [
  {
    icon: Link2,
    step: '01',
    title: 'Enter Your Site URL',
    desc: 'Paste a single page URL, or switch to bulk mode and paste up to 15 URLs — your homepage, dashboard, app pages, whatever you want checked.',
  },
  {
    icon: Eye,
    step: '02',
    title: 'We Run Passive Checks Only',
    desc: 'We fetch what your site already serves publicly — the page, its response headers, linked scripts, and a handful of well-known paths. Nothing is injected, exploited, or authenticated against.',
  },
  {
    icon: ShieldCheck,
    step: '03',
    title: 'Get a Scored Report With Fixes',
    desc: 'Every issue found comes with a concrete, copy-pasteable fix — not just a warning. Export to PDF, CSV, or JSON.',
  },
]

// ─── Key Features ────────────────────────────────────────────────────────────

const features = [
  {
    icon: KeyRound,
    title: 'Exposed API Key & Secret Detection',
    desc: 'Scans page source and linked scripts for hardcoded OpenAI, Stripe, AWS, Google, and Slack keys, private key blocks, and database connection strings.',
  },
  {
    icon: Lock,
    title: 'Supabase Service-Role Key Leak Detection',
    desc: 'Decodes JWTs found in your bundle and flags any with a service_role claim — the single most common critical leak in Supabase-backed vibe-coded apps.',
  },
  {
    icon: FileWarning,
    title: 'Exposed .env, .git & Source Map Detection',
    desc: 'Checks whether your environment file, git history, or unminified source maps are accidentally being served to the public.',
  },
  {
    icon: ShieldCheck,
    title: 'HTTP Security Header Analysis',
    desc: 'Checks Content-Security-Policy, HSTS, X-Frame-Options, Referrer-Policy, and CORS configuration against best practice.',
  },
  {
    icon: PackageSearch,
    title: 'Vulnerable JS Library Detection',
    desc: 'Fingerprints common libraries (jQuery, Lodash, Moment.js, Bootstrap, AngularJS) and flags known-vulnerable versions with the relevant CVE.',
  },
  {
    icon: Bug,
    title: 'Verbose Error Disclosure Check',
    desc: 'Requests a nonexistent path and checks whether your site leaks a stack trace or debug error page instead of a clean 404.',
  },
]

// ─── Why It Matters ──────────────────────────────────────────────────────────

const whyPoints = [
  {
    icon: Wand2,
    title: 'AI Builders Don\'t Know What\'s Secret',
    desc: 'Tools like v0, Bolt, Lovable, and Replit Agent are optimized for shipping a working feature fast — not for knowing which values must never reach the browser.',
  },
  {
    icon: KeyRound,
    title: 'One Leaked Key Can Mean Full Compromise',
    desc: 'A leaked Supabase service-role key bypasses every Row Level Security policy. A leaked database connection string is direct, authenticated access to your data.',
  },
  {
    icon: AlertTriangle,
    title: 'It\'s Already Public the Moment You Deploy',
    desc: 'A secret hardcoded in client-side JavaScript isn\'t "hidden" by minification — anyone can view-source or open devtools and read it in seconds.',
  },
  {
    icon: ShieldCheck,
    title: 'Missing Headers Are an Easy, Free Fix',
    desc: 'Security headers like CSP and HSTS cost nothing to add and meaningfully raise the bar against XSS, clickjacking, and downgrade attacks.',
  },
  {
    icon: FileWarning,
    title: 'Exposed .git History Never Really "Goes Away"',
    desc: 'Deleting a secret from your latest commit doesn\'t remove it from git history — if .git is exposed, every past commit is readable too.',
  },
  {
    icon: Sparkles,
    title: 'Built for the Vibe-Coding Era',
    desc: 'Purpose-built for the specific mistakes AI-generated apps tend to make, not a generic decade-old scanner checklist.',
  },
]

// ─── Comparison ──────────────────────────────────────────────────────────────

const comparisonRows: {
  feature: string
  airanko: boolean | string
  observatory: boolean | string
  securityheaders: boolean | string
  zap: boolean | string
}[] = [
  { feature: 'Free to use', airanko: true, observatory: true, securityheaders: true, zap: true },
  { feature: 'No signup required', airanko: true, observatory: true, securityheaders: true, zap: false },
  { feature: 'HTTP security header analysis', airanko: true, observatory: true, securityheaders: true, zap: 'Partial' },
  { feature: 'Exposed API key / secret detection', airanko: true, observatory: false, securityheaders: false, zap: false },
  { feature: 'Supabase / JWT service-role key detection', airanko: true, observatory: false, securityheaders: false, zap: false },
  { feature: 'Exposed .env / .git / source map detection', airanko: true, observatory: false, securityheaders: false, zap: 'Requires config' },
  { feature: 'Vulnerable JS library detection', airanko: true, observatory: false, securityheaders: false, zap: 'Requires config' },
  { feature: 'Bulk URL scanning', airanko: true, observatory: false, securityheaders: false, zap: 'Requires setup' },
  { feature: 'Every issue paired with a fix', airanko: true, observatory: 'Partial', securityheaders: false, zap: false },
  { feature: 'CSV / JSON / PDF export', airanko: true, observatory: false, securityheaders: false, zap: 'Partial' },
  { feature: 'No install required', airanko: true, observatory: true, securityheaders: true, zap: false },
]

function ComparisonCell({ value }: { value: boolean | string }) {
  if (value === true) {
    return (
      <span className="inline-flex items-center justify-center">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
          <Check className="h-3.5 w-3.5 text-primary" />
        </span>
      </span>
    )
  }
  if (value === false) {
    return (
      <span className="inline-flex items-center justify-center">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
          <X className="h-3.5 w-3.5 text-muted-foreground" />
        </span>
      </span>
    )
  }
  return <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{value}</span>
}

export default function SecurityScannerSeoSections() {
  return (
    <div className="border-t border-border bg-background">

      {/* ── How It Works ── */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="font-heading text-2xl font-bold text-foreground text-balance sm:text-3xl">How It Works</h2>
            <p className="mt-2 text-muted-foreground text-pretty">
              Three simple steps to a passive security report for any website you own or manage.
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
              Purpose-built checks for the exact mistakes AI page builders tend to make.
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
              Why Vibe-Coded Sites Need Their Own Security Check
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-muted-foreground leading-relaxed text-pretty">
              AI page builders optimize for a working feature, not a secure one — the two most common results are secrets that leaked into the client bundle, and security headers nobody thought to add.
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
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{b.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Comparison ── */}
      <section className="border-t border-border bg-card px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="font-heading text-2xl font-bold text-foreground text-balance sm:text-3xl">How We Compare</h2>
            <p className="mt-2 text-muted-foreground text-pretty">
              General-purpose scanners check headers. This one is built specifically for what vibe-coded apps get wrong.
            </p>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-border shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background">
                  <th className="px-4 py-4 text-left font-heading font-semibold text-foreground w-[34%]">Feature</th>
                  <th className="px-4 py-4 text-center font-heading font-semibold text-primary w-[16%]">AI Ranko</th>
                  <th className="px-4 py-4 text-center font-heading font-semibold text-muted-foreground w-[16%]">Mozilla Observatory</th>
                  <th className="px-4 py-4 text-center font-heading font-semibold text-muted-foreground w-[16%]">SecurityHeaders.com</th>
                  <th className="px-4 py-4 text-center font-heading font-semibold text-muted-foreground w-[16%]">OWASP ZAP</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr key={row.feature} className={`border-b border-border last:border-0 ${i % 2 === 0 ? 'bg-card' : 'bg-background'}`}>
                    <td className="px-4 py-3.5 font-medium text-foreground">{row.feature}</td>
                    <td className="px-4 py-3.5 text-center"><ComparisonCell value={row.airanko} /></td>
                    <td className="px-4 py-3.5 text-center"><ComparisonCell value={row.observatory} /></td>
                    <td className="px-4 py-3.5 text-center"><ComparisonCell value={row.securityheaders} /></td>
                    <td className="px-4 py-3.5 text-center"><ComparisonCell value={row.zap} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── SEO Content Block ── */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-heading text-2xl font-bold text-foreground text-balance sm:text-3xl">
            A Free Security Scanner Built for AI-Built Websites
          </h2>
          <div className="mt-5 flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <p>
              &quot;Vibe coding&quot; — building an app mostly by prompting tools like v0, Bolt, Lovable, Replit Agent, or Cursor rather than writing code by hand — has made it faster than ever to ship a working product. But speed comes with a tradeoff: these tools are optimized to make a feature <em>work</em>, not to know which values must stay on the server. The result is a predictable pattern of mistakes that shows up across thousands of AI-generated apps: a Supabase service-role key pasted directly into a client component, a database connection string left in a config file that got bundled into the frontend, or security headers nobody thought to add because the AI never suggested them.
            </p>
            <p>
              This <strong className="text-foreground">website vulnerability scanner</strong> is built specifically around that pattern. Instead of a generic decade-old checklist, it looks for the exact things vibe-coded apps get wrong: hardcoded API keys and secrets in page source or linked JavaScript bundles, exposed <code className="rounded bg-muted px-1 py-0.5 text-[0.85em]">.env</code> and <code className="rounded bg-muted px-1 py-0.5 text-[0.85em]">.git</code> files, missing HTTP security headers, outdated JS libraries with known CVEs, and debug error pages that leak stack traces in production.
            </p>
            <p>
              Every check is <strong className="text-foreground">passive and read-only</strong> — it only fetches what your site already serves publicly. Nothing here attempts to exploit a vulnerability, inject a payload, brute-force a login, or bypass authentication. It&apos;s the same category of tool as Mozilla Observatory or SecurityHeaders.com, purpose-built for the vibe-coding era, and it&apos;s completely free.
            </p>
          </div>
        </div>
      </section>

    </div>
  )
}
