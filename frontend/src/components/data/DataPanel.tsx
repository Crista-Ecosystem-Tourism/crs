import { useState } from 'react'
import {
  ArrowLeft, Search, MapPin, Landmark, UtensilsCrossed, Sparkles,
  Wallet, Globe, Bus, HandHeart, MessageCircleQuestion, ShieldAlert, Pencil,
} from 'lucide-react'
import { GlassPanel, Chip, IconButton, DisplayTitle } from '@/components/ui/glass'
import { Button } from '@/components/ui/button'
import { Img } from '@/components/ui/Img'
import { WikiEditor } from './WikiEditor'
import { CountryCarousel } from './CountryCarousel'
import { ArticleBlocks } from './ArticleBlocks'
import { useWikiDrafts } from '@/hooks/useWikiDrafts'
import { useApp } from '@/context/AppContext'
import { cn } from '@/lib/utils'

interface DataPanelProps {
  onBack: () => void
}

interface CountryArticle {
  id: string
  name: string
  flag: string
  /** Короткая подпись под названием в карусели */
  tagline: string
  cover: string
  summary: string
  history: string
  cuisine: string
  traditions: string
  practical: { label: string; value: string; icon: typeof Wallet }[]
}

const articles: CountryArticle[] = [
  {
    id: 'ru',
    name: 'Россия',
    flag: '🇷🇺',
    tagline: 'Одиннадцать часовых поясов',
    cover: 'https://images.unsplash.com/photo-1513326738677-b964603b136d?w=1200&q=80',
    summary: 'Самая большая страна мира, от Балтики до Тихого океана, с богатым культурным наследием и разнообразной кухней.',
    history: 'Тысячелетняя история от Киевской Руси до современной федерации: империя, революция 1917 года, советский период и переход к рыночной экономике в 1990-х.',
    cuisine: 'Борщ, пельмени, блины, оливье, шашлык. Чаепитие остаётся важной частью повседневной культуры.',
    traditions: 'Гостеприимство, баня, Новый год как главный семейный праздник, широкая Масленица.',
    practical: [
      { label: 'Виза', value: 'Требуется для большинства стран', icon: Globe },
      { label: 'Валюта', value: 'Российский рубль (₽)', icon: Wallet },
      { label: 'Транспорт', value: 'Метро, электрички, каршеринг', icon: Bus },
      { label: 'Этикет', value: 'Снимать обувь в гостях', icon: HandHeart },
    ],
  },
  {
    id: 'ge',
    name: 'Грузия',
    flag: '🇬🇪',
    tagline: 'Вино из квеври и супра',
    cover: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=1200&q=80',
    summary: 'Гостеприимная страна на Кавказе с древними традициями виноделия и одной из самых узнаваемых кухонь мира.',
    history: 'Одна из первых стран, принявших христианство в IV веке. Богатая история царств и влияние Персии, Османской империи и России.',
    cuisine: 'Хинкали, хачапури, вино из квеври, чурчхела. Застолье «супра» с тамадой это целый ритуал.',
    traditions: 'Многоголосое пение, тамада на застольях, культ гостеприимства.',
    practical: [
      { label: 'Виза', value: 'Безвизовый въезд для РФ до 1 года', icon: Globe },
      { label: 'Валюта', value: 'Лари (₾)', icon: Wallet },
      { label: 'Транспорт', value: 'Маршрутки, такси, канатные дороги', icon: Bus },
      { label: 'Разговорник', value: '«Гамарджоба» это привет', icon: MessageCircleQuestion },
    ],
  },
  {
    id: 'jp',
    name: 'Япония',
    flag: '🇯🇵',
    tagline: 'Традиции и технологии',
    cover: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&q=80',
    summary: 'Страна восходящего солнца: гармония многовековых традиций и передовых технологий.',
    history: 'Эпоха самураев и сёгунов, реставрация Мэйдзи, стремительная модернизация после Второй мировой войны.',
    cuisine: 'Суши, рамен, темпура, кайсэки. Чайная церемония это искусство осознанности.',
    traditions: 'Этикет поклонов, обувь снимается у входа, культ вежливости и порядка.',
    practical: [
      { label: 'Виза', value: 'Требуется для граждан РФ', icon: Globe },
      { label: 'Валюта', value: 'Японская иена (¥)', icon: Wallet },
      { label: 'Транспорт', value: 'Синкансэн, метро, JR Pass', icon: Bus },
      { label: 'Экстренные службы', value: 'Полиция 110, скорая 119', icon: ShieldAlert },
    ],
  },
]

