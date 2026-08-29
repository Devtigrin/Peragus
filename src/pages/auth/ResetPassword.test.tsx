import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const updatePassword = vi.fn()
const clearRecovery = vi.fn()
let recovering = false
let loading = false
vi.mock('@/auth/AuthProvider', () => ({
  useAuth: () => ({
    recovering,
    loading,
    updatePassword,
    clearRecovery,
    user: null,
  }),
}))

import { ResetPassword } from './ResetPassword'

function renderReset() {
  return render(
    <MemoryRouter initialEntries={['/resetar-senha']}>
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
    updatePassword.mockReset()
    clearRecovery.mockReset()
    recovering = false
    loading = false
  })

  it('updates the password through the GoTrue recovery session and clears the flag', async () => {
    recovering = true
    updatePassword.mockResolvedValue({ data: { user: null }, error: null })
    const user = userEvent.setup()
    renderReset()
    await fillAndSubmit(user)
    expect(updatePassword).toHaveBeenCalledTimes(1)
    expect(updatePassword).toHaveBeenCalledWith('nova-senha-123')
    expect(clearRecovery).toHaveBeenCalledTimes(1)
    expect(await screen.findByRole('note')).toHaveTextContent('Senha atualizada com sucesso.')
  })

  it('shows a generic error when the password update fails', async () => {
    recovering = true
    updatePassword.mockResolvedValue({ data: null, error: new Error('no session') })
    const user = userEvent.setup()
    renderReset()
    await fillAndSubmit(user)
    expect(updatePassword).toHaveBeenCalledTimes(1)
    expect(await screen.findByRole('note')).toHaveTextContent(
      'Não foi possível atualizar a senha. Solicite um novo link.',
    )
  })

  it('shows the expired-link notice when there is no recovery session', () => {
    renderReset()
    expect(screen.getByRole('note')).toHaveTextContent(
      'Este link de recuperação não está mais válido. Solicite um novo link abaixo.',
    )
    expect(screen.queryByLabelText('Nova senha')).not.toBeInTheDocument()
  })

  it('waits for the session to initialize before judging the recovery state', () => {
    loading = true
    renderReset()
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.queryByRole('note')).not.toBeInTheDocument()
  })
})