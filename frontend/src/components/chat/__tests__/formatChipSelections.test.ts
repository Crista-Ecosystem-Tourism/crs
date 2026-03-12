import { describe, it, expect } from 'vitest'
import { formatChipSelections, mergeMessage } from '../formatChipSelections'
import type { SuggestedReplyGroup } from '@/types'

const groups: SuggestedReplyGroup[] = [
  {
    category: 'budget',
    label: 'Бюджет',
    icon: 'wallet',
    options: [
      { value: 'эконом', label: 'Эконом', description: 'до 3000₽/день' },
      { value: 'средний', label: 'Средний', description: '3000-7000₽/день' },
    ],
    allow_custom: false,
  },
  {
    category: 'company',
    label: 'Компания',
    icon: 'users',
    options: [
      { value: 'один', label: 'Один', description: 'Соло' },
      { value: 'пара', label: 'Пара', description: 'Вдвоём' },
    ],
    allow_custom: true,
  },
  {
    category: 'duration',
    label: 'Длительность',
    icon: 'clock',
    options: [
      { value: '3', label: '3 дня', description: 'Выходные+' },
      { value: '7', label: '7 дней', description: 'Неделя' },
    ],
    allow_custom: false,
  },
]

describe('formatChipSelections', () => {
  it('returns empty string when no selections', () => {
    expect(formatChipSelections({}, groups)).toBe('')
  })

  it('formats single selection', () => {
    expect(formatChipSelections({ budget: 'средний' }, groups)).toBe('Бюджет: средний')
  })

  it('formats multiple selections in group order', () => {
    const selections = { budget: 'средний', company: 'пара', duration: '7' }
    expect(formatChipSelections(selections, groups)).toBe(
      'Бюджет: средний, Компания: пара, Длительность: 7'
    )
  })

  it('ignores selections not present in groups', () => {
    const selections = { budget: 'средний', unknown_category: 'foo' }
    expect(formatChipSelections(selections, groups)).toBe('Бюджет: средний')
  })

  it('preserves group order regardless of selection order', () => {
    const selections = { duration: '3', budget: 'эконом' }
    expect(formatChipSelections(selections, groups)).toBe(
      'Бюджет: эконом, Длительность: 3'
    )
  })

  it('handles custom values the same as preset values', () => {
    const selections = { company: 'семья с детьми' }
    expect(formatChipSelections(selections, groups)).toBe('Компания: семья с детьми')
  })

  it('returns empty string when groups array is empty', () => {
    expect(formatChipSelections({ budget: 'средний' }, [])).toBe('')
  })
})

describe('mergeMessage', () => {
  it('combines chip text and user text with newline', () => {
    expect(mergeMessage('Бюджет: средний', 'хочу на море')).toBe(
      'Бюджет: средний\nхочу на море'
    )
  })

  it('returns only chip text when user text is empty', () => {
    expect(mergeMessage('Бюджет: средний', '')).toBe('Бюджет: средний')
  })

  it('returns only user text when chip text is empty', () => {
    expect(mergeMessage('', 'хочу на море')).toBe('хочу на море')
  })

  it('returns empty string when both are empty', () => {
    expect(mergeMessage('', '')).toBe('')
  })

  it('handles multiline user text', () => {
    const result = mergeMessage('Бюджет: средний', 'хочу на море\nи в горы')
    expect(result).toBe('Бюджет: средний\nхочу на море\nи в горы')
  })

  it('handles complex chip + text scenario', () => {
    const chips = 'Бюджет: средний, Компания: пара, Длительность: 7'
    const text = 'еще хочу купаться в море и есть во вкусных ресторанах'
    const result = mergeMessage(chips, text)
    expect(result).toBe(
      'Бюджет: средний, Компания: пара, Длительность: 7\nеще хочу купаться в море и есть во вкусных ресторанах'
    )
  })
})
