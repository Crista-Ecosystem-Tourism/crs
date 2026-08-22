import { useMemo, useState } from 'react'
import { ArrowLeft, MapPin, CalendarDays, Route, Globe, Link2, Lock, Plus } from 'lucide-react'
import { GlassPanel, Chip, IconButton } from '@/components/ui/glass'
import { Button } from '@/components/ui/button'
import { Img } from '@/components/ui/Img'
import { TripArticle } from './TripArticle'
import {
  trips as initialTrips,
  formatTripDates,
  privacyLabel,
  type Trip,
  type TripPrivacy,
} from '@/mocks/trips'
import { cn, pluralize } from '@/lib/utils'

interface MyTripsPanelProps {
  onBack: () => void
}

const privacyIcon: Record<TripPrivacy, typeof Globe> = {
  public: Globe,
  link: Link2,
  private: Lock,
}

type StatusFilter = 'all' | 'completed' | 'ongoing'

export function MyTripsPanel({ onBack }: MyTripsPanelProps) {
  const [trips, setTrips] = useState<Trip[]>(initialTrips)
  const [openId, setOpenId] = useState<string | null>(null)
  const [status, setStatus] = useState<StatusFilter>('all')
  const [country, setCountry] = useState<string>('all')

  const countries = useMemo(
    () => ['all', ...new Set(initialTrips.map((t) => t.country))],
    []
  )

  const filtered = trips.filter(
    (t) =>
      (status === 'all' || t.status === status) &&
      (country === 'all' || t.country === country)
  )

  const active = trips.find((t) => t.id === openId)

  const changePrivacy = (id: string, privacy: TripPrivacy) =>
    setTrips((prev) => prev.map((t) => (t.id === id ? { ...t, privacy } : t)))

  if (active) {
    return (
      <TripArticle
        trip={active}
        onBack={() => setOpenId(null)}
        onPrivacyChange={changePrivacy}
      />
    )
  }

  const totals = trips.reduce(
    (acc, t) => ({
      days: acc.days + t.stats.days,
      km: acc.km + t.stats.distanceKm,
      places: acc.places + t.stats.placesVisited,
    }),
    { days: 0, km: 0, places: 0 }
  )

  return (
    <div className="h-full overflow-y-auto">
      <div className="relative z-10">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-3 px-5 pb-2 pt-6 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <IconButton label="Назад" variant="ghost" size="sm" className="-ml-2" onClick={onBack}>
              <ArrowLeft />
            </IconButton>
            <h1 className="truncate font-display text-2xl font-semibold text-text">
              Мои путешествия
            </h1>
          </div>
          <Chip size="sm" className="tabular">{pluralize(trips.length, 'поездка', 'поездки', 'поездок')}</Chip>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1100px] px-5 pb-8 pt-4 sm:px-6">
        <p className="mb-6 max-w-[68ch] font-accent text-lg leading-relaxed text-text-secondary">
          Каждая поездка собирается в отдельную страницу с картой точек, фактами, снимками
          и статистикой. Её можно оставить себе или открыть по ссылке.
        </p>

        {/* Сводка */}
        <div className="mb-6 flex flex-wrap gap-x-8 gap-y-3">
          <span className="flex items-center gap-2 font-sans text-sm text-text-secondary">
            <CalendarDays className="h-4 w-4 text-primary" aria-hidden="true" />
            <span className="tabular">{totals.days} дней в пути</span>
          </span>
          <span className="flex items-center gap-2 font-sans text-sm text-text-secondary">
            <Route className="h-4 w-4 text-primary" aria-hidden="true" />
            <span className="tabular">{totals.km} км пройдено</span>
          </span>
          <span className="flex items-center gap-2 font-sans text-sm text-text-secondary">
            <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
            <span className="tabular">{totals.places} мест отмечено</span>
          </span>
        </div>

        {/* Фильтры */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {(['all', 'completed', 'ongoing'] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              aria-pressed={status === s}
              className={cn(
                'rounded-full px-3.5 py-2 font-sans text-sm font-medium transition duration-base',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                status === s
                  ? 'bg-teal-700 text-white'
                  : 'text-text-secondary hover:bg-panel-2 hover:text-text'
              )}
            >
              {s === 'all' ? 'Все' : s === 'completed' ? 'Завершённые' : 'В процессе'}
            </button>
          ))}

          <span className="mx-1 h-5 w-px bg-panel-3" aria-hidden="true" />

          <label htmlFor="trip-country" className="sr-only">Фильтр по стране</label>
          <select
            id="trip-country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="h-10 rounded-full border border-hairline bg-panel px-3.5 font-sans text-sm text-text outline-none focus:border-primary/40 focus:ring-2 focus:ring-accent"
          >
            {countries.map((c) => (
              <option key={c} value={c} className="bg-ink-850">
                {c === 'all' ? 'Все страны' : c}
              </option>
            ))}
          </select>
        </div>

        {/* Сетка поездок */}
        {filtered.length === 0 ? (
          <GlassPanel className="flex flex-col items-center justify-center px-8 py-14 text-center">
            <MapPin className="mb-3 h-9 w-9 text-text-muted" aria-hidden="true" />
            <p className="font-sans text-sm text-text-secondary">
              Под этот фильтр поездок нет
            </p>
            <button
              onClick={() => {
                setStatus('all')
                setCountry('all')
              }}
              className="mt-2 font-sans text-sm text-link hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Сбросить фильтры
            </button>
          </GlassPanel>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((trip) => {
              const PrivacyIcon = privacyIcon[trip.privacy]
              return (
                <button
                  key={trip.id}
                  onClick={() => setOpenId(trip.id)}
                  className="group overflow-hidden rounded-lg border border-hairline bg-panel text-left transition duration-base ease-standard hover:-translate-y-0.5 hover:border-hairline-2 hover:bg-panel-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Img
                      src={trip.cover}
                      alt={trip.title}
                      className="h-full w-full object-cover transition-transform duration-[700ms] ease-out group-hover:scale-[1.06]"
                    />
                    <div className="photo-scrim absolute inset-0" />
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <p className="font-display text-2xl font-semibold leading-tight text-white">
                        {trip.title}
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 font-sans text-xs text-white/75">
                        <MapPin className="h-3 w-3" aria-hidden="true" />
                        {trip.city}
                      </p>
                    </div>
                    {trip.status === 'ongoing' && (
                      <span className="absolute right-3 top-3">
                        <Chip variant="active" size="sm">Идёт</Chip>
                      </span>
                    )}
                  </div>

                  <div className="p-4">
                    <p className="mb-3 font-sans text-xs text-text-muted">{formatTripDates(trip)}</p>
                    <div className="flex items-center justify-between gap-2 font-sans text-xs text-text-secondary">
                      <span className="flex items-center gap-3">
                        <span className="tabular">{trip.stats.days} дн.</span>
                        <span className="tabular">{trip.stats.distanceKm} км</span>
                        <span className="tabular">{trip.stats.placesVisited} мест</span>
                      </span>
                      <span
                        className="flex shrink-0 items-center gap-1 text-text-muted"
                        title={privacyLabel[trip.privacy]}
                      >
                        <PrivacyIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        <GlassPanel className="mt-6 flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <p className="font-sans text-sm font-semibold text-text">
              Новая поездка соберётся сама
            </p>
            <p className="mt-1 max-w-[52ch] font-sans text-xs leading-relaxed text-text-muted">
              Постройте маршрут в разделе Маршрут. Когда поездка завершится, Crista соберёт
              страницу из точек, снимков и статистики.
            </p>
          </div>
          <Button variant="secondary" onClick={onBack}>
            <Plus />
            К построению маршрута
          </Button>
        </GlassPanel>
      </div>
    </div>
  )
}
