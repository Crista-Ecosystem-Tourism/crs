import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useApp } from '@/context/AppContext'
import { getAuthCopy } from '@/lib/settingsCopy'

type Tab = 'login' | 'register'

export function AuthModal() {
  const { activeModal, closeModal, loginWithEmail, registerWithEmail, authLoading, language } = useApp()
  const copy = getAuthCopy(language)
  const isOpen = activeModal === 'auth'

  const [tab, setTab] = useState<Tab>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const reset = () => {
    setEmail('')
    setPassword('')
    setName('')
    setError('')
  }

  const switchTab = (t: Tab) => {
    setTab(t)
    setError('')
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password) {
      setError(copy.requiredCredentials)
      return
    }
    try {
      await loginWithEmail(email.trim(), password)
      reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.loginError)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!name.trim()) { setError(copy.requiredName); return }
    if (!email.trim()) { setError(copy.requiredEmail); return }
    if (password.length < 6) { setError(copy.shortPassword); return }
    try {
      await registerWithEmail(email.trim(), password, name.trim())
      reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.registerError)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => { closeModal(); reset() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            {tab === 'login' ? copy.loginTitle : copy.registerTitle}
          </DialogTitle>
          <DialogDescription className="text-center">
            {tab === 'login'
              ? copy.loginDescription
              : copy.registerDescription}
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex rounded-lg bg-surface-hover/50 p-1 gap-1">
          <button
            onClick={() => switchTab('login')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              tab === 'login' ? 'bg-surface text-text shadow-sm' : 'text-text-muted hover:text-text'
            }`}
          >
            {copy.loginTab}
          </button>
          <button
            onClick={() => switchTab('register')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              tab === 'register' ? 'bg-surface text-text shadow-sm' : 'text-text-muted hover:text-text'
            }`}
          >
            {copy.registerTab}
          </button>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-sm text-red-400"
          >
            {error}
          </motion.div>
        )}

        {tab === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-3 py-2">
            <Input
              placeholder={copy.email}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={authLoading}
              className="h-11"
            />
            <Input
              placeholder={copy.password}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={authLoading}
              className="h-11"
            />
            <Button
              type="submit"
              disabled={authLoading}
              className="w-full h-11"
            >
              {authLoading ? copy.loggingIn : copy.login}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-3 py-2">
            <Input
              placeholder={copy.name}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={authLoading}
              className="h-11"
            />
            <Input
              placeholder={copy.email}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={authLoading}
              className="h-11"
            />
            <Input
              placeholder={copy.passwordHint}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={authLoading}
              className="h-11"
            />
            <Button
              type="submit"
              disabled={authLoading}
              className="w-full h-11"
            >
              {authLoading ? copy.creating : copy.createAccount}
            </Button>
          </form>
        )}

        <div className="text-center">
          <p className="text-xs text-text-muted">
            {copy.termsLead}{' '}
            <a href="#" className="text-primary hover:underline">
              {copy.terms}
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
