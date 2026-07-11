import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Zap, Scale, Info, AlertTriangle } from 'lucide-react'
import Navbar from '@/components/navbar'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'

export const metadata: Metadata = {
  title: 'Terms and Conditions | Ai Ranko',
  description:
    "Ai Ranko's Terms and Conditions — the rules, rights, and responsibilities that apply when you use our free SEO and image tools.",
  alternates: { canonical: 'https://airanko.com/terms-and-conditions' },
  openGraph: {
    title: 'Terms and Conditions | Ai Ranko',
    description: 'The rules and responsibilities that govern your use of Ai Ranko and all tools hosted on our platform.',
    url: 'https://airanko.com/terms-and-conditions',
    siteName: 'Ai Ranko',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20and%20converter%20tool%20open%20graph-airanko-fRSh9KtchB104ghNi32hTIxcT2OE87.webp',
        width: 1200,
        height: 630,
        alt: 'Terms and Conditions | Ai Ranko',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms and Conditions | Ai Ranko',
    description: 'The rules and responsibilities that govern your use of Ai Ranko and all tools hosted on our platform.',
    images: [
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20and%20converter%20tool%20open%20graph-airanko-fRSh9KtchB104ghNi32hTIxcT2OE87.webp',
    ],
  },
}

const sections = [
  { id: 'acceptance',      label: 'Acceptance of Terms' },
  { id: 'services',        label: 'Our Services' },
  { id: 'accounts',        label: 'User Accounts' },
  { id: 'acceptable-use',  label: 'Acceptable Use' },
  { id: 'ip',              label: 'Intellectual Property' },
  { id: 'your-content',    label: 'Your Content' },
  { id: 'ai-tools',        label: 'AI-Powered Tools' },
  { id: 'disclaimers',     label: 'Disclaimers' },
  { id: 'liability',       label: 'Limitation of Liability' },
  { id: 'indemnification', label: 'Indemnification' },
  { id: 'third-party',     label: 'Third-Party Links & Services' },
  { id: 'termination',     label: 'Termination' },
  { id: 'governing-law',   label: 'Governing Law' },
  { id: 'changes',         label: 'Changes to Terms' },
  { id: 'contact',         label: 'Contact' },
]

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <BreadcrumbSchema items={[{ name: 'Terms and Conditions', href: '/terms-and-conditions' }]} />

      {/* Breadcrumb */}
      <div className="border-b border-border bg-card px-4 py-3 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/" className="flex items-center gap-1.5 transition-colors hover:text-foreground">
            <Zap className="h-3.5 w-3.5 text-primary" />
            Ai Ranko
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-foreground">Terms and Conditions</span>
        </div>
      </div>

      {/* Header */}
      <header className="border-b border-border bg-gradient-to-br from-primary/5 via-accent/5 to-transparent px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            <Scale className="h-3 w-3" />
            Legal
          </div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">Terms and Conditions</h1>
          <p className="mt-3 text-pretty text-muted-foreground">
            The rules and responsibilities that govern your use of Ai Ranko and all tools hosted on our platform.
          </p>
          <p className="mt-5 inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Effective Date: June 25, 2026 &nbsp;·&nbsp; Last Updated: June 25, 2026
          </p>
        </div>
      </header>

      <main className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">

          <Callout tone="warn">
            <strong>Please read these Terms carefully before using Ai Ranko.</strong> By accessing or using our website or tools, you agree to be bound by these Terms. If you do not agree, please do not use our services.
          </Callout>

          {/* TOC */}
          <nav aria-label="Table of contents" className="mb-12 mt-8 rounded-3xl border border-border bg-card p-6 sm:p-7">
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

            <Section n={1} id="acceptance" title="Acceptance of Terms">
              <p>
                These Terms and Conditions (&ldquo;Terms&rdquo;) constitute a legally binding agreement between you (&ldquo;User,&rdquo; &ldquo;you,&rdquo; or &ldquo;your&rdquo;) and Ai Ranko (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), governing your access to and use of the website <strong>airanko.com</strong> and all tools, features, and services available through it (collectively, the &ldquo;Service&rdquo;).
              </p>
              <p>
                By accessing our website, creating an account, or using any of our tools, you confirm that you are at least 13 years of age (or 16 in the EU), that you have the legal capacity to enter into this agreement, and that you agree to be bound by these Terms and our <Link href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>.
              </p>
            </Section>

            <Section n={2} id="services" title="Our Services">
              <p>Ai Ranko provides a suite of free and premium web-based tools, including but not limited to:</p>
              <ul className="list-disc space-y-2 pl-6">
                <li>Image processing tools (resizer, converter, background remover, upscaler)</li>
                <li>SEO analysis and auditing tools (meta checker, site audit, link extractor, mobile checker)</li>
                <li>Keyword research and clustering tools</li>
                <li>AI-powered content writing, optimisation, and detection tools</li>
                <li>Sitemap generators (HTML and XML)</li>
                <li>Vibe code detection tools</li>
              </ul>
              <p>
                We reserve the right to modify, suspend, add, or discontinue any part of the Service at any time without prior notice. We will endeavour to provide reasonable notice for significant changes where practicable.
              </p>
              <Callout tone="info">
                <strong>Free tools:</strong> Many tools on Ai Ranko are available without registration. However, some features may require an account or a paid subscription. We will clearly indicate when a tool or feature requires payment.
              </Callout>
            </Section>

            <Section n={3} id="accounts" title="User Accounts">
              <p>If you create an account with Ai Ranko, you are responsible for:</p>
              <ul className="list-disc space-y-2 pl-6">
                <li>Providing accurate and complete registration information</li>
                <li>Maintaining the security and confidentiality of your login credentials</li>
                <li>All activity that occurs under your account</li>
                <li>Notifying us immediately at <a className="text-primary hover:underline" href="mailto:support@airanko.com">support@airanko.com</a> if you suspect unauthorised access to your account</li>
              </ul>
              <p>You may not share your account credentials with others, create accounts for others without their knowledge, or create multiple accounts to circumvent usage limits or restrictions.</p>
              <p>We reserve the right to suspend or terminate accounts that we believe are being used fraudulently, abusively, or in violation of these Terms.</p>
            </Section>

            <Section n={4} id="acceptable-use" title="Acceptable Use">
              <p>You agree to use Ai Ranko only for lawful purposes and in a manner that does not infringe the rights of others. You must not use our Service to:</p>
              <h3 className="mt-6 font-heading text-base font-semibold text-foreground">Prohibited Activities</h3>
              <ul className="list-disc space-y-2 pl-6">
                <li>Violate any applicable local, national, or international law or regulation</li>
                <li>Upload, transmit, or process content that is illegal, defamatory, obscene, hateful, or infringes third-party intellectual property rights</li>
                <li>Attempt to gain unauthorised access to any part of our Service, servers, databases, or systems</li>
                <li>Reverse-engineer, decompile, scrape, or extract data from our platform in an automated or abusive manner without written permission</li>
                <li>Use our tools to generate spam, phishing content, malware, or any content designed to deceive or harm</li>
                <li>Introduce viruses, trojans, worms, or other malicious code into our systems</li>
                <li>Resell or commercially redistribute our tools or their output without prior written consent from Ai Ranko</li>
                <li>Overload, disrupt, or impair the availability or functionality of the Service through denial-of-service attacks or excessive automated requests</li>
                <li>Use AI-powered tools to generate content that is deliberately misleading, defamatory, or designed to facilitate illegal activity</li>
              </ul>
              <Callout tone="danger">
                <strong>Violations may result in immediate account termination</strong> and, where appropriate, reporting to relevant authorities. We reserve the right to investigate any suspected violations.
              </Callout>
            </Section>

            <Section n={5} id="ip" title="Intellectual Property">
              <p>
                All content, design, code, branding, logos, graphics, text, and other materials that make up the Ai Ranko platform are the exclusive property of Ai Ranko or our licensors and are protected by copyright, trademark, and other intellectual property laws.
              </p>
              <p>You are granted a limited, non-exclusive, non-transferable, revocable licence to access and use the Service for its intended purposes. This licence does not include the right to:</p>
              <ul className="list-disc space-y-2 pl-6">
                <li>Copy, reproduce, or distribute our platform code or design</li>
                <li>Create derivative works based on our platform</li>
                <li>Remove or alter any copyright, trademark, or proprietary notices</li>
                <li>Use our brand name, logo, or trademarks without written permission</li>
              </ul>
              <p>Any feedback, suggestions, or ideas you submit to us about improving the Service may be used by us without obligation to compensate you.</p>
            </Section>

            <Section n={6} id="your-content" title="Your Content">
              <p>
                You retain full ownership of any content, images, URLs, text, or data you submit through our tools (&ldquo;Your Content&rdquo;). By using our Service, you grant Ai Ranko a limited, non-exclusive licence to process Your Content solely for the purpose of providing the requested tool output to you.
              </p>
              <p>
                We do <strong>not</strong> claim ownership of Your Content, use it for purposes beyond delivering the Service, or share it with third parties except as described in our Privacy Policy.
              </p>
              <p>You represent and warrant that:</p>
              <ul className="list-disc space-y-2 pl-6">
                <li>You own or have the necessary rights and permissions to submit Your Content</li>
                <li>Your Content does not violate any applicable law or these Terms</li>
                <li>Your Content does not infringe the intellectual property rights, privacy rights, or other rights of any third party</li>
              </ul>
            </Section>

            <Section n={7} id="ai-tools" title="AI-Powered Tools — Important Notice">
              <Callout tone="info">
                <strong>AI outputs are not professional advice.</strong> The AI-powered tools on Ai Ranko — including SEO strategy maker, content writer, content optimiser, keyword research, and AI content detector — are designed as assistance tools and their outputs should not be treated as expert professional advice.
              </Callout>
              <p>You acknowledge and agree that:</p>
              <ul className="list-disc space-y-2 pl-6">
                <li>AI-generated content may contain inaccuracies, errors, or outdated information</li>
                <li>SEO recommendations are suggestions based on general best practices and may not reflect the most current algorithm changes</li>
                <li>AI detection results are probabilistic in nature and should not be used as the sole basis for consequential decisions</li>
                <li>You are solely responsible for reviewing, verifying, and deciding whether to publish or act on any AI-generated output</li>
                <li>Ai Ranko is not liable for any outcomes arising from your use of AI-generated content</li>
              </ul>
              <p>Search engine rankings, traffic results, and SEO outcomes depend on many factors outside our control. We make no guarantees regarding specific SEO results.</p>
            </Section>

            <Section n={8} id="disclaimers" title="Disclaimers">
              <p>
                The Service is provided on an <strong>&ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis</strong>, without warranties of any kind, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, accuracy, or non-infringement.
              </p>
              <p>We do not warrant that:</p>
              <ul className="list-disc space-y-2 pl-6">
                <li>The Service will be uninterrupted, error-free, or secure at all times</li>
                <li>Any errors or defects in the Service will be corrected</li>
                <li>The results obtained from using our tools will be accurate, complete, or reliable</li>
                <li>The Service will meet your specific requirements or expectations</li>
              </ul>
              <p>We are not responsible for the content of any external websites or services that our tools analyse, link to, or reference.</p>
            </Section>

            <Section n={9} id="liability" title="Limitation of Liability">
              <p>To the fullest extent permitted by applicable law, Ai Ranko and its officers, directors, employees, contractors, and agents shall not be liable for any:</p>
              <ul className="list-disc space-y-2 pl-6">
                <li>Indirect, incidental, special, consequential, or punitive damages</li>
                <li>Loss of profits, revenue, data, goodwill, or business opportunities</li>
                <li>Damages arising from your reliance on AI-generated content or SEO recommendations</li>
                <li>Damages resulting from unauthorised access to your account or data</li>
                <li>Damages arising from interruptions or unavailability of the Service</li>
              </ul>
              <p>
                In no event shall our total liability to you for all claims arising from or relating to the Service exceed the greater of (a) the amount you paid to us in the 12 months preceding the claim, or (b) £50 GBP / $50 USD.
              </p>
              <p>Some jurisdictions do not allow the exclusion or limitation of certain damages, so the above may not apply to you in full.</p>
            </Section>

            <Section n={10} id="indemnification" title="Indemnification">
              <p>You agree to indemnify, defend, and hold harmless Ai Ranko and its officers, directors, employees, and agents from and against any claims, damages, liabilities, costs, and expenses (including reasonable legal fees) arising out of or relating to:</p>
              <ul className="list-disc space-y-2 pl-6">
                <li>Your use of the Service in violation of these Terms</li>
                <li>Your Content and any claim that it infringes a third party&rsquo;s rights</li>
                <li>Your violation of any applicable law or regulation</li>
                <li>Any misrepresentation you make in connection with the Service</li>
              </ul>
            </Section>

            <Section n={11} id="third-party" title="Third-Party Links & Services">
              <p>
                Our Service may contain links to third-party websites, or our tools may interact with third-party services (such as AI APIs, analytics providers, or payment processors). These are provided for your convenience only.
              </p>
              <p>
                We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services. We encourage you to review the terms and privacy policies of any third-party services you use through or alongside our platform.
              </p>
            </Section>

            <Section n={12} id="termination" title="Termination">
              <p>
                We may suspend or terminate your access to the Service, with or without notice, for any reason, including if we reasonably believe you have violated these Terms, engaged in fraudulent or abusive behaviour, or if required to do so by law.
              </p>
              <p>You may stop using the Service at any time. If you have an account, you may request deletion by contacting us at <a className="text-primary hover:underline" href="mailto:support@airanko.com">support@airanko.com</a>.</p>
              <p>Upon termination, your right to use the Service ceases immediately. Sections of these Terms that by their nature should survive termination (including Sections 5, 8, 9, 10, and 13) shall do so.</p>
            </Section>

            <Section n={13} id="governing-law" title="Governing Law & Disputes">
              <p>These Terms shall be governed by and construed in accordance with applicable law. Where you are a consumer, you will benefit from the mandatory protection of the laws of the country in which you are resident.</p>
              <p>We encourage you to contact us directly to resolve any dispute before taking formal action. Most issues can be resolved quickly and informally by emailing us at <a className="text-primary hover:underline" href="mailto:support@airanko.com">support@airanko.com</a>.</p>
              <p>If a dispute cannot be resolved informally, you agree to first attempt mediation in good faith before initiating any legal proceedings.</p>
            </Section>

            <Section n={14} id="changes" title="Changes to These Terms">
              <p>
                We may update these Terms from time to time to reflect changes in our services, legal requirements, or business practices. When we make material changes, we will update the &ldquo;Last Updated&rdquo; date at the top of this page.
              </p>
              <p>If you have an account, we will notify you of significant changes via email or a prominent notice on the platform. Your continued use of the Service after changes are published constitutes your acceptance of the updated Terms.</p>
              <p>If you do not agree to the revised Terms, you must stop using the Service.</p>
            </Section>

            <Section n={15} id="contact" title="Contact">
              <p>If you have any questions, concerns, or requests relating to these Terms, please contact us:</p>
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="font-heading font-semibold text-foreground">Ai Ranko</p>
                <p className="mt-2">📧 General: <a className="text-primary hover:underline" href="mailto:support@airanko.com">support@airanko.com</a></p>
                <p>📧 Legal / Privacy: <a className="text-primary hover:underline" href="mailto:privacy@airanko.com">privacy@airanko.com</a></p>
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
            <Link href="/" className="transition-colors hover:text-foreground">Home</Link>
            <Link href="/privacy-policy" className="transition-colors hover:text-foreground">Privacy</Link>
            <Link href="/sitemap" className="transition-colors hover:text-foreground">Sitemap</Link>
            <Link href="mailto:support@airanko.com" className="transition-colors hover:text-foreground">Contact</Link>
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

function Callout({ tone, children }: { tone: 'info' | 'warn' | 'danger'; children: React.ReactNode }) {
  const styles = {
    info:   'border-primary/30 bg-primary/5',
    warn:   'border-amber-500/30 bg-amber-500/5',
    danger: 'border-red-500/30 bg-red-500/5',
  }[tone]
  const Icon = tone === 'danger' ? AlertTriangle : Info
  return (
    <div className={`flex items-start gap-3 rounded-2xl border p-4 text-sm leading-relaxed text-foreground/90 ${styles}`}>
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${tone === 'danger' ? 'text-red-500' : tone === 'warn' ? 'text-amber-600' : 'text-primary'}`} />
      <div>{children}</div>
    </div>
  )
}
