import type {
  Agent,
  AutomationLogEntry,
  BusinessProfile,
  ConnectedAccount,
  ContentPost,
  Conversation,
  IcpProfile,
  Message,
  Organization,
  OrgSettings,
  Profile,
  Prospect,
  Sequence,
  SequenceStep,
  Subscription,
  TeamMember,
  UsageCounter,
} from '@/lib/types'

/**
 * The demo dataset. Mirrors `seed_demo_data()` in
 * /supabase/migrations/0002_seed_and_bootstrap.sql one-for-one, so the app
 * looks and behaves identically whether it is running against Postgres or in
 * zero-config demo mode.
 */

const NOW = Date.now()
const HOUR = 3_600_000
const DAY = 24 * HOUR

const ago = (ms: number) => new Date(NOW - ms).toISOString()
const ahead = (ms: number) => new Date(NOW + ms).toISOString()

export const DEMO_ORG_ID = 'org_demo_0001'
export const DEMO_USER_ID = 'user_demo_0001'

export const demoOrganization: Organization = {
  id: DEMO_ORG_ID,
  name: 'Acme Analytics',
  plan: 'trial',
  billing_anchor: ago(9 * DAY),
  created_at: ago(30 * DAY),
}

export const demoProfile: Profile = {
  id: DEMO_USER_ID,
  org_id: DEMO_ORG_ID,
  email: 'you@acme-analytics.com',
  full_name: 'Alex Morgan',
  avatar_url: null,
  role: 'owner',
  onboarded_at: ago(29 * DAY),
}

export const demoBusinessProfile: BusinessProfile = {
  id: 'bp_1',
  org_id: DEMO_ORG_ID,
  website_url: 'https://acme-analytics.com',
  what_you_sell:
    'A revenue analytics platform that shows B2B teams which pipeline activity actually turns into closed revenue.',
  who_you_target:
    'Founders and revenue leaders at 20–200 person B2B SaaS companies running an outbound motion.',
  how_to_pitch:
    'Lead with the wasted-spend angle: most teams can name their top channel but not their top converting message.',
}

export const demoIcp: IcpProfile = {
  id: 'icp_1',
  org_id: DEMO_ORG_ID,
  job_titles: ['Founder', 'CEO', 'VP Sales', 'Head of Growth', 'COO', 'Sales Director'],
  company_size_min: 10,
  company_size_max: 250,
  industries: ['B2B SaaS', 'Marketing Agency', 'Professional Services', 'Fintech'],
  geographies: ['United States', 'United Kingdom', 'Canada', 'Germany'],
  keywords: ['outbound', 'pipeline', 'demand gen', 'revenue ops'],
}

export const demoAccounts: ConnectedAccount[] = [
  { id: 'acc_li', org_id: DEMO_ORG_ID, provider: 'linkedin', account_label: 'Personal LinkedIn', status: 'mock_connected', daily_cap: 25, last_synced_at: ago(11 * 60_000), connected_at: ago(29 * DAY) },
  { id: 'acc_gm', org_id: DEMO_ORG_ID, provider: 'gmail', account_label: 'you@acme-analytics.com', status: 'mock_connected', daily_cap: 40, last_synced_at: ago(6 * 60_000), connected_at: ago(29 * DAY) },
  { id: 'acc_ol', org_id: DEMO_ORG_ID, provider: 'outlook', account_label: 'sales@acme-analytics.com', status: 'mock_connected', daily_cap: 30, last_synced_at: ago(2 * HOUR), connected_at: ago(21 * DAY) },
  { id: 'acc_gw', org_id: DEMO_ORG_ID, provider: 'google_workspace', account_label: 'Acme Analytics Workspace', status: 'mock_connected', daily_cap: 50, last_synced_at: ago(DAY), connected_at: ago(21 * DAY) },
]

export const demoAgents: Agent[] = [
  { id: 'agent_1', org_id: DEMO_ORG_ID, name: 'Outbound Agent', status: 'active', channels: ['linkedin', 'email'], approval_mode: 'approve_first', tone: 'Direct, friendly, no fluff', daily_cap: 25, created_at: ago(29 * DAY) },
  { id: 'agent_2', org_id: DEMO_ORG_ID, name: 'Inbound Agent', status: 'active', channels: ['linkedin'], approval_mode: 'approve_all', tone: 'Warm, curious, specific', daily_cap: 15, created_at: ago(20 * DAY) },
]

