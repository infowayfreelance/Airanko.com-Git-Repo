'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Upload,
  Download,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  X,
  Check,
  ZoomIn,
  Maximize2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Status = 'idle' | 'loading-model' | 'processing' | 'done' | 'error'
type Scale = 2 | 4
type OutputFormat = 'image/png' | 'image/jpeg' | 'image/webp'

const FORMAT_LABELS: Record<OutputFormat, string> = {
  'image/png': 'PNG',
  'image/jpeg': 'JPEG',
  'image/webp': 'WebP',
}
const FORMAT_EXT: Record<OutputFormat, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
}

// Swin2SR super-resolution models, ONNX-converted for in-browser inference.
const MODEL_BY_SCALE: Record<Scale, string> = {
  2: 'Xenova/swin2SR-classical-sr-x2-64',
  4: 'Xenova/swin2SR-classical-sr-x4-48',
}

// Swin2SR is compute-heavy — cap the input's longest side before inference so
// a 4x upscale of a large photo still finishes in a browser tab instead of
// stalling on WASM. The model then multiplies this back up by 2x/4x.
const MAX_INPUT_DIMENSION = 1024

function detectFormat(file: File): OutputFormat {
  if (file.type === 'image/webp') return 'image/webp'
  if (file.type === 'image/jpeg' || file.type === 'image/jpg') return 'image/jpeg'
  return 'image/png'
}

// @huggingface/transformers' RawImage.toCanvas() creates an OffscreenCanvas
// in the browser (see its createCanvasFunction), not an HTMLCanvasElement —
// only the plain <canvas> we create ourselves (e.g. inputCanvas) is one of
// those. OffscreenCanvas has convertToBlob() instead of toBlob(), so any
// canvas that might have come from the model's output needs both encode
// paths handled.
type ModelCanvas = HTMLCanvasElement | OffscreenCanvas

