import { useEffect, useState } from 'react'
import {
  ArrowLeft, Search, MapPin, Landmark, UtensilsCrossed, Sparkles,
  Wallet, Globe, Bus, HandHeart, MessageCircleQuestion, ShieldAlert, Pencil,
  BookOpenCheck,
} from 'lucide-react'
import { GlassPanel, Chip, IconButton, DisplayTitle } from '@/components/ui/glass'
import { Button } from '@/components/ui/button'
import { Img } from '@/components/ui/Img'
import { WikiEditor, type WikiEditorSubmission } from './WikiEditor'
import { CountryCarousel } from './CountryCarousel'
import { useApp } from '@/context/AppContext'
import { cn } from '@/lib/utils'
import { ApiError } from '@/api/chatApi'
import { createWikiDraft, getMyWikiDrafts, getWikiArticle, getWikiReviewQueue, publishWikiDraft, submitWikiDraft, type WikiDraft as ServerWikiDraft, type WikiPublishedArticle } from '@/api/wikiApi'

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

function textBody(body: Record<string, unknown>, key: string, fallback: string): string {
  return typeof body[key] === 'string' && body[key].trim() ? body[key] : fallback
}

function practicalBody(body: Record<string, unknown>, fallback: CountryArticle['practical']): CountryArticle['practical'] {
  if (!Array.isArray(body.practical)) return fallback
  const rows = body.practical.flatMap((value, index) => {
    if (!value || typeof value !== 'object') return []
    const row = value as Record<string, unknown>
    if (typeof row.label !== 'string' || typeof row.value !== 'string') return []
    return [{ label: row.label, value: row.value, icon: fallback[index]?.icon ?? Globe }]
  })
  return rows.length > 0 ? rows : fallback
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

const englishCountryCatalogue: Record<string, Pick<CountryArticle, 'name' | 'tagline' | 'summary'>> = {
  ru: { name: 'Russia', tagline: 'Across eleven time zones', summary: 'The world’s largest country stretches from the Baltic Sea to the Pacific, with a rich cultural heritage and diverse regional cuisines.' },
  ge: { name: 'Georgia', tagline: 'Qvevri wine and supra', summary: 'A Caucasus country with long winemaking traditions and a distinctive, regionally varied cuisine.' },
  jp: { name: 'Japan', tagline: 'Tradition and technology', summary: 'A country where centuries-old traditions and contemporary technology meet.' },
}

function Header({ onBack, title, language = 'ru' }: { onBack: () => void; title: string; language?: 'ru' | 'en' }) {
  return (
    <div className="relative z-10">
      <div className="mx-auto flex max-w-[1100px] items-center gap-3 px-5 pb-2 pt-6 sm:px-6">
        <IconButton label={language === 'en' ? 'Back' : 'Назад'} variant="ghost" size="sm" className="-ml-2" onClick={onBack}>
          <ArrowLeft />
        </IconButton>
        <h1 className="font-display text-2xl font-semibold text-text">{title}</h1>
      </div>
    </div>
  )
}

/** A server-owned article stays distinct from the catalogue cards until all catalogue content is migrated. */
function PublishedMoscowArticle({ signedIn }: { signedIn: boolean }) {
  const [article, setArticle] = useState<WikiPublishedArticle | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'unavailable'>('loading')
  const { language } = useApp()

  useEffect(() => {
    let active = true
    getWikiArticle('moscow', language).then((result) => {
      if (!active) return
      setArticle(result)
      setStatus('ready')
    }).catch(() => {
      if (active) setStatus('unavailable')
    })
    return () => { active = false }
  }, [language])

  if (status === 'loading') {
    return <GlassPanel className="mb-6 p-4 font-sans text-sm text-text-secondary">{language === 'en' ? 'Loading the published Crista Wiki article…' : 'Загружаем опубликованную статью Crista Wiki…'}</GlassPanel>
  }
  if (status === 'unavailable' || !article) {
    return (
      <GlassPanel className="mb-6 border-danger/30 p-4 font-sans text-sm text-text-secondary">
        {language === 'en' ? 'The published Crista Wiki article is currently unavailable. The catalogue below does not replace its server-published version.' : 'Опубликованная статья Crista Wiki сейчас недоступна. Каталог ниже не подменяет её серверную версию.'}
      </GlassPanel>
    )
  }

  const summary = typeof article.body.summary === 'string' ? article.body.summary : null
  return (
    <section className="mb-6 rounded-lg border border-primary/25 bg-primary/5 p-5" aria-label={language === 'en' ? 'Published Crista Wiki article about Moscow' : 'Опубликованная статья Crista Wiki о Москве'}>
      <p className="font-sans text-xs uppercase tracking-wide text-text-muted">{language === 'en' ? 'Crista Wiki · published server edition' : 'Crista Wiki · серверная опубликованная версия'}</p>
      <h2 className="mt-1 font-display text-2xl font-semibold text-text">{article.title}</h2>
      {language === 'en' && article.content_language !== 'en' && (
        <p role="status" className="mt-2 font-sans text-xs text-text-muted">The English edition is not available yet; showing the published Russian version.</p>
      )}
      {summary && <p className="mt-3 max-w-[68ch] font-sans text-sm leading-6 text-text-secondary">{summary}</p>}
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
        {article.sources.map((source) => (
          <a key={source.url} href={source.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 font-sans text-xs font-semibold text-primary hover:underline">
            <BookOpenCheck className="h-3.5 w-3.5" /> {source.label}
          </a>
        ))}
      </div>
      <p className="mt-3 font-sans text-xs text-text-muted">{language === 'en' ? 'License:' : 'Лицензия:'} {article.license}</p>
      {signedIn && <MoscowDraftForm article={article} />}
    </section>
  )
}

function MoscowDraftForm({ article }: { article: WikiPublishedArticle }) {
  const { language } = useApp()
  const [open, setOpen] = useState(false)
  const [summary, setSummary] = useState(typeof article.body.summary === 'string' ? article.body.summary : '')
  const [sourceLabel, setSourceLabel] = useState(article.sources[0]?.label ?? '')
  const [sourceUrl, setSourceUrl] = useState(article.sources[0]?.url ?? '')
  const [license, setLicense] = useState(article.license)
  const [message, setMessage] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    if (!summary.trim() || !sourceLabel.trim() || !sourceUrl.trim() || !license.trim() || saving) return
    setSaving(true)
    setMessage(null)
    try {
      const draft = await createWikiDraft({ slug: article.slug, title: article.title, body: { summary: summary.trim() }, sources: [{ label: sourceLabel.trim(), url: sourceUrl.trim() }], license: license.trim() })
      await submitWikiDraft(draft.id)
      setMessage(language === 'en' ? 'Your edit was submitted to the server review queue.' : 'Правка отправлена в серверную очередь review.')
      setOpen(false)
    } catch {
      setMessage(language === 'en' ? 'Could not submit the edit. Check the fields and your connection.' : 'Не удалось отправить правку. Проверьте поля и подключение.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mt-4 border-t border-primary/15 pt-4">
      {!open ? <Button size="sm" variant="secondary" onClick={() => setOpen(true)}><Pencil /> {language === 'en' ? 'Suggest an edit' : 'Предложить правку'}</Button> : <div className="grid gap-3">
        <label className="font-sans text-xs text-text-secondary">{language === 'en' ? 'Summary' : 'Краткое описание'}<textarea value={summary} onChange={(event) => setSummary(event.target.value)} className="mt-1 block w-full rounded-md border border-hairline bg-panel p-2 text-sm text-text" rows={3} /></label>
        <label className="font-sans text-xs text-text-secondary">{language === 'en' ? 'Source' : 'Источник'}<input value={sourceLabel} onChange={(event) => setSourceLabel(event.target.value)} className="mt-1 block w-full rounded-md border border-hairline bg-panel p-2 text-sm text-text" /></label>
        <label className="font-sans text-xs text-text-secondary">{language === 'en' ? 'Source URL' : 'Ссылка на источник'}<input value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} type="url" className="mt-1 block w-full rounded-md border border-hairline bg-panel p-2 text-sm text-text" /></label>
        <label className="font-sans text-xs text-text-secondary">{language === 'en' ? 'License' : 'Лицензия'}<input value={license} onChange={(event) => setLicense(event.target.value)} className="mt-1 block w-full rounded-md border border-hairline bg-panel p-2 text-sm text-text" /></label>
        <div className="flex gap-2"><Button size="sm" onClick={() => void submit()} disabled={saving}>{language === 'en' ? 'Submit for review' : 'Отправить на review'}</Button><Button size="sm" variant="ghost" onClick={() => setOpen(false)}>{language === 'en' ? 'Cancel' : 'Отмена'}</Button></div>
      </div>}
      {message && <p className="mt-3 font-sans text-xs text-text-secondary">{message}</p>}
    </div>
  )
}

function AuthoredDrafts({ signedIn }: { signedIn: boolean }) {
  const [drafts, setDrafts] = useState<ServerWikiDraft[]>([])
  const { language } = useApp()
  const en = language === 'en'

  useEffect(() => {
    if (!signedIn) return
    let active = true
    getMyWikiDrafts().then((result) => {
      if (active) setDrafts(result)
    }).catch(() => {
      // The old catalogue remains readable if the optional editorial status request fails.
    })
    return () => { active = false }
  }, [signedIn])

  if (!signedIn || drafts.length === 0) return null
  return (
    <GlassPanel className="mb-6 p-4" aria-label={en ? 'My server Wiki drafts' : 'Мои серверные черновики Wiki'}>
      <p className="font-sans text-xs uppercase tracking-wide text-text-muted">{en ? 'Crista Wiki · my server drafts' : 'Crista Wiki · мои серверные версии'}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {drafts.map((draft) => <Chip key={draft.id} variant={draft.status === 'review' ? 'accent' : 'default'} size="sm">{draft.title} · {draft.status === 'review' ? (en ? 'in review' : 'на review') : draft.status}</Chip>)}
      </div>
    </GlassPanel>
  )
}

function ReviewQueue({ isEditor }: { isEditor: boolean }) {
  const [drafts, setDrafts] = useState<ServerWikiDraft[]>([])
  const [publishingId, setPublishingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { language } = useApp()
  const en = language === 'en'

  useEffect(() => {
    if (!isEditor) return
    let active = true
    getWikiReviewQueue().then((result) => {
      if (active) setDrafts(result)
    }).catch(() => {
      if (active) setError(en ? 'Could not load the review queue.' : 'Не удалось загрузить очередь review.')
    })
    return () => { active = false }
  }, [isEditor])

  const publish = async (versionId: string) => {
    if (publishingId) return
    setPublishingId(versionId)
    setError(null)
    try {
      await publishWikiDraft(versionId)
      setDrafts((current) => current.filter((draft) => draft.id !== versionId))
    } catch {
      setError(en ? 'Could not publish this version. Check your permissions and try again.' : 'Не удалось опубликовать версию. Проверьте права и повторите попытку.')
    } finally {
      setPublishingId(null)
    }
  }

  if (!isEditor) return null
  return (
    <GlassPanel className="mb-6 border-primary/25 p-4" aria-label={en ? 'Crista Wiki editorial queue' : 'Редакторская очередь Crista Wiki'}>
      <p className="font-sans text-xs uppercase tracking-wide text-text-muted">{en ? 'Crista Wiki · editorial queue' : 'Crista Wiki · редакторская очередь'}</p>
      {drafts.length === 0 ? <p className="mt-2 font-sans text-sm text-text-secondary">{en ? 'There are no versions awaiting review.' : 'На review пока нет версий.'}</p> : (
        <div className="mt-3 space-y-3">
          {drafts.map((draft) => <div key={draft.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-hairline bg-panel-2/60 p-3">
            <div><p className="font-sans text-sm font-semibold text-text">{draft.title}</p><p className="mt-1 font-sans text-xs text-text-muted">{draft.sources.length} {en ? (draft.sources.length === 1 ? 'source' : 'sources') : 'источник(а)'} · {draft.license}</p></div>
            <Button size="sm" onClick={() => void publish(draft.id)} disabled={publishingId === draft.id}>{en ? 'Publish' : 'Опубликовать'}</Button>
          </div>)}
        </div>
      )}
      {error && <p className="mt-3 font-sans text-xs text-error">{error}</p>}
    </GlassPanel>
  )
}

export function DataPanel({ onBack }: DataPanelProps) {
  const [openId, setOpenId] = useState<string | null>(null)
  const [tab, setTab] = useState<'history' | 'cuisine' | 'traditions'>('history')
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(false)
  const [editorMessage, setEditorMessage] = useState<string | null>(null)
  const [publishedCountry, setPublishedCountry] = useState<WikiPublishedArticle | null>(null)
  const [countryWikiStatus, setCountryWikiStatus] = useState<'idle' | 'loading' | 'published' | 'missing' | 'unavailable'>('idle')
  const { user, language } = useApp()
  const en = language === 'en'
  const categoryLabels = language === 'en'
    ? ['History', 'Cuisine', 'Traditions']
    : ['История', 'Кухня', 'Традиции']
  const categories = [
    { key: 'history', label: categoryLabels[0], icon: Landmark },
    { key: 'cuisine', label: categoryLabels[1], icon: UtensilsCrossed },
    { key: 'traditions', label: categoryLabels[2], icon: Sparkles },
  ] as const

  const base = articles.find((a) => a.id === openId)
  useEffect(() => {
    if (!base) {
      setPublishedCountry(null)
      setCountryWikiStatus('idle')
      return
    }
    let active = true
    setPublishedCountry(null)
    setCountryWikiStatus('loading')
    getWikiArticle(`country-${base.id}`, language).then((article) => {
      if (!active) return
      if (article.slug === `country-${base.id}`) {
        setPublishedCountry(article)
        setCountryWikiStatus('published')
      } else {
        setCountryWikiStatus('missing')
      }
    }).catch((error: unknown) => {
      if (active) {
        setPublishedCountry(null)
        setCountryWikiStatus(error instanceof ApiError && error.status === 404 ? 'missing' : 'unavailable')
      }
    })
    return () => { active = false }
  }, [base?.id, language])

  const active = base && publishedCountry?.slug === `country-${base.id}`
    ? {
        ...base,
        name: publishedCountry.title || base.name,
        summary: textBody(publishedCountry.body, 'summary', en ? 'This section is not yet included in the published edition.' : 'В опубликованной версии этот раздел пока не заполнен.'),
        history: textBody(publishedCountry.body, 'history', en ? 'This section is not yet included in the published edition.' : 'В опубликованной версии этот раздел пока не заполнен.'),
        cuisine: textBody(publishedCountry.body, 'cuisine', en ? 'This section is not yet included in the published edition.' : 'В опубликованной версии этот раздел пока не заполнен.'),
        traditions: textBody(publishedCountry.body, 'traditions', en ? 'This section is not yet included in the published edition.' : 'В опубликованной версии этот раздел пока не заполнен.'),
        practical: practicalBody(publishedCountry.body, []),
      }
    : base

  const filtered = articles.filter((article) => {
    const display = language === 'en' ? englishCountryCatalogue[article.id] : article
    return `${display.name} ${display.tagline} ${display.summary}`.toLowerCase().includes(query.toLowerCase())
  })

  if (editing && base && user) {
    return (
      <WikiEditor
        article={base}
        onCancel={() => setEditing(false)}
        onSave={async (submission: WikiEditorSubmission) => {
          const draft = await createWikiDraft({
            slug: `country-${base.id}`,
            title: base.name,
            body: submission.body,
            sources: submission.sources,
            license: submission.license,
          })
          await submitWikiDraft(draft.id)
          setEditorMessage('Правка отправлена в серверную очередь review.')
          setEditing(false)
        }}
      />
    )
  }

  /* ------------------------------------------------------------- статья */

  if (active) {
    return (
      <div className="h-full overflow-y-auto">
        <Header onBack={() => setOpenId(null)} title="Crista Wiki" language={language} />

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
          {publishedCountry?.slug === `country-${active.id}` && (
            <div className="mb-5">
              <p className="font-sans text-xs text-text-muted">Crista Wiki · {en ? 'version' : 'версия'} {publishedCountry.version_id} · {en ? 'license:' : 'лицензия:'} {publishedCountry.license}</p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
                {publishedCountry.sources.map((source) => (
                  <a key={source.url} href={source.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-sans text-xs text-primary hover:underline">
                    <BookOpenCheck className="h-3.5 w-3.5" /> {source.label}
                  </a>
                ))}
              </div>
            </div>
          )}
          {language === 'en' && publishedCountry?.content_language !== 'en' && (
            <p role="status" className="mb-5 font-sans text-xs text-text-muted">
              The English edition is not available yet; showing the published Russian version.
            </p>
          )}
          {countryWikiStatus === 'loading' && <p role="status" className="mb-5 font-sans text-xs text-text-muted">{en ? 'Checking the published Wiki edition…' : 'Проверяем опубликованную версию Wiki…'}</p>}
          {countryWikiStatus === 'missing' && <p className="mb-5 font-sans text-xs text-text-muted">{en ? 'No server-published edition exists for this country yet. The catalogue starter card is shown below.' : 'Для этой страны ещё нет опубликованной серверной версии. Ниже показана стартовая карточка каталога.'}</p>}
          {countryWikiStatus === 'unavailable' && <p role="status" className="mb-5 font-sans text-xs text-text-muted">{en ? 'The server Wiki is unavailable; the starter card below is catalogue content, not a confirmed publication.' : 'Серверная Wiki недоступна; ниже показана стартовая карточка, не подтверждённая публикация.'}</p>}

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
            {language === 'en' ? 'Practical information' : 'Практическая информация'}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {active.practical.length === 0 && <p className="font-sans text-sm text-text-muted">{language === 'en' ? 'No practical information is included in this published edition yet.' : 'Практическая информация в опубликованной версии пока не указана.'}</p>}
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

          <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-hairline pt-6">
              <Button variant="secondary" onClick={() => setEditing(true)} disabled={!user}>
              <Pencil />
              {en ? 'Edit or add information' : 'Редактировать или добавить информацию'}
            </Button>
            <span className="font-sans text-xs text-text-muted">
              {user ? (en ? 'Edits create a server version and require review.' : 'Правки создают серверную версию и требуют review.') : (en ? 'Sign in to suggest a server-side edit.' : 'Войдите, чтобы предложить серверную правку.')}
            </span>
          </div>
          {editorMessage && <p className="mt-3 font-sans text-xs text-text-secondary">{editorMessage}</p>}
        </article>
      </div>
    )
  }

  /* -------------------------------------------------------------- список */

  return (
    <div className="h-full overflow-y-auto">
      <Header onBack={onBack} title="Crista Wiki" language={language} />

      <div className="mx-auto w-full max-w-[1100px] px-5 pb-8 pt-4 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <p className="max-w-[68ch] font-accent text-lg leading-relaxed text-text-secondary">
            {en ? 'A guide to countries: history, cuisine, traditions, and practical information. A shared source of content for quests, focus, and routes.' : 'Справочник по странам: история, кухня, традиции и практическая информация. Единый источник контента для квестов, фокуса и маршрутов.'}
          </p>
        </div>

        <AuthoredDrafts signedIn={Boolean(user)} />
        <ReviewQueue isEditor={user?.isEditor === true} />
        <PublishedMoscowArticle signedIn={Boolean(user)} />

        <div className="relative mb-6 max-w-md">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
            aria-hidden="true"
          />
          <label htmlFor="wiki-search" className="sr-only">{en ? 'Search countries' : 'Поиск по странам'}</label>
          <input
            id="wiki-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={en ? 'Search countries' : 'Поиск по странам'}
            className="h-11 w-full rounded-md border border-hairline bg-panel pl-10 pr-4 font-sans text-sm text-text outline-none transition placeholder:text-text-muted focus:border-primary/40 focus:ring-2 focus:ring-accent"
          />
        </div>

        {filtered.length === 0 ? (
          <GlassPanel className="p-8 text-center">
            <p className="font-sans text-sm text-text-secondary">
              {en ? `No countries found for “${query}”.` : `По запросу «${query}» ничего не нашлось.`}
            </p>
            <button
              onClick={() => setQuery('')}
              className="mt-2 font-sans text-sm text-link hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {en ? 'Show all countries' : 'Показать все страны'}
            </button>
          </GlassPanel>
        ) : (
          <CountryCarousel
            language={language}
            items={filtered.map((a) => ({
              id: a.id,
              name: language === 'en' ? englishCountryCatalogue[a.id].name : a.name,
              flag: a.flag,
              cover: a.cover,
              summary: language === 'en' ? englishCountryCatalogue[a.id].summary : a.summary,
              subtitle: language === 'en' ? englishCountryCatalogue[a.id].tagline : a.tagline,
            }))}
            onOpen={(id) => {
              setOpenId(id)
              setTab('history')
            }}
          />
        )}

        <p className="mt-6 flex items-start gap-2 rounded-lg border border-dashed border-hairline-2 p-4 font-sans text-xs leading-relaxed text-text-muted">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {en ? 'Published articles are indexed by search engines. Community edits are available with moderation.' : 'Открытые статьи индексируются поисковиками. Частичное редактирование доступно сообществу с модерацией.'}
        </p>
      </div>
    </div>
  )
}
