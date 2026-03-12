import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, User, ChevronRight, Palette, Bell, AlertTriangle,
  Moon, Sun, Globe, LogOut, Trash2, Shield, Link2, Check
} from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Sidebar } from '@/components/layout/Sidebar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface SettingsSectionProps {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
  delay?: number
}

function SettingsSection({ icon, title, children, delay = 0 }: SettingsSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="mb-10"
    >
      <div className="flex items-center gap-3 mb-4 px-2">
        <span className="text-[#666666]">{icon}</span>
        <h3 className="text-[0.75rem] font-bold text-[#666666] uppercase tracking-[0.2em]">
          {title}
        </h3>
      </div>
      <div className="bg-white rounded-[32px] border border-black/[0.06] divide-y divide-black/[0.03] overflow-hidden shadow-[0_12px_45px_rgb(0,0,0,0.04)]">
        {children}
      </div>
    </motion.div>
  )
}

interface SettingsRowProps {
  label: string
  description?: string
  value?: string
  onClick?: () => void
  children?: React.ReactNode
}

function SettingsRow({ label, description, value, onClick, children }: SettingsRowProps) {
  const content = (
    <>
      <div className="flex-1 min-w-0 text-left">
        <p className="text-[1rem] font-bold text-[#1a1a1a] tracking-tight">{label}</p>
        {description && (
          <p className="text-[0.8rem] font-medium text-[#888888] mt-1">{description}</p>
        )}
      </div>
      {children ? (
        <div className="flex-shrink-0 ml-6">
          {children}
        </div>
      ) : (
        <div className="flex items-center gap-3 flex-shrink-0 ml-6">
          {value && <span className="text-[0.95rem] font-medium text-[#999999]">{value}</span>}
          {onClick && <ChevronRight className="w-4 h-4 text-[#dddddd] group-hover:text-black transition-colors" />}
        </div>
      )}
    </>
  )

  if (onClick) {
    return (
      <motion.button
        whileHover={{ backgroundColor: 'rgba(0,0,0,0.005)' }}
        onClick={onClick}
        className="w-full flex items-center justify-between px-10 py-7 group transition-all"
      >
        {content}
      </motion.button>
    )
  }

  return (
    <div className="flex items-center justify-between px-10 py-7">
      {content}
    </div>
  )
}


