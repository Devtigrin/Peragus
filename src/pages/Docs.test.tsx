import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Docs } from './Docs'

describe.each(['pt', 'es', 'en'] as const)('Docs page (%s)', (locale) => {
  it('renders endpoints with curl examples', () => {
    render(
      <MemoryRouter>
        <Docs locale={locale} />
      </MemoryRouter>,
    )
    expect(screen.getByText(/create-operation/)).toBeInTheDocument()
    const codes = screen.getAllByRole('code')
    expect(codes.length).toBeGreaterThan(4)
    expect(screen.getAllByText(/curl/).length).toBeGreaterThan(0)
  })
})
