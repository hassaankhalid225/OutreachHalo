'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { hasSupabase } from '@/lib/env'
import { createClient } from '@/lib/supabase/server'
import { DEMO_SESSION_COOKIE, ONBOARDING_COOKIE } from '@/lib/auth'

export interface AuthState {
  error?: string
  message?: string
}

const YEAR = 60 * 60 * 24 * 365

async function startDemoSession(email: string, name: string, alreadyOnboarded: boolean) {
  const cookieStore = await cookies()
  const options = { path: '/', maxAge: YEAR, sameSite: 'lax' as const }

  cookieStore.set(DEMO_SESSION_COOKIE, '1', options)
  cookieStore.set('oh_demo_email', email, options)
  cookieStore.set('oh_demo_name', name, options)
  if (alreadyOnboarded) cookieStore.set(ONBOARDING_COOKIE, '1', options)
}

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const next = String(formData.get('next') ?? '/app/dashboard')

  if (!email || !password) return { error: 'Enter your email and password.' }

  if (!hasSupabase) {
    // Demo mode: any credentials work and land on the fully seeded workspace.
    await startDemoSession(email, email.split('@')[0].replace(/[._-]/g, ' '), true)
    redirect(next.startsWith('/app') ? next : '/app/dashboard')
  }

  const supabase = await createClient()
  if (!supabase) return { error: 'Authentication is not configured.' }

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: error.message }

  redirect(next.startsWith('/app') ? next : '/app/dashboard')
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const fullName = String(formData.get('full_name') ?? '').trim()

  if (!email || !password) return { error: 'Enter your email and a password.' }
  if (password.length < 8) return { error: 'Use at least 8 characters for your password.' }

  if (!hasSupabase) {
    await startDemoSession(email, fullName || email.split('@')[0], false)
    redirect('/app/onboarding')
  }

  const supabase = await createClient()
  if (!supabase) return { error: 'Authentication is not configured.' }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  })

  if (error) return { error: error.message }

  // Email confirmation is on — there is no session yet.
  if (!data.session) {
    return { message: 'Check your inbox to confirm your email, then sign in.' }
  }

  redirect('/app/onboarding')
}

export async function signOut() {
  if (hasSupabase) {
    const supabase = await createClient()
    await supabase?.auth.signOut()
  }

  const cookieStore = await cookies()
  cookieStore.delete(DEMO_SESSION_COOKIE)
  cookieStore.delete('oh_demo_email')
  cookieStore.delete('oh_demo_name')
  cookieStore.delete(ONBOARDING_COOKIE)

  redirect('/')
}

export async function completeOnboarding() {
  if (!hasSupabase) {
    const cookieStore = await cookies()
    cookieStore.set(ONBOARDING_COOKIE, '1', { path: '/', maxAge: YEAR, sameSite: 'lax' })
    return
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = (await supabase?.auth.getUser()) ?? { data: { user: null } }

  if (user) {
    await supabase?.from('profiles').update({ onboarded_at: new Date().toISOString() }).eq('id', user.id)
  }
}
