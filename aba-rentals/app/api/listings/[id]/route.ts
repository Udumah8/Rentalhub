import { NextResponse } from 'next/server'
import { getServerListing, getServerUser, isAdmin } from '@/lib/supabase-server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const user = await getServerUser()
    const { listing, error } = await getServerListing(resolvedParams.id)

    if (error || !listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    const isOwner = user && listing.landlord_id === user.id
    const admin = user ? await isAdmin(user.id) : false

    if (listing.status !== 'approved' && !isOwner && !admin) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    return NextResponse.json({ listing })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}