import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, X, Moon, Sun, MessageSquare, BookOpen, Luggage, User,
  ChevronRight, Settings, HelpCircle, LogOut, Globe2, Languages,
} from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RailButton } from './SidebarRail'

import { cn, getInitials } from '@/lib/utils'
import { Logo } from '@/components/icons/Logo'
import { getNavigationCopy } from '@/lib/settingsCopy'

const menuItems = [
  { icon: Globe2, id: 'game' },
  { icon: BookOpen, id: 'data' },
  { icon: MessageSquare, id: 'chats' },
  { icon: Luggage, id: 'suitcase' },
] as const

type MenuId = (typeof menuItems)[number]['id']

export function Sidebar() {
  const navigate = useNavigate()
  const {
    user,
    theme,
    toggleTheme,
    language,
    setLanguage,
    sidebarOpen,
    setSidebarOpen,
    newChat,
    logout,
    goHome,
    setMainView,
    mainView,
    currentChatId,
  } = useApp()
  const copy = getNavigationCopy(language)
  const labels: Record<MenuId, string> = {
    game: copy.explore,
    data: copy.wiki,
    chats: copy.routes,
    suitcase: copy.passport,
  }

  const activeMenuId = useMemo<MenuId>(() => {
    if (currentChatId) return 'chats'
    if (mainView === 'chatList') return 'chats'
    if (mainView === 'inspiration') return 'chats'
    if (mainView === 'saved') return 'chats'
    if (mainView === 'game') return 'game'
    if (mainView === 'community') return 'chats'
    if (mainView === 'placeByPhoto') return 'chats'
    if (mainView === 'toursGlamping') return 'chats'
    if (mainView === 'data') return 'data'
    if (mainView === 'suitcase') return 'suitcase'
    return 'chats'
  }, [currentChatId, mainView])

  const openSection = (id: MenuId) => {
    setSidebarOpen(false)
    goHome()
    setMainView(id === 'chats' ? 'chatList' : id)
  }

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

  /* ------------------------------------------- мобильный список с подписями */

  const mobileMenu = (
    <div className="flex h-full flex-col border-r border-border bg-surface">
      <div className="flex items-center justify-between p-4">
        <span className="flex items-center gap-2.5">
          <Logo size={36} />
          <span className="flex flex-col text-left">
            <span className="font-sans text-lg font-bold leading-tight text-text">Crista</span>
            <span className="font-sans text-[10px] font-medium uppercase tracking-wider text-text-muted">
              Online
            </span>
          </span>
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={copy.closeMenu}
          onClick={() => setSidebarOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <nav className="space-y-1 px-3">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => openSection(item.id)}
            className={cn(
              'flex w-full items-center gap-3 rounded-md px-3 py-2.5 font-sans text-sm font-medium transition-colors',
              activeMenuId === item.id
                ? 'bg-teal-700 text-white'
                : 'text-text-secondary hover:bg-panel-2 hover:text-text'
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {labels[item.id]}
          </button>
        ))}
      </nav>

      <div className="mt-4 px-3">
        <Button onClick={() => { newChat(); setSidebarOpen(false) }} variant="outline" className="w-full">
          <Plus />
          {copy.newChat}
        </Button>
      </div>

      <div className="flex-1" />

      <div className="space-y-1 border-t border-border p-3">
        <button
          onClick={() => setLanguage(language === 'ru' ? 'en' : 'ru')}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 font-sans text-sm text-text-secondary transition-colors hover:bg-panel-2 hover:text-text"
        >
          <Languages className="h-4 w-4" />
          <span className="flex-1 text-left">{language === 'ru' ? 'Русский' : 'English'}</span>
          <span className="rounded-full border border-border px-1.5 py-0.5 text-[10px] font-bold uppercase text-text-muted">
            {language === 'ru' ? 'EN' : 'RU'}
          </span>
        </button>
        <button
          onClick={toggleTheme}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 font-sans text-sm text-text-secondary transition-colors hover:bg-panel-2 hover:text-text"
        >
          <ThemeIcon className="h-4 w-4" />
          {themeLabel}
        </button>
      </div>
    </div>
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

          {/* Разделов больше, чем в референсе: на низких экранах список
              прокручивается, а профиль и настройки остаются на виду. */}
          <nav className="scrollbar-hidden flex min-h-0 flex-1 flex-col items-center gap-1.5 overflow-y-auto">
            {menuItems.map((item) => (
              <RailButton
                key={item.id}
                icon={item.icon}
                label={labels[item.id]}
                active={activeMenuId === item.id}
                onClick={() => openSection(item.id)}
              />
            ))}
          </nav>

          <div className="my-3 h-px w-8 shrink-0 bg-panel-2" />

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

      {/* Мобильное выдвижное меню */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 z-50 h-full w-[260px] lg:hidden"
            >
              {mobileMenu}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
