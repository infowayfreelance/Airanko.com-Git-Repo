import Link from 'next/link'

export const websiteClonerFaqs = [
  {
    "q": "Is the website cloner free?",
    "a": "Yes. The Ai Ranko Website Cloner is free to use. Enter a public page URL, clone it, preview the snapshot and download the HTML file."
  },
  {
    "q": "Can it clone a whole website?",
    "a": "No. It clones one page at a time. To save several pages, clone each URL separately. If you need a list of every page on your own site first, use a sitemap or our link extractor."
  },
  {
    "q": "What do I get when I download a cloned page?",
    "a": "A single HTML file of the page. Styles and scripts are inlined where it is safe and within size limits, so the file is easier to open offline, but some assets may still load from the original site."
  },
  {
    "q": "Why does my cloned page look different from the live page?",
    "a": "Some pages build their content with JavaScript after loading, block automated requests, or use files that are too large or not allowed to be inlined. Those parts may be missing or look different in the snapshot."
  },
  {
    "q": "Can I clone a page behind a login?",
    "a": "No. The tool only fetches public HTTP or HTTPS pages. Pages that need you to sign in, accept a paywall or fill in a form can't be cloned."
  },
  {
    "q": "Is it legal to clone a website?",
    "a": "It depends on what you clone and what you do with it. Website content is usually protected by copyright, so only clone pages you own or have permission to copy, and follow the site's terms of service. Don't republish someone else's page as your own."
  },
  {
    "q": "Can I edit the cloned HTML?",
    "a": "Yes. The download is a normal HTML file, so you can open it in any code editor, change the text or layout, and view it in your browser."
  }
]

export default function WebsiteClonerSeoSections() {
  return (
    <div className="space-y-16 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-16">
        <section>
          <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">How to Clone a Web Page</h2>
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>Copy the full address of a public page you own or have permission to save, starting with http:// or https://.</li>
            <li>Paste it into the box above and select <strong className="text-foreground">Clone Page</strong>.</li>
            <li>Check the isolated preview to see how the snapshot looks.</li>
            <li>Download the HTML file and open it in your browser or a code editor.</li>
          </ol>
        </section>

        <section>
          <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">What the Website Cloner Saves, and What It Doesn&apos;t</h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>The Ai Ranko Website Cloner fetches one public page on our server and builds a single HTML file. It can inline stylesheets and scripts within the limits below. It does not render JavaScript on the server, follow page links or create a multi-page download.</p>
            <p>The source HTML limit is 1,000,000 bytes. The tool processes up to 10 linked stylesheets and 8 linked scripts, each limited to 128,000 bytes, within a total fetch budget of 2,000,000 bytes. The combined JSON response, including the HTML and separate preview, is capped at 4,000,000 bytes. Failed, unsupported, oversized or excess linked stylesheets and scripts are removed.</p>
            <p>Images and fonts are not downloaded or embedded. A base URL and rewritten CSS asset URLs point remaining resources back to public locations, so the downloaded file may need a connection to load them. Existing embedded data assets can remain. The isolated preview removes scripts and blocks external resources, forms and navigation, so it can look different from both the live page and the downloaded HTML.</p>
            <p>Pages behind a login or paywall may return only a sign-in screen or public content. Pages that build content after JavaScript runs may be incomplete. No Ai Ranko sign-in is required. The endpoint returns the result with a no-store cache header and does not save fetched pages to a database.</p>
          </div>
        </section>

        <section>
          <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">When a Website Cloner Is Useful</h2>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li><strong className="text-foreground">Archiving your own pages</strong> before a redesign, migration or big content change, so you have a record to inspect. Review the saved file because external assets and dynamic content may be missing.</li>
            <li><strong className="text-foreground">Offline reading or reference</strong> for page content you have permission to keep, with the resource limits above in mind.</li>
            <li><strong className="text-foreground">Development and testing</strong> by inspecting your own HTML and CSS, or comparing a page before and after a change.</li>
            <li><strong className="text-foreground">Client handovers</strong> by keeping a snapshot of a landing page you built, with the client&apos;s permission.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">Clone Responsibly: Permission and Copyright</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">Website text, images and code are usually protected by copyright, and UK copyright applies automatically without registration. Only clone pages you own or have explicit permission to copy, respect the site&apos;s terms of service, and don&apos;t republish someone else&apos;s page or design as your own. Do not use a cloned page to imitate another business or collect people&apos;s details. See <a href="https://www.gov.uk/copyright" className="font-semibold text-primary hover:underline">GOV.UK – How copyright protects your work</a>.</p>
        </section>

        <section>
          <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">Website Cloner vs Full-Site Downloaders</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">Full-site downloaders follow links and package several pages into a folder or archive. Ai Ranko saves one page as a single HTML file with an isolated static preview. It does not create a ZIP or crawl the rest of the site. If you need a list of pages on your own site first, use our <Link href="/tools/html-sitemap-generator" className="font-semibold text-primary hover:underline">HTML sitemap generator</Link> or <Link href="/tools/link-extractor" className="font-semibold text-primary hover:underline">link extractor</Link>. To check your own site&apos;s SEO before or after a redesign, run a free <Link href="/tools/site-audit" className="font-semibold text-primary hover:underline">site audit</Link>.</p>
        </section>

        <section>
          <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">Frequently Asked Questions</h2>
          <div className="mt-6 space-y-3">
            {websiteClonerFaqs.map((faq) => (
              <details key={faq.q} className="group rounded-2xl border border-border bg-card">
                <summary className="cursor-pointer px-5 py-4 font-heading text-sm font-semibold text-foreground">{faq.q}</summary>
                <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                  {faq.q === 'Can it clone a whole website?' ? (
                    <>No. It clones one page at a time. To save several pages, clone each URL separately. If you need a list of every page on your own site first, use a sitemap or our <Link href="/tools/link-extractor" className="font-semibold text-primary hover:underline">link extractor</Link>.</>
                  ) : faq.a}
                </p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
