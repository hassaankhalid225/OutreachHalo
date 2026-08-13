'use client'

import { createBrowserClient } from '@supabase/ssr'

import { SUPABASE_ANON_KEY, SUPABASE_URL, hasSupabase } from '@/lib/env'

/** Browser Supabase client. Returns `null` in demo mode. */
export function createClient() {
  if (!hasSupabase) return null
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}
