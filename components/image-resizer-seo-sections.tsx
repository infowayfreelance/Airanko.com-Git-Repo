import Link from 'next/link'
import {
  Upload,
  SlidersHorizontal,
  Download,
  Maximize2,
  Crop,
  FileImage,
  Minimize2,
  LayoutGrid,
  Lock,
  CheckCircle2,
  Gauge,
  Monitor,
} from 'lucide-react'

// ─── Section 1: How It Works ───────────────────────────────────────────────

const steps = [
  {
    icon: Upload,
    step: '01',
    title: 'Upload Your Image',
    desc: 'Drop your image into the tool or click to browse. Supports PNG, JPEG, WebP, GIF, and BMP.',
  },
  {
    icon: SlidersHorizontal,
    step: '02',
    title: 'Choose Your Options',
    desc: 'Resize by custom dimensions or percentage, crop with preset ratios, convert formats, or compress file size.',
  },
  {
    icon: Download,
    step: '03',
    title: 'Preview and Download',
    desc: 'Preview the result, then download it with one click. No account needed.',
  },
]

// ─── Section 2: Key Features ───────────────────────────────────────────────

const features = [
  {
    icon: Maximize2,
    title: 'Image Resizing',
    desc: 'Resize by custom size or by percentage',
  },
  {
    icon: Crop,
    title: 'Smart Cropping',
    desc: 'Crop images with preset aspect ratios like 1:1, 16:9, 4:3',
  },
  {
    icon: FileImage,
    title: 'Format Conversion',
    desc: 'Convert images to PNG, JPEG or WebP; GIF output is limited by browser canvas support',
  },
  {
    icon: Minimize2,
    title: 'Image Compression',
    desc: 'Reduce file size and compare the result with your original',
  },
  {
    icon: LayoutGrid,
    title: 'Social Media Presets',
    desc: 'Resize images for Instagram, Twitter, and other platforms',
  },
  {
    icon: Lock,
    title: 'Browser-Based Processing',
    desc: 'Runs in your browser, so your files stay on your device',
  },
]

// ─── Section 3: Benefits ──────────────────────────────────────────────────

const benefits = [
  { icon: Gauge, text: 'Smaller files help pages load faster' },
  { icon: CheckCircle2, text: 'Right-sized images fit your layout and your social posts' },
  { icon: SlidersHorizontal, text: 'One tool for resizing, cropping, converting and compressing' },
  { icon: Monitor, text: 'No software installation required' },
  { icon: LayoutGrid, text: 'Works in modern browsers with image support' },
]

