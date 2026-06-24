import Link from 'next/link'
import { ChevronRight, FileCode2, Search, Globe, CheckCircle2, Clock, ImageIcon, Layers, Filter, Download, ArrowRight, HelpCircle } from 'lucide-react'

const faqs = [
  {
    q: 'What is an XML sitemap?',
    a: 'An XML sitemap is a file that lists all the URLs on your website so search engines like Google and Bing can discover and crawl them more efficiently. It tells crawlers which pages exist, when they were last updated, and how often they change.',
  },
  {
    q: 'Does Google still use XML sitemaps?',
    a: 'Yes. While Google can discover pages by following links, submitting a sitemap via Google Search Console is the most reliable way to ensure all your pages are indexed — especially new pages, deep pages, or pages with few internal links.',
  },
  {
    q: 'How does this tool generate the sitemap?',
    a: 'The generator first checks if your site already has a sitemap.xml. If found, it uses those URLs directly. If not, it crawls your site up to your chosen depth and max page limit, extracting all internal links automatically.',
  },
  {
    q: 'What is changefreq and priority?',
    a: 'changefreq hints to search engines how often a page changes (daily, weekly, monthly, etc.). priority is a 0.0–1.0 score that signals the relative importance of pages on your site. Note: Google does not guarantee it follows these hints exactly.',
  },
  {
    q: 'Should I include image:image tags?',
    a: 'Yes, if your site relies heavily on images (portfolios, e-commerce product photos, photography). Google Image Search can index images faster when they are listed in sitemap image extensions. For content-heavy sites without key images, it is optional.',
  },
  {
    q: 'How many URLs should a sitemap have?',
    a: 'A single sitemap file supports up to 50,000 URLs and must be under 50 MB. For larger sites, use multiple sitemaps and a sitemap index file — our tool automatically merges existing sitemap indexes.',
  },
  {
    q: 'Where do I submit the sitemap?',
    a: 'Upload sitemap.xml to your site root (https://yourdomain.com/sitemap.xml), add "Sitemap: https://yourdomain.com/sitemap.xml" to your robots.txt, and submit the URL in Google Search Console under Sitemaps → Add a new sitemap.',
  },
  {
    q: 'How often should I regenerate the sitemap?',
    a: 'Regenerate and resubmit your sitemap whenever you publish new pages, remove old pages, or significantly restructure your site. For frequently updated blogs, regenerating weekly or monthly is a good practice.',
  },
]

