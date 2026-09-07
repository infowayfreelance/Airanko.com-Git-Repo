// ──────────────────────────────────────────────────────────────────────────
// Phase 12 — deterministic, personalized 2-month SEO roadmap. Replaces the
// old AI-generated sixMonthRoadmap (a free-text month/theme/keyTasks/
// deliverables/expectedOutcomes table the AI populated with generic
// "M3 content scaling + first link building"-style filler, invented for
// every report regardless of what the crawl actually found) with an 8-week
// plan built ONLY from findings already validated by earlier phases:
//
// - Month 1 "Fix & Optimize" (Weeks 1-4): Phase 3/11's onPagePriorityFixes
//   (critical/high/medium on-page + technical issues), Phase 5's sitewide
//   crawl/technical summary, and Phase 7/11's pageOpportunities entries
//   whose action is optimize/improve (an existing page, never a new one).
// - Month 2 "Growth & Expansion" (Weeks 5-8): Phase 7/11's pageOpportunities
//   entries whose action is create (new commercial/location/informational
//   pages — competitor/content gaps are already merged into this list by
//   page-opportunity.ts, so they are not re-sourced separately here), Phase
//   8/11's localSeoIntelligence.opportunities, and Phase 9/11's
//   offPageIntelligence.opportunities.
//
// Nothing here calls the AI. A category with no validated finding produces
// no task and no week — never a filled-in placeholder. Two different sites'
// findings always produce two different roadmaps, since every task is a
// direct projection of that site's own audit data.
// ──────────────────────────────────────────────────────────────────────────
import type { EvidenceSource, FindingConfidence, FindingPriority } from './evidence'
import type { PriorityFix } from './on-page-overview'
import type { TechnicalCrawlSummary } from './technical-summary'
import type { PageOpportunity } from './page-opportunity'
import type { LocalOpportunity } from './local-seo-intelligence'
import type { OffPageOpportunity } from './off-page-intelligence'

export type RoadmapMonthNumber = 1 | 2
export type RoadmapMonthFocus = 'Fix & Optimize' | 'Growth & Expansion'

export interface RoadmapTask {
  task: string
  /** The single most relevant affected URL, or null for a sitewide/multi-page task (see `affectedUrls`). Never an invented URL — either a real crawled page or a Phase 7-validated new-page slug. */
  url: string | null
  /** Every real affected URL when a task groups more than one page (Phase 12 spec §13 dedup) — always includes `url` when both are set. */
  affectedUrls: string[]
  category: string
  priority: FindingPriority
  reason: string
  confidence: FindingConfidence
  source: EvidenceSource
  completionCheck: string
  /** True only for a Low-confidence finding — rendered as a "review first" item, never a definite instruction (Phase 12 spec §14). */
  needsReview: boolean
}

export interface RoadmapWeek {
  week: number
  tasks: RoadmapTask[]
}

export interface RoadmapMonth {
  month: RoadmapMonthNumber
  focus: RoadmapMonthFocus
  weeks: RoadmapWeek[]
  /** Deduplicated completion checks across the month's own tasks — task/audit-based, never a traffic/ranking/backlink number (Phase 12 spec §10, reusing Phase 10's KPI rule). */
  successChecks: string[]
}

export interface TwoMonthRoadmap {
  months: RoadmapMonth[]
}

const PRIORITY_RANK: Record<FindingPriority, number> = { high: 3, medium: 2, low: 1 }

/** Confidence gating (spec §14) — a Low-confidence finding is never a major definite task; Not Evaluated has too little evidence to become a task at all. */
function includableConfidence(confidence: FindingConfidence): boolean {
  return confidence !== 'not_evaluated'
}

function phraseTask(text: string, confidence: FindingConfidence): string {
  return confidence === 'low' ? `Review: ${text}` : text
}

