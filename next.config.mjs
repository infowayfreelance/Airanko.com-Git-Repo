import path from 'path'
import fs from 'fs'
import { createRequire } from 'module'

/** @type {import('next').NextConfig} */

// pnpm installs every package under a version-suffixed real directory in
// `node_modules/.pnpm/...` and only exposes it at its plain top-level name
// (`node_modules/@sparticuz/chromium`) via a symlink. Globbing through that
// symlink (as a naive `./node_modules/@sparticuz/chromium/bin/**` include
// does) makes Next's file tracer record the SAME binary content at both the
// symlink's logical path and its resolved real path as two separate entries
// — and for @ffmpeg-installer/ffmpeg specifically, its own package.json
// optionalDependency on a platform sub-package caused a THIRD copy on top
// of that. Duplicated across ~65MB (Chromium) and ~68MB (ffmpeg) binaries,
// that pushed the deployed function to 331MB, over Vercel's 250MB limit.
// Resolving via require.resolve() (same algorithm Node itself uses at
// runtime) always returns the one real, symlink-free path, so pointing
// outputFileTracingIncludes there instead includes each binary exactly
// once.
const require = createRequire(import.meta.url)
function relGlob(absDir, sub) {
  return './' + path.join(path.relative(process.cwd(), absDir), sub).split(path.sep).join('/')
}

// pnpm only installs @ffmpeg-installer's platform sub-packages that match
// the machine actually running `pnpm install` (they're marked with
// os/cpu constraints in the lockfile) — @ffmpeg-installer/linux-x64 simply
// isn't present on, say, a contributor's Mac. Since this whole
// portfolioRecorderTracing block only matters for Vercel's own build
// (always linux x64) and would otherwise crash `next dev`/`next build`
// with ENOENT anywhere else, it's computed defensively and just omitted
// when the expected packages aren't there.
let portfolioRecorderTracing = null
try {
  // @sparticuz/chromium restricts subpath access via "exports", so its own
  // package.json can't be resolved directly (ERR_PACKAGE_PATH_NOT_EXPORTED)
  // — resolve its main entry point instead and walk up out of build/.
  const chromiumRealDir = path.dirname(path.dirname(require.resolve('@sparticuz/chromium')))
  // @ffmpeg-installer/ffmpeg picks its platform binary at runtime via
  // `path.resolve(__dirname, '..', platform)` (see its index.js) — mirror
  // that exact computation here, from the SAME real (symlink-resolved)
  // directory Node will use for `__dirname` at runtime, so this points at
  // definitely the one directory the wrapper will actually look in first.
  const ffmpegRealDir = path.join(path.dirname(require.resolve('@ffmpeg-installer/ffmpeg')), '..', 'linux-x64')
  // ffmpegRealDir above is itself one more symlink hop from pnpm's actual
  // canonical content-store copy of @ffmpeg-installer/linux-x64. Since
  // @ffmpeg-installer/ffmpeg's own package.json declares linux-x64 as an
  // optionalDependency, Next's default tracing discovers that canonical
  // copy on its own (independent of the include above), reintroducing the
  // same duplicate-binary bloat this whole file exists to avoid. Excluding
  // it here is safe: ffmpegRealDir (kept above) is a complete,
  // self-contained real file once traced — it doesn't depend on this
  // canonical copy being present too.
  const ffmpegCanonicalDupeDir = fs.realpathSync(ffmpegRealDir)
  portfolioRecorderTracing = {
    includes: [relGlob(chromiumRealDir, 'bin/**'), relGlob(ffmpegRealDir, '**')],
    excludes: [relGlob(ffmpegCanonicalDupeDir, '**')],
  }
} catch {
  // Expected on a machine that doesn't have the linux-x64 ffmpeg binary
  // installed (see comment above) — the portfolio recorder's render route
  // wouldn't be able to launch Chromium/ffmpeg there either way.
}

