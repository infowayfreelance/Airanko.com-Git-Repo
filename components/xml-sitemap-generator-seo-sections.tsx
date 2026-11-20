import Link from 'next/link'
import { ChevronRight, FileCode2, Search, Globe, CheckCircle2, Clock, ImageIcon, Layers, Filter, Download, ArrowRight, HelpCircle } from 'lucide-react'

export const xmlSitemapFaqs = [
  {
    q: 'What is an XML sitemap?',
    a: 'An XML sitemap is a file that lists all the URLs on your website so search engines like Google and Bing can discover and crawl them more efficiently. It tells crawlers which pages exist, when they were last updated, and how often they change.',
  },
  {
    q: 'Does Google still use XML sitemaps?',
    a: 'Yes. Google uses sitemaps to discover URLs, especially new pages, deep pages or pages with few internal links. Submitting a sitemap in Search Console helps discovery but does not guarantee indexing.',
  },
  {
    q: 'How does this tool generate the sitemap?',
    a: 'The generator first checks for sitemap.xml at your domain root. If found, it imports URLs up to your selected limit. Otherwise, it follows same-origin links in the HTML from your starting URL, at depth 1–4 and up to 500 pages.',
  },
  {
    q: 'What is changefreq and priority?',
    a: 'changefreq hints to search engines how often a page changes (daily, weekly, monthly, etc.). priority is a 0.0–1.0 score that signals the relative importance of pages on your site. Note: Google does not guarantee it follows these hints exactly.',
  },
  {
    q: 'Should I include image:image tags?',
    a: 'Image extensions are optional. Enable them to import image locations and titles from an existing sitemap or collect image src/data-src locations and title/alt text from crawled HTML. Review the image URLs before submitting.',
  },
  {
    q: 'How many URLs should a sitemap have?',
    a: 'Google allows up to 50,000 URLs or 50 MB uncompressed per sitemap file. Ai Ranko exports up to 500 URLs, including when importing existing sitemaps. For a sitemap index, it reads up to five child entries per index within that selected URL limit. Larger sites need multiple sitemap files maintained separately.',
  },
  {
    q: 'Where do I submit the sitemap?',
    a: 'Upload sitemap.xml to your site root (https://yourdomain.com/sitemap.xml), add "Sitemap: https://yourdomain.com/sitemap.xml" to your robots.txt, and submit the URL in Google Search Console under Sitemaps → Add a new sitemap.',
  },
  {
    q: 'How often should I regenerate the sitemap?',
    a: 'Regenerate and resubmit your sitemap whenever you publish new pages, remove old pages, or significantly restructure your site. For frequently updated blogs, regenerating weekly or monthly is a good practice.',
  },
  {
    q: "Why are some of my pages missing from the sitemap?",
    a: "Common reasons are the selected page limit, depth 1–4, failed fetches, excluded URL patterns, file types the crawler skips, or links that are absent from the fetched HTML. Sitemap imports are also capped at 500 URLs and up to five child entries per index. This tool does not render JavaScript or automatically exclude robots.txt-blocked or noindex pages. Check internal links and try a higher depth if appropriate.",
  },
  {
    q: "Does this replace a full site audit or Google Search Console?",
    a: "No. The generator lists URLs. Search Console shows how Google crawls and indexes your site. A site audit checks the pages themselves for on-page and technical issues. They work best together.",
  },
  {
    q: "Can I generate a sitemap with more than 500 URLs?",
    a: "This tool exports up to 500 URLs per run, whether it reads an existing sitemap or sitemap index or crawls your site. It does not generate an index or split the output into multiple files. For larger sites, maintain multiple sitemap files under a sitemap index. Google requires separate files above 50,000 URLs or 50 MB uncompressed.",
  },
  {
    q: "Is the XML sitemap generator free? Do I need to sign up?",
    a: "Yes. It is free to use, and you do not need an account to generate, copy or download a sitemap.",
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
              Read an existing sitemap or collect URLs from server-fetched HTML.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: Globe,
                step: '1',
                title: 'Discover URLs',
                desc: 'Reads your root sitemap.xml first, up to your selected URL limit. Otherwise, follows HTML links from the URL you enter at depth 1–4.',
              },
              {
                icon: FileCode2,
                step: '2',
                title: 'Build XML',
                desc: 'Builds sitemap XML with your chosen changefreq, priority, optional lastmod dates and image:image tags. Review the URLs and dates before submission.',
              },
              {
                icon: Download,
                step: '3',
                title: 'Download & Submit',
                desc: 'Copy the XML or download the file. Upload it to a public site URL and submit it in Search Console. Submission does not guarantee indexing.',
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
              Choose URL limits, crawl depth and optional sitemap fields.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: FileCode2, title: 'Valid XML Schema', desc: 'Builds XML with the sitemaps.org namespace and escaped URL values. Review the output and validate it before submission.' },
              { icon: Search, title: 'Sitemap.xml Reader', desc: 'Reads the root sitemap.xml before crawling, with the same selected limit of up to 500 URLs.' },
              { icon: Globe, title: 'Live Web Crawler', desc: 'If no sitemap exists, crawls your site up to 4 levels deep and collects up to 500 real page URLs.' },
              { icon: Clock, title: 'changefreq & lastmod', desc: 'Set change frequency and optional lastmod. Existing dates are preserved; missing or crawled dates use today. Verify these reflect actual content updates.' },
              { icon: ImageIcon, title: 'Image Extensions', desc: 'Optionally import image tags from a sitemap or collect image src/data-src locations from fetched HTML.' },
              { icon: Filter, title: 'Exclude Patterns', desc: 'During a crawl, skip URLs containing comma-separated patterns such as /admin or /cart. Exclusions are not applied to sitemap imports.' },
              { icon: Layers, title: 'Sitemap Index Support', desc: 'Reads up to five child entries per sitemap index and merges URLs within the selected limit of up to 500.' },
              { icon: CheckCircle2, title: 'Crawl Depth Control', desc: 'Choose depth 1–4. The starting page is depth 0; depth 1 also follows its direct same-origin HTML links, subject to the page limit.' },
              { icon: Download, title: 'Download or Copy XML', desc: 'Download as a standalone .xml file or copy the raw XML to clipboard — ready to upload to any hosting environment.' },
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
            Sitemap Best Practices
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { tip: 'Submit in Search Console', detail: 'Always submit your sitemap URL in Google Search Console and Bing Webmaster Tools — do not rely solely on the robots.txt Sitemap directive.' },
              { tip: 'Keep it under 50,000 URLs', detail: 'Google\'s limit per sitemap file is 50,000 URLs and 50 MB uncompressed. For larger sites, create a sitemap index pointing to multiple child sitemaps.' },
              { tip: 'Use canonical URLs only', detail: 'Include the preferred canonical URL for each page and remove session IDs and UTM duplicates. Review pagination URLs according to your site structure.' },
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

        <section>
          <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
            What This XML Sitemap Generator Does, and What It Doesn&apos;t
          </h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>Ai Ranko first looks for sitemap.xml at your domain root, including sitemap indexes. It imports URLs up to your selected limit and reads up to five child entries per index. If no usable sitemap is found, it follows same-origin links from your starting URL at depth 1–4, up to 500 pages. You can download or copy the resulting XML.</p>
            <p>The 500-URL cap applies to imports and crawls. The tool fetches HTML on the server without rendering JavaScript. It does not read robots.txt directives, filter noindex pages, verify canonicals or exclude every HTTP error response. Review the URLs and response statuses before submission. Exclude patterns apply only during crawling.</p>
            <p>Missing URLs can result from your selected page or depth limit, failed fetches, excluded patterns, skipped file types or links that are absent from the fetched HTML. This is a sitemap builder and does not report Search Console coverage or backlink data. Use the <Link href="/tools/site-audit" className="font-semibold text-primary hover:underline">site audit tool</Link> for on-page and technical checks.</p>
            <p>For a visitor-facing list, use the <Link href="/tools/html-sitemap-generator" className="font-semibold text-primary hover:underline">HTML sitemap generator</Link>. You can also <Link href="/tools/link-extractor" className="font-semibold text-primary hover:underline">extract all links on a page</Link> or review page metadata with the <Link href="/tools/meta-checker" className="font-semibold text-primary hover:underline">Meta Checker</Link>.</p>
          </div>
        </section>

        <section>
          <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
            How to Submit Your Sitemap to Google
          </h2>
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>Download the XML, name the file sitemap.xml and upload it to your site root or another public HTTPS URL.</li>
            <li>Add <code>Sitemap: https://yourdomain.com/sitemap.xml</code> to robots.txt.</li>
            <li>Open Sitemaps in Google Search Console and submit the sitemap URL.</li>
            <li>Review the Sitemaps report for errors and regenerate after publishing, removing or significantly restructuring pages.</li>
          </ol>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">Include only canonical, indexable URLs, without session IDs, UTM duplicates or noindex pages. The generator does not verify these settings for you. Verify lastmod dates reflect actual significant changes, because crawled pages and missing dates use the generation date.</p>
        </section>

        {/* FAQ */}
        <section>
          <div className="mb-8 text-center">
            <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {xmlSitemapFaqs.map((faq) => (
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
              { label: 'Site Audit Tool', href: '/tools/site-audit', desc: '25+ checks with fixes and an AI summary' },
              { label: 'Link Extractor', href: '/tools/link-extractor', desc: 'Extract links from a page' },
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
