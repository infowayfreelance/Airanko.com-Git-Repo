'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import {
  ChevronDown,
  ImageIcon,
  Search,
  FileText,
  BarChart2,
  Link2,
  Globe,
  ShieldCheck,
  Cpu,
  Smartphone,
  Images,
  Sparkles,
  PenLine,
  Languages,
  Mic,
  Wand2,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type Tool = {
  icon: React.ComponentType<{ className?: string }>
  label: string
  description: string
  href: string
  badge?: 'New' | 'AI' | 'Pro' | 'Beta'
}

type Category = {
  id: string
  title: string
  description: string
  tools: Tool[]
}

const categories: Category[] = [
  {
    id: 'image',
    title: 'Image AI',
    description: 'Edit, optimize, and generate images',
    tools: [
      {
        icon: ImageIcon,
        label: 'Image Resizer & Converter',
        description: 'Resize, crop & convert to WebP, PNG, JPEG.',
        href: '/tools/image-resizer',
        badge: 'AI',
      },
      {
        icon: Images,
        label: 'Bulk Image Resizer',
        description: 'Process unlimited images at once.',
        href: '/tools/bulk-image-resizer',
        badge: 'New',
      },
      {
        icon: Wand2,
        label: 'AI Image Upscaler',
        description: 'Enhance image resolution up to 4x.',
        href: '#',
        badge: 'AI',
      },
      {
        icon: Sparkles,
        label: 'Background Remover',
        description: 'Remove backgrounds with one click.',
        href: '/tools/background-remover',
        badge: 'New',
      },
    ],
  },
  {
    id: 'seo',
    title: 'SEO AI',
    description: 'Rank higher with smart insights',
    tools: [
      {
        icon: Sparkles,
        label: 'SEO Strategy Maker',
        description: 'Full AI-generated SEO plan & roadmap.',
        href: '/tools/seo-strategy-maker',
        badge: 'AI',
      },
      {
        icon: Link2,
        label: 'Link Extractor',
        description: 'Extract all links from any URL.',
        href: '/tools/link-extractor',
        badge: 'New',
      },
      {
        icon: BarChart2,
        label: 'SEO Rank Tracker',
        description: 'Monitor SERP positions daily.',
        href: '#',
        badge: 'New',
      },
      {
        icon: Globe,
        label: 'Site Audit Tool',
        description: 'Find technical SEO issues fast.',
        href: '#',
      },
    ],
  },
  {
    id: 'content',
    title: 'Content AI',
    description: 'Write better, faster, smarter',
    tools: [
      {
        icon: PenLine,
        label: 'AI Content Writer',
        description: 'Google-ready articles with E-E-A-T signals.',
        href: '/tools/content-writer',
        badge: 'AI',
      },
      {
        icon: Cpu,
        label: 'AI Content Optimizer',
        description: 'Match search intent automatically.',
        href: '#',
        badge: 'AI',
      },
      {
        icon: ShieldCheck,
        label: 'Plagiarism Checker',
        description: 'Verify content originality.',
        href: '#',
      },
      {
        icon: Languages,
        label: 'AI Translator',
        description: 'Translate while preserving SEO.',
        href: '#',
        badge: 'Beta',
      },
    ],
  },
  {
    id: 'utility',
    title: 'Utilities',
    description: 'Essential tools for your stack',
    tools: [
      {
        icon: FileText,
        label: 'Bulk Meta & OG Checker',
        description: 'Audit meta and Open Graph tags.',
        href: '/tools/meta-checker',
        badge: 'New',
      },
      {
        icon: Smartphone,
        label: 'Mobile Friendliness',
        description: 'Test responsive design instantly.',
        href: '/tools/mobile-checker',
      },
      {
        icon: Mic,
        label: 'AI Voice to Text',
        description: 'Transcribe audio with high accuracy.',
        href: '#',
        badge: 'AI',
      },
      {
        icon: TrendingUp,
        label: 'Traffic Analyzer',
        description: 'Estimate any site’s monthly traffic.',
        href: '#',
        badge: 'Pro',
      },
    ],
  },
]

const badgeStyles: Record<NonNullable<Tool['badge']>, string> = {
  New: 'bg-primary/10 text-primary border-primary/20',
  AI: 'bg-accent/15 text-accent-foreground border-accent/30',
  Pro: 'bg-foreground text-background border-foreground',
  Beta: 'bg-muted text-muted-foreground border-border',
}

