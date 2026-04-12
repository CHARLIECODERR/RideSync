import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { communityService, Community, CommunityMember } from '../services/communityService'

interface CommunityState {
  communities: Community[]
  activeCommunity: Community | null
  activeMembers: CommunityMember[]
  userRole: 'Admin' | 'Arranger' | 'Rider' | null
  isLoading: boolean
  error: string | null

  // Actions
  fetchCommunities: () => Promise<void>
  loadCommunity: (id: string) => Promise<void>
  createCommunity: (name: string, description: string) => Promise<Community | null>
  joinCommunity: (id: string) => Promise<void>
  leaveCommunity: (id: string) => Promise<void>
  updateMemberRole: (userId: string, role: 'Admin' | 'Arranger' | 'Rider') => Promise<void>
  
  // Helpers
  isAdmin: () => boolean
  isArranger: () => boolean
}

const useCommunityStore = create<CommunityState>((set, get) => ({
  communities: [],
  activeCommunity: null,
  activeMembers: [],
  userRole: null,
  isLoading: false,
  error: null,

  fetchCommunities: async () => {
    set({ isLoading: true, error: null })
    try {
      const communities = await communityService.listCommunities()
      set({ communities, isLoading: false })
    } catch (e: any) {
      set({ error: e.message, isLoading: false })
    }
  },

  loadCommunity: async (id) => {
    set({ isLoading: true, error: null, activeCommunity: null, activeMembers: [], userRole: null })
    try {
      const [community, members, role] = await Promise.all([
        communityService.getCommunity(id),
        communityService.getMembers(id),
        communityService.getMyRole(id)
      ])
      set({ 
        activeCommunity: community, 
        activeMembers: members, 
        userRole: role,
        isLoading: false 
      })
    } catch (e: any) {
      set({ error: e.message, isLoading: false })
    }
  },

  createCommunity: async (name, description) => {
    set({ isLoading: true, error: null })
    try {
      const community = await communityService.createCommunity(name, description)
      set((state) => ({ 
        communities: [community, ...state.communities], 
        isLoading: false 
      }))
      return community
    } catch (e: any) {
      set({ error: e.message, isLoading: false })
      return null
    }
  },

  joinCommunity: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('Unauthorized')

      await communityService.addMember(id, userData.user.id, 'Rider')
      await get().loadCommunity(id)
    } catch (e: any) {
      set({ error: e.message, isLoading: false })
    }
  },

  leaveCommunity: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await communityService.leaveCommunity(id)
      await get().loadCommunity(id)
    } catch (e: any) {
      set({ error: e.message, isLoading: false })
    }
  },

  updateMemberRole: async (userId, role) => {
    const { activeCommunity } = get()
    if (!activeCommunity) return

    try {
      await communityService.updateMemberRole(activeCommunity.id, userId, role)
      set((state) => ({
        activeMembers: state.activeMembers.map(m => 
          m.user_id === userId ? { ...m, role } : m
        )
      }))
    } catch (e: any) {
      set({ error: e.message })
    }
  },

  isAdmin: () => get().userRole === 'Admin',
  isArranger: () => get().userRole === 'Arranger' || get().userRole === 'Admin'
}))

export default useCommunityStore
