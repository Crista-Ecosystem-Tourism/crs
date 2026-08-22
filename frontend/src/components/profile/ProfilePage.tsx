import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, MapPin, Crown, ChevronRight, Share2, Compass, Globe, Stamp,
  Flame, Route, CalendarDays, Settings, Sparkles,
} from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { useGameProgress } from '@/hooks/useGameProgress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { GlassPanel, Chip, IconButton, StatTile, DisplayTitle } from '@/components/ui/glass'
import { Img } from '@/components/ui/Img'
import { Sidebar } from '@/components/layout/Sidebar'
import { AppFrame } from '@/components/layout/AppFrame'
import { gameCountries } from '@/mocks/game'
import { trips, formatTripDates } from '@/mocks/trips'
import { getInitials, cn, pluralize } from '@/lib/utils'

export function ProfilePage() {
  const navigate = useNavigate()
  const { user, openModal, chatHistory, savedRoutes } = useApp()
  const { countryProgress, cityProgress, stats } = useGameProgress()

  useEffect(() => {
    if (!user) navigate('/login')
  }, [user, navigate])

  if (!user) return null

  const opened = gameCountries.filter((c) => c.opened)
  const closedCountries = opened.filter((c) => countryProgress(c.iso) === 100)

  const stampsEarned = opened.reduce((sum, country) => {
    const countryStamp = countryProgress(country.iso) === 100 ? 1 : 0
    const cityStamps = country.cities.filter((city) => cityProgress(country, city.id) === 100).length
    return sum + countryStamp + cityStamps
  }, 0)

  const totalKm = trips.reduce((s, t) => s + t.stats.distanceKm, 0)
  const totalDays = trips.reduce((s, t) => s + t.stats.days, 0)

  const achievements = [
    {
      id: 'explorer',
      icon: Compass,
      label: 'Исследователь',
      description: 'Пять маршрутов сохранено',
      unlocked: savedRoutes.length >= 5,
    },
    {
      id: 'traveller',
      icon: Globe,
      label: 'Путешественник',
      description: 'Одна страна закрыта полностью',
      unlocked: closedCountries.length >= 1,
    },
    {
      id: 'collector',
      icon: Stamp,
      label: 'Коллекционер',
      description: 'Пять штампов в паспорте',
      unlocked: stampsEarned >= 5,
    },
    {
      id: 'streak',
      icon: Flame,
      label: 'Постоянство',
      description: 'Десять квестов закрыто',
      unlocked: stats.doneQuests >= 10,
    },
  ]

  const handleShare = async () => {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Профиль ${user.name}`,
          text: `Профиль ${user.name} в Crista`,
          url,
        })
      } else {
        await navigator.clipboard.writeText(url)
      }
    } catch {
      // пользователь закрыл диалог: молчим
    }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden font-sans text-text">

      <AppFrame>
        <Sidebar />

        <main className="h-full min-w-0 flex-1 overflow-y-auto">
          <div className="relative z-10">
            <div className="mx-auto flex max-w-[1000px] items-center justify-between gap-3 px-5 pb-2 pt-6 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <IconButton label="Назад" variant="ghost" size="sm" className="-ml-2" onClick={() => navigate('/')}>
                  <ArrowLeft />
                </IconButton>
                <h1 className="truncate font-display text-2xl font-semibold text-text">Профиль</h1>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <IconButton label="Поделиться профилем" variant="ghost" onClick={handleShare}>
                  <Share2 />
                </IconButton>
                <IconButton label="Настройки" variant="ghost" onClick={() => navigate('/settings')}>
                  <Settings />
                </IconButton>
              </div>
            </div>
          </div>

          <div className="mx-auto w-full max-w-[1000px] space-y-6 px-5 pb-8 pt-4 sm:px-6">
            {/* Карточка пользователя */}
            <GlassPanel className="p-6">
              <div className="flex flex-wrap items-center gap-5">
                <Avatar className="h-20 w-20 border border-hairline-2">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="bg-panel-2 text-xl text-text-secondary">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <DisplayTitle as="h2" className="!text-4xl">{user.name}</DisplayTitle>
                  <p className="mt-1 truncate font-sans text-sm text-text-muted">{user.email}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {user.subscription === 'premium' ? (
                      <Chip variant="active" size="sm">
                        <Crown />
                        Премиум
                      </Chip>
                    ) : (
                      <Chip size="sm">Бесплатный план</Chip>
                    )}
                    <Chip size="sm">
                      <Globe />
                      <span className="tabular">{closedCountries.length} стран закрыто</span>
                    </Chip>
                  </div>
                </div>

                {user.subscription !== 'premium' && (
                  <Button onClick={() => openModal('subscription')}>
                    <Sparkles />
                    Оформить премиум
                  </Button>
                )}
              </div>
            </GlassPanel>

            {/* Статистика */}
            <GlassPanel className="grid grid-cols-2 gap-x-4 gap-y-5 p-5 sm:grid-cols-3 lg:grid-cols-5">
              <StatTile icon={<Route />} value={`${totalKm} км`} label="пройдено" />
              <StatTile icon={<CalendarDays />} value={`${totalDays}`} label="дней в пути" />
              <StatTile icon={<MapPin />} value={`${savedRoutes.length}`} label="маршрутов" />
              <StatTile icon={<Stamp />} value={`${stampsEarned}`} label="штампов" />
              <StatTile icon={<Compass />} value={`${chatHistory.length}`} label="чатов" />
            </GlassPanel>

            {/* Паспорт */}
            <section>
              <div className="mb-4 flex items-baseline justify-between gap-4">
                <h2 className="font-display text-2xl font-semibold text-text">Тревел-паспорт</h2>
                <span className="font-sans text-xs tabular text-text-muted">
                  {pluralize(stampsEarned, 'штамп', 'штампа', 'штампов')}
                </span>
              </div>

              <GlassPanel className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3 lg:grid-cols-4">
                {gameCountries.slice(0, 8).map((country) => {
                  const p = countryProgress(country.iso)
                  const done = p === 100
                  return (
                    <div
                      key={country.iso}
                      className={cn(
                        'flex items-center gap-3 rounded-md border p-3',
                        done
                          ? 'border-primary/40 bg-primary/[0.08]'
                          : 'border-hairline bg-panel'
                      )}
                    >
                      <span
                        className={cn('text-2xl leading-none', !country.opened && 'opacity-30 grayscale')}
                        aria-hidden="true"
                      >
                        {country.flag}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-sans text-sm font-medium text-text">
                          {country.name}
                        </span>
                        <span
                          className={cn(
                            'block font-sans text-xs tabular',
                            done ? 'text-primary' : 'text-text-muted'
                          )}
                        >
                          {country.opened ? `${p}%` : 'белое пятно'}
                        </span>
                      </span>
                    </div>
                  )
                })}
              </GlassPanel>
            </section>

            {/* Достижения */}
            <section>
              <h2 className="mb-4 font-display text-2xl font-semibold text-text">Достижения</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {achievements.map((a) => (
                  <GlassPanel
                    key={a.id}
                    className={cn('p-4', !a.unlocked && 'opacity-55')}
                  >
                    <span
                      className={cn(
                        'mb-3 flex h-10 w-10 items-center justify-center rounded-md',
                        a.unlocked ? 'bg-primary/15 text-primary' : 'bg-panel-2 text-text-muted'
                      )}
                    >
                      <a.icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <p className="font-sans text-sm font-semibold text-text">{a.label}</p>
                    <p className="mt-0.5 font-sans text-xs leading-relaxed text-text-muted">
                      {a.description}
                    </p>
                    {!a.unlocked && (
                      <p className="mt-2 font-sans text-[11px] text-text-muted">Ещё не открыто</p>
                    )}
                  </GlassPanel>
                ))}
              </div>
            </section>

            {/* Поездки */}
            <section>
              <div className="mb-4 flex items-baseline justify-between gap-4">
                <h2 className="font-display text-2xl font-semibold text-text">Мои путешествия</h2>
                <span className="font-sans text-xs tabular text-text-muted">
                  {pluralize(trips.length, 'поездка', 'поездки', 'поездок')}
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {trips.map((trip) => (
                  <article
                    key={trip.id}
                    className="group overflow-hidden rounded-lg border border-hairline bg-panel transition duration-base hover:border-hairline-2"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Img
                        src={trip.cover}
                        alt={trip.title}
                        className="h-full w-full object-cover transition-transform duration-[700ms] ease-out group-hover:scale-[1.06]"
                      />
                      <div className="photo-scrim absolute inset-0" />
                      <div className="absolute inset-x-0 bottom-0 p-4">
                        <p className="font-display text-xl font-semibold leading-tight text-white">
                          {trip.title}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1.5 font-sans text-[11px] text-white/70">
                          <MapPin className="h-3 w-3" aria-hidden="true" />
                          {trip.city}
                        </p>
                      </div>
                    </div>
                    <p className="p-4 font-sans text-xs text-text-muted">{formatTripDates(trip)}</p>
                  </article>
                ))}
              </div>
            </section>

            {/* Переходы */}
            <GlassPanel className="divide-y divide-hairline overflow-hidden p-0">
              {[
                { label: 'Настройки аккаунта', to: '/settings' },
                { label: 'Поддержка', to: '/support' },
              ].map((row) => (
                <button
                  key={row.to}
                  onClick={() => navigate(row.to)}
                  className="group flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-panel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <span className="font-sans text-sm text-text">{row.label}</span>
                  <ChevronRight
                    className="h-4 w-4 shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </button>
              ))}
            </GlassPanel>
          </div>
        </main>
      </AppFrame>
    </div>
  )
}
