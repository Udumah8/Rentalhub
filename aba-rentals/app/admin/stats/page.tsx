'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AdminStats } from '@/lib/types'
import { getSupabaseClient } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'

const StatCard = ({ title, value, color }: { title: string; value: number | string; color: string }) => (
  <motion.div
    className={`card p-6 ${color}`}
    whileHover={{ y: -4, boxShadow: '0 20px 48px hsl(var(--foreground) / 0.1)' }}
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-foreground/80">{title}</p>
        <motion.p
          className="text-3xl font-bold mt-2"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          {value}
        </motion.p>
      </div>
      <motion.div
        className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </motion.div>
    </div>
  </motion.div>
)

export default function AdminStatsPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      setError(null)
      try {
        const supabase = getSupabaseClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/auth/login')
          return
        }
        await loadStats()
      } catch (err: any) {
        setError(err.message || 'Failed to load statistics')
        setLoading(false)
      }
    }
    checkAuth()
  }, [router])

  const loadStats = async () => {
    try {
      const res = await fetch('/api/admin/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data.stats)
      } else if (res.status === 403) {
        setError('You do not have admin access')
      } else {
        setError('Failed to load statistics')
      }
    } catch (err: any) {
      setError(err.message || 'Network error while loading statistics')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      className="min-h-screen bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.header
        className="border-b border-border bg-background/80 backdrop-blur-xl"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <motion.div
            className="flex items-center gap-6"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Link href="/" className="text-2xl font-black tracking-[-0.06em] text-foreground">Rental<span className="text-primary">hub</span></Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground font-medium">Stats</span>
          </motion.div>
          <motion.nav
            className="flex gap-4"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.a
              href="/admin"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              Pending
            </motion.a>
            <motion.a
              href="/admin/landlords"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              Landlords
            </motion.a>
          </motion.nav>
        </div>
      </motion.header>

      <motion.main
        className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, type: 'spring', stiffness: 100, damping: 15 }}
      >
        <motion.h1
          className="text-2xl font-bold text-foreground mb-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          Dashboard Statistics
        </motion.h1>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="popLayout">
          {loading ? (
            <motion.div
              key="loading"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="card shimmer-wrapper p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <div className="shimmer-wrapper h-4 w-1/2 rounded mb-4" />
                  <div className="shimmer-wrapper h-8 w-1/3 rounded" />
                </motion.div>
              ))}
            </motion.div>
          ) : stats ? (
            <motion.div
              key="stats"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1,
                      delayChildren: 0.1
                    }
                  }
                }}
              >
                <StatCard title="Total Listings" value={stats.total_listings} color="bg-primary text-primary-foreground" />
                <StatCard title="Total Landlords" value={stats.total_landlords} color="bg-green-600 text-white" />
                <StatCard title="Verified Landlords" value={stats.verified_landlords} color="bg-purple-600 text-white" />
                <StatCard title="Pending Approval" value={stats.pending_listings} color="bg-yellow-500 text-white" />
                <StatCard title="Approved" value={stats.approved_listings} color="bg-emerald-600 text-white" />
                <StatCard title="Rejected" value={stats.rejected_listings} color="bg-red-600 text-white" />
              </motion.div>

              <motion.div
                className="card p-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <motion.h2
                  className="text-xl font-bold text-foreground mb-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  Listings by Area
                </motion.h2>
                {stats.listings_by_area && stats.listings_by_area.length > 0 ? (
                  <motion.div
                    className="space-y-3"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: {
                          staggerChildren: 0.08
                        }
                      }
                    }}
                  >
                    {stats.listings_by_area.map((area) => (
                      <motion.div
                        key={area.location}
                        className="flex items-center justify-between"
                        whileHover={{ x: 4 }}
                        variants={{
                          visible: { opacity: 1, x: 0 },
                          hidden: { opacity: 0, x: -20 }
                        }}
                      >
                        <motion.span
                          className="text-foreground"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                        >
                          {area.location}
                        </motion.span>
                        <motion.div
                          className="flex items-center gap-3"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                        >
                          <motion.div
                            className="w-48 bg-muted rounded-full h-2 overflow-hidden"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ type: 'spring', stiffness: 100, damping: 15, duration: 1.5 }}
                          >
                            <motion.div
                              className="bg-primary h-2 rounded-full"
                              initial={{ scaleX: 0 }}
                              animate={{ 
                                scaleX: (area.count / Math.max(...stats.listings_by_area.map(a => a.count))) 
                              }}
                              transition={{ type: 'spring', stiffness: 100, damping: 15, duration: 1.5, delay: 0.3 }}
                              style={{ transformOrigin: 'left center' }}
                            />
                          </motion.div>
                          <motion.span
                            className="text-sm font-medium text-foreground w-8 text-right"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          >
                            {area.count}
                          </motion.span>
                        </motion.div>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.p
                    className="text-muted-foreground text-center py-8"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    No data available
                  </motion.p>
                )}
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="error"
              className="text-center py-16"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              <motion.p
                className="text-muted-foreground"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                Failed to load statistics
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.main>
    </motion.div>
  )
}