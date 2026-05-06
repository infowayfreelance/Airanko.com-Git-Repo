import { generateText, Output, NoObjectGeneratedError } from 'ai'
import { openai } from '@ai-sdk/openai'
import * as z from 'zod'
import type { SiteAnalysis } from './analyze/route'

export const maxDuration = 300

// ---------------------------------------------------------------------------
// Strategy schema
//
// IMPORTANT: OpenAI's structured-output strict mode does NOT support
// minItems / maxItems on arrays, min / max on numbers, minLength / maxLength
// on strings, or .optional() (use .nullable()).
//
// If we declare them here, the AI SDK will validate the response against the
// full Zod schema AFTER the model returns. If the model returns fewer items
// than `.min()`, the SDK throws NoObjectGeneratedError, the route fails,
// Next returns an HTML error page, and the client sees:
//     "Unexpected token 'A', "An error o"... is not valid JSON"
//
// We therefore keep the schema permissive, and put the count guidance in the
// prompt itself instead.
// ---------------------------------------------------------------------------
const strategySchema = z.object({
  overallHealthScore: z.number().int(),

  healthScoreBreakdown: z.object({
    technical: z.number().int(),
    onPage: z.number().int(),
    content: z.number().int(),
    offPage: z.number().int(),
    local: z.number().int(),
  }),

  executiveSummary: z.string(),

  criticalIssues: z.array(
    z.object({
      title: z.string(),
      impact: z.enum(['critical', 'high', 'medium']),
      description: z.string(),
      howToFix: z.string(),
      estimatedEffort: z.enum(['low', 'medium', 'high']),
    }),
  ),

  quickWins: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      expectedImpact: z.string(),
    }),
  ),

  technicalSeoAudit: z.object({
    summary: z.string(),
    checklist: z.array(
      z.object({
        item: z.string(),
        status: z.enum(['pass', 'warning', 'fail', 'not-applicable']),
        priority: z.enum(['critical', 'high', 'medium', 'low']),
        finding: z.string(),
        recommendation: z.string(),
      }),
    ),
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
      recommendedTypes: z.array(z.string()),
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

  pageByPageAudit: z.array(
    z.object({
      url: z.string(),
      currentTitle: z.string().nullable(),
      suggestedTitle: z.string(),
      currentMetaDescription: z.string().nullable(),
      suggestedMetaDescription: z.string(),
      primaryKeyword: z.string(),
      issues: z.array(z.string()),
      recommendations: z.array(z.string()),
    }),
  ),

  keywordStrategy: z.object({
    summary: z.string(),
    primaryKeywords: z.array(
      z.object({
        keyword: z.string(),
        intent: z.enum(['informational', 'navigational', 'transactional', 'commercial']),
        difficulty: z.enum(['low', 'medium', 'high']),
        priority: z.enum(['high', 'medium', 'low']),
        targetPage: z.string(),
      }),
    ),
    longTailKeywords: z.array(
      z.object({
        keyword: z.string(),
        intent: z.enum(['informational', 'navigational', 'transactional', 'commercial']),
      }),
    ),
    contentClusters: z.array(
      z.object({
        pillarTopic: z.string(),
        pillarKeyword: z.string(),
        supportingKeywords: z.array(z.string()),
      }),
    ),
  }),

  pagesToCreate: z.array(
    z.object({
      suggestedUrl: z.string(),
      title: z.string(),
      targetKeyword: z.string(),
      searchIntent: z.enum(['informational', 'navigational', 'transactional', 'commercial']),
      purpose: z.string(),
      contentBrief: z.string(),
      suggestedWordCount: z.number().int(),
      keyHeadings: z.array(z.string()),
      ctaSuggestion: z.string(),
    }),
  ),

  blogIdeas: z.array(
    z.object({
      title: z.string(),
      targetKeyword: z.string(),
      searchIntent: z.enum(['informational', 'navigational', 'transactional', 'commercial']),
      suggestedWordCount: z.number().int(),
      outline: z.array(z.string()),
      contentBrief: z.string(),
    }),
  ),

  competitorAnalysis: z.array(
    z.object({
      name: z.string(),
      url: z.string(),
      strengths: z.array(z.string()),
      weaknesses: z.array(z.string()),
      opportunitiesToOutrank: z.array(z.string()),
      contentGaps: z.array(z.string()),
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
    localCitations: z.array(z.string()),
    reviewStrategy: z.string(),
    localContentIdeas: z.array(z.string()),
  }),

  offPageStrategy: z.object({
    summary: z.string(),
    costDisclaimer: z.string(),
    backlinkTactics: z.array(
      z.object({
        tactic: z.string(),
        description: z.string(),
        estimatedCost: z.enum(['free', 'low', 'medium', 'high', 'very-high']),
        difficulty: z.enum(['easy', 'medium', 'hard']),
        expectedImpact: z.enum(['low', 'medium', 'high']),
        monthlyTargetLinks: z.number().int(),
      }),
    ),
    guestPostTargets: z.array(z.string()),
    digitalPrTactics: z.array(z.string()),
    socialSignals: z.array(z.string()),
  }),

  sixMonthRoadmap: z.array(
    z.object({
      month: z.number().int(),
      theme: z.string(),
      focus: z.string(),
      keyTasks: z.array(z.string()),
      deliverables: z.array(z.string()),
      expectedOutcomes: z.array(z.string()),
    }),
  ),

  kpiTargets: z.array(
    z.object({
      metric: z.string(),
      baseline: z.string(),
      month3Target: z.string(),
      month6Target: z.string(),
      month12Target: z.string(),
    }),
  ),

  toolStack: z.object({
    free: z.array(z.string()),
    paid: z.array(z.string()),
  }),

  riskAssessment: z.array(
    z.object({
      risk: z.string(),
      likelihood: z.enum(['low', 'medium', 'high']),
      mitigation: z.string(),
    }),
  ),

  conclusion: z.string(),
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
          : 'Not a local business — set localSeo.applicable to false but still populate every array with at least 1 brief generic best-practice item so the schema is valid.'

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

LIVE SITE ANALYSIS (real data crawled from the actual website — base your audit on this)
${analysisDigest}

OUTPUT REQUIREMENTS — every field is required. Use these counts as targets:
- criticalIssues: 4-6 items
- quickWins: 4-6 items
- technicalSeoAudit.checklist: 10-12 items
- pageByPageAudit: 4-8 items (one per crawled URL)
- keywordStrategy.primaryKeywords: 8-12 items, longTailKeywords: 8-12 items, contentClusters: 2-4 items (each with 4-6 supportingKeywords)
- pagesToCreate: 4-6 items (suggestedWordCount between 800-3000)
- blogIdeas: 8-10 items (suggestedWordCount between 1000-3000, outline 5-8 H2 items each)
- competitorAnalysis: one entry per competitor provided (or empty array if none)
- localSeo arrays: at least 2 items each
- offPageStrategy.backlinkTactics: 5-7 items, monthlyTargetLinks 1-20
- sixMonthRoadmap: EXACTLY 6 items, month=1 through 6, in order
- kpiTargets: 6-8 items
- toolStack.free: 4-6, toolStack.paid: 4-6
- riskAssessment: 3-5 items
- onPageAudit.schemaMarkup.recommendedTypes: 3-6 items

Important content rules:
1. criticalIssues + quickWins must reference real numbers from the live analysis (load times, missing tags, etc.)
2. technicalSeoAudit.checklist statuses must reflect the real state of the site
3. pageByPageAudit must use the actual URLs from the crawled pages with rewritten title (50-60 chars) and meta description (140-160 chars)
4. offPageStrategy.costDisclaimer must explicitly state that backlink work is among the most expensive line items but delivers the highest ROI when done with quality (DR40+, topical relevance), and that cheap link-building is risky.
5. sixMonthRoadmap progression: M1 foundation/fixes → M2 on-page + content launch → M3 content scaling + first link building → M4 authority + technical refinement → M5 content + outreach → M6 consolidation, conversion optimization, reporting.
6. overallHealthScore: be honest. 0-100 — sites with many critical issues = 30-50, polished sites = 70-90.
7. Tone: confident, prescriptive, professional. No fluff.`

    let strategy: SeoStrategy
    try {
      const { output } = await generateText({
        model: openai('gpt-4o-mini'),
        output: Output.object({ schema: strategySchema }),
        prompt,
        maxOutputTokens: 16000,
      })
      strategy = output
    } catch (err) {
      // If the model returned text but it didn't validate against the schema,
      // try to recover the partial JSON instead of failing the whole request.
      if (NoObjectGeneratedError.isInstance(err)) {
        console.error('[v0] NoObjectGeneratedError', {
          cause: err.cause,
          textPreview: err.text?.slice(0, 500),
        })
        // Attempt to parse the raw text as JSON and validate softly
        if (err.text) {
          try {
            const raw = extractJson(err.text)
            const partial = strategySchema.partial().safeParse(raw)
            if (partial.success && partial.data) {
              return Response.json({
                error:
                  'The AI returned a partially-valid response. Some sections may be missing — please regenerate.',
                partial: partial.data,
              }, { status: 502 })
            }
          } catch {
            // fall through to generic error
          }
        }
        return Response.json(
          {
            error:
              'The AI did not return a valid strategy object. This usually means the model timed out or rate-limited. Please try again — keeping the keyword list under ~200 lines helps.',
          },
          { status: 502 },
        )
      }
      throw err
    }

    return Response.json({ strategy })
  } catch (err) {
    console.error('[v0] SEO strategy generation error:', err)
    const message =
      err instanceof Error ? err.message : 'Failed to generate strategy'
    return Response.json({ error: message }, { status: 500 })
  }
}

// Try to pull a JSON object out of a string that may have markdown fences etc.
function extractJson(text: string): unknown {
  const trimmed = text.trim()
  // Strip markdown code fences if present
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)
  const candidate = fenced ? fenced[1] : trimmed
  // Find first { and last }
  const first = candidate.indexOf('{')
  const last = candidate.lastIndexOf('}')
  if (first === -1 || last === -1) throw new Error('No JSON object found')
  return JSON.parse(candidate.slice(first, last + 1))
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