type RawProspect = [
  name: string,
  title: string,
  company: string,
  location: string,
  size: number,
  industry: string,
  fit: number,
  intent: Prospect['intent_level'],
  signals: string[],
  source: Prospect['source'],
  status: Prospect['sequence_status'],
  ageDays: number,
  activityHours: number,
]

const RAW_PROSPECTS: RawProspect[] = [
  ['Sarah Jenkins', 'COO', 'Maker Loop', 'Austin, TX', 48, 'Manufacturing SaaS', 94, 'hot', ['Hiring SDRs', 'Engaged a competitor', 'Posted about outbound', 'Changed roles 12 days ago'], 'linkedin_search', 'replied', 14, 2],
  ['Devon Wu', 'Head of Growth', 'Northbeam Labs', 'San Francisco, CA', 72, 'B2B SaaS', 91, 'hot', ['Raised a seed round', 'Opened 3 roles in sales', 'Mentioned scaling pipeline'], 'linkedin_search', 'replied', 13, 5],
  ['Maya Rodriguez', 'Founder', 'Cadence Studio', 'Denver, CO', 18, 'Marketing Agency', 87, 'hot', ['Commented on your post', 'Asked for tool recommendations'], 'content_engagement', 'replied', 12, 9],
  ['Jordan Mitchell', 'Founder', 'Realm', 'New York, NY', 26, 'B2B SaaS', 96, 'hot', ['Hiring SDRs', 'Budget cycle starting', 'Viewed your profile', 'Switched CRM'], 'linkedin_search', 'in_sequence', 9, 6],
  ['Alex Santoro', 'CEO', 'Brightform', 'London, UK', 61, 'Fintech', 89, 'hot', ['Company headcount +18% QoQ', 'Engaged a competitor', 'Published a case study'], 'linkedin_search', 'in_sequence', 9, 11],
  ['Riya Patel', 'Founder', 'Nestpoint', 'Toronto, ON', 14, 'Professional Services', 83, 'warm', ['Posted about outbound', 'Attended a GTM webinar'], 'linkedin_search', 'in_sequence', 8, 18],
  ['Tomas Herrera', 'VP Sales', 'Kestrel Data', 'Chicago, IL', 140, 'B2B SaaS', 92, 'hot', ['Job change to VP Sales', 'Opened 3 roles in sales', 'Mentioned scaling pipeline'], 'linkedin_search', 'replied', 11, 26],
  ['Nina Kowalski', 'Director of Sales', 'Fathom HQ', 'Berlin, DE', 88, 'B2B SaaS', 78, 'warm', ['Website tech change detected', 'Attended a GTM webinar'], 'linkedin_search', 'in_sequence', 7, 30],
  ['Ben Okafor', 'Managing Director', 'Okafor Digital', 'Manchester, UK', 32, 'Marketing Agency', 81, 'warm', ['Commented on your post', 'New office announced'], 'content_engagement', 'in_sequence', 7, 33],
  ['Grace Lindqvist', 'Head of Revenue', 'Tidewell', 'Stockholm, SE', 55, 'B2B SaaS', 86, 'hot', ['Engaged a competitor', 'Budget cycle starting', 'Viewed your profile'], 'linkedin_search', 'replied', 10, 41],
  ['Marcus Bell', 'Founder', 'Ledgerly', 'Boston, MA', 21, 'Fintech', 74, 'warm', ['Raised a seed round', 'Posted about outbound'], 'linkedin_search', 'in_sequence', 6, 47],
  ['Priya Nair', 'CEO', 'Symbol & Co', 'Dublin, IE', 44, 'Professional Services', 80, 'warm', ['Published a case study', 'Hiring SDRs'], 'linkedin_search', 'in_sequence', 6, 52],
  ['Felix Braun', 'Co-founder', 'Runway Ops', 'Munich, DE', 16, 'B2B SaaS', 71, 'warm', ['Switched CRM', 'Mentioned scaling pipeline'], 'linkedin_search', 'in_sequence', 6, 58],
  ['Hannah Choi', 'Sales Director', 'Vantage Point', 'Seattle, WA', 115, 'B2B SaaS', 88, 'hot', ['Opened 3 roles in sales', 'Engaged a competitor', 'Company headcount +18% QoQ'], 'linkedin_search', 'replied', 5, 3],
  ['Omar Haddad', 'Agency Owner', 'Haddad Creative', 'Dubai, AE', 27, 'Marketing Agency', 69, 'warm', ['Commented on your post'], 'content_engagement', 'in_sequence', 5, 64],
  ['Elena Rossi', 'Head of Partnerships', 'Auralite', 'Milan, IT', 63, 'B2B SaaS', 64, 'cold', ['Attended a GTM webinar'], 'linkedin_search', 'not_started', 5, 70],
  ['Chris Delaney', 'VP Revenue Ops', 'Pinewell', 'Atlanta, GA', 190, 'Professional Services', 85, 'warm', ['Switched CRM', 'Budget cycle starting'], 'linkedin_search', 'in_sequence', 4, 12],
  ['Aisha Bello', 'Founder', 'Bellocraft', 'Lagos, NG', 11, 'Marketing Agency', 58, 'cold', ['Viewed your profile'], 'content_engagement', 'not_started', 4, 77],
  ['Lukas Meyer', 'CEO', 'Formwise Nordics', 'Oslo, NO', 38, 'B2B SaaS', 76, 'warm', ['New office announced', 'Posted about outbound'], 'linkedin_search', 'not_started', 3, 15],
  ['Sofia Marchetti', 'Head of Demand Gen', 'Corvus', 'Barcelona, ES', 96, 'B2B SaaS', 82, 'warm', ['Published a case study', 'Asked for tool recommendations'], 'linkedin_search', 'in_sequence', 3, 21],
  ['Ryan Whitfield', 'Founder', 'Whitfield & Rowe', 'Nashville, TN', 9, 'Professional Services', 52, 'cold', ['Viewed your profile'], 'linkedin_search', 'not_started', 3, 88],
  ['Ingrid Sorensen', 'COO', 'Nordic Bloom', 'Copenhagen, DK', 54, 'B2B SaaS', 79, 'warm', ['Company headcount +18% QoQ', 'Hiring SDRs'], 'linkedin_search', 'not_started', 2, 29],
  ['Daniel Ortiz', 'Sales Lead', 'Beacon Path', 'Miami, FL', 41, 'Fintech', 66, 'cold', ['Website tech change detected'], 'linkedin_search', 'not_started', 2, 35],
  ['Zoe Karim', 'Founder', 'Loomcraft Studio', 'Vancouver, BC', 13, 'Marketing Agency', 73, 'warm', ['Commented on your post', 'Asked for tool recommendations'], 'content_engagement', 'not_started', 1, 8],
  ['Peter Novak', 'Managing Partner', 'Novak Advisory', 'Prague, CZ', 29, 'Professional Services', 47, 'cold', ['Attended a GTM webinar'], 'linkedin_search', 'not_started', 1, 44],
]

