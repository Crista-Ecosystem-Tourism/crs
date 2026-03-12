import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Menu, Moon, Sun, MessageSquare, Search, Map, Sparkles, Database, User, ChevronLeft, Info, ChevronRight, Settings, HelpCircle, LogOut } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

import { cn, getInitials } from '@/lib/utils'
import { Logo } from '@/components/icons/Logo'

const menuItems = [
  { icon: Search, label: 'Главная', id: 'explore', path: '/' },
  { icon: MessageSquare, label: 'Чаты', id: 'chats' },
  { icon: Map, label: 'Мои маршруты', id: 'saved' },
  { icon: Sparkles, label: 'Вдохновение', id: 'inspiration' },
  { icon: Database, label: 'Данные', id: 'data' },
]

export function Sidebar() {
  const navigate = useNavigate()
  const {
    user,
    theme,
    toggleTheme,
    sidebarOpen,
    setSidebarOpen,
    newChat,
    logout,
    goHome,
    setMainView,
  } = useApp()

  const [activeMenu, setActiveMenu] = useState('explore')
  const { sidebarCollapsed: isCollapsed, setSidebarCollapsed: setIsCollapsed } = useApp()

  const sidebarContent = (collapsed: boolean) => (
    <div className="h-full flex flex-col bg-surface border-r border-border transition-colors">
      {/* Header with Logo */}
      <div className={cn("p-4 pb-2", collapsed && "px-2")}>
        <div className={cn("flex items-center mb-4", collapsed ? "justify-center" : "justify-between")}>
          <button
            onClick={() => collapsed && setIsCollapsed(false)}
            className={cn("flex items-center", collapsed ? "justify-center" : "gap-2.5")}
          >
            <Logo size={36} />
            {!collapsed && (
              <div className="flex flex-col text-left">
                <span className="text-lg font-bold leading-tight text-text">Crista</span>
                <span className="text-[10px] font-medium uppercase tracking-wider text-text-muted">Online</span>
              </div>
            )}
          </button>
          {!collapsed && (
            <button
              onClick={() => setIsCollapsed(true)}
              className="hidden lg:flex w-8 h-8 items-center justify-center rounded-full border border-border text-text-muted hover:bg-surface-hover hover:text-text transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            className="lg:hidden text-text-muted hover:bg-surface-hover"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className={cn("space-y-1", collapsed ? "px-2" : "px-3")}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveMenu(item.id)
              if (collapsed) setIsCollapsed(false)
              if (item.id === 'explore') {
                goHome()
                navigate('/')
              } else if (item.id === 'chats') {
                goHome()
                setMainView('chatList')
              } else if (item.id === 'inspiration') {
                goHome()
                setMainView('inspiration')
              } else if (item.id === 'saved') {
                goHome()
                setMainView('saved')
              } else if (item.id === 'data') {
                goHome()
                setMainView('data')
              } else if ('path' in item && item.path) {
                navigate(item.path)
              }
            }}
            title={collapsed ? item.label : undefined}
            className={cn(
              'w-full flex items-center rounded-lg text-sm font-medium transition-colors',
              collapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5',
              activeMenu === item.id
                ? 'bg-surface-light text-text'
                : 'text-text-secondary hover:bg-surface-hover hover:text-text'
            )}
          >
            <item.icon className={cn("flex-shrink-0", collapsed ? "w-5 h-5" : "w-4 h-4")} />
            {!collapsed && item.label}
          </button>
        ))}
      </nav>

      {/* New Chat Button */}
      <div className={cn("mt-4", collapsed ? "px-2" : "px-3")}>
        {collapsed ? (
          <button
            onClick={() => { setIsCollapsed(false); newChat() }}
            title="Новый чат"
            className="w-full flex items-center justify-center p-3 rounded-lg border border-border text-text-secondary hover:bg-surface-hover hover:text-text transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        ) : (
          <Button
            onClick={newChat}
            variant="outline"
            className="w-full h-10 rounded-lg border-border text-text-secondary hover:bg-surface-hover hover:text-text font-medium bg-transparent"
          >
            <Plus className="w-4 h-4 mr-2" />
            Новый чат
          </Button>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Footer */}
      <div className="mt-auto border-t border-border">
        {/* Logo in collapsed state at bottom */}
        {collapsed && (
          <button
            onClick={() => setIsCollapsed(false)}
            className="w-full py-4 flex flex-col items-center gap-2 hover:bg-surface-hover transition-colors"
          >
            <Logo size={32} />
            <div className="flex flex-col items-center" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
              <span className="text-[10px] font-bold text-text">Crista</span>
              <span className="text-[8px] font-medium uppercase text-text-muted">Online</span>
            </div>
          </button>
        )}

        {/* Theme Toggle */}
        <div className={cn("border-t border-border", collapsed ? "p-2" : "px-3 py-2")}>
          <button
            onClick={() => collapsed ? setIsCollapsed(false) : toggleTheme()}
            title={theme === 'dark' ? "Светлая тема" : "Тёмная тема"}
            className={cn(
              "flex items-center rounded-lg text-text-secondary hover:bg-surface-hover hover:text-text transition-colors",
              collapsed ? "w-full justify-center p-2" : "gap-3 px-3 py-2 w-full"
            )}
          >
            {theme === 'dark' ? (
              <Sun className={cn("flex-shrink-0", collapsed ? "w-5 h-5" : "w-4 h-4")} />
            ) : (
              <Moon className={cn("flex-shrink-0", collapsed ? "w-5 h-5" : "w-4 h-4")} />
            )}
            {!collapsed && (
              <span className="text-sm font-medium">{theme === 'dark' ? "Светлая тема" : "Тёмная тема"}</span>
            )}
          </button>
        </div>

        {/* User Profile */}
        <div className={cn("border-t border-border", collapsed ? "p-2" : "p-3")}>
          {user ? (
            <Popover>
              <PopoverTrigger asChild>
                <button
                  onClick={() => collapsed && setIsCollapsed(false)}
                  className={cn(
                    "w-full flex items-center rounded-lg hover:bg-surface-hover transition-colors cursor-pointer",
                    collapsed ? "justify-center p-2" : "gap-3 p-2"
                  )}
                >
                  <Avatar className={cn("border border-border flex-shrink-0", collapsed ? "w-8 h-8" : "w-9 h-9")}>
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="bg-surface-light text-text-secondary text-sm">{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  {!collapsed && (
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium truncate text-text">{user.name}</p>
                      <p className="text-xs text-text-muted">
                        {user.subscription === 'premium' ? 'Премиум' : 'Бесплатный план'}
                      </p>
                    </div>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent side="top" align="start" className="w-64 p-0">
                {/* Profile Header */}
                <button
                  onClick={() => navigate('/profile')}
                  className="w-full flex items-center gap-3 p-4 hover:bg-surface-hover transition-colors rounded-t-2xl"
                >
                  <Avatar className="w-10 h-10 border border-border">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="bg-surface-light text-text-secondary">{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-text">{user.name}</p>
                    <p className="text-xs text-text-muted">Смотреть профиль</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-muted" />
                </button>

                {/* Divider */}
                <div className="border-t border-border" />

                {/* Menu Items */}
                <div className="p-2">
                  <button
                    onClick={() => navigate('/settings')}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text hover:bg-surface-hover transition-colors"
                  >
                    <Settings className="w-4 h-4 text-text-muted" />
                    Настройки аккаунта
                  </button>
                  <button
                    onClick={() => navigate('/support')}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text hover:bg-surface-hover transition-colors"
                  >
                    <HelpCircle className="w-4 h-4 text-text-muted" />
                    Поддержка
                  </button>
                </div>

                {/* Divider */}
                <div className="border-t border-border" />

                {/* Logout */}
                <div className="p-2">
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text hover:bg-surface-hover transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-text-muted" />
                    Выйти
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <Link
              to="/login"
              onClick={() => collapsed && setIsCollapsed(false)}
              className={cn(
                "w-full flex items-center rounded-lg hover:bg-surface-hover transition-colors",
                collapsed ? "justify-center p-2" : "gap-3 p-2"
              )}
            >
              <div className={cn(
                "rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0",
                collapsed ? "w-8 h-8" : "w-9 h-9"
              )}>
                <User className="w-4 h-4" />
              </div>
              {!collapsed && (
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-text">Путешественник</p>
                  <p className="text-xs text-text-muted">Войти в аккаунт</p>
                </div>
              )}
            </Link>
          )}
        </div>

        {/* Info button */}
        <div className={cn("border-t border-border", collapsed ? "p-2" : "px-3 py-2")}>
          <Popover>
            <PopoverTrigger asChild>
              <button
                onClick={() => collapsed && setIsCollapsed(false)}
                title="О проекте"
                className={cn(
                  "flex items-center rounded-lg text-text-muted hover:bg-surface-hover hover:text-text transition-colors",
                  collapsed ? "w-full justify-center p-2" : "p-2"
                )}
              >
                <Info className={cn(collapsed ? "w-5 h-5" : "w-4 h-4")} />
              </button>
            </PopoverTrigger>
            <PopoverContent side="top" align="start" className="w-64 p-0 overflow-hidden">
              {/* Project Header with gradient */}
              <div className="relative p-4 pb-3 bg-gradient-to-br from-primary/5 to-transparent">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center shadow-sm border border-border">
                    <Logo size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text">Crista Online</p>
                    <p className="text-[11px] text-text-muted mt-0.5">Умный помощник для путешествий</p>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="px-2 py-1.5 border-t border-border">
                <a href="#" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-text-secondary hover:bg-surface-hover hover:text-text transition-colors group">
                  <div className="w-7 h-7 rounded-lg bg-surface-light flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <Sparkles className="w-3.5 h-3.5 text-text-muted group-hover:text-primary transition-colors" />
                  </div>
                  <span>О компании</span>
                </a>
                <a href="#" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-text-secondary hover:bg-surface-hover hover:text-text transition-colors group">
                  <div className="w-7 h-7 rounded-lg bg-surface-light flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <HelpCircle className="w-3.5 h-3.5 text-text-muted group-hover:text-primary transition-colors" />
                  </div>
                  <span>Помощь</span>
                </a>
                <a href="mailto:hello@crista.online" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-text-secondary hover:bg-surface-hover hover:text-text transition-colors group">
                  <div className="w-7 h-7 rounded-lg bg-surface-light flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <MessageSquare className="w-3.5 h-3.5 text-text-muted group-hover:text-primary transition-colors" />
                  </div>
                  <span>Связаться с нами</span>
                </a>
              </div>

              {/* Footer Links & Copyright */}
              <div className="px-4 py-3 bg-surface-light/50 border-t border-border">
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-text-muted mb-2">
                  <a href="#" className="hover:text-text transition-colors">Условия</a>
                  <span>·</span>
                  <a href="#" className="hover:text-text transition-colors">Конфиденциальность</a>
                </div>
                <p className="text-[10px] text-text-muted/70 text-center">© 2025 Crista Online</p>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile toggle button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden fixed top-4 right-4 z-50 shadow-md border border-border rounded-full bg-surface hover:bg-surface-hover"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu className="w-5 h-5 text-text-secondary" />
      </Button>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ width: 240, opacity: 0, x: -20 }}
        animate={{
          width: isCollapsed ? 64 : 240,
          opacity: 1,
          x: 0
        }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="hidden lg:block h-full flex-shrink-0 z-20 overflow-hidden relative"
      >
        {sidebarContent(isCollapsed)}
      </motion.aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.aside
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 h-full w-[240px] z-50"
            >
              {sidebarContent(false)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
