// ──────────────────────────────────────────────────────────────────────────
// Vibe Code Detector — detection engine
//
// This file contains ZERO detection knowledge. It only knows how to:
//   1. Run every Signal from the registry (signals.ts) against a SignalContext
//   2. Aggregate each triggered signal's vote/suppress weights into four
//      running totals (AI / Human / CMS / Hybrid)
//   3. Normalize those totals into probabilities and pick a winner
//   4. Produce a plain-language verdict, reasons, and positive/negative
//      signal lists for the report
//
// Adding a new detection rule NEVER requires touching this file — add a
// Signal object to signals.ts (or a new signals-*.ts file merged into the
// registry) and the engine picks it up automatically.
// ──────────────────────────────────────────────────────────────────────────

import type {
  Bucket, Signal, SignalContext, DetectionResult, TriggeredSignal, AiImageFinding, SignalConfidence,
} from './types'
import { ALL_SIGNALS } from './signals'

const BUCKETS: Bucket[] = ['ai', 'human', 'cms', 'hybrid']

const CLASSIFICATION_LABELS: Record<Bucket | 'unknown', string> = {
  ai: 'AI / Vibe Coded',
  human: 'Human Coded',
  cms: 'CMS Generated',
  hybrid: 'Hybrid (Human + AI)',
  unknown: 'Unknown',
}

function confidenceRank(c: SignalConfidence): number {
  return c === 'high' ? 3 : c === 'medium' ? 2 : 1
}

/**
 * Runs every registered signal against the given context and returns the
 * full detection result: probabilities, classification, reasons, and the
 * positive/negative/full signal lists used to build the report UI.
 */
export function runDetectionEngine(ctx: SignalContext, signals: Signal[] = ALL_SIGNALS): DetectionResult {
  const totals: Record<Bucket, number> = { ai: 0, human: 0, cms: 0, hybrid: 0 }
  const triggered: TriggeredSignal[] = []
  const triggeredIds = new Set<string>()

  const phase1 = signals.filter((s) => !s.dependsOn || s.dependsOn.length === 0)
  const phase2 = signals.filter((s) => s.dependsOn && s.dependsOn.length > 0)

  const runOne = (signal: Signal, prior?: ReadonlySet<string>) => {
    let evalResult
    try {
      evalResult = signal.evaluate(ctx, prior)
    } catch (err) {
      // A broken rule must never take down the whole report.
      console.error(`[vibe-detector] signal "${signal.id}" threw:`, err)
      return
    }
    if (!evalResult || !evalResult.triggered) return

    const strength = evalResult.strength === undefined ? 1 : Math.max(0, Math.min(1, evalResult.strength))
    triggeredIds.add(signal.id)

    const votes: Partial<Record<Bucket, number>> = {}
    for (const bucket of BUCKETS) {
      const ratio = signal.voteWeights[bucket]
      if (!ratio) continue
      const contribution = signal.weight * (signal.positiveScore / 100) * ratio * strength
      totals[bucket] += contribution
      votes[bucket] = Math.round(contribution * 10) / 10
    }

    const suppresses: Partial<Record<Bucket, number>> = {}
    if (signal.suppressWeights) {
      for (const bucket of BUCKETS) {
        const ratio = signal.suppressWeights[bucket]
        if (!ratio) continue
        const reduction = signal.weight * (signal.negativeScore / 100) * ratio * strength
        totals[bucket] = Math.max(0, totals[bucket] - reduction)
        suppresses[bucket] = Math.round(reduction * 10) / 10
      }
    }

    triggered.push({
      id: signal.id,
      name: signal.name,
      description: signal.description,
      category: signal.category,
      confidence: signal.confidence,
      falsePositiveRisk: signal.falsePositiveRisk,
      priority: signal.priority,
      weight: signal.weight,
      evidence: evalResult.evidence,
      votes,
      suppresses,
      meta: evalResult.meta,
    })
  }

  for (const s of phase1) runOne(s)
  for (const s of phase2) runOne(s, triggeredIds)

  // ── Normalize to probabilities ──
  const sumTotals = BUCKETS.reduce((s, b) => s + totals[b], 0)
  const probabilities: Record<Bucket, number> = { ai: 0, human: 0, cms: 0, hybrid: 0 }
  if (sumTotals <= 0) {
    // No signal fired at all — genuinely unknown. Split evenly with a human lean
    // (absence of any AI/CMS fingerprint is itself weak evidence of a plain build).
    probabilities.human = 55
    probabilities.ai = 15
    probabilities.cms = 15
    probabilities.hybrid = 15
  } else {
    for (const b of BUCKETS) probabilities[b] = Math.round((totals[b] / sumTotals) * 1000) / 10
    // Fix rounding drift so the four probabilities sum to exactly 100.
    const drift = Math.round((100 - BUCKETS.reduce((s, b) => s + probabilities[b], 0)) * 10) / 10
    if (drift !== 0) {
      const top = BUCKETS.reduce((a, b) => (probabilities[b] > probabilities[a] ? b : a), 'human' as Bucket)
      probabilities[top] = Math.round((probabilities[top] + drift) * 10) / 10
    }
  }

  // ── Classification ──
  let classification: Bucket | 'unknown' = 'unknown'
  let topProb = -1
  for (const b of BUCKETS) {
    if (probabilities[b] > topProb) { topProb = probabilities[b]; classification = b }
  }
  const sorted = [...BUCKETS].sort((a, b) => probabilities[b] - probabilities[a])
  const margin = probabilities[sorted[0]] - probabilities[sorted[1]]
  if (sumTotals <= 0 || topProb < 30) classification = 'unknown'

  // ── Confidence ──
  const highConfTriggered = triggered.filter((t) => t.confidence === 'high' && Object.keys(t.votes).length > 0)
  let confidence: SignalConfidence
  if (classification === 'unknown') confidence = 'low'
  else if (margin >= 30 && highConfTriggered.length >= 2) confidence = 'high'
  else if (margin >= 15 || highConfTriggered.length >= 1) confidence = 'medium'
  else confidence = 'low'

  // ── Positive / negative signal split (relative to the winning classification) ──
  const positiveSignals = triggered
    .filter((t) => classification !== 'unknown' && (t.votes[classification as Bucket] ?? 0) > 0)
    .sort((a, b) => (b.votes[classification as Bucket] ?? 0) - (a.votes[classification as Bucket] ?? 0))

  const negativeSignals = triggered
    .filter((t) => classification !== 'unknown' && (t.suppresses[classification as Bucket] ?? 0) > 0)
    .sort((a, b) => (b.suppresses[classification as Bucket] ?? 0) - (a.suppresses[classification as Bucket] ?? 0))

  const allTriggeredSignals = [...triggered].sort((a, b) => {
    if (a.category !== b.category) return a.category.localeCompare(b.category)
    return b.priority - a.priority
  })

  // ── Reasons (top contributing signals, in plain language) ──
  const reasons = positiveSignals.slice(0, 6).map((s) => `${s.name}: ${s.evidence[0] ?? s.description}`)
  if (reasons.length === 0 && classification !== 'unknown') {
    reasons.push('No individually strong signal fired — this verdict is based on the overall absence of contrary evidence.')
  }

  // ── Detected technologies (dedupe by name across all triggered signals' meta.technology) ──
  const techMap = new Map<string, { name: string; category: string; evidence: string[] }>()
  for (const t of triggered) {
    const tech = t.meta?.technology as { name: string } | undefined
    if (!tech?.name) continue
    const existing = techMap.get(tech.name)
    if (existing) {
      for (const e of t.evidence) if (!existing.evidence.includes(e)) existing.evidence.push(e)
    } else {
      techMap.set(tech.name, { name: tech.name, category: t.category, evidence: [...t.evidence] })
    }
  }

  // ── AI image findings (collected from any signal that reports them) ──
  const aiImageFindings: AiImageFinding[] = []
  for (const t of triggered) {
    const findings = t.meta?.aiImageFindings as AiImageFinding[] | undefined
    if (findings) aiImageFindings.push(...findings)
  }

  const verdictText = buildVerdictText(classification, confidence, probabilities, triggered)

  return {
    probabilities,
    classification,
    classificationLabel: CLASSIFICATION_LABELS[classification],
    confidence,
    verdictText,
    reasons,
    positiveSignals,
    negativeSignals,
    allTriggeredSignals,
    detectedTechnologies: Array.from(techMap.values()),
    aiImageFindings,
    totalSignalsEvaluated: signals.length,
    totalSignalsTriggered: triggered.length,
  }
}

