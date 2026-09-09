import { createClient, SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

function getClient(): SupabaseClient {
  if (client) return client

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  client = createClient(supabaseUrl, supabaseAnonKey)
  return client
}

export async function getCurrentUser() {
  const { data: { user } } = await getClient().auth.getUser()
  return user
}

export async function getProfile(userId: string) {
  const { data, error } = await getClient()
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return { profile: data as any | null, error }
}

export async function getListings(filters: any = {}, page = 1, limit = 20) {
  let query = getClient()
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

export async function getListing(id: string) {
  const { data, error } = await getClient()
    .from('listings')
    .select('*, landlord:profiles(*)')
    .eq('id', id)
    .single()
  return { listing: data as any & { landlord: any } | null, error }
}

export async function createListing(input: any, userId: string) {
  const { data, error } = await getClient()
    .from('listings')
    .insert({
      ...input,
      landlord_id: userId,
    })
    .select('*, landlord:profiles(*)')
    .single()
  return { listing: data as any & { landlord: any } | null, error }
}

export async function updateListing(id: string, input: any, userId: string) {
  const { data, error } = await getClient()
    .from('listings')
    .update(input)
    .eq('id', id)
    .eq('landlord_id', userId)
    .select('*, landlord:profiles(*)')
    .single()
  return { listing: data as any & { landlord: any } | null, error }
}

export async function deleteListing(id: string, userId: string) {
  const { error } = await getClient()
    .from('listings')
    .delete()
    .eq('id', id)
    .eq('landlord_id', userId)
  return { error }
}

export async function getMyListings(userId: string) {
  const { data, error } = await getClient()
    .from('listings')
    .select('*')
    .eq('landlord_id', userId)
    .order('created_at', { ascending: false })
  return { listings: data as any[] | null, error }
}

export async function approveListing(id: string) {
  const { data, error } = await getClient()
    .from('listings')
    .update({ status: 'approved', rejection_reason: null })
    .eq('id', id)
    .select('*, landlord:profiles(*)')
    .single()
  return { listing: data as any & { landlord: any } | null, error }
}

export async function rejectListing(id: string, reason: string) {
  const { data, error } = await getClient()
    .from('listings')
    .update({ status: 'rejected', rejection_reason: reason })
    .eq('id', id)
    .select('*, landlord:profiles(*)')
    .single()
  return { listing: data as any & { landlord: any } | null, error }
}

export async function getAllListings() {
  const { data, error } = await getClient()
    .from('listings')
    .select('*, landlord:profiles(*)')
    .order('created_at', { ascending: false })
  return { listings: data as any[] & { landlord: any }[], error }
}

export async function getPendingListings() {
  const { data, error } = await getClient()
    .from('listings')
    .select('*, landlord:profiles(*)')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
  return { listings: data as any[] & { landlord: any }[], error }
}

export async function getAllProfiles() {
  const { data, error } = await getClient()
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  return { profiles: data as any[] | null, error }
}

export async function updateProfileVerification(userId: string, isVerified: boolean) {
  const { data, error } = await getClient()
    .from('profiles')
    .update({ is_verified: isVerified })
    .eq('id', userId)
    .single()
  return { profile: data as any | null, error }
}

export async function getAdminStats() {
  const { data, error } = await getClient().rpc('get_admin_stats')
  return { stats: data as any | null, error }
}

export async function signUp(email: string, password: string, phone?: string) {
  const { data, error } = await getClient().auth.signUp({
    email,
    password,
    options: {
      data: { phone },
    },
  })
  return { user: data.user, session: data.session, error }
}

export async function signIn(email: string, password: string) {
  const { data, error } = await getClient().auth.signInWithPassword({
    email,
    password,
  })
  return { user: data.user, session: data.session, error }
}

export async function signOut() {
  const { error } = await getClient().auth.signOut()
  return { error }
}

export async function uploadPhoto(file: File, path: string) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random()}.${fileExt}`
  const filePath = `${path}/${fileName}`

  const { error } = await getClient().storage
    .from('listing-photos')
    .upload(filePath, file)

  if (error) return { url: null, error }

  const { data: { publicUrl } } = getClient().storage
    .from('listing-photos')
    .getPublicUrl(filePath)

  return { url: publicUrl, error: null }
}