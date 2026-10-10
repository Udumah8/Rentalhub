'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn, supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'

function authMessage(message: string | undefined) { 
  if (!message) return 'Unable to sign in. Please try again.'; 
  const value = message.toLowerCase(); 
  if (value.includes('email not confirmed')) return 'Please confirm your email before signing in.'; 
  if (value.includes('invalid login credentials')) return 'Invalid email or password.'; 
  if (value.includes('rate limit')) return 'Too many attempts. Please wait and try again.'; 
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
    const confirmationError = new URLSearchParams(window.location.search).get('error'); 
    if (confirmationError) setError('The confirmation link is invalid or expired.'); 
    supabase.auth.getUser().then(({ data }) => { if (data.user) router.replace('/landlord/dashboard') }) 
  }, [router])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) { 
    event.preventDefault(); 
    setError(null); 
    const normalizedEmail = email.trim().toLowerCase(); 
    if (!normalizedEmail || !password) return setError('Enter your email and password.'); 
    setLoading(true); 
    try { 
      const { session, error: signInError } = await signIn(normalizedEmail, password); 
      if (signInError || !session) { 
        setError(authMessage(signInError?.message)); 
        return 
      }; 
      router.replace('/landlord/dashboard'); 
      router.refresh() 
    } catch { 
      setError('Unable to sign in. Check your connection and try again.') 
    } finally { 
      setLoading(false) 
    } 
  }

  return (
    <motion.main
      className="flex min-h-screen items-center justify-center bg-background px-4 py-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 15, delay: 0.1 }}
      >
        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Link href="/" className="text-2xl font-bold tracking-tight text-primary">
            Rental<span className="text-foreground">hub</span>
          </Link>
          <motion.p
            className="mt-7 text-sm font-semibold uppercase tracking-[0.16em] text-primary"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 500, damping: 30 }}
          >
            Welcome back
          </motion.p>
          <motion.h1
            className="mt-2 text-3xl font-bold tracking-tight"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Sign in to your account
          </motion.h1>
          <motion.p
            className="mt-2 text-sm text-muted-foreground"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Manage your listings and enquiries in one place.
          </motion.p>
        </motion.div>

        <motion.section
          className="card p-5 sm:p-7"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <AnimatePresence mode="wait">
            {error && (
              <motion.p
                role="alert"
                className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label htmlFor="email" className="label">Email address</label>
              <motion.input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input"
                autoComplete="email"
                required
                whileFocus={{ scale: 1.01 }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label htmlFor="password" className="label">Password</label>
              <div className="relative">
                <motion.input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input pr-16"
                  autoComplete="current-password"
                  required
                  whileFocus={{ scale: 1.01 }}
                />
                <motion.button
                  type="button"
                  onClick={() => setShowPassword(value => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-primary"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  whileHover={{ scale: 1.1, textShadow: '0 0 8px currentColor' }}
                  whileTap={{ scale: 0.9 }}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </motion.button>
              </div>
            </motion.div>

            <motion.button
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
              whileHover={{ scale: [1, 1.01, 1], boxShadow: '0 12px 28px hsl(var(--primary) / 0.3)' }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.svg
                    className="animate-spin h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <motion.circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <motion.path
                      className="opacity-75"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                      d="M4 12a8 8 0 018-8V0"
                    />
                  </motion.svg>
                  Signing in…
                </span>
              ) : (
                'Sign in'
              )}
            </motion.button>
          </form>

          <motion.p
            className="mt-6 text-center text-sm text-muted-foreground"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            Don&apos;t have an account?{' '}
            <motion.a
              href="/auth/signup"
              className="font-semibold text-primary hover:underline"
              whileHover={{ color: 'hsl(var(--primary))' }}
            >
              Create one
            </motion.a>
          </motion.p>
        </motion.section>

        <motion.a
          href="/"
          className="mt-6 block text-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          whileHover={{ y: -2 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          ← Back to listings
        </motion.a>
      </motion.div>
    </motion.main>
  )
}