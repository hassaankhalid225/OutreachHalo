'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

import { analyzeWebsite, generatePost, generateReply } from '@/lib/ai'
import * as repo from '@/lib/data/repo'
import { clientIp, rateLimit } from '@/lib/rate-limit'
import { getSession } from '@/lib/auth'
import type {
  ConnectedAccount,
  ContentPost,
  IcpProfile,
  IntentTag,
  OrgSettings,
  SequenceStep,
} from '@/lib/types'

/**
 * Every mutation the dashboard performs. Each one re-checks the session, so a
 * stale form post from a signed-out tab cannot write.
 *
 * All actions share one discriminated return shape so callers can narrow with a
 * single `if (!result.ok)` guard and then reach `result.data` safely.
 */

export type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string }

const ok = <T,>(data: T): ActionResult<T> => ({ ok: true, data })
const done = (): ActionResult => ({ ok: true, data: undefined })
const fail = (error: string): ActionResult<never> => ({ ok: false, error })

async function requireSession() {
  const session = await getSession()
  if (!session) throw new Error('Not signed in')
  return session
}

/* ==================================================== Onboarding */

export interface WebsiteAnalysisResult {
  what_you_sell: string
  who_you_target: string
  how_to_pitch: string
  source: string
  note: string | null
  url: string
}