// ---------------------------------------------------------------------------
// Month 1, Week 1-2 — on-page + technical priority fixes (Phase 3/11).
// Grouped by category (spec §13): several pages needing the same category
// of fix become ONE task listing every affected URL, instead of one task
// per page.
// ---------------------------------------------------------------------------
function buildOnPageTasks(fixes: PriorityFix[]): RoadmapTask[] {
  const byCategory = new Map<string, PriorityFix[]>()
  for (const f of fixes) {
    if (!includableConfidence(f.confidence)) continue
    byCategory.set(f.category, [...(byCategory.get(f.category) ?? []), f])
  }

  const tasks: RoadmapTask[] = []
  for (const [category, group] of byCategory) {
    const urls = Array.from(new Set(group.map((f) => f.url)))
    const worst = group.reduce((a, b) => (PRIORITY_RANK[b.priority] > PRIORITY_RANK[a.priority] ? b : a))
    const confidence = group.some((f) => f.confidence === 'low') ? 'low' : worst.confidence
    const urlList = urls.length <= 3 ? urls.join(', ') : `${urls.slice(0, 3).join(', ')} (+${urls.length - 3} more)`
    const taskText =
      urls.length === 1
        ? `${worst.action} on ${urls[0]}`
        : `${worst.action} — applies to ${urls.length} page(s): ${urlList}`
    tasks.push({
      task: phraseTask(taskText, confidence),
      url: urls.length === 1 ? urls[0] : null,
      affectedUrls: urls,
      category,
      priority: worst.priority,
      reason: worst.reason,
      confidence,
      source: worst.source,
      completionCheck: `${category} issue(s) fixed and re-verified on the affected page(s).`,
      needsReview: confidence === 'low',
    })
  }
  return tasks
}

// ---------------------------------------------------------------------------
// Month 1 — sitewide technical/crawl issues (Phase 5) not already covered
// by a per-page PriorityFix (robots.txt / sitemap problems are sitewide,
// never attached to one URL).
// ---------------------------------------------------------------------------
function buildCrawlTasks(summary: TechnicalCrawlSummary): RoadmapTask[] {
  const tasks: RoadmapTask[] = []
  if (summary.robotsIssues > 0) {
    tasks.push({
      task: `Fix ${summary.robotsIssues} robots.txt issue(s) blocking important pages`,
      url: null,
      affectedUrls: [],
      category: 'Technical/Crawl',
      priority: 'high',
      reason: 'robots.txt rules can prevent search engines from crawling important pages entirely.',
      confidence: 'high',
      source: 'crawled',
      completionCheck: 'robots.txt no longer blocks any important page.',
      needsReview: false,
    })
  }
  if (summary.sitemapIssues > 0) {
    tasks.push({
      task: `Fix ${summary.sitemapIssues} sitemap issue(s)`,
      url: null,
      affectedUrls: [],
      category: 'Technical/Crawl',
      priority: 'medium',
      reason: 'A sitemap with broken/incorrect entries makes it harder for search engines to discover and prioritize pages.',
      confidence: 'high',
      source: 'crawled',
      completionCheck: 'Sitemap entries are valid and reflect the real site structure.',
      needsReview: false,
    })
  }
  return tasks
}

// ---------------------------------------------------------------------------
// Month 2 — new-page opportunities (Phase 7/11). Only `action === 'create'`
// ever lands here: 'optimize'/'improve' (an existing page) is a Month 1
// task instead (see buildExistingPageTasks), and Phase 7 already refuses
// to mark a cannibalization-risking recommendation as 'create' — so the
// "cannibalization resolution before new-page creation" dependency (spec
// §6/§8) holds by construction, never re-derived here.
// ---------------------------------------------------------------------------
function buildNewPageTasks(opportunities: PageOpportunity[]): RoadmapTask[] {
  return opportunities
    .filter((o) => o.action === 'create' && includableConfidence(o.confidence) && o.suggestedUrl)
    .map((o) => ({
      task: phraseTask(`Create "${o.suggestedTitle}" page targeting "${o.primaryKeyword}"`, o.confidence),
      url: o.suggestedUrl,
      affectedUrls: o.suggestedUrl ? [o.suggestedUrl] : [],
      category: 'New Page',
      priority: o.priority,
      reason: o.reason,
      confidence: o.confidence,
      source: o.competitorEvidence ? 'competitor_crawl' : 'calculated',
      completionCheck: 'New page published, indexed, and internally linked from at least one relevant page.',
      needsReview: o.confidence === 'low',
    }))
}

