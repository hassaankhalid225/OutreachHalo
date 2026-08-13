import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const HAS_SUPABASE = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

const DEMO_SESSION_COOKIE = 'oh_demo_session'
const AUTH_PAGES = ['/sign-in', '/sign-up']

/**
 * Guards `/app/*` and keeps the Supabase session cookie fresh.
 * In demo mode there is no Supabase, so a local cookie stands in for a session.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAppRoute = pathname.startsWith('/app')
  const isAuthPage = AUTH_PAGES.some((page) => pathname.startsWith(page))

  if (!HAS_SUPABASE) {
    const signedIn = Boolean(request.cookies.get(DEMO_SESSION_COOKIE))

    if (isAppRoute && !signedIn) {
      const url = request.nextUrl.clone()
      url.pathname = '/sign-in'
      url.searchParams.set('next', pathname)
      return NextResponse.redirect(url)
    }

    if (isAuthPage && signedIn) {
      const url = request.nextUrl.clone()
      url.pathname = '/app/dashboard'
      url.search = ''
      return NextResponse.redirect(url)
    }

    return NextResponse.next()
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })

  // Refreshes the auth token as a side effect — do not remove.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (isAppRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/sign-in'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  if (isAuthPage && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/app/dashboard'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Everything except static assets and image files — the session refresh
     * needs to run on navigations, not on every chunk request.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|txt|xml)$).*)',
  ],
}
