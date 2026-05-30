import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { NextRequest, NextResponse } from 'next/server'
import * as z from 'zod'

export const maxDuration = 90

// ── Output schema ─────────────────────────────────────────────────────────────
const keywordSchema = z.object({
  keyword: z.string(),
  intent: z.string(),
  difficulty: z.string(),
  contentType: z.string(),
  opportunity: z.string(),   // "high" | "medium" | "low"
  wordCount: z.number(),     // words in the keyword
})

const clusterSchema = z.object({
  name: z.string(),
  description: z.string(),
  primaryKeyword: z.string(),
  estimatedTrafficPotential: z.string(),
  keywords: z.array(keywordSchema),
})

const contentIdeaSchema = z.object({
  title: z.string(),
  slug: z.string(),
  targetKeyword: z.string(),
  supportingKeywords: z.array(z.string()),
  intent: z.string(),
  contentType: z.string(),
  estimatedWordCount: z.number(),
  difficulty: z.string(),
  hook: z.string(),
  outline: z.array(z.string()),
  audience: z.string(),
})

const resultSchema = z.object({
  seed: z.string(),
  totalKeywords: z.number(),
  realKeywords: z.array(z.string()),
  clusters: z.array(clusterSchema),
  questions: z.array(z.string()),
  quickWins: z.array(z.string()),       // easy + commercial keywords
  trendingTopics: z.array(z.string()),  // topics that look fresh/timely
  contentIdeas: z.array(contentIdeaSchema),
  summary: z.string(),
  strategyTips: z.array(z.string()),    // strategic recommendations
})

export type KeywordResearchResult = z.infer<typeof resultSchema>

// ── Multi-source autocomplete ─────────────────────────────────────────────────

async function googleAutocomplete(query: string, country: string): Promise<string[]> {
  try {
    const url = `http://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}&hl=en&gl=${country.toLowerCase()}`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      cache: 'no-store',
      signal: AbortSignal.timeout(4000),
    })
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data?.[1]) ? data[1] : []
  } catch {
    return []
  }
}

async function youtubeAutocomplete(query: string): Promise<string[]> {
  try {
    const url = `http://suggestqueries.google.com/complete/search?client=youtube&ds=yt&q=${encodeURIComponent(query)}`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      cache: 'no-store',
      signal: AbortSignal.timeout(4000),
    })
    if (!res.ok) return []
    const text = await res.text()
    // YouTube returns JSONP-ish: window.google.ac.h([...])  — extract array
    const match = text.match(/\[(.+)\]/s)
    if (!match) return []
    try {
      const parsed = JSON.parse(`[${match[1]}]`)
      // Format: [query, [[suggestion, score], ...], ...]
      if (Array.isArray(parsed[1])) {
        return parsed[1].map((item: unknown) => Array.isArray(item) ? item[0] : item).filter((s): s is string => typeof s === 'string')
      }
    } catch { /* ignore */ }
    return []
  } catch {
    return []
  }
}

