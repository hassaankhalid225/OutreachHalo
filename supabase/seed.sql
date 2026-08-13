-- =============================================================================
-- Manual seed.
--
-- New signups are seeded automatically by the `handle_new_user()` trigger in
-- 0002_seed_and_bootstrap.sql, so you normally never need this file.
--
-- Use it to:
--   a) fill an org that already exists but is empty, or
--   b) create a standalone demo org with no auth user attached (local Postgres,
--      where auth.users does not exist).
-- =============================================================================

-- (a) Seed an existing org — replace the UUID with your own:
--
--   select public.seed_demo_data('00000000-0000-0000-0000-000000000000');


-- (b) Standalone demo org (local Postgres / docker-compose).
do $$
declare
  v_org_id uuid;
begin
  select id into v_org_id from organizations where name = 'Acme Analytics (demo)';

  if v_org_id is null then
    insert into organizations (name, owner_user_id, plan, billing_anchor)
    values ('Acme Analytics (demo)', gen_random_uuid(), 'trial', now() - interval '9 days')
    returning id into v_org_id;

    insert into org_settings (org_id, booking_url, timezone)
    values (v_org_id, 'https://cal.com/alex-morgan/15min', 'America/New_York')
    on conflict (org_id) do nothing;
  end if;

  perform public.seed_demo_data(v_org_id);

  raise notice 'Seeded org %', v_org_id;
end
$$;

select
  (select count(*) from prospects)   as prospects,
  (select count(*) from sequences)   as sequences,
  (select count(*) from conversations) as conversations,
  (select count(*) from messages)    as messages,
  (select count(*) from content_posts) as posts;
