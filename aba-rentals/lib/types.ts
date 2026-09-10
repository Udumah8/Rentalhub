export type ListingStatus = 'pending' | 'approved' | 'rejected'
export type PricePeriod = 'monthly' | 'yearly'
export type PropertyType = 'self-contain' | 'flat' | 'duplex' | 'bungalow' | 'office' | 'shop' | 'other'

export interface Profile {
  id: string
  email?: string
  phone?: string
  full_name?: string
  is_verified: boolean
  verification_document_url?: string
  created_at: string
  updated_at: string
}

export interface Listing {
  id: string
  landlord_id: string
  title: string
  description: string
  price: number
  price_period: PricePeriod
  location: string
  bedrooms: number
  bathrooms: number
  property_type: PropertyType
  photos: string[]
  videos: string[]
  status: ListingStatus
  rejection_reason?: string
  contact_phone: string
  contact_whatsapp: string
  created_at: string
  updated_at: string
  landlord?: Profile
}

export interface CreateListingInput {
  title: string
  description: string
  price: number
  price_period: PricePeriod
  location: string
  bedrooms: number
  bathrooms: number
  property_type: PropertyType
  photos: string[]
  videos: string[]
  contact_phone: string
  contact_whatsapp: string
}

export interface UpdateListingInput extends Partial<CreateListingInput> {
  status?: ListingStatus
  rejection_reason?: string
}

export interface Filters {
  minPrice?: number
  maxPrice?: number
  location?: string
  bedrooms?: number
  propertyType?: PropertyType
  search?: string
}

export interface AdminStats {
  total_listings: number
  total_landlords: number
  pending_listings: number
  approved_listings: number
  rejected_listings: number
  verified_landlords: number
  listings_by_area: Array<{ location: string; count: number }>
}