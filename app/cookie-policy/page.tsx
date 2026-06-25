import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Zap, Cookie, Info } from 'lucide-react'
import Navbar from '@/components/navbar'

export const metadata: Metadata = {
  title: 'Cookie Policy | Ai Ranko',
  description: 'Learn how Ai Ranko uses cookies and how to control them.',
  alternates: { canonical: 'https://airanko.com/cookie-policy' },
  openGraph: {
    title: 'Cookie Policy | Ai Ranko',
    description: 'Learn how Ai Ranko uses cookies and how to control them.',
    url: 'https://airanko.com/cookie-policy',
    siteName: 'Ai Ranko',
    type: 'website',
  },
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Ai Ranko',      item: 'https://airanko.com' },
    { '@type': 'ListItem', position: 2, name: 'Cookie Policy', item: 'https://airanko.com/cookie-policy' },
  ],
}

const sections = [
  { id: 'what-are-cookies', label: 'What Are Cookies?' },
  { id: 'categories',       label: 'Categories We Use' },
  { id: 'consent-banner',   label: 'Consent Banner' },
  { id: 'duration',         label: 'How Long Cookies Last' },
  { id: 'third-parties',    label: 'Third-Party Cookies' },
  { id: 'manage',           label: 'Manage Cookies Per Browser' },
  { id: 'updates',          label: 'Updates to This Policy' },
  { id: 'contact',          label: 'Contact' },
]

