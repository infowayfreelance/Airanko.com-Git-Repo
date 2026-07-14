// ──────────────────────────────────────────────────────────────────────────
// Vibe Code Detector — shared types
//
// This file defines the CONTRACT between the detection engine and the
// signal registry. The engine (engine.ts) never hardcodes detection logic —
// it only knows how to loop over `Signal` objects and aggregate their
// `evaluate()` output into weighted probabilities. All actual detection
// knowledge lives in signals.ts (and any future signals-*.ts files you add).
// ──────────────────────────────────────────────────────────────────────────

/** The four classification buckets every signal votes into. */
export type Bucket = 'ai' | 'human' | 'cms' | 'hybrid'

/** Confidence the rule's author has in this signal's reliability. */
export type SignalConfidence = 'low' | 'medium' | 'high'

/** How likely this signal is to fire on content it shouldn't (false positive). */
export type FalsePositiveRisk = 'low' | 'medium' | 'high'

/**
 * Everything the engine gathers before running signals. Built once per
 * analysis in the API route, then passed to every signal's `evaluate()`.
 * Fields are optional where a given input mode (paste vs URL vs GitHub)
 * can't supply them — signals must handle missing data gracefully.
 */
export interface SignalContext {
  /** 'url' | 'github' | 'paste' — informs which data fields are populated. */
  mode: 'url' | 'github' | 'paste'

  /** Full raw HTML (or, for github/paste JS-only input, the combined source). */
  html: string
  /** Lowercased copy of `html`, precomputed once for fast substring checks. */
  htmlLower: string
  /** Contents of <head>...</head>, or the full html if no head tag found. */
  headHtml: string
  /** Concatenated inline <style> blocks + any external CSS sources provided. */
  css: string
  /** Concatenated inline <script> blocks + any external JS sources provided. */
  js: string
  /** <meta name="generator" content="..."> values found, in document order. */
  generatorValues: string[]

  /** Response headers (URL mode only — empty object otherwise). */
  headers: Record<string, string>
  /** The final URL after redirects (URL mode only). */
  finalUrl?: string
  /** Hostname of the analyzed page (URL mode only). */
  hostname?: string

  /** Every <img>/<Image> reference found in the page. */
  images: ImageRef[]
  /** A capped set of images we actually downloaded bytes for (URL mode only). */
  fetchedImageSamples: FetchedImageSample[]

  /** GitHub mode only: raw file list (path + content) actually fetched. */
  files?: { path: string; content: string; bytes: number }[]
  /** GitHub mode only: parsed package.json, if the repo has one. */
  packageJson?: Record<string, unknown> | null
  /** GitHub mode only: every file path seen in the repo tree (for folder-pattern signals), capped. */
  allFilePaths?: string[]
  /** GitHub mode only: parsed components.json (shadcn/ui config), if present. */
  hasComponentsJson?: boolean
  /** GitHub mode only: raw README content, if fetched. */
  readme?: string | null
}

export interface ImageRef {
  src: string
  alt: string | null
  hasAlt: boolean
  hasDimensions: boolean
  isNextImage: boolean
}

export interface FetchedImageSample {
  url: string
  contentType: string
  bytes: number
  /** Raw bytes decoded as latin1 text — lets us regex-search embedded EXIF/XMP/PNG-text ASCII fields without a binary parser. */
  latin1: string
  /** PNG tEXt/iTXt chunk key/value pairs, if this was a PNG and chunks were found. */
  pngTextChunks: { keyword: string; text: string }[]
}

/**
 * One detection rule. Every rule you add — no matter how small — is one of
 * these objects in signals.ts. The engine only ever calls `evaluate()`; it
 * never inspects category-specific logic itself.
 */
export interface Signal {
  /** Stable unique id, e.g. "wordpress-core-assets". Never reuse ids. */
  id: string
  /** Short human name shown in the report, e.g. "WordPress core assets". */
  name: string
  /** One or two sentences explaining what this rule looks for and why it matters. */
  description: string
  /** Free-form category label — grouped for the "Detailed Report" UI. See CATEGORY constants below for the standard set. */
  category: string
  /** Relative importance of this signal, 0-100. Scales its contribution to bucket totals. */
  weight: number
  /** How reliable this signal's author considers it. */
  confidence: SignalConfidence
  /** Max points (0-100) this signal awards to the bucket(s) it supports when triggered, before weight/strength scaling. */
  positiveScore: number
  /** Max points (0-100) this signal removes from opposing bucket(s) when triggered, before weight/strength scaling. 0 if it should never suppress anything. */
  negativeScore: number
  /** Plain-language description of the detection mechanism (regex, header check, byte scan, etc.) — shown in docs/tooling, not hidden logic. */
  implementationMethod: string
  /** How likely this signal is to misfire on content it shouldn't flag. */
  falsePositiveRisk: FalsePositiveRisk
  /** 1 (nice-to-have) to 10 (load-bearing) — used for sorting/triage, not scoring. */
  priority: number
  /** Which SignalContext fields this rule actually reads — documentation + lets tooling skip irrelevant signals early. */
  requiredData: (keyof SignalContext)[]
  /** Frameworks/platforms this rule is meaningful for. ['any'] if universal. */
  supportedFrameworks: string[]
  /** Real-world snippets that WOULD trigger this rule — for docs and unit tests. */
  exampleMatches: string[]
  /** Real-world snippets that should NOT trigger this rule — for docs and unit tests (guards against false positives). */
  exampleNonMatches: string[]
  /** Ideas for strengthening this signal later — kept here so the roadmap lives next to the rule. */
  futureImprovements: string[]

