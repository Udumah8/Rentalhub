'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AdminStats } from '@/lib/types'
import { getSupabaseClient } from '@/lib/supabase'

export default function AdminStatsPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = getSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      loadStats()
    }
    checkAuth()
  }, [router])

  const loadStats = async () => {
    const res = await fetch('/api/admin/stats')
    if (res.ok) {
      const data = await res.json()
      setStats(data.stats)
    }
    setLoading(false)
  }

  const StatCard = ({ title, value, color }: { title: string; value: number | string; color: string }) => (
    <div className={`${color} rounded-lg p-6`}>
      <p className="text-sm font-medium opacity-90">{title}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Link href="/" className="text-2xl font-bold text-blue-600">Aba Rentals</Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-700 font-medium">Stats</span>
            </div>
            <nav className="flex gap-4">
              <Link href="/admin" className="text-gray-600 hover:text-gray-900 text-sm">Pending</Link>
              <Link href="/admin/landlords" className="text-gray-600 hover:text-gray-900 text-sm">Landlords</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Statistics</h1>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
                <div className="bg-gray-200 h-4 rounded w-1/2 mb-4" />
                <div className="bg-gray-200 h-8 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : stats ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <StatCard title="Total Listings" value={stats.total_listings} color="bg-blue-500 text-white" />
              <StatCard title="Total Landlords" value={stats.total_landlords} color="bg-green-500 text-white" />
              <StatCard title="Verified Landlords" value={stats.verified_landlords} color="bg-purple-500 text-white" />
              <StatCard title="Pending Approval" value={stats.pending_listings} color="bg-yellow-500 text-white" />
              <StatCard title="Approved" value={stats.approved_listings} color="bg-emerald-500 text-white" />
              <StatCard title="Rejected" value={stats.rejected_listings} color="bg-red-500 text-white" />
            </div>

            <div className="card p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Listings by Area</h2>
              {stats.listings_by_area && stats.listings_by_area.length > 0 ? (
                <div className="space-y-3">
                  {stats.listings_by_area.map((area) => (
                    <div key={area.location} className="flex items-center justify-between">
                      <span className="text-gray-700">{area.location}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-48 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${(area.count / Math.max(...stats.listings_by_area.map(a => a.count))) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-8 text-right">{area.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No data available</p>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500">Failed to load statistics</p>
          </div>
        )}
      </main>
    </div>
  )
}