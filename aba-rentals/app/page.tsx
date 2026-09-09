'use client'

import { useState, useEffect, useCallback } from 'react'
import { Listing, Filters, Profile } from '@/lib/types'
import { getListings } from '@/lib/supabase'
import ListingCard from '@/components/ListingCard'
import FilterBar from '@/components/FilterBar'
import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  const [listings, setListings] = useState<(Listing & { landlord: Profile })[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<Filters>({})
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const fetchListings = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getListings(filters, page, 20)
      if (result.error) {
        setError('Failed to load listings')
      } else {
        if (page === 1) {
          setListings(result.listings || [])
        } else {
          setListings(prev => [...prev, ...(result.listings || [])])
        }
        setTotalCount(result.count || 0)
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }, [filters, page])

  useEffect(() => {
    fetchListings()
  }, [fetchListings])

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters)
    setPage(1)
  }

  const hasMore = listings.length < totalCount

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              Aba Rentals
            </Link>
            <nav className="flex items-center gap-4">
              <Link href="/auth/login" className="text-gray-600 hover:text-gray-900 font-medium">
                Sign In
              </Link>
              <Link href="/auth/signup" className="btn-primary text-sm">
                List Property
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <section className="bg-blue-600 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">
            Find Your Perfect Rental in Aba
          </h1>
          <p className="text-lg text-blue-100 mb-8">
            Browse verified rental properties from trusted landlords across Aba
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FilterBar onFilterChange={handleFilterChange} />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading && page === 1 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card p-4 animate-pulse">
                <div className="bg-gray-200 h-48 rounded-lg mb-4" />
                <div className="bg-gray-200 h-6 rounded mb-2" />
                <div className="bg-gray-200 h-4 rounded w-2/3 mb-2" />
                <div className="bg-gray-200 h-4 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-16">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No listings found</h3>
            <p className="text-gray-500">Try adjusting your filters or check back later</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}

        {hasMore && !loading && (
          <div className="text-center mt-8">
            <button
              onClick={() => setPage(p => p + 1)}
              className="btn-secondary"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500 text-sm">
            <p>&copy; 2024 Aba Rentals. All rights reserved.</p>
            <p className="mt-2">
              <Link href="/admin" className="hover:text-gray-700">Admin</Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}