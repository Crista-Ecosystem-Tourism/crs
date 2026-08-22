import { useState } from 'react'
import { CheckCircle2, Circle, MapPin, Landmark, UtensilsCrossed, Sparkles, Trophy } from 'lucide-react'
import { GlassPanel, Chip, DisplayTitle } from '@/components/ui/glass'
import {
  questCategoryLabel,
  type GameCountry,
  type QuestCategory,
  type QuestPoint,
} from '@/mocks/game'
import { cn, pluralize } from '@/lib/utils'

const categoryIcon: Record<QuestCategory, typeof Landmark> = {
  sights: Landmark,
  food: UtensilsCrossed,
  traditions: Sparkles,
}

interface CountryQuestsProps {
  country: GameCountry
  isDone: (id: string) => boolean
  onToggle: (id: string) => void
  progress: number
  cityProgress: (country: GameCountry, cityId: string) => number
}

function QuestRow({
  quest,
  done,
  onToggle,
}: {
  quest: QuestPoint
  done: boolean
  onToggle: () => void
}) {
  const Icon = categoryIcon[quest.category]
  return (
    <button
      onClick={onToggle}
      aria-pressed={done}
      className={cn(
        'flex w-full items-start gap-3 rounded-md p-3 text-left transition duration-base ease-standard',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        done ? 'bg-primary/[0.08]' : 'hover:bg-panel-2'
      )}
    >
      {done ? (
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
      ) : (
        <Circle className="mt-0.5 h-5 w-5 shrink-0 text-text-muted" aria-hidden="true" />
      )}

      <span className="min-w-0 flex-1">
        <span
          className={cn(
            'block font-sans text-sm font-medium',
            done ? 'text-text-muted line-through' : 'text-text'
          )}
        >
          {quest.title}
        </span>
        <span className="mt-0.5 block font-sans text-xs leading-relaxed text-text-muted">
          {quest.hint}
        </span>
      </span>

      <span className="flex shrink-0 items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-text-muted" aria-hidden="true" />
        <span
          className={cn(
            'font-sans text-xs font-bold tabular',
            done ? 'text-primary' : 'text-text-muted'
          )}
        >
          {quest.points}
        </span>
      </span>
    </button>
  )
}

export function CountryQuests({
  country,
  isDone,
  onToggle,
  progress,
  cityProgress,
}: CountryQuestsProps) {
  const [activeCityId, setActiveCityId] = useState(country.cities[0]?.id ?? '')
  const city = country.cities.find((c) => c.id === activeCityId) ?? country.cities[0]

  if (!country.opened || country.cities.length === 0) {
    return (
      <GlassPanel className="flex flex-col items-center justify-center px-8 py-12 text-center">
        <MapPin className="mb-3 h-9 w-9 text-text-muted" aria-hidden="true" />
        <p className="font-sans text-sm text-text-secondary">
          {country.name} ещё белое пятно на вашей карте
        </p>
        <p className="mt-1 max-w-[40ch] font-sans text-xs leading-relaxed text-text-muted">
          Постройте маршрут в эту страну в разделе Маршрут, и здесь появятся регионы, города и точки квестов.
        </p>
      </GlassPanel>
    )
  }

  const allDone = progress === 100

  return (
    <GlassPanel className="overflow-hidden p-0">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline p-5">
        <div className="flex items-center gap-3">
          <span className="text-3xl leading-none" aria-hidden="true">{country.flag}</span>
          <span>
            <DisplayTitle as="h2" className="!text-3xl">{country.name}</DisplayTitle>
            <span className="mt-0.5 block font-sans text-sm tabular text-text-secondary">
              Закрыто {progress}%
            </span>
          </span>
        </div>
        {allDone ? (
          <Chip variant="active">
            <Trophy />
            Страна закрыта полностью
          </Chip>
        ) : (
          <Chip>{pluralize(country.cities.length, 'город', 'города', 'городов')}</Chip>
        )}
      </div>

      {/* Города */}
      <div className="flex flex-wrap gap-1.5 border-b border-hairline p-3">
        {country.cities.map((c) => {
          const p = cityProgress(country, c.id)
          const active = c.id === activeCityId
          return (
            <button
              key={c.id}
              onClick={() => setActiveCityId(c.id)}
              aria-pressed={active}
              className={cn(
                'flex items-center gap-2 rounded-full px-3.5 py-2 font-sans text-sm font-medium transition duration-base',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                active
                  ? 'bg-teal-700 text-white'
                  : 'text-text-secondary hover:bg-panel-2 hover:text-text'
              )}
            >
              {c.name}
              <span className={cn('text-xs tabular', active ? 'text-white/75' : 'text-text-muted')}>
                {p}%
              </span>
            </button>
          )
        })}
      </div>

      {/* Точки квестов выбранного города */}
      {city && (
        <div className="p-2">
          {city.quests.map((q) => (
            <QuestRow
              key={q.id}
              quest={q}
              done={isDone(q.id)}
              onToggle={() => onToggle(q.id)}
            />
          ))}
        </div>
      )}

      <p className="flex items-center gap-2 border-t border-hairline px-5 py-3 font-sans text-xs text-text-muted">
        <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        Категории: {Object.values(questCategoryLabel).join(', ')}
      </p>
    </GlassPanel>
  )
}
