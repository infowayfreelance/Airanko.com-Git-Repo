'use client'

import { useMemo, useState, useCallback } from 'react'
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
  Printer,
  ClipboardList,
  PanelLeft,
  FileSearch,
  SlidersHorizontal,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { ScoreGauge, GradeBadge, AuditChecklist, IssuesAndFixes } from './audit-ui'
import MobileCheckerBulkAudit from './mobile-checker-bulk-audit'
import { BUILT_IN_DEVICES, CATEGORY_ICON, CATEGORY_LABEL, type Device, type DeviceCategory } from '@/lib/mobile-checker/devices'
import type { MobileCheckerResult } from '@/app/api/mobile-checker/route'

type TopTab = 'preview' | 'bulk'
type PreviewMode = 'single' | 'grid'
type CompareSide = 'a' | 'b'

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

async function fetchAudit(url: string): Promise<MobileCheckerResult> {
  try {
    const res = await fetch('/api/mobile-checker', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'single', input: url }),
    })
    const data = await res.json()
    if (!res.ok) return { url, status: 'error', error: data.error ?? `Request failed (HTTP ${res.status})` }
    return data.results?.[0] ?? { url, status: 'error', error: 'No result returned.' }
  } catch (err) {
    return { url, status: 'error', error: err instanceof Error ? err.message : 'Network request failed.' }
  }
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

// ── Left sidebar — full device catalog, grouped by category & brand ──────────

