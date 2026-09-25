import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { WikiEditor } from '../WikiEditor'

vi.mock('@/context/AppContext', () => ({ useApp: () => ({ language: 'en' }) }))

const article = {
  id: 'jp', name: 'Japan', flag: '🇯🇵', summary: 'Summary', history: 'History',
  cuisine: 'Cuisine', traditions: 'Traditions', practical: [],
}

describe('WikiEditor localization', () => {
  it('renders the English edit form and block tools', () => {
    render(<WikiEditor article={article} onCancel={() => undefined} onSave={vi.fn(async () => undefined)} />)

    expect(screen.getByRole('heading', { name: 'Edit article' })).toBeTruthy()
    expect(screen.getByText(/Your changes will be submitted for review/)).toBeTruthy()
    expect(screen.getByText('Source and license')).toBeTruthy()
    expect(screen.getByText('Source name')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Submit for review' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Add block' }))
    expect(screen.getByText('Choose a block')).toBeTruthy()
    expect(screen.getByText('Subheading')).toBeTruthy()
    expect(screen.getByText('Divides the article into sections')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Photo/ }))
    expect(screen.getByText('Drop a photo here or choose a file')).toBeTruthy()
    expect(screen.getByText('up to 8 MB')).toBeTruthy()
  })
})
