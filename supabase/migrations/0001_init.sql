-- =============================================================================
-- OutreachHalo — initial schema
-- Multi-tenant on `org_id`. Every tenant table has RLS enabled and is isolated
-- through the caller's `profiles` row.
-- =============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tenancy
-- ---------------------------------------------------------------------------

create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_user_id uuid not null,
  plan text not null default 'trial' check (plan in ('trial', 'pro', 'growth', 'custom')),
  -- The billing anchor. Usage limits reset on this day-of-cycle, never on the 1st.
  billing_anchor timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  org_id uuid references organizations (id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  role text not null default 'owner' check (role in ('owner', 'admin', 'member')),
  onboarded_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists profiles_org_id_idx on profiles (org_id);

-- ---------------------------------------------------------------------------
-- Business understanding + targeting
-- ---------------------------------------------------------------------------

create table if not exists icp_profiles (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations (id) on delete cascade,
  job_titles text[] not null default '{}',
  company_size_min int not null default 1,
  company_size_max int not null default 200,
  industries text[] not null default '{}',
  geographies text[] not null default '{}',
  keywords text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists icp_profiles_org_id_idx on icp_profiles (org_id);

create table if not exists business_profile (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations (id) on delete cascade,
  website_url text,
  what_you_sell text,
  who_you_target text,
  how_to_pitch text,
  raw_scrape jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists business_profile_org_id_idx on business_profile (org_id);

-- ---------------------------------------------------------------------------
-- Channels + agents
-- ---------------------------------------------------------------------------

create table if not exists connected_accounts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations (id) on delete cascade,
  provider text not null check (provider in ('linkedin', 'gmail', 'outlook', 'google_workspace')),
  account_label text,
  status text not null default 'disconnected'
    check (status in ('mock_connected', 'connected', 'disconnected', 'error')),
  daily_cap int not null default 20 check (daily_cap between 1 and 100),
  oauth_meta jsonb not null default '{}'::jsonb,
  last_synced_at timestamptz,
  connected_at timestamptz default now(),
  unique (org_id, provider)
);

create index if not exists connected_accounts_org_id_idx on connected_accounts (org_id);

create table if not exists agents (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations (id) on delete cascade,
  name text not null,
  status text not null default 'active' check (status in ('active', 'paused')),
  channels text[] not null default '{linkedin,email}',
  approval_mode text not null default 'approve_first'
    check (approval_mode in ('approve_first', 'approve_all', 'autopilot')),
  tone text default 'Direct, friendly, no fluff',
  daily_cap int not null default 20,
  created_at timestamptz not null default now()
);

create index if not exists agents_org_id_idx on agents (org_id);

-- ---------------------------------------------------------------------------
-- Prospects
-- ---------------------------------------------------------------------------

create table if not exists prospects (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations (id) on delete cascade,
  full_name text not null,
  title text,
  company text,
  avatar_url text,
  linkedin_url text,
  location text,
  company_size int,
  industry text,
  fit_score int check (fit_score between 0 and 100),
  intent_level text check (intent_level in ('hot', 'warm', 'cold')),
  signals jsonb not null default '[]'::jsonb,
  source text check (source in ('linkedin_search', 'content_engagement')),
  sequence_status text not null default 'not_started'
    check (sequence_status in ('not_started', 'in_sequence', 'replied', 'closed')),
  last_activity_at timestamptz default now(),
  created_at timestamptz not null default now()
);

create index if not exists prospects_org_id_idx on prospects (org_id);
create index if not exists prospects_org_fit_idx on prospects (org_id, fit_score desc);
create index if not exists prospects_org_intent_idx on prospects (org_id, intent_level);
create index if not exists prospects_org_status_idx on prospects (org_id, sequence_status);
create index if not exists prospects_signals_idx on prospects using gin (signals);

create table if not exists prospect_feedback (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid references prospects (id) on delete cascade,
  org_id uuid references organizations (id) on delete cascade,
  is_good_fit boolean not null,
  created_at timestamptz not null default now()
);

create index if not exists prospect_feedback_org_id_idx on prospect_feedback (org_id);
create index if not exists prospect_feedback_prospect_idx on prospect_feedback (prospect_id);

-- ---------------------------------------------------------------------------
-- Sequences
-- ---------------------------------------------------------------------------

create table if not exists sequences (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations (id) on delete cascade,
  name text not null,
  description text,
  status text not null default 'draft' check (status in ('draft', 'active', 'paused')),
  approval_mode text not null default 'approve_first'
    check (approval_mode in ('approve_first', 'approve_all', 'autopilot')),
  created_at timestamptz not null default now()
);

create index if not exists sequences_org_id_idx on sequences (org_id);

create table if not exists sequence_steps (
  id uuid primary key default gen_random_uuid(),
  sequence_id uuid references sequences (id) on delete cascade,
  org_id uuid references organizations (id) on delete cascade,
  step_order int not null,
  channel text not null check (channel in ('linkedin', 'email')),
  delay_days int not null default 0,
  subject text,
  message_template text,
  ai_personalize boolean not null default true,
  unique (sequence_id, step_order)
);

create index if not exists sequence_steps_sequence_idx on sequence_steps (sequence_id, step_order);
create index if not exists sequence_steps_org_id_idx on sequence_steps (org_id);

create table if not exists sequence_enrollments (
  id uuid primary key default gen_random_uuid(),
  sequence_id uuid references sequences (id) on delete cascade,
  prospect_id uuid references prospects (id) on delete cascade,
  org_id uuid references organizations (id) on delete cascade,
  current_step int not null default 0,
  status text not null default 'active' check (status in ('active', 'completed', 'stopped')),
  enrolled_at timestamptz not null default now(),
  unique (sequence_id, prospect_id)
);

create index if not exists sequence_enrollments_org_id_idx on sequence_enrollments (org_id);
create index if not exists sequence_enrollments_sequence_idx on sequence_enrollments (sequence_id);

-- ---------------------------------------------------------------------------
-- Conversations + messages
-- ---------------------------------------------------------------------------

create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations (id) on delete cascade,
  prospect_id uuid references prospects (id) on delete cascade,
  intent_tag text not null default 'neutral'
    check (intent_tag in ('interested', 'question', 'not_now', 'neutral')),
  autopilot_enabled boolean not null default false,
  meeting_booked_at timestamptz,
  last_message_at timestamptz not null default now(),
  unique (org_id, prospect_id)
);

create index if not exists conversations_org_id_idx on conversations (org_id, last_message_at desc);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations (id) on delete cascade,
  prospect_id uuid references prospects (id) on delete cascade,
  conversation_id uuid references conversations (id) on delete cascade,
  channel text not null check (channel in ('linkedin', 'email')),
  direction text not null check (direction in ('outbound', 'inbound')),
  subject text,
  body text not null,
  sent_at timestamptz not null default now(),
  read_at timestamptz,
  ai_generated boolean not null default false
);

