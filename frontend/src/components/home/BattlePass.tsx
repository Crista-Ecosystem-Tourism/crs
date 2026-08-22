import { useEffect, useRef } from 'react'
import {
  Lock, Check, Crown, Stamp, Frame, Snowflake, Compass, HardDrive, Percent, Award,
  ChevronLeft, ChevronRight, Infinity as InfinityIcon,
} from 'lucide-react'
import { GlassPanel, Chip, IconButton } from '@/components/ui/glass'
import { Button } from '@/components/ui/button'
import { pass, rewardLabel, type Reward, type RewardKind } from '@/mocks/battlepass'
import { cn } from '@/lib/utils'

interface BattlePassProps {
  points: number
  isPremium: boolean
  onUpgrade: () => void
}

const rewardIcon: Record<RewardKind, typeof Stamp> = {
  stamp: Stamp,
  frame: Frame,
  'streak-freeze': Snowflake,
  quest: Compass,
  storage: HardDrive,
  discount: Percent,
  title: Award,
}

function RewardCell({
  reward,
  unlocked,
  locked,
  premium,
}: {
  reward: Reward
  unlocked: boolean
  /** Уровень достигнут, но награда за подпиской */
  locked: boolean
  premium: boolean
}) {
  const Icon = rewardIcon[reward.kind]

  return (
    <div
      className={cn(
        'flex h-[132px] flex-col justify-between rounded-md border p-3 transition duration-base',
        unlocked
          ? premium
            ? 'border-accent/40 bg-accent/[0.09]'
            : 'border-primary/40 bg-primary/[0.09]'
          : 'border-hairline bg-panel'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-sm',
            unlocked
              ? premium
                ? 'bg-accent/20 text-accent-soft'
                : 'bg-primary/20 text-primary'
              : 'bg-panel-2 text-text-muted'
          )}
        >
          <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
        </span>

        {unlocked ? (
          <Check
            className={cn('h-4 w-4 shrink-0', premium ? 'text-accent-soft' : 'text-primary')}
            aria-label="Получено"
          />
        ) : (
          <Lock className="h-3.5 w-3.5 shrink-0 text-text-muted" aria-label={locked ? 'Нужна подписка' : 'Не открыто'} />
        )}
      </div>

      <div className="min-w-0">
        <p className="font-sans text-[10px] uppercase tracking-wide text-text-muted">
          {rewardLabel[reward.kind]}
        </p>
        <p
          className={cn(
            'mt-0.5 line-clamp-2 font-sans text-xs font-medium leading-snug',
            unlocked ? 'text-text' : 'text-text-secondary'
          )}
        >
          {reward.title}
        </p>
      </div>
    </div>
  )
}

export function BattlePass({ points, isPremium, onUpgrade }: BattlePassProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const tiers = pass.tiers
  const maxThreshold = tiers[tiers.length - 1].threshold
  const currentLevel = tiers.filter((t) => points >= t.threshold).length
  const nextTier = tiers.find((t) => points < t.threshold)

  // Прокручиваем к текущему уровню, чтобы не искать его глазами
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const target = el.querySelector<HTMLElement>('[data-current="true"]')
    if (target) {
      el.scrollTo({ left: Math.max(0, target.offsetLeft - 24), behavior: 'auto' })
    }
  }, [currentLevel])

  const scrollBy = (dir: -1 | 1) =>
    scrollRef.current?.scrollBy({ left: dir * 320, behavior: 'smooth' })

  return (
    <GlassPanel className="overflow-hidden p-0">
      {/* Шапка сезона */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-hairline p-5">
        <div className="min-w-0">
          <h2 className="font-display text-3xl font-semibold leading-tight text-text">
            {pass.name}
          </h2>
          <p className="mt-1 font-sans text-sm text-text-secondary">{pass.subtitle}</p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Chip size="sm">
            <InfinityIcon />
            Без сроков
          </Chip>
          {isPremium ? (
            <Chip size="sm" variant="accent">
              <Crown />
              Премиум активен
            </Chip>
          ) : (
            <Button size="sm" onClick={onUpgrade}>
              <Crown />
              Открыть премиум-дорожку
            </Button>
          )}
        </div>
      </div>

      {/* Прогресс */}
      <div className="border-b border-hairline px-5 py-4">
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
          <p className="font-sans text-sm text-text">
            Уровень <span className="font-semibold tabular text-primary">{currentLevel}</span>
            <span className="text-text-muted"> из {tiers.length}</span>
          </p>
          <p className="font-sans text-xs tabular text-text-muted">
            {nextTier
              ? `${points} из ${nextTier.threshold} очков до уровня ${nextTier.level}`
              : `${points} очков, пропуск пройден полностью`}
          </p>
        </div>

        <div
          className="relative h-2 overflow-hidden rounded-full bg-panel-2"
          role="progressbar"
          aria-valuenow={points}
          aria-valuemin={0}
          aria-valuemax={maxThreshold}
          aria-label="Прогресс пропуска"
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-slow ease-standard"
            style={{ width: `${Math.min(100, (points / maxThreshold) * 100)}%` }}
          />
        </div>

        <p className="mt-2 font-sans text-xs text-text-muted">
          Очки дают точки квестов, верные ответы дня и полностью закрытые города.
        </p>
      </div>

      {/* Лента уровней */}
      <div className="relative">
        <div
          ref={scrollRef}
          className="scrollbar-hidden flex gap-3 overflow-x-auto p-5"
        >
          {tiers.map((tier) => {
            const reached = points >= tier.threshold
            const isCurrent = tier.level === currentLevel + 1

            return (
              <div
                key={tier.level}
                data-current={isCurrent}
                className={cn(
                  'w-[190px] shrink-0 rounded-lg border p-3 transition duration-base',
                  reached
                    ? 'border-primary/30 bg-panel'
                    : isCurrent
                      ? 'border-hairline-3 bg-panel'
                      : 'border-hairline bg-panel'
                )}
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full font-sans text-sm font-bold tabular',
                      reached ? 'bg-primary text-ink-950' : 'bg-panel-2 text-text-muted'
                    )}
                  >
                    {tier.level}
                  </span>
                  <span className="font-sans text-[11px] tabular text-text-muted">
                    {tier.threshold} очк.
                  </span>
                </div>

                <div className="space-y-2">
                  <RewardCell reward={tier.free} unlocked={reached} locked={false} premium={false} />
                  <RewardCell
                    reward={tier.premium}
                    unlocked={reached && isPremium}
                    locked={reached && !isPremium}
                    premium
                  />
                </div>

                {isCurrent && (
                  <p className="mt-2 text-center font-sans text-[11px] text-text-muted">
                    Следующий уровень
                  </p>
                )}
              </div>
            )
          })}
        </div>

        {/* Стрелки прокрутки */}
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-1">
          <span className="pointer-events-auto">
            <IconButton label="Предыдущие уровни" size="sm" onClick={() => scrollBy(-1)}>
              <ChevronLeft />
            </IconButton>
          </span>
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1">
          <span className="pointer-events-auto">
            <IconButton label="Следующие уровни" size="sm" onClick={() => scrollBy(1)}>
              <ChevronRight />
            </IconButton>
          </span>
        </div>
      </div>

      {/* Легенда дорожек */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-hairline px-5 py-3 font-sans text-xs text-text-muted">
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-4 rounded-sm bg-primary/60" />
          Бесплатная дорожка
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-4 rounded-sm bg-accent/60" />
          Премиум-дорожка
        </span>
      </div>
    </GlassPanel>
  )
}
