import { useRef, useState } from 'react'
import {
  Plus, Trash2, ChevronUp, ChevronDown, Upload, X, Image as ImageIcon,
  Heading, Type, Images, Video, Quote, List, Table,
} from 'lucide-react'
import { GlassPanel, IconButton, Chip } from '@/components/ui/glass'
import { Button } from '@/components/ui/button'
import { Img } from '@/components/ui/Img'
import {
  createBlock, blockLabel, blockHint,
  type ArticleBlock, type BlockType,
} from '@/types/wiki'
import { cn, pluralize } from '@/lib/utils'
import { useApp } from '@/context/AppContext'

/** Пока нет бэкенда, файлы живут в браузере: ставим честный потолок */
const MAX_FILE_MB = 8

const blockIcon: Record<BlockType, typeof Type> = {
  heading: Heading,
  paragraph: Type,
  image: ImageIcon,
  gallery: Images,
  video: Video,
  quote: Quote,
  list: List,
  inset: Table,
}

interface BlockEditorProps {
  blocks: ArticleBlock[]
  onChange: (blocks: ArticleBlock[]) => void
}

/* ------------------------------------------------------- загрузка файла */

function FileDrop({
  accept,
  label,
  onFile,
  language,
}: {
  accept: string
  label: string
  onFile: (url: string, name: string) => void
  language: 'ru' | 'en'
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handle = (file: File | undefined) => {
    if (!file) return
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setError(language === 'en' ? `File exceeds ${MAX_FILE_MB} MB. Until a server is available, files are stored in this browser.` : `Файл больше ${MAX_FILE_MB} МБ. Пока нет сервера, храним в браузере`)
      return
    }
    setError(null)
    onFile(URL.createObjectURL(file), file.name)
  }

  return (
    <div>
      <label
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          handle(e.dataTransfer.files[0])
        }}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed px-4 py-8 text-center transition-colors',
          dragging
            ? 'border-primary/60 bg-primary/[0.06]'
            : 'border-hairline-2 hover:border-hairline-3 hover:bg-panel'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={(e) => handle(e.target.files?.[0])}
        />
        <Upload className="mb-2 h-5 w-5 text-text-muted" aria-hidden="true" />
        <span className="font-sans text-sm text-text-secondary">{label}</span>
        <span className="mt-1 font-sans text-xs text-text-muted">{language === 'en' ? `up to ${MAX_FILE_MB} MB` : `до ${MAX_FILE_MB} МБ`}</span>
      </label>
      {error && <p className="mt-2 font-sans text-xs text-error">{error}</p>}
    </div>
  )
}

/* ------------------------------------------------------------- поля блока */

function Field({
  value,
  onChange,
  placeholder,
  rows,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  rows?: number
}) {
  const base =
    'w-full rounded-md border border-hairline bg-panel px-3 py-2.5 font-sans text-sm text-text outline-none transition placeholder:text-text-muted focus:border-primary/40 focus:ring-2 focus:ring-accent'

  return rows ? (
    <textarea
      rows={rows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(base, 'resize-y leading-relaxed')}
    />
  ) : (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={base}
    />
  )
}

