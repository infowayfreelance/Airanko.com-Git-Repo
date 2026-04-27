'use client'

import { useState, useRef, useCallback } from 'react'
import {
  Search,
  Plus,
  Trash2,
  X,
  ChevronDown,
  ChevronUp,
  Globe,
  Twitter,
  LayoutTemplate,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  ExternalLink,
  Download,
  ClipboardList,
  ImageIcon,
  Tag,
  Link2,
  Info,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import type { MetaResult } from '@/app/api/meta-checker/route'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface UrlEntry {
  id: string
  value: string
  error?: string
}

type TabKey = 'basic' | 'og' | 'twitter'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function uid() {
  return Math.random().toString(36).slice(2, 10)
}

function isValidUrl(raw: string): boolean {
  const url = raw.trim()
  if (!url) return false
  try {
    const u = url.startsWith('http://') || url.startsWith('https://') ? url : 'https://' + url
    new URL(u)
    return true
  } catch {
    return false
  }
}

function truncate(str: string | undefined, max: number): string {
  if (!str) return ''
  return str.length > max ? str.slice(0, max) + '…' : str
}

function charColor(len: number, min: number, max: number) {
  if (len < min) return 'text-amber-500'
  if (len > max) return 'text-rose-500'
  return 'text-green-600'
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }
  return (
    <button
      onClick={copy}
      title="Copy"
      className="ml-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground hover:text-foreground transition-colors"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  )
}

function Field({
  label,
  value,
  limit,
  minLen,
  maxLen,
  isLink,
  isImage,
}: {
  label: string
  value?: string
  limit?: number
  minLen?: number
  maxLen?: number
  isLink?: boolean
  isImage?: boolean
}) {
  const [imgError, setImgError] = useState(false)

  if (value === undefined) {
    return (
      <div className="flex items-start gap-2 py-2.5 border-b border-border last:border-0">
        <span className="w-36 shrink-0 text-xs font-medium text-muted-foreground pt-0.5">{label}</span>
        <span className="flex items-center gap-1 text-xs text-muted-foreground italic">
          <AlertCircle className="h-3 w-3 text-amber-500" /> Not set
        </span>
      </div>
    )
  }

  const displayVal = limit ? truncate(value, limit) : value
  const len = value.length
  const lenClass = minLen && maxLen ? charColor(len, minLen, maxLen) : 'text-foreground'

  return (
    <div className="flex items-start gap-2 py-2.5 border-b border-border last:border-0">
      <span className="w-36 shrink-0 text-xs font-medium text-muted-foreground pt-0.5">{label}</span>
      <div className="flex-1 min-w-0">
        {isImage && value && !imgError ? (
          <div className="mb-2 flex items-start gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt={label}
              onError={() => setImgError(true)}
              className="h-24 w-auto max-w-[200px] rounded-lg border border-border object-cover"
            />
          </div>
        ) : null}
        <div className="flex items-center gap-1 flex-wrap min-w-0">
          {isLink ? (
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary underline underline-offset-2 break-all"
            >
              {displayVal}
            </a>
          ) : (
            <span className={`text-xs break-all ${lenClass}`}>{displayVal}</span>
          )}
          <CopyButton text={value} />
          {isLink && (
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
        {minLen && maxLen && (
          <span className={`text-[11px] ${lenClass}`}>
            {len} chars {len < minLen ? `(min ${minLen})` : len > maxLen ? `(max ${maxLen})` : '(good)'}
          </span>
        )}
      </div>
    </div>
  )
}

function SerpPreview({ result }: { result: MetaResult }) {
  const title = result.title || result.ogTitle || 'No title'
  const desc = result.description || result.ogDescription || 'No description'
  const displayUrl = (() => {
    try { return new URL(result.url).hostname } catch { return result.url }
  })()

  const titleLen = title.length
  const descLen = desc.length

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">SERP Preview</p>
      <div className="rounded-lg border border-border bg-background p-4">
        <p className="text-xs text-muted-foreground">{displayUrl}</p>
        <p
          className="mt-0.5 text-[15px] font-medium leading-snug text-blue-600 underline cursor-pointer"
          style={{ maxWidth: 600 }}
        >
          {truncate(title, 60)}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground" style={{ maxWidth: 600 }}>
          {truncate(desc, 160)}
        </p>
        <div className="mt-3 flex gap-4 text-[11px]">
          <span className={charColor(titleLen, 30, 60)}>
            Title: {titleLen} chars {titleLen < 30 ? '(too short)' : titleLen > 60 ? '(too long)' : '(good)'}
          </span>
          <span className={charColor(descLen, 120, 160)}>
            Desc: {descLen} chars {descLen < 120 ? '(too short)' : descLen > 160 ? '(too long)' : '(good)'}
          </span>
        </div>
      </div>
    </div>
  )
}

function OgPreview({ result }: { result: MetaResult }) {
  const title = result.ogTitle || result.title || 'No OG title'
  const desc = result.ogDescription || result.description || ''
  const image = result.ogImage
  const [imgError, setImgError] = useState(false)

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Open Graph Card Preview</p>
      <div className="overflow-hidden rounded-xl border border-border bg-background max-w-sm">
        {image && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt="OG"
            onError={() => setImgError(true)}
            className="w-full h-[180px] object-cover"
          />
        ) : (
          <div className="flex h-[120px] w-full items-center justify-center bg-muted">
            <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
          </div>
        )}
        <div className="p-3">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
            {result.ogSiteName || (() => { try { return new URL(result.url).hostname } catch { return '' } })()}
          </p>
          <p className="mt-0.5 text-sm font-semibold text-foreground leading-snug">{truncate(title, 80)}</p>
          {desc && <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{truncate(desc, 120)}</p>}
        </div>
      </div>
    </div>
  )
}

