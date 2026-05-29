'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Globe,
  Monitor,
  Tablet,
  Smartphone,
  Video,
  Download,
  RefreshCw,
  Square,
  AlertCircle,
  Sparkles,
  Clock,
  Gauge,
  MoveVertical,
  Film,
  Wand2,
  CheckCircle2,
  Loader2,
} from 'lucide-react'

// ─── Device presets ──────────────────────────────────────────────────────────

type DeviceId = 'desktop' | 'tablet' | 'mobile'

const devices: Record<
  DeviceId,
  { label: string; icon: typeof Monitor; width: number; height: number }
> = {
  desktop: { label: 'Desktop', icon: Monitor, width: 1280, height: 720 },
  tablet:  { label: 'Tablet',  icon: Tablet,  width: 820,  height: 1080 },
  mobile:  { label: 'Mobile',  icon: Smartphone, width: 390, height: 780 },
}

const pageLengths: Record<string, { label: string; multiplier: number }> = {
  short:  { label: 'Short',      multiplier: 1.8 },
  medium: { label: 'Medium',     multiplier: 3   },
  long:   { label: 'Long',       multiplier: 4.5 },
  full:   { label: 'Extra long', multiplier: 6.5 },
}

type Easing = 'smooth' | 'linear'
type Stage  = 'idle' | 'preloading' | 'countdown' | 'recording' | 'processing' | 'done'

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

