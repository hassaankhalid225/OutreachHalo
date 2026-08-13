import {
  ALL_SIGNALS,
  DEMO_ORG_ID,
  demoAccounts,
  demoActivity,
  demoAgents,
  demoBusinessProfile,
  demoContentPosts,
  demoConversations,
  demoIcp,
  demoMessages,
  demoOrganization,
  demoProfile,
  demoProspects,
  demoSequences,
  demoSettings,
  demoSubscription,
  demoTeam,
  demoUsage,
  demoVoiceSamples,
} from './fixtures'
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
  Message,
  OrgSettings,
  Paginated,
  Prospect,
  ProspectFilters,
  Sequence,
  SequenceStep,
  Subscription,
  TeamMember,
  UsageCounter,
} from '@/lib/types'

/**
 * In-memory demo store.
 *
 * Runs the whole product with zero configuration so the app is browsable and
 * mutable straight after `npm run dev`. When Supabase + the FastAPI backend are
 * configured, `lib/data/repo.ts` bypasses this entirely and talks to Postgres.
 *
 * State is per server process, which is exactly right for a demo: it resets on
 * restart and never persists someone's fiddling.
 */

interface StoreShape {
  organization: typeof demoOrganization
  profile: typeof demoProfile
  business: BusinessProfile
  icp: IcpProfile
  accounts: ConnectedAccount[]
  agents: Agent[]
  prospects: Prospect[]
  sequences: Sequence[]
  enrollments: { sequence_id: string; prospect_id: string; current_step: number; status: string }[]
  conversations: Conversation[]
  messages: Message[]
  posts: ContentPost[]
  voiceSamples: typeof demoVoiceSamples
  subscription: Subscription
  usage: UsageCounter
  settings: OrgSettings
  team: TeamMember[]
  activity: AutomationLogEntry[]
  feedback: { prospect_id: string; is_good_fit: boolean; created_at: string }[]
}

function build(): StoreShape {
  const enrollments = demoProspects
    .filter((p) => p.sequence_status !== 'not_started')
    .map((p, i) => ({
      sequence_id:
        p.source === 'content_engagement' ? 'seq_3' : p.fit_score >= 85 ? 'seq_2' : 'seq_1',
      prospect_id: p.id,
      current_step: 1 + (i % 4),
      status: p.sequence_status === 'replied' ? 'completed' : 'active',
    }))

  return {
    organization: { ...demoOrganization },
    profile: { ...demoProfile },
    business: { ...demoBusinessProfile },
    icp: { ...demoIcp },
    accounts: demoAccounts.map((a) => ({ ...a })),
    agents: demoAgents.map((a) => ({ ...a })),
    prospects: demoProspects.map((p) => ({ ...p })),
    sequences: demoSequences.map((s) => ({ ...s, steps: s.steps.map((st) => ({ ...st })) })),
    enrollments,
    conversations: demoConversations.map((c) => ({ ...c })),
    messages: demoMessages.map((m) => ({ ...m })),
    posts: demoContentPosts.map((p) => ({ ...p })),
    voiceSamples: demoVoiceSamples.map((v) => ({ ...v })),
    subscription: { ...demoSubscription },
    usage: { ...demoUsage },
    settings: { ...demoSettings },
    team: demoTeam.map((t) => ({ ...t })),
    activity: demoActivity.map((a) => ({ ...a })),
    feedback: [],
  }
}

const globalStore = globalThis as unknown as { __outreachhalo_store?: StoreShape }
export const store: StoreShape = (globalStore.__outreachhalo_store ??= build())

