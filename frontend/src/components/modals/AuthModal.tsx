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

type Tab = 'login' | 'register'

export function AuthModal() {
  const { activeModal, closeModal, loginWithEmail, registerWithEmail, authLoading } = useApp()
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
      setError('Введите email и пароль')
      return
    }
    try {
      await loginWithEmail(email.trim(), password)
      reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка входа')
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!name.trim()) { setError('Введите имя'); return }
    if (!email.trim()) { setError('Введите email'); return }
    if (password.length < 6) { setError('Пароль минимум 6 символов'); return }
    try {
      await registerWithEmail(email.trim(), password, name.trim())
      reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка регистрации')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => { closeModal(); reset() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            {tab === 'login' ? 'Войдите, чтобы продолжить' : 'Создайте аккаунт'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {tab === 'login'
              ? 'Войдите, чтобы сохранить маршрут и получить персональные рекомендации'
              : 'Регистрация бесплатна и займёт несколько секунд'}
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
            Вход
          </button>
          <button
            onClick={() => switchTab('register')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              tab === 'register' ? 'bg-surface text-text shadow-sm' : 'text-text-muted hover:text-text'
            }`}
          >
            Регистрация
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
              placeholder="Эл. почта"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={authLoading}
              className="h-11"
            />
            <Input
              placeholder="Пароль"
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
              {authLoading ? 'Входим...' : 'Войти'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-3 py-2">
            <Input
              placeholder="Ваше имя"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={authLoading}
              className="h-11"
            />
            <Input
              placeholder="Эл. почта"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={authLoading}
              className="h-11"
            />
            <Input
              placeholder="Пароль (мин. 6 символов)"
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
              {authLoading ? 'Создаём...' : 'Создать аккаунт'}
            </Button>
          </form>
        )}

        <div className="text-center">
          <p className="text-xs text-text-muted">
            Нажимая кнопку, вы соглашаетесь с{' '}
            <a href="#" className="text-primary hover:underline">
              условиями использования
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
