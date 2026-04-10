import { create } from 'zustand'
import { mockCommunities } from '@/lib/mockData'

export interface Community {
  id: string
  name: string
  description?: string
  members: number
  rides: number
  role?: 'Admin' | 'Arranger' | 'Rider'
  created_by?: string
  created_at?: string
  tags?: string[]
}

interface CommunityState {
  communities: Community[]
  isLoading: boolean
  fetchCommunities: () => Promise<void>
  createCommunity: (communityData: Partial<Community>) => Promise<Community>
  joinCommunity: (communityId: string) => Promise<void>
  getCommunity: (id: string) => Community | undefined
}

const useCommunityStore = create<CommunityState>((set, get) => ({
  communities: [...mockCommunities] as Community[],
  isLoading: false,

  fetchCommunities: async () => {
    set({ isLoading: true })
    await new Promise(resolve => setTimeout(resolve, 600))
    set({ isLoading: false })
  },

  createCommunity: async (communityData) => {
    set({ isLoading: true })
    await new Promise(resolve => setTimeout(resolve, 800))

    const newCommunity: Community = {
      id: 'comm-' + Date.now(),
      name: communityData.name || 'New Community',
      members: 1,
      rides: 0,
      role: 'Admin',
      created_by: 'user-1',
      created_at: new Date().toISOString(),
      tags: communityData.tags || [],
      ...communityData,
    }

    set((state) => ({
      communities: [newCommunity, ...state.communities],
      isLoading: false,
    }))

    return newCommunity
  },

  joinCommunity: async (communityId) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    set((state) => ({
      communities: state.communities.map(c =>
        c.id === communityId ? { ...c, members: c.members + 1, role: 'Rider' } : c
      ),
    }))
  },

  getCommunity: (id) => {
    return get().communities.find(c => c.id === id)
  },
}))

export default useCommunityStore
