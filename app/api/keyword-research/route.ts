import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { NextRequest, NextResponse } from 'next/server'
import * as z from 'zod'

export const maxDuration = 60

// ── Output schema ─────────────────────────────────────────────────────────────
const keywordSchema = z.object({
  keyword: z.string(),
  intent: z.string(),
  difficulty: z.string(),
  contentType: z.string(),
})

const clusterSchema = z.object({
  name: z.string(),
  description: z.string(),
  keywords: z.array(keywordSchema),
})

const resultSchema = z.object({
  seed: z.string(),
  totalKeywords: z.number(),
  realKeywords: z.array(z.string()),
  clusters: z.array(clusterSchema),
  questions: z.array(z.string()),
  contentIdeas: z.array(
    z.object({
      title: z.string(),
      targetKeyword: z.string(),
      angle: z.string(),
      contentType: z.string(),
    }),
  ),
  summary: z.string(),
})

export type KeywordResearchResult = z.infer<typeof resultSchema>

// ── Google Autocomplete fetch (free, no API key) ──────────────────────────────
async function fetchAutocomplete(query: string, country: string): Promise<string[]> {
  try {
    const url = `http://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}&hl=en&gl=${country.toLowerCase()}`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return []
    const data = await res.json()
    // Format: ["query", ["suggestion1", "suggestion2", ...]]
    return Array.isArray(data?.[1]) ? data[1] : []
  } catch {
    return []
  }
}

// Fetch a wider net by expanding with letter prefixes/suffixes
async function expandKeywords(seed: string, country: string): Promise<string[]> {
  const all = new Set<string>()

  // Base suggestions
  const base = await fetchAutocomplete(seed, country)
  base.forEach((s) => all.add(s.toLowerCase()))

  // Modifiers — these reliably surface real long-tails
  const modifiers = [
    `${seed} how`,
    `${seed} best`,
    `${seed} for`,
    `${seed} vs`,
    `best ${seed}`,
    `how to ${seed}`,
    `${seed} tips`,
    `${seed} 2025`,
    `${seed} free`,
    `${seed} online`,
  ]

  const results = await Promise.all(modifiers.map((m) => fetchAutocomplete(m, country)))
  results.flat().forEach((s) => all.add(s.toLowerCase()))

  // Question-style prefixes (these yield "people also ask" style real queries)
  const questionPrefixes = ['what is', 'how to', 'why', 'when', 'where']
  const questionResults = await Promise.all(
    questionPrefixes.map((p) => fetchAutocomplete(`${p} ${seed}`, country)),
  )
  questionResults.flat().forEach((s) => all.add(s.toLowerCase()))

  return Array.from(all).slice(0, 80) // cap at 80 to keep token usage sane
}

function extractJson(text: string): unknown {
  const stripped = text.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim()
  const start = stripped.indexOf('{')
  const end = stripped.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('No JSON object found')
  return JSON.parse(stripped.slice(start, end + 1))
}

// ── POST handler ──────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { seed, country, niche } = await req.json()

    if (!seed || typeof seed !== 'string' || seed.trim().length < 2) {
      return NextResponse.json(
        { error: 'Please enter a seed keyword (at least 2 characters).' },
        { status: 400 },
      )
    }

    const seedClean = seed.trim().toLowerCase()
    const countryCode = (country || 'us').toLowerCase()
    const nicheText = niche?.trim() ?? ''

    // ── Step 1: Fetch real Google autocomplete keywords ────────────────────
    const realKeywords = await expandKeywords(seedClean, countryCode)

    if (realKeywords.length === 0) {
      return NextResponse.json(
        { error: 'No keyword suggestions found. Try a different seed keyword.' },
        { status: 404 },
      )
    }

    // ── Step 2: GPT enrichment — classify, cluster, generate content ideas ──
    const systemPrompt = `You are an expert SEO keyword strategist. You MUST respond with ONLY a valid JSON object — no markdown, no code fences, no explanation. Just raw JSON.

Your job: take a list of REAL keyword suggestions from Google Autocomplete and turn them into a structured, actionable keyword strategy. The keywords are real — they come directly from Google. Do not invent new keywords; only work with the provided list.

For each keyword classify:
- intent: "informational" | "commercial" | "transactional" | "navigational"
- difficulty: "easy" | "medium" | "hard" (your best qualitative estimate based on keyword specificity and competition — be honest, do not pretend to know real difficulty scores)
- contentType: "blog post" | "guide" | "listicle" | "comparison" | "tutorial" | "product page" | "tool"

Group keywords into 4-6 thematic clusters. Each cluster should have a name and a 1-sentence description.

Identify 5-8 question-style keywords (start with what/why/how/when/where/can/should). These are highly valuable for PAA targeting.

Generate 6-10 content ideas (title + target keyword + angle + content type) that would rank well.`

    const userPrompt = `SEED KEYWORD: "${seedClean}"
${nicheText ? `NICHE / CONTEXT: ${nicheText}` : ''}
COUNTRY: ${countryCode.toUpperCase()}

REAL KEYWORD SUGGESTIONS FROM GOOGLE AUTOCOMPLETE (${realKeywords.length}):
${realKeywords.map((k) => `- ${k}`).join('\n')}

Return ONLY this JSON structure:
{
  "seed": "${seedClean}",
  "totalKeywords": ${realKeywords.length},
  "realKeywords": [<list back the real keywords>],
  "clusters": [
    {
      "name": "<cluster theme>",
      "description": "<1 sentence>",
      "keywords": [
        { "keyword": "<from list>", "intent": "<intent>", "difficulty": "<easy|medium|hard>", "contentType": "<type>" }
      ]
    }
  ],
  "questions": ["<question-style keyword from the list>"],
  "contentIdeas": [
    { "title": "<SEO title>", "targetKeyword": "<from list>", "angle": "<1 sentence>", "contentType": "<type>" }
  ],
  "summary": "<2-3 sentence overview of opportunities>"
}

Every keyword in clusters and questions and contentIdeas.targetKeyword MUST appear in the provided list. Do not invent keywords.`

    const { text: rawText } = await generateText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      prompt: userPrompt,
      maxOutputTokens: 4000,
    })

    let parsed: unknown
    try {
      parsed = extractJson(rawText)
    } catch {
      console.error('[keyword-research] JSON parse failed. Raw:', rawText.slice(0, 300))
      return NextResponse.json(
        { error: 'The AI returned an unexpected format. Please try again.' },
        { status: 500 },
      )
    }

    const validated = resultSchema.safeParse(parsed)
    if (!validated.success) {
      console.error('[keyword-research] Schema validation failed:', validated.error.issues)
      // Return the raw data anyway — graceful degradation
      return NextResponse.json(parsed)
    }

    return NextResponse.json(validated.data)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[keyword-research] Error:', message)
    return NextResponse.json(
      { error: `Keyword research failed: ${message}` },
      { status: 500 },
    )
  }
}
