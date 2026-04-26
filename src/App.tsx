import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import PWAInstallPrompt from '@/components/pwa/PWAInstallPrompt'
import LandingPage from '@/pages/LandingPage'
import DashboardPage from '@/pages/DashboardPage'
import RidesPage from '@/features/rides/pages/RidesPage'
import RideDetailPage from '@/features/rides/pages/RideDetailPage'
import CreateRidePage from '@/features/rides/pages/CreateRidePage'
import CommunitiesPage from '@/features/community/pages/CommunitiesPage'
import CommunityDetailPage from '@/features/community/pages/CommunityDetailPage'
import AuthPage from '@/features/auth/pages/AuthPage'
import ProfilePage from '@/features/auth/pages/ProfilePage'
import AuthCallbackPage from '@/features/auth/pages/AuthCallbackPage'
import JoinPage from '@/pages/JoinPage'
import ProtectedRoute from '@/features/auth/components/ProtectedRoute'

import { useAuth } from '@/features/auth/hooks/useAuth'
import { useThemeStore } from '@/store/themeStore'
import { useEffect } from 'react'

function App() {
  const { isInitialized } = useAuth()
  const { theme } = useThemeStore()

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
  }, [theme])

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-indigo-royal flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-saffron-vibrant/30 border-t-saffron-vibrant rounded-full animate-spin" />
          <p className="text-white/50 font-black tracking-widest uppercase text-xs">Syncing with Bharat...</p>
        </div>
      </div>
    )
  }

  return (
    <>
    <PWAInstallPrompt />
    <Routes>
      <Route path="/" element={<LandingPage />} />
      
      <Route element={<Layout />}>
        <Route element={<ProtectedRoute />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="rides" element={<RidesPage />} />
          <Route path="ride/:id" element={<RideDetailPage />} />
          <Route path="create-ride" element={<CreateRidePage />} />
          <Route path="communities" element={<CommunitiesPage />} />
          <Route path="communities/:id" element={<CommunityDetailPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="join" element={<JoinPage />} />
        </Route>

      </Route>
      
      {/* Auth routes */}
      <Route path="/login" element={<AuthPage />} />
      <Route path="/signup" element={<AuthPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  )
}

export default App
