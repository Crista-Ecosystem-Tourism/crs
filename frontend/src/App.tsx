import { AppProvider } from '@/context/AppContext'
import { MainLayout } from '@/components/layout/MainLayout'

import { Routes, Route } from 'react-router-dom'
import { LoginForm } from '@/components/auth/LoginForm'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { ProfilePage } from '@/components/profile/ProfilePage'
import { SettingsPage } from '@/components/settings/SettingsPage'
import { SupportPage } from '@/components/support/SupportPage'

function App() {
  return (
    <AppProvider>
      <Routes>
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
