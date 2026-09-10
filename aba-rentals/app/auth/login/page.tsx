'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        router.push('/landlord/dashboard')
      }
    }
    checkAuth()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!email || !password) {
      setError('Email and password are required')
      setLoading(false)
      return
    }

    const { error } = await signIn(email, password)

    if (error) {
      setError(error.message || 'Failed to sign in. Please check your credentials.')
      setLoading(false)
    } else {
      router.push('/landlord/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-blue-600">Aba Rentals</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Sign In</h1>
          <p className="text-gray-500 mt-2">Access your landlord dashboard</p>
        </div>

        <div className="card p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input pr-10"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  minLength={6}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.878 15.499c.073.545.122 1.094.122 1.651 0 1.657-1.343 3-3 3a4.994 4.994 0 01-3.579-1.507l6.456-6.456z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M22.53 11.04c-.365-1.192-.9-2.282-1.657-3.166l-1.882-2.26a1.993 1.993 0 00-1.517-.686L15 5.25a9.11 9.11 0 013.55.878 9.11 9.11 0 013.98 3.91zM6.464 6.464L3.405 9.523a9.05 9.05 0 01-.148-.352 9.11 9.11 0 01-.017-.068.75.75 0 01.04-.068 1 1 0 011.006-.95c.219.024.44.061.67.11l.01.002a1 1 0 01.793.724 1 1 0 00.95 1.006c.017.001.035.002.052.003C8.715 11.35 9 11.932 9 12.614V13a.75.75 0 11-1.5 0v-1.614c-.001-2.06-1.687-3.75-3.75-3.75-.01-.001-.02-.002-.03-.003a1 1 0 00-.755 1.375l1.732 1.732a1 1 0 11-1.414 1.414l-2.293-2.293-1.052.126a1 1 0 01-.968-1.217l.447-1.342a1 1 0 011.223-.63z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.44 2.44l19.12 19.12M9.9 9.9l4.2 4.2M15.5 12c.187-.645.3-1.313.3-2.002 0-.54-.107-1.065-.3-1.56M2.4 2.4l19.2 19.2" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link href="/auth/signup" className="text-blue-600 hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm">
            Back to listings
          </Link>
        </div>
      </div>
    </div>
  )
}
