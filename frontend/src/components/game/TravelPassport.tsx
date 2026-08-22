import { ArrowLeft, Share2, Stamp as StampIcon, Lock, Globe2 } from 'lucide-react'
import { Chip, IconButton } from '@/components/ui/glass'
import { Button } from '@/components/ui/button'
import { gameCountries, type GameCountry } from '@/mocks/game'
import { cn } from '@/lib/utils'

interface TravelPassportProps {
  onBack: () => void
  countryProgress: (iso: string) => number
  cityProgress: (country: GameCountry, cityId: string) => number
  ownerName: string
}

interface StampData {
  id: string
  title: string
  subtitle: string
  earned: boolean
  major: boolean
  tilt: number
}

/**
 * Штамп нарисован геометрией: двойное кольцо, наклон и полупрозрачная
 * краска, как у оттиска. Это документ Crista, а не государственный паспорт.
 */
function Stamp({ stamp }: { stamp: StampData }) {
  if (!stamp.earned) {
    return (
      <div className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-full border-2 border-dashed border-ink-950/30 p-3 text-center">
        <Lock className="h-3.5 w-3.5 text-ink-950/50" aria-hidden="true" />
        <span className="font-sans text-[10px] font-medium leading-tight text-ink-950/60">
          {stamp.title}
        </span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'relative flex aspect-square flex-col items-center justify-center rounded-full p-3 text-center',
        'border-[3px] transition-transform duration-slow ease-standard hover:rotate-0',
        stamp.major
          ? 'border-[#1A6F7C]/75 bg-[#1A6F7C]/10 text-[#12545E]'
          : 'border-[#5B4BB8]/65 bg-[#5B4BB8]/10 text-[#463A94]'
      )}
      style={{ transform: `rotate(${stamp.tilt}deg)` }}
    >
      <span
        className={cn(
          'pointer-events-none absolute inset-[6px] rounded-full border',
          stamp.major ? 'border-[#1A6F7C]/45' : 'border-[#5B4BB8]/40'
        )}
        aria-hidden="true"
      />
      <span className="relative font-display text-base font-semibold uppercase leading-none tracking-tight">
        {stamp.title}
      </span>
      <span className="relative mt-1 font-sans text-[9px] uppercase tracking-wide opacity-75">
        {stamp.subtitle}
      </span>
    </div>
  )
}

/**
 * Гербовая печать за полностью закрытую страну. Крупнее городских штампов:
 * двойное кольцо, звёзды по краю и дата закрытия, как на визовом оттиске.
 */
function CountrySeal({ country, tilt }: { country: GameCountry; tilt: number }) {
  return (
    <div
      className="relative flex aspect-square items-center justify-center rounded-full border-[3px] border-[#1A6F7C]/75 bg-[#1A6F7C]/10 p-2 text-center text-[#12545E] transition-transform duration-slow ease-standard hover:rotate-0"
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      <span className="pointer-events-none absolute inset-[5px] rounded-full border border-dashed border-[#1A6F7C]/45" aria-hidden="true" />
      <span className="pointer-events-none absolute inset-[11px] rounded-full border border-[#1A6F7C]/30" aria-hidden="true" />

      <span className="relative flex flex-col items-center leading-none">
        <span className="text-lg" aria-hidden="true">{country.flag}</span>
        <span className="mt-1 font-display text-[15px] font-semibold uppercase tracking-tight">
          {country.name}
        </span>
        <span className="mt-1 font-sans text-[8px] uppercase tracking-[0.14em] opacity-80">
          закрыта
        </span>
        <span className="mt-0.5 font-mono text-[8px] tabular opacity-70">
          {country.iso} 100%
        </span>
      </span>
    </div>
  )
}