const uid = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 10)}`
const nowIso = () => new Date().toISOString()

function log(action: string, detail: string, actor: 'ai' | 'human' = 'human', entity_type = 'system') {
  store.activity.unshift({
    id: uid('log'),
    org_id: DEMO_ORG_ID,
    entity_type,
    action,
    detail,
    actor,
    created_at: nowIso(),
  })
  store.activity = store.activity.slice(0, 60)
}

/* ======================================================= Dashboard */

export function dashboardStats(): DashboardStats {
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const outbound = store.messages.filter((m) => m.direction === 'outbound')
  const inbound = store.messages.filter((m) => m.direction === 'inbound')
  const uniqueContacted = new Set(outbound.map((m) => m.prospect_id)).size
  const uniqueReplied = new Set(inbound.map((m) => m.prospect_id)).size

  return {
    prospects_this_month: store.prospects.filter((p) => new Date(p.created_at) >= monthStart).length,
    messages_sent: outbound.length,
    reply_rate: uniqueContacted === 0 ? 0 : Math.round((uniqueReplied / uniqueContacted) * 1000) / 10,
    meetings_booked: store.conversations.filter((c) => c.meeting_booked_at).length,
    unread_replies: store.conversations.reduce((sum, c) => sum + c.unread_count, 0),
    total_prospects: store.prospects.length,
    hot_prospects: store.prospects.filter((p) => p.intent_level === 'hot').length,
  }
}

export function activitySeries(days = 14): ActivityPoint[] {
  const points: ActivityPoint[] = []
  for (let i = days - 1; i >= 0; i--) {
    const day = new Date()
    day.setHours(0, 0, 0, 0)
    day.setDate(day.getDate() - i)
    const next = new Date(day.getTime() + 86_400_000)

    const inWindow = (m: Message) => {
      const t = new Date(m.sent_at).getTime()
      return t >= day.getTime() && t < next.getTime()
    }

    points.push({
      date: day.toISOString().slice(0, 10),
      sent: store.messages.filter((m) => m.direction === 'outbound' && inWindow(m)).length,
      replies: store.messages.filter((m) => m.direction === 'inbound' && inWindow(m)).length,
    })
  }
  return points
}

export function activityFeed(limit = 6): AutomationLogEntry[] {
  return [...store.activity]
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
    .slice(0, limit)
}

/* ======================================================= Prospects */

export function listProspects(filters: ProspectFilters = {}): Paginated<Prospect> {
  const {
    fit_min = 0,
    fit_max = 100,
    intent = [],
    signal = [],
    seq_status = 'all',
    source = 'all',
    search = '',
    page = 1,
    page_size = 12,
  } = filters

  const needle = search.trim().toLowerCase()

  const filtered = store.prospects
    .filter((p) => p.fit_score >= fit_min && p.fit_score <= fit_max)
    .filter((p) => intent.length === 0 || intent.includes(p.intent_level))
    .filter((p) => signal.length === 0 || signal.some((s) => p.signals.includes(s)))
    .filter((p) => seq_status === 'all' || p.sequence_status === seq_status)
    .filter((p) => source === 'all' || p.source === source)
    .filter(
      (p) =>
        needle === '' ||
        p.full_name.toLowerCase().includes(needle) ||
        (p.company ?? '').toLowerCase().includes(needle) ||
        (p.title ?? '').toLowerCase().includes(needle)
    )
    .sort((a, b) => b.fit_score - a.fit_score || +new Date(b.last_activity_at) - +new Date(a.last_activity_at))

  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / page_size))
  const safePage = Math.min(Math.max(1, page), totalPages)

  return {
    items: filtered.slice((safePage - 1) * page_size, safePage * page_size),
    page: safePage,
    page_size,
    total,
    total_pages: totalPages,
  }
}

export function getProspect(id: string) {
  const prospect = store.prospects.find((p) => p.id === id)
  if (!prospect) return null

  const messages = store.messages
    .filter((m) => m.prospect_id === id && m.conversation_id)
    .sort((a, b) => +new Date(a.sent_at) - +new Date(b.sent_at))

  const enrollment = store.enrollments.find((e) => e.prospect_id === id)
  const sequence = enrollment ? store.sequences.find((s) => s.id === enrollment.sequence_id) ?? null : null
  const conversation = store.conversations.find((c) => c.prospect_id === id) ?? null
  const feedback = store.feedback.filter((f) => f.prospect_id === id).at(-1) ?? null

  return { prospect, messages, enrollment, sequence, conversation, feedback }
}

export function recordFeedback(id: string, isGoodFit: boolean) {
  const prospect = store.prospects.find((p) => p.id === id)
  if (!prospect) return null

  store.feedback = store.feedback.filter((f) => f.prospect_id !== id)
  store.feedback.push({ prospect_id: id, is_good_fit: isGoodFit, created_at: nowIso() })

  // The visible payoff of feedback: the score moves, which is what the real
  // re-ranking pipeline will do in Phase 2.
  prospect.fit_score = Math.max(0, Math.min(100, prospect.fit_score + (isGoodFit ? 4 : -12)))
  prospect.intent_level = prospect.fit_score >= 85 ? 'hot' : prospect.fit_score >= 65 ? 'warm' : 'cold'

  log('feedback', `You marked ${prospect.full_name} as ${isGoodFit ? 'a good' : 'a bad'} fit`, 'human', 'prospect')
  return prospect
}

export function enrollProspect(prospectId: string, sequenceId: string) {
  const prospect = store.prospects.find((p) => p.id === prospectId)
  const sequence = store.sequences.find((s) => s.id === sequenceId)
  if (!prospect || !sequence) return null

  if (!store.enrollments.some((e) => e.prospect_id === prospectId && e.sequence_id === sequenceId)) {
    store.enrollments.push({ sequence_id: sequenceId, prospect_id: prospectId, current_step: 1, status: 'active' })
    sequence.enrolled_count += 1
    sequence.reply_rate = sequence.enrolled_count
      ? Math.round((sequence.replied_count / sequence.enrolled_count) * 1000) / 10
      : 0
  }

  if (prospect.sequence_status === 'not_started') prospect.sequence_status = 'in_sequence'
  log('sequence_enroll', `Added ${prospect.full_name} to "${sequence.name}"`, 'human', 'sequence')
  return { prospect, sequence }
}

export const allSignals = () => ALL_SIGNALS

/* ======================================================= Sequences */

export const listSequences = () =>
  [...store.sequences].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))

export function getSequence(id: string) {
  const sequence = store.sequences.find((s) => s.id === id)
  if (!sequence) return null

  const enrollments = store.enrollments.filter((e) => e.sequence_id === id)
  const prospects = enrollments
    .map((e) => store.prospects.find((p) => p.id === e.prospect_id))
    .filter((p): p is Prospect => Boolean(p))

  return { sequence, enrollments, prospects }
}

export function createSequence(name: string): Sequence {
  const sequence: Sequence = {
    id: uid('seq'),
    org_id: DEMO_ORG_ID,
    name,
    description: null,
    status: 'draft',
    approval_mode: 'approve_first',
    created_at: nowIso(),
    steps: [
      {
        id: uid('step'),
        sequence_id: '',
        step_order: 1,
        channel: 'linkedin',
        delay_days: 0,
        subject: null,
        message_template:
          'Hey {{first_name}}, noticed {{company}} is {{signal}}. Worth a quick conversation?',
        ai_personalize: true,
      },
    ],
    enrolled_count: 0,
    replied_count: 0,
    reply_rate: 0,
    meetings_booked: 0,
  }
  sequence.steps[0].sequence_id = sequence.id
  store.sequences.unshift(sequence)
  log('sequence_created', `Created sequence "${name}"`, 'human', 'sequence')
  return sequence
}

export function updateSequence(id: string, patch: Partial<Pick<Sequence, 'name' | 'status' | 'approval_mode' | 'description'>>) {
  const sequence = store.sequences.find((s) => s.id === id)
  if (!sequence) return null
  Object.assign(sequence, patch)
  if (patch.status) log('sequence_status', `Sequence "${sequence.name}" set to ${patch.status}`, 'human', 'sequence')
  return sequence
}

export function saveSteps(id: string, steps: Omit<SequenceStep, 'id' | 'sequence_id'>[]) {
  const sequence = store.sequences.find((s) => s.id === id)
  if (!sequence) return null
  sequence.steps = steps.map((s, i) => ({
    ...s,
    step_order: i + 1,
    id: uid('step'),
    sequence_id: id,
  }))
  return sequence
}

/* ========================================================== Inbox */

export function listConversations(opts: { intent?: IntentTag | 'all'; search?: string } = {}) {
  const { intent = 'all', search = '' } = opts
  const needle = search.trim().toLowerCase()

  return store.conversations
    .filter((c) => intent === 'all' || c.intent_tag === intent)
    .filter(
      (c) =>
        needle === '' ||
        c.prospect.full_name.toLowerCase().includes(needle) ||
        (c.prospect.company ?? '').toLowerCase().includes(needle) ||
        c.last_message_snippet.toLowerCase().includes(needle)
    )
    .sort((a, b) => +new Date(b.last_message_at) - +new Date(a.last_message_at))
}

export function getConversation(id: string) {
  const conversation = store.conversations.find((c) => c.id === id)
  if (!conversation) return null
  const prospect = store.prospects.find((p) => p.id === conversation.prospect_id) ?? null
  const messages = store.messages
    .filter((m) => m.conversation_id === id)
    .sort((a, b) => +new Date(a.sent_at) - +new Date(b.sent_at))
  return { conversation, prospect, messages }
}

export function markConversationRead(id: string) {
  const conversation = store.conversations.find((c) => c.id === id)
  if (!conversation) return null
  conversation.unread_count = 0
  store.messages
    .filter((m) => m.conversation_id === id && m.direction === 'inbound' && !m.read_at)
    .forEach((m) => (m.read_at = nowIso()))
  return conversation
}

export function sendReply(conversationId: string, body: string, aiGenerated: boolean, channel: 'linkedin' | 'email' = 'linkedin') {
  const conversation = store.conversations.find((c) => c.id === conversationId)
  if (!conversation) return null

  const message: Message = {
    id: uid('msg'),
    org_id: DEMO_ORG_ID,
    prospect_id: conversation.prospect_id,
    conversation_id: conversationId,
    channel,
    direction: 'outbound',
    subject: null,
    body,
    sent_at: nowIso(),
    read_at: nowIso(),
    ai_generated: aiGenerated,
  }

  store.messages.push(message)
  conversation.last_message_at = message.sent_at
  conversation.last_message_snippet = body
  conversation.unread_count = 0

  log(
    'reply_sent',
    `Replied to ${conversation.prospect.full_name}`,
    aiGenerated && conversation.autopilot_enabled ? 'ai' : 'human',
    'conversation'
  )
  return message
}

export function setAutopilot(conversationId: string, enabled: boolean) {
  const conversation = store.conversations.find((c) => c.id === conversationId)
  if (!conversation) return null
  conversation.autopilot_enabled = enabled
  log(
    'autopilot_toggled',
    `Autopilot ${enabled ? 'enabled' : 'disabled'} for ${conversation.prospect.full_name}`,
    'human',
    'conversation'
  )
  return conversation
}

export function setIntentTag(conversationId: string, tag: IntentTag) {
  const conversation = store.conversations.find((c) => c.id === conversationId)
  if (!conversation) return null
  conversation.intent_tag = tag
  return conversation
}

export function bookMeeting(conversationId: string) {
  const conversation = store.conversations.find((c) => c.id === conversationId)
  if (!conversation) return null
  conversation.meeting_booked_at = new Date(Date.now() + 2 * 86_400_000).toISOString()
  log('meeting_booked', `Meeting booked with ${conversation.prospect.full_name}`, 'ai', 'conversation')
  return conversation
}

/* ======================================================== Content */

export const listPosts = () =>
  [...store.posts].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))

export const getVoiceSample = () => store.voiceSamples.at(-1) ?? null

export function saveVoiceSample(text: string) {
  const sample = { id: uid('voice'), org_id: DEMO_ORG_ID, sample_text: text, created_at: nowIso() }
  store.voiceSamples.push(sample)
  return sample
}

export function createPost(bodyText: string, status: ContentPost['status'] = 'draft', scheduledAt?: string | null) {
  const post: ContentPost = {
    id: uid('post'),
    org_id: DEMO_ORG_ID,
    body_text: bodyText,
    image_url: null,
    status,
    scheduled_at: scheduledAt ?? null,
    posted_at: status === 'posted' ? nowIso() : null,
    reactions_count: 0,
    comments_count: 0,
    leads_generated_count: 0,
    created_at: nowIso(),
  }
  store.posts.unshift(post)
  if (status !== 'draft') store.usage.posts_used += 1
  log(
    status === 'posted' ? 'post_published' : 'post_scheduled',
    `${status === 'posted' ? 'Published' : 'Scheduled'} a LinkedIn post`,
    'human',
    'content'
  )
  return post
}

export function updatePost(id: string, patch: Partial<ContentPost>) {
  const post = store.posts.find((p) => p.id === id)
  if (!post) return null
  const wasDraft = post.status === 'draft'
  Object.assign(post, patch)
  if (patch.status === 'posted' && !post.posted_at) post.posted_at = nowIso()
  if (wasDraft && patch.status && patch.status !== 'draft') store.usage.posts_used += 1
  return post
}

export function deletePost(id: string) {
  const index = store.posts.findIndex((p) => p.id === id)
  if (index === -1) return false
  store.posts.splice(index, 1)
  return true
}

/* ========================================================= Agents */

export const listAgents = () => store.agents

export function createAgent(name: string) {
  const agent: Agent = {
    id: uid('agent'),
    org_id: DEMO_ORG_ID,
    name,
    status: 'active',
    channels: ['linkedin', 'email'],
    approval_mode: 'approve_first',
    tone: 'Direct, friendly, no fluff',
    daily_cap: 20,
    created_at: nowIso(),
  }
  store.agents.push(agent)
  log('agent_created', `Created agent "${name}"`, 'human', 'agent')
  return agent
}

export function updateAgent(id: string, patch: Partial<Agent>) {
  const agent = store.agents.find((a) => a.id === id)
  if (!agent) return null
  Object.assign(agent, patch)
  return agent
}

/* =================================================== Integrations */

export const listAccounts = () => store.accounts

export function connectAccount(provider: ConnectedAccount['provider']) {
  const account = store.accounts.find((a) => a.provider === provider)
  if (!account) return null
  account.status = 'mock_connected'
  account.connected_at = nowIso()
  account.last_synced_at = nowIso()
  store.usage.senders_used = store.accounts.filter((a) => a.status !== 'disconnected').length
  log('account_connected', `Connected ${provider.replace('_', ' ')}`, 'human', 'account')
  return account
}

export function disconnectAccount(id: string) {
  const account = store.accounts.find((a) => a.id === id)
  if (!account) return null
  account.status = 'disconnected'
  account.connected_at = null
  store.usage.senders_used = store.accounts.filter((a) => a.status !== 'disconnected').length
  log('account_disconnected', `Disconnected ${account.provider.replace('_', ' ')}`, 'human', 'account')
  return account
}

export function setDailyCap(id: string, cap: number) {
  const account = store.accounts.find((a) => a.id === id)
  if (!account) return null
  account.daily_cap = Math.max(1, Math.min(100, cap))
  return account
}

/* ======================================================= Settings */

export const getSettings = () => store.settings
export const getIcp = () => store.icp
export const getBusiness = () => store.business
export const getProfile = () => store.profile
export const getOrganization = () => store.organization

export function updateSettings(patch: Partial<OrgSettings>) {
  Object.assign(store.settings, patch)
  return store.settings
}

export function updateIcp(patch: Partial<IcpProfile>) {
  Object.assign(store.icp, patch)
  return store.icp
}

export function updateBusiness(patch: Partial<BusinessProfile>) {
  Object.assign(store.business, patch)
  return store.business
}

export function updateProfile(patch: Partial<typeof demoProfile>) {
  Object.assign(store.profile, patch)
  return store.profile
}

/* ======================================================== Billing */

export const getBilling = () => ({
  subscription: store.subscription,
  usage: store.usage,
  organization: store.organization,
})

export function setPlan(plan: 'pro' | 'growth' | 'custom') {
  store.subscription.plan = plan
  store.subscription.status = 'active'
  store.subscription.cancel_at_period_end = false
  store.organization.plan = plan
  log('plan_changed', `Switched to the ${plan} plan`, 'human', 'billing')
  return store.subscription
}

export function cancelSubscription() {
  store.subscription.cancel_at_period_end = true
  log('subscription_cancelled', 'Subscription set to cancel at period end', 'human', 'billing')
  return store.subscription
}

export function resumeSubscription() {
  store.subscription.cancel_at_period_end = false
  return store.subscription
}

/* =========================================================== Team */

export const listTeam = () => store.team

export function inviteMember(email: string, role: 'admin' | 'member') {
  if (store.team.some((m) => m.email?.toLowerCase() === email.toLowerCase())) return null
  const member: TeamMember = {
    id: uid('invite'),
    full_name: null,
    email,
    role,
    status: 'pending',
    created_at: nowIso(),
  }
  store.team.push(member)
  log('member_invited', `Invited ${email} as ${role}`, 'human', 'team')
  return member
}

export function revokeInvite(id: string) {
  const index = store.team.findIndex((m) => m.id === id && m.status === 'pending')
  if (index === -1) return false
  store.team.splice(index, 1)
  return true
}
