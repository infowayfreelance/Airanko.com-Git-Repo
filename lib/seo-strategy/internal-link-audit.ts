// ──────────────────────────────────────────────────────────────────────────
// Phase 2B — deterministic internal-linking audit: link graph (incoming/
// outgoing/contextual), orphan/weak-page detection, broken-link surfacing,
// and anchor-text quality. Built entirely from PageAnalysis.linkDetails
// (classified nav/header/footer/content at crawl time) and
// SiteAnalysis.brokenInternalLinks (bounded status checks done during the
// crawl) — the AI never decides link counts or broken-link status.
// ──────────────────────────────────────────────────────────────────────────
import type { PageAnalysis } from '@/app/api/seo-strategy/analyze/route'
import { pickHighestSeverity } from './severity'
import type { AnchorIssue, BrokenLinkRecord, ConfidenceLevel, InternalLinksAudit, OnPageStatus, PageImportance, Severity } from './types'
import { EXCESSIVE_ANCHOR_REPETITION, GENERIC_ANCHOR_TEXTS, WEAK_INCOMING_LINK_THRESHOLD_DEFAULT, WEAK_INCOMING_LINK_THRESHOLD_IMPORTANT } from './phase2b-thresholds'

export interface LinkGraphNode {
  /** Unique source page URLs linking here. */
  incoming: string[]
  /** Subset of `incoming` where the link was in body content, not nav/header/footer. */
  contextualIncoming: string[]
}

/** One pass over every crawled page's linkDetails to build the whole site's incoming-link graph — reused by every page's per-page evaluation rather than recomputed per page. */
export function buildLinkGraph(pages: PageAnalysis[]): Map<string, LinkGraphNode> {
  const graph = new Map<string, LinkGraphNode>()
  const ensure = (url: string): LinkGraphNode => {
    let node = graph.get(url)
    if (!node) {
      node = { incoming: [], contextualIncoming: [] }
      graph.set(url, node)
    }
    return node
  }
  for (const page of pages) {
    const seenTargets = new Set<string>()
    for (const link of page.linkDetails) {
      if (seenTargets.has(link.href)) continue // one page linking to the same target twice (e.g. image + text) still counts as one incoming link
      seenTargets.add(link.href)
      const node = ensure(link.href)
      node.incoming.push(page.url)
      if (link.location === 'content') node.contextualIncoming.push(page.url)
    }
  }
  return graph
}

/** Sitewide count of each normalized contextual anchor text — the basis for "same anchor excessively reused" detection (nav/footer/header anchors are expected to repeat, e.g. every page's "Home" link, so only contextual body anchors count). */
export function computeSitewideAnchorCounts(pages: PageAnalysis[]): Map<string, number> {
  const counts = new Map<string, number>()
  for (const page of pages) {
    for (const link of page.linkDetails) {
      if (link.location !== 'content') continue
      const anchor = link.anchorText.trim().toLowerCase()
      if (!anchor) continue
      counts.set(anchor, (counts.get(anchor) ?? 0) + 1)
    }
  }
  return counts
}

function evaluateAnchors(page: PageAnalysis, sitewideAnchorCounts: Map<string, number>): AnchorIssue[] {
  const issues: AnchorIssue[] = []
  const seenTargets = new Set<string>()
  for (const link of page.linkDetails) {
    if (link.location !== 'content') continue // nav/header/footer anchors ("Home", "Contact") are expected to be short/generic — only contextual body links matter for anchor-text quality
    if (seenTargets.has(link.href)) continue
    seenTargets.add(link.href)

    const anchor = link.anchorText.trim()
    if (!anchor) {
      issues.push({ target: link.href, anchor: '', issue: 'Empty anchor text.' })
      continue
    }
    const normalized = anchor.toLowerCase()
    if (GENERIC_ANCHOR_TEXTS.has(normalized)) {
      issues.push({ target: link.href, anchor, issue: 'Generic anchor text ("click here"/"read more" style) — a descriptive anchor helps both users and search engines.' })
      continue
    }
    const repeatCount = sitewideAnchorCounts.get(normalized) ?? 0
    if (repeatCount >= EXCESSIVE_ANCHOR_REPETITION) {
      issues.push({
        target: link.href,
        anchor,
        issue: `Anchor text "${anchor}" is reused ${repeatCount} times sitewide — natural anchor diversity is preferred over the same exact phrase everywhere.`,
      })
    }
  }
  return issues
}

