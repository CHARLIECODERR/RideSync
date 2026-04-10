import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { authService, Profile } from '../services/authService'

interface AuthState {
  user: Profile | null
  isAuthenticated: boolean
  isLoading: boolean
  isInitialized: boolean
  error: string | null
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>
  signup: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  clearError: () => void
  initAuth: () => Promise<void>
}

const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,

  initAuth: async () => {
    // Only initialize once
    if (get().isInitialized) return

    set({ isLoading: true })
    
    // 1. Get initial session
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session?.user) {
      try {
        const profile = await authService.getProfile(session.user.id)
        set({ user: profile, isAuthenticated: true })
      } catch (e) {
        console.error('Failed to fetch profile during init', e)
      }
    }

    set({ isInitialized: true, isLoading: false })

    // 2. Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event)
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          try {
            const profile = await authService.getProfile(session.user.id)
            set({ user: profile, isAuthenticated: true, isLoading: false })
          } catch (e) {
            console.error('Failed to sync profile', e)
          }
        }
      }

      if (event === 'SIGNED_OUT') {
        set({ user: null, isAuthenticated: false, isLoading: false })
      }
    })
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null })
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      set({ error: error.message, isLoading: false })
      return false
    }

    if (data.user) {
      try {
        const profile = await authService.getProfile(data.user.id)
        set({ user: profile, isAuthenticated: true, isLoading: false })
        return true
      } catch (e) {
        set({ error: 'Failed to load user profile', isLoading: false })
        return false
      }
    }

    return false
  },

  signup: async (name, email, password) => {
    set({ isLoading: true, error: null })
    
    // 1. Auth Signup
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name }
      }
    })

    if (error) {
      set({ error: error.message, isLoading: false })
      return false
    }

    // 2. Create Profile entry
    if (data.user) {
      try {
        const profile = await authService.createProfile(data.user.id, name, email)
        set({ user: profile, isAuthenticated: true, isLoading: false })
        return true
      } catch (e) {
        console.error('Profile creation failed', e)
        // Note: The auth user exists now, but profile failed. 
        // In a real app, you might want a trigger in Supabase instead.
        set({ error: 'Account created, but profile setup failed. Please contact support.', isLoading: false })
        return false
      }
    }

    return false
  },

  logout: async () => {
    set({ isLoading: true })
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Logout error', error)
    }
    set({ user: null, isAuthenticated: false, isLoading: false })
  },

  clearError: () => set({ error: null }),
}))

export default useAuthStore
