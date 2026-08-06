import { generateText, Output, NoObjectGeneratedError } from 'ai'
import { openai } from '@ai-sdk/openai'
import * as z from 'zod'
import { PIXEL_LIMITS, type Device, type Field } from '@/lib/meta-pixel/limits'

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

// ---------------------------------------------------------------------------
// Character targets used only to steer the model — the real pass/fail check
// always happens client-side via canvas pixel measurement (lib/meta-pixel).
//
// These are DERIVED from the actual PIXEL_LIMITS (maxPx ÷ an average
// per-character pixel width for the field's font size), not hand-guessed —
// a previous version hard-coded "40-50 chars" for mobile titles, which was
// backwards: mobile titles render at 18px (vs 20px on desktop) so more
// characters fit in a *narrower* 580px budget than desktop's 600px, not
// fewer. Guessed numbers drift out of sync with PIXEL_LIMITS; a derived
// formula can't.
//
// Titles use a wider average-char-width ratio (mixed/title case, wider
// glyphs); descriptions use a narrower ratio (sentence case, lots of short
// words and spaces) — this mirrors why the industry-standard guidance is
// ~50-60 chars for titles but ~150-160 for descriptions despite descriptions
// having a much larger pixel budget (920px vs 600px), not a proportionally
// larger one.
// ---------------------------------------------------------------------------
const AVG_CHAR_WIDTH_RATIO: Record<Field, number> = { title: 0.52, description: 0.42 }

function fontSizePx(font: string): number {
  const match = font.match(/(\d+)px/)
  return match ? parseInt(match[1], 10) : 16
}

function charTarget(device: Device, field: Field): string {
  const limit = PIXEL_LIMITS[device][field]
  const avgCharPx = fontSizePx(limit.font) * AVG_CHAR_WIDTH_RATIO[field]
  const maxChars = Math.floor(limit.maxPx / avgCharPx)
  const low = Math.max(10, Math.round(maxChars * 0.82))
  const high = Math.round(maxChars * 0.96) // stay a hair under the true max — safety margin for wide-character text
  return `${low}-${high} characters (fits within ~${limit.maxPx}px at ${limit.font.replace('400 ', '')})`
}

const CHAR_TARGETS = {
  desktop: { title: charTarget('desktop', 'title'), description: charTarget('desktop', 'description') },
  mobile: { title: charTarget('mobile', 'title'), description: charTarget('mobile', 'description') },
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
        // Structured JSON output tends to collapse toward near-identical phrasing
        // across variants at low temperature — push it up for real variety.
        temperature: 1,
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

  const variantAngles = [
    'a direct, keyword-first angle (topic/keyword in the first few words)',
    'a benefit-led angle (lead with the outcome/value the reader gets)',
    'a question or curiosity angle',
    'a number/specificity angle (a count, year, or concrete detail)',
    'an urgency or CTA-led angle',
  ].slice(0, Math.max(3, input.count))

  return `You are an expert SEO copywriter who writes Google SERP meta titles and meta descriptions that are compelling, accurately reflect the page, and fit strict pixel-width display limits.

TARGET DEVICE: ${input.device === 'desktop' ? 'Desktop' : 'Mobile'} Google search results.
${toneBlock}
${brandBlock}

For EACH input line below (a page topic, target keyword, URL, or short brief), generate:
${wantTitles ? `- exactly ${input.count} distinct meta TITLE variants, each targeting ${targets.title}. Front-load the primary keyword/topic in at least one variant.` : '- titles: return an empty array []'}
${wantDescriptions ? `- exactly ${input.count} distinct meta DESCRIPTION variants, each targeting ${targets.description}. Each should include a clear value proposition and a soft call-to-action, and should read naturally (not keyword-stuffed).` : '- descriptions: return an empty array []'}

VARIANT DIVERSITY IS MANDATORY — this is the most common mistake, avoid it:
- Every variant within the same field for the same input line MUST use a genuinely different opening, sentence structure, and angle. Do not just swap one or two words between variants ("Best X for Y" / "Top X for Y" / "Great X for Y" is NOT diversity — that is a rejected pattern).
- Rotate across these angles as you write each variant (use as many distinct ones as you have variants for): ${variantAngles.join('; ')}.
- If you notice two variants sharing the same first 3-4 words, rewrite one of them from scratch with a different angle before finalizing your answer.
- Never wrap any title or description in quotation marks.

CRITICAL LENGTH RULE: Stay strictly within the target character range above for every variant — going over causes truncation on Google, going noticeably under wastes valuable SERP real estate. Count characters (including spaces and punctuation) as you write, and trim word-by-word from the end if you overshoot rather than leaving a run-on sentence.

INPUT LINES (return exactly one result object per line, in the exact same order — do not skip, merge, or reorder any line):
${itemsBlock}

Return a "results" array with exactly ${input.items.length} objects, one per input line above, in order.`
}
