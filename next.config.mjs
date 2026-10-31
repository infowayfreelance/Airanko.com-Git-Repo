// ── Security headers ────────────────────────────────────────────────────────
//
// Applied to every response.  Notes on the CSP choices:
//
// • script-src 'unsafe-inline'  — Next.js App Router injects __NEXT_DATA__ and
//   other inline bootstrap scripts at runtime; removing this breaks hydration.
//   Stricter alternative: nonce-based CSP via Next.js middleware (see Next.js docs).
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
// • vitals.vercel-insights.com  — Vercel Analytics beacon endpoint.
//
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  "img-src 'self' data: blob: hebbkx1anhila5yf.public.blob.vercel-storage.com",
  "connect-src 'self' vitals.vercel-insights.com",
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

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
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
