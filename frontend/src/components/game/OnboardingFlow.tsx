import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Award, BatteryMedium, CheckCircle2, Compass, Flame, LoaderCircle, Lock, MapPin, Sparkles } from 'lucide-react'
import { GlassPanel, Chip } from '@/components/ui/glass'
import { answerRedSquare, getOnboarding, type OnboardingState } from '@/api/gameApi'
import { isMockMode } from '@/api/chatApi'
import { ApiError } from '@/api/chatApi'
import { useApp } from '@/context/AppContext'
import { getGameCopy } from '@/lib/gameCopy'

type ViewState = 'loading' | 'ready' | 'answering' | 'error'
type LessonStep = 'welcome' | 'country' | 'arrival' | 'fact' | 'question'

// GDD §2.1–2.3: three Chris lines, country choice, then the ~60 s first quest.
// Steps are presentation only, so skipping or going back never touches server progress.
const lessonStepIds: LessonStep[] = ['welcome', 'country', 'arrival', 'fact', 'question']
const lockedCountryFlags = ['🇺🇸', '🇯🇵', '🇬🇧', '🇨🇳']

/** First GDD learning loop. Its progress and reward are owned by the API. */
export function OnboardingFlow({ signedIn, onCompleted }: { signedIn: boolean; onCompleted?: () => void }) {
  const { language } = useApp()
  const copy = getGameCopy(language)
  const onboarding = copy.onboarding
  const lessonSteps = lessonStepIds.map((id, index) => ({ id, label: onboarding.steps[index] }))
  const [state, setState] = useState<OnboardingState | null>(null)
  const [view, setView] = useState<ViewState>('loading')
  const [message, setMessage] = useState<string | null>(null)
  const [step, setStep] = useState<LessonStep>('welcome')
  const [soonCountry, setSoonCountry] = useState<string | null>(null)
  // The parent may pass an inline callback; keep the latest one without refetching.
  const onCompletedRef = useRef(onCompleted)
  useEffect(() => { onCompletedRef.current = onCompleted }, [onCompleted])

  useEffect(() => {
    if (!signedIn || isMockMode()) return
    let active = true
    getOnboarding(language)
      .then((result) => {
        if (!active) return
        setState(result)
        if (result.completed) onCompletedRef.current?.()
        setView('ready')
      })
      .catch((error: unknown) => {
        if (!active) return
        setMessage(language === 'ru' && error instanceof ApiError ? error.message : onboarding.retry)
        setView('error')
      })
    return () => { active = false }
  }, [signedIn, language, onboarding.retry])

  if (isMockMode()) return null

  if (!signedIn) {
    return (
      <GlassPanel className="border-primary/25 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
            <Compass className="h-5 w-5" />
          </span>
          <span>
            <span className="block font-display text-xl font-semibold text-text">{onboarding.signInHeading}</span>
            <span className="mt-1 block font-sans text-sm text-text-secondary">
              {onboarding.signInBody}
            </span>
          </span>
        </div>
      </GlassPanel>
    )
  }

  if (view === 'loading') {
    return (
      <GlassPanel className="flex items-center gap-3 p-5 text-sm text-text-secondary">
        <LoaderCircle className="h-5 w-5 animate-spin text-primary" /> {onboarding.loading}
      </GlassPanel>
    )
  }

  if (view === 'error' || !state) {
    return (
      <GlassPanel className="border-danger/30 p-5 font-sans text-sm text-text-secondary">
        {onboarding.unavailable(message ?? onboarding.retry)}
      </GlassPanel>
    )
  }

  const { content, daily, profile } = state
  const locationLabel = language === 'en' ? 'Russia · Moscow' : `${content.country.name} · ${content.country.city}`
  const choose = async (answerKey: string) => {
    if (view === 'answering' || state.completed) return
    setView('answering')
    setMessage(null)
    try {
      const result = await answerRedSquare(answerKey)
      setState((previous) => previous ? {
        ...previous,
        profile: result.profile,
        daily: result.daily,
        completed: result.completed,
        starter_stamp: result.starter_stamp,
      } : previous)
      if (result.completed) onCompleted?.()
      setMessage(result.correct
        ? result.xp_awarded ? onboarding.correctAward(result.xp_awarded) : onboarding.alreadyStamped
        : onboarding.incorrect)
      setView('ready')
    } catch (error) {
      setMessage(language === 'ru' && error instanceof ApiError ? error.message : onboarding.answerFailed)
      setView('ready')
    }
  }

  return (
    <GlassPanel className="overflow-hidden border-primary/25 p-0">
      <div className="bg-[radial-gradient(circle_at_85%_0%,rgba(107,91,255,0.28),transparent_42%),linear-gradient(130deg,rgba(11,125,127,0.2),transparent_68%)] p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <Chip variant="active"><MapPin /> {locationLabel}</Chip>
          <div className="flex items-center gap-2">
            <Chip size="sm"><Award /> {profile.xp} XP</Chip>
            <Chip size="sm"><BatteryMedium /> {profile.energy}/5</Chip>
            <Chip size="sm"><Flame /> {copy.streakDays(daily.streak)}</Chip>
          </div>
        </div>
        <p className="font-sans text-sm text-text-secondary">{content.chris.name} · {copy.guide}</p>
        <h2 className="mt-1 font-display text-2xl font-semibold text-text sm:text-3xl">{content.scene.title}</h2>
        <p className="mt-3 max-w-2xl font-sans text-sm leading-6 text-text-secondary">{content.chris.intro}</p>
        <p className="mt-3 font-sans text-xs text-text-muted">
          {onboarding.goal(daily.completed_quests, daily.goal, daily.goal_reached)}
        </p>
        {!state.completed && (
          <ol className="mt-5 flex gap-2 overflow-x-auto" aria-label={onboarding.stepsAria}>
            {lessonSteps.map((item, index) => {
              const activeIndex = lessonSteps.findIndex((candidate) => candidate.id === step)
              const isCurrent = item.id === step
              const isPast = index < activeIndex
              return (
                <li key={item.id} className="flex min-w-max items-center gap-2 font-sans text-xs">
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full ${isCurrent || isPast ? 'bg-primary text-white' : 'bg-white/10 text-text-muted'}`}>
                    {isPast ? '✓' : index + 1}
                  </span>
                  <span className={isCurrent ? 'text-text' : 'text-text-muted'}>{item.label}</span>
                </li>
              )
            })}
          </ol>
        )}
      </div>

      <div className="p-5 sm:p-6">
        {state.content_language !== language && <p className="mb-4 rounded bg-panel-2 px-3 py-2 font-sans text-xs text-text-muted">{onboarding.contentLanguageNote}</p>}
        {state.completed ? (
          <div className="flex items-start gap-3 rounded-md bg-primary/10 p-4">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <span className="font-sans text-sm text-text-secondary">
              {onboarding.completed(state.starter_stamp?.title ?? (language === 'en' ? 'Starter stamp' : 'Стартовый штамп'))}
            </span>
          </div>
        ) : step === 'welcome' ? (
          <div className="space-y-4">
            <ChrisLine name={content.chris.name}>{onboarding.welcomeSpeech}</ChrisLine>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setStep('country')} className={primaryButton}>
                {onboarding.next}
              </button>
              <button type="button" onClick={() => setStep('fact')} className={quietButton}>
                {onboarding.skipIntro}
              </button>
            </div>
          </div>
        ) : step === 'country' ? (
          <div className="space-y-4">
            <ChrisLine name={content.chris.name}>{onboarding.countrySpeech}</ChrisLine>
            <div className="grid gap-2 sm:grid-cols-5">
              <div className="rounded-md border border-primary/50 bg-primary/10 p-3 sm:col-span-5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display text-lg font-semibold text-text"><span aria-hidden="true">🇷🇺</span> {content.country.name}</span>
                  <Chip size="sm" variant="active">{onboarding.countryAvailable}</Chip>
                </div>
                <p className="mt-1 font-sans text-xs text-text-muted">{onboarding.countryCoverage}</p>
                <button type="button" onClick={() => setStep('arrival')} className={`mt-3 ${primaryButton}`}>
                  {onboarding.selectRussia}
                </button>
              </div>
              {onboarding.lockedCountries.map((name, index) => (
                <button
                  key={name}
                  type="button"
                  aria-disabled="true"
                  onClick={() => setSoonCountry(name)}
                  className="flex items-center justify-between gap-2 rounded-md border border-white/10 bg-panel-2/60 p-3 text-left opacity-60 transition hover:opacity-80 sm:col-span-1 sm:flex-col sm:items-start"
                >
                  <span className="font-sans text-sm text-text-secondary"><span aria-hidden="true">{lockedCountryFlags[index]}</span> {name}</span>
                  <span className="flex items-center gap-1 font-sans text-[11px] text-text-muted"><Lock className="h-3 w-3" aria-hidden="true" /> {onboarding.countrySoon}</span>
                </button>
              ))}
            </div>
            {soonCountry && <p role="status" className="font-sans text-xs text-text-muted">{onboarding.countrySoonNote(soonCountry)}</p>}
            <BackButton label={copy.back} onClick={() => setStep('welcome')} />
          </div>
        ) : step === 'arrival' ? (
          <div className="space-y-4">
            <ChrisLine name={content.chris.name}>{onboarding.arrivalSpeech}</ChrisLine>
            <figure aria-label={onboarding.hologramLabel} className="relative overflow-hidden rounded-md border border-teal-400/40 bg-[linear-gradient(160deg,rgba(45,212,191,0.18),rgba(13,17,23,0.6))] p-4 shadow-[0_0_32px_rgba(45,212,191,0.25)]">
              <p className="font-display text-xl font-semibold text-text">{onboarding.arrivalHeading}</p>
              <p className="mt-2 font-sans text-sm leading-6 text-text-secondary">
                {onboarding.arrivalBody(content.scene.title)}
              </p>
            </figure>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => setStep('fact')} className={primaryButton}>
                {onboarding.arrivalAction}
              </button>
              <BackButton label={copy.back} onClick={() => setStep('country')} />
            </div>
          </div>
        ) : step === 'fact' ? (
          <div className="space-y-4">
            <div className="rounded-md bg-panel-2/70 p-4">
              <p className="font-sans text-sm leading-6 text-text-secondary">{content.fact.text}</p>
              <a className="mt-2 inline-block font-sans text-xs text-primary hover:underline" href={content.fact.source_url} target="_blank" rel="noreferrer">
                {copy.source}: {content.fact.source_label ?? onboarding.sourceFallback}
              </a>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => setStep('question')} className={primaryButton}>
                {onboarding.factAction}
              </button>
              <BackButton label={copy.back} onClick={() => setStep('arrival')} />
            </div>
          </div>
        ) : (
          <>
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
            {profile.energy === 0 && <p className="mt-3 font-sans text-xs text-warning">{onboarding.energyEmpty}</p>}
          </>
        )}
        {message && (
          <p className="mt-4 flex items-center gap-2 font-sans text-sm text-text-secondary">
            <Sparkles className="h-4 w-4 text-accent-soft" /> {message}
          </p>
        )}
      </div>
    </GlassPanel>
  )
}

const primaryButton = 'rounded-md bg-primary px-4 py-3 font-sans text-sm font-semibold text-white transition hover:bg-primary/90'
const quietButton = 'rounded-md px-4 py-3 font-sans text-sm text-text-secondary transition hover:bg-white/5 hover:text-text'

function ChrisLine({ name, children }: { name: string; children: string }) {
  return (
    <div className="flex items-start gap-3">
      <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xl">🦝</span>
      <p className="rounded-md bg-panel-2/70 p-4 font-sans text-base leading-7 text-text-secondary">
        <span className="sr-only">{name}: </span>{children}
      </p>
    </div>
  )
}

function BackButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`inline-flex items-center gap-1.5 ${quietButton}`}>
      <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {label}
    </button>
  )
}
