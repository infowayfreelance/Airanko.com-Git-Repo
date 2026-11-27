import Link from 'next/link'
import {
  Globe,
  Smartphone,
  RotateCcw,
  ZoomIn,
  Layers,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react'

// ─── How It Works ────────────────────────────────────────────────────────────

const steps = [
  {
    icon: Globe,
    step: '01',
    title: 'Enter Your URL',
    desc: 'Paste any public website URL into the input field and hit Check. Works with any live website — your own or a competitor\'s.',
  },
  {
    icon: Smartphone,
    step: '02',
    title: 'Choose Your Device & Settings',
    desc: 'Select from Phone, Tablet, or Desktop — then pick a specific device like iPhone 14, Galaxy S23, or Pixel 7. Switch between Portrait and Landscape mode, and adjust zoom level to 50%, 75%, or 100%.',
  },
  {
    icon: ZoomIn,
    step: '03',
    title: 'See the Preview',
    desc: 'Your page loads at the screen size of the device you chose, right in your browser. No app to download.',
  },
]

// ─── Key Features ────────────────────────────────────────────────────────────

const features = [
  {
    icon: Layers,
    title: 'Multiple Device Types',
    desc: 'Test your website across Phone, Tablet, and Desktop — all in one tool. Switch between device categories without reloading the page.',
  },
  {
    icon: Smartphone,
    title: 'Device Screen Sizes',
    desc: 'Preview your page at the screen dimensions of devices such as the iPhone SE, iPhone 14, iPhone 14 Pro Max, Galaxy S23 and Pixel 7. The preview shows your layout at those sizes; it is not a physical phone.',
  },
  {
    icon: RotateCcw,
    title: 'Portrait & Landscape Mode',
    desc: 'Toggle between Portrait and Landscape orientation with one click. Catch layout breaks and overflow issues that only appear in horizontal view.',
  },
  {
    icon: ZoomIn,
    title: 'Zoom Controls',
    desc: 'Scale your preview to 50%, 75%, or 100% for a closer or wider look. Perfect for inspecting small UI elements, buttons, and text readability on mobile.',
  },
  {
    icon: Globe,
    title: 'Browser-Based Preview',
    desc: 'No installation, no extension, no account required. Enter a URL and preview it in your browser.',
  },
  {
    icon: ShieldCheck,
    title: 'Free to Use',
    desc: 'No sign-up and no cost. See the FAQ and our privacy policy for how the URL you enter is used.',
  },
]

export const mobileCheckerFaqs = [
  { q: "What is a mobile friendliness checker?", a: "A mobile friendliness checker is a tool that previews any website at mobile, tablet or desktop screen sizes. It helps you visually inspect how your site looks and behaves on different devices — before your users experience any issues.", content: <>{"A mobile friendliness checker is a tool that previews any website at mobile, tablet or desktop screen sizes. It helps you visually inspect how your site looks and behaves on different devices — before your users experience any issues."}</> },
  { q: "Is this mobile friendliness checker completely free?", a: "Yes. It is free to use, with no subscription and no sign-up required. Enter any public URL to preview it and run the audit.", content: <>{"Yes. It is free to use, with no subscription and no sign-up required. Enter any public URL to preview it and run the audit."}</> },
  { q: "Which devices can I test my website on?", a: "You can choose from a library of phone, tablet and desktop sizes, including iPhone SE, iPhone 14, iPhone 15, Samsung Galaxy S23 and Google Pixel 7, plus a custom size. Portrait and Landscape orientation are available for each.", content: <>{"You can choose from a library of phone, tablet and desktop sizes, including iPhone SE, iPhone 14, iPhone 15, Samsung Galaxy S23 and Google Pixel 7, plus a custom size. Portrait and Landscape orientation are available for each."}</> },
  { q: "Does Google use mobile-friendliness as a ranking factor?", a: "Google uses the mobile version of a site's content for indexing and ranking, which is called mobile-first indexing (Google Search Central). Google says mobile usability remains part of its page experience guidance, but it is one of many signals and not a guarantee of rankings.", content: <>{"Google uses the mobile version of a site's content for indexing and ranking, which is called mobile-first indexing ("}<Link href="https://developers.google.com/search/docs/crawling-indexing/mobile/mobile-sites-mobile-first-indexing" target="_blank" rel="noopener" className="font-semibold text-primary hover:underline">{"Google Search Central"}</Link>{"). Google says mobile usability remains part of its page experience guidance, but it is one of many signals and not a guarantee of rankings."}</> },
  { q: "Do I need to install anything to use this tool?", a: "No installation, no browser extension, and no account is needed. The tool runs in your browser: open the page, enter a URL, and check it.", content: <>{"No installation, no browser extension, and no account is needed. The tool runs in your browser: open the page, enter a URL, and check it."}</> },
  { q: "Can I test competitor websites with this tool?", a: "Yes — you can test any publicly accessible website, including competitor sites. It's a great way to benchmark your mobile UX against industry competitors.", content: <>{"Yes — you can test any publicly accessible website, including competitor sites. It's a great way to benchmark your mobile UX against industry competitors."}</> },
  { q: "Is my data safe when using this tool?", a: "Your URL is used to load the preview and run the audit. The preview sends it directly to the website in an iframe, and the audit sends it to our server to fetch the page. The tool keeps URLs and results in memory for the current page session, without database or browser-storage writes. Server errors may be logged; the code does not establish hosting-log retention. See our privacy policy for details.", content: <>{"Your URL is used to load the preview and run the audit. The preview sends it directly to the website in an iframe, and the audit sends it to our server to fetch the page. The tool keeps URLs and results in memory for the current page session, without database or browser-storage writes. Server errors may be logged; the code does not establish hosting-log retention. See our "}<Link href="/privacy-policy" className="font-semibold text-primary hover:underline">{"privacy policy"}</Link>{" for details."}</> },
  { q: "What is the difference between Portrait and Landscape mode?", a: "Portrait mode shows the vertical screen view — how most users hold their phone. Landscape mode shows the horizontal view — useful for catching layout breaks that only appear when the screen rotates.", content: <>{"Portrait mode shows the vertical screen view — how most users hold their phone. Landscape mode shows the horizontal view — useful for catching layout breaks that only appear when the screen rotates."}</> },
  { q: "What does the zoom control do?", a: "Zoom controls let you scale the preview to 50%, 75%, or 100% of the actual device size. Use it to inspect small text, buttons, and UI elements more closely or get a wider overall view.", content: <>{"Zoom controls let you scale the preview to 50%, 75%, or 100% of the actual device size. Use it to inspect small text, buttons, and UI elements more closely or get a wider overall view."}</> },
  { q: "Does Google still offer its Mobile-Friendly Test?", a: "No. Google retired the Mobile-Friendly Test, its API and Search Console's Mobile Usability report on 1 December 2023 and pointed site owners to Lighthouse in Chrome, among other tools (Google Search Central, Lighthouse). This tool gives you a visual preview at device sizes plus an audit based on the page's own HTML, and you can run Lighthouse as well for a fuller report.", content: <>{"No. Google retired the Mobile-Friendly Test, its API and Search Console's Mobile Usability report on 1 December 2023 and pointed site owners to Lighthouse in Chrome, among other tools ("}<Link href="https://developers.google.com/search/blog/2023/04/page-experience-in-search" target="_blank" rel="noopener" className="font-semibold text-primary hover:underline">{"Google Search Central"}</Link>{", "}<Link href="https://developer.chrome.com/docs/lighthouse/overview" target="_blank" rel="noopener" className="font-semibold text-primary hover:underline">{"Lighthouse"}</Link>{"). This tool gives you a visual preview at device sizes plus an audit based on the page's own HTML, and you can run Lighthouse as well for a fuller report."}</> },
  { q: "What does the mobile-friendliness audit actually check?", a: "It measures viewport meta tag configuration, pinch-to-zoom availability, small/illegible font sizes, fixed-width elements that risk horizontal scrolling, responsive media queries, Flash or unsupported plugin content, responsive image usage (srcset), touch/home-screen icons, HTML document weight, render-blocking scripts, and whether mobile visitors get redirected to a separate URL. Every check runs against the real fetched page — checks that require full browser rendering to measure exactly are clearly labeled \"estimated\". Font sizes, fixed widths and media queries are inspected in inline or embedded CSS, not external stylesheets or computed styles. Tap-target sizes are not measured.", content: <>{"It measures viewport meta tag configuration, pinch-to-zoom availability, small/illegible font sizes, fixed-width elements that risk horizontal scrolling, responsive media queries, Flash or unsupported plugin content, responsive image usage (srcset), touch/home-screen icons, HTML document weight, render-blocking scripts, and whether mobile visitors get redirected to a separate URL. Every check runs against the real fetched page — checks that require full browser rendering to measure exactly are clearly labeled \"estimated\". Font sizes, fixed widths and media queries are inspected in inline or embedded CSS, not external stylesheets or computed styles. Tap-target sizes are not measured."}</> },
  { q: "Can I audit my whole website at once?", a: "Yes — switch to \"Bulk / Sitemap Audit\" mode, enter your site's URL, and the tool discovers your sitemap.xml (via robots.txt, then conventional locations, following nested sitemap indexes) and audits every page it finds, up to 200 pages per run. Results are sortable, filterable, and exportable as CSV, JSON, or PDF. The interface offers up to 200 pages; the API has a separate 300-URL cap. PDF export uses your browser’s print dialog.", content: <>{"Yes — switch to \"Bulk / Sitemap Audit\" mode, enter your site's URL, and the tool discovers your sitemap.xml (via robots.txt, then conventional locations, following nested sitemap indexes) and audits every page it finds, up to 200 pages per run. Results are sortable, filterable, and exportable as CSV, JSON, or PDF. The interface offers up to 200 pages; the API has a separate 300-URL cap. PDF export uses your browser’s print dialog."}</> },
  { q: "What makes a page mobile-friendly?", a: "Four basics: a viewport meta tag set to the device width so the page isn't shrunk, text that is large enough to read without zooming, tap targets (links and buttons) big enough and far enough apart to press accurately, and content that fits the screen without sideways scrolling. The WCAG 2.2 minimum target size is 24 by 24 CSS pixels, with some exceptions (W3C).", content: <>{"Four basics: a viewport meta tag set to the device width so the page isn't shrunk, text that is large enough to read without zooming, tap targets (links and buttons) big enough and far enough apart to press accurately, and content that fits the screen without sideways scrolling. The WCAG 2.2 minimum target size is 24 by 24 CSS pixels, with some exceptions ("}<Link href="https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html" target="_blank" rel="noopener" className="font-semibold text-primary hover:underline">{"W3C"}</Link>{")."}</> },
  { q: "Is a preview the same as testing on a real phone?", a: "No. The preview shows your page at the screen size of the device you choose, so it is good for spotting layout problems, but it isn't a physical phone with its own browser, touch input or network. Check important pages on a real phone as well.", content: <>{"No. The preview shows your page at the screen size of the device you choose, so it is good for spotting layout problems, but it isn't a physical phone with its own browser, touch input or network. Check important pages on a real phone as well."}</> },
  { q: "Why does my site not load in the preview?", a: "The preview loads the URL directly in an iframe. Some websites block embedding with X-Frame-Options or Content Security Policy, and pages that require a login may not load as expected. If the preview stays blank, try the audit, which separately fetches public HTML without signing in, and open the site on your own phone. Embedding restrictions can leave a blank frame without a clear error.", content: <>{"The preview loads the URL directly in an iframe. Some websites block embedding with X-Frame-Options or Content Security Policy, and pages that require a login may not load as expected. If the preview stays blank, try the audit, which separately fetches public HTML without signing in, and open the site on your own phone. Embedding restrictions can leave a blank frame without a clear error."}</> },
  { q: "What should I fix first after a mobile check?", a: "Start with anything that breaks the layout: a missing or fixed-width viewport and content that scrolls sideways. Then fix text that is too small and tap targets that are too close together, and finally heavy images and render-blocking scripts. Our guide to checking if a website is mobile-friendly walks through the process, and the image resizer can shrink oversized images.", content: <>{"Start with anything that breaks the layout: a missing or fixed-width viewport and content that scrolls sideways. Then fix text that is too small and tap targets that are too close together, and finally heavy images and render-blocking scripts. Our "}<Link href="/blog/how-to-check-if-a-website-is-mobile-friendly" className="font-semibold text-primary hover:underline">{"guide to checking if a website is mobile-friendly"}</Link>{" walks through the process, and the "}<Link href="/tools/image-resizer" className="font-semibold text-primary hover:underline">{"image resizer"}</Link>{" can shrink oversized images."}</> },
  { q: "Can I preview a custom screen size?", a: "Yes. Choose Custom and enter a width and height to add a screen size for the current page session. This changes the iframe dimensions; it does not emulate a physical device.", content: <>{"Yes. Choose Custom and enter a width and height to add a screen size for the current page session. This changes the iframe dimensions; it does not emulate a physical device."}</> }
]

export default function MobileCheckerSeoSections() {
  return (
    <div className="border-t border-border bg-background">

      {/* ── How It Works ── */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="font-heading text-2xl font-bold text-foreground text-balance sm:text-3xl">
              How It Works
            </h2>
            <p className="mt-2 text-muted-foreground text-pretty">
              Three simple steps to test any website&apos;s mobile friendliness.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {steps.map((s) => {
              const Icon = s.icon
              return (
                <div
                  key={s.step}
                  className="relative flex flex-col items-start gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm"
                >
                  <span className="font-heading text-4xl font-bold text-primary/15 select-none leading-none">
                    {s.step}
                  </span>
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
            <h2 className="font-heading text-2xl font-bold text-foreground text-balance sm:text-3xl">
              Key Features
            </h2>
            <p className="mt-2 text-muted-foreground text-pretty">
              Everything you need to test and analyze mobile responsiveness in one place.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => {
              const Icon = f.icon
              return (
                <div
                  key={f.title}
                  className="flex flex-col gap-3 rounded-2xl border border-border bg-background p-5 shadow-sm"
                >
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

<section className="px-4 py-16 sm:px-6 lg:px-8"><div className="mx-auto max-w-5xl"><h2 className="font-heading text-2xl font-bold text-foreground text-balance sm:text-3xl">{"Why Mobile-Friendliness Matters"}</h2><p className="mt-3 text-muted-foreground leading-relaxed text-pretty"><>{"Google uses the mobile version of a site's content for indexing and ranking, so a page that is hard to use on a phone can hold back how it is understood and how visitors experience it ("}<Link href="https://developers.google.com/search/docs/crawling-indexing/mobile/mobile-sites-mobile-first-indexing" target="_blank" rel="noopener" className="font-semibold text-primary hover:underline">{"Google Search Central"}</Link>{"). Mobile usability is not a single ranking switch, but it affects every visitor on a phone: text they can't read, buttons they can't press and content that runs off the screen make people leave. Testing regularly catches layout breaks before your visitors do."}</></p></div></section>
<section className="border-t border-border bg-card px-4 py-16 sm:px-6 lg:px-8"><div className="mx-auto max-w-5xl"><h2 className="font-heading text-2xl font-bold text-foreground text-balance sm:text-3xl">{"What This Mobile Checker Tests (and What It Doesn't)"}</h2><ul className="flex flex-col gap-3"><li className="text-sm font-medium text-foreground"><><strong>{"Preview:"}</strong>{" your page at the screen size of the device you choose, in portrait or landscape, with 50%, 75% or 100% zoom."}</></li><li className="text-sm font-medium text-foreground"><><strong>{"Audit:"}</strong>{" a check of the page's HTML for the viewport tag, pinch-to-zoom, small font sizes, fixed-width elements that risk sideways scrolling, responsive media queries, Flash or unsupported plugins, responsive images, render-blocking scripts and separate mobile URLs. Checks that need full browser rendering to measure exactly are marked \"estimated\". Font sizes, fixed widths and media queries are inspected in inline or embedded CSS; external stylesheets and computed styles are not scanned. Tap-target sizes are not measured."}</></li><li className="text-sm font-medium text-foreground"><><strong>{"Not covered:"}</strong>{" how a page behaves on a physical phone, its browser or touch input, or its real-world speed. Test important pages on a real phone as well, or run "}<Link href="https://developer.chrome.com/docs/lighthouse/overview" target="_blank" rel="noopener" className="font-semibold text-primary hover:underline">{"Lighthouse in Chrome"}</Link>{"."}</></li><li className="text-sm font-medium text-foreground"><><strong>{"Google's own tool:"}</strong>{" Google retired its Mobile-Friendly Test and Search Console's Mobile Usability report on 1 December 2023 and points to Lighthouse and other tools ("}<Link href="https://developers.google.com/search/blog/2023/04/page-experience-in-search" target="_blank" rel="noopener" className="font-semibold text-primary hover:underline">{"Google Search Central"}</Link>{")."}</></li></ul></div></section>
      {/* ── SEO Content Block ── */}
<section className="px-4 py-16 sm:px-6 lg:px-8"><div className="mx-auto max-w-3xl"><h2 className="font-heading text-2xl font-bold text-foreground text-balance sm:text-3xl">{"Test How Your Page Looks on a Phone"}</h2><p className="mt-3 text-muted-foreground leading-relaxed text-pretty"><>{"Whether you're an SEO, a developer or a business owner, it helps to see your page the way phone visitors do. This free mobile friendliness checker previews any public page at phone, tablet and desktop sizes, with no installation and no sign-up. Use the audit to find layout problems, small text and missing viewport settings, then fix them before visitors run into them. The preview is a quick visual check and is no substitute for trying the page on a real phone."}</></p></div></section>
<section className="px-4 py-16 sm:px-6 lg:px-8"><div className="mx-auto max-w-5xl"><h2 className="font-heading text-2xl font-bold text-foreground text-balance sm:text-3xl">{"What Makes a Page Mobile-Friendly?"}</h2><ul className="flex flex-col gap-3"><li className="text-sm font-medium text-foreground"><><strong>{"Viewport:"}</strong>{" a viewport meta tag set to the device width, so the page isn't shrunk to a desktop layout."}</></li><li className="text-sm font-medium text-foreground"><><strong>{"Readable text:"}</strong>{" text large enough to read without zooming."}</></li><li className="text-sm font-medium text-foreground"><><strong>{"Tap targets:"}</strong>{" links and buttons big enough and spaced far enough apart to press accurately. The WCAG 2.2 minimum target size is 24 by 24 CSS pixels, with some exceptions ("}<Link href="https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html" target="_blank" rel="noopener" className="font-semibold text-primary hover:underline">{"W3C"}</Link>{")."}</></li><li className="text-sm font-medium text-foreground"><><strong>{"Fits the screen:"}</strong>{" no sideways scrolling and no content cut off in portrait or landscape."}</></li><li className="text-sm font-medium text-foreground"><><strong>{"Lighter pages:"}</strong>{" compress oversized images with our "}<Link href="/tools/image-resizer" className="font-semibold text-primary hover:underline">{"image resizer"}</Link>{" and avoid scripts that block the page from showing."}</></li></ul><p className="mt-3 text-muted-foreground leading-relaxed text-pretty"><>{"When you're ready to check more than one page, use the Bulk / Sitemap Audit mode, build a sitemap with our "}<Link href="/tools/xml-sitemap-generator" className="font-semibold text-primary hover:underline">{"XML sitemap generator"}</Link>{", or run the "}<Link href="/tools/site-audit" className="font-semibold text-primary hover:underline">{"site audit"}</Link>{". For meta tags and Open Graph, use the "}<Link href="/tools/meta-checker" className="font-semibold text-primary hover:underline">{"meta checker"}</Link>{". The full walkthrough is in our guide to "}<Link href="/blog/how-to-check-if-a-website-is-mobile-friendly" className="font-semibold text-primary hover:underline">{"checking if a website is mobile-friendly"}</Link>{"."}</></p></div></section>
      {/* ── FAQ ── */}
      <section className="border-t border-border bg-card px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 text-center">
            <h2 className="font-heading text-2xl font-bold text-foreground text-balance sm:text-3xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-muted-foreground text-pretty">
              Everything you need to know about testing mobile friendliness with Ai Ranko.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {mobileCheckerFaqs.map((faq, i) => (
              <details
                key={i}
                className="group rounded-2xl border border-border bg-background shadow-sm"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-heading font-semibold text-foreground hover:text-primary transition-colors">
                  {faq.q}
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <div className="border-t border-border px-5 py-4 text-sm leading-relaxed text-muted-foreground">
                  {faq.content}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