const faqs = [
  {
    "q": "What does the Ai Ranko image resizer do?",
    "a": "It lets you resize, crop, convert and compress an image in one place. Upload a PNG, JPEG, WebP, GIF or BMP file, choose your options, then download the result. It's a free tool and you don't need an account."
  },
  {
    "q": "How do I resize an image to exact dimensions?",
    "a": "Upload your image, choose the resize option and enter the width and height you need in pixels. With the aspect-ratio lock on, changing one dimension adjusts the other. Crop to the shape you need first, or unlock the ratio to set both dimensions independently; this can stretch the image. Check the preview, then download the resized file. You can also resize by percentage."
  },
  {
    "q": "Can I resize an image by percentage?",
    "a": "Yes. Instead of entering pixel dimensions you can scale the image by a percentage, for example to halve it for a thumbnail. Percentage resizing keeps the proportions of the original image, or of your completed crop if you have cropped it."
  },
  {
    "q": "Which image formats can I upload and convert to?",
    "a": "You can open PNG, JPEG, WebP, GIF and BMP files that your browser can decode. PNG, JPEG and WebP output use your browser's canvas encoder. A GIF option is shown, but the tool has no GIF encoder: an unsupported GIF export falls back to PNG data even if its filename ends in .gif. Animated GIFs are processed as a still image, not preserved as an animation. Use PNG, JPEG or WebP for the output."
  },
  {
    "q": "Are my images uploaded to a server?",
    "a": "The resizer is built to process images in your browser, so the file is not sent to our servers to be resized. Your browser still needs the page itself to load, and the file only stays on your device. Read our privacy policy for how the site handles data in general."
  },
  {
    "q": "Should I use JPEG, PNG or WebP?",
    "a": "JPEG suits photos and keeps file sizes small. PNG suits logos, screenshots and images that need a transparent background. WebP is a modern format that can give smaller files than JPEG or PNG and is supported by current browsers. GIF is mainly useful for simple animation."
  },
  {
    "q": "Does compressing an image reduce its quality?",
    "a": "It can. The quality control applies to JPEG and WebP, where lower quality can remove detail to make the file smaller. It does not apply to PNG. Compare the result with the original before you download it, and keep the original file in case you need it again. A smaller file is not guaranteed for every image or setting."
  },
  {
    "q": "How do I resize an image for social media?",
    "a": "Use the social media presets to start from a common size for platforms such as Instagram, Twitter and LinkedIn. Platforms change their recommended dimensions from time to time, so check the platform's current guidance if the exact size matters."
  },
  {
    "q": "Can resizing images help my website's SEO?",
    "a": "It can help indirectly. Large image files slow pages down, and Google measures loading performance, including the Largest Contentful Paint metric, as part of the page experience (see Google's guide to optimising LCP). Resizing is not a ranking shortcut: descriptive file names, alt text and useful content still matter, as Google's image best practices explain."
  },
  {
    "q": "Can I resize many images at once?",
    "a": "Yes. Use the bulk image resizer to process several images in one go, and read our guide on how to bulk resize images for the steps."
  }
]

