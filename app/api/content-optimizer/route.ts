import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { NextRequest, NextResponse } from 'next/server'
import * as z from 'zod'

export const maxDuration = 60

// ── Output schema ──────────────────────────────────────────────────────────
const issueSchema = z.object({
  id: z.string(),
  category: z.string(),     // 'eeat' | 'helpful-content' | 'keyword' | 'structure' | 'readability' | 'intent' | 'on-page'
  severity: z.string(),     // 'critical' | 'warning' | 'info'
  title: z.string(),
  description: z.string(),
  fix: z.string(),
  example: z.string().nullable().optional(),
  impact: z.string(),       // 'high' | 'medium' | 'low'
})

const keywordUsageSchema = z.object({
  keyword: z.string(),
  count: z.number(),
  recommendation: z.string(),
})

const headingSchema = z.object({
  level: z.string(),       // 'H2', 'H3'
  text: z.string(),
  rewritten: z.string(),
  reason: z.string(),
})

const contentOptimizerResultSchema = z.object({
  targetKeyword: z.string(),
  contentType: z.string(),
  scores: z.object({
    overall: z.number(),
    eeat: z.number(),
    helpfulContent: z.number(),
    keywordOptimization: z.number(),
    structureReadability: z.number(),
    searchIntentMatch: z.number(),
    onPageSeo: z.number(),
  }),
  summary: z.string(),
  searchIntent: z.object({
    detectedIntent: z.string(),
    contentMatch: z.string(),
    recommendation: z.string(),
  }),
  eeatAnalysis: z.object({
    experienceSignals: z.array(z.string()),
    expertiseSignals: z.array(z.string()),
    authorityGaps: z.array(z.string()),
    trustIssues: z.array(z.string()),
    overallVerdict: z.string(),
  }),
  helpfulContentSignals: z.object({
    peopleFirstScore: z.number(),
    originalInsightCount: z.number(),
    genericClaims: z.array(z.string()),
    valueAdds: z.array(z.string()),
  }),
  keywordAnalysis: z.object({
    primaryKeywordUsage: keywordUsageSchema,
    keywordDensityPercent: z.number(),
    densityVerdict: z.string(),
    missingLsiKeywords: z.array(z.string()),
    presentLsiKeywords: z.array(z.string()),
    semanticCoverage: z.string(),
  }),
  structureAnalysis: z.object({
    wordCount: z.number(),
    recommendedWordCount: z.string(),
    paragraphCount: z.number(),
    avgParagraphLength: z.number(),
    headingHierarchyOk: z.boolean(),
    readabilityGrade: z.string(),
    readabilityScore: z.number(),
    structureIssues: z.array(z.string()),
  }),
  onPageRecommendations: z.object({
    suggestedTitle: z.string(),
    titleCharCount: z.number(),
    suggestedMetaDescription: z.string(),
    metaCharCount: z.number(),
    suggestedSlug: z.string(),
    suggestedSchema: z.string(),
  }),
  rewrittenHeadings: z.array(headingSchema),
  missingTopics: z.array(
    z.object({
      topic: z.string(),
      whyImportant: z.string(),
      suggestedH2: z.string(),
    }),
  ),
  internalLinkingSuggestions: z.array(z.string()),
  issues: z.array(issueSchema),
  topRecommendations: z.array(z.string()),
})

export type ContentOptimizerResult = z.infer<typeof contentOptimizerResultSchema>

function extractJson(text: string): unknown {
  const stripped = text.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim()
  const start = stripped.indexOf('{')
  const end = stripped.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('No JSON object found')
  return JSON.parse(stripped.slice(start, end + 1))
}

