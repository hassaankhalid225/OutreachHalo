/**
 * Runtime capability detection.
 *
 * The app runs in one of two modes:
 *
 *  - **Live** — Supabase is configured, so auth is real, and every read/write
 *    goes through the FastAPI backend against Postgres with RLS.
 *  - **Demo** — nothing is configured. Auth is a local cookie, and data comes
 *    from the in-memory store in `lib/data/store.ts`, seeded identically to the
 *    SQL seed. This is what makes `npm run dev` work with an empty `.env`.
 *
 * Nothing in the UI branches on this; only `lib/data/repo.ts` and the auth
 * helpers do.
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

export const API_BASE_URL = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? '').replace(/\/$/, '')

export const hasSupabase = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
export const hasBackend = Boolean(API_BASE_URL)

/** Demo mode is the default so the project runs with zero configuration. */
export const isDemoMode = !hasSupabase

export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export const STRIPE_ENABLED = Boolean(process.env.STRIPE_SECRET_KEY)
