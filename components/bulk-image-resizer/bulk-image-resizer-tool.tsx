'use client'

import { useState, useRef, useCallback, useId } from 'react'
import {
  Upload,
  Download,
  RotateCcw,
  Lock,
  Unlock,
  ImageIcon,
  Settings2,
  Layers,
  RefreshCw,
  CheckCircle2,
  X,
  Trash2,
  ChevronDown,
  ChevronUp,
  DownloadCloud,
  SlidersHorizontal,
  Images,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// ─── Types ──────────────────────────────────────────────────────────────────

type OutputFormat = 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif'

interface ImageItem {
  id: string
  file: File
  src: string
  originalW: number
  originalH: number
  // per-image overrides (null = use global)
  overrideW: number | null
  overrideH: number | null
  overridePercentage: number | null
  overrideLockAR: boolean | null
  overrideFormat: OutputFormat | null
  overrideQuality: number | null
  // output
  outputUrl: string | null
  outputSize: number | null
  outputW: number
  outputH: number
  status: 'idle' | 'processing' | 'done' | 'error'
  expanded: boolean
  // editable SEO filename
  customName: string
}

// ─── Constants ───────────────────────────────────────────────────────────────

const FORMAT_LABELS: Record<OutputFormat, string> = {
  'image/png': 'PNG',
  'image/jpeg': 'JPEG',
  'image/webp': 'WebP',
  'image/gif': 'GIF',
}

const FORMAT_EXT: Record<OutputFormat, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

const FORMAT_DESC: Record<OutputFormat, string> = {
  'image/webp': 'Best for web — small size, great quality',
  'image/png': 'Lossless — great for graphics & transparency',
  'image/jpeg': 'Universal — best for photos',
  'image/gif': 'Animated & legacy compatibility',
}

const SIZE_PRESETS = [
  { label: 'HD', width: 1280, height: 720 },
  { label: 'Full HD', width: 1920, height: 1080 },
  { label: '4K UHD', width: 3840, height: 2160 },
  { label: 'Instagram Square', width: 1080, height: 1080 },
  { label: 'Instagram Story', width: 1080, height: 1920 },
  { label: 'Twitter Post', width: 1200, height: 675 },
  { label: 'Facebook Cover', width: 820, height: 312 },
  { label: 'LinkedIn Banner', width: 1584, height: 396 },
  { label: 'YouTube Thumbnail', width: 1280, height: 720 },
  { label: 'OG Image', width: 1200, height: 630 },
  { label: 'Favicon', width: 32, height: 32 },
  { label: 'App Icon', width: 512, height: 512 },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(2)} MB`
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 10)
}

function buildSeoFilename(rawName: string, w: number, h: number, fmt: OutputFormat): string {
  const slug = rawName
    .replace(/\.[^/.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'image'
  return `${slug}-${w}x${h}.${FORMAT_EXT[fmt]}`
}

function resizeOnCanvas(
  src: string,
  targetW: number,
  targetH: number,
  format: OutputFormat,
  quality: number
): Promise<{ blob: Blob; url: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = targetW
      canvas.height = targetH
      const ctx = canvas.getContext('2d', { alpha: true })
      if (!ctx) { reject(new Error('canvas context unavailable')); return }
      if (format === 'image/jpeg') {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, targetW, targetH)
      }
      ctx.drawImage(img, 0, 0, targetW, targetH)
      const q = ['image/jpeg', 'image/webp'].includes(format) ? quality / 100 : undefined
      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error('toBlob failed')); return }
          resolve({ blob, url: URL.createObjectURL(blob) })
        },
        format,
        q
      )
    }
    img.onerror = reject
    img.src = src
  })
}

// ─── Global Settings Panel ───────────────────────────────────────────────────

interface GlobalSettingsProps {
  width: number
  height: number
  percentage: number
  lockAR: boolean
  format: OutputFormat
  quality: number
  onWidthChange: (v: string) => void
  onHeightChange: (v: string) => void
  onPercentageChange: (v: number) => void
  onLockARToggle: () => void
  onFormatChange: (f: OutputFormat) => void
  onQualityChange: (v: number) => void
  onApplyPreset: (w: number, h: number) => void
  onApplyAll: () => void
  onDownloadAll: () => void
  isProcessingAll: boolean
  totalImages: number
}

function GlobalSettings({
  width, height, percentage, lockAR, format, quality,
  onWidthChange, onHeightChange, onPercentageChange, onLockARToggle,
  onFormatChange, onQualityChange, onApplyPreset,
  onApplyAll, onDownloadAll, isProcessingAll, totalImages,
}: GlobalSettingsProps) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold text-foreground">Global Settings</p>
          <Badge variant="secondary" className="text-xs">Applied to all images</Badge>
        </div>
      </div>

      <div className="p-5">
        <Tabs defaultValue="resize">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="resize" className="text-xs">
              <Settings2 className="h-3.5 w-3.5 mr-1" />Resize
            </TabsTrigger>
            <TabsTrigger value="format" className="text-xs">
              <Layers className="h-3.5 w-3.5 mr-1" />Format
            </TabsTrigger>
            <TabsTrigger value="presets" className="text-xs">
              <RefreshCw className="h-3.5 w-3.5 mr-1" />Presets
            </TabsTrigger>
          </TabsList>

          {/* Resize Tab */}
          <TabsContent value="resize" className="mt-4 space-y-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">Dimensions</p>
                <button
                  onClick={onLockARToggle}
                  className={cn(
                    'flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors',
                    lockAR
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  )}
                >
                  {lockAR ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                  {lockAR ? 'Locked' : 'Unlocked'}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Width (px)</Label>
                  <Input
                    type="number"
                    value={width || ''}
                    onChange={(e) => onWidthChange(e.target.value)}
                    min={1}
                    className="h-9 text-sm"
                    placeholder="Width"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Height (px)</Label>
                  <Input
                    type="number"
                    value={height || ''}
                    onChange={(e) => onHeightChange(e.target.value)}
                    min={1}
                    className="h-9 text-sm"
                    placeholder="Height"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Scale by Percentage</Label>
                  <span className="text-sm font-semibold text-primary">{percentage}%</span>
                </div>
                <Slider
                  value={[percentage]}
                  onValueChange={([v]) => onPercentageChange(v)}
                  min={1}
                  max={200}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1%</span><span>100%</span><span>200%</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {[25, 50, 75, 100, 150, 200].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => onPercentageChange(pct)}
                    className={cn(
                      'flex-1 min-w-10 rounded-md border py-1.5 text-xs font-medium transition-colors',
                      percentage === pct
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-background text-muted-foreground hover:border-primary/50'
                    )}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Format Tab */}
          <TabsContent value="format" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(FORMAT_LABELS) as OutputFormat[]).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => onFormatChange(fmt)}
                  className={cn(
                    'rounded-xl border p-3 text-left transition-colors',
                    format === fmt
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-background hover:border-primary/40'
                  )}
                >
                  <p className={cn('text-sm font-bold', format === fmt ? 'text-primary' : 'text-foreground')}>
                    {FORMAT_LABELS[fmt]}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{FORMAT_DESC[fmt]}</p>
                </button>
              ))}
            </div>
            {(format === 'image/jpeg' || format === 'image/webp') && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Quality</Label>
                  <span className="text-sm font-semibold text-primary">{quality}%</span>
                </div>
                <Slider
                  value={[quality]}
                  onValueChange={([v]) => onQualityChange(v)}
                  min={10}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Low</span><span>Medium</span><span>Max</span>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Presets Tab */}
          <TabsContent value="presets" className="mt-4">
            <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
              {SIZE_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => onApplyPreset(preset.width, preset.height)}
                  className={cn(
                    'flex items-center justify-between rounded-lg border p-3 text-left transition-colors',
                    width === preset.width && height === preset.height
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-background hover:border-primary/40'
                  )}
                >
                  <span className={cn('text-sm font-medium', width === preset.width && height === preset.height ? 'text-primary' : 'text-foreground')}>
                    {preset.label}
                  </span>
                  <span className="text-xs text-muted-foreground">{preset.width} × {preset.height}</span>
                </button>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Bulk action buttons */}
        <div className="mt-5 flex gap-2">
          <Button
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
            onClick={onApplyAll}
            disabled={isProcessingAll || totalImages === 0}
          >
            {isProcessingAll
              ? <><RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" />Processing...</>
              : <><Settings2 className="mr-1.5 h-3.5 w-3.5" />Apply to All ({totalImages})</>
            }
          </Button>
          <Button
            variant="outline"
            className="flex-1 text-xs"
            onClick={onDownloadAll}
            disabled={isProcessingAll || totalImages === 0}
          >
            <DownloadCloud className="mr-1.5 h-3.5 w-3.5" />Download All
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Per-Image Settings Panel ─────────────────────────────────────────────────

interface PerImageSettingsProps {
  item: ImageItem
  globalFormat: OutputFormat
  globalQuality: number
  onUpdate: (id: string, patch: Partial<ImageItem>) => void
  onProcess: (id: string) => void
  onDownload: (id: string) => void
  onRemove: (id: string) => void
}

function PerImageSettings({
  item, globalFormat, globalQuality,
  onUpdate, onProcess, onDownload, onRemove,
}: PerImageSettingsProps) {
  const effectiveFormat = item.overrideFormat ?? globalFormat
  const effectiveQuality = item.overrideQuality ?? globalQuality

  const handleWidthChange = (val: string) => {
    const w = parseInt(val) || 0
    const patch: Partial<ImageItem> = { overrideW: w }
    const lock = item.overrideLockAR ?? true
    if (lock && item.originalW > 0) {
      patch.overrideH = Math.round((w / item.originalW) * item.originalH)
      patch.overridePercentage = Math.round((w / item.originalW) * 100)
    }
    onUpdate(item.id, patch)
  }

  const handleHeightChange = (val: string) => {
    const h = parseInt(val) || 0
    const patch: Partial<ImageItem> = { overrideH: h }
    const lock = item.overrideLockAR ?? true
    if (lock && item.originalH > 0) {
      patch.overrideW = Math.round((h / item.originalH) * item.originalW)
      patch.overridePercentage = Math.round((h / item.originalH) * 100)
    }
    onUpdate(item.id, patch)
  }

  const handlePctChange = (pct: number) => {
    onUpdate(item.id, {
      overridePercentage: pct,
      overrideW: Math.round((item.originalW * pct) / 100),
      overrideH: Math.round((item.originalH * pct) / 100),
    })
  }

  const handlePreset = (w: number, h: number) => {
    onUpdate(item.id, { overrideW: w, overrideH: h, overridePercentage: Math.round((w / item.originalW) * 100) })
  }

  const lockAR = item.overrideLockAR ?? true
  const pct = item.overridePercentage ?? 100
  const w = item.overrideW ?? item.originalW
  const h = item.overrideH ?? item.originalH

  return (
    <div className="border-t border-border bg-background/60 px-4 pb-4 pt-4">
      <Tabs defaultValue="resize">
        <TabsList className="grid w-full grid-cols-3 h-8">
          <TabsTrigger value="resize" className="text-xs h-full">Resize</TabsTrigger>
          <TabsTrigger value="format" className="text-xs h-full">Format</TabsTrigger>
          <TabsTrigger value="presets" className="text-xs h-full">Presets</TabsTrigger>
        </TabsList>

        {/* Resize */}
        <TabsContent value="resize" className="mt-3 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Dimensions</p>
            <button
              onClick={() => onUpdate(item.id, { overrideLockAR: !lockAR })}
              className={cn(
                'flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium transition-colors',
                lockAR ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
              )}
            >
              {lockAR ? <Lock className="h-2.5 w-2.5" /> : <Unlock className="h-2.5 w-2.5" />}
              {lockAR ? 'Locked' : 'Unlocked'}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">W (px)</Label>
              <Input type="number" value={w || ''} onChange={(e) => handleWidthChange(e.target.value)} min={1} className="h-8 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">H (px)</Label>
              <Input type="number" value={h || ''} onChange={(e) => handleHeightChange(e.target.value)} min={1} className="h-8 text-xs" />
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Scale</span>
              <span className="font-semibold text-primary">{pct}%</span>
            </div>
            <Slider value={[pct]} onValueChange={([v]) => handlePctChange(v)} min={1} max={200} step={1} />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[25, 50, 75, 100, 150, 200].map((p) => (
              <button
                key={p}
                onClick={() => handlePctChange(p)}
                className={cn(
                  'flex-1 min-w-8 rounded border py-1 text-xs font-medium transition-colors',
                  pct === p ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/50'
                )}
              >
                {p}%
              </button>
            ))}
          </div>
          <button
            onClick={() => onUpdate(item.id, { overrideW: null, overrideH: null, overridePercentage: null })}
            className="w-full flex items-center justify-center gap-1 rounded-md border border-border py-1.5 text-xs text-muted-foreground hover:border-primary/40 transition-colors"
          >
            <RotateCcw className="h-3 w-3" /> Reset to original size
          </button>
        </TabsContent>

        {/* Format */}
        <TabsContent value="format" className="mt-3 space-y-3">
          <div className="grid grid-cols-2 gap-1.5">
            {(Object.keys(FORMAT_LABELS) as OutputFormat[]).map((fmt) => (
              <button
                key={fmt}
                onClick={() => onUpdate(item.id, { overrideFormat: fmt })}
                className={cn(
                  'rounded-lg border p-2 text-left transition-colors',
                  effectiveFormat === fmt && item.overrideFormat === fmt
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-background hover:border-primary/40'
                )}
              >
                <p className={cn('text-xs font-bold', effectiveFormat === fmt && item.overrideFormat === fmt ? 'text-primary' : 'text-foreground')}>
                  {FORMAT_LABELS[fmt]}
                </p>
              </button>
            ))}
          </div>
          {item.overrideFormat && (
            <button
              onClick={() => onUpdate(item.id, { overrideFormat: null })}
              className="w-full flex items-center justify-center gap-1 rounded-md border border-border py-1.5 text-xs text-muted-foreground hover:border-primary/40 transition-colors"
            >
              <RotateCcw className="h-3 w-3" /> Use global format ({FORMAT_LABELS[globalFormat]})
            </button>
          )}
          {(effectiveFormat === 'image/jpeg' || effectiveFormat === 'image/webp') && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Quality</span>
                <span className="font-semibold text-primary">{effectiveQuality}%</span>
              </div>
              <Slider
                value={[effectiveQuality]}
                onValueChange={([v]) => onUpdate(item.id, { overrideQuality: v })}
                min={10} max={100} step={1}
              />
            </div>
          )}
        </TabsContent>

        {/* Presets */}
        <TabsContent value="presets" className="mt-3">
          <div className="flex flex-col gap-1.5 max-h-44 overflow-y-auto pr-1">
            {SIZE_PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => handlePreset(preset.width, preset.height)}
                className={cn(
                  'flex items-center justify-between rounded-lg border p-2 text-left transition-colors',
                  w === preset.width && h === preset.height
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-background hover:border-primary/40'
                )}
              >
                <span className={cn('text-xs font-medium', w === preset.width && h === preset.height ? 'text-primary' : 'text-foreground')}>
                  {preset.label}
                </span>
                <span className="text-xs text-muted-foreground">{preset.width} × {preset.height}</span>
              </button>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Per-image actions */}
      <div className="mt-3 flex gap-2">
        <Button
          size="sm"
          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 text-xs h-8"
          onClick={() => onProcess(item.id)}
          disabled={item.status === 'processing'}
        >
          {item.status === 'processing'
            ? <><RefreshCw className="mr-1 h-3 w-3 animate-spin" />Processing...</>
            : <><Settings2 className="mr-1 h-3 w-3" />Apply &amp; Preview</>
          }
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1 text-xs h-8"
          onClick={() => onDownload(item.id)}
          disabled={item.status === 'processing'}
        >
          <Download className="mr-1 h-3 w-3" />Download
        </Button>
      </div>
    </div>
  )
}

// ─── Image Card ───────────────────────────────────────────────────────────────

interface ImageCardProps {
  item: ImageItem
  index: number
  globalFormat: OutputFormat
  globalQuality: number
  onUpdate: (id: string, patch: Partial<ImageItem>) => void
  onProcess: (id: string) => void
  onDownload: (id: string) => void
  onRemove: (id: string) => void
}

function ImageCard({ item, index, globalFormat, globalQuality, onUpdate, onProcess, onDownload, onRemove }: ImageCardProps) {
  const effectiveFormat = item.overrideFormat ?? globalFormat
  const effectiveW = item.overrideW ?? item.originalW
  const effectiveH = item.overrideH ?? item.originalH

  const statusColor = {
    idle: 'bg-muted text-muted-foreground',
    processing: 'bg-primary/10 text-primary',
    done: 'bg-green-50 text-green-700',
    error: 'bg-red-50 text-red-600',
  }[item.status]

  const statusLabel = {
    idle: 'Ready',
    processing: 'Processing...',
    done: 'Done',
    error: 'Error',
  }[item.status]

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      {/* Card header */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Thumbnail */}
        <div
          className="h-12 w-12 flex-shrink-0 rounded-lg overflow-hidden border border-border"
          style={{
            backgroundImage: 'repeating-conic-gradient(#e5e7eb 0% 25%, #f9fafb 0% 50%)',
            backgroundSize: '10px 10px',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.src} alt={item.file.name} className="h-full w-full object-cover" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{item.file.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {item.originalW} × {item.originalH}px &middot; {formatBytes(item.file.size)}
            {item.status === 'done' && item.outputSize !== null && (
              <span className="text-green-600 ml-1">
                &rarr; {effectiveW} × {effectiveH}px &middot; {formatBytes(item.outputSize)} ({FORMAT_LABELS[effectiveFormat]})
              </span>
            )}
          </p>
        </div>

        {/* Status badge */}
        <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap', statusColor)}>
          {item.status === 'processing' ? (
            <span className="flex items-center gap-1"><RefreshCw className="h-3 w-3 animate-spin" />{statusLabel}</span>
          ) : item.status === 'done' ? (
            <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />{statusLabel}</span>
          ) : statusLabel}
        </span>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {item.status === 'done' && (
            <button
              onClick={() => onDownload(item.id)}
              className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              title="Download"
            >
              <Download className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            onClick={() => onRemove(item.id)}
            className="p-1.5 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Remove"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onUpdate(item.id, { expanded: !item.expanded })}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title={item.expanded ? 'Collapse' : 'Expand settings'}
          >
            {item.expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Editable SEO filename */}
      <div className="px-4 pb-3 flex items-center gap-2">
        <Label className="text-xs text-muted-foreground shrink-0">Filename:</Label>
        <Input
          value={item.customName}
          onChange={(e) => onUpdate(item.id, { customName: e.target.value })}
          className="h-7 text-xs font-mono"
          placeholder="image-800x600.webp"
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Output preview when done */}
      {item.status === 'done' && item.outputUrl && (
        <div className="px-4 pb-3">
          <div
            className="rounded-lg overflow-hidden border border-border flex items-center justify-center max-h-32"
            style={{
              backgroundImage: 'repeating-conic-gradient(#e5e7eb 0% 25%, #f9fafb 0% 50%)',
              backgroundSize: '10px 10px',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.outputUrl} alt="Output" className="max-h-32 max-w-full object-contain" />
          </div>
        </div>
      )}

      {/* Expandable per-image settings */}
      {item.expanded && (
        <PerImageSettings
          item={item}
          globalFormat={globalFormat}
          globalQuality={globalQuality}
          onUpdate={onUpdate}
          onProcess={onProcess}
          onDownload={onDownload}
          onRemove={onRemove}
        />
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BulkImageResizerTool() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [images, setImages] = useState<ImageItem[]>([])

  // Global settings
  const [globalWidth, setGlobalWidth] = useState(1280)
  const [globalHeight, setGlobalHeight] = useState(720)
  const [globalPercentage, setGlobalPercentage] = useState(100)
  const [globalLockAR, setGlobalLockAR] = useState(true)
  const [globalFormat, setGlobalFormat] = useState<OutputFormat>('image/webp')
  const [globalQuality, setGlobalQuality] = useState(92)
  const [isProcessingAll, setIsProcessingAll] = useState(false)

  // ── File loading ────────────────────────────────────────────────────────────

  const loadFiles = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith('image/'))
    if (!arr.length) return

    const newItems: ImageItem[] = []

    arr.forEach((file) => {
      const id = generateId()
      const reader = new FileReader()
      reader.onload = (e) => {
        const src = e.target?.result as string
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          setImages((prev) => [
            ...prev,
            {
              id,
              file,
              src,
              originalW: img.width,
              originalH: img.height,
              overrideW: null,
              overrideH: null,
              overridePercentage: null,
              overrideLockAR: null,
              overrideFormat: null,
              overrideQuality: null,
              outputUrl: null,
              outputSize: null,
              outputW: img.width,
              outputH: img.height,
              status: 'idle',
              expanded: false,
              customName: buildSeoFilename(file.name, img.width, img.height, 'image/webp'),
            },
          ])
        }
        img.src = src
      }
      reader.readAsDataURL(file)
    })
  }, [])

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) loadFiles(e.target.files)
    e.target.value = ''
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files) loadFiles(e.dataTransfer.files)
  }

  // ── Per-image update ────────────────────────────────────────────────────────

  const updateImage = useCallback((id: string, patch: Partial<ImageItem>) => {
    setImages((prev) => prev.map((img) => img.id === id ? { ...img, ...patch } : img))
  }, [])

  const removeImage = useCallback((id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id))
  }, [])

  // ── Processing ──────────────────────────────────────────────────────────────

  const processOne = useCallback(async (id: string, download = false) => {
    setImages((prev) => prev.map((img) => img.id === id ? { ...img, status: 'processing' } : img))

    const item = images.find((img) => img.id === id)
    if (!item) return

    const targetW = item.overrideW ?? Math.round((item.originalW * globalPercentage) / 100)
    const targetH = item.overrideH ?? Math.round((item.originalH * globalPercentage) / 100)
    const fmt = item.overrideFormat ?? globalFormat
    const qual = item.overrideQuality ?? globalQuality

    try {
      const { blob, url } = await resizeOnCanvas(item.src, targetW, targetH, fmt, qual)
      setImages((prev) =>
        prev.map((img) =>
          img.id === id
            ? { ...img, status: 'done', outputUrl: url, outputSize: blob.size, outputW: targetW, outputH: targetH }
            : img
        )
      )
      if (download) {
        const a = document.createElement('a')
        a.href = url
        a.download = item.customName || buildSeoFilename(item.file.name, targetW, targetH, fmt)
        a.click()
      }
    } catch {
      setImages((prev) => prev.map((img) => img.id === id ? { ...img, status: 'error' } : img))
    }
  }, [images, globalFormat, globalQuality, globalPercentage])

  const downloadOne = useCallback(async (id: string) => {
    const item = images.find((img) => img.id === id)
    if (!item) return

    if (item.outputUrl) {
      const fmt = item.overrideFormat ?? globalFormat
      const a = document.createElement('a')
      a.href = item.outputUrl
      a.download = item.customName || buildSeoFilename(item.file.name, item.outputW, item.outputH, fmt)
      a.click()
    } else {
      await processOne(id, true)
    }
  }, [images, globalFormat, processOne])

  const processAll = useCallback(async (download = false) => {
    setIsProcessingAll(true)
    for (const item of images) {
      const targetW = item.overrideW ?? Math.round((item.originalW * globalPercentage) / 100)
      const targetH = item.overrideH ?? Math.round((item.originalH * globalPercentage) / 100)
      const fmt = item.overrideFormat ?? globalFormat
      const qual = item.overrideQuality ?? globalQuality

      setImages((prev) => prev.map((img) => img.id === item.id ? { ...img, status: 'processing' } : img))
      try {
        const { blob, url } = await resizeOnCanvas(item.src, targetW, targetH, fmt, qual)
        setImages((prev) =>
          prev.map((img) =>
            img.id === item.id
              ? { ...img, status: 'done', outputUrl: url, outputSize: blob.size, outputW: targetW, outputH: targetH }
              : img
          )
        )
        if (download) {
          const a = document.createElement('a')
          a.href = url
          a.download = item.customName || buildSeoFilename(item.file.name, targetW, targetH, fmt)
          a.click()
          await new Promise((r) => setTimeout(r, 200))
        }
      } catch {
        setImages((prev) => prev.map((img) => img.id === item.id ? { ...img, status: 'error' } : img))
      }
    }
    setIsProcessingAll(false)
  }, [images, globalFormat, globalQuality, globalPercentage])

  // ── Global dimension handlers ────────────────────────────────────────────────

  const handleGlobalWidthChange = (val: string) => {
    const w = parseInt(val) || 0
    setGlobalWidth(w)
    if (globalLockAR && globalWidth > 0) {
      setGlobalHeight(Math.round((w / globalWidth) * globalHeight))
    }
  }

  const handleGlobalHeightChange = (val: string) => {
    const h = parseInt(val) || 0
    setGlobalHeight(h)
    if (globalLockAR && globalHeight > 0) {
      setGlobalWidth(Math.round((h / globalHeight) * globalWidth))
    }
  }

  const handleGlobalPctChange = (pct: number) => {
    setGlobalPercentage(pct)
  }

  const handleGlobalPreset = (w: number, h: number) => {
    setGlobalWidth(w)
    setGlobalHeight(h)
    setGlobalPercentage(100)
  }

  // ── Stats ────────────────────────────────────────────────────────────────────

  const doneCount = images.filter((i) => i.status === 'done').length
  const totalSaved = images
    .filter((i) => i.status === 'done' && i.outputSize !== null)
    .reduce((acc, i) => acc + (i.file.size - (i.outputSize ?? 0)), 0)

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary" className="text-xs">Free Tool</Badge>
          <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-0">Browser-based</Badge>
          <Badge variant="secondary" className="text-xs bg-green-50 text-green-700 border-0">Unlimited Images</Badge>
        </div>
        <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl text-balance">
          Bulk Image Resizer &amp; Converter
        </h1>
        <p className="mt-2 text-muted-foreground text-pretty">
          Resize and convert unlimited images at once with global settings, or fine-tune each image individually — 100% client-side, files never leave your device.
        </p>
      </div>

      {/* Upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'flex min-h-44 cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed transition-colors mb-8',
          isDragging
            ? 'border-primary bg-primary/5 text-primary'
            : images.length > 0
              ? 'border-border bg-card/50 text-muted-foreground hover:border-primary/50 hover:bg-primary/5'
              : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:bg-primary/5'
        )}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
          <Images className="h-7 w-7 text-muted-foreground" />
        </div>
        <div className="text-center">
          <p className="font-semibold text-foreground">
            {images.length > 0 ? 'Drop more images to add them' : 'Drop images here'}
          </p>
          <p className="mt-1 text-sm">or click to browse — PNG, JPEG, WebP, GIF supported &middot; unlimited files</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          multiple
          onChange={onFileChange}
        />
      </div>

      {images.length > 0 && (
        <>
          {/* Stats bar */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm">
              <ImageIcon className="h-4 w-4 text-primary" />
              <span className="font-medium text-foreground">{images.length}</span>
              <span className="text-muted-foreground">image{images.length !== 1 ? 's' : ''} loaded</span>
            </div>
            {doneCount > 0 && (
              <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-700">{doneCount} processed</span>
                {totalSaved > 0 && (
                  <span className="text-green-600">&middot; {formatBytes(totalSaved)} saved</span>
                )}
              </div>
            )}
            <button
              onClick={() => setImages([])}
              className="ml-auto flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-muted-foreground hover:border-red-200 hover:text-red-500 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear all
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-5">
            {/* Left: Image list */}
            <div className="lg:col-span-3 flex flex-col gap-3">
              {images.map((item, index) => (
                <ImageCard
                  key={item.id}
                  item={item}
                  index={index}
                  globalFormat={globalFormat}
                  globalQuality={globalQuality}
                  onUpdate={updateImage}
                  onProcess={(id) => processOne(id, false)}
                  onDownload={downloadOne}
                  onRemove={removeImage}
                />
              ))}
            </div>

            {/* Right: Global settings (sticky) */}
            <div className="lg:col-span-2">
              <div className="sticky top-20">
                <GlobalSettings
                  width={globalWidth}
                  height={globalHeight}
                  percentage={globalPercentage}
                  lockAR={globalLockAR}
                  format={globalFormat}
                  quality={globalQuality}
                  onWidthChange={handleGlobalWidthChange}
                  onHeightChange={handleGlobalHeightChange}
                  onPercentageChange={handleGlobalPctChange}
                  onLockARToggle={() => setGlobalLockAR((v) => !v)}
                  onFormatChange={setGlobalFormat}
                  onQualityChange={setGlobalQuality}
                  onApplyPreset={handleGlobalPreset}
                  onApplyAll={() => processAll(false)}
                  onDownloadAll={() => processAll(true)}
                  isProcessingAll={isProcessingAll}
                  totalImages={images.length}
                />

                {/* Help note */}
                <div className="mt-4 rounded-xl border border-border bg-card p-4 text-xs text-muted-foreground space-y-1.5">
                  <p className="font-medium text-foreground">How it works</p>
                  <p>Global settings apply to all images. Click the <span className="font-medium text-foreground">arrow</span> on any image card to override settings individually.</p>
                  <p>Individual format or size overrides take priority over global settings.</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
