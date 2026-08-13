/** Domain types — mirror the Postgres schema in /supabase/migrations/0001_init.sql. */

export type Plan = 'trial' | 'pro' | 'growth' | 'custom'
export type IntentLevel = 'hot' | 'warm' | 'cold'
export type IntentTag = 'interested' | 'question' | 'not_now' | 'neutral'
export type Channel = 'linkedin' | 'email'
export type Direction = 'outbound' | 'inbound'
export type SequenceStatus = 'not_started' | 'in_sequence' | 'replied' | 'closed'
export type ProspectSource = 'linkedin_search' | 'content_engagement'
export type ApprovalMode = 'approve_first' | 'approve_all' | 'autopilot'
export type Provider = 'linkedin' | 'gmail' | 'outlook' | 'google_workspace'
export type AccountStatus = 'mock_connected' | 'connected' | 'disconnected' | 'error'
export type PostStatus = 'draft' | 'scheduled' | 'posted'

export interface Organization {
  id: string
  name: string
  plan: Plan
  billing_anchor: string
  created_at: string
}

export interface Profile {
  id: string
  org_id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  role: 'owner' | 'admin' | 'member'
  onboarded_at: string | null
}

export interface BusinessProfile {
  id: string
  org_id: string
  website_url: string | null
  what_you_sell: string | null
  who_you_target: string | null
  how_to_pitch: string | null
}

export interface IcpProfile {
  id: string
  org_id: string
  job_titles: string[]
  company_size_min: number
  company_size_max: number
  industries: string[]
  geographies: string[]
  keywords: string[]
}

export interface ConnectedAccount {
  id: string
  org_id: string
  provider: Provider
  account_label: string | null
  status: AccountStatus
  daily_cap: number
  last_synced_at: string | null
  connected_at: string | null
}

export interface Agent {
  id: string
  org_id: string
  name: string
  status: 'active' | 'paused'
  channels: Channel[]
  approval_mode: ApprovalMode
  tone: string | null
  daily_cap: number
  created_at: string
}

export interface Prospect {
  id: string
  org_id: string
  full_name: string
  title: string | null
  company: string | null
  avatar_url: string | null
  linkedin_url: string | null
  location: string | null
  company_size: number | null
  industry: string | null
  fit_score: number
  intent_level: IntentLevel
  signals: string[]
  source: ProspectSource
  sequence_status: SequenceStatus
  last_activity_at: string
  created_at: string
}

export interface SequenceStep {
  id: string
  sequence_id: string
  step_order: number
  channel: Channel
  delay_days: number
  subject: string | null
  message_template: string
  ai_personalize: boolean
}

export interface Sequence {
  id: string
  org_id: string
  name: string
  description: string | null
  status: 'draft' | 'active' | 'paused'
  approval_mode: ApprovalMode
  created_at: string
  steps: SequenceStep[]
  /** Derived, not stored. */
  enrolled_count: number
  replied_count: number
  reply_rate: number
  meetings_booked: number
}

export interface Message {
  id: string
  org_id: string
  prospect_id: string
  conversation_id: string | null
  channel: Channel
  direction: Direction
  subject: string | null
  body: string
  sent_at: string
  read_at: string | null
  ai_generated: boolean
}

export interface Conversation {
  id: string
  org_id: string
  prospect_id: string
  intent_tag: IntentTag
  autopilot_enabled: boolean
  meeting_booked_at: string | null
  last_message_at: string
  /** Joined for list rendering. */
  prospect: Pick<Prospect, 'id' | 'full_name' | 'title' | 'company' | 'avatar_url' | 'signals' | 'fit_score' | 'intent_level'>
  last_message_snippet: string
  unread_count: number
}

export interface ContentPost {
  id: string
  org_id: string
  body_text: string
  image_url: string | null
  status: PostStatus
  scheduled_at: string | null
  posted_at: string | null
  reactions_count: number
  comments_count: number
  leads_generated_count: number
  created_at: string
}

export interface Subscription {
  id: string
  org_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  plan: 'pro' | 'growth' | 'custom' | null
  status: string | null
  cancel_at_period_end: boolean
  current_period_end: string | null
}

export interface UsageCounter {
  org_id: string
  period_start: string
  period_end: string
  prospects_used: number
  posts_used: number
  senders_used: number
}

export interface OrgSettings {
  org_id: string
  booking_url: string | null
  timezone: string
  sending_hours_start: number
  sending_hours_end: number
  notify_hot_reply: boolean
  notify_daily_digest: boolean
  notify_product_updates: boolean
}

export interface TeamMember {
  id: string
  full_name: string | null
  email: string | null
  role: 'owner' | 'admin' | 'member'
  status: 'active' | 'pending'
  created_at: string
}

export interface AutomationLogEntry {
  id: string
  org_id: string
  entity_type: string | null
  action: string
  detail: string
  actor: 'ai' | 'human'
  created_at: string
}

export interface DashboardStats {
  prospects_this_month: number
  messages_sent: number
  reply_rate: number
  meetings_booked: number
  unread_replies: number
  total_prospects: number
  hot_prospects: number
}

export interface ActivityPoint {
  date: string
  sent: number
  replies: number
}

export interface ProspectFilters {
  fit_min?: number
  fit_max?: number
  intent?: IntentLevel[]
  signal?: string[]
  seq_status?: SequenceStatus | 'all'
  source?: ProspectSource | 'all'
  search?: string
  page?: number
  page_size?: number
}

export interface Paginated<T> {
  items: T[]
  page: number
  page_size: number
  total: number
  total_pages: number
}
