import { useState } from 'react'
import {
  ArrowLeft, MapPin, CalendarDays, Route, Wallet, PiggyBank, Stamp,
  Link2, Check, Globe, Lock, Users,
} from 'lucide-react'
import { GlassPanel, Chip, IconButton, DisplayTitle, StatTile } from '@/components/ui/glass'
import { Button } from '@/components/ui/button'
import { Img } from '@/components/ui/Img'
import { formatTripDates, privacyLabel, type Trip, type TripPrivacy } from '@/mocks/trips'
import { cn } from '@/lib/utils'

interface TripArticleProps {
  trip: Trip
  onBack: () => void
  onPrivacyChange: (id: string, privacy: TripPrivacy) => void
}

const privacyIcon: Record<TripPrivacy, typeof Globe> = {
  public: Globe,
  link: Link2,
  private: Lock,
}

/**
 * Мини-сайт поездки. Собирается из данных маршрута, прогресса и фото:
 * отдельного источника данных у страницы нет, только шаблон поверх поездки.
 */
export function TripArticle({ trip, onBack, onPrivacyChange }: TripArticleProps) {
  const [copied, setCopied] = useState(false)
  const shareUrl = `crista.online/t/${trip.slug}`

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`https://${shareUrl}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  const days = [...new Set(trip.points.map((p) => p.day))].sort((a, b) => a - b)

  return (
    <div className="h-full overflow-y-auto">
      <div className="relative z-10">
        <div className="mx-auto flex max-w-[880px] items-center justify-between gap-3 px-5 pb-2 pt-6 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <IconButton label="Ко всем поездкам" variant="ghost" size="sm" className="-ml-2" onClick={onBack}>
              <ArrowLeft />
            </IconButton>
            <h1 className="truncate font-sans text-sm text-text-muted">Мини-сайт поездки</h1>
          </div>
          <Button variant="secondary" size="sm" onClick={copyLink}>
            {copied ? <Check /> : <Link2 />}
            {copied ? 'Ссылка скопирована' : 'Скопировать ссылку'}
          </Button>
        </div>
      </div>

      <article className="mx-auto w-full max-w-[880px] px-5 pb-8 pt-4 sm:px-6">
        {/* Обложка */}
        <div className="relative mb-8 aspect-[16/8] overflow-hidden rounded-lg">
          <Img src={trip.cover} alt={trip.title} className="h-full w-full object-cover" />
          <div className="photo-scrim absolute inset-0" />
          <div className="absolute inset-x-0 bottom-0 p-6">
            <p className="mb-2 flex items-center gap-1.5 font-sans text-xs text-white/75">
              <MapPin className="h-3 w-3" aria-hidden="true" />
              {trip.city}, {trip.country}
            </p>
            <DisplayTitle className="!text-4xl text-white sm:!text-5xl">{trip.title}</DisplayTitle>
            <p className="mt-2 font-sans text-sm text-white/75">{formatTripDates(trip)}</p>
          </div>
          {trip.status === 'ongoing' && (
            <span className="absolute right-4 top-4">
              <Chip variant="active" size="sm">Поездка идёт</Chip>
            </span>
          )}
        </div>

        {/* Лид */}
        <p className="mb-8 max-w-[68ch] font-accent text-xl leading-relaxed text-text-secondary">
          {trip.summary}
        </p>

        {/* Статистика */}
        <GlassPanel className="mb-8 grid grid-cols-2 gap-x-4 gap-y-5 p-5 sm:grid-cols-3">
          <StatTile icon={<CalendarDays />} value={`${trip.stats.days}`} label="дней в пути" />
          <StatTile icon={<Route />} value={`${trip.stats.distanceKm} км`} label="пройдено" />
          <StatTile icon={<MapPin />} value={`${trip.stats.placesVisited}`} label="мест посещено" />
          <StatTile
            icon={<Wallet />}
            value={`${trip.stats.budget.toLocaleString('ru')} ₽`}
            label="бюджет поездки"
          />
          <StatTile
            icon={<PiggyBank />}
            value={`${trip.stats.saved.toLocaleString('ru')} ₽`}
            label="сэкономлено"
          />
          <StatTile icon={<Stamp />} value={`${trip.stats.stamps}`} label="штампов" />
        </GlassPanel>

        {/* Маршрут по дням */}
        <h2 className="mb-4 font-display text-2xl font-semibold text-text">Как это было</h2>
        <div className="mb-8 space-y-6">
          {days.map((day) => (
            <div key={day} className="flex gap-4">
              <div className="flex shrink-0 flex-col items-center">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 font-sans text-xs font-bold tabular text-primary">
                  {day}
                </span>
                <span className="mt-2 w-px flex-1 bg-panel-2" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1 space-y-3 pb-2">
                <p className="font-sans text-xs uppercase tracking-wide text-text-muted">
                  День {day}
                </p>
                {trip.points
                  .filter((p) => p.day === day)
                  .map((p) => (
                    <GlassPanel key={p.id} variant="flat" className="p-4">
                      <p className="font-display text-lg font-semibold text-text">{p.title}</p>
                      <p className="mt-1 font-sans text-sm leading-relaxed text-text-secondary">
                        {p.note}
                      </p>
                    </GlassPanel>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Фото */}
        {trip.photos.length > 0 && (
          <>
            <h2 className="mb-4 font-display text-2xl font-semibold text-text">Снимки</h2>
            <div className="mb-8 grid gap-3 sm:grid-cols-3">
              {trip.photos.map((src, i) => (
                <div key={src} className="aspect-[4/3] overflow-hidden rounded-md">
                  <Img
                    src={src}
                    alt={`${trip.title}, снимок ${i + 1}`}
                    className="h-full w-full object-cover transition-transform duration-[700ms] ease-out hover:scale-[1.06]"
                  />
                </div>
              ))}
            </div>
          </>
        )}

        {/* Приватность и ссылка */}
        <GlassPanel className="p-5">
          <h2 className="mb-1 font-sans text-sm font-semibold text-text">Кто видит эту страницу</h2>
          <p className="mb-4 font-sans text-xs text-text-muted">
            Публичные мини-сайты индексируются поисковиками и попадают в ваш профиль.
          </p>

          <div className="mb-4 flex flex-wrap gap-2">
            {(Object.keys(privacyLabel) as TripPrivacy[]).map((p) => {
              const Icon = privacyIcon[p]
              const active = trip.privacy === p
              return (
                <button
                  key={p}
                  onClick={() => onPrivacyChange(trip.id, p)}
                  aria-pressed={active}
                  className={cn(
                    'flex items-center gap-2 rounded-full px-3.5 py-2 font-sans text-sm font-medium transition duration-base',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                    active
                      ? 'bg-teal-700 text-white'
                      : 'text-text-secondary hover:bg-panel-2 hover:text-text'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {privacyLabel[p]}
                </button>
              )
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3 rounded-md border border-hairline bg-panel p-3">
            <Link2 className="h-4 w-4 shrink-0 text-text-muted" aria-hidden="true" />
            <code className="min-w-0 flex-1 truncate font-mono text-xs text-text-secondary">
              {shareUrl}
            </code>
            <Button variant="ghost" size="sm" onClick={copyLink}>
              {copied ? 'Готово' : 'Копировать'}
            </Button>
          </div>

          {trip.privacy === 'private' && (
            <p className="mt-3 flex items-center gap-2 font-sans text-xs text-text-muted">
              <Users className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              Сейчас страницу видите только вы. Ссылка не откроется у других.
            </p>
          )}
        </GlassPanel>
      </article>
    </div>
  )
}