export const demoProspects: Prospect[] = RAW_PROSPECTS.map((row, i) => {
  const [name, title, company, location, size, industry, fit, intent, signals, source, status, ageDays, activityHours] = row
  return {
    id: `prospect_${i + 1}`,
    org_id: DEMO_ORG_ID,
    full_name: name,
    title,
    company,
    avatar_url: null,
    linkedin_url: `https://www.linkedin.com/in/${name.toLowerCase().replace(/\s+/g, '-')}`,
    location,
    company_size: size,
    industry,
    fit_score: fit,
    intent_level: intent,
    signals,
    source,
    sequence_status: status,
    last_activity_at: ago(activityHours * HOUR),
    created_at: ago(ageDays * DAY),
  }
})

const byName = (name: string) => demoProspects.find((p) => p.full_name === name)!

/** Every distinct signal in the dataset — powers the signal filter. */
export const ALL_SIGNALS: string[] = Array.from(new Set(demoProspects.flatMap((p) => p.signals))).sort()

/* ------------------------------------------------------------- Sequences */

const seqSteps = (sequenceId: string, steps: Omit<SequenceStep, 'id' | 'sequence_id'>[]): SequenceStep[] =>
  steps.map((s, i) => ({ ...s, id: `${sequenceId}_step_${i + 1}`, sequence_id: sequenceId }))

