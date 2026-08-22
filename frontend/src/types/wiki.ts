/**
 * Блочная модель статьи вики. Статья это упорядоченный список типизированных
 * блоков, а не одно текстовое поле: так модерация видит, что именно изменили,
 * и так в статью можно класть фото, видео и врезки.
 */

export type BlockType =
  | 'heading'
  | 'paragraph'
  | 'image'
  | 'gallery'
  | 'video'
  | 'quote'
  | 'list'
  | 'inset'

interface BaseBlock {
  id: string
}

export interface HeadingBlock extends BaseBlock {
  type: 'heading'
  text: string
}

export interface ParagraphBlock extends BaseBlock {
  type: 'paragraph'
  text: string
}

export interface ImageBlock extends BaseBlock {
  type: 'image'
  /** Ссылка или локальный object URL до появления бэкенда */
  src: string
  alt: string
  caption: string
}

export interface GalleryBlock extends BaseBlock {
  type: 'gallery'
  items: { src: string; alt: string }[]
}

export interface VideoBlock extends BaseBlock {
  type: 'video'
  src: string
  caption: string
}

export interface QuoteBlock extends BaseBlock {
  type: 'quote'
  text: string
  author: string
}

export interface ListBlock extends BaseBlock {
  type: 'list'
  items: string[]
}

/**
 * Форматированная врезка: расписание, разговорник, курс валют.
 * Моноширинный текст нужен здесь ради выравнивания колонок, а не ради кода.
 */
export interface InsetBlock extends BaseBlock {
  type: 'inset'
  title: string
  /** Строки вида «слово — перевод» или «09:00  Открытие» */
  lines: string[]
}

export type ArticleBlock =
  | HeadingBlock
  | ParagraphBlock
  | ImageBlock
  | GalleryBlock
  | VideoBlock
  | QuoteBlock
  | ListBlock
  | InsetBlock

export const blockLabel: Record<BlockType, string> = {
  heading: 'Подзаголовок',
  paragraph: 'Абзац',
  image: 'Фото',
  gallery: 'Галерея',
  video: 'Видео',
  quote: 'Цитата',
  list: 'Список',
  inset: 'Врезка',
}

export const blockHint: Record<BlockType, string> = {
  heading: 'Разделяет статью на части',
  paragraph: 'Основной текст',
  image: 'Один снимок с подписью',
  gallery: 'Несколько снимков в ряд',
  video: 'Ролик по ссылке или файлом',
  quote: 'Слова местного жителя или источника',
  list: 'Перечисление по пунктам',
  inset: 'Расписание, разговорник, курс валют',
}

let counter = 0
export function newBlockId(): string {
  counter += 1
  return `${Date.now().toString(36)}-${counter}`
}

export function createBlock(type: BlockType): ArticleBlock {
  const id = newBlockId()
  switch (type) {
    case 'heading':
      return { id, type, text: '' }
    case 'paragraph':
      return { id, type, text: '' }
    case 'image':
      return { id, type, src: '', alt: '', caption: '' }
    case 'gallery':
      return { id, type, items: [] }
    case 'video':
      return { id, type, src: '', caption: '' }
    case 'quote':
      return { id, type, text: '', author: '' }
    case 'list':
      return { id, type, items: [''] }
    case 'inset':
      return { id, type, title: '', lines: [''] }
  }
}

/** Блок считается пустым, если в нём нет ничего осмысленного */
export function isBlockEmpty(block: ArticleBlock): boolean {
  switch (block.type) {
    case 'heading':
    case 'paragraph':
      return block.text.trim() === ''
    case 'image':
      return block.src.trim() === ''
    case 'gallery':
      return block.items.length === 0
    case 'video':
      return block.src.trim() === ''
    case 'quote':
      return block.text.trim() === ''
    case 'list':
      return block.items.every((i) => i.trim() === '')
    case 'inset':
      return block.title.trim() === '' && block.lines.every((l) => l.trim() === '')
  }
}
