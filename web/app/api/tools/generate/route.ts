import { NextResponse } from 'next/server'
import { z } from 'zod'

import { runTool, type ToolKind } from '@/lib/ai'
import { clientIp, rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const KINDS = ['cold_email', 'linkedin_post', 'icp', 'linkedin_message', 'email_sequence'] as const

const schema = z.object({
  kind: z.enum(KINDS),
  input: z.record(z.string().max(4000)).refine((value) => Object.keys(value).length <= 12, {
    message: 'Too many fields',
  }),
})

/** Public, unauthenticated — so it is rate limited per IP. */
export async function POST(request: Request) {
  const ip = clientIp(request.headers)
  const limit = rateLimit(`tools:${ip}`, 12, 3600)

  if (!limit.ok) {
    return NextResponse.json(
      { error: 'You have used the free tools quite a lot in the last hour. Try again shortly, or start a trial for unlimited generations.' },
      { status: 429, headers: { 'retry-after': String(limit.retryAfterSeconds) } }
    )
  }

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const parsed = schema.safeParse(payload)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Please fill in the required fields.' }, { status: 400 })
  }

  try {
    const result = await runTool(parsed.data.kind as ToolKind, parsed.data.input)
    return NextResponse.json({
      text: result.data.text,
      source: result.source,
      note: result.note ?? null,
      remaining: limit.remaining,
    })
  } catch {
    return NextResponse.json({ error: 'Generation failed. Please try again.' }, { status: 502 })
  }
}
