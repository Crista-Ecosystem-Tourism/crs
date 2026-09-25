import { useState } from 'react'
import { ArrowLeft, Plus, Trash2, Info, Save } from 'lucide-react'
import { GlassPanel, IconButton } from '@/components/ui/glass'
import { Button } from '@/components/ui/button'
import { BlockEditor } from './BlockEditor'
import type { ArticleBlock } from '@/types/wiki'
import { useApp } from '@/context/AppContext'

export interface WikiPractical {
  label: string
  value: string
}

export interface WikiEditorSubmission {
  body: Record<string, unknown>
  sources: { label: string; url: string }[]
  license: string
}

interface EditableArticle {
  id: string
  name: string
  flag: string
  summary: string
  history: string
  cuisine: string
  traditions: string
  practical: WikiPractical[]
}

interface WikiEditorProps {
  article: EditableArticle
  onCancel: () => void
  onSave: (submission: WikiEditorSubmission) => Promise<void>
}

const MAX_SUMMARY = 400
const MAX_SECTION = 1200

function Field({
  id,
  label,
  hint,
  value,
  onChange,
  rows = 4,
  max,
  language,
}: {
  id: string
  label: string
  hint?: string
  value: string
  onChange: (v: string) => void
  rows?: number
  max: number
  language: 'ru' | 'en'
}) {
  const over = value.length > max
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block font-sans text-sm font-semibold text-text">
        {label}
      </label>
      {hint && <p className="mb-2 font-sans text-xs text-text-muted">{hint}</p>}
      <textarea
        id={id}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={over}
        className="w-full resize-y rounded-md border border-hairline bg-panel p-3 font-sans text-sm leading-relaxed text-text outline-none transition placeholder:text-text-muted focus:border-primary/40 focus:ring-2 focus:ring-accent"
      />
      <p
        className={`mt-1 text-right font-sans text-xs tabular ${
          over ? 'text-error' : 'text-text-muted'
        }`}
      >
        {language === 'en' ? `${value.length} of ${max}` : `${value.length} из ${max}`}
      </p>
    </div>
  )
}

