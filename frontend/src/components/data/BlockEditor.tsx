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
}: {
  accept: string
  label: string
  onFile: (url: string, name: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handle = (file: File | undefined) => {
    if (!file) return
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setError(`Файл больше ${MAX_FILE_MB} МБ. Пока нет сервера, храним в браузере`)
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
        <span className="mt-1 font-sans text-xs text-text-muted">до {MAX_FILE_MB} МБ</span>
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
}: {
  block: ArticleBlock
  update: (patch: Partial<ArticleBlock>) => void
}) {
  switch (block.type) {
    case 'heading':
      return (
        <Field
          value={block.text}
          onChange={(text) => update({ text } as Partial<ArticleBlock>)}
          placeholder="Например: Что попробовать из еды"
        />
      )

    case 'paragraph':
      return (
        <Field
          rows={4}
          value={block.text}
          onChange={(text) => update({ text } as Partial<ArticleBlock>)}
          placeholder="Текст абзаца. Пишите фактами, без оценок"
        />
      )

    case 'image':
      return (
        <div className="space-y-3">
          {block.src ? (
            <div className="relative overflow-hidden rounded-md">
              <Img src={block.src} alt={block.alt || 'Снимок'} className="max-h-64 w-full object-cover" />
              <span className="absolute right-2 top-2">
                <IconButton label="Убрать снимок" size="sm" onClick={() => update({ src: '' } as Partial<ArticleBlock>)}>
                  <X />
                </IconButton>
              </span>
            </div>
          ) : (
            <FileDrop
              accept="image/*"
              label="Перетащите снимок или выберите файл"
              onFile={(src, name) => update({ src, alt: name } as Partial<ArticleBlock>)}
            />
          )}
          <Field
            value={block.alt}
            onChange={(alt) => update({ alt } as Partial<ArticleBlock>)}
            placeholder="Описание для тех, кто не видит снимок"
          />
          <Field
            value={block.caption}
            onChange={(caption) => update({ caption } as Partial<ArticleBlock>)}
            placeholder="Подпись под снимком, необязательно"
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
                      label={`Убрать снимок ${i + 1}`}
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
            label="Добавить снимок в галерею"
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
                <IconButton label="Убрать ролик" size="sm" onClick={() => update({ src: '' } as Partial<ArticleBlock>)}>
                  <X />
                </IconButton>
              </span>
            </div>
          ) : (
            <>
              <FileDrop
                accept="video/*"
                label="Перетащите ролик или выберите файл"
                onFile={(src) => update({ src } as Partial<ArticleBlock>)}
              />
              <Field
                value={block.src}
                onChange={(src) => update({ src } as Partial<ArticleBlock>)}
                placeholder="Или вставьте ссылку на ролик"
              />
            </>
          )}
          <Field
            value={block.caption}
            onChange={(caption) => update({ caption } as Partial<ArticleBlock>)}
            placeholder="Подпись под роликом"
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
            placeholder="Слова местного жителя или цитата из источника"
          />
          <Field
            value={block.author}
            onChange={(author) => update({ author } as Partial<ArticleBlock>)}
            placeholder="Кто это сказал"
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
                  placeholder={`Пункт ${i + 1}`}
                />
              </div>
              <IconButton
                label={`Удалить пункт ${i + 1}`}
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
            Пункт
          </Button>
        </div>
      )

    case 'inset':
      return (
        <div className="space-y-3">
          <Field
            value={block.title}
            onChange={(title) => update({ title } as Partial<ArticleBlock>)}
            placeholder="Заголовок врезки: Разговорник, Расписание, Курс валют"
          />
          <textarea
            rows={Math.max(3, block.lines.length + 1)}
            value={block.lines.join('\n')}
            onChange={(e) => update({ lines: e.target.value.split('\n') } as Partial<ArticleBlock>)}
            placeholder={'Гамарджоба - здравствуйте\nМадлоба - спасибо'}
            className="w-full resize-y rounded-md border border-hairline bg-panel px-3 py-2.5 font-mono text-sm leading-relaxed text-text outline-none transition placeholder:text-text-muted focus:border-primary/40 focus:ring-2 focus:ring-accent"
          />
          <p className="font-sans text-xs text-text-muted">
            Каждая строка отдельным пунктом. Моноширинный шрифт держит колонки ровными.
          </p>
        </div>
      )
  }
}

/* ---------------------------------------------------------- сам редактор */

export function BlockEditor({ blocks, onChange }: BlockEditorProps) {
  const [adding, setAdding] = useState(false)

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
                  {blockLabel[block.type]}
                </span>
              </span>

              <span className="flex items-center gap-1">
                <IconButton
                  label="Переместить выше"
                  variant="ghost"
                  size="sm"
                  disabled={i === 0}
                  onClick={() => move(i, -1)}
                >
                  <ChevronUp />
                </IconButton>
                <IconButton
                  label="Переместить ниже"
                  variant="ghost"
                  size="sm"
                  disabled={i === blocks.length - 1}
                  onClick={() => move(i, 1)}
                >
                  <ChevronDown />
                </IconButton>
                <IconButton
                  label={`Удалить блок «${blockLabel[block.type]}»`}
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(block.id)}
                >
                  <Trash2 />
                </IconButton>
              </span>
            </div>

            <BlockBody block={block} update={(patch) => update(block.id, patch)} />
          </GlassPanel>
        )
      })}

      {/* Добавление блока */}
      {adding ? (
        <GlassPanel variant="flat" className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-sans text-sm font-semibold text-text">Что добавить</p>
            <IconButton label="Отмена" variant="ghost" size="sm" onClick={() => setAdding(false)}>
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
                      {blockLabel[type]}
                    </span>
                    <span className="block font-sans text-xs leading-snug text-text-muted">
                      {blockHint[type]}
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
            Добавить блок
          </Button>
          {blocks.length > 0 && (
            <Chip size="sm" className="tabular">{pluralize(blocks.length, 'блок', 'блока', 'блоков')}</Chip>
          )}
        </div>
      )}
    </div>
  )
}