// ---------------------------------------------------------------------------
// Month 1 — existing-page improvements (Phase 7/11's 'optimize'/'improve'
// actions: a strong or partial existing match already covers the keyword,
// so the fix is to the existing page, never a new one).
// ---------------------------------------------------------------------------
function buildExistingPageTasks(opportunities: PageOpportunity[]): RoadmapTask[] {
  return opportunities
    .filter((o) => (o.action === 'optimize' || o.action === 'improve') && includableConfidence(o.confidence) && o.existingPage)
    .map((o) => ({
      task: phraseTask(`${o.action === 'optimize' ? 'Optimize' : 'Improve'} ${o.existingPage} for "${o.primaryKeyword}"`, o.confidence),
      url: o.existingPage,
      affectedUrls: o.existingPage ? [o.existingPage] : [],
      category: 'Existing Page',
      priority: o.priority,
      reason: o.reason,
      confidence: o.confidence,
      source: o.competitorEvidence ? 'competitor_crawl' : 'calculated',
      completionCheck: 'Existing page updated per the recommended action and re-checked against the target keyword.',
      needsReview: o.confidence === 'low',
    }))
}

// ---------------------------------------------------------------------------
// Month 2 — Local SEO (Phase 8/11). NAP consistency and LocalBusiness
// schema are data-integrity fixes closer in spirit to Month 1's technical
// work, so they're pulled forward into Month 1 instead of Month 2's
// keyword/location growth work — everything else stays in Month 2 per the
// spec's own "Local SEO improvements" bullet.
// ---------------------------------------------------------------------------
const LOCAL_DATA_INTEGRITY_TOPICS = new Set(['NAP consistency', 'LocalBusiness schema'])

function localOpportunityToTask(o: LocalOpportunity): RoadmapTask {
  return {
    task: phraseTask(`${o.action} (${o.topic})`, o.confidence),
    url: null,
    affectedUrls: [],
    category: 'Local SEO',
    priority: o.priority,
    reason: o.reason,
    confidence: o.confidence,
    source: o.source,
    completionCheck: 'Local SEO recommendation implemented and verified.',
    needsReview: o.confidence === 'low',
  }
}

function buildLocalTasks(opportunities: LocalOpportunity[], monthFilter: RoadmapMonthNumber): RoadmapTask[] {
  return opportunities
    .filter((o) => includableConfidence(o.confidence))
    .filter((o) => (monthFilter === 1 ? LOCAL_DATA_INTEGRITY_TOPICS.has(o.topic) : !LOCAL_DATA_INTEGRITY_TOPICS.has(o.topic)))
    .map(localOpportunityToTask)
}

// ---------------------------------------------------------------------------
// Month 2, Week 8 — off-page opportunities (Phase 9/11). Always last: "core
// site improvements before off-page promotion" (spec §6) — outreach for a
// page that doesn't exist or isn't fixed yet has nothing to point to.
// `avoid`-priority opportunities (the deliberate spam-pattern warning
// entries) are never turned into a task.
// ---------------------------------------------------------------------------
function buildOffPageTasks(opportunities: OffPageOpportunity[]): RoadmapTask[] {
  return opportunities
    .filter((o): o is OffPageOpportunity & { priority: FindingPriority } => o.priority !== 'avoid' && includableConfidence(o.confidence))
    .map((o) => ({
      task: phraseTask(`Pursue: ${o.type} (${o.targetType})`, o.confidence),
      url: o.recommendedPage,
      affectedUrls: o.recommendedPage ? [o.recommendedPage] : [],
      category: 'Off-Page',
      priority: o.priority,
      reason: o.reason,
      confidence: o.confidence,
      source: o.dataSource === 'ai_suggested' ? 'calculated' : o.dataSource,
      completionCheck: 'Outreach/citation/partnership completed for the identified opportunity.',
      needsReview: o.confidence === 'low',
    }))
}