export default function XmlSitemapGeneratorSeoSections() {
  return (
    <div className="space-y-16 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-16">

        {/* How It Works */}
        <section>
          <div className="mb-8 text-center">
            <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
              How the XML Sitemap Generator Works
            </h2>
            <p className="mt-3 text-muted-foreground">
              Real crawl. Real data. Valid sitemap schema — no placeholders.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: Globe,
                step: '1',
                title: 'Discover URLs',
                desc: 'Reads your existing sitemap.xml first. If not found, crawls your site from the homepage following internal links up to your selected depth.',
              },
              {
                icon: FileCode2,
                step: '2',
                title: 'Build XML',
                desc: 'Assembles a W3C-valid XML sitemap with your chosen changefreq, priority, lastmod dates, and optional image:image extensions.',
              },
              {
                icon: Download,
                step: '3',
                title: 'Download & Submit',
                desc: 'Copy the XML or download sitemap.xml. Upload to your site root and submit in Google Search Console for fast indexing.',
              },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.step} className="relative rounded-2xl border border-border bg-card p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="font-heading text-2xl font-bold text-primary/20">0{item.step}</span>
                  </div>
                  <h3 className="font-heading text-base font-bold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* Features */}
        <section>
          <div className="mb-8 text-center">
            <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
              Full Feature Set
            </h2>
            <p className="mt-3 text-muted-foreground">
              Every option Google expects in a production sitemap.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: FileCode2, title: 'Valid XML Schema', desc: 'Generates sitemaps that validate against http://www.sitemaps.org/schemas/sitemap/0.9 — required for Google Search Console.' },
              { icon: Search, title: 'Sitemap.xml Reader', desc: 'Automatically reads your existing sitemap.xml or sitemap index files first, so large sites are handled in seconds.' },
              { icon: Globe, title: 'Live Web Crawler', desc: 'If no sitemap exists, crawls your site up to 4 levels deep and collects up to 500 real page URLs.' },
              { icon: Clock, title: 'changefreq & lastmod', desc: 'Set default change frequency and enable lastmod dates — today\'s date for crawled pages or from your existing sitemap.' },
              { icon: ImageIcon, title: 'Image Extensions', desc: 'Optionally add image:image tags for every on-page image — improves indexing in Google Image Search.' },
              { icon: Filter, title: 'Exclude Patterns', desc: 'Skip URLs matching keywords like /admin, /cart, /private to keep your sitemap focused on public pages.' },
              { icon: Layers, title: 'Sitemap Index Support', desc: 'Detects and merges sitemap index files automatically, combining multiple child sitemaps into one unified output.' },
              { icon: CheckCircle2, title: 'Crawl Depth Control', desc: 'Choose 1–4 levels of link depth. Level 1 maps only the homepage links; level 4 reaches deep page hierarchies.' },
              { icon: Download, title: '2 Export Formats', desc: 'Download as a standalone .xml file or copy the raw XML to clipboard — ready to upload to any hosting environment.' },
            ].map((f) => {
              const Icon = f.icon
              return (
                <div key={f.title} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-heading text-sm font-bold text-foreground">{f.title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{f.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* SEO Tips */}
        <section className="rounded-3xl border border-border bg-muted/30 p-6 sm:p-8">
          <h2 className="font-heading text-xl font-bold text-foreground mb-6">
            Sitemap Best Practices for 2025
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { tip: 'Submit in Search Console', detail: 'Always submit your sitemap URL in Google Search Console and Bing Webmaster Tools — do not rely solely on the robots.txt Sitemap directive.' },
              { tip: 'Keep it under 50,000 URLs', detail: 'Google\'s limit per sitemap file is 50,000 URLs and 50 MB uncompressed. For larger sites, create a sitemap index pointing to multiple child sitemaps.' },
              { tip: 'Use canonical URLs only', detail: 'Only include the canonical version of each page — no session IDs, UTM parameters, or pagination variants. This prevents index dilution.' },
              { tip: 'Update after publishing', detail: 'Regenerate and resubmit your sitemap every time you publish new content, delete pages, or significantly restructure your navigation.' },
              { tip: 'Omit noindex pages', detail: 'Pages marked noindex should not appear in your sitemap. Including them sends mixed signals to search engines and wastes crawl budget.' },
              { tip: 'Use consistent protocol', detail: 'Stick to https:// across all sitemap URLs. Mixing http and https creates duplicate indexing issues and confuses crawlers.' },
            ].map((item) => (
              <div key={item.tip} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.tip}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section>
          <div className="mb-8 text-center">
            <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {faqs.map((faq) => (
              <div key={faq.q} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-start gap-2.5 mb-2">
                  <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <h3 className="font-heading text-sm font-bold text-foreground">{faq.q}</h3>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground pl-6.5">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Related Tools CTA */}
        <section className="rounded-3xl bg-gradient-to-br from-primary/5 via-primary/3 to-transparent border border-primary/15 p-6 sm:p-8">
          <h2 className="font-heading text-xl font-bold text-foreground mb-2">
            Complete your SEO toolkit
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Pair your sitemap with these tools for a full technical SEO foundation.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: 'HTML Sitemap Generator', href: '/tools/html-sitemap-generator', desc: 'Human-readable sitemap with 5 layouts' },
              { label: 'Site Audit Tool', href: '/tools/site-audit', desc: '25+ checks with AI fix instructions' },
              { label: 'Link Extractor', href: '/tools/link-extractor', desc: 'Extract every link from any website' },
            ].map((tool) => (
              <Link
                key={tool.label}
                href={tool.href}
                className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-sm"
              >
                <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-foreground">{tool.label}</p>
                  <p className="text-xs text-muted-foreground">{tool.desc}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link
              href="/#tools"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Browse All Free Tools
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

      </div>
    </div>
  )
}
