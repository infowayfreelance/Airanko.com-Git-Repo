import { generateText, Output } from 'ai'
import { openai } from '@ai-sdk/openai'
import { NextRequest, NextResponse } from 'next/server'
import * as z from 'zod'

export const maxDuration = 60

// ---------------------------------------------------------------------------
// Schema — keep permissive (no .min/.max on arrays/numbers per AI SDK rules)
// ---------------------------------------------------------------------------
const analysisSchema = z.object({
  aiScore: z
    .number()
    .int()
    .describe('0-100: likelihood content is AI-generated. 100 = clearly AI, 0 = clearly human'),
  humanScore: z
    .number()
    .int()
    .describe('0-100: how authentic and human the writing feels. 100 = clearly human'),
  readabilityScore: z
    .number()
    .int()
    .describe('0-100 Flesch Reading Ease equivalent. 70+ = easy, 50-70 = standard, <50 = difficult'),
  readabilityGrade: z.string().describe('US school grade level e.g. Grade 8'),
  readabilityLabel: z.enum(['Very Easy', 'Easy', 'Standard', 'Difficult', 'Very Difficult']),
  overallQuality: z.number().int().describe('0-100 overall content quality score'),
  wordCount: z.number().int().describe('actual word count of the text'),
  sentenceCount: z.number().int().describe('actual sentence count'),
  avgWordsPerSentence: z.number().describe('average words per sentence, rounded to 1 decimal'),
  grammarIssues: z.array(
    z.object({
      original: z
        .string()
        .describe('EXACT text from the passage containing the error — copy it verbatim'),
      correction: z.string().describe('corrected version of that text'),
      explanation: z.string().describe('brief 1-sentence explanation of the error'),
      type: z.enum(['grammar', 'spelling', 'punctuation', 'style']),
    }),
  ),
  wordSuggestions: z.array(
    z.object({
      original: z
        .string()
        .describe(
          'EXACT weak/overused word or phrase from the passage — copy it verbatim as it appears',
        ),
      alternatives: z
        .array(z.string())
        .describe('exactly 3 stronger, more precise alternatives'),
      reason: z.string().describe('1 sentence explaining why this word is weak'),
    }),
  ),
  aiSignals: z
    .array(z.string())
    .describe(
      'specific patterns in THIS text that suggest AI authorship — be concrete, reference actual phrases or structures',
    ),
  humanSignals: z
    .array(z.string())
    .describe('patterns in THIS text that suggest authentic human authorship'),
  improvementTips: z
    .array(z.string())
    .describe('actionable tips to improve this specific content'),
  summary: z.string().describe('2-3 sentence overall assessment of the content'),
})

export type ContentAnalysis = z.infer<typeof analysisSchema>

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json()

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required.' }, { status: 400 })
    }

    const trimmed = text.trim()
    const wordCount = trimmed.split(/\s+/).filter(Boolean).length

    if (wordCount < 30) {
      return NextResponse.json(
        { error: 'Please enter at least 30 words for accurate analysis.' },
        { status: 400 },
      )
    }

    if (wordCount > 3000) {
      return NextResponse.json(
        { error: 'Maximum 3,000 words per analysis. Please shorten your text.' },
        { status: 400 },
      )
    }

    const { experimental_output: result } = await generateText({
      model: openai('gpt-4o-mini'),
      experimental_output: Output.object({ schema: analysisSchema }),
      system: `You are an expert content analyst with deep expertise in:

1. AI CONTENT DETECTION: Identify patterns that reveal AI-generated text:
   - Formulaic transitions ("Furthermore", "In conclusion", "It is worth noting", "It is important to")
   - Perfect paragraph symmetry and uniform structure
   - Generic, non-specific claims without concrete examples or data
   - Repetitive sentence patterns (all start with subject+verb)
   - Excessive hedging ("may", "might", "could potentially", "it is possible that")
   - Overuse of em-dashes and colons for stylistic effect
   - Lack of personal voice, opinions, or unique perspective
   - "Not only... but also" and similar parallel constructions

2. GRAMMAR & STYLE: Identify real errors (not stylistic choices):
   - Subject-verb agreement errors
   - Wrong tense usage
   - Misplaced modifiers
   - Run-on sentences or fragments
   - Incorrect punctuation
   - Redundant phrases ("very unique", "completely destroyed")
   - Return the EXACT text snippet from the passage as the 'original' field

3. READABILITY: Calculate based on sentence length and vocabulary complexity.
   - Grade 6-8 is ideal for web content
   - Long sentences (20+ words) reduce readability
   - Complex vocabulary raises the grade level

4. WORD CHOICE: Target these weak/overused words and suggest precise alternatives:
   - Intensifiers: very, really, quite, rather, extremely, basically, literally
   - Vague nouns: things, stuff, aspects, elements, factors, areas, issues
   - Weak adjectives: good, bad, big, small, nice, great, important, interesting
   - Filler phrases: "in terms of", "with regard to", "it should be noted that"
   - Return the EXACT word or phrase from the passage as the 'original' field

IMPORTANT: Return at most 10 grammar issues and 12 word suggestions. Focus on the most impactful ones. The 'original' fields MUST match text that actually appears in the passage — do not paraphrase or modify.`,
      prompt: `Analyze this content thoroughly and return a complete JSON analysis:

---
${trimmed}
---

Return the full JSON analysis object. For grammarIssues and wordSuggestions, the 'original' field must be an EXACT copy of text from the passage above.`,
    })

    return NextResponse.json(result)
  } catch (err) {
    console.error('[content-analyzer]', err)
    return NextResponse.json(
      { error: 'Analysis failed. Please try again.' },
      { status: 500 },
    )
  }
}
