import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { api, isLocalMode } from '@/lib/api'
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
  loginWithGoogle: () => void
  updateProfile: (data: Partial<Profile>) => Promise<void>
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
    if (get().isInitialized) return
    set({ isLoading: true })
    
    if (isLocalMode()) {
      const token = localStorage.getItem('ridesync_token');
      if (token) {
        try {
          const { data } = await api.get('/auth/me');
          set({ user: data.user, isAuthenticated: true });
        } catch (err) {
          localStorage.removeItem('ridesync_token');
          localStorage.removeItem('ridesync_user');
        }
      }
      set({ isInitialized: true, isLoading: false });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const profile = await authService.getProfile(session.user.id)
        set({ user: profile, isAuthenticated: true })
      }
    } catch (e) {
      console.error('Supabase init failed', e)
    } finally {
      set({ isInitialized: true, isLoading: false })
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null })
    
    if (isLocalMode()) {
      try {
        const { data } = await api.post('/auth/login', { email, password });
        localStorage.setItem('ridesync_token', data.token);
        localStorage.setItem('ridesync_user', JSON.stringify(data.user));
        set({ user: data.user, isAuthenticated: true, isLoading: false });
        return true;
      } catch (err: any) {
        set({ error: err.response?.data?.error || 'Login failed', isLoading: false });
        return false;
      }
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      set({ error: error.message, isLoading: false })
      return false
    }

    if (data.user) {
      const profile = await authService.getProfile(data.user.id)
      set({ user: profile, isAuthenticated: true, isLoading: false })
      return true
    }
    return false
  },

  signup: async (name, email, password) => {
    set({ isLoading: true, error: null })
    
    if (isLocalMode()) {
      try {
        const { data } = await api.post('/auth/register', { name, email, password });
        localStorage.setItem('ridesync_token', data.token);
        localStorage.setItem('ridesync_user', JSON.stringify(data.user));
        set({ user: data.user, isAuthenticated: true, isLoading: false });
        return true;
      } catch (err: any) {
        set({ error: err.response?.data?.error || 'Registration failed', isLoading: false });
        return false;
      }
    }

    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password, 
      options: { data: { full_name: name } } 
    })

    if (error) {
      set({ error: error.message, isLoading: false })
      return false
    }

    if (data.user) {
      // The profile is automatically created by the DB trigger 'on_auth_user_created'.
      // We simply fetch the existing account intel to update our local session.
      const profile = await authService.getProfile(data.user.id)
      set({ user: profile, isAuthenticated: true, isLoading: false })
      return true
    }
    return false
  },

  loginWithGoogle: () => {
    if (isLocalMode()) {
      window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/google`;
    } else {
      supabase.auth.signInWithOAuth({ provider: 'google' });
    }
  },

  logout: async () => {
    set({ isLoading: true })
    if (isLocalMode()) {
      localStorage.removeItem('ridesync_token');
      localStorage.removeItem('ridesync_user');
    } else {
      await supabase.auth.signOut()
    }
    set({ user: null, isAuthenticated: false, isLoading: false })
  },

  updateProfile: async (updateData: Partial<Profile>) => {
    set({ isLoading: true, error: null })
    if (isLocalMode()) {
       try {
         const { data } = await api.patch('/auth/profile', updateData);
         set({ user: data.user, isLoading: false });
         localStorage.setItem('ridesync_user', JSON.stringify(data.user));
       } catch (err: any) {
         set({ error: err.response?.data?.error || 'Update failed', isLoading: false });
         throw err;
       }
    }
  },

  clearError: () => set({ error: null }),

}))

export default useAuthStore
