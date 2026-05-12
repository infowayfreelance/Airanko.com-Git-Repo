import { generateText, Output, NoObjectGeneratedError } from 'ai'
import { openai } from '@ai-sdk/openai'
import * as z from 'zod'

export const maxDuration = 300

// ---------------------------------------------------------------------------
// Output schema — kept permissive (no .min()/.max()/.optional()) because
// OpenAI structured-output strict mode does not support them. Guidance for
// counts and lengths is enforced through the prompt instead.
// ---------------------------------------------------------------------------
const contentSchema = z.object({
  meta: z.object({
    title: z.string(),
    metaDescription: z.string(),
    slug: z.string(),
    primaryKeyword: z.string(),
    secondaryKeywords: z.array(z.string()),
    lsiKeywords: z.array(z.string()),
    targetWordCount: z.number().int(),
    estimatedWordCount: z.number().int(),
    readingTimeMinutes: z.number().int(),
    searchIntent: z.enum([
      'informational',
      'navigational',
      'transactional',
      'commercial',
    ]),
    contentType: z.string(),
    tone: z.string(),
    audience: z.string(),
  }),

  // Featured-snippet / AI Overview hook — direct, fact-dense answer Google can lift
  featuredSnippet: z.object({
    question: z.string(),
    answer: z.string(),
    format: z.enum(['paragraph', 'list', 'table', 'definition']),
  }),

  // Quick takeaways — boxed at top of article (good for retention + AI extraction)
  keyTakeaways: z.array(z.string()),

  introduction: z.string(),

  // Body — markdown-friendly sections with H2 + optional H3 subsections
  sections: z.array(
    z.object({
      h2: z.string(),
      content: z.string(),
      subsections: z.array(
        z.object({
          h3: z.string(),
          content: z.string(),
        }),
      ),
    }),
  ),

  conclusion: z.string(),

  callToAction: z.string(),

  // FAQ section — directly feeds FAQPage schema + People-Also-Ask coverage
  faq: z.array(
    z.object({
      question: z.string(),
      answer: z.string(),
    }),
  ),

  // Suggestions the writer should layer in — Google rewards genuine internal links
  internalLinks: z.array(
    z.object({
      anchorText: z.string(),
      suggestedTargetPage: z.string(),
      placementHint: z.string(),
    }),
  ),

  // Outbound citations — trust signal for E-E-A-T
  externalReferences: z.array(
    z.object({
      anchorText: z.string(),
      sourceType: z.string(),
      whyAuthoritative: z.string(),
    }),
  ),

  imageSuggestions: z.array(
    z.object({
      placement: z.string(),
      description: z.string(),
      altText: z.string(),
      filenameSuggestion: z.string(),
    }),
  ),

  // Pre-built JSON-LD strings, ready to paste into <script type="application/ld+json">
  schemaMarkup: z.object({
    articleJsonLd: z.string(),
    faqPageJsonLd: z.string(),
  }),

  // E-E-A-T audit of the generated content
  eeat: z.object({
    overallScore: z.number().int(),
    experience: z.object({
      score: z.number().int(),
      analysis: z.string(),
      suggestions: z.array(z.string()),
    }),
    expertise: z.object({
      score: z.number().int(),
      analysis: z.string(),
      suggestions: z.array(z.string()),
    }),
    authoritativeness: z.object({
      score: z.number().int(),
      analysis: z.string(),
      suggestions: z.array(z.string()),
    }),
    trustworthiness: z.object({
      score: z.number().int(),
      analysis: z.string(),
      suggestions: z.array(z.string()),
    }),
  }),

  // Helpful Content System self-check
  helpfulContentChecklist: z.array(
    z.object({
      criterion: z.string(),
      status: z.enum(['pass', 'warning', 'needs-work']),
      explanation: z.string(),
    }),
  ),

  // AI Overviews / SGE optimization
  aiOverviewOptimization: z.object({
    quotableStatements: z.array(z.string()),
    namedEntities: z.array(z.string()),
    structuredFacts: z.array(z.string()),
    optimizationTips: z.array(z.string()),
  }),

  // Originality / scaled-content-abuse self-check (March 2024 spam policy)
  originalityNotes: z.object({
    uniqueAngles: z.array(z.string()),
    informationGainElements: z.array(z.string()),
    risks: z.array(z.string()),
  }),

  publishingChecklist: z.array(z.string()),
})