  /**
   * Which buckets this signal supports when triggered, and how strongly
   * relative to each other (0-1 ratios; they don't need to sum to 1).
   * Example: { ai: 1 } — purely an AI signal.
   *          { ai: 0.7, hybrid: 0.3 } — mostly AI but also implies hybrid.
   */
  voteWeights: Partial<Record<Bucket, number>>
  /**
   * Which buckets get suppressed when this signal triggers, and by how much
   * (0-1 ratios of `negativeScore`). Example: a confirmed CMS build
   * suppresses the `ai` bucket heavily: { ai: 1 }.
   */
  suppressWeights?: Partial<Record<Bucket, number>>

  /**
   * IDs of other signals this rule wants visibility into (e.g. a compound
   * "Vercel hosting + Next.js + AI stack" rule depends on the individual
   * hosting/framework/AI signals). When present, the engine runs this
   * signal in a second pass, after every signal WITHOUT `dependsOn` has
   * already been evaluated, and passes the set of triggered ids as the
   * second argument to `evaluate`. Omit for ordinary, independent rules.
   */
  dependsOn?: string[]

  /**
   * The actual detection logic. Must be pure and defensive — wrap risky
   * parsing in try/catch internally if needed; the engine also catches
   * exceptions per-signal so one bad rule can't break the whole report.
   * `strength` (0-1, default 1) lets a signal scale its own contribution,
   * e.g. "found 6 instances" vs "found 1 instance" of the same pattern.
   * `priorTriggered` is only populated for signals that declare `dependsOn`.
   */
  evaluate: (ctx: SignalContext, priorTriggered?: ReadonlySet<string>) => SignalEvaluation
}

export interface SignalEvaluation {
  triggered: boolean
  /** Human-readable evidence strings shown in the report when triggered. */
  evidence: string[]
  /** 0-1 multiplier on this signal's score contribution. Defaults to 1 when omitted. */
  strength?: number
  /** Optional structured extra detail (e.g. per-image findings) surfaced in the detailed report. */
  meta?: Record<string, unknown>
}

/** One signal's contribution after the engine has run it, for reporting. */
export interface TriggeredSignal {
  id: string
  name: string
  description: string
  category: string
  confidence: SignalConfidence
  falsePositiveRisk: FalsePositiveRisk
  priority: number
  weight: number
  evidence: string[]
  votes: Partial<Record<Bucket, number>>
  suppresses: Partial<Record<Bucket, number>>
  meta?: Record<string, unknown>
}

/** Final engine output. */
export interface DetectionResult {
  /** Normalized 0-100 probabilities, sum to ~100. */
  probabilities: Record<Bucket, number>
  /** The winning bucket. */
  classification: Bucket | 'unknown'
  /** Display label for the classification, e.g. "AI / Vibe Coded". */
  classificationLabel: string
  /** Overall confidence in the classification, derived from margin + signal strength. */
  confidence: SignalConfidence
  /** One-paragraph plain-language explanation of the verdict. */
  verdictText: string
  /** Short bullet reasons backing the verdict (top contributing signals). */
  reasons: string[]
  /** Signals that fired and support the winning classification. */
  positiveSignals: TriggeredSignal[]
  /** Signals that fired but point away from the winning classification. */
  negativeSignals: TriggeredSignal[]
  /** Every signal that fired, grouped by category, for the full detailed report. */
  allTriggeredSignals: TriggeredSignal[]
  /** Detected named technologies/platforms (WordPress, v0, shadcn/ui, Next.js, …), deduped. */
  detectedTechnologies: { name: string; category: string; evidence: string[] }[]
  /** Explicit per-image AI-generation findings (not just a score bump). */
  aiImageFindings: AiImageFinding[]
  /** How many signals were evaluated in total (for transparency in the UI). */
  totalSignalsEvaluated: number
  /** How many signals actually triggered. */
  totalSignalsTriggered: number
}

export interface AiImageFinding {
  src: string
  likelyAiGenerated: boolean
  confidence: SignalConfidence
  toolGuess: string | null
  evidence: string[]
}

/** Standard category labels — informational constant, not a closed enum. New signals may use any string. */
export const CATEGORY = {
  HOSTING: 'Hosting Analysis',
  IMAGES: 'Image Analysis',
  HTML: 'HTML Analysis',
  CSS: 'CSS Analysis',
  JS: 'JavaScript Analysis',
  REACT: 'React Analysis',
  FRAMEWORK: 'Framework Detection',
  PACKAGES: 'Package Analysis',
  FOLDER: 'Folder Pattern Analysis',
  COMPONENT_NAMING: 'Component Naming',
  CONTENT: 'Content Analysis',
  SEO: 'SEO Analysis',
  ANIMATION: 'Animation Analysis',
  ACCESSIBILITY: 'Accessibility',
  CODE_STYLE: 'Code Style',
  CMS: 'CMS Detection',
  BUILD: 'Build Fingerprints',
  NETWORK: 'Network Analysis',
  PERFORMANCE: 'Performance',
  TYPOGRAPHY: 'Typography',
  COLOR: 'Color Palette',
  COMMENTS: 'Comments Analysis',
  GIT_DEPLOY: 'Git & Deployment Clues',
} as const
