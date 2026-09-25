import { useEffect, useState } from 'react'
import { Award, BatteryMedium, CheckCircle2, Flame, LockKeyhole, MapPin, Sparkles } from 'lucide-react'
import { ApiError } from '@/api/chatApi'
import {
  answerMoscowQuest,
  getMoscowQuest,
  type MoscowQuestState,
} from '@/api/gameApi'
import { Chip, GlassPanel } from '@/components/ui/glass'
import { useApp } from '@/context/AppContext'
import { getGameCopy } from '@/lib/gameCopy'

type ViewState = 'loading' | 'ready' | 'answering' | 'locked' | 'error'

/** A live Moscow node. Prerequisites and rewards stay enforced by the API. */
export function MoscowQuest({
  signedIn,
  refreshKey,
  questId,
  onCompleted,
}: {
  signedIn: boolean
  refreshKey: number
  questId: string
  onCompleted?: () => void
}) {
  const { language } = useApp()
  const copy = getGameCopy(language)
  const [state, setState] = useState<MoscowQuestState | null>(null)
  const [view, setView] = useState<ViewState>('loading')
  const [message, setMessage] = useState<string | null>(null)
  const [explanation, setExplanation] = useState<string | null>(null)

  useEffect(() => {
    if (!signedIn) return
    let active = true
    setView('loading')
    getMoscowQuest(questId, language)
      .then((result) => {
        if (!active) return
        setState(result)
        setView('ready')
      })
      .catch((error: unknown) => {
        if (!active) return
        if (error instanceof ApiError && error.status === 409) {
          setView('locked')
          return
        }
        setMessage(language === 'ru' && error instanceof ApiError ? error.message : copy.moscowQuest.saveFailed)
        setView('error')
      })
    return () => { active = false }
  }, [questId, refreshKey, signedIn, language])

  const choose = async (answerKey: string) => {
    if (!state || view === 'answering' || state.completed) return
    setView('answering')
    setMessage(null)
    setExplanation(null)
    try {
      const result = await answerMoscowQuest(state.quest.id, answerKey, language)
      setState((previous) => previous ? {
        ...previous,
        profile: result.profile,
        daily: result.daily,
        completed: result.completed,
        stamp: result.stamp,
      } : previous)
      setExplanation(result.explanation)
      if (result.completed) onCompleted?.()
      setMessage(result.correct
        ? result.xp_awarded ? copy.moscowQuest.answerAwarded(result.xp_awarded) : copy.moscowQuest.answerAlreadyCompleted
        : copy.moscowQuest.answerIncorrect)
      setView('ready')
    } catch (error) {
      setMessage(language === 'ru' && error instanceof ApiError ? error.message : copy.moscowQuest.saveFailed)
      setView('ready')
    }
  }

  if (!signedIn || view === 'loading') return null

  if (view === 'locked') {
    return (
      <GlassPanel variant="flat" className="flex items-start gap-3 border-white/10 p-4 sm:p-5">
        <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-text-muted" />
        <p className="font-sans text-sm leading-6 text-text-secondary">
          {copy.moscowQuest.locked}
        </p>
      </GlassPanel>
    )
  }

  if (view === 'error' || !state) {
    return (
      <GlassPanel variant="flat" className="border-danger/30 p-4 font-sans text-sm text-text-secondary">
        {copy.moscowQuest.unavailable(message ?? copy.moscowQuest.retry)}
      </GlassPanel>
    )
  }

  const { content, daily, profile } = state
  return (
    <GlassPanel className="overflow-hidden border-primary/20 p-0">
      <div className="bg-[linear-gradient(120deg,rgba(11,125,127,0.16),rgba(107,91,255,0.12))] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Chip variant="active"><MapPin /> {copy.moscowQuest.point(state.quest.position)}</Chip>
          <div className="flex items-center gap-2">
            <Chip size="sm"><Award /> {profile.xp} XP</Chip>
            <Chip size="sm"><BatteryMedium /> {profile.energy}/5</Chip>
            <Chip size="sm"><Flame /> {copy.streakDays(daily.streak)}</Chip>
          </div>
        </div>
        <p className="mt-4 font-sans text-sm text-text-secondary">{content.chris.name} · {copy.guide}</p>
        <h2 className="mt-1 font-display text-2xl font-semibold text-text">{content.scene.title}</h2>
        <p className="mt-3 max-w-2xl font-sans text-sm leading-6 text-text-secondary">{content.chris.intro}</p>
      </div>
      <div className="p-5 sm:p-6">
        {state.content_language !== language && <p className="mb-4 rounded bg-panel-2 px-3 py-2 font-sans text-xs text-text-muted">{copy.contentLanguageNote}</p>}
        {state.completed ? (
          <div className="flex items-start gap-3 rounded-md bg-primary/10 p-4">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <p className="font-sans text-sm text-text-secondary">
              {copy.moscowQuest.savedStamp(state.stamp?.title ?? (language === 'en' ? 'City stamp' : 'Штамп'))}
            </p>
          </div>
        ) : (
          <>
            <div className="rounded-md bg-panel-2/70 p-4">
              <p className="font-sans text-sm leading-6 text-text-secondary">{content.fact.text}</p>
              <a className="mt-2 inline-block font-sans text-xs text-primary hover:underline" href={content.fact.source_url} target="_blank" rel="noreferrer">
                {copy.source}: {content.fact.source_label ?? (language === 'en' ? 'Open source' : 'Открыть источник')}
              </a>
            </div>
            <p className="mt-3 font-sans text-xs text-text-muted">
              {copy.moscowQuest.dailyGoal(daily.completed_quests, daily.goal, daily.goal_reached)}
            </p>
            <p className="mt-5 font-display text-lg font-semibold text-text">{content.question.text}</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {content.question.options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  disabled={view === 'answering' || profile.energy === 0}
                  onClick={() => void choose(option.id)}
                  className="rounded-md border border-white/10 bg-panel-2 px-4 py-3 text-left font-sans text-sm text-text-secondary transition hover:border-primary/50 hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {option.label}
                </button>
              ))}
            </div>
            {profile.energy === 0 && <p className="mt-3 font-sans text-xs text-warning">{copy.moscowQuest.energyEmpty}</p>}
          </>
        )}
        {message && (
          <p className="mt-4 flex items-center gap-2 font-sans text-sm text-text-secondary">
            <Sparkles className="h-4 w-4 text-accent-soft" /> {message}
          </p>
        )}
        {explanation && (
          <p className="mt-3 rounded-md border border-white/10 bg-panel-2/60 p-3 font-sans text-sm leading-6 text-text-secondary">
            {explanation}
          </p>
        )}
      </div>
    </GlassPanel>
  )
}
