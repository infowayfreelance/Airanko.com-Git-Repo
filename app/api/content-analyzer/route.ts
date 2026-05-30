import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { NextRequest, NextResponse } from 'next/server'
import * as z from 'zod'

export const maxDuration = 60

// ── Schema (for validation only — not passed to SDK structured output) ────────
const analysisSchema = z.object({
  aiScore: z.number(),
  humanScore: z.number(),
  readabilityScore: z.number(),
  readabilityGrade: z.string(),
  readabilityLabel: z.string(),
  overallQuality: z.number(),
  wordCount: z.number(),
  sentenceCount: z.number(),
  avgWordsPerSentence: z.number(),
  grammarIssues: z.array(
    z.object({
      original: z.string(),
      correction: z.string(),
      explanation: z.string(),
      type: z.string(),
    }),
  ),
  wordSuggestions: z.array(
    z.object({
      original: z.string(),
      alternatives: z.array(z.string()),
      reason: z.string(),
    }),
  ),
  aiSignals: z.array(z.string()),
  humanSignals: z.array(z.string()),
  improvementTips: z.array(z.string()),
  summary: z.string(),
})

export type ContentAnalysis = z.infer<typeof analysisSchema>

// Extract the first JSON object from a string (handles markdown code fences)
function extractJson(text: string): unknown {
  // Strip markdown fences
  const stripped = text.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim()
  // Find first { ... } block
  const start = stripped.indexOf('{')
  const end = stripped.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('No JSON object found in response')
  return JSON.parse(stripped.slice(start, end + 1))
}

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

    const { text: rawText } = await generateText({
      model: openai('gpt-4o-mini'),
      maxTokens: 4000,
      messages: [
        {
          role: 'system',
          content: `You are an expert content analyst. You MUST respond with ONLY a valid JSON object — no markdown, no explanation, no code fences. Just the raw JSON.

Analyze content for:
1. AI CONTENT DETECTION: formulaic transitions ("Furthermore", "In conclusion", "It is worth noting"), perfect paragraph symmetry, generic claims without examples, repetitive sentence patterns, excessive hedging, overuse of em-dashes, lack of personal voice.
2. GRAMMAR & STYLE: subject-verb agreement, wrong tenses, misplaced modifiers, run-ons, incorrect punctuation, redundant phrases. The "original" field must be EXACT text from the passage.
3. READABILITY: based on sentence length and vocabulary complexity. Grade 6-8 is ideal for web content.
4. WORD CHOICE: identify weak/vague words (very, really, good, bad, things, stuff, nice, great, important, basically, literally) and suggest 3 stronger alternatives. The "original" field must be EXACT text from the passage.

Return at most 10 grammar issues and 12 word suggestions.`,
        },
        {
          role: 'user',
          content: `Analyze this content and return ONLY a JSON object with this exact structure:
{
  "aiScore": <0-100, higher = more AI-generated>,
  "humanScore": <0-100, higher = more human>,
  "readabilityScore": <0-100 Flesch Reading Ease>,
  "readabilityGrade": "<e.g. Grade 8>",
  "readabilityLabel": "<Very Easy|Easy|Standard|Difficult|Very Difficult>",
  "overallQuality": <0-100>,
  "wordCount": <integer>,
  "sentenceCount": <integer>,
  "avgWordsPerSentence": <number>,
  "grammarIssues": [
    { "original": "<exact text from passage>", "correction": "<corrected>", "explanation": "<1 sentence>", "type": "<grammar|spelling|punctuation|style>" }
  ],
  "wordSuggestions": [
    { "original": "<exact weak word from passage>", "alternatives": ["<alt1>","<alt2>","<alt3>"], "reason": "<1 sentence>" }
  ],
  "aiSignals": ["<specific AI pattern found in this text>"],
  "humanSignals": ["<human writing pattern found>"],
  "improvementTips": ["<actionable tip>"],
  "summary": "<2-3 sentence overall assessment>"
}

TEXT TO ANALYZE:
---
${trimmed}
---

Respond with ONLY the JSON object. No markdown. No explanation.`,
        },
      ],
    })

    // Parse and validate the JSON
    let parsed: unknown
    try {
      parsed = extractJson(rawText)
    } catch {
      console.error('[content-analyzer] JSON parse failed. Raw:', rawText.slice(0, 300))
      return NextResponse.json(
        { error: 'The AI returned an unexpected format. Please try again.' },
        { status: 500 },
      )
    }

    const validated = analysisSchema.safeParse(parsed)
    if (!validated.success) {
      console.error('[content-analyzer] Schema validation failed:', validated.error.issues)
      // Return the raw parsed data anyway — better than failing
      return NextResponse.json(parsed)
    }

    return NextResponse.json(validated.data)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[content-analyzer] Error:', message)
    return NextResponse.json(
      { error: `Analysis failed: ${message}` },
      { status: 500 },
    )
  }
}
