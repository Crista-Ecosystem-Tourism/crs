import { useNavigate } from 'react-router-dom'
import { Search, Bell, Heart, Menu } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Logo } from '@/components/icons/Logo'
import { getInitials } from '@/lib/utils'

/**
 * Шапка листа по референсу: логотип, поиск и действия в одну строку
 * во всю ширину панели. Рельс живёт под ней, а не отдельным островом.
 */
export function AppHeader() {
  const navigate = useNavigate()
  const { user, newChat, goHome, setSidebarOpen, setMainView } = useApp()

  return (
    <header className="relative z-30 flex h-16 shrink-0 items-center gap-3 px-3 sm:px-4">
      {/* Меню на мобильных */}
      <button
        onClick={() => setSidebarOpen(true)}
        aria-label="Открыть меню"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-panel-2 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Логотип и название */}
      <button
        onClick={() => {
          goHome()
          navigate('/')
        }}
        className="flex shrink-0 items-center gap-2.5 rounded-full pr-2 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <Logo size={34} />
        <span className="hidden text-left sm:block">
          <span className="block font-sans text-sm font-semibold leading-tight text-text">
            Crista
          </span>
          <span className="block font-sans text-[10px] uppercase tracking-[0.14em] text-text-muted">
            Online
          </span>
        </span>
      </button>

      {/* Поиск: ведёт в новый чат, потому что поиск здесь это и есть запрос к Crista */}
      <button
        onClick={() => {
          goHome()
          newChat()
        }}
        className="mx-auto flex h-10 w-full max-w-md items-center gap-2.5 rounded-full border border-hairline bg-panel px-4 text-left transition-colors hover:bg-panel-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <Search className="h-4 w-4 shrink-0 text-text-muted" aria-hidden="true" />
        <span className="truncate font-sans text-sm text-text-muted">
          Куда отправимся?
        </span>
      </button>

      {/* Действия */}
      <div className="flex shrink-0 items-center gap-1.5">
        <button
          onClick={() => {
            goHome()
            setMainView('saved')
          }}
          aria-label="Сохранённые маршруты"
          className="relative hidden h-10 w-10 items-center justify-center rounded-full border border-hairline bg-panel text-text-secondary transition-colors hover:bg-panel-2 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:flex"
        >
          <Heart className="h-[18px] w-[18px]" />
        </button>

        <button
          aria-label="Уведомления"
          className="relative hidden h-10 w-10 items-center justify-center rounded-full border border-hairline bg-panel text-text-secondary transition-colors hover:bg-panel-2 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:flex"
        >
          <Bell className="h-[18px] w-[18px]" />
          <span
            className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-primary"
            aria-hidden="true"
          />
        </button>

        <button
          onClick={() => navigate(user ? '/profile' : '/login')}
          aria-label={user ? `Профиль: ${user.name}` : 'Войти в аккаунт'}
          className="rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <Avatar className="h-10 w-10 border border-hairline-2">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="bg-panel-2 text-xs text-text-secondary">
              {user ? getInitials(user.name) : '?'}
            </AvatarFallback>
          </Avatar>
        </button>
      </div>
    </header>
  )
}
