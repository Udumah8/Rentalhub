import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    const protectedPaths = ['/landlord/dashboard', '/admin']
    const isProtected = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))
    if (isProtected) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
    return response
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  const token = request.cookies.get('sb-access-token')?.value

  if (token) {
    try {
      const { data: { user } } = await supabase.auth.getUser(token)
      if (user) {
        return response
      }
    } catch {
      // Invalid token, continue to redirect
    }
  }

  const protectedPaths = ['/landlord/dashboard', '/admin']
  const isProtected = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))

  if (isProtected) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return response
}

export const config = {
  matcher: ['/landlord/:path*', '/admin/:path*'],
}