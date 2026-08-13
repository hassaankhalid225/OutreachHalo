import { Suspense } from 'react'
import type { Metadata } from 'next'

import { AuthForm } from '@/components/auth/auth-form'
import { Skeleton } from '@/components/ui/misc'

export const metadata: Metadata = {
  title: 'Start your free trial',
  description: 'Create your OutreachHalo workspace. 7 days free, no card required.',
  alternates: { canonical: '/sign-up' },
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full max-w-sm" />}>
      <AuthForm mode="sign-up" />
    </Suspense>
  )
}
