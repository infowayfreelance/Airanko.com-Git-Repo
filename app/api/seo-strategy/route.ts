import { generateText, Output } from 'ai'
import { openai } from '@ai-sdk/openai'
import * as z from 'zod'
import type { SiteAnalysis } from './analyze/route'

export const maxDuration = 60

// ---------------------------------------------------------------------------
// Strategy schema
// (Uses .nullable() instead of .optional() per AI SDK 6 + OpenAI strict mode.)
// ---------------------------------------------------------------------------
const strategySchema = z.object({
  overallHealthScore: z
    .number()
    .int()
    .min(0)
    .max(100)
    .describe('Overall SEO health score from 0-100 based on the site analysis'),

  healthScoreBreakdown: z.object({
    technical: z.number().int().min(0).max(100),
    onPage: z.number().int().min(0).max(100),
    content: z.number().int().min(0).max(100),
    offPage: z.number().int().min(0).max(100),
    local: z.number().int().min(0).max(100),
  }),

  executiveSummary: z
    .string()
    .describe('3-5 sentence professional executive summary for the client'),

  criticalIssues: z
    .array(
      z.object({
        title: z.string(),
        impact: z.enum(['critical', 'high', 'medium']),
        description: z.string(),
        howToFix: z.string(),
        estimatedEffort: z.enum(['low', 'medium', 'high']),
      }),
    )
    .min(3)
    .max(8),

  quickWins: z
    .array(
      z.object({
        title: z.string(),
        description: z.string(),
        expectedImpact: z.string(),
      }),
    )
    .min(3)
    .max(6),

  technicalSeoAudit: z.object({
    summary: z.string(),
    checklist: z
      .array(
        z.object({
          item: z.string(),
          status: z.enum(['pass', 'warning', 'fail', 'not-applicable']),
          priority: z.enum(['critical', 'high', 'medium', 'low']),
          finding: z.string().describe('What was actually found on the site'),
          recommendation: z.string(),
        }),
      )
      .min(8)
      .max(15),
  }),

  onPageAudit: z.object({
    summary: z.string(),
    metaTitles: z.object({
      finding: z.string(),
      recommendation: z.string(),
    }),
    metaDescriptions: z.object({
      finding: z.string(),
      recommendation: z.string(),
    }),
    headingStructure: z.object({
      finding: z.string(),
      recommendation: z.string(),
    }),
    openGraph: z.object({
      finding: z.string(),
      recommendation: z.string(),
    }),
    twitterCards: z.object({
      finding: z.string(),
      recommendation: z.string(),
    }),
    schemaMarkup: z.object({
      finding: z.string(),
      recommendedTypes: z.array(z.string()).min(2).max(8),
      recommendation: z.string(),
    }),
    internalLinking: z.object({
      finding: z.string(),
      recommendation: z.string(),
    }),
    imageOptimization: z.object({
      finding: z.string(),
      recommendation: z.string(),
    }),
  }),

  pageByPageAudit: z
    .array(
      z.object({
        url: z.string(),
        currentTitle: z.string().nullable(),
        suggestedTitle: z.string(),
        currentMetaDescription: z.string().nullable(),
        suggestedMetaDescription: z.string(),
        primaryKeyword: z.string(),
        issues: z.array(z.string()).min(1).max(6),
        recommendations: z.array(z.string()).min(2).max(5),
      }),
    )
    .min(2)
    .max(10),

  keywordStrategy: z.object({
    summary: z.string(),
    primaryKeywords: z
      .array(
        z.object({
          keyword: z.string(),
          intent: z.enum(['informational', 'navigational', 'transactional', 'commercial']),
          difficulty: z.enum(['low', 'medium', 'high']),
          priority: z.enum(['high', 'medium', 'low']),
          targetPage: z.string().describe('Existing or new page URL/slug to target this keyword'),
        }),
      )
      .min(8)
      .max(15),
    longTailKeywords: z
      .array(
        z.object({
          keyword: z.string(),
          intent: z.enum(['informational', 'navigational', 'transactional', 'commercial']),
        }),
      )
      .min(8)
      .max(15),
    contentClusters: z
      .array(
        z.object({
          pillarTopic: z.string(),
          pillarKeyword: z.string(),
          supportingKeywords: z.array(z.string()).min(4).max(8),
        }),
      )
      .min(2)
      .max(5),
  }),

  pagesToCreate: z
    .array(
      z.object({
        suggestedUrl: z.string().describe('Suggested URL slug e.g. /services/seo-audit'),
        title: z.string(),
        targetKeyword: z.string(),
        searchIntent: z.enum(['informational', 'navigational', 'transactional', 'commercial']),
        purpose: z.string().describe('Why this page is needed'),
        contentBrief: z.string().describe('A detailed content brief / writing prompt for the writer'),
        suggestedWordCount: z.number().int().min(300).max(5000),
        keyHeadings: z.array(z.string()).min(4).max(10).describe('H2 headings for the page'),
        ctaSuggestion: z.string(),
      }),
    )
    .min(4)
    .max(10),

  blogIdeas: z
    .array(
      z.object({
        title: z.string(),
        targetKeyword: z.string(),
        searchIntent: z.enum(['informational', 'navigational', 'transactional', 'commercial']),
        suggestedWordCount: z.number().int().min(800).max(4000),
        outline: z.array(z.string()).min(4).max(10),
        contentBrief: z.string(),
      }),
    )
    .min(8)
    .max(15),

  competitorAnalysis: z
    .array(
      z.object({
        name: z.string(),
        url: z.string(),
        strengths: z.array(z.string()).min(2).max(5),
        weaknesses: z.array(z.string()).min(2).max(5),
        opportunitiesToOutrank: z.array(z.string()).min(2).max(5),
        contentGaps: z.array(z.string()).min(2).max(5),
      }),
    ),

  localSeo: z.object({
    applicable: z.boolean(),
    napConsistency: z.object({
      websiteNap: z.object({
        name: z.string().nullable(),
        addresses: z.array(z.string()),
        phones: z.array(z.string()),
      }),
      issues: z.array(z.string()),
      recommendations: z.array(z.string()),
    }),
    googleBusinessProfileTips: z.array(z.string()),
    localCitations: z.array(z.string()).describe('Recommended local directory citations'),
    reviewStrategy: z.string(),
    localContentIdeas: z.array(z.string()),
  }),

  offPageStrategy: z.object({
    summary: z.string(),
    costDisclaimer: z
      .string()
      .describe('Note that off-page/backlinks are costly but yield highest results'),
    backlinkTactics: z
      .array(
        z.object({
          tactic: z.string(),
          description: z.string(),
          estimatedCost: z.enum(['free', 'low', 'medium', 'high', 'very-high']),
          difficulty: z.enum(['easy', 'medium', 'hard']),
          expectedImpact: z.enum(['low', 'medium', 'high']),
          monthlyTargetLinks: z.number().int().min(1).max(50),
        }),
      )
      .min(5)
      .max(8),
    guestPostTargets: z.array(z.string()).min(3).max(8),
    digitalPrTactics: z.array(z.string()).min(2).max(5),
    socialSignals: z.array(z.string()).min(2).max(5),
  }),

  sixMonthRoadmap: z
    .array(
      z.object({
        month: z.number().int().min(1).max(6),
        theme: z.string(),
        focus: z.string(),
        keyTasks: z.array(z.string()).min(4).max(8),
        deliverables: z.array(z.string()).min(2).max(5),
        expectedOutcomes: z.array(z.string()).min(2).max(5),
      }),
    )
    .length(6),

  kpiTargets: z
    .array(
      z.object({
        metric: z.string(),
        baseline: z.string(),
        month3Target: z.string(),
        month6Target: z.string(),
        month12Target: z.string(),
      }),
    )
    .min(6)
    .max(10),

  toolStack: z.object({
    free: z.array(z.string()).min(3).max(8),
    paid: z.array(z.string()).min(3).max(8),
  }),

  riskAssessment: z.array(
    z.object({
      risk: z.string(),
      likelihood: z.enum(['low', 'medium', 'high']),
      mitigation: z.string(),
    }),
  ).min(3).max(5),

  conclusion: z.string().describe('Closing professional note to the client'),
})

