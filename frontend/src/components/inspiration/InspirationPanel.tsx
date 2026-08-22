import { ArrowLeft, Sparkles, MapPin, ArrowRight } from 'lucide-react'
import { GlassPanel, Chip, IconButton, DisplayTitle } from '@/components/ui/glass'
import { Img } from '@/components/ui/Img'
import { useApp } from '@/context/AppContext'

interface InspirationPanelProps {
  onBack: () => void
}

const ideas = [
  {
    id: 'north',
    title: 'Северное сияние',
    place: 'Мурманская область',
    season: 'Сентябрь - март',
    reason: 'Вы отмечали интерес к природе и ночным съёмкам',
    image: 'https://images.unsplash.com/photo-1589802829985-817e51171b92?w=800&q=80',
  },
  {
    id: 'wine',
    title: 'Винная Кахетия',
    place: 'Грузия',
    season: 'Сентябрь, ртвели',
    reason: 'Продолжает вашу поездку по Грузии',
    image: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=800&q=80',
  },
  {
    id: 'canals',
    title: 'Каналы и мосты',
    place: 'Санкт-Петербург',
    season: 'Июнь, белые ночи',
    reason: 'Вы закрыли здесь 6 точек и можете пройти город целиком',
    image: 'https://images.unsplash.com/photo-1556610961-2fecc5927173?w=800&q=80',
  },
  {
    id: 'mountains',
    title: 'Горы вне сезона',
    place: 'Роза Хутор, Сочи',
    season: 'Май и октябрь',
    reason: 'Цены ниже втрое, а маршруты открыты',
    image: 'https://images.unsplash.com/photo-1518623489648-a173ef7824f3?w=800&q=80',
  },
]

export function InspirationPanel({ onBack }: InspirationPanelProps) {
  const { newChat, sendMessage } = useApp()

  const plan = (text: string) => {
    newChat()
    setTimeout(() => sendMessage(text), 100)
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="relative z-10">
        <div className="mx-auto flex max-w-[1100px] items-center gap-3 px-5 pb-2 pt-6 sm:px-6">
          <IconButton label="Назад" variant="ghost" size="sm" className="-ml-2" onClick={onBack}>
            <ArrowLeft />
          </IconButton>
          <h1 className="font-display text-2xl font-semibold text-text">Вдохновение</h1>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1100px] px-5 pb-8 pt-4 sm:px-6">
        <p className="mb-6 flex flex-wrap items-center gap-3">
          <span className="max-w-[68ch] font-accent text-lg leading-relaxed text-text-secondary">
            Идеи под ваш стиль поездок: собраны из интересов, прошлых маршрутов и сезона.
          </span>
          <Chip size="sm" variant="accent">
            <Sparkles />
            Персональная подборка
          </Chip>
        </p>

        <div className="grid gap-5 sm:grid-cols-2">
          {ideas.map((idea) => (
            <article
              key={idea.id}
              className="group overflow-hidden rounded-lg border border-hairline bg-panel transition duration-base ease-standard hover:-translate-y-0.5 hover:border-hairline-2"
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                <Img
                  src={idea.image}
                  alt={idea.title}
                  className="h-full w-full object-cover transition-transform duration-[700ms] ease-out group-hover:scale-[1.06]"
                />
                <div className="photo-scrim absolute inset-0" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <DisplayTitle as="h2" className="!text-3xl text-white">
                    {idea.title}
                  </DisplayTitle>
                  <p className="mt-1 flex items-center gap-1.5 font-sans text-xs text-white/75">
                    <MapPin className="h-3 w-3" aria-hidden="true" />
                    {idea.place}
                  </p>
                </div>
              </div>

              <div className="p-5">
                <Chip size="sm" className="mb-3">{idea.season}</Chip>
                <p className="mb-4 font-sans text-sm leading-relaxed text-text-secondary">
                  {idea.reason}
                </p>
                <button
                  onClick={() => plan(`Собери маршрут: ${idea.title}, ${idea.place}`)}
                  className="flex items-center gap-1.5 font-sans text-sm font-medium text-link transition-colors hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  Собрать маршрут
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </article>
          ))}
        </div>

        <GlassPanel className="mt-6 p-5">
          <p className="font-sans text-sm font-semibold text-text">Подборка обновляется</p>
          <p className="mt-1 max-w-[60ch] font-sans text-xs leading-relaxed text-text-muted">
            Чем больше точек вы закрываете и маршрутов сохраняете, тем точнее становятся идеи.
            Пока их немного, потому что история поездок только набирается.
          </p>
        </GlassPanel>
      </div>
    </div>
  )
}