// ── POST handler ──────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { content, targetKeyword, contentType = 'blog post' } = await req.json()

    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Content is required.' }, { status: 400 })
    }
    if (!targetKeyword || typeof targetKeyword !== 'string' || targetKeyword.trim().length < 2) {
      return NextResponse.json({ error: 'Target keyword is required (at least 2 characters).' }, { status: 400 })
    }

    const trimmed = content.trim()
    const wordCount = trimmed.split(/\s+/).filter(Boolean).length

    if (wordCount < 100) {
      return NextResponse.json(
        { error: 'Please paste at least 100 words for a meaningful analysis.' },
        { status: 400 },
      )
    }
    if (wordCount > 4000) {
      return NextResponse.json(
        { error: 'Maximum 4,000 words per analysis. Please shorten your content.' },
        { status: 400 },
      )
    }

    // ── System prompt: Google Search Quality Rater + senior SEO content strategist
    const systemPrompt = `You are a senior content strategist and Google Search Quality Rater with deep expertise in:

GOOGLE'S OFFICIAL RANKING SYSTEMS:
1. E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) — required by Google's Search Quality Rater Guidelines (2024 update).
2. Helpful Content System — penalizes content created primarily for search engines instead of people.
3. Reviews System — for product/service reviews requires first-hand experience signals.
4. Spam updates — penalize keyword stuffing, thin content, and AI mass production without value.
5. Search intent matching (informational / commercial / transactional / navigational).
6. Topical authority and semantic SEO.

YOUR JOB: Analyze the user's content against these official Google guidelines and return a JSON-only response (no markdown, no fences) with concrete, content-specific recommendations.

CRITICAL RULES:
- Be brutally honest about score. A generic AI-style article without expertise gets 30-50/100 even if grammatically correct.
- For E-E-A-T: look for first-person experience markers ("I tested", "we found", "in our 2024 study"), expert credentials, original data/screenshots, citations of authoritative sources, author bio signals.
- For Helpful Content: penalize generic listicles, recycled summaries, excessive hedging, unsupported claims, lack of unique perspective.
- For keyword optimization: check primary keyword in title, first paragraph (within first 100 words), at least one H2, naturally throughout. Flag density > 3% as stuffing.
- For LSI/semantic: identify which related entity terms are missing that competitors covering this topic would include.
- For structure: ideal paragraphs are 2-4 sentences. H2/H3 hierarchy must be logical. Word count should match search intent depth.
- For search intent match: identify intent of target keyword, then judge whether content format matches.
- For on-page: write a NEW optimized title (50-60 chars), meta description (140-160 chars), URL slug, and recommend the right schema type.
- For missing topics: identify 3-6 subtopics a comprehensive piece must cover that this content omits.
- For rewrittenHeadings: pick 4-8 actual headings from the content and rewrite them to be more SEO-optimized + include the reason.
- For issues: 8-15 concrete issues, each with severity, category, why-it-matters description, exact fix, and an example where useful.
- For topRecommendations: 5-7 highest-leverage actions ranked by impact.

Quality bar: This output will go to a senior content marketer. Be concrete and specific. Reference actual phrases from the content where possible.`

    const userPrompt = `TARGET KEYWORD: "${targetKeyword.trim()}"
CONTENT TYPE: ${contentType}
WORD COUNT: ${wordCount}

CONTENT TO ANALYZE:
---
${trimmed}
---

Return ONLY this JSON structure (no markdown):
{
  "targetKeyword": "${targetKeyword.trim()}",
  "contentType": "${contentType}",
  "scores": {
    "overall": <0-100 honest score>,
    "eeat": <0-100>,
    "helpfulContent": <0-100>,
    "keywordOptimization": <0-100>,
    "structureReadability": <0-100>,
    "searchIntentMatch": <0-100>,
    "onPageSeo": <0-100>
  },
  "summary": "<3-4 sentence executive summary: current state, biggest blockers, biggest opportunity>",
  "searchIntent": {
    "detectedIntent": "<informational|commercial|transactional|navigational>",
    "contentMatch": "<does this content match the intent? specific assessment>",
    "recommendation": "<what content type should this be if mismatch>"
  },
  "eeatAnalysis": {
    "experienceSignals": ["<found first-person/hands-on signals from the content>"],
    "expertiseSignals": ["<found expertise indicators>"],
    "authorityGaps": ["<what authority signals are missing>"],
    "trustIssues": ["<trust gaps: missing citations, unsupported claims, etc.>"],
    "overallVerdict": "<1-2 sentence E-E-A-T verdict>"
  },
  "helpfulContentSignals": {
    "peopleFirstScore": <0-100>,
    "originalInsightCount": <count of original/unique insights found>,
    "genericClaims": ["<specific generic phrases from content>"],
    "valueAdds": ["<unique value-adds present in the content>"]
  },
  "keywordAnalysis": {
    "primaryKeywordUsage": {
      "keyword": "${targetKeyword.trim()}",
      "count": <occurrences in content>,
      "recommendation": "<is usage appropriate? specific advice>"
    },
    "keywordDensityPercent": <decimal e.g. 1.2>,
    "densityVerdict": "<too-low|optimal|too-high>",
    "missingLsiKeywords": ["<5-10 LSI/semantic keywords NOT in content but should be>"],
    "presentLsiKeywords": ["<LSI keywords already present>"],
    "semanticCoverage": "<assessment of topical/semantic depth>"
  },
  "structureAnalysis": {
    "wordCount": ${wordCount},
    "recommendedWordCount": "<e.g. 1500-2500 words>",
    "paragraphCount": <count>,
    "avgParagraphLength": <avg words per paragraph>,
    "headingHierarchyOk": <true|false>,
    "readabilityGrade": "<e.g. Grade 9>",
    "readabilityScore": <0-100 Flesch>,
    "structureIssues": ["<specific structure problems>"]
  },
  "onPageRecommendations": {
    "suggestedTitle": "<NEW optimized title 50-60 chars with primary keyword>",
    "titleCharCount": <length of suggested title>,
    "suggestedMetaDescription": "<NEW meta description 140-160 chars>",
    "metaCharCount": <length of meta>,
    "suggestedSlug": "<lowercase-hyphenated-slug>",
    "suggestedSchema": "<Article|HowTo|FAQPage|Product|Recipe etc — recommendation with reason>"
  },
  "rewrittenHeadings": [
    {
      "level": "<H2|H3>",
      "text": "<original heading from content>",
      "rewritten": "<SEO-optimized rewrite>",
      "reason": "<why this is better>"
    }
  ],
  "missingTopics": [
    {
      "topic": "<subtopic name>",
      "whyImportant": "<why google/users expect this>",
      "suggestedH2": "<H2 heading to add for this topic>"
    }
  ],
  "internalLinkingSuggestions": [
    "<concrete internal linking suggestion with anchor text>"
  ],
  "issues": [
    {
      "id": "<kebab-case-id>",
      "category": "<eeat|helpful-content|keyword|structure|readability|intent|on-page>",
      "severity": "<critical|warning|info>",
      "title": "<concise issue title>",
      "description": "<why this matters for Google rankings>",
      "fix": "<specific actionable fix>",
      "example": "<concrete example or null>",
      "impact": "<high|medium|low>"
    }
  ],
  "topRecommendations": ["<top 5-7 highest leverage actions in priority order>"]
}`

    const { text: rawText } = await generateText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      prompt: userPrompt,
      maxOutputTokens: 8000,
    })

    let parsed: unknown
    try {
      parsed = extractJson(rawText)
    } catch {
      console.error('[content-optimizer] JSON parse failed. Raw:', rawText.slice(0, 400))
      return NextResponse.json(
        { error: 'The AI returned an unexpected format. Please try again.' },
        { status: 500 },
      )
    }

    const validated = contentOptimizerResultSchema.safeParse(parsed)
    if (!validated.success) {
      console.error('[content-optimizer] Schema validation issues:', validated.error.issues.slice(0, 5))
      // Graceful: return raw data
      return NextResponse.json(parsed)
    }

    return NextResponse.json(validated.data)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[content-optimizer] Error:', message)
    return NextResponse.json({ error: `Optimization failed: ${message}` }, { status: 500 })
  }
}
