'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Listing, Profile } from '@/lib/types'
import { getSupabaseClient } from '@/lib/supabase'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

export default function AdminPage() {
  const [listings, setListings] = useState<(Listing & { landlord: Profile })[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState<{ [key: string]: string }>({})
  const [showReject, setShowReject] = useState<string | null>(null)
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
        await loadListings()
      } catch (err: any) {
        setError(err.message || 'Failed to load admin panel')
        setLoading(false)
      }
    }
    checkAuth()
  }, [router])

  const loadListings = async () => {
    const res = await fetch('/api/admin/listings')
    if (res.ok) {
      const data = await res.json()
      setListings(data.listings || [])
    } else if (res.status === 403) {
      setError('You do not have admin access')
    } else if (res.status === 401) {
      router.push('/auth/login')
      return
    } else {
      setError('Failed to load listings')
    }
    setLoading(false)
  }

  const handleApprove = async (id: string) => {
    setProcessing(id)
    setError(null)
    try {
      const res = await fetch(`/api/admin/listings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      })
      if (res.ok) {
        setListings(prev => prev.filter(l => l.id !== id))
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to approve listing')
      }
    } catch (err: any) {
      setError(err.message || 'Network error while approving')
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (id: string) => {
    const reason = rejectReason[id]
    if (!reason?.trim()) {
      setError('Please provide a reason for rejection')
      return
    }
    setProcessing(id)
    setError(null)
    try {
      const res = await fetch(`/api/admin/listings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected', rejection_reason: reason }),
      })
      if (res.ok) {
        setListings(prev => prev.filter(l => l.id !== id))
        setShowReject(null)
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to reject listing')
      }
    } catch (err: any) {
      setError(err.message || 'Network error while rejecting')
    } finally {
      setProcessing(null)
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
            <span className="text-foreground font-medium">Admin Panel</span>
          </motion.div>
          <motion.nav
            className="flex gap-4"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.a
              href="/admin/landlords"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              Landlords
            </motion.a>
            <motion.a
              href="/admin/stats"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              Stats
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.h1
            className="text-2xl font-bold text-foreground mb-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            Pending Listings
          </motion.h1>
          <motion.p
            className="text-muted-foreground mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            Review and approve or reject listings awaiting approval
          </motion.p>
        </motion.div>

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
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {Array.from({ length: 3 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="card shimmer-wrapper p-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <div className="flex gap-4">
                    <div className="h-24 w-24 rounded-lg bg-muted" />
                    <div className="flex-1 space-y-3">
                      <div className="shimmer-wrapper h-6 w-1/2 rounded" />
                      <div className="shimmer-wrapper h-4 w-1/3 rounded" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : listings.length === 0 ? (
            <motion.div
              key="empty"
              className="card p-8 text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              <motion.div
                className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.1 }}
              >
                <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9.9 0 11-18 0 9.9 0 0118 0z" />
                </svg>
              </motion.div>
              <motion.h3
                className="text-lg font-medium text-foreground mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                All caught up!
              </motion.h3>
              <motion.p
                className="text-muted-foreground"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                No pending listings to review
              </motion.p>
            </motion.div>
          ) : (
            <motion.div
              key="listings"
              className="space-y-4"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.08,
                    delayChildren: 0.1
                  }
                },
                exit: {
                  opacity: 0,
                  transition: {
                    staggerChildren: 0.03,
                    staggerDirection: -1
                  }
                }
              }}
            >
              {listings.map((listing) => (
                <motion.div
                  key={listing.id}
                  className="card p-4"
                  whileHover={{ boxShadow: '0 12px 28px hsl(var(--foreground) / 0.1)' }}
                  variants={{
                    visible: { opacity: 1, y: 0 },
                    hidden: { opacity: 0, y: 20 }
                  }}
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative h-32 sm:h-24 w-full sm:w-32 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={listing.photos?.[0] || '/placeholder.jpg'}
                        alt={listing.title}
                        fill
                        className="object-cover transition-transform duration-500"
                      />
                      {listing.videos && listing.videos.length > 0 && (
                        <motion.span
                          className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                          Video
                        </motion.span>
                      )}
                    </div>
                    <motion.div
                      className="flex-1 min-w-0"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <motion.div
                        className="flex items-start justify-between gap-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div>
                          <motion.h3
                            className="font-semibold text-foreground mb-1"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                          >
                            {listing.title}
                          </motion.h3>
                          <motion.p
                            className="text-sm text-muted-foreground mb-1"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.05 }}
                          >
                            {listing.location}
                          </motion.p>
                          <motion.p
                            className="text-primary font-bold"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          >
                            {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(Number(listing.price))}
                            /{listing.price_period === 'yearly' ? 'yr' : 'mo'}
                          </motion.p>
                          <motion.p
                            className="text-sm text-muted-foreground mt-1"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                          >
                            {listing.bedrooms} bed • {listing.bathrooms} bath • {listing.property_type.replace('-', ' ')}
                          </motion.p>
                          <motion.p
                            className="text-sm text-muted-foreground mt-2 line-clamp-2"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.15 }}
                          >
                            {listing.description}
                          </motion.p>
                          <motion.div
                            className="flex items-center gap-2 mt-2"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                          >
                            <span className="text-sm text-muted-foreground">Landlord:</span>
                            <motion.span
                              className="text-sm font-medium"
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                            >
                              {listing.landlord?.full_name || listing.landlord?.email}
                            </motion.span>
                            {listing.landlord?.is_verified && (
                              <motion.span
                                className="badge badge-success text-xs"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                              >
                                Verified
                              </motion.span>
                            )}
                          </motion.div>
                        </div>
                        <motion.div
                          className="flex flex-col gap-2 flex-shrink-0"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                        >