export const demoSequences: Sequence[] = [
  {
    id: 'seq_1',
    org_id: DEMO_ORG_ID,
    name: 'Founder intro — LinkedIn first',
    description: 'Warm 4-touch intro for founders at 10–50 person companies.',
    status: 'active',
    approval_mode: 'approve_first',
    created_at: ago(21 * DAY),
    steps: seqSteps('seq_1', [
      { step_order: 1, channel: 'linkedin', delay_days: 0, subject: null, message_template: 'Hey {{first_name}}, noticed {{company}} is {{signal}}. I help teams like yours see which outbound messages actually turn into revenue. Worth a look?', ai_personalize: true },
      { step_order: 2, channel: 'email', delay_days: 2, subject: 'Quick idea for {{company}}', message_template: 'Hi {{first_name}} — following up here since LinkedIn gets noisy. Most teams your size can name their best channel but not their best converting message. That gap is usually worth 20-30% of pipeline. Open to a 15 minute look?', ai_personalize: true },
      { step_order: 3, channel: 'linkedin', delay_days: 4, subject: null, message_template: 'Did the note land, {{first_name}}? Happy to send over the one-pager instead if that is easier.', ai_personalize: false },
      { step_order: 4, channel: 'email', delay_days: 7, subject: 'Last one from me', message_template: 'Closing the loop, {{first_name}}. If pipeline attribution is not on the roadmap at {{company}} this quarter, no problem at all — I will stop here.', ai_personalize: false },
    ]),
    enrolled_count: 7,
    replied_count: 2,
    reply_rate: 28.6,
    meetings_booked: 1,
  },
  {
    id: 'seq_2',
    org_id: DEMO_ORG_ID,
    name: 'Hot signal — same day outreach',
    description: 'Fires when a prospect crosses 85 fit with a hiring or competitor signal.',
    status: 'active',
    approval_mode: 'autopilot',
    created_at: ago(12 * DAY),
    steps: seqSteps('seq_2', [
      { step_order: 1, channel: 'linkedin', delay_days: 0, subject: null, message_template: 'Saw {{company}} is {{signal}} — congrats on the growth. Quick idea on keeping the new pipeline full without adding headcount.', ai_personalize: true },
      { step_order: 2, channel: 'email', delay_days: 2, subject: 'On {{company}} scaling outbound', message_template: 'Hi {{first_name}}, given {{signal}} I figured the timing was right. We cut list-build time roughly in half for teams in the same spot. Want the 3-minute version?', ai_personalize: true },
      { step_order: 3, channel: 'linkedin', delay_days: 5, subject: null, message_template: 'Still worth a conversation, {{first_name}}? Happy to just share what we see working for {{company}}-sized teams.', ai_personalize: true },
    ]),
    enrolled_count: 6,
    replied_count: 3,
    reply_rate: 50,
    meetings_booked: 2,
  },
  {
    id: 'seq_3',
    org_id: DEMO_ORG_ID,
    name: 'Post engagers — inbound follow-up',
    description: 'Reaches everyone who reacted or commented on a published post.',
    status: 'paused',
    approval_mode: 'approve_all',
    created_at: ago(6 * DAY),
    steps: seqSteps('seq_3', [
      { step_order: 1, channel: 'linkedin', delay_days: 0, subject: null, message_template: 'Thanks for the comment on my post, {{first_name}} — you clearly think about this properly. Curious how {{company}} handles it today?', ai_personalize: true },
      { step_order: 2, channel: 'linkedin', delay_days: 3, subject: null, message_template: 'Wrote up the longer version of that post, {{first_name}}. Want me to send it over?', ai_personalize: false },
      { step_order: 3, channel: 'email', delay_days: 6, subject: 'The write-up I mentioned', message_template: 'Hi {{first_name}}, here is the longer breakdown I promised. No pitch — tell me if any of it is useful for {{company}}.', ai_personalize: true },
    ]),
    enrolled_count: 3,
    replied_count: 1,
    reply_rate: 33.3,
    meetings_booked: 0,
  },
]

