import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi, afterEach } from 'vitest'
import type { ReactNode } from 'react'
import { ErrorBoundary } from './ErrorBoundary'

function Bomb(): ReactNode {
  throw new Error('boom')
}

describe('ErrorBoundary', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renderiza um fallback visível quando um filho quebra no render', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <ErrorBoundary context="app:pt">
        <Bomb />
      </ErrorBoundary>,
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Algo deu errado')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Recarregar' })).toBeInTheDocument()
  })

  it('renderiza os filhos quando não há erro', () => {
    render(
      <ErrorBoundary>
        <p>ok</p>
      </ErrorBoundary>,
    )
    expect(screen.getByText('ok')).toBeInTheDocument()
  })
})