function BlockBody({
  block,
  update,
  language,
}: {
  block: ArticleBlock
  update: (patch: Partial<ArticleBlock>) => void
  language: 'ru' | 'en'
}) {
  const en = language === 'en'
  switch (block.type) {
    case 'heading':
      return (
        <Field
          value={block.text}
          onChange={(text) => update({ text } as Partial<ArticleBlock>)}
          placeholder={en ? 'For example: What to try' : 'Например: Что попробовать из еды'}
        />
      )

    case 'paragraph':
      return (
        <Field
          rows={4}
          value={block.text}
          onChange={(text) => update({ text } as Partial<ArticleBlock>)}
          placeholder={en ? 'Paragraph text. Stick to facts, avoid opinions' : 'Текст абзаца. Пишите фактами, без оценок'}
        />
      )

    case 'image':
      return (
        <div className="space-y-3">
          {block.src ? (
            <div className="relative overflow-hidden rounded-md">
              <Img src={block.src} alt={block.alt || (en ? 'Photo' : 'Снимок')} className="max-h-64 w-full object-cover" />
              <span className="absolute right-2 top-2">
                <IconButton label={en ? 'Remove photo' : 'Убрать снимок'} size="sm" onClick={() => update({ src: '' } as Partial<ArticleBlock>)}>
                  <X />
                </IconButton>
              </span>
            </div>
          ) : (
            <FileDrop
              accept="image/*"
              label={en ? 'Drop a photo here or choose a file' : 'Перетащите снимок или выберите файл'}
              language={language}
              onFile={(src, name) => update({ src, alt: name } as Partial<ArticleBlock>)}
            />
          )}
          <Field
            value={block.alt}
            onChange={(alt) => update({ alt } as Partial<ArticleBlock>)}
            placeholder={en ? 'Description for people who cannot see the photo' : 'Описание для тех, кто не видит снимок'}
          />
          <Field
            value={block.caption}
            onChange={(caption) => update({ caption } as Partial<ArticleBlock>)}
            placeholder={en ? 'Photo caption (optional)' : 'Подпись под снимком, необязательно'}
          />
        </div>
      )

    case 'gallery':
      return (
        <div className="space-y-3">
          {block.items.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {block.items.map((item, i) => (
                <div key={item.src + i} className="relative aspect-[4/3] overflow-hidden rounded-sm">
                  <Img src={item.src} alt={item.alt} className="h-full w-full object-cover" />
                  <span className="absolute right-1 top-1">
                    <IconButton
                      label={en ? `Remove photo ${i + 1}` : `Убрать снимок ${i + 1}`}
                      size="sm"
                      onClick={() =>
                        update({ items: block.items.filter((_, idx) => idx !== i) } as Partial<ArticleBlock>)
                      }
                    >
                      <X />
                    </IconButton>
                  </span>
                </div>
              ))}
            </div>
          )}
          <FileDrop
            accept="image/*"
            label={en ? 'Add a photo to the gallery' : 'Добавить снимок в галерею'}
            language={language}
            onFile={(src, name) =>
              update({ items: [...block.items, { src, alt: name }] } as Partial<ArticleBlock>)
            }
          />
        </div>
      )

    case 'video':
      return (
        <div className="space-y-3">
          {block.src ? (
            <div className="relative overflow-hidden rounded-md bg-ink-950">
              <video src={block.src} controls className="max-h-64 w-full" />
              <span className="absolute right-2 top-2">
                <IconButton label={en ? 'Remove video' : 'Убрать ролик'} size="sm" onClick={() => update({ src: '' } as Partial<ArticleBlock>)}>
                  <X />
                </IconButton>
              </span>
            </div>
          ) : (
            <>
              <FileDrop
                accept="video/*"
                label={en ? 'Drop a video here or choose a file' : 'Перетащите ролик или выберите файл'}
                language={language}
                onFile={(src) => update({ src } as Partial<ArticleBlock>)}
              />
              <Field
                value={block.src}
                onChange={(src) => update({ src } as Partial<ArticleBlock>)}
                placeholder={en ? 'Or paste a video URL' : 'Или вставьте ссылку на ролик'}
              />
            </>
          )}
          <Field
            value={block.caption}
            onChange={(caption) => update({ caption } as Partial<ArticleBlock>)}
            placeholder={en ? 'Video caption' : 'Подпись под роликом'}
          />
        </div>
      )

    case 'quote':
      return (
        <div className="space-y-3">
          <Field
            rows={3}
            value={block.text}
            onChange={(text) => update({ text } as Partial<ArticleBlock>)}
            placeholder={en ? 'Quote from a local resident or a source' : 'Слова местного жителя или цитата из источника'}
          />
          <Field
            value={block.author}
            onChange={(author) => update({ author } as Partial<ArticleBlock>)}
            placeholder={en ? 'Who said this?' : 'Кто это сказал'}
          />
        </div>
      )

    case 'list':
      return (
        <div className="space-y-2">
          {block.items.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="h-1 w-1 shrink-0 rounded-full bg-primary" aria-hidden="true" />
              <div className="flex-1">
                <Field
                  value={item}
                  onChange={(v) =>
                    update({
                      items: block.items.map((x, idx) => (idx === i ? v : x)),
                    } as Partial<ArticleBlock>)
                  }
                  placeholder={en ? `Item ${i + 1}` : `Пункт ${i + 1}`}
                />
              </div>
              <IconButton
                label={en ? `Remove item ${i + 1}` : `Удалить пункт ${i + 1}`}
                variant="ghost"
                size="sm"
                onClick={() =>
                  update({ items: block.items.filter((_, idx) => idx !== i) } as Partial<ArticleBlock>)
                }
              >
                <Trash2 />
              </IconButton>
            </div>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => update({ items: [...block.items, ''] } as Partial<ArticleBlock>)}
          >
            <Plus />
            {en ? 'Item' : 'Пункт'}
          </Button>
        </div>
      )

    case 'inset':
      return (
        <div className="space-y-3">
          <Field
            value={block.title}
            onChange={(title) => update({ title } as Partial<ArticleBlock>)}
            placeholder={en ? 'Insert title: Phrasebook, Timetable, Exchange rates' : 'Заголовок врезки: Разговорник, Расписание, Курс валют'}
          />
          <textarea
            rows={Math.max(3, block.lines.length + 1)}
            value={block.lines.join('\n')}
            onChange={(e) => update({ lines: e.target.value.split('\n') } as Partial<ArticleBlock>)}
            placeholder={en ? 'Gamarjoba - hello\nMadloba - thank you' : 'Гамарджоба - здравствуйте\nМадлоба - спасибо'}
            className="w-full resize-y rounded-md border border-hairline bg-panel px-3 py-2.5 font-mono text-sm leading-relaxed text-text outline-none transition placeholder:text-text-muted focus:border-primary/40 focus:ring-2 focus:ring-accent"
          />
          <p className="font-sans text-xs text-text-muted">
            {en ? 'Each line is a separate item. Monospace keeps columns aligned.' : 'Каждая строка отдельным пунктом. Моноширинный шрифт держит колонки ровными.'}
          </p>
        </div>
      )
  }
}

