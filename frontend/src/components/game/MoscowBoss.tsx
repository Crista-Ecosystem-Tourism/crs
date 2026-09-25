import { useEffect, useState } from 'react'
import { Award, BatteryMedium, CheckCircle2, Crown, Flame, Sparkles } from 'lucide-react'
import { ApiError } from '@/api/chatApi'
import {
  answerMoscowBoss,
  getMoscowBoss,
  type MoscowBossState,
} from '@/api/gameApi'
import { Chip, GlassPanel } from '@/components/ui/glass'
import { useApp } from '@/context/AppContext'
import { getGameCopy } from '@/lib/gameCopy'

type ViewState = 'loading' | 'ready' | 'answering' | 'locked' | 'error'

/** The city stamp is issued by the API only after one complete three-question answer. */
export function MoscowBoss({
  signedIn,
  refreshKey,
  onCompleted,
}: {
  signedIn: boolean
  refreshKey: number
  onCompleted?: () => void
}) {
  const { language } = useApp()
  const copy = getGameCopy(language)
  const [state, setState] = useState<MoscowBossState | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [view, setView] = useState<ViewState>('loading')
  const [message, setMessage] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<Array<{ question_id: string; correct: boolean; explanation: string }>>([])

  useEffect(() => {
    if (!signedIn) return
    let active = true
    setView('loading')
    getMoscowBoss(language)
      .then((result) => {
        if (!active) return
        setState(result)
        setAnswers({})
        setFeedback([])
        setView('ready')
      })
      .catch((error: unknown) => {
        if (!active) return
        if (error instanceof ApiError && error.status === 409) {
          setView('locked')
          return
        }
        setMessage(language === 'ru' && error instanceof ApiError ? error.message : copy.moscowBoss.retry)
        setView('error')
      })
    return () => { active = false }
  }, [refreshKey, signedIn, language])

  const submit = async () => {
    if (!state || view === 'answering' || state.completed) return
    setView('answering')
    setMessage(null)
    try {
      const result = await answerMoscowBoss(
        state.content.questions.map((question) => ({
          question_id: question.id,
          answer_key: answers[question.id] ?? '',
        })),
        language,
      )
      setState((previous) => previous ? {
        ...previous,
        profile: result.profile,
        daily: result.daily,
        completed: result.completed,
        city_stamp: result.city_stamp,
        sandbox_unlocked: result.sandbox_unlocked,
      } : previous)
      setFeedback(result.feedback)
      if (result.completed) onCompleted?.()
      setMessage(result.correct ? copy.moscowBoss.allCorrect : copy.moscowBoss.incorrectSummary(result.incorrect_answers))
      setView('ready')
    } catch (error) {
      setMessage(language === 'ru' && error instanceof ApiError ? error.message : copy.moscowBoss.saveFailed)
      setView('ready')
    }
  }

  if (!signedIn || view === 'loading') return null
  if (view === 'locked') return null
  if (view === 'error' || !state) {
    return (
      <GlassPanel variant="flat" className="border-danger/30 p-4 font-sans text-sm text-text-secondary">
        {copy.moscowBoss.unavailable(message ?? copy.moscowBoss.retry)}
      </GlassPanel>
    )
  }

  const complete = Object.keys(answers).length === state.content.questions.length
  return (
    <GlassPanel className="overflow-hidden border-amber-300/20 p-0">
      <div className="bg-[linear-gradient(120deg,rgba(227,200,120,0.16),rgba(11,125,127,0.12))] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Chip variant="active"><Crown /> {copy.finalRound}</Chip>
          <div className="flex items-center gap-2">
            <Chip size="sm"><Award /> {state.profile.xp} XP</Chip>
            <Chip size="sm"><BatteryMedium /> {state.profile.energy}/5</Chip>
            <Chip size="sm"><Flame /> {copy.streakDays(state.daily.streak)}</Chip>
          </div>
        </div>
        <p className="mt-4 font-sans text-sm text-text-secondary">{state.content.chris.name} · {copy.guide}</p>
        <h2 className="mt-1 font-display text-2xl font-semibold text-text">{state.content.scene.title}</h2>
        <p className="mt-3 max-w-2xl font-sans text-sm leading-6 text-text-secondary">{state.content.chris.intro}</p>
      </div>
      <div className="space-y-5 p-5 sm:p-6">
        {state.content_language !== language && <p className="rounded bg-panel-2 px-3 py-2 font-sans text-xs text-text-muted">{copy.contentLanguageNote}</p>}
        {state.completed ? (
          <div className="flex items-start gap-3 rounded-md bg-primary/10 p-4">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <p className="font-sans text-sm text-text-secondary">
              {copy.moscowBoss.completed(state.city_stamp?.title ?? (language === 'en' ? 'City stamp' : 'Городской штамп'))}
            </p>
          </div>
        ) : (
          <>
            {state.content.questions.map((question, index) => (
              <section key={question.id} className="rounded-md bg-panel-2/70 p-4">
                <p className="font-sans text-xs uppercase tracking-wide text-text-muted">{copy.moscowBoss.question(index + 1)}</p>
                <p className="mt-2 font-display text-lg font-semibold text-text">{question.text}</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {question.options.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      disabled={view === 'answering' || state.profile.energy === 0}
                      onClick={() => setAnswers((current) => ({ ...current, [question.id]: option.id }))}
                      className={`rounded-md border px-4 py-3 text-left font-sans text-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${answers[question.id] === option.id ? 'border-amber-200/60 bg-amber-200/10 text-text' : 'border-white/10 bg-panel-2 text-text-secondary hover:border-primary/50 hover:bg-primary/10'}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </section>
            ))}
            <button
              type="button"
              disabled={!complete || view === 'answering' || state.profile.energy === 0}
              onClick={() => void submit()}
              className="rounded-md bg-primary px-5 py-3 font-sans text-sm font-semibold text-white transition hover:bg-primary/85 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {copy.moscowBoss.submit}
            </button>
            {state.profile.energy === 0 && <p className="font-sans text-xs text-warning">{copy.moscowBoss.energyEmpty}</p>}
          </>
        )}
        {state.content.sources?.length ? (
          <p className="font-sans text-xs text-text-muted">
            {copy.moscowBoss.sources}: {state.content.sources.map((source, index) => (
              <span key={source.url}>{index ? ' · ' : ''}<a className="text-primary hover:underline" href={source.url} target="_blank" rel="noreferrer">{source.label}</a></span>
            ))}
          </p>
        ) : null}
        {feedback.length > 0 && (
          <div className="space-y-2 rounded-md border border-white/10 bg-panel-2/60 p-4">
            <p className="font-sans text-xs uppercase tracking-wide text-text-muted">{copy.moscowBoss.review}</p>
            {state.content.questions.map((question, index) => {
              const result = feedback.find((item) => item.question_id === question.id)
              return result ? (
                <p key={question.id} className="font-sans text-sm leading-6 text-text-secondary">
                  {index + 1}. {result.correct ? copy.moscowBoss.answerCorrect : copy.moscowBoss.answerIncorrect} {result.explanation}
                </p>
              ) : null
            })}
          </div>
        )}
        {message && <p className="flex items-center gap-2 font-sans text-sm text-text-secondary"><Sparkles className="h-4 w-4 text-accent-soft" /> {message}</p>}
      </div>
    </GlassPanel>
  )
}
