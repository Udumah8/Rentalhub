'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CreateListingInput, PropertyType, PricePeriod } from '@/lib/types'
import { createListing, signOut } from '@/lib/supabase'
import Image from 'next/image'

const PROPERTY_TYPES: PropertyType[] = ['self-contain', 'flat', 'duplex', 'bungalow', 'office', 'shop', 'other']
const PRICE_PERIODS: PricePeriod[] = ['monthly', 'yearly']

export default function NewListingPage() {
  const [formData, setFormData] = useState<CreateListingInput>({
    title: '',
    description: '',
    price: 0,
    price_period: 'monthly',
    location: '',
    bedrooms: 1,
    bathrooms: 1,
    property_type: 'flat',
    photos: [],
    contact_phone: '',
    contact_whatsapp: '',
  })
  const [loading, setLoading] = useState(false)
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
      }
    }
    checkAuth()
  }, [router])

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

    setError(null)
    const uploadPromises = Array.from(files).map(async (file) => {
      const { uploadPhoto } = await import('@/lib/supabase')
      const result = await uploadPhoto(file, 'listings')
      return result.url
    })

    const urls = await Promise.all(uploadPromises)
    const validUrls = urls.filter((url): url is string => url !== null)
    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, ...validUrls],
    }))
  }

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (formData.photos.length === 0) {
      setError('Please upload at least one photo')
      setLoading(false)
      return
    }

    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('You must be logged in to create a listing')
      setLoading(false)
      return
    }

    const { error } = await createListing(formData, user.id)

    if (error) {
      setError(error.message || 'Failed to create listing')
      setLoading(false)
    } else {
      setSuccess(true)
      setTimeout(() => {
        router.push('/landlord/dashboard')
      }, 1500)
    }
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Listing Created!</h2>
          <p className="text-gray-500">Your listing has been submitted for approval.</p>
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
              <span className="text-gray-700 font-medium">New Listing</span>
            </div>
            <Link href="/landlord/dashboard" className="text-gray-600 hover:text-gray-900">Cancel</Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Listing</h1>

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
                value={formData.title}
                onChange={handleChange}
                required
                className="input"
                placeholder="e.g., 2 Bedroom Flat in Aba Town"
              />
            </div>

            <div>
              <label className="label">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="input"
                placeholder="Describe the property, amenities, neighborhood..."
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
                  placeholder="50000"
                />
              </div>
              <div>
                <label className="label">Price Period *</label>
                <select
                  name="price_period"
                  value={formData.price_period}
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
                value={formData.location}
                onChange={handleChange}
                required
                className="input"
                placeholder="e.g., Aba Town, Ochie, Ariaria"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="label">Bedrooms *</label>
                <select
                  name="bedrooms"
                  value={formData.bedrooms}
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
                  value={formData.bathrooms}
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
                  value={formData.property_type}
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
                value={formData.contact_phone}
                onChange={handleChange}
                required
                className="input"
                placeholder="+234 803 000 0000"
              />
            </div>

            <div>
              <label className="label">WhatsApp Number *</label>
              <input
                type="tel"
                name="contact_whatsapp"
                value={formData.contact_whatsapp}
                onChange={handleChange}
                required
                className="input"
                placeholder="+234 803 000 0000"
              />
              <p className="text-xs text-gray-500 mt-1">Include country code (e.g., +234)</p>
            </div>

            <div>
              <label className="label">Photos *</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="input"
              />
              {formData.photos.length > 0 && (
                <div className="grid grid-cols-4 gap-3 mt-3">
                  {formData.photos.map((photo, idx) => (
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

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Creating...' : 'Create Listing'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}