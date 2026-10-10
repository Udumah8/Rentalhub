'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Profile } from '@/lib/types'
import { getSupabaseClient } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'

export default function AdminLandlordsPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
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
        await loadData()
      } catch (err: any) {
        setError(err.message || 'Failed to load landlords')
        setLoading(false)
      }
    }
    checkAuth()
  }, [router])

  const loadData = async () => {
    try {
      const [profilesRes, listingsRes] = await Promise.all([
        fetch('/api/admin/profiles'),
        fetch('/api/admin/all-listings'),
      ])
      if (profilesRes.ok) {
        const data = await profilesRes.json()
        setProfiles(data.profiles || [])
      } else if (profilesRes.status === 403) {
        setError('You do not have admin access')
      }
      if (listingsRes.ok) {
        const data = await listingsRes.json()
        setListings(data.listings || [])
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleVerification = async (userId: string, currentStatus: boolean) => {
    setUpdating(userId)
    const res = await fetch(`/api/admin/profiles/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_verified: !currentStatus }),
    })
    if (res.ok) {
      setProfiles(prev => prev.map(p => p.id === userId ? { ...p, is_verified: !currentStatus } : p))
    } else {
      const data = await res.json()
      alert('Failed to update: ' + (data.error || 'Unknown error'))
    }
    setUpdating(null)
  }

  const handleDeleteLandlord = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this landlord? This action cannot be undone and will remove all their listings.')) {
      return
    }
    setDeleting(userId)
    const res = await fetch(`/api/admin/profiles/${userId}`, {
      method: 'DELETE',
    })
    if (res.ok) {
      setProfiles(prev => prev.filter(p => p.id !== userId))
      setListings(prev => prev.filter(l => l.landlord_id !== userId))
    } else {
      const data = await res.json()
      alert('Failed to delete: ' + (data.error || 'Unknown error'))
    }
    setDeleting(null)
  }

  const getListingCount = (userId: string) => {
    return listings.filter((l: any) => l.landlord_id === userId).length
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
            <span className="text-foreground font-medium">Landlords</span>
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
            All Landlords
          </motion.h1>
          <motion.p
            className="text-muted-foreground mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            {profiles.length} registered landlords
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
              {Array.from({ length: 5 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="card shimmer-wrapper p-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="shimmer-wrapper h-5 w-1/3 rounded" />
                      <div className="shimmer-wrapper h-4 w-1/2 rounded" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="landlords"
              className="card overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Landlord</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Listings</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Joined</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <AnimatePresence>
                      {profiles.map((profile) => (
                        <motion.tr
                          key={profile.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.2 }}
                          whileHover={{ backgroundColor: 'hsl(var(--muted))' }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                            >
                              <div className="text-sm font-medium text-foreground">
                                {profile.full_name || 'N/A'}
                              </div>
                              <div className="text-sm text-muted-foreground">{profile.email}</div>
                            </motion.div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <motion.div
                              className="text-sm text-foreground"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                            >
                              {profile.phone || 'N/A'}
                            </motion.div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                            <motion.span
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            >
                              {getListingCount(profile.id)}
                            </motion.span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <motion.span
                              className={`badge ${profile.is_verified ? 'badge-success' : 'badge-warning'}`}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            >
                              {profile.is_verified ? 'Verified' : 'Unverified'}
                            </motion.span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                            <motion.span
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                            >
                              {new Date(profile.created_at).toLocaleDateString()}
                            </motion.span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <motion.div
                              className="flex items-center gap-3"
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                            >
                              <motion.button
                                onClick={() => handleToggleVerification(profile.id, profile.is_verified)}
                                disabled={updating === profile.id || deleting === profile.id}
                                className={`text-sm font-medium transition-colors ${
                                  profile.is_verified
                                    ? 'text-red-600 hover:text-red-700'
                                    : 'text-green-600 hover:text-green-700'
                                }`}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                {updating === profile.id ? 'Updating...' : profile.is_verified ? 'Revoke' : 'Verify'}
                              </motion.button>
                              <motion.button
                                onClick={() => handleDeleteLandlord(profile.id)}
                                disabled={updating === profile.id || deleting === profile.id}
                                className="text-sm font-medium text-red-600 hover:text-red-700"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                {deleting === profile.id ? 'Deleting...' : 'Delete'}
                              </motion.button>
                            </motion.div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.main>
    </motion.div>
  )
}