function DeleteDialog({ isOpen, onClose, onConfirm }: { isOpen: boolean; onClose: () => void; onConfirm: () => void }) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/40 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-[32px] border border-black/[0.05] p-8 max-w-sm w-full shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-[#1a1a1a] text-center mb-2">
            Удалить аккаунт?
          </h3>
          <p className="text-[0.9rem] font-medium text-[#888888] text-center mb-8 leading-relaxed">
            Это действие нельзя отменить. Все ваши данные и маршруты будут удалены навсегда.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-12 rounded-2xl border-black/[0.05] font-bold"
              onClick={onClose}
            >
              Отмена
            </Button>
            <Button
              className="h-12 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold"
              onClick={onConfirm}
            >
              Удалить
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export function SettingsPage() {
  const navigate = useNavigate()
  const { user, theme, toggleTheme, logout } = useApp()
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(false)
  const [language, setLanguage] = useState('ru')
  const [publicProfile, setPublicProfile] = useState(true)
  const [showActivity, setShowActivity] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  if (!user) {
    navigate('/login')
    return null
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleDeleteAccount = () => {
    setShowDeleteDialog(false)
    logout()
    navigate('/')
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#fafafa] text-[#1a1a1a] font-sans selection:bg-primary/10">
      {/* Mesh Gradient Background */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_0%_0%,_#f0f4ff_0%,_transparent_50%),radial-gradient(circle_at_100%_100%,_#fdf2f8_0%,_transparent_50%),radial-gradient(circle_at_100%_0%,_#f0fdf4_0%,_transparent_50%)] opacity-80" />

      <div className="flex h-full relative z-10">
        <Sidebar />

        <main className="flex-1 relative h-full min-w-0 overflow-auto scrollbar-hide">
          {/* Top Navigation Bar */}
          <div className="sticky top-0 z-30 bg-white/40 backdrop-blur-xl border-b border-black/[0.03]">
            <div className="max-w-3xl mx-auto px-10 h-20 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <button
                  onClick={() => navigate(-1)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-black/[0.05] shadow-sm hover:bg-black/[0.02] transition-all"
                >
                  <ArrowLeft className="w-5 h-5 text-[#1a1a1a]" />
                </button>
                <h1 className="text-[1.2rem] font-bold tracking-tight">Настройки</h1>
              </div>
            </div>
          </div>

          <div className="max-w-3xl mx-auto px-6 py-12">
            <SettingsSection
              icon={<User className="w-4 h-4" />}
              title="Личные данные"
              delay={0}
            >
              <SettingsRow label="Имя" value={user.name} onClick={() => { }} />
              <SettingsRow label="Email" value={user.email} onClick={() => { }} />
              <SettingsRow label="Пароль" value="••••••••" onClick={() => { }} />
            </SettingsSection>

            <SettingsSection
              icon={<Palette className="w-4 h-4" />}
              title="Внешний вид"
              delay={0.1}
            >
              <div className="px-10 py-8">
                <span className="text-[0.8rem] font-bold text-[#888888] uppercase tracking-[0.15em] mb-6 block">Тема оформления</span>
                <div className="grid grid-cols-2 gap-8">
                  <motion.button
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => theme === 'dark' && toggleTheme()}
                    className={`relative p-5 rounded-[28px] border-2 transition-all ${theme === 'light'
                        ? 'border-[#1a1a1a] bg-white shadow-xl px-12'
                        : 'border-black/[0.08] bg-white/40 hover:border-black/20 text-[#666666]'
                      }`}
                  >
                    <div className="bg-gray-100 rounded-2xl h-24 mb-4 overflow-hidden border border-black/[0.05]">
                      <div className="p-3">
                        <div className="flex gap-2 mb-2">
                          <div className="w-4 h-4 rounded-full bg-white" />
                          <div className="w-12 h-2 rounded bg-white" />
                        </div>
                        <div className="w-full h-2 rounded bg-white mb-1" />
                        <div className="w-2/3 h-2 rounded bg-white" />
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Sun className="w-4 h-4" />
                      <span className="text-sm font-bold">Светлая</span>
                    </div>
                    {theme === 'light' && (
                      <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#1a1a1a] flex items-center justify-center shadow-lg">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => theme === 'light' && toggleTheme()}
                    className={`relative p-5 rounded-[28px] border-2 transition-all ${theme === 'dark'
                        ? 'border-white bg-[#1a1a1a] shadow-xl text-white'
                        : 'border-black/[0.08] bg-white/20 hover:border-black/20 text-[#666666]'
                      }`}
                  >
                    <div className="bg-[#1a1a1a] rounded-2xl h-24 mb-4 overflow-hidden border border-white/5 shadow-inner">
                      <div className="p-3">
                        <div className="flex gap-2 mb-2">
                          <div className="w-4 h-4 rounded-full bg-white/10" />
                          <div className="w-12 h-2 rounded bg-white/10" />
                        </div>
                        <div className="w-full h-2 rounded bg-white/10 mb-1" />
                        <div className="w-2/3 h-2 rounded bg-white/10" />
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Moon className="w-4 h-4" />
                      <span className="text-sm font-bold">Тёмная</span>
                    </div>
                    {theme === 'dark' && (
                      <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-lg">
                        <Check className="w-4 h-4 text-[#1a1a1a]" />
                      </div>
                    )}
                  </motion.button>
                </div>
              </div>
              <SettingsRow label="Язык интерфейса" description="Применится ко всем разделам">
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-40 h-11 rounded-2xl border-black/[0.1] bg-white shadow-md font-bold text-[0.85rem]">
                    <Globe className="w-4 h-4 mr-2 text-[#666666]" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-black/[0.1] p-2 shadow-2xl">
                    <SelectItem value="ru" className="rounded-xl font-medium">Русский</SelectItem>
                    <SelectItem value="en" className="rounded-xl font-medium">English</SelectItem>
                  </SelectContent>
                </Select>
              </SettingsRow>
            </SettingsSection>

            <SettingsSection
              icon={<Shield className="w-4 h-4" />}
              title="Безопасность"
              delay={0.15}
            >
              <SettingsRow
                label="Публичный профиль"
                description="Ваш профиль будет виден другим путешественникам"
              >
                <Switch checked={publicProfile} onCheckedChange={setPublicProfile} />
              </SettingsRow>
              <SettingsRow
                label="Показывать активность"
                description="Ваши маршруты будут отображаться в ленте"
              >
                <Switch checked={showActivity} onCheckedChange={setShowActivity} />
              </SettingsRow>
            </SettingsSection>

            <SettingsSection
              icon={<Link2 className="w-4 h-4" />}
              title="Связанные аккаунты"
              delay={0.2}
            >
              <div className="px-10 py-7">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-[#FC3F1D]/5 flex items-center justify-center border border-[#FC3F1D]/10">
                      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="#FC3F1D">
                        <path d="M12 4C7.58 4 4 7.58 4 12s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm-1-10h2v4h-2zm0 6h2v2h-2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[1rem] font-bold text-[#1a1a1a]">Яндекс ID</p>
                      <p className="text-[0.85rem] font-medium text-[#888888]">ivan@yandex.ru</p>
                    </div>
                  </div>
                  <span className="px-4 py-1.5 text-[0.7rem] font-bold bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 uppercase tracking-widest shadow-sm">
                    Активен
                  </span>
                </div>
              </div>
              <div className="px-10 py-7">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center border border-black/[0.03]">
                      <svg className="w-7 h-7" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[1rem] font-bold text-[#1a1a1a]">Google Account</p>
                      <p className="text-[0.85rem] font-medium text-[#888888]">Не подключено</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="h-10 px-6 rounded-2xl font-bold text-[0.8rem] border-black/[0.1] bg-white shadow-sm hover:bg-black/5 transition-all text-[#1a1a1a]">
                    Связать
                  </Button>
                </div>
              </div>
            </SettingsSection>

            <SettingsSection
              icon={<Bell className="w-4 h-4" />}
              title="Уведомления"
              delay={0.25}
            >
              <SettingsRow
                label="Email-рассылка"
                description="Акции, советы и рекомендации для поездок"
              >
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </SettingsRow>
              <SettingsRow
                label="Push-уведомления"
                description="Мгновенные оповещения об изменениях в планах"
              >
                <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
              </SettingsRow>
            </SettingsSection>

            <SettingsSection
              icon={<AlertTriangle className="w-4 h-4" />}
              title="Управление данными"
              delay={0.3}
            >
              <div className="p-8 space-y-4">
                <Button
                  variant="outline"
                  className="w-full h-16 justify-between px-8 rounded-3xl bg-white border-black/[0.06] text-[#1a1a1a] font-bold hover:bg-black/5 hover:border-transparent transition-all group shadow-md"
                  onClick={handleLogout}
                >
                  <div className="flex items-center gap-5">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-white transition-all border border-black/[0.05]">
                      <LogOut className="w-5 h-5 text-[#666666] group-hover:text-black transition-colors" />
                    </div>
                    <span>Выйти из аккаунта</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#aaaaaa]" />
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-16 justify-between px-8 rounded-3xl bg-white border-red-100 text-red-600 font-bold hover:bg-red-50 hover:border-transparent transition-all group shadow-md"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <div className="flex items-center gap-5">
                    <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-all border border-red-100/50">
                      <Trash2 className="w-5 h-5 text-red-500 group-hover:text-red-600 transition-colors" />
                    </div>
                    <span>Безвозвратно удалить профиль</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-red-300" />
                </Button>
              </div>
            </SettingsSection>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-16 text-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-black/[0.02] border border-black/[0.03]">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[0.7rem] font-bold text-[#aaaaaa] uppercase tracking-[0.2em]">Система работает в штатном режиме</span>
              </div>
              <p className="mt-6 text-[0.75rem] font-bold text-[#dddddd] uppercase tracking-[0.2em]">Crista Online v1.4.0</p>
              <p className="mt-2 text-[0.65rem] font-medium text-[#dddddd]">© 2025 All Rights Reserved</p>
            </motion.div>
          </div>
        </main>
      </div>

      <DeleteDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteAccount}
      />
    </div>
  )
}
