import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const callEdge = vi.fn()
vi.mock('@/lib/functions', () => ({
  callEdge: (...args: unknown[]) => callEdge(...args),
}))

const updatePassword = vi.fn()
const clearRecovery = vi.fn()
let recovering = false
vi.mock('@/auth/AuthProvider', () => ({
  useAuth: () => ({
    recovering,
    updatePassword,
    clearRecovery,
    loading: false,
    user: null,
  }),
}))

import { ResetPassword } from './ResetPassword'

function renderReset(initialEntries: string[]) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <ResetPassword locale="pt" />
    </MemoryRouter>,
  )
}

async function fillAndSubmit(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Nova senha'), 'nova-senha-123')
  await user.type(screen.getByLabelText('Confirmar nova senha'), 'nova-senha-123')
  await user.click(screen.getByRole('button', { name: 'Salvar senha' }))
}

describe('ResetPassword', () => {
  beforeEach(() => {
    callEdge.mockReset()
    updatePassword.mockReset()
    clearRecovery.mockReset()
    recovering = false
  })

  it('sends password and token to the confirm edge function', async () => {
    callEdge.mockResolvedValue({ ok: true })
    const user = userEvent.setup()
    renderReset(['/resetar-senha?token=abc123'])
    await fillAndSubmit(user)
    expect(callEdge).toHaveBeenCalledTimes(1)
    expect(callEdge).toHaveBeenCalledWith('confirm-reset-password', {
      method: 'POST',
      body: { token: 'abc123', password: 'nova-senha-123' },
      public: true,
    })
    expect(await screen.findByRole('note')).toHaveTextContent('Senha atualizada com sucesso.')
  })

  it('updates the password through the GoTrue recovery session without an edge call', async () => {
    recovering = true
    updatePassword.mockResolvedValue({ data: { user: null }, error: null })
    const user = userEvent.setup()
    renderReset(['/resetar-senha'])
    await fillAndSubmit(user)
    expect(callEdge).not.toHaveBeenCalled()
    expect(updatePassword).toHaveBeenCalledTimes(1)
    expect(updatePassword).toHaveBeenCalledWith('nova-senha-123')
    expect(clearRecovery).toHaveBeenCalledTimes(1)
    expect(await screen.findByRole('note')).toHaveTextContent('Senha atualizada com sucesso.')
  })

  it('shows the expired-link notice when there is no token and no recovery session', () => {
    renderReset(['/resetar-senha'])
    expect(screen.getByRole('note')).toHaveTextContent(
      'Este link de recuperação não está mais válido. Solicite um novo link abaixo.',
    )
    expect(screen.queryByLabelText('Nova senha')).not.toBeInTheDocument()
  })
})