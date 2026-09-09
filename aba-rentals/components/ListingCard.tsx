import Link from 'next/link'
import Image from 'next/image'
import { Listing, Profile } from '@/lib/types'

interface ListingCardProps {
  listing: Listing & { landlord: Profile }
}

export default function ListingCard({ listing }: ListingCardProps) {
  const formatPrice = (price: number, period: string) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(price) + (period === 'yearly' ? '/yr' : '/mo')
  }

  const primaryPhoto = listing.photos?.[0] || '/placeholder.jpg'

  return (
    <Link href={`/listing/${listing.id}`} className="card overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      <div className="relative h-48 bg-gray-100">
        <Image
          src={primaryPhoto}
          alt={listing.title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {listing.landlord?.is_verified && (
          <span className="absolute top-2 right-2 badge badge-success">
            Verified Landlord
          </span>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-900 line-clamp-1 text-lg">
            {listing.title}
          </h3>
          <p className="text-blue-600 font-bold whitespace-nowrap ml-2">
            {formatPrice(Number(listing.price), listing.price_period)}
          </p>
        </div>
        <p className="text-gray-500 text-sm mb-3 line-clamp-1">
          {listing.location}
        </p>
        <div className="flex items-center gap-4 text-sm text-gray-600 mt-auto">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            {listing.bedrooms} bed
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            {listing.bathrooms} bath
          </span>
          <span className="capitalize text-gray-500">
            {listing.property_type.replace('-', ' ')}
          </span>
        </div>
      </div>
    </Link>
  )
}