import { supabase } from '@/lib/supabase'
import { api, isLocalMode } from '@/lib/api'


export interface Community {
  id: string
  name: string
  description: string | null
  created_by: string | null
  join_code?: string
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
    if (isLocalMode()) {
      const { data } = await api.get('/communities')
      return data
    }

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
    if (isLocalMode()) {
      const { data } = await api.get(`/communities/${id}`)
      return data
    }

    const { data, error } = await supabase
      .from('communities')
      .select(`
        *,
        members:community_members(count),
        rides:rides(count)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return {
      ...data,
      members_count: data.members?.[0]?.count || 0,
      rides_count: data.rides?.[0]?.count || 0
    } as Community
  },

  async createCommunity(name: string, description: string) {
    if (isLocalMode()) {
      const { data } = await api.post('/communities', { name, description })
      return data as Community
    }

    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error('Authorized')

    const joinCode = crypto.randomUUID().split('-')[0].toUpperCase()

    // 1. Create community (Trigger on_community_created will add creator as Admin)
    const { data, error } = await supabase
      .from('communities')
      .insert([{ 
        name, 
        description, 
        created_by: userData.user.id,
        join_code: joinCode
      }])
      .select()
      .single()

    if (error) {
      console.error('Supabase Create Community Error:', error)
      throw new Error(`Database Conflict: ${error.message}. Please try a different name or refresh.`)
    }
    return data as Community
  },

  async addMember(communityId: string, userId: string, role: 'Admin' | 'Arranger' | 'Rider' = 'Rider') {
    if (isLocalMode()) {
      const { data } = await api.post(`/communities/${communityId}/members`, { userId, role })
      return data
    }

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
    if (isLocalMode()) {
      await api.delete(`/communities/${communityId}/members/me`)
      return
    }

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
    if (isLocalMode()) {
      const { data } = await api.get(`/communities/${communityId}/members`)
      return data
    }

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
    if (isLocalMode()) {
      const { data } = await api.patch(`/communities/${communityId}/members/${userId}`, { role })
      return data
    }

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

  async removeMember(communityId: string, userId: string) {
    if (isLocalMode()) {
      await api.delete(`/communities/${communityId}/members/${userId}`);
      return;
    }
    const { error } = await supabase
      .from('community_members')
      .delete()
      .eq('community_id', communityId)
      .eq('user_id', userId)

    if (error) throw error
  },

  async addMemberByEmail(communityId: string, email: string) {
    if (isLocalMode()) {
      const { data } = await api.post(`/communities/${communityId}/members`, { email });
      return data;
    }
    throw new Error('Action only supported in local mode currently.');
  },

  async getMyRole(communityId: string) {

    if (isLocalMode()) {
      try {
        const { data } = await api.get(`/communities/${communityId}/members/me`)
        return data.role as 'Admin' | 'Arranger' | 'Rider'
      } catch (err) {
        return null
      }
    }

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
  },

  async joinCommunityByCode(code: string) {
    if (isLocalMode()) {
       const { data } = await api.post('/communities/join', { code });
       return data;
    }
    // Supabase logic (can be added if needed, but primary focus is local)
    const { data, error } = await supabase
      .from('communities')
      .select('id')
      .eq('join_code', code)
      .single();
    
    if (error) throw error;
    return this.addMember(data.id, (await supabase.auth.getUser()).data.user?.id || '');
  }
}