export function AiToolsMegaMenu() {
  const [open, setOpen] = useState(false)
  const [activeCategoryId, setActiveCategoryId] = useState(categories[0].id)
  const containerRef = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const activeCategory =
    categories.find((c) => c.id === activeCategoryId) ?? categories[0]

  const handleOpen = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setOpen(true)
  }

  const handleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setOpen(false), 120)
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={handleOpen}
      onMouseLeave={handleClose}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex items-center gap-1 text-sm font-medium transition-colors',
          open
            ? 'text-foreground'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        AI Tools
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </button>

      {/* Mega menu panel */}
      <div
        className={cn(
          'absolute left-1/2 top-full z-50 hidden w-screen max-w-5xl -translate-x-1/2 pt-3 md:block',
          open
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0',
        )}
        role="menu"
      >
        <div className="overflow-hidden rounded-2xl border border-border bg-popover shadow-2xl shadow-foreground/5">
          <div className="grid grid-cols-[220px_1fr]">
            {/* Sidebar with categories */}
            <aside className="flex flex-col gap-1 border-r border-border bg-muted/30 p-3">
              {categories.map((category) => {
                const isActive = category.id === activeCategoryId
                return (
                  <button
                    key={category.id}
                    type="button"
                    onMouseEnter={() => setActiveCategoryId(category.id)}
                    onFocus={() => setActiveCategoryId(category.id)}
                    className={cn(
                      'group flex flex-col items-start gap-0.5 rounded-lg px-3 py-2.5 text-left transition-colors',
                      isActive
                        ? 'bg-card text-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-card/60 hover:text-foreground',
                    )}
                  >
                    <span className="font-heading text-sm font-semibold">
                      {category.title}
                    </span>
                    <span className="text-xs leading-snug text-muted-foreground">
                      {category.description}
                    </span>
                  </button>
                )
              })}

              <div className="mt-auto pt-3">
                <Link
                  href="/#tools"
                  className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                  onClick={() => setOpen(false)}
                >
                  Browse all tools
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </aside>

            {/* Tools grid */}
            <div className="p-5">
              <div className="mb-4 flex items-end justify-between">
                <div>
                  <h3 className="font-heading text-base font-semibold text-foreground">
                    {activeCategory.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {activeCategory.description}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {activeCategory.tools.length} tools
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {activeCategory.tools.map((tool) => {
                  const Icon = tool.icon
                  return (
                    <Link
                      key={tool.label}
                      href={tool.href}
                      onClick={() => setOpen(false)}
                      className="group flex items-start gap-3 rounded-xl border border-transparent p-3 transition-all hover:border-border hover:bg-muted/40"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-heading text-sm font-semibold text-foreground">
                            {tool.label}
                          </span>
                          {tool.badge && (
                            <Badge
                              variant="outline"
                              className={cn(
                                'h-5 shrink-0 px-1.5 text-[10px] font-semibold',
                                badgeStyles[tool.badge],
                              )}
                            >
                              {tool.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                          {tool.description}
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>

              {/* Featured banner */}
              <div className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-border bg-gradient-to-r from-primary/5 via-accent/5 to-transparent p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <PenLine className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-heading text-sm font-semibold text-foreground">
                      New: AI Content Writer
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Tuned for Google&apos;s 2025 E-E-A-T &amp; Helpful Content updates.
                    </p>
                  </div>
                </div>
                <Link
                  href="/tools/content-writer"
                  onClick={() => setOpen(false)}
                  className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Try free
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Mobile-friendly version for collapsing into the mobile nav.
 * Renders categorized tool lists with collapsible sections.
 */
export function AiToolsMobileMenu({
  onNavigate,
}: {
  onNavigate?: () => void
}) {
  const [openCategory, setOpenCategory] = useState<string | null>(
    categories[0].id,
  )

  return (
    <div className="flex flex-col gap-1">
      <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        AI Tools
      </p>
      {categories.map((category) => {
        const isOpen = openCategory === category.id
        return (
          <div key={category.id} className="rounded-md">
            <button
              type="button"
              onClick={() =>
                setOpenCategory(isOpen ? null : category.id)
              }
              className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
              aria-expanded={isOpen}
            >
              <span>{category.title}</span>
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-muted-foreground transition-transform',
                  isOpen && 'rotate-180',
                )}
              />
            </button>
            {isOpen && (
              <div className="flex flex-col gap-0.5 pb-2 pl-3">
                {category.tools.map((tool) => {
                  const Icon = tool.icon
                  return (
                    <Link
                      key={tool.label}
                      href={tool.href}
                      onClick={onNavigate}
                      className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <Icon className="h-4 w-4 shrink-0 text-primary" />
                      <span className="truncate">{tool.label}</span>
                      {tool.badge && (
                        <Badge
                          variant="outline"
                          className={cn(
                            'ml-auto h-5 px-1.5 text-[10px] font-semibold',
                            badgeStyles[tool.badge],
                          )}
                        >
                          {tool.badge}
                        </Badge>
                      )}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
