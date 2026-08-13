import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

import { SUPABASE_ANON_KEY, SUPABASE_URL, hasSupabase } from '@/lib/env'

/**
 * Server-side Supabase client bound to the request's cookie jar.
 * Returns `null` in demo mode so callers can fall back cleanly.
 */
export async function createClient() {
  if (!hasSupabase) return null

  const cookieStore = await cookies()

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // Called from a Server Component — the middleware refreshes the
          // session cookie instead, so this is safe to swallow.
        }
      },
    },
  })
}

/** The signed-in user's Supabase access token, used to authenticate to FastAPI. */
export async function getAccessToken(): Promise<string | null> {
  const supabase = await createClient()
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}
