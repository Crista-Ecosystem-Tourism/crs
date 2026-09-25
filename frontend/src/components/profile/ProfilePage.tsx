import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, MapPin, Crown, ChevronRight, Share2, Compass, Globe, Stamp,
  Flame, Route, CalendarDays, Settings, Sparkles,
} from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { useGameProgress } from '@/hooks/useGameProgress'
import { getGamePassport, type GamePassport } from '@/api/gameApi'
import { fetchSuitcaseWorkspace, mapTripFromApi, mapGoalFromApi } from '@/api/suitcaseApi'
import type { SuitcaseGoal, SuitcaseTrip } from '@/types/suitcase'
import { isMockMode } from '@/api/chatApi'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { GlassPanel, Chip, IconButton, StatTile, DisplayTitle } from '@/components/ui/glass'
import { Img } from '@/components/ui/Img'
import { Sidebar } from '@/components/layout/Sidebar'
import { AppFrame } from '@/components/layout/AppFrame'
import { gameCountries } from '@/mocks/game'
import { trips } from '@/mocks/trips'
import { getInitials, cn } from '@/lib/utils'
import { getProfileCopy } from '@/lib/settingsCopy'

type ProfileTripCard = Pick<SuitcaseTrip, 'id' | 'city' | 'country' | 'startDate' | 'endDate' | 'image'> & { title: string }

