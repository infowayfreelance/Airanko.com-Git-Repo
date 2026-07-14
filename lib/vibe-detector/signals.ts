// ──────────────────────────────────────────────────────────────────────────
// Vibe Code Detector — SIGNAL REGISTRY
//
// This is the ONLY file that should ever contain detection logic. Every
// rule the tool applies — hosting, images, HTML/CSS/JS patterns, frameworks,
// packages, CMS fingerprints, content, SEO, accessibility, and so on — is
// one Signal object in the ALL_SIGNALS array below.
//
// The engine (engine.ts) loops over this array, runs each signal's
// `evaluate()` against a SignalContext, and aggregates the results into
// weighted AI / Human / CMS / Hybrid probabilities. It never special-cases
// any individual rule.
//
// TO ADD A NEW RULE: append another Signal object to ALL_SIGNALS (or to one
// of the category arrays below, which are all spread into ALL_SIGNALS at
// the bottom of this file). No other file needs to change.
//
// Every signal documents: what it looks for, how reliable it is, how it
// could misfire, what data it needs, and how it could be improved later —
// per the project's "self-documenting rule" requirement.
// ──────────────────────────────────────────────────────────────────────────

import type { Signal, SignalContext, AiImageFinding } from './types'
import { CATEGORY } from './types'
import { countMatches, uniqueMatches, extractGroup1, includesAny, filenameOf, hostnameOf } from './helpers'

// ── Shared vocabularies (used by multiple signals) ─────────────────────────

const AI_GENERATOR_NAMES = ['v0', 'vercel v0', 'bolt', 'lovable', 'cursor', 'windsurf', 'replit', 'devin', 'github copilot', 'chatgpt', 'claude', 'gpt-engineer', 'gemini', 'base44']

const SHADCN_TOKENS = [
  'text-muted-foreground', 'bg-background', 'text-foreground', 'border-border',
  'bg-card', 'text-card-foreground', 'text-primary-foreground', 'bg-muted',
  'ring-offset-background', 'bg-popover', 'text-popover-foreground',
  'bg-accent', 'text-accent-foreground', 'bg-destructive', 'text-destructive-foreground',
  'bg-secondary', 'text-secondary-foreground',
]

const STOCK_IMAGE_HOSTS = [
  'images.unsplash.com', 'source.unsplash.com', 'unsplash.com',
  'images.pexels.com', 'pexels.com', 'pixabay.com', 'cdn.pixabay.com',
  'freepik.com', 'img.freepik.com', 'istockphoto.com', 'shutterstock.com',
  'picsum.photos', 'loremflickr.com', 'dummyimage.com', 'placekitten.com',
  'placehold.co', 'via.placeholder.com', 'placeholder.com',
]

const OWN_ASSET_CDN_HOSTS = ['cloudinary.com', 'res.cloudinary.com', 'imagekit.io', 'imgix.net', 'b-cdn.net', 'bunnycdn.com']

const AI_IMAGE_TOOL_KEYWORDS: { pattern: RegExp; tool: string }[] = [
  { pattern: /dall[\s-]?e/i, tool: 'DALL·E / OpenAI' },
  { pattern: /gpt[\s-]?image/i, tool: 'GPT Image / OpenAI' },
  { pattern: /\bopenai\b/i, tool: 'OpenAI' },
  { pattern: /midjourney/i, tool: 'Midjourney' },
  { pattern: /stable[\s-]?diffusion/i, tool: 'Stable Diffusion' },
  { pattern: /stability\.?ai/i, tool: 'Stability AI' },
  { pattern: /\bflux\.1\b|\bflux[\s-]?dev\b|\bflux[\s-]?schnell\b/i, tool: 'FLUX' },
  { pattern: /adobe firefly|\bfirefly\b/i, tool: 'Adobe Firefly' },
  { pattern: /ideogram/i, tool: 'Ideogram' },
  { pattern: /leonardo\.?ai/i, tool: 'Leonardo AI' },
  { pattern: /dreamstudio/i, tool: 'DreamStudio' },
  { pattern: /\bimagen\b/i, tool: 'Google Imagen' },
  { pattern: /gemini/i, tool: 'Google Gemini' },
  { pattern: /\breve\b/i, tool: 'Reve' },
  { pattern: /nightcafe/i, tool: 'NightCafe' },
  { pattern: /playground ?ai/i, tool: 'Playground AI' },
  { pattern: /craiyon/i, tool: 'Craiyon' },
]

const AI_MARKETING_BUZZWORDS = [
  'seamless', 'scalable', 'robust', 'cutting-edge', 'innovative', 'leverage',
  'synergy', 'comprehensive', 'streamlined', 'holistic', 'empower', 'transformative',
  'revolutionize', 'revolutionary', 'bespoke', 'best-in-class', 'world-class',
  'game-changing', 'next-level', 'state-of-the-art', 'actionable', 'utilize',
  'elevate', 'supercharge', 'unlock your potential', 'reimagine', 'delve', 'fostering',
  'pivotal', 'harness', 'tailor-made', 'data-driven', 'frictionless', 'user-centric',
  'paradigm', 'disruptive', 'powerful solutions', 'modern solutions', 'trusted partner',
]

const AI_FILLER_PHRASES = [
  'transform your business', 'take your business to the next level', 'everything you need',
  'all in one place', 'we are committed to', 'our team of experts', 'one-stop solution',
  'we pride ourselves', 'dedicated to excellence', 'tailored to your needs', 'results-driven',
  'client-focused', 'industry-leading', 'trusted partner', 'full-service', 'get in touch today',
  'start your journey', "in today's fast-paced", 'in the digital age', 'look no further',
  'at the forefront',
]

const AI_COMPONENT_NAMES = [
  'HeroSection', 'FeatureCard', 'FeaturesSection', 'PricingCard', 'PricingSection',
  'TestimonialCard', 'TestimonialsSection', 'CTASection', 'CallToAction', 'FAQSection',
  'Navbar', 'Footer', 'WhyChooseUs', 'AboutSection', 'ContactSection', 'ServicesSection',
  'TeamSection', 'GallerySection', 'StatsSection', 'BenefitsSection',
]

// ── Helper: build a fresh SignalEvaluation quickly ──────────────────────────

function no() { return { triggered: false, evidence: [] } }

// ════════════════════════════════════════════════════════════════════════
// CATEGORY 1 — HOSTING ANALYSIS
// ════════════════════════════════════════════════════════════════════════

const hostingSignals: Signal[] = [
  {
    id: 'hosting-vercel',
    name: 'Hosted on Vercel',
    description: 'Detects Vercel hosting via response headers or hostname — Vercel is the default deploy target for Next.js and for v0/AI-scaffolded apps.',
    category: CATEGORY.HOSTING,
    weight: 20, confidence: 'high', positiveScore: 20, negativeScore: 0,
    implementationMethod: 'Response header check: x-vercel-id / x-vercel-cache present, or server header contains "Vercel", or hostname ends with .vercel.app.',
    falsePositiveRisk: 'low', priority: 4,
    requiredData: ['headers', 'hostname'],
    supportedFrameworks: ['any'],
    exampleMatches: ['x-vercel-id: cle1::abc123', 'myapp.vercel.app'],
    exampleNonMatches: ['Hosted on shared cPanel with no Vercel headers'],
    futureImprovements: ['Distinguish Vercel Hobby vs Pro/Enterprise via response timing headers when available.'],
    voteWeights: { ai: 0.15, hybrid: 0.1 },
    evaluate: (ctx) => {
      const h = ctx.headers
      const isVercel = !!h['x-vercel-id'] || !!h['x-vercel-cache'] || (h['server'] ?? '').toLowerCase().includes('vercel') || (ctx.hostname ?? '').endsWith('.vercel.app')
      if (!isVercel) return no()
      return { triggered: true, evidence: ['Vercel hosting detected via response headers/hostname'], meta: { technology: { name: 'Vercel' } } }
    },
  },
  {
    id: 'hosting-netlify',
    name: 'Hosted on Netlify',
    description: 'Detects Netlify hosting via response headers or hostname.',
    category: CATEGORY.HOSTING,
    weight: 12, confidence: 'high', positiveScore: 15, negativeScore: 0,
    implementationMethod: 'Header check: x-nf-request-id present, server contains "Netlify", or hostname ends with .netlify.app.',
    falsePositiveRisk: 'low', priority: 3,
    requiredData: ['headers', 'hostname'], supportedFrameworks: ['any'],
    exampleMatches: ['x-nf-request-id: abc-123', 'myapp.netlify.app'],
    exampleNonMatches: ['No Netlify headers or hostname'],
    futureImprovements: ['Detect Netlify Edge Functions usage for additional confidence.'],
    voteWeights: { hybrid: 0.05 },
    evaluate: (ctx) => {
      const h = ctx.headers
      const isNetlify = !!h['x-nf-request-id'] || (h['server'] ?? '').toLowerCase().includes('netlify') || (ctx.hostname ?? '').endsWith('.netlify.app')
      if (!isNetlify) return no()
      return { triggered: true, evidence: ['Netlify hosting detected'], meta: { technology: { name: 'Netlify' } } }
    },
  },
  {
    id: 'hosting-cloudflare-pages',
    name: 'Cloudflare (Pages/CDN)',
    description: 'Detects Cloudflare as host or CDN via the cf-ray header. Informational — Cloudflare fronts everything from AI prototypes to enterprise CMS sites.',
    category: CATEGORY.HOSTING,
    weight: 5, confidence: 'high', positiveScore: 5, negativeScore: 0,
    implementationMethod: 'Header check: cf-ray present.',
    falsePositiveRisk: 'high', priority: 1,
    requiredData: ['headers'], supportedFrameworks: ['any'],
    exampleMatches: ['cf-ray: 7d1234abc-SJC'], exampleNonMatches: ['No cf-ray header'],
    futureImprovements: ['Cross-reference with Cloudflare Pages-specific headers to distinguish CDN-only from full hosting.'],
    voteWeights: {},
    evaluate: (ctx) => {
      if (!ctx.headers['cf-ray']) return no()
      return { triggered: true, evidence: ['Cloudflare CDN/hosting fingerprint (cf-ray header)'], meta: { technology: { name: 'Cloudflare' } } }
    },
  },
  {
    id: 'hosting-github-pages',
    name: 'Hosted on GitHub Pages',
    description: 'Detects GitHub Pages hosting — common for personal/developer sites and static exports, weak human-lean signal.',
    category: CATEGORY.HOSTING,
    weight: 8, confidence: 'medium', positiveScore: 15, negativeScore: 0,
    implementationMethod: 'Hostname ends with .github.io, or server header equals "GitHub.com".',
    falsePositiveRisk: 'medium', priority: 2,
    requiredData: ['hostname', 'headers'], supportedFrameworks: ['any'],
    exampleMatches: ['username.github.io'], exampleNonMatches: ['example.com on custom domain with no GH Pages headers'],
    futureImprovements: ['Detect CNAME + GH Pages combo for custom-domain GH Pages sites.'],
    voteWeights: { human: 0.1 },
    evaluate: (ctx) => {
      const isGhPages = (ctx.hostname ?? '').endsWith('.github.io') || (ctx.headers['server'] ?? '').toLowerCase() === 'github.com'
      if (!isGhPages) return no()
      return { triggered: true, evidence: ['GitHub Pages hosting detected'], meta: { technology: { name: 'GitHub Pages' } } }
    },
  },
  {
    id: 'hosting-render-railway-firebase',
    name: 'Render / Railway / Firebase hosting',
    description: 'Detects hosting on Render, Railway, or Firebase Hosting — common targets for both AI-scaffolded and hand-built full-stack apps (neutral).',
    category: CATEGORY.HOSTING,
    weight: 5, confidence: 'medium', positiveScore: 5, negativeScore: 0,
    implementationMethod: 'Hostname suffix check: .onrender.com, .up.railway.app, .web.app, .firebaseapp.com.',
    falsePositiveRisk: 'low', priority: 1,
    requiredData: ['hostname'], supportedFrameworks: ['any'],
    exampleMatches: ['myapp.onrender.com', 'myapp.web.app'], exampleNonMatches: ['example.com'],
    futureImprovements: ['Add Fly.io and Supabase Edge Functions hostname patterns.'],
    voteWeights: {},
    evaluate: (ctx) => {
      const host = ctx.hostname ?? ''
      const match = ['.onrender.com', '.up.railway.app', '.web.app', '.firebaseapp.com'].find((s) => host.endsWith(s))
      if (!match) return no()
      const name = match.includes('render') ? 'Render' : match.includes('railway') ? 'Railway' : 'Firebase Hosting'
      return { triggered: true, evidence: [`${name} hosting detected (${match})`], meta: { technology: { name } } }
    },
  },
  {
    id: 'hosting-shared-cpanel',
    name: 'Cheap shared hosting (cPanel-style)',
    description: 'Detects classic shared-hosting fingerprints (Apache/LiteSpeed + PHP powered-by header, no modern edge/CDN headers) — the hosting profile typical of budget WordPress/CMS hosts like Hostinger, GoDaddy, and Bluehost.',
    category: CATEGORY.HOSTING,
    weight: 10, confidence: 'low', positiveScore: 15, negativeScore: 0,
    implementationMethod: 'Header check: server contains apache/litespeed AND x-powered-by contains PHP, with no Vercel/Netlify/Cloudflare-Pages headers present.',
    falsePositiveRisk: 'high', priority: 2,
    requiredData: ['headers'], supportedFrameworks: ['wordpress', 'php'],
    exampleMatches: ['server: LiteSpeed + x-powered-by: PHP/8.1'], exampleNonMatches: ['server: Vercel'],
    futureImprovements: ['Maintain an IP-range/ASN lookup for Hostinger/GoDaddy/Bluehost to strengthen this beyond header guessing.'],
    voteWeights: { cms: 0.15 },
    evaluate: (ctx) => {
      const server = (ctx.headers['server'] ?? '').toLowerCase()
      const poweredBy = (ctx.headers['x-powered-by'] ?? '').toLowerCase()
      const looksShared = (server.includes('apache') || server.includes('litespeed')) && poweredBy.includes('php')
      if (!looksShared) return no()
      return { triggered: true, evidence: [`Shared-hosting fingerprint: server="${ctx.headers['server']}", x-powered-by="${ctx.headers['x-powered-by']}"`] }
    },
  },
  {
    id: 'hosting-compound-vercel-nextjs-ai',
    name: 'Vercel + Next.js + AI stack (compound)',
    description: 'When a site is hosted on Vercel, built with Next.js, AND carries AI-tool/shadcn fingerprints, the combination is strong compound evidence of a v0/AI-scaffolded deployment — Vercel is v0\'s default one-click deploy target.',
    category: CATEGORY.HOSTING,
    weight: 25, confidence: 'medium', positiveScore: 40, negativeScore: 0,
    implementationMethod: 'Compound rule: requires the hosting-vercel, framework-nextjs, and at least one ai-tool-fingerprint-* signal to have all triggered.',
    falsePositiveRisk: 'medium', priority: 5,
    requiredData: [], supportedFrameworks: ['nextjs'],
    exampleMatches: ['Vercel headers + __next root + shadcn tokens all present together'],
    exampleNonMatches: ['Vercel-hosted Next.js site with zero AI/shadcn tokens (plenty of hand-built Next.js apps deploy to Vercel)'],
    futureImprovements: ['Weight this higher once we can also confirm a v0 project ID in deployment metadata.'],
    dependsOn: ['hosting-vercel', 'framework-nextjs', 'ai-tool-v0-fingerprint', 'package-shadcn-ui'],
    voteWeights: { ai: 1 },
    evaluate: (_ctx, prior) => {
      if (!prior) return no()
      const hasVercel = prior.has('hosting-vercel')
      const hasNext = prior.has('framework-nextjs')
      const hasAiTech = prior.has('ai-tool-v0-fingerprint') || prior.has('package-shadcn-ui')
      if (!(hasVercel && hasNext && hasAiTech)) return no()
      return { triggered: true, evidence: ['Vercel hosting + Next.js + AI/shadcn stack all present together — classic v0 deployment pattern'] }
    },
  },
  {
    id: 'hosting-compound-shared-wordpress',
    name: 'Cheap shared hosting + WordPress (compound)',
    description: 'When shared-hosting fingerprints AND a confirmed WordPress build are both present, this strongly reinforces the CMS classification — this is the single most common real-world hosting profile for WordPress sites.',
    category: CATEGORY.HOSTING,
    weight: 15, confidence: 'medium', positiveScore: 25, negativeScore: 0,
    implementationMethod: 'Compound rule: requires hosting-shared-cpanel AND cms-wordpress-core-assets to have both triggered.',
    falsePositiveRisk: 'low', priority: 4,
    requiredData: [], supportedFrameworks: ['wordpress'],
    exampleMatches: ['LiteSpeed+PHP headers alongside confirmed wp-content/wp-includes assets'],
    exampleNonMatches: ['WordPress on managed Vercel-fronted hosting (WP Engine, Kinsta with modern edge)'],
    futureImprovements: ['Extend to Joomla/Drupal shared-hosting compound checks.'],
    dependsOn: ['hosting-shared-cpanel', 'cms-wordpress-core-assets'],
    voteWeights: { cms: 1 },
    evaluate: (_ctx, prior) => {
      if (!prior?.has('hosting-shared-cpanel') || !prior?.has('cms-wordpress-core-assets')) return no()
      return { triggered: true, evidence: ['Shared/budget hosting profile + confirmed WordPress build — textbook CMS hosting pattern'] }
    },
  },
]