export type GeneratedContent = z.infer<typeof contentSchema>

// ---------------------------------------------------------------------------
// Input validation
// ---------------------------------------------------------------------------
const inputSchema = z.object({
  topic: z.string().min(1),
  primaryKeyword: z.string().min(1),
  secondaryKeywords: z.string(),
  contentType: z.string().min(1),
  audience: z.string(),
  tone: z.string(),
  wordCount: z.number().int(),
  pointOfView: z.string(),
  language: z.string(),
  brandName: z.string(),
  brandUrl: z.string(),
  expertCredentials: z.string(),
  firstHandExperience: z.string(),
  mustIncludePoints: z.string(),
  competitorUrls: z.string(),
  callToAction: z.string(),
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

    const prompt = buildPrompt(input)

    let content: GeneratedContent
    try {
      const { output } = await generateText({
        model: openai('gpt-4o-mini'),
        output: Output.object({ schema: contentSchema }),
        prompt,
        maxOutputTokens: 16000,
      })
      content = output
    } catch (err) {
      if (NoObjectGeneratedError.isInstance(err)) {
        console.error('[v0] Content writer NoObjectGeneratedError', {
          cause: err.cause,
          textPreview: err.text?.slice(0, 500),
        })
        return Response.json(
          {
            error:
              'The AI did not return a valid content object. This usually means the model timed out — please try again with a slightly shorter target word count.',
          },
          { status: 502 },
        )
      }
      throw err
    }

    return Response.json({ content })
  } catch (err) {
    console.error('[v0] AI Content Writer error:', err)
    const message =
      err instanceof Error ? err.message : 'Failed to generate content'
    return Response.json({ error: message }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// Prompt builder — wired to Google's most recent guidance
// ---------------------------------------------------------------------------
function buildPrompt(input: z.infer<typeof inputSchema>): string {
  const secondary = input.secondaryKeywords.trim()
    ? input.secondaryKeywords
        .split(/\n|,/)
        .map((k) => k.trim())
        .filter(Boolean)
        .join(', ')
    : 'Infer 5-8 strong secondary keywords from the topic and primary keyword.'

  const competitorBlock = input.competitorUrls.trim()
    ? `COMPETITOR URLs to outperform — produce a piece that demonstrably surpasses them with deeper insight, fresher data, and clearer structure:\n${input.competitorUrls}`
    : 'No competitor URLs provided. Aim for top-3 Google ranking quality regardless.'

  const experienceBlock = input.firstHandExperience.trim()
    ? `FIRST-HAND EXPERIENCE / ORIGINAL INSIGHTS (weave these throughout — this is the new "E" in E-E-A-T):\n${input.firstHandExperience}`
    : 'No first-hand experience provided. Add tasteful, plausible practitioner perspective markers ("In our testing", "From hands-on experience") sparingly — do NOT fabricate specific numbers or dates.'

  const credentialsBlock = input.expertCredentials.trim()
    ? `AUTHOR / EXPERT CREDENTIALS (reflect these in the voice, suggest a byline, and surface in trust signals):\n${input.expertCredentials}`
    : 'No author credentials provided. Suggest credentials worth adding before publishing (in publishingChecklist + E-E-A-T suggestions).'

  return `You are a senior SEO content strategist and writer specializing in Google's most recent algorithm updates and content guidelines. You write content that ranks in the top 3 of Google AND wins citations in AI Overviews / SGE.

You must produce content that complies with — and is explicitly optimized for — these recent Google updates and policies:

1. HELPFUL CONTENT SYSTEM (now part of core ranking, last reset Aug 2024 and reinforced through 2025 core updates). Content must be people-first, demonstrate first-hand expertise, deliver clear value, and avoid "search-engine-first" patterns.
2. E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) — December 2022 onward. The first "E" (Experience) is now critical: surface first-hand use, testing, or lived perspective wherever possible. Cite credentials and reputable sources.
3. MARCH 2024 SPAM UPDATE & SCALED CONTENT ABUSE POLICY. Avoid templated, mass-produced, low-effort patterns. Demonstrate originality and unique value.
4. AI OVERVIEWS / SGE OPTIMIZATION (2024–2026 expansion). Include direct, quotable answers in 40-60 word blocks, well-defined entities, structured facts, comparison tables when relevant, and unambiguous definitions.
5. CORE UPDATES (March 2024, August 2024, November 2024, March 2025, June 2025). Reward content depth, topical authority, satisfying user intent, and "Information Gain" — saying something the top 10 results don't.
6. INFORMATION GAIN: include at least 2-3 angles, data points, frameworks, or insights that competitors are missing.
7. PEOPLE-FIRST CONTENT principles: would a human reader find this satisfying? Would it feel worth sharing? Would they trust it?
8. PRODUCT REVIEW UPDATE guidance (where applicable): hands-on evaluation, pros/cons with reasoning, alternatives, evidence the author actually used the product.

CONTENT BRIEF
- Topic: ${input.topic}
- Primary keyword (must appear in H1/title, intro, conclusion, and naturally throughout — target density ~1-1.5%, NEVER stuffed): ${input.primaryKeyword}
- Secondary / LSI keywords to weave in naturally: ${secondary}
- Content type: ${input.contentType}
- Target audience: ${input.audience || 'General readers interested in the topic'}
- Voice / tone: ${input.tone || 'Confident, clear, and helpful'}
- Point of view: ${input.pointOfView || 'first-person plural ("we")'}
- Language: ${input.language || 'English (en-US)'}
- Target word count: ${input.wordCount} (treat as a strong target; +/- 15% acceptable)
- Brand: ${input.brandName || 'Not specified'} ${input.brandUrl ? `(${input.brandUrl})` : ''}
- Call-to-action: ${input.callToAction || 'Drive the reader to the next logical step (subscribe, read related guide, try the tool)'}

${credentialsBlock}

${experienceBlock}

MUST-INCLUDE POINTS (the reader / client explicitly wants these covered):
${input.mustIncludePoints.trim() || 'None specified — pick the most valuable subtopics yourself.'}

${competitorBlock}

OUTPUT REQUIREMENTS — every field is required.

meta:
- title: 50-60 characters, includes the primary keyword early, emotionally compelling but not clickbait
- metaDescription: 140-160 characters, includes the primary keyword, has a clear value promise + soft CTA
- slug: kebab-case, 3-6 words, includes primary keyword
- secondaryKeywords: 5-8 items
- lsiKeywords: 8-12 semantically related terms
- targetWordCount = ${input.wordCount}, estimatedWordCount = your actual produced count
- readingTimeMinutes: based on 230 words/min
- searchIntent: pick the most accurate of informational/commercial/transactional/navigational
- contentType: echo input
- tone: echo input
- audience: echo input

featuredSnippet:
- Pick the single best "People Also Ask" question this article answers
- answer: 40-60 words, direct, fact-dense, no fluff — written so Google can lift it verbatim into AI Overviews / Featured Snippet
- format: pick whichever the answer best fits

keyTakeaways: 4-6 bullets, each 1-2 lines, scannable

introduction: 120-180 words. Hook in line 1, establish E-E-A-T in line 2-3 (e.g. "After [X experience]…"), state the value the reader gets, mention primary keyword naturally.

sections: 5-8 H2 sections covering the topic at depth.
- Each H2 should map to a real searcher question or subtopic
- content: 150-300 words of high-quality prose per H2 (BEFORE counting subsections), markdown-formatted (bold, italics, occasional lists, links in [text](url) form where you'd suggest external citations)
- subsections (H3): 0-3 per H2 where structure benefits the reader. Each H3 has 80-150 words of content.
- Reach the targetWordCount across all sections combined.

conclusion: 100-150 words. Summarize the value delivered, reinforce primary keyword once, set up the CTA.

callToAction: 1-2 sentences. Specific, action-oriented, matched to searchIntent.

faq: 5-8 People-Also-Ask-style questions with 40-80 word answers each. Avoid duplicating featuredSnippet's question.

internalLinks: 4-6 plausible internal link suggestions with anchor text and placement hint (e.g. "after H2 #2"). suggestedTargetPage may be a hypothetical slug if no site map is available.

externalReferences: 3-5 outbound citation suggestions — authoritative sources (gov sites, peer-reviewed journals, .edu, recognized industry leaders). Do NOT invent specific URLs; describe the source and why it's authoritative.

imageSuggestions: 3-6 images.
- placement: e.g. "Hero", "After H2 #2"
- altText: 80-125 chars, descriptive, includes a keyword when natural — never keyword-stuffed
- filenameSuggestion: kebab-case-with-keyword.webp

schemaMarkup:
- articleJsonLd: a VALID JSON string for a complete Article schema (Article or BlogPosting type). Include @context, @type, headline, description, image (placeholder), author (with credentials), publisher, datePublished, dateModified, mainEntityOfPage, keywords. The string must be parseable JSON. Use placeholders like "https://example.com/..." where needed.
- faqPageJsonLd: a VALID JSON string for FAQPage schema built from the faq array.

eeat:
- overallScore 0-100. Be honest. Generic AI-feeling content with no first-hand markers = 50-65. Strong content with credentials, experience markers, citations, and unique data = 80-95.
- For each pillar: score (0-100), 2-3 sentence analysis, 2-4 concrete suggestions to push it higher BEFORE publishing.

helpfulContentChecklist: exactly 8 items covering these criteria (use the wording verbatim and grade each):
- "Demonstrates first-hand experience"
- "Original information, reporting, or analysis"
- "Substantial value beyond top-ranking pages"
- "Clear primary purpose / focus"
- "Satisfies the searcher without forcing follow-up searches"
- "Author transparency and credentials surfaced"
- "Free of unnecessary filler / SEO padding"
- "Honest, balanced coverage (including drawbacks where applicable)"

aiOverviewOptimization:
- quotableStatements: 4-6 short (15-30 word) statements written to be cited verbatim
- namedEntities: 6-10 people, organizations, products, places, concepts mentioned
- structuredFacts: 4-6 atomic, verifiable facts in "Subject — Predicate — Object" or single-sentence form
- optimizationTips: 3-5 concrete improvements to win more AI Overview citations

originalityNotes:
- uniqueAngles: 2-3 specific angles or arguments this piece takes that competitors typically miss
- informationGainElements: 2-3 specific data points, frameworks, or comparisons that constitute information gain
- risks: 2-3 honest risks (e.g. "claims X without primary citation — please verify", "uses 'we' POV — confirm credentials before publishing")

publishingChecklist: 8-10 concrete pre-publish actions ("Add author byline with credentials & headshot", "Replace placeholder image URLs", "Verify all statistics against primary sources", "Add Last Updated date", etc.)

CRITICAL RULES:
- Do NOT fabricate specific statistics, dates, study citations, or named individuals you cannot verify. Use phrasing like "industry research suggests…" when uncertain.
- Do NOT keyword-stuff. Read like a human expert wrote it.
- Sentences should vary in length. Paragraphs should be short (2-4 sentences) for scannability.
- Be specific. Replace vague claims with concrete examples wherever possible.
- Write in ${input.language || 'English (en-US)'}.`
}
