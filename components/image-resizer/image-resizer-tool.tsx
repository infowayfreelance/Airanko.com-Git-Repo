'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import {
  Upload,
  Download,
  RotateCcw,
  Lock,
  Unlock,
  ImageIcon,
  Crop as CropIcon,
  Settings2,
  Layers,
  RefreshCw,
  CheckCircle2,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type OutputFormat = 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif'

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

const ASPECT_RATIOS = [
  { label: 'Free', value: null },
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '16:9', value: 16 / 9 },
  { label: '3:2', value: 3 / 2 },
  { label: '9:16', value: 9 / 16 },
  { label: '2:3', value: 2 / 3 },
  { label: '21:9', value: 21 / 9 },
]

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

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number): Crop {
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  )
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(2)} MB`
}

export default function ImageResizerTool() {
  const [imgSrc, setImgSrc] = useState<string | null>(null)
  const [originalFile, setOriginalFile] = useState<File | null>(null)
  const [originalDimensions, setOriginalDimensions] = useState({ w: 0, h: 0 })
  const [isDragging, setIsDragging] = useState(false)

  // Resize state
  const [resizeWidth, setResizeWidth] = useState(0)
  const [resizeHeight, setResizeHeight] = useState(0)
  const [lockAR, setLockAR] = useState(true)
  const [percentage, setPercentage] = useState(100)

  // Crop state
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<Crop>()
  const [cropAspect, setCropAspect] = useState<number | undefined>(undefined)

  // Format & quality
  const [format, setFormat] = useState<OutputFormat>('image/webp')
  const [quality, setQuality] = useState(92)

  // Preview
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewSize, setPreviewSize] = useState<number>(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processed, setProcessed] = useState(false)

  const imgRef = useRef<HTMLImageElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return
    setOriginalFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      const src = e.target?.result as string
      setImgSrc(src)
      setPreviewUrl(null)
      setProcessed(false)
      setCompletedCrop(undefined)
      setCrop(undefined)
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        setOriginalDimensions({ w: img.width, h: img.height })
        setResizeWidth(img.width)
        setResizeHeight(img.height)
        setPercentage(100)
      }
      img.src = src
    }
    reader.readAsDataURL(file)
  }, [])

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) loadFile(file)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) loadFile(file)
  }

  const handleWidthChange = (val: string) => {
    const w = parseInt(val) || 0
    setResizeWidth(w)
    if (lockAR && originalDimensions.w > 0) {
      setResizeHeight(Math.round((w / originalDimensions.w) * originalDimensions.h))
      setPercentage(Math.round((w / originalDimensions.w) * 100))
    }
  }

  const handleHeightChange = (val: string) => {
    const h = parseInt(val) || 0
    setResizeHeight(h)
    if (lockAR && originalDimensions.h > 0) {
      setResizeWidth(Math.round((h / originalDimensions.h) * originalDimensions.w))
      setPercentage(Math.round((h / originalDimensions.h) * 100))
    }
  }

  const handlePercentageChange = (pct: number) => {
    setPercentage(pct)
    if (originalDimensions.w > 0) {
      setResizeWidth(Math.round((originalDimensions.w * pct) / 100))
      setResizeHeight(Math.round((originalDimensions.h * pct) / 100))
    }
  }

  const applyPreset = (width: number, height: number) => {
    setResizeWidth(width)
    setResizeHeight(height)
    if (originalDimensions.w > 0) {
      setPercentage(Math.round((width / originalDimensions.w) * 100))
    }
  }

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (cropAspect) {
      const { width, height } = e.currentTarget
      setCrop(centerAspectCrop(width, height, cropAspect))
    }
  }

  const handleCropAspectChange = (val: string) => {
    const ratio = val === 'null' ? undefined : parseFloat(val)
    setCropAspect(ratio)
    if (ratio && imgRef.current) {
      const { width, height } = imgRef.current
      setCrop(centerAspectCrop(width, height, ratio))
    } else {
      setCrop(undefined)
    }
  }

  const processImage = useCallback(async (download = false) => {
    if (!imgSrc) return
    setIsProcessing(true)

    await new Promise<void>((resolve) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) { resolve(); return }

        let sx = 0, sy = 0, sw = img.width, sh = img.height
        let dw = resizeWidth || img.width
        let dh = resizeHeight || img.height

        // Apply crop if set
        if (completedCrop && imgRef.current) {
          const scaleX = img.width / imgRef.current.width
          const scaleY = img.height / imgRef.current.height
          if (completedCrop.unit === '%') {
            sx = (completedCrop.x / 100) * img.width
            sy = (completedCrop.y / 100) * img.height
            sw = (completedCrop.width / 100) * img.width
            sh = (completedCrop.height / 100) * img.height
          } else {
            sx = completedCrop.x * scaleX
            sy = completedCrop.y * scaleY
            sw = completedCrop.width * scaleX
            sh = completedCrop.height * scaleY
          }
          if (!resizeWidth) { dw = sw; dh = sh }
        }

        canvas.width = dw
        canvas.height = dh

        if (format === 'image/jpeg') {
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, dw, dh)
        }

        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, dw, dh)

        const q = ['image/jpeg', 'image/webp'].includes(format) ? quality / 100 : undefined
        canvas.toBlob(
          (blob) => {
            if (!blob) { resolve(); return }
            setPreviewSize(blob.size)
            const url = URL.createObjectURL(blob)
            setPreviewUrl(url)
            setProcessed(true)

            if (download) {
              const baseName = originalFile?.name.replace(/\.[^/.]+$/, '') ?? 'image'
              const a = document.createElement('a')
              a.href = url
              a.download = `${baseName}-airanko.${FORMAT_EXT[format]}`
              a.click()
            }
            resolve()
          },
          format,
          q
        )
      }
      img.src = imgSrc
    })

    setIsProcessing(false)
  }, [imgSrc, resizeWidth, resizeHeight, completedCrop, format, quality, originalFile, imgRef])

  const reset = () => {
    setImgSrc(null)
    setOriginalFile(null)
    setPreviewUrl(null)
    setProcessed(false)
    setCrop(undefined)
    setCompletedCrop(undefined)
    setOriginalDimensions({ w: 0, h: 0 })
    setResizeWidth(0)
    setResizeHeight(0)
    setPercentage(100)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary" className="text-xs">Free Tool</Badge>
          <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-0">Browser-based</Badge>
        </div>
        <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl text-balance">
          Image Resizer &amp; Converter
        </h1>
        <p className="mt-2 text-muted-foreground text-pretty">
          Resize, crop, convert and optimize images — 100% client-side, your files never leave your device.
        </p>
      </div>

      {/* Upload zone */}
      {!imgSrc ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'flex min-h-64 cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed transition-colors',
            isDragging
              ? 'border-primary bg-primary/5 text-primary'
              : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:bg-primary/5'
          )}
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <Upload className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-foreground">Drop your image here</p>
            <p className="mt-1 text-sm">or click to browse — PNG, JPEG, WebP, GIF, BMP supported</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={onFileChange}
          />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Left: Image preview */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            {/* File info */}
            <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <ImageIcon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground truncate max-w-48">{originalFile?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {originalDimensions.w} × {originalDimensions.h}px &middot; {formatBytes(originalFile?.size ?? 0)}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={reset} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4 mr-1" /> Remove
              </Button>
            </div>

            {/* Crop editor */}
            <div className="rounded-2xl border border-border bg-card p-4 overflow-auto">
              <p className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-1.5">
                <CropIcon className="h-3.5 w-3.5" /> Drag to crop — adjust handles to define the crop area
              </p>
              <div className="flex justify-center">
                <ReactCrop
                  crop={crop}
                  onChange={(c) => setCrop(c)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={cropAspect}
                  className="max-h-[420px] max-w-full"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    ref={imgRef}
                    src={imgSrc}
                    alt="Upload preview"
                    onLoad={onImageLoad}
                    className="max-h-[420px] max-w-full object-contain"
                    crossOrigin="anonymous"
                  />
                </ReactCrop>
              </div>
              {completedCrop && (
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  Crop: {Math.round(completedCrop.width)}{completedCrop.unit} × {Math.round(completedCrop.height)}{completedCrop.unit}
                </p>
              )}
            </div>

            {/* Output preview */}
            {previewUrl && processed && (
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" /> Output Preview
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    {FORMAT_LABELS[format]} &middot; {formatBytes(previewSize)}
                  </Badge>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Processed output"
                  className="mx-auto max-h-64 max-w-full rounded-lg object-contain"
                />
              </div>
            )}
          </div>

          {/* Right: Controls */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Tabs defaultValue="resize">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="resize" className="text-xs">
                  <Settings2 className="h-3.5 w-3.5 mr-1" />Resize
                </TabsTrigger>
                <TabsTrigger value="crop" className="text-xs">
                  <CropIcon className="h-3.5 w-3.5 mr-1" />Crop
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
                <div className="rounded-xl border border-border bg-card p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">Dimensions</p>
                    <button
                      onClick={() => setLockAR(!lockAR)}
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
                        value={resizeWidth || ''}
                        onChange={(e) => handleWidthChange(e.target.value)}
                        min={1}
                        className="h-9 text-sm"
                        placeholder="Width"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Height (px)</Label>
                      <Input
                        type="number"
                        value={resizeHeight || ''}
                        onChange={(e) => handleHeightChange(e.target.value)}
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
                      onValueChange={([v]) => handlePercentageChange(v)}
                      min={1}
                      max={200}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>1%</span><span>100%</span><span>200%</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {[25, 50, 75, 100].map((pct) => (
                      <button
                        key={pct}
                        onClick={() => handlePercentageChange(pct)}
                        className={cn(
                          'flex-1 rounded-md border py-1.5 text-xs font-medium transition-colors',
                          percentage === pct
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-background text-muted-foreground hover:border-primary/50'
                        )}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    {[150, 200].map((pct) => (
                      <button
                        key={pct}
                        onClick={() => handlePercentageChange(pct)}
                        className={cn(
                          'flex-1 rounded-md border py-1.5 text-xs font-medium transition-colors',
                          percentage === pct
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-background text-muted-foreground hover:border-primary/50'
                        )}
                      >
                        {pct}%
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        setResizeWidth(originalDimensions.w)
                        setResizeHeight(originalDimensions.h)
                        setPercentage(100)
                      }}
                      className="flex-1 rounded-md border border-border bg-background py-1.5 text-xs font-medium text-muted-foreground hover:border-primary/50 transition-colors flex items-center justify-center gap-1"
                    >
                      <RotateCcw className="h-3 w-3" /> Reset
                    </button>
                  </div>
                </div>
              </TabsContent>

              {/* Crop Tab */}
              <TabsContent value="crop" className="mt-4 space-y-4">
                <div className="rounded-xl border border-border bg-card p-4 space-y-4">
                  <p className="text-sm font-semibold text-foreground">Aspect Ratio</p>
                  <div className="grid grid-cols-4 gap-2">
                    {ASPECT_RATIOS.map((ar) => (
                      <button
                        key={ar.label}
                        onClick={() => handleCropAspectChange(String(ar.value))}
                        className={cn(
                          'rounded-lg border py-2 text-xs font-medium transition-colors',
                          cropAspect === (ar.value ?? undefined)
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-background text-muted-foreground hover:border-primary/50'
                        )}
                      >
                        {ar.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Draw a crop selection directly on the image on the left. The aspect ratio setting constrains the crop shape. Leave empty for a free crop.
                  </p>
                  {completedCrop && (
                    <button
                      onClick={() => { setCrop(undefined); setCompletedCrop(undefined) }}
                      className="w-full rounded-lg border border-border py-2 text-xs font-medium text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors flex items-center justify-center gap-1.5"
                    >
                      <X className="h-3.5 w-3.5" /> Clear Crop Selection
                    </button>
                  )}
                </div>
              </TabsContent>

              {/* Format Tab */}
              <TabsContent value="format" className="mt-4 space-y-4">
                <div className="rounded-xl border border-border bg-card p-4 space-y-4">
                  <p className="text-sm font-semibold text-foreground">Output Format</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(FORMAT_LABELS) as OutputFormat[]).map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => setFormat(fmt)}
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
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {fmt === 'image/webp' && 'Best for web — small size, great quality'}
                          {fmt === 'image/png' && 'Lossless — great for graphics & transparency'}
                          {fmt === 'image/jpeg' && 'Universal — best for photos'}
                          {fmt === 'image/gif' && 'Animated & legacy compatibility'}
                        </p>
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
                        onValueChange={([v]) => setQuality(v)}
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
                </div>
              </TabsContent>

              {/* Presets Tab */}
              <TabsContent value="presets" className="mt-4 space-y-4">
                <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                  <p className="text-sm font-semibold text-foreground">Common Size Presets</p>
                  <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
                    {SIZE_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        onClick={() => applyPreset(preset.width, preset.height)}
                        className={cn(
                          'flex items-center justify-between rounded-lg border p-3 text-left transition-colors',
                          resizeWidth === preset.width && resizeHeight === preset.height
                            ? 'border-primary bg-primary/10'
                            : 'border-border bg-background hover:border-primary/40'
                        )}
                      >
                        <span className={cn(
                          'text-sm font-medium',
                          resizeWidth === preset.width && resizeHeight === preset.height
                            ? 'text-primary'
                            : 'text-foreground'
                        )}>
                          {preset.label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {preset.width} × {preset.height}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Action buttons */}
            <div className="space-y-3">
              <div className="rounded-xl border border-border bg-card p-3 text-xs text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>Output size</span>
                  <span className="font-medium text-foreground">{resizeWidth} × {resizeHeight}px</span>
                </div>
                <div className="flex justify-between">
                  <span>Format</span>
                  <span className="font-medium text-foreground">{FORMAT_LABELS[format]}</span>
                </div>
                {completedCrop && (
                  <div className="flex justify-between">
                    <span>Crop</span>
                    <span className="font-medium text-green-600">Active</span>
                  </div>
                )}
              </div>

              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => processImage(false)}
                disabled={isProcessing || !imgSrc}
              >
                {isProcessing ? (
                  <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                ) : (
                  <><Settings2 className="mr-2 h-4 w-4" /> Apply &amp; Preview</>
                )}
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => processImage(true)}
                disabled={isProcessing || !imgSrc}
              >
                <Download className="mr-2 h-4 w-4" /> Download {FORMAT_LABELS[format]}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
