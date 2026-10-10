'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CreateListingInput, PropertyType, PricePeriod } from '@/lib/types'
import { createListing, signOut, getSupabaseClient, uploadMedia } from '@/lib/supabase'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

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
    videos: [],
    contact_phone: '',
    contact_whatsapp: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [uploading, setUploading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = getSupabaseClient()
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

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'photos' | 'videos') => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setError(null)
    setUploading(true)

    try {
      const results = await Promise.all(
        Array.from(files).map(async (file) => {
          const result = await uploadMedia(file)
          return result
        })
      )

      const validUrls = results.filter((r): r is { url: string; error: null } => !!r.url && !r.error).map(r => r.url)
      const failed = results.filter(r => r.error)

      if (failed.length > 0) {
        const msg = failed[0].error?.message || 'Unknown error'
        setError(`Failed to upload ${failed.length} file(s): ${msg}`)
      }

      if (validUrls.length > 0) {
        setFormData(prev => ({
          ...prev,
          [type]: [...prev[type], ...validUrls],
        }))
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload media')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const removeMedia = (type: 'photos' | 'videos', index: number) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
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

    const supabase = getSupabaseClient()
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
      <motion.div
        className="min-h-screen bg-background flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <motion.div
            className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30, delay: 0.1 }}
          >
            <motion.svg
              className="h-8 w-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <motion.path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
            </motion.svg>
          </motion.div>
          <motion.h2
            className="text-2xl font-bold text-foreground mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Listing Created!
          </motion.h2>
          <motion.p
            className="text-muted-foreground"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Your listing has been submitted for approval.
          </motion.p>
        </motion.div>
      </motion.div>
    )
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
            <span className="text-foreground font-medium">New Listing</span>
          </motion.div>
          <motion.a
            href="/landlord/dashboard"
            className="text-muted-foreground hover:text-foreground transition-colors"
            whileHover={{ x: -4 }}
          >
            Cancel
          </motion.a>
        </div>
      </motion.header>

      <motion.main
        className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, type: 'spring', stiffness: 100, damping: 15 }}
      >
        <motion.h1
          className="text-2xl font-bold text-foreground mb-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          Create New Listing
        </motion.h1>

        <motion.div
          className="card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4"
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label className="label">Property Title *</label>
              <motion.input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="input"
                placeholder="e.g., 2 Bedroom Flat in Ikeja"
                whileFocus={{ scale: 1.01 }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
            >
              <label className="label">Description *</label>
              <motion.textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="input"
                placeholder="Describe the property, amenities, neighborhood..."
                whileFocus={{ scale: 1.01 }}
              />
            </motion.div>

            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div>
                <label className="label">Price (₦) *</label>
                <motion.input
                  type="number"
                  name="price"
                  value={formData.price || ''}
                  onChange={handleChange}
                  required
                  min="0"
                  className="input"
                  placeholder="50000"
                  whileFocus={{ scale: 1.01 }}
                />
              </div>
              <div>
                <label className="label">Price Period *</label>
                <motion.select
                  name="price_period"
                  value={formData.price_period}
                  onChange={handleChange}
                  className="input"
                  whileFocus={{ scale: 1.01 }}
                  whileHover={{ borderColor: 'hsl(var(--primary))' }}
                >
                  {PRICE_PERIODS.map(period => (
                    <option key={period} value={period}>
                      {period === 'monthly' ? 'Monthly' : 'Yearly'}
                    </option>
                  ))}
                </motion.select>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
            >
              <label className="label">Location *</label>
              <motion.input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="input"
                placeholder="e.g., Ikeja, Lekki, GRA"
                whileFocus={{ scale: 1.01 }}
              />
            </motion.div>

            <motion.div
              className="grid grid-cols-1 sm:grid-cols-3 gap-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div>
                <label className="label">Bedrooms *</label>
                <motion.select
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  className="input"
                  whileFocus={{ scale: 1.01 }}
                  whileHover={{ borderColor: 'hsl(var(--primary))' }}
                >
                  {[1, 2, 3, 4, 5, 6].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </motion.select>
              </div>
              <div>
                <label className="label">Bathrooms *</label>
                <motion.select
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  className="input"
                  whileFocus={{ scale: 1.01 }}
                  whileHover={{ borderColor: 'hsl(var(--primary))' }}
                >
                  {[1, 2, 3, 4, 5, 6].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </motion.select>
              </div>
              <div>
                <label className="label">Property Type *</label>
                <motion.select
                  name="property_type"
                  value={formData.property_type}
                  onChange={handleChange}
                  className="input"
                  whileFocus={{ scale: 1.01 }}
                  whileHover={{ borderColor: 'hsl(var(--primary))' }}
                >
                  {PROPERTY_TYPES.map(type => (
                    <option key={type} value={type}>
                      {type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </motion.select>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 }}
            >
              <label className="label">Contact Phone *</label>
              <motion.input
                type="tel"
                name="contact_phone"
                value={formData.contact_phone}
                onChange={handleChange}
                required
                className="input"
                placeholder="+234 803 000 0000"
                whileFocus={{ scale: 1.01 }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label className="label">WhatsApp Number *</label>
              <motion.input
                type="tel"
                name="contact_whatsapp"
                value={formData.contact_whatsapp}
                onChange={handleChange}
                required
                className="input"
                placeholder="+234 803 000 0000"
                whileFocus={{ scale: 1.01 }}
              />
              <motion.p
                className="text-xs text-muted-foreground mt-1"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                Include country code (e.g., +234)
              </motion.p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55 }}
            >
              <label className="label">Photos *</label>
              <motion.input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleMediaUpload(e, 'photos')}
                className="input"
                disabled={uploading}
                whileHover={{ borderColor: 'hsl(var(--primary))' }}
              />
              <AnimatePresence>
                {formData.photos.length > 0 && (
                  <motion.div
                    className="grid grid-cols-4 gap-3 mt-3"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {formData.photos.map((photo, idx) => (
                      <motion.div
                        key={idx}
                        className="relative aspect-square rounded-lg overflow-hidden"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      >
                        <Image src={photo} alt="" fill className="object-cover" />
                        <motion.button
                          type="button"
                          onClick={() => removeMedia('photos', idx)}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                          whileHover={{ scale: 1.1, rotate: 90 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          ×
                        </motion.button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <label className="label">Videos (optional)</label>
              <motion.input
                type="file"
                accept="video/*"
                multiple
                onChange={(e) => handleMediaUpload(e, 'videos')}
                className="input"
                disabled={uploading}
                whileHover={{ borderColor: 'hsl(var(--primary))' }}
              />
              <AnimatePresence>
                {formData.videos.length > 0 && (
                  <motion.div
                    className="grid grid-cols-2 gap-3 mt-3"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {formData.videos.map((video, idx) => (
                      <motion.div
                        key={idx}
                        className="relative aspect-video rounded-lg overflow-hidden bg-black"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      >
                        <video src={video} controls className="w-full h-full" />
                        <motion.button
                          type="button"
                          onClick={() => removeMedia('videos', idx)}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                          whileHover={{ scale: 1.1, rotate: 90 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          ×
                        </motion.button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.button
              type="submit"
              className="btn-primary w-full"
              disabled={loading || uploading}
              whileHover={{ scale: [1, 1.01, 1], boxShadow: '0 12px 28px hsl(var(--primary) / 0.3)' }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.svg
                    className="animate-spin h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <motion.circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <motion.path
                      className="opacity-75"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                      d="M4 12a8 8 0 018-8V0"
                    />
                  </motion.svg>
                  Creating...
                </span>
              ) : (
                'Create Listing'
              )}
            </motion.button>
          </form>
        </motion.div>
      </motion.main>
    </motion.div>
  )
}