// ── Security headers ────────────────────────────────────────────────────────
//
// Applied to every response.  Notes on the CSP choices:
//
// • script-src 'unsafe-inline'  — Next.js App Router injects __NEXT_DATA__ and
//   other inline bootstrap scripts at runtime; removing this breaks hydration.
//   Stricter alternative: nonce-based CSP via Next.js middleware (see Next.js docs).
//
// • script-src 'unsafe-eval'    — @huggingface/transformers + ONNX Runtime (used
//   by the Background Remover) call eval() / new Function() internally for WASM
//   compilation.  Use 'wasm-unsafe-eval' instead once ONNX supports CSP3 fully.
//
// • style-src 'unsafe-inline'   — Tailwind and Next.js inject inline styles;
//   needed until the project migrates to CSS Modules or a hash-based approach.
//
// • font-src 'self'             — next/font/google downloads Inter & Space Grotesk
//   at build time and serves them from /_next/static/; no runtime Google CDN call.
//
// • frame-src *                 — The Mobile Friendliness Checker embeds arbitrary
//   third-party URLs in an <iframe>.  Restricting this would break that tool.
//   frame-ancestors 'self' (below) still prevents THIS site from being framed.
//
// • huggingface.co *.huggingface.co *.xethub.hf.co *.cdn.hf.co — Background
//   Remover and AI Image Upscaler fetch model config/weights from the
//   HuggingFace Hub on first use. Model URLs
//   (https://huggingface.co/<org>/<model>/resolve/main/...) hit the bare
//   apex domain, not a subdomain — `*.huggingface.co` alone does NOT match
//   the apex in CSP source matching, so both the apex and the wildcard are
//   listed here. Large model weights are additionally served through
//   HuggingFace's Xet storage backend, which redirects the /resolve/
//   request to one of two separate domain families depending on the
//   backing region/CDN: cas-bridge.xethub.hf.co (xethub.hf.co subdomain)
//   and, for the CDN-fronted path, hosts like us.aws.cdn.hf.co (cdn.hf.co
//   subdomain) — both are allow-listed via subdomain wildcards. Neither
//   wildcard's apex (xethub.hf.co / cdn.hf.co) is used directly, so only
//   the subdomain forms are listed, not the bare apexes.
//
// • cdn.jsdelivr.net             — onnxruntime-web (used by the Background
//   Remover and AI Image Upscaler) dynamically imports its WASM runtime
//   module (ort-wasm-simd-threaded.asyncify.mjs) and the matching .wasm
//   binary from jsDelivr at runtime instead of bundling them. The module
//   import is a script fetch (needs script-src), and the .wasm binary
//   fetch inside it is a connect fetch (needs connect-src) — both are
//   required or the runtime falls back to "no available backend found".
//
// • script-src blob:            — after fetching that jsDelivr module,
//   onnxruntime-web wraps it in a `blob:` URL and loads/executes it from
//   there (`Loading the script 'blob:https://...'`) rather than executing
//   the jsDelivr response directly. worker-src already allows blob: below
//   for any Worker it spins up from the same blob URL; script-src needs
//   the same allowance for the non-worker script-load path.
//
// • vitals.vercel-insights.com  — Vercel Analytics beacon endpoint.
//
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' cdn.jsdelivr.net blob:",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  "img-src 'self' data: blob: hebbkx1anhila5yf.public.blob.vercel-storage.com",
  "connect-src 'self' vitals.vercel-insights.com huggingface.co *.huggingface.co *.xethub.hf.co *.cdn.hf.co cdn.jsdelivr.net",
  "worker-src 'self' blob:",
  "frame-src *",
  "media-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join('; ')

const securityHeaders = [
  // Prevents browsers from MIME-sniffing a response away from the declared content-type.
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Stops this site from being embedded in a <frame>/<iframe> on other origins (clickjacking).
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // Controls how much referrer info is included in requests: full URL on same-origin,
  // origin only on cross-origin HTTPS, nothing on downgrade to HTTP.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Fine-grained allow-list for every browser capability this site actually uses.
  { key: 'Content-Security-Policy', value: CSP },
]

