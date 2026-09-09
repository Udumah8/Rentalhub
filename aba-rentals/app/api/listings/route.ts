import { NextResponse } from 'next/server'
import { getServerListings, getServerUser } from '@/lib/supabase-server'
import { Filters } from '@/lib/types'

export async function GET(request: Request) {
  try {
    const searchParams = new URL(request.url).searchParams
    const filters: Filters = {}
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const location = searchParams.get('location')
    const bedrooms = searchParams.get('bedrooms')
    const propertyType = searchParams.get('propertyType')
    const search = searchParams.get('search')
    const page = Number(searchParams.get('page')) || 1
    const limit = Number(searchParams.get('limit')) || 20

    if (minPrice) filters.minPrice = Number(minPrice)
    if (maxPrice) filters.maxPrice = Number(maxPrice)
    if (location) filters.location = location
    if (bedrooms) filters.bedrooms = Number(bedrooms)
    if (propertyType) filters.propertyType = propertyType as Filters['propertyType']
    if (search) filters.search = search

    const { listings, error, count } = await getServerListings(filters, page, limit)

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 })
    }

    return NextResponse.json({ listings, count })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}