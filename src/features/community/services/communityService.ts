import { supabase } from '@/lib/supabase'

export interface Community {
  id: string
  name: string
  description: string | null
  created_by: string | null
  created_at: string
  members_count?: number
  rides_count?: number
  user_role?: 'Admin' | 'Arranger' | 'Rider'
}

export interface CommunityMember {
  community_id: string
  user_id: string
  role: 'Admin' | 'Arranger' | 'Rider'
  joined_at: string
  user_profile?: {
    name: string
    avatar_url: string
  }
}

export const communityService = {
  async listCommunities() {
    const { data, error } = await supabase
      .from('communities')
      .select(`
        *,
        members:community_members(count),
        rides:rides(count)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data.map(c => ({
      ...c,
      members_count: c.members?.[0]?.count || 0,
      rides_count: c.rides?.[0]?.count || 0
    })) as Community[]
  },

  async getCommunity(id: string) {
    const { data, error } = await supabase
      .from('communities')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as Community
  },

  async createCommunity(name: string, description: string) {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error('Unauthorized')

    // 1. Create community
    const { data, error } = await supabase
      .from('communities')
      .insert([{ 
        name, 
        description, 
        created_by: userData.user.id 
      }])
      .select()
      .single()

    if (error) throw error

    // 2. Add creator as Admin
    await this.addMember(data.id, userData.user.id, 'Admin')

    return data as Community
  },

  async addMember(communityId: string, userId: string, role: 'Admin' | 'Arranger' | 'Rider' = 'Rider') {
    const { data, error } = await supabase
      .from('community_members')
      .insert([{ 
        community_id: communityId, 
        user_id: userId, 
        role 
      }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async leaveCommunity(communityId: string) {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error('Unauthorized')

    const { error } = await supabase
      .from('community_members')
      .delete()
      .eq('community_id', communityId)
      .eq('user_id', userData.user.id)

    if (error) throw error
  },

  async getMembers(communityId: string) {
    const { data, error } = await supabase
      .from('community_members')
      .select(`
        *,
        user_profile:profiles(name, avatar_url)
      `)
      .eq('community_id', communityId)

    if (error) throw error
    return data as (CommunityMember & { user_profile: { name: string, avatar_url: string } })[]
  },

  async updateMemberRole(communityId: string, userId: string, role: 'Admin' | 'Arranger' | 'Rider') {
    const { data, error } = await supabase
      .from('community_members')
      .update({ role })
      .eq('community_id', communityId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getMyRole(communityId: string) {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return null

    const { data, error } = await supabase
      .from('community_members')
      .select('role')
      .eq('community_id', communityId)
      .eq('user_id', userData.user.id)
      .single()

    if (error) return null
    return data.role as 'Admin' | 'Arranger' | 'Rider'
  }
}
