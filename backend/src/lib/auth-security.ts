import type { FastifyRequest } from "fastify"

type RateBucket = {
  count: number
  resetAt: number
}

const buckets = new Map<string, RateBucket>()

function pruneExpiredBuckets(now: number) {
  if (buckets.size < 1000) return

  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(key)
    }
  }
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export function rateLimitKey(prefix: string, value: string) {
  return `${prefix}:${value.trim().toLowerCase()}`
}

export function incrementRateLimit(key: string, windowMs: number) {
  const now = Date.now()
  pruneExpiredBuckets(now)

  const existing = buckets.get(key)
  if (!existing || existing.resetAt <= now) {
    const nextBucket = { count: 1, resetAt: now + windowMs }
    buckets.set(key, nextBucket)
    return nextBucket
  }

  existing.count += 1
  return existing
}

export function readRateLimit(key: string) {
  const bucket = buckets.get(key)
  if (!bucket || bucket.resetAt <= Date.now()) {
    buckets.delete(key)
    return { count: 0, resetAt: 0 }
  }

  return bucket
}

export function clearRateLimit(key: string) {
  buckets.delete(key)
}

export function secondsUntil(resetAt: number) {
  return Math.max(1, Math.ceil((resetAt - Date.now()) / 1000))
}

export async function verifyCaptcha(request: FastifyRequest, token: string | undefined) {
  const captchaSecret = process.env.TURNSTILE_SECRET_KEY
  if (!captchaSecret) {
    request.log.warn("CAPTCHA required but TURNSTILE_SECRET_KEY is not configured")
    return false
  }

  if (!token) {
    return false
  }

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      secret: captchaSecret,
      response: token,
      remoteip: request.ip,
    }),
  })

  if (!response.ok) {
    request.log.warn({ statusCode: response.status }, "CAPTCHA verification request failed")
    return false
  }

  const payload = (await response.json()) as { success?: boolean }
  return payload.success === true
}
