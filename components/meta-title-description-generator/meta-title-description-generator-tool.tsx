'use client'

import { useMemo, useState } from 'react'
import {
  Sparkles, AlertCircle, CheckCircle2, AlertTriangle, XCircle, Loader2,
  Monitor, Smartphone, Download, Copy, Check, RefreshCw, Tag, FileText,
  Type, AlignLeft, ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PIXEL_LIMITS, pixelStatus, type PixelStatus, type Device, type Field } from '@/lib/meta-pixel/limits'
import { measureTextWidth } from '@/lib/meta-pixel/measure'
import { MAX_ITEMS, MAX_COUNT, type GeneratedItem } from '@/app/api/meta-title-description-generator/route'

type Fields = 'title' | 'description' | 'both'
type Stage = 'input' | 'loading' | 'results'

const STATUS_STYLE: Record<PixelStatus, string> = {
  good: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-100 text-amber-700 border-amber-200',
  over: 'bg-red-100 text-red-700 border-red-200',
}
const STATUS_LABEL: Record<PixelStatus, string> = { good: 'Fits', warning: 'Near limit', over: 'Too long' }
const STATUS_ICON: Record<PixelStatus, React.ComponentType<{ className?: string }>> = {
  good: CheckCircle2, warning: AlertTriangle, over: XCircle,
}

const TONE_OPTIONS = [
  'Balanced / Professional',
  'Persuasive & benefit-driven',
  'Concise & direct',
  'Friendly & conversational',
  'Authoritative & expert',
]

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  URL.revokeObjectURL(a.href)
}

function csvEscape(v: string): string {
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`
  return v
}

function PixelBadge({ text, device, field }: { text: string; device: Device; field: Field }) {
  const limit = PIXEL_LIMITS[device][field]
  const px = measureTextWidth(text, limit.font)
  const status = pixelStatus(px, limit)
  const Icon = STATUS_ICON[status]
  return (
    <span
      className={cn('inline-flex shrink-0 items-center gap-1 rounded-lg border px-2 py-0.5 text-[11px] font-semibold tabular-nums', STATUS_STYLE[status])}
      title={`${STATUS_LABEL[status]} — measured with the browser's real canvas text renderer, not an estimate.`}
    >
      <Icon className="h-3 w-3" />
      {Math.round(px)}px <span className="opacity-60">/ {limit.maxPx}px</span>
    </span>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500) }) }}
      className="inline-flex shrink-0 items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground print:hidden"
      title="Copy"
    >
      {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

// ── Variant row — editable text + live pixel status for the selected device ──

function VariantRow({
  text, field, device, index, onChange,
}: { text: string; field: Field; device: Device; index: number; onChange: (v: string) => void }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-border bg-background p-2.5">
      <span className="mt-1.5 shrink-0 text-[10px] font-bold text-muted-foreground">#{index + 1}</span>
      <textarea
        value={text}
        onChange={(e) => onChange(e.target.value)}
        rows={field === 'description' ? 2 : 1}
        className="min-w-0 flex-1 resize-none bg-transparent text-sm text-foreground outline-none"
      />
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <PixelBadge text={text} device={device} field={field} />
        <CopyButton text={text} />
      </div>
    </div>
  )
}

// ── Result card — one per input line ──────────────────────────────────────

