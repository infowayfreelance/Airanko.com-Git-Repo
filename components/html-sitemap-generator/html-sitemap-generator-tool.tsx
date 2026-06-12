'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  Globe, Sparkles, AlertCircle, CheckCircle2, RefreshCw, Copy, Download,
  Settings2, Eye, Code, FileCode, FileJson, Filter, Search, Palette,
  LayoutGrid, List, ListTree, Columns, Rows3, ChevronDown, ChevronRight,
  ExternalLink, Calendar, Map, X, Sun, Moon, Sliders,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { HtmlSitemapResult, SitemapPage } from '@/app/api/html-sitemap-generator/route'

type Stage = 'input' | 'generating' | 'results'
type SourceMode = 'auto' | 'sitemap' | 'crawl'
type Layout = 'tree' | 'cards' | 'list' | 'columns' | 'compact'
type Theme = 'modern' | 'minimal' | 'classic' | 'dark'
type OutputFormat = 'html-page' | 'html-snippet' | 'markdown' | 'json' | 'txt'

const GENERATE_STEPS = [
  { label: 'Fetching homepage…',              icon: Globe },
  { label: 'Checking robots.txt & sitemap…',  icon: FileCode },
  { label: 'Discovering pages…',              icon: Search },
  { label: 'Extracting titles & meta data…',  icon: ListTree },
  { label: 'Building categorized sitemap…',   icon: Map },
]

const THEMES: Record<Theme, { label: string; accent: string; bg: string; card: string; text: string; muted: string; border: string }> = {
  modern:  { label: 'Modern',  accent: '#6366f1', bg: '#f8fafc', card: '#ffffff', text: '#0f172a', muted: '#64748b', border: '#e2e8f0' },
  minimal: { label: 'Minimal', accent: '#111827', bg: '#ffffff', card: '#fafafa', text: '#111827', muted: '#6b7280', border: '#e5e7eb' },
  classic: { label: 'Classic', accent: '#1e40af', bg: '#f9fafb', card: '#ffffff', text: '#1f2937', muted: '#4b5563', border: '#d1d5db' },
  dark:    { label: 'Dark',    accent: '#a78bfa', bg: '#0f172a', card: '#1e293b', text: '#f1f5f9', muted: '#94a3b8', border: '#334155' },
}

const LAYOUTS: { id: Layout; label: string; icon: typeof LayoutGrid; description: string }[] = [
  { id: 'tree',    label: 'Tree',    icon: ListTree,   description: 'Hierarchical view, grouped by category' },
  { id: 'cards',   label: 'Cards',   icon: LayoutGrid, description: 'Visual card grid for each page' },
  { id: 'list',    label: 'List',    icon: List,       description: 'Simple bullet list per category' },
  { id: 'columns', label: 'Columns', icon: Columns,    description: 'Multi-column layout' },
  { id: 'compact', label: 'Compact', icon: Rows3,      description: 'Dense rows, ideal for many pages' },
]

const OUTPUT_FORMATS: { id: OutputFormat; label: string; icon: typeof Code; description: string }[] = [
  { id: 'html-page',    label: 'Standalone HTML', icon: Code,     description: 'Complete HTML page with embedded CSS' },
  { id: 'html-snippet', label: 'HTML Snippet',    icon: FileCode, description: 'Markup only — paste into your existing page' },
  { id: 'markdown',     label: 'Markdown',        icon: FileCode, description: 'GitHub-style markdown for docs/READMEs' },
  { id: 'json',         label: 'JSON',            icon: FileJson, description: 'Structured data for scripts/APIs' },
  { id: 'txt',          label: 'Plain text',      icon: FileCode, description: 'Simple URL list, one per line' },
]

const ACCENT_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
  '#eab308', '#22c55e', '#10b981', '#06b6d4', '#3b82f6',
  '#0f172a', '#a78bfa',
]

// ── Output generators ──────────────────────────────────────────────────────