export function TravelPassport({
  onBack,
  countryProgress,
  cityProgress,
  ownerName,
}: TravelPassportProps) {
  const opened = gameCountries.filter((c) => c.opened)

  const stamps: StampData[] = []
  opened.forEach((country, ci) => {
    const cp = countryProgress(country.iso)
    stamps.push({
      id: `country-${country.iso}`,
      title: country.name,
      subtitle: cp === 100 ? 'страна закрыта' : `${cp}% пройдено`,
      earned: cp === 100,
      major: true,
      tilt: ((ci % 3) - 1) * 4,
    })
    country.cities.forEach((city, idx) => {
      const p = cityProgress(country, city.id)
      stamps.push({
        id: `city-${city.id}`,
        title: city.name,
        subtitle: p === 100 ? 'город закрыт' : `${p}%`,
        earned: p === 100,
        major: false,
        tilt: (((ci + idx) % 5) - 2) * 3.5,
      })
    })
  })

  const earned = stamps.filter((s) => s.earned)
  const closedCountries = opened.filter((c) => countryProgress(c.iso) === 100)

  return (
    <div className="h-full overflow-y-auto">
      <div className="relative z-10">
        <div className="mx-auto flex max-w-[980px] items-center justify-between gap-3 px-5 pb-2 pt-6 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <IconButton label="Назад к карте" variant="ghost" size="sm" className="-ml-2" onClick={onBack}>
              <ArrowLeft />
            </IconButton>
            <h1 className="truncate font-display text-2xl font-semibold text-text">
              Тревел-паспорт
            </h1>
          </div>
          <Chip size="sm">
            <StampIcon />
            <span className="tabular">{earned.length} из {stamps.length}</span>
          </Chip>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[980px] space-y-6 px-5 pb-8 pt-4 sm:px-6">
        {/* Разворот книги: тёмная обложка оборачивает две бумажные страницы */}
        <div className="rounded-xl bg-gradient-to-br from-[#123840] via-[#0E2A31] to-[#0B1F24] p-3 shadow-[0_28px_70px_rgba(0,0,0,0.55)] sm:p-4">
          <div className="relative grid overflow-hidden rounded-md md:grid-cols-2">
            {/* Корешок: тень от сгиба между страницами */}
            <div
              className="pointer-events-none absolute inset-y-0 left-1/2 z-10 hidden w-16 -translate-x-1/2 md:block"
              style={{
                background:
                  'linear-gradient(90deg, transparent, rgba(60,45,25,0.16) 38%, rgba(40,30,16,0.3) 50%, rgba(60,45,25,0.16) 62%, transparent)',
              }}
              aria-hidden="true"
            />

            {/* Левая страница: владелец */}
            <div className="relative bg-[linear-gradient(150deg,#F9F5EA_0%,#F1EBDC_100%)] p-6">
              <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#8A6A2F]">
                Crista Online
              </p>

              <div className="mt-5 flex items-start gap-4">
                {/* Место под фото, как на странице данных */}
                <div className="flex h-28 w-24 shrink-0 items-center justify-center rounded-sm border border-ink-950/15 bg-ink-950/[0.04]">
                  <Globe2 className="h-9 w-9 text-ink-950/25" aria-hidden="true" />
                </div>

                <dl className="min-w-0 flex-1 space-y-2.5">
                  <div>
                    <dt className="font-sans text-[9px] uppercase tracking-[0.16em] text-ink-950/60">
                      Владелец
                    </dt>
                    <dd className="truncate font-display text-xl font-semibold leading-tight text-ink-950/85">
                      {ownerName}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-sans text-[9px] uppercase tracking-[0.16em] text-ink-950/60">
                      Документ
                    </dt>
                    <dd className="font-sans text-sm text-ink-950/75">Тревел-паспорт</dd>
                  </div>
                  <div className="flex gap-6">
                    <div>
                      <dt className="font-sans text-[9px] uppercase tracking-[0.16em] text-ink-950/60">
                        Стран
                      </dt>
                      <dd className="font-sans text-sm tabular text-ink-950/75">
                        {closedCountries.length}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-sans text-[9px] uppercase tracking-[0.16em] text-ink-950/60">
                        Штампов
                      </dt>
                      <dd className="font-sans text-sm tabular text-ink-950/75">{earned.length}</dd>
                    </div>
                  </div>
                </dl>
              </div>

              {/* Печати за закрытые страны живут на странице данных */}
              {closedCountries.length > 0 && (
                <div className="mt-6 border-t border-ink-950/10 pt-4">
                  <p className="mb-3 font-sans text-[9px] uppercase tracking-[0.16em] text-ink-950/60">
                    Печати за закрытые страны
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {closedCountries.map((c, i) => (
                      <CountrySeal key={c.iso} country={c} tilt={((i % 3) - 1) * 5} />
                    ))}
                  </div>
                </div>
              )}

              <p className="mt-6 select-none truncate font-mono text-[10px] tracking-[0.12em] text-ink-950/60">
                {`CRISTA<<${ownerName.toUpperCase().replace(/\s+/g, '<')}<<${
                  closedCountries.map((c) => c.iso).join('<') || 'XXX'
                }`}
              </p>
            </div>

            {/* Правая страница: отметки о городах */}
            <div className="relative border-t border-ink-950/10 bg-[linear-gradient(210deg,#F9F5EA_0%,#EFE9DB_100%)] p-6 md:border-l md:border-t-0">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-ink-950/10 pb-3">
                <div>
                  <p className="font-sans text-[9px] uppercase tracking-[0.16em] text-ink-950/60">
                    Отметки о посещении
                  </p>
                  <p className="font-display text-xl font-semibold text-ink-950/85">Страница 1</p>
                </div>
                <Button variant="secondary" size="sm" disabled={earned.length === 0}>
                  <Share2 />
                  Поделиться
                </Button>
              </div>

              {earned.length === 0 ? (
                <div className="py-12 text-center">
                  <StampIcon className="mx-auto mb-3 h-9 w-9 text-ink-950/25" aria-hidden="true" />
                  <p className="font-sans text-sm text-ink-950/60">Страница пока чистая</p>
                  <p className="mx-auto mt-1 max-w-[40ch] font-sans text-xs leading-relaxed text-ink-950/60">
                    Закройте все квесты города, чтобы получить первый штамп.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {stamps.filter((st) => !st.major).map((st) => (
                    <Stamp key={st.id} stamp={st} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <p className="flex items-start gap-2 rounded-lg border border-dashed border-hairline-2 p-4 font-sans text-xs leading-relaxed text-text-muted">
          <StampIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          Штамп за город выдаётся при закрытии всех его квестов, за страну при закрытии всех городов.
          Это документ Crista, он не имеет отношения к государственным паспортам.
        </p>
      </div>
    </div>
  )
}
