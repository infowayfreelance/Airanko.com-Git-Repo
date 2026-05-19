'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Upload,
  Download,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  X,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Status = 'idle' | 'loading-model' | 'processing' | 'done' | 'error'

const PRESET_COLORS = [
  { id: 'transparent', label: 'Transparent', value: null },
  { id: 'white', label: 'White', value: '#ffffff' },
  { id: 'black', label: 'Black', value: '#000000' },
  { id: 'brand', label: 'Brand', value: '#3a59d1' },
  { id: 'teal', label: 'Teal', value: '#0fb5a8' },
  { id: 'soft', label: 'Soft', value: '#f4f4f5' },
] as const

export default function BackgroundRemoverTool() {
  const [originalUrl, setOriginalUrl] = useState<string | null>(null)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [progress, setProgress] = useState(0)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [bgColor, setBgColor] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>('image')
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Composite the foreground PNG over a chosen color (for downloads/preview)
  const compositeWithColor = useCallback(
    async (foregroundUrl: string, color: string | null): Promise<string> => {
      if (!color) return foregroundUrl
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.src = foregroundUrl
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject(new Error('Failed to load processed image'))
      })
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Canvas not supported')
      ctx.fillStyle = color
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      return canvas.toDataURL('image/png')
    },
    [],
  )

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please upload a valid image file (PNG, JPG, WebP).')
      setStatus('error')
      return
    }

    setErrorMsg(null)
    setResultUrl(null)
    setProgress(0)
    setFileName(file.name.replace(/\.[^/.]+$/, '') || 'image')

    const objectUrl = URL.createObjectURL(file)
    setOriginalUrl(objectUrl)

    try {
      setStatus('loading-model')

      // Lazy-load Transformers.js on the client only.
      const { env, AutoModel, AutoProcessor, RawImage } = await import(
        '@huggingface/transformers'
      )

      // Always pull models from the HuggingFace Hub (rock-solid CDN).
      env.allowLocalModels = false
      if (env.backends?.onnx?.wasm) {
        env.backends.onnx.wasm.proxy = false
      }

      // Load the model + processor (cached after first run via the browser).
      const modelId = 'briaai/RMBG-1.4'
      const model = await AutoModel.from_pretrained(modelId, {
        // RMBG-1.4 uses a custom architecture — declare it so the loader
        // doesn't reject the config.
        config: { model_type: 'custom' } as never,
        progress_callback: (data: { status?: string; progress?: number }) => {
          if (data?.status === 'progress' && typeof data.progress === 'number') {
            // Reserve 0-60% for model download, 60-100% for inference.
            setProgress(Math.min(60, Math.round((data.progress / 100) * 60)))
          }
        },
      })
      const processor = await AutoProcessor.from_pretrained(modelId, {
        config: {
          do_normalize: true,
          do_pad: false,
          do_rescale: true,
          do_resize: true,
          image_mean: [0.5, 0.5, 0.5],
          feature_extractor_type: 'ImageFeatureExtractor',
          image_std: [1, 1, 1],
          resample: 2,
          rescale_factor: 0.00392156862745098,
          size: { width: 1024, height: 1024 },
        } as never,
      })

      setStatus('processing')
      setProgress(70)

      // Run inference.
      const image = await RawImage.fromURL(objectUrl)
      const { pixel_values } = await processor(image)
      const { output } = await model({ input: pixel_values })

      // Build a full-resolution alpha mask from the model output.
      // NOTE: `.resize()` returns a Promise — must be awaited or the mask
      // pixel buffer ends up empty and nothing gets removed.
      const maskTensorImage = RawImage.fromTensor(
        output[0].mul(255).to('uint8'),
      )
      const maskImage = await maskTensorImage.resize(image.width, image.height)

      setProgress(90)

      // Composite: copy original RGB, replace alpha with mask.
      const canvas = document.createElement('canvas')
      canvas.width = image.width
      canvas.height = image.height
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Canvas 2D context unavailable')

      const sourceImg = new Image()
      sourceImg.crossOrigin = 'anonymous'
      sourceImg.src = objectUrl
      await new Promise<void>((resolve, reject) => {
        sourceImg.onload = () => resolve()
        sourceImg.onerror = () => reject(new Error('Could not load image'))
      })
      ctx.drawImage(sourceImg, 0, 0)

      const pixelData = ctx.getImageData(0, 0, image.width, image.height)
      for (let i = 0; i < maskImage.data.length; i++) {
        pixelData.data[4 * i + 3] = maskImage.data[i]
      }
      ctx.putImageData(pixelData, 0, 0)

      const blob: Blob = await new Promise((resolve, reject) =>
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error('Could not encode PNG'))),
          'image/png',
        ),
      )

      const resultObjectUrl = URL.createObjectURL(blob)
      setResultUrl(resultObjectUrl)
      setProgress(100)
      setStatus('done')
    } catch (err) {
      console.error('[v0] background-remover error:', err)
      const raw = err instanceof Error ? err.message : String(err)
      const friendly = /failed to fetch|networkerror|load failed/i.test(raw)
        ? 'Could not download the AI model. Check your internet connection and try again.'
        : raw || 'Failed to remove background. Please try a different image.'
      setErrorMsg(friendly)
      setStatus('error')
    }
  }, [])

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

  const reset = () => {
    if (originalUrl) URL.revokeObjectURL(originalUrl)
    if (resultUrl) URL.revokeObjectURL(resultUrl)
    setOriginalUrl(null)
    setResultUrl(null)
    setStatus('idle')
    setProgress(0)
    setErrorMsg(null)
    setBgColor(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const download = async () => {
    if (!resultUrl) return
    const finalUrl = await compositeWithColor(resultUrl, bgColor)
    const a = document.createElement('a')
    a.href = finalUrl
    a.download = `${fileName}-no-bg.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (originalUrl) URL.revokeObjectURL(originalUrl)
      if (resultUrl) URL.revokeObjectURL(resultUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
            Free AI Background Remover — Instant, Private &amp; 100% Free
          </h1>
          <p className="mt-3 leading-relaxed text-muted-foreground text-pretty">
            Remove any image background in seconds using on-device AI — no account, no fees, no watermark. Your image never leaves your device, so your files stay 100% private and secure.
          </p>
        </div>

        {/* Upload state */}
        {!originalUrl && (
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                fileInputRef.current?.click()
              }
            }}
            className={cn(
              'group relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed bg-card p-12 text-center transition-all',
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 hover:bg-muted/30',
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onSelect}
              className="hidden"
              aria-label="Upload image"
            />
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <Upload className="h-7 w-7" />
            </div>
            <div>
              <p className="font-heading text-lg font-semibold text-foreground">
                Drop your image here or click to browse
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                PNG, JPG, or WebP supported (up to 10MB recommended)
              </p>
            </div>

            <div className="mt-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                Files stay on your device
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-primary" />
                No sign-up
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-primary" />
                No watermark
              </span>
            </div>
          </div>
        )}

        {/* Working / Result state */}
        {originalUrl && (
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            {/* Preview */}
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Original */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Original
                    </p>
                  </div>
                  <div className="relative aspect-square overflow-hidden rounded-xl border border-border bg-muted/40">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={originalUrl || '/placeholder.svg'}
                      alt="Original upload"
                      className="h-full w-full object-contain"
                    />
                  </div>
                </div>

                {/* Result */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Background Removed
                    </p>
                    {status === 'done' && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                        <Check className="h-3 w-3" /> Ready
                      </span>
                    )}
                  </div>
                  <div
                    className="relative aspect-square overflow-hidden rounded-xl border border-border"
                    style={
                      bgColor
                        ? { backgroundColor: bgColor }
                        : {
                            backgroundImage:
                              'linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)',
                            backgroundSize: '16px 16px',
                            backgroundPosition:
                              '0 0, 0 8px, 8px -8px, -8px 0',
                          }
                    }
                  >
                    {isWorking && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-card/85 backdrop-blur-sm">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <div className="w-3/4 max-w-[220px]">
                          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full bg-primary transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <p className="mt-2 text-center text-xs font-medium text-foreground">
                            {status === 'loading-model'
                              ? 'Loading AI model…'
                              : 'Removing background…'}{' '}
                            {progress}%
                          </p>
                          <p className="mt-1 text-center text-[11px] text-muted-foreground">
                            First run may take a moment to download the model.
                          </p>
                        </div>
                      </div>
                    )}
                    {resultUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={resultUrl || '/placeholder.svg'}
                        alt="Image with background removed"
                        className="h-full w-full object-contain"
                      />
                    )}
                    {status === 'error' && !isWorking && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-card p-4 text-center">
                        <X className="h-6 w-6 text-destructive" />
                        <p className="text-sm font-medium text-foreground">
                          Something went wrong
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {errorMsg}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar controls */}
            <aside className="flex flex-col gap-4">
              <div className="rounded-2xl border border-border bg-card p-5">
                <h2 className="font-heading text-sm font-semibold text-foreground">
                  Background
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Choose a backdrop or keep it transparent.
                </p>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {PRESET_COLORS.map((c) => {
                    const isActive = bgColor === c.value
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setBgColor(c.value)}
                        disabled={!resultUrl}
                        className={cn(
                          'group flex flex-col items-center gap-1.5 rounded-lg border p-2 transition-all',
                          isActive
                            ? 'border-primary ring-2 ring-primary/20'
                            : 'border-border hover:border-primary/40',
                          !resultUrl && 'cursor-not-allowed opacity-50',
                        )}
                        aria-pressed={isActive}
                      >
                        <span
                          className="h-8 w-full rounded-md border border-border"
                          style={
                            c.value
                              ? { backgroundColor: c.value }
                              : {
                                  backgroundImage:
                                    'linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)',
                                  backgroundSize: '8px 8px',
                                  backgroundPosition:
                                    '0 0, 0 4px, 4px -4px, -4px 0',
                                }
                          }
                          aria-hidden
                        />
                        <span className="text-[11px] font-medium text-foreground">
                          {c.label}
                        </span>
                      </button>
                    )
                  })}
                </div>

                <div className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-2">
                  <label
                    htmlFor="custom-color"
                    className="flex items-center gap-2 text-xs font-medium text-foreground"
                  >
                    Custom
                  </label>
                  <input
                    id="custom-color"
                    type="color"
                    value={bgColor ?? '#ffffff'}
                    onChange={(e) => setBgColor(e.target.value)}
                    disabled={!resultUrl}
                    className="h-7 w-10 cursor-pointer rounded border border-border bg-card disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Pick a custom background color"
                  />
                  <span className="ml-auto font-mono text-xs text-muted-foreground">
                    {bgColor ?? 'none'}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  onClick={download}
                  disabled={!resultUrl}
                  size="lg"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download PNG
                </Button>
                <Button
                  onClick={reset}
                  variant="outline"
                  size="lg"
                  className="w-full"
                >
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
                  Your image is processed entirely in your browser. Nothing is
                  uploaded to our servers — ever.
                </p>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  )
}
