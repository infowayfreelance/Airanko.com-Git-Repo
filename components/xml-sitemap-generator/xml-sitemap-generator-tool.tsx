'use client'

import { useState, useCallback } from 'react'
import {
  FileCode2, Download, Copy, Check, ChevronRight, Zap, Globe, Settings2,
  Image as ImageIcon, Clock, RefreshCw, AlertCircle, CheckCircle2, List,
  Code2, Filter, Layers, Search,
} from 'lucide-react'

/* ─── Types ─── */
interface CrawledPage { url: string; title: string; status: number }

interface ApiResult {
  sitemapXml: string
  urlCount: number
  imageCount: number
  crawledPages: CrawledPage[]
  errors: string[]
  usedSitemapXml: boolean
  isSitemapIndex: boolean
}

type Tab = 'xml' | 'pages'
type ChangeFreq = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'

/* ─── Constants ─── */
const FREQ_OPTIONS: ChangeFreq[] = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never']
const PRIORITY_OPTIONS = ['1.0', '0.9', '0.8', '0.7', '0.6', '0.5', '0.4', '0.3', '0.2', '0.1']
const MAX_PAGES_OPTIONS = [50, 100, 200, 500]
const CRAWL_DEPTH_OPTIONS = [1, 2, 3, 4]

const PROGRESS_STEPS = [
  'Resolving domain…',
  'Checking sitemap.xml…',
  'Fetching pages…',
  'Extracting URLs…',
  'Processing images…',
  'Setting priorities…',
  'Building XML…',
  'Validating schema…',
  'Finalizing sitemap…',
]

/* ─── Helpers ─── */
function isValidUrl(s: string): boolean {
  try { new URL(s); return true } catch { return false }
}

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  URL.revokeObjectURL(a.href)
}

function statusColor(status: number): string {
  if (status >= 200 && status < 300) return 'text-green-600'
  if (status >= 300 && status < 400) return 'text-yellow-600'
  return 'text-red-600'
}

/* ─── XML Syntax Highlight ─── */
function XmlHighlight({ xml }: { xml: string }) {
  const lines = xml.split('\n')
  return (
    <div className="font-mono text-xs leading-relaxed">
      {lines.map((line, i) => {
        const highlighted = line
          .replace(/&amp;/g, '&amp;amp;')
          .replace(/&lt;/g, '&amp;lt;')
          .replace(/&gt;/g, '&amp;gt;')
          .replace(/&quot;/g, '&amp;quot;')
          .replace(/&apos;/g, '&amp;apos;')

        const parts = highlighted
          .replace(/(<\/?)([a-zA-Z0-9:]+)/g, '<TAG>$1$2</TAG>')
          .replace(/([a-zA-Z0-9:-]+)(=)/g, '<ATTR>$1</ATTR>$2')
          .replace(/"([^"]*)"/g, '"<VAL>$1</VAL>"')

        return (
          <div key={i} className="flex gap-3">
            <span className="select-none w-8 text-right text-muted-foreground/40 shrink-0">{i + 1}</span>
            <span
              className="flex-1 break-all whitespace-pre-wrap"
              dangerouslySetInnerHTML={{
                __html: parts
                  .replace(/<TAG>/g, '<span class="text-blue-400">')
                  .replace(/<\/TAG>/g, '</span>')
                  .replace(/<ATTR>/g, '<span class="text-amber-400">')
                  .replace(/<\/ATTR>/g, '</span>')
                  .replace(/<VAL>/g, '<span class="text-green-400">')
                  .replace(/<\/VAL>/g, '</span>'),
              }}
            />
          </div>
        )
      })}
    </div>
  )
}

