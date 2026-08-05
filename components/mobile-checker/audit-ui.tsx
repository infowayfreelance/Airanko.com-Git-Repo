'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, AlertTriangle, XCircle, Info, Wrench, Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AuditCheck, CheckStatus, Grade } from '@/lib/mobile-checker/audit'

export function scoreToHex(score: number): string {
  if (score >= 90) return '#10b981'
  if (score >= 70) return '#3b82f6'
  if (score >= 50) return '#f59e0b'
  return '#ef4444'
}

export const GRADE_STYLE: Record<Grade, string> = {
  Excellent: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  Good: 'border-blue-200 bg-blue-50 text-blue-700',
  'Needs Work': 'border-amber-200 bg-amber-50 text-amber-700',
  Poor: 'border-red-200 bg-red-50 text-red-700',
}

const STATUS_ICON: Record<CheckStatus, React.ComponentType<{ className?: string }>> = {
  pass: CheckCircle2,
  warning: AlertTriangle,
  fail: XCircle,
  info: Info,
}
const STATUS_STYLE: Record<CheckStatus, string> = {
  pass: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
  fail: 'border-red-200 bg-red-50 text-red-700',
  info: 'border-border bg-muted/50 text-muted-foreground',
}
const STATUS_LABEL: Record<CheckStatus, string> = {
  pass: 'Passed', warning: 'Warning', fail: 'Failed', info: 'Info',
}

export function ScoreGauge({ score, size = 'lg' }: { score: number; size?: 'sm' | 'md' | 'lg' }) {
  const dims = {
    sm: { box: 'h-14 w-14', r: 22, sw: 5, text: 'text-sm' },
    md: { box: 'h-20 w-20', r: 32, sw: 6, text: 'text-xl' },
    lg: { box: 'h-32 w-32', r: 52, sw: 9, text: 'text-3xl' },
  }[size]
  const circumference = 2 * Math.PI * dims.r
  const [animated, setAnimated] = useState(0)
  useEffect(() => { const t = setTimeout(() => setAnimated(score), 80); return () => clearTimeout(t) }, [score])
  const offset = circumference - (animated / 100) * circumference
  const color = scoreToHex(score)
  return (
    <div className={cn('relative flex items-center justify-center', dims.box)}>
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 130 130">
        <circle cx="65" cy="65" r={dims.r} fill="none" strokeWidth={dims.sw} className="stroke-muted" />
        <circle cx="65" cy="65" r={dims.r} fill="none" strokeWidth={dims.sw} stroke={color}
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
      </svg>
      <span className={cn('font-heading font-bold tabular-nums', dims.text)} style={{ color }}>{score}</span>
    </div>
  )
}

export function GradeBadge({ grade }: { grade: Grade }) {
  return (
    <span className={cn('inline-flex items-center rounded-full border px-3 py-1 text-sm font-bold', GRADE_STYLE[grade])}>
      {grade}
    </span>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500) })
      }}
      className="inline-flex shrink-0 items-center gap-1 rounded-md border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground transition-colors hover:text-foreground print:hidden"
    >
      {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

function SolutionBox({ check }: { check: AuditCheck }) {
  if (!check.solution) return null
  return (
    <div className="mt-2 rounded-lg border border-primary/20 bg-primary/5 p-2.5">
      <div className="flex items-start gap-1.5">
        <Wrench className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wide text-primary">How to fix</p>
          <p className="mt-0.5 text-[11px] leading-relaxed text-foreground">{check.solution}</p>
          {check.solutionCode && (
            <div className="relative mt-2">
              <pre className="overflow-x-auto rounded-md bg-foreground/95 p-2 pr-14 text-[10px] leading-relaxed text-background"><code>{check.solutionCode}</code></pre>
              <div className="absolute right-1.5 top-1.5">
                <CopyButton text={check.solutionCode} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function CheckRow({ check, defaultExpanded = false }: { check: AuditCheck; defaultExpanded?: boolean }) {
  const Icon = STATUS_ICON[check.status]
  const hasFix = !!check.solution
  return (
    <div className={cn('rounded-xl border p-3', STATUS_STYLE[check.status])}>
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-4 w-4 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="text-xs font-semibold text-foreground">{check.name}</p>
            <span className={cn('rounded px-1.5 py-0 text-[9px] font-bold uppercase tracking-wide', STATUS_STYLE[check.status])}>
              {STATUS_LABEL[check.status]}
            </span>
            {check.confidence === 'heuristic' && (
              <span className="rounded border border-border bg-background px-1.5 py-0 text-[9px] font-bold uppercase tracking-wide text-muted-foreground" title="Estimated from static HTML/CSS source — a real answer would require full browser rendering.">
                estimated
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{check.detail}</p>
          {hasFix && <SolutionBox check={check} />}
        </div>
      </div>
    </div>
  )
}

/** Prominent "problems + fixes" summary — every non-passing check with its solution, in one place. */
export function IssuesAndFixes({ checks }: { checks: AuditCheck[] }) {
  const issues = checks.filter((c) => (c.status === 'fail' || c.status === 'warning') && c.solution)
  if (issues.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        No issues found — every check that affects the score passed.
      </div>
    )
  }
  const failing = issues.filter((c) => c.status === 'fail')
  const warning = issues.filter((c) => c.status === 'warning')
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <Wrench className="h-4 w-4 text-primary" />
        <p className="text-sm font-bold text-foreground">{issues.length} issue{issues.length === 1 ? '' : 's'} found — with fixes</p>
      </div>
      <div className="space-y-2">
        {[...failing, ...warning].map((c) => <CheckRow key={c.id} check={c} />)}
      </div>
    </div>
  )
}

export function AuditChecklist({ checks, groupByCategory = true }: { checks: AuditCheck[]; groupByCategory?: boolean }) {
  if (!groupByCategory) {
    return <div className="space-y-2">{checks.map((c) => <CheckRow key={c.id} check={c} />)}</div>
  }
  const categories = Array.from(new Set(checks.map((c) => c.category)))
  return (
    <div className="space-y-5">
      {categories.map((cat) => (
        <div key={cat}>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{cat}</p>
          <div className="space-y-2">
            {checks.filter((c) => c.category === cat).map((c) => <CheckRow key={c.id} check={c} />)}
          </div>
        </div>
      ))}
    </div>
  )
}
