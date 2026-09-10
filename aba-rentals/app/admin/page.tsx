'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Listing, Profile } from '@/lib/types'
import { getSupabaseClient } from '@/lib/supabase'
import Image from 'next/image'

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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Link href="/" className="text-2xl font-bold text-blue-600">Aba Rentals</Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-700 font-medium">Admin Panel</span>
            </div>
            <nav className="flex gap-4">
              <Link href="/admin/landlords" className="text-gray-600 hover:text-gray-900 text-sm">Landlords</Link>
              <Link href="/admin/stats" className="text-gray-600 hover:text-gray-900 text-sm">Stats</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pending Listings</h1>
        <p className="text-gray-500 mb-6">Review and approve or reject listings awaiting approval</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card p-4 animate-pulse">
                <div className="flex gap-4">
                  <div className="bg-gray-200 h-24 w-24 rounded-lg" />
                  <div className="flex-1">
                    <div className="bg-gray-200 h-6 rounded w-1/2 mb-2" />
                    <div className="bg-gray-200 h-4 rounded w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="card p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9.9 0 11-18 0 9.9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
            <p className="text-gray-500">No pending listings to review</p>
          </div>
        ) : (
          <div className="space-y-4">
            {listings.map((listing) => (
              <div key={listing.id} className="card p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative h-32 sm:h-24 w-full sm:w-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={listing.photos?.[0] || '/placeholder.jpg'}
                      alt={listing.title}
                      fill
                      className="object-cover"
                    />
                    {listing.videos && listing.videos.length > 0 && (
                      <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">▶ Video</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{listing.title}</h3>
                        <p className="text-sm text-gray-500 mb-1">{listing.location}</p>
                        <p className="text-blue-600 font-bold">
                          {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(Number(listing.price))}
                          /{listing.price_period === 'yearly' ? 'yr' : 'mo'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {listing.bedrooms} bed • {listing.bathrooms} bath • {listing.property_type.replace('-', ' ')}
                        </p>
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{listing.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-sm text-gray-500">Landlord:</span>
                          <span className="text-sm font-medium">{listing.landlord?.full_name || listing.landlord?.email}</span>
                          {listing.landlord?.is_verified && (
                            <span className="badge badge-success text-xs">Verified</span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleApprove(listing.id)}
                          disabled={processing === listing.id}
                          className="btn-primary text-sm"
                        >
                          {processing === listing.id ? 'Approving...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => setShowReject(showReject === listing.id ? null : listing.id)}
                          className="btn-outline text-sm text-red-600 border-red-300 hover:bg-red-50"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                    {showReject === listing.id && (
                      <div className="mt-4 p-4 bg-red-50 rounded-lg">
                        <label className="label">Rejection Reason</label>
                        <input
                          type="text"
                          value={rejectReason[listing.id] || ''}
                          onChange={(e) => setRejectReason(prev => ({ ...prev, [listing.id]: e.target.value }))}
                          className="input mb-2"
                          placeholder="Why is this listing being rejected?"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReject(listing.id)}
                            disabled={processing === listing.id}
                            className="btn-primary text-sm"
                          >
                            {processing === listing.id ? 'Rejecting...' : 'Confirm Rejection'}
                          </button>
                          <button
                            onClick={() => setShowReject(null)}
                            className="btn-outline text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