function DeviceSidebar({
  devices, customDevices, activeCategory, onCategoryChange, selectedDeviceId, onSelectDevice,
  deviceQuery, onQueryChange, showCustomForm, onToggleCustomForm, customWidth, onCustomWidth,
  customHeight, onCustomHeight, onAddCustomDevice, onRemoveCustomDevice, open, onClose,
}: {
  devices: Device[]; customDevices: Device[]; activeCategory: DeviceCategory; onCategoryChange: (c: DeviceCategory) => void
  selectedDeviceId: string; onSelectDevice: (d: Device) => void
  deviceQuery: string; onQueryChange: (v: string) => void
  showCustomForm: boolean; onToggleCustomForm: () => void
  customWidth: string; onCustomWidth: (v: string) => void
  customHeight: string; onCustomHeight: (v: string) => void
  onAddCustomDevice: () => void; onRemoveCustomDevice: (id: string) => void
  open: boolean; onClose: () => void
}) {
  const searching = deviceQuery.trim().length > 0
  const q = deviceQuery.trim().toLowerCase()

  const visible = searching
    ? devices.filter((d) => d.label.toLowerCase().includes(q) || d.brand.toLowerCase().includes(q))
    : devices.filter((d) => d.category === activeCategory)

  const grouped = useMemo(() => {
    const map = new Map<string, Device[]>()
    for (const d of visible) {
      const key = d.brand
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(d)
    }
    return Array.from(map.entries())
  }, [visible])

  return (
    <>
      {/* Mobile scrim */}
      {open && (
        <div className="fixed inset-0 z-[60] bg-foreground/40 lg:hidden print:hidden" onClick={onClose} />
      )}
      <aside
        data-print-hide
        className={cn(
          'print:hidden lg:sticky lg:top-4 lg:block lg:h-[calc(100vh-2rem)] lg:w-[270px] lg:shrink-0',
          open
            ? 'fixed inset-y-0 left-0 z-[61] w-[280px] bg-background shadow-2xl'
            : 'hidden',
        )}
      >
        <div className="flex h-full flex-col rounded-none border-r border-border bg-card lg:h-[calc(100vh-2rem)] lg:rounded-2xl lg:border">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="flex items-center gap-1.5 font-heading text-sm font-bold text-foreground">
              <Smartphone className="h-4 w-4 text-primary" /> Device Library
            </p>
            <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:bg-muted lg:hidden">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="border-b border-border p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={deviceQuery}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder="Search devices (e.g. Pixel, iPad)…"
                className="w-full rounded-lg border border-border bg-background py-1.5 pl-8 pr-2 text-xs outline-none focus:border-primary/40"
              />
            </div>
          </div>

          {!searching && (
            <div className="flex gap-1 border-b border-border p-2">
              {(['phone', 'tablet', 'desktop', 'custom'] as const).map((cat) => {
                const Icon = CATEGORY_ICON[cat]
                const isActive = activeCategory === cat
                return (
                  <button
                    key={cat}
                    onClick={() => onCategoryChange(cat)}
                    className={cn(
                      'flex flex-1 flex-col items-center gap-1 rounded-lg px-1 py-1.5 text-[10px] font-medium transition-all',
                      isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {CATEGORY_LABEL[cat]}
                  </button>
                )
              })}
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-3">
            {activeCategory === 'custom' && !searching && (
              <div className="mb-3">
                {showCustomForm ? (
                  <div className="flex items-center gap-1.5 rounded-lg border border-border bg-background p-2">
                    <input type="number" placeholder="W" value={customWidth} onChange={(e) => onCustomWidth(e.target.value)} className="w-14 rounded border border-border bg-transparent px-1.5 py-1 text-xs outline-none" />
                    <span className="text-xs text-muted-foreground">×</span>
                    <input type="number" placeholder="H" value={customHeight} onChange={(e) => onCustomHeight(e.target.value)} className="w-14 rounded border border-border bg-transparent px-1.5 py-1 text-xs outline-none" />
                    <Button size="sm" className="h-7 flex-1 px-2 text-[11px]" onClick={onAddCustomDevice}>Add</Button>
                  </div>
                ) : (
                  <button onClick={onToggleCustomForm} className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2 text-xs font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground">
                    <Plus className="h-3.5 w-3.5" /> Add custom size
                  </button>
                )}
              </div>
            )}

            {visible.length === 0 && (
              <p className="px-1 py-6 text-center text-xs text-muted-foreground">
                {activeCategory === 'custom' ? 'No custom sizes yet — add one above.' : 'No devices match your search.'}
              </p>
            )}

            <div className="space-y-4">
              {grouped.map(([brand, list]) => (
                <div key={brand}>
                  <p className="mb-1.5 px-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{brand}</p>
                  <div className="space-y-0.5">
                    {list.map((device) => {
                      const isActive = selectedDeviceId === device.id
                      const Icon = device.icon
                      return (
                        <button
                          key={device.id}
                          onClick={() => { onSelectDevice(device); onClose() }}
                          className={cn(
                            'group flex w-full items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-xs font-medium transition-all',
                            isActive
                              ? 'border-primary/40 bg-primary/10 text-primary shadow-sm'
                              : 'border-transparent text-foreground hover:border-border hover:bg-muted',
                          )}
                        >
                          <Icon className={cn('h-3.5 w-3.5 shrink-0', isActive ? 'text-primary' : 'text-muted-foreground')} />
                          <span className="min-w-0 flex-1 truncate">{device.label}</span>
                          <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">{device.width}×{device.height}</span>
                          {device.category === 'custom' && (
                            <span
                              role="button"
                              onClick={(e) => { e.stopPropagation(); onRemoveCustomDevice(device.id) }}
                              className="shrink-0 rounded p-0.5 opacity-0 hover:bg-red-500/10 hover:text-red-500 group-hover:opacity-100"
                            >
                              <X className="h-3 w-3" />
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

// ── Right panel — audit report ────────────────────────────────────────────

function AuditReportPanel({
  title, audit, loading, url,
}: { title: string; audit: MobileCheckerResult | null; loading: boolean; url: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 print:break-inside-avoid print:rounded-none print:border-0 print:p-0">
      <div className="mb-4 flex items-center gap-2 border-b border-border pb-3">
        <FileSearch className="h-4 w-4 text-primary" />
        <p className="font-heading text-sm font-bold text-foreground">{title}</p>
      </div>

      {url && <p className="mb-4 truncate font-mono text-[11px] text-muted-foreground">{url}</p>}

      {loading && (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <RefreshCw className="h-6 w-6 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground">Running mobile-friendliness audit…</p>
        </div>
      )}

      {!loading && !audit && (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
            <ClipboardList className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground">Enter a URL and click <strong>Check</strong> to see the full audit report here.</p>
        </div>
      )}

      {!loading && audit && !audit.audit && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" /> Audit unavailable{audit.error ? `: ${audit.error}` : '.'}
        </div>
      )}

      {!loading && audit?.audit && (
        <>
          <div className="mb-5 flex flex-wrap items-center gap-4 rounded-xl bg-muted/40 p-4">
            <ScoreGauge score={audit.audit.score} size="md" />
            <div>
              <GradeBadge grade={audit.audit.grade} />
              <p className="mt-1.5 text-xs text-muted-foreground">
                {audit.audit.passCount} passed · {audit.audit.warningCount} warnings · {audit.audit.failCount} failed
              </p>
            </div>
          </div>
          <IssuesAndFixes checks={audit.audit.checks} />
          <p className="mb-2 mt-6 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Full checklist — every check, by category</p>
          <AuditChecklist checks={audit.audit.checks} />
        </>
      )}
    </div>
  )
}

// ── Main component ──────────────────────────────────────────────────────────

export default function MobileCheckerTool() {
  const [topTab, setTopTab] = useState<TopTab>('preview')

  const [inputValue, setInputValue] = useState('')
  const [activeUrl, setActiveUrl] = useState('')
  const [customDevices, setCustomDevices] = useState<Device[]>([])
  const devices = [...BUILT_IN_DEVICES, ...customDevices]
  const [selectedDevice, setSelectedDevice] = useState(BUILT_IN_DEVICES[2])
  const [scale, setScale] = useState(0.75)
  const [isRotated, setIsRotated] = useState(false)
  const [iframeKey, setIframeKey] = useState(0)
  const [iframeLoading, setIframeLoading] = useState(false)
  const [iframeError, setIframeError] = useState(false)

  const [previewMode, setPreviewMode] = useState<PreviewMode>('single')
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [customWidth, setCustomWidth] = useState('')
  const [customHeight, setCustomHeight] = useState('')
  const [deviceQuery, setDeviceQuery] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [audit, setAudit] = useState<MobileCheckerResult | null>(null)
  const [auditLoading, setAuditLoading] = useState(false)

  const [compareMode, setCompareMode] = useState(false)
  const [compareInput, setCompareInput] = useState('')
  const [compareUrl, setCompareUrl] = useState('')
  const [compareAudit, setCompareAudit] = useState<MobileCheckerResult | null>(null)
  const [compareAuditLoading, setCompareAuditLoading] = useState(false)
  const [compareIframeKey, setCompareIframeKey] = useState(0)
  const [compareLoading, setCompareLoading] = useState(false)
  const [compareError, setCompareError] = useState(false)
  const [compareTab, setCompareTab] = useState<CompareSide>('a')

  // Tracked separately from `selectedDevice` so the "custom" tab can be active
  // (showing the add-size form) even before any custom device exists yet.
  const [activeCategory, setActiveCategory] = useState<DeviceCategory>('phone')

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
    setCompareTab('b')
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
    const device: Device = { id: `custom-${Date.now()}`, label: `${w}×${h}`, brand: 'Custom', width: w, height: h, icon: Ruler, category: 'custom' }
    setCustomDevices((prev) => [...prev, device])
    setSelectedDevice(device)
    setCustomWidth('')
    setCustomHeight('')
    setShowCustomForm(false)
  }

  function handleDownloadPdf() {
    setTimeout(() => window.print(), 200)
  }

  const inputError = inputValue.trim() !== '' && !isValidUrl(normalizeUrl(inputValue))
  const compareInputError = compareInput.trim() !== '' && !isValidUrl(normalizeUrl(compareInput))

  const gridDevices = devices.filter((d) => d.category === activeCategory)

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">

      {/* Header */}
      <div className="border-b border-border bg-card px-4 py-5 sm:px-6 lg:px-8 print:hidden" data-print-hide>
        <div className="mx-auto max-w-[1600px]">
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
                Live device preview across every major phone, tablet and desktop, plus a real mobile-friendliness audit measured from the actual page source. No installs, no sign-up.
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
        <div className="mx-auto max-w-[1600px] space-y-2">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Button type="button" variant="outline" size="sm" className="shrink-0 gap-1.5 lg:hidden" onClick={() => setSidebarOpen(true)}>
              <PanelLeft className="h-3.5 w-3.5" /> Devices
            </Button>
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
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground shadow-sm">
            {(() => { const Icon = selectedDevice.icon; return <Icon className="h-3.5 w-3.5 text-primary" /> })()}
            {selectedDevice.label}
            <span className="text-border">|</span>
            <span className="tabular-nums text-muted-foreground">{isRotated ? selectedDevice.height : selectedDevice.width} × {isRotated ? selectedDevice.width : selectedDevice.height}px</span>
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-2">
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
              <SlidersHorizontal className="ml-1 h-3 w-3 text-muted-foreground" />
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

      {/* Three-column workspace: device library · live preview · audit report */}
      <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-4 bg-muted/40 px-4 py-6 sm:px-6 lg:flex-row lg:items-start lg:px-8 print:block print:bg-white print:px-0 print:py-0">

        <DeviceSidebar
          devices={devices}
          customDevices={customDevices}
          activeCategory={activeCategory}
          onCategoryChange={(cat) => {
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
          selectedDeviceId={selectedDevice.id}
          onSelectDevice={(d) => { setSelectedDevice(d); setIsRotated(false) }}
          deviceQuery={deviceQuery}
          onQueryChange={setDeviceQuery}
          showCustomForm={showCustomForm}
          onToggleCustomForm={() => setShowCustomForm((v) => !v)}
          customWidth={customWidth}
          onCustomWidth={setCustomWidth}
          customHeight={customHeight}
          onCustomHeight={setCustomHeight}
          onAddCustomDevice={handleAddCustomDevice}
          onRemoveCustomDevice={(id) => setCustomDevices((prev) => prev.filter((d) => d.id !== id))}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Center — live preview */}
        <div className="flex min-w-0 flex-1 flex-col items-center justify-start print:block">
          {!activeUrl ? (
            <div className="flex w-full flex-1 flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card px-6 py-16 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-dashed border-border bg-background">
                <Smartphone className="h-9 w-9 text-muted-foreground" />
              </div>
              <div>
                <p className="font-heading font-semibold text-foreground">No website loaded</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Enter a URL above and click <strong>Check</strong> to preview it in mobile view and run a real mobile-friendliness audit.
                </p>
              </div>
              <div className="mt-2 grid grid-cols-1 gap-2 text-left sm:grid-cols-2">
                {[
                  { icon: CheckCircle2, text: 'Live preview across 40+ real device sizes' },
                  { icon: CheckCircle2, text: 'Real audit — viewport, legibility, Flash, redirects' },
                  { icon: CheckCircle2, text: 'Grid view compares devices side by side' },
                  { icon: CheckCircle2, text: 'Compare two URLs, export a PDF report' },
                ].map((tip) => (
                  <div key={tip.text} className="flex items-start gap-2 rounded-lg border border-border bg-background px-4 py-3">
                    <tip.icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-xs text-muted-foreground">{tip.text}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : compareMode ? (
            <div className="flex w-full flex-col items-center gap-6 rounded-2xl border border-border bg-card p-6">
              <div className="grid w-full gap-6 lg:grid-cols-2">
                <div className="flex flex-col items-center gap-3">
                  <button onClick={() => setCompareTab('a')} className={cn('flex max-w-full items-center gap-1.5 truncate rounded-full border px-3 py-1 font-mono text-[11px]', compareTab === 'a' ? 'border-primary/40 bg-primary/10 text-primary' : 'border-border text-muted-foreground')}>
                    Site A: {activeUrl}
                  </button>
                  <DeviceFrame device={selectedDevice} isRotated={isRotated} scale={Math.min(scale, 0.6)} url={activeUrl} iframeKey={iframeKey}
                    loading={iframeLoading} error={iframeError}
                    onLoad={() => setIframeLoading(false)} onError={() => { setIframeLoading(false); setIframeError(true) }} />
                </div>
                <div className="flex flex-col items-center gap-3">
                  {compareUrl ? (
                    <>
                      <button onClick={() => setCompareTab('b')} className={cn('flex max-w-full items-center gap-1.5 truncate rounded-full border px-3 py-1 font-mono text-[11px]', compareTab === 'b' ? 'border-primary/40 bg-primary/10 text-primary' : 'border-border text-muted-foreground')}>
                        Site B: {compareUrl}
                      </button>
                      <DeviceFrame device={selectedDevice} isRotated={isRotated} scale={Math.min(scale, 0.6)} url={compareUrl} iframeKey={compareIframeKey}
                        loading={compareLoading} error={compareError}
                        onLoad={() => setCompareLoading(false)} onError={() => { setCompareLoading(false); setCompareError(true) }} />
                    </>
                  ) : (
                    <div className="flex h-full min-h-[300px] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-background p-8 text-center">
                      <Columns2 className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Enter a second URL above to compare</p>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-center text-xs text-muted-foreground print:hidden">
                Use the report panel on the right to switch between Site A and Site B results.
              </p>
            </div>
          ) : previewMode === 'grid' ? (
            <div className="flex w-full flex-col items-center gap-6 rounded-2xl border border-border bg-card p-6">
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
            <div className="flex w-full flex-col items-center gap-5 rounded-2xl border border-border bg-card p-8">
              <div className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
                {Math.round(scale * 100)}% zoom
              </div>

              <DeviceFrame device={selectedDevice} isRotated={isRotated} scale={scale} url={activeUrl} iframeKey={iframeKey}
                loading={iframeLoading} error={iframeError}
                onLoad={() => setIframeLoading(false)} onError={() => { setIframeLoading(false); setIframeError(true) }} />

              <p className="max-w-sm text-center text-xs text-muted-foreground print:hidden">
                Note: Some sites block embedding due to security policies. Use &quot;Open in New Tab&quot; if the preview fails to load.
              </p>
            </div>
          )}
        </div>

        {/* Right — audit report */}
        <div className="w-full lg:sticky lg:top-4 lg:w-[400px] lg:max-h-[calc(100vh-2rem)] lg:shrink-0 lg:overflow-y-auto print:static print:w-full print:max-h-none print:overflow-visible">
          {compareMode ? (
            <>
              <div className="mb-3 flex gap-1 rounded-lg border border-border bg-muted p-1 print:hidden" data-print-hide>
                <button onClick={() => setCompareTab('a')} className={cn('flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all', compareTab === 'a' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>Site A report</button>
                <button onClick={() => setCompareTab('b')} className={cn('flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all', compareTab === 'b' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>Site B report</button>
              </div>
              <div className={cn(compareTab !== 'a' && 'hidden print:block')}>
                <AuditReportPanel title="Site A — Audit Report" audit={audit} loading={auditLoading} url={activeUrl} />
              </div>
              <div className={cn('mt-4 print:mt-6', compareTab !== 'b' && 'hidden print:block')}>
                <AuditReportPanel title="Site B — Audit Report" audit={compareAudit} loading={compareAuditLoading} url={compareUrl} />
              </div>
            </>
          ) : (
            <AuditReportPanel title="Mobile Audit Report" audit={audit} loading={auditLoading} url={activeUrl} />
          )}
        </div>
      </div>
      </>
      )}
    </div>
  )
}