/* ─── Main Component ─── */
export default function XmlSitemapGeneratorTool() {
  const [url, setUrl] = useState('')
  const [changeFreq, setChangeFreq] = useState<ChangeFreq>('monthly')
  const [priority, setPriority] = useState('0.8')
  const [maxPages, setMaxPages] = useState(100)
  const [crawlDepth, setCrawlDepth] = useState(2)
  const [includeImages, setIncludeImages] = useState(false)
  const [includeLastMod, setIncludeLastMod] = useState(true)
  const [excludePatterns, setExcludePatterns] = useState('')

  const [loading, setLoading] = useState(false)
  const [progressStep, setProgressStep] = useState(0)
  const [result, setResult] = useState<ApiResult | null>(null)
  const [error, setError] = useState('')
  const [urlError, setUrlError] = useState('')
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('xml')

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setUrlError('')
    setError('')

    const trimmed = url.trim()
    if (!trimmed) { setUrlError('Enter a website URL'); return }
    const withProtocol = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`
    if (!isValidUrl(withProtocol)) { setUrlError('Enter a valid URL (e.g. https://example.com)'); return }

    setLoading(true)
    setResult(null)
    setProgressStep(0)

    const interval = setInterval(() => {
      setProgressStep((s) => (s < PROGRESS_STEPS.length - 1 ? s + 1 : s))
    }, 3200)

    try {
      const res = await fetch('/api/xml-sitemap-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: withProtocol,
          maxPages,
          changeFreq,
          priority,
          includeImages,
          includeLastMod,
          crawlDepth,
          excludePatterns,
        }),
      })
      clearInterval(interval)
      setProgressStep(PROGRESS_STEPS.length - 1)

      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Generation failed'); return }
      setResult(data)
      setActiveTab('xml')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      clearInterval(interval)
      setLoading(false)
    }
  }, [url, maxPages, changeFreq, priority, includeImages, includeLastMod, crawlDepth, excludePatterns])

  const copyXml = async () => {
    if (!result) return
    await navigator.clipboard.writeText(result.sitemapXml)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadXml = () => {
    if (!result) return
    const domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace(/\./g, '-')
    downloadFile(result.sitemapXml, `sitemap-${domain}.xml`, 'application/xml')
  }

  const progressPct = loading ? Math.round(((progressStep + 1) / PROGRESS_STEPS.length) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Input Card */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileCode2 className="h-4.5 w-4.5" />
          </div>
          <div>
            <h2 className="font-heading text-base font-bold text-foreground">XML Sitemap Generator</h2>
            <p className="text-xs text-muted-foreground">Enter your website URL and configure options below</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* URL input */}
          <div>
            <label htmlFor="xml-url" className="mb-1.5 block text-sm font-medium text-foreground">
              Website URL
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="xml-url"
                type="text"
                value={url}
                onChange={(e) => { setUrl(e.target.value); setUrlError('') }}
                placeholder="https://example.com"
                className="w-full rounded-xl border border-border bg-background py-3 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                disabled={loading}
              />
            </div>
            {urlError && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-500">
                <AlertCircle className="h-3.5 w-3.5" /> {urlError}
              </p>
            )}
          </div>

          {/* Options grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Change Frequency */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">
                <Clock className="mr-1 inline h-3.5 w-3.5 text-muted-foreground" />
                Change Frequency
              </label>
              <select
                value={changeFreq}
                onChange={(e) => setChangeFreq(e.target.value as ChangeFreq)}
                disabled={loading}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {FREQ_OPTIONS.map((f) => (
                  <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">
                <Zap className="mr-1 inline h-3.5 w-3.5 text-muted-foreground" />
                Default Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                disabled={loading}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Max Pages */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">
                <List className="mr-1 inline h-3.5 w-3.5 text-muted-foreground" />
                Max Pages
              </label>
              <select
                value={maxPages}
                onChange={(e) => setMaxPages(parseInt(e.target.value, 10))}
                disabled={loading}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {MAX_PAGES_OPTIONS.map((n) => (
                  <option key={n} value={n}>{n} pages</option>
                ))}
              </select>
            </div>

            {/* Crawl Depth */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">
                <Layers className="mr-1 inline h-3.5 w-3.5 text-muted-foreground" />
                Crawl Depth
              </label>
              <select
                value={crawlDepth}
                onChange={(e) => setCrawlDepth(parseInt(e.target.value, 10))}
                disabled={loading}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {CRAWL_DEPTH_OPTIONS.map((d) => (
                  <option key={d} value={d}>Level {d}{d === 1 ? ' (homepage only)' : d === 4 ? ' (deep)' : ''}</option>
                ))}
              </select>
            </div>

            {/* Exclude Patterns */}
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-foreground">
                <Filter className="mr-1 inline h-3.5 w-3.5 text-muted-foreground" />
                Exclude URL Patterns (comma-separated)
              </label>
              <input
                type="text"
                value={excludePatterns}
                onChange={(e) => setExcludePatterns(e.target.value)}
                placeholder="/admin, /cart, /checkout, /private"
                disabled={loading}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex cursor-pointer items-center gap-2.5">
              <button
                type="button"
                role="switch"
                aria-checked={includeImages}
                onClick={() => setIncludeImages((v) => !v)}
                disabled={loading}
                className={`relative h-5 w-9 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 ${includeImages ? 'bg-primary' : 'bg-muted-foreground/30'}`}
              >
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${includeImages ? 'left-[18px]' : 'left-0.5'}`} />
              </button>
              <span className="flex items-center gap-1.5 text-sm text-foreground">
                <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
                Include image:image tags
              </span>
            </label>

            <label className="flex cursor-pointer items-center gap-2.5">
              <button
                type="button"
                role="switch"
                aria-checked={includeLastMod}
                onClick={() => setIncludeLastMod((v) => !v)}
                disabled={loading}
                className={`relative h-5 w-9 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 ${includeLastMod ? 'bg-primary' : 'bg-muted-foreground/30'}`}
              >
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${includeLastMod ? 'left-[18px]' : 'left-0.5'}`} />
              </button>
              <span className="flex items-center gap-1.5 text-sm text-foreground">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                Include &lt;lastmod&gt; dates
              </span>
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <FileCode2 className="h-4 w-4" />
                Generate XML Sitemap
              </>
            )}
          </button>
        </form>

        {/* Progress */}
        {loading && (
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>{PROGRESS_STEPS[progressStep]}</span>
              <span>{progressPct}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Stats bar */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'URLs Found', value: result.urlCount, icon: Globe },
              { label: 'Image Tags', value: result.imageCount, icon: ImageIcon },
              { label: 'Source', value: result.usedSitemapXml ? 'sitemap.xml' : 'Crawled', icon: Search },
              { label: 'Errors', value: result.errors.length, icon: AlertCircle },
            ].map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="rounded-2xl border border-border bg-card p-4 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <Icon className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs text-muted-foreground">{stat.label}</span>
                  </div>
                  <p className="mt-1 font-heading text-xl font-bold text-foreground">{stat.value}</p>
                </div>
              )
            })}
          </div>

          {/* Source badge */}
          {result.usedSitemapXml && (
            <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-700">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>
                Found your existing <strong>sitemap.xml</strong> and used it as the source.
                {result.isSitemapIndex && ' (Sitemap index — multiple sub-sitemaps merged)'}
              </span>
            </div>
          )}

          {/* Tabs */}
          <div className="rounded-3xl border border-border bg-card overflow-hidden">
            <div className="flex border-b border-border">
              {([['xml', 'XML Output', Code2], ['pages', `Pages (${result.crawledPages.length})`, List]] as const).map(([id, label, Icon]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id as Tab)}
                  className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors ${
                    activeTab === id
                      ? 'border-b-2 border-primary text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}

              {/* Action buttons */}
              <div className="ml-auto flex items-center gap-2 px-4">
                <button
                  type="button"
                  onClick={copyXml}
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  type="button"
                  onClick={downloadXml}
                  className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download .xml
                </button>
              </div>
            </div>

            {/* XML Tab */}
            {activeTab === 'xml' && (
              <div className="max-h-[520px] overflow-auto bg-[#0d1117] p-5">
                <XmlHighlight xml={result.sitemapXml} />
              </div>
            )}

            {/* Pages Tab */}
            {activeTab === 'pages' && (
              <div className="max-h-[520px] overflow-auto">
                {result.crawledPages.length === 0 ? (
                  <p className="p-6 text-center text-sm text-muted-foreground">No pages found.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 border-b border-border bg-muted/60">
                      <tr>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">#</th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">URL</th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Title</th>
                        <th className="px-4 py-2.5 text-center text-xs font-semibold text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.crawledPages.map((page, i) => (
                        <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="px-4 py-2.5 text-xs text-muted-foreground">{i + 1}</td>
                          <td className="px-4 py-2.5">
                            <a
                              href={page.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 truncate font-mono text-xs text-primary hover:underline"
                            >
                              <ChevronRight className="h-3 w-3 shrink-0" />
                              <span className="truncate max-w-[300px]">{page.url}</span>
                            </a>
                          </td>
                          <td className="px-4 py-2.5 text-xs text-muted-foreground">
                            <span className="truncate max-w-[200px] block">{page.title}</span>
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <span className={`text-xs font-mono font-semibold ${statusColor(page.status)}`}>
                              {page.status || '—'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>

          {/* Errors */}
          {result.errors.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                <AlertCircle className="h-3.5 w-3.5" />
                {result.errors.length} crawl warning{result.errors.length > 1 ? 's' : ''}
              </p>
              <ul className="space-y-0.5">
                {result.errors.slice(0, 5).map((e, i) => (
                  <li key={i} className="truncate font-mono text-xs text-amber-600">{e}</li>
                ))}
                {result.errors.length > 5 && (
                  <li className="text-xs text-amber-600">+{result.errors.length - 5} more…</li>
                )}
              </ul>
            </div>
          )}

          {/* Next steps hint */}
          <div className="rounded-2xl border border-border bg-muted/30 p-4">
            <p className="mb-2 text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Settings2 className="h-3.5 w-3.5 text-primary" />
              Next steps
            </p>
            <ol className="space-y-1 text-xs text-muted-foreground list-none">
              {[
                'Download sitemap.xml and upload it to your website root (e.g. https://example.com/sitemap.xml)',
                'Add it to your robots.txt: Sitemap: https://example.com/sitemap.xml',
                'Submit it in Google Search Console → Sitemaps',
                'Resubmit whenever you add new pages or change content',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  )
}