/* ---------------------------------------------------------- сам редактор */

export function BlockEditor({ blocks, onChange }: BlockEditorProps) {
  const [adding, setAdding] = useState(false)
  const { language } = useApp()
  const en = language === 'en'
  const labels: Record<BlockType, string> = en ? {
    heading: 'Subheading', paragraph: 'Paragraph', image: 'Photo', gallery: 'Gallery', video: 'Video', quote: 'Quote', list: 'List', inset: 'Insert',
  } : blockLabel
  const hints: Record<BlockType, string> = en ? {
    heading: 'Divides the article into sections', paragraph: 'Main text', image: 'A single photo with a caption', gallery: 'Several photos in a row', video: 'A video URL or file', quote: 'Words from a local resident or source', list: 'A bulleted list', inset: 'Timetable, phrasebook, or exchange rates',
  } : blockHint

  const update = (id: string, patch: Partial<ArticleBlock>) =>
    onChange(blocks.map((b) => (b.id === id ? ({ ...b, ...patch } as ArticleBlock) : b)))

  const remove = (id: string) => onChange(blocks.filter((b) => b.id !== id))

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir
    if (target < 0 || target >= blocks.length) return
    const next = [...blocks]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  const add = (type: BlockType) => {
    onChange([...blocks, createBlock(type)])
    setAdding(false)
  }

  return (
    <div className="space-y-3">
      {blocks.map((block, i) => {
        const Icon = blockIcon[block.type]
        return (
          <GlassPanel key={block.id} variant="flat" className="p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-text-muted" aria-hidden="true" />
                <span className="font-sans text-xs uppercase tracking-wide text-text-muted">
                  {labels[block.type]}
                </span>
              </span>

              <span className="flex items-center gap-1">
                <IconButton
                  label={en ? 'Move up' : 'Переместить выше'}
                  variant="ghost"
                  size="sm"
                  disabled={i === 0}
                  onClick={() => move(i, -1)}
                >
                  <ChevronUp />
                </IconButton>
                <IconButton
                  label={en ? 'Move down' : 'Переместить ниже'}
                  variant="ghost"
                  size="sm"
                  disabled={i === blocks.length - 1}
                  onClick={() => move(i, 1)}
                >
                  <ChevronDown />
                </IconButton>
                <IconButton
                  label={en ? `Remove ${labels[block.type]} block` : `Удалить блок «${labels[block.type]}»`}
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(block.id)}
                >
                  <Trash2 />
                </IconButton>
              </span>
            </div>

            <BlockBody block={block} update={(patch) => update(block.id, patch)} language={language} />
          </GlassPanel>
        )
      })}

      {/* Добавление блока */}
      {adding ? (
        <GlassPanel variant="flat" className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-sans text-sm font-semibold text-text">{en ? 'Choose a block' : 'Что добавить'}</p>
            <IconButton label={en ? 'Cancel' : 'Отмена'} variant="ghost" size="sm" onClick={() => setAdding(false)}>
              <X />
            </IconButton>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {(Object.keys(blockLabel) as BlockType[]).map((type) => {
              const Icon = blockIcon[type]
              return (
                <button
                  key={type}
                  onClick={() => add(type)}
                  className="flex items-start gap-3 rounded-md border border-hairline p-3 text-left transition-colors hover:border-hairline-2 hover:bg-panel-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-panel-2 text-text-secondary">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-sans text-sm font-medium text-text">
                      {labels[type]}
                    </span>
                    <span className="block font-sans text-xs leading-snug text-text-muted">
                      {hints[type]}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        </GlassPanel>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" onClick={() => setAdding(true)}>
            <Plus />
            {en ? 'Add block' : 'Добавить блок'}
          </Button>
          {blocks.length > 0 && (
            <Chip size="sm" className="tabular">{en ? `${blocks.length} ${blocks.length === 1 ? 'block' : 'blocks'}` : pluralize(blocks.length, 'блок', 'блока', 'блоков')}</Chip>
          )}
        </div>
      )}
    </div>
  )
}
