'use client'

import { useState, useRef, useCallback } from 'react'
import {
  Smartphone,
  Tablet,
  Monitor,
  RefreshCw,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  Search,
  LayoutGrid,
  Columns2,
  Ruler,
  Plus,
  X,
  ChevronDown,
  Printer,
  ClipboardList,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { ScoreGauge, GradeBadge, AuditChecklist } from './audit-ui'
import MobileCheckerBulkAudit from './mobile-checker-bulk-audit'
import type { MobileCheckerResult } from '@/app/api/mobile-checker/route'

type TopTab = 'preview' | 'bulk'
type PreviewMode = 'single' | 'grid'

interface Device {
  id: string
  label: string
  width: number
  height: number
  icon: typeof Smartphone
  category: 'phone' | 'tablet' | 'desktop' | 'custom'
}

const BUILT_IN_DEVICES: Device[] = [
  { id: 'iphone-se', label: 'iPhone SE', width: 375, height: 667, icon: Smartphone, category: 'phone' },
  { id: 'iphone-14', label: 'iPhone 14', width: 390, height: 844, icon: Smartphone, category: 'phone' },
  { id: 'iphone-14-pro-max', label: 'iPhone 14 Pro Max', width: 430, height: 932, icon: Smartphone, category: 'phone' },
  { id: 'galaxy-s23', label: 'Galaxy S23', width: 393, height: 851, icon: Smartphone, category: 'phone' },
  { id: 'pixel-7', label: 'Pixel 7', width: 412, height: 892, icon: Smartphone, category: 'phone' },
  { id: 'ipad-mini', label: 'iPad Mini', width: 768, height: 1024, icon: Tablet, category: 'tablet' },
  { id: 'ipad-pro', label: 'iPad Pro 11"', width: 834, height: 1194, icon: Tablet, category: 'tablet' },
  { id: 'desktop', label: 'Desktop', width: 1280, height: 800, icon: Monitor, category: 'desktop' },
]

const SCALE_OPTIONS = [
  { label: '50%', value: 0.5 },
  { label: '75%', value: 0.75 },
  { label: '100%', value: 1 },
]

function normalizeUrl(input: string): string {
  const trimmed = input.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

function isValidUrl(url: string): boolean {
  try { new URL(url); return true } catch { return false }
}

async function fetchAudit(url: string): Promise<MobileCheckerResult | null> {
  try {
    const res = await fetch('/api/mobile-checker', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'single', input: url }),
    })
    const data = await res.json()
    if (!res.ok) return null
    return data.results?.[0] ?? null
  } catch { return null }
}

// ── Device frame (reusable — used for main preview, grid tiles, and compare columns) ──

