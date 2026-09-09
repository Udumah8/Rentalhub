import { NextResponse } from 'next/server'
import { getServerUser, getServerAllListings, getServerProfiles, isAdmin } from '@/lib/supabase-server'

export async function GET() {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await isAdmin(user.id)
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const [listingsResult, profilesResult] = await Promise.all([
      getServerAllListings(),
      getServerProfiles(),
    ])

    return NextResponse.json({
      listings: listingsResult.listings || [],
      profiles: profilesResult.profiles || [],
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}