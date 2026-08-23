import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ApiKeys } from './ApiKeys'

type RpcArgs = { p_name?: string }
const rpcMock = vi.hoisted(() => vi.fn())
const selectEq = vi.fn()
let selectResult: { data: unknown; error: unknown } = { data: [], error: null }

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        order: () => Promise.resolve(selectResult),
      }),
      update: () => ({ eq: selectEq }),
    }),
    rpc: (...args: unknown[]) => rpcMock(...args),
  },
}))

function key(over: Record<string, unknown> = {}) {
  return {
    id: 'k1',
    name: 'CI',
    key_prefix: 'pk_live_abc12345',
    created_at: new Date().toISOString(),
    last_used_at: null,
    revoked_at: null,
    ...over,
  }
}

describe('ApiKeys page', () => {
  beforeEach(() => {
    rpcMock.mockReset()
    selectEq.mockReset().mockResolvedValue({ data: null, error: null })
    selectResult = { data: [key()], error: null }
  })

  it('lists keys with prefix and active chip', async () => {
    render(<ApiKeys locale="pt" />)
    expect(await screen.findByText('CI')).toBeInTheDocument()
    expect(screen.getByText('pk_live_abc12345…')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Revogar' }).length).toBeGreaterThan(0)
  })

  it('creates a key and reveals raw secret once', async () => {
    const user = userEvent.setup()
    let call = 0
    rpcMock.mockImplementation((_fn: string, args: RpcArgs) => {
      if (_fn === 'create_api_key') {
        call++
        return Promise.resolve({ data: 'pk_live_secret999', error: null })
      }
      return Promise.resolve({ data: [key({ name: args?.p_name ?? '' })], error: null })
    })
    render(<ApiKeys locale="pt" />)
    await user.click(await screen.findByRole('button', { name: 'Criar chave' }))
    await user.type(screen.getByLabelText('Nome da chave'), 'Nova')
    await user.click(screen.getByRole('button', { name: 'Gerar chave' }))
    expect(await screen.findByText('pk_live_secret999')).toBeInTheDocument()
    expect(call).toBe(1)
  })

  it('revokes a key after confirmation step', async () => {
    const user = userEvent.setup()
    render(<ApiKeys locale="pt" />)
    const revokeButtons = await screen.findAllByRole('button', { name: 'Revogar' })
    await user.click(revokeButtons[0])
    expect(screen.getByText('Confirmar revogação?')).toBeInTheDocument()
    const confirmButtons = screen.getAllByRole('button', { name: 'Revogar' })
    await user.click(confirmButtons[confirmButtons.length - 1])
    expect(selectEq).toHaveBeenCalled()
  })
})
