-- =============================================================================
-- Local-Postgres compatibility shim.
--
-- Supabase provides the `auth` schema, `auth.users` and `auth.uid()`. Plain
-- Postgres (docker-compose, CI) does not, and 0001/0002 reference all three.
--
-- Every statement here is guarded by an existence check, so on a real Supabase
-- project this file touches nothing at all — it never attempts to create, alter
-- or replace anything in the `auth` schema.
-- =============================================================================

create extension if not exists "pgcrypto";

do $$
begin
  -- --- auth schema ---------------------------------------------------------
  if not exists (select 1 from pg_namespace where nspname = 'auth') then
    execute 'create schema auth';
    raise notice 'Created stand-in auth schema (local Postgres)';
  end if;

  -- --- auth.users ----------------------------------------------------------
  if not exists (
    select 1 from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'auth' and c.relname = 'users'
  ) then
    execute $ddl$
      create table auth.users (
        id uuid primary key default gen_random_uuid(),
        email text unique,
        raw_user_meta_data jsonb not null default '{}'::jsonb,
        created_at timestamptz not null default now()
      )
    $ddl$;
    raise notice 'Created stand-in auth.users (local Postgres)';
  end if;

  -- --- auth.uid() ----------------------------------------------------------
  -- Supabase's version reads the verified JWT. The stand-in reads the same
  -- session setting PostgREST uses, so RLS policies behave identically when a
  -- connection sets `request.jwt.claim.sub`.
  if not exists (
    select 1 from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'auth' and p.proname = 'uid'
  ) then
    execute $ddl$
      create function auth.uid() returns uuid
      language sql stable
      as $fn$
        select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
      $fn$
    $ddl$;
    raise notice 'Created stand-in auth.uid() (local Postgres)';
  end if;
end
$$;
