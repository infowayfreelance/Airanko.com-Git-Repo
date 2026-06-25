import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Zap, ShieldCheck, Info } from 'lucide-react'
import Navbar from '@/components/navbar'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'

export const metadata: Metadata = {
  title: 'Privacy Policy | Ai Ranko',
  description:
    "Ai Ranko's Privacy Policy — how we collect, use, and protect your data when you use our free SEO and image tools.",
  alternates: { canonical: 'https://airanko.com/privacy-policy' },
  openGraph: {
    title: 'Privacy Policy | Ai Ranko',
    description: 'How Ai Ranko collects, uses, and protects your information when you use our tools and services.',
    url: 'https://airanko.com/privacy-policy',
    siteName: 'Ai Ranko',
    type: 'website',
  },
}

const sections = [
  { id: 'who-we-are',         label: 'Who We Are' },
  { id: 'data-we-collect',    label: 'Data We Collect' },
  { id: 'how-we-use',         label: 'How We Use Data' },
  { id: 'browser-processing', label: 'Browser-Based Processing' },
  { id: 'cookies',            label: 'Cookies & Tracking' },
  { id: 'third-parties',      label: 'Third-Party Services' },
  { id: 'data-retention',     label: 'Data Retention' },
  { id: 'your-rights',        label: 'Your Rights' },
  { id: 'children',           label: "Children's Privacy" },
  { id: 'security',           label: 'Security' },
  { id: 'changes',            label: 'Policy Changes' },
  { id: 'contact',            label: 'Contact Us' },
]

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <BreadcrumbSchema items={[{ name: 'Privacy Policy', href: '/privacy-policy' }]} />

      {/* Breadcrumb */}
      <div className="border-b border-border bg-card px-4 py-3 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/" className="flex items-center gap-1.5 transition-colors hover:text-foreground">
            <Zap className="h-3.5 w-3.5 text-primary" />
            Ai Ranko
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-foreground">Privacy Policy</span>
        </div>
      </div>

      {/* Header */}
      <header className="border-b border-border bg-gradient-to-br from-primary/5 via-accent/5 to-transparent px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            <ShieldCheck className="h-3 w-3" />
            Legal
          </div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">Privacy Policy</h1>
          <p className="mt-3 text-pretty text-muted-foreground">
            How Ai Ranko collects, uses, and protects your information when you use our tools and services.
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

            <Section n={1} id="who-we-are" title="Who We Are">
              <p>
                Ai Ranko (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) operates the website <strong>airanko.com</strong> and all tools hosted on it, including SEO analysis tools, image utilities, keyword research tools, and AI-powered content tools. We are committed to protecting your privacy and being transparent about how we handle your data.
              </p>
              <p>This Privacy Policy applies to all visitors and users of airanko.com, regardless of your location.</p>
            </Section>

            <Section n={2} id="data-we-collect" title="Data We Collect">
              <p>We collect different categories of information depending on how you interact with our platform:</p>
              <div className="overflow-x-auto rounded-2xl border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr>
                      <Th>Category</Th><Th>Examples</Th><Th>Source</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr><Td b>Usage Data</Td><Td>Pages visited, tools used, time spent, clicks, errors</Td><Td>Automatically collected</Td></tr>
                    <tr><Td b>Technical Data</Td><Td>IP address (anonymised), browser type, OS, screen resolution, referrer URL</Td><Td>Automatically collected</Td></tr>
                    <tr><Td b>Account Data</Td><Td>Email address, display name, password hash (if you register)</Td><Td>Provided by you</Td></tr>
                    <tr><Td b>Tool Inputs</Td><Td>URLs you submit for SEO analysis, keywords you enter, content you paste</Td><Td>Provided by you</Td></tr>
                    <tr><Td b>Images</Td><Td>Images you upload to our image tools</Td><Td>Provided by you (browser-processed — see §4)</Td></tr>
                    <tr><Td b>Communications</Td><Td>Messages you send via contact form or email</Td><Td>Provided by you</Td></tr>
                  </tbody>
                </table>
              </div>
              <p>
                We do <strong>not</strong> collect payment card details directly — any payments are processed securely by third-party payment providers.
              </p>
            </Section>

            <Section n={3} id="how-we-use" title="How We Use Your Data">
              <p>We use the data we collect for the following purposes:</p>
              <ul className="list-disc space-y-2 pl-6">
                <li><strong>Providing our tools and services</strong> — to process your inputs and return results (SEO analysis, image conversion, keyword research, etc.)</li>
                <li><strong>Improving the platform</strong> — understanding which tools are used most, where users encounter errors, and how to improve performance</li>
                <li><strong>Account management</strong> — if you create an account, to authenticate you and manage your preferences</li>
                <li><strong>Security and fraud prevention</strong> — detecting abuse, spam, or malicious requests</li>
                <li><strong>Communications</strong> — responding to your support enquiries or contact form messages</li>
                <li><strong>Legal compliance</strong> — meeting our obligations under applicable law</li>
              </ul>
              <Callout tone="info">
                <strong>No selling of data.</strong> We do not sell, rent, or trade your personal information to third parties for their marketing purposes, ever.
              </Callout>
            </Section>

            <Section n={4} id="browser-processing" title="Browser-Based Processing">
              <Callout tone="success">
                <strong>Your files never leave your device.</strong> All image processing tools on Ai Ranko — including Image Resizer, Bulk Image Resizer, Background Remover, and AI Image Upscaler — run entirely in your browser using client-side JavaScript. Your images are processed locally and are never uploaded to our servers.
              </Callout>
              <p>
                For tools that require server interaction (such as SEO analysis tools that crawl external URLs, or AI-powered text tools), only the URL or text input you provide is transmitted to our servers or to third-party AI API providers. We do not store those inputs beyond what is necessary to return results to you.
              </p>
            </Section>

            <Section n={5} id="cookies" title="Cookies & Tracking Technologies">
              <p>We use cookies and similar technologies to make our platform work and to improve your experience. Here is what we use:</p>
              <div className="overflow-x-auto rounded-2xl border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr>
                      <Th>Type</Th><Th>Purpose</Th><Th>Can you opt out?</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr><Td b>Essential Cookies</Td><Td>Session management, authentication, security tokens. Necessary for the site to function.</Td><Td>No (required)</Td></tr>
                    <tr><Td b>Analytics Cookies</Td><Td>Understanding page views, tool usage, traffic sources. Data is aggregated and anonymised.</Td><Td>Yes</Td></tr>
                    <tr><Td b>Preference Cookies</Td><Td>Remembering your settings (e.g. dark mode, tool preferences).</Td><Td>Yes</Td></tr>
                  </tbody>
                </table>
              </div>
              <p>
                You can manage cookie preferences through your browser settings. Disabling analytics cookies will not affect your ability to use our tools. Where required by law (e.g. for users in the EU/UK), we will ask for your consent before placing non-essential cookies.
              </p>
            </Section>

            <Section n={6} id="third-parties" title="Third-Party Services">
              <p>We integrate with the following categories of third-party services. Each has its own privacy policy which we encourage you to review:</p>
              <ul className="list-disc space-y-2 pl-6">
                <li><strong>AI API Providers</strong> — For AI-powered tools (content writing, SEO strategy, etc.), we may send your text input to third-party large language model providers. These providers are contractually required to protect your data and not use it for model training without consent.</li>
                <li><strong>Web Analytics</strong> — We use analytics services to understand how the platform is used. IP addresses are anonymised before storage.</li>
                <li><strong>Hosting Infrastructure</strong> — Our platform is hosted on cloud infrastructure providers. Data may be stored in data centres in the USA or EU, with appropriate safeguards in place.</li>
                <li><strong>Payment Processing</strong> — If you upgrade to a paid plan, payments are handled by an industry-standard payment processor. We never see or store your card details.</li>
              </ul>
              <p>We do not allow any third-party service we use to use your data for their own advertising purposes.</p>
            </Section>

            <Section n={7} id="data-retention" title="Data Retention">
              <p>We retain your data only for as long as necessary:</p>
              <ul className="list-disc space-y-2 pl-6">
                <li><strong>Tool inputs & results</strong> — Not stored beyond the duration of your session, unless you are logged in and explicitly save results.</li>
                <li><strong>Account data</strong> — Retained for as long as your account is active. You may delete your account at any time.</li>
                <li><strong>Analytics data</strong> — Aggregated usage data is retained for up to 26 months for trend analysis.</li>
                <li><strong>Support communications</strong> — Retained for up to 3 years in case of follow-up enquiries.</li>
                <li><strong>Legal & compliance records</strong> — Retained as required by applicable law.</li>
              </ul>
            </Section>

            <Section n={8} id="your-rights" title="Your Rights">
              <p>Depending on where you are located, you may have the following rights regarding your personal data:</p>
              <ul className="list-disc space-y-2 pl-6">
                <li><strong>Access</strong> — Request a copy of the data we hold about you.</li>
                <li><strong>Correction</strong> — Ask us to correct inaccurate or incomplete data.</li>
                <li><strong>Deletion</strong> — Request that we delete your personal data (&ldquo;right to be forgotten&rdquo;).</li>
                <li><strong>Restriction</strong> — Ask us to limit how we process your data in certain circumstances.</li>
                <li><strong>Portability</strong> — Receive a copy of your data in a machine-readable format.</li>
                <li><strong>Objection</strong> — Object to certain types of processing, including for marketing.</li>
                <li><strong>Withdraw Consent</strong> — Where processing is based on your consent, withdraw it at any time without affecting prior processing.</li>
              </ul>
              <p>
                These rights apply to users in the EU (under GDPR), UK (under UK GDPR), California (under CCPA/CPRA), and similar jurisdictions. Users in other regions may also have rights under their local laws, and we will honour reasonable requests regardless of location.
              </p>
              <p>To exercise any of these rights, please contact us using the details in Section 12. We will respond within 30 days.</p>
            </Section>

            <Section n={9} id="children" title="Children's Privacy">
              <p>
                Ai Ranko is not directed at children under the age of 13 (or 16 in the EU). We do not knowingly collect personal data from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately and we will delete that data.
              </p>
            </Section>

            <Section n={10} id="security" title="Security">
              <p>We take the security of your data seriously and implement appropriate technical and organisational measures, including:</p>
              <ul className="list-disc space-y-2 pl-6">
                <li>HTTPS encryption for all data in transit</li>
                <li>Hashed and salted passwords (we never store passwords in plain text)</li>
                <li>Regular security reviews of our infrastructure</li>
                <li>Access controls limiting who within our team can access personal data</li>
              </ul>
              <p>However, no system is completely secure. If you discover a security vulnerability, please report it responsibly to us at the contact address below.</p>
            </Section>

            <Section n={11} id="changes" title="Changes to This Policy">
              <p>
                We may update this Privacy Policy from time to time. When we make material changes, we will update the &ldquo;Last Updated&rdquo; date at the top of this page and, where appropriate, notify registered users by email or via a notice on the platform. Your continued use of Ai Ranko after any changes constitutes your acceptance of the updated policy.
              </p>
              <p>We encourage you to review this policy periodically.</p>
            </Section>

            <Section n={12} id="contact" title="Contact Us">
              <p>If you have any questions about this Privacy Policy, wish to exercise your rights, or want to report a concern, please reach out:</p>
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="font-heading font-semibold text-foreground">Ai Ranko</p>
                <p className="mt-2">📧 Email: <a className="text-primary hover:underline" href="mailto:privacy@airanko.com">privacy@airanko.com</a></p>
                <p>🌐 Website: <a className="text-primary hover:underline" href="https://airanko.com">airanko.com</a></p>
                <p className="mt-2">We aim to respond to all privacy-related enquiries within <strong>7 business days</strong>.</p>
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
            <Link href="/" className="transition-colors hover:text-foreground">Home</Link>
            <Link href="/terms-and-conditions" className="transition-colors hover:text-foreground">Terms</Link>
            <Link href="/sitemap" className="transition-colors hover:text-foreground">Sitemap</Link>
            <Link href="mailto:privacy@airanko.com" className="transition-colors hover:text-foreground">Contact</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}

// ── helpers ──────────────────────────────────────────────────────────────────
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

function Callout({ tone, children }: { tone: 'info' | 'success' | 'warn'; children: React.ReactNode }) {
  const styles = {
    info:    'border-primary/30 bg-primary/5 text-foreground/90',
    success: 'border-emerald-500/30 bg-emerald-500/5 text-foreground/90',
    warn:    'border-amber-500/30 bg-amber-500/5 text-foreground/90',
  }[tone]
  return (
    <div className={`flex items-start gap-3 rounded-2xl border p-4 text-sm leading-relaxed ${styles}`}>
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <div>{children}</div>
    </div>
  )
}
