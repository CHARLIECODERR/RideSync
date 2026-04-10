import { Navigate, Outlet } from 'react-router-dom'
import useAuthStore from '@/features/auth/store/authStore'
import { ReactNode } from 'react'

interface ProtectedRouteProps {
  children?: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuthStore()

  // Although App.tsx handles isInitialized, it's safe to have a secondary check here
  if (isLoading) {
    return null // or a small spinner
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children ? <>{children}</> : <Outlet />
}
