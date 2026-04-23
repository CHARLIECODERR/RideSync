import { supabase } from '@/lib/supabase'
import { api, isLocalMode } from '@/lib/api'

export interface Profile {
  id: string
  name: string | null
  email: string | null
  avatar_url: string | null
  updated_at?: string
}

export const authService = {
  async getProfile(userId: string) {
    if (isLocalMode()) {
      const { data } = await api.get(`/profiles/${userId}`)
      return data as Profile | null
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (error) throw error
    return data as Profile | null
  },

  async updateProfile(profile: Partial<Profile> & { id: string }) {
    if (isLocalMode()) {
      const { data } = await api.put(`/profiles/${profile.id}`, profile)
      return data as Profile
    }

    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        ...profile,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data as Profile
  },

  // Helper to sync auth user to profiles
  async createProfile(userId: string, name: string, email: string) {
    if (isLocalMode()) {
      // Profile is usually created during register, but here as fallback
      const { data } = await api.post('/profiles', { id: userId, name, email })
      return data as Profile
    }

    const { data, error } = await supabase
      .from('profiles')
      .insert([
        { id: userId, name, email }
      ])
      .select()
      .single()

    if (error) throw error
    return data as Profile
  }
}