export default function PortfolioRecorderTool() {
  const [url, setUrl]                     = useState('')
  const [loadedUrl, setLoadedUrl]         = useState<string | null>(null)
  const [device, setDevice]               = useState<DeviceId>('desktop')
  const [duration, setDuration]           = useState(20)
  const [pageLength, setPageLength]       = useState<keyof typeof pageLengths>('medium')
  const [easing, setEasing]               = useState<Easing>('smooth')
  const [stage, setStage]                 = useState<Stage>('idle')
  const [countdown, setCountdown]         = useState(3)
  const [elapsed, setElapsed]             = useState(0)
  const [preloadProgress, setPreloadProgress] = useState(0)
  const [recordedUrl, setRecordedUrl]     = useState<string | null>(null)
  const [error, setError]                 = useState<string | null>(null)
  const [iframeError, setIframeError]     = useState(false)

  const viewportRef       = useRef<HTMLDivElement>(null)
  const iframeRef         = useRef<HTMLIFrameElement>(null)
  const mediaRecorderRef  = useRef<MediaRecorder | null>(null)
  const streamRef         = useRef<MediaStream | null>(null)
  const chunksRef         = useRef<Blob[]>([])
  const rafRef            = useRef<number | null>(null)
  const cropRafRef        = useRef<number | null>(null)
  const startTimeRef      = useRef<number>(0)

  const dev         = devices[device]
  const scrollHeight = Math.round(dev.height * pageLengths[pageLength].multiplier)
  const maxScroll    = scrollHeight - dev.height

  const previewMaxWidth = device === 'desktop' ? 760 : device === 'tablet' ? 460 : 320
  const scale = Math.min(1, previewMaxWidth / dev.width)

  function validateUrl(input: string) {
    try {
      const u = new URL(input.startsWith('http') ? input : `https://${input}`)
      return u.toString()
    } catch {
      return null
    }
  }

  function loadSite() {
    const valid = validateUrl(url.trim())
    if (!valid) {
      setError('Please enter a valid website URL (e.g. https://example.com).')
      return
    }
    setError(null)
    setIframeError(false)
    setRecordedUrl(null)
    setUrl(valid)
    setLoadedUrl(valid)
    setStage('idle')
    if (iframeRef.current) iframeRef.current.style.transform = 'translateY(0px)'
  }

  const cleanupAll = useCallback(() => {
    if (rafRef.current)    { cancelAnimationFrame(rafRef.current);    rafRef.current    = null }
    if (cropRafRef.current){ cancelAnimationFrame(cropRafRef.current); cropRafRef.current = null }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [])

  // ── Phase 1: pre-load by slowly scrolling the iframe top→bottom, then reset ──
  function runPreload(): Promise<void> {
    return new Promise((resolve) => {
      // Spend ~2.5 s scrolling down so lazy-loaded content has time to render
      const preloadDur = Math.max(2500, duration * 250)
      const startTime  = performance.now()

      const tick = () => {
        const t     = Math.min((performance.now() - startTime) / preloadDur, 1)
        const eased = easeInOut(t)
        if (iframeRef.current) {
          iframeRef.current.style.transform = `translateY(${-eased * maxScroll}px)`
        }
        setPreloadProgress(Math.round(t * 85))
        if (t < 1) {
          requestAnimationFrame(tick)
        } else {
          // Snap back to top
          setTimeout(() => {
            if (iframeRef.current) iframeRef.current.style.transform = 'translateY(0px)'
            setPreloadProgress(100)
            resolve()
          }, 400)
        }
      }
      requestAnimationFrame(tick)
    })
  }

  // ── Phase 3: scroll animation during recording ────────────────────────────
  const animateScroll = useCallback(() => {
    const tick = () => {
      const t     = Math.min((performance.now() - startTimeRef.current) / (duration * 1000), 1)
      const eased = easing === 'smooth' ? easeInOut(t) : t
      if (iframeRef.current) {
        iframeRef.current.style.transform = `translateY(${-eased * maxScroll}px)`
      }
      setElapsed(t * duration)
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
    }
    startTimeRef.current = performance.now()
    rafRef.current = requestAnimationFrame(tick)
  }, [maxScroll, duration, easing])

  async function beginRecording() {
    if (!loadedUrl) return
    setError(null)

    // ── Phase 1: Pre-load ────────────────────────────────────────────────────
    setStage('preloading')
    setPreloadProgress(0)
    await runPreload()

    // Make sure the device frame is scrolled fully into view before we map
    // crop coordinates, so the rect we read matches what the tab captures.
    viewportRef.current?.scrollIntoView({ block: 'center', behavior: 'instant' as ScrollBehavior })
    await new Promise((r) => setTimeout(r, 150))

    // ── Phase 2: Request screen capture ─────────────────────────────────────
    // preferCurrentTab + selfBrowserSurface make Chrome show a minimal
    // "Share this tab?" prompt (no full-screen / window / tab picker).
    let stream: MediaStream
    try {
      stream = await (navigator.mediaDevices as MediaDevices).getDisplayMedia({
        video: {
          frameRate: 30,
        },
        audio: false,
        // @ts-expect-error Chrome-only hints to skip the surface picker
        preferCurrentTab: true,
        selfBrowserSurface: 'include',
        surfaceSwitching: 'exclude',
        monitorTypeSurfaces: 'exclude',
      })
    } catch {
      setError(
        'Screen capture was cancelled. Click "Start Recording" again, then click "Share" when the browser asks.'
      )
      setStage('idle')
      return
    }

    streamRef.current = stream

    // Feed the captured stream into a hidden video element
    const feedVideo   = document.createElement('video')
    feedVideo.srcObject = stream
    feedVideo.muted   = true
    await feedVideo.play()

    // Wait for dimensions to be known
    await new Promise<void>((res) => {
      if (feedVideo.videoWidth > 0) { res(); return }
      feedVideo.onloadedmetadata = () => res()
      setTimeout(res, 400)
    })

    // ── Build an HD canvas that crops to the exact viewport div on screen ────
    // A tab-capture surface maps 1:1 to the CSS layout viewport
    // (window.innerWidth/Height), NOT to physical pixels. So the conversion
    // factor from on-screen CSS coords to capture pixels is
    // videoWidth / window.innerWidth (and the same for height).
    const canvas  = document.createElement('canvas')
    canvas.width  = dev.width   // 1280 desktop → 720p+ HD output
    canvas.height = dev.height
    const ctx     = canvas.getContext('2d')!
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    const capW = feedVideo.videoWidth
    const capH = feedVideo.videoHeight
    const scaleX = capW / window.innerWidth
    const scaleY = capH / window.innerHeight

    let sx = 0, sy = 0, sw = capW, sh = capH
    function computeCrop() {
      const rect = viewportRef.current!.getBoundingClientRect()
      sx = Math.max(0, Math.round(rect.left   * scaleX))
      sy = Math.max(0, Math.round(rect.top    * scaleY))
      sw = Math.min(capW - sx, Math.round(rect.width  * scaleX))
      sh = Math.min(capH - sy, Math.round(rect.height * scaleY))
    }
    computeCrop()

    function drawFrame() {
      ctx.drawImage(feedVideo, sx, sy, sw, sh, 0, 0, dev.width, dev.height)
    }

    const canvasStream = canvas.captureStream(30)
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : 'video/webm'

    chunksRef.current = []
    const recorder = new MediaRecorder(canvasStream, { mimeType, videoBitsPerSecond: 12_000_000 })
    mediaRecorderRef.current = recorder

    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' })
      setRecordedUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return URL.createObjectURL(blob) })
      cleanupAll()
      if (cropRafRef.current) { cancelAnimationFrame(cropRafRef.current); cropRafRef.current = null }
      feedVideo.pause()
      feedVideo.srcObject = null
      setStage('done')
    }

    // Gracefully handle the user clicking "Stop sharing" in the browser UI
    stream.getVideoTracks()[0].addEventListener('ended', () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        if (cropRafRef.current) { cancelAnimationFrame(cropRafRef.current); cropRafRef.current = null }
        mediaRecorderRef.current.stop()
      }
    })

    // ── Phase 3: 3-2-1 countdown, then record ───────────────────────────────
    setStage('countdown')
    setCountdown(3)
    let c = 3
    const countdownTimer = setInterval(() => {
      c -= 1
      setCountdown(c)
      if (c <= 0) {
        clearInterval(countdownTimer)
        setStage('recording')
        setElapsed(0)
        if (iframeRef.current) iframeRef.current.style.transform = 'translateY(0px)'
        computeCrop() // re-measure in case layout shifted during countdown
        recorder.start(100)

        // Crop-draw loop: at each animation frame, copy the screen capture
        // cropped to the viewport div onto the canvas
        const drawLoop = () => {
          drawFrame()
          cropRafRef.current = requestAnimationFrame(drawLoop)
        }
        cropRafRef.current = requestAnimationFrame(drawLoop)

        animateScroll()

        // Auto-stop after the chosen duration
        setTimeout(() => {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            if (cropRafRef.current) { cancelAnimationFrame(cropRafRef.current); cropRafRef.current = null }
            setStage('processing')
            mediaRecorderRef.current.stop()
          }
        }, duration * 1000 + 300)
      }
    }, 1000)
  }

  function stopEarly() {
    if (cropRafRef.current) { cancelAnimationFrame(cropRafRef.current); cropRafRef.current = null }
    if (rafRef.current)     { cancelAnimationFrame(rafRef.current);     rafRef.current     = null }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      setStage('processing')
      mediaRecorderRef.current.stop()
    }
  }

  function resetAll() {
    cleanupAll()
    if (recordedUrl) URL.revokeObjectURL(recordedUrl)
    setRecordedUrl(null)
    setStage('idle')
    setElapsed(0)
    setPreloadProgress(0)
    if (iframeRef.current) iframeRef.current.style.transform = 'translateY(0px)'
  }

  useEffect(() => {
    return () => {
      cleanupAll()
      if (recordedUrl) URL.revokeObjectURL(recordedUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isActive = stage !== 'idle' && stage !== 'done'

  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* Heading */}
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3 w-3" />
            Turn any URL into a smooth demo video · 100% Free
          </div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Website Portfolio Video Recorder
          </h1>
          <p className="mt-3 leading-relaxed text-muted-foreground text-pretty">
            Record a buttery-smooth scrolling video of any website or web app — in desktop, tablet, or mobile view. Pick a 10–60 second duration, hit record, and download a clean clip for your portfolio, case study, or social post.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">

          {/* ── Preview column ── */}
          <div className="order-2 lg:order-1">
            <div className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
              {!loadedUrl ? (
                <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-background/50 px-6 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                    <Film className="h-7 w-7 text-primary" />
                  </div>
                  <p className="mt-4 font-heading text-lg font-semibold text-foreground">
                    Enter a URL to start
                  </p>
                  <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                    Your website preview will appear here inside a device frame, ready to record.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center">

                  {/* Status bar */}
                  <div className="mb-4 flex w-full items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <dev.icon className="h-4 w-4 text-primary" />
                      <span className="font-medium text-foreground">{dev.label}</span>
                      <span className="text-muted-foreground">{dev.width}×{dev.height}</span>
                    </div>
                    {stage === 'recording' && (
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2.5 w-2.5 items-center justify-center">
                          <span className="absolute h-2.5 w-2.5 animate-ping rounded-full bg-red-500/60" />
                          <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                        </span>
                        <span className="text-sm font-semibold tabular-nums text-foreground">
                          {elapsed.toFixed(1)}s / {duration}s
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Device frame */}
                  <div
                    className="relative"
                    style={{ width: dev.width * scale, height: dev.height * scale }}
                  >
                    {/* Viewport: rendered at full device size, scaled down visually */}
                    <div
                      className="absolute left-0 top-0 origin-top-left overflow-hidden bg-white shadow-xl ring-1 ring-border"
                      style={{
                        width: dev.width,
                        height: dev.height,
                        transform: `scale(${scale})`,
                        borderRadius: device === 'mobile' ? 32 : device === 'tablet' ? 20 : 12,
                      }}
                      ref={viewportRef}
                    >
                      {iframeError ? (
                        <div className="flex h-full flex-col items-center justify-center gap-3 bg-muted px-8 text-center">
                          <AlertCircle className="h-8 w-8 text-amber-500" />
                          <p className="font-heading font-semibold text-foreground">
                            This site blocks embedding
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Some sites send X-Frame-Options headers that prevent preview. Try a
                            different URL, a staging link, or your own deployment.
                          </p>
                        </div>
                      ) : (
                        <iframe
                          ref={iframeRef}
                          src={loadedUrl}
                          title="Website preview"
                          onError={() => setIframeError(true)}
                          style={{
                            width: dev.width,
                            height: scrollHeight,
                            border: 'none',
                            transform: 'translateY(0px)',
                            willChange: 'transform',
                          }}
                          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                        />
                      )}

                      {/* Pre-loading overlay */}
                      {stage === 'preloading' && (
                        <div className="absolute inset-0 z-30 flex items-center justify-center bg-foreground/50 backdrop-blur-sm">
                          <div className="flex flex-col items-center gap-3 px-6 text-center text-white">
                            <Loader2 className="h-8 w-8 animate-spin" />
                            <p className="font-heading text-sm font-semibold">Pre-loading page…</p>
                            <div className="h-1.5 w-36 overflow-hidden rounded-full bg-white/30">
                              <div
                                className="h-full rounded-full bg-white transition-[width] duration-200"
                                style={{ width: `${preloadProgress}%` }}
                              />
                            </div>
                            <p className="text-[11px] opacity-75">
                              Scrolling to trigger lazy content
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Countdown overlay */}
                    {stage === 'countdown' && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-foreground/60 backdrop-blur-sm">
                        <span className="font-heading text-6xl font-bold text-white tabular-nums">
                          {countdown > 0 ? countdown : 'Go'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Progress bar (recording only) */}
                  {stage === 'recording' && (
                    <div className="mt-4 h-1.5 w-full max-w-[420px] overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-[width] duration-100"
                        style={{ width: `${(elapsed / duration) * 100}%` }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Recorded video */}
            {stage === 'done' && recordedUrl && (
              <div className="mt-6 rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
                <div className="mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <h2 className="font-heading text-lg font-bold text-foreground">
                    Your video is ready
                  </h2>
                </div>
                <video
                  src={recordedUrl}
                  controls
                  autoPlay
                  loop
                  className="w-full rounded-xl border border-border bg-black"
                />
                <div className="mt-4 flex flex-wrap gap-2">
                  <a
                    href={recordedUrl}
                    download={`portfolio-${device}-${Date.now()}.webm`}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    <Download className="h-4 w-4" />
                    Download .webm
                  </a>
                  <button
                    onClick={resetAll}
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Record Again
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Controls column ── */}
          <div className="order-1 space-y-5 lg:order-2">

            {/* URL input */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <label htmlFor="rec-url" className="block text-sm font-medium text-foreground">
                Website URL
              </label>
              <div className="mt-2 flex gap-2">
                <div className="relative flex-1">
                  <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="rec-url"
                    type="url"
                    value={url}
                    onChange={(e) => { setUrl(e.target.value); if (error) setError(null) }}
                    onKeyDown={(e) => e.key === 'Enter' && loadSite()}
                    placeholder="https://yourapp.com"
                    disabled={isActive}
                    className="w-full rounded-xl border border-border bg-background px-9 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                  />
                </div>
                <button
                  onClick={loadSite}
                  disabled={isActive}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-foreground px-4 py-2.5 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  Load
                </button>
              </div>
              {error && (
                <p className="mt-2 flex items-start gap-1.5 text-xs text-red-500">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {error}
                </p>
              )}
            </div>

            {/* Device */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <p className="text-sm font-medium text-foreground">Device view</p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {(Object.keys(devices) as DeviceId[]).map((id) => {
                  const D    = devices[id]
                  const Icon = D.icon
                  const active = device === id
                  return (
                    <button
                      key={id}
                      onClick={() => setDevice(id)}
                      disabled={isActive}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-medium transition-all disabled:opacity-60 ${
                        active
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-background text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {D.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Duration */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <Clock className="h-4 w-4 text-primary" />
                  Duration
                </p>
                <span className="font-heading text-sm font-bold text-primary tabular-nums">
                  {duration}s
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={60}
                step={1}
                value={duration}
                disabled={isActive}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="mt-3 w-full accent-primary disabled:opacity-60"
              />
              <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                <span>10s</span>
                <span>60s</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {[10, 15, 30, 45, 60].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    disabled={isActive}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-60 ${
                      duration === d
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {d}s
                  </button>
                ))}
              </div>
            </div>

            {/* Scroll settings */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                <MoveVertical className="h-4 w-4 text-primary" />
                Scroll depth
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {(Object.keys(pageLengths) as (keyof typeof pageLengths)[]).map((id) => {
                  const active = pageLength === id
                  return (
                    <button
                      key={id}
                      onClick={() => setPageLength(id)}
                      disabled={isActive}
                      className={`rounded-xl border px-3 py-2 text-xs font-medium transition-all disabled:opacity-60 ${
                        active
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-background text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {pageLengths[id].label}
                    </button>
                  )
                })}
              </div>

              <p className="mt-4 flex items-center gap-1.5 text-sm font-medium text-foreground">
                <Gauge className="h-4 w-4 text-primary" />
                Motion
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {([
                  { id: 'smooth' as Easing, label: 'Smooth (ease)' },
                  { id: 'linear' as Easing, label: 'Constant' },
                ] as const).map((opt) => {
                  const active = easing === opt.id
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setEasing(opt.id)}
                      disabled={isActive}
                      className={`rounded-xl border px-3 py-2 text-xs font-medium transition-all disabled:opacity-60 ${
                        active
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-background text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Record / Stop */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              {stage === 'recording' || stage === 'processing' ? (
                <button
                  onClick={stopEarly}
                  disabled={stage === 'processing'}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  <Square className="h-4 w-4 fill-current" />
                  {stage === 'processing' ? 'Processing…' : 'Stop & Save'}
                </button>
              ) : stage === 'preloading' ? (
                <div className="flex w-full items-center justify-center gap-2 rounded-xl bg-muted px-5 py-3 text-sm font-semibold text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Pre-loading page… {preloadProgress}%
                </div>
              ) : (
                <button
                  onClick={beginRecording}
                  disabled={!loadedUrl || iframeError || stage === 'countdown'}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Video className="h-4 w-4" />
                  {stage === 'countdown' ? 'Starting…' : 'Start Recording'}
                </button>
              )}
              <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
                <Wand2 className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                The page pre-loads automatically before recording. When your browser asks, click{' '}
                <strong className="font-semibold text-foreground">&quot;Share&quot;</strong> — only the website area will be captured in the video.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