const categories = [
  { key: 'history', label: 'История', icon: Landmark },
  { key: 'cuisine', label: 'Кухня', icon: UtensilsCrossed },
  { key: 'traditions', label: 'Традиции', icon: Sparkles },
] as const

function Header({ onBack, title }: { onBack: () => void; title: string }) {
  return (
    <div className="relative z-10">
      <div className="mx-auto flex max-w-[1100px] items-center gap-3 px-5 pb-2 pt-6 sm:px-6">
        <IconButton label="Назад" variant="ghost" size="sm" className="-ml-2" onClick={onBack}>
          <ArrowLeft />
        </IconButton>
        <h1 className="font-display text-2xl font-semibold text-text">{title}</h1>
      </div>
    </div>
  )
}

export function DataPanel({ onBack }: DataPanelProps) {
  const [openId, setOpenId] = useState<string | null>(null)
  const [tab, setTab] = useState<'history' | 'cuisine' | 'traditions'>('history')
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(false)
  const { getDraft, saveDraft, discardDraft, pendingCount } = useWikiDrafts()
  const { user } = useApp()
  const authorName = user?.name ?? 'Гость'

  const base = articles.find((a) => a.id === openId)
  const draft = openId ? getDraft(openId) : undefined

  // Правка автора видна ему сразу, остальным до модерации показывается оригинал
  const active = base
    ? {
        ...base,
        summary: draft?.summary ?? base.summary,
        history: draft?.history ?? base.history,
        cuisine: draft?.cuisine ?? base.cuisine,
        traditions: draft?.traditions ?? base.traditions,
        practical: draft
          ? draft.practical.map((p, i) => ({
              ...p,
              icon: base.practical[i]?.icon ?? Globe,
            }))
          : base.practical,
      }
    : undefined

  const filtered = articles.filter((a) => a.name.toLowerCase().includes(query.toLowerCase()))

  if (editing && base) {
    return (
      <WikiEditor
        article={base}
        existingDraft={draft}
        authorName={authorName}
        onCancel={() => setEditing(false)}
        onSave={(d) => {
          saveDraft(d)
          setEditing(false)
        }}
        onDiscard={() => {
          discardDraft(base.id)
          setEditing(false)
        }}
      />
    )
  }

  /* ------------------------------------------------------------- статья */

  if (active) {
    return (
      <div className="h-full overflow-y-auto">
        <Header onBack={() => setOpenId(null)} title="Crista Wiki" />

        <article className="mx-auto w-full max-w-[820px] px-5 pb-8 pt-4 sm:px-6">
          <div className="relative mb-6 aspect-[16/7] overflow-hidden rounded-lg">
            <Img src={active.cover} alt={active.name} className="h-full w-full object-cover" />
            <div className="photo-scrim absolute inset-0" />
            <div className="absolute inset-x-0 bottom-0 flex items-end gap-3 p-5">
              <span className="text-3xl leading-none" aria-hidden="true">{active.flag}</span>
              <DisplayTitle className="!text-4xl text-white">{active.name}</DisplayTitle>
            </div>
          </div>

          {/* Лид: акцентный шрифт, комфортная мера строки для чтения */}
          <p className="mb-6 max-w-[68ch] font-accent text-xl leading-relaxed text-text-secondary">
            {active.summary}
          </p>

          <div className="mb-5 flex w-fit gap-1 rounded-md border border-hairline bg-panel p-1">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setTab(cat.key)}
                aria-pressed={tab === cat.key}
                className={cn(
                  'flex items-center gap-1.5 rounded-sm px-3.5 py-2 font-sans text-sm font-medium transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                  tab === cat.key
                    ? 'bg-teal-700 text-white'
                    : 'text-text-secondary hover:bg-panel-2 hover:text-text'
                )}
              >
                <cat.icon className="h-3.5 w-3.5" aria-hidden="true" />
                {cat.label}
              </button>
            ))}
          </div>

          <GlassPanel className="mb-8 p-5">
            <p className="max-w-[68ch] font-sans leading-relaxed text-text-secondary">
              {tab === 'history' && active.history}
              {tab === 'cuisine' && active.cuisine}
              {tab === 'traditions' && active.traditions}
            </p>
          </GlassPanel>

          <h2 className="mb-3 font-display text-xl font-semibold text-text">
            Практическая информация
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {active.practical.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-md border border-hairline bg-panel p-3.5"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-primary/15 text-primary">
                  <item.icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block font-sans text-xs text-text-muted">{item.label}</span>
                  <span className="block font-sans text-sm font-medium text-text">{item.value}</span>
                </span>
              </div>
            ))}
          </div>

          {draft?.blocks && draft.blocks.length > 0 && (
            <div className="mt-8">
              <ArticleBlocks blocks={draft.blocks} />
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-hairline pt-6">
            <Button variant="secondary" onClick={() => setEditing(true)}>
              <Pencil />
              Редактировать или добавить информацию
            </Button>
            {draft?.status === 'pending' ? (
              <Chip variant="accent" size="sm">Ваша правка на модерации</Chip>
            ) : (
              <span className="font-sans text-xs text-text-muted">
                Статья редактируется сообществом с модерацией
              </span>
            )}
          </div>
        </article>
      </div>
    )
  }

  /* -------------------------------------------------------------- список */

  return (
    <div className="h-full overflow-y-auto">
      <Header onBack={onBack} title="Crista Wiki" />

      <div className="mx-auto w-full max-w-[1100px] px-5 pb-8 pt-4 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <p className="max-w-[68ch] font-accent text-lg leading-relaxed text-text-secondary">
            Справочник по странам: история, кухня, традиции и практическая информация.
            Единый источник контента для квестов, фокуса и маршрутов.
          </p>
          {pendingCount > 0 && (
            <Chip variant="accent" size="sm">
              Ваших правок на модерации: {pendingCount}
            </Chip>
          )}
        </div>

        <div className="relative mb-6 max-w-md">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
            aria-hidden="true"
          />
          <label htmlFor="wiki-search" className="sr-only">Поиск по странам</label>
          <input
            id="wiki-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по странам"
            className="h-11 w-full rounded-md border border-hairline bg-panel pl-10 pr-4 font-sans text-sm text-text outline-none transition placeholder:text-text-muted focus:border-primary/40 focus:ring-2 focus:ring-accent"
          />
        </div>

        {filtered.length === 0 ? (
          <GlassPanel className="p-8 text-center">
            <p className="font-sans text-sm text-text-secondary">
              По запросу «{query}» ничего не нашлось.
            </p>
            <button
              onClick={() => setQuery('')}
              className="mt-2 font-sans text-sm text-link hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Показать все страны
            </button>
          </GlassPanel>
        ) : (
          <CountryCarousel
            items={filtered.map((a) => ({
              id: a.id,
              name: a.name,
              flag: a.flag,
              cover: a.cover,
              summary: a.summary,
              subtitle: a.tagline,
            }))}
            onOpen={(id) => {
              setOpenId(id)
              setTab('history')
            }}
          />
        )}

        <p className="mt-6 flex items-start gap-2 rounded-lg border border-dashed border-hairline-2 p-4 font-sans text-xs leading-relaxed text-text-muted">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          Открытые статьи индексируются поисковиками. Частичное редактирование доступно сообществу с модерацией.
        </p>
      </div>
    </div>
  )
}
