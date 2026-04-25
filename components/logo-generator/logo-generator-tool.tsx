'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import {
  Download,
  RefreshCw,
  Type,
  Shapes,
  Palette,
  LayoutTemplate,
  ChevronDown,
  Check,
  Minus,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'

// ─── Types ───────────────────────────────────────────────────────────────────

type IconShape =
  | 'none'
  | 'circle'
  | 'square'
  | 'rounded-square'
  | 'diamond'
  | 'hexagon'
  | 'triangle'
  | 'ring'
  | 'cross'
  | 'star'
  | 'arrow'
  | 'bolt'

type Layout = 'icon-left' | 'icon-top' | 'icon-right' | 'icon-only' | 'text-only' | 'stacked'

interface LogoConfig {
  companyName: string
  tagline: string
  layout: Layout
  iconShape: IconShape
  iconColor: string
  textColor: string
  bgColor: string
  bgStyle: 'solid' | 'transparent' | 'pill' | 'rounded'
  fontStyle: 'sans' | 'serif' | 'mono' | 'display'
  fontWeight: 400 | 500 | 600 | 700 | 800
  letterSpacing: number
  iconSize: number
  fontSize: number
  taglineFontSize: number
  showTagline: boolean
  iconLetter: string
  useIconLetter: boolean
  gap: number
}

// ─── Constants ───────────────────────────────────────────────────────────────

const FONT_FAMILIES: Record<LogoConfig['fontStyle'], string> = {
  sans: 'Inter, Arial, sans-serif',
  serif: 'Georgia, "Times New Roman", serif',
  mono: '"Courier New", Courier, monospace',
  display: '"Space Grotesk", "Trebuchet MS", sans-serif',
}

const COLOR_PRESETS = [
  { label: 'Indigo', icon: '#4F46E5', text: '#1E1B4B', bg: '#EEF2FF' },
  { label: 'Slate', icon: '#1E293B', text: '#0F172A', bg: '#F1F5F9' },
  { label: 'Rose', icon: '#E11D48', text: '#881337', bg: '#FFF1F2' },
  { label: 'Teal', icon: '#0D9488', text: '#134E4A', bg: '#F0FDFA' },
  { label: 'Amber', icon: '#D97706', text: '#78350F', bg: '#FFFBEB' },
  { label: 'Violet', icon: '#7C3AED', text: '#2E1065', bg: '#F5F3FF' },
  { label: 'Emerald', icon: '#059669', text: '#064E3B', bg: '#ECFDF5' },
  { label: 'Onyx', icon: '#18181B', text: '#18181B', bg: '#FAFAFA' },
]

const ICON_SHAPES: { value: IconShape; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'circle', label: 'Circle' },
  { value: 'rounded-square', label: 'Rounded' },
  { value: 'square', label: 'Square' },
  { value: 'diamond', label: 'Diamond' },
  { value: 'hexagon', label: 'Hexagon' },
  { value: 'triangle', label: 'Triangle' },
  { value: 'ring', label: 'Ring' },
  { value: 'cross', label: 'Cross' },
  { value: 'star', label: 'Star' },
  { value: 'arrow', label: 'Arrow' },
  { value: 'bolt', label: 'Bolt' },
]

const LAYOUTS: { value: Layout; label: string }[] = [
  { value: 'icon-left', label: 'Icon Left' },
  { value: 'icon-right', label: 'Icon Right' },
  { value: 'icon-top', label: 'Icon Top' },
  { value: 'stacked', label: 'Stacked' },
  { value: 'icon-only', label: 'Icon Only' },
  { value: 'text-only', label: 'Text Only' },
]

const FONT_STYLES: { value: LogoConfig['fontStyle']; label: string }[] = [
  { value: 'display', label: 'Display' },
  { value: 'sans', label: 'Sans-serif' },
  { value: 'serif', label: 'Serif' },
  { value: 'mono', label: 'Monospace' },
]

