import { supabase } from '@/lib/supabase'

export interface Profile {
  id: string
  name: string | null
  email: string | null
  avatar_url: string | null
  updated_at?: string
}

export const authService = {
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data as Profile
  },

  async updateProfile(profile: Partial<Profile> & { id: string }) {
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
