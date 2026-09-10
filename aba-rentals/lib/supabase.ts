import { createClient, SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient {
  if (client) return client

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  client = createClient(supabaseUrl, supabaseAnonKey)
  return client
}

export const supabase = {
  auth: {
    getUser: async () => {
      const c = getSupabaseClient()
      return c.auth.getUser()
    },
    signInWithPassword: async (creds: any) => {
      const c = getSupabaseClient()
      return c.auth.signInWithPassword(creds)
    },
    signUp: async (creds: any) => {
      const c = getSupabaseClient()
      return c.auth.signUp(creds)
    },
    signOut: async () => {
      const c = getSupabaseClient()
      return c.auth.signOut()
    },
  },
  from: <T = any>(table: string) => {
    const c = getSupabaseClient()
    return c.from(table) as any
  },
  storage: {
    from: (bucket: string) => {
      const c = getSupabaseClient()
      return c.storage.from(bucket)
    },
  },
  rpc: async <T = any>(fn: string, args?: any) => {
    const c = getSupabaseClient()
    return c.rpc(fn, args) as any
  },
}

export async function getCurrentUser() {
  const { data: { user } } = await getSupabaseClient().auth.getUser()
  return user
}

export async function getProfile(userId: string) {
  const { data, error } = await getSupabaseClient()
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return { profile: data as any | null, error }
}

export async function getListings(filters: any = {}, page = 1, limit = 20) {
  let query = getSupabaseClient()
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
  const { data, error } = await getSupabaseClient()
    .from('listings')
    .select('*, landlord:profiles(*)')
    .eq('id', id)
    .single()
  return { listing: data as any & { landlord: any } | null, error }
}

export async function createListing(input: any, userId: string) {
  const { data, error } = await getSupabaseClient()
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
  const { data, error } = await getSupabaseClient()
    .from('listings')
    .update(input)
    .eq('id', id)
    .eq('landlord_id', userId)
    .select('*, landlord:profiles(*)')
    .single()
  return { listing: data as any & { landlord: any } | null, error }
}

export async function deleteListing(id: string, userId: string) {
  const { error } = await getSupabaseClient()
    .from('listings')
    .delete()
    .eq('id', id)
    .eq('landlord_id', userId)
  return { error }
}

export async function getMyListings(userId: string) {
  const { data, error } = await getSupabaseClient()
    .from('listings')
    .select('*')
    .eq('landlord_id', userId)
    .order('created_at', { ascending: false })
  return { listings: data as any[] | null, error }
}

export async function approveListing(id: string) {
  const { data, error } = await getSupabaseClient()
    .from('listings')
    .update({ status: 'approved', rejection_reason: null })
    .eq('id', id)
    .select('*, landlord:profiles(*)')
    .single()
  return { listing: data as any & { landlord: any } | null, error }
}

export async function rejectListing(id: string, reason: string) {
  const { data, error } = await getSupabaseClient()
    .from('listings')
    .update({ status: 'rejected', rejection_reason: reason })
    .eq('id', id)
    .select('*, landlord:profiles(*)')
    .single()
  return { listing: data as any & { landlord: any } | null, error }
}

export async function getAllListings() {
  const { data, error } = await getSupabaseClient()
    .from('listings')
    .select('*, landlord:profiles(*)')
    .order('created_at', { ascending: false })
  return { listings: data as any[] & { landlord: any }[], error }
}

export async function getPendingListings() {
  const { data, error } = await getSupabaseClient()
    .from('listings')
    .select('*, landlord:profiles(*)')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
  return { listings: data as any[] & { landlord: any }[], error }
}

export async function getAllProfiles() {
  const { data, error } = await getSupabaseClient()
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  return { profiles: data as any[] | null, error }
}

export async function updateProfileVerification(userId: string, isVerified: boolean) {
  const { data, error } = await getSupabaseClient()
    .from('profiles')
    .update({ is_verified: isVerified })
    .eq('id', userId)
    .single()
  return { profile: data as any | null, error }
}

export async function getAdminStats() {
  const { data, error } = await getSupabaseClient().rpc('get_admin_stats')
  return { stats: data as any | null, error }
}

export async function signUp(email: string, password: string, fullName?: string, phone?: string) {
  const { data, error } = await getSupabaseClient().auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, phone },
    },
  })
  return { user: data.user, session: data.session, error }
}

export async function signIn(email: string, password: string) {
  const { data, error } = await getSupabaseClient().auth.signInWithPassword({
    email,
    password,
  })
  return { user: data.user, session: data.session, error }
}

export async function signOut() {
  const { error } = await getSupabaseClient().auth.signOut()
  return { error }
}

export async function uploadPhoto(file: File, path: string) {
  const supabaseClient = getSupabaseClient()
  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random()}.${fileExt}`
  const filePath = `${path}/${fileName}`

  const { error } = await supabaseClient.storage
    .from('listing-photos')
    .upload(filePath, file)

  if (error) return { url: null, error }

  const { data: { publicUrl } } = supabaseClient.storage
    .from('listing-photos')
    .getPublicUrl(filePath)

  return { url: publicUrl, error: null }
}
