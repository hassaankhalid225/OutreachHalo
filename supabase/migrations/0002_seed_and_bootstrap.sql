-- =============================================================================
-- OutreachHalo — org bootstrap + demo seeding
--
-- `seed_demo_data(org_id)` fills a brand-new org with a realistic, fully wired
-- dataset so the dashboard is alive the moment a user lands on it — zero manual
-- data entry required to demo the product.
--
-- `handle_new_user()` runs on auth.users insert: creates the org, the profile,
-- default settings, and (unless disabled) the seed data.
-- =============================================================================

create or replace function public.seed_demo_data(p_org_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_seq_intro uuid;
  v_seq_signal uuid;
  v_seq_content uuid;
  v_prospect record;
  v_conv_id uuid;
  v_idx int;
  v_day int;
  v_count int;
  v_daily int[] := array[4, 7, 5, 9, 6, 3, 2, 8, 11, 7, 9, 6, 12, 8];
begin
  -- Guard: never double-seed an org.
  if exists (select 1 from prospects where org_id = p_org_id limit 1) then
    return;
  end if;

  -- -------------------------------------------------------------------------
  -- Business profile + ICP
  -- -------------------------------------------------------------------------
  insert into business_profile (org_id, website_url, what_you_sell, who_you_target, how_to_pitch, raw_scrape)
  values (
    p_org_id,
    'https://acme-analytics.com',
    'A revenue analytics platform that shows B2B teams which pipeline activity actually turns into closed revenue.',
    'Founders and revenue leaders at 20–200 person B2B SaaS companies running an outbound motion.',
    'Lead with the wasted-spend angle: most teams can name their top channel but not their top converting message.',
    '{"title":"Acme Analytics — revenue attribution for B2B teams","source":"seed"}'::jsonb
  );

  insert into icp_profiles (org_id, job_titles, company_size_min, company_size_max, industries, geographies, keywords)
  values (
    p_org_id,
    array['Founder', 'CEO', 'VP Sales', 'Head of Growth', 'COO', 'Sales Director'],
    10, 250,
    array['B2B SaaS', 'Marketing Agency', 'Professional Services', 'Fintech'],
    array['United States', 'United Kingdom', 'Canada', 'Germany'],
    array['outbound', 'pipeline', 'demand gen', 'revenue ops']
  );

  -- -------------------------------------------------------------------------
  -- Connected accounts (Phase 1: mock_connected — no real OAuth yet)
  -- -------------------------------------------------------------------------
  insert into connected_accounts (org_id, provider, account_label, status, daily_cap, last_synced_at)
  values
    (p_org_id, 'linkedin',         'Personal LinkedIn',        'mock_connected', 25, now() - interval '11 minutes'),
    (p_org_id, 'gmail',            'you@acme-analytics.com',   'mock_connected', 40, now() - interval '6 minutes'),
    (p_org_id, 'outlook',          'sales@acme-analytics.com', 'mock_connected', 30, now() - interval '2 hours'),
    (p_org_id, 'google_workspace', 'Acme Analytics Workspace', 'mock_connected', 50, now() - interval '1 day')
  on conflict (org_id, provider) do nothing;

  -- -------------------------------------------------------------------------
  -- Agents
  -- -------------------------------------------------------------------------
  insert into agents (org_id, name, status, channels, approval_mode, tone, daily_cap)
  values
    (p_org_id, 'Outbound Agent', 'active', array['linkedin', 'email'], 'approve_first', 'Direct, friendly, no fluff', 25),
    (p_org_id, 'Inbound Agent',  'active', array['linkedin'],          'approve_all',   'Warm, curious, specific',    15);

  -- -------------------------------------------------------------------------
  -- Prospects (25)
  -- -------------------------------------------------------------------------
  insert into prospects (
    org_id, full_name, title, company, linkedin_url, location, company_size, industry,
    fit_score, intent_level, signals, source, sequence_status, created_at, last_activity_at
  )
  select
    p_org_id, x.full_name, x.title, x.company,
    'https://www.linkedin.com/in/' || lower(replace(x.full_name, ' ', '-')),
    x.location, x.company_size, x.industry, x.fit_score, x.intent_level,
    x.signals::jsonb, x.source, x.sequence_status,
    now() - (x.age_days || ' days')::interval,
    now() - (x.activity_hours || ' hours')::interval
  from (values
    ('Sarah Jenkins',    'COO',                    'Maker Loop',        'Austin, TX',        48,  'Manufacturing SaaS',   94, 'hot',  '["Hiring SDRs","Engaged a competitor","Posted about outbound","Changed roles 12 days ago"]', 'linkedin_search',      'replied',     14, 2),
    ('Devon Wu',         'Head of Growth',         'Northbeam Labs',    'San Francisco, CA', 72,  'B2B SaaS',             91, 'hot',  '["Raised a seed round","Opened 3 roles in sales","Mentioned scaling pipeline"]',              'linkedin_search',      'replied',     13, 5),
    ('Maya Rodriguez',   'Founder',                'Cadence Studio',    'Denver, CO',        18,  'Marketing Agency',     87, 'hot',  '["Commented on your post","Asked for tool recommendations"]',                                'content_engagement',   'replied',     12, 9),
    ('Jordan Mitchell',  'Founder',                'Realm',             'New York, NY',      26,  'B2B SaaS',             96, 'hot',  '["Hiring SDRs","Budget cycle starting","Viewed your profile","Switched CRM"]',               'linkedin_search',      'in_sequence',  9, 6),
    ('Alex Santoro',     'CEO',                    'Brightform',        'London, UK',        61,  'Fintech',              89, 'hot',  '["Company headcount +18% QoQ","Engaged a competitor","Published a case study"]',             'linkedin_search',      'in_sequence',  9, 11),
    ('Riya Patel',       'Founder',                'Nestpoint',         'Toronto, ON',       14,  'Professional Services',83, 'warm', '["Posted about outbound","Attended a GTM webinar"]',                                        'linkedin_search',      'in_sequence',  8, 18),
    ('Tomas Herrera',    'VP Sales',               'Kestrel Data',      'Chicago, IL',       140, 'B2B SaaS',             92, 'hot',  '["Job change to VP Sales","Opened 3 roles in sales","Mentioned scaling pipeline"]',          'linkedin_search',      'replied',     11, 26),
    ('Nina Kowalski',    'Director of Sales',      'Fathom HQ',         'Berlin, DE',        88,  'B2B SaaS',             78, 'warm', '["Website tech change detected","Attended a GTM webinar"]',                                  'linkedin_search',      'in_sequence',  7, 30),
    ('Ben Okafor',       'Managing Director',      'Okafor Digital',    'Manchester, UK',    32,  'Marketing Agency',     81, 'warm', '["Commented on your post","New office announced"]',                                          'content_engagement',   'in_sequence',  7, 33),
    ('Grace Lindqvist',  'Head of Revenue',        'Tidewell',          'Stockholm, SE',     55,  'B2B SaaS',             86, 'hot',  '["Engaged a competitor","Budget cycle starting","Viewed your profile"]',                     'linkedin_search',      'replied',     10, 41),
    ('Marcus Bell',      'Founder',                'Ledgerly',          'Boston, MA',        21,  'Fintech',              74, 'warm', '["Raised a seed round","Posted about outbound"]',                                            'linkedin_search',      'in_sequence',  6, 47),
    ('Priya Nair',       'CEO',                    'Symbol & Co',       'Dublin, IE',        44,  'Professional Services',80, 'warm', '["Published a case study","Hiring SDRs"]',                                                   'linkedin_search',      'in_sequence',  6, 52),
    ('Felix Braun',      'Co-founder',             'Runway Ops',        'Munich, DE',        16,  'B2B SaaS',             71, 'warm', '["Switched CRM","Mentioned scaling pipeline"]',                                              'linkedin_search',      'in_sequence',  6, 58),
    ('Hannah Choi',      'Sales Director',         'Vantage Point',     'Seattle, WA',       115, 'B2B SaaS',             88, 'hot',  '["Opened 3 roles in sales","Engaged a competitor","Company headcount +18% QoQ"]',            'linkedin_search',      'replied',      5, 3),
    ('Omar Haddad',      'Agency Owner',           'Haddad Creative',   'Dubai, AE',         27,  'Marketing Agency',     69, 'warm', '["Commented on your post"]',                                                                 'content_engagement',   'in_sequence',  5, 64),
    ('Elena Rossi',      'Head of Partnerships',   'Auralite',          'Milan, IT',         63,  'B2B SaaS',             64, 'cold', '["Attended a GTM webinar"]',                                                                 'linkedin_search',      'not_started',  5, 70),
    ('Chris Delaney',    'VP Revenue Ops',         'Pinewell',          'Atlanta, GA',       190, 'Professional Services',85, 'warm', '["Switched CRM","Budget cycle starting"]',                                                   'linkedin_search',      'in_sequence',  4, 12),
    ('Aisha Bello',      'Founder',                'Bellocraft',        'Lagos, NG',         11,  'Marketing Agency',     58, 'cold', '["Viewed your profile"]',                                                                    'content_engagement',   'not_started',  4, 77),
    ('Lukas Meyer',      'CEO',                    'Formwise Nordics',  'Oslo, NO',          38,  'B2B SaaS',             76, 'warm', '["New office announced","Posted about outbound"]',                                           'linkedin_search',      'not_started',  3, 15),
    ('Sofia Marchetti',  'Head of Demand Gen',     'Corvus',            'Barcelona, ES',     96,  'B2B SaaS',             82, 'warm', '["Published a case study","Asked for tool recommendations"]',                                'linkedin_search',      'in_sequence',  3, 21),
    ('Ryan Whitfield',   'Founder',                'Whitfield & Rowe',  'Nashville, TN',     9,   'Professional Services',52, 'cold', '["Viewed your profile"]',                                                                    'linkedin_search',      'not_started',  3, 88),
    ('Ingrid Sorensen',  'COO',                    'Nordic Bloom',      'Copenhagen, DK',    54,  'B2B SaaS',             79, 'warm', '["Company headcount +18% QoQ","Hiring SDRs"]',                                               'linkedin_search',      'not_started',  2, 29),
    ('Daniel Ortiz',     'Sales Lead',             'Beacon Path',       'Miami, FL',         41,  'Fintech',              66, 'cold', '["Website tech change detected"]',                                                           'linkedin_search',      'not_started',  2, 35),
    ('Zoe Karim',        'Founder',                'Loomcraft Studio',  'Vancouver, BC',     13,  'Marketing Agency',     73, 'warm', '["Commented on your post","Asked for tool recommendations"]',                                'content_engagement',   'not_started',  1, 8),
    ('Peter Novak',      'Managing Partner',       'Novak Advisory',    'Prague, CZ',        29,  'Professional Services',47, 'cold', '["Attended a GTM webinar"]',                                                                 'linkedin_search',      'not_started',  1, 44)
  ) as x(full_name, title, company, location, company_size, industry, fit_score, intent_level, signals, source, sequence_status, age_days, activity_hours);

  -- -------------------------------------------------------------------------
  -- Sequences + steps
  -- -------------------------------------------------------------------------
  insert into sequences (org_id, name, description, status, approval_mode, created_at)
  values (p_org_id, 'Founder intro — LinkedIn first', 'Warm 4-touch intro for founders at 10–50 person companies.', 'active', 'approve_first', now() - interval '21 days')
  returning id into v_seq_intro;

  insert into sequences (org_id, name, description, status, approval_mode, created_at)
  values (p_org_id, 'Hot signal — same day outreach', 'Fires when a prospect crosses 85 fit with a hiring or competitor signal.', 'active', 'autopilot', now() - interval '12 days')
  returning id into v_seq_signal;

  insert into sequences (org_id, name, description, status, approval_mode, created_at)
  values (p_org_id, 'Post engagers — inbound follow-up', 'Reaches everyone who reacted or commented on a published post.', 'paused', 'approve_all', now() - interval '6 days')
  returning id into v_seq_content;

  insert into sequence_steps (sequence_id, org_id, step_order, channel, delay_days, subject, message_template, ai_personalize)
  values
    (v_seq_intro, p_org_id, 1, 'linkedin', 0, null,
     'Hey {{first_name}}, noticed {{company}} is {{signal}}. I help teams like yours see which outbound messages actually turn into revenue. Worth a look?', true),
    (v_seq_intro, p_org_id, 2, 'email', 2, 'Quick idea for {{company}}',
     'Hi {{first_name}} — following up here since LinkedIn gets noisy. Most teams your size can name their best channel but not their best converting message. That gap is usually worth 20-30% of pipeline. Open to a 15 minute look?', true),
    (v_seq_intro, p_org_id, 3, 'linkedin', 4, null,
     'Did the note land, {{first_name}}? Happy to send over the one-pager instead if that is easier.', false),
    (v_seq_intro, p_org_id, 4, 'email', 7, 'Last one from me',
     'Closing the loop, {{first_name}}. If pipeline attribution is not on the roadmap at {{company}} this quarter, no problem at all — I will stop here.', false),

    (v_seq_signal, p_org_id, 1, 'linkedin', 0, null,
     'Saw {{company}} is {{signal}} — congrats on the growth. Quick idea on keeping the new pipeline full without adding headcount.', true),
    (v_seq_signal, p_org_id, 2, 'email', 2, 'On {{company}} scaling outbound',
     'Hi {{first_name}}, given {{signal}} I figured the timing was right. We cut list-build time roughly in half for teams in the same spot. Want the 3-minute version?', true),
    (v_seq_signal, p_org_id, 3, 'linkedin', 5, null,
     'Still worth a conversation, {{first_name}}? Happy to just share what we see working for {{company}}-sized teams.', true),

    (v_seq_content, p_org_id, 1, 'linkedin', 0, null,
     'Thanks for the comment on my post, {{first_name}} — you clearly think about this properly. Curious how {{company}} handles it today?', true),
    (v_seq_content, p_org_id, 2, 'linkedin', 3, null,
     'Wrote up the longer version of that post, {{first_name}}. Want me to send it over?', false),
    (v_seq_content, p_org_id, 3, 'email', 6, 'The write-up I mentioned',
     'Hi {{first_name}}, here is the longer breakdown I promised. No pitch — tell me if any of it is useful for {{company}}.', true);

  -- -------------------------------------------------------------------------
  -- Enrollments — everyone not "not_started" gets one
  -- -------------------------------------------------------------------------
  v_idx := 0;
  for v_prospect in
    select id, sequence_status, source, fit_score
    from prospects
    where org_id = p_org_id and sequence_status <> 'not_started'
    order by created_at
  loop
    v_idx := v_idx + 1;
    insert into sequence_enrollments (sequence_id, prospect_id, org_id, current_step, status, enrolled_at)
    values (
      case
        when v_prospect.source = 'content_engagement' then v_seq_content
        when v_prospect.fit_score >= 85 then v_seq_signal
        else v_seq_intro
      end,
      v_prospect.id,
      p_org_id,
      1 + (v_idx % 4),
      case when v_prospect.sequence_status = 'replied' then 'completed' else 'active' end,
      now() - ((v_idx % 9) || ' days')::interval
    )
    on conflict (sequence_id, prospect_id) do nothing;
  end loop;

  -- -------------------------------------------------------------------------
  -- Conversations + threads (10)
  -- -------------------------------------------------------------------------
  for v_prospect in
    select p.id, p.full_name, p.company, t.intent_tag, t.autopilot, t.hours_ago, t.unread
    from (values
      ('Sarah Jenkins',   'interested', true,  2,   true),
      ('Devon Wu',        'question',   false, 5,   true),
      ('Maya Rodriguez',  'interested', false, 9,   true),
      ('Tomas Herrera',   'not_now',    false, 26,  false),
      ('Grace Lindqvist', 'interested', true,  41,  false),
      ('Hannah Choi',     'question',   false, 3,   true),
      ('Jordan Mitchell', 'neutral',    false, 6,   false),
      ('Alex Santoro',    'neutral',    false, 11,  false),
      ('Chris Delaney',   'question',   false, 12,  false),
      ('Sofia Marchetti', 'not_now',    false, 21,  false)
    ) as t(full_name, intent_tag, autopilot, hours_ago, unread)
    join prospects p on p.full_name = t.full_name and p.org_id = p_org_id
  loop
    insert into conversations (org_id, prospect_id, intent_tag, autopilot_enabled, last_message_at, meeting_booked_at)
    values (
      p_org_id, v_prospect.id, v_prospect.intent_tag, v_prospect.autopilot,
      now() - (v_prospect.hours_ago || ' hours')::interval,
      case when v_prospect.intent_tag = 'interested' and not v_prospect.unread
        then now() + interval '2 days' else null end
    )
    on conflict (org_id, prospect_id) do nothing
    returning id into v_conv_id;

    if v_conv_id is null then
      continue;
    end if;

    -- Outbound opener
    insert into messages (org_id, prospect_id, conversation_id, channel, direction, body, sent_at, read_at, ai_generated)
    values (
      p_org_id, v_prospect.id, v_conv_id, 'linkedin', 'outbound',
      'Hey ' || split_part(v_prospect.full_name, ' ', 1) || ', noticed ' || v_prospect.company ||
      ' is scaling outbound this quarter. We help teams see which messages actually turn into revenue — worth a quick look?',
      now() - ((v_prospect.hours_ago + 72) || ' hours')::interval, now(), true
    );

    -- Their reply, tone matched to the intent tag
    insert into messages (org_id, prospect_id, conversation_id, channel, direction, body, sent_at, read_at, ai_generated)
    values (
      p_org_id, v_prospect.id, v_conv_id, 'linkedin', 'inbound',
      case v_prospect.intent_tag
        when 'interested' then 'Let''s hop on a quick call this week — how is Thursday afternoon?'
        when 'question'   then 'Curious how this compares to what we already run in HubSpot. What is actually different?'
        when 'not_now'    then 'Not right now — we are mid-quarter. Circle back in Q2?'
        else 'Thanks for reaching out.'
      end,
      now() - (v_prospect.hours_ago || ' hours')::interval,
      case when v_prospect.unread then null else now() end,
      false
    );

    -- A follow-up on the older threads so they read as real conversations
    if v_prospect.hours_ago > 10 then
      insert into messages (org_id, prospect_id, conversation_id, channel, direction, body, sent_at, read_at, ai_generated)
      values (
        p_org_id, v_prospect.id, v_conv_id, 'email', 'outbound',
        case v_prospect.intent_tag
          when 'interested' then 'Thursday works. Here is my booking link so you can grab whichever slot suits — looking forward to it.'
          when 'question'   then 'Fair question. HubSpot tells you a deal closed; we tell you which message got the reply that started it. Happy to show it on your own data.'
          else 'Totally understood — I will check back in early Q2. If anything changes before then, just reply here.'
        end,
        now() - ((v_prospect.hours_ago - 1) || ' hours')::interval, now(), true
      );

      update conversations
      set last_message_at = now() - ((v_prospect.hours_ago - 1) || ' hours')::interval
      where id = v_conv_id;
    end if;

    v_conv_id := null;
  end loop;

  -- -------------------------------------------------------------------------
  -- 14 days of outbound volume so the activity chart has real shape
  -- -------------------------------------------------------------------------
  for v_day in 0..13 loop
    v_count := v_daily[v_day + 1];
    -- make_interval keeps the arithmetic unambiguous; `bigint * interval` relies
    -- on an implicit cast that is easy to trip over.
    insert into messages (org_id, prospect_id, conversation_id, channel, direction, body, sent_at, read_at, ai_generated)
    select
      p_org_id, p.id, null,
      case when (row_number() over ()) % 3 = 0 then 'email' else 'linkedin' end,
      'outbound',
      'Sequence step sent automatically by your agent.',
      (now() - make_interval(days => 13 - v_day))
        + make_interval(mins => ((row_number() over ()) * 17)::int),
      now(), true
    from prospects p
    where p.org_id = p_org_id and p.sequence_status in ('in_sequence', 'replied', 'closed')
    limit v_count;
  end loop;

  -- -------------------------------------------------------------------------
  -- Content
  -- -------------------------------------------------------------------------
  insert into voice_samples (org_id, sample_text)
  values (
    p_org_id,
    'Most outbound fails for one boring reason: nobody knows which message actually worked. ' ||
    'We tracked 4,000 sends last quarter. The winner was not the clever one. It was the one that named a problem the buyer had already said out loud. Steal that.'
  );

  insert into content_posts (org_id, body_text, status, scheduled_at, posted_at, reactions_count, comments_count, leads_generated_count, created_at)
  values
    (p_org_id,
     'Most outbound fails for one boring reason. Here is the fix we use to win new clients every week.' || chr(10) || chr(10) ||
     'Stop writing clever openers. Name the thing your buyer already said out loud — in their own words — and ask one question about it. That is the whole trick.',
     'posted', null, now() - interval '6 days', 94, 17, 3, now() - interval '8 days'),
    (p_org_id,
     'We replaced our SDR list-building with an agent that reads intent signals instead of job titles.' || chr(10) || chr(10) ||
     'Reply rate went from 4% to 11% in three weeks. Not because the copy got better. Because the timing did.',
     'posted', null, now() - interval '2 days', 61, 9, 2, now() - interval '3 days'),
    (p_org_id,
     'The 6 hours a week you spend checking whether a lead is a fit is the most expensive hour in your business. Here is how we got it to zero.',
     'scheduled', now() + interval '2 days', null, 0, 0, 0, now() - interval '1 day'),
    (p_org_id,
     'Three buying signals that beat "downloaded a whitepaper" every single time — and how to watch for them without a data team.',
     'scheduled', now() + interval '5 days', null, 0, 0, 0, now() - interval '1 day'),
    (p_org_id,
     'Draft: why "book a demo" is the worst call-to-action in B2B and what we send instead.',
     'draft', null, null, 0, 0, 0, now() - interval '4 hours'),
    (p_org_id,
     'Draft: the 18 intent signals we score every prospect against, ranked by how well they actually predict a reply.',
     'draft', null, null, 0, 0, 0, now() - interval '2 hours');

  -- -------------------------------------------------------------------------
  -- Billing + usage
  -- -------------------------------------------------------------------------
  insert into subscriptions (org_id, stripe_customer_id, stripe_subscription_id, plan, status, current_period_end)
  values (p_org_id, null, null, 'pro', 'trialing', now() + interval '7 days')
  on conflict (org_id) do nothing;

  insert into usage_counters (org_id, period_start, period_end, prospects_used, posts_used, senders_used)
  values (p_org_id, now() - interval '9 days', now() + interval '21 days', 340, 12, 2)
  on conflict (org_id, period_start) do nothing;

  -- -------------------------------------------------------------------------
  -- Activity feed
  -- -------------------------------------------------------------------------
  insert into automation_log (org_id, entity_type, entity_id, action, detail, actor, created_at)
  values
    (p_org_id, 'prospect', null, 'prospects_found',  'Found 3 new prospects matching your ICP',              'ai',    now() - interval '18 minutes'),
    (p_org_id, 'message',  null, 'messages_sent',    'Sent 5 messages from your LinkedIn account',            'ai',    now() - interval '52 minutes'),
    (p_org_id, 'conversation', null, 'reply_received','1 reply needs your attention — Sarah Jenkins',         'ai',    now() - interval '2 hours'),
    (p_org_id, 'content',  null, 'post_published',   'Published "Most outbound fails for one boring reason"', 'ai',    now() - interval '6 hours'),
    (p_org_id, 'conversation', null, 'meeting_booked','Autopilot booked a meeting with Grace Lindqvist',      'ai',    now() - interval '9 hours'),
    (p_org_id, 'prospect', null, 'feedback',         'You marked 2 prospects as a good fit',                  'human', now() - interval '1 day'),
    (p_org_id, 'sequence', null, 'sequence_started', 'Started "Hot signal — same day outreach"',              'human', now() - interval '2 days');
end;
$$;

-- ---------------------------------------------------------------------------
-- Bootstrap a brand-new user: org + profile + settings + seed data.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
  v_name text;
begin
  v_name := coalesce(
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'name',
    split_part(new.email, '@', 1)
  );

  insert into organizations (name, owner_user_id, plan, billing_anchor)
  values (coalesce(nullif(v_name, ''), 'My workspace') || '''s workspace', new.id, 'trial', now())
  returning id into v_org_id;

  insert into profiles (id, org_id, email, full_name, role)
  values (new.id, v_org_id, new.email, v_name, 'owner');

  insert into org_settings (org_id) values (v_org_id) on conflict do nothing;

  -- Every new workspace lands on a live dashboard rather than an empty state.
  perform public.seed_demo_data(v_org_id);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
