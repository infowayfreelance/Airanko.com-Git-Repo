// ──────────────────────────────────────────────────────────────────────────
// Phase 11 — Evidence + Confidence system. A small, shared vocabulary that
// standardizes what every prior phase's recommendation modules were
// already doing informally (page-opportunity.ts, competitor-intelligence.ts,
// local-seo-intelligence.ts, off-page-intelligence.ts each independently
// carry a `reason`/`evidence`/`confidence`/`priority`-shaped record). This
// module does NOT replace any of those — it gives them one common `Finding`
// shape for validation, and the single rule engine
// (`validateFinding`/`runEvidenceContradictionChecks` in
// contradiction-checker.ts) that checks every one of them for the same
// invariants: no fabricated evidence, no AI-inferred claim presented as
// High confidence, no reference to a URL that was never crawled, no
// "not available" data used as if it were a fact.
// ──────────────────────────────────────────────────────────────────────────

/** Severity = how serious the problem is. Priority = how soon to act on it (severity + page importance + confidence + impact). Kept as two distinct fields everywhere in this system — never derived from one another implicitly. */
export type FindingPriority = 'high' | 'medium' | 'low'

/** Confidence reflects evidence QUALITY, never issue severity. "Not Evaluated" is for insufficient data — never silently coerced to "Low". */
export type FindingConfidence = 'high' | 'medium' | 'low' | 'not_evaluated'

/** Standardized data-source labels used across every phase's findings. `ai_inferred` must never be paired with High confidence — see validateFinding. */
export type EvidenceSource = 'crawled' | 'user_provided' | 'competitor_crawl' | 'calculated' | 'verified_api' | 'ai_inferred' | 'not_available'

/**
 * Standard finding shape (Phase 11 spec §1). Most fields are optional by
 * design: a simple PASS state or a minor finding should not be forced to
 * carry every field just to satisfy a schema — only `issue`/`confidence`/
 * `source` are required, since those three are what the contradiction
 * checker needs to validate against every other field present.
 */
export interface Finding {
  issue: string
  evidence?: string
  reason?: string
  action?: string
  severity?: 'critical' | 'high' | 'medium' | 'low' | 'info' | 'pass' | 'not_evaluated'
  priority?: FindingPriority
  confidence: FindingConfidence
  source: EvidenceSource
  affectedUrl?: string | null
}

/**
 * Deterministic confidence derivation from source + evidence quality
 * (Phase 11 spec §4/§13) — never a severity-based guess, never AI-assigned.
 * - `not_available`: no data exists to be confident about → Not Evaluated.
 * - `ai_inferred`: an AI-assisted semantic read, capped at Medium even with
 *   evidence present, and Low without any.
 * - everything else (crawled/user_provided/verified_api/competitor_crawl/
 *   calculated) is a direct or verifiable fact → High with evidence,
 *   Medium without it (evidence-less but still a real, sourced data point).
 */
export function deriveConfidenceFromSource(source: EvidenceSource, hasEvidence: boolean): FindingConfidence {
  if (source === 'not_available') return 'not_evaluated'
  if (source === 'ai_inferred') return hasEvidence ? 'medium' : 'low'
  return hasEvidence ? 'high' : 'medium'
}

// ─────────────────────────────────────────────────────────────────────────
// Adapters — one per existing recommendation module, each converting that
// module's own (already-computed, already-evidence-based) record into the
// common `Finding` view used purely for cross-cutting validation
// (runEvidenceContradictionChecks in contradiction-checker.ts). None of
// these change what the report actually displays — every module keeps its
// own richer, purpose-built shape; this is a read-only projection.
//
// Structural "Like" types (not the modules' real exported types) avoid a
// circular import between this module and on-page-overview.ts/
// page-opportunity.ts/etc. — the same pattern contradiction-checker.ts
// already uses throughout.
// ─────────────────────────────────────────────────────────────────────────

export interface PriorityFixLike {
  url: string
  category: string
  evidence: string
  reason: string
  action: string
  severity: Finding['severity']
  priority: FindingPriority
  confidence: FindingConfidence
  source: EvidenceSource
}

export function priorityFixToFinding(f: PriorityFixLike): Finding {
  return {
    issue: `${f.category} issue`,
    evidence: f.evidence,
    reason: f.reason,
    action: f.action,
    severity: f.severity,
    priority: f.priority,
    confidence: f.confidence,
    source: f.source,
    affectedUrl: f.url,
  }
}

export interface PageOpportunityLike {
  suggestedTitle: string
  reason: string
  competitorEvidence: string | null
  confidence: FindingConfidence
  priority: FindingPriority
  /** A real, already-crawled page this recommendation is about/conflicts with — never the new suggestedUrl, which by definition doesn't exist yet. */
  existingPage: string | null
}

export function pageOpportunityToFinding(o: PageOpportunityLike): Finding {
  return {
    issue: o.suggestedTitle,
    evidence: o.competitorEvidence ?? o.reason,
    reason: o.reason,
    priority: o.priority,
    confidence: o.confidence,
    source: o.competitorEvidence ? 'competitor_crawl' : 'calculated',
    affectedUrl: o.existingPage,
  }
}

export interface CompetitorGapLike {
  opportunity: string
  evidence: string
  confidence: FindingConfidence
  priority: FindingPriority
}

export function competitorGapToFinding(g: CompetitorGapLike): Finding {
  return { issue: g.opportunity, evidence: g.evidence, priority: g.priority, confidence: g.confidence, source: 'competitor_crawl' }
}

export interface LocalOpportunityLike {
  topic: string
  action: string
  reason: string
  evidence: string
  confidence: FindingConfidence
  priority: FindingPriority
  source: EvidenceSource
}

export function localOpportunityToFinding(o: LocalOpportunityLike): Finding {
  return { issue: o.topic, evidence: o.evidence, reason: o.reason, action: o.action, priority: o.priority, confidence: o.confidence, source: o.source }
}

export interface OffPageOpportunityLike {
  type: string
  reason: string
  priority: 'high' | 'medium' | 'low' | 'avoid'
  /** Off-page-intelligence.ts's own label; nothing in that module actually calls the AI (it's a static, deterministic classification), so it maps to `calculated` here, never `ai_inferred` — mapping it to ai_inferred would incorrectly flag its one deliberately-High-confidence "known spam pattern" entry as an overclaimed AI inference. */
  dataSource: 'crawled' | 'user_provided' | 'competitor_crawl' | 'verified_api' | 'ai_suggested' | 'not_available'
  confidence: FindingConfidence
  recommendedPage: string | null
}

export function offPageOpportunityToFinding(o: OffPageOpportunityLike): Finding {
  const source: EvidenceSource = o.dataSource === 'ai_suggested' ? 'calculated' : o.dataSource
  return { issue: o.type, evidence: o.reason, reason: o.reason, priority: o.priority === 'avoid' ? 'low' : o.priority, confidence: o.confidence, source, affectedUrl: o.recommendedPage }
}
