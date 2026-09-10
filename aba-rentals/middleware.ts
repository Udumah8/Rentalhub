import { updateSession } from '@/lib/supabase/proxy'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = await updateSession(request)
  const pathname = request.nextUrl.pathname
  const protectedPath = pathname.startsWith('/landlord') || pathname.startsWith('/admin')
  if (!protectedPath) return response

  const { createServerClient } = await import('@supabase/ssr')
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: { getAll: () => request.cookies.getAll(), setAll: () => undefined },
  })
  const { data: { user } } = await supabase.auth.getUser()
  return user ? response : Response.redirect(new URL('/auth/login', request.url))
}

export const config = { matcher: ['/landlord/:path*', '/admin/:path*'] }