function DeviceFrame({
  device, isRotated, scale, url, iframeKey, onLoad, onError, loading, error, compact,
}: {
  device: Device; isRotated: boolean; scale: number; url: string; iframeKey: number
  onLoad: () => void; onError: () => void; loading: boolean; error: boolean; compact?: boolean
}) {
  const frameWidth = isRotated ? device.height : device.width
  const frameHeight = isRotated ? device.width : device.height
  const scaledWidth = Math.round(frameWidth * scale)
  const scaledHeight = Math.round(frameHeight * scale)

  return (
    <div
      className={cn(
        'relative rounded-[2rem] border-[6px] border-foreground/20 bg-foreground/10 shadow-2xl transition-all duration-300',
        (device.category === 'desktop') && 'rounded-xl border-[8px]',
      )}
      style={{ width: scaledWidth + 12, height: scaledHeight + 12 }}
    >
      {device.category === 'phone' && !isRotated && !compact && (
        <div className="absolute left-1/2 top-2 z-10 h-5 w-20 -translate-x-1/2 rounded-full bg-foreground/20" />
      )}

      {loading && !error && (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[1.4rem] bg-background/90 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2">
            <RefreshCw className={cn('animate-spin text-primary', compact ? 'h-4 w-4' : 'h-6 w-6')} />
            {!compact && <p className="text-xs text-muted-foreground">Loading website...</p>}
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[1.4rem] bg-background/95">
          <div className="flex flex-col items-center gap-2 px-4 text-center">
            <AlertCircle className={cn('text-red-500', compact ? 'h-5 w-5' : 'h-6 w-6')} />
            {!compact && <p className="text-[11px] text-muted-foreground">Blocked from embedding (X-Frame-Options / CSP)</p>}
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-[1.5rem]" style={{ width: scaledWidth, height: scaledHeight }}>
        <iframe
          key={iframeKey}
          src={url}
          title="Website Preview"
          className="origin-top-left border-0 bg-white"
          style={{ width: frameWidth, height: frameHeight, transform: `scale(${scale})`, transformOrigin: 'top left' }}
          onLoad={onLoad}
          onError={onError}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>
    </div>
  )
}

// ── Compact score summary chip (used inline near a preview) ──

function AuditSummaryChip({ audit, loading, onOpen }: { audit: MobileCheckerResult | null; loading: boolean; onOpen: () => void }) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-1.5 text-xs text-muted-foreground">
        <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Running mobile-friendliness audit…
      </div>
    )
  }
  if (!audit || audit.status === 'error' || !audit.audit) {
    return (
      <div className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-1.5 text-xs text-muted-foreground">
        <AlertCircle className="h-3.5 w-3.5" /> Audit unavailable{audit?.error ? `: ${audit.error}` : ''}
      </div>
    )
  }
  return (
    <button onClick={onOpen} className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-1.5 text-xs font-medium text-foreground shadow-sm transition-colors hover:border-primary/40">
      <ClipboardList className="h-3.5 w-3.5 text-primary" />
      Mobile score: <span style={{ color: audit.audit.score >= 90 ? '#10b981' : audit.audit.score >= 70 ? '#3b82f6' : audit.audit.score >= 50 ? '#f59e0b' : '#ef4444' }} className="font-bold">{audit.audit.score}/100</span>
      <span className="text-border">|</span>
      {audit.audit.grade}
      <ChevronDown className="h-3 w-3 text-muted-foreground" />
    </button>
  )
}

// ── Main component ──────────────────────────────────────────────────────────

