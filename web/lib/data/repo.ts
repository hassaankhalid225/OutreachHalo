import 'server-only'

import { API_BASE_URL, hasBackend, isDemoMode } from '@/lib/env'
import { getAccessToken } from '@/lib/supabase/server'
import * as demo from './store'
import type {
  ActivityPoint,
  Agent,
  AutomationLogEntry,
  BusinessProfile,
  ConnectedAccount,
  ContentPost,
  Conversation,
  DashboardStats,
  IcpProfile,
  IntentTag,
  OrgSettings,
  Paginated,
  Prospect,
  ProspectFilters,
  Sequence,
  SequenceStep,
  TeamMember,
} from '@/lib/types'

/**
 * The single data surface used by every server component and route handler.
 *
 * In live mode each call hits the FastAPI backend with the caller's Supabase
 * JWT (the backend re-derives `org_id` from the token and scopes every query by
 * it — a client-supplied org id is never trusted). In demo mode it reads and
 * writes the in-memory store.
 */

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message)
    this.name = 'ApiError'
  }

  /** The backend could not be contacted at all, as opposed to answering with an error. */
  get isUnreachable() {
    return this.status === 0
  }
}

async function api<T>(path: string, init?: RequestInit & { query?: Record<string, unknown> }): Promise<T> {
  const token = await getAccessToken()
  const url = new URL(`${API_BASE_URL}${path}`)

  for (const [key, value] of Object.entries(init?.query ?? {})) {
    if (value === undefined || value === null || value === '') continue
    if (Array.isArray(value)) value.forEach((v) => url.searchParams.append(key, String(v)))
    else url.searchParams.set(key, String(value))
  }

  let response: Response
  try {
    response = await fetch(url, {
      ...init,
      headers: {
        'content-type': 'application/json',
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...init?.headers,
      },
      cache: 'no-store',
    })
  } catch {
    // A connection refused here surfaces as a bare "TypeError: fetch failed",
    // which tells nobody anything. Replace it with the two things that actually
    // fix it.
    throw new ApiError(
      `Cannot reach the API at ${API_BASE_URL}. Either start the backend ` +
        `(cd api && uvicorn app.main:app --reload --port 8000), or remove ` +
        `API_BASE_URL from web/.env.local to run on the built-in demo data.`,
      0
    )
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new ApiError(detail || `Request to ${path} failed`, response.status)
  }

  return (await response.json()) as T
}

/** True when reads/writes should go to the backend rather than the demo store. */
const live = () => !isDemoMode && hasBackend

/* ====================================================== Dashboard */

export async function getDashboardStats(): Promise<DashboardStats> {
  return live() ? api<DashboardStats>('/api/dashboard/stats') : demo.dashboardStats()
}

export async function getActivitySeries(days = 14): Promise<ActivityPoint[]> {
  return live() ? api<ActivityPoint[]>('/api/dashboard/activity', { query: { days } }) : demo.activitySeries(days)
}

export async function getActivityFeed(limit = 6): Promise<AutomationLogEntry[]> {
  return live() ? api<AutomationLogEntry[]>('/api/dashboard/feed', { query: { limit } }) : demo.activityFeed(limit)
}

/* ====================================================== Prospects */

export async function getProspects(filters: ProspectFilters = {}): Promise<Paginated<Prospect>> {
  return live() ? api<Paginated<Prospect>>('/api/prospects', { query: filters as Record<string, unknown> }) : demo.listProspects(filters)
}

export async function getProspectDetail(id: string) {
  return live() ? api<ReturnType<typeof demo.getProspect>>(`/api/prospects/${id}`) : demo.getProspect(id)
}

export async function submitProspectFeedback(id: string, isGoodFit: boolean) {
  return live()
    ? api(`/api/prospects/${id}/feedback`, { method: 'POST', body: JSON.stringify({ is_good_fit: isGoodFit }) })
    : demo.recordFeedback(id, isGoodFit)
}

export async function addProspectToSequence(prospectId: string, sequenceId: string) {
  return live()
    ? api(`/api/prospects/${prospectId}/add-to-sequence`, { method: 'POST', body: JSON.stringify({ sequence_id: sequenceId }) })
    : demo.enrollProspect(prospectId, sequenceId)
}

