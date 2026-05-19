'use client'

import { useState, useRef } from 'react'
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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const DEVICES = [
  {
    id: 'iphone-se',
    label: 'iPhone SE',
    width: 375,
    height: 667,
    icon: Smartphone,
    category: 'phone',
  },
  {
    id: 'iphone-14',
    label: 'iPhone 14',
    width: 390,
    height: 844,
    icon: Smartphone,
    category: 'phone',
  },
  {
    id: 'iphone-14-pro-max',
    label: 'iPhone 14 Pro Max',
    width: 430,
    height: 932,
    icon: Smartphone,
    category: 'phone',
  },
  {
    id: 'galaxy-s23',
    label: 'Galaxy S23',
    width: 393,
    height: 851,
    icon: Smartphone,
    category: 'phone',
  },
  {
    id: 'pixel-7',
    label: 'Pixel 7',
    width: 412,
    height: 892,
    icon: Smartphone,
    category: 'phone',
  },
  {
    id: 'ipad-mini',
    label: 'iPad Mini',
    width: 768,
    height: 1024,
    icon: Tablet,
    category: 'tablet',
  },
  {
    id: 'ipad-pro',
    label: 'iPad Pro 11"',
    width: 834,
    height: 1194,
    icon: Tablet,
    category: 'tablet',
  },
  {
    id: 'desktop',
    label: 'Desktop',
    width: 1280,
    height: 800,
    icon: Monitor,
    category: 'desktop',
  },
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
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export default function MobileCheckerTool() {
  const [inputValue, setInputValue] = useState('')
  const [activeUrl, setActiveUrl] = useState('')
  const [selectedDevice, setSelectedDevice] = useState(DEVICES[1]) // iPhone 14
  const [scale, setScale] = useState(0.75)
  const [isRotated, setIsRotated] = useState(false)
  const [iframeKey, setIframeKey] = useState(0)
  const [iframeLoading, setIframeLoading] = useState(false)
  const [iframeError, setIframeError] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const activeCategory = selectedDevice.category

  const frameWidth = isRotated ? selectedDevice.height : selectedDevice.width
  const frameHeight = isRotated ? selectedDevice.width : selectedDevice.height

  const scaledWidth = Math.round(frameWidth * scale)
  const scaledHeight = Math.round(frameHeight * scale)

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    const url = normalizeUrl(inputValue)
    if (!isValidUrl(url)) return
    setActiveUrl(url)
    setIframeError(false)
    setIframeLoading(true)
    setIframeKey((k) => k + 1)
  }

  function handleReload() {
    setIframeError(false)
    setIframeLoading(true)
    setIframeKey((k) => k + 1)
  }

  const inputError = inputValue.trim() !== '' && !isValidUrl(normalizeUrl(inputValue))

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">

      {/* Header */}
      <div className="border-b border-border bg-card px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                  <Smartphone className="h-4.5 w-4.5 text-primary" />
                </div>
                <h1 className="font-heading text-xl font-bold text-foreground">
                  Free Mobile Friendliness Checker — Test Any Website Instantly
                </h1>
              </div>
              <p className="mt-1 text-sm text-muted-foreground ml-11">
                See exactly how any website looks on iPhone, Android, tablet, or desktop — in real device screen sizes. No installs, no sign-up. Just enter a URL and get an instant mobile preview, free.
              </p>
            </div>
            <div className="flex items-center gap-2 ml-11 sm:ml-0">
              <Badge variant="secondary" className="text-xs">Free Tool</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* URL Bar */}
      <div className="border-b border-border bg-card/50 px-4 py-3 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className={cn(
                  'pl-9 font-mono text-sm',
                  inputError && 'border-red-500 focus-visible:ring-red-500'
                )}
                placeholder="Enter website URL  e.g. https://example.com"
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
            <Button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
              disabled={!inputValue.trim() || inputError}
            >
              Check
            </Button>
          </form>
        </div>
      </div>

      {/* Toolbar */}
      <div className="border-b border-border bg-card/30 px-4 py-2.5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center gap-4">

          {/* Category tabs */}
          <div className="flex items-center gap-1 rounded-lg border border-border bg-muted p-1">
            {(['phone', 'tablet', 'desktop'] as const).map((cat) => {
              const icons = { phone: Smartphone, tablet: Tablet, desktop: Monitor }
              const Icon = icons[cat]
              const isActive = activeCategory === cat
              return (
                <button
                  key={cat}
                  onClick={() => {
                    const first = DEVICES.find((d) => d.category === cat)
                    if (first) setSelectedDevice(first)
                    setIsRotated(false)
                  }}
                  className={cn(
                    'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-all',
                    isActive
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
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
            {DEVICES.filter((d) => d.category === activeCategory).map((device) => (
              <button
                key={device.id}
                onClick={() => {
                  setSelectedDevice(device)
                  setIsRotated(false)
                }}
                className={cn(
                  'rounded-md border px-2.5 py-1 text-xs font-medium transition-all',
                  selectedDevice.id === device.id
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground'
                )}
              >
                {device.label}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Rotate (phones/tablets only) */}
            {activeCategory !== 'desktop' && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 px-2.5 text-xs"
                onClick={() => setIsRotated((r) => !r)}
                title="Rotate device"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {isRotated ? 'Portrait' : 'Landscape'}
              </Button>
            )}

            {/* Scale */}
            <div className="flex items-center gap-1 rounded-lg border border-border bg-muted p-1">
              {SCALE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setScale(opt.value)}
                  className={cn(
                    'rounded-md px-2.5 py-1 text-xs font-medium transition-all',
                    scale === opt.value
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Reload */}
            {activeUrl && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={handleReload}
                title="Reload"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            )}

            {/* Open in new tab */}
            {activeUrl && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => window.open(activeUrl, '_blank')}
                title="Open in new tab"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex flex-1 flex-col items-center justify-start overflow-auto bg-muted/40 px-4 py-8 sm:px-6 lg:px-8">

        {!activeUrl ? (
          /* Empty state */
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-dashed border-border bg-background">
              <Smartphone className="h-9 w-9 text-muted-foreground" />
            </div>
            <div>
              <p className="font-heading font-semibold text-foreground">No website loaded</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Enter a URL above and click <strong>Check</strong> to preview it in mobile view.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 text-left mt-2">
              {[
                { icon: CheckCircle2, text: 'Test any public website instantly' },
                { icon: CheckCircle2, text: 'Switch between devices & orientations' },
                { icon: CheckCircle2, text: 'Zoom in/out with scale controls' },
              ].map((tip) => (
                <div key={tip.text} className="flex items-start gap-2 rounded-lg border border-border bg-background px-4 py-3">
                  <tip.icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span className="text-xs text-muted-foreground">{tip.text}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            {/* Device info pill */}
            <div className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
              {(() => {
                const Icon = selectedDevice.icon
                return <Icon className="h-3.5 w-3.5" />
              })()}
              {selectedDevice.label}
              <span className="text-border">|</span>
              {frameWidth} × {frameHeight}px
              <span className="text-border">|</span>
              {Math.round(scale * 100)}% zoom
            </div>

            {/* Device frame */}
            <div
              className={cn(
                'relative rounded-[2rem] border-[6px] border-foreground/20 bg-foreground/10 shadow-2xl transition-all duration-300',
                selectedDevice.category === 'desktop' && 'rounded-xl border-[8px]'
              )}
              style={{
                width: scaledWidth + 12,
                height: scaledHeight + 12,
              }}
            >
              {/* Notch (phones only) */}
              {selectedDevice.category === 'phone' && !isRotated && (
                <div className="absolute left-1/2 top-2 z-10 h-5 w-20 -translate-x-1/2 rounded-full bg-foreground/20" />
              )}

              {/* Loading overlay */}
              {iframeLoading && !iframeError && (
                <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[1.4rem] bg-background/90 backdrop-blur-sm">
                  <div className="flex flex-col items-center gap-3">
                    <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                    <p className="text-xs text-muted-foreground">Loading website...</p>
                  </div>
                </div>
              )}

              {/* Error overlay */}
              {iframeError && (
                <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[1.4rem] bg-background/95">
                  <div className="flex flex-col items-center gap-3 px-6 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                      <AlertCircle className="h-6 w-6 text-red-500" />
                    </div>
                    <div>
                      <p className="font-heading font-semibold text-foreground">Cannot display this site</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        This website has blocked embedding in iframes (X-Frame-Options / CSP). Try opening it in a new tab.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5"
                      onClick={() => window.open(activeUrl, '_blank')}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Open in New Tab
                    </Button>
                  </div>
                </div>
              )}

              {/* iframe */}
              <div
                className="overflow-hidden rounded-[1.5rem]"
                style={{ width: scaledWidth, height: scaledHeight }}
              >
                <iframe
                  key={iframeKey}
                  ref={iframeRef}
                  src={activeUrl}
                  title="Website Preview"
                  className="origin-top-left border-0 bg-white"
                  style={{
                    width: frameWidth,
                    height: frameHeight,
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                  }}
                  onLoad={() => setIframeLoading(false)}
                  onError={() => {
                    setIframeLoading(false)
                    setIframeError(true)
                  }}
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                />
              </div>
            </div>

            {/* Note about X-Frame-Options */}
            <p className="max-w-sm text-center text-xs text-muted-foreground">
              Note: Some sites block embedding due to security policies. Use &quot;Open in New Tab&quot; if the preview fails to load.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
