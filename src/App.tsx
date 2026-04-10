import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import DashboardPage from '@/pages/DashboardPage'
import RidesPage from '@/features/rides/pages/RidesPage'
import CreateRidePage from '@/features/rides/pages/CreateRidePage'
import CommunitiesPage from '@/features/community/pages/CommunitiesPage'
import AuthPage from '@/features/auth/pages/AuthPage'
import ProtectedRoute from '@/features/auth/components/ProtectedRoute'
import { useAuth } from '@/features/auth/hooks/useAuth'

function App() {
  const { isInitialized } = useAuth()

  // Prevent flicker/redirect while checking for initial session
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground font-bold tracking-widest uppercase text-xs">Initializing RideSync...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="rides" element={<RidesPage />} />
          <Route path="create-ride" element={<CreateRidePage />} />
          <Route path="communities" element={<CommunitiesPage />} />
          <Route path="profile" element={<div>Profile Page Placeholder</div>} />
          <Route path="join" element={<div>Join Ride Page Placeholder</div>} />
        </Route>
      </Route>
      
      {/* Auth routes */}
      <Route path="/login" element={<AuthPage />} />
      <Route path="/signup" element={<AuthPage />} />
      
      {/* Compatibility redirect for old /auth path */}
      <Route path="/auth" element={<Navigate to="/login" replace />} />
      
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