/* --------------------------------------------------- Conversations + msgs */

type RawConv = [name: string, tag: Conversation['intent_tag'], autopilot: boolean, hoursAgo: number, unread: boolean]

const RAW_CONVERSATIONS: RawConv[] = [
  ['Sarah Jenkins', 'interested', true, 2, true],
  ['Devon Wu', 'question', false, 5, true],
  ['Maya Rodriguez', 'interested', false, 9, true],
  ['Tomas Herrera', 'not_now', false, 26, false],
  ['Grace Lindqvist', 'interested', true, 41, false],
  ['Hannah Choi', 'question', false, 3, true],
  ['Jordan Mitchell', 'neutral', false, 6, false],
  ['Alex Santoro', 'neutral', false, 11, false],
  ['Chris Delaney', 'question', false, 12, false],
  ['Sofia Marchetti', 'not_now', false, 21, false],
]

const inboundBody: Record<Conversation['intent_tag'], string> = {
  interested: 'Let’s hop on a quick call this week — how is Thursday afternoon?',
  question: 'Curious how this compares to what we already run in HubSpot. What is actually different?',
  not_now: 'Not right now — we are mid-quarter. Circle back in Q2?',
  neutral: 'Thanks for reaching out.',
}

const followUpBody: Record<Conversation['intent_tag'], string> = {
  interested: 'Thursday works. Here is my booking link so you can grab whichever slot suits — looking forward to it.',
  question:
    'Fair question. HubSpot tells you a deal closed; we tell you which message got the reply that started it. Happy to show it on your own data.',
  not_now: 'Totally understood — I will check back in early Q2. If anything changes before then, just reply here.',
  neutral: 'No problem at all — I will leave the door open if the timing changes.',
}

export const demoMessages: Message[] = []
export const demoConversations: Conversation[] = []

RAW_CONVERSATIONS.forEach(([name, tag, autopilot, hoursAgo, unread], i) => {
  const prospect = byName(name)
  const convId = `conv_${i + 1}`
  const hasFollowUp = hoursAgo > 10
  const lastAt = ago((hasFollowUp ? hoursAgo - 1 : hoursAgo) * HOUR)

  demoMessages.push({
    id: `${convId}_m1`,
    org_id: DEMO_ORG_ID,
    prospect_id: prospect.id,
    conversation_id: convId,
    channel: 'linkedin',
    direction: 'outbound',
    subject: null,
    body: `Hey ${name.split(' ')[0]}, noticed ${prospect.company} is scaling outbound this quarter. We help teams see which messages actually turn into revenue — worth a quick look?`,
    sent_at: ago((hoursAgo + 72) * HOUR),
    read_at: ago(0),
    ai_generated: true,
  })

  demoMessages.push({
    id: `${convId}_m2`,
    org_id: DEMO_ORG_ID,
    prospect_id: prospect.id,
    conversation_id: convId,
    channel: 'linkedin',
    direction: 'inbound',
    subject: null,
    body: inboundBody[tag],
    sent_at: ago(hoursAgo * HOUR),
    read_at: unread ? null : ago(0),
    ai_generated: false,
  })

  if (hasFollowUp) {
    demoMessages.push({
      id: `${convId}_m3`,
      org_id: DEMO_ORG_ID,
      prospect_id: prospect.id,
      conversation_id: convId,
      channel: 'email',
      direction: 'outbound',
      subject: 'Following up',
      body: followUpBody[tag],
      sent_at: lastAt,
      read_at: ago(0),
      ai_generated: true,
    })
  }

  demoConversations.push({
    id: convId,
    org_id: DEMO_ORG_ID,
    prospect_id: prospect.id,
    intent_tag: tag,
    autopilot_enabled: autopilot,
    meeting_booked_at: tag === 'interested' && !unread ? ahead(2 * DAY) : null,
    last_message_at: lastAt,
    prospect: {
      id: prospect.id,
      full_name: prospect.full_name,
      title: prospect.title,
      company: prospect.company,
      avatar_url: null,
      signals: prospect.signals,
      fit_score: prospect.fit_score,
      intent_level: prospect.intent_level,
    },
    last_message_snippet: hasFollowUp ? followUpBody[tag] : inboundBody[tag],
    unread_count: unread ? 1 : 0,
  })
})

