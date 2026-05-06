'use client'

import { useMemo, useState } from 'react'
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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type {
  ExtractedLink,
  LinkExtractResult,
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

function getTypeIcon(type: ExtractedLink['type']) {
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

function getTypeColor(type: ExtractedLink['type']) {
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

export default function LinkExtractorTool() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<LinkExtractResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterKey>('all')
  const [search, setSearch] = useState('')
  const [copiedAll, setCopiedAll] = useState(false)
  const [copiedHref, setCopiedHref] = useState<string | null>(null)

  const handleExtract = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!url.trim() || loading) return

    setLoading(true)
    setError(null)
    setResult(null)
    setFilter('all')
    setSearch('')

    try {
      const res = await fetch('/api/link-extractor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })

      const data: LinkExtractResult = await res.json()

      if (data.status === 'error') {
        setError(data.error || 'Failed to extract links')
        setResult(data)
      } else {
        setResult(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
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

  const copyAll = async () => {
    if (filteredLinks.length === 0) return
    const text = filteredLinks.map((l) => l.href).join('\n')
    try {
      await navigator.clipboard.writeText(text)
      setCopiedAll(true)
      setTimeout(() => setCopiedAll(false), 2000)
    } catch {
      // ignore
    }
  }

  const copyOne = async (href: string) => {
    try {
      await navigator.clipboard.writeText(href)
      setCopiedHref(href)
      setTimeout(() => setCopiedHref(null), 1500)
    } catch {
      // ignore
    }
  }

  const downloadCSV = () => {
    if (filteredLinks.length === 0) return
    const header = ['URL', 'Anchor Text', 'Type', 'Domain', 'Rel', 'Target', 'Nofollow']
    const rows = filteredLinks.map((l) => [
      l.href,
      l.text,
      l.type,
      l.domain,
      l.rel || '',
      l.target || '',
      l.isNofollow ? 'yes' : 'no',
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
    a.download = `links-${new URL(result?.finalUrl || 'export').hostname || 'export'}.csv`
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

  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            New Tool
          </div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground text-balance sm:text-4xl lg:text-5xl">
            Link Extractor
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground text-pretty sm:text-lg">
            Paste any website URL and instantly extract every link on the page — internal, external, files, emails, and more. Perfect for SEO audits, competitor research, and broken link discovery.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleExtract}
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
            <Button
              type="submit"
              size="lg"
              disabled={loading || !url.trim()}
              className="h-11 bg-primary text-primary-foreground hover:bg-primary/90 sm:px-8"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Extracting...
                </>
              ) : (
                <>
                  <Link2 className="mr-2 h-4 w-4" />
                  Extract Links
                </>
              )}
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            We fetch the page server-side. Make sure the site is publicly accessible.
          </p>
        </form>

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
                    Page analyzed
                  </p>
                  {result.pageTitle && (
                    <p className="mt-1 font-heading text-base font-semibold text-foreground sm:text-lg">
                      {result.pageTitle}
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
                </div>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard
                label="Total Links"
                value={result.totalLinks}
                icon={Link2}
                color="text-primary bg-primary/10"
              />
              <StatCard
                label="Unique Links"
                value={result.uniqueLinks}
                icon={Filter}
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
                  Links with rel=&quot;nofollow&quot; — won&apos;t pass SEO authority.
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

            {/* Toolbar */}
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
              <div className="flex flex-col gap-4">
                {/* Filter pills */}
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

                {/* Search + actions */}
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
                      onClick={downloadJSON}
                    >
                      <FileText className="mr-2 h-3.5 w-3.5" />
                      JSON
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Results header */}
            <div className="flex items-center justify-between px-1">
              <p className="text-sm text-muted-foreground">
                Showing{' '}
                <span className="font-semibold text-foreground">
                  {filteredLinks.length}
                </span>{' '}
                of{' '}
                <span className="font-semibold text-foreground">
                  {result.uniqueLinks}
                </span>{' '}
                links
              </p>
            </div>

            {/* Link list */}
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
                {filteredLinks.map((link, idx) => {
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
                        </div>
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-0.5 block break-all text-xs text-muted-foreground hover:text-primary hover:underline"
                        >
                          {link.href}
                        </a>
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
              </ul>
            )}
          </div>
        )}

        {/* Empty initial state */}
        {!result && !loading && !error && (
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              {
                title: 'SEO Audits',
                desc: 'Spot broken or low-value outbound links and analyze your internal linking structure.',
                icon: Sparkles,
              },
              {
                title: 'Competitor Research',
                desc: 'See exactly which sites your competitors link to and what anchor text they use.',
                icon: ArrowUpRight,
              },
              {
                title: 'Migration & Audits',
                desc: 'Export every link on a page to CSV before migrating, redirecting, or rebuilding.',
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
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {item.desc}
                  </p>
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