export type SeoStrategy = z.infer<typeof strategySchema>

// ---------------------------------------------------------------------------
// Input validation
// ---------------------------------------------------------------------------
const inputSchema = z.object({
  websiteUrl: z.string().min(1),
  businessName: z.string().min(1),
  gmbUrl: z.string(),
  isLocal: z.boolean(),
  keywords: z.string(),
  competitors: z.array(z.string()),
  location: z.string(),
  industry: z.string(),
  notes: z.string(),
  analysis: z.any(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = inputSchema.safeParse(body)

    if (!parsed.success) {
      return Response.json(
        { error: 'Invalid input', issues: parsed.error.issues },
        { status: 400 },
      )
    }

    const input = parsed.data
    const analysis = input.analysis as SiteAnalysis | null

    // Build a compact but rich analysis summary for the prompt
    const analysisDigest = analysis
      ? buildAnalysisDigest(analysis)
      : 'No automated site analysis available. Generate strategy based on the business inputs alone.'

    const competitorList =
      input.competitors.filter(Boolean).length > 0
        ? input.competitors.filter(Boolean).join(', ')
        : 'None provided.'

    const keywordsSection = input.keywords.trim()
      ? `User-provided keywords (from Semrush/Ahrefs/Google Keyword Planner — use these as the foundation):\n${input.keywords.trim()}`
      : 'No user keywords provided. Generate realistic keywords based on the business and analyzed content.'

    const localContext =
      input.isLocal && input.gmbUrl
        ? `LOCAL BUSINESS — GMB URL: ${input.gmbUrl}. Location: ${input.location || 'not specified'}. Pay close attention to NAP consistency between the website and Google Business Profile. Recommend a thorough local SEO strategy including citations, reviews, and local content.`
        : input.isLocal
          ? `LOCAL BUSINESS — Location: ${input.location || 'not specified'}. No GMB URL provided — recommend setting one up.`
          : 'Not a local business — set localSeo.applicable to false but still populate fields with brief generic guidance.'

    const prompt = `You are a senior SEO strategist with 15+ years of experience producing client-ready strategy reports. Generate a comprehensive, professional, data-driven SEO strategy that will impress an enterprise client.

CLIENT INFORMATION
- Business Name: ${input.businessName}
- Website: ${input.websiteUrl}
- Industry: ${input.industry || 'Infer from analyzed content'}
- Primary Location: ${input.location || 'Not specified'}
- Local Business: ${input.isLocal ? 'Yes' : 'No'}
- Google Business Profile: ${input.gmbUrl || 'Not provided'}
- Competitors: ${competitorList}
- Additional Notes: ${input.notes || 'None'}

${localContext}

${keywordsSection}

LIVE SITE ANALYSIS (this is real data crawled from the actual website — base your audit on this)
${analysisDigest}

INSTRUCTIONS
1. The "criticalIssues" and "quickWins" must be based on actual findings from the live analysis above — quote real numbers (load times, missing tags, etc.).
2. The "technicalSeoAudit.checklist" must reflect the real state of the site (mark items pass/warning/fail based on the analysis).
3. "pageByPageAudit" must include the actual URLs from the crawled pages with concrete, rewritten title tags and meta descriptions tailored to each page's purpose. Cover at least the homepage and 4-6 other crawled pages.
4. "pagesToCreate" must identify content gaps based on the user keywords and missing topics — write a real content brief for each.
5. "blogIdeas" must use the user-supplied keywords (or supplement intelligently) and provide writer-ready outlines.
6. "keywordStrategy" must prioritize the user's keyword list when available; map each primary keyword to a target page (existing URL from the crawl or a slug from pagesToCreate).
7. "competitorAnalysis" — analyze each provided competitor; if none provided, return an empty array.
8. "localSeo" — extract NAP from the analysis; flag any inconsistencies. If the business is not local, set applicable=false but still fill arrays with at least 1 item each.
9. "offPageStrategy.costDisclaimer" — explicitly state that backlink/off-page work is among the most expensive line items but delivers the highest ROI when done with quality (DR40+, topical relevance) and that cheap link-building is risky.
10. "sixMonthRoadmap" — exactly 6 months. Month 1 = foundation/fixes. Month 2 = on-page + content launch. Month 3 = content scaling + first link building. Month 4 = authority + technical refinement. Month 5 = aggressive content + outreach. Month 6 = consolidation, conversion optimization, reporting.
11. "kpiTargets" — realistic baselines and progressive targets for organic sessions, keyword rankings, indexed pages, backlinks, domain rating, conversions, and CTR.
12. "overallHealthScore" — be honest. A site with many critical issues should score 30-50; a polished site 70-90.
13. Tone: confident, prescriptive, professional. No fluff. Every recommendation must be actionable.`

    const { output } = await generateText({
      model: openai('gpt-4o-mini'),
      output: Output.object({ schema: strategySchema }),
      prompt,
    })

    return Response.json({ strategy: output })
  } catch (err) {
    console.error('[v0] SEO strategy generation error:', err)
    const message =
      err instanceof Error ? err.message : 'Failed to generate strategy'
    return Response.json({ error: message }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// Build a compact text digest of the live site analysis for the prompt
// ---------------------------------------------------------------------------
function buildAnalysisDigest(a: SiteAnalysis): string {
  const lines: string[] = []
  lines.push(`Domain: ${a.domain}`)
  lines.push(`HTTPS: ${a.isHttps ? 'Yes' : 'NO — critical issue'}`)
  lines.push(`Pages crawled: ${a.totalPagesCrawled}`)
  lines.push(`Avg load time: ${a.technicalSummary.averageLoadTimeMs}ms`)
  lines.push(`Avg word count: ${a.technicalSummary.averageWordCount}`)
  lines.push('')
  lines.push('TECHNICAL SUMMARY:')
  lines.push(`- robots.txt: ${a.robotsTxt.found ? 'found' : 'MISSING'}${a.robotsTxt.disallowsAll ? ' (DISALLOWS ALL — critical!)' : ''}`)
  lines.push(`- XML sitemap: ${a.sitemapXml.found ? `found (${a.sitemapXml.urlCount} URLs)` : 'MISSING'}`)
  lines.push(`- HTML sitemap: ${a.htmlSitemap.found ? 'found' : 'missing'}`)
  lines.push(`- Pages with canonical: ${a.technicalSummary.hasCanonicals}/${a.totalPagesCrawled}`)
  lines.push(`- Pages with meta description: ${a.technicalSummary.hasMetaDescriptions}/${a.totalPagesCrawled}`)
  lines.push(`- Pages with single H1: ${a.technicalSummary.hasH1}/${a.totalPagesCrawled} (missing: ${a.technicalSummary.missingH1}, multiple: ${a.technicalSummary.multipleH1})`)
  lines.push(`- Pages with schema markup: ${a.technicalSummary.hasSchema}/${a.totalPagesCrawled}`)
  lines.push(`- Pages with full Open Graph: ${a.technicalSummary.hasOgTags}/${a.totalPagesCrawled}`)
  lines.push(`- Pages with Twitter cards: ${a.technicalSummary.hasTwitterTags}/${a.totalPagesCrawled}`)
  lines.push('')
  lines.push('NAP / CONTACT INFO EXTRACTED FROM SITE:')
  lines.push(`- Phones: ${a.contactInfo.phones.join(' | ') || 'none found'}`)
  lines.push(`- Emails: ${a.contactInfo.emails.join(' | ') || 'none found'}`)
  lines.push(`- Addresses: ${a.contactInfo.addresses.join(' | ') || 'none found'}`)
  lines.push('')
  lines.push('PAGES CRAWLED:')
  const allPages = [a.homepage, ...a.pages].filter(Boolean)
  for (const p of allPages.slice(0, 10)) {
    if (!p) continue
    lines.push(`* ${p.url}`)
    lines.push(`  - Title (${p.titleLength} chars): ${p.title || 'MISSING'}`)
    lines.push(`  - Meta desc (${p.metaDescriptionLength} chars): ${p.metaDescription || 'MISSING'}`)
    lines.push(`  - H1 (${p.h1.length}): ${p.h1.slice(0, 2).join(' | ') || 'MISSING'}`)
    lines.push(`  - H2 count: ${p.h2.length}, H3 count: ${p.h3.length}`)
    lines.push(`  - Word count: ${p.wordCount}`)
    lines.push(`  - Schema: ${p.schemaTypes.join(', ') || 'none'}`)
    lines.push(`  - OG tags: ${Object.keys(p.ogTags).length}, Twitter tags: ${Object.keys(p.twitterTags).length}`)
    lines.push(`  - Images: ${p.imageCount} (${p.imagesWithoutAlt} missing alt)`)
    lines.push(`  - Internal links: ${p.internalLinkCount}, External: ${p.externalLinkCount}`)
    lines.push(`  - Load time: ${p.loadTimeMs}ms`)
    if (p.issues.length > 0) lines.push(`  - Issues: ${p.issues.join('; ')}`)
  }
  return lines.join('\n')
}