export default function MobileCheckerTool() {
  const [topTab, setTopTab] = useState<TopTab>('preview')

  const [inputValue, setInputValue] = useState('')
  const [activeUrl, setActiveUrl] = useState('')
  const [customDevices, setCustomDevices] = useState<Device[]>([])
  const devices = [...BUILT_IN_DEVICES, ...customDevices]
  const [selectedDevice, setSelectedDevice] = useState(BUILT_IN_DEVICES[1])
  const [scale, setScale] = useState(0.75)
  const [isRotated, setIsRotated] = useState(false)
  const [iframeKey, setIframeKey] = useState(0)
  const [iframeLoading, setIframeLoading] = useState(false)
  const [iframeError, setIframeError] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const [previewMode, setPreviewMode] = useState<PreviewMode>('single')
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [customWidth, setCustomWidth] = useState('')
  const [customHeight, setCustomHeight] = useState('')

  const [audit, setAudit] = useState<MobileCheckerResult | null>(null)
  const [auditLoading, setAuditLoading] = useState(false)
  const [showAuditPanel, setShowAuditPanel] = useState(false)

  const [compareMode, setCompareMode] = useState(false)
  const [compareInput, setCompareInput] = useState('')
  const [compareUrl, setCompareUrl] = useState('')
  const [compareAudit, setCompareAudit] = useState<MobileCheckerResult | null>(null)
  const [compareAuditLoading, setCompareAuditLoading] = useState(false)
  const [compareIframeKey, setCompareIframeKey] = useState(0)
  const [compareLoading, setCompareLoading] = useState(false)
  const [compareError, setCompareError] = useState(false)
  const [showCompareAuditPanel, setShowCompareAuditPanel] = useState(false)

  // Tracked separately from `selectedDevice` so the "custom" tab can be active
  // (showing the add-size form) even before any custom device exists yet.
  const [activeCategory, setActiveCategory] = useState<Device['category']>('phone')

  async function runAuditFor(url: string, setLoading: (v: boolean) => void, setResult: (r: MobileCheckerResult | null) => void) {
    setLoading(true)
    setResult(null)
    const result = await fetchAudit(url)
    setResult(result)
    setLoading(false)
  }

  const handleSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault()
    const url = normalizeUrl(inputValue)
    if (!isValidUrl(url)) return
    setActiveUrl(url)
    setIframeError(false)
    setIframeLoading(true)
    setIframeKey((k) => k + 1)
    setShowAuditPanel(false)
    runAuditFor(url, setAuditLoading, setAudit)
  }, [inputValue])

  const handleCompareSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault()
    const url = normalizeUrl(compareInput)
    if (!isValidUrl(url)) return
    setCompareUrl(url)
    setCompareError(false)
    setCompareLoading(true)
    setCompareIframeKey((k) => k + 1)
    setShowCompareAuditPanel(false)
    runAuditFor(url, setCompareAuditLoading, setCompareAudit)
  }, [compareInput])

  function handleReload() {
    setIframeError(false)
    setIframeLoading(true)
    setIframeKey((k) => k + 1)
  }

  function handleAddCustomDevice() {
    const w = parseInt(customWidth, 10)
    const h = parseInt(customHeight, 10)
    if (!w || !h || w < 200 || w > 3000 || h < 200 || h > 3000) return
    const device: Device = { id: `custom-${Date.now()}`, label: `${w}×${h}`, width: w, height: h, icon: Ruler, category: 'custom' }
    setCustomDevices((prev) => [...prev, device])
    setSelectedDevice(device)
    setCustomWidth('')
    setCustomHeight('')
    setShowCustomForm(false)
  }

  function handleDownloadPdf() {
    setShowAuditPanel(true)
    if (compareMode) setShowCompareAuditPanel(true)
    setTimeout(() => window.print(), 200)
  }

  const inputError = inputValue.trim() !== '' && !isValidUrl(normalizeUrl(inputValue))
  const compareInputError = compareInput.trim() !== '' && !isValidUrl(normalizeUrl(compareInput))

  const gridDevices = devices.filter((d) => d.category === activeCategory)

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">

      {/* Header */}
      <div className="border-b border-border bg-card px-4 py-5 sm:px-6 lg:px-8 print:hidden" data-print-hide>
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                  <Smartphone className="h-4.5 w-4.5 text-primary" />
                </div>
                <h1 className="font-heading text-xl font-bold text-foreground">
                  Free Mobile Friendliness Checker — Test &amp; Audit Any Website
                </h1>
              </div>
              <p className="mt-1 ml-11 text-sm text-muted-foreground">
                Live device preview plus a real mobile-friendliness audit — viewport, legibility, tap targets, Flash/plugins, responsive images, and mobile-redirect checks measured from the actual page source. No installs, no sign-up.
              </p>
            </div>
            <div className="ml-11 flex items-center gap-2 sm:ml-0">
              <Badge variant="secondary" className="text-xs">Free Tool</Badge>
            </div>
          </div>

          {/* Top-level tabs */}
          <div className="mt-4 flex gap-1 rounded-2xl border border-border bg-muted/40 p-1 sm:w-fit">
            {([
              { id: 'preview' as TopTab, label: 'Live Preview & Audit', icon: Smartphone },
              { id: 'bulk' as TopTab, label: 'Bulk / Sitemap Audit', icon: ClipboardList },
            ]).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTopTab(tab.id)}
                className={cn(
                  'flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-all',
                  topTab === tab.id ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {topTab === 'bulk' ? (
        <MobileCheckerBulkAudit />
      ) : (
      <>
      {/* URL Bar */}
      <div className="border-b border-border bg-card/50 px-4 py-3 sm:px-6 lg:px-8 print:hidden" data-print-hide>
        <div className="mx-auto max-w-7xl space-y-2">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className={cn('pl-9 font-mono text-sm', inputError && 'border-red-500 focus-visible:ring-red-500')}
                placeholder={compareMode ? 'First website URL' : 'Enter website URL  e.g. https://example.com'}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                aria-label="Website URL"
              />
              {inputError && (
                <p className="absolute -bottom-5 left-0 flex items-center gap-1 text-xs text-red-500">
                  <AlertCircle className="h-3 w-3" /> Please enter a valid URL
                </p>
              )}
            </div>
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0" disabled={!inputValue.trim() || inputError}>
              Check
            </Button>
            <Button type="button" variant="outline" size="sm" className="shrink-0 gap-1.5" onClick={() => setCompareMode((v) => !v)}>
              <Columns2 className="h-3.5 w-3.5" /> {compareMode ? 'Exit Compare' : 'Compare'}
            </Button>
            {activeUrl && (
              <Button type="button" variant="outline" size="sm" className="shrink-0 gap-1.5" onClick={handleDownloadPdf}>
                <Printer className="h-3.5 w-3.5" /> PDF
              </Button>
            )}
          </form>

          {compareMode && (
            <form onSubmit={handleCompareSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className={cn('pl-9 font-mono text-sm', compareInputError && 'border-red-500 focus-visible:ring-red-500')}
                  placeholder="Second website URL to compare"
                  value={compareInput}
                  onChange={(e) => setCompareInput(e.target.value)}
                  aria-label="Compare website URL"
                />
              </div>
              <Button type="submit" variant="outline" className="shrink-0" disabled={!compareInput.trim() || compareInputError}>
                Load
              </Button>
            </form>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="border-b border-border bg-card/30 px-4 py-2.5 sm:px-6 lg:px-8 print:hidden" data-print-hide>
        <div className="mx-auto max-w-7xl flex flex-wrap items-center gap-4">

          {/* Category tabs */}
          <div className="flex items-center gap-1 rounded-lg border border-border bg-muted p-1">
            {(['phone', 'tablet', 'desktop', 'custom'] as const).map((cat) => {
              const icons = { phone: Smartphone, tablet: Tablet, desktop: Monitor, custom: Ruler }
              const Icon = icons[cat]
              const isActive = activeCategory === cat
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat)
                    if (cat === 'custom') {
                      const first = customDevices[0]
                      if (first) setSelectedDevice(first)
                      else setShowCustomForm(true)
                    } else {
                      const first = devices.find((d) => d.category === cat)
                      if (first) setSelectedDevice(first)
                    }
                    setIsRotated(false)
                  }}
                  className={cn(
                    'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-all',
                    isActive ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {cat}
                </button>
              )
            })}
          </div>

          {/* Device selector */}
          <div className="flex flex-wrap items-center gap-1">
            {devices.filter((d) => d.category === activeCategory).map((device) => (
              <button
                key={device.id}
                onClick={() => { setSelectedDevice(device); setIsRotated(false) }}
                className={cn(
                  'group relative rounded-md border px-2.5 py-1 text-xs font-medium transition-all',
                  selectedDevice.id === device.id
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground',
                )}
              >
                {device.label}
                {device.category === 'custom' && (
                  <span
                    role="button"
                    onClick={(e) => { e.stopPropagation(); setCustomDevices((prev) => prev.filter((d) => d.id !== device.id)) }}
                    className="ml-1.5 inline-flex opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </span>
                )}
              </button>
            ))}
            {activeCategory === 'custom' && (
              <button onClick={() => setShowCustomForm((v) => !v)} className="flex items-center gap-1 rounded-md border border-dashed border-border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground">
                <Plus className="h-3 w-3" /> Add size
              </button>
            )}
          </div>

          {showCustomForm && activeCategory === 'custom' && (
            <div className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-2 py-1">
              <input type="number" placeholder="W" value={customWidth} onChange={(e) => setCustomWidth(e.target.value)} className="w-14 bg-transparent text-xs outline-none" />
              <span className="text-xs text-muted-foreground">×</span>
              <input type="number" placeholder="H" value={customHeight} onChange={(e) => setCustomHeight(e.target.value)} className="w-14 bg-transparent text-xs outline-none" />
              <Button size="sm" className="h-6 px-2 text-[11px]" onClick={handleAddCustomDevice}>Add</Button>
            </div>
          )}

          <div className="ml-auto flex items-center gap-2">
            {/* Grid / single toggle */}
            {!compareMode && (
              <div className="flex items-center gap-1 rounded-lg border border-border bg-muted p-1">
                <button onClick={() => setPreviewMode('single')} className={cn('flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-all', previewMode === 'single' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')} title="Single device">
                  <Smartphone className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => setPreviewMode('grid')} className={cn('flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-all', previewMode === 'grid' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')} title="Compare all devices in this category">
                  <LayoutGrid className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Rotate */}
            {activeCategory !== 'desktop' && previewMode === 'single' && (
              <Button variant="outline" size="sm" className="h-8 gap-1.5 px-2.5 text-xs" onClick={() => setIsRotated((r) => !r)} title="Rotate device">
                <RotateCcw className="h-3.5 w-3.5" />
                {isRotated ? 'Portrait' : 'Landscape'}
              </Button>
            )}

            {/* Scale */}
            <div className="flex items-center gap-1 rounded-lg border border-border bg-muted p-1">
              {SCALE_OPTIONS.map((opt) => (
                <button key={opt.value} onClick={() => setScale(opt.value)} className={cn('rounded-md px-2.5 py-1 text-xs font-medium transition-all', scale === opt.value ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
                  {opt.label}
                </button>
              ))}
            </div>

            {activeUrl && (
              <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={handleReload} title="Reload">
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            )}
            {activeUrl && (
              <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => window.open(activeUrl, '_blank')} title="Open in new tab">
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex flex-1 flex-col items-center justify-start overflow-auto bg-muted/40 px-4 py-8 sm:px-6 lg:px-8 print:bg-white print:px-0">

        {!activeUrl ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-dashed border-border bg-background">
              <Smartphone className="h-9 w-9 text-muted-foreground" />
            </div>
            <div>
              <p className="font-heading font-semibold text-foreground">No website loaded</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Enter a URL above and click <strong>Check</strong> to preview it in mobile view and run a real mobile-friendliness audit.
              </p>
            </div>
            <div className="mt-2 grid grid-cols-1 gap-2 text-left sm:grid-cols-4">
              {[
                { icon: CheckCircle2, text: 'Live preview on real device sizes' },
                { icon: CheckCircle2, text: 'Real audit — viewport, legibility, Flash, redirects' },
                { icon: CheckCircle2, text: 'Grid view compares devices side by side' },
                { icon: CheckCircle2, text: 'Compare two URLs, export PDF report' },
              ].map((tip) => (
                <div key={tip.text} className="flex items-start gap-2 rounded-lg border border-border bg-background px-4 py-3">
                  <tip.icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span className="text-xs text-muted-foreground">{tip.text}</span>
                </div>
              ))}
            </div>
          </div>
        ) : compareMode ? (
          <div className="grid w-full gap-8 lg:grid-cols-2">
            {/* Column A */}
            <div className="flex flex-col items-center gap-4">
              <p className="max-w-full truncate font-mono text-xs text-muted-foreground">{activeUrl}</p>
              <AuditSummaryChip audit={audit} loading={auditLoading} onOpen={() => setShowAuditPanel((v) => !v)} />
              <DeviceFrame device={selectedDevice} isRotated={isRotated} scale={scale} url={activeUrl} iframeKey={iframeKey}
                loading={iframeLoading} error={iframeError}
                onLoad={() => setIframeLoading(false)} onError={() => { setIframeLoading(false); setIframeError(true) }} />
              {showAuditPanel && audit?.audit && (
                <div className="w-full rounded-2xl border border-border bg-card p-4 print:break-inside-avoid">
                  <AuditChecklist checks={audit.audit.checks} />
                </div>
              )}
            </div>
            {/* Column B */}
            <div className="flex flex-col items-center gap-4">
              {compareUrl ? (
                <>
                  <p className="max-w-full truncate font-mono text-xs text-muted-foreground">{compareUrl}</p>
                  <AuditSummaryChip audit={compareAudit} loading={compareAuditLoading} onOpen={() => setShowCompareAuditPanel((v) => !v)} />
                  <DeviceFrame device={selectedDevice} isRotated={isRotated} scale={scale} url={compareUrl} iframeKey={compareIframeKey}
                    loading={compareLoading} error={compareError}
                    onLoad={() => setCompareLoading(false)} onError={() => { setCompareLoading(false); setCompareError(true) }} />
                  {showCompareAuditPanel && compareAudit?.audit && (
                    <div className="w-full rounded-2xl border border-border bg-card p-4 print:break-inside-avoid">
                      <AuditChecklist checks={compareAudit.audit.checks} />
                    </div>
                  )}
                </>
              ) : (
                <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-background p-8 text-center">
                  <Columns2 className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Enter a second URL above to compare</p>
                </div>
              )}
            </div>
          </div>
        ) : previewMode === 'grid' ? (
          <div className="flex flex-col items-center gap-6">
            <p className="font-mono text-xs text-muted-foreground">{activeUrl}</p>
            <div className="flex flex-wrap items-start justify-center gap-6">
              {gridDevices.map((device) => (
                <div key={device.id} className="flex flex-col items-center gap-2">
                  <button onClick={() => { setSelectedDevice(device); setPreviewMode('single') }} className="text-xs font-medium text-foreground hover:text-primary">
                    {device.label} <span className="text-muted-foreground">({device.width}×{device.height})</span>
                  </button>
                  <DeviceFrame device={device} isRotated={false} scale={0.35} url={activeUrl} iframeKey={iframeKey}
                    loading={iframeLoading} error={iframeError} compact
                    onLoad={() => setIframeLoading(false)} onError={() => { setIframeLoading(false); setIframeError(true) }} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
              {(() => { const Icon = selectedDevice.icon; return <Icon className="h-3.5 w-3.5" /> })()}
              {selectedDevice.label}
              <span className="text-border">|</span>
              {isRotated ? selectedDevice.height : selectedDevice.width} × {isRotated ? selectedDevice.width : selectedDevice.height}px
              <span className="text-border">|</span>
              {Math.round(scale * 100)}% zoom
            </div>

            <AuditSummaryChip audit={audit} loading={auditLoading} onOpen={() => setShowAuditPanel((v) => !v)} />

            <DeviceFrame device={selectedDevice} isRotated={isRotated} scale={scale} url={activeUrl} iframeKey={iframeKey}
              loading={iframeLoading} error={iframeError}
              onLoad={() => setIframeLoading(false)} onError={() => { setIframeLoading(false); setIframeError(true) }} />

            <p className="max-w-sm text-center text-xs text-muted-foreground print:hidden">
              Note: Some sites block embedding due to security policies. Use &quot;Open in New Tab&quot; if the preview fails to load.
            </p>

            {/* Full audit report */}
            {showAuditPanel && (
              <div className="w-full max-w-2xl rounded-3xl border border-border bg-card p-6 print:break-inside-avoid">
                {audit?.audit ? (
                  <>
                    <div className="mb-6 flex flex-wrap items-center gap-4">
                      <ScoreGauge score={audit.audit.score} size="md" />
                      <div>
                        <GradeBadge grade={audit.audit.grade} />
                        <p className="mt-1.5 text-xs text-muted-foreground">
                          {audit.audit.passCount} passed · {audit.audit.warningCount} warnings · {audit.audit.failCount} failed
                        </p>
                      </div>
                    </div>
                    <AuditChecklist checks={audit.audit.checks} />
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">{auditLoading ? 'Running audit…' : 'Audit unavailable for this URL.'}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      </>
      )}
    </div>
  )
}