export function WikiEditor({
  article,
  onCancel,
  onSave,
}: WikiEditorProps) {
  const { language } = useApp()
  const en = language === 'en'
  const [summary, setSummary] = useState(article.summary)
  const [history, setHistory] = useState(article.history)
  const [cuisine, setCuisine] = useState(article.cuisine)
  const [traditions, setTraditions] = useState(article.traditions)
  const [practical, setPractical] = useState<WikiPractical[]>(
    article.practical.map((p) => ({ label: p.label, value: p.value }))
  )
  const [blocks, setBlocks] = useState<ArticleBlock[]>([])
  const [sourceLabel, setSourceLabel] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [license, setLicense] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const tooLong =
    summary.length > MAX_SUMMARY ||
    history.length > MAX_SECTION ||
    cuisine.length > MAX_SECTION ||
    traditions.length > MAX_SECTION

  const empty = !summary.trim() || !history.trim() || !cuisine.trim() || !traditions.trim()

  // A reviewed server version may intentionally preserve the catalog text while
  // attaching its first source and licence, so unchanged copy is valid here.
  const changed = true

  const updateRow = (i: number, patch: Partial<WikiPractical>) =>
    setPractical((prev) => prev.map((row, idx) => (idx === i ? { ...row, ...patch } : row)))

  const handleSave = async () => {
    if (saving || !sourceLabel.trim() || !sourceUrl.trim() || !license.trim()) return
    setSaving(true)
    setError(null)
    try {
      await onSave({
        body: {
          summary: summary.trim(), history: history.trim(), cuisine: cuisine.trim(), traditions: traditions.trim(),
          practical: practical.filter((p) => p.label.trim() && p.value.trim()), blocks,
        },
        sources: [{ label: sourceLabel.trim(), url: sourceUrl.trim() }],
        license: license.trim(),
      })
    } catch {
      setError(en ? 'Could not submit the edit. Check the source, license, and connection.' : 'Не удалось отправить серверную правку. Проверьте источник, лицензию и подключение.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="relative z-10">
        <div className="mx-auto flex max-w-[820px] items-center justify-between gap-3 px-5 pb-2 pt-6 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <IconButton label={en ? 'Cancel editing' : 'Отменить редактирование'} variant="ghost" size="sm" className="-ml-2" onClick={onCancel}>
              <ArrowLeft />
            </IconButton>
            <h1 className="truncate font-display text-2xl font-semibold text-text">
              {en ? 'Edit article' : 'Правка статьи'}
            </h1>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[820px] space-y-6 px-5 pb-8 pt-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl leading-none" aria-hidden="true">{article.flag}</span>
          <div>
            <p className="font-display text-2xl font-semibold text-text">{article.name}</p>
            <p className="font-sans text-xs text-text-muted">{en ? 'Your changes will be submitted for review' : 'Серверная версия будет отправлена на review'}</p>
          </div>
        </div>

        <GlassPanel className="flex items-start gap-3 p-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent-soft" aria-hidden="true" />
          <p className="font-sans text-xs leading-relaxed text-text-secondary">
            {en ? 'Edits are not published immediately. They enter the moderation queue, and other users continue to see the current article until an editor decides. Stick to facts and avoid opinion.' : 'Правки не публикуются сразу. Они попадают в очередь модерации, и до решения редактора статью в прежнем виде видят остальные пользователи. Пишите фактами и без оценок.'}
          </p>
        </GlassPanel>

        <Field
          id="wiki-summary"
          label={en ? 'Summary' : 'Краткое описание'}
          hint={en ? 'One paragraph shown on the country card and in search' : 'Один абзац, который увидят в карточке страны и в поиске'}
          value={summary}
          onChange={setSummary}
          rows={3}
          max={MAX_SUMMARY}
          language={language}
        />

        <Field id="wiki-history" label={en ? 'History' : 'История'} value={history} onChange={setHistory} max={MAX_SECTION} language={language} />
        <Field id="wiki-cuisine" label={en ? 'Cuisine' : 'Кухня'} value={cuisine} onChange={setCuisine} max={MAX_SECTION} language={language} />
        <Field
          id="wiki-traditions"
          label={en ? 'Traditions' : 'Традиции'}
          value={traditions}
          onChange={setTraditions}
          max={MAX_SECTION}
          language={language}
        />

        {/* Практическая информация */}
        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="font-sans text-sm font-semibold text-text">{en ? 'Practical information' : 'Практическая информация'}</h2>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPractical((p) => [...p, { label: '', value: '' }])}
            >
              <Plus />
              {en ? 'Add row' : 'Добавить строку'}
            </Button>
          </div>

          {practical.length === 0 ? (
            <GlassPanel variant="flat" className="p-6 text-center">
              <p className="font-sans text-sm text-text-muted">
                {en ? 'Nothing here yet. Add visa, currency, transport, or etiquette information.' : 'Пока ничего нет. Добавьте визу, валюту, транспорт или этикет.'}
              </p>
            </GlassPanel>
          ) : (
            <div className="space-y-2">
              {practical.map((row, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="grid flex-1 gap-2 sm:grid-cols-[180px_1fr]">
                    <div>
                      <label htmlFor={`p-label-${i}`} className="sr-only">
                        {en ? `Item label ${i + 1}` : `Название пункта ${i + 1}`}
                      </label>
                      <input
                        id={`p-label-${i}`}
                        value={row.label}
                        onChange={(e) => updateRow(i, { label: e.target.value })}
                        placeholder={en ? 'Visa' : 'Виза'}
                        className="h-11 w-full rounded-md border border-hairline bg-panel px-3 font-sans text-sm text-text outline-none transition placeholder:text-text-muted focus:border-primary/40 focus:ring-2 focus:ring-accent"
                      />
                    </div>
                    <div>
                      <label htmlFor={`p-value-${i}`} className="sr-only">
                        {en ? `Item value ${i + 1}` : `Значение пункта ${i + 1}`}
                      </label>
                      <input
                        id={`p-value-${i}`}
                        value={row.value}
                        onChange={(e) => updateRow(i, { value: e.target.value })}
                        placeholder={en ? 'Required for citizens of…' : 'Требуется для граждан РФ'}
                        className="h-11 w-full rounded-md border border-hairline bg-panel px-3 font-sans text-sm text-text outline-none transition placeholder:text-text-muted focus:border-primary/40 focus:ring-2 focus:ring-accent"
                      />
                    </div>
                  </div>
                  <IconButton
                    label={en ? `Remove item ${row.label || i + 1}` : `Удалить пункт ${row.label || i + 1}`}
                    variant="ghost"
                    onClick={() => setPractical((p) => p.filter((_, idx) => idx !== i))}
                  >
                    <Trash2 />
                  </IconButton>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Дополнительные блоки */}
        <div>
          <h2 className="mb-1 font-sans text-sm font-semibold text-text">{en ? 'Article blocks' : 'Блоки статьи'}</h2>
          <p className="mb-3 font-sans text-xs leading-relaxed text-text-muted">
            {en ? 'Photos, galleries, videos, quotes, and inserts such as a phrasebook or timetable. These become part of the server article after review.' : 'Фото, галереи, ролики, цитаты и врезки вроде разговорника или расписания. Эти данные войдут в серверную версию статьи после review.'}
          </p>
          <BlockEditor blocks={blocks} onChange={setBlocks} />
        </div>

        <div className="grid gap-3 border-t border-hairline pt-5">
          <p className="font-sans text-sm font-semibold text-text">{en ? 'Source and license' : 'Источник и лицензия'}</p>
          <label className="font-sans text-xs text-text-secondary">{en ? 'Source name' : 'Название источника'}<input value={sourceLabel} onChange={(event) => setSourceLabel(event.target.value)} className="mt-1 block h-11 w-full rounded-md border border-hairline bg-panel px-3 text-sm text-text" /></label>
          <label className="font-sans text-xs text-text-secondary">{en ? 'Source URL' : 'Ссылка на источник'}<input value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} type="url" className="mt-1 block h-11 w-full rounded-md border border-hairline bg-panel px-3 text-sm text-text" /></label>
          <label className="font-sans text-xs text-text-secondary">{en ? 'License' : 'Лицензия'}<input value={license} onChange={(event) => setLicense(event.target.value)} className="mt-1 block h-11 w-full rounded-md border border-hairline bg-panel px-3 text-sm text-text" /></label>
        </div>

        {/* Действия */}
        <div className="flex flex-wrap items-center gap-3 border-t border-hairline pt-5">
          <Button onClick={() => void handleSave()} disabled={!changed || tooLong || empty || !sourceLabel.trim() || !sourceUrl.trim() || !license.trim() || saving}>
            <Save />
            {saving ? (en ? 'Submitting…' : 'Отправляем…') : (en ? 'Submit for review' : 'Отправить на review')}
          </Button>
          <Button variant="ghost" onClick={onCancel}>
            {en ? 'Cancel' : 'Отмена'}
          </Button>
        </div>

        {empty && (
          <p className="font-sans text-xs text-error">
            Заполните описание и все три раздела: пустая статья не уйдёт на модерацию.
          </p>
        )}
        {tooLong && (
          <p className="font-sans text-xs text-error">
            {en ? 'A section exceeds the character limit. Shorten it before submitting.' : 'Один из разделов длиннее допустимого. Сократите текст, чтобы отправить правку.'}
          </p>
        )}
        {error && <p className="font-sans text-xs text-error">{error}</p>}
      </div>
    </div>
  )
}
