import { createClient as createBrowserClient } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'

export function getSupabaseClient(): SupabaseClient { return createBrowserClient() }
export const supabase = new Proxy({} as SupabaseClient, { get: (_target, property) => (getSupabaseClient() as any)[property] })

export async function getCurrentUser() { const { data: { user } } = await getSupabaseClient().auth.getUser(); return user }
export async function getProfile(userId: string) { const { data, error } = await getSupabaseClient().from('profiles').select('*').eq('id', userId).single(); return { profile: data as any | null, error } }

export async function getListings(filters: any = {}, page = 1, limit = 20) {
  let query: any = getSupabaseClient().from('listings').select('*, landlord:profiles(*)', { count: 'exact' }).eq('status', 'approved')
  if (filters.minPrice) query = query.gte('price', filters.minPrice)
  if (filters.maxPrice) query = query.lte('price', filters.maxPrice)
  if (filters.location) query = query.ilike('location', `%${filters.location}%`)
  if (filters.bedrooms) query = query.eq('bedrooms', filters.bedrooms)
  if (filters.propertyType) query = query.eq('property_type', filters.propertyType)
  if (filters.search) query = query.or(`title.ilike.%${filters.search}%,location.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  const { data, error, count } = await query.order('created_at', { ascending: false }).range((page - 1) * limit, page * limit - 1)
  return { listings: data as any[] & { landlord: any }[], error, count }
}
export async function getListing(id: string) { const { data, error } = await getSupabaseClient().from('listings').select('*, landlord:profiles(*)').eq('id', id).single(); return { listing: data as any, error } }
export async function createListing(input: any, userId: string) { const { data, error } = await getSupabaseClient().from('listings').insert({ ...input, landlord_id: userId }).select('*, landlord:profiles(*)').single(); return { listing: data as any, error } }
export async function updateListing(id: string, input: any, userId: string) { const { data, error } = await getSupabaseClient().from('listings').update(input).eq('id', id).eq('landlord_id', userId).select('*, landlord:profiles(*)').single(); return { listing: data as any, error } }
export async function deleteListing(id: string, userId: string) { const { error } = await getSupabaseClient().from('listings').delete().eq('id', id).eq('landlord_id', userId); return { error } }
export async function getMyListings(userId: string) { const { data, error } = await getSupabaseClient().from('listings').select('*').eq('landlord_id', userId).order('created_at', { ascending: false }); return { listings: data as any[] | null, error } }
export async function approveListing(id: string) { 
  const { data, error } = await getSupabaseClient().from('listings').update({ status: 'approved', rejection_reason: null }).eq('id', id).select('*, landlord:profiles(*)').maybeSingle(); 
  if (error) return { listing: null, error }
  if (!data) return { listing: null, error: { message: 'Listing not found or permission denied' } }
  return { listing: data as any, error }
}
export async function rejectListing(id: string, reason: string) { 
  const { data, error } = await getSupabaseClient().from('listings').update({ status: 'rejected', rejection_reason: reason }).eq('id', id).select('*, landlord:profiles(*)').maybeSingle(); 
  if (error) return { listing: null, error }
  if (!data) return { listing: null, error: { message: 'Listing not found or permission denied' } }
  return { listing: data as any, error }
}
export async function uploadMedia(file: File) {
  const client = getSupabaseClient()
  const isVideo = file.type.startsWith('video/')
  const folder = isVideo ? 'videos' : 'images'

  const fileName = file.name.replace(/\s+/g, '-')
  const ext = fileName.includes('.') ? fileName.split('.').pop() : (isVideo ? 'mp4' : 'jpg')
  const baseName = fileName.includes('.') ? fileName.slice(0, fileName.lastIndexOf('.')) : fileName
  const filePath = `${folder}/${baseName}-${Date.now()}.${ext}`

  const { error } = await client.storage.from('listing-photos').upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) return { url: null, error }

  return { url: client.storage.from('listing-photos').getPublicUrl(filePath).data.publicUrl, error: null }
}

export async function signUp(email: string, password: string, fullName?: string, phone?: string) { 
  const redirectTo = typeof window !== 'undefined' 
    ? (process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? `${window.location.origin}/auth/callback`) 
    : undefined
  const { data, error } = await getSupabaseClient().auth.signUp({ 
    email, 
    password, 
    options: { 
      emailRedirectTo: redirectTo, 
      data: { full_name: fullName?.trim(), phone: phone?.trim() } 
    } 
  }); 
  return { user: data.user, session: data.session, error } 
}
export async function signIn(email: string, password: string) { const { data, error } = await getSupabaseClient().auth.signInWithPassword({ email, password }); return { user: data.user, session: data.session, error } }
export async function signOut() { const { error } = await getSupabaseClient().auth.signOut(); return { error } }
