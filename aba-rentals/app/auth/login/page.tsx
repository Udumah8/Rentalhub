'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn, supabase } from '@/lib/supabase'

function authMessage(message: string | undefined) {
  if (!message) return 'Unable to sign in. Please try again.'
  const value = message.toLowerCase()
  if (value.includes('email not confirmed')) return 'Please confirm your email before signing in.'
  if (value.includes('invalid login credentials')) return 'Invalid email or password.'
  if (value.includes('rate limit')) return 'Too many attempts. Please wait and try again.'
  return 'Unable to sign in. Please try again.'
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const confirmationError = new URLSearchParams(window.location.search).get('error')
    if (confirmationError) setError('The confirmation link is invalid or expired.')
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.replace('/landlord/dashboard')
    })
  }, [router])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(null)
    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail || !password) return setError('Enter your email and password.')
    setLoading(true)
    try {
      const { session, error: signInError } = await signIn(normalizedEmail, password)
      if (signInError || !session) { setError(authMessage(signInError?.message)); return }
      router.replace('/landlord/dashboard'); router.refresh()
    } catch { setError('Unable to sign in. Check your connection and try again.') }
    finally { setLoading(false) }
  }

  return <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10"><div className="w-full max-w-md"><header className="text-center mb-8"><Link href="/" className="text-3xl font-bold text-blue-600">Aba Rentals</Link><h1 className="text-2xl font-bold text-gray-900 mt-4">Sign in</h1><p className="text-gray-500 mt-2">Access your landlord dashboard</p></header><section className="card p-6">{error && <p role="alert" className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</p>}<form onSubmit={handleSubmit} className="space-y-4"><div><label htmlFor="email" className="label">Email</label><input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="input" autoComplete="email" required /></div><div><label htmlFor="password" className="label">Password</label><div className="relative"><input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="input pr-16" autoComplete="current-password" required /><button type="button" onClick={() => setShowPassword(value => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? 'Hide' : 'Show'}</button></div></div><button type="submit" className="btn-primary w-full" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button></form><p className="mt-6 text-center text-sm text-gray-600">Don&apos;t have an account? <Link href="/auth/signup" className="text-blue-600 font-medium hover:underline">Sign up</Link></p></section><Link href="/" className="block text-center mt-6 text-sm text-gray-500 hover:text-gray-700">Back to listings</Link></div></main>
}
