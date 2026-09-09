'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getMyListings, signOut } from '@/lib/supabase'
import { Listing, Profile } from '@/lib/types'
import Image from 'next/image'

export default function LandlordDashboard() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
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
      setProfile(profileData as Profile)
      loadListings(user.id)
    }
    checkAuth()
  }, [router])

  const loadListings = async (userId: string) => {
    const result = await getMyListings(userId)
    if (result.error) {
      console.error('Failed to load listings:', result.error)
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Link href="/" className="text-2xl font-bold text-blue-600">Aba Rentals</Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-700 font-medium">Landlord Dashboard</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {profile?.full_name || profile?.email}
                {profile?.is_verified && (
                  <span className="ml-2 badge badge-success text-xs">Verified</span>
                )}
              </span>
              <button onClick={handleSignOut} className="btn-outline text-sm">Sign Out</button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
          <Link href="/landlord/listings/new" className="btn-primary">
            + New Listing
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card p-4 animate-pulse">
                <div className="bg-gray-200 h-48 rounded-lg mb-4" />
                <div className="bg-gray-200 h-6 rounded mb-2" />
                <div className="bg-gray-200 h-4 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-16 card">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No listings yet</h3>
            <p className="text-gray-500 mb-4">Create your first property listing to get started</p>
            <Link href="/landlord/listings/new" className="btn-primary">Create Listing</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <div key={listing.id} className="card overflow-hidden">
                <div className="relative h-48 bg-gray-100">
                  <Image
                    src={listing.photos?.[0] || '/placeholder.jpg'}
                    alt={listing.title}
                    fill
                    className="object-cover"
                  />
                  <span className={`absolute top-2 right-2 badge ${getStatusBadge(listing.status)}`}>
                    {listing.status}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{listing.title}</h3>
                  <p className="text-sm text-gray-500 mb-2">{listing.location}</p>
                  <p className="text-blue-600 font-bold mb-3">
                    {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(Number(listing.price))}
                    /{listing.price_period === 'yearly' ? 'yr' : 'mo'}
                  </p>
                  {listing.status === 'rejected' && listing.rejection_reason && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded mb-3">
                      Reason: {listing.rejection_reason}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Link href={`/landlord/listings/${listing.id}/edit`} className="btn-secondary flex-1 text-center text-sm">
                      Edit
                    </Link>
                    {listing.status === 'pending' && (
                      <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded flex items-center">
                        Awaiting approval
                      </span>
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