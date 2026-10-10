'use client'

import { useState, useEffect } from 'react'
import { Listing, Profile } from '@/lib/types'
import { getListing } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

interface PageProps {
  params: { id: string }
}

export default function ListingDetailPage({ params }: PageProps) {
  const { id } = params
  const [listing, setListing] = useState<(Listing & { landlord: Profile }) | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const result = await getListing(id)
        if (result.error || !result.listing) {
          setError('Listing not found')
        } else {
          setListing(result.listing)
        }
      } catch {
        setError('Failed to load listing')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const formatPrice = (price: number, period: string) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(price) + (period === 'yearly' ? '/yr' : '/mo')
  }

  const whatsappMessage = encodeURIComponent(
    `Hi, I'm interested in your property "${listing?.title}" listed on Rentalhub. Is it still available?`
  )
  const whatsappUrl = `https://wa.me/${listing?.contact_whatsapp?.replace(/[^0-9]/g, '')}?text=${whatsappMessage}`

  const media = [
    ...(listing?.photos || []).map(url => ({ type: 'image' as const, url })),
    ...(listing?.videos || []).map(url => ({ type: 'video' as const, url })),
  ]

  const currentMedia = media[selectedPhotoIndex] || null

  if (loading) {
    return (
      <motion.div
        className="min-h-screen bg-background"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <header className="border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/" className="text-2xl font-black tracking-[-0.06em] text-foreground">Rental<span className="text-primary">hub</span></Link>
          </div>
        </header>
        <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            className="card overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="shimmer-wrapper relative h-64 sm:h-96 bg-muted" />
            <div className="p-6 space-y-4">
              <div className="shimmer-wrapper h-8 w-3/4 rounded" />
              <div className="shimmer-wrapper h-6 w-1/2 rounded" />
              <div className="shimmer-wrapper h-6 w-1/3 rounded" />
              <div className="shimmer-wrapper h-4 w-full rounded" />
              <div className="shimmer-wrapper h-4 w-2/3 rounded" />
            </div>
          </motion.div>
        </main>
      </motion.div>
    )
  }

  if (error || !listing) {
    return (
      <motion.div
        className="min-h-screen bg-background"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <header className="border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/" className="text-2xl font-black tracking-[-0.06em] text-foreground">Rental<span className="text-primary">hub</span></Link>
          </div>
        </header>
        <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            <motion.div
              className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </motion.div>
            <motion.h1
              className="text-2xl font-bold text-foreground mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              Listing Not Found
            </motion.h1>
            <motion.p
              className="text-muted-foreground mb-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              The listing you&apos;re looking for doesn&apos;t exist or has been removed.
            </motion.p>
            <motion.a
              href="/"
              className="btn-primary"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Back to Listings
            </motion.a>
          </motion.div>
        </main>
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
        className="border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-2xl font-black tracking-[-0.06em] text-foreground">Rental<span className="text-primary">hub</span></Link>
          <motion.a
            href="/"
            className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            whileHover={{ x: -4 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
            Back to listings
          </motion.a>
        </div>
      </motion.header>

      <motion.main
        className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, type: 'spring', stiffness: 100, damping: 15 }}
      >
        <motion.div
          className="card overflow-hidden"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <div className="relative h-64 sm:h-96 bg-muted">
            <AnimatePresence mode="wait">
              {currentMedia?.type === 'video' ? (
                <motion.video
                  key="video"
                  src={currentMedia.url}
                  controls
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                />
              ) : (
                <motion.div
                  key="image"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <Image
                    src={currentMedia?.url || listing.photos?.[0] || '/placeholder.jpg'}
                    alt={listing.title}
                    fill
                    className="object-cover transition-opacity duration-300"
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </motion.div>
              )}
            </AnimatePresence>
            
            <AnimatePresence>
              {listing.landlord?.is_verified && (
                <motion.span
                  className="absolute top-4 right-4 badge badge-success text-sm"
                  initial={{ opacity: 0, scale: 0.8, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30, delay: 0.3 }}
                >
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                  Verified Landlord
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {media.length > 1 && (
            <motion.div
              className="flex gap-2 p-4 overflow-x-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {media.map((item, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => setSelectedPhotoIndex(idx)}
                  className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all duration-200 ${
                    selectedPhotoIndex === idx ? 'border-primary bg-primary/5' : 'border-transparent hover:border-border/50'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  {item.type === 'video' ? (
                    <div className="w-full h-full bg-black/80 flex items-center justify-center text-white text-xs flex-col gap-1">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                      Video
                    </div>
                  ) : (
                    <Image src={item.url} alt="" fill className="object-cover transition-transform duration-300" />
                  )}
                </motion.button>
              ))}
            </motion.div>
          )}

          <motion.div
            className="p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div
              className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div>
                <motion.h1
                  className="text-2xl sm:text-3xl font-bold text-foreground mb-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {listing.title}
                </motion.h1>
                <motion.p
                  className="text-lg text-muted-foreground flex items-center gap-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243A8 8 0 1117.657 16.657z" />
                    <circle cx="12" cy="11" r="1.5" fill="currentColor" />
                  </svg>
                  {listing.location}
                </motion.p>
              </div>
              <motion.div
                className="text-right"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <motion.p
                  className="text-3xl font-bold text-primary"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >
                  {formatPrice(Number(listing.price), listing.price_period)}
                </motion.p>
              </motion.div>
            </motion.div>

            <motion.div
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {[
                { label: 'Bedrooms', value: listing.bedrooms, icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/></svg> },
                { label: 'Bathrooms', value: listing.bathrooms, icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z"/></svg> },
                { label: 'Property Type', value: listing.property_type.replace('-', ' '), icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16"/></svg> },
                { label: 'Verified', value: listing.landlord?.is_verified ? 'Yes' : 'No', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9.9 0 11-18 0 9.9 0 0118 0z"/></svg> },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  className="card p-4 text-center"
                  whileHover={{ y: -4, boxShadow: '0 12px 28px hsl(var(--foreground) / 0.1)' }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                >
                  <motion.div
                    className="flex justify-center mb-2"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 500, damping: 30 }}
                  >
                    {item.icon}
                  </motion.div>
                  <motion.p
                    className="text-xl font-bold text-foreground"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {item.value}
                  </motion.p>
                  <motion.p
                    className="text-sm text-muted-foreground"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    {item.label}
                  </motion.p>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <motion.h2
                className="text-xl font-bold text-foreground mb-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                Description
              </motion.h2>
              <motion.p
                className="text-muted-foreground whitespace-pre-wrap leading-relaxed"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {listing.description}
              </motion.p>
            </motion.div>

            <motion.div
              className="card bg-primary/5 border-primary/20 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ boxShadow: '0 12px 28px hsl(var(--primary) / 0.15)' }}
            >
              <motion.h2
                className="text-xl font-bold text-foreground mb-4"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                Contact Landlord
              </motion.h2>
              <motion.div
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <motion.a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary flex items-center justify-center gap-2 flex-1"
                  whileHover={{ scale: 1.02, boxShadow: '0 12px 28px hsl(var(--primary) / 0.3)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Contact via WhatsApp
                </motion.a>
                <motion.a
                  href={`tel:${listing.contact_phone}`}
                  className="btn-outline flex items-center justify-center gap-2 flex-1"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Call: {listing.contact_phone}
                </motion.a>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.main>
    </motion.div>
  )
}