const FONT_WEIGHTS: { value: LogoConfig['fontWeight']; label: string }[] = [
  { value: 400, label: 'Regular' },
  { value: 500, label: 'Medium' },
  { value: 600, label: 'Semibold' },
  { value: 700, label: 'Bold' },
  { value: 800, label: 'Extrabold' },
]

const DEFAULT_CONFIG: LogoConfig = {
  companyName: 'Ai Ranko',
  tagline: 'AI-Powered Tools',
  layout: 'icon-left',
  iconShape: 'rounded-square',
  iconColor: '#4F46E5',
  textColor: '#1E1B4B',
  bgColor: '#EEF2FF',
  bgStyle: 'transparent',
  fontStyle: 'display',
  fontWeight: 700,
  letterSpacing: 0,
  iconSize: 48,
  fontSize: 28,
  taglineFontSize: 13,
  showTagline: false,
  iconLetter: '',
  useIconLetter: true,
  gap: 14,
}

// ─── SVG Icon Shape Renderer ─────────────────────────────────────────────────

function renderIconShape(
  shape: IconShape,
  size: number,
  color: string,
  bgColor: string,
  letter: string,
  useIconLetter: boolean,
  fontStyle: LogoConfig['fontStyle'],
  fontWeight: LogoConfig['fontWeight'],
): string {
  const cx = size / 2
  const cy = size / 2
  const r = size * 0.45
  const font = FONT_FAMILIES[fontStyle]
  const letterFontSize = size * 0.44
  const displayLetter = letter || '?'

  const letterEl = useIconLetter
    ? `<text x="${cx}" y="${cy}" font-size="${letterFontSize}" font-family="${font}" font-weight="${fontWeight}" fill="${bgColor === 'transparent' ? color : bgColor === '#FFFFFF' || bgColor === '#ffffff' ? color : '#ffffff'}" text-anchor="middle" dominant-baseline="central" letter-spacing="0">${displayLetter}</text>`
    : ''

  switch (shape) {
    case 'none':
      return ''
    case 'circle':
      return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" />${letterEl}`
    case 'square':
      return `<rect x="${cx - r}" y="${cy - r}" width="${r * 2}" height="${r * 2}" fill="${color}" />${letterEl}`
    case 'rounded-square': {
      const rad = size * 0.18
      return `<rect x="${cx - r}" y="${cy - r}" width="${r * 2}" height="${r * 2}" rx="${rad}" ry="${rad}" fill="${color}" />${letterEl}`
    }
    case 'diamond': {
      const d = r * 1.05
      return `<polygon points="${cx},${cy - d} ${cx + d},${cy} ${cx},${cy + d} ${cx - d},${cy}" fill="${color}" />${letterEl}`
    }
    case 'hexagon': {
      const pts = Array.from({ length: 6 }, (_, i) => {
        const a = (Math.PI / 180) * (60 * i - 30)
        return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`
      }).join(' ')
      return `<polygon points="${pts}" fill="${color}" />${letterEl}`
    }
    case 'triangle': {
      const h = r * 1.7
      const w = r * 1.9
      return `<polygon points="${cx},${cy - h * 0.55} ${cx + w * 0.5},${cy + h * 0.45} ${cx - w * 0.5},${cy + h * 0.45}" fill="${color}" />${letterEl}`
    }
    case 'ring':
      return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="${size * 0.1}" />
              <circle cx="${cx}" cy="${cy}" r="${r * 0.52}" fill="${color}" />`
    case 'cross': {
      const t = r * 0.32
      return `<rect x="${cx - t}" y="${cy - r}" width="${t * 2}" height="${r * 2}" rx="${t * 0.4}" fill="${color}" />
              <rect x="${cx - r}" y="${cy - t}" width="${r * 2}" height="${t * 2}" rx="${t * 0.4}" fill="${color}" />`
    }
    case 'star': {
      const pts = Array.from({ length: 10 }, (_, i) => {
        const angle = (Math.PI / 5) * i - Math.PI / 2
        const rad = i % 2 === 0 ? r : r * 0.45
        return `${cx + rad * Math.cos(angle)},${cy + rad * Math.sin(angle)}`
      }).join(' ')
      return `<polygon points="${pts}" fill="${color}" />${letterEl}`
    }
    case 'arrow': {
      const hw = r * 0.55
      const hh = r * 0.9
      const sw = r * 0.28
      const sh = r * 0.55
      return `<polygon points="${cx},${cy - hh} ${cx + hw},${cy} ${cx + sw * 0.6},${cy} ${cx + sw * 0.6},${cy + sh} ${cx - sw * 0.6},${cy + sh} ${cx - sw * 0.6},${cy} ${cx - hw},${cy}" fill="${color}" />`
    }
    case 'bolt': {
      const bx1 = cx + r * 0.1, bx2 = cx - r * 0.15
      return `<polygon points="${cx - r * 0.05},${cy - r * 0.95} ${cx + r * 0.5},${cy - r * 0.05} ${bx1},${cy - r * 0.05} ${cx + r * 0.15},${cy + r * 0.95} ${cx - r * 0.5},${cy + r * 0.1} ${bx2},${cy + r * 0.1}" fill="${color}" />`
    }
    default:
      return ''
  }
}

// ─── Core SVG Builder ────────────────────────────────────────────────────────

function buildLogoSVG(config: LogoConfig, canvasW = 600, canvasH = 200): string {
  const {
    companyName,
    tagline,
    layout,
    iconShape,
    iconColor,
    textColor,
    bgColor,
    bgStyle,
    fontStyle,
    fontWeight,
    letterSpacing,
    iconSize,
    fontSize,
    taglineFontSize,
    showTagline,
    iconLetter,
    useIconLetter,
    gap,
  } = config

  const font = FONT_FAMILIES[fontStyle]
  const letterToUse = iconLetter || companyName.charAt(0).toUpperCase()
  const iconSvg = iconShape !== 'none'
    ? renderIconShape(iconShape, iconSize, iconColor, bgColor, letterToUse, useIconLetter, fontStyle, fontWeight)
    : ''

  const textBlockH = showTagline ? fontSize + 6 + taglineFontSize : fontSize
  const cx = canvasW / 2
  const cy = canvasH / 2

  // Background
  let bgEl = ''
  if (bgStyle === 'solid') {
    bgEl = `<rect width="${canvasW}" height="${canvasH}" fill="${bgColor}" />`
  } else if (bgStyle === 'pill') {
    const ph = canvasH * 0.72
    const pw = canvasW * 0.78
    bgEl = `<rect x="${(canvasW - pw) / 2}" y="${(canvasH - ph) / 2}" width="${pw}" height="${ph}" rx="${ph / 2}" fill="${bgColor}" />`
  } else if (bgStyle === 'rounded') {
    const ph = canvasH * 0.82
    const pw = canvasW * 0.82
    bgEl = `<rect x="${(canvasW - pw) / 2}" y="${(canvasH - ph) / 2}" width="${pw}" height="${ph}" rx="24" fill="${bgColor}" />`
  }

  // Text elements
  const nameEl = `<text font-family="${font}" font-size="${fontSize}" font-weight="${fontWeight}" fill="${textColor}" letter-spacing="${letterSpacing}" text-anchor="middle" dominant-baseline="central">{NAME_X}{NAME_Y}${companyName}</text>`
  const tagEl = showTagline
    ? `<text font-family="${font}" font-size="${taglineFontSize}" font-weight="400" fill="${textColor}" opacity="0.6" letter-spacing="${Math.max(0, letterSpacing + 1)}" text-anchor="middle" dominant-baseline="central">{TAG_X}{TAG_Y}${tagline}</text>`
    : ''

  // Layout positioning
  let iconG = ''
  let textG = ''

  if (layout === 'text-only') {
    const ny = showTagline ? cy - (fontSize / 2 + 3) : cy
    const ty = cy + (fontSize / 2 + 3) + taglineFontSize / 2
    textG = nameEl
      .replace('{NAME_X}', `x="${cx}" `)
      .replace('{NAME_Y}', `y="${ny}" `)
      + (showTagline ? tagEl.replace('{TAG_X}', `x="${cx}" `).replace('{TAG_Y}', `y="${ty}" `) : '')
  } else if (layout === 'icon-only') {
    iconG = `<g transform="translate(${cx - iconSize / 2}, ${cy - iconSize / 2})">${iconSvg}</g>`
  } else if (layout === 'icon-top' || layout === 'stacked') {
    const totalH = iconSize + gap + textBlockH
    const startY = cy - totalH / 2
    iconG = `<g transform="translate(${cx - iconSize / 2}, ${startY})">${iconSvg}</g>`
    const ny = startY + iconSize + gap + fontSize / 2
    const ty = ny + fontSize / 2 + 4 + taglineFontSize / 2
    textG = nameEl
      .replace('{NAME_X}', `x="${cx}" `)
      .replace('{NAME_Y}', `y="${ny}" `)
      + (showTagline ? tagEl.replace('{TAG_X}', `x="${cx}" `).replace('{TAG_Y}', `y="${ty}" `) : '')
  } else if (layout === 'icon-left') {
    const approxTextW = companyName.length * fontSize * 0.62
    const totalW = iconSize + gap + approxTextW
    const startX = cx - totalW / 2
    iconG = `<g transform="translate(${startX}, ${cy - iconSize / 2})">${iconSvg}</g>`
    const tx = startX + iconSize + gap + approxTextW / 2
    const ny = showTagline ? cy - (fontSize / 2 + 2) : cy
    const ty = cy + (fontSize / 2 + 3) + taglineFontSize / 2
    textG = nameEl
      .replace('{NAME_X}', `x="${tx}" `)
      .replace('{NAME_Y}', `y="${ny}" `)
      + (showTagline ? tagEl.replace('{TAG_X}', `x="${tx}" `).replace('{TAG_Y}', `y="${ty}" `) : '')
  } else if (layout === 'icon-right') {
    const approxTextW = companyName.length * fontSize * 0.62
    const totalW = approxTextW + gap + iconSize
    const startX = cx - totalW / 2
    const tx = startX + approxTextW / 2
    const ny = showTagline ? cy - (fontSize / 2 + 2) : cy
    const ty = cy + (fontSize / 2 + 3) + taglineFontSize / 2
    textG = nameEl
      .replace('{NAME_X}', `x="${tx}" `)
      .replace('{NAME_Y}', `y="${ny}" `)
      + (showTagline ? tagEl.replace('{TAG_X}', `x="${tx}" `).replace('{TAG_Y}', `y="${ty}" `) : '')
    iconG = `<g transform="translate(${startX + approxTextW + gap}, ${cy - iconSize / 2})">${iconSvg}</g>`
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${canvasW}" height="${canvasH}" viewBox="0 0 ${canvasW} ${canvasH}">
  ${bgEl}
  ${iconG}
  ${textG}
</svg>`
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ColorSwatch({
  color,
  selected,
  onClick,
}: {
  color: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative h-7 w-7 rounded-full border-2 transition-transform hover:scale-110',
        selected ? 'border-foreground scale-110' : 'border-transparent',
      )}
      style={{ backgroundColor: color }}
      aria-label={color}
    >
      {selected && (
        <Check
          className="absolute inset-0 m-auto h-3.5 w-3.5"
          style={{ color: isLight(color) ? '#000' : '#fff' }}
        />
      )}
    </button>
  )
}

function isLight(hex: string): boolean {
  const c = hex.replace('#', '')
  const r = parseInt(c.substring(0, 2), 16)
  const g = parseInt(c.substring(2, 4), 16)
  const b = parseInt(c.substring(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 155
}

function NumberStepper({
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  value: number
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(Math.max(min, value - step))}
        className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background hover:bg-muted transition-colors"
      >
        <Minus className="h-3 w-3" />
      </button>
      <span className="w-10 text-center text-sm font-medium tabular-nums text-foreground">
        {value}
      </span>
      <button
        onClick={() => onChange(Math.min(max, value + step))}
        className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background hover:bg-muted transition-colors"
      >
        <Plus className="h-3 w-3" />
      </button>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function LogoGeneratorTool() {
  const [config, setConfig] = useState<LogoConfig>(DEFAULT_CONFIG)
  const previewRef = useRef<HTMLDivElement>(null)

  const set = useCallback(<K extends keyof LogoConfig>(key: K, value: LogoConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }, [])

  const applyPreset = (preset: (typeof COLOR_PRESETS)[number]) => {
    setConfig((prev) => ({
      ...prev,
      iconColor: preset.icon,
      textColor: preset.text,
      bgColor: preset.bg,
    }))
  }

  const svgString = buildLogoSVG(config)

  const downloadSVG = () => {
    const blob = new Blob([svgString], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${config.companyName.toLowerCase().replace(/\s+/g, '-')}-logo.svg`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadPNG = useCallback(async (scale = 2) => {
    const W = 600 * scale
    const H = 200 * scale
    const scaledSvg = buildLogoSVG(config, 600 * scale, 200 * scale)
    const svgBlob = new Blob([scaledSvg], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = W
      canvas.height = H
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, W, H)
      canvas.toBlob((blob) => {
        if (!blob) return
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = `${config.companyName.toLowerCase().replace(/\s+/g, '-')}-logo@${scale}x.png`
        a.click()
      }, 'image/png')
      URL.revokeObjectURL(url)
    }
    img.src = url
  }, [config])

  const resetConfig = () => setConfig(DEFAULT_CONFIG)

  // Auto-set letter when name changes
  useEffect(() => {
    if (!config.iconLetter) return
  }, [config.iconLetter])

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      {/* ── Left panel: Controls ─────────────────────────────── */}
      <div className="w-full lg:w-[380px] shrink-0 flex flex-col gap-4">
        <Tabs defaultValue="text">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="text" className="flex items-center gap-1.5 text-xs">
              <Type className="h-3.5 w-3.5" /> Text
            </TabsTrigger>
            <TabsTrigger value="icon" className="flex items-center gap-1.5 text-xs">
              <Shapes className="h-3.5 w-3.5" /> Icon
            </TabsTrigger>
            <TabsTrigger value="colors" className="flex items-center gap-1.5 text-xs">
              <Palette className="h-3.5 w-3.5" /> Colors
            </TabsTrigger>
            <TabsTrigger value="layout" className="flex items-center gap-1.5 text-xs">
              <LayoutTemplate className="h-3.5 w-3.5" /> Layout
            </TabsTrigger>
          </TabsList>

          {/* ── Text Tab ── */}
          <TabsContent value="text" className="mt-4 flex flex-col gap-4">
            <div className="rounded-2xl border border-border bg-card p-4 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Company Name</Label>
                <Input
                  value={config.companyName}
                  onChange={(e) => set('companyName', e.target.value)}
                  placeholder="Your Brand"
                  maxLength={32}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-muted-foreground">Tagline</Label>
                  <button
                    onClick={() => set('showTagline', !config.showTagline)}
                    className={cn(
                      'text-xs font-medium transition-colors',
                      config.showTagline ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {config.showTagline ? 'Hide' : 'Show'}
                  </button>
                </div>
                <Input
                  value={config.tagline}
                  onChange={(e) => set('tagline', e.target.value)}
                  placeholder="Your tagline here"
                  disabled={!config.showTagline}
                  maxLength={48}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-xs font-medium text-muted-foreground">Font Style</Label>
                <div className="grid grid-cols-4 gap-1.5">
                  {FONT_STYLES.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => set('fontStyle', f.value)}
                      className={cn(
                        'rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors',
                        config.fontStyle === f.value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-background text-muted-foreground hover:text-foreground',
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-xs font-medium text-muted-foreground">Font Weight</Label>
                <div className="flex flex-wrap gap-1.5">
                  {FONT_WEIGHTS.map((w) => (
                    <button
                      key={w.value}
                      onClick={() => set('fontWeight', w.value)}
                      className={cn(
                        'rounded-lg border px-2.5 py-1 text-xs transition-colors',
                        config.fontWeight === w.value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-background text-muted-foreground hover:text-foreground',
                      )}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-muted-foreground">Font Size</Label>
                  <NumberStepper
                    value={config.fontSize}
                    min={14}
                    max={72}
                    step={2}
                    onChange={(v) => set('fontSize', v)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Letter Spacing
                  </Label>
                  <span className="text-xs font-medium tabular-nums text-foreground">
                    {config.letterSpacing}
                  </span>
                </div>
                <Slider
                  min={-2}
                  max={12}
                  step={0.5}
                  value={[config.letterSpacing]}
                  onValueChange={([v]) => set('letterSpacing', v)}
                />
              </div>
            </div>
          </TabsContent>

          {/* ── Icon Tab ── */}
          <TabsContent value="icon" className="mt-4 flex flex-col gap-4">
            <div className="rounded-2xl border border-border bg-card p-4 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label className="text-xs font-medium text-muted-foreground">Icon Shape</Label>
                <div className="grid grid-cols-4 gap-1.5">
                  {ICON_SHAPES.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => set('iconShape', s.value)}
                      className={cn(
                        'rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors',
                        config.iconShape === s.value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-background text-muted-foreground hover:text-foreground',
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-muted-foreground">Icon Size</Label>
                  <NumberStepper
                    value={config.iconSize}
                    min={24}
                    max={96}
                    step={4}
                    onChange={(v) => set('iconSize', v)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-muted-foreground">Icon Letter</Label>
                  <button
                    onClick={() => set('useIconLetter', !config.useIconLetter)}
                    className={cn(
                      'text-xs font-medium transition-colors',
                      config.useIconLetter ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {config.useIconLetter ? 'Showing' : 'Hidden'}
                  </button>
                </div>
                <Input
                  value={config.iconLetter}
                  onChange={(e) => set('iconLetter', e.target.value.slice(0, 2).toUpperCase())}
                  placeholder={`Auto (${config.companyName.charAt(0).toUpperCase()})`}
                  maxLength={2}
                  disabled={!config.useIconLetter}
                />
                <p className="text-xs text-muted-foreground">
                  Leave blank to use the first letter of your name.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* ── Colors Tab ── */}
          <TabsContent value="colors" className="mt-4 flex flex-col gap-4">
            <div className="rounded-2xl border border-border bg-card p-4 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label className="text-xs font-medium text-muted-foreground">Color Presets</Label>
                <div className="grid grid-cols-4 gap-2">
                  {COLOR_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      onClick={() => applyPreset(p)}
                      className={cn(
                        'flex flex-col items-center gap-1.5 rounded-xl border p-2.5 transition-colors hover:border-primary/50',
                        config.iconColor === p.icon
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-background',
                      )}
                    >
                      <div
                        className="h-5 w-5 rounded-full border border-black/10"
                        style={{ backgroundColor: p.icon }}
                      />
                      <span className="text-[10px] text-muted-foreground">{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-muted-foreground">Icon Color</Label>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-5 w-5 rounded-full border border-border"
                      style={{ backgroundColor: config.iconColor }}
                    />
                    <input
                      type="color"
                      value={config.iconColor}
                      onChange={(e) => set('iconColor', e.target.value)}
                      className="h-7 w-14 cursor-pointer rounded-md border border-border bg-background p-0.5"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-muted-foreground">Text Color</Label>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-5 w-5 rounded-full border border-border"
                      style={{ backgroundColor: config.textColor }}
                    />
                    <input
                      type="color"
                      value={config.textColor}
                      onChange={(e) => set('textColor', e.target.value)}
                      className="h-7 w-14 cursor-pointer rounded-md border border-border bg-background p-0.5"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Background Color
                  </Label>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-5 w-5 rounded-full border border-border"
                      style={{ backgroundColor: config.bgColor }}
                    />
                    <input
                      type="color"
                      value={config.bgColor}
                      onChange={(e) => set('bgColor', e.target.value)}
                      className="h-7 w-14 cursor-pointer rounded-md border border-border bg-background p-0.5"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  Background Style
                </Label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['transparent', 'solid', 'pill', 'rounded'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => set('bgStyle', s)}
                      className={cn(
                        'rounded-lg border px-2 py-1.5 text-xs font-medium capitalize transition-colors',
                        config.bgStyle === s
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-background text-muted-foreground hover:text-foreground',
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ── Layout Tab ── */}
          <TabsContent value="layout" className="mt-4 flex flex-col gap-4">
            <div className="rounded-2xl border border-border bg-card p-4 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label className="text-xs font-medium text-muted-foreground">Logo Layout</Label>
                <div className="grid grid-cols-3 gap-1.5">
                  {LAYOUTS.map((l) => (
                    <button
                      key={l.value}
                      onClick={() => set('layout', l.value)}
                      className={cn(
                        'rounded-lg border px-2 py-2 text-xs font-medium transition-colors',
                        config.layout === l.value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-background text-muted-foreground hover:text-foreground',
                      )}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-muted-foreground">Gap</Label>
                  <NumberStepper
                    value={config.gap}
                    min={4}
                    max={40}
                    step={2}
                    onChange={(v) => set('gap', v)}
                  />
                </div>
              </div>

              {config.showTagline && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Tagline Size
                    </Label>
                    <NumberStepper
                      value={config.taglineFontSize}
                      min={9}
                      max={24}
                      step={1}
                      onChange={(v) => set('taglineFontSize', v)}
                    />
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Right panel: Preview + Download ─────────────────── */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Preview canvas */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Live Preview</p>
            <button
              onClick={resetConfig}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Reset
            </button>
          </div>

          {/* Checkerboard for transparent backgrounds */}
          <div
            className="flex items-center justify-center rounded-xl overflow-hidden"
            style={{
              minHeight: 180,
              backgroundImage:
                'repeating-conic-gradient(#e5e7eb 0% 25%, #f9fafb 0% 50%)',
              backgroundSize: '20px 20px',
            }}
          >
            <div
              ref={previewRef}
              dangerouslySetInnerHTML={{ __html: svgString }}
              className="w-full max-w-full"
            />
          </div>

          <p className="mt-3 text-center text-xs text-muted-foreground">
            600 &times; 200 px &nbsp;&middot;&nbsp; SVG vector
          </p>
        </div>

        {/* Variant previews — dark & light backgrounds */}
        <div className="grid grid-cols-2 gap-3">
          {['#ffffff', '#18181b'].map((bg) => (
            <div
              key={bg}
              className="flex items-center justify-center rounded-xl p-4"
              style={{ backgroundColor: bg, minHeight: 90 }}
            >
              <div
                dangerouslySetInnerHTML={{ __html: buildLogoSVG(config, 400, 120) }}
                style={{ width: '100%' }}
              />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-1 text-center">
          <p className="text-xs text-muted-foreground">Light background</p>
          <p className="text-xs text-muted-foreground">Dark background</p>
        </div>

        {/* Download actions */}
        <div className="rounded-2xl border border-border bg-card p-4 flex flex-col gap-3">
          <p className="text-sm font-semibold text-foreground">Download</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              onClick={downloadSVG}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Download className="mr-2 h-4 w-4" />
              Download SVG
            </Button>
            <Button
              onClick={() => downloadPNG(2)}
              variant="outline"
              className="flex-1"
            >
              <Download className="mr-2 h-4 w-4" />
              Download PNG @2x
            </Button>
            <Button
              onClick={() => downloadPNG(3)}
              variant="outline"
              className="flex-1"
            >
              <Download className="mr-2 h-4 w-4" />
              PNG @3x
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            SVG is resolution-independent. PNG exports are 1200&times;400 (@2x) and 1800&times;600 (@3x).
          </p>
        </div>
      </div>
    </div>
  )
}
