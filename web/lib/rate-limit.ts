import 'server-only'

/**
 * Fixed-window in-memory rate limiter.
 *
 * Good enough for a single instance and for protecting the public free-tool
 * endpoints from casual abuse. Behind more than one instance, swap the map for
 * Redis — the call signature is deliberately identical to a Redis-backed one.
 */

interface Bucket {
  count: number
  resetAt: number
}

const globalBuckets = globalThis as unknown as { __oh_rate_buckets?: Map<string, Bucket> }
const buckets: Map<string, Bucket> = (globalBuckets.__oh_rate_buckets ??= new Map())

export interface RateLimitResult {
  ok: boolean
  remaining: number
  retryAfterSeconds: number
}

export function rateLimit(key: string, limit: number, windowSeconds: number): RateLimitResult {
  const now = Date.now()
  const bucket = buckets.get(key)

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowSeconds * 1000 })
    return { ok: true, remaining: limit - 1, retryAfterSeconds: 0 }
  }

  bucket.count += 1

  if (bucket.count > limit) {
    return { ok: false, remaining: 0, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) }
  }

  // Opportunistic cleanup so the map cannot grow without bound.
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k)
  }

  return { ok: true, remaining: limit - bucket.count, retryAfterSeconds: 0 }
}

/** Best-effort client IP from the usual proxy headers. */
export function clientIp(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-real-ip') ||
    headers.get('cf-connecting-ip') ||
    'unknown'
  )
}
