'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signUp, supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'

function authMessage(message: string | undefined) {
  const value = message?.toLowerCase() ?? ''
  if (value.includes('already registered') || value.includes('already been registered')) return 'An account with this email already exists.'
  if (value.includes('password')) return 'Choose a stronger password with at least 6 characters.'
  if (value.includes('rate limit')) return 'Too many attempts. Please wait and try again.'
  return 'Unable to create your account. Please try again.'
}

export default function SignupPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => { 
    supabase.auth.getUser().then(({ data }) => { if (data.user) router.replace('/landlord/dashboard') }) 
  }, [router])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) { 
    event.preventDefault(); 
    setError(null); 
    const normalizedEmail = email.trim().toLowerCase(); 
    if (!fullName.trim() || !phone.trim() || !normalizedEmail) return setError('Complete all fields.'); 
    if (password.length < 6) return setError('Password must be at least 6 characters.'); 
    if (password !== confirmPassword) return setError('Passwords do not match.'); 
    setLoading(true); 
    try { 
      const { session, error: signUpError } = await signUp(normalizedEmail, password, fullName, phone); 
      if (signUpError) { setError(authMessage(signUpError.message)); return } 
      if (session) { router.replace('/landlord/dashboard'); router.refresh() } else setSuccess(true) 
    } catch { 
      setError('Unable to create your account. Check your connection and try again.') 
    } finally { 
      setLoading(false) 
    } 
  }

  return (
    <motion.main
      className="min-h-screen bg-background flex items-center justify-center px-4 py-10"
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
        <motion.header
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Link href="/" className="text-3xl font-bold tracking-tight text-primary">
            Rental<span className="text-foreground">hub</span>
          </Link>
          <motion.h1
            className="text-2xl font-bold text-foreground mt-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Create your account
          </motion.h1>
          <motion.p
            className="text-muted-foreground mt-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            List your properties with Rentalhub
          </motion.p>
        </motion.header>

        <motion.section
          className="card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                role="status"
                className="space-y-4 text-center"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              >
                <motion.div
                  className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30, delay: 0.1 }}
                >
                  <motion.svg
                    className="h-8 w-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <motion.path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    />
                  </motion.svg>
                </motion.div>
                <motion.h2
                  className="text-lg font-semibold text-foreground"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Check your email
                </motion.h2>
                <motion.p
                  className="text-muted-foreground"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  We sent a confirmation link to <strong>{email}</strong>. Confirm it before signing in.
                </motion.p>
                <motion.a
                  href="/auth/login"
                  className="btn-primary inline-block"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  Go to sign in
                </motion.a>
              </motion.div>
            ) : (
              <>
                <AnimatePresence>
                  {error && (
                    <motion.p
                      role="alert"
                      className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4"
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <label htmlFor="fullName" className="label">Full name</label>
                    <motion.input
                      id="fullName"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="input"
                      autoComplete="name"
                      required
                      whileFocus={{ scale: 1.01 }}
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.45 }}
                  >
                    <label htmlFor="phone" className="label">Phone number</label>
                    <motion.input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="input"
                      autoComplete="tel"
                      required
                      whileFocus={{ scale: 1.01 }}
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <label htmlFor="email" className="label">Email</label>
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
                    transition={{ delay: 0.55 }}
                  >
                    <label htmlFor="password" className="label">Password</label>
                    <motion.input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="input"
                      autoComplete="new-password"
                      minLength={6}
                      required
                      whileFocus={{ scale: 1.01 }}
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <label htmlFor="confirmPassword" className="label">Confirm password</label>
                    <div className="flex gap-2">
                      <motion.input
                        id="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className="input flex-1"
                        autoComplete="new-password"
                        minLength={6}
                        required
                        whileFocus={{ scale: 1.01 }}
                      />
                      <motion.button
                        type="button"
                        onClick={() => setShowPassword(value => !value)}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3"
                        aria-label={showPassword ? 'Hide passwords' : 'Show passwords'}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
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
                    transition={{ delay: 0.7 }}
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
                        Creating account…
                      </span>
                    ) : (
                      'Create account'
                    )}
                  </motion.button>
                </form>
                <motion.p
                  className="mt-6 text-center text-sm text-muted-foreground"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  Already have an account?{' '}
                  <motion.a
                    href="/auth/login"
                    className="text-primary font-medium hover:underline"
                    whileHover={{ color: 'hsl(var(--primary))' }}
                  >
                    Sign in
                  </motion.a>
                </motion.p>
              </>
            )}
          </AnimatePresence>
        </motion.section>

        <motion.a
          href="/"
          className="block text-center mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
          whileHover={{ y: -2 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          Back to listings
        </motion.a>
      </motion.div>
    </motion.main>
  )
}