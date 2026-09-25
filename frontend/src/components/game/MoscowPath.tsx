import { useEffect, useState } from 'react'
import { Award, CheckCircle2, Circle, Crown, Flame, LockKeyhole, MapPin } from 'lucide-react'
import { ApiError } from '@/api/chatApi'
import { getMoscowPath, type MoscowPathState } from '@/api/gameApi'
import { Chip, GlassPanel } from '@/components/ui/glass'
import { useApp } from '@/context/AppContext'
import { getGameCopy } from '@/lib/gameCopy'

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
  const { language } = useApp()
  const copy = getGameCopy(language)
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
        setError(language === 'ru' && requestError instanceof ApiError ? requestError.message : copy.moscowPathLoadFailed)
      })
    return () => { active = false }
  }, [refreshKey, signedIn, language])

  if (!signedIn || !state) {
    return error ? (
      <GlassPanel variant="flat" className="border-danger/30 p-4 font-sans text-sm text-text-secondary">
        {copy.moscowPathUnavailable(error)}
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
          <p className="font-sans text-xs uppercase tracking-wide text-text-muted">{copy.moscowRouteLabel}</p>
          <h2 className="mt-1 font-display text-xl font-semibold text-text">{copy.moscowCity}</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Chip size="sm"><Award /> {state.profile.xp} XP</Chip>
          <Chip size="sm"><Flame /> {copy.streakDays(state.daily.streak)}</Chip>
        </div>
      </div>
      <p className="mt-3 font-sans text-xs text-text-muted">
        {copy.moscowRouteSummary(state.city.tier, state.nodes.filter((node) => node.completed).length, state.city.required_quest_count, state.daily.completed_quests, state.daily.goal, state.daily.goal_reached)}
      </p>
      <ol className="mt-5 space-y-5" aria-label={copy.routeNodes}>
        {groupedNodes.map((districtNodes) => (
          <li key={districtNodes[0].district?.id ?? 'unassigned'}>
            <p className="mb-2 font-sans text-xs uppercase tracking-wide text-text-muted">
              {districtNodes[0].district ? copy.moscowDistrictNames[districtNodes[0].district.id] ?? districtNodes[0].district.name : copy.routeFallbackLabel}
            </p>
            <ol className="space-y-2">
              {districtNodes.map((node) => {
                const label = copy.moscowNodeNames[node.id] ?? copy.pointNumber(node.position)
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
                    {node.completed ? copy.nodeStatus.completed : node.unlocked ? isStarter ? copy.nodeStatus.beginAbove : copy.nodeStatus.openQuest : copy.nodeStatus.locked}
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
                <span className="block font-sans text-sm font-medium text-text">{copy.finalRound}</span>
              <span className="mt-0.5 block font-sans text-xs text-text-muted">
                {state.boss.completed
                  ? copy.bossCompleted
                  : state.boss.unlocked
                    ? copy.bossQuestionCount(state.boss.question_count)
                    : copy.bossLocked}
              </span>
            </span>
            <Crown className="h-4 w-4 text-text-muted" aria-hidden="true" />
          </button>
        </div>
      )}
    </GlassPanel>
  )
}