// ── Portfolio Recorder CSP override ─────────────────────────────────────────
//
// The recorder loads an arbitrary third-party site into a same-origin
// iframe via `srcDoc` so it can measure/scroll it accurately (see
// components/portfolio-recorder/portfolio-recorder-tool.tsx). A `srcDoc`
// document has no HTTP response of its own, so it inherits this page's own
// CSP — the site-wide policy above only allows images/fonts/media from
// this site's own domains, which silently blocks every image (and most
// fonts/media) on whatever site is being recorded. This page is the only
// one that genuinely needs to render arbitrary third-party resources, so
// only its CSP is widened — every other page keeps the strict policy above.
const PORTFOLIO_RECORDER_CSP = [
  "default-src 'self'",
  // Widened beyond the site-wide policy: the website-cloner fetch this page
  // uses skips inlining <script type="module"> (very common for modern
  // sites' main JS bundle) and leaves it as an absolute cross-origin
  // <script src>. Under the strict site-wide script-src that gets silently
  // blocked, so the recorded site's own JS never runs at all — no
  // hydration, no lazy-loading, no interactivity — which is what "some
  // websites don't load properly" actually was.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' cdn.jsdelivr.net blob: *",
  "style-src 'self' 'unsafe-inline' * data:",
  "font-src 'self' data: blob: *",
  "img-src 'self' data: blob: *",
  "connect-src 'self' vitals.vercel-insights.com huggingface.co *.huggingface.co *.xethub.hf.co *.cdn.hf.co cdn.jsdelivr.net *",
  "worker-src 'self' blob:",
  "frame-src *",
  "media-src 'self' blob: data: *",
  "object-src 'none'",
  // The recorded page's own <base href="..."> tag (injected by the
  // website-cloner fetch as a fallback for any relative URL its regex
  // rewriter doesn't catch) needs an arbitrary origin allowed here, or the
  // browser silently refuses to apply it and those URLs resolve against
  // this site's own origin instead.
  "base-uri *",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join('; ')

const portfolioRecorderHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Content-Security-Policy', value: PORTFOLIO_RECORDER_CSP },
]

// ── CORS headers for API routes ─────────────────────────────────────────────
//
// Only the production origin is allowed to call the API cross-origin.
// The scanner was flagging the *absence* of an explicit allow-list; Next.js
// doesn't ship wildcard CORS by default but without these headers a scanner
// treats the absence as a misconfiguration.
//
const corsHeaders = [
  { key: 'Access-Control-Allow-Origin',  value: 'https://airanko.com' },
  { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS' },
  { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
]

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // The Portfolio Recorder's server-render route launches headless Chromium
  // (@sparticuz/chromium + puppeteer-core) and shells out to a bundled ffmpeg
  // binary (@ffmpeg-installer/ffmpeg). Both ship native binaries that must be
  // copied as-is into the serverless function bundle rather than processed by
  // webpack, which corrupts them.
  serverExternalPackages: [
    'puppeteer-core',
    '@sparticuz/chromium',
    '@ffmpeg-installer/ffmpeg',
    'fluent-ffmpeg',
  ],
  // serverExternalPackages only stops webpack from bundling/corrupting
  // these packages' JS — it does NOT make Next.js's output file tracing
  // (which decides which files actually get copied into the deployed
  // function) aware of their binary payloads. @sparticuz/chromium resolves
  // its bin/ files via a runtime path.join() the tracer can't follow, so
  // without an explicit include the deployed function is missing that
  // directory entirely ("input directory ... does not exist") even though
  // it works locally where the full node_modules tree just sits on disk.
  // See the portfolioRecorderTracing comment above for why these are
  // resolved paths rather than a glob through the top-level symlink, and
  // why the whole block can be null on a non-linux-x64 machine.
  ...(portfolioRecorderTracing && {
    outputFileTracingIncludes: {
      '/api/portfolio-recorder/render': portfolioRecorderTracing.includes,
    },
    // Removes the redundant canonical-store copy of the ffmpeg binary that
    // Next's default tracing pulls in on its own.
    outputFileTracingExcludes: {
      '/api/portfolio-recorder/render': portfolioRecorderTracing.excludes,
    },
  }),
  async headers() {
    return [
      {
        // All pages and static assets
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        // API routes — explicit CORS instead of implicit wildcard
        source: '/api/(.*)',
        headers: corsHeaders,
      },
      {
        // Overrides the general CSP above with one that allows arbitrary
        // third-party images/fonts/media — see PORTFOLIO_RECORDER_CSP.
        source: '/tools/portfolio-recorder',
        headers: portfolioRecorderHeaders,
      },
    ]
  },
  async redirects() {
    return [
      // Renamed shortly after launch to lead with "Google Pixel" wording for SEO.
      {
        source: '/tools/meta-title-description-generator',
        destination: '/tools/meta-title-description-pixel-generator',
        permanent: true,
      },
      // Renamed to lead with "meta title & description" wording for SEO consistency.
      {
        source: '/tools/meta-pixel-checker',
        destination: '/tools/meta-title-description-bulk-pixel-checker',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
