'use client'

import * as React from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useFormStatus } from 'react-dom'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

import { signIn, signUp, type AuthState } from '@/app/actions/auth'
import { isDemoMode } from '@/lib/env'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GoogleWorkspaceGlyph } from '@/components/brand/logos'

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="lg" className="w-full" loading={pending}>
      {label}
    </Button>
  )
}

export function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/app/dashboard'
  const plan = searchParams.get('plan')

  const action = mode === 'sign-in' ? signIn : signUp
  const [state, formAction] = React.useActionState<AuthState, FormData>(action, {})
  const [googleLoading, setGoogleLoading] = React.useState(false)

  async function signInWithGoogle() {
    const supabase = createClient()
    if (!supabase) return
    setGoogleLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    })
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-semibold tracking-tight">
        {mode === 'sign-in' ? 'Welcome back' : 'Launch your agent'}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {mode === 'sign-in'
          ? 'Sign in to your workspace.'
          : plan
            ? `Starting your 7-day free trial on the ${plan} plan. No card required.`
            : 'Free for 7 days. No card required to start.'}
      </p>

      <form action={formAction} className="mt-8 space-y-4">
        <input type="hidden" name="next" value={next} />

        {mode === 'sign-up' && (
          <div className="space-y-2">
            <Label htmlFor="full_name">Your name</Label>
            <Input id="full_name" name="full_name" autoComplete="name" placeholder="Alex Morgan" />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Work email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@company.com"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            {mode === 'sign-in' && (
              <span className="text-xs text-muted-foreground">
                {isDemoMode ? 'Demo mode — any password works' : ''}
              </span>
            )}
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
            placeholder={mode === 'sign-up' ? 'At least 8 characters' : '••••••••'}
          />
        </div>

        {state.error && (
          <p className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-xs text-destructive">
            <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
            {state.error}
          </p>
        )}

        {state.message && (
          <p className="flex items-start gap-2 rounded-xl border border-positive/30 bg-positive/10 px-3 py-2.5 text-xs text-positive">
            <CheckCircle2 className="mt-0.5 size-3.5 shrink-0" />
            {state.message}
          </p>
        )}

        <SubmitButton label={mode === 'sign-in' ? 'Sign in' : 'Create my workspace'} />
      </form>

      {!isDemoMode && (
        <>
          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={signInWithGoogle}
            loading={googleLoading}
          >
            <span className="size-4 overflow-hidden rounded">
              <GoogleWorkspaceGlyph />
            </span>
            Continue with Google
          </Button>
        </>
      )}

      <p className="mt-8 text-center text-sm text-muted-foreground">
        {mode === 'sign-in' ? (
          <>
            No account yet?{' '}
            <Link href="/sign-up" className="font-medium text-primary hover:underline">
              Start free
            </Link>
          </>
        ) : (
          <>
            Already have one?{' '}
            <Link href="/sign-in" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </>
        )}
      </p>

      {mode === 'sign-up' && (
        <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
          By creating an account you agree to our{' '}
          <Link href="/terms" className="underline underline-offset-2 hover:text-foreground">
            terms
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">
            privacy policy
          </Link>
          .
        </p>
      )}
    </div>
  )
}
