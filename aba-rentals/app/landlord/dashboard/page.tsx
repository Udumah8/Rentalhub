'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseClient, getMyListings, signOut } from '@/lib/supabase'
import { Listing, Profile } from '@/lib/types'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

export default function LandlordDashboard() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
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
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile((profileData as Profile) || null)
        await loadListings(user.id)
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard')
        setLoading(false)
      }
    }
    checkAuth()
  }, [router])

  const loadListings = async (userId: string) => {
    const result = await getMyListings(userId)
    if (result.error) {
      setError(result.error.message || 'Failed to load listings')
    } else {
      setListings(result.listings || [])
    }
    setLoading(false)
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
    router.refresh()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return 'badge-success'
      case 'pending':
        return 'badge-warning'
      case 'rejected':
        return 'badge-danger'
      default:
        return 'badge-info'
    }
  }

  const statusColors: Record<string, string> = {
    approved: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    rejected: 'bg-red-100 text-red-700',
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
            <span className="text-foreground font-medium">Landlord Dashboard</span>
          </motion.div>
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.span
              className="text-sm text-muted-foreground flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
            >
              {profile?.full_name || profile?.email}
              {profile?.is_verified && (
                <motion.span
                  className="badge badge-success text-xs flex items-center gap-1"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30, delay: 0.3 }}
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                  Verified
                </motion.span>
              )}
            </motion.span>
            <motion.button
              onClick={handleSignOut}
              className="btn-outline text-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Sign Out
            </motion.button>
          </motion.div>
        </div>
      </motion.header>

      <motion.main
        className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, type: 'spring', stiffness: 100, damping: 15 }}
      >
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <motion.h1
            className="text-2xl font-bold text-foreground"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            My Listings
          </motion.h1>
          <motion.a
            href="/landlord/listings/new"
            className="btn-primary"
            whileHover={{ scale: 1.02, boxShadow: '0 12px 28px hsl(var(--primary) / 0.3)' }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Listing
          </motion.a>
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
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {Array.from({ length: 3 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="card shimmer-wrapper overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <div className="h-48 bg-muted" />
                  <div className="p-4 space-y-3">
                    <div className="shimmer-wrapper h-6 w-3/4 rounded" />
                    <div className="shimmer-wrapper h-4 w-1/2 rounded" />
                    <div className="shimmer-wrapper h-4 w-1/3 rounded" />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : listings.length === 0 ? (
            <motion.div
              key="empty"
              className="text-center py-16 card"
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </motion.div>
              <motion.h3
                className="text-lg font-medium text-foreground mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                No listings yet
              </motion.h3>
              <motion.p
                className="text-muted-foreground mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Create your first property listing to get started
              </motion.p>
              <motion.a
                href="/landlord/listings/new"
                className="btn-primary"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Create Listing
              </motion.a>
            </motion.div>
          ) : (
            <motion.div
              key="listings"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
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
                  className="card overflow-hidden"
                  whileHover={{ y: -4, boxShadow: '0 20px 48px hsl(var(--foreground) / 0.1)' }}
                  variants={{
                    visible: { opacity: 1, y: 0 },
                    hidden: { opacity: 0, y: 20 }
                  }}
                >
                  <div className="relative h-48 bg-muted">
                    <Image
                      src={listing.photos?.[0] || '/placeholder.jpg'}
                      alt={listing.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    {listing.videos && listing.videos.length > 0 && (
                      <motion.span
                        className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        Video
                      </motion.span>
                    )}
                    <motion.span
                      className={`absolute top-2 right-2 badge ${getStatusBadge(listing.status)}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30, delay: 0.2 }}
                    >
                      {listing.status}
                    </motion.span>
                  </div>
                  <motion.div
                    className="p-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <motion.h3
                      className="font-semibold text-foreground mb-1 line-clamp-1"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      {listing.title}
                    </motion.h3>
                    <motion.p
                      className="text-sm text-muted-foreground mb-2"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      {listing.location}
                    </motion.p>
                    <motion.p
                      className="text-primary font-bold mb-3"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    >
                      {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(Number(listing.price))}
                      /{listing.price_period === 'yearly' ? 'yr' : 'mo'}
                    </motion.p>
                    <AnimatePresence>
                      {listing.status === 'rejected' && listing.rejection_reason && (
                        <motion.div
                          className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded mb-3"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        >
                          Reason: {listing.rejection_reason}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <motion.div
                      className="flex gap-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <motion.a
                        href={`/landlord/listings/${listing.id}/edit`}
                        className="btn-secondary flex-1 text-center text-sm"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Edit
                      </motion.a>
                      {listing.status === 'pending' && (
                        <motion.span
                          className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded flex items-center gap-1"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        >
                          <motion.span
                            className="w-1.5 h-1.5 rounded-full bg-yellow-500"
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          />
                          Awaiting approval
                        </motion.span>
                      )}
                    </motion.div>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.main>
    </motion.div>
  )
}