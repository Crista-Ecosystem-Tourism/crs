import { useEffect, useState } from 'react'
import { Award, CheckCircle2, Circle, Crown, Flame, LockKeyhole, MapPin } from 'lucide-react'
import { ApiError } from '@/api/chatApi'
import { getMoscowPath, type MoscowPathState } from '@/api/gameApi'
import { Chip, GlassPanel } from '@/components/ui/glass'

const nodeLabels: Record<string, string> = {
  'moscow-red-square': 'Красная площадь',
  'moscow-spasskaya-tower': 'Спасская башня',
  'moscow-tsar-bell': 'Царь-колокол',
  'moscow-annunciation-cathedral': 'Благовещенский собор',
  'moscow-gum': 'ГУМ',
  'moscow-zaryadye': 'Парк «Зарядье»',
  'moscow-tretyakov-gallery': 'Третьяковская галерея',
  'moscow-bolshoi-theatre': 'Большой театр',
  'moscow-metro': 'Московское метро',
  'moscow-vdnh': 'ВДНХ',
}

export function MoscowPath({
  signedIn,
  refreshKey,
  onSelect,
  onSelectBoss,
}: {
  signedIn: boolean
  refreshKey: number
  onSelect: (questId: string) => void
  onSelectBoss: () => void
}) {
  const [state, setState] = useState<MoscowPathState | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!signedIn) return
    let active = true
    getMoscowPath()
      .then((result) => {
        if (!active) return
        setState(result)
        setError(null)
      })
      .catch((requestError: unknown) => {
        if (!active) return
        setError(requestError instanceof ApiError ? requestError.message : 'не удалось загрузить путь')
      })
    return () => { active = false }
  }, [refreshKey, signedIn])

  if (!signedIn || !state) {
    return error ? (
      <GlassPanel variant="flat" className="border-danger/30 p-4 font-sans text-sm text-text-secondary">
        Маршрут Москвы пока недоступен: {error}.
      </GlassPanel>
    ) : null
  }

  const districts = new Map<string, typeof state.nodes>()
  for (const node of state.nodes) {
    const districtId = node.district?.id ?? 'unassigned'
    const current = districts.get(districtId) ?? []
    current.push(node)
    districts.set(districtId, current)
  }
  const groupedNodes = [...districts.values()]

  return (
    <GlassPanel variant="flat" className="p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-sans text-xs uppercase tracking-wide text-text-muted">Маршрут города</p>
          <h2 className="mt-1 font-display text-xl font-semibold text-text">{state.city.name}</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Chip size="sm"><Award /> {state.profile.xp} XP</Chip>
          <Chip size="sm"><Flame /> {state.daily.streak} дн.</Chip>
        </div>
      </div>
      <p className="mt-3 font-sans text-xs text-text-muted">
        Маршрут tier {state.city.tier}: {state.nodes.filter((node) => node.completed).length}/{state.city.required_quest_count} точек. Сегодня: {state.daily.completed_quests}/{state.daily.goal} точек{state.daily.goal_reached ? ' · цель выполнена' : ''}.
      </p>
      <ol className="mt-5 space-y-5" aria-label="Точки маршрута по Москве">
        {groupedNodes.map((districtNodes) => (
          <li key={districtNodes[0].district?.id ?? 'unassigned'}>
            <p className="mb-2 font-sans text-xs uppercase tracking-wide text-text-muted">
              {districtNodes[0].district?.name ?? 'Маршрут Москвы'}
            </p>
            <ol className="space-y-2">
              {districtNodes.map((node) => {
                const label = nodeLabels[node.id] ?? `Точка ${node.position}`
                const isStarter = node.id === 'moscow-red-square'
                const Icon = node.completed ? CheckCircle2 : node.unlocked ? Circle : LockKeyhole
                const interactive = node.unlocked && !node.completed && !isStarter
                return (
                  <li key={node.id}>
              <button
                type="button"
                disabled={!interactive}
                onClick={() => interactive && onSelect(node.id)}
                className="flex w-full items-center gap-3 rounded-md border border-white/10 bg-panel-2/60 px-4 py-3 text-left transition enabled:hover:border-primary/50 enabled:hover:bg-primary/10 disabled:cursor-default"
              >
                <Icon className={`h-5 w-5 shrink-0 ${node.completed ? 'text-primary' : node.unlocked ? 'text-accent-soft' : 'text-text-muted'}`} />
                <span className="flex-1">
                  <span className="block font-sans text-sm font-medium text-text">{node.position}. {label}</span>
                  <span className="mt-0.5 block font-sans text-xs text-text-muted">
                    {node.completed ? 'Пройдено' : node.unlocked ? isStarter ? 'Начните выше' : 'Открыто — пройти квест' : 'Откроется после предыдущей точки'}
                  </span>
                </span>
                <MapPin className="h-4 w-4 text-text-muted" aria-hidden="true" />
              </button>
                  </li>
                )
              })}
            </ol>
          </li>
        ))}
      </ol>
      {state.boss && (
        <div className="mt-5 border-t border-white/10 pt-5">
          <button
            type="button"
            disabled={!state.boss.unlocked || state.boss.completed}
            onClick={() => state.boss?.unlocked && !state.boss.completed && onSelectBoss()}
            className="flex w-full items-center gap-3 rounded-md border border-amber-300/20 bg-amber-300/5 px-4 py-3 text-left transition enabled:hover:border-amber-300/50 enabled:hover:bg-amber-300/10 disabled:cursor-default"
          >
            {state.boss.completed ? <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" /> : state.boss.unlocked ? <Crown className="h-5 w-5 shrink-0 text-amber-200" /> : <LockKeyhole className="h-5 w-5 shrink-0 text-text-muted" />}
            <span className="flex-1">
              <span className="block font-sans text-sm font-medium text-text">{state.boss.title}</span>
              <span className="mt-0.5 block font-sans text-xs text-text-muted">
                {state.boss.completed
                  ? 'Городской штамп получен · sandbox открыт'
                  : state.boss.unlocked
                    ? `${state.boss.question_count} вопроса · получить городской штамп`
                    : 'Откроется после всех точек маршрута'}
              </span>
            </span>
            <Crown className="h-4 w-4 text-text-muted" aria-hidden="true" />
          </button>
        </div>
      )}
    </GlassPanel>
  )
}
