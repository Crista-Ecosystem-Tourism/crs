import { ArrowRight, BatteryMedium, Flame, PiggyBank, Sparkles, Stamp } from 'lucide-react'
import { GlassPanel, Chip, StatTile } from '@/components/ui/glass'
import { Button } from '@/components/ui/button'
import { useApp } from '@/context/AppContext'
import type { GamePassport } from '@/api/gameApi'
import type { HomePassportState } from '@/hooks/useHomePassport'
import { useSuitcaseWorkspace } from '@/hooks/useSuitcaseWorkspace'
import { getHomeCopy } from '@/lib/homeCopy'

function percent(done: number, total: number) {
  return total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0
}

export function LiveHomeStats({ passport }: { passport: GamePassport | null }) {
  const { language } = useApp()
  const copy = getHomeCopy(language).live
  if (!passport) return null
  const streak = passport.daily?.streak ?? passport.profile.streak
  return (
    <>
      <StatTile icon={<Sparkles />} value={`${passport.profile.xp}`} label={copy.xp} />
      <StatTile icon={<Flame />} value={copy.streak(streak)} label={copy.streakLabel} />
      <StatTile icon={<Stamp />} value={`${passport.stamps.length}`} label={copy.stamps} />
    </>
  )
}

export function LiveHomeColumn({ state, onRetry }: { state: HomePassportState; onRetry: () => void }) {
  const { language, setMainView, openModal, user } = useApp()
  const copy = getHomeCopy(language).live
  const workspace = useSuitcaseWorkspace(Boolean(user))
  const goal = workspace.goals[0]

  if (state.status === 'idle') {
    return (
      <GlassPanel variant="photo" className="p-5">
        <p className="font-display text-xl font-semibold text-text">{copy.signInTitle}</p>
        <p className="mt-2 font-sans text-sm leading-relaxed text-text-secondary">{copy.signInText}</p>
        <Button className="mt-4 w-full" onClick={() => openModal('auth')}>{copy.signIn}</Button>
      </GlassPanel>
    )
  }

  if (state.status === 'loading') {
    return (
      <GlassPanel variant="photo" className="p-5" role="status">
        <p className="font-sans text-sm text-text-secondary">{copy.loading}</p>
      </GlassPanel>
    )
  }

  if (state.status === 'error') {
    return (
      <GlassPanel variant="photo" className="p-5" role="status">
        <p className="font-sans text-sm text-text-secondary">{copy.loadFailed}</p>
        <Button variant="secondary" className="mt-3" onClick={onRetry}>{copy.retry}</Button>
      </GlassPanel>
    )
  }

  const { passport } = state
  const focusCity = passport.cities.find((city) => city.completed_quests < city.required_quest_count)
    ?? passport.cities[0]
  const daily = passport.daily

  return (
    <>
      <GlassPanel variant="photo" className="p-5">
        <p className="font-sans text-xs uppercase tracking-wide text-text-muted">{copy.cityFocus}</p>
        {focusCity ? (
          <>
            <p className="mt-1 truncate font-display text-2xl font-semibold text-text">{focusCity.name}</p>
            <p className="mt-2 font-sans text-sm text-text-secondary">
              {copy.cityProgress(focusCity.completed_quests, focusCity.required_quest_count)}
            </p>
            <div
              className="mt-3 h-1.5 overflow-hidden rounded-full bg-panel-2"
              role="progressbar"
              aria-label={focusCity.name}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percent(focusCity.completed_quests, focusCity.required_quest_count)}
            >
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: `${percent(focusCity.completed_quests, focusCity.required_quest_count)}%` }}
              />
            </div>
          </>
        ) : (
          <p className="mt-2 font-sans text-sm text-text-secondary">{copy.noCities}</p>
        )}
        <Button variant="secondary" className="mt-4 w-full" onClick={() => setMainView('game')}>
          {getHomeCopy(language).continueGame}
          <ArrowRight />
        </Button>
      </GlassPanel>

      <GlassPanel variant="photo" className="p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="font-sans text-sm font-semibold text-text">{copy.today}</p>
          <div className="flex gap-2">
            <Chip size="sm"><Flame /> {copy.streak(daily?.streak ?? passport.profile.streak)}</Chip>
            <Chip size="sm"><BatteryMedium /> {copy.energy(passport.profile.energy)}</Chip>
          </div>
        </div>
        {daily && (
          <>
            <p className="mt-3 font-sans text-sm text-text-secondary">{copy.dailyGoal(daily.completed_quests, daily.goal)}</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-panel-2">
              <div className="h-full rounded-full bg-primary" style={{ width: `${percent(daily.completed_quests, daily.goal)}%` }} />
            </div>
            {daily.goal_reached && <p className="mt-2 font-sans text-xs text-text-secondary">{copy.goalReached}</p>}
          </>
        )}
      </GlassPanel>

      {goal && (
        <GlassPanel variant="photo" className="p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-panel-2 text-primary">
              <PiggyBank className="h-[18px] w-[18px]" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-sans text-sm font-semibold text-text">{copy.savingsGoal(goal.title)}</p>
              <p className="font-sans text-xs tabular text-text-muted">{copy.savingsProgress(goal.current, goal.total)}</p>
            </div>
          </div>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-panel-2">
            <div className="h-full rounded-full bg-primary" style={{ width: `${percent(goal.current, goal.total)}%` }} />
          </div>
        </GlassPanel>
      )}
    </>
  )
}