// ---------------------------------------------------------------------------
// Week assignment — priority first (Critical/High before Medium/Low, spec
// §7), never dumping everything into Week 1. A bucket with no tasks
// produces no week at all (spec §3/§12) rather than an empty placeholder.
// ---------------------------------------------------------------------------
function distributeIntoWeeks(buckets: RoadmapTask[][], weekNumbers: number[]): RoadmapWeek[] {
  const weeks: RoadmapWeek[] = []
  for (let i = 0; i < buckets.length; i++) {
    const tasks = buckets[i].slice().sort((a, b) => PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority])
    if (tasks.length === 0) continue
    weeks.push({ week: weekNumbers[i], tasks })
  }
  return weeks
}

/** Removes an exact duplicate task (same category + same url) that could otherwise appear twice across different source buckets — spec §13. First occurrence wins. */
function dedupeTasks(tasks: RoadmapTask[]): RoadmapTask[] {
  const seen = new Set<string>()
  const out: RoadmapTask[] = []
  for (const t of tasks) {
    const key = `${t.category}::${t.url ?? ''}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(t)
  }
  return out
}

function buildMonth(month: RoadmapMonthNumber, focus: RoadmapMonthFocus, buckets: RoadmapTask[][], weekNumbers: number[]): RoadmapMonth {
  const deduped = buckets.map(dedupeTasks)
  const weeks = distributeIntoWeeks(deduped, weekNumbers)
  const successChecks = Array.from(new Set(weeks.flatMap((w) => w.tasks.map((t) => t.completionCheck))))
  return { month, focus, weeks, successChecks }
}

export interface RoadmapInputs {
  onPagePriorityFixes: PriorityFix[]
  technicalCrawlSummary: TechnicalCrawlSummary
  pageOpportunities: PageOpportunity[]
  localOpportunities: LocalOpportunity[]
  offPageOpportunities: OffPageOpportunity[]
}

export function buildTwoMonthRoadmap(inputs: RoadmapInputs): TwoMonthRoadmap {
  const onPageTasks = buildOnPageTasks(inputs.onPagePriorityFixes.filter((f) => f.category !== 'Internal Linking'))
  const internalLinkTasks = buildOnPageTasks(inputs.onPagePriorityFixes.filter((f) => f.category === 'Internal Linking'))
  const crawlTasks = buildCrawlTasks(inputs.technicalCrawlSummary)
  const existingPageTasks = buildExistingPageTasks(inputs.pageOpportunities)
  const localDataIntegrityTasks = buildLocalTasks(inputs.localOpportunities, 1)

  // Week 1: critical/high sitewide + on-page technical fixes.
  const week1 = [...crawlTasks, ...onPageTasks.filter((t) => t.category === 'Technical' || t.priority === 'high'), ...localDataIntegrityTasks].filter((t) => t.priority !== 'low')
  // Week 2: remaining on-page priority fixes not already placed in Week 1.
  const week2Set = new Set(week1)
  const week2 = onPageTasks.filter((t) => !week2Set.has(t))
  // Week 3: existing-page improvements (Phase 7 optimize/improve).
  const week3 = existingPageTasks
  // Week 4: internal-linking problems (depends on the on-page work above being settled first).
  const week4 = internalLinkTasks

  const month1 = buildMonth(1, 'Fix & Optimize', [week1, week2, week3, week4], [1, 2, 3, 4])

  const newPageTasks = buildNewPageTasks(inputs.pageOpportunities)
  const commercialNewPages = newPageTasks.filter((t) => t.priority === 'high')
  const supportingNewPages = newPageTasks.filter((t) => t.priority !== 'high')
  const localGrowthTasks = buildLocalTasks(inputs.localOpportunities, 2)
  const offPageTasks = buildOffPageTasks(inputs.offPageOpportunities)

  // Week 5: validated new commercial/service/location pages.
  const week5 = commercialNewPages
  // Week 6: remaining supporting/informational new pages + content gaps.
  const week6 = supportingNewPages
  // Week 7: Local SEO growth opportunities.
  const week7 = localGrowthTasks
  // Week 8: off-page — always last (depends on Weeks 1-7's core site work).
  const week8 = offPageTasks

  const month2 = buildMonth(2, 'Growth & Expansion', [week5, week6, week7, week8], [5, 6, 7, 8])

  return { months: [month1, month2] }
}
