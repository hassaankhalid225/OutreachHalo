import { Suspense } from 'react'
import type { Metadata } from 'next'

import { AuthForm } from '@/components/auth/auth-form'
import { Skeleton } from '@/components/ui/misc'

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to your OutreachHalo workspace.',
  alternates: { canonical: '/sign-in' },
  robots: { index: false, follow: true },
}

export default function SignInPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full max-w-sm" />}>
      <AuthForm mode="sign-in" />
    </Suspense>
  )
}