<motion.button
                          onClick={() => handleApprove(listing.id)}
                          disabled={processing === listing.id}
                          className="btn-primary text-sm"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                            {processing === listing.id ? (
                              <span className="flex items-center gap-2">
                                <motion.svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                  <motion.circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <motion.path className="opacity-75" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" d="M4 12a8 8 0 018-8V0" />
                                </motion.svg>
                                Approving...
                              </span>
                            ) : (
                              'Approve'
                            )}
                          </motion.button>
                          <motion.button
                            onClick={() => setShowReject(showReject === listing.id ? null : listing.id)}
                            className="btn-outline text-sm text-red-600 border-red-300 hover:bg-red-50"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            Reject
                          </motion.button>
                        </motion.div>
                      </motion.div>
                      <AnimatePresence>
                        {showReject === listing.id && (
                          <motion.div
                            className="mt-4 p-4 bg-red-50 rounded-lg"
                            initial={{ opacity: 0, height: 0, y: -10 }}
                            animate={{ opacity: 1, height: 'auto', y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                          >
                            <label className="label">Rejection Reason</label>
                            <motion.input
                              type="text"
                              value={rejectReason[listing.id] || ''}
                              onChange={(e) => setRejectReason(prev => ({ ...prev, [listing.id]: e.target.value }))}
                              className="input mb-2"
                              placeholder="Why is this listing being rejected?"
                              whileFocus={{ scale: 1.01 }}
                            />
                            <motion.div className="flex gap-2">
                              <motion.button
                                onClick={() => handleReject(listing.id)}
                                disabled={processing === listing.id}
                                className="btn-primary text-sm"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                {processing === listing.id ? (
                                  <span className="flex items-center gap-2">
                                    <motion.svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                      <motion.circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                      <motion.path className="opacity-75" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" d="M4 12a8 8 0 018-8V0" />
                                    </motion.svg>
                                    Rejecting...
                                  </span>
                                ) : (
                                  'Confirm Rejection'
                                )}
                              </motion.button>
                              <motion.button
                                onClick={() => setShowReject(null)}
                                className="btn-outline text-sm"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                Cancel
                              </motion.button>
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.main>
    </motion.div>
  )
}