async function wikipediaOpenSearch(query: string): Promise<string[]> {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=10&namespace=0&format=json`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      cache: 'no-store',
      signal: AbortSignal.timeout(4000),
    })
    if (!res.ok) return []
    const data = await res.json()
    // [query, [titles], [descriptions], [urls]]
    return Array.isArray(data?.[1]) ? data[1].map((s: string) => s.toLowerCase()) : []
  } catch {
    return []
  }
}

// ── Expansion strategies ──────────────────────────────────────────────────────

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('')

const MODIFIERS_INFO = [
  'how to', 'what is', 'why', 'when', 'where', 'can', 'should', 'guide to',
  'tutorial', 'examples of', 'ideas for', 'tips for', 'benefits of',
  'meaning of', 'types of',
]

const MODIFIERS_COMMERCIAL = [
  'best', 'top', 'cheap', 'free', 'review', 'vs', 'alternative to',
  'comparison', 'pros and cons of', 'is good',
]

const MODIFIERS_TRANSACTIONAL = [
  'buy', 'price', 'cost', 'pricing', 'discount', 'coupon', 'download',
  'sign up', 'subscribe', 'order',
]

const MODIFIERS_AUDIENCE = [
  'for beginners', 'for small business', 'for professionals', 'for students',
  'for free', 'online', 'near me', 'in 2025', 'in 2026', 'with examples',
]

async function expandKeywords(seed: string, country: string, niche: string): Promise<string[]> {
  const all = new Set<string>()
  const seedLower = seed.toLowerCase().trim()
  const fetchPromises: Promise<string[]>[] = []

  // 1. Base seed across all three sources
  fetchPromises.push(googleAutocomplete(seedLower, country))
  fetchPromises.push(youtubeAutocomplete(seedLower))
  fetchPromises.push(wikipediaOpenSearch(seedLower))

  // 2. Alphabet expansion: "seed a", "seed b", ... "seed z" (Google)
  ALPHABET.forEach((letter) => {
    fetchPromises.push(googleAutocomplete(`${seedLower} ${letter}`, country))
  })

  // 3. Intent modifiers (Google) — prefix + suffix variants
  const allMods = [
    ...MODIFIERS_INFO,
    ...MODIFIERS_COMMERCIAL,
    ...MODIFIERS_TRANSACTIONAL,
    ...MODIFIERS_AUDIENCE,
  ]
  allMods.forEach((mod) => {
    fetchPromises.push(googleAutocomplete(`${mod} ${seedLower}`, country))
    fetchPromises.push(googleAutocomplete(`${seedLower} ${mod}`, country))
  })

  // 4. Niche-aware queries
  if (niche) {
    const nicheLower = niche.toLowerCase().trim()
    fetchPromises.push(googleAutocomplete(`${seedLower} ${nicheLower}`, country))
    fetchPromises.push(googleAutocomplete(`${nicheLower} ${seedLower}`, country))
    fetchPromises.push(youtubeAutocomplete(`${seedLower} ${nicheLower}`))
  }

  // Execute all fetches concurrently
  const results = await Promise.all(fetchPromises)

  for (const list of results) {
    for (const item of list) {
      if (typeof item === 'string' && item.length >= 3 && item.length <= 100) {
        all.add(item.toLowerCase().trim())
      }
    }
  }

  // ── Relevance filter: keep only keywords that share at least one significant
  //    word with the seed OR niche (drops Google's occasional irrelevant noise)
  const seedTokens = seedLower
    .split(/\s+/)
    .filter((t) => t.length >= 3 && !STOPWORDS.has(t))
  const nicheTokens = niche
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length >= 3 && !STOPWORDS.has(t))
  const relevantTokens = new Set([...seedTokens, ...nicheTokens])

  const filtered = Array.from(all).filter((kw) => {
    if (relevantTokens.size === 0) return true
    const kwTokens = kw.split(/\s+/)
    return kwTokens.some((t) => relevantTokens.has(t))
  })

  // Cap to keep token usage manageable
  return filtered.slice(0, 200)
}

const STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'from', 'this', 'that', 'are', 'was', 'were',
  'will', 'have', 'has', 'had', 'you', 'your', 'our', 'their', 'his', 'her',
])

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
    const nicheText = (niche || '').trim()

    // Step 1: pull real keywords from multiple sources
    const realKeywords = await expandKeywords(seedClean, countryCode, nicheText)

    if (realKeywords.length === 0) {
      return NextResponse.json(
        { error: 'No keyword suggestions found. Try a different or broader seed keyword.' },
        { status: 404 },
      )
    }

    // Step 2: GPT enrichment with much richer brief
    const systemPrompt = `You are a senior SEO strategist (10+ years at agencies like Backlinko, Ahrefs Content). You MUST respond with ONLY a valid JSON object — no markdown, no fences, no commentary.

Your job: take REAL keyword data from Google Autocomplete, YouTube Autocomplete, and Wikipedia, and turn it into a professional, agency-grade keyword strategy that a marketing team can execute immediately.

RULES:
1. Every keyword in clusters / questions / quickWins / contentIdeas.targetKeyword MUST appear in the real keyword list provided. Do NOT invent keywords.
2. Be ruthless with relevance. If a keyword is off-topic (e.g. unrelated brands, irrelevant cities, garbage), exclude it from clusters.
3. Build 5-8 thematic clusters covering distinct angles (e.g. fundamentals, comparisons, use-cases, pricing, integrations, troubleshooting, advanced).
4. For each cluster pick a PRIMARY keyword (the broadest, highest-intent one) and estimate trafficPotential as "high" / "medium" / "low".
5. Identify 8-12 question-style keywords for PAA targeting.
6. Identify 5-8 quickWins: keywords that are easy difficulty + commercial/transactional intent (fast revenue paths).
7. Identify 4-6 trendingTopics: keywords mentioning 2025/2026, "new", "latest", or topic angles that feel timely/fresh.
8. Generate 10-15 detailed CONTENT IDEAS, each with: title (SEO-optimized 50-65 chars), slug (lowercase, hyphenated), targetKeyword (from list), 3-5 supportingKeywords (from list, semantically related LSI), intent, contentType (pillar | listicle | tutorial | guide | comparison | case study | tool), estimatedWordCount (realistic 800-3500 range), difficulty, hook (1 compelling sentence), outline (5-8 H2 headings as bullet array), audience (specific persona).
9. Provide 5-7 strategyTips: high-leverage recommendations (e.g. "Build pillar around X, link to 5 supporting articles from cluster Y").
10. Intent options: "informational" | "commercial" | "transactional" | "navigational"
11. Difficulty: "easy" | "medium" | "hard" — be honest, base on keyword specificity and competition.
12. Opportunity: "high" | "medium" | "low" — combine intent value × difficulty × specificity.

Quality bar: this output will be presented to a CMO. Be concrete, specific, and confident.`

    const userPrompt = `SEED KEYWORD: "${seedClean}"
${nicheText ? `NICHE / CONTEXT: ${nicheText}` : ''}
COUNTRY: ${countryCode.toUpperCase()}

REAL KEYWORDS PULLED (${realKeywords.length} from Google + YouTube + Wikipedia Autocomplete):
${realKeywords.map((k) => `- ${k}`).join('\n')}

Return ONLY this JSON structure (no markdown):
{
  "seed": "${seedClean}",
  "totalKeywords": <integer — count of keywords you actually used across clusters>,
  "realKeywords": [<list back the real keywords you used, deduplicated>],
  "clusters": [
    {
      "name": "<cluster theme — title case>",
      "description": "<1 sentence describing the angle>",
      "primaryKeyword": "<the most strategic keyword in this cluster, from the list>",
      "estimatedTrafficPotential": "<high|medium|low>",
      "keywords": [
        { "keyword": "<from list>", "intent": "<intent>", "difficulty": "<easy|medium|hard>", "contentType": "<type>", "opportunity": "<high|medium|low>", "wordCount": <word count in keyword> }
      ]
    }
  ],
  "questions": ["<question-style keyword from the list>"],
  "quickWins": ["<easy + commercial keyword from the list>"],
  "trendingTopics": ["<timely / 2025 / new keyword from the list>"],
  "contentIdeas": [
    {
      "title": "<SEO title 50-65 chars>",
      "slug": "<lowercase-hyphenated-slug>",
      "targetKeyword": "<from list>",
      "supportingKeywords": ["<from list>", "<from list>", "<from list>"],
      "intent": "<intent>",
      "contentType": "<pillar|listicle|tutorial|guide|comparison|case study|tool>",
      "estimatedWordCount": <800-3500>,
      "difficulty": "<easy|medium|hard>",
      "hook": "<1 sentence compelling angle>",
      "outline": ["<H2 1>", "<H2 2>", "<H2 3>", "<H2 4>", "<H2 5>"],
      "audience": "<specific persona>"
    }
  ],
  "summary": "<3-4 sentence executive summary: what the search landscape looks like for this seed, and where the biggest opportunities are>",
  "strategyTips": ["<concrete recommendation 1>", "<concrete recommendation 2>"]
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
      console.error('[keyword-research] JSON parse failed. Raw:', rawText.slice(0, 400))
      return NextResponse.json(
        { error: 'The AI returned an unexpected format. Please try again.' },
        { status: 500 },
      )
    }

    const validated = resultSchema.safeParse(parsed)
    if (!validated.success) {
      console.error('[keyword-research] Schema validation failed:', validated.error.issues.slice(0, 5))
      // Graceful: return raw parsed data anyway
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
