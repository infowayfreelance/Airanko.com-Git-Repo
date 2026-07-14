// ──────────────────────────────────────────────────────────────────────────
// Small pure helpers shared by signal implementations. Kept separate from
// signals.ts so the registry file stays focused on rule DEFINITIONS, not
// string-matching plumbing.
// ──────────────────────────────────────────────────────────────────────────

export function countMatches(text: string, regex: RegExp): number {
  const m = text.match(regex)
  return m ? m.length : 0
}

export function uniqueMatches(text: string, regex: RegExp, lower = true): string[] {
  const m = text.match(regex) ?? []
  const set = new Set<string>()
  for (const s of m) set.add(lower ? s.toLowerCase() : s)
  return Array.from(set)
}

/**
 * Extracts capture group 1 from every match of `regex` (which MUST have the
 * global flag). Unlike String.match(), which discards capture groups and
 * returns only whole-match strings under /g, this returns the group you
 * actually asked for — use this any time your pattern has a `(...)`.
 */
export function extractGroup1(text: string, regex: RegExp): string[] {
  const out: string[] = []
  for (const m of text.matchAll(regex)) if (m[1] !== undefined) out.push(m[1])
  return out
}

export function includesAny(haystack: string, needles: string[]): boolean {
  return needles.some((n) => haystack.includes(n))
}

export function countAny(haystack: string, needles: string[]): number {
  return needles.reduce((sum, n) => sum + (haystack.split(n).length - 1), 0)
}

/** Clamp a 0-1 strength value, defaulting to 1 when undefined. */
export function clampStrength(s: number | undefined): number {
  if (s === undefined) return 1
  return Math.max(0, Math.min(1, s))
}

/** Extract every filename (last path segment) from a set of URLs/paths. */
export function filenameOf(pathOrUrl: string): string {
  try {
    const clean = pathOrUrl.split('?')[0].split('#')[0]
    const parts = clean.split('/')
    return parts[parts.length - 1] || ''
  } catch {
    return pathOrUrl
  }
}

export function hostnameOf(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase()
  } catch {
    return null
  }
}
