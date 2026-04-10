import { useEffect } from 'react'
import useAuthStore from '../store/authStore'

export const useAuth = () => {
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    isInitialized,
    error, 
    login, 
    signup, 
    logout, 
    clearError,
    initAuth
  } = useAuthStore()

  // Auto-initialize auth on hook use (usually once at app root)
  useEffect(() => {
    if (!isInitialized) {
      initAuth()
    }
  }, [isInitialized, initAuth])

  return {
    user,
    isAuthenticated,
    isLoading,
    isInitialized,
    error,
    login,
    signup,
    logout,
    clearError
  }
}

export default useAuth
