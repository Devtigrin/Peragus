import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Operations } from './Operations'
import type { Operation } from '@/types/operation'

vi.mock('@/lib/functions', () => ({
  callEdge: vi.fn(),
}))
vi.mock('@/auth/AuthProvider', () => ({
  useAuth: () => ({ user: { email: 't@peragus.test' }, signOut: vi.fn() }),
}))

import { callEdge } from '@/lib/functions'
const mockCall = vi.mocked(callEdge)

function op(partial: Partial<Operation>): Operation {
  return {
    id: 'op1',
    status: 'created',
    chain: 'polygon_amoy',
    token_symbol: 'MockUSDT',
    usdt_amount_text: '25.000000',
    receiver_wallet: '0xabc',
    sender_wallet: null,
    tx_hash: null,
    error_message: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    pix_code: 'PIX-CODE-123',
    ...partial,
  }
}

describe('Operations page', () => {
  beforeEach(() => {
    mockCall.mockReset()
  })

  it('renders operations list with amount and pix code', async () => {
    mockCall.mockResolvedValue([op({})])
    render(
      <MemoryRouter>
        <Operations locale="pt" />
      </MemoryRouter>,
    )
    expect(await screen.findByText('25.000000 MockUSDT')).toBeInTheDocument()
    expect(screen.getByDisplayValue('PIX-CODE-123')).toBeInTheDocument()
    expect(screen.getByText('Criada')).toBeInTheDocument()
  })

  it('shows empty state when no operations', async () => {
    mockCall.mockResolvedValue([])
    render(
      <MemoryRouter>
        <Operations locale="pt" />
      </MemoryRouter>,
    )
    expect(await screen.findByText(/Nenhuma operação ainda/)).toBeInTheDocument()
  })

  it('renders confirmed operation with explorer link', async () => {
    mockCall.mockResolvedValue([
      op({ status: 'confirmed', tx_hash: '0xdead', pix_code: null }),
    ])
    render(
      <MemoryRouter>
        <Operations locale="en" />
      </MemoryRouter>,
    )
    expect(await screen.findByText('Confirmed')).toBeInTheDocument()
    const link = await screen.findByRole('link', { name: /PolygonScan Amoy/ })
    expect(link).toHaveAttribute('href', 'https://amoy.polygonscan.com/tx/0xdead')
  })
})
