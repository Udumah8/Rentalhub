'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { UpdateListingInput, PropertyType, PricePeriod, Listing } from '@/lib/types'
import Image from 'next/image'

const PROPERTY_TYPES: PropertyType[] = ['self-contain', 'flat', 'duplex', 'bungalow', 'office', 'shop', 'other']
const PRICE_PERIODS: PricePeriod[] = ['monthly', 'yearly']

interface PageProps {
  params: Promise<{ id: string }>
}

export default function EditListingPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const [formData, setFormData] = useState<UpdateListingInput>({})
  const [existingPhotos, setExistingPhotos] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
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
      loadListing()
    }
    checkAuth()
  }, [resolvedParams.id, router])

  const loadListing = async () => {
    const res = await fetch(`/api/landlord/listings/${resolvedParams.id}`)
    if (!res.ok) {
      router.push('/landlord/dashboard')
      return
    }
    const data = await res.json()
    const listing = data.listing
    setFormData({
      title: listing.title,
      description: listing.description,
      price: listing.price,
      price_period: listing.price_period,
      location: listing.location,
      bedrooms: listing.bedrooms,
      bathrooms: listing.bathrooms,
      property_type: listing.property_type,
      contact_phone: listing.contact_phone,
      contact_whatsapp: listing.contact_whatsapp,
    })
    setExistingPhotos(listing.photos || [])
    setLoading(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }))
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const uploadPromises = Array.from(files).map(async (file) => {
      const { uploadPhoto } = await import('@/lib/supabase')
      const result = await uploadPhoto(file, 'listings')
      return result.url
    })

    const urls = await Promise.all(uploadPromises)
    const validUrls = urls.filter((url): url is string => url !== null)
    setExistingPhotos(prev => [...prev, ...validUrls])
  }

  const removePhoto = (index: number) => {
    setExistingPhotos(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const res = await fetch(`/api/landlord/listings/${resolvedParams.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Failed to update listing')
      setSaving(false)
    } else {
      setSuccess(true)
      setTimeout(() => {
        router.push('/landlord/dashboard')
      }, 1000)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return
    }
    setDeleting(true)
    const res = await fetch(`/api/landlord/listings/${resolvedParams.id}`, {
      method: 'DELETE',
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Failed to delete listing')
      setDeleting(false)
    } else {
      router.push('/landlord/dashboard')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Listing Updated!</h2>
          <p className="text-gray-500">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Link href="/" className="text-2xl font-bold text-blue-600">Aba Rentals</Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-700 font-medium">Edit Listing</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/landlord/dashboard" className="text-gray-600 hover:text-gray-900">Cancel</Link>
              <button onClick={handleDelete} disabled={deleting} className="text-red-600 hover:text-red-700 text-sm">
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Listing</h1>

        <div className="card p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="label">Property Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title || ''}
                onChange={handleChange}
                required
                className="input"
              />
            </div>

            <div>
              <label className="label">Description *</label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                required
                rows={4}
                className="input"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Price (₦) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price || ''}
                  onChange={handleChange}
                  required
                  min="0"
                  className="input"
                />
              </div>
              <div>
                <label className="label">Price Period *</label>
                <select
                  name="price_period"
                  value={formData.price_period || 'monthly'}
                  onChange={handleChange}
                  className="input"
                >
                  {PRICE_PERIODS.map(period => (
                    <option key={period} value={period}>
                      {period === 'monthly' ? 'Monthly' : 'Yearly'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="label">Location *</label>
              <input
                type="text"
                name="location"
                value={formData.location || ''}
                onChange={handleChange}
                required
                className="input"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="label">Bedrooms *</label>
                <select
                  name="bedrooms"
                  value={formData.bedrooms || 1}
                  onChange={handleChange}
                  className="input"
                >
                  {[1, 2, 3, 4, 5, 6].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Bathrooms *</label>
                <select
                  name="bathrooms"
                  value={formData.bathrooms || 1}
                  onChange={handleChange}
                  className="input"
                >
                  {[1, 2, 3, 4, 5, 6].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Property Type *</label>
                <select
                  name="property_type"
                  value={formData.property_type || 'flat'}
                  onChange={handleChange}
                  className="input"
                >
                  {PROPERTY_TYPES.map(type => (
                    <option key={type} value={type}>
                      {type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="label">Contact Phone *</label>
              <input
                type="tel"
                name="contact_phone"
                value={formData.contact_phone || ''}
                onChange={handleChange}
                required
                className="input"
              />
            </div>

            <div>
              <label className="label">WhatsApp Number *</label>
              <input
                type="tel"
                name="contact_whatsapp"
                value={formData.contact_whatsapp || ''}
                onChange={handleChange}
                required
                className="input"
              />
            </div>

            <div>
              <label className="label">Photos</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="input"
              />
              {existingPhotos.length > 0 && (
                <div className="grid grid-cols-4 gap-3 mt-3">
                  {existingPhotos.map((photo, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden">
                      <Image src={photo} alt="" fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" className="btn-primary w-full" disabled={saving}>
              {saving ? 'Saving...' : 'Update Listing'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}