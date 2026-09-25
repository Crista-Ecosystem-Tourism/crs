import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, User, ChevronRight, Palette, Bell, AlertTriangle,
  Moon, Sun, Globe, LogOut, Trash2, Shield, Link2, Check,
} from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Sidebar } from '@/components/layout/Sidebar'
import { AppFrame } from '@/components/layout/AppFrame'
import { GlassPanel, IconButton, DisplayTitle } from '@/components/ui/glass'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { getSettingsCopy } from '@/lib/settingsCopy'

/* ------------------------------------------------------------- секции */

function SettingsSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="mb-8">
      <div className="mb-3 flex items-center gap-2.5 px-1">
        <span className="text-text-muted [&_svg]:h-4 [&_svg]:w-4">{icon}</span>
        <h2 className="font-sans text-xs font-semibold uppercase tracking-wide text-text-muted">
          {title}
        </h2>
      </div>
      <GlassPanel className="divide-y divide-hairline overflow-hidden p-0">
        {children}
      </GlassPanel>
    </section>
  )
}

function SettingsRow({
  label,
  description,
  value,
  onClick,
  children,
}: {
  label: string
  description?: string
  value?: string
  onClick?: () => void
  children?: React.ReactNode
}) {
  const content = (
    <>
      <span className="min-w-0 flex-1 text-left">
        <span className="block font-sans text-sm font-medium text-text">{label}</span>
        {description && (
          <span className="mt-0.5 block font-sans text-xs leading-relaxed text-text-muted">
            {description}
          </span>
        )}
      </span>
      {children ? (
        <span className="ml-6 shrink-0">{children}</span>
      ) : (
        <span className="ml-6 flex shrink-0 items-center gap-3">
          {value && <span className="font-sans text-sm text-text-secondary">{value}</span>}
          {onClick && (
            <ChevronRight
              className="h-4 w-4 text-text-muted transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          )}
        </span>
      )}
    </>
  )

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="group flex w-full items-center justify-between px-5 py-4 transition-colors hover:bg-panel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
      >
        {content}
      </button>
    )
  }

  return <div className="flex items-center justify-between px-5 py-4">{content}</div>
}

/* ------------------------------------------------------ удаление аккаунта */

function DeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  copy,
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  copy: ReturnType<typeof getSettingsCopy>
}) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-ink-950/80 p-4 backdrop-blur-sm [animation:overlay-in_200ms_var(--ease-out)]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-title"
    >
      <div
        className="w-full max-w-sm rounded-xl border border-hairline bg-ink-850 p-6 shadow-lg [animation:dialog-in_220ms_var(--ease-out)]"
        onClick={(e) => e.stopPropagation()}
        style={{ transform: 'none' }}
      >
        <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-error/15 text-error">
          <AlertTriangle className="h-7 w-7" aria-hidden="true" />
        </span>
        <h2 id="delete-title" className="mb-2 text-center font-display text-2xl font-semibold text-text">
          {copy.deleteAccountTitle}
        </h2>
        <p className="mb-6 text-center font-sans text-sm leading-relaxed text-text-secondary">
          {copy.deleteAccountWarning}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary" onClick={onClose}>
            {copy.cancel}
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            {copy.delete}
          </Button>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------- страница */

