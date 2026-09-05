/** @type {import('next').NextConfig} */

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
