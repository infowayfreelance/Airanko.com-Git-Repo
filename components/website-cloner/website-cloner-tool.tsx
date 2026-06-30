'use client'

import { useState } from 'react'
import {
  Globe,
  Download,
  Copy,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileCode2,
  Info,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface CloneResult {
  html: string
  stats: {
    cssInlined: number
    jsInlined: number
    sizeBytes: number
  }
}

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / 1048576).toFixed(2)} MB`
}

function domainFromUrl(url: string) {
  try { return new URL(url).hostname.replace(/^www\./, '') } catch { return 'page' }
}

export default function WebsiteClonerTool() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CloneResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleClone = async () => {
    const trimmed = url.trim()
    if (!trimmed) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/website-cloner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Clone failed')
      setResult(data)
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (!result) return
    const blob = new Blob([result.html], { type: 'text/html' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${domainFromUrl(url)}-clone.html`
    a.click()
  }

  const handleCopy = async () => {
    if (!result) return
    await navigator.clipboard.writeText(result.html)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary" className="text-xs">Free Tool</Badge>
          <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-0">Server-side Fetch</Badge>
          <Badge variant="secondary" className="text-xs bg-green-50 text-green-700 border-0">Single Page</Badge>
        </div>
        <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl text-balance">
          Free Website Cloner
        </h1>
        <p className="mt-2 text-muted-foreground text-pretty">
          Enter any URL to clone the page — CSS and JavaScript are inlined into one self-contained HTML file. Preview it live and download with one click.
        </p>
      </div>

      {/* Disclaimer */}
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200/70 bg-amber-50 p-4 text-sm text-amber-800">
        <Info className="h-4 w-4 mt-0.5 shrink-0" />
        <p>
          Only clone pages you own or have explicit permission to archive. Respect the site&rsquo;s terms of service and copyright. Intended for personal archiving, offline reading, and development reference.
        </p>
      </div>

      {/* URL Input */}
      <div className="mb-6 flex gap-2">
        <div className="relative flex-1">
          <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !loading && handleClone()}
            placeholder="https://example.com/page"
            className="pl-9 h-11 text-sm"
            disabled={loading}
          />
        </div>
        <Button
          onClick={handleClone}
          disabled={loading || !url.trim()}
          className="h-11 px-6 bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
        >
          {loading ? (
            <><RefreshCw className="mr-2 h-4 w-4 animate-spin" />Cloning…</>
          ) : (
            <><FileCode2 className="mr-2 h-4 w-4" />Clone Page</>
          )}
        </Button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
          <RefreshCw className="h-4 w-4 animate-spin text-primary" />
          <div>
            <p className="font-medium text-foreground">Fetching and processing the page…</p>
            <p className="mt-0.5 text-xs">Downloading HTML, inlining stylesheets and scripts. This may take a few seconds.</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium">Clone failed</p>
            <p className="mt-0.5 text-xs">{error}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="space-y-4">
          {/* Stats + actions bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-3 py-1.5 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-700">Clone ready</span>
              </div>
              <div className="rounded-xl border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{result.stats.cssInlined}</span> CSS files inlined
              </div>
              <div className="rounded-xl border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{result.stats.jsInlined}</span> JS files inlined
              </div>
              <div className="rounded-xl border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{formatBytes(result.stats.sizeBytes)}</span> file size
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied
                  ? <><CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-green-500" />Copied!</>
                  : <><Copy className="mr-1.5 h-3.5 w-3.5" />Copy HTML</>}
              </Button>
              <Button
                size="sm"
                onClick={handleDownload}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Download className="mr-1.5 h-3.5 w-3.5" />Download HTML
              </Button>
            </div>
          </div>

          {/* Live preview */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            {/* Fake browser chrome */}
            <div className="flex items-center gap-3 border-b border-border bg-muted/30 px-4 py-2.5">
              <div className="flex gap-1.5 shrink-0">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-yellow-400" />
                <div className="h-3 w-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 rounded-md border border-border bg-background px-3 py-1 text-xs text-muted-foreground font-mono truncate">
                {url}
              </div>
              <Badge variant="secondary" className="text-xs shrink-0">Live Preview</Badge>
            </div>
            <iframe
              srcDoc={result.html}
              className="w-full border-0"
              style={{ height: 600 }}
              title="Cloned page preview"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </div>

          {/* Note */}
          <p className="text-xs text-muted-foreground text-center">
            Some fonts, images, or scripts loaded from external origins may not appear in the preview due to CORS restrictions — they will still work when you open the downloaded file in your browser.
          </p>
        </div>
      )}
    </div>
  )
}
