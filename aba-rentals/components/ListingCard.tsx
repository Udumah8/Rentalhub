import Link from 'next/link'
import Image from 'next/image'
import { Listing, Profile } from '@/lib/types'

interface ListingCardProps { listing: Listing & { landlord: Profile } }

export default function ListingCard({ listing }: ListingCardProps) {
  const formatPrice = (price: number, period: string) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(price) + (period === 'yearly' ? '/yr' : '/mo')
  const primaryPhoto = listing.photos?.[0] || '/placeholder.jpg'
  return (
    <Link href={`/listing/${listing.id}`} className="card group flex overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative h-52 w-full shrink-0 bg-muted sm:h-auto sm:min-h-56">
        <Image src={primaryPhoto} alt={listing.title} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
        {listing.landlord?.is_verified && <span className="badge badge-success absolute left-3 top-3">Verified</span>}
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3"><h3 className="line-clamp-2 text-base font-bold text-foreground group-hover:text-primary">{listing.title}</h3><p className="shrink-0 text-sm font-bold text-primary">{formatPrice(Number(listing.price), listing.price_period)}</p></div>
        <p className="mt-2 line-clamp-1 text-sm text-muted-foreground">{listing.location}</p>
        <div className="mt-auto flex items-center gap-3 pt-5 text-xs font-medium text-muted-foreground"><span>{listing.bedrooms} bed</span><span className="text-border">|</span><span>{listing.bathrooms} bath</span><span className="ml-auto capitalize">{listing.property_type.replace('-', ' ')}</span></div>
      </div>
    </Link>
  )
}