// ════════════════════════════════════════════════════════════════════════
// CATEGORY 2 — IMAGE ANALYSIS (largest, highest-priority category)
// ════════════════════════════════════════════════════════════════════════

/** Shared image-classification pass, reused by several image signals below. */
function classifyImages(ctx: SignalContext) {
  const own: string[] = []
  const stock: string[] = []
  const ownCdn: string[] = []
  const other: string[] = []
  for (const img of ctx.images) {
    if (!img.src || img.src.startsWith('data:')) continue
    const host = hostnameOf(img.src.startsWith('/') ? `https://${ctx.hostname ?? 'example.com'}${img.src}` : img.src)
    if (!host) continue
    if (ctx.hostname && (host === ctx.hostname || host.endsWith(`.${ctx.hostname}`))) own.push(img.src)
    else if (STOCK_IMAGE_HOSTS.some((s) => host.includes(s))) stock.push(img.src)
    else if (OWN_ASSET_CDN_HOSTS.some((s) => host.includes(s))) ownCdn.push(img.src)
    else other.push(img.src)
  }
  return { own, stock, ownCdn, other, total: ctx.images.length }
}

const imageSignals: Signal[] = [
  {
    id: 'image-same-domain-hosting',
    name: 'Images hosted on the site\'s own domain',
    description: 'When nearly all images are served from the site\'s own domain (e.g. site.com/images/, /assets/, /uploads/) rather than third-party services, this is a strong signal of a mature, deliberately-built site — human-coded or CMS.',
    category: CATEGORY.IMAGES,
    weight: 30, confidence: 'high', positiveScore: 30, negativeScore: 15,
    implementationMethod: 'Classify every <img>/<Image> src by hostname; trigger when ≥70% of non-data-URI images share the page\'s own hostname (requires ≥3 images).',
    falsePositiveRisk: 'medium', priority: 6,
    requiredData: ['images', 'hostname'], supportedFrameworks: ['any'],
    exampleMatches: ['<img src="/uploads/2024/team.jpg">', '<img src="https://example.com/assets/hero.png">'],
    exampleNonMatches: ['<img src="https://images.unsplash.com/photo-123">'],
    futureImprovements: ['Weight by image byte size, not just count, since a single huge stock hero can dominate a mostly-own-hosted gallery.'],
    voteWeights: { human: 0.6, cms: 0.4 },
    suppressWeights: { ai: 0.5 },
    evaluate: (ctx) => {
      const c = classifyImages(ctx)
      if (c.total < 3) return no()
      const ratio = c.own.length / c.total
      if (ratio < 0.7) return no()
      return { triggered: true, strength: ratio, evidence: [`${c.own.length}/${c.total} images (${Math.round(ratio * 100)}%) are hosted on the site's own domain`] }
    },
  },
  {
    id: 'image-stock-hosting',
    name: 'Images loaded from stock/demo image services',
    description: 'Detects images loaded from Unsplash, Pexels, Pixabay, Freepik, or placeholder services. AI website builders overwhelmingly reach for these instead of real project photography.',
    category: CATEGORY.IMAGES,
    weight: 30, confidence: 'medium', positiveScore: 30, negativeScore: 10,
    implementationMethod: 'Classify every image src hostname against a known stock/placeholder-service list; trigger when ≥25% of images (and at least 2) come from those hosts.',
    falsePositiveRisk: 'medium', priority: 6,
    requiredData: ['images'], supportedFrameworks: ['any'],
    exampleMatches: ['<img src="https://images.unsplash.com/photo-abc">', '<img src="https://via.placeholder.com/300">'],
    exampleNonMatches: ['<img src="/images/team-photo.jpg">'],
    futureImprovements: ['Distinguish a single tasteful stock hero image (common even on real client sites) from wall-to-wall stock imagery.'],
    voteWeights: { ai: 0.7, hybrid: 0.3 },
    evaluate: (ctx) => {
      const c = classifyImages(ctx)
      if (c.total === 0) return no()
      const ratio = c.stock.length / c.total
      if (c.stock.length < 2 || ratio < 0.25) return no()
      return { triggered: true, strength: Math.min(1, ratio + 0.3), evidence: [`${c.stock.length}/${c.total} images (${Math.round(ratio * 100)}%) come from stock/placeholder services: ${Array.from(new Set(c.stock.map((s) => hostnameOf(s)))).slice(0, 3).join(', ')}`] }
    },
  },
  {
    id: 'image-own-cdn-legit',
    name: 'Legitimate own-asset CDN (Cloudinary/ImageKit/Imgix)',
    description: 'Distinguishes real CDN-hosted project assets (Cloudinary, ImageKit, Imgix, BunnyCDN configured for the site\'s own uploads) from stock imagery — this pattern is common on well-built human AND CMS sites and should NOT be treated as an AI signal.',
    category: CATEGORY.IMAGES,
    weight: 10, confidence: 'low', positiveScore: 10, negativeScore: 15,
    implementationMethod: 'Classify image hostnames against known own-asset CDN providers; trigger when ≥2 images use one consistently.',
    falsePositiveRisk: 'medium', priority: 3,
    requiredData: ['images'], supportedFrameworks: ['any'],
    exampleMatches: ['<img src="https://res.cloudinary.com/myapp/image/upload/v1/hero.jpg">'],
    exampleNonMatches: ['<img src="https://images.unsplash.com/photo-abc">'],
    futureImprovements: ['Inspect Cloudinary transformation params for site-specific upload presets vs demo-account defaults.'],
    voteWeights: {},
    suppressWeights: { ai: 0.3 },
    evaluate: (ctx) => {
      const c = classifyImages(ctx)
      if (c.ownCdn.length < 2) return no()
      return { triggered: true, evidence: [`${c.ownCdn.length} images served via a dedicated asset CDN (${Array.from(new Set(c.ownCdn.map((s) => hostnameOf(s)))).join(', ')}) — configured CDN usage, not generic stock imagery`] }
    },
  },
  {
    id: 'image-placeholder-filenames',
    name: 'Generic/placeholder image filenames',
    description: 'Detects filenames like placeholder.png, image-1.webp, hero.png, avatar-01.jpg, feature-01.png — the default output naming of scaffolding tools and AI builders that never got renamed to something meaningful.',
    category: CATEGORY.IMAGES,
    weight: 20, confidence: 'medium', positiveScore: 20, negativeScore: 0,
    implementationMethod: 'Regex match on the filename (last path segment) of every image src against a generic-name pattern list.',
    falsePositiveRisk: 'medium', priority: 4,
    requiredData: ['images'], supportedFrameworks: ['any'],
    exampleMatches: ['image-1.webp', 'placeholder.png', 'feature-01.png', 'avatar-01.jpg'],
    exampleNonMatches: ['sarah-johnson-headshot-2024.jpg'],
    futureImprovements: ['Add locale-aware generic terms (e.g. "imagen-1" for Spanish-language AI templates).'],
    voteWeights: { ai: 0.6 },
    evaluate: (ctx) => {
      const pattern = /^(placeholder|sample|demo|hero|feature|avatar|image|img|photo|banner|thumbnail|icon)[-_]?\d*\.(png|jpe?g|webp|svg|gif)$/i
      const matches = ctx.images.map((i) => filenameOf(i.src)).filter((f) => pattern.test(f))
      if (matches.length < 2) return no()
      return { triggered: true, strength: Math.min(1, matches.length / 5), evidence: [`${matches.length} images use generic/placeholder filenames: ${Array.from(new Set(matches)).slice(0, 5).join(', ')}`] }
    },
  },
  {
    id: 'image-ai-generation-forensics',
    name: 'AI-generated image detected (metadata forensics)',
    description: 'Downloads a sample of the page\'s own images and inspects their raw bytes for embedded AI-generation fingerprints: EXIF/XMP "Software"/"CreatorTool" fields, PNG tEXt "parameters" chunks (the Stable Diffusion WebUI convention), and text-embedded tool names (DALL·E, Midjourney, Firefly, etc). Reports each match explicitly, not just as a score bump.',
    category: CATEGORY.IMAGES,
    weight: 40, confidence: 'high', positiveScore: 45, negativeScore: 0,
    implementationMethod: 'Server-side fetch of up to 6 same-page images (size-capped); scan raw bytes decoded as latin1 for AI-tool keyword regexes and parse PNG tEXt/iTXt chunks for a "parameters" key (SD WebUI signature).',
    falsePositiveRisk: 'low', priority: 8,
    requiredData: ['fetchedImageSamples'], supportedFrameworks: ['any'],
    exampleMatches: ['PNG tEXt chunk: parameters="a photo of..., Steps: 20, Sampler: Euler a"', 'EXIF Software field containing "Midjourney"'],
    exampleNonMatches: ['A JPEG straight out of a phone camera with only camera-make EXIF fields'],
    futureImprovements: ['Add C2PA content-credentials manifest parsing once a lightweight parser is available; add perceptual hallmark detection (six-fingers, melted text) via a vision model.'],
    voteWeights: { ai: 1 },
    evaluate: (ctx) => {
      const findings: AiImageFinding[] = []
      for (const sample of ctx.fetchedImageSamples) {
        const evidence: string[] = []
        let toolGuess: string | null = null

        for (const chunk of sample.pngTextChunks) {
          if (/^parameters$/i.test(chunk.keyword)) {
            evidence.push(`PNG "parameters" text chunk present (Stable Diffusion WebUI signature): "${chunk.text.slice(0, 80)}${chunk.text.length > 80 ? '…' : ''}"`)
            toolGuess = toolGuess ?? 'Stable Diffusion'
          }
          if (/^(software|creatortool|author|comment|description)$/i.test(chunk.keyword)) {
            const hit = AI_IMAGE_TOOL_KEYWORDS.find((k) => k.pattern.test(chunk.text))
            if (hit) { evidence.push(`PNG "${chunk.keyword}" chunk mentions ${hit.tool}: "${chunk.text.slice(0, 60)}"`); toolGuess = toolGuess ?? hit.tool }
          }
        }

        if (!toolGuess) {
          const hit = AI_IMAGE_TOOL_KEYWORDS.find((k) => k.pattern.test(sample.latin1))
          if (hit) { evidence.push(`Embedded metadata text references ${hit.tool}`); toolGuess = hit.tool }
        }

        if (evidence.length > 0) {
          findings.push({ src: sample.url, likelyAiGenerated: true, confidence: 'high', toolGuess, evidence })
        }
      }
      if (findings.length === 0) return no()
      return {
        triggered: true,
        evidence: findings.map((f) => `${filenameOf(f.src)}: ${f.evidence[0]}`),
        meta: { aiImageFindings: findings },
      }
    },
  },
  {
    id: 'image-visible-ai-watermark',
    name: 'Visible AI watermark text near image',
    description: 'Detects visible watermark/attribution text in alt text, captions, or filenames like "Generated by ChatGPT", "Created with Gemini", "Made in Firefly", or "Generated by Midjourney".',
    category: CATEGORY.IMAGES,
    weight: 35, confidence: 'high', positiveScore: 40, negativeScore: 0,
    implementationMethod: 'Regex match on alt text and filenames against explicit "generated by / created with / made in <AI tool>" phrasing.',
    falsePositiveRisk: 'low', priority: 6,
    requiredData: ['images'], supportedFrameworks: ['any'],
    exampleMatches: ['alt="Generated by ChatGPT"', 'alt="Created with Midjourney v6"'],
    exampleNonMatches: ['alt="Team photo from our 2024 retreat"'],
    futureImprovements: ['OCR the actual image pixels to catch in-image (baked-in) watermarks the alt text doesn\'t mention.'],
    voteWeights: { ai: 1 },
    evaluate: (ctx) => {
      const pattern = /\b(?:generated by|created with|made (?:in|with))\s+(chatgpt|gemini|firefly|midjourney|dall-?e|stable diffusion|copilot|claude)/i
      const hits: string[] = []
      for (const img of ctx.images) {
        if (img.alt && pattern.test(img.alt)) hits.push(`alt="${img.alt}"`)
        const fn = filenameOf(img.src)
        if (pattern.test(fn)) hits.push(`filename="${fn}"`)
      }
      if (hits.length === 0) return no()
      return { triggered: true, evidence: hits.slice(0, 5) }
    },
  },
  {
    id: 'image-missing-alt-batch',
    name: 'Widespread missing alt text',
    description: 'When most images on the page have no alt attribute at all, that\'s an accessibility gap — informational for the report, weak signal of a rushed/prototype build (common in both quick AI scaffolds and neglected legacy sites, so kept low-weight).',
    category: CATEGORY.IMAGES,
    weight: 8, confidence: 'low', positiveScore: 10, negativeScore: 0,
    implementationMethod: 'Count images with no alt attribute at all; trigger when ≥60% (and at least 3) are missing it.',
    falsePositiveRisk: 'high', priority: 2,
    requiredData: ['images'], supportedFrameworks: ['any'],
    exampleMatches: ['<img src="/a.jpg">, <img src="/b.jpg"> with no alt=""'],
    exampleNonMatches: ['<img src="/a.jpg" alt="Product photo">'],
    futureImprovements: ['Cross-reference with decorative-image patterns (icon sprites) that legitimately omit alt.'],
    voteWeights: { hybrid: 0.1 },
    evaluate: (ctx) => {
      if (ctx.images.length < 3) return no()
      const missing = ctx.images.filter((i) => !i.hasAlt).length
      const ratio = missing / ctx.images.length
      if (ratio < 0.6) return no()
      return { triggered: true, strength: ratio, evidence: [`${missing}/${ctx.images.length} images (${Math.round(ratio * 100)}%) have no alt attribute`] }
    },
  },
]