function TwitterPreview({ result }: { result: MetaResult }) {
  const card = result.twitterCard || 'summary'
  const title = result.twitterTitle || result.ogTitle || result.title || 'No title'
  const desc = result.twitterDescription || result.ogDescription || result.description || ''
  const image = result.twitterImage || result.ogImage
  const [imgError, setImgError] = useState(false)
  const isLarge = card === 'summary_large_image'

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Twitter / X Card Preview</p>
      <div className="overflow-hidden rounded-xl border border-border bg-background max-w-sm">
        {isLarge && image && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt="Twitter"
            onError={() => setImgError(true)}
            className="w-full h-[180px] object-cover"
          />
        ) : null}
        <div className="flex items-start gap-3 p-3">
          {!isLarge && image && !imgError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt="Twitter"
              onError={() => setImgError(true)}
              className="h-16 w-16 shrink-0 rounded-lg object-cover"
            />
          ) : (!isLarge ? (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Twitter className="h-5 w-5 text-muted-foreground/40" />
            </div>
          ) : null)}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground leading-snug">{truncate(title, 70)}</p>
            {desc && <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{truncate(desc, 100)}</p>}
            <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
              <Globe className="h-3 w-3" />
              {(() => { try { return new URL(result.url).hostname } catch { return result.url } })()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function ResultCard({ result, index }: { result: MetaResult; index: number }) {
  const [expanded, setExpanded] = useState(true)
  const [tab, setTab] = useState<TabKey>('basic')

  const hostname = (() => { try { return new URL(result.url).hostname } catch { return result.url } })()

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'basic', label: 'Meta Tags', icon: <Tag className="h-3.5 w-3.5" /> },
    { key: 'og', label: 'Open Graph', icon: <LayoutTemplate className="h-3.5 w-3.5" /> },
    { key: 'twitter', label: 'Twitter Card', icon: <Twitter className="h-3.5 w-3.5" /> },
  ]

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 bg-card border-b border-border">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
          {index + 1}
        </span>
        {result.status === 'success' && result.favicon ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={result.favicon}
            alt=""
            className="h-5 w-5 rounded object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        ) : null}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{hostname}</p>
          <p className="text-xs text-muted-foreground truncate">{result.url}</p>
        </div>
        <div className="flex items-center gap-2">
          {result.status === 'success' ? (
            <Badge variant="default" className="bg-green-600 text-white text-xs">Success</Badge>
          ) : (
            <Badge variant="destructive" className="text-xs">Error</Badge>
          )}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Error state */}
      {result.status === 'error' && expanded && (
        <div className="flex items-start gap-3 px-5 py-4 bg-rose-50 text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="text-sm font-medium">Failed to fetch metadata</p>
            <p className="text-xs mt-0.5">{result.error}</p>
          </div>
        </div>
      )}

      {/* Success state */}
      {result.status === 'success' && expanded && (
        <div className="p-5 flex flex-col gap-5">
          {/* SERP Preview */}
          <SerpPreview result={result} />

          {/* Tabs */}
          <div className="flex gap-1 rounded-xl border border-border bg-muted p-1">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                  tab === t.key
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab: Meta Tags */}
          {tab === 'basic' && (
            <div className="rounded-xl border border-border bg-background divide-y divide-border overflow-hidden">
              <div className="px-4 py-3 bg-muted/40">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5" /> Basic Meta Tags
                </p>
              </div>
              <div className="px-4">
                <Field label="Title" value={result.title} minLen={30} maxLen={60} />
                <Field label="Description" value={result.description} minLen={120} maxLen={160} />
                <Field label="Keywords" value={result.keywords} limit={120} />
                <Field label="Canonical URL" value={result.canonical} isLink />
                <Field label="Robots" value={result.robots} />
                <Field label="Viewport" value={result.viewport} />
                <Field label="Theme Color" value={result.themeColor} />
              </div>
            </div>
          )}

          {/* Tab: Open Graph */}
          {tab === 'og' && (
            <div className="flex flex-col gap-4">
              <OgPreview result={result} />
              <div className="rounded-xl border border-border bg-background divide-y divide-border overflow-hidden">
                <div className="px-4 py-3 bg-muted/40">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                    <LayoutTemplate className="h-3.5 w-3.5" /> Open Graph Tags
                  </p>
                </div>
                <div className="px-4">
                  <Field label="og:title" value={result.ogTitle} minLen={30} maxLen={95} />
                  <Field label="og:description" value={result.ogDescription} minLen={60} maxLen={200} />
                  <Field label="og:image" value={result.ogImage} isLink isImage />
                  <Field label="og:url" value={result.ogUrl} isLink />
                  <Field label="og:type" value={result.ogType} />
                  <Field label="og:site_name" value={result.ogSiteName} />
                  <Field label="og:locale" value={result.ogLocale} />
                </div>
              </div>
            </div>
          )}

          {/* Tab: Twitter Card */}
          {tab === 'twitter' && (
            <div className="flex flex-col gap-4">
              <TwitterPreview result={result} />
              <div className="rounded-xl border border-border bg-background divide-y divide-border overflow-hidden">
                <div className="px-4 py-3 bg-muted/40">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                    <Twitter className="h-3.5 w-3.5" /> Twitter Card Tags
                  </p>
                </div>
                <div className="px-4">
                  <Field label="twitter:card" value={result.twitterCard} />
                  <Field label="twitter:title" value={result.twitterTitle} />
                  <Field label="twitter:description" value={result.twitterDescription} />
                  <Field label="twitter:image" value={result.twitterImage} isLink isImage />
                  <Field label="twitter:site" value={result.twitterSite} />
                  <Field label="twitter:creator" value={result.twitterCreator} />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Tool
// ---------------------------------------------------------------------------
export default function MetaCheckerTool() {
  const [entries, setEntries] = useState<UrlEntry[]>([{ id: uid(), value: '' }])
  const [results, setResults] = useState<MetaResult[]>([])
  const [loading, setLoading] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [bulkMode, setBulkMode] = useState(false)
  const [bulkText, setBulkText] = useState('')

  // --- URL entries management ---
  const addEntry = () => setEntries((e) => [...e, { id: uid(), value: '' }])

  const updateEntry = (id: string, value: string) =>
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, value, error: undefined } : e))
    )

  const removeEntry = (id: string) =>
    setEntries((prev) => prev.filter((e) => e.id !== id))

  const clearAll = () => {
    setEntries([{ id: uid(), value: '' }])
    setResults([])
    setGlobalError(null)
    setBulkText('')
  }

  // --- Paste handler: split multiple lines into separate entries ---
  const handlePaste = useCallback(
    (id: string, e: React.ClipboardEvent<HTMLInputElement>) => {
      const text = e.clipboardData.getData('text')
      const lines = text.split(/\n|,/).map((l) => l.trim()).filter(Boolean)
      if (lines.length > 1) {
        e.preventDefault()
        setEntries((prev) => {
          const idx = prev.findIndex((en) => en.id === id)
          const newEntries = lines.map((l) => ({ id: uid(), value: l }))
          const updated = [...prev]
          updated.splice(idx, 1, ...newEntries)
          return updated
        })
      }
    },
    []
  )

  // --- Bulk mode: parse textarea ---
  const parseBulk = (): string[] =>
    bulkText
      .split(/\n|,/)
      .map((l) => l.trim())
      .filter(Boolean)

  // --- Validate ---
  const validate = (urls: string[]): boolean => {
    if (urls.length === 0) {
      setGlobalError('Please enter at least one URL.')
      return false
    }
    const invalid = urls.filter((u) => !isValidUrl(u))
    if (invalid.length > 0) {
      setGlobalError(`Invalid URL(s): ${invalid.slice(0, 3).join(', ')}${invalid.length > 3 ? ' …' : ''}`)
      return false
    }
    return true
  }

  // --- Fetch ---
  const handleCheck = async () => {
    setGlobalError(null)
    const urls = bulkMode
      ? parseBulk()
      : entries.map((e) => e.value).filter(Boolean)

    if (!validate(urls)) return

    setLoading(true)
    setResults([])

    try {
      const res = await fetch('/api/meta-checker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'API error')
      setResults(data.results)
    } catch (err: unknown) {
      setGlobalError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // --- Export JSON ---
  const exportJson = () => {
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'meta-results.json'
    a.click()
  }

  const urlCount = bulkMode ? parseBulk().length : entries.filter((e) => e.value.trim()).length
  const successCount = results.filter((r) => r.status === 'success').length
  const errorCount = results.filter((r) => r.status === 'error').length

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
          <ClipboardList className="h-3.5 w-3.5" />
          Bulk Meta & OG Checker
        </div>
        <h1 className="font-heading text-3xl font-bold text-foreground text-balance sm:text-4xl">
          Check Meta Tags & Open Graph
        </h1>
        <p className="mt-3 text-muted-foreground text-pretty max-w-xl mx-auto">
          Enter one or many URLs to instantly extract and preview meta title, meta description, Open Graph tags, and Twitter Card data — all in one view.
        </p>
      </div>

      {/* Input panel */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden mb-6">
        {/* Mode toggle */}
        <div className="flex items-center justify-between gap-4 border-b border-border bg-muted/40 px-5 py-3">
          <div className="flex gap-1 rounded-lg border border-border bg-background p-1">
            <button
              onClick={() => setBulkMode(false)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${!bulkMode ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              URL List
            </button>
            <button
              onClick={() => setBulkMode(true)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${bulkMode ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Bulk Paste
            </button>
          </div>
          <button
            onClick={clearAll}
            className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-3.5 w-3.5" /> Clear all
          </button>
        </div>

        <div className="p-5">
          {/* URL List mode */}
          {!bulkMode && (
            <div className="flex flex-col gap-2">
              {entries.map((entry, i) => (
                <div key={entry.id} className="flex items-center gap-2">
                  <span className="w-5 shrink-0 text-center text-xs text-muted-foreground">{i + 1}</span>
                  <div className="relative flex-1">
                    <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="url"
                      value={entry.value}
                      onChange={(e) => updateEntry(entry.id, e.target.value)}
                      onPaste={(e) => handlePaste(entry.id, e)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addEntry()
                        }
                      }}
                      placeholder={i === 0 ? 'https://example.com' : 'https://another-url.com'}
                      className="pl-9 font-mono text-sm"
                    />
                  </div>
                  {entries.length > 1 && (
                    <button
                      onClick={() => removeEntry(entry.id)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-rose-50 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addEntry}
                className="flex items-center gap-1.5 self-start rounded-lg px-3 py-1.5 text-sm text-primary hover:bg-primary/5 transition-colors"
              >
                <Plus className="h-4 w-4" /> Add URL
              </button>
              <p className="text-xs text-muted-foreground mt-1">
                Tip: paste multiple URLs (separated by newlines or commas) into any field to split them automatically. Press Enter to add a new row.
              </p>
            </div>
          )}

          {/* Bulk paste mode */}
          {bulkMode && (
            <div className="flex flex-col gap-2">
              <textarea
                ref={textareaRef}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder={`Paste URLs here, one per line or comma-separated:\nhttps://example.com\nhttps://another.com\nhttps://third-site.io`}
                className="min-h-[160px] w-full resize-y rounded-xl border border-border bg-background px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              {bulkText.trim() && (
                <p className="text-xs text-muted-foreground">
                  {parseBulk().length} URL{parseBulk().length !== 1 ? 's' : ''} detected
                </p>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 border-t border-border bg-muted/40 px-5 py-4">
          <p className="text-sm text-muted-foreground">
            {urlCount > 0 ? `${urlCount} URL${urlCount !== 1 ? 's' : ''} ready to check` : 'Enter URLs above'}
          </p>
          <Button
            onClick={handleCheck}
            disabled={loading || urlCount === 0}
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Checking{urlCount > 1 ? ` ${urlCount} URLs` : ''}…</>
            ) : (
              <><Search className="h-4 w-4" /> Check Meta Tags</>
            )}
          </Button>
        </div>
      </div>

      {/* Global error */}
      {globalError && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="text-sm">{globalError}</p>
        </div>
      )}

      {/* Results summary bar */}
      {results.length > 0 && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-5 py-3.5 shadow-sm">
          <div className="flex items-center gap-4 text-sm">
            <span className="font-medium text-foreground">{results.length} URL{results.length !== 1 ? 's' : ''} checked</span>
            {successCount > 0 && (
              <span className="flex items-center gap-1 text-green-700">
                <Check className="h-3.5 w-3.5" /> {successCount} success
              </span>
            )}
            {errorCount > 0 && (
              <span className="flex items-center gap-1 text-rose-600">
                <AlertCircle className="h-3.5 w-3.5" /> {errorCount} failed
              </span>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={exportJson} className="gap-1.5 text-xs">
            <Download className="h-3.5 w-3.5" /> Export JSON
          </Button>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="flex flex-col gap-4">
          {Array.from({ length: urlCount || 1 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-5 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-1/3 rounded bg-muted" />
                  <div className="h-2.5 w-1/2 rounded bg-muted" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <div className="flex flex-col gap-5">
          {results.map((r, i) => (
            <ResultCard key={r.url + i} result={r} index={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && results.length === 0 && !globalError && (
        <div className="mt-4 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Link2 className="h-7 w-7 text-primary" />
          </div>
          <p className="font-medium text-foreground">No results yet</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Enter one or more URLs above and click &quot;Check Meta Tags&quot; to see results.
          </p>
        </div>
      )}
    </div>
  )
}
