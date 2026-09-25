import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { CountryCarousel, type CarouselItem } from '../CountryCarousel'

const items: CarouselItem[] = [{
  id: 'jp', name: 'Japan', flag: '🇯🇵', cover: '/japan.jpg',
  summary: 'An island country.', subtitle: 'Tradition and technology',
}]

describe('CountryCarousel localization', () => {
  it('provides English labels for carousel controls and the active card', () => {
    render(<CountryCarousel items={items} onOpen={vi.fn()} language="en" />)

    expect(screen.getByRole('button', { name: 'Open Japan article' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Previous country' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Next country' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Go to Japan' })).toBeTruthy()
    expect(screen.getByText('Open')).toBeTruthy()
  })
})
