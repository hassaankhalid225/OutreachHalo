import 'server-only'

import { cookies } from 'next/headers'

import { hasSupabase } from '@/lib/env'
import { createClient } from '@/lib/supabase/server'
import { demoOrganization, demoProfile } from '@/lib/data/fixtures'
import type { Organization, Profile } from '@/lib/types'

export const DEMO_SESSION_COOKIE = 'oh_demo_session'
export const ONBOARDING_COOKIE = 'oh_onboarded'

export interface SessionContext {
  user: { id: string; email: string | null }
  profile: Profile
  organization: Organization
  isDemo: boolean
}

/**
 * Resolves the current session. In live mode this is the Supabase user plus
 * their profile/org rows; in demo mode it is a cookie-gated fixture identity.
 */
export async function getSession(): Promise<SessionContext | null> {
  if (!hasSupabase) {
    const cookieStore = await cookies()
    if (!cookieStore.get(DEMO_SESSION_COOKIE)) return null

    const name = cookieStore.get('oh_demo_name')?.value
    const email = cookieStore.get('oh_demo_email')?.value

    return {
      user: { id: demoProfile.id, email: email ?? demoProfile.email },
      profile: { ...demoProfile, full_name: name ?? demoProfile.full_name, email: email ?? demoProfile.email },
      organization: { ...demoOrganization, name: name ? `${name.split(' ')[0]}’s workspace` : demoOrganization.name },
      isDemo: true,
    }
  }

  const supabase = await createClient()
  if (!supabase) return null

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, org_id, email, full_name, avatar_url, role, onboarded_at')
    .eq('id', user.id)
    .single()

  if (!profile?.org_id) return null

  const { data: organization } = await supabase
    .from('organizations')
    .select('id, name, plan, billing_anchor, created_at')
    .eq('id', profile.org_id)
    .single()

  if (!organization) return null

  return {
    user: { id: user.id, email: user.email ?? null },
    profile: profile as Profile,
    organization: organization as Organization,
    isDemo: false,
  }
}

/** Has this workspace finished the onboarding wizard? */
export async function hasOnboarded(session: SessionContext): Promise<boolean> {
  if (session.isDemo) {
    const cookieStore = await cookies()
    return cookieStore.get(ONBOARDING_COOKIE)?.value === '1'
  }
  return Boolean(session.profile.onboarded_at)
}