function formatProfileTripDates(startDate: string, endDate: string, language: 'ru' | 'en'): string {
  const formatter = new Intl.DateTimeFormat(language === 'ru' ? 'ru-RU' : 'en-US', { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' })
  return `${formatter.format(new Date(startDate))} — ${formatter.format(new Date(endDate))}`
}

export function ProfilePage() {
  const navigate = useNavigate()
  const { user, openModal, chatHistory, savedRoutes, setMainView, language } = useApp()
  const copy = getProfileCopy(language)
  const { countryProgress, cityProgress, stats } = useGameProgress()
  const demoMode = isMockMode()
  const [passport, setPassport] = useState<GamePassport | null>(null)
  const [passportLoading, setPassportLoading] = useState(() => !isMockMode())
  const [passportError, setPassportError] = useState(false)
  const [passportRetry, setPassportRetry] = useState(0)
  const [suitcaseTrips, setSuitcaseTrips] = useState<SuitcaseTrip[] | null>(null)
  const [suitcaseGoals, setSuitcaseGoals] = useState<SuitcaseGoal[]>([])
  const [suitcaseLoading, setSuitcaseLoading] = useState(() => !isMockMode())
  const [suitcaseError, setSuitcaseError] = useState(false)
  const [suitcaseRetry, setSuitcaseRetry] = useState(0)

  useEffect(() => {
    if (!user || demoMode) return
    let current = true
    setPassport(null)
    setPassportLoading(true)
    setPassportError(false)
    getGamePassport()
      .then((result) => { if (current) setPassport(result) })
      .catch(() => { if (current) { setPassport(null); setPassportError(true) } })
      .finally(() => { if (current) setPassportLoading(false) })
    return () => { current = false }
  }, [demoMode, passportRetry, user?.id])

  useEffect(() => {
    if (!user || demoMode) return
    let current = true
    setSuitcaseTrips(null)
    setSuitcaseGoals([])
    setSuitcaseLoading(true)
    setSuitcaseError(false)
    fetchSuitcaseWorkspace()
      .then((workspace) => {
        if (!current) return
        setSuitcaseTrips(workspace.trips.map(mapTripFromApi))
        setSuitcaseGoals(workspace.goals.map(mapGoalFromApi))
      })
      .catch(() => { if (current) { setSuitcaseTrips(null); setSuitcaseError(true) } })
      .finally(() => { if (current) setSuitcaseLoading(false) })
    return () => { current = false }
  }, [demoMode, suitcaseRetry, user?.id])

  useEffect(() => {
    if (!user) navigate('/login')
  }, [user, navigate])

  if (!user) return null

  const opened = gameCountries.filter((c) => c.opened)
  const closedCountries = demoMode
    ? opened.filter((c) => countryProgress(c.iso) === 100)
    : (passport?.cities ?? []).filter((city) => city.required_quest_count > 0 && city.completed_quests >= city.required_quest_count)

  const demoStampsEarned = demoMode ? opened.reduce((sum, country) => {
    const countryStamp = countryProgress(country.iso) === 100 ? 1 : 0
    const cityStamps = country.cities.filter((city) => cityProgress(country, city.id) === 100).length
    return sum + countryStamp + cityStamps
  }, 0) : 0

  const stampsEarned = demoMode ? demoStampsEarned : passport?.stamps.length ?? 0
  const completedQuests = demoMode
    ? stats.doneQuests
    : (passport?.cities ?? []).reduce((total, city) => total + city.completed_quests, 0)
  const totalKm = trips.reduce((total, trip) => total + trip.stats.distanceKm, 0)
  const totalDays = trips.reduce((total, trip) => total + trip.stats.days, 0)
  const displayTrips: ProfileTripCard[] = demoMode
    ? trips.map((trip) => ({
        id: trip.id, title: trip.title, city: trip.city, country: trip.country,
        startDate: trip.startDate, endDate: trip.endDate, image: trip.cover,
      }))
    : (suitcaseTrips ?? []).filter((trip) => !trip.isArchived).map((trip) => ({
        id: trip.id, title: `${trip.city}, ${trip.country}`, city: trip.city, country: trip.country,
        startDate: trip.startDate, endDate: trip.endDate, image: trip.image,
      }))

  const achievements = [
    {
      id: 'explorer',
      icon: Compass,
      label: copy.explorer,
      description: copy.explorerDescription,
      unlocked: savedRoutes.length >= 5,
    },
    {
      id: 'traveller',
      icon: Globe,
      label: copy.traveller,
      description: demoMode ? copy.countryComplete : copy.cityComplete,
      unlocked: closedCountries.length >= 1,
    },
    {
      id: 'collector',
      icon: Stamp,
      label: copy.collector,
      description: copy.collectorDescription,
      unlocked: stampsEarned >= 5,
    },
    {
      id: 'streak',
      icon: Flame,
      label: copy.consistency,
      description: copy.consistencyDescription,
      unlocked: completedQuests >= 10,
    },
  ]

  const handleShare = async () => {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({
          title: copy.profileShareTitle(user.name),
          text: copy.profileShareText(user.name),
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
                <IconButton label={copy.back} variant="ghost" size="sm" className="-ml-2" onClick={() => navigate('/')}>
                  <ArrowLeft />
                </IconButton>
                <h1 className="truncate font-display text-2xl font-semibold text-text">{copy.title}</h1>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <IconButton label={copy.share} variant="ghost" onClick={handleShare}>
                  <Share2 />
                </IconButton>
                <IconButton label={copy.settings} variant="ghost" onClick={() => navigate('/settings')}>
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
                        {copy.premium}
                      </Chip>
                    ) : (
                      <Chip size="sm">{copy.free}</Chip>
                    )}
                    <Chip size="sm">
                      <Globe />
                      <span className="tabular">{!demoMode && passportError ? '—' : closedCountries.length} {demoMode ? copy.countriesClosed : copy.citiesClosed}</span>
                    </Chip>
                  </div>
                </div>

                {user.subscription !== 'premium' && (
                  <Button onClick={() => openModal('subscription')}>
                    <Sparkles />
                    {copy.premiumCta}
                  </Button>
                )}
              </div>
            </GlassPanel>

            {/* Статистика */}
            <GlassPanel className="grid grid-cols-2 gap-x-4 gap-y-5 p-5 sm:grid-cols-3 lg:grid-cols-5">
              {demoMode ? <>
                <StatTile icon={<Route />} value={copy.distanceValue(totalKm)} label={copy.distance} />
                <StatTile icon={<CalendarDays />} value={`${totalDays}`} label={copy.days} />
              </> : <>
                <StatTile icon={<Sparkles />} value={passportLoading ? '…' : `${passport?.profile.xp ?? '—'}`} label="XP" />
                <StatTile icon={<CalendarDays />} value={suitcaseLoading ? '…' : suitcaseError ? '—' : `${(suitcaseTrips ?? []).filter((trip) => !trip.isArchived).length}`} label={copy.savedTrips} />
              </>}
              <StatTile icon={<MapPin />} value={`${savedRoutes.length}`} label={copy.routes} />
              <StatTile icon={<Stamp />} value={!demoMode && passportLoading ? '…' : !demoMode && passportError ? '—' : `${stampsEarned}`} label={copy.stamps} />
              {demoMode
                ? <StatTile icon={<Compass />} value={`${chatHistory.length}`} label={copy.chats} />
                : <StatTile icon={<Compass />} value={suitcaseLoading ? '…' : suitcaseError ? '—' : `${suitcaseGoals.length}`} label={copy.goals} />}
            </GlassPanel>

            {/* Паспорт */}
            <section>
              <div className="mb-4 flex items-baseline justify-between gap-4">
                <h2 className="font-display text-2xl font-semibold text-text">{copy.passport}</h2>
                <span className="font-sans text-xs tabular text-text-muted">
                  {copy.stampCount(stampsEarned)}
                </span>
              </div>

              <GlassPanel className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3 lg:grid-cols-4">
                {demoMode ? gameCountries.slice(0, 8).map((country) => {
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
                          {country.opened ? `${p}%` : copy.blankSpot}
                        </span>
                      </span>
                    </div>
                  )
                }) : (passport?.cities ?? []).map((city) => {
                  const done = city.required_quest_count > 0 && city.completed_quests >= city.required_quest_count
                  const progress = city.required_quest_count > 0
                    ? Math.min(100, Math.round(city.completed_quests / city.required_quest_count * 100))
                    : 0
                  return (
                    <div key={city.id} className={cn(
                      'flex items-center gap-3 rounded-md border p-3',
                      done ? 'border-primary/40 bg-primary/[0.08]' : 'border-hairline bg-panel'
                    )}>
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-panel-2 text-primary">
                        <MapPin className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-sans text-sm font-medium text-text">{city.name}</span>
                        <span className="block font-sans text-xs tabular text-text-muted">
                          {city.completed_quests}/{city.required_quest_count} {copy.quests} · {progress}%
                        </span>
                      </span>
                    </div>
                  )
                })}
              </GlassPanel>
              {!demoMode && passportLoading && <p role="status" className="mt-3 text-sm text-text-muted">{copy.passportLoading}</p>}
              {!demoMode && passportError && <div role="status" className="mt-3 flex items-center gap-3 text-sm text-text-muted">
                <span>{copy.passportUnavailable}</span>
                <Button size="sm" variant="secondary" onClick={() => setPassportRetry((version) => version + 1)}>{copy.retry}</Button>
              </div>}
              {!demoMode && !passportLoading && !passportError && passport?.cities.length === 0 &&
                <p className="mt-3 text-sm text-text-muted">{copy.noCities}</p>}
            </section>

            {/* Достижения */}
            <section>
              <h2 className="mb-4 font-display text-2xl font-semibold text-text">{copy.achievements}</h2>
              {!demoMode && passportError ? <p className="text-sm text-text-muted">{copy.achievementsUnavailable}</p> :
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
                      <p className="mt-2 font-sans text-[11px] text-text-muted">{copy.locked}</p>
                    )}
                  </GlassPanel>
                ))}
              </div>
              }
            </section>

            {/* Поездки */}
            <section>
              <div className="mb-4 flex items-baseline justify-between gap-4">
                <h2 className="font-display text-2xl font-semibold text-text">{copy.trips}</h2>
                <span className="font-sans text-xs tabular text-text-muted">
                  {suitcaseLoading && !demoMode ? copy.loading : !demoMode && suitcaseError ? '—' : copy.tripCount(displayTrips.length)}
                </span>
              </div>

              {!demoMode && suitcaseError && <div role="status" className="mb-4 flex items-center gap-3 text-sm text-text-muted">
                <span>{copy.tripsUnavailable}</span>
                <Button size="sm" variant="secondary" onClick={() => setSuitcaseRetry((version) => version + 1)}>{copy.retry}</Button>
              </div>}
              {!demoMode && !suitcaseLoading && !suitcaseError && displayTrips.length === 0 &&
                <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-hairline bg-panel p-4">
                  <p className="font-sans text-sm text-text-muted">{copy.noTrips}</p>
                  <Button size="sm" variant="secondary" onClick={() => setMainView('suitcase')}>{copy.openSuitcase}</Button>
                </div>}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {displayTrips.map((trip) => (
                  <article
                    key={trip.id}
                    className="group overflow-hidden rounded-lg border border-hairline bg-panel transition duration-base hover:border-hairline-2"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden">
                      {trip.image ? <Img
                        src={trip.image}
                        alt={trip.title}
                        className="h-full w-full object-cover transition-transform duration-[700ms] ease-out group-hover:scale-[1.06]"
                      /> : <div className="flex h-full items-center justify-center bg-panel-2 text-text-muted"><MapPin className="h-8 w-8" aria-hidden="true" /></div>}
                      {trip.image && <div className="photo-scrim absolute inset-0" />}
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
                    <p className="p-4 font-sans text-xs text-text-muted">{formatProfileTripDates(trip.startDate, trip.endDate, language)}</p>
                  </article>
                ))}
              </div>
            </section>

            {/* Переходы */}
            <GlassPanel className="divide-y divide-hairline overflow-hidden p-0">
              {[
                { label: copy.settingsLink, to: '/settings' },
                { label: copy.support, to: '/support' },
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