export async function getSignalOptions(): Promise<string[]> {
  return live() ? api<string[]>('/api/prospects/signals') : demo.allSignals()
}

/* ====================================================== Sequences */

export async function getSequences(): Promise<Sequence[]> {
  return live() ? api<Sequence[]>('/api/sequences') : demo.listSequences()
}

export async function getSequenceDetail(id: string) {
  return live() ? api<ReturnType<typeof demo.getSequence>>(`/api/sequences/${id}`) : demo.getSequence(id)
}

export async function createSequence(name: string) {
  return live() ? api<Sequence>('/api/sequences', { method: 'POST', body: JSON.stringify({ name }) }) : demo.createSequence(name)
}

export async function updateSequence(id: string, patch: Partial<Sequence>) {
  return live()
    ? api<Sequence>(`/api/sequences/${id}`, { method: 'PUT', body: JSON.stringify(patch) })
    : demo.updateSequence(id, patch)
}

export async function saveSequenceSteps(id: string, steps: Omit<SequenceStep, 'id' | 'sequence_id'>[]) {
  return live()
    ? api<Sequence>(`/api/sequences/${id}/steps`, { method: 'POST', body: JSON.stringify({ steps }) })
    : demo.saveSteps(id, steps)
}

export async function enrollProspects(sequenceId: string, prospectIds: string[]) {
  if (live()) {
    return api(`/api/sequences/${sequenceId}/enroll`, { method: 'POST', body: JSON.stringify({ prospect_ids: prospectIds }) })
  }
  return prospectIds.map((id) => demo.enrollProspect(id, sequenceId))
}

/* ========================================================== Inbox */

export async function getConversations(opts: { intent?: IntentTag | 'all'; search?: string } = {}): Promise<Conversation[]> {
  return live() ? api<Conversation[]>('/api/inbox', { query: opts as Record<string, unknown> }) : demo.listConversations(opts)
}

export async function getConversationDetail(id: string) {
  return live() ? api<ReturnType<typeof demo.getConversation>>(`/api/inbox/${id}/messages`) : demo.getConversation(id)
}

export async function markRead(id: string) {
  return live() ? api(`/api/inbox/${id}/read`, { method: 'POST' }) : demo.markConversationRead(id)
}

export async function sendConversationReply(id: string, body: string, aiGenerated: boolean, channel: 'linkedin' | 'email') {
  return live()
    ? api(`/api/inbox/${id}/reply`, { method: 'POST', body: JSON.stringify({ body, ai_generated: aiGenerated, channel }) })
    : demo.sendReply(id, body, aiGenerated, channel)
}

export async function toggleAutopilot(id: string, enabled: boolean) {
  return live()
    ? api(`/api/inbox/${id}/autopilot`, { method: 'PATCH', body: JSON.stringify({ enabled }) })
    : demo.setAutopilot(id, enabled)
}

export async function updateIntentTag(id: string, tag: IntentTag) {
  return live()
    ? api(`/api/inbox/${id}/intent`, { method: 'PATCH', body: JSON.stringify({ intent_tag: tag }) })
    : demo.setIntentTag(id, tag)
}

/* ======================================================== Content */

export async function getPosts(): Promise<ContentPost[]> {
  return live() ? api<ContentPost[]>('/api/content') : demo.listPosts()
}

export async function getVoiceSample() {
  return live() ? api<{ sample_text: string } | null>('/api/content/voice') : demo.getVoiceSample()
}

export async function saveVoiceSample(text: string) {
  return live()
    ? api('/api/content/voice', { method: 'POST', body: JSON.stringify({ sample_text: text }) })
    : demo.saveVoiceSample(text)
}

export async function createPost(bodyText: string, status: ContentPost['status'], scheduledAt?: string | null) {
  return live()
    ? api<ContentPost>('/api/content', { method: 'POST', body: JSON.stringify({ body_text: bodyText, status, scheduled_at: scheduledAt }) })
    : demo.createPost(bodyText, status, scheduledAt)
}