create index if not exists messages_org_id_idx on messages (org_id, sent_at desc);
create index if not exists messages_conversation_idx on messages (conversation_id, sent_at);
create index if not exists messages_unread_idx on messages (org_id, direction, read_at);

-- ---------------------------------------------------------------------------
-- Content
-- ---------------------------------------------------------------------------

create table if not exists voice_samples (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations (id) on delete cascade,
  sample_text text not null,
  created_at timestamptz not null default now()
);

create index if not exists voice_samples_org_id_idx on voice_samples (org_id);

create table if not exists content_posts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations (id) on delete cascade,
  body_text text not null,
  image_url text,
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'posted')),
  scheduled_at timestamptz,
  posted_at timestamptz,
  reactions_count int not null default 0,
  comments_count int not null default 0,
  leads_generated_count int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists content_posts_org_id_idx on content_posts (org_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Billing + usage
-- ---------------------------------------------------------------------------

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations (id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text check (plan in ('pro', 'growth', 'custom')),
  status text,
  cancel_at_period_end boolean not null default false,
  current_period_end timestamptz,
  unique (org_id)
);

create index if not exists subscriptions_org_id_idx on subscriptions (org_id);

create table if not exists usage_counters (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations (id) on delete cascade,
  period_start timestamptz not null,
  period_end timestamptz not null,
  prospects_used int not null default 0,
  posts_used int not null default 0,
  senders_used int not null default 0,
  unique (org_id, period_start)
);

create index if not exists usage_counters_org_id_idx on usage_counters (org_id);

-- ---------------------------------------------------------------------------
-- Settings, team, audit
-- ---------------------------------------------------------------------------

create table if not exists org_settings (
  org_id uuid primary key references organizations (id) on delete cascade,
  booking_url text,
  timezone text not null default 'UTC',
  sending_hours_start int not null default 9 check (sending_hours_start between 0 and 23),
  sending_hours_end int not null default 17 check (sending_hours_end between 0 and 23),
  notify_hot_reply boolean not null default true,
  notify_daily_digest boolean not null default true,
  notify_product_updates boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists pending_invites (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations (id) on delete cascade,
  email text not null,
  role text not null default 'member' check (role in ('admin', 'member')),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked')),
  invited_by uuid,
  created_at timestamptz not null default now(),
  unique (org_id, email)
);

create index if not exists pending_invites_org_id_idx on pending_invites (org_id);

create table if not exists automation_log (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations (id) on delete cascade,
  entity_type text,
  entity_id uuid,
  action text not null,
  detail text,
  actor text not null default 'ai' check (actor in ('ai', 'human')),
  created_at timestamptz not null default now()
);

create index if not exists automation_log_org_id_idx on automation_log (org_id, created_at desc);

-- =============================================================================
-- Row Level Security
-- =============================================================================

-- Helper: the set of orgs the current JWT subject belongs to.
create or replace function public.current_org_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select org_id from profiles where id = auth.uid() and org_id is not null;
$$;

alter table organizations enable row level security;
alter table profiles enable row level security;

drop policy if exists "org_members_can_read_org" on organizations;
create policy "org_members_can_read_org" on organizations
  for select using (id in (select public.current_org_ids()));

drop policy if exists "org_owner_can_update_org" on organizations;
create policy "org_owner_can_update_org" on organizations
  for update using (owner_user_id = auth.uid());

drop policy if exists "profiles_self_or_same_org" on profiles;
create policy "profiles_self_or_same_org" on profiles
  for select using (id = auth.uid() or org_id in (select public.current_org_ids()));

drop policy if exists "profiles_self_update" on profiles;
create policy "profiles_self_update" on profiles
  for update using (id = auth.uid());

-- Apply the standard org-isolation pattern to every tenant table.
do $$
declare
  t text;
  tenant_tables text[] := array[
    'icp_profiles', 'business_profile', 'connected_accounts', 'agents',
    'prospects', 'prospect_feedback', 'sequences', 'sequence_steps',
    'sequence_enrollments', 'conversations', 'messages', 'voice_samples',
    'content_posts', 'subscriptions', 'usage_counters', 'org_settings',
    'pending_invites', 'automation_log'
  ];
begin
  foreach t in array tenant_tables loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "org_isolation_select" on %I', t);
    execute format(
      'create policy "org_isolation_select" on %I for select using (org_id in (select public.current_org_ids()))',
      t
    );
    execute format('drop policy if exists "org_isolation_all" on %I', t);
    execute format(
      'create policy "org_isolation_all" on %I for all using (org_id in (select public.current_org_ids())) with check (org_id in (select public.current_org_ids()))',
      t
    );
  end loop;
end
$$;