function buildVerdictText(
  classification: Bucket | 'unknown',
  confidence: SignalConfidence,
  probabilities: Record<Bucket, number>,
  triggered: TriggeredSignal[],
): string {
  const confWord = confidence === 'high' ? 'high confidence' : confidence === 'medium' ? 'moderate confidence' : 'low confidence'
  const topNames = (bucket: Bucket) => triggered
    .filter((t) => (t.votes[bucket] ?? 0) > 0)
    .sort((a, b) => (b.votes[bucket] ?? 0) - (a.votes[bucket] ?? 0))
    .slice(0, 3)
    .map((t) => t.name)

  switch (classification) {
    case 'cms': {
      const names = topNames('cms')
      return `This site shows strong forensic evidence of being CMS-generated${names.length ? ` (${names.join(', ')})` : ''}, with ${probabilities.cms}% probability at ${confWord}. Its markup follows template and page-builder patterns rather than hand-written or AI-scaffolded code.`
    }
    case 'ai': {
      const names = topNames('ai')
      return `This site shows strong forensic evidence of AI-assisted ("vibe coded") generation${names.length ? ` (${names.join(', ')})` : ''}, with ${probabilities.ai}% probability at ${confWord}. This is a probabilistic forensic assessment, not proof — treat it as a strong indicator, not a certainty.`
    }
    case 'hybrid': {
      const humanNames = topNames('human')
      const aiNames = topNames('ai')
      return `This site shows a mix of human-authored and AI-generated characteristics (${probabilities.hybrid}% hybrid probability, ${confWord}). ${aiNames.length ? `AI-leaning signals: ${aiNames.join(', ')}. ` : ''}${humanNames.length ? `Human-leaning signals: ${humanNames.join(', ')}.` : ''}`.trim()
    }
    case 'human': {
      const names = topNames('human')
      return `This site shows characteristics consistent with hand-written, human-authored code${names.length ? ` (${names.join(', ')})` : ''}, with ${probabilities.human}% probability at ${confWord}. No definitive AI-tool or CMS fingerprints were found.`
    }
    default:
      return `We couldn't gather enough distinguishing evidence to reach a confident verdict. This can happen with very small pages, minimal markup, or sources where key signals (headers, images, generator tags) aren't available. Treat this result as inconclusive.`
  }
}