/** 14 days of outbound volume so the dashboard chart has real shape. */
const DAILY_SENDS = [4, 7, 5, 9, 6, 3, 2, 8, 11, 7, 9, 6, 12, 8]
const sequencedProspects = demoProspects.filter((p) => p.sequence_status !== 'not_started')

DAILY_SENDS.forEach((count, dayIndex) => {
  for (let i = 0; i < count; i++) {
    const prospect = sequencedProspects[(dayIndex * 5 + i) % sequencedProspects.length]
    demoMessages.push({
      id: `bulk_${dayIndex}_${i}`,
      org_id: DEMO_ORG_ID,
      prospect_id: prospect.id,
      conversation_id: null,
      channel: i % 3 === 0 ? 'email' : 'linkedin',
      direction: 'outbound',
      subject: null,
      body: 'Sequence step sent automatically by your agent.',
      sent_at: new Date(NOW - (13 - dayIndex) * DAY + i * 17 * 60_000).toISOString(),
      read_at: ago(0),
      ai_generated: true,
    })
  }
})

/* ---------------------------------------------------------------- Content */

export const demoVoiceSamples: { id: string; org_id: string; sample_text: string; created_at: string }[] = [
  {
    id: 'voice_1',
    org_id: DEMO_ORG_ID,
    sample_text:
      'Most outbound fails for one boring reason: nobody knows which message actually worked. We tracked 4,000 sends last quarter. The winner was not the clever one. It was the one that named a problem the buyer had already said out loud. Steal that.',
    created_at: ago(20 * DAY),
  },
]

export const demoContentPosts: ContentPost[] = [
  {
    id: 'post_1',
    org_id: DEMO_ORG_ID,
    body_text:
      'Most outbound fails for one boring reason. Here is the fix we use to win new clients every week.\n\nStop writing clever openers. Name the thing your buyer already said out loud — in their own words — and ask one question about it. That is the whole trick.',
    image_url: null,
    status: 'posted',
    scheduled_at: null,
    posted_at: ago(6 * DAY),
    reactions_count: 94,
    comments_count: 17,
    leads_generated_count: 3,
    created_at: ago(8 * DAY),
  },
  {
    id: 'post_2',
    org_id: DEMO_ORG_ID,
    body_text:
      'We replaced our SDR list-building with an agent that reads intent signals instead of job titles.\n\nReply rate went from 4% to 11% in three weeks. Not because the copy got better. Because the timing did.',
    image_url: null,
    status: 'posted',
    scheduled_at: null,
    posted_at: ago(2 * DAY),
    reactions_count: 61,
    comments_count: 9,
    leads_generated_count: 2,
    created_at: ago(3 * DAY),
  },
  {
    id: 'post_3',
    org_id: DEMO_ORG_ID,
    body_text:
      'The 6 hours a week you spend checking whether a lead is a fit is the most expensive hour in your business. Here is how we got it to zero.',
    image_url: null,
    status: 'scheduled',
    scheduled_at: ahead(2 * DAY),
    posted_at: null,
    reactions_count: 0,
    comments_count: 0,
    leads_generated_count: 0,
    created_at: ago(DAY),
  },
  {
    id: 'post_4',
    org_id: DEMO_ORG_ID,
    body_text:
      'Three buying signals that beat "downloaded a whitepaper" every single time — and how to watch for them without a data team.',
    image_url: null,
    status: 'scheduled',
    scheduled_at: ahead(5 * DAY),
    posted_at: null,
    reactions_count: 0,
    comments_count: 0,
    leads_generated_count: 0,
    created_at: ago(DAY),
  },
  {
    id: 'post_5',
    org_id: DEMO_ORG_ID,
    body_text: 'Draft: why "book a demo" is the worst call-to-action in B2B and what we send instead.',
    image_url: null,
    status: 'draft',
    scheduled_at: null,
    posted_at: null,
    reactions_count: 0,
    comments_count: 0,
    leads_generated_count: 0,
    created_at: ago(4 * HOUR),
  },
  {
    id: 'post_6',
    org_id: DEMO_ORG_ID,
    body_text:
      'Draft: the 18 intent signals we score every prospect against, ranked by how well they actually predict a reply.',
    image_url: null,
    status: 'draft',
    scheduled_at: null,
    posted_at: null,
    reactions_count: 0,
    comments_count: 0,
    leads_generated_count: 0,
    created_at: ago(2 * HOUR),
  },
]

