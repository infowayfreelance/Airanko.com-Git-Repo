'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Link2,
  Search,
  Loader2,
  ExternalLink,
  Copy,
  Download,
  Globe,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  FileText,
  AtSign,
  Phone,
  Hash,
  File,
  Filter,
  Sparkles,
  Settings2,
  Layers,
  StopCircle,
  Network,
  ListTree,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import type {
  CrawlResult,
  CrawledLink,
  CrawledPage,
  StreamEvent,
} from '@/app/api/link-extractor/route'

type FilterKey =
  | 'all'
  | 'internal'
  | 'external'
  | 'nofollow'
  | 'mailto'
  | 'tel'
  | 'anchor'
  | 'file'

const filterOptions: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'internal', label: 'Internal' },
  { key: 'external', label: 'External' },
  { key: 'nofollow', label: 'Nofollow' },
  { key: 'file', label: 'Files' },
  { key: 'mailto', label: 'Email' },
  { key: 'tel', label: 'Phone' },
  { key: 'anchor', label: 'Anchors' },
]

function getTypeIcon(type: CrawledLink['type']) {
  switch (type) {
    case 'internal':
      return ArrowDownRight
    case 'external':
      return ArrowUpRight
    case 'mailto':
      return AtSign
    case 'tel':
      return Phone
    case 'anchor':
      return Hash
    case 'file':
      return File
    default:
      return Link2
  }
}

function getTypeColor(type: CrawledLink['type']) {
  switch (type) {
    case 'internal':
      return 'bg-primary/10 text-primary border-primary/20'
    case 'external':
      return 'bg-amber-500/10 text-amber-700 border-amber-500/20'
    case 'mailto':
      return 'bg-teal-500/10 text-teal-700 border-teal-500/20'
    case 'tel':
      return 'bg-green-500/10 text-green-700 border-green-500/20'
    case 'anchor':
      return 'bg-muted text-muted-foreground border-border'
    case 'file':
      return 'bg-rose-500/10 text-rose-700 border-rose-500/20'
    default:
      return 'bg-muted text-muted-foreground border-border'
  }
}

interface LiveProgress {
  crawled: number
  queued: number
  uniqueLinks: number
  currentUrl: string
  sitemapFound: number
  rootTitle?: string
  finalUrl?: string
}