function generateHtmlPage(
  data: HtmlSitemapResult,
  options: {
    layout: Layout
    theme: Theme
    accent: string
    showUrls: boolean
    showDescriptions: boolean
    showDates: boolean
    showSearch: boolean
    showStats: boolean
    title: string
  },
): string {
  const t = { ...THEMES[options.theme], accent: options.accent }

  const categoriesHtml = data.categories.map((cat) => {
    const pagesHtml = cat.pages.map((p) => generatePageHtml(p, options, t)).join('\n')
    return `      <section class="category">
        <h2>${escapeHtml(cat.name)} <span class="count">${cat.pages.length}</span></h2>
        <${options.layout === 'cards' ? 'div class="cards-grid"' : options.layout === 'columns' ? 'div class="columns"' : 'ul'}>
${pagesHtml}
        </${options.layout === 'cards' || options.layout === 'columns' ? 'div' : 'ul'}>
      </section>`
  }).join('\n')

  const searchScript = options.showSearch ? `
    <script>
      document.getElementById('site-search').addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        document.querySelectorAll('.page-item').forEach(item => {
          const txt = item.textContent.toLowerCase();
          item.style.display = txt.includes(term) ? '' : 'none';
        });
      });
    </script>` : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(options.title)}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: ${t.bg}; color: ${t.text}; line-height: 1.6; min-height: 100vh; }
  .container { max-width: 1200px; margin: 0 auto; padding: 48px 24px; }
  header { margin-bottom: 40px; }
  h1 { font-size: 32px; font-weight: 700; color: ${t.text}; margin-bottom: 8px; }
  .subtitle { color: ${t.muted}; font-size: 16px; }
  .stats { display: flex; gap: 16px; margin: 24px 0; flex-wrap: wrap; }
  .stat { background: ${t.card}; border: 1px solid ${t.border}; border-radius: 8px; padding: 12px 18px; }
  .stat-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: ${t.muted}; font-weight: 600; }
  .stat-value { font-size: 20px; font-weight: 700; color: ${t.accent}; margin-top: 2px; }
  .search-box { width: 100%; padding: 12px 16px; border: 1px solid ${t.border}; border-radius: 8px; background: ${t.card}; color: ${t.text}; font-size: 14px; margin-bottom: 32px; }
  .search-box:focus { outline: none; border-color: ${t.accent}; }
  .category { background: ${t.card}; border: 1px solid ${t.border}; border-radius: 12px; padding: 24px; margin-bottom: 20px; }
  .category h2 { font-size: 18px; font-weight: 700; color: ${t.text}; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
  .category .count { font-size: 12px; background: ${t.accent}15; color: ${t.accent}; padding: 2px 8px; border-radius: 10px; font-weight: 600; }
  ul { list-style: none; }
  .page-item { padding: 10px 0; border-bottom: 1px solid ${t.border}; }
  .page-item:last-child { border-bottom: none; }
  .page-item a { color: ${t.accent}; text-decoration: none; font-weight: 500; }
  .page-item a:hover { text-decoration: underline; }
  .page-url { font-family: ui-monospace, monospace; font-size: 11px; color: ${t.muted}; margin-top: 4px; }
  .page-desc { color: ${t.muted}; font-size: 13px; margin-top: 4px; }
  .page-date { color: ${t.muted}; font-size: 11px; margin-top: 4px; }
  .cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }
  .cards-grid .page-item { background: ${t.bg}; border: 1px solid ${t.border}; border-radius: 8px; padding: 14px; }
  .columns { columns: 2; column-gap: 24px; }
  .columns .page-item { break-inside: avoid; }
  @media (max-width: 640px) {
    .columns { columns: 1; }
    h1 { font-size: 24px; }
  }
  footer { margin-top: 48px; text-align: center; color: ${t.muted}; font-size: 13px; }
  footer a { color: ${t.accent}; text-decoration: none; }
</style>
</head>
<body>
<div class="container">
  <header>
    <h1>${escapeHtml(options.title)}</h1>
    <p class="subtitle">A complete index of all pages on ${escapeHtml(data.domain)}.</p>
${options.showStats ? `    <div class="stats">
      <div class="stat"><div class="stat-label">Total pages</div><div class="stat-value">${data.pageCount}</div></div>
      <div class="stat"><div class="stat-label">Categories</div><div class="stat-value">${data.categories.length}</div></div>
      <div class="stat"><div class="stat-label">Source</div><div class="stat-value">${data.source}</div></div>
    </div>` : ''}
${options.showSearch ? `    <input id="site-search" class="search-box" type="search" placeholder="Search pages…" />` : ''}
  </header>
${categoriesHtml}
  <footer>
    <p>Generated with <a href="https://airanko.com/tools/html-sitemap-generator">Ai Ranko HTML Sitemap Generator</a> · ${new Date(data.generatedAt).toLocaleDateString()}</p>
  </footer>
</div>${searchScript}
</body>
</html>`
}

function generatePageHtml(p: SitemapPage, opts: { showUrls: boolean; showDescriptions: boolean; showDates: boolean }, t: { muted: string }): string {
  const linkText = p.title ?? p.path
  return `          <li class="page-item">
            <a href="${escapeHtml(p.url)}">${escapeHtml(linkText)}</a>
${opts.showUrls       ? `            <div class="page-url">${escapeHtml(p.url)}</div>` : ''}
${opts.showDescriptions && p.description ? `            <div class="page-desc">${escapeHtml(p.description)}</div>` : ''}
${opts.showDates && p.lastModified ? `            <div class="page-date">Updated ${escapeHtml(p.lastModified.split('T')[0])}</div>` : ''}
          </li>`
}

function generateHtmlSnippet(data: HtmlSitemapResult, opts: { showUrls: boolean; showDescriptions: boolean; showDates: boolean }): string {
  return `<div class="sitemap">\n${data.categories.map((cat) => `  <section>
    <h2>${escapeHtml(cat.name)}</h2>
    <ul>
${cat.pages.map((p) => `      <li><a href="${escapeHtml(p.url)}">${escapeHtml(p.title ?? p.path)}</a>${opts.showDescriptions && p.description ? ` — ${escapeHtml(p.description)}` : ''}</li>`).join('\n')}
    </ul>
  </section>`).join('\n')}\n</div>`
}

function generateMarkdown(data: HtmlSitemapResult, opts: { showUrls: boolean; showDescriptions: boolean; showDates: boolean }): string {
  let md = `# Sitemap — ${data.domain}\n\nA complete index of all ${data.pageCount} pages on ${data.domain}.\n\n`
  for (const cat of data.categories) {
    md += `## ${cat.name}\n\n`
    for (const p of cat.pages) {
      const title = p.title ?? p.path
      md += `- [${title}](${p.url})`
      if (opts.showDescriptions && p.description) md += ` — ${p.description}`
      if (opts.showDates && p.lastModified) md += ` _(updated ${p.lastModified.split('T')[0]})_`
      md += `\n`
    }
    md += `\n`
  }
  md += `---\n\n_Generated with [Ai Ranko HTML Sitemap Generator](https://airanko.com/tools/html-sitemap-generator)_\n`
  return md
}

function generateJson(data: HtmlSitemapResult): string {
  return JSON.stringify(data, null, 2)
}