const browserSteps = [
  {
    name: 'Google Chrome',
    steps: 'Settings → Privacy and security → Third-party cookies (or "Cookies and other site data") → choose Allow, Block, or Block in Incognito.',
    href: 'https://support.google.com/chrome/answer/95647',
  },
  {
    name: 'Mozilla Firefox',
    steps: 'Settings → Privacy & Security → Cookies and Site Data → Manage Data or Clear Data; use Enhanced Tracking Protection for granular control.',
    href: 'https://support.mozilla.org/kb/enhanced-tracking-protection-firefox-desktop',
  },
  {
    name: 'Apple Safari',
    steps: 'Safari → Settings → Privacy → check "Block all cookies" or click Manage Website Data to remove individual sites.',
    href: 'https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac',
  },
  {
    name: 'Microsoft Edge',
    steps: 'Settings → Cookies and site permissions → Manage and delete cookies and site data → toggle, block, or clear by site.',
    href: 'https://support.microsoft.com/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09',
  },
]

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <Navbar />

      {/* Breadcrumb */}
      <div className="border-b border-border bg-card px-4 py-3 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/" className="flex items-center gap-1.5 transition-colors hover:text-foreground">
            <Zap className="h-3.5 w-3.5 text-primary" />
            Ai Ranko
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-foreground">Cookie Policy</span>
        </div>
      </div>

      {/* Header */}
      <header className="border-b border-border bg-gradient-to-br from-primary/5 via-accent/5 to-transparent px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            <Cookie className="h-3 w-3" />
            Legal
          </div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">Cookie Policy</h1>
          <p className="mt-3 text-pretty text-muted-foreground">
            How Ai Ranko uses cookies and similar technologies — and how you can control them.
          </p>
          <p className="mt-5 inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Effective Date: June 25, 2026 &nbsp;·&nbsp; Last Updated: June 25, 2026
          </p>
        </div>
      </header>

      <main className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">

          {/* TOC */}
          <nav aria-label="Table of contents" className="mb-12 rounded-3xl border border-border bg-card p-6 sm:p-7">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contents</h2>
            <ol className="grid gap-2 sm:grid-cols-2">
              {sections.map((s, i) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="flex items-baseline gap-2 text-sm text-primary transition-colors hover:underline">
                    <span className="font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, '0')}</span>
                    <span>{s.label}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <article className="space-y-12 text-[15px] leading-relaxed text-foreground/90">

            <Section n={1} id="what-are-cookies" title="What Are Cookies?">
              <p>
                Cookies are small text files that a website stores on your device when you visit. They let a site remember things between page loads and visits — like whether you&rsquo;re logged in, your theme preference, or which step of a tool you were on.
              </p>
              <p>
                Some cookies are essential for the site to work. Others help us understand how people use Ai Ranko so we can improve it. You stay in control of the non-essential ones.
              </p>
            </Section>

            <Section n={2} id="categories" title="Categories of Cookies We Use">
              <div className="overflow-x-auto rounded-2xl border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr>
                      <Th>Name / Type</Th>
                      <Th>Purpose</Th>
                      <Th>Duration</Th>
                      <Th>Opt out?</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <Td b>Essential</Td>
                      <Td>Session management, authentication, CSRF / security tokens. Required for the site to function.</Td>
                      <Td>Session</Td>
                      <Td>No</Td>
                    </tr>
                    <tr>
                      <Td b>Analytics</Td>
                      <Td>Vercel Analytics + similar — count page views, tool usage, and aggregate traffic sources. IP addresses are anonymised.</Td>
                      <Td>Up to 13 months</Td>
                      <Td>Yes</Td>
                    </tr>
                    <tr>
                      <Td b>Preference</Td>
                      <Td>Remember your settings (theme, last-used tool options, dismissed banners).</Td>
                      <Td>Up to 12 months</Td>
                      <Td>Yes</Td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p>We do <strong>not</strong> use advertising or cross-site tracking cookies.</p>
            </Section>

            <Section n={3} id="consent-banner" title="Cookie Consent Banner">
              <p>
                The first time you visit Ai Ranko from the EU, UK, or another region with cookie consent requirements, we show a banner asking what you&rsquo;d like to allow. Essential cookies are always on (without them the site can&rsquo;t function), but analytics and preference cookies stay off until you click <strong>Accept</strong>.
              </p>
              <p>
                You can change your choice any time by clearing your cookies for airanko.com or by clicking the &ldquo;Cookie settings&rdquo; link in our footer (if available in your region). We remember your decision for 12 months before asking again.
              </p>
            </Section>

            <Section n={4} id="duration" title="How Long Cookies Last">
              <ul className="list-disc space-y-2 pl-6">
                <li><strong>Session cookies</strong> are deleted automatically when you close your browser.</li>
                <li><strong>Persistent cookies</strong> stay on your device until they expire (anywhere from a day to 13 months) or until you delete them manually.</li>
              </ul>
              <p>The Duration column in the table above shows the maximum lifetime of each category.</p>
            </Section>

            <Section n={5} id="third-parties" title="Third-Party Cookies">
              <p>Some features rely on third-party services that may set their own cookies:</p>
              <ul className="list-disc space-y-2 pl-6">
                <li><strong>Vercel Analytics</strong> — privacy-friendly site analytics. Does not use third-party tracking cookies; uses a first-party identifier with anonymised IPs.</li>
                <li><strong>AI API providers</strong> (OpenAI, etc.) — when you use AI-powered tools, your text is sent to the provider&rsquo;s API. These providers may set their own cookies if you visit their domains; they do not set cookies through Ai Ranko itself.</li>
                <li><strong>HuggingFace</strong> — the Background Remover downloads an AI model from the HuggingFace CDN on first use. No cookies are set.</li>
              </ul>
              <p>
                Each third-party service has its own privacy and cookie policy. We encourage you to review them. Disabling analytics cookies in our banner prevents Vercel Analytics from running.
              </p>
            </Section>

            <Section n={6} id="manage" title="How to Manage Cookies in Your Browser">
              <p>You can block or delete cookies through your browser settings at any time. Quick instructions for the major browsers:</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {browserSteps.map((b) => (
                  <div key={b.name} className="rounded-2xl border border-border bg-card p-5">
                    <h3 className="mb-2 font-heading text-base font-semibold text-foreground">{b.name}</h3>
                    <p className="text-sm text-muted-foreground">{b.steps}</p>
                    <a href={b.href} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-xs font-medium text-primary hover:underline">
                      Official guide →
                    </a>
                  </div>
                ))}
              </div>
              <Callout>
                <strong>Heads up:</strong> blocking essential cookies will break sign-in and other basic features. Blocking analytics or preference cookies is safe — the site will still work normally.
              </Callout>
            </Section>

            <Section n={7} id="updates" title="Updates to This Policy">
              <p>
                We may update this Cookie Policy from time to time to reflect changes in the tools we use or in applicable law. The &ldquo;Last Updated&rdquo; date at the top of this page will always show when it was last revised. For details on how we handle personal data more broadly, see our <Link href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>.
              </p>
            </Section>

            <Section n={8} id="contact" title="Contact">
              <p>If you have any questions about this Cookie Policy, please get in touch:</p>
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="font-heading font-semibold text-foreground">Ai Ranko</p>
                <p className="mt-2">📧 Cookie / privacy queries: <a className="text-primary hover:underline" href="mailto:privacy@airanko.com">privacy@airanko.com</a></p>
                <p>🌐 Website: <a className="text-primary hover:underline" href="https://airanko.com">airanko.com</a></p>
              </div>
            </Section>

          </article>
        </div>
      </main>

      <footer className="mt-12 border-t border-border bg-card px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <Link href="/" aria-label="Ai Ranko home">
            <img src="/images/ai-ranko-logo.webp" alt="Ai Ranko" className="h-7 w-auto" />
          </Link>
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Ai Ranko. Free AI SEO &amp; image tools — no signup required.
          </p>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/privacy-policy" className="transition-colors hover:text-foreground">Privacy</Link>
            <Link href="/terms-and-conditions" className="transition-colors hover:text-foreground">Terms</Link>
            <Link href="/contact" className="transition-colors hover:text-foreground">Contact</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}

function Section({ n, id, title, children }: { n: number; id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="mb-2 font-mono text-xs font-semibold uppercase tracking-widest text-primary">
        {String(n).padStart(2, '0')}
      </div>
      <h2 className="mb-4 font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </th>
  )
}

function Td({ children, b }: { children: React.ReactNode; b?: boolean }) {
  return (
    <td className={`px-4 py-3 align-top text-sm ${b ? 'font-semibold text-foreground' : 'text-foreground/80'}`}>
      {children}
    </td>
  )
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4 text-sm leading-relaxed text-foreground/90">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <div>{children}</div>
    </div>
  )
}
