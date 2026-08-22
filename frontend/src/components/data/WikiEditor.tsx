import { useState } from 'react'
import { ArrowLeft, Plus, Trash2, Info, Save, RotateCcw } from 'lucide-react'
import { GlassPanel, IconButton, Chip } from '@/components/ui/glass'
import { Button } from '@/components/ui/button'
import type { WikiDraft, WikiPractical } from '@/hooks/useWikiDrafts'
import { BlockEditor } from './BlockEditor'
import type { ArticleBlock } from '@/types/wiki'

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
  existingDraft?: WikiDraft
  onCancel: () => void
  onSave: (draft: Omit<WikiDraft, 'status' | 'updatedAt'>) => void
  onDiscard: () => void
  authorName: string
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
}: {
  id: string
  label: string
  hint?: string
  value: string
  onChange: (v: string) => void
  rows?: number
  max: number
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
        {value.length} из {max}
      </p>
    </div>
  )
}

export function WikiEditor({
  article,
  existingDraft,
  onCancel,
  onSave,
  onDiscard,
  authorName,
}: WikiEditorProps) {
  const base = existingDraft ?? article

  const [summary, setSummary] = useState(base.summary)
  const [history, setHistory] = useState(base.history)
  const [cuisine, setCuisine] = useState(base.cuisine)
  const [traditions, setTraditions] = useState(base.traditions)
  const [practical, setPractical] = useState<WikiPractical[]>(
    base.practical.map((p) => ({ label: p.label, value: p.value }))
  )
  const [blocks, setBlocks] = useState<ArticleBlock[]>(existingDraft?.blocks ?? [])

  const tooLong =
    summary.length > MAX_SUMMARY ||
    history.length > MAX_SECTION ||
    cuisine.length > MAX_SECTION ||
    traditions.length > MAX_SECTION

  const empty = !summary.trim() || !history.trim() || !cuisine.trim() || !traditions.trim()

  const changed =
    summary !== article.summary ||
    history !== article.history ||
    cuisine !== article.cuisine ||
    traditions !== article.traditions ||
    JSON.stringify(practical) !== JSON.stringify(article.practical.map((p) => ({ label: p.label, value: p.value }))) ||
    JSON.stringify(blocks) !== JSON.stringify(existingDraft?.blocks ?? [])

  const updateRow = (i: number, patch: Partial<WikiPractical>) =>
    setPractical((prev) => prev.map((row, idx) => (idx === i ? { ...row, ...patch } : row)))

  const handleSave = () => {
    onSave({
      countryId: article.id,
      summary: summary.trim(),
      history: history.trim(),
      cuisine: cuisine.trim(),
      traditions: traditions.trim(),
      practical: practical.filter((p) => p.label.trim() && p.value.trim()),
      blocks,
      author: authorName,
    })
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="relative z-10">
        <div className="mx-auto flex max-w-[820px] items-center justify-between gap-3 px-5 pb-2 pt-6 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <IconButton label="Отменить редактирование" variant="ghost" size="sm" className="-ml-2" onClick={onCancel}>
              <ArrowLeft />
            </IconButton>
            <h1 className="truncate font-display text-2xl font-semibold text-text">
              Правка статьи
            </h1>
          </div>
          {existingDraft?.status === 'pending' && <Chip size="sm" variant="accent">На модерации</Chip>}
        </div>
      </div>

      <div className="mx-auto w-full max-w-[820px] space-y-6 px-5 pb-8 pt-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl leading-none" aria-hidden="true">{article.flag}</span>
          <div>
            <p className="font-display text-2xl font-semibold text-text">{article.name}</p>
            <p className="font-sans text-xs text-text-muted">Редактирует {authorName}</p>
          </div>
        </div>

        <GlassPanel className="flex items-start gap-3 p-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent-soft" aria-hidden="true" />
          <p className="font-sans text-xs leading-relaxed text-text-secondary">
            Правки не публикуются сразу. Они попадают в очередь модерации, и до решения редактора
            статью в прежнем виде видят остальные пользователи. Пишите фактами и без оценок.
          </p>
        </GlassPanel>

        <Field
          id="wiki-summary"
          label="Краткое описание"
          hint="Один абзац, который увидят в карточке страны и в поиске"
          value={summary}
          onChange={setSummary}
          rows={3}
          max={MAX_SUMMARY}
        />

        <Field id="wiki-history" label="История" value={history} onChange={setHistory} max={MAX_SECTION} />
        <Field id="wiki-cuisine" label="Кухня" value={cuisine} onChange={setCuisine} max={MAX_SECTION} />
        <Field
          id="wiki-traditions"
          label="Традиции"
          value={traditions}
          onChange={setTraditions}
          max={MAX_SECTION}
        />

        {/* Практическая информация */}
        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="font-sans text-sm font-semibold text-text">Практическая информация</h2>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPractical((p) => [...p, { label: '', value: '' }])}
            >
              <Plus />
              Добавить строку
            </Button>
          </div>

          {practical.length === 0 ? (
            <GlassPanel variant="flat" className="p-6 text-center">
              <p className="font-sans text-sm text-text-muted">
                Пока ничего нет. Добавьте визу, валюту, транспорт или этикет.
              </p>
            </GlassPanel>
          ) : (
            <div className="space-y-2">
              {practical.map((row, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="grid flex-1 gap-2 sm:grid-cols-[180px_1fr]">
                    <div>
                      <label htmlFor={`p-label-${i}`} className="sr-only">
                        Название пункта {i + 1}
                      </label>
                      <input
                        id={`p-label-${i}`}
                        value={row.label}
                        onChange={(e) => updateRow(i, { label: e.target.value })}
                        placeholder="Виза"
                        className="h-11 w-full rounded-md border border-hairline bg-panel px-3 font-sans text-sm text-text outline-none transition placeholder:text-text-muted focus:border-primary/40 focus:ring-2 focus:ring-accent"
                      />
                    </div>
                    <div>
                      <label htmlFor={`p-value-${i}`} className="sr-only">
                        Значение пункта {i + 1}
                      </label>
                      <input
                        id={`p-value-${i}`}
                        value={row.value}
                        onChange={(e) => updateRow(i, { value: e.target.value })}
                        placeholder="Требуется для граждан РФ"
                        className="h-11 w-full rounded-md border border-hairline bg-panel px-3 font-sans text-sm text-text outline-none transition placeholder:text-text-muted focus:border-primary/40 focus:ring-2 focus:ring-accent"
                      />
                    </div>
                  </div>
                  <IconButton
                    label={`Удалить пункт ${row.label || i + 1}`}
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
          <h2 className="mb-1 font-sans text-sm font-semibold text-text">Блоки статьи</h2>
          <p className="mb-3 font-sans text-xs leading-relaxed text-text-muted">
            Фото, галереи, ролики, цитаты и врезки вроде разговорника или расписания.
            Пока нет сервера, файлы хранятся в браузере и не переживут очистку данных.
          </p>
          <BlockEditor blocks={blocks} onChange={setBlocks} />
        </div>

        {/* Действия */}
        <div className="flex flex-wrap items-center gap-3 border-t border-hairline pt-5">
          <Button onClick={handleSave} disabled={!changed || tooLong || empty}>
            <Save />
            Отправить на модерацию
          </Button>
          <Button variant="ghost" onClick={onCancel}>
            Отмена
          </Button>

          {existingDraft && (
            <Button variant="ghost" className="ml-auto text-text-muted" onClick={onDiscard}>
              <RotateCcw />
              Убрать мою правку
            </Button>
          )}
        </div>

        {empty && (
          <p className="font-sans text-xs text-error">
            Заполните описание и все три раздела: пустая статья не уйдёт на модерацию.
          </p>
        )}
        {tooLong && (
          <p className="font-sans text-xs text-error">
            Один из разделов длиннее допустимого. Сократите текст, чтобы отправить правку.
          </p>
        )}
      </div>
    </div>
  )
}