export default function ImageResizerSeoSections() {
  return (
    <div className="border-t border-border bg-background">

      {/* ── Section 1: How It Works ── */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="font-heading text-2xl font-bold text-foreground text-balance sm:text-3xl">
              How It Works
            </h2>
            <p className="mt-2 text-muted-foreground text-pretty">
              Three simple steps to resize, crop, convert or compress any image.
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

      {/* ── Section 2: Key Features ── */}
      <section className="border-t border-border bg-card px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="font-heading text-2xl font-bold text-foreground text-balance sm:text-3xl">
              Key Features
            </h2>
            <p className="mt-2 text-muted-foreground text-pretty">
              Everything you need to prepare images for the web, social media, and beyond.
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

<section className="border-t border-border bg-card px-4 py-16 sm:px-6 lg:px-8"><div className="mx-auto max-w-5xl">
<h2 className="font-heading text-2xl font-bold text-foreground text-balance sm:text-3xl">{"How to Resize an Image Online"}</h2>
<ol className="mt-5 flex flex-col gap-4 list-decimal pl-6 text-sm leading-relaxed text-muted-foreground">
<li><strong className="text-foreground">{"Upload your image."}</strong>{" Drop it in, paste it with Ctrl/Cmd + V, or click to browse. PNG, JPEG, WebP, GIF and BMP files are supported."}</li>
<li><strong className="text-foreground">{"Choose how to resize."}</strong>{" Enter a width and height in pixels, or scale the image by a percentage. The aspect-ratio lock adjusts the other dimension when you change one; unlock it only if you want independent dimensions. Use the crop presets (1:1, 16:9, 4:3) if the image has to fit a particular shape."}</li>
<li><strong className="text-foreground">{"Pick a format and compress."}</strong>{" Convert to PNG, JPEG or WebP, and adjust JPEG or WebP quality if the image will go on a web page or in an email."}</li>
<li><strong className="text-foreground">{"Preview and download."}</strong>{" Compare the result with your original, then download it. No account is needed."}</li>
</ol>
</div></section>
<section className="border-t border-border bg-card px-4 py-16 sm:px-6 lg:px-8"><div className="mx-auto max-w-5xl">
<h2 className="font-heading text-2xl font-bold text-foreground text-balance sm:text-3xl">{"Which Image Format Should You Choose?"}</h2>
<ul className="mt-5 flex flex-col gap-4 list-disc pl-6 text-sm leading-relaxed text-muted-foreground">
<li><strong className="text-foreground">{"JPEG:"}</strong>{" best for photographs. Files stay small, but the compression is lossy, so heavy compression can soften detail."}</li>
<li><strong className="text-foreground">{"PNG:"}</strong>{" best for logos, screenshots, icons and images with a transparent background. Files are usually larger than JPEG."}</li>
<li><strong className="text-foreground">{"WebP:"}</strong>{" a modern format that can produce smaller files than JPEG or PNG and supports transparency. It works in current browsers."}</li>
<li><strong className="text-foreground">{"GIF:"}</strong>{" mainly for simple animations and very small graphics."}</li>
</ul>
<p className="mt-5 text-sm leading-relaxed text-muted-foreground">{"Not sure? Convert a copy to WebP and a copy to JPEG, then compare the size and quality before you choose. For a deeper explanation see MDN's "}<Link href="https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types" target="_blank" rel="noopener" className="text-primary hover:underline">{"image file type guide"}</Link>{"."}</p>
<p className="mt-5 text-sm leading-relaxed text-muted-foreground">{"This tool uses canvas to create a still image. It does not preserve GIF animation. Although a GIF output option is shown, unsupported GIF encoding falls back to PNG data; a .gif filename does not prove the file is a GIF. Choose PNG, JPEG or WebP for the output."}</p>
<p className="mt-5 text-sm leading-relaxed text-muted-foreground">{"There is no fixed file-size limit in the tool code. The file must be an image your browser can decode, and large images may exceed your device’s available memory. The file picker accepts image types generally; PNG, JPEG, WebP, GIF and BMP are examples, not a guarantee for every image file."}</p>
<p className="mt-5 text-sm leading-relaxed text-muted-foreground">{"The quality slider is available for JPEG and WebP. PNG does not use that control. Keep the original and compare the output size as well as the appearance: changing dimensions, format or quality does not always produce a smaller file."}</p>
</div></section>
      {/* ── Section 3: Benefits ── */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="font-heading text-2xl font-bold text-foreground text-balance sm:text-3xl">
                Why Optimised Images Matter
              </h2>
              <p className="mt-3 text-muted-foreground leading-relaxed text-pretty">
                Properly sized and compressed images are an easy way to make pages load faster. Preview the result before downloading.
              </p>
            </div>
            <ul className="flex flex-col gap-3">
              {benefits.map((b) => {
                const Icon = b.icon
                return (
                  <li
                    key={b.text}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </span>
                    <span className="text-sm font-medium text-foreground">{b.text}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </section>

<section className="border-t border-border bg-card px-4 py-16 sm:px-6 lg:px-8"><div className="mx-auto max-w-5xl">
<h2 className="font-heading text-2xl font-bold text-foreground text-balance sm:text-3xl">{"Resizing Images for Faster Web Pages"}</h2>
<p className="mt-5 text-sm leading-relaxed text-muted-foreground">{"Large image files are one of the common reasons a page loads slowly, and loading speed is part of the page experience that Google measures. Resizing an image to the size it's actually displayed at, then compressing it, can reduce the file size; check the result for changes in appearance. Resizing alone won't make a page rank: descriptive file names, alt text and useful content still matter, as Google's "}<Link href="https://developers.google.com/search/docs/appearance/google-images" target="_blank" rel="noopener" className="text-primary hover:underline">{"image best practices"}</Link>{" explain, and "}<Link href="https://web.dev/learn/images" target="_blank" rel="noopener" className="text-primary hover:underline">{"web.dev's image guide"}</Link>{" covers how to serve images well."}</p>
</div></section>
<section className="border-t border-border bg-card px-4 py-16 sm:px-6 lg:px-8"><div className="mx-auto max-w-5xl">
<h2 className="font-heading text-2xl font-bold text-foreground text-balance sm:text-3xl">{"Resize Images for Social Media and Several Images at Once"}</h2>
<p className="mt-5 text-sm leading-relaxed text-muted-foreground">{"Use the social media presets to start from a common size for platforms such as Instagram, Twitter and LinkedIn, then adjust the crop. Platforms change their recommended dimensions from time to time, so check their current guidance if an exact size is required. If you have a whole folder to process, try the "}<Link href="/tools/bulk-image-resizer" className="text-primary hover:underline">{"bulk image resizer"}</Link>{", or read our guide on "}<Link href="/blog/how-to-bulk-resize-images" className="text-primary hover:underline">{"how to bulk resize images"}</Link>{". Need to crop a photo for a design? See our list of the "}<Link href="/blog/top-10-free-photo-cropping-tools" className="text-primary hover:underline">{"top free photo cropping tools"}</Link>{"."}</p>
<p className="mt-5 text-sm leading-relaxed text-muted-foreground">{"The presets set output dimensions; they do not automatically crop your subject to fit. Make a crop selection if you need a different shape, then review the preview for stretching or unwanted edges. Instagram, Twitter, Facebook, LinkedIn and YouTube presets are present, alongside general sizes such as HD and an Open Graph image."}</p>
</div></section>
<section id="faq" className="border-t border-border bg-card px-4 py-16 sm:px-6 lg:px-8"><div className="mx-auto max-w-5xl">
<h2 className="font-heading text-2xl font-bold text-foreground text-balance sm:text-3xl">Image Resizer FAQs</h2><div className="mt-5 space-y-3">
<details className="group rounded-2xl border border-border bg-card"><summary className="cursor-pointer px-5 py-4 font-heading text-sm font-semibold text-foreground"><h3>{"What does the Ai Ranko image resizer do?"}</h3></summary><p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{"It lets you resize, crop, convert and compress an image in one place. Upload a PNG, JPEG, WebP, GIF or BMP file, choose your options, then download the result. It's a free tool and you don't need an account."}</p></details>
<details className="group rounded-2xl border border-border bg-card"><summary className="cursor-pointer px-5 py-4 font-heading text-sm font-semibold text-foreground"><h3>{"How do I resize an image to exact dimensions?"}</h3></summary><p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{"Upload your image, choose the resize option and enter the width and height you need in pixels. With the aspect-ratio lock on, changing one dimension adjusts the other. Crop to the shape you need first, or unlock the ratio to set both dimensions independently; this can stretch the image. Check the preview, then download the resized file. You can also resize by percentage."}</p></details>
<details className="group rounded-2xl border border-border bg-card"><summary className="cursor-pointer px-5 py-4 font-heading text-sm font-semibold text-foreground"><h3>{"Can I resize an image by percentage?"}</h3></summary><p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{"Yes. Instead of entering pixel dimensions you can scale the image by a percentage, for example to halve it for a thumbnail. Percentage resizing keeps the proportions of the original image, or of your completed crop if you have cropped it."}</p></details>
<details className="group rounded-2xl border border-border bg-card"><summary className="cursor-pointer px-5 py-4 font-heading text-sm font-semibold text-foreground"><h3>{"Which image formats can I upload and convert to?"}</h3></summary><p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{"You can open PNG, JPEG, WebP, GIF and BMP files that your browser can decode. PNG, JPEG and WebP output use your browser's canvas encoder. A GIF option is shown, but the tool has no GIF encoder: an unsupported GIF export falls back to PNG data even if its filename ends in .gif. Animated GIFs are processed as a still image, not preserved as an animation. Use PNG, JPEG or WebP for the output."}</p></details>
<details className="group rounded-2xl border border-border bg-card"><summary className="cursor-pointer px-5 py-4 font-heading text-sm font-semibold text-foreground"><h3>{"Are my images uploaded to a server?"}</h3></summary><p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{"The resizer is built to process images in your browser, so the file is not sent to our servers to be resized. Your browser still needs the page itself to load, and the file only stays on your device. Read our "}<Link href="/privacy-policy" className="text-primary hover:underline">{"privacy policy"}</Link>{" for how the site handles data in general."}</p></details>
<details className="group rounded-2xl border border-border bg-card"><summary className="cursor-pointer px-5 py-4 font-heading text-sm font-semibold text-foreground"><h3>{"Should I use JPEG, PNG or WebP?"}</h3></summary><p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{"JPEG suits photos and keeps file sizes small. PNG suits logos, screenshots and images that need a transparent background. WebP is a modern format that can give smaller files than JPEG or PNG and is supported by current browsers. GIF is mainly useful for simple animation."}</p></details>
<details className="group rounded-2xl border border-border bg-card"><summary className="cursor-pointer px-5 py-4 font-heading text-sm font-semibold text-foreground"><h3>{"Does compressing an image reduce its quality?"}</h3></summary><p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{"It can. The quality control applies to JPEG and WebP, where lower quality can remove detail to make the file smaller. It does not apply to PNG. Compare the result with the original before you download it, and keep the original file in case you need it again. A smaller file is not guaranteed for every image or setting."}</p></details>
<details className="group rounded-2xl border border-border bg-card"><summary className="cursor-pointer px-5 py-4 font-heading text-sm font-semibold text-foreground"><h3>{"How do I resize an image for social media?"}</h3></summary><p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{"Use the social media presets to start from a common size for platforms such as Instagram, Twitter and LinkedIn. Platforms change their recommended dimensions from time to time, so check the platform's current guidance if the exact size matters."}</p></details>
<details className="group rounded-2xl border border-border bg-card"><summary className="cursor-pointer px-5 py-4 font-heading text-sm font-semibold text-foreground"><h3>{"Can resizing images help my website's SEO?"}</h3></summary><p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{"It can help indirectly. Large image files slow pages down, and Google measures loading performance, including the Largest Contentful Paint metric, as part of the page experience (see "}<Link href="https://web.dev/articles/optimize-lcp" target="_blank" rel="noopener" className="text-primary hover:underline">{"Google's guide to optimising LCP"}</Link>{"). Resizing is not a ranking shortcut: descriptive file names, alt text and useful content still matter, as Google's "}<Link href="https://developers.google.com/search/docs/appearance/google-images" target="_blank" rel="noopener" className="text-primary hover:underline">{"image best practices"}</Link>{" explain."}</p></details>
<details className="group rounded-2xl border border-border bg-card"><summary className="cursor-pointer px-5 py-4 font-heading text-sm font-semibold text-foreground"><h3>{"Can I resize many images at once?"}</h3></summary><p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{"Yes. Use the "}<Link href="/tools/bulk-image-resizer" className="text-primary hover:underline">{"bulk image resizer"}</Link>{" to process several images in one go, and read our guide on "}<Link href="/blog/how-to-bulk-resize-images" className="text-primary hover:underline">{"how to bulk resize images"}</Link>{" for the steps."}</p></details>
</div></div></section>
      {/* ── Section 5: SEO Content Block ── */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-heading text-2xl font-bold text-foreground text-balance sm:text-3xl">
            The Easiest Way to Resize, Crop &amp; Convert Images Online
          </h2>
          <div className="mt-5 flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground">
<p>{"Whether you need an "}<strong className="text-foreground">{"image resizer online"}</strong>{" for a blog post, want to "}<strong className="text-foreground">{"crop image online"}</strong>{" to fit a layout, "}<strong className="text-foreground">{"convert image to WebP"}</strong>{" or "}<strong className="text-foreground">{"compress image online"}</strong>{" before uploading it to your CMS or shop, you can do it here in one place."}</p>
<p>{"Smaller files help pages load faster, and the presets help you "}<strong className="text-foreground">{"resize image for social media"}</strong>{" without looking up dimensions each time. Check current platform guidance if an exact size is required."}</p>
<p>{"The tool runs in your browser and you don't need an account."}</p>
          </div>
        </div>
      </section>

    </div>
  )
}
