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
  ArrowLeft,
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

// Fallback estimate only — used when the loaded site's real height can't be
// read (cross-origin, the common case). Whenever the real height IS
// readable, it always wins over this guess.
const pageLengths: Record<string, { label: string; multiplier: number }> = {
  short:  { label: 'Short',      multiplier: 1.8 },
  medium: { label: 'Medium',     multiplier: 3   },
  long:   { label: 'Long',       multiplier: 4.5 },
  full:   { label: 'Extra long', multiplier: 6.5 },
}

type Easing = 'smooth' | 'linear'
type View   = 'setup' | 'studio'
type Stage  = 'idle' | 'preloading' | 'countdown' | 'recording' | 'processing' | 'done'

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

export default function PortfolioRecorderTool() {
  const [url, setUrl]                     = useState('')
  const [loadedUrl, setLoadedUrl]         = useState<string | null>(null)
  const [view, setView]                   = useState<View>('setup')
  const [device, setDevice]               = useState<DeviceId>('desktop')
  const [duration, setDuration]           = useState(20)
  const [pageLength, setPageLength]       = useState<keyof typeof pageLengths>('medium')
  const [easing, setEasing]               = useState<Easing>('smooth')
  const [stage, setStage]                 = useState<Stage>('idle')
  const [countdown, setCountdown]         = useState(3)
  const [elapsed, setElapsed]             = useState(0)
  const [preloadProgress, setPreloadProgress] = useState(0)
  const [preloadPhaseLabel, setPreloadPhaseLabel] = useState('Loading page…')
  const [recordedUrl, setRecordedUrl]     = useState<string | null>(null)
  const [error, setError]                 = useState<string | null>(null)
  const [iframeError, setIframeError]     = useState(false)
  const [measuredHeight, setMeasuredHeight] = useState<number | null>(null)
  const [canControlDom, setCanControlDom] = useState(false)
  const [iframeExpanded, setIframeExpanded] = useState(false)

  const viewportRef        = useRef<HTMLDivElement>(null)
  const iframeRef          = useRef<HTMLIFrameElement>(null)
  const mediaRecorderRef   = useRef<MediaRecorder | null>(null)
  const streamRef          = useRef<MediaStream | null>(null)
  const chunksRef          = useRef<Blob[]>([])
  const rafRef             = useRef<number | null>(null)
  const cropRafRef         = useRef<number | null>(null)
  const startTimeRef       = useRef<number>(0)
  const measuredHeightRef  = useRef<number | null>(null)
  const canControlDomRef   = useRef(false)
  const measureTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const dev             = devices[device]
  const estimatedHeight = Math.round(dev.height * pageLengths[pageLength].multiplier)
  // The real, detected scrollable height of the loaded page always wins over
  // the guessed estimate — the estimate is only a fallback for sites whose
  // DOM the parent page cannot read cross-origin.
  const scrollHeight = Math.max(measuredHeight ?? estimatedHeight, dev.height)
  const maxScroll    = scrollHeight - dev.height

  // When we can drive the iframe's own document.scrollTo() (same-origin —
  // rare for arbitrary external sites), the iframe stays at its natural
  // viewport size and we scroll the real document, exactly like a normal
  // browser window. When we can't (cross-origin — the common case), there
  // is no way to move that document's scroll position from the parent page
  // at all, so the only workable fallback is to size the iframe to the
  // page's full height and slide the whole element up — which requires the
  // iframe to actually be that tall.
  const needsExpandedIframe = !canControlDom && iframeExpanded
  const iframeCssHeight     = needsExpandedIframe ? scrollHeight : dev.height

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
    setView('studio')
    setIframeExpanded(false)
    setPreloadProgress(0)
    setPreloadPhaseLabel('Loading page…')
    clearMeasureTimeouts()
    measuredHeightRef.current = null
    setMeasuredHeight(null)
    canControlDomRef.current = false
    setCanControlDom(false)
    if (iframeRef.current) iframeRef.current.style.transform = 'translateY(0px)'
  }

  function backToSetup() {
    if (isActive) return
    cleanupAll()
    if (recordedUrl) URL.revokeObjectURL(recordedUrl)
    setRecordedUrl(null)
    setLoadedUrl(null)
    setStage('idle')
    setView('setup')
    setIframeExpanded(false)
    setElapsed(0)
    setPreloadProgress(0)
  }

  function clearMeasureTimeouts() {
    measureTimeoutsRef.current.forEach(clearTimeout)
    measureTimeoutsRef.current = []
  }

  // Cross-origin sites throw a SecurityError on any of these reads — this is
  // the browser's same-origin policy and cannot be bypassed, so a null
  // result (falling back to the estimate + the transform-based scroll
  // fallback) is the expected, common outcome for real external websites.
  function measureRealHeight(): number | null {
    try {
      const doc = iframeRef.current?.contentWindow?.document
      if (!doc) return null
      const root = doc.documentElement
      const body = doc.body
      const h = Math.max(
        root?.scrollHeight ?? 0,
        body?.scrollHeight ?? 0,
        root?.offsetHeight ?? 0,
        body?.offsetHeight ?? 0,
      )
      if (h <= 0) return null
      // Successfully reading the document at all means this frame is
      // same-origin, which also means we can safely call scrollTo() on it.
      canControlDomRef.current = true
      return h
    } catch {
      return null
    }
  }

  // Re-measures and only ever grows the recorded height, so content that
  // renders in late (images, fonts, lazy sections) after the first read
  // still gets picked up.
  function refreshMeasuredHeight() {
    const h = measureRealHeight()
    if (canControlDomRef.current) setCanControlDom(true)
    if (h && (measuredHeightRef.current === null || h > measuredHeightRef.current)) {
      measuredHeightRef.current = h
      setMeasuredHeight(h)
    }
  }

  function scheduleHeightRechecks() {
    clearMeasureTimeouts()
    refreshMeasuredHeight()
    ;[400, 1200, 2800].forEach((delay) => {
      measureTimeoutsRef.current.push(setTimeout(refreshMeasuredHeight, delay))
    })
  }

  function getScrollHeight() {
    const estimate = Math.round(dev.height * pageLengths[pageLength].multiplier)
    return Math.max(measuredHeightRef.current ?? estimate, dev.height)
  }

  function getMaxScroll() {
    return getScrollHeight() - dev.height
  }

  // Single choke point for moving the loaded page's scroll position: uses
  // the real, safe DOM API when the frame is same-origin, otherwise falls
  // back to sliding the whole iframe element — never anything that relies
  // on bypassing the browser's cross-origin restrictions.
  function scrollIframeTo(px: number) {
    if (canControlDomRef.current) {
      try {
        iframeRef.current?.contentWindow?.scrollTo(0, px)
        return
      } catch {
        canControlDomRef.current = false
        setCanControlDom(false)
      }
    }
    if (iframeRef.current) iframeRef.current.style.transform = `translateY(${-px}px)`
  }

  const cleanupAll = useCallback(() => {
    if (rafRef.current)    { cancelAnimationFrame(rafRef.current);    rafRef.current    = null }
    if (cropRafRef.current){ cancelAnimationFrame(cropRafRef.current); cropRafRef.current = null }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    clearMeasureTimeouts()
  }, [])

  // ── Reveal pass: slowly scroll top→bottom once so lazy-loaded sections
  // have a chance to render, then always land back at the exact top ──────
  function scrollRevealPass(): Promise<void> {
    return new Promise((resolve) => {
      const passDuration = Math.max(2000, duration * 200)
      const startTime = performance.now()

      const tick = () => {
        const t     = Math.min((performance.now() - startTime) / passDuration, 1)
        const eased = easeInOut(t)
        scrollIframeTo(eased * getMaxScroll())
        setPreloadProgress(30 + Math.round(t * 50))
        if (t < 1) {
          requestAnimationFrame(tick)
        } else {
          resolve()
        }
      }
      requestAnimationFrame(tick)
    })
  }

  // ── Full pre-record pipeline: let the page settle, reveal lazy content,
  // then reset to the exact top and pause briefly before recording ──────
  async function preparePage(): Promise<void> {
    setPreloadPhaseLabel('Waiting for images & fonts to settle…')
    setPreloadProgress(5)
    refreshMeasuredHeight()
    await sleep(900)
    refreshMeasuredHeight()
    setPreloadProgress(25)

    if (!canControlDomRef.current) {
      // Only the transform fallback needs the iframe grown to full height —
      // real same-origin scrolling keeps the iframe at its natural size.
      setIframeExpanded(true)
      await sleep(60)
    }

    setPreloadPhaseLabel('Triggering lazy-loaded sections…')
    await scrollRevealPass()
    // The reveal pass may have triggered more lazy content — re-measure
    // once more before locking in the scroll distance used for recording.
    refreshMeasuredHeight()

    setPreloadPhaseLabel('Resetting to the top…')
    scrollIframeTo(0)
    await sleep(400)
    setPreloadProgress(100)
  }

  // ── Scroll animation during recording — always distance / duration ────
  const animateScroll = useCallback(() => {
    const tick = () => {
      const t     = Math.min((performance.now() - startTimeRef.current) / (duration * 1000), 1)
      const eased = easing === 'smooth' ? easeInOut(t) : t
      scrollIframeTo(eased * getMaxScroll())
      setElapsed(t * duration)
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
    }
    startTimeRef.current = performance.now()
    rafRef.current = requestAnimationFrame(tick)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, easing])

  async function beginRecording() {
    if (!loadedUrl) return
    setError(null)

    // ── Phase 1: settle, reveal lazy content, reset to the exact top ──────
    setStage('preloading')
    setPreloadProgress(0)
    await preparePage()

    setPreloadPhaseLabel('Requesting screen capture…')
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
        // Always start from the exact top — never from wherever the
        // pre-load/reveal pass or countdown happened to leave things.
        scrollIframeTo(0)
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
    setIframeExpanded(false)
    scrollIframeTo(0)
  }

  useEffect(() => {
    return () => {
      cleanupAll()
      if (recordedUrl) URL.revokeObjectURL(recordedUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isActive = stage !== 'idle' && stage !== 'done'

  const devicePreview = (
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
              src={loadedUrl ?? undefined}
              title="Website preview"
              onError={() => setIframeError(true)}
              onLoad={() => scheduleHeightRechecks()}
              style={{
                width: dev.width,
                height: iframeCssHeight,
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
                <p className="text-[11px] opacity-75">{preloadPhaseLabel}</p>
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
  )

  const recordedVideoCard = stage === 'done' && recordedUrl && (
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
  )

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

        {view === 'setup' ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">

            {/* ── Preview placeholder column ── */}
            <div className="order-2 lg:order-1">
              <div className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
                <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-background/50 px-6 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                    <Film className="h-7 w-7 text-primary" />
                  </div>
                  <p className="mt-4 font-heading text-lg font-semibold text-foreground">
                    Enter a URL to start
                  </p>
                  <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                    Loading a website opens a dedicated recording page with a live preview, ready to record.
                  </p>
                </div>
              </div>
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
                      className="w-full rounded-xl border border-border bg-background px-9 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <button
                    onClick={loadSite}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-foreground px-4 py-2.5 text-sm font-semibold text-background transition-opacity hover:opacity-90"
                  >
                    Load Website
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
                        className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-medium transition-all ${
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
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="mt-3 w-full accent-primary"
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
                      className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
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
                        className={`rounded-xl border px-3 py-2 text-xs font-medium transition-all ${
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
                <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                  Used only as a fallback estimate for sites whose real height can&apos;t be read from the browser (cross-origin) — the real detected height always wins when available.
                </p>

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
                        className={`rounded-xl border px-3 py-2 text-xs font-medium transition-all ${
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
            </div>
          </div>
        ) : (
          <div className="space-y-5">

            {/* ── Studio header: dedicated recording page chrome ── */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card px-5 py-3 shadow-sm">
              <button
                onClick={backToSetup}
                disabled={isActive}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Change website
              </button>
              <div className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
                <Globe className="h-4 w-4 shrink-0" />
                <span className="truncate">{loadedUrl}</span>
              </div>
              <div className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <dev.icon className="h-3.5 w-3.5 text-primary" />
                {dev.label} · {duration}s
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
              {devicePreview}

              <p className="mt-4 text-center text-[11px] leading-relaxed text-muted-foreground">
                {canControlDom
                  ? `Real page height detected (~${measuredHeight}px) — the video will scroll the actual page from top to bottom.`
                  : measuredHeight
                    ? `This site's DOM isn't directly readable (cross-origin), but the real rendered height was measured (~${measuredHeight}px) and is used automatically.`
                    : "This site's real height isn't readable from the browser (cross-origin) — using the \"" + pageLengths[pageLength].label + '" preset as a safe estimate.'}
              </p>

              {recordedVideoCard}

              {/* Record / Stop */}
              <div className="mt-5 border-t border-border pt-5">
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
                    {preloadPhaseLabel} {preloadProgress}%
                  </div>
                ) : stage === 'done' ? null : (
                  <button
                    onClick={beginRecording}
                    disabled={!loadedUrl || iframeError || stage === 'countdown'}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Video className="h-4 w-4" />
                    {stage === 'countdown' ? 'Starting…' : 'Start Recording'}
                  </button>
                )}
                {stage !== 'done' && (
                  <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
                    <Wand2 className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                    The page pre-loads and settles automatically before recording. When your browser asks, click{' '}
                    <strong className="font-semibold text-foreground">&quot;Share&quot;</strong> — only the website area will be captured in the video.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
