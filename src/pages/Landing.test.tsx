import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { Landing } from './Landing'

describe('Landing', () => {
  it('states the tested flow and limits before conversion', () => {
    render(<MemoryRouter><Landing locale="pt" /></MemoryRouter>)
    const main = screen.getByRole('main')
    expect(within(main).getByRole('heading', { level: 1, name: 'Pix no Brasil. Liquidação na sua carteira.' })).toBeInTheDocument()
    expect(within(main).getByText(/sem movimentação de fundos reais/i)).toBeInTheDocument()
    expect(within(main).getByText(/mockusdt não é usdt/i)).toBeInTheDocument()
  })

  it('uses one primary CTA label consistently', () => {
    render(<MemoryRouter><Landing locale="en" /></MemoryRouter>)
    expect(screen.getAllByRole('link', { name: 'Create sandbox account' })).toHaveLength(2)
  })

  it('does not render retail or unsupported claims', () => {
    const { container } = render(<MemoryRouter><Landing locale="pt" /></MemoryRouter>)
    expect(container.textContent).not.toMatch(/compre usdt|taxas competitivas|99,9%|dólares digitais/i)
  })
})
