import { NextResponse } from 'next/server'
import { getServerUser, getServerListing, isAdmin } from '@/lib/supabase-server'
import { approveListing, rejectListing } from '@/lib/supabase'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await isAdmin(user.id)
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const resolvedParams = await params
    const body = await request.json()
    const { status, rejection_reason } = body

    if (status === 'approved') {
      const { listing, error } = await approveListing(resolvedParams.id)
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      return NextResponse.json({ listing })
    }

    if (status === 'rejected') {
      if (!rejection_reason?.trim()) {
        return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 })
      }
      const { listing, error } = await rejectListing(resolvedParams.id, rejection_reason)
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      return NextResponse.json({ listing })
    }

    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}