function generateTxt(data: HtmlSitemapResult): string {
  return data.pages.map((p) => p.url).join('\n')
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// ── Main component ─────────────────────────────────────────────────────────

export default function HtmlSitemapGeneratorTool() {
  // Input options
  const [url, setUrl] = useState('')
  const [sourceMode, setSourceMode] = useState<SourceMode>('auto')
  const [maxPages, setMaxPages] = useState(50)
  const [maxDepth, setMaxDepth] = useState(3)
  const [includeMeta, setIncludeMeta] = useState(true)

  // Display options
  const [layout, setLayout] = useState<Layout>('tree')
  const [theme, setTheme] = useState<Theme>('modern')
  const [accent, setAccent] = useState('#6366f1')
  const [showUrls, setShowUrls] = useState(false)
  const [showDescriptions, setShowDescriptions] = useState(true)
  const [showDates, setShowDates] = useState(true)
  const [showSearch, setShowSearch] = useState(true)
  const [showStats, setShowStats] = useState(true)
  const [pageTitle, setPageTitle] = useState('Sitemap')
  const [searchFilter, setSearchFilter] = useState('')

  // Output
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('html-page')

  // State
  const [stage, setStage] = useState<Stage>('input')
  const [generateStep, setGenerateStep] = useState(0)
  const [result, setResult] = useState<HtmlSitemapResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [showOptions, setShowOptions] = useState(true)
  const [previewMode, setPreviewMode] = useState<'preview' | 'code'>('preview')

  // Sync default page title with domain
  useEffect(() => {
    if (result && pageTitle === 'Sitemap') {
      setPageTitle(`Sitemap — ${result.domain}`)
    }
  }, [result, pageTitle])

  async function generate() {
    if (url.trim().length < 4) return
    setError(null)
    setStage('generating')
    setGenerateStep(0)
    const interval = setInterval(() => setGenerateStep((s) => Math.min(s + 1, GENERATE_STEPS.length - 1)), 1700)

    try {
      const res = await fetch('/api/html-sitemap-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, sourceMode, maxPages, maxDepth, includeMeta }),
      })
      clearInterval(interval)
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Generation failed.')
      }
      const data: HtmlSitemapResult = await res.json()
      setResult(data)
      setStage('results')
      setPageTitle(`Sitemap — ${data.domain}`)
    } catch (err: unknown) {
      clearInterval(interval)
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setStage('input')
    }
  }

  function reset() {
    setStage('input')
    setResult(null)
    setError(null)
    setGenerateStep(0)
    setSearchFilter('')
  }

  async function copyOutput() {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  function downloadOutput() {
    if (!result) return
    const ext = outputFormat === 'html-page' || outputFormat === 'html-snippet' ? 'html' :
                outputFormat === 'markdown' ? 'md' :
                outputFormat === 'json'     ? 'json' : 'txt'
    const mime = ext === 'html' ? 'text/html' : ext === 'json' ? 'application/json' : ext === 'md' ? 'text/markdown' : 'text/plain'
    const blob = new Blob([output], { type: `${mime};charset=utf-8` })
    const objectUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = objectUrl
    a.download = `sitemap-${result.domain}-${Date.now()}.${ext}`
    a.click()
    URL.revokeObjectURL(objectUrl)
  }

  // ── Generate output string ─────────────────────────────────────────────
  const output = useMemo(() => {
    if (!result) return ''
    const opts = { showUrls, showDescriptions, showDates }
    switch (outputFormat) {
      case 'html-page':
        return generateHtmlPage(result, {
          ...opts, showSearch, showStats, layout, theme, accent, title: pageTitle,
        })
      case 'html-snippet': return generateHtmlSnippet(result, opts)
      case 'markdown':     return generateMarkdown(result, opts)
      case 'json':         return generateJson(result)
      case 'txt':          return generateTxt(result)
    }
  }, [result, outputFormat, layout, theme, accent, showUrls, showDescriptions, showDates, showSearch, showStats, pageTitle])

  const t = { ...THEMES[theme], accent }

  const filteredCategories = useMemo(() => {
    if (!result) return []
    if (!searchFilter.trim()) return result.categories
    const term = searchFilter.toLowerCase()
    return result.categories
      .map((cat) => ({
        ...cat,
        pages: cat.pages.filter((p) =>
          (p.title?.toLowerCase().includes(term) ?? false) ||
          p.url.toLowerCase().includes(term) ||
          (p.description?.toLowerCase().includes(term) ?? false)
        ),
      }))
      .filter((cat) => cat.pages.length > 0)
  }, [result, searchFilter])

  // ── INPUT STAGE ────────────────────────────────────────────────────────
  if (stage === 'input') {
    return (
      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mx-auto mb-8 max-w-2xl text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3 w-3" />
              Real crawl · 5 layouts · 4 themes · 5 export formats · 100% Free
            </div>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              HTML Sitemap Generator
            </h1>
            <p className="mt-3 leading-relaxed text-muted-foreground text-pretty">
              Generate a beautiful, customizable HTML sitemap from any URL. <strong>Crawls up to 100 pages</strong>, categorizes automatically, and exports as standalone HTML, Markdown, or JSON — with live preview, theme picker, and instant copy.
            </p>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { icon: Globe,     label: 'Real crawl' },
              { icon: Palette,   label: '4 themes' },
              { icon: LayoutGrid,label: '5 layouts' },
              { icon: Download,  label: '5 export formats' },
            ].map((f) => (
              <div key={f.label} className="flex items-center justify-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
                <f.icon className="h-3.5 w-3.5 text-primary" />
                <span className="truncate">{f.label}</span>
              </div>
            ))}
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <label className="block text-sm font-semibold text-foreground">
              Website URL <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-2">
              <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && generate()}
                placeholder="https://yourwebsite.com"
                className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Advanced options */}
            <div className="mt-5 space-y-4 rounded-2xl border border-border bg-muted/30 p-4">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Sliders className="h-3 w-3" /> Crawl options
              </p>

              <div>
                <p className="mb-2 text-xs font-medium text-foreground">Source</p>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { id: 'auto' as SourceMode,    label: 'Auto-detect',  description: 'Sitemap → crawl fallback' },
                    { id: 'sitemap' as SourceMode, label: 'Sitemap.xml',  description: 'XML sitemap only' },
                    { id: 'crawl' as SourceMode,   label: 'Crawl links',  description: 'Follow internal links' },
                  ]).map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setSourceMode(opt.id)}
                      className={cn(
                        'flex flex-col items-start gap-0.5 rounded-lg border px-3 py-2 text-left text-xs transition-all',
                        sourceMode === opt.id
                          ? 'border-primary bg-primary/5 text-foreground'
                          : 'border-border bg-card text-muted-foreground hover:text-foreground',
                      )}
                    >
                      <span className="font-semibold">{opt.label}</span>
                      <span className="text-[10px]">{opt.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-medium text-foreground">Max pages</p>
                    <span className="font-heading text-xs font-bold text-primary tabular-nums">{maxPages}</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={100}
                    step={5}
                    value={maxPages}
                    onChange={(e) => setMaxPages(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-medium text-foreground">Crawl depth</p>
                    <span className="font-heading text-xs font-bold text-primary tabular-nums">{maxDepth}</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    step={1}
                    value={maxDepth}
                    onChange={(e) => setMaxDepth(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-2 text-xs text-foreground">
                <input
                  type="checkbox"
                  checked={includeMeta}
                  onChange={(e) => setIncludeMeta(e.target.checked)}
                  className="h-4 w-4 accent-primary"
                />
                <span>Fetch page titles &amp; descriptions <span className="text-muted-foreground">(slower but richer output)</span></span>
              </label>
            </div>

            {error && (
              <p className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </p>
            )}

            <button
              onClick={generate}
              disabled={url.trim().length < 4}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Sparkles className="h-4 w-4" />
              Generate Sitemap
            </button>

            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              30–60 seconds · We respect robots.txt · No data stored
            </p>
          </div>
        </div>
      </section>
    )
  }

  // ── GENERATING STAGE ───────────────────────────────────────────────────
  if (stage === 'generating') {
    return (
      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-lg py-16 text-center">
          <div className="mb-8 flex justify-center">
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-primary/20">
              <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary" />
              <Map className="h-9 w-9 text-primary" />
            </div>
          </div>
          <h2 className="font-heading text-xl font-bold text-foreground">Generating your sitemap…</h2>
          <p className="mt-1 text-sm text-muted-foreground">Crawling and extracting metadata · 30–60 seconds</p>
          <div className="mt-8 space-y-3 text-left">
            {GENERATE_STEPS.map((step, i) => {
              const Icon = step.icon
              const done = i < generateStep
              const active = i === generateStep
              return (
                <div
                  key={step.label}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-all',
                    done   ? 'border-emerald-200 bg-emerald-50 text-emerald-700' :
                    active ? 'border-primary/30 bg-primary/5 text-primary' :
                             'border-transparent text-muted-foreground',
                  )}
                >
                  {done ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <Icon className={cn('h-4 w-4 shrink-0', active && 'animate-pulse')} />}
                  {step.label}
                </div>
              )
            })}
          </div>
        </div>
      </section>
    )
  }

  // ── RESULTS STAGE ──────────────────────────────────────────────────────
  if (!result) return null

  return (
    <section className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Top bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Sitemap Generated</p>
            <h1 className="font-heading text-2xl font-bold text-foreground truncate">{result.domain}</h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {result.pageCount} pages · {result.categories.length} categories · Source: {result.source}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowOptions((v) => !v)} className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
              <Settings2 className="h-3.5 w-3.5" />
              {showOptions ? 'Hide' : 'Show'} options
            </button>
            <button onClick={reset} className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
              <RefreshCw className="h-3.5 w-3.5" />
              New Sitemap
            </button>
          </div>
        </div>

        <div className={cn('grid gap-6', showOptions ? 'lg:grid-cols-[320px_1fr]' : '')}>

          {/* Options panel */}
          {showOptions && (
            <div className="space-y-5 lg:max-h-[calc(100vh-200px)] lg:overflow-y-auto lg:sticky lg:top-20">

              {/* Page title */}
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <FileCode className="h-3 w-3" /> Title
                </p>
                <input
                  type="text"
                  value={pageTitle}
                  onChange={(e) => setPageTitle(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                />
              </div>

              {/* Layout */}
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <LayoutGrid className="h-3 w-3" /> Layout
                </p>
                <div className="grid grid-cols-1 gap-1.5">
                  {LAYOUTS.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => setLayout(l.id)}
                      className={cn(
                        'flex items-start gap-2 rounded-lg border px-3 py-2 text-left text-xs transition-all',
                        layout === l.id ? 'border-primary bg-primary/5' : 'border-border bg-background hover:border-border/80',
                      )}
                    >
                      <l.icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      <div>
                        <p className="font-semibold text-foreground">{l.label}</p>
                        <p className="text-[10px] text-muted-foreground">{l.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme */}
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Palette className="h-3 w-3" /> Theme
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {(Object.keys(THEMES) as Theme[]).map((id) => {
                    const themeData = THEMES[id]
                    return (
                      <button
                        key={id}
                        onClick={() => { setTheme(id); setAccent(themeData.accent) }}
                        className={cn(
                          'flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs transition-all',
                          theme === id ? 'border-primary bg-primary/5' : 'border-border bg-background hover:border-border/80',
                        )}
                      >
                        <div className="flex h-4 w-4 shrink-0 overflow-hidden rounded border border-border">
                          <div className="w-1/2" style={{ background: themeData.bg }} />
                          <div className="w-1/2" style={{ background: themeData.accent }} />
                        </div>
                        <span className="font-semibold text-foreground">{themeData.label}</span>
                      </button>
                    )
                  })}
                </div>

                <p className="mt-4 mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Accent color</p>
                <div className="grid grid-cols-6 gap-1.5">
                  {ACCENT_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setAccent(c)}
                      className={cn(
                        'h-7 w-7 rounded-lg border-2 transition-all',
                        accent === c ? 'border-foreground scale-110' : 'border-transparent hover:scale-105',
                      )}
                      style={{ background: c }}
                      title={c}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  value={accent}
                  onChange={(e) => setAccent(e.target.value)}
                  className="mt-2 h-8 w-full cursor-pointer rounded-lg border border-border"
                />
              </div>

              {/* Content options */}
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Eye className="h-3 w-3" /> Display
                </p>
                <div className="space-y-2">
                  {[
                    { key: 'showUrls' as const,         label: 'Show URLs',                 value: showUrls,         set: setShowUrls },
                    { key: 'showDescriptions' as const, label: 'Show descriptions',         value: showDescriptions, set: setShowDescriptions },
                    { key: 'showDates' as const,        label: 'Show last modified dates',  value: showDates,        set: setShowDates },
                    { key: 'showSearch' as const,       label: 'Include search box',        value: showSearch,       set: setShowSearch },
                    { key: 'showStats' as const,        label: 'Show stats bar',            value: showStats,        set: setShowStats },
                  ].map((opt) => (
                    <label key={opt.key} className="flex cursor-pointer items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-xs">
                      <span className="font-medium text-foreground">{opt.label}</span>
                      <input
                        type="checkbox"
                        checked={opt.value}
                        onChange={(e) => opt.set(e.target.checked)}
                        className="h-4 w-4 accent-primary"
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Output format */}
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Download className="h-3 w-3" /> Export format
                </p>
                <div className="grid grid-cols-1 gap-1.5">
                  {OUTPUT_FORMATS.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setOutputFormat(f.id)}
                      className={cn(
                        'flex items-start gap-2 rounded-lg border px-3 py-2 text-left text-xs transition-all',
                        outputFormat === f.id ? 'border-primary bg-primary/5' : 'border-border bg-background hover:border-border/80',
                      )}
                    >
                      <f.icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      <div>
                        <p className="font-semibold text-foreground">{f.label}</p>
                        <p className="text-[10px] text-muted-foreground">{f.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Preview / Code panel */}
          <div className="space-y-4">

            {/* Preview tabs */}
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-3">
              <div className="flex rounded-lg border border-border bg-muted/40 p-1">
                <button
                  onClick={() => setPreviewMode('preview')}
                  className={cn(
                    'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all',
                    previewMode === 'preview' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <Eye className="h-3.5 w-3.5" /> Preview
                </button>
                <button
                  onClick={() => setPreviewMode('code')}
                  className={cn(
                    'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all',
                    previewMode === 'code' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <Code className="h-3.5 w-3.5" /> Code
                </button>
              </div>

              <div className="ml-auto flex gap-2">
                <button
                  onClick={copyOutput}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors',
                    copied
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                      : 'border-border bg-card text-foreground hover:bg-muted',
                  )}
                >
                  <Copy className="h-3.5 w-3.5" />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button onClick={downloadOutput} className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
                  <Download className="h-3.5 w-3.5" />
                  Download
                </button>
              </div>
            </div>

            {/* Preview content */}
            {previewMode === 'preview' && outputFormat === 'html-page' ? (
              <div className="overflow-hidden rounded-3xl border border-border bg-card">
                <iframe
                  srcDoc={output}
                  title="Sitemap preview"
                  className="block h-[700px] w-full border-0 bg-white"
                  sandbox="allow-same-origin"
                />
              </div>
            ) : previewMode === 'preview' ? (
              // Live rich preview of the structure for non-html-page formats
              <div className="rounded-3xl border border-border bg-card p-6">
                {/* Filter */}
                <div className="mb-4 flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      placeholder="Filter pages…"
                      className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                    />
                  </div>
                  {searchFilter && (
                    <button onClick={() => setSearchFilter('')} className="rounded-lg border border-border bg-background p-2 text-muted-foreground hover:text-foreground">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {filteredCategories.length === 0 ? (
                  <p className="py-10 text-center text-sm text-muted-foreground">No pages match the filter.</p>
                ) : (
                  <div className="space-y-5">
                    {filteredCategories.map((cat) => (
                      <details key={cat.name} open className="group">
                        <summary className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-foreground">
                          <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
                          {cat.name}
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">{cat.pages.length}</span>
                        </summary>
                        <ul className="mt-2 ml-6 space-y-1.5">
                          {cat.pages.map((p) => (
                            <li key={p.url} className="rounded-lg border border-border bg-background p-2.5">
                              <div className="flex items-start gap-2">
                                <a href={p.url} target="_blank" rel="noopener noreferrer" className="flex-1 text-sm font-medium text-primary hover:underline">
                                  {p.title ?? p.path}
                                </a>
                                <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </div>
                              {showUrls && <p className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground">{p.url}</p>}
                              {showDescriptions && p.description && (
                                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{p.description}</p>
                              )}
                              {showDates && p.lastModified && (
                                <p className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                                  <Calendar className="h-2.5 w-2.5" /> {p.lastModified.split('T')[0]}
                                </p>
                              )}
                            </li>
                          ))}
                        </ul>
                      </details>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              // Code view
              <div className="overflow-hidden rounded-3xl border border-border bg-foreground">
                <pre className="max-h-[700px] overflow-auto p-4 text-[11px] leading-relaxed text-background">
                  <code>{output}</code>
                </pre>
              </div>
            )}

            <p className="text-center text-[11px] text-muted-foreground">
              {output.length.toLocaleString()} characters · {result.pageCount} pages indexed
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