export async function updatePost(id: string, patch: Partial<ContentPost>) {
  return live()
    ? api<ContentPost>(`/api/content/${id}`, { method: 'PATCH', body: JSON.stringify(patch) })
    : demo.updatePost(id, patch)
}

export async function deletePost(id: string) {
  return live() ? api(`/api/content/${id}`, { method: 'DELETE' }) : demo.deletePost(id)
}

/* ========================================================= Agents */

export async function getAgents(): Promise<Agent[]> {
  return live() ? api<Agent[]>('/api/agents') : demo.listAgents()
}

export async function createAgent(name: string) {
  return live() ? api<Agent>('/api/agents', { method: 'POST', body: JSON.stringify({ name }) }) : demo.createAgent(name)
}

export async function updateAgent(id: string, patch: Partial<Agent>) {
  return live() ? api<Agent>(`/api/agents/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }) : demo.updateAgent(id, patch)
}

/* =================================================== Integrations */

export async function getAccounts(): Promise<ConnectedAccount[]> {
  return live() ? api<ConnectedAccount[]>('/api/accounts') : demo.listAccounts()
}

export async function connectAccount(provider: ConnectedAccount['provider']) {
  return live()
    ? api('/api/accounts/connect', { method: 'POST', body: JSON.stringify({ provider }) })
    : demo.connectAccount(provider)
}

export async function disconnectAccount(id: string) {
  return live() ? api(`/api/accounts/${id}/disconnect`, { method: 'POST' }) : demo.disconnectAccount(id)
}

export async function setAccountCap(id: string, cap: number) {
  return live()
    ? api(`/api/accounts/${id}`, { method: 'PATCH', body: JSON.stringify({ daily_cap: cap }) })
    : demo.setDailyCap(id, cap)
}

/* ======================================================= Settings */

export async function getSettings(): Promise<OrgSettings> {
  return live() ? api<OrgSettings>('/api/settings') : demo.getSettings()
}

export async function updateSettings(patch: Partial<OrgSettings>) {
  return live() ? api<OrgSettings>('/api/settings', { method: 'PATCH', body: JSON.stringify(patch) }) : demo.updateSettings(patch)
}

export async function getIcp(): Promise<IcpProfile> {
  return live() ? api<IcpProfile>('/api/icp') : demo.getIcp()
}

export async function saveIcp(patch: Partial<IcpProfile>) {
  return live() ? api<IcpProfile>('/api/icp', { method: 'POST', body: JSON.stringify(patch) }) : demo.updateIcp(patch)
}

export async function getBusinessProfile(): Promise<BusinessProfile> {
  return live() ? api<BusinessProfile>('/api/business-profile') : demo.getBusiness()
}

export async function saveBusinessProfile(patch: Partial<BusinessProfile>) {
  return live()
    ? api<BusinessProfile>('/api/business-profile', { method: 'POST', body: JSON.stringify(patch) })
    : demo.updateBusiness(patch)
}

/* ======================================================== Billing */

export async function getBilling() {
  return live()
    ? api<ReturnType<typeof demo.getBilling>>('/api/billing/usage')
    : demo.getBilling()
}

export async function changePlan(plan: 'pro' | 'growth' | 'custom') {
  return live() ? api('/api/billing/checkout', { method: 'POST', body: JSON.stringify({ plan }) }) : demo.setPlan(plan)
}

export async function cancelSubscription() {
  return live() ? api('/api/billing/cancel', { method: 'POST' }) : demo.cancelSubscription()
}

export async function resumeSubscription() {
  return live() ? api('/api/billing/resume', { method: 'POST' }) : demo.resumeSubscription()
}

/* =========================================================== Team */

export async function getTeam(): Promise<TeamMember[]> {
  return live() ? api<TeamMember[]>('/api/team') : demo.listTeam()
}

export async function inviteMember(email: string, role: 'admin' | 'member') {
  return live() ? api('/api/team/invite', { method: 'POST', body: JSON.stringify({ email, role }) }) : demo.inviteMember(email, role)
}

export async function revokeInvite(id: string) {
  return live() ? api(`/api/team/${id}`, { method: 'DELETE' }) : demo.revokeInvite(id)
}