export function evaluateInternalLinks(
  page: PageAnalysis,
  graph: Map<string, LinkGraphNode>,
  importance: PageImportance,
  crawlCoverage: 'full' | 'partial',
  siteBrokenLinks: BrokenLinkRecord[],
  sitewideAnchorCounts: Map<string, number>,
  homepageUrl: string | null,
): InternalLinksAudit {
  const issues: string[] = []
  const severities: Severity[] = []

  const outgoing = page.linkDetails.length
  const uniqueOutgoing = new Set(page.linkDetails.map((l) => l.href)).size
  const contextualOutgoing = new Set(page.linkDetails.filter((l) => l.location === 'content').map((l) => l.href)).size

  const node = graph.get(page.url)
  const incoming = node?.incoming.length ?? 0
  const contextualIncoming = node?.contextualIncoming.length ?? 0
  const isHomepage = !!homepageUrl && page.url === homepageUrl

  let orphan = false
  let orphanConfidence: ConfidenceLevel | null = null
  if (!isHomepage && incoming === 0) {
    orphan = true
    orphanConfidence = crawlCoverage === 'full' ? 'high' : 'medium'
    issues.push(
      crawlCoverage === 'full'
        ? 'No internal links point to this page from anywhere on the site.'
        : 'No internal links to this page were found, but the crawl only covered part of the site — this may be an artifact of incomplete crawl coverage rather than a confirmed orphan page.',
    )
    severities.push(crawlCoverage === 'full' ? 'high' : 'medium')
  }

  const weakThreshold = importance === 'high' ? WEAK_INCOMING_LINK_THRESHOLD_IMPORTANT : WEAK_INCOMING_LINK_THRESHOLD_DEFAULT
  const weaklyLinked = !isHomepage && !orphan && incoming < weakThreshold
  if (weaklyLinked) {
    issues.push(
      `Only ${incoming} internal link${incoming === 1 ? '' : 's'} point${incoming === 1 ? 's' : ''} to this${importance === 'high' ? ', important,' : ''} page — consider linking to it from more related content.`,
    )
    severities.push(importance === 'high' ? 'medium' : 'low')
  } else if (!orphan && incoming > 0 && contextualIncoming === 0) {
    issues.push('All incoming internal links come from navigation/header/footer — no contextual body links point to this page.')
    severities.push('low')
  }

  const brokenLinks = siteBrokenLinks.filter((b) => b.source === page.url)
  if (brokenLinks.length > 0) {
    issues.push(`${brokenLinks.length} broken internal link${brokenLinks.length === 1 ? '' : 's'} found on this page.`)
    severities.push(importance === 'high' ? 'high' : 'medium')
  }

  const anchorIssues = evaluateAnchors(page, sitewideAnchorCounts)
  if (anchorIssues.length > 0) {
    issues.push(`${anchorIssues.length} internal link anchor(s) on this page need attention (empty, generic, or over-repeated text).`)
    severities.push('low')
  }

  if (issues.length === 0) severities.push('pass')
  const worst = pickHighestSeverity(severities)
  const status: OnPageStatus = issues.length === 0 ? 'good' : worst === 'high' || worst === 'critical' ? 'poor' : 'needs_improvement'

  return {
    outgoing,
    uniqueOutgoing,
    incoming,
    uniqueIncoming: incoming,
    contextualOutgoing,
    contextualIncoming,
    orphan,
    orphanConfidence,
    weaklyLinked,
    brokenLinks,
    anchorIssues,
    status,
    severity: worst,
    issues,
  }
}