export default function LinkExtractorTool() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CrawlResult | null>(null)
  const [livePages, setLivePages] = useState<CrawledPage[]>([])
  const [progress, setProgress] = useState<LiveProgress | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterKey>('all')
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'links' | 'pages'>('links')
  const [copiedAll, setCopiedAll] = useState(false)
  const [copiedHref, setCopiedHref] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)

  // Crawl options
  const [maxPages, setMaxPages] = useState(100)
  const [maxDepth, setMaxDepth] = useState(3)
  const [sameDomainOnly, setSameDomainOnly] = useState(true)
  const [useSitemap, setUseSitemap] = useState(true)

  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  const handleStart = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!url.trim() || loading) return

    setLoading(true)
    setError(null)
    setResult(null)
    setLivePages([])
    setProgress({
      crawled: 0,
      queued: 0,
      uniqueLinks: 0,
      currentUrl: '',
      sitemapFound: 0,
    })
    setFilter('all')
    setSearch('')
    setActiveTab('links')

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch('/api/link-extractor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          maxPages,
          maxDepth,
          sameDomainOnly,
          useSitemap,
        }),
        signal: controller.signal,
      })

      if (!res.ok || !res.body) {
        const text = await res.text().catch(() => '')
        throw new Error(text || `Request failed: ${res.status}`)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed) continue
          let event: StreamEvent
          try {
            event = JSON.parse(trimmed) as StreamEvent
          } catch {
            continue
          }
          handleEvent(event)
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // user cancelled
      } else {
        setError(err instanceof Error ? err.message : 'Network error')
      }
    } finally {
      setLoading(false)
      abortRef.current = null
    }
  }

  const handleEvent = (event: StreamEvent) => {
    switch (event.type) {
      case 'start':
        setProgress((p) => ({
          crawled: 0,
          queued: 1,
          uniqueLinks: 0,
          currentUrl: event.finalUrl,
          sitemapFound: p?.sitemapFound ?? 0,
          rootTitle: event.rootTitle,
          finalUrl: event.finalUrl,
        }))
        break
      case 'sitemap':
        setProgress((p) =>
          p ? { ...p, sitemapFound: event.found } : p,
        )
        break
      case 'progress':
        setProgress((p) =>
          p
            ? {
                ...p,
                crawled: event.crawled,
                queued: event.queued,
                uniqueLinks: event.uniqueLinks,
                currentUrl: event.currentUrl,
              }
            : p,
        )
        break
      case 'page':
        setLivePages((prev) => [
          ...prev,
          {
            url: event.url,
            status: event.status,
            statusCode: event.statusCode,
            error: event.error,
            title: event.title,
            linksFound: event.linksFound,
            depth: event.depth,
          },
        ])
        break
      case 'complete':
        setResult(event.result)
        setLivePages(event.result.pages)
        break
      case 'fatal':
        setError(event.error)
        break
    }
  }

  const handleStop = () => {
    abortRef.current?.abort()
  }

  const filteredLinks = useMemo(() => {
    if (!result) return []
    let list = result.links
    if (filter === 'nofollow') list = list.filter((l) => l.isNofollow)
    else if (filter !== 'all') list = list.filter((l) => l.type === filter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (l) =>
          l.href.toLowerCase().includes(q) ||
          l.text.toLowerCase().includes(q) ||
          l.domain.toLowerCase().includes(q),
      )
    }
    return list
  }, [result, filter, search])

  const filteredPages = useMemo(() => {
    if (!result) return []
    if (!search.trim()) return result.pages
    const q = search.toLowerCase()
    return result.pages.filter(
      (p) =>
        p.url.toLowerCase().includes(q) ||
        (p.title || '').toLowerCase().includes(q),
    )
  }, [result, search])

  const copyAll = async () => {
    if (filteredLinks.length === 0) return
    const text = filteredLinks.map((l) => l.href).join('\n')
    try {
      await navigator.clipboard.writeText(text)
      setCopiedAll(true)
      setTimeout(() => setCopiedAll(false), 2000)
    } catch {}
  }

  const copyOne = async (href: string) => {
    try {
      await navigator.clipboard.writeText(href)
      setCopiedHref(href)
      setTimeout(() => setCopiedHref(null), 1500)
    } catch {}
  }

  const downloadCSV = () => {
    if (filteredLinks.length === 0) return
    const header = [
      'URL',
      'Anchor Text',
      'Type',
      'Domain',
      'Rel',
      'Target',
      'Nofollow',
      'Occurrences',
      'Found On',
    ]
    const rows = filteredLinks.map((l) => [
      l.href,
      l.text,
      l.type,
      l.domain,
      l.rel || '',
      l.target || '',
      l.isNofollow ? 'yes' : 'no',
      String(l.occurrences),
      l.foundOn.join(' | '),
    ])
    const csv = [header, ...rows]
      .map((r) =>
        r
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(','),
      )
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    let host = 'export'
    try {
      host = new URL(result?.finalUrl || 'https://export').hostname
    } catch {}
    a.download = `links-${host}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const downloadJSON = () => {
    if (!result) return
    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: 'application/json',
    })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    let host = 'export'
    try {
      host = new URL(result.finalUrl).hostname
    } catch {}
    a.download = `links-${host}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const downloadTXT = () => {
    if (filteredLinks.length === 0) return
    const text = filteredLinks.map((l) => l.href).join('\n')
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    let host = 'export'
    try {
      host = new URL(result?.finalUrl || 'https://export').hostname
    } catch {}
    a.download = `links-${host}.txt`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Whole-Site Link Crawler
          </div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground text-balance sm:text-4xl lg:text-5xl">
            Link Extractor
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground text-pretty sm:text-lg">
            Enter any website and we&apos;ll crawl its pages, follow internal
            links, scan the sitemap, and extract every URL we find — visible or
            buried deep — ready to filter and export.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleStart}
          className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6"
        >
          <label
            htmlFor="url-input"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Website URL
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="url-input"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="pl-9 h-11"
                autoComplete="url"
                disabled={loading}
              />
            </div>
            {loading ? (
              <Button
                type="button"
                size="lg"
                variant="outline"
                onClick={handleStop}
                className="h-11 sm:px-6"
              >
                <StopCircle className="mr-2 h-4 w-4" />
                Stop
              </Button>
            ) : (
              <Button
                type="submit"
                size="lg"
                disabled={!url.trim()}
                className="h-11 bg-primary text-primary-foreground hover:bg-primary/90 sm:px-8"
              >
                <Network className="mr-2 h-4 w-4" />
                Crawl Site
              </Button>
            )}
          </div>

          {/* Settings toggle */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setShowSettings((v) => !v)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <Settings2 className="h-3.5 w-3.5" />
              {showSettings ? 'Hide options' : 'Crawl options'}
            </button>
            <p className="text-xs text-muted-foreground">
              {maxPages} pages • depth {maxDepth} •{' '}
              {sameDomainOnly ? 'same domain' : 'cross-domain'} •{' '}
              {useSitemap ? 'sitemap on' : 'sitemap off'}
            </p>
          </div>

          {showSettings && (
            <div className="mt-4 grid gap-5 rounded-xl border border-border bg-muted/30 p-4 sm:grid-cols-2">
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="max-pages" className="text-sm">
                    Max pages to crawl
                  </Label>
                  <span className="text-sm font-semibold text-foreground">
                    {maxPages}
                  </span>
                </div>
                <Slider
                  id="max-pages"
                  min={1}
                  max={500}
                  step={1}
                  value={[maxPages]}
                  onValueChange={(v) => setMaxPages(v[0])}
                  disabled={loading}
                  className="mt-3"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Higher = more thorough, but slower. Caps at 500.
                </p>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="max-depth" className="text-sm">
                    Max depth
                  </Label>
                  <span className="text-sm font-semibold text-foreground">
                    {maxDepth}
                  </span>
                </div>
                <Slider
                  id="max-depth"
                  min={0}
                  max={6}
                  step={1}
                  value={[maxDepth]}
                  onValueChange={(v) => setMaxDepth(v[0])}
                  disabled={loading}
                  className="mt-3"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  How many clicks away from the start page to follow.
                </p>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
                <div>
                  <Label htmlFor="same-domain" className="text-sm">
                    Same domain only
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Only follow links on the same host.
                  </p>
                </div>
                <Switch
                  id="same-domain"
                  checked={sameDomainOnly}
                  onCheckedChange={setSameDomainOnly}
                  disabled={loading}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
                <div>
                  <Label htmlFor="use-sitemap" className="text-sm">
                    Use sitemap.xml
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Discover URLs from sitemap and robots.txt.
                  </p>
                </div>
                <Switch
                  id="use-sitemap"
                  checked={useSitemap}
                  onCheckedChange={setUseSitemap}
                  disabled={loading}
                />
              </div>
            </div>
          )}

          <p className="mt-3 text-xs text-muted-foreground">
            We crawl server-side and respect timeouts. Make sure the site is
            publicly accessible.
          </p>
        </form>

        {/* Live progress */}
        {loading && progress && (
          <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">
                  Crawling site...
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {progress.currentUrl || 'Starting...'}
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <MiniStat
                label="Pages crawled"
                value={progress.crawled}
                max={maxPages}
              />
              <MiniStat label="Queue" value={progress.queued} />
              <MiniStat label="Unique links" value={progress.uniqueLinks} />
              <MiniStat
                label="Sitemap URLs"
                value={progress.sitemapFound}
              />
            </div>
            {/* Recent pages stream */}
            {livePages.length > 0 && (
              <div className="mt-5 max-h-56 overflow-auto rounded-lg border border-border bg-muted/30">
                <ul className="divide-y divide-border text-xs">
                  {livePages.slice(-30).reverse().map((p, i) => (
                    <li
                      key={p.url + i}
                      className="flex items-center gap-2 px-3 py-2"
                    >
                      <span
                        className={cn(
                          'inline-flex h-1.5 w-1.5 shrink-0 rounded-full',
                          p.status === 'success'
                            ? 'bg-primary'
                            : 'bg-destructive',
                        )}
                      />
                      <span className="truncate font-mono text-muted-foreground">
                        {p.url}
                      </span>
                      <span className="ml-auto shrink-0 text-muted-foreground">
                        {p.status === 'success'
                          ? `${p.linksFound} links`
                          : p.error || 'error'}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <div>
              <p className="font-medium text-foreground">
                Could not extract links
              </p>
              <p className="text-muted-foreground">{error}</p>
            </div>
          </div>
        )}

        {/* Results */}
        {result && result.status === 'success' && (
          <div className="mt-8 space-y-6">
            {/* Page summary card */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Crawl complete
                  </p>
                  {result.rootTitle && (
                    <p className="mt-1 font-heading text-base font-semibold text-foreground sm:text-lg">
                      {result.rootTitle}
                    </p>
                  )}
                  <a
                    href={result.finalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1 break-all text-sm text-primary hover:underline"
                  >
                    {result.finalUrl}
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Crawled {result.pagesCrawled} pages in{' '}
                    {(result.durationMs / 1000).toFixed(1)}s
                    {result.pagesFailed > 0 &&
                      ` • ${result.pagesFailed} failed`}
                    {result.sitemapUrlsFound > 0 &&
                      ` • ${result.sitemapUrlsFound} sitemap URLs`}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard
                label="Unique Links"
                value={result.uniqueLinks}
                icon={Link2}
                color="text-primary bg-primary/10"
              />
              <StatCard
                label="Pages Crawled"
                value={result.pagesCrawled}
                icon={Layers}
                color="text-teal-700 bg-teal-500/10"
              />
              <StatCard
                label="Internal"
                value={result.internalCount}
                icon={ArrowDownRight}
                color="text-primary bg-primary/10"
              />
              <StatCard
                label="External"
                value={result.externalCount}
                icon={ArrowUpRight}
                color="text-amber-700 bg-amber-500/10"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <SmallStat label="Files" value={result.fileCount} />
              <SmallStat label="Emails" value={result.emailCount} />
              <SmallStat label="Phones" value={result.phoneCount} />
              <SmallStat label="Domains" value={result.domains.length} />
            </div>

            {/* Insights */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">
                    Nofollow Links
                  </p>
                </div>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {result.nofollowCount}
                </p>
                <p className="text-xs text-muted-foreground">
                  Won&apos;t pass SEO authority.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">
                    Unique Domains
                  </p>
                </div>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {result.domains.length}
                </p>
                <p className="line-clamp-1 text-xs text-muted-foreground">
                  {result.domains.slice(0, 6).join(', ')}
                  {result.domains.length > 6 ? '…' : ''}
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-border">
              <TabBtn
                active={activeTab === 'links'}
                onClick={() => setActiveTab('links')}
                icon={Link2}
              >
                All Links ({result.uniqueLinks.toLocaleString()})
              </TabBtn>
              <TabBtn
                active={activeTab === 'pages'}
                onClick={() => setActiveTab('pages')}
                icon={ListTree}
              >
                Pages Crawled ({result.pagesCrawled.toLocaleString()})
              </TabBtn>
            </div>

            {activeTab === 'links' && (
              <>
                {/* Toolbar */}
                <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap gap-2">
                      {filterOptions.map((opt) => {
                        const isActive = filter === opt.key
                        return (
                          <button
                            key={opt.key}
                            type="button"
                            onClick={() => setFilter(opt.key)}
                            className={cn(
                              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                              isActive
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground',
                            )}
                          >
                            {opt.label}
                          </button>
                        )
                      })}
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <div className="relative flex-1">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="search"
                          placeholder="Search by URL, anchor text, or domain..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={copyAll}
                          disabled={filteredLinks.length === 0}
                        >
                          <Copy className="mr-2 h-3.5 w-3.5" />
                          {copiedAll ? 'Copied!' : 'Copy all'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={downloadCSV}
                          disabled={filteredLinks.length === 0}
                        >
                          <Download className="mr-2 h-3.5 w-3.5" />
                          CSV
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={downloadTXT}
                          disabled={filteredLinks.length === 0}
                        >
                          <FileText className="mr-2 h-3.5 w-3.5" />
                          TXT
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={downloadJSON}
                        >
                          <FileText className="mr-2 h-3.5 w-3.5" />
                          JSON
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between px-1">
                  <p className="text-sm text-muted-foreground">
                    Showing{' '}
                    <span className="font-semibold text-foreground">
                      {filteredLinks.length.toLocaleString()}
                    </span>{' '}
                    of{' '}
                    <span className="font-semibold text-foreground">
                      {result.uniqueLinks.toLocaleString()}
                    </span>{' '}
                    links
                  </p>
                </div>

                {filteredLinks.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
                    <Link2 className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-3 font-medium text-foreground">
                      No links match your filters
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Try changing the filter or clearing your search.
                    </p>
                  </div>
                ) : (
                  <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                    {filteredLinks.slice(0, 1000).map((link, idx) => {
                      const TypeIcon = getTypeIcon(link.type)
                      return (
                        <li
                          key={link.href + idx}
                          className="group flex flex-col gap-2 p-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:gap-4"
                        >
                          <div
                            className={cn(
                              'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border',
                              getTypeColor(link.type),
                            )}
                          >
                            <TypeIcon className="h-4 w-4" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="truncate text-sm font-medium text-foreground">
                                {link.text}
                              </span>
                              <Badge
                                variant="outline"
                                className={cn(
                                  'h-5 px-1.5 text-[10px] font-semibold capitalize',
                                  getTypeColor(link.type),
                                )}
                              >
                                {link.type}
                              </Badge>
                              {link.isNofollow && (
                                <Badge
                                  variant="outline"
                                  className="h-5 border-rose-500/20 bg-rose-500/10 px-1.5 text-[10px] font-semibold text-rose-700"
                                >
                                  nofollow
                                </Badge>
                              )}
                              {link.target === '_blank' && (
                                <Badge
                                  variant="outline"
                                  className="h-5 border-border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground"
                                >
                                  new tab
                                </Badge>
                              )}
                              {link.occurrences > 1 && (
                                <Badge
                                  variant="outline"
                                  className="h-5 border-border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground"
                                >
                                  ×{link.occurrences}
                                </Badge>
                              )}
                            </div>
                            <a
                              href={link.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-0.5 block break-all text-xs text-muted-foreground hover:text-primary hover:underline"
                            >
                              {link.href}
                            </a>
                            {link.foundOn.length > 0 && (
                              <p className="mt-0.5 truncate text-[11px] text-muted-foreground/80">
                                Found on:{' '}
                                <span className="font-mono">
                                  {link.foundOn[0]}
                                </span>
                                {link.foundOn.length > 1 &&
                                  ` +${link.foundOn.length - 1} more`}
                              </p>
                            )}
                          </div>

                          <div className="flex shrink-0 gap-1.5 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 px-2"
                              onClick={() => copyOne(link.href)}
                            >
                              <Copy className="h-3.5 w-3.5" />
                              <span className="sr-only">Copy link</span>
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 px-2"
                              asChild
                            >
                              <a
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                                <span className="sr-only">Open link</span>
                              </a>
                            </Button>
                          </div>

                          {copiedHref === link.href && (
                            <span className="text-xs font-medium text-primary">
                              Copied!
                            </span>
                          )}
                        </li>
                      )
                    })}
                    {filteredLinks.length > 1000 && (
                      <li className="bg-muted/30 p-4 text-center text-xs text-muted-foreground">
                        Showing first 1,000 of {filteredLinks.length.toLocaleString()} —
                        export to CSV/JSON to access all links.
                      </li>
                    )}
                  </ul>
                )}
              </>
            )}

            {activeTab === 'pages' && (
              <>
                <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search crawled pages..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                  {filteredPages.map((p, idx) => (
                    <li
                      key={p.url + idx}
                      className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:gap-4"
                    >
                      <div
                        className={cn(
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-xs font-bold',
                          p.status === 'success'
                            ? 'bg-primary/10 text-primary border-primary/20'
                            : 'bg-destructive/10 text-destructive border-destructive/20',
                        )}
                      >
                        {p.depth}
                      </div>
                      <div className="min-w-0 flex-1">
                        {p.title && (
                          <p className="truncate text-sm font-medium text-foreground">
                            {p.title}
                          </p>
                        )}
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block break-all text-xs text-muted-foreground hover:text-primary hover:underline"
                        >
                          {p.url}
                        </a>
                      </div>
                      <div className="flex shrink-0 items-center gap-2 text-xs">
                        {p.status === 'success' ? (
                          <Badge
                            variant="outline"
                            className="border-primary/20 bg-primary/10 text-primary"
                          >
                            {p.linksFound} links
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="border-destructive/20 bg-destructive/10 text-destructive"
                          >
                            {p.error || 'error'}
                          </Badge>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}

        {/* Empty initial state */}
        {!result && !loading && !error && (
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              {
                title: 'Whole-Site Audits',
                desc: 'Crawl up to 500 pages and surface every internal and external link your site contains.',
                icon: Network,
              },
              {
                title: 'Sitemap Discovery',
                desc: 'We auto-detect sitemap.xml and robots.txt to find URLs that aren&apos;t linked from the homepage.',
                icon: Layers,
              },
              {
                title: 'Export Everything',
                desc: 'Download the full link inventory as CSV, TXT, or JSON — including source pages and occurrences.',
                icon: Download,
              },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-border bg-card p-5"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-3 font-heading font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p
                    className="mt-1 text-sm leading-relaxed text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: item.desc }}
                  />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  color: string
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <div
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-lg',
            color,
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>
      <p className="mt-2 font-heading text-2xl font-bold text-foreground sm:text-3xl">
        {value.toLocaleString()}
      </p>
    </div>
  )
}

function SmallStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 text-center">
      <p className="text-xl font-bold text-foreground">
        {value.toLocaleString()}
      </p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

function MiniStat({
  label,
  value,
  max,
}: {
  label: string
  value: number
  max?: number
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-bold text-foreground">
        {value.toLocaleString()}
        {max ? (
          <span className="ml-1 text-xs font-normal text-muted-foreground">
            / {max}
          </span>
        ) : null}
      </p>
    </div>
  )
}

function TabBtn({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean
  onClick: () => void
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        '-mb-px inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
        active
          ? 'border-primary text-foreground'
          : 'border-transparent text-muted-foreground hover:text-foreground',
      )}
    >
      <Icon className="h-4 w-4" />
      {children}
    </button>
  )
}
