'use client'

import { useState, useEffect, useCallback } from 'react'
import { Listing, Filters, Profile } from '@/lib/types'
import { getListings } from '@/lib/supabase'
import ListingCard from '@/components/ListingCard'
import FilterBar from '@/components/FilterBar'
import Link from 'next/link'

export default function Home() {
  const [listings, setListings] = useState<(Listing & { landlord: Profile })[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<Filters>({})
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const fetchListings = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const result = await getListings(filters, page, 20)
      if (result.error) setError('We could not load listings right now.')
      else {
        if (page === 1) setListings(result.listings || [])
        else setListings(prev => [...prev, ...(result.listings || [])])
        setTotalCount(result.count || 0)
      }
    } catch { setError('We could not load listings right now.') }
    finally { setLoading(false) }
  }, [filters, page])

  useEffect(() => { fetchListings() }, [fetchListings])
  const handleFilterChange = (next: Filters) => { setFilters(next); setPage(1) }
  const hasMore = listings.length < totalCount

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/80 bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-xl font-bold tracking-tight text-primary sm:text-2xl">Aba<span className="text-foreground">Rentals</span></Link>
          <nav className="flex items-center gap-2 sm:gap-5">
            <Link href="/auth/login" className="px-2 py-2 text-sm font-semibold text-muted-foreground transition hover:text-foreground">Sign in</Link>
            <Link href="/auth/signup" className="btn-primary px-3 sm:px-4">List a property</Link>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden bg-foreground px-4 py-14 text-primary-foreground sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-accent">A better way to rent in Aba</p>
            <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-6xl">Find a place that feels like home.</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-primary-foreground/70 sm:text-lg">Browse quality homes, flats, and commercial spaces from trusted local landlords.</p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3 text-sm font-medium text-primary-foreground/70"><span>Local listings</span><span>•</span><span>Clear pricing</span><span>•</span><span>Built for Aba</span></div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <FilterBar onFilterChange={handleFilterChange} />
        <div className="mb-5 flex items-end justify-between gap-4"><div><p className="text-sm font-medium text-muted-foreground">Explore available spaces</p><h2 className="mt-1 text-2xl font-bold tracking-tight">Latest listings</h2></div>{totalCount > 0 && <p className="text-sm text-muted-foreground">{totalCount} homes</p>}</div>
        {error && <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}
        {loading && page === 1 ? <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="card animate-pulse overflow-hidden"><div className="h-52 bg-muted" /><div className="space-y-3 p-5"><div className="h-5 w-3/4 rounded bg-muted" /><div className="h-4 w-1/2 rounded bg-muted" /><div className="h-4 w-2/3 rounded bg-muted" /></div></div>)}</div> : listings.length === 0 ? <div className="card py-16 text-center"><p className="text-lg font-semibold">No listings found</p><p className="mt-2 text-sm text-muted-foreground">Try adjusting your search or filters.</p></div> : <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{listings.map(listing => <ListingCard key={listing.id} listing={listing} />)}</div>}
        {hasMore && !loading && <div className="mt-8 text-center"><button onClick={() => setPage(p => p + 1)} className="btn-secondary">Load more listings</button></div>}
      </main>
      <footer className="mt-12 border-t border-border bg-card"><div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8"><p>© 2026 AbaRentals. Find your next place.</p><Link href="/admin" className="font-medium hover:text-foreground">Admin access</Link></div></footer>
    </div>
  )
}
