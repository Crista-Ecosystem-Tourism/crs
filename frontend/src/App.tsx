import { AppProvider } from '@/context/AppContext'
import { MainLayout } from '@/components/layout/MainLayout'
import { AppBackdrop } from '@/components/layout/AppBackdrop'

import { Routes, Route, useParams } from 'react-router-dom'
import { LoginForm } from '@/components/auth/LoginForm'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { ProfilePage } from '@/components/profile/ProfilePage'
import { SettingsPage } from '@/components/settings/SettingsPage'
import { SupportPage } from '@/components/support/SupportPage'
import { PublicTripMiniSite } from '@/components/trips/PublicTripMiniSite'

function PublicTripRoute() {
  const { slug = '' } = useParams()
  return <PublicTripMiniSite slug={slug} />
}

function App() {
  return (
    <AppProvider>
      {/* Фон общий для всех маршрутов, а не только для главной */}
      <AppBackdrop />
      <Routes>
        <Route path="/t/:slug" element={<PublicTripRoute />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<RegisterForm />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/*" element={<MainLayout />} />
      </Routes>
    </AppProvider>
  )
}

export default App