// ════════════════════════════════════════════════════════════════════════
// CATEGORY 3 — HTML ANALYSIS
// ════════════════════════════════════════════════════════════════════════

const htmlSignals: Signal[] = [
  {
    id: 'html-excessive-div-nesting',
    name: 'Excessive div nesting depth',
    description: 'Deep <div> nesting (>10 levels) without semantic breaks often comes from generated component trees (AI-scaffolded UI libraries) or heavy page-builder output — rarely from concise hand-written markup.',
    category: CATEGORY.HTML,
    weight: 15, confidence: 'low', positiveScore: 20, negativeScore: 0,
    implementationMethod: 'Track live <div> nesting depth while scanning tag-by-tag; trigger when max depth exceeds 10.',
    falsePositiveRisk: 'high', priority: 3,
    requiredData: ['html'], supportedFrameworks: ['any'],
    exampleMatches: ['12+ levels of nested <div> wrappers around a single button'],
    exampleNonMatches: ['A 4-level nested card component'],
    futureImprovements: ['Normalize against page complexity (a dashboard naturally nests deeper than a landing page).'],
    voteWeights: { ai: 0.3, cms: 0.2 },
    evaluate: (ctx) => {
      let max = 0, cur = 0
      const tagPattern = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*?>/g
      let tm: RegExpExecArray | null
      while ((tm = tagPattern.exec(ctx.html)) !== null) {
        const tag = tm[1].toLowerCase()
        if (tag !== 'div') continue
        const isClose = tm[0].startsWith('</')
        const isSelfClose = tm[0].endsWith('/>')
        if (isClose) cur = Math.max(0, cur - 1)
        else if (!isSelfClose) { cur++; if (cur > max) max = cur }
      }
      if (max <= 10) return no()
      return { triggered: true, strength: Math.min(1, (max - 10) / 10), evidence: [`Maximum div nesting depth: ${max} levels`] }
    },
  },
  {
    id: 'html-low-semantic-usage',
    name: 'Low use of semantic HTML5 elements',
    description: 'Sites that rely almost entirely on <div>/<span> instead of <nav>, <main>, <article>, <section>, <header>, <footer> tend to be either older hand-rolled markup or generic component-library output — this rule feeds into hybrid/ai, offset by other stronger signals.',
    category: CATEGORY.HTML,
    weight: 10, confidence: 'low', positiveScore: 15, negativeScore: 0,
    implementationMethod: 'Ratio of semantic tag count to (semantic + div) count; trigger when ratio < 5% with at least 20 total block elements.',
    falsePositiveRisk: 'high', priority: 2,
    requiredData: ['html'], supportedFrameworks: ['any'],
    exampleMatches: ['200 <div> elements, 0 <nav>/<main>/<section>'],
    exampleNonMatches: ['Balanced use of <header>, <nav>, <main>, <section>, <footer>'],
    futureImprovements: ['Weight by whether ARIA landmark roles compensate for missing semantic tags.'],
    voteWeights: { hybrid: 0.15 },
    evaluate: (ctx) => {
      const semanticTags = ['nav', 'main', 'article', 'section', 'aside', 'header', 'footer']
      const semanticCount = semanticTags.reduce((s, t) => s + countMatches(ctx.html, new RegExp(`<${t}\\b`, 'gi')), 0)
      const divCount = countMatches(ctx.html, /<div\b/gi)
      const total = semanticCount + divCount
      if (total < 20) return no()
      const ratio = semanticCount / total
      if (ratio >= 0.05) return no()
      return { triggered: true, evidence: [`Only ${semanticCount} semantic tags across ${total} block elements (${Math.round(ratio * 100)}%)`] }
    },
  },
  {
    id: 'html-data-testid-scaffolding',
    name: 'data-testid attributes on most elements',
    description: 'AI code generators frequently add data-testid to every interactive element as reflexive "best practice" scaffolding, even on marketing pages with no test suite. Hand-written marketing sites almost never do this.',
    category: CATEGORY.HTML,
    weight: 20, confidence: 'medium', positiveScore: 25, negativeScore: 0,
    implementationMethod: 'Count data-testid attributes; trigger when 5 or more appear.',
    falsePositiveRisk: 'medium', priority: 4,
    requiredData: ['html'], supportedFrameworks: ['any'],
    exampleMatches: ['<button data-testid="cta-button">'], exampleNonMatches: ['A page with zero test ids'],
    futureImprovements: ['Distinguish genuinely tested apps (with an accompanying test suite in GitHub mode) from reflexive AI scaffolding.'],
    voteWeights: { ai: 0.5 },
    evaluate: (ctx) => {
      const count = countMatches(ctx.html, /\bdata-testid\s*=\s*["']/gi)
      if (count < 5) return no()
      return { triggered: true, strength: Math.min(1, count / 20), evidence: [`${count} data-testid attributes found across the page`] }
    },
  },
  {
    id: 'html-empty-scaffolding-elements',
    name: 'Empty scaffolding elements left in markup',
    description: 'Unfilled <div></div>, <p></p>, <span></span> elements suggest generated boilerplate that was never fully wired up to content — common in freshly-scaffolded AI templates.',
    category: CATEGORY.HTML,
    weight: 10, confidence: 'low', positiveScore: 15, negativeScore: 0,
    implementationMethod: 'Regex count of empty (whitespace-only) div/p/span elements; trigger when 4 or more found.',
    falsePositiveRisk: 'high', priority: 2,
    requiredData: ['html'], supportedFrameworks: ['any'],
    exampleMatches: ['<div></div><p></p>'], exampleNonMatches: ['All elements contain content'],
    futureImprovements: ['Exclude legitimate empty spacer/divider elements via class-name allowlist (e.g. "divider", "spacer").'],
    voteWeights: { ai: 0.3 },
    evaluate: (ctx) => {
      const count = countMatches(ctx.html, /<div[^>]*>\s*<\/div>/gi) + countMatches(ctx.html, /<p[^>]*>\s*<\/p>/gi) + countMatches(ctx.html, /<span[^>]*>\s*<\/span>/gi)
      if (count < 4) return no()
      return { triggered: true, evidence: [`${count} empty scaffolding elements (<div>/<p>/<span> with no content)`] }
    },
  },
]

// ════════════════════════════════════════════════════════════════════════
// CATEGORY 4 — CSS ANALYSIS
// ════════════════════════════════════════════════════════════════════════

const cssSignals: Signal[] = [
  {
    id: 'css-heavy-tailwind-utility-chains',
    name: 'Heavy Tailwind utility-class chains',
    description: 'Elements carrying 8+ utility classes at once (e.g. "flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium") are the dominant styling pattern produced by AI code generators, which write inline utilities instead of authoring stylesheets.',
    category: CATEGORY.CSS,
    weight: 25, confidence: 'medium', positiveScore: 30, negativeScore: 0,
    implementationMethod: 'Count class="..." attributes with 8 or more space-separated class tokens; trigger when such elements are a meaningful share of all classed elements.',
    falsePositiveRisk: 'medium', priority: 5,
    requiredData: ['html'], supportedFrameworks: ['tailwind'],
    exampleMatches: ['class="flex items-center justify-between gap-4 rounded-xl border bg-card px-4 py-2 text-sm"'],
    exampleNonMatches: ['class="btn btn-primary"'],
    futureImprovements: ['Separately track whether the same long chain repeats verbatim across many elements (even stronger AI signal) vs varies naturally.'],
    voteWeights: { ai: 0.6 },
    evaluate: (ctx) => {
      let heavy = 0, totalClassed = 0
      for (const m of ctx.html.matchAll(/\bclass(?:Name)?\s*=\s*["']([^"']+)["']/gi)) {
        totalClassed++
        if (m[1].split(/\s+/).filter(Boolean).length >= 8) heavy++
      }
      if (totalClassed < 10 || heavy < 5) return no()
      const ratio = heavy / totalClassed
      if (ratio < 0.15) return no()
      return { triggered: true, strength: Math.min(1, ratio * 2), evidence: [`${heavy}/${totalClassed} classed elements (${Math.round(ratio * 100)}%) carry 8+ utility classes at once`] }
    },
  },
  {
    id: 'css-human-stylesheet-architecture',
    name: 'Hand-authored CSS file architecture',
    description: 'Humans typically organize CSS into purposeful files — styles.css, main.css, theme.css, responsive.css, layout.css, component-specific stylesheets. Finding this file architecture (vs. a single generated utility build) is a real human/CMS signal.',
    category: CATEGORY.CSS,
    weight: 25, confidence: 'medium', positiveScore: 30, negativeScore: 15,
    implementationMethod: 'Regex match <link rel="stylesheet" href="..."> hrefs against conventional hand-authored stylesheet filenames (styles.css, main.css, theme.css, layout.css, responsive.css, print.css, variables.css, component-named .css files).',
    falsePositiveRisk: 'medium', priority: 5,
    requiredData: ['html'], supportedFrameworks: ['any'],
    exampleMatches: ['<link rel="stylesheet" href="/css/styles.css">', '<link rel="stylesheet" href="/theme.css">'],
    exampleNonMatches: ['Single hashed bundle: <link href="/_next/static/css/a1b2c3.css">'],
    futureImprovements: ['In GitHub mode, additionally inspect the actual CSS file tree structure and selector nesting depth.'],
    voteWeights: { human: 0.5, cms: 0.3 },
    suppressWeights: { ai: 0.3 },
    evaluate: (ctx) => {
      const hrefs = extractGroup1(ctx.html, /<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["']/gi)
        .concat(extractGroup1(ctx.html, /<link[^>]*href=["']([^"']+)["'][^>]*rel=["']stylesheet["']/gi))
      const named = Array.from(new Set(hrefs)).filter((h) => /(?:^|\/)(styles?|main|theme|layout|responsive|print|variables|typography|components?|base|reset|utilities|custom)\.css(?:\?|$)/i.test(h))
      if (named.length === 0) return no()
      return { triggered: true, evidence: [`Hand-authored stylesheet naming found: ${named.slice(0, 5).map((h) => filenameOf(h)).join(', ')}`] }
    },
  },
  {
    id: 'css-tailwind-cdn-prototype',
    name: 'Tailwind loaded via CDN script (prototype build)',
    description: 'Using the cdn.tailwindcss.com runtime compiler instead of a proper build step is the single most reliable "quick AI/chatbot artifact" signal — production hand-built or CMS sites virtually never ship this way.',
    category: CATEGORY.CSS,
    weight: 35, confidence: 'high', positiveScore: 35, negativeScore: 0,
    implementationMethod: 'Substring check for cdn.tailwindcss.com in a <script src>.',
    falsePositiveRisk: 'low', priority: 6,
    requiredData: ['html'], supportedFrameworks: ['tailwind'],
    exampleMatches: ['<script src="https://cdn.tailwindcss.com"></script>'], exampleNonMatches: ['Compiled Tailwind output in a hashed CSS bundle'],
    futureImprovements: ['None — this signal is already near-unambiguous.'],
    voteWeights: { ai: 1 },
    evaluate: (ctx) => {
      if (!ctx.htmlLower.includes('cdn.tailwindcss.com')) return no()
      return { triggered: true, evidence: ['cdn.tailwindcss.com runtime script included — prototype-style Tailwind build'], meta: { technology: { name: 'Tailwind CDN' } } }
    },
  },
  {
    id: 'css-important-overrides',
    name: '!important override density',
    description: 'Heavy reliance on !important suggests CSS specificity fights, often from generated styles layered on top of a framework default without proper cascade management.',
    category: CATEGORY.CSS,
    weight: 8, confidence: 'low', positiveScore: 15, negativeScore: 0,
    implementationMethod: 'Count !important occurrences across inline <style> blocks and provided external CSS; trigger at 5+.',
    falsePositiveRisk: 'high', priority: 2,
    requiredData: ['css'], supportedFrameworks: ['any'],
    exampleMatches: ['color: red !important;'], exampleNonMatches: ['No !important usage'],
    futureImprovements: ['Weight by ratio to total declarations rather than raw count.'],
    voteWeights: { hybrid: 0.1 },
    evaluate: (ctx) => {
      const count = countMatches(ctx.css, /!important\b/gi)
      if (count < 5) return no()
      return { triggered: true, evidence: [`${count} !important overrides found in CSS`] }
    },
  },
  {
    id: 'css-generic-numbered-variables',
    name: 'Generic numbered CSS custom properties',
    description: 'Custom properties like --color-1, --bg-2, --spacing-3 (numbered rather than semantically named) are typical of generated design-token exports rather than a human-curated design system.',
    category: CATEGORY.CSS,
    weight: 8, confidence: 'low', positiveScore: 12, negativeScore: 0,
    implementationMethod: 'Regex match CSS custom property declarations against a numbered-generic naming pattern.',
    falsePositiveRisk: 'medium', priority: 2,
    requiredData: ['css'], supportedFrameworks: ['any'],
    exampleMatches: ['--color-1: #fff;', '--bg-2: #000;'], exampleNonMatches: ['--brand-primary: #1a73e8;'],
    futureImprovements: ['Cross-reference with shadcn/ui\'s actual semantic token names to avoid double-counting legitimate design systems.'],
    voteWeights: { ai: 0.2 },
    evaluate: (ctx) => {
      const count = countMatches(ctx.css, /--(?:color|bg|background|text|font|size|space|gap|border|shadow|radius)-?\d+\b/gi)
      if (count < 3) return no()
      return { triggered: true, evidence: [`${count} generically-numbered CSS custom properties found`] }
    },
  },
]

// ════════════════════════════════════════════════════════════════════════
// CATEGORY 5 — JAVASCRIPT ANALYSIS
// ════════════════════════════════════════════════════════════════════════

const jsSignals: Signal[] = [
  {
    id: 'js-ai-explanatory-comments',
    name: 'AI-style explanatory comments',
    description: 'Comments like "// This function handles...", "// Here we...", "// Step 1:" are a strong tell of AI-authored code — chat-based coding assistants narrate their own code inline, a habit human developers rarely have.',
    category: CATEGORY.JS,
    weight: 35, confidence: 'high', positiveScore: 40, negativeScore: 0,
    implementationMethod: 'Regex match on // comments against a list of narrational AI phrasings.',
    falsePositiveRisk: 'low', priority: 7,
    requiredData: ['js'], supportedFrameworks: ['any'],
    exampleMatches: ['// This function handles form submission', '// Here we fetch the user data'],
    exampleNonMatches: ['// eslint-disable-next-line', '// see RFC 6265'],
    futureImprovements: ['Extend to block-comment /** ... */ narrational patterns and non-English equivalents.'],
    voteWeights: { ai: 1 },
    evaluate: (ctx) => {
      const count = countMatches(ctx.js, /\/\/\s*(?:this function|here we|this code|this will|this handles|this is|the following|this method|let's|now we|step \d:|first,|then,|finally,|next,)/gi)
      if (count < 2) return no()
      return { triggered: true, strength: Math.min(1, count / 8), evidence: [`${count} AI-style narrational comments found in JavaScript`] }
    },
  },
  {
    id: 'js-console-log-leftovers',
    name: 'console.log left in production code',
    description: 'Leftover console.log calls suggest code that was generated/iterated quickly and shipped without cleanup — common in fast AI-assisted iteration, but also in rushed human prototypes, so kept moderate weight.',
    category: CATEGORY.JS,
    weight: 12, confidence: 'low', positiveScore: 20, negativeScore: 0,
    implementationMethod: 'Count console.log( occurrences in combined inline+external JS; trigger at 3+.',
    falsePositiveRisk: 'high', priority: 3,
    requiredData: ['js'], supportedFrameworks: ['any'],
    exampleMatches: ['console.log(data)'], exampleNonMatches: ['No console.log calls'],
    futureImprovements: ['Distinguish debug logging left in dev builds from genuinely shipped production bundles.'],
    voteWeights: { hybrid: 0.15 },
    evaluate: (ctx) => {
      const count = countMatches(ctx.js, /\bconsole\.log\s*\(/g)
      if (count < 3) return no()
      return { triggered: true, evidence: [`${count} console.log() calls left in shipped JavaScript`] }
    },
  },
  {
    id: 'js-todo-fixme-scaffolding',
    name: 'TODO / FIXME / mock-data comments',
    description: 'TODO, FIXME, and "mock data" / "placeholder API" comments indicate unfinished scaffolding — a strong tell of an early-stage AI-generated app that hasn\'t been fully built out.',
    category: CATEGORY.JS,
    weight: 15, confidence: 'medium', positiveScore: 20, negativeScore: 0,
    implementationMethod: 'Regex match on TODO/FIXME/HACK comment markers plus "mock data"/"placeholder api"/"temporary" phrases.',
    falsePositiveRisk: 'medium', priority: 3,
    requiredData: ['js'], supportedFrameworks: ['any'],
    exampleMatches: ['// TODO: replace with real API', '// mock data for now'],
    exampleNonMatches: ['No TODO/FIXME comments'],
    futureImprovements: ['Weight TODOs referencing AI-tool names (e.g. "TODO: ask Claude to fix this") even higher.'],
    voteWeights: { ai: 0.4, hybrid: 0.3 },
    evaluate: (ctx) => {
      const todos = countMatches(ctx.js, /\/\/\s*(?:TODO|FIXME|HACK|XXX)\b/gi)
      const mocks = countMatches(ctx.js, /\b(?:mock data|placeholder api|dummy data|fake data|temporary fix|temp solution)\b/gi)
      const total = todos + mocks
      if (total < 2) return no()
      return { triggered: true, evidence: [`${todos} TODO/FIXME comments + ${mocks} mock-data/placeholder references`] }
    },
  },
  {
    id: 'js-generic-variable-names',
    name: 'Generic, non-descriptive variable names',
    description: 'Heavy use of generic names like data, result, response, item, container, wrapper is common in quickly-generated code where naming wasn\'t deliberately considered.',
    category: CATEGORY.JS,
    weight: 10, confidence: 'low', positiveScore: 15, negativeScore: 0,
    implementationMethod: 'Regex match variable/function declarations against a generic-name list.',
    falsePositiveRisk: 'high', priority: 2,
    requiredData: ['js'], supportedFrameworks: ['any'],
    exampleMatches: ['const data = await fetch(...)', 'const result = process(x)'],
    exampleNonMatches: ['const userProfile = await fetchUserProfile()'],
    futureImprovements: ['Normalize by total variable count instead of raw occurrences.'],
    voteWeights: { hybrid: 0.1 },
    evaluate: (ctx) => {
      const count = countMatches(ctx.js, /\b(?:const|let|var|function)\s+(?:data|result|response|output|item|container|wrapper|temp|val|obj|arr|info|helper|util)\b/g)
      if (count < 8) return no()
      return { triggered: true, evidence: [`${count} generically-named variables/functions found`] }
    },
  },
  {
    id: 'js-async-await-overuse',
    name: 'Async/await wrapping density',
    description: 'AI generators tend to reflexively wrap nearly every function in async/await, even ones with no asynchronous work — a stylistic tic distinct from deliberate human async design.',
    category: CATEGORY.JS,
    weight: 8, confidence: 'low', positiveScore: 12, negativeScore: 0,
    implementationMethod: 'Count async function/arrow declarations relative to total function declarations; trigger when the ratio is unusually high with a meaningful function count.',
    falsePositiveRisk: 'high', priority: 1,
    requiredData: ['js'], supportedFrameworks: ['any'],
    exampleMatches: ['const handleClick = async () => { setOpen(true) }'], exampleNonMatches: ['Sparse, deliberate async usage only around real I/O'],
    futureImprovements: ['Check whether each async function actually contains an await — true over-wrapping has none.'],
    voteWeights: { ai: 0.2 },
    evaluate: (ctx) => {
      const asyncFns = countMatches(ctx.js, /\basync\s+(?:function|\([^)]*\)\s*=>|[a-zA-Z_$][\w$]*\s*=>)/g)
      const totalFns = countMatches(ctx.js, /\bfunction\b|=>/g)
      if (totalFns < 10 || asyncFns < 6) return no()
      const ratio = asyncFns / totalFns
      if (ratio < 0.4) return no()
      return { triggered: true, evidence: [`${asyncFns}/${totalFns} functions (${Math.round(ratio * 100)}%) are async`] }
    },
  },
]

// ════════════════════════════════════════════════════════════════════════
// CATEGORY 6 — REACT ANALYSIS
// ════════════════════════════════════════════════════════════════════════

const reactSignals: Signal[] = [
  {
    id: 'react-app-router',
    name: 'Next.js App Router detected',
    description: 'Detects Next.js 13+ App Router runtime markers — the default for create-next-app since 2023 and what v0/AI scaffolds almost always target.',
    category: CATEGORY.REACT,
    weight: 10, confidence: 'high', positiveScore: 12, negativeScore: 0,
    implementationMethod: 'Substring check for "self.__next_f" (App Router streaming payload marker) in page HTML.',
    falsePositiveRisk: 'low', priority: 3,
    requiredData: ['html'], supportedFrameworks: ['nextjs'],
    exampleMatches: ['self.__next_f.push([1,"..."])'], exampleNonMatches: ['Pages Router site with no streaming payload'],
    futureImprovements: ['Distinguish Server vs Client Component boundaries from the RSC payload shape.'],
    voteWeights: {},
    evaluate: (ctx) => {
      if (!ctx.htmlLower.includes('self.__next_f')) return no()
      return { triggered: true, evidence: ['Next.js App Router streaming payload detected'], meta: { technology: { name: 'Next.js App Router' } } }
    },
  },
  {
    id: 'react-use-client-density',
    name: '"use client" directive density',
    description: 'A very high ratio of "use client" directives suggests components were generated wholesale as client components rather than deliberately split between Server/Client — typical of AI scaffolds that default everything to client-side.',
    category: CATEGORY.REACT,
    weight: 8, confidence: 'low', positiveScore: 15, negativeScore: 0,
    implementationMethod: 'Count \'use client\' directive occurrences in provided JS/TSX source (GitHub/paste mode only, where source is visible).',
    falsePositiveRisk: 'high', priority: 2,
    requiredData: ['js'], supportedFrameworks: ['nextjs'],
    exampleMatches: ["'use client'\nexport default function Page() {}"], exampleNonMatches: ['A page with no use client directives (pure Server Components)'],
    futureImprovements: ['Only meaningful in GitHub mode with real file boundaries — weight down for single-page paste mode.'],
    voteWeights: { ai: 0.2 },
    evaluate: (ctx) => {
      const count = countMatches(ctx.js, /^['"]use client['"];?/gm)
      if (count < 5) return no()
      return { triggered: true, evidence: [`${count} 'use client' directives found`] }
    },
  },
  {
    id: 'react-legacy-create-react-app',
    name: 'Create React App (legacy) runtime',
    description: 'Detects the classic react-scripts/CRA runtime — a fading but still-common human-authored SPA pattern, and notably NOT what modern AI scaffolds default to (they favor Next.js/Vite).',
    category: CATEGORY.REACT,
    weight: 10, confidence: 'medium', positiveScore: 15, negativeScore: 5,
    implementationMethod: 'Detect <div id="root"> combined with /static/js/main.[hash].js bundle naming convention (webpack CRA output).',
    falsePositiveRisk: 'medium', priority: 2,
    requiredData: ['html'], supportedFrameworks: ['react'],
    exampleMatches: ['<div id="root"></div><script src="/static/js/main.a1b2c3.js">'], exampleNonMatches: ['Next.js __next root'],
    futureImprovements: ['Detect react-scripts version from asset-manifest.json if fetchable.'],
    voteWeights: { human: 0.2 },
    evaluate: (ctx) => {
      const hasRoot = /<div\s+id=["']root["']/i.test(ctx.html)
      const hasCraBundle = /\/static\/js\/main\.[a-f0-9]+\.js/i.test(ctx.html)
      if (!hasRoot || !hasCraBundle) return no()
      return { triggered: true, evidence: ['Create React App runtime detected (/static/js/main.[hash].js bundle)'], meta: { technology: { name: 'Create React App' } } }
    },
  },
]

// ════════════════════════════════════════════════════════════════════════
// CATEGORY 7 — FRAMEWORK DETECTION
// ════════════════════════════════════════════════════════════════════════

function frameworkSignal(id: string, name: string, test: (ctx: SignalContext) => string[] | null, evidenceLabel: string, frameworks: string[]): Signal {
  return {
    id, name,
    description: `Detects the ${name} runtime via its standard client-side markup fingerprint.`,
    category: CATEGORY.FRAMEWORK,
    weight: 5, confidence: 'high', positiveScore: 5, negativeScore: 0,
    implementationMethod: evidenceLabel,
    falsePositiveRisk: 'low', priority: 2,
    requiredData: ['html'], supportedFrameworks: frameworks,
    exampleMatches: [evidenceLabel], exampleNonMatches: ['No matching runtime marker'],
    futureImprovements: ['Extract exact framework version from build manifests where available.'],
    voteWeights: {},
    evaluate: (ctx) => {
      const evidence = test(ctx)
      if (!evidence) return no()
      return { triggered: true, evidence, meta: { technology: { name } } }
    },
  }
}

const frameworkSignals: Signal[] = [
  frameworkSignal('framework-nextjs', 'Next.js', (ctx) => (ctx.htmlLower.includes('id="__next"') || ctx.htmlLower.includes('/_next/') || ctx.htmlLower.includes('self.__next_f')) ? ['__next root / _next static assets found'] : null, '__next root or /_next/ assets', ['nextjs']),
  frameworkSignal('framework-nuxt', 'Nuxt', (ctx) => ctx.htmlLower.includes('__nuxt') ? ['__nuxt root element found'] : null, '__nuxt root element', ['nuxt']),
  frameworkSignal('framework-astro', 'Astro', (ctx) => ctx.htmlLower.includes('astro-island') ? ['astro-island custom elements found'] : null, 'astro-island elements', ['astro']),
  frameworkSignal('framework-gatsby', 'Gatsby', (ctx) => ctx.htmlLower.includes('___gatsby') ? ['___gatsby root element found'] : null, '___gatsby root', ['gatsby']),
  frameworkSignal('framework-angular', 'Angular', (ctx) => /ng-version=/i.test(ctx.html) ? ['ng-version attribute found'] : null, 'ng-version attribute', ['angular']),
  frameworkSignal('framework-svelte', 'SvelteKit', (ctx) => ctx.htmlLower.includes('__sveltekit') || /data-sveltekit-/i.test(ctx.html) ? ['SvelteKit runtime markers found'] : null, '__sveltekit / data-sveltekit-*', ['svelte']),
  frameworkSignal('framework-remix', 'Remix', (ctx) => ctx.htmlLower.includes('__remixcontext') ? ['__remixContext found'] : null, '__remixContext global', ['remix']),
  frameworkSignal('framework-express-powered-by', 'Express', (ctx) => (ctx.headers['x-powered-by'] ?? '').toLowerCase().includes('express') ? [`x-powered-by: ${ctx.headers['x-powered-by']}`] : null, 'x-powered-by: Express header', ['express']),
]

// ════════════════════════════════════════════════════════════════════════
// CATEGORY 8 — PACKAGE ANALYSIS (GitHub mode: package.json; any mode: markup fingerprints)
// ════════════════════════════════════════════════════════════════════════

function packageJsonHasAny(ctx: SignalContext, names: string[]): string[] {
  const pkg = ctx.packageJson
  if (!pkg) return []
  const deps = { ...(pkg.dependencies as Record<string, string> ?? {}), ...(pkg.devDependencies as Record<string, string> ?? {}) }
  return names.filter((n) => n in deps)
}

const packageSignals: Signal[] = [
  {
    id: 'package-shadcn-ui',
    name: 'shadcn/ui design-token vocabulary',
    description: 'shadcn/ui\'s semantic Tailwind tokens (bg-background, text-muted-foreground, border-border, …) are the signature class vocabulary emitted by v0, Lovable, Bolt, and most modern AI site builders — this combination is almost never hand-typed at scale outside that ecosystem.',
    category: CATEGORY.PACKAGES,
    weight: 30, confidence: 'high', positiveScore: 35, negativeScore: 0,
    implementationMethod: 'Count occurrences of known shadcn/ui semantic token class names in HTML/JSX; also checks package.json for the "shadcn"/"shadcn-ui" dependency or a components.json file in GitHub mode.',
    falsePositiveRisk: 'low', priority: 6,
    requiredData: ['htmlLower', 'packageJson', 'hasComponentsJson'], supportedFrameworks: ['tailwind', 'react'],
    exampleMatches: ['class="bg-background text-foreground border-border ring-offset-background"', 'components.json present in repo root'],
    exampleNonMatches: ['A page using plain Tailwind color utilities like bg-white text-black'],
    futureImprovements: ['Weight higher when combined with Radix UI primitives, since shadcn/ui is built on Radix.'],
    voteWeights: { ai: 1 },
    evaluate: (ctx) => {
      if (ctx.hasComponentsJson) return { triggered: true, evidence: ['components.json (shadcn/ui config file) present in repository'], meta: { technology: { name: 'shadcn/ui' } } }
      const fromPkg = packageJsonHasAny(ctx, ['shadcn', 'shadcn-ui'])
      if (fromPkg.length) return { triggered: true, evidence: [`package.json dependency: ${fromPkg.join(', ')}`], meta: { technology: { name: 'shadcn/ui' } } }
      let total = 0
      const found: string[] = []
      for (const token of SHADCN_TOKENS) {
        const c = countMatches(ctx.htmlLower, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'))
        if (c > 0) { found.push(token); total += c }
      }
      if (found.length < 4 || total < 8) return no()
      return { triggered: true, strength: Math.min(1, total / 20), evidence: [`${found.length} shadcn/ui design tokens used ${total} times (${found.slice(0, 4).join(', ')}…)`], meta: { technology: { name: 'shadcn/ui' } } }
    },
  },
  {
    id: 'package-radix-ui',
    name: 'Radix UI primitives',
    description: 'Radix UI is the headless component library shadcn/ui is built on. Its data-radix-* attributes and generated element ids are a supporting AI-stack signal.',
    category: CATEGORY.PACKAGES,
    weight: 12, confidence: 'medium', positiveScore: 15, negativeScore: 0,
    implementationMethod: 'Substring check for data-radix- attributes or radix- prefixed element ids; also checks package.json for @radix-ui/* dependencies.',
    falsePositiveRisk: 'low', priority: 3,
    requiredData: ['htmlLower', 'packageJson'], supportedFrameworks: ['react'],
    exampleMatches: ['<div data-radix-collection-item id="radix-:r1:">'], exampleNonMatches: ['No Radix markers'],
    futureImprovements: ['Enumerate which specific Radix primitives (Dialog, Popover, etc.) are in use.'],
    voteWeights: { ai: 0.5 },
    evaluate: (ctx) => {
      const inHtml = ctx.htmlLower.includes('data-radix-') || ctx.htmlLower.includes('id="radix-')
      const inPkg = ctx.packageJson ? Object.keys({ ...(ctx.packageJson.dependencies as object ?? {}) }).some((k) => k.startsWith('@radix-ui/')) : false
      if (!inHtml && !inPkg) return no()
      return { triggered: true, evidence: [inHtml ? 'data-radix-* attributes / radix- element ids present' : '@radix-ui/* packages in package.json'], meta: { technology: { name: 'Radix UI' } } }
    },
  },
  {
    id: 'package-lucide-icons',
    name: 'Lucide icon set',
    description: 'lucide-react is the default icon library bundled into v0/shadcn-based AI scaffolds. Common but weak in isolation.',
    category: CATEGORY.PACKAGES,
    weight: 8, confidence: 'low', positiveScore: 10, negativeScore: 0,
    implementationMethod: 'Substring check for lucide- prefixed SVG classes; also checks package.json for lucide-react.',
    falsePositiveRisk: 'medium', priority: 2,
    requiredData: ['htmlLower', 'packageJson'], supportedFrameworks: ['react'],
    exampleMatches: ['<svg class="lucide lucide-zap">'], exampleNonMatches: ['Font Awesome or Material Icons in use'],
    futureImprovements: ['Weight down when the site also uses a non-Lucide icon set alongside it (mixed = likely human-curated).'],
    voteWeights: { ai: 0.3 },
    evaluate: (ctx) => {
      const inHtml = ctx.htmlLower.includes('class="lucide') || ctx.htmlLower.includes('lucide lucide-')
      const inPkg = packageJsonHasAny(ctx, ['lucide-react', 'lucide']).length > 0
      if (!inHtml && !inPkg) return no()
      return { triggered: true, evidence: [inHtml ? 'lucide-* SVG icon classes present' : 'lucide-react in package.json'], meta: { technology: { name: 'Lucide' } } }
    },
  },
  {
    id: 'package-framer-motion-gsap',
    name: 'Animation libraries (Framer Motion / GSAP / AOS)',
    description: 'Detects Framer Motion, GSAP, or AOS via package.json (GitHub mode) or characteristic runtime markup — neutral technology signal, feeds the Animation Analysis report section rather than strongly voting a bucket.',
    category: CATEGORY.PACKAGES,
    weight: 6, confidence: 'medium', positiveScore: 10, negativeScore: 0,
    implementationMethod: 'package.json dependency check for framer-motion/motion, gsap, aos; HTML fallback for data-aos attributes.',
    falsePositiveRisk: 'medium', priority: 2,
    requiredData: ['packageJson', 'html'], supportedFrameworks: ['any'],
    exampleMatches: ['"framer-motion": "^11.0.0" in package.json', '<div data-aos="fade-up">'],
    exampleNonMatches: ['No animation library present'],
    futureImprovements: ['Split into three separate signals once we want per-library reporting granularity.'],
    voteWeights: { ai: 0.15 },
    evaluate: (ctx) => {
      const pkgHit = packageJsonHasAny(ctx, ['framer-motion', 'motion', 'gsap', 'aos'])
      const htmlHit = /data-aos=|gsap\.(?:to|from|timeline)/i.test(ctx.html)
      if (pkgHit.length === 0 && !htmlHit) return no()
      return { triggered: true, evidence: [pkgHit.length ? `package.json: ${pkgHit.join(', ')}` : 'AOS/GSAP markup detected in page'], meta: { technology: { name: pkgHit[0] ?? 'AOS/GSAP' } } }
    },
  },
  {
    id: 'package-form-validation-stack',
    name: 'react-hook-form + zod validation stack',
    description: 'The react-hook-form + zod combination is the default form-handling stack AI scaffolds reach for. Weak supporting signal on its own.',
    category: CATEGORY.PACKAGES,
    weight: 6, confidence: 'low', positiveScore: 10, negativeScore: 0,
    implementationMethod: 'package.json dependency check for react-hook-form and zod together.',
    falsePositiveRisk: 'medium', priority: 1,
    requiredData: ['packageJson'], supportedFrameworks: ['react'],
    exampleMatches: ['"react-hook-form" and "zod" both in dependencies'], exampleNonMatches: ['Only one of the two present'],
    futureImprovements: ['Also check for @hookform/resolvers as the connecting glue package.'],
    voteWeights: { ai: 0.15 },
    evaluate: (ctx) => {
      const hit = packageJsonHasAny(ctx, ['react-hook-form', 'zod'])
      if (hit.length < 2) return no()
      return { triggered: true, evidence: ['react-hook-form + zod validation stack in package.json'] }
    },
  },
]

// ════════════════════════════════════════════════════════════════════════
// CATEGORY 9 — FOLDER PATTERN ANALYSIS (GitHub mode)
// ════════════════════════════════════════════════════════════════════════

const folderSignals: Signal[] = [
  {
    id: 'folder-ai-tool-config-files',
    name: 'AI-tool project config files present',
    description: 'Repos containing .bolt/, .cursor/, .windsurf/, .replit, or a lovable-tagger config are essentially self-declared — these are the literal project scaffolding files each AI tool writes into a new project.',
    category: CATEGORY.FOLDER,
    weight: 45, confidence: 'high', positiveScore: 50, negativeScore: 0,
    implementationMethod: 'Scan the GitHub repo\'s file-path list for known AI-tool config file/directory names.',
    falsePositiveRisk: 'low', priority: 8,
    requiredData: ['allFilePaths'], supportedFrameworks: ['any'],
    exampleMatches: ['.bolt/config.json', '.replit', '.cursor/rules', '.windsurfrules'],
    exampleNonMatches: ['A repo with only src/, public/, package.json'],
    futureImprovements: ['Keep this list updated as new AI IDEs/tools ship their own dotfiles.'],
    voteWeights: { ai: 1 },
    evaluate: (ctx) => {
      if (!ctx.allFilePaths) return no()
      const markers = ['.bolt/', '.cursor/', '.windsurfrules', '.replit', 'replit.nix', '.lovable/', 'lovable-tagger']
      const hits = ctx.allFilePaths.filter((p) => markers.some((m) => p.toLowerCase().includes(m.toLowerCase())))
      if (hits.length === 0) return no()
      return { triggered: true, evidence: [`AI-tool project files found: ${hits.slice(0, 5).join(', ')}`] }
    },
  },
  {
    id: 'folder-conventional-src-structure',
    name: 'Conventional hand-organized project structure',
    description: 'A deliberately organized structure (e.g. src/components, src/utils, src/hooks, tests/) with descriptive folder names suggests thoughtful human project organization rather than a flat AI-generated scaffold.',
    category: CATEGORY.FOLDER,
    weight: 10, confidence: 'low', positiveScore: 15, negativeScore: 0,
    implementationMethod: 'Check for the presence of multiple conventional organizational directories together (components, hooks, utils/lib, tests, types).',
    falsePositiveRisk: 'high', priority: 2,
    requiredData: ['allFilePaths'], supportedFrameworks: ['any'],
    exampleMatches: ['src/components/, src/hooks/, src/utils/, tests/ all present'], exampleNonMatches: ['Everything flat in app/ with no further organization'],
    futureImprovements: ['This is genuinely weak in isolation since AI scaffolds also produce these folders — keep low weight.'],
    voteWeights: { human: 0.2 },
    evaluate: (ctx) => {
      if (!ctx.allFilePaths) return no()
      const dirs = ['components/', 'hooks/', 'utils/', 'lib/', 'tests/', '__tests__/', 'types/']
      const present = dirs.filter((d) => ctx.allFilePaths!.some((p) => p.includes(`/${d}`) || p.startsWith(d)))
      if (present.length < 4) return no()
      return { triggered: true, evidence: [`Organized project structure: ${present.join(', ')}`] }
    },
  },
  {
    id: 'folder-readme-ai-tool-mention',
    name: 'README mentions an AI coding tool',
    description: 'READMEs that explicitly mention "Built with v0", "Created with Lovable", or similar are a direct, explicit disclosure of AI-assisted origin.',
    category: CATEGORY.FOLDER,
    weight: 25, confidence: 'high', positiveScore: 35, negativeScore: 0,
    implementationMethod: 'Regex match on README content against AI-tool self-attribution phrases.',
    falsePositiveRisk: 'low', priority: 5,
    requiredData: ['readme'], supportedFrameworks: ['any'],
    exampleMatches: ['"This project was generated by v0.dev"', '"Built with Lovable"'],
    exampleNonMatches: ['A README with no AI-tool mention'],
    futureImprovements: ['Also scan CONTRIBUTING.md and package.json "description" fields for similar disclosures.'],
    voteWeights: { ai: 1 },
    evaluate: (ctx) => {
      if (!ctx.readme) return no()
      const m = ctx.readme.match(/\b(?:built|created|generated|made)\s+(?:with|using|by)\s+(v0(?:\.dev)?|lovable|bolt\.new|cursor|windsurf|replit\s*ai|chatgpt|claude|github copilot)/i)
      if (!m) return no()
      return { triggered: true, evidence: [`README explicitly states: "${m[0]}"`] }
    },
  },
]

// ════════════════════════════════════════════════════════════════════════
// CATEGORY 10 — COMPONENT NAMING
// ════════════════════════════════════════════════════════════════════════

const componentNamingSignals: Signal[] = [
  {
    id: 'component-naming-ai-template-cluster',
    name: 'Cluster of generic AI-template component names',
    description: 'Component names like HeroSection, FeatureCard, PricingCard, TestimonialCard, WhyChooseUs, CTASection appear together constantly in AI-generated landing-page templates — the exact vocabulary these tools default to when asked for a "modern landing page".',
    category: CATEGORY.COMPONENT_NAMING,
    weight: 18, confidence: 'medium', positiveScore: 25, negativeScore: 0,
    implementationMethod: 'Match component/function declaration names (GitHub/paste mode) or id="section-name" markers against a known AI-template naming vocabulary; trigger when 4+ distinct matches are found.',
    falsePositiveRisk: 'medium', priority: 4,
    requiredData: ['js', 'html'], supportedFrameworks: ['react'],
    exampleMatches: ['function HeroSection()', 'export function WhyChooseUs()', 'const PricingCard = () =>'],
    exampleNonMatches: ['Bespoke component names like <BookingWidget>, <BranchLocator>'],
    futureImprovements: ['Weight by how many of these appear as top-level page sections vs deeply nested reusable components.'],
    voteWeights: { ai: 0.6 },
    evaluate: (ctx) => {
      const found = AI_COMPONENT_NAMES.filter((n) => new RegExp(`\\b${n}\\b`).test(ctx.js) || new RegExp(`\\b${n}\\b`).test(ctx.html))
      if (found.length < 4) return no()
      return { triggered: true, strength: Math.min(1, found.length / 10), evidence: [`${found.length} generic AI-template component names found: ${found.slice(0, 6).join(', ')}`] }
    },
  },
]

// ════════════════════════════════════════════════════════════════════════
// CATEGORY 11 — CONTENT ANALYSIS
// ════════════════════════════════════════════════════════════════════════

function stripHtmlForContent(html: string): string {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

const contentSignals: Signal[] = [
  {
    id: 'content-ai-marketing-buzzwords',
    name: 'AI marketing buzzword density',
    description: 'Words like "seamless", "cutting-edge", "revolutionize", "unlock your potential" appear at unusually high density in AI-generated marketing copy — a genuine stylistic fingerprint of LLM-written content.',
    category: CATEGORY.CONTENT,
    weight: 20, confidence: 'medium', positiveScore: 25, negativeScore: 0,
    implementationMethod: 'Count occurrences of a curated AI-buzzword vocabulary in the page\'s visible text.',
    falsePositiveRisk: 'medium', priority: 4,
    requiredData: ['html'], supportedFrameworks: ['any'],
    exampleMatches: ['"Our cutting-edge, scalable platform empowers you to..."'], exampleNonMatches: ['Plain, specific product descriptions with no buzzwords'],
    futureImprovements: ['Weight by buzzwords-per-1000-words rather than raw count so short and long pages compare fairly.'],
    voteWeights: { ai: 0.6 },
    evaluate: (ctx) => {
      const text = stripHtmlForContent(ctx.html).toLowerCase()
      let total = 0
      const hits: string[] = []
      for (const w of AI_MARKETING_BUZZWORDS) {
        const c = countMatches(text, new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g'))
        if (c > 0) { total += c; hits.push(w) }
      }
      if (total < 4) return no()
      return { triggered: true, strength: Math.min(1, total / 12), evidence: [`${total} AI-marketing buzzword occurrences: ${hits.slice(0, 6).join(', ')}`] }
    },
  },
  {
    id: 'content-ai-filler-phrases',
    name: 'Generic AI filler phrases',
    description: 'Stock phrases like "take your business to the next level", "we pride ourselves", "trusted partner" are template filler that LLMs reach for by default across unrelated industries.',
    category: CATEGORY.CONTENT,
    weight: 20, confidence: 'medium', positiveScore: 25, negativeScore: 0,
    implementationMethod: 'Substring match against a curated list of generic marketing filler phrases.',
    falsePositiveRisk: 'medium', priority: 4,
    requiredData: ['html'], supportedFrameworks: ['any'],
    exampleMatches: ['"We pride ourselves on being your trusted partner..."'], exampleNonMatches: ['Specific, concrete copy about the actual business'],
    futureImprovements: ['Extend the phrase list per-industry as new templates are observed.'],
    voteWeights: { ai: 0.5 },
    evaluate: (ctx) => {
      const text = stripHtmlForContent(ctx.html).toLowerCase()
      const hits = AI_FILLER_PHRASES.filter((p) => text.includes(p))
      if (hits.length < 2) return no()
      return { triggered: true, strength: Math.min(1, hits.length / 5), evidence: [`Generic filler phrases found: ${hits.slice(0, 5).join('; ')}`] }
    },
  },
  {
    id: 'content-sentence-uniformity',
    name: 'Unnaturally uniform sentence length',
    description: 'Human writing naturally varies sentence length; LLM-generated paragraphs often produce suspiciously uniform sentence lengths across a page.',
    category: CATEGORY.CONTENT,
    weight: 10, confidence: 'low', positiveScore: 15, negativeScore: 0,
    implementationMethod: 'Compute the standard deviation of sentence word-counts across the page; trigger when variance is very low with enough sentences to be meaningful.',
    falsePositiveRisk: 'high', priority: 2,
    requiredData: ['html'], supportedFrameworks: ['any'],
    exampleMatches: ['A page where every sentence is 14-16 words long'], exampleNonMatches: ['Natural mix of short and long sentences'],
    futureImprovements: ['Combine with perplexity/burstiness modeling for a stronger signal once a lightweight model is available.'],
    voteWeights: { ai: 0.2 },
    evaluate: (ctx) => {
      const text = stripHtmlForContent(ctx.html)
      const sentences = text.split(/[.!?]+\s+/).filter((s) => s.split(/\s+/).length >= 3)
      if (sentences.length < 8) return no()
      const lens = sentences.map((s) => s.split(/\s+/).filter(Boolean).length)
      const avg = lens.reduce((a, b) => a + b, 0) / lens.length
      const variance = Math.sqrt(lens.reduce((s, l) => s + (l - avg) ** 2, 0) / lens.length)
      if (variance >= 4) return no()
      return { triggered: true, evidence: [`Sentence length standard deviation is only ${variance.toFixed(1)} words across ${sentences.length} sentences`] }
    },
  },
]

// ════════════════════════════════════════════════════════════════════════
// CATEGORY 12 — SEO ANALYSIS
// ════════════════════════════════════════════════════════════════════════

const seoSignals: Signal[] = [
  {
    id: 'seo-generic-title',
    name: 'Generic or missing title tag',
    description: 'A missing, empty, or generic (<10 char, e.g. "Home", "Page") title tag suggests an unfinished or rapidly-scaffolded build — informational for the report, weak signal overall.',
    category: CATEGORY.SEO,
    weight: 6, confidence: 'low', positiveScore: 10, negativeScore: 0,
    implementationMethod: 'Extract <title>; flag if missing, empty, or matches a generic-title list / under 10 characters.',
    falsePositiveRisk: 'high', priority: 1,
    requiredData: ['headHtml'], supportedFrameworks: ['any'],
    exampleMatches: ['<title>Home</title>', '<title></title>'], exampleNonMatches: ['<title>Sterling Crest Construction — Trusted Builders in London</title>'],
    futureImprovements: ['Cross-check against the visible <h1> to see if it was ever customized from a template default.'],
    voteWeights: { hybrid: 0.05 },
    evaluate: (ctx) => {
      const title = ctx.headHtml.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? ''
      const generic = ['home', 'welcome', 'page', 'untitled', 'my website', 'website', 'homepage']
      if (title && title.length >= 10 && !generic.includes(title.toLowerCase())) return no()
      return { triggered: true, evidence: [title ? `Generic title: "${title}"` : 'Missing or empty <title> tag'] }
    },
  },
  {
    id: 'seo-complete-social-tags',
    name: 'Complete Open Graph + Twitter Card tags',
    description: 'A full, correctly-populated set of Open Graph and Twitter Card meta tags reflects deliberate SEO investment — common on mature human/CMS sites, less consistently present on quick AI prototypes.',
    category: CATEGORY.SEO,
    weight: 10, confidence: 'low', positiveScore: 15, negativeScore: 5,
    implementationMethod: 'Check for presence of og:title, og:description, og:image, and twitter:card together.',
    falsePositiveRisk: 'high', priority: 2,
    requiredData: ['headHtml'], supportedFrameworks: ['any'],
    exampleMatches: ['All four tags present with real content'], exampleNonMatches: ['No og:* tags at all'],
    futureImprovements: ['Validate that og:image actually resolves rather than just checking tag presence.'],
    voteWeights: { human: 0.1, cms: 0.15 },
    evaluate: (ctx) => {
      const has = (p: string) => new RegExp(`<meta\\s+(?:property|name)=["']${p}["'][^>]*content=["'][^"']+["']`, 'i').test(ctx.headHtml)
      const complete = has('og:title') && has('og:description') && has('og:image') && has('twitter:card')
      if (!complete) return no()
      return { triggered: true, evidence: ['Complete Open Graph + Twitter Card meta tag set found'] }
    },
  },
]

// ════════════════════════════════════════════════════════════════════════
// CATEGORY 13 — ANIMATION ANALYSIS
// ════════════════════════════════════════════════════════════════════════

const animationSignals: Signal[] = [
  {
    id: 'animation-tailwind-generated-utilities',
    name: 'Generated Tailwind animation utility density',
    description: 'Heavy use of Tailwind\'s built-in animate-* / transition-* utility classes across many elements (rather than custom @keyframes) is typical of AI-generated component output leaning entirely on the utility framework for motion.',
    category: CATEGORY.ANIMATION,
    weight: 8, confidence: 'low', positiveScore: 12, negativeScore: 0,
    implementationMethod: 'Count distinct elements using animate-* or transition-* Tailwind utility classes; trigger at a high density.',
    falsePositiveRisk: 'high', priority: 2,
    requiredData: ['html'], supportedFrameworks: ['tailwind'],
    exampleMatches: ['class="animate-fade-in transition-all duration-300"'], exampleNonMatches: ['No animation utility classes'],
    futureImprovements: ['Correlate with the heavy-utility-chain signal to avoid double-counting the same generated markup.'],
    voteWeights: { ai: 0.2 },
    evaluate: (ctx) => {
      const count = countMatches(ctx.html, /class(?:Name)?=["'][^"']*\b(?:animate|transition)-[a-z-]+/gi)
      if (count < 10) return no()
      return { triggered: true, evidence: [`${count} elements use Tailwind animate-*/transition-* utilities`] }
    },
  },
]

// ════════════════════════════════════════════════════════════════════════
// CATEGORY 16 — CMS DETECTION (ported + expanded from the previous engine)
// ════════════════════════════════════════════════════════════════════════

const cmsSignals: Signal[] = [
  {
    id: 'cms-wordpress-core-assets',
    name: 'WordPress core asset references',
    description: 'Detects real WordPress asset references (/wp-content/, /wp-includes/ in src=/href= attributes, the wp-json REST link, or a WordPress generator tag). Requires a generator tag OR 2+ distinct evidence types — a single stray image URL pointing at an old WP host is NOT enough to call a site WordPress.',
    category: CATEGORY.CMS,
    weight: 60, confidence: 'high', positiveScore: 60, negativeScore: 40,
    implementationMethod: 'Count src=/href= references containing /wp-content/ or /wp-includes/; check for a wp-json link/API discovery link and WordPress body classes; check the generator meta tag.',
    falsePositiveRisk: 'low', priority: 9,
    requiredData: ['html', 'generatorValues'], supportedFrameworks: ['wordpress'],
    exampleMatches: ['<link rel="stylesheet" href="/wp-content/themes/x/style.css">', '<meta name="generator" content="WordPress 6.4">'],
    exampleNonMatches: ['A single <img src="https://old-site.com/wp-content/uploads/2019/photo.jpg"> migrated into an otherwise non-WordPress site'],
    futureImprovements: ['Fetch /wp-json/ directly as a confirmation probe when the classification is borderline.'],
    voteWeights: { cms: 1 },
    suppressWeights: { ai: 1, human: 0.5 },
    evaluate: (ctx) => {
      const wpContentAssets = countMatches(ctx.html, /(?:src|href)\s*=\s*["'][^"']*\/wp-content\//gi)
      const wpIncludesAssets = countMatches(ctx.html, /(?:src|href)\s*=\s*["'][^"']*\/wp-includes\//gi)
      const wpJsonLink = /<link[^>]*href=["'][^"']*\/wp-json[^"']*["']/i.test(ctx.html) || /rel=["']https:\/\/api\.w\.org\/["']/i.test(ctx.html)
      const wpGenerator = ctx.generatorValues.some((g) => g.toLowerCase().includes('wordpress'))
      const wpBodyClass = /<body[^>]*class=["'][^"']*\bwp-/i.test(ctx.html)

      const evidence: string[] = []
      if (wpContentAssets > 0) evidence.push(`${wpContentAssets} wp-content asset reference(s)`)
      if (wpIncludesAssets > 0) evidence.push('wp-includes core scripts')
      if (wpJsonLink) evidence.push('wp-json REST API link')
      if (wpGenerator) evidence.push('generator meta tag: WordPress')
      if (wpBodyClass) evidence.push('WordPress body classes')

      const isWordPress = wpGenerator || evidence.length >= 2
      if (!isWordPress) return no()
      return { triggered: true, evidence, meta: { technology: { name: 'WordPress' } } }
    },
  },
  {
    id: 'cms-wordpress-traces-only',
    name: 'Weak/isolated WordPress asset trace',
    description: 'A single wp-content/wp-includes reference with no other corroborating evidence — likely a migrated asset URL, NOT proof the current site is WordPress. Reported separately so it never single-handedly triggers a CMS verdict.',
    category: CATEGORY.CMS,
    weight: 5, confidence: 'low', positiveScore: 8, negativeScore: 0,
    implementationMethod: 'Same detection as cms-wordpress-core-assets but fires only when exactly one weak evidence type is present and no generator tag confirms WordPress.',
    falsePositiveRisk: 'high', priority: 1,
    requiredData: ['html', 'generatorValues'], supportedFrameworks: ['any'],
    exampleMatches: ['A single <img src=".../wp-content/uploads/legacy.jpg"> with no other WP evidence'], exampleNonMatches: ['A confirmed WordPress build (handled by cms-wordpress-core-assets instead)'],
    futureImprovements: ['Track the referenced domain separately — if it differs from the page\'s own host, confidence this is a migrated/foreign asset increases further.'],
    voteWeights: { hybrid: 0.1 },
    evaluate: (ctx) => {
      const wpContentAssets = countMatches(ctx.html, /(?:src|href)\s*=\s*["'][^"']*\/wp-content\//gi)
      const wpIncludesAssets = countMatches(ctx.html, /(?:src|href)\s*=\s*["'][^"']*\/wp-includes\//gi)
      const wpJsonLink = /<link[^>]*href=["'][^"']*\/wp-json[^"']*["']/i.test(ctx.html)
      const wpGenerator = ctx.generatorValues.some((g) => g.toLowerCase().includes('wordpress'))
      const evidenceTypes = [wpContentAssets > 0, wpIncludesAssets > 0, wpJsonLink].filter(Boolean).length
      if (wpGenerator || evidenceTypes !== 1) return no()
      return { triggered: true, evidence: ['Single weak WordPress asset trace found — possibly a migrated image URL, not a WordPress site'] }
    },
  },
  {
    id: 'cms-page-builder',
    name: 'Page builder markup (Elementor / Divi / WPBakery / Bricks)',
    description: 'Detects the distinctive markup of popular WordPress page builders. Their generated wrapper divs and utility-ish class names are frequently mistaken for AI output — they are not.',
    category: CATEGORY.CMS,
    weight: 30, confidence: 'high', positiveScore: 30, negativeScore: 20,
    implementationMethod: 'Regex/substring match on elementor-*, et_pb_*, vc_row, and brxe- (Bricks) class name conventions.',
    falsePositiveRisk: 'low', priority: 7,
    requiredData: ['html'], supportedFrameworks: ['wordpress'],
    exampleMatches: ['data-elementor-type="wp-page"', 'class="et_pb_row"'], exampleNonMatches: ['Plain semantic HTML with no builder markup'],
    futureImprovements: ['Add Oxygen Builder and GenerateBlocks fingerprints.'],
    voteWeights: { cms: 1 },
    suppressWeights: { ai: 0.6 },
    evaluate: (ctx) => {
      const hasElementor = /class=["'][^"']*elementor-|data-elementor-type|elementor-frontend/i.test(ctx.html)
      const hasDivi = ctx.htmlLower.includes('et_pb_')
      const hasWpBakery = ctx.htmlLower.includes('vc_row')
      const hasBricks = ctx.htmlLower.includes('brxe-')
      const hits = [hasElementor && 'Elementor', hasDivi && 'Divi', hasWpBakery && 'WPBakery', hasBricks && 'Bricks'].filter(Boolean) as string[]
      if (hits.length === 0) return no()
      return { triggered: true, evidence: [`Page builder markup: ${hits.join(', ')}`], meta: { technology: { name: hits[0] } } }
    },
  },
  {
    id: 'cms-gutenberg-blocks',
    name: 'Gutenberg block markup',
    description: 'WordPress core enqueues the wp-block-library stylesheet on every site regardless of whether Gutenberg blocks are actually used, so that alone can\'t indicate Gutenberg usage. This rule instead requires real wp-block-* class markup IN THE PAGE BODY.',
    category: CATEGORY.CMS,
    weight: 15, confidence: 'medium', positiveScore: 20, negativeScore: 0,
    implementationMethod: 'Count class attributes matching wp-block-* (excluding the always-present "wp-block-library" stylesheet id); trigger at 2+.',
    falsePositiveRisk: 'medium', priority: 4,
    requiredData: ['html'], supportedFrameworks: ['wordpress'],
    exampleMatches: ['<div class="wp-block-group">', '<figure class="wp-block-image">'],
    exampleNonMatches: ['<link id="wp-block-library-css" href="...">  (the core stylesheet — present on all WP sites, not evidence of usage)'],
    futureImprovements: ['Enumerate specific block types used (columns, buttons, group) for a richer report.'],
    voteWeights: { cms: 0.5 },
    evaluate: (ctx) => {
      const count = countMatches(ctx.html, /class=["'][^"']*\bwp-block-(?!library)[a-z-]+/gi)
      if (count < 2) return no()
      return { triggered: true, evidence: [`${count} wp-block-* elements found in page markup`] }
    },
  },
  {
    id: 'cms-hosted-site-builders',
    name: 'Shopify / Wix / Squarespace / Webflow / Framer',
    description: 'Detects hosted site-builder platforms via their characteristic static-asset CDN domains or data attributes.',
    category: CATEGORY.CMS,
    weight: 60, confidence: 'high', positiveScore: 60, negativeScore: 40,
    implementationMethod: 'Hostname/substring match against each platform\'s known CDN domain or markup attribute.',
    falsePositiveRisk: 'low', priority: 9,
    requiredData: ['html', 'generatorValues'], supportedFrameworks: ['shopify', 'wix', 'squarespace', 'webflow', 'framer'],
    exampleMatches: ['cdn.shopify.com', 'wixstatic.com', 'website-files.com', 'framerusercontent.com'],
    exampleNonMatches: ['A custom-built e-commerce site with no platform CDN references'],
    futureImprovements: ['Add BigCommerce and Magento hosted-cloud fingerprints.'],
    voteWeights: { cms: 1 },
    suppressWeights: { ai: 1 },
    evaluate: (ctx) => {
      const L = ctx.htmlLower
      const gen = ctx.generatorValues.join(' | ').toLowerCase()
      const checks: [string, boolean][] = [
        ['Shopify', L.includes('cdn.shopify.com') || L.includes('/cdn/shop/')],
        ['Wix', L.includes('wixstatic.com') || L.includes('parastorage.com')],
        ['Squarespace', L.includes('squarespace.com') || L.includes('sqs-block') || gen.includes('squarespace')],
        ['Webflow', L.includes('website-files.com') || L.includes('data-wf-page') || gen.includes('webflow')],
        ['Framer', L.includes('framerusercontent.com')],
      ]
      const hits = checks.filter(([, v]) => v).map(([n]) => n)
      if (hits.length === 0) return no()
      return { triggered: true, evidence: [`Hosted platform detected: ${hits.join(', ')}`], meta: { technology: { name: hits[0] } } }
    },
  },
  {
    id: 'cms-other-open-source',
    name: 'Drupal / Joomla / Ghost / Magento / PrestaShop / OpenCart',
    description: 'Detects other common open-source CMS/e-commerce platforms via generator tags or characteristic file paths.',
    category: CATEGORY.CMS,
    weight: 50, confidence: 'high', positiveScore: 55, negativeScore: 35,
    implementationMethod: 'Generator meta tag match, or platform-specific default path substrings (e.g. /sites/default/files for Drupal).',
    falsePositiveRisk: 'low', priority: 7,
    requiredData: ['html', 'generatorValues'], supportedFrameworks: ['any'],
    exampleMatches: ['<meta name="generator" content="Drupal 10">', '/sites/default/files/'],
    exampleNonMatches: ['No matching generator or path pattern'],
    futureImprovements: ['Add Craft CMS and Contentful/headless-CMS detection via API script patterns.'],
    voteWeights: { cms: 1 },
    suppressWeights: { ai: 0.8 },
    evaluate: (ctx) => {
      const gen = ctx.generatorValues.join(' | ').toLowerCase()
      const L = ctx.htmlLower
      const checks: [string, boolean][] = [
        ['Drupal', gen.includes('drupal') || L.includes('/sites/default/files')],
        ['Joomla', gen.includes('joomla') || L.includes('/media/jui/')],
        ['Ghost', gen.includes('ghost')],
        ['Magento', L.includes('/skin/frontend/') || L.includes('mage/cookies')],
        ['PrestaShop', L.includes('prestashop')],
        ['OpenCart', L.includes('catalog/view/theme')],
        ['Blogger', L.includes('blogger.com/static') || gen.includes('blogger')],
        ['Duda', L.includes('dudaone') || L.includes('duda_website_builder')],
        ['Weebly', L.includes('weebly.com')],
        ['HubSpot CMS', L.includes('hs-scripts.com') || L.includes('hubspot.com/cta/')],
      ]
      const hits = checks.filter(([, v]) => v).map(([n]) => n)
      if (hits.length === 0) return no()
      return { triggered: true, evidence: [`CMS/platform detected: ${hits.join(', ')}`], meta: { technology: { name: hits[0] } } }
    },
  },
  {
    id: 'cms-wordpress-theme-frameworks',
    name: 'WordPress theme frameworks (GeneratePress/Astra/Kadence)',
    description: 'Detects popular WordPress theme frameworks — supporting evidence alongside core WordPress detection.',
    category: CATEGORY.CMS,
    weight: 15, confidence: 'medium', positiveScore: 20, negativeScore: 0,
    implementationMethod: 'Substring match on theme-specific class/slug conventions in stylesheet hrefs and body classes.',
    falsePositiveRisk: 'medium', priority: 3,
    requiredData: ['html'], supportedFrameworks: ['wordpress'],
    exampleMatches: ['/wp-content/themes/generatepress/', 'class="astra-theme"'], exampleNonMatches: ['No theme framework markers'],
    futureImprovements: ['Add OceanWP and Blocksy theme fingerprints.'],
    voteWeights: { cms: 0.3 },
    evaluate: (ctx) => {
      const L = ctx.htmlLower
      const hits = [
        L.includes('generatepress') && 'GeneratePress',
        L.includes('/themes/astra/') && 'Astra',
        L.includes('kadence') && 'Kadence',
      ].filter(Boolean) as string[]
      if (hits.length === 0) return no()
      return { triggered: true, evidence: [`WordPress theme framework: ${hits.join(', ')}`] }
    },
  },
  {
    id: 'cms-woocommerce',
    name: 'WooCommerce',
    description: 'Detects WooCommerce e-commerce markup, layered on top of a WordPress build.',
    category: CATEGORY.CMS,
    weight: 15, confidence: 'high', positiveScore: 20, negativeScore: 0,
    implementationMethod: 'Substring match for "woocommerce" in class names or asset paths.',
    falsePositiveRisk: 'low', priority: 3,
    requiredData: ['html'], supportedFrameworks: ['wordpress'],
    exampleMatches: ['class="woocommerce-product-gallery"'], exampleNonMatches: ['No WooCommerce markers'],
    futureImprovements: ['Detect specific WooCommerce blocks/extensions in use.'],
    voteWeights: { cms: 0.3 },
    evaluate: (ctx) => {
      if (!ctx.htmlLower.includes('woocommerce')) return no()
      return { triggered: true, evidence: ['WooCommerce classes/assets found'], meta: { technology: { name: 'WooCommerce' } } }
    },
  },
  {
    id: 'cms-traditional-stack',
    name: 'Traditional stack (jQuery / Bootstrap)',
    description: 'jQuery and Bootstrap are the backbone of most pre-2020 hand-built and CMS-templated sites. Their presence is mild supporting evidence against a modern AI-scaffolded stack (which favors React + Tailwind), but is common enough to keep the weight low.',
    category: CATEGORY.CMS,
    weight: 10, confidence: 'low', positiveScore: 15, negativeScore: 10,
    implementationMethod: 'Script src substring match for jquery; link/class match for Bootstrap grid conventions (col-md-, navbar-expand).',
    falsePositiveRisk: 'medium', priority: 2,
    requiredData: ['html'], supportedFrameworks: ['any'],
    exampleMatches: ['<script src="/js/jquery.min.js">', 'class="col-md-6"'], exampleNonMatches: ['No jQuery/Bootstrap markers'],
    futureImprovements: ['Detect jQuery plugin ecosystems (slick, owl-carousel) for additional confidence.'],
    voteWeights: { human: 0.2, cms: 0.2 },
    suppressWeights: { ai: 0.2 },
    evaluate: (ctx) => {
      const hasJquery = /<script[^>]*src=["'][^"']*jquery[^"']*["']/i.test(ctx.html)
      const hasBootstrap = /<link[^>]*href=["'][^"']*bootstrap[^"']*["']|class=["'][^"']*\b(?:navbar-expand|col-md-|col-lg-)/i.test(ctx.html)
      if (!hasJquery && !hasBootstrap) return no()
      return { triggered: true, evidence: [[hasJquery && 'jQuery', hasBootstrap && 'Bootstrap'].filter(Boolean).join(' + ')] }
    },
  },
]

// ════════════════════════════════════════════════════════════════════════
// AI TOOL FINGERPRINTS (direct evidence — high weight, own category)
// ════════════════════════════════════════════════════════════════════════

const AI_FINGERPRINT_CATEGORY = 'AI Tool Fingerprints'

const aiFingerprintSignals: Signal[] = [
  {
    id: 'ai-tool-generator-meta-tag',
    name: 'AI generator meta tag',
    description: 'An explicit <meta name="generator" content="..."> naming a known AI coding tool is the most direct possible evidence.',
    category: AI_FINGERPRINT_CATEGORY,
    weight: 60, confidence: 'high', positiveScore: 60, negativeScore: 40,
    implementationMethod: 'Match generator meta tag values against a known AI-tool name list.',
    falsePositiveRisk: 'low', priority: 9,
    requiredData: ['generatorValues'], supportedFrameworks: ['any'],
    exampleMatches: ['<meta name="generator" content="v0.dev">'], exampleNonMatches: ['<meta name="generator" content="WordPress 6.4">'],
    futureImprovements: ['Keep the AI tool name list current as new products launch.'],
    voteWeights: { ai: 1 },
    suppressWeights: { cms: 0.3, human: 0.3 },
    evaluate: (ctx) => {
      const hit = ctx.generatorValues.find((g) => AI_GENERATOR_NAMES.some((n) => g.toLowerCase().includes(n)))
      if (!hit) return no()
      return { triggered: true, evidence: [`Generator meta tag: "${hit}"`], meta: { technology: { name: hit } } }
    },
  },
  {
    id: 'ai-tool-v0-fingerprint',
    name: 'v0 by Vercel fingerprint',
    description: 'Detects v0\'s data-v0-t attribute, direct v0.dev/v0.app references, or its signature placeholder.svg?height=&width= asset convention.',
    category: AI_FINGERPRINT_CATEGORY,
    weight: 55, confidence: 'high', positiveScore: 55, negativeScore: 35,
    implementationMethod: 'Substring/regex match on data-v0-t, v0.dev/v0.app, and placeholder.svg query-param convention.',
    falsePositiveRisk: 'low', priority: 9,
    requiredData: ['htmlLower', 'html'], supportedFrameworks: ['nextjs'],
    exampleMatches: ['<div data-v0-t="card">', '<img src="/placeholder.svg?height=400&width=600">'],
    exampleNonMatches: ['<img src="/placeholder.svg"> with no height/width query params'],
    futureImprovements: ['Track v0-specific component wrapper naming conventions as they evolve.'],
    voteWeights: { ai: 1 },
    suppressWeights: { cms: 0.3 },
    evaluate: (ctx) => {
      const direct = ctx.htmlLower.includes('data-v0-t') || ctx.htmlLower.includes('v0.dev') || ctx.htmlLower.includes('v0.app')
      const placeholderSvg = /placeholder\.svg\?(?:height|width)=/i.test(ctx.html)
      const placeholderAssets = ctx.htmlLower.includes('placeholder-user.jpg') || ctx.htmlLower.includes('placeholder-logo.')
      if (!direct && !placeholderSvg && !placeholderAssets) return no()
      const evidence = direct ? ['data-v0-t attribute or v0.dev/v0.app reference'] : placeholderSvg ? ['v0 placeholder.svg?height=&width= asset convention'] : ['v0-style placeholder-user/placeholder-logo assets']
      return { triggered: true, strength: direct ? 1 : placeholderSvg ? 0.9 : 0.5, evidence, meta: { technology: { name: 'v0 by Vercel' } } }
    },
  },
  {
    id: 'ai-tool-lovable-fingerprint',
    name: 'Lovable / GPT-Engineer fingerprint',
    description: 'Detects Lovable\'s gptengineer.js script, lovable.dev/lovableproject.com references, or /lovable-uploads/ asset paths.',
    category: AI_FINGERPRINT_CATEGORY,
    weight: 55, confidence: 'high', positiveScore: 55, negativeScore: 35,
    implementationMethod: 'Substring match on gptengineer, lovable.dev, lovable-badge, lovableproject.com, /lovable-uploads/.',
    falsePositiveRisk: 'low', priority: 9,
    requiredData: ['htmlLower'], supportedFrameworks: ['any'],
    exampleMatches: ['<script src="https://cdn.gptengineer.app/gptengineer.js">', 'src="/lovable-uploads/abc.png"'],
    exampleNonMatches: ['No Lovable/GPT-Engineer references'],
    futureImprovements: ['Track Lovable\'s badge markup once it stabilizes further.'],
    voteWeights: { ai: 1 },
    suppressWeights: { cms: 0.3 },
    evaluate: (ctx) => {
      const L = ctx.htmlLower
      const hit = L.includes('gptengineer') || L.includes('gpt-engineer') || L.includes('lovable.dev') || L.includes('lovable-badge') || L.includes('lovableproject.com') || L.includes('/lovable-uploads/')
      if (!hit) return no()
      return { triggered: true, evidence: [L.includes('/lovable-uploads/') ? '/lovable-uploads/ asset paths' : 'Lovable / GPT-Engineer script or badge'], meta: { technology: { name: 'Lovable' } } }
    },
  },
  {
    id: 'ai-tool-bolt-base44-replit',
    name: 'Bolt.new / Base44 / Replit AI fingerprint',
    description: 'Detects hosting/reference markers for Bolt.new, Base44, or Replit — all AI app builders with characteristic domains.',
    category: AI_FINGERPRINT_CATEGORY,
    weight: 45, confidence: 'medium', positiveScore: 50, negativeScore: 30,
    implementationMethod: 'Substring match on bolt.new, base44, .repl.co, replit.dev, replit-badge.',
    falsePositiveRisk: 'low', priority: 8,
    requiredData: ['htmlLower', 'hostname'], supportedFrameworks: ['any'],
    exampleMatches: ['myapp.repl.co', 'bolt.new project reference'], exampleNonMatches: ['No Bolt/Base44/Replit markers'],
    futureImprovements: ['Add Softr, Glide, and other no-code/AI-adjacent builder fingerprints.'],
    voteWeights: { ai: 1 },
    suppressWeights: { cms: 0.2 },
    evaluate: (ctx) => {
      const L = ctx.htmlLower
      const host = ctx.hostname ?? ''
      const hits = [
        (L.includes('bolt.new')) && 'Bolt.new',
        L.includes('base44') && 'Base44',
        (host.endsWith('.repl.co') || L.includes('replit.dev') || L.includes('replit-badge')) && 'Replit',
      ].filter(Boolean) as string[]
      if (hits.length === 0) return no()
      return { triggered: true, evidence: [`AI builder hosting references: ${hits.join(', ')}`], meta: { technology: { name: hits[0] } } }
    },
  },
  {
    id: 'ai-tool-chatbot-artifact-pattern',
    name: 'ChatGPT / Claude single-file artifact pattern',
    description: 'AI chat assistants generating a full HTML page in one shot leave a recognizable fingerprint: AI-style section comments ("<!-- Hero Section -->", "<!-- Footer -->") combined with a Tailwind CDN include or generic placeholder image services.',
    category: AI_FINGERPRINT_CATEGORY,
    weight: 45, confidence: 'medium', positiveScore: 45, negativeScore: 20,
    implementationMethod: 'Count AI-style section comments; require either 4+ alone, or 2+ combined with Tailwind CDN or a placeholder image service.',
    falsePositiveRisk: 'medium', priority: 7,
    requiredData: ['html', 'htmlLower'], supportedFrameworks: ['any'],
    exampleMatches: ['<!-- Hero Section -->...<!-- Features Section -->...<!-- Footer -->'], exampleNonMatches: ['A single <!-- TODO --> comment with no section-labeling pattern'],
    futureImprovements: ['Extend the section-name vocabulary as new templates are observed in the wild.'],
    voteWeights: { ai: 1 },
    evaluate: (ctx) => {
      const sectionComments = countMatches(ctx.html, /<!--\s*(?:hero|navigation|nav bar|navbar|header|footer|features?|testimonials?|pricing|faq|cta|call to action|about(?: us)?|contact(?: us)?|services?|gallery|team)\s*(?:section)?\s*-->/gi)
      const hasTailwindCdn = ctx.htmlLower.includes('cdn.tailwindcss.com')
      const hasPlaceholderService = includesAny(ctx.htmlLower, ['via.placeholder.com', 'placehold.co', 'source.unsplash.com', 'placekitten.com'])
      const triggered = (hasTailwindCdn && sectionComments >= 2) || sectionComments >= 4 || (hasPlaceholderService && sectionComments >= 2)
      if (!triggered) return no()
      return { triggered: true, evidence: [`${sectionComments} AI-style section comments${hasTailwindCdn ? ' + Tailwind CDN' : ''}${hasPlaceholderService ? ' + placeholder image service' : ''}`], meta: { technology: { name: 'ChatGPT / Claude (pattern)' } } }
    },
  },
  {
    id: 'ai-tool-next-font-geist',
    name: 'next/font hashed classes + Geist typeface',
    description: 'Weak supporting signal: the combination of next/font\'s hashed class names with the Geist typeface is the default look of freshly-scaffolded Next.js/v0 projects.',
    category: AI_FINGERPRINT_CATEGORY,
    weight: 8, confidence: 'low', positiveScore: 15, negativeScore: 0,
    implementationMethod: 'Substring check for __className_/__variable_ (next/font output) combined with a "geist" mention.',
    falsePositiveRisk: 'high', priority: 2,
    requiredData: ['htmlLower', 'html'], supportedFrameworks: ['nextjs'],
    exampleMatches: ['<body class="__className_aaf875 geist-sans">'], exampleNonMatches: ['A site using a custom self-hosted font with no next/font hashes'],
    futureImprovements: ['Only fire this alongside at least one other AI signal — currently deliberately low-weight to avoid over-crediting a default Next.js starter.'],
    voteWeights: { ai: 0.3 },
    evaluate: (ctx) => {
      const hasNextFontHashes = ctx.htmlLower.includes('__classname_') || ctx.htmlLower.includes('__variable_')
      const hasGeist = /geist(?:_|-|\s|sans|mono)/i.test(ctx.html)
      if (!hasNextFontHashes || !hasGeist) return no()
      return { triggered: true, evidence: ['next/font hashed classes + Geist typeface (default v0/Next.js scaffold look)'] }
    },
  },
]

// ════════════════════════════════════════════════════════════════════════
// CATEGORY 17 — BUILD FINGERPRINTS
// ════════════════════════════════════════════════════════════════════════

const buildSignals: Signal[] = [
  {
    id: 'build-vite',
    name: 'Vite build output',
    description: 'Detects Vite\'s characteristic /assets/*.[hash].js module script tags and @vite/client references.',
    category: CATEGORY.BUILD,
    weight: 5, confidence: 'high', positiveScore: 8, negativeScore: 0,
    implementationMethod: 'Substring/regex match for @vite/client or /assets/*-[hash].js with type="module".',
    falsePositiveRisk: 'low', priority: 2,
    requiredData: ['html'], supportedFrameworks: ['vite'],
    exampleMatches: ['<script type="module" src="/assets/index-a1b2c3.js">'], exampleNonMatches: ['Webpack-bundled output'],
    futureImprovements: ['Detect Vite version from build comments when present.'],
    voteWeights: {},
    evaluate: (ctx) => {
      const hit = ctx.htmlLower.includes('/@vite/client') || /\/assets\/[\w-]+-[a-f0-9]{6,}\.js/i.test(ctx.html)
      if (!hit) return no()
      return { triggered: true, evidence: ['Vite build output markers found'], meta: { technology: { name: 'Vite' } } }
    },
  },
  {
    id: 'build-webpack',
    name: 'Webpack build output',
    description: 'Detects webpackJsonp/__webpack_require__ runtime markers.',
    category: CATEGORY.BUILD,
    weight: 5, confidence: 'medium', positiveScore: 8, negativeScore: 0,
    implementationMethod: 'Substring match for webpackJsonp or __webpack_require__.',
    falsePositiveRisk: 'low', priority: 2,
    requiredData: ['html'], supportedFrameworks: ['webpack'],
    exampleMatches: ['window.webpackJsonp = ...'], exampleNonMatches: ['No webpack runtime markers'],
    futureImprovements: ['Distinguish Webpack 4 vs 5 runtime signatures.'],
    voteWeights: {},
    evaluate: (ctx) => {
      if (!ctx.htmlLower.includes('webpackjsonp') && !ctx.htmlLower.includes('__webpack_require__')) return no()
      return { triggered: true, evidence: ['Webpack build runtime detected'], meta: { technology: { name: 'Webpack' } } }
    },
  },
]

// ════════════════════════════════════════════════════════════════════════
// CATEGORY 18 — NETWORK ANALYSIS
// ════════════════════════════════════════════════════════════════════════

const networkSignals: Signal[] = [
  {
    id: 'network-google-fonts',
    name: 'Google Fonts loaded',
    description: 'Informational: detects Google Fonts usage. Extremely common across all site types, so this is purely informational (zero vote weight) and exists to populate the Typography/Network report sections.',
    category: CATEGORY.NETWORK,
    weight: 2, confidence: 'high', positiveScore: 2, negativeScore: 0,
    implementationMethod: 'Substring match for fonts.googleapis.com or fonts.gstatic.com.',
    falsePositiveRisk: 'high', priority: 1,
    requiredData: ['html'], supportedFrameworks: ['any'],
    exampleMatches: ['<link href="https://fonts.googleapis.com/css2?family=Inter">'], exampleNonMatches: ['Self-hosted fonts only'],
    futureImprovements: ['Extract the actual font family list for the Typography category.'],
    voteWeights: {},
    evaluate: (ctx) => {
      if (!ctx.htmlLower.includes('fonts.googleapis.com') && !ctx.htmlLower.includes('fonts.gstatic.com')) return no()
      return { triggered: true, evidence: ['Google Fonts loaded'] }
    },
  },
]

// ════════════════════════════════════════════════════════════════════════
// CATEGORY 20 — TYPOGRAPHY
// ════════════════════════════════════════════════════════════════════════

const typographySignals: Signal[] = [
  {
    id: 'typography-ai-favorite-fonts',
    name: 'AI-template-favorite font pairing (Inter/Geist + system stack)',
    description: 'Inter and Geist are the overwhelming default typefaces in AI-generated templates and shadcn/ui starters. Weak in isolation (also very popular with real designers), but adds supporting weight alongside stronger signals.',
    category: CATEGORY.TYPOGRAPHY,
    weight: 6, confidence: 'low', positiveScore: 10, negativeScore: 0,
    implementationMethod: 'Substring match for "Inter" or "Geist" in font-family declarations or Google Fonts links.',
    falsePositiveRisk: 'high', priority: 1,
    requiredData: ['html', 'css'], supportedFrameworks: ['any'],
    exampleMatches: ['font-family: Inter, sans-serif;'], exampleNonMatches: ['A custom licensed display typeface'],
    futureImprovements: ['Only count this when combined with at least one other AI signal — currently deliberately low weight.'],
    voteWeights: { ai: 0.15 },
    evaluate: (ctx) => {
      const text = ctx.html + ctx.css
      if (!/font-family[^;]*\b(inter|geist)\b/i.test(text) && !/fonts\.googleapis\.com\/css2?\?family=(inter|geist)/i.test(text)) return no()
      return { triggered: true, evidence: ['Inter/Geist typeface detected — common AI-template default'] }
    },
  },
]

// ════════════════════════════════════════════════════════════════════════
// CATEGORY 21 — COLOR PALETTE
// ════════════════════════════════════════════════════════════════════════

const colorSignals: Signal[] = [
  {
    id: 'color-oklch-css-vars',
    name: 'OKLCH-based CSS custom-property palette',
    description: 'shadcn/ui\'s newer default theme (and Tailwind v4 starters) define the color system using oklch() custom properties — a distinctive, fairly recent authoring convention strongly associated with AI-scaffolded design systems.',
    category: CATEGORY.COLOR,
    weight: 10, confidence: 'medium', positiveScore: 15, negativeScore: 0,
    implementationMethod: 'Regex match for oklch( function calls inside CSS custom property declarations (--variable: oklch(...)).',
    falsePositiveRisk: 'medium', priority: 3,
    requiredData: ['css'], supportedFrameworks: ['tailwind'],
    exampleMatches: ['--background: oklch(1 0 0);'], exampleNonMatches: ['--background: #ffffff;'],
    futureImprovements: ['Track whether the exact default shadcn oklch values are used verbatim vs customized.'],
    voteWeights: { ai: 0.3 },
    evaluate: (ctx) => {
      const count = countMatches(ctx.css, /--[\w-]+\s*:\s*oklch\(/gi)
      if (count < 3) return no()
      return { triggered: true, evidence: [`${count} CSS custom properties defined using oklch() color values`] }
    },
  },
]

// ════════════════════════════════════════════════════════════════════════
// CATEGORY 22 — COMMENTS ANALYSIS
// ════════════════════════════════════════════════════════════════════════

const commentsSignals: Signal[] = [
  {
    id: 'comments-html-ai-section-labels',
    name: 'HTML section-label comments',
    description: 'Comments like <!-- Hero --> or <!-- Start Footer --> used purely to label large structural sections are common in both AI output and some hand-written templates — tracked separately from the stronger chatbot-artifact compound signal.',
    category: CATEGORY.COMMENTS,
    weight: 6, confidence: 'low', positiveScore: 10, negativeScore: 0,
    implementationMethod: 'Count HTML comments matching a structural section-label pattern.',
    falsePositiveRisk: 'high', priority: 1,
    requiredData: ['html'], supportedFrameworks: ['any'],
    exampleMatches: ['<!-- Hero Section -->'], exampleNonMatches: ['<!-- Google tag manager -->'],
    futureImprovements: ['Merge scoring with ai-tool-chatbot-artifact-pattern rather than double-counting.'],
    voteWeights: { hybrid: 0.1 },
    evaluate: (ctx) => {
      const count = countMatches(ctx.html, /<!--\s*(?:start |end )?(?:hero|header|footer|navbar|sidebar)\s*(?:section)?\s*-->/gi)
      if (count < 2) return no()
      return { triggered: true, evidence: [`${count} structural section-label HTML comments found`] }
    },
  },
]

// ════════════════════════════════════════════════════════════════════════
// CATEGORY 23 — GIT & DEPLOYMENT CLUES
// ════════════════════════════════════════════════════════════════════════

const gitDeploySignals: Signal[] = [
  {
    id: 'git-source-map-reference',
    name: 'Source map reference shipped to production',
    description: 'A //# sourceMappingURL= comment pointing at a .map file left in production is a minor build-hygiene signal — informational only, common across all stacks.',
    category: CATEGORY.GIT_DEPLOY,
    weight: 3, confidence: 'low', positiveScore: 5, negativeScore: 0,
    implementationMethod: 'Substring match for sourceMappingURL= in shipped JS.',
    falsePositiveRisk: 'high', priority: 1,
    requiredData: ['js'], supportedFrameworks: ['any'],
    exampleMatches: ['//# sourceMappingURL=main.js.map'], exampleNonMatches: ['No source map reference'],
    futureImprovements: ['Attempt to actually fetch the .map file to inspect original (pre-bundle) file names, which often reveal the scaffold tool.'],
    voteWeights: {},
    evaluate: (ctx) => {
      if (!ctx.js.includes('sourceMappingURL=')) return no()
      return { triggered: true, evidence: ['Source map reference found in shipped JavaScript'] }
    },
  },
]

// ════════════════════════════════════════════════════════════════════════
// AGGREGATE EXPORT — the full registry the engine consumes.
// Add new category arrays above and spread them in here; nothing else
// needs to change.
// ════════════════════════════════════════════════════════════════════════

export const ALL_SIGNALS: Signal[] = [
  ...hostingSignals,
  ...imageSignals,
  ...htmlSignals,
  ...cssSignals,
  ...jsSignals,
  ...reactSignals,
  ...frameworkSignals,
  ...packageSignals,
  ...folderSignals,
  ...componentNamingSignals,
  ...contentSignals,
  ...seoSignals,
  ...animationSignals,
  ...cmsSignals,
  ...aiFingerprintSignals,
  ...buildSignals,
  ...networkSignals,
  ...typographySignals,
  ...colorSignals,
  ...commentsSignals,
  ...gitDeploySignals,
]

// Sanity check, run at module load in development: every signal id must be unique.
if (process.env.NODE_ENV !== 'production') {
  const seen = new Set<string>()
  for (const s of ALL_SIGNALS) {
    if (seen.has(s.id)) throw new Error(`[vibe-detector] duplicate signal id: ${s.id}`)
    seen.add(s.id)
  }
}
