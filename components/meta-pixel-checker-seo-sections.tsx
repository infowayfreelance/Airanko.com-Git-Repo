import Link from 'next/link'

export default function MetaPixelCheckerSeoSections() {
  const linkStyle = 'text-primary underline underline-offset-4'
  const headingStyle = 'font-heading text-2xl font-bold text-foreground sm:text-3xl'
  const listStyle = 'mt-4 list-disc space-y-3 pl-5 text-sm leading-relaxed text-muted-foreground'
  return (
    <div className="space-y-16 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-16">
        <section>
          <h2 className={headingStyle}>How to Check Title and Description Pixel Width in Bulk</h2>
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>Choose <strong>Website (Sitemap)</strong> to scan pages from a sitemap, <strong>Single URL</strong> for one page, or <strong>Multiple URLs</strong> to paste a list, one per line or comma-separated.</li>
            <li>For a website, enter the home page address and choose 25, 50, 100, 200 or 300 pages. The default is 50. Pasted lists also use the selected scan limit.</li>
            <li>Select <strong>Check Pixel Widths</strong>. The checker reads Sitemap directives in robots.txt. If none are listed, it tries /sitemap.xml and /sitemap_index.xml. It uses the first sitemap candidate that returns URLs and fetches pages up to your selected limit. Nested indexes are followed up to three levels below the first sitemap, with up to ten child sitemaps per index.</li>
            <li>Review desktop and mobile widths and the status for each title and description. Expand a result for its search preview, then export CSV or JSON to share or fix in bulk.</li>
          </ol>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">CSV includes the URL, fetch status, error, title, description, character counts and desktop and mobile pixel widths. JSON includes the scan details, fetched metadata, widths and width statuses. The checker reads returned HTML without running the page&apos;s JavaScript. It uses the Open Graph description if the meta description is empty or missing.</p>
        </section>
        <section>
          <h2 className={headingStyle}>Why Pixel Width Matters More Than Character Count</h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>Google does not use a fixed character count for truncation. Its documentation says there is no length limit for a <a className={linkStyle} href="https://developers.google.com/search/docs/appearance/title-link">title</a> or <a className={linkStyle} href="https://developers.google.com/search/docs/appearance/snippet">meta description</a>, but search results may shorten either to fit the device width. Wide letters such as W and M take more space than i and l, even when the character count is the same.</p>
            <p>A meta title length checker that only counts characters can miss this difference. Ai Ranko measures text with your browser&apos;s canvas text metrics, using Arial with Helvetica and sans-serif fallbacks. Titles use 20px on desktop and 18px on mobile. Descriptions use 14px on both. The default width limits are 600px and 920px for desktop titles and descriptions, and 580px and 680px for mobile.</p>
            <p>These measurements help you compare text against the tool&apos;s limits. Search previews remain estimates because Google can change its layout, wording and font rendering.</p>
          </div>
        </section>
        <section>
          <h2 className={headingStyle}>What the Results Mean</h2>
          <ul className={listStyle}>
            <li><strong>Good</strong> means the measured width is below 92% of the limit. This is the passing range, with room left in the estimate.</li>
            <li><strong>Near limit</strong> means the width is at least 92% of the limit and does not exceed it. Check the preview and shorten it if the last words matter.</li>
            <li><strong>Too long</strong> means the width exceeds the limit. The preview shortens it with an ellipsis. Move key words to the front or shorten it.</li>
            <li><strong>Desktop vs mobile</strong> uses different width limits and title font sizes. Check both measurements rather than assuming the desktop result applies to a phone.</li>
            <li><strong>Missing metadata</strong> appears in the result rows and summary. Missing text measures 0px, so a width badge alone does not mean the metadata is complete. Duplicate titles and descriptions are not flagged.</li>
            <li><strong>Fetch errors</strong> mean the checker could not read the page successfully. A redirect to a public sign-in screen may return that screen&apos;s metadata instead of the protected page.</li>
          </ul>
        </section>
        <section>
          <h2 className={headingStyle}>How to Fix Titles and Descriptions That Get Cut Off</h2>
          <ul className={listStyle}>
            <li><strong>Put the main keyword and the page&apos;s purpose first</strong>, so the important part survives if the end is cut off.</li>
            <li><strong>Cut repeated words and boilerplate.</strong> Google warns against keyword stuffing and long titles that differ by only one word across pages.</li>
            <li><strong>Write a unique description for every page.</strong> Similar descriptions make it harder for searchers to choose between pages.</li>
            <li><strong>Keep your brand short and at the end</strong>, separated by a pipe or dash, or drop it on long titles.</li>
            <li><strong>Re-check after you publish.</strong> Run the same sitemap scan again to confirm the changes.</li>
          </ul>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">If you need new wording, our <Link className={linkStyle} href="/tools/meta-title-description-pixel-generator">meta title and description generator</Link> writes suggestions against the same estimated pixel limits. Review the wording and widths before publishing.</p>
        </section>
        <section>
          <h2 className={headingStyle}>Related SEO Tools</h2>
          <ul className={listStyle}>
            <li><Link className={linkStyle} href="/tools/meta-title-description-pixel-generator">Meta title and description generator</Link>: write and review suggestions against estimated desktop and mobile pixel limits.</li>
            <li><Link className={linkStyle} href="/tools/meta-checker">Bulk meta and Open Graph checker</Link>: check meta tags and social sharing tags across pages.</li>
            <li><Link className={linkStyle} href="/tools/site-audit">Free site audit</Link>: find technical and on-page SEO issues across up to 15 pages with 25+ checks.</li>
            <li><Link className={linkStyle} href="/tools/xml-sitemap-generator">XML sitemap generator</Link>: create a sitemap if the checker cannot find one on your site.</li>
          </ul>
        </section>
      </div>
    </div>
  )
}