function encodeCanvasToBlob(canvas: ModelCanvas, type: OutputFormat, quality?: number): Promise<Blob> {
  if (typeof (canvas as OffscreenCanvas).convertToBlob === 'function') {
    return (canvas as OffscreenCanvas).convertToBlob({ type, quality })
  }
  return new Promise<Blob>((resolve, reject) => {
    ;(canvas as HTMLCanvasElement).toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Could not encode image'))),
      type,
      quality,
    )
  })
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(2)} MB`
}

function buildSeoFilename(rawName: string, w: number, h: number, fmt: OutputFormat): string {
  const slug = rawName.replace(/\.[^/.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'image'
  return `${slug}-upscaled-${w}x${h}.${FORMAT_EXT[fmt]}`
}

export default function AiImageUpscalerTool() {
  const [originalUrl, setOriginalUrl] = useState<string | null>(null)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [progress, setProgress] = useState(0)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>('image')
  const [isDragging, setIsDragging] = useState(false)
  const [scale, setScale] = useState<Scale>(2)
  const [format, setFormat] = useState<OutputFormat>('image/png')
  const [originalDims, setOriginalDims] = useState({ w: 0, h: 0 })
  const [resultDims, setResultDims] = useState({ w: 0, h: 0 })
  const [wasDownscaled, setWasDownscaled] = useState(false)
  const [sliderPos, setSliderPos] = useState(50)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const compareRef = useRef<HTMLDivElement>(null)
  const pendingFileRef = useRef<File | null>(null)

  // Latest object URLs, tracked in refs (not just state) so unmount cleanup
  // and "replace with a new blob" logic always see the current value instead
  // of whatever was captured by a stale closure.
  const originalUrlRef = useRef<string | null>(null)
  const resultUrlRef = useRef<string | null>(null)
  // The pristine upscaled pixels, kept around so switching output format
  // re-encodes from this master instead of re-compressing an already-lossy
  // JPEG/WebP blob (or worse, just relabeling it without re-encoding at all).
  const masterCanvasRef = useRef<ModelCanvas | null>(null)
  // Bumped on every new run/reset so a superseded upscale (e.g. the user
  // clicked "Try another image" while one was still in flight) can detect
  // it's stale and discard its result instead of overwriting newer state.
  const runIdRef = useRef(0)
  // Same superseded-run guard as runIdRef, but scoped to format re-encodes
  // (switching PNG -> JPEG -> WebP quickly shouldn't let an earlier, slower
  // encode overwrite a later one).
  const reencodeIdRef = useRef(0)
  const [isReencoding, setIsReencoding] = useState(false)

  function setOriginalUrlSafe(url: string | null) {
    if (originalUrlRef.current) URL.revokeObjectURL(originalUrlRef.current)
    originalUrlRef.current = url
    setOriginalUrl(url)
  }

  function setResultUrlSafe(url: string | null) {
    if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current)
    resultUrlRef.current = url
    setResultUrl(url)
  }

  const runUpscale = useCallback(async (file: File, targetScale: Scale, targetFormat: OutputFormat) => {
    const runId = ++runIdRef.current
    setErrorMsg(null)
    setResultUrlSafe(null)
    masterCanvasRef.current = null
    setProgress(0)
    setStatus('loading-model')

    try {
      // Lazy-load Transformers.js on the client only.
      const { pipeline, RawImage } = await import('@huggingface/transformers')

      // Decode + optionally downscale the source before inference.
      const sourceImg = new Image()
      sourceImg.crossOrigin = 'anonymous'
      const objectUrl = URL.createObjectURL(file)
      sourceImg.src = objectUrl
      await new Promise<void>((resolve, reject) => {
        sourceImg.onload = () => resolve()
        sourceImg.onerror = () => reject(new Error('Could not read this image file.'))
      })

      const longestSide = Math.max(sourceImg.naturalWidth, sourceImg.naturalHeight)
      const downscaleFactor = longestSide > MAX_INPUT_DIMENSION ? MAX_INPUT_DIMENSION / longestSide : 1
      const inputW = Math.round(sourceImg.naturalWidth * downscaleFactor)
      const inputH = Math.round(sourceImg.naturalHeight * downscaleFactor)
      if (runIdRef.current === runId) setWasDownscaled(downscaleFactor < 1)

      const inputCanvas = document.createElement('canvas')
      inputCanvas.width = inputW
      inputCanvas.height = inputH
      const inputCtx = inputCanvas.getContext('2d')
      if (!inputCtx) throw new Error('Canvas 2D context unavailable')
      inputCtx.drawImage(sourceImg, 0, 0, inputW, inputH)
      URL.revokeObjectURL(objectUrl)

      if (runIdRef.current !== runId) return // superseded before inference even started

      const inputBlob: Blob = await new Promise((resolve, reject) =>
        inputCanvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not prepare image'))), 'image/png'),
      )
      const inputImage = await RawImage.fromBlob(inputBlob)

      const modelId = MODEL_BY_SCALE[targetScale]
      const upscaler = await pipeline('image-to-image', modelId, {
        progress_callback: (data: { status?: string; progress?: number }) => {
          // Reserve 0-70% for model download, 70-100% for inference.
          if (runIdRef.current === runId && data?.status === 'progress_total' && typeof data.progress === 'number') {
            setProgress(Math.min(70, Math.round((data.progress / 100) * 70)))
          }
        },
      })

      if (runIdRef.current !== runId) return

      setStatus('processing')
      setProgress(80)

      const output = await upscaler(inputImage)

      if (runIdRef.current !== runId) return // a newer run started while inference was running

      setProgress(95)

      const canvas: ModelCanvas = output.toCanvas()
      const outputBlob = await encodeCanvasToBlob(canvas, targetFormat, targetFormat === 'image/png' ? undefined : 0.92)

      if (runIdRef.current !== runId) return // discard — a newer run superseded this one while encoding

      masterCanvasRef.current = canvas
      const resultObjectUrl = URL.createObjectURL(outputBlob)
      setResultUrlSafe(resultObjectUrl)
      setResultDims({ w: output.width, h: output.height })
      setFormat(targetFormat)
      setProgress(100)
      setStatus('done')
    } catch (err) {
      if (runIdRef.current !== runId) return // a newer run superseded this one — don't surface a stale error
      console.error('[v0] ai-image-upscaler error:', err)
      const raw = err instanceof Error ? err.message : String(err)
      const friendly = /failed to fetch|networkerror|load failed/i.test(raw)
        ? 'Could not download the AI model. Check your internet connection and try again.'
        : raw || 'Failed to upscale this image. Please try a different file.'
      setErrorMsg(friendly)
      setStatus('error')
    }
  }, [])

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please upload a valid image file (PNG, JPG, WebP).')
      setStatus('error')
      return
    }

    const detectedFormat = detectFormat(file)
    setFileName(file.name.replace(/\.[^/.]+$/, '') || 'image')
    setFormat(detectedFormat)
    pendingFileRef.current = file

    const previewImg = new Image()
    const objectUrl = URL.createObjectURL(file)
    previewImg.onload = () => {
      setOriginalDims({ w: previewImg.naturalWidth, h: previewImg.naturalHeight })
    }
    previewImg.src = objectUrl
    setOriginalUrlSafe(objectUrl)

    // `scale` is read fresh here (not from a memoized closure), so a scale
    // chosen for a previous image — and preserved across "Try another image"
    // — carries over correctly to the next upload.
    runUpscale(file, scale, detectedFormat)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scale, runUpscale])

  const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  function changeScale(next: Scale) {
    if (next === scale || !pendingFileRef.current) { setScale(next); return }
    setScale(next)
    runUpscale(pendingFileRef.current, next, format)
  }

  async function changeFormat(next: OutputFormat) {
    const previousFormat = format
    setFormat(next)
    // Re-encode from the pristine upscaled canvas — never from an
    // already-compressed JPEG/WebP blob — so the downloaded bytes actually
    // match the newly selected format instead of just the button label.
    const canvas = masterCanvasRef.current
    if (!canvas || status !== 'done') return
    // The encode is async — until it resolves, `resultUrl` still holds
    // the *previous* format's bytes. Disable downloading during that window
    // so a click can't save mislabeled bytes (old content, new extension).
    const reencodeId = ++reencodeIdRef.current
    setIsReencoding(true)
    try {
      const blob = await encodeCanvasToBlob(canvas, next, next === 'image/png' ? undefined : 0.92)
      if (reencodeIdRef.current !== reencodeId) return // superseded by a later format switch
      setResultUrlSafe(URL.createObjectURL(blob))
    } catch (err) {
      if (reencodeIdRef.current !== reencodeId) return
      // Keep the still-valid result and preview on screen — only the format
      // switch failed, so don't flip `status` to 'error' and blow away the
      // working before/after comparison. Just roll the format selector back.
      console.error('[v0] ai-image-upscaler re-encode error:', err)
      setFormat(previousFormat)
    } finally {
      if (reencodeIdRef.current === reencodeId) setIsReencoding(false)
    }
  }

  const reset = () => {
    runIdRef.current++ // invalidate any in-flight run so it can't overwrite the fresh idle state below
    reencodeIdRef.current++ // invalidate any in-flight format re-encode too
    setOriginalUrlSafe(null)
    setResultUrlSafe(null)
    masterCanvasRef.current = null
    setStatus('idle')
    setProgress(0)
    setErrorMsg(null)
    setWasDownscaled(false)
    setSliderPos(50)
    setIsReencoding(false)
    pendingFileRef.current = null
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const download = () => {
    if (!resultUrl) return
    const a = document.createElement('a')
    a.href = resultUrl
    a.download = buildSeoFilename(fileName, resultDims.w, resultDims.h, format)
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  // Cleanup object URLs on unmount — reads from refs (always current),
  // not the state values captured when this effect first ran.
  useEffect(() => {
    return () => {
      if (originalUrlRef.current) URL.revokeObjectURL(originalUrlRef.current)
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current)
    }
  }, [])

  function handleSliderDrag(clientX: number) {
    const el = compareRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const pct = ((clientX - rect.left) / rect.width) * 100
    setSliderPos(Math.min(100, Math.max(0, pct)))
  }

  const isWorking = status === 'loading-model' || status === 'processing'

  return (
    <div className="px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Heading */}
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3 w-3" />
            100% Free · Runs in Your Browser
          </div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            AI Image Upscaler — Enhance Resolution up to 4x, Instantly &amp; Privately
          </h1>
          <p className="mt-3 leading-relaxed text-muted-foreground text-pretty">
            Upscale any image 2x or 4x using on-device AI — no account, no fees, no watermark. Your image never leaves your device, so your files stay 100% private and secure.
          </p>
        </div>

        {/* Upload state */}
        {!originalUrl && (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click() }
            }}
            className={cn(
              'group relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed bg-card p-12 text-center transition-all',
              isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/30',
            )}
          >
            <input ref={fileInputRef} type="file" accept="image/*" onChange={onSelect} className="hidden" aria-label="Upload image" />
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <ZoomIn className="h-7 w-7" />
            </div>
            <div>
              <p className="font-heading text-lg font-semibold text-foreground">Drop your image here or click to browse</p>
              <p className="mt-1 text-sm text-muted-foreground">PNG, JPG, or WebP supported (up to 10MB recommended)</p>
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-primary" /> Files stay on your device</span>
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary" /> No sign-up</span>
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary" /> No watermark</span>
            </div>
          </div>
        )}

        {/* Working / Result state */}
        {originalUrl && (
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            {/* Preview */}
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Before / After — drag to compare
                </p>
                {status === 'done' && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                    <Check className="h-3 w-3" /> {resultDims.w}×{resultDims.h}px ready
                  </span>
                )}
              </div>

              <div
                ref={compareRef}
                className="relative aspect-square select-none overflow-hidden rounded-xl border border-border bg-muted/40"
                onMouseMove={(e) => { if (e.buttons === 1) handleSliderDrag(e.clientX) }}
                onTouchMove={(e) => handleSliderDrag(e.touches[0].clientX)}
              >
                {/* Original (base layer) */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={originalUrl} alt="Original upload" className="absolute inset-0 h-full w-full object-contain" />

                {/* Upscaled (clipped overlay) */}
                {resultUrl && (
                  <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={resultUrl} alt="Upscaled result" className="h-full w-full object-contain" />
                  </div>
                )}

                {resultUrl && (
                  <div
                    className="absolute inset-y-0 z-10 flex w-0.5 -translate-x-1/2 cursor-ew-resize items-center justify-center bg-primary"
                    style={{ left: `${sliderPos}%` }}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-background shadow-md">
                      <Maximize2 className="h-3.5 w-3.5 text-primary" />
                    </div>
                  </div>
                )}

                {isWorking && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-card/85 backdrop-blur-sm">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <div className="w-3/4 max-w-[220px]">
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
                      </div>
                      <p className="mt-2 text-center text-xs font-medium text-foreground">
                        {status === 'loading-model' ? 'Loading AI model…' : 'Upscaling image…'} {progress}%
                      </p>
                      <p className="mt-1 text-center text-[11px] text-muted-foreground">First run may take a moment to download the model.</p>
                    </div>
                  </div>
                )}

                {status === 'error' && !isWorking && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-card p-4 text-center">
                    <X className="h-6 w-6 text-destructive" />
                    <p className="text-sm font-medium text-foreground">Something went wrong</p>
                    <p className="text-xs text-muted-foreground">{errorMsg}</p>
                  </div>
                )}
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                <span>Original: {originalDims.w}×{originalDims.h}px</span>
                {resultUrl && <span>Upscaled: {resultDims.w}×{resultDims.h}px ({scale}x)</span>}
              </div>

              {wasDownscaled && (
                <p className="mt-2 rounded-lg bg-muted/50 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
                  This image was larger than {MAX_INPUT_DIMENSION}px on its longest side, so it was resized down before AI upscaling to keep processing fast in your browser — the {scale}x scale is then applied on top of that.
                </p>
              )}
            </div>

            {/* Sidebar controls */}
            <aside className="flex flex-col gap-4">
              <div className="rounded-2xl border border-border bg-card p-5">
                <h2 className="font-heading text-sm font-semibold text-foreground">Upscale factor</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">Choose how much to enhance the resolution.</p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {([2, 4] as Scale[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => changeScale(s)}
                      disabled={isWorking}
                      className={cn(
                        'flex flex-col items-center gap-1 rounded-lg border p-3 transition-all',
                        scale === s ? 'border-primary bg-primary/10 ring-2 ring-primary/20' : 'border-border hover:border-primary/40',
                        isWorking && 'cursor-not-allowed opacity-50',
                      )}
                      aria-pressed={scale === s}
                    >
                      <span className="font-heading text-lg font-bold text-foreground">{s}x</span>
                      <span className="text-[11px] text-muted-foreground">{s === 2 ? 'Faster' : 'Max detail'}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5">
                <h2 className="font-heading text-sm font-semibold text-foreground">Output format</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">Defaults to your uploaded file&apos;s format.</p>
                <div className="mt-3 flex gap-1 rounded-lg border border-border bg-muted/40 p-1">
                  {(Object.keys(FORMAT_LABELS) as OutputFormat[]).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => changeFormat(f)}
                      className={cn(
                        'flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-all',
                        format === f ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      {FORMAT_LABELS[f]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button onClick={download} disabled={!resultUrl || isReencoding} size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  {isReencoding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                  {isReencoding ? 'Converting…' : `Download ${FORMAT_LABELS[format]}`}
                </Button>
                <Button onClick={reset} variant="outline" size="lg" className="w-full">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try another image
                </Button>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4">
                <p className="flex items-center gap-2 font-heading text-sm font-semibold text-foreground">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Private by design
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  Your image is upscaled entirely in your browser using on-device AI. Nothing is uploaded to our servers — ever.
                </p>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  )
}