export function SettingsPage() {
  const navigate = useNavigate()
  const { user, theme, toggleTheme, language, setLanguage, logout } = useApp()
  const copy = getSettingsCopy(language)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(false)
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

  const themeOptions = [
    { key: 'dark' as const, label: copy.dark, hint: copy.darkHint, icon: Moon },
    { key: 'light' as const, label: copy.light, hint: copy.lightHint, icon: Sun },
  ]

  return (
    <div className="flex h-screen w-screen overflow-hidden font-sans text-text">
      <AppFrame>
        <Sidebar />

        <main className="h-full min-w-0 flex-1 overflow-y-auto">
          <div className="relative z-10">
            <div className="mx-auto flex max-w-[760px] items-center gap-3 px-5 pb-2 pt-6 sm:px-6">
              <IconButton label={copy.back} variant="ghost" size="sm" className="-ml-2" onClick={() => navigate(-1)}>
                <ArrowLeft />
              </IconButton>
              <h1 className="font-display text-2xl font-semibold text-text">{copy.title}</h1>
            </div>
          </div>

          <div className="mx-auto w-full max-w-[760px] px-5 pb-8 pt-4 sm:px-6">
            {/* Личные данные */}
            <SettingsSection icon={<User />} title={copy.personal}>
              <SettingsRow label={copy.name} value={user.name} onClick={() => {}} />
              <SettingsRow label={copy.email} value={user.email} onClick={() => {}} />
              <SettingsRow label={copy.password} value="••••••••" onClick={() => {}} />
            </SettingsSection>

            {/* Оформление */}
            <SettingsSection icon={<Palette />} title={copy.appearance}>
              <div className="grid grid-cols-2 gap-3 p-4">
                {themeOptions.map((opt) => {
                  const active = theme === opt.key
                  return (
                    <button
                      key={opt.key}
                      onClick={() => {
                        if (!active) toggleTheme()
                      }}
                      aria-pressed={active}
                      className={cn(
                        'rounded-lg border p-4 text-left transition duration-base',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                        active
                          ? 'border-primary/45 bg-primary/[0.09]'
                          : 'border-hairline bg-panel hover:bg-panel-2'
                      )}
                    >
                      <span className="mb-3 flex items-center justify-between">
                        <span
                          className={cn(
                            'flex h-9 w-9 items-center justify-center rounded-md',
                            active ? 'bg-primary/20 text-primary' : 'bg-panel-2 text-text-muted'
                          )}
                        >
                          <opt.icon className="h-[18px] w-[18px]" aria-hidden="true" />
                        </span>
                        {active && <Check className="h-4 w-4 text-primary" aria-label={copy.selected} />}
                      </span>
                      <span className="block font-sans text-sm font-medium text-text">
                        {opt.label}
                      </span>
                      <span className="mt-0.5 block font-sans text-xs text-text-muted">
                        {opt.hint}
                      </span>
                    </button>
                  )
                })}
              </div>

              <SettingsRow label={copy.language} description={copy.languageNote}>
                <Select value={language} onValueChange={(value) => setLanguage(value as 'ru' | 'en')}>
                  <SelectTrigger className="h-10 w-40 rounded-md border-hairline-2 bg-panel font-sans text-sm">
                    <Globe className="mr-2 h-4 w-4 shrink-0 text-text-muted" aria-hidden="true" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-md">
                    <SelectItem value="ru">{copy.russian}</SelectItem>
                    <SelectItem value="en">{copy.english}</SelectItem>
                  </SelectContent>
                </Select>
              </SettingsRow>
            </SettingsSection>

            {/* Приватность */}
            <SettingsSection icon={<Shield />} title={copy.privacy}>
              <SettingsRow
                label={copy.publicProfile}
                description={copy.publicProfileDescription}
              >
                <Switch checked={publicProfile} onCheckedChange={setPublicProfile} />
              </SettingsRow>
              <SettingsRow
                label={copy.activity}
                description={copy.activityDescription}
              >
                <Switch checked={showActivity} onCheckedChange={setShowActivity} />
              </SettingsRow>
            </SettingsSection>

            {/* Уведомления */}
            <SettingsSection icon={<Bell />} title={copy.notifications}>
              <SettingsRow
                label={copy.emailNotifications}
                description={copy.emailNotificationsDescription}
              >
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </SettingsRow>
              <SettingsRow
                label={copy.pushNotifications}
                description={copy.pushNotificationsDescription}
              >
                <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
              </SettingsRow>
            </SettingsSection>

            {/* Подключённые сервисы */}
            <SettingsSection icon={<Link2 />} title={copy.connectedServices}>
              <SettingsRow label="Яндекс" description={copy.signInAndSync}>
                <Button variant="secondary" size="sm">
                  {copy.connect}
                </Button>
              </SettingsRow>
            </SettingsSection>

            {/* Аккаунт */}
            <section className="mb-8">
              <div className="mb-3 flex items-center gap-2.5 px-1">
                <AlertTriangle className="h-4 w-4 text-text-muted" aria-hidden="true" />
                <h2 className="font-sans text-xs font-semibold uppercase tracking-wide text-text-muted">
                  {copy.account}
                </h2>
              </div>
              <GlassPanel className="divide-y divide-hairline overflow-hidden p-0">
                <button
                  onClick={handleLogout}
                  className="group flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-panel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
                >
                  <LogOut className="h-4 w-4 shrink-0 text-text-muted" aria-hidden="true" />
                  <span className="font-sans text-sm font-medium text-text">{copy.logout}</span>
                </button>
                <button
                  onClick={() => setShowDeleteDialog(true)}
                  className="group flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-error/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
                >
                  <Trash2 className="h-4 w-4 shrink-0 text-error" aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="block font-sans text-sm font-medium text-error">
                      {copy.deleteAccount}
                    </span>
                    <span className="mt-0.5 block font-sans text-xs text-text-muted">
                      {copy.deleteAccountDescription}
                    </span>
                  </span>
                </button>
              </GlassPanel>
            </section>

            <DisplayTitle as="h2" className="sr-only">
              {copy.pageLabel}
            </DisplayTitle>
          </div>
        </main>
      </AppFrame>

      <DeleteDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        copy={copy}
        onConfirm={() => {
          setShowDeleteDialog(false)
          logout()
          navigate('/')
        }}
      />
    </div>
  )
}
