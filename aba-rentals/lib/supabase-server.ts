import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function createAdminClient(): SupabaseClient {
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export async function getServerUser() {
  const cookieStore = await import('next/headers').then(m => m.cookies())
  const authToken = cookieStore.get('sb-access-token')?.value

  if (!authToken) return null

  const supabase = createAdminClient()
  const { data: { user } } = await supabase.auth.getUser(authToken)
  return user
}

export async function getServerProfile(userId: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return { profile: data as any | null, error }
}

export async function getServerListing(id: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('listings')
    .select('*, landlord:profiles(*)')
    .eq('id', id)
    .single()
  return { listing: data as any & { landlord: any } | null, error }
}

export async function getServerListings(filters: any = {}, page = 1, limit = 20) {
  const supabase = createAdminClient()
  let query = supabase
    .from('listings')
    .select('*, landlord:profiles(*)', { count: 'exact' })
    .eq('status', 'approved')

  if (filters.minPrice) query = query.gte('price', filters.minPrice)
  if (filters.maxPrice) query = query.lte('price', filters.maxPrice)
  if (filters.location) query = query.ilike('location', `%${filters.location}%`)
  if (filters.bedrooms) query = query.eq('bedrooms', filters.bedrooms)
  if (filters.propertyType) query = query.eq('property_type', filters.propertyType)
  if (filters.search) query = query.or(`title.ilike.%${filters.search}%,location.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)

  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to)

  return { listings: data as any[] & { landlord: any }[], error, count }
}

export async function getServerPendingListings() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('listings')
    .select('*, landlord:profiles(*)')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
  return { listings: data as any[] & { landlord: any }[], error }
}

export async function getServerAllListings() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('listings')
    .select('*, landlord:profiles(*)')
    .order('created_at', { ascending: false })
  return { listings: data as any[] & { landlord: any }[], error }
}

export async function getServerProfiles() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  return { profiles: data as any[] | null, error }
}

export async function getServerAdminStats() {
  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc('get_admin_stats')
  return { stats: data as any | null, error }
}

export async function isAdmin(userId: string) {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('admin_users')
    .select('id')
    .eq('id', userId)
    .single()
  return !!data
}

export async function getMyListings(userId: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('landlord_id', userId)
    .order('created_at', { ascending: false })
  return { listings: data as any[] | null, error }
}

export async function updateProfileVerification(userId: string, isVerified: boolean) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('profiles')
    .update({ is_verified: isVerified })
    .eq('id', userId)
    .single()
  return { profile: data as any | null, error }
}