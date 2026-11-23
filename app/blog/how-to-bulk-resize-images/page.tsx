import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight, Zap, Calendar, Clock, User } from 'lucide-react'
import Navbar from '@/components/navbar'
import { CookieSettingsLink } from '@/components/cookie-consent/cookie-settings-link'

const POST = {
  "title": "How to Bulk Resize Images (Free, in Your Browser, Without Uploading Them)",
  "excerpt": "Resize dozens of images at once for web, ecommerce or social. Pick the right size and format, keep aspect ratio and keep files on your own device.",
  "slug": "how-to-bulk-resize-images",
  "date": "2026-11-23",
  "dateDisplay": "November 23, 2026",
  "updated": "2026-11-23",
  "readingTime": "9 min read",
  "author": "Ai Ranko",
  "category": "Images & Web Performance",
  "url": "https://airanko.com/blog/how-to-bulk-resize-images",
  "image": "/blog/how-to-bulk-resize-images/how-to-bulk-resize-images-featured.webp"
}

export const metadata: Metadata = {
  title: 'How to Bulk Resize Images Free Without Uploading Them',
  description: POST.excerpt,
  authors: [{ name: POST.author }],
  category: POST.category,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  alternates: { canonical: POST.url },
  openGraph: {
    title: POST.title,
    description: POST.excerpt,
    url: POST.url,
    siteName: 'Ai Ranko',
    type: 'article',
    publishedTime: POST.date,
    modifiedTime: POST.updated,
    authors: [POST.author],
    images: [{ url: POST.image, width: 1200, height: 630, alt: 'Laptop showing a batch of photos ready to be resized at once.' }],
    locale: 'en_US',
    tags: ['Image Resizing', 'Web Performance', 'Image Formats'],
  },
  twitter: {
    card: 'summary_large_image',
    title: POST.title,
    description: POST.excerpt,
    images: [POST.image],
    creator: '@airanko',
    site: '@airanko',
  },
}

const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  '@id': `${POST.url}#article`,
  headline: POST.title,
  description: POST.excerpt,
  image: `https://airanko.com${POST.image}`,
  datePublished: POST.date,
  dateModified: POST.updated,
  author: { '@type': 'Organization', name: 'Ai Ranko', url: 'https://airanko.com/' },
  publisher: {
    '@type': 'Organization', name: 'Ai Ranko', url: 'https://airanko.com/',
    logo: { '@type': 'ImageObject', url: 'https://airanko.com/images/ai-ranko-logo.webp' },
  },
  mainEntityOfPage: { '@type': 'WebPage', '@id': POST.url },
  url: POST.url,
  inLanguage: 'en-GB',
  articleSection: POST.category,
}

const faqs = [
  {
    "q": "How do I resize multiple images at once for free?",
    "a": "Use a free batch resizer, select a group of files and choose appropriate dimensions and a supported output format. Check representative results before processing the full collection. Keep the originals so you can export again if the settings need changing."
  },
  {
    "q": "Can I bulk resize images without uploading them?",
    "a": "Yes, with a tool that processes images locally. Ai Ranko states that its bulk resizer works client-side and does not send image files to servers. Check that claim for any tool you use rather than assuming every browser editor works this way."
  },
  {
    "q": "Will bulk resizing reduce image quality?",
    "a": "It can. Reducing dimensions removes pixels, while lossy compression can alter detail. A smaller copy may still be suitable for its intended display size. Review the result where it will be used and preserve the original file."
  },
  {
    "q": "What size should images be for a website or blog?",
    "a": "Use the requirements of your theme and the intended placement. Consider the largest displayed size and whether visitors need a detailed view. Avoid treating one suggested width as a rule for every image on your site."
  },
  {
    "q": "How do I bulk resize images on Windows 11 or Mac?",
    "a": "On Windows, PowerToys Image Resizer can process selected files from File Explorer. On Mac, Preview can resize a selected group opened together. Follow the current official instructions and work on copies before committing a large folder."
  },
  {
    "q": "Should I convert images to WebP when resizing?",
    "a": "Consider WebP when your website or publishing destination supports it. Compare appearance and file size with other accepted formats. Retain transparency where needed, and review animation or other specialised requirements separately."
  }
]

const faqJsonLd = {
  '@context': 'https://schema.org', '@type': 'FAQPage', '@id': `${POST.url}#faq`,
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question', name: faq.q, acceptedAnswer: { '@type': 'Answer', text: faq.a },
  })),
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://airanko.com/' },
    { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://airanko.com/blog' },
    { '@type': 'ListItem', position: 3, name: POST.title, item: POST.url },
  ],
}

export default function BulkResizeImagesBlogPost() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Navbar />
      {/* Breadcrumb */}
      <div className="border-b border-border bg-card px-4 py-3 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-4xl items-center gap-1.5 text-sm text-muted-foreground">
          <Link
            href="/"
            className="flex items-center gap-1.5 transition-colors hover:text-foreground"
          >
            <Zap className="h-3.5 w-3.5 text-primary" />
            Ai Ranko
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link
            href="/blog"
            className="transition-colors hover:text-foreground"
          >
            Blog
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="truncate font-medium text-foreground">
            {POST.title}
          </span>
        </div>
      </div>

      <article className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <header className="mb-8">
            <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-primary/10 px-2.5 py-1 font-medium text-primary">
                {POST.category}
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="h-3 w-3" /> {POST.dateDisplay}
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3 w-3" /> {POST.readingTime}
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <User className="h-3 w-3" /> {POST.author}
              </span>
            </div>

            <h1 className="font-heading text-3xl font-bold leading-tight tracking-tight text-balance sm:text-4xl lg:text-5xl">
              {POST.title}
            </h1>
<p className="mt-4 leading-relaxed text-muted-foreground">{"To bulk resize images, select your files, choose suitable dimensions and an output format, then save resized copies. Use a browser tool that processes images locally if you want to avoid sending the image files to a server. Check a sample before applying the same settings to the whole batch."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"The important decision is what the pictures need to become. Product thumbnails, article photographs and social graphics have different jobs. One setting will not always suit them all."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"This guide explains how to choose a resizing method, keep proportions, review quality and organise the finished files. Ai Ranko’s browser-based tool provides the batch workflow, with no software installation or signup required."}</p>
          </header>
<Image
  src="/blog/how-to-bulk-resize-images/how-to-bulk-resize-images-featured.webp"
  alt="Laptop showing a batch of photos ready to be resized at once."
  width={1200}
  height={630}
  priority
  className="mb-8 mt-6 w-full rounded-3xl border border-border object-cover"
/>
<section className="mb-14">
<h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"Short answer: the quickest way to bulk resize images"}</h2>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Group images by their intended use. Keep your originals in a separate folder, choose a target size and process a small sample first. Once the copies look right, use those settings for the remaining files."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Resizing changes pixel dimensions. Compression changes how the image is stored and can affect file size and quality. Conversion changes the format, such as JPG to WebP. You may need more than one operation, but they are separate decisions."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"A batch image resizer saves you from repeating the same edits manually. It does not know whether a product label must remain readable or whether a portrait needs a different crop. Those checks still need your judgement."}</p>
</section>
<section className="mb-14">
<h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"Before you start: choose a resize method"}</h2>
<Image
  src="/blog/how-to-bulk-resize-images/bulk-resize-method-long-edge.webp"
  alt="Diagram of portrait and landscape images resized by their longest side."
  width={1200}
  height={800}
  className="mb-8 mt-6 w-full rounded-3xl border border-border object-cover"
/>
<p className="mt-4 leading-relaxed text-muted-foreground">{"These are common ways to resize in bulk. Available controls differ between tools, so choose the method your editor supports rather than assuming every option appears in every interface."}</p>
<ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground"><li><strong>{"Long edge:"}</strong>{" Set the longest side to a chosen length while preserving proportions. This is useful for mixed portrait and landscape photos."}</li><li><strong>{"Width:"}</strong>{" Set a common width and let the height follow proportionally. This suits images placed in the same article column."}</li><li><strong>{"Percentage:"}</strong>{" Scale each image relative to its original dimensions. Different starting sizes will still produce different final sizes."}</li><li><strong>{"Exact dimensions:"}</strong>{" Produce a specific width and height. If the source has a different shape, crop or add space instead of stretching it."}</li></ul>
<p className="mt-4 leading-relaxed text-muted-foreground">{"For example, reducing a 2,400 × 1,600 photograph to 1,200 × 800 preserves its shape. Forcing it into a square changes the shape unless you crop it or place it on a square canvas. These are examples, not platform requirements."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Choose the method before selecting the whole folder. Mixed source sizes can make a percentage reduction unsuitable when you need consistent output dimensions."}</p>
</section>
<section className="mb-14">
<h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"Which size and format do you need?"}</h2>
<Image
  src="/blog/how-to-bulk-resize-images/ecommerce-product-photos-batch.webp"
  alt="Online seller preparing a batch of product photos."
  width={1200}
  height={800}
  className="mb-8 mt-6 w-full rounded-3xl border border-border object-cover"
/>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Start with the destination. Check your website theme, shop system or publishing platform for the dimensions and shapes it expects. There is no single image size that works for every website, blog and social placement."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"For blog images, consider the content column and how the picture appears on larger screens. For ecommerce, check both the catalogue view and any product zoom. A thumbnail-sized export may be unsuitable for a detailed product view."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"For social posts, use the current requirements of the exact placement. A profile picture, feed image and cover graphic serve different purposes. This guide deliberately avoids a fixed platform-size chart that could become outdated."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Choose a format the destination accepts:"}</p>
<ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground"><li><strong>{"WebP"}</strong>{" is useful for many website images and supports transparency."}</li><li><strong>{"JPG"}</strong>{" is a practical option for photographs when transparency is unnecessary."}</li><li><strong>{"PNG"}</strong>{" supports transparency and is useful for some graphics, screenshots and sharp-edged artwork."}</li></ul>
<p className="mt-4 leading-relaxed text-muted-foreground"><Link href="https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types" className="font-semibold text-primary hover:underline">{"MDN’s image-format guide"}</Link>{" explains their different strengths. Do not assume one format always gives the smallest useful file. Compare exports with your own images."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Ai Ranko’s page also lists GIF and BMP support. Check specialised files separately, especially animations, rather than assuming every property survives a conversion."}</p>
</section>
<section className="mb-14">
<h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"How to bulk resize images with Ai Ranko"}</h2>
<h3 className="mt-6 font-heading text-xl font-semibold text-foreground">{"Prepare and select your files"}</h3>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Open the "}<Link href="https://airanko.com/tools/bulk-image-resizer" className="font-semibold text-primary hover:underline">{"bulk image resizer"}</Link>{". Its opening file-selection area says “Drop, paste, or click to upload”. You can drag files there, click to browse or paste using the displayed keyboard shortcut."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Here, “upload” is the interface’s wording for selecting images. The page says image processing happens in your browser and the files are not sent to its servers."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Start with a small group that represents your batch. Include a portrait, a landscape image and any picture containing fine detail. Keep unrelated jobs, such as product thumbnails and full-width article images, in separate groups."}</p>
<h3 className="mt-6 font-heading text-xl font-semibold text-foreground">{"Choose settings and check a sample"}</h3>
<p className="mt-4 leading-relaxed text-muted-foreground">{"The page describes global settings for the batch and individual adjustments for exceptions. Choose the required dimensions and output format, using the controls available after selection."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Keep proportions intact. If a picture needs a different shape, prepare its crop first. Review compression preferences alongside dimensions, because a smaller image can still look poor if its encoding is too aggressive."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Check details that matter: product edges, small lettering, faces and soft gradients. Do not apply a setting to the entire folder just because one simple photograph looks acceptable."}</p>
<h3 className="mt-6 font-heading text-xl font-semibold text-foreground">{"Download and inspect your copies"}</h3>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Save the processed images using the tool’s download options. Put them in a new folder and open several copies before replacing anything on your website."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Confirm the dimensions, format and appearance. Use meaningful filenames, such as "}<code className="rounded bg-muted px-1.5 py-0.5 text-sm">{"ceramic-mug-side-view.webp"}</code>{", so you can identify the correct version later. Avoid overwriting your only original."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Your browser and device still have practical memory limits. If a large batch becomes difficult to handle, work in smaller groups. Do not rely on an advertised absence of a file-count limit as a promise about every device."}</p>
</section>
<section className="mb-14">
<h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"Does it upload my images? What “in your browser” means"}</h2>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Ai Ranko states that its bulk resizing and conversion are client-side. This means your browser performs the image-processing work on your device rather than sending the selected pictures to a remote image processor."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"That is different from a service where you send a photograph away and wait for a server-generated download. Selecting a local file does not automatically mean it has been transmitted."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"However, local image processing is not the same as a website making no network requests. The page itself still loads online. The tool’s published claim concerns your image files, not every aspect of website activity."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"For confidential work, check your organisation’s rules and the service’s current privacy information. The service’s published statement is not an independent security audit."}</p>
</section>
<section className="mb-14">
<h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"Keeping quality: aspect ratio, no upscaling and compression"}</h2>
<Image
  src="/blog/how-to-bulk-resize-images/image-file-size-before-after.webp"
  alt="Illustration of a large image file reduced to a smaller web-ready file."
  width={1200}
  height={800}
  className="mb-8 mt-6 w-full rounded-3xl border border-border object-cover"
/>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Keep the aspect ratio unless you deliberately need a new composition. Stretching a picture can make products look wider or faces look taller. Crop to the required shape first, then resize proportionally."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"For help choosing a crop workflow, see the "}<Link href="https://airanko.com/blog/top-10-free-photo-cropping-tools" className="font-semibold text-primary hover:underline">{"free photo-cropping tools guide"}</Link>{". For one image that needs individual attention, use the "}<Link href="https://airanko.com/tools/image-resizer" className="font-semibold text-primary hover:underline">{"image resizer"}</Link>{"."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Avoid enlarging a small source merely to reach a target number. Upscaling cannot recover detail that the original never captured. Find a larger original or use a smaller placement where possible."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Keep compression separate from image dimensions in your thinking. Lossy compression can introduce visible changes. Check fine edges and smooth backgrounds before accepting a smaller file."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Always return to the original when making another export. Repeatedly editing an already compressed copy can compound damage. Keep your master files and make destination-specific copies from them."}</p>
</section>
<section className="mb-14">
<h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"Other ways to bulk resize: Windows, Mac and Photoshop"}</h2>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Browser tools are one option. If you already use desktop software, these are alternatives worth considering. Menu names below were checked against official help information in November 2026."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground"><strong>{"Windows 11:"}</strong>{" Microsoft’s "}<Link href="https://learn.microsoft.com/en-us/windows/powertoys/image-resizer" className="font-semibold text-primary hover:underline">{"PowerToys Image Resizer"}</Link>{" handles multiple selected files through File Explorer. Its documentation currently names the context-menu option “Resize with Image Resizer”. Review its fit and replacement settings before processing originals."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground"><strong>{"Mac:"}</strong>{" Apple’s "}<Link href="https://support.apple.com/en-euro/guide/preview/prvw2015/mac" className="font-semibold text-primary hover:underline">{"Preview guidance"}</Link>{" describes opening images together, selecting them in the sidebar and choosing "}<strong>{"Tools > Adjust Size"}</strong>{". Work on copies and check which images are selected."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground"><strong>{"Photoshop:"}</strong>{" Adobe’s "}<Link href="https://helpx.adobe.com/photoshop/desktop/automate-tasks/process-a-batch-of-files/convert-files-with-the-image-processor.html" className="font-semibold text-primary hover:underline">{"Image Processor instructions"}</Link>{" describe "}<strong>{"File > Scripts > Image Processor"}</strong>{", including a "}<strong>{"Resize to Fit"}</strong>{" option. Choose the source, destination and output settings before running a batch."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"These methods have different controls and format choices. Use the workflow that fits your files rather than expecting identical results from identical-looking settings."}</p>
</section>
<section className="mb-14">
<h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"Bulk resizing for faster pages and SEO"}</h2>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Serving appropriately sized images can reduce unnecessary image data. That can help page loading, especially when a page contains several large photographs. It does not guarantee a ranking improvement."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Check the result on the actual page. An image that looks clear in a folder may be stretched by the website layout or cropped unexpectedly on a phone."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Ai Ranko’s "}<Link href="https://airanko.com/tools/site-audit" className="font-semibold text-primary hover:underline">{"site audit tool"}</Link>{" provides 25+ checks across up to 15 pages as a wider starting point. For hands-on testing, follow the guide to "}<Link href="https://airanko.com/blog/how-to-check-if-a-website-is-mobile-friendly" className="font-semibold text-primary hover:underline">{"checking whether a website is mobile-friendly"}</Link>{"."}</p>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Keep descriptive image text and a usable layout in mind too. Resizing is one part of preparing a page for visitors."}</p>
</section>
<section className="mb-14">
<h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"Frequently asked questions"}</h2>
<div className="mt-6 space-y-3">
  {faqs.map((faq) => (
    <details key={faq.q} className="group rounded-2xl border border-border bg-card">
      <summary className="cursor-pointer px-5 py-4 font-heading text-sm font-semibold text-foreground">{faq.q}</summary>
      <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
    </details>
  ))}
</div>
</section>
<section className="mb-14">
<h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{"Try it now"}</h2>
<p className="mt-4 leading-relaxed text-muted-foreground">{"Choose a few representative photos, keep the originals and prepare a small batch with Ai Ranko’s "}<Link href="https://airanko.com/tools/bulk-image-resizer" className="font-semibold text-primary hover:underline">{"bulk image resizer"}</Link>{". Set the dimensions for the destination, review the output and download your copies before moving on to the rest."}</p>
</section>
        </div>
      </article>
      <footer className="mt-12 border-t border-border bg-card px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <Link href="/" aria-label="Ai Ranko home">
            <img
              src="/images/ai-ranko-logo.webp"
              alt="Ai Ranko"
              className="h-7 w-auto"
            />
          </Link>
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Ai Ranko. Free AI SEO &amp; image
            tools — no signup required.
          </p>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link
              href="/sitemap"
              className="transition-colors hover:text-foreground"
            >
              Sitemap
            </Link>
            <Link
              href="/blog"
              className="transition-colors hover:text-foreground"
            >
              Blog
            </Link>
            <Link
              href="/privacy-policy"
              className="transition-colors hover:text-foreground"
            >
              Privacy
            </Link>
            <Link
              href="/terms-and-conditions"
              className="transition-colors hover:text-foreground"
            >
              Terms
            </Link>
            <Link
              href="/contact"
              className="transition-colors hover:text-foreground"
            >
              Contact
            </Link>
            <CookieSettingsLink className="transition-colors hover:text-foreground" />
          </nav>
        </div>
      </footer>
    </div>
  )
}