export async function analyzeWebsiteAction(url: string): Promise<ActionResult<WebsiteAnalysisResult>> {
  await requireSession()

  const ip = clientIp(await headers())
  const limit = rateLimit(`analyze:${ip}`, 10, 3600)
  if (!limit.ok) return fail('Too many analyses in the last hour. Try again shortly.')

  let normalized = url.trim()
  if (!/^https?:\/\//i.test(normalized)) normalized = `https://${normalized}`

  try {
    new URL(normalized)
  } catch {
    return fail('That does not look like a valid URL.')
  }

  const result = await analyzeWebsite(normalized)
  return ok({ ...result.data, source: result.source, note: result.note ?? null, url: normalized })
}

export async function saveBusinessProfileAction(input: {
  website_url: string
  what_you_sell: string
  who_you_target: string
  how_to_pitch: string
}): Promise<ActionResult> {
  await requireSession()
  await repo.saveBusinessProfile(input)
  revalidatePath('/app/settings')
  return done()
}

export async function saveIcpAction(input: Partial<IcpProfile>): Promise<ActionResult> {
  await requireSession()
  await repo.saveIcp(input)
  revalidatePath('/app/settings')
  revalidatePath('/app/prospects')
  return done()
}

export async function launchAgentAction(name: string): Promise<ActionResult> {
  await requireSession()
  await repo.createAgent(name || 'Outbound Agent')
  revalidatePath('/app/agents')
  revalidatePath('/app/dashboard')
  return done()
}

/* ===================================================== Prospects */

export async function prospectFeedbackAction(prospectId: string, isGoodFit: boolean): Promise<ActionResult> {
  await requireSession()
  await repo.submitProspectFeedback(prospectId, isGoodFit)
  revalidatePath('/app/prospects')
  revalidatePath('/app/dashboard')
  return done()
}

export async function addToSequenceAction(prospectId: string, sequenceId: string): Promise<ActionResult> {
  await requireSession()
  if (!sequenceId) return fail('Pick a sequence first.')
  await repo.addProspectToSequence(prospectId, sequenceId)
  revalidatePath('/app/prospects')
  revalidatePath('/app/sequences')
  return done()
}

/* ===================================================== Sequences */

export async function createSequenceAction(name: string): Promise<ActionResult<{ id: string }>> {
  await requireSession()
  if (!name.trim()) return fail('Give the sequence a name.')
  const sequence = await repo.createSequence(name.trim())
  revalidatePath('/app/sequences')
  return ok({ id: sequence.id })
}

export async function updateSequenceAction(
  id: string,
  patch: { name?: string; status?: 'draft' | 'active' | 'paused'; approval_mode?: string; description?: string }
): Promise<ActionResult> {
  await requireSession()
  await repo.updateSequence(id, patch as never)
  revalidatePath('/app/sequences')
  revalidatePath(`/app/sequences/${id}`)
  return done()
}

export async function saveStepsAction(
  id: string,
  steps: Omit<SequenceStep, 'id' | 'sequence_id'>[]
): Promise<ActionResult> {
  await requireSession()
  if (steps.length === 0) return fail('A sequence needs at least one step.')
  await repo.saveSequenceSteps(id, steps)
  revalidatePath(`/app/sequences/${id}`)
  return done()
}

/* ========================================================= Inbox */

export async function markReadAction(conversationId: string): Promise<ActionResult> {
  await requireSession()
  await repo.markRead(conversationId)
  revalidatePath('/app/inbox')
  return done()
}

export async function sendReplyAction(
  conversationId: string,
  body: string,
  aiGenerated: boolean,
  channel: 'linkedin' | 'email'
): Promise<ActionResult> {
  await requireSession()
  if (!body.trim()) return fail('Write something first.')
  await repo.sendConversationReply(conversationId, body.trim(), aiGenerated, channel)
  revalidatePath('/app/inbox')
  revalidatePath('/app/dashboard')
  return done()
}

export interface GenerationResult {
  text: string
  source: string
  note: string | null
}

export async function generateReplyAction(conversationId: string): Promise<ActionResult<GenerationResult>> {
  await requireSession()

  const detail = await repo.getConversationDetail(conversationId)
  if (!detail?.conversation) return fail('Conversation not found.')

  const settings = await repo.getSettings()

  const result = await generateReply({
    conversationId,
    prospectName: detail.conversation.prospect.full_name,
    prospectTitle: detail.prospect?.title,
    company: detail.conversation.prospect.company,
    signals: detail.conversation.prospect.signals ?? [],
    intentTag: detail.conversation.intent_tag,
    history: detail.messages.map((m) => ({ direction: m.direction, body: m.body })),
    bookingUrl: settings.booking_url,
  })

  return ok({ text: result.data.text, source: result.source, note: result.note ?? null })
}

export async function toggleAutopilotAction(conversationId: string, enabled: boolean): Promise<ActionResult> {
  await requireSession()
  await repo.toggleAutopilot(conversationId, enabled)
  revalidatePath('/app/inbox')
  return done()
}

export async function setIntentTagAction(conversationId: string, tag: IntentTag): Promise<ActionResult> {
  await requireSession()
  await repo.updateIntentTag(conversationId, tag)
  revalidatePath('/app/inbox')
  return done()
}

/* ======================================================= Content */

export async function saveVoiceSampleAction(text: string): Promise<ActionResult> {
  await requireSession()
  if (text.trim().length < 80) return fail('Paste a bit more — at least a couple of sentences you actually wrote.')
  await repo.saveVoiceSample(text.trim())
  revalidatePath('/app/content')
  return done()
}

export async function generatePostAction(brief: string): Promise<ActionResult<GenerationResult>> {
  await requireSession()
  if (!brief.trim()) return fail('What should the post be about?')

  const [voice, business, icp] = await Promise.all([
    repo.getVoiceSample(),
    repo.getBusinessProfile(),
    repo.getIcp(),
  ])

  const result = await generatePost({
    brief: brief.trim(),
    voiceSample: voice?.sample_text ?? null,
    whatYouSell: business?.what_you_sell ?? null,
    audience: business?.who_you_target ?? icp?.job_titles?.join(', ') ?? null,
  })

  return ok({ text: result.data.text, source: result.source, note: result.note ?? null })
}

export async function savePostAction(
  bodyText: string,
  status: ContentPost['status'],
  scheduledAt?: string | null
): Promise<ActionResult> {
  await requireSession()
  if (!bodyText.trim()) return fail('The post is empty.')
  if (status === 'scheduled' && !scheduledAt) return fail('Pick a date and time to schedule it.')

  await repo.createPost(bodyText.trim(), status, scheduledAt ?? null)
  revalidatePath('/app/content')
  revalidatePath('/app/dashboard')
  return done()
}

export async function updatePostAction(id: string, patch: Partial<ContentPost>): Promise<ActionResult> {
  await requireSession()
  if (patch.body_text !== undefined && !patch.body_text.trim()) return fail('The post is empty.')
  if (patch.status === 'scheduled' && !patch.scheduled_at) return fail('Pick a date and time to schedule it.')
  await repo.updatePost(id, patch)
  revalidatePath('/app/content')
  return done()
}

export async function deletePostAction(id: string): Promise<ActionResult> {
  await requireSession()
  await repo.deletePost(id)
  revalidatePath('/app/content')
  return done()
}

/* ======================================================== Agents */

export async function createAgentAction(name: string): Promise<ActionResult> {
  await requireSession()
  await repo.createAgent(name.trim() || 'New agent')
  revalidatePath('/app/agents')
  return done()
}

export async function updateAgentAction(
  id: string,
  patch: { name?: string; status?: 'active' | 'paused'; approval_mode?: string; daily_cap?: number; tone?: string }
): Promise<ActionResult> {
  await requireSession()
  await repo.updateAgent(id, patch as never)
  revalidatePath('/app/agents')
  return done()
}

/* ================================================== Integrations */

export async function connectAccountAction(provider: ConnectedAccount['provider']): Promise<ActionResult> {
  await requireSession()
  await repo.connectAccount(provider)
  revalidatePath('/app/integrations')
  revalidatePath('/app/billing')
  return done()
}

export async function disconnectAccountAction(id: string): Promise<ActionResult> {
  await requireSession()
  await repo.disconnectAccount(id)
  revalidatePath('/app/integrations')
  revalidatePath('/app/billing')
  return done()
}

export async function setAccountCapAction(id: string, cap: number): Promise<ActionResult> {
  await requireSession()
  await repo.setAccountCap(id, cap)
  revalidatePath('/app/integrations')
  return done()
}

/* ====================================================== Settings */

export async function updateSettingsAction(patch: Partial<OrgSettings>): Promise<ActionResult> {
  await requireSession()
  await repo.updateSettings(patch)
  revalidatePath('/app/settings')
  return done()
}

/* ======================================================= Billing */

export async function changePlanAction(
  plan: 'pro' | 'growth' | 'custom'
): Promise<ActionResult<{ checkoutUrl: string | null }>> {
  await requireSession()
  const result = await repo.changePlan(plan)
  revalidatePath('/app/billing')

  // The live backend returns a Stripe Checkout URL for the browser to follow.
  const url = (result as { url?: string } | null)?.url ?? null
  return ok({ checkoutUrl: url })
}

export async function cancelSubscriptionAction(): Promise<ActionResult> {
  await requireSession()
  await repo.cancelSubscription()
  revalidatePath('/app/billing')
  return done()
}

export async function resumeSubscriptionAction(): Promise<ActionResult> {
  await requireSession()
  await repo.resumeSubscription()
  revalidatePath('/app/billing')
  return done()
}

/* ========================================================== Team */

export async function inviteMemberAction(email: string, role: 'admin' | 'member'): Promise<ActionResult> {
  await requireSession()
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return fail('That email does not look right.')
  const member = await repo.inviteMember(email, role)
  if (!member) return fail('That person is already in the workspace.')
  revalidatePath('/app/team')
  return done()
}

export async function revokeInviteAction(id: string): Promise<ActionResult> {
  await requireSession()
  await repo.revokeInvite(id)
  revalidatePath('/app/team')
  return done()
}