/* ---------------------------------------------------------------- Billing */

export const demoSubscription: Subscription = {
  id: 'sub_1',
  org_id: DEMO_ORG_ID,
  stripe_customer_id: null,
  stripe_subscription_id: null,
  plan: 'pro',
  status: 'trialing',
  cancel_at_period_end: false,
  current_period_end: ahead(7 * DAY),
}

export const demoUsage: UsageCounter = {
  org_id: DEMO_ORG_ID,
  period_start: ago(9 * DAY),
  period_end: ahead(21 * DAY),
  prospects_used: 340,
  posts_used: 12,
  senders_used: 2,
}

export const demoSettings: OrgSettings = {
  org_id: DEMO_ORG_ID,
  booking_url: 'https://cal.com/alex-morgan/15min',
  timezone: 'America/New_York',
  sending_hours_start: 9,
  sending_hours_end: 17,
  notify_hot_reply: true,
  notify_daily_digest: true,
  notify_product_updates: false,
}

export const demoTeam: TeamMember[] = [
  { id: DEMO_USER_ID, full_name: 'Alex Morgan', email: 'you@acme-analytics.com', role: 'owner', status: 'active', created_at: ago(30 * DAY) },
  { id: 'member_2', full_name: 'Priya Shah', email: 'priya@acme-analytics.com', role: 'admin', status: 'active', created_at: ago(18 * DAY) },
  { id: 'invite_1', full_name: null, email: 'jordan@acme-analytics.com', role: 'member', status: 'pending', created_at: ago(2 * DAY) },
]

export const demoActivity: AutomationLogEntry[] = [
  { id: 'log_1', org_id: DEMO_ORG_ID, entity_type: 'prospect', action: 'prospects_found', detail: 'Found 3 new prospects matching your ICP', actor: 'ai', created_at: ago(18 * 60_000) },
  { id: 'log_2', org_id: DEMO_ORG_ID, entity_type: 'message', action: 'messages_sent', detail: 'Sent 5 messages from your LinkedIn account', actor: 'ai', created_at: ago(52 * 60_000) },
  { id: 'log_3', org_id: DEMO_ORG_ID, entity_type: 'conversation', action: 'reply_received', detail: '1 reply needs your attention — Sarah Jenkins', actor: 'ai', created_at: ago(2 * HOUR) },
  { id: 'log_4', org_id: DEMO_ORG_ID, entity_type: 'content', action: 'post_published', detail: 'Published "Most outbound fails for one boring reason"', actor: 'ai', created_at: ago(6 * HOUR) },
  { id: 'log_5', org_id: DEMO_ORG_ID, entity_type: 'conversation', action: 'meeting_booked', detail: 'Autopilot booked a meeting with Grace Lindqvist', actor: 'ai', created_at: ago(9 * HOUR) },
  { id: 'log_6', org_id: DEMO_ORG_ID, entity_type: 'prospect', action: 'feedback', detail: 'You marked 2 prospects as a good fit', actor: 'human', created_at: ago(DAY) },
  { id: 'log_7', org_id: DEMO_ORG_ID, entity_type: 'sequence', action: 'sequence_started', detail: 'Started "Hot signal — same day outreach"', actor: 'human', created_at: ago(2 * DAY) },
]

/** Marketing mockups reuse these three so the site shows the real product. */
export const MOCKUP_PROSPECTS = [
  { name: 'Jordan Mitchell', title: 'Founder', company: 'Realm' },
  { name: 'Alex Santoro', title: 'CEO', company: 'Brightform' },
  { name: 'Riya Patel', title: 'Founder', company: 'Nestpoint' },
] as const
