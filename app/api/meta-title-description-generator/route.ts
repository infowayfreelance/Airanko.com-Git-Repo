import { generateText, Output, NoObjectGeneratedError } from 'ai'
import { openai } from '@ai-sdk/openai'
import * as z from 'zod'

export const maxDuration = 120

export const MAX_ITEMS = 20
export const MAX_COUNT = 5

// ---------------------------------------------------------------------------
// Output schema — kept permissive (no .min()/.max()/.optional()) because
// OpenAI structured-output strict mode does not support them. Counts and
// length targets are enforced through the prompt instead; exact pixel-fit
// is verified client-side against the real Google SERP pixel limits.
// ---------------------------------------------------------------------------
const resultSchema = z.object({
  results: z.array(
    z.object({
      titles: z.array(z.string()),
      descriptions: z.array(z.string()),
    }),
  ),
})

export type GeneratedItem = { input: string; titles: string[]; descriptions: string[] }

const inputSchema = z.object({
  items: z.array(z.string().min(1)).min(1).max(MAX_ITEMS),
  fields: z.enum(['title', 'description', 'both']),
  count: z.number().int().min(1).max(MAX_COUNT),
  device: z.enum(['desktop', 'mobile']),
  tone: z.string(),
  brand: z.string(),
})

// Rough character targets used only to steer the model — the real pass/fail
// check happens client-side via canvas pixel measurement (lib/meta-pixel).
const CHAR_TARGETS = {
  desktop: { title: '50-60 characters (~600px in Arial 20px)', description: '150-160 characters (~920px in Arial 14px)' },
  mobile: { title: '40-50 characters (~580px in Arial 18px)', description: '110-125 characters (~680px in Arial 14px)' },
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = inputSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: 'Invalid input', issues: parsed.error.issues }, { status: 400 })
    }
    const input = parsed.data
    const prompt = buildPrompt(input)

    let output: z.infer<typeof resultSchema>
    try {
      const res = await generateText({
        model: openai('gpt-4o-mini'),
        output: Output.object({ schema: resultSchema }),
        prompt,
        maxOutputTokens: 8000,
      })
      output = res.output
    } catch (err) {
      if (NoObjectGeneratedError.isInstance(err)) {
        console.error('[v0] Meta generator NoObjectGeneratedError', { cause: err.cause, textPreview: err.text?.slice(0, 500) })
        return Response.json(
          { error: 'The AI did not return a valid result. This usually means too many items were requested at once — try fewer items or fewer variants.' },
          { status: 502 },
        )
      }
      throw err
    }

    const results: GeneratedItem[] = input.items.map((item, i) => ({
      input: item,
      titles: input.fields === 'description' ? [] : (output.results[i]?.titles ?? []),
      descriptions: input.fields === 'title' ? [] : (output.results[i]?.descriptions ?? []),
    }))

    return Response.json({ results })
  } catch (err) {
    console.error('[v0] Meta Title & Description Generator error:', err)
    const message = err instanceof Error ? err.message : 'Failed to generate content'
    return Response.json({ error: message }, { status: 500 })
  }
}

function buildPrompt(input: z.infer<typeof inputSchema>): string {
  const wantTitles = input.fields !== 'description'
  const wantDescriptions = input.fields !== 'title'
  const targets = CHAR_TARGETS[input.device]

  const brandBlock = input.brand.trim()
    ? `Brand name to weave in naturally: "${input.brand.trim()}". Include it (e.g. as a short " | ${input.brand.trim()}" suffix, only when it still fits the length target) in roughly half of the title variants for variety — not every single one.`
    : 'No brand name given — do not invent one.'

  const toneBlock = input.tone.trim() ? `Tone / voice: ${input.tone}.` : 'Tone: clear, professional, and compelling — written to maximize click-through rate.'

  const itemsBlock = input.items.map((item, i) => `${i + 1}. ${item}`).join('\n')

  return `You are an expert SEO copywriter who writes Google SERP meta titles and meta descriptions that are compelling, accurately reflect the page, and fit strict pixel-width display limits.

TARGET DEVICE: ${input.device === 'desktop' ? 'Desktop' : 'Mobile'} Google search results.
${toneBlock}
${brandBlock}

For EACH input line below (a page topic, target keyword, URL, or short brief), generate:
${wantTitles ? `- exactly ${input.count} distinct meta TITLE variants, each targeting ${targets.title}. Front-load the primary keyword/topic. No duplicate phrasing between variants. Do not wrap in quotes.` : '- titles: return an empty array []'}
${wantDescriptions ? `- exactly ${input.count} distinct meta DESCRIPTION variants, each targeting ${targets.description}. Each should include a clear value proposition and a soft call-to-action, and should read naturally (not keyword-stuffed). No duplicate phrasing between variants. Do not wrap in quotes.` : '- descriptions: return an empty array []'}

CRITICAL: Stay as close as possible to the target character counts above without going noticeably over — being too long causes truncation on Google, being too short wastes valuable SERP real estate. Prefer full, punchy sentences that end cleanly at the target length rather than crammed run-ons.

INPUT LINES (return exactly one result object per line, in the exact same order — do not skip, merge, or reorder any line):
${itemsBlock}

Return a "results" array with exactly ${input.items.length} objects, one per input line above, in order.`
}
