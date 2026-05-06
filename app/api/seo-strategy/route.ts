import { generateText, Output } from 'ai'
import * as z from 'zod'

// ---------------------------------------------------------------------------
// Schema for the full SEO strategy output
// (Uses .nullable() instead of .optional() per AI SDK 6 + OpenAI strict mode.)
// ---------------------------------------------------------------------------
const strategySchema = z.object({
  executiveSummary: z
    .string()
    .describe('A 2-3 sentence overview of the recommended SEO approach'),

  targetAudience: z.object({
    description: z.string(),
    demographics: z.array(z.string()).describe('Key audience demographics'),
    painPoints: z.array(z.string()).describe('What problems they are solving'),
  }),

  keywordStrategy: z.object({
    primaryKeywords: z
      .array(
        z.object({
          keyword: z.string(),
          intent: z.enum([
            'informational',
            'navigational',
            'transactional',
            'commercial',
          ]),
          difficulty: z.enum(['low', 'medium', 'high']),
          priority: z.enum(['high', 'medium', 'low']),
        }),
      )
      .min(5)
      .max(10),
    longTailKeywords: z
      .array(
        z.object({
          keyword: z.string(),
          intent: z.enum([
            'informational',
            'navigational',
            'transactional',
            'commercial',
          ]),
        }),
      )
      .min(5)
      .max(10),
    contentClusters: z
      .array(
        z.object({
          topic: z.string(),
          keywords: z.array(z.string()).min(3).max(6),
        }),
      )
      .min(2)
      .max(4),
  }),

  competitorAnalysis: z
    .array(
      z.object({
        name: z.string().describe('Competitor name or domain'),
        strengths: z.array(z.string()).min(2).max(4),
        weaknesses: z.array(z.string()).min(2).max(4),
        opportunities: z
          .array(z.string())
          .min(2)
          .max(4)
          .describe('How to outrank or differentiate from this competitor'),
      }),
    )
    .min(1)
    .max(3),

  onPageSeo: z.object({
    titleTagStrategy: z.string(),
    metaDescriptionStrategy: z.string(),
    headingStructure: z.string(),
    internalLinking: z.string(),
    recommendations: z.array(z.string()).min(4).max(8),
  }),

  technicalSeo: z.object({
    checklist: z
      .array(
        z.object({
          item: z.string(),
          priority: z.enum(['critical', 'high', 'medium', 'low']),
          description: z.string(),
        }),
      )
      .min(6)
      .max(10),
  }),

  contentStrategy: z.object({
    pillars: z
      .array(z.string())
      .min(3)
      .max(5)
      .describe('Core content pillars / topic categories'),
    publishingFrequency: z.string(),
    contentCalendar: z
      .array(
        z.object({
          week: z.number().int().min(1).max(12),
          contentType: z.enum([
            'blog post',
            'guide',
            'video',
            'infographic',
            'landing page',
            'case study',
          ]),
          topic: z.string(),
          targetKeyword: z.string(),
        }),
      )
      .min(8)
      .max(12),
  }),

  offPageSeo: z.object({
    backlinkStrategy: z.string(),
    guestPostOpportunities: z.array(z.string()).min(3).max(6),
    socialSignals: z.array(z.string()).min(2).max(4),
    directories: z.array(z.string()).min(2).max(5),
  }),

  localSeo: z.object({
    applicable: z.boolean(),
    recommendations: z.array(z.string()),
    googleBusinessProfileTips: z.array(z.string()),
  }),

  kpis: z
    .array(
      z.object({
        metric: z.string(),
        target: z.string(),
        timeline: z.enum(['3 months', '6 months', '12 months']),
      }),
    )
    .min(5)
    .max(8),

  actionPlan: z.object({
    month1: z.array(z.string()).min(3).max(6),
    month3: z.array(z.string()).min(3).max(6),
    month6: z.array(z.string()).min(3).max(6),
  }),
})

export type SeoStrategy = z.infer<typeof strategySchema>

// ---------------------------------------------------------------------------
// Input validation
// ---------------------------------------------------------------------------
const inputSchema = z.object({
  websiteUrl: z.string().min(1),
  businessName: z.string().min(1),
  industry: z.string().min(1),
  targetAudience: z.string().min(1),
  primaryGoal: z.enum(['traffic', 'leads', 'sales', 'brand-awareness']),
  location: z.string(),
  isLocal: z.boolean(),
  competitors: z.array(z.string()).max(3),
  currentChallenges: z.string(),
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

    const goalLabel: Record<typeof input.primaryGoal, string> = {
      traffic: 'increase organic traffic',
      leads: 'generate qualified leads',
      sales: 'drive online sales / conversions',
      'brand-awareness': 'build brand awareness',
    }

    const competitorList =
      input.competitors.filter(Boolean).length > 0
        ? input.competitors.filter(Boolean).join(', ')
        : 'No specific competitors provided — infer 2 typical competitors for this industry.'

    const localDirective = input.isLocal
      ? `This is a LOCAL business serving ${input.location || 'a specific geographic area'}. Include detailed local SEO recommendations and Google Business Profile guidance.`
      : 'This is NOT a local business. Set localSeo.applicable to false and provide minimal, generic local SEO advice (still populate the arrays with at least 1-2 generic items).'

    const prompt = `You are a senior SEO strategist with 15+ years of experience.
Generate a complete, professional, actionable SEO strategy for the following business.
Be specific, realistic, and prescriptive — avoid generic fluff.

BUSINESS DETAILS
- Business Name: ${input.businessName}
- Website: ${input.websiteUrl}
- Industry / Niche: ${input.industry}
- Target Audience: ${input.targetAudience}
- Primary Goal: ${goalLabel[input.primaryGoal]}
- Location: ${input.location || 'Not specified'}
- Competitors: ${competitorList}
- Current Challenges: ${input.currentChallenges || 'None specified'}

LOCAL CONTEXT
${localDirective}

REQUIREMENTS
- Keywords must be realistic for this niche.
- The 12-week content calendar must be a logical progression (foundational topics first, then deeper content).
- Action plan items must be concrete tasks, not vague statements.
- KPIs must include measurable targets (e.g., "Reach 5,000 monthly organic visitors").
- Competitor analysis must be specific to the named competitors when provided.`

    const { output } = await generateText({
      model: 'openai/gpt-5-mini',
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
