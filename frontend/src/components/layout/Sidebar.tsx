import { Link, useNavigate } from 'react-router-dom'
import {
  Plus, Moon, Sun, User,
  ChevronRight, Settings, HelpCircle, LogOut, Languages,
} from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RailButton } from './SidebarRail'

import { getInitials } from '@/lib/utils'
import { getNavigationCopy } from '@/lib/settingsCopy'

/** Desktop rail with account actions; the four primary sections live in the header. */
export function Sidebar() {
  const navigate = useNavigate()
  const {
    user,
    theme,
    toggleTheme,
    language,
    setLanguage,
    newChat,
    logout,
  } = useApp()
  const copy = getNavigationCopy(language)

  const langLabel = language === 'ru' ? copy.switchToEnglish : copy.switchToRussian
  const themeLabel = theme === 'dark' ? copy.lightTheme : copy.darkTheme
  const ThemeIcon = theme === 'dark' ? Sun : Moon

  /* ------------------------------------------------------- профиль (общий) */

  const profileMenu = user && (
    <PopoverContent side="right" align="end" className="w-64 p-0">
      <button
        onClick={() => navigate('/profile')}
        className="flex w-full items-center gap-3 rounded-t-2xl p-4 transition-colors hover:bg-surface-hover"
      >
        <Avatar className="h-10 w-10 border border-border">
          <AvatarImage src={user.avatar} />
          <AvatarFallback className="bg-surface-light text-text-secondary">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 text-left">
          <p className="text-sm font-semibold text-text">{user.name}</p>
          <p className="text-xs text-text-muted">
            {user.subscription === 'premium' ? copy.premium : copy.freePlan}
          </p>
        </div>
        <ChevronRight className="h-4 w-4 text-text-muted" />
      </button>

      <div className="border-t border-border" />

      <div className="p-2">
        <button
          onClick={() => navigate('/settings')}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-text transition-colors hover:bg-surface-hover"
        >
          <Settings className="h-4 w-4 text-text-muted" />
          {copy.accountSettings}
        </button>
        <button
          onClick={() => navigate('/support')}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-text transition-colors hover:bg-surface-hover"
        >
          <HelpCircle className="h-4 w-4 text-text-muted" />
          {copy.support}
        </button>
      </div>

      <div className="border-t border-border" />

      <div className="p-2">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-text transition-colors hover:bg-surface-hover"
        >
          <LogOut className="h-4 w-4 text-text-muted" />
          {copy.logout}
        </button>
      </div>
    </PopoverContent>
  )

  return (
    <>
      {/* Десктоп: рельс из круглых иконок */}
      {/* z-30: подсказки рельса должны рисоваться поверх основной области */}
      <aside className="relative z-20 hidden h-full shrink-0 lg:block">
        <div className="flex h-full w-[72px] flex-col items-center py-4">
          <div className="shrink-0">
            <RailButton icon={Plus} label={copy.newChat} onClick={newChat} />
          </div>

          <div className="my-3 h-px w-8 shrink-0 bg-hairline-2" />

          {/* Основные разделы переехали в шапку (GDD §3.1); рельс держит действия аккаунта. */}
          <div className="flex-1" />

          <div className="flex shrink-0 flex-col items-center gap-1.5">
            <RailButton
              icon={Languages}
              label={langLabel}
              muted
              onClick={() => setLanguage(language === 'ru' ? 'en' : 'ru')}
            />
            <RailButton icon={ThemeIcon} label={themeLabel} muted onClick={toggleTheme} />

            {user ? (
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    aria-label={copy.profile(user.name)}
                    className="mt-1 rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
                  >
                    <Avatar className="h-9 w-9 border border-hairline-2">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="bg-panel-2 text-xs text-text-secondary">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </PopoverTrigger>
                {profileMenu}
              </Popover>
            ) : (
              <Link
                to="/login"
                aria-label={copy.signIn}
                className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-primary transition hover:bg-primary/30"
              >
                <User className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </aside>

    </>
  )
}