function ResultCard({
  item, fields, device, onEdit, onRegenerate, regenerating,
}: {
  item: GeneratedItem; fields: Fields; device: Device
  onEdit: (field: Field, i: number, value: string) => void
  onRegenerate: () => void; regenerating: boolean
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 print:break-inside-avoid">
      <div className="mb-3 flex items-start justify-between gap-3 border-b border-border pb-3">
        <p className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground" title={item.input}>{item.input}</p>
        <button
          onClick={onRegenerate}
          disabled={regenerating}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50 print:hidden"
        >
          {regenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
          Regenerate
        </button>
      </div>

      {fields !== 'description' && item.titles.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <Type className="h-3 w-3" /> Meta titles
          </p>
          <div className="space-y-2">
            {item.titles.map((t, i) => (
              <VariantRow key={i} text={t} field="title" device={device} index={i} onChange={(v) => onEdit('title', i, v)} />
            ))}
          </div>
        </div>
      )}

      {fields !== 'title' && item.descriptions.length > 0 && (
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <AlignLeft className="h-3 w-3" /> Meta descriptions
          </p>
          <div className="space-y-2">
            {item.descriptions.map((d, i) => (
              <VariantRow key={i} text={d} field="description" device={device} index={i} onChange={(v) => onEdit('description', i, v)} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main component ──────────────────────────────────────────────────────────

export default function MetaTitleDescriptionGeneratorTool() {
  const [stage, setStage] = useState<Stage>('input')
  const [itemsText, setItemsText] = useState('')
  const [fields, setFields] = useState<Fields>('both')
  const [count, setCount] = useState(3)
  const [device, setDevice] = useState<Device>('desktop')
  const [tone, setTone] = useState(TONE_OPTIONS[0])
  const [brand, setBrand] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<GeneratedItem[] | null>(null)
  const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null)

  const items = useMemo(
    () => itemsText.split('\n').map((s) => s.trim()).filter(Boolean).slice(0, MAX_ITEMS),
    [itemsText],
  )
  const canSubmit = items.length > 0 && !error

  async function generate() {
    setStage('loading')
    setError(null)
    try {
      const res = await fetch('/api/meta-title-description-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, fields, count, device, tone, brand }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? `Request failed (HTTP ${res.status})`)
        setStage('input')
        return
      }
      setResults(data.results)
      setStage('results')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network request failed.')
      setStage('input')
    }
  }

  async function regenerateItem(index: number) {
    if (!results) return
    setRegeneratingIndex(index)
    try {
      const res = await fetch('/api/meta-title-description-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [results[index].input], fields, count, device, tone, brand }),
      })
      const data = await res.json()
      if (res.ok && data.results?.[0]) {
        setResults((prev) => {
          if (!prev) return prev
          const next = [...prev]
          next[index] = data.results[0]
          return next
        })
      }
    } finally {
      setRegeneratingIndex(null)
    }
  }

  function editVariant(itemIndex: number, field: Field, variantIndex: number, value: string) {
    setResults((prev) => {
      if (!prev) return prev
      const next = [...prev]
      const item = { ...next[itemIndex] }
      if (field === 'title') { const arr = [...item.titles]; arr[variantIndex] = value; item.titles = arr }
      else { const arr = [...item.descriptions]; arr[variantIndex] = value; item.descriptions = arr }
      next[itemIndex] = item
      return next
    })
  }

  function exportCsv() {
    if (!results) return
    const lines = [['input', 'field', 'variant', 'text', 'pixel_width', 'status'].join(',')]
    for (const item of results) {
      for (const [field, arr] of [['title', item.titles], ['description', item.descriptions]] as const) {
        arr.forEach((text, i) => {
          const limit = PIXEL_LIMITS[device][field]
          const px = Math.round(measureTextWidth(text, limit.font))
          lines.push([item.input, field, String(i + 1), text, String(px), pixelStatus(px, limit)].map(csvEscape).join(','))
        })
      }
    }
    downloadFile(lines.join('\n'), `meta-title-description-generator-${Date.now()}.csv`, 'text/csv;charset=utf-8')
  }

  function exportJson() {
    if (!results) return
    downloadFile(JSON.stringify({ meta: { fields, count, device, tone, brand, generatedAt: new Date().toISOString() }, results }, null, 2),
      `meta-title-description-generator-${Date.now()}.json`, 'application/json;charset=utf-8')
  }

  // ── INPUT STAGE ────────────────────────────────────────────────────────────
  if (stage === 'input' || stage === 'loading') {
    return (
      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mx-auto mb-8 max-w-2xl text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3 w-3" />
              AI-generated · Bulk · Pixel-perfect for desktop &amp; mobile
            </div>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              Meta Title &amp; Description Generator
            </h1>
            <p className="mt-3 leading-relaxed text-muted-foreground text-pretty">
              Paste one topic, keyword, or page brief per line. AI writes meta titles and/or descriptions sized to fit Google&rsquo;s real desktop or mobile SERP pixel limits — generate as many as you need, then fine-tune each one with live pixel-width feedback.
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-6">
            <label className="block text-sm font-semibold text-foreground">Page topics / keywords / briefs</label>
            <textarea
              value={itemsText}
              onChange={(e) => setItemsText(e.target.value)}
              placeholder={'Best running shoes for flat feet\nAffordable web design agency in Austin\nHow to train a puppy — beginner guide'}
              style={{ minHeight: '160px' }}
              className="mt-2 w-full resize-y rounded-xl border border-border bg-background px-4 py-3 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <p className="mt-2 text-[11px] text-muted-foreground">
              {items.length} of {MAX_ITEMS} page{items.length === 1 ? '' : 's'} detected · one per line
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-foreground">What do you need?</label>
                <div className="mt-1.5 flex gap-1 rounded-xl border border-border bg-muted/40 p-1">
                  {([
                    { id: 'title' as Fields, label: 'Titles', icon: Type },
                    { id: 'description' as Fields, label: 'Descriptions', icon: AlignLeft },
                    { id: 'both' as Fields, label: 'Both', icon: FileText },
                  ]).map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFields(f.id)}
                      className={cn(
                        'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition-all',
                        fields === f.id ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      <f.icon className="h-3.5 w-3.5" /> {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground">Optimize pixel width for</label>
                <div className="mt-1.5 flex gap-1 rounded-xl border border-border bg-muted/40 p-1">
                  {([
                    { id: 'desktop' as Device, label: 'Desktop', icon: Monitor },
                    { id: 'mobile' as Device, label: 'Mobile', icon: Smartphone },
                  ]).map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setDevice(d.id)}
                      className={cn(
                        'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition-all',
                        device === d.id ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      <d.icon className="h-3.5 w-3.5" /> {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground">
                  How many variants per page? <span className="font-bold text-primary">{count}</span>
                </label>
                <input
                  type="range" min={1} max={MAX_COUNT} step={1} value={count}
                  onChange={(e) => setCount(parseInt(e.target.value, 10))}
                  className="mt-3 w-full accent-primary"
                />
                <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                  <span>1</span><span>{MAX_COUNT}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground">Tone</label>
                <div className="relative mt-1.5">
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                  >
                    {TONE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-foreground">Brand name (optional)</label>
                <div className="relative mt-1.5">
                  <Tag className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Ai Ranko — woven naturally into some title variants"
                    className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {error && (
              <p className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </p>
            )}

            <button
              onClick={generate}
              disabled={!canSubmit || stage === 'loading'}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {stage === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {stage === 'loading' ? 'Generating…' : `Generate ${fields === 'both' ? 'Titles & Descriptions' : fields === 'title' ? 'Titles' : 'Descriptions'}`}
            </button>

            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              Pixel limits are industry-standard estimates (Google publishes no official spec) — treat them as directional guidance.
            </p>
          </div>
        </div>
      </section>
    )
  }

  // ── RESULTS STAGE ──────────────────────────────────────────────────────────
  return (
    <section className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 print:hidden" data-print-hide>
          <button onClick={() => setStage('input')} className="text-sm font-medium text-muted-foreground hover:text-foreground">
            &larr; New batch
          </button>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 rounded-lg border border-border bg-muted p-1">
              {([
                { id: 'desktop' as Device, label: 'Desktop', icon: Monitor },
                { id: 'mobile' as Device, label: 'Mobile', icon: Smartphone },
              ]).map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDevice(d.id)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all',
                    device === d.id ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <d.icon className="h-3.5 w-3.5" /> {d.label}
                </button>
              ))}
            </div>
            <button onClick={exportCsv} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted">
              <Download className="h-3.5 w-3.5" /> CSV
            </button>
            <button onClick={exportJson} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted">
              <Download className="h-3.5 w-3.5" /> JSON
            </button>
          </div>
        </div>

        <p className="mb-4 text-xs text-muted-foreground print:hidden">
          Showing pixel widths for <strong className="text-foreground">{device === 'desktop' ? 'Desktop' : 'Mobile'}</strong> Google SERPs. Edit any variant directly — the pixel badge updates live. Switch device above to instantly re-check every variant without regenerating.
        </p>

        <div className="space-y-4">
          {results?.map((item, i) => (
            <ResultCard
              key={i}
              item={item}
              fields={fields}
              device={device}
              onEdit={(field, vi, value) => editVariant(i, field, vi, value)}
              onRegenerate={() => regenerateItem(i)}
              regenerating={regeneratingIndex === i}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
