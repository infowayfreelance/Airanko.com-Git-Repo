BROWSER RULE (Hamza): don't paste prompts/text/links by script (no JS injection, clipboard script or fill command); only paste or type like a human; leave a 30–60 second gap between actions; move the cursor along random human-like paths, not straight lines.

MODE: AUTOMATED (Hamza 12 Nov + 16 Nov: local build/test first, then PR base main, merge when green, deploy live, verify live). Automatic Vercel preview on a feature-branch PR is fine; do NOT change Vercel settings or promote a preview yourself. Merge and deploy live without waiting for Hamza.

Repo: infowayfreelance/Airanko.com-Git-Repo
Branch from main: onpage-tools-content-optimizer
PR base: main

Page ONLY: https://airanko.com/tools/content-optimizer
Scope: copy, metadata, JSON-LD, internal links. No tool UI/logic/design/image changes. New copy goes below the tool, above the FAQ.

Brand: "Ai Ranko". No invented stats, user counts, ratings or speed claims. No AggregateRating. Remove the SurferSEO / Frase / Clearscope comparison table and prices, the "GPT-4o" mentions (don't name the AI model or provider) and the unsourced claims ("ranks 50%+ better", "strongest E-E-A-T signal", "actively penalized", "since 2014"). Describe Google accurately with links to Google's docs.

Critical: open the optimizer code (page + API route) first and align every claim with what it actually does (100–4,000 words, content types, how many scores, related terms / headings / subtopics / issues counts, whether "Missing Topics" uses real competitor pages, error handling) and tell me whether pasted text is stored or sent to a third-party AI. Keep the H1 "AI Content Optimizer" and the URL.

Full Day-6 brief follows next. Implement every section: title (77→57) and meta (198→154) + OG, copy clean-up, 4 new H2 sections (what Google says about helpful content, what the scores can't see, how to act on the report, optimizer vs writer vs detector replacing "How We Compare"), FAQ 9 → 11 with visible questions identical to the schema, one WebApplication (remove SoftwareApplication) + FAQPage 11, internal links. Push, PR base=main, merge when green, deploy live.

Report back: live URL, PR number, merge SHA, the code-check result, and the brief's verify checklist.

========== FULL DAY-6 BRIEF ==========

BROWSER RULE (Hamza): don't paste prompts/text/links by script (no JS injection, clipboard script or fill command); only paste or type like a human; leave a 30–60 second gap between actions; move the cursor along random human-like paths, not straight lines.

# On-page brief: airanko.com/tools/content-optimizer (Day 6, 24 Nov 2026)

**For:** ChatGPT, in the airanko.com "Website work" chat. **MODE: AUTOMATED** (Hamza 12 Nov + 16 Nov): local build/test first, then PR base main, merge when green, deploy live, verify live yourself. An automatic Vercel preview on the feature-branch PR is fine; do NOT change Vercel settings. Merge and deploy live without waiting for Hamza. **Report back: live URL, PR number, merge SHA, the code-check result** and the verify checklist (section 8).
**Repo:** infowayfreelance/Airanko.com-Git-Repo · branch from main: `onpage-tools-content-optimizer` · PR base: main.
**Scope:** copy, metadata, JSON-LD and internal links on this tool page only. **No tool UI/logic, design or image changes.** New copy uses the section/heading components other Ai Ranko tool pages already use. White-hat only.
**Page:** https://airanko.com/tools/content-optimizer
**Status in queue:** row #6, not done (first on-page pass). **77-char title and 198-char meta** (meta says "Google's 2024 Helpful Content + E-E-A-T guidelines"), **the AI model is named twice ("GPT-4o")**, a **"How We Compare" table with unsourced claims and prices for SurferSEO, Frase and Clearscope** ("$89+/mo", "$45+/mo", "$170+/mo", "Most content optimizers cost $99+/mo"), unsourced stat-style claims ("Content matching search intent ranks 50%+ better", "First-hand experience markers … are the strongest E-E-A-T signal", "Generic AI-generated content … is now actively penalized", "the framework used by Google's Quality Raters since 2014"), outdated framing (the helpful content system has been part of Google's core ranking systems since March 2024), speed claims ("under a minute", "100% Free", "real-time"), **two application schema blocks** (SoftwareApplication + WebApplication), and the **visible FAQ and FAQPage don't match** (visible "What is E-E-A-T?" / "Is it really free?" / "What do I do after seeing the results?" vs schema "What is E-E-A-T and why does it matter?" / "Is the tool really free?" / "What should I do after seeing the results?").

## Brand / product rules (Ai Ranko, free tool site)
- Brand is **"Ai Ranko"** (not "AI Ranko"). Tool site: copy explains what the tool does, its limits and how to use it. No hard selling.
- **Before writing, open the optimizer code (page component + API route) and check every claim**: the 100–4,000 word limits; the content-type options (blog post, landing page, product page, guide, review, comparison, listicle, tutorial); **how many scores the report really returns** (the page says "Six scores" in How It Works, "7 Google Ranking Dimensions" in an H2 and shows 8 cards: confirm and use one number, or none); whether "5-10 missing semantic terms", "4-8 headings", "3-6 subtopics", "8-15 issues" and the 50–60 / 140–160 character title/meta targets are what the prompt/code really asks for; **whether "Missing Topics" compares against real competitor pages or is the AI's suggestion** (if there's no SERP fetch, say "subtopics articles on this topic often cover", not "your competitors cover"); the Issues tab and severity labels; and what happens on an AI error. **Do not name the AI model or provider anywhere** (remove both "GPT-4o" mentions). If the code says anything different from this brief, change the copy to match the code and say so in the report. Also report whether the text a user pastes is stored or sent to a third-party AI service; if yes, add one honest sentence to the "What the Scores Can't See" section.
- **No invented stats, user counts, ratings, AggregateRating or speed claims** ("instantly", "in under a minute", "real-time", "100%").
- No claims about other products (SurferSEO, Frase, Clearscope or any competitor) and no competitor prices: remove them.
- Talk about Google accurately and link to Google's own docs (section 3). Don't say the tool uses "Google's rules" or "Google's actual ranking factors".

## Why this page (GSC first)
- GSC (16 Nov export, Web, 3 months 15 Aug–14 Nov 2026, `/workspace/gsc-onpage-2026-11-16/airanko.com/Pages.csv`): **/tools/content-optimizer: 0 clicks, 598 impressions, avg pos ~44.0.** Page 5, no clicks: not rank-well-leave, so title, meta and copy can change; **keep the URL and the H1 "AI Content Optimizer"**. It's the next "not done" tool page after /tools/meta-title-description-pixel-generator (Day 5).
- Related queries (Queries.csv; query→page mapping inferred): "content optimizer" 253 impr pos 41.4 · "content optimization" 84 pos 79.7 · "content optimizer analyzer" 73 pos 53.7 · "ai content optimizer" 42 pos 24.9 · **"ai content auditing software free" 30 pos 5.9** · "google content optimizer" 23 pos 39.9. The title leads with "Free AI Content Optimizer" and the meta keeps "free AI content audit" (the one query already near the top).
- Live page (24 Nov fetch): 1,077 words, H1 "AI Content Optimizer", 6 H2s (How It Works, Audits 7 Google Ranking Dimensions, Why Google Rules Decide Whether You Rank, How We Compare, Who Uses This Tool, FAQ) + CTA, FAQPage (9) + SoftwareApplication + WebApplication + BreadcrumbList, 11 internal links. Extract: `/workspace/onpage-daily/2026-11-24/competitors/_own-pages/airanko_com_tools_content_optimizer.txt`.

## Competitors checked (web search "free AI content optimizer tool SEO", UK, 24 Nov 2026)
| Competitor | Title (chars) | Words | Schema | What they have that we don't |
|---|---|---|---|---|
| [Lumina – AI Content Optimizer](https://lumina-seo.com/tools/ai-content-optimizer/) | Free Content Optimizer: AI-Powered SEO Analysis \| Lumina (56) | 1,595 | WebApplication, FAQPage (5), BreadcrumbList | **"What the score measures, and what it can't see"**, **"Keyword density is a diagnostic, not a target"**, **"Does a content optimizer improve Google rankings?"** (honest answer), explains exactly how each score is calculated |
| [Originality.ai – Content Optimizer](https://originality.ai/content-optimizer) | Content Optimizer (17) | 1,639 | SoftwareApplication, WebPage | TL;DR box, step-by-step "How to use", "Fitting content optimization into your content workflow" |
| [Orchly – SEO Content Optimizer](https://orchly.ai/free-tools/seo-content-optimizer/) | Free AI SEO Content Optimizer [No Signup Required] (50) | 808 | SoftwareApplication, FAQPage (5) | 3-step how it works; FAQ "How is this different from keyword density tools?" |
| [Rankaza – AI Content Optimizer](https://www.rankaza.com/tools/ai-content-optimizer/) | AI Content Optimizer \| Rankaza (30) | 331 | WebApplication, FAQPage (2), BreadcrumbList | Says plainly what it does with page content ("We do not retain page content") and separates AI suggestions from measured checks |
Extracts: `/workspace/onpage-daily/2026-11-24/competitors/airanko/`. (Competitor claims are theirs; **don't copy them**.)

**Gap summary:** the strongest competitor (Lumina) wins on **honesty and explanation**: what the score measures, what it can't see, and whether optimising improves rankings. Ours has a feature list similar to theirs but undermines it with an unsourced competitor price table, named AI model, stat-like claims nobody can verify and outdated "2024 Helpful Content" framing, plus title/meta far over the snippet width and an FAQ that doesn't match its schema. Fix the claims, add sourced Google guidance, an honest limits section and a "which tool" block, and clean up the schema.

## 1. Title, meta, OG
| Element | Current | New |
|---|---|---|
| Title | Free AI Content Optimizer — Google E-E-A-T + Helpful Content Audit \| Ai Ranko (77) | **Free AI Content Optimizer: SEO & E-E-A-T Audit \| Ai Ranko** (57) |
| Meta | Optimize existing content against Google's 2024 Helpful Content + E-E-A-T guidelines. Get E-E-A-T scores, keyword + LSI analysis, heading rewrites, missing topics & ready-to-paste title/meta — free. (198) | **Paste an article and target keyword for a free AI content audit: E-E-A-T and helpfulness checks, search intent, heading rewrites and a new title and meta.** (154) |
| H1 | AI Content Optimizer | No change |
Update og:title / og:description / twitter tags to match.

## 2. Edit existing copy (text only, same components)
- Badge "Google Quality Rater rules · E-E-A-T scored · 100% Free" → **"Based on Google's public guidance · E-E-A-T checks · Free"**.
- Hero "Paste your article + target keyword. Get a real-time audit against Google's 2024 Helpful Content + E-E-A-T guidelines, with concrete fixes for every issue." → **"Paste your article and target keyword. Get an AI audit based on Google's published guidance on helpful, people-first content and E-E-A-T, with concrete fixes for each issue."**
- How It Works sub-line "From paste to publish-ready in under a minute." → **"From pasted draft to a prioritised list of fixes."**
- Step 02 heading "AI Audits Against Google" → **"AI Reviews Your Content"**; text "GPT-4o scores your content against Google's 2024 Search Quality Rater Guidelines, Helpful Content System, and on-page SEO best practices. Six scores. One overall grade." → **"Our AI reviews your content against Google's public guidance on helpful content and E-E-A-T, plus on-page SEO best practice, and gives you a set of scores and an overall grade."** (state the number of scores only if the code check confirms it).
- H2 "Audits 7 Google Ranking Dimensions" → **"What the Audit Checks"**; sub-line "Built around what Google's public guidelines actually say." → **"Built around Google's public guidance for creating helpful content."**
- E-E-A-T card: "…The framework used by Google's Quality Raters since 2014 — and reinforced in every 2024 update." → **"…The qualities Google's search quality raters use to assess whether content is helpful and reliable."**
- "Keyword + LSI Analysis" card → heading **"Keyword + Related Terms"**, text **"Primary keyword usage and placement, plus related terms readers may expect the article to cover."** (keep the "5-10" count only if the code confirms it).
- "Missing Topics" card: "…subtopics your competitors cover that you don't…" → **"…subtopics that articles on this topic often cover and yours doesn't, with a suggested H2 for each."** (keep "competitors" only if the code really fetches competitor pages).
- Replace the whole **"Why Google Rules Decide Whether You Rank"** section (both paragraphs, the 7 bullets and the 4-stat strip "2024 / 4 / 7 / 8-15") with the new "What Google Says About Helpful Content" section (section 3). If you want to keep a stat strip, keep only **"4 E-E-A-T pillars"**.
- Remove the whole **"How We Compare"** section (sub-line "Most content optimizers cost $99+/mo…" and the SurferSEO / Frase / Clearscope table). Replace it with the new "Content Optimizer, Writer or Detector?" section (section 3).
- "Who Uses This Tool": SEO Managers → **"Audit articles before they're published and catch thin or off-intent content early."**; Agencies → **"Run client content through a consistent audit and share clear, specific fixes."** (no competitor names); Content Marketers and Bloggers: keep, but change "Hit E-E-A-T baseline and add the missing topics competitors are ranking for" → **"Check for experience and expertise signals and add useful subtopics you missed"** and "ranking-friendly" → **"clearer"**.
- Final CTA "Paste any article, get a Google-rules audit + concrete rewrites in under a minute — free." → **"Paste any article and get a content audit with concrete rewrites — free."**; heading "Ready to Pass Google's Bar?" → **"Ready to Improve Your Content?"**
- UK spelling in the copy: "analyze" → "analyse", "optimize" → "optimise" in sentences (keep the product name "AI Content Optimizer", the H1 and the button label as they are).

## 3. New sections (below the tool, above the FAQ; in this order after "What the Audit Checks")

**H2: What Google Says About Helpful Content**
Google's advice is simple to state and harder to follow: create content for people first, not to attract search visits. Its guide to [creating helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) suggests asking **Who** created the content, **How** it was made and **Why** it exists.
A few points from Google's own documentation that this tool is built around:
- **The helpful content system is now part of core ranking.** It was announced in 2022, and in March 2024 it became part of Google's core ranking systems ([ranking systems guide](https://developers.google.com/search/docs/appearance/ranking-systems-guide)).
- **E-E-A-T isn't a single ranking factor.** Google says E-E-A-T itself isn't a specific ranking factor, but its systems use a mix of signals that can identify content with good experience, expertise, authoritativeness and trust, and that of the four, trust is most important ([helpful content guide](https://developers.google.com/search/docs/fundamentals/creating-helpful-content); background: [Google on E-E-A-T](https://developers.google.com/search/blog/2022/12/google-raters-guidelines-e-e-a-t)).
- **There is no preferred word count.** Google says so directly in the same helpful-content guide, so this tool judges depth against the topic and intent, not a target length.
- **AI-assisted content is judged like any other content.** Google says it focuses on the quality of content rather than how it is produced ([Google Search and AI content](https://developers.google.com/search/blog/2023/02/google-search-and-ai-content); see also [guidance on generative AI content](https://developers.google.com/search/docs/fundamentals/using-gen-ai-content)).

**H2: What the Scores Can't See**
The optimizer only sees the text you paste. It can't see:
- your site's reputation, your authors' track record or links pointing to your site;
- how real visitors use the page;
- what currently ranks for your keyword, unless the code check confirms the tool fetches results (if it doesn't, keep this bullet);
- facts: it can flag claims that need a source, but it can't verify them.
Treat the scores as an editor's checklist. A higher score doesn't guarantee better rankings; making the page more useful for the reader is the goal.
*(Add the storage / third-party AI sentence here only if the code check says it applies.)*

**H2: How to Act on the Report**
1. Fix anything marked critical first, such as a mismatch between your content type and the search intent.
2. Add first-hand detail only you can provide: what you tested, saw or measured, with photos or data where you have them.
3. Apply the heading rewrites that make the structure clearer; skip any that don't fit.
4. Add missing subtopics as new sections only where they help the reader.
5. Use the suggested title and meta as a starting point, then check their width with the [meta title & description generator](/tools/meta-title-description-pixel-generator) or the [bulk pixel checker](/tools/meta-title-description-bulk-pixel-checker).
6. Re-run the optimizer to see what's left.

**H2: Content Optimizer, Writer or Detector?**
(Replaces "How We Compare"; cards or a short list, no competitor names.)
- **Use this content optimizer** when you already have a draft and want to know how to improve it.
- **Use the [AI content writer](/tools/content-writer)** when you're starting from scratch.
- **Use the [AI content detector & grammar checker](/tools/plagiarism-checker)** to check readability and grammar before you publish.
- **Use the [SEO strategy maker](/tools/seo-strategy-maker)** to plan which topics to write about in the first place, and the [site audit tool](/tools/site-audit) to check the technical side of the site.

## 4. FAQ (exact text; replace the 9 current Q&As with these 11, **all answers in the server-rendered HTML**, and make the visible questions identical to the FAQPage `name` values). Q1, Q6 and Q8 must match the code check; reword if the code says otherwise and keep the JSON-LD identical
1. **What does this tool actually check?** It reviews your text for signs of experience, expertise and trust, how people-first and useful it reads, keyword and related-term coverage, whether the content type matches the search intent, structure and readability, heading quality, on-page basics (title, meta description, URL slug, schema type, internal link ideas) and subtopics you may have missed.
2. **What is E-E-A-T and why does it matter?** E-E-A-T stands for Experience, Expertise, Authoritativeness and Trustworthiness. Google's search quality raters use these ideas to assess whether results are helpful, and Google's guidance encourages content that shows them. Google says trust is the most important of the four.
3. **Is E-E-A-T a Google ranking factor?** Not directly. Google says E-E-A-T itself isn't a specific ranking factor, but its systems use a mix of signals that can identify content with good E-E-A-T. This tool looks for signs of those qualities in your text, such as first-hand experience, clear sourcing and author information.
4. **How is this different from a grammar checker?** A grammar checker fixes spelling and language. This tool looks at whether the content serves the searcher: does it match the intent, cover the topic, show experience and expertise, and have a clear structure? It then suggests specific rewrites and fixes.
5. **Does the tool follow Google's rules?** It's built around Google's public guidance on helpful, reliable, people-first content and on-page best practice. It isn't made by Google and can't see how Google ranks a specific page; treat the report as an editor's checklist, not a prediction.
6. **How accurate is the E-E-A-T score?** It's an AI estimate based only on the text you paste: things like first-hand experience, original data, credentials, citations and author attribution. It can't see your site's reputation, your authors' track record, links to your site or how real users respond, which also matter.
7. **What are related terms (or "LSI keywords")?** They're words and phrases a knowledgeable writer would naturally use when covering a topic, for example "arch support" and "cushioning" in an article about running shoes. The SEO name "LSI keywords" is widely used, but what matters is covering the topic properly for the reader, not adding a list of terms.
8. **How much content can I analyse?** Between 100 and 4,000 words per analysis. For longer pieces, audit each major section separately for more focused feedback.
9. **Is the tool really free?** Yes. The content optimizer is free to use and you don't need to sign up.
10. **Will a higher score improve my Google rankings?** Not on its own. The score is a guide to making the content more useful and complete; rankings depend on many things the tool can't measure, including competition, links and how well the page meets searchers' needs. Use the fixes that genuinely improve the page for readers.
11. **What should I do after seeing the results?** Start with the critical issues, then apply the heading rewrites that make sense, add missing subtopics as new sections where they help the reader, and use the suggested title and meta as a starting point. Re-run the tool after editing to check what's left.

**FAQ markup pattern (answers present in the raw HTML; reuse the existing FAQ component and classes, this only shows the required structure):**
```html
<section id="faq">
  <details>
    <summary><h3>What does this tool actually check?</h3></summary>
    <p>It reviews your text for signs of experience, expertise and trust, how people-first and useful it reads, keyword and related-term coverage, whether the content type matches the search intent, structure and readability, heading quality, on-page basics (title, meta description, URL slug, schema type, internal link ideas) and subtopics you may have missed.</p>
  </details>
  <details>
    <summary><h3>What is E-E-A-T and why does it matter?</h3></summary>
    <p>E-E-A-T stands for Experience, Expertise, Authoritativeness and Trustworthiness. Google&#x27;s search quality raters use these ideas to assess whether results are helpful, and Google&#x27;s guidance encourages content that shows them. Google says trust is the most important of the four.</p>
  </details>
  <details>
    <summary><h3>Is E-E-A-T a Google ranking factor?</h3></summary>
    <p>Not directly. Google says E-E-A-T itself isn&#x27;t a specific ranking factor, but its systems use a mix of signals that can identify content with good E-E-A-T. This tool looks for signs of those qualities in your text, such as first-hand experience, clear sourcing and author information.</p>
  </details>
  <details>
    <summary><h3>How is this different from a grammar checker?</h3></summary>
    <p>A grammar checker fixes spelling and language. This tool looks at whether the content serves the searcher: does it match the intent, cover the topic, show experience and expertise, and have a clear structure? It then suggests specific rewrites and fixes.</p>
  </details>
  <details>
    <summary><h3>Does the tool follow Google&#x27;s rules?</h3></summary>
    <p>It&#x27;s built around Google&#x27;s public guidance on helpful, reliable, people-first content and on-page best practice. It isn&#x27;t made by Google and can&#x27;t see how Google ranks a specific page; treat the report as an editor&#x27;s checklist, not a prediction.</p>
  </details>
  <details>
    <summary><h3>How accurate is the E-E-A-T score?</h3></summary>
    <p>It&#x27;s an AI estimate based only on the text you paste: things like first-hand experience, original data, credentials, citations and author attribution. It can&#x27;t see your site&#x27;s reputation, your authors&#x27; track record, links to your site or how real users respond, which also matter.</p>
  </details>
  <details>
    <summary><h3>What are related terms (or &quot;LSI keywords&quot;)?</h3></summary>
    <p>They&#x27;re words and phrases a knowledgeable writer would naturally use when covering a topic, for example &quot;arch support&quot; and &quot;cushioning&quot; in an article about running shoes. The SEO name &quot;LSI keywords&quot; is widely used, but what matters is covering the topic properly for the reader, not adding a list of terms.</p>
  </details>
  <details>
    <summary><h3>How much content can I analyse?</h3></summary>
    <p>Between 100 and 4,000 words per analysis. For longer pieces, audit each major section separately for more focused feedback.</p>
  </details>
  <details>
    <summary><h3>Is the tool really free?</h3></summary>
    <p>Yes. The content optimizer is free to use and you don&#x27;t need to sign up.</p>
  </details>
  <details>
    <summary><h3>Will a higher score improve my Google rankings?</h3></summary>
    <p>Not on its own. The score is a guide to making the content more useful and complete; rankings depend on many things the tool can&#x27;t measure, including competition, links and how well the page meets searchers&#x27; needs. Use the fixes that genuinely improve the page for readers.</p>
  </details>
  <details>
    <summary><h3>What should I do after seeing the results?</h3></summary>
    <p>Start with the critical issues, then apply the heading rewrites that make sense, add missing subtopics as new sections where they help the reader, and use the suggested title and meta as a starting point. Re-run the tool after editing to check what&#x27;s left.</p>
  </details>
</section>
```

## 5. Schema (JSON-LD), this page only
**Remove the SoftwareApplication block.** Keep **one** application block (WebApplication) with a feature list that matches the code check (edit the list if the code differs):
```json
{
 "@context": "https://schema.org",
 "@type": "WebApplication",
 "@id": "https://airanko.com/tools/content-optimizer#app",
 "name": "AI Content Optimizer",
 "url": "https://airanko.com/tools/content-optimizer",
 "description": "Paste an article and target keyword for a free AI content audit: E-E-A-T and helpfulness checks, search intent, heading rewrites and a new title and meta.",
 "applicationCategory": "UtilityApplication",
 "operatingSystem": "Any",
 "browserRequirements": "Requires JavaScript.",
 "isAccessibleForFree": true,
 "featureList": [
  "E-E-A-T signals check",
  "Helpfulness (people-first) check",
  "Keyword and related-term analysis",
  "Search intent match",
  "Structure and readability review",
  "Heading rewrites with reasons",
  "Suggested title, meta description, URL slug and schema type",
  "Missing subtopic suggestions",
  "100 to 4,000 words per analysis"
 ],
 "offers": {
  "@type": "Offer",
  "price": "0",
  "priceCurrency": "USD"
 },
 "provider": {
  "@id": "https://airanko.com/#organization"
 }
}
```

**FAQPage**: replace the 9-question block with all 11 visible Q&As, exactly as shown:
```json
{
 "@context": "https://schema.org",
 "@type": "FAQPage",
 "@id": "https://airanko.com/tools/content-optimizer#faq",
 "mainEntity": [
  {
   "@type": "Question",
   "name": "What does this tool actually check?",
   "acceptedAnswer": {
    "@type": "Answer",
    "text": "It reviews your text for signs of experience, expertise and trust, how people-first and useful it reads, keyword and related-term coverage, whether the content type matches the search intent, structure and readability, heading quality, on-page basics (title, meta description, URL slug, schema type, internal link ideas) and subtopics you may have missed."
   }
  },
  {
   "@type": "Question",
   "name": "What is E-E-A-T and why does it matter?",
   "acceptedAnswer": {
    "@type": "Answer",
    "text": "E-E-A-T stands for Experience, Expertise, Authoritativeness and Trustworthiness. Google's search quality raters use these ideas to assess whether results are helpful, and Google's guidance encourages content that shows them. Google says trust is the most important of the four."
   }
  },
  {
   "@type": "Question",
   "name": "Is E-E-A-T a Google ranking factor?",
   "acceptedAnswer": {
    "@type": "Answer",
    "text": "Not directly. Google says E-E-A-T itself isn't a specific ranking factor, but its systems use a mix of signals that can identify content with good E-E-A-T. This tool looks for signs of those qualities in your text, such as first-hand experience, clear sourcing and author information."
   }
  },
  {
   "@type": "Question",
   "name": "How is this different from a grammar checker?",
   "acceptedAnswer": {
    "@type": "Answer",
    "text": "A grammar checker fixes spelling and language. This tool looks at whether the content serves the searcher: does it match the intent, cover the topic, show experience and expertise, and have a clear structure? It then suggests specific rewrites and fixes."
   }
  },
  {
   "@type": "Question",
   "name": "Does the tool follow Google's rules?",
   "acceptedAnswer": {
    "@type": "Answer",
    "text": "It's built around Google's public guidance on helpful, reliable, people-first content and on-page best practice. It isn't made by Google and can't see how Google ranks a specific page; treat the report as an editor's checklist, not a prediction."
   }
  },
  {
   "@type": "Question",
   "name": "How accurate is the E-E-A-T score?",
   "acceptedAnswer": {
    "@type": "Answer",
    "text": "It's an AI estimate based only on the text you paste: things like first-hand experience, original data, credentials, citations and author attribution. It can't see your site's reputation, your authors' track record, links to your site or how real users respond, which also matter."
   }
  },
  {
   "@type": "Question",
   "name": "What are related terms (or \"LSI keywords\")?",
   "acceptedAnswer": {
    "@type": "Answer",
    "text": "They're words and phrases a knowledgeable writer would naturally use when covering a topic, for example \"arch support\" and \"cushioning\" in an article about running shoes. The SEO name \"LSI keywords\" is widely used, but what matters is covering the topic properly for the reader, not adding a list of terms."
   }
  },
  {
   "@type": "Question",
   "name": "How much content can I analyse?",
   "acceptedAnswer": {
    "@type": "Answer",
    "text": "Between 100 and 4,000 words per analysis. For longer pieces, audit each major section separately for more focused feedback."
   }
  },
  {
   "@type": "Question",
   "name": "Is the tool really free?",
   "acceptedAnswer": {
    "@type": "Answer",
    "text": "Yes. The content optimizer is free to use and you don't need to sign up."
   }
  },
  {
   "@type": "Question",
   "name": "Will a higher score improve my Google rankings?",
   "acceptedAnswer": {
    "@type": "Answer",
    "text": "Not on its own. The score is a guide to making the content more useful and complete; rankings depend on many things the tool can't measure, including competition, links and how well the page meets searchers' needs. Use the fixes that genuinely improve the page for readers."
   }
  },
  {
   "@type": "Question",
   "name": "What should I do after seeing the results?",
   "acceptedAnswer": {
    "@type": "Answer",
    "text": "Start with the critical issues, then apply the heading rewrites that make sense, add missing subtopics as new sections where they help the reader, and use the suggested title and meta as a starting point. Re-run the tool after editing to check what's left."
   }
  }
 ]
}
```

**BreadcrumbList**: keep the existing one. No AggregateRating anywhere.

## 6. Internal links (body copy, natural anchors)
- /tools/content-writer · /tools/plagiarism-checker · /tools/seo-strategy-maker · /tools/site-audit (section 3, "Content Optimizer, Writer or Detector?") · /tools/meta-title-description-pixel-generator · /tools/meta-title-description-bulk-pixel-checker (section 3, "How to Act on the Report", step 5).
- External sources: [Google – creating helpful content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content), [Google – ranking systems guide](https://developers.google.com/search/docs/appearance/ranking-systems-guide), [Google – E-E-A-T and the raters' guidelines](https://developers.google.com/search/blog/2022/12/google-raters-guidelines-e-e-a-t), [Google – generative AI content](https://developers.google.com/search/docs/fundamentals/using-gen-ai-content), [Google Search and AI content](https://developers.google.com/search/blog/2023/02/google-search-and-ai-content). All targets returned 200 on 24 Nov. Keep all existing links.

## 7. Do NOT touch
- The tool itself (inputs, buttons, results, scoring, prompt/API logic), layout, design, nav (including the sitewide "New: AI Content Writer … 2025 E-E-A-T" promo, which is out of scope today), footer, images.
- The URL and H1. No new stats, user counts, ratings, speed claims, comparisons with other products, competitor prices or AggregateRating. Don't name the AI model or provider.
- /tools/meta-title-description-pixel-generator (Day 5), /tools/meta-title-description-bulk-pixel-checker (Day 4), /tools/website-cloner (Day 3), /tools/xml-sitemap-generator (Day 2), /tools/site-audit (Day 1), the rank-well-leave pages (/, /tools/vibe-code-detector, /tools/vibe-code-security-scanner, /blog/top-10-mobile-friendly-websites) or any other page.

## 8. Verify after deploy (report back)
1. Live URL 200 with a self-referencing canonical. Report the **live URL, PR number and merge SHA**, and the code-check result from the brand rules (score count, Missing Topics source, storage/third-party AI).
2. Rendered `<title>`, meta and og tags match section 1; H1 unchanged and the only H1.
3. `curl -s https://airanko.com/tools/content-optimizer | grep -ciE "GPT-4o|SurferSEO|Frase|Clearscope|\$89|50%\+|under a minute|100% Free"` returns 0.
4. The 4 new H2s are visible between "What the Audit Checks" and the FAQ; "How We Compare" and "Why Google Rules Decide Whether You Rank" are gone; all 11 FAQ answers are in the raw HTML and the visible questions equal the FAQPage names.
5. Rich Results Test / schema check: one WebApplication, FAQPage (11), BreadcrumbList; no SoftwareApplication; no AggregateRating.
6. The tool still works (paste 150+ words with a keyword, run an analysis, see the results tabs).
7. New internal links and the 5 Google links return 200.
