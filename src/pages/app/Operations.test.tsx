import { describe, expect, it, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
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
    mockCall.mockResolvedValue({ operations: [op({})] })
    render(
      <MemoryRouter>
        <Operations locale="pt" />
      </MemoryRouter>,
    )
    // 25.000000 é formatado pt-BR preservando decimais: 25,000000
    expect(await screen.findByText('25,000000 MockUSDT')).toBeInTheDocument()
    expect(screen.getByDisplayValue('PIX-CODE-123')).toBeInTheDocument()
    expect(screen.getByText('Criada')).toBeInTheDocument()
  })

  it('shows empty state when no operations', async () => {
    mockCall.mockResolvedValue({ operations: [] })
    render(
      <MemoryRouter>
        <Operations locale="pt" />
      </MemoryRouter>,
    )
    expect(await screen.findByText(/Nenhuma operação ainda/)).toBeInTheDocument()
  })

  it('renders confirmed operation with explorer link', async () => {
    mockCall.mockResolvedValue({
      operations: [op({ status: 'confirmed', tx_hash: '0xdead', pix_code: null })],
    })
    render(
      <MemoryRouter>
        <Operations locale="en" />
      </MemoryRouter>,
    )
    expect(await screen.findByText('Confirmed')).toBeInTheDocument()
    const link = await screen.findByRole('link', { name: /PolygonScan Amoy/ })
    expect(link).toHaveAttribute('href', 'https://amoy.polygonscan.com/tx/0xdead')
  })

  function openAndFillForm() {
    fireEvent.click(screen.getByRole('button', { name: 'Nova operação' }))
    fireEvent.change(screen.getByLabelText('Valor em MockUSDT'), { target: { value: '25' } })
    fireEvent.change(screen.getByLabelText('Carteira de destino (EVM)'), {
      target: { value: '0x0123456789abcdef0123456789abcdef01234567' },
    })
  }

  interface CreateCall {
    name: string
    opts: NonNullable<Parameters<typeof callEdge>[1]>
  }

  function createCalls(): CreateCall[] {
    return mockCall.mock.calls.flatMap(([name, opts]) =>
      name === 'create-operation' && opts !== undefined ? [{ name, opts }] : [],
    )
  }

  function submitButton() {
    const form = screen.getByRole('form', { name: 'Nova operação' })
    return within(form).getByRole('button', { name: 'Criar operação' })
  }

  it('cria operacao via POST com request_id de idempotencia', async () => {
    mockCall.mockResolvedValue({ operations: [] })
    render(
      <MemoryRouter>
        <Operations locale="pt" />
      </MemoryRouter>,
    )
    await screen.findByText(/Nenhuma operação ainda/)
    openAndFillForm()
    fireEvent.click(submitButton())
    await waitFor(() => {
      const calls = createCalls()
      expect(calls).toHaveLength(1)
    })
    const { name, opts } = createCalls()[0]
    expect(name).toBe('create-operation')
    expect(opts.method).toBe('POST')
    expect(opts.body).toEqual(
      expect.objectContaining({
        amount: '25',
        receiver_wallet: '0x0123456789abcdef0123456789abcdef01234567',
        request_id: expect.any(String),
      }),
    )
  })

  it('bloqueia criacao com carteira invalida sem chamar o backend', async () => {
    mockCall.mockResolvedValue({ operations: [] })
    render(
      <MemoryRouter>
        <Operations locale="pt" />
      </MemoryRouter>,
    )
    await screen.findByText(/Nenhuma operação ainda/)
    fireEvent.click(screen.getByRole('button', { name: 'Nova operação' }))
    fireEvent.change(screen.getByLabelText('Valor em MockUSDT'), { target: { value: '25' } })
    fireEvent.change(screen.getByLabelText('Carteira de destino (EVM)'), {
      target: { value: '0xabc-not-valid' },
    })
    fireEvent.click(submitButton())
    expect(await screen.findByText(/Carteira inválida/)).toBeInTheDocument()
    expect(createCalls()).toHaveLength(0)
  })

  it('bloqueia criacao com valor invalido sem chamar o backend', async () => {
    mockCall.mockResolvedValue({ operations: [] })
    render(
      <MemoryRouter>
        <Operations locale="pt" />
      </MemoryRouter>,
    )
    await screen.findByText(/Nenhuma operação ainda/)
    fireEvent.click(screen.getByRole('button', { name: 'Nova operação' }))
    fireEvent.change(screen.getByLabelText('Valor em MockUSDT'), { target: { value: '0' } })
    fireEvent.change(screen.getByLabelText('Carteira de destino (EVM)'), {
      target: { value: '0x0123456789abcdef0123456789abcdef01234567' },
    })
    fireEvent.click(submitButton())
    expect(await screen.findByText(/maior que zero/)).toBeInTheDocument()
    expect(createCalls()).toHaveLength(0)
  })

  it('desabilita o botao durante a criacao e nao dispara request duplicado', async () => {
    mockCall.mockResolvedValue({ operations: [] })
    let resolveGate: ((v: unknown) => void) | undefined
    const gate = new Promise((r) => {
      resolveGate = r
    })
    mockCall.mockImplementation((name: unknown) => {
      if (name === 'create-operation') return gate
      return Promise.resolve({ operations: [] })
    })
    render(
      <MemoryRouter>
        <Operations locale="pt" />
      </MemoryRouter>,
    )
    await screen.findByText(/Nenhuma operação ainda/)
    openAndFillForm()
    const createBtn = submitButton()
    fireEvent.click(createBtn)
    await waitFor(() => expect(createBtn).toBeDisabled())
    fireEvent.click(createBtn)
    expect(createCalls()).toHaveLength(1)
    resolveGate?.({ ok: true })
    await waitFor(() => expect(createCalls()).toHaveLength(1))
  })

  it('reutiliza o mesmo request_id em retry da mesma tentativa apos erro', async () => {
    mockCall.mockResolvedValue({ operations: [] })
    let shouldFail = true
    mockCall.mockImplementation((name: unknown) => {
      if (name === 'create-operation') {
        if (shouldFail) {
          shouldFail = false
          return Promise.reject(new Error('backend down'))
        }
        return Promise.resolve({ ok: true })
      }
      return Promise.resolve({ operations: [] })
    })
    render(
      <MemoryRouter>
        <Operations locale="pt" />
      </MemoryRouter>,
    )
    await screen.findByText(/Nenhuma operação ainda/)
    openAndFillForm()
    const createBtn = submitButton()
    fireEvent.click(createBtn)
    // erro interno mapeado para mensagem pública genérica (não expõe "backend down")
    expect(await screen.findByText('Não foi possível concluir a operação. Tente novamente.')).toBeInTheDocument()
    expect(screen.queryByText('backend down')).not.toBeInTheDocument()
    fireEvent.click(createBtn)
    await waitFor(() => expect(createCalls()).toHaveLength(2))
    const [first, second] = createCalls()
    expect(first.opts.body).toEqual(expect.objectContaining({ request_id: expect.any(String) }))
    expect(second.opts.body).toEqual(first.opts.body)
  })

  it('não expõe INSUFFICIENT_TREASURY_BALANCE bruto e mostra mensagem pública', async () => {
    mockCall.mockResolvedValue({
      operations: [op({ status: 'failed', error_message: 'INSUFFICIENT_TREASURY_BALANCE', tx_hash: null })],
    })
    render(
      <MemoryRouter>
        <Operations locale="pt" />
      </MemoryRouter>,
    )
    expect(await screen.findByText(/O valor informado não é permitido/)).toBeInTheDocument()
    expect(screen.queryByText('INSUFFICIENT_TREASURY_BALANCE')).not.toBeInTheDocument()
    expect(screen.queryByText(/treasury/i)).not.toBeInTheDocument()
    expect(screen.getByText(/Motivo:/)).toBeInTheDocument()
  })

  it('mapeia RPC_UNAVAILABLE para serviço indisponível sem vazar código', async () => {
    mockCall.mockResolvedValue({
      operations: [op({ status: 'failed', error_message: 'RPC_UNAVAILABLE' })],
    })
    render(
      <MemoryRouter>
        <Operations locale="pt" />
      </MemoryRouter>,
    )
    expect(await screen.findByText(/Não foi possível processar a operação no momento/)).toBeInTheDocument()
    expect(screen.queryByText('RPC_UNAVAILABLE')).not.toBeInTheDocument()
  })

  it('mapeia SETTLEMENT_RECONCILIATION_REQUIRED corretamente', async () => {
    mockCall.mockResolvedValue({
      operations: [op({ status: 'failed', error_message: 'SETTLEMENT_RECONCILIATION_REQUIRED' })],
    })
    render(
      <MemoryRouter>
        <Operations locale="en" />
      </MemoryRouter>,
    )
    expect(await screen.findByText(/We could not complete the operation automatically/)).toBeInTheDocument()
    expect(screen.queryByText('SETTLEMENT_RECONCILIATION_REQUIRED')).not.toBeInTheDocument()
  })
})
