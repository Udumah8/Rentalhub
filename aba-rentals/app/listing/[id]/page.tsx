'use client'

import { useState, useEffect } from 'react'
import { Listing, Profile } from '@/lib/types'
import { getListing } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'

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
    `Hi, I'm interested in your property "${listing?.title}" listed on Aba Rentals. Is it still available?`
  )
  const whatsappUrl = `https://wa.me/${listing?.contact_whatsapp?.replace(/[^0-9]/g, '')}?text=${whatsappMessage}`

  const media = [
    ...(listing?.photos || []).map(url => ({ type: 'image' as const, url })),
    ...(listing?.videos || []).map(url => ({ type: 'video' as const, url })),
  ]

  const currentMedia = media[selectedPhotoIndex] || null

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">Aba Rentals</Link>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="bg-gray-200 h-96 rounded-lg mb-6" />
            <div className="bg-gray-200 h-8 rounded w-3/4 mb-4" />
            <div className="bg-gray-200 h-6 rounded w-1/2" />
          </div>
        </main>
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">Aba Rentals</Link>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Listing Not Found</h1>
          <p className="text-gray-500 mb-8">The listing you're looking for doesn't exist or has been removed.</p>
          <Link href="/" className="btn-primary">Back to Listings</Link>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-blue-600">Aba Rentals</Link>
          <Link href="/" className="text-gray-600 hover:text-gray-900">Back to listings</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card overflow-hidden">
          <div className="relative h-64 sm:h-96 bg-gray-100">
            {currentMedia?.type === 'video' ? (
              <video src={currentMedia.url} controls className="w-full h-full" />
            ) : (
              <Image
                src={currentMedia?.url || listing.photos?.[0] || '/placeholder.jpg'}
                alt={listing.title}
                fill
                className="object-cover"
                priority
              />
            )}
            {listing.landlord?.is_verified && (
              <span className="absolute top-4 right-4 badge badge-success text-sm">
                Verified Landlord
              </span>
            )}
          </div>

          {media.length > 1 && (
            <div className="flex gap-2 p-4 overflow-x-auto">
              {media.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedPhotoIndex(idx)}
                  className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 ${
                    selectedPhotoIndex === idx ? 'border-blue-600' : 'border-transparent'
                  }`}
                >
                  {item.type === 'video' ? (
                    <div className="w-full h-full bg-black flex items-center justify-center text-white text-xs">
                      ▶ Video
                    </div>
                  ) : (
                    <Image src={item.url} alt="" fill className="object-cover" />
                  )}
                </button>
              ))}
            </div>
          )}

          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{listing.title}</h1>
                <p className="text-lg text-gray-500 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243A8 8 0 1117.657 16.657z" />
                    <circle cx="12" cy="11" r="1.5" fill="currentColor" />
                  </svg>
                  {listing.location}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-blue-600">
                  {formatPrice(Number(listing.price), listing.price_period)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{listing.bedrooms}</p>
                <p className="text-sm text-gray-500">Bedrooms</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{listing.bathrooms}</p>
                <p className="text-sm text-gray-500">Bathrooms</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-lg font-bold text-gray-900 capitalize">
                  {listing.property_type.replace('-', ' ')}
                </p>
                <p className="text-sm text-gray-500">Property Type</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-lg font-bold text-gray-900">
                  {listing.landlord?.is_verified ? 'Yes' : 'No'}
                </p>
                <p className="text-sm text-gray-500">Verified</p>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Description</h2>
              <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{listing.description}</p>
            </div>

            <div className="bg-blue-50 rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Landlord</h2>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary flex items-center justify-center gap-2 flex-1"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Contact via WhatsApp
                </a>
                <a
                  href={`tel:${listing.contact_phone}`}
                  className="btn-outline flex items-center justify-center gap-2 flex-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Call: {listing.contact_phone}
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
