'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Profile } from '@/lib/types'
import { getSupabaseClient } from '@/lib/supabase'
import Image from 'next/image'

export default function AdminLandlordsPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)
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

  const getListingCount = (userId: string) => {
    return listings.filter((l: any) => l.landlord_id === userId).length
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Link href="/" className="text-2xl font-bold text-blue-600">Aba Rentals</Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-700 font-medium">Landlords</span>
            </div>
            <nav className="flex gap-4">
              <Link href="/admin" className="text-gray-600 hover:text-gray-900 text-sm">Pending</Link>
              <Link href="/admin/stats" className="text-gray-600 hover:text-gray-900 text-sm">Stats</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">All Landlords</h1>
        <p className="text-gray-500 mb-6">{profiles.length} registered landlords</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="card p-4 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="bg-gray-200 h-12 w-12 rounded-full" />
                  <div className="flex-1">
                    <div className="bg-gray-200 h-5 rounded w-1/3 mb-2" />
                    <div className="bg-gray-200 h-4 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Landlord</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Listings</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {profiles.map((profile) => (
                    <tr key={profile.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {profile.full_name || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">{profile.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{profile.phone || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getListingCount(profile.id)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {profile.is_verified ? (
                          <span className="badge badge-success">Verified</span>
                        ) : (
                          <span className="badge badge-warning">Unverified</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(profile.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleVerification(profile.id, profile.is_verified)}
                          disabled={updating === profile.id}
                          className={`text-sm font-medium ${
                            profile.is_verified
                              ? 'text-red-600 hover:text-red-700'
                              : 'text-green-600 hover:text-green-700'
                          }`}
                        >
                          {updating === profile.id ? 'Updating...' : profile.is_verified ? 'Revoke' : 'Verify'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}