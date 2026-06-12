import Link from 'next/link'
import {
  Globe, Palette, LayoutGrid, Download, Eye, Settings2, Map, Code,
  CheckCircle2, ArrowRight, Users, TrendingUp, FileCode, Search,
} from 'lucide-react'

export default function HtmlSitemapGeneratorSeoSections() {
  return (
    <>
      {/* ── How It Works ── */}
      <section className="border-t border-border bg-muted/30 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">How It Works</h2>
            <p className="mt-3 text-muted-foreground">Paste a URL, pick a theme, export — in under a minute.</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              { step: '01', title: 'Paste Your URL',       description: 'Enter any public URL. Choose source mode (auto, sitemap.xml, or crawl), max pages (5–100), and crawl depth (1–5 levels).', icon: Globe },
              { step: '02', title: 'We Crawl & Categorize', description: 'The backend reads your sitemap.xml first, falls back to internal-link crawling, extracts page titles + meta descriptions, then auto-groups pages by URL path.',        icon: Map },
              { step: '03', title: 'Customize & Export',   description: 'Pick from 5 layouts, 4 themes, any accent color. Toggle URLs, descriptions, dates, search. Live preview updates instantly. Export as HTML, Markdown, JSON, or plain text.', icon: Download },
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

      {/* ── Key Features ── */}
      <section className="border-t border-border px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">Modern Sitemap Tooling, Free</h2>
            <p className="mt-3 text-muted-foreground">Every option a paid tool charges for — without the subscription.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Globe,      title: 'Real Crawl',         description: 'Actually fetches your pages — no fake data. Reads sitemap.xml first, falls back to internal-link crawling.',                  color: 'text-primary',    bg: 'bg-primary/10' },
              { icon: LayoutGrid, title: '5 Layouts',          description: 'Tree, Cards, List, Columns, Compact. Each one tested for different use cases — large catalogs to small footers.',                color: 'text-blue-600',   bg: 'bg-blue-50' },
              { icon: Palette,    title: '4 Themes + Accent',  description: 'Modern, Minimal, Classic, Dark. Custom accent color via picker or hex input. Output matches your brand.',                          color: 'text-purple-600', bg: 'bg-purple-50' },
              { icon: Eye,        title: 'Live Preview',       description: 'Iframe preview updates the second you change a setting. See the output exactly as visitors will see it.',                          color: 'text-emerald-600',bg: 'bg-emerald-50' },
              { icon: Settings2,  title: 'Full Display Control', description: 'Toggle URLs, descriptions, last-modified dates, search box, stats bar. Hide what you don\'t need.',                                color: 'text-amber-600',  bg: 'bg-amber-50' },
              { icon: Download,   title: '5 Export Formats',   description: 'Standalone HTML, HTML snippet, Markdown, JSON, plain text. Copy or download — pick what your workflow needs.',                      color: 'text-rose-600',   bg: 'bg-rose-50' },
              { icon: Search,     title: 'Built-in Search',    description: 'Optionally include a client-side search box in the generated HTML — visitors find pages by typing.',                                color: 'text-teal-600',   bg: 'bg-teal-50' },
              { icon: Code,       title: 'Clean Semantic Markup', description: 'Generated HTML uses proper headings, lists, and links — accessible, indexable, and ready for any framework.',                    color: 'text-indigo-600', bg: 'bg-indigo-50' },
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

      {/* ── Why HTML Sitemaps Matter ── */}
      <section className="border-t border-border bg-muted/30 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">
                Why Every Site Needs an HTML Sitemap
              </h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                XML sitemaps help search engines find your pages. HTML sitemaps help <em>humans</em> find them — and they compound your SEO via internal linking, reducing bounce rate, and surfacing deep content that footer links would miss.
              </p>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                A good HTML sitemap is also a low-cost trust signal. Visitors who can navigate confidently stay longer. Crawlers that find every page rank you more comprehensively. And linking the HTML sitemap from your footer is one of the simplest SEO wins still available in 2026.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'Improves internal linking — every page gets at least one inbound link',
                  'Surfaces deep content that Googlebot may otherwise miss',
                  'Lowers bounce rate by making navigation explicit',
                  'Helps screen-reader users find content faster',
                  'Provides a fallback when site search is down or limited',
                  'Functions as a publishing checklist for content teams',
                  'Required by some accessibility audits (WCAG 2.2)',
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
                { metric: '100',  label: 'Max pages',     sub: 'per generation' },
                { metric: '5',    label: 'Layouts',       sub: 'tested designs' },
                { metric: '4',    label: 'Themes',        sub: 'plus custom color' },
                { metric: '5',    label: 'Export formats', sub: 'HTML, MD, JSON, text' },
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

      {/* ── Use Cases ── */}
      <section className="border-t border-border px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">Who Uses This Tool</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: TrendingUp, title: 'SEO Managers',      description: 'Ship HTML sitemaps for client sites in minutes. Boost internal linking without manual page-by-page tagging.' },
              { icon: Users,      title: 'Content Teams',     description: 'See the full site structure at a glance. Spot orphan pages and gaps in your content coverage.' },
              { icon: FileCode,   title: 'Web Developers',    description: 'Drop the standalone HTML straight into a /sitemap route. Or use the JSON output to generate custom layouts in code.' },
              { icon: Code,       title: 'Agencies',          description: 'Branded HTML sitemaps as deliverables. Pick a theme that matches the client and export in their accent color.' },
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

      {/* ── FAQ ── */}
      <section className="border-t border-border bg-muted/30 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {[
              { q: 'What is an HTML sitemap?', a: 'An HTML sitemap is a human-readable web page that lists all the pages on a website, organized by category. Unlike XML sitemaps (which are for search engines), HTML sitemaps help visitors find content and improve internal linking for SEO.' },
              { q: 'How does the generator discover pages?', a: 'The tool first tries to read your sitemap.xml (via robots.txt or the standard /sitemap.xml path). If no XML sitemap is available, it falls back to crawling internal links starting from the homepage, up to the depth and page count you specify.' },
              { q: 'How many pages can it process?', a: 'Up to 100 pages per generation. Crawl depth is configurable from 1 to 5 levels.' },
              { q: 'What export formats are supported?', a: 'Five formats: standalone HTML (complete styled page), HTML snippet (markup only), Markdown (for docs), JSON (structured data), and plain text (URL list).' },
              { q: 'Can I customize the design?', a: 'Yes — pick from 4 built-in themes (Modern, Minimal, Classic, Dark), 5 layouts (Tree, Cards, List, Columns, Compact), and any accent color via the picker or hex input. Live preview updates instantly.' },
              { q: 'Does it work with single-page apps (SPAs)?', a: 'For SPAs, an XML sitemap is recommended. Pure client-rendered SPAs without sitemaps may yield limited results because the link crawler depends on server-rendered HTML.' },
              { q: 'Is the tool free?', a: 'Yes — completely free, no signup, no watermark, no rate limits.' },
              { q: 'How do I add the generated sitemap to my website?', a: 'For the standalone HTML format, upload the downloaded file as /sitemap.html on your server and link to it from your footer. For the HTML snippet, paste the markup into an existing page (e.g. inside a /sitemap or /pages route).' },
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
          <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">Ready to Build Your Sitemap?</h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Generate a beautiful HTML sitemap in under a minute. Export in any format. Free, no signup.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/tools/site-audit" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted">
              Site Audit Tool <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/tools/meta-checker" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted">
              Meta Tag Checker <ArrowRight className="h-4 w-4" />
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
