import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FollowUpQuestions } from '../FollowUpQuestions'

// Framer motion mock to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    button: ({ children, ...props }: React.ComponentProps<'button'>) => (
      <button {...props}>{children}</button>
    ),
  },
}))

describe('FollowUpQuestions', () => {
  it('renders nothing when questions array is empty', () => {
    const { container } = render(
      <FollowUpQuestions questions={[]} onQuestionClick={() => {}} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders all questions', () => {
    const questions = ['Какой у вас бюджет?', 'С кем вы едете?']
    render(
      <FollowUpQuestions questions={questions} onQuestionClick={() => {}} />
    )
    expect(screen.getByText('Какой у вас бюджет?')).toBeDefined()
    expect(screen.getByText('С кем вы едете?')).toBeDefined()
  })

  it('calls onQuestionClick with the question text when clicked', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    const questions = ['Какой у вас бюджет?']

    render(
      <FollowUpQuestions questions={questions} onQuestionClick={handleClick} />
    )

    await user.click(screen.getByText('Какой у вас бюджет?'))
    expect(handleClick).toHaveBeenCalledWith('Какой у вас бюджет?')
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('renders correct number of buttons', () => {
    const questions = ['Q1?', 'Q2?', 'Q3?']
    render(
      <FollowUpQuestions questions={questions} onQuestionClick={() => {}} />
    )
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(3)
  })
})
