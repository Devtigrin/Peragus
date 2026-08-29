import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const sendReset = vi.fn()
vi.mock('@/auth/AuthProvider', () => ({
  useAuth: () => ({ sendReset, recovering: false, loading: false, user: null }),
}))

import { ForgotPassword } from './ForgotPassword'

describe('ForgotPassword', () => {
  beforeEach(() => sendReset.mockReset())

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('requests a recovery link through Supabase with a locale-aware redirect', async () => {
    sendReset.mockResolvedValue({ data: {}, error: null })
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/recuperar-senha']}>
        <ForgotPassword locale="pt" />
      </MemoryRouter>,
    )
    await user.type(screen.getByLabelText('E-mail'), 'a@b.dev')
    await user.click(screen.getByRole('button', { name: 'Enviar link de recuperação' }))
    expect(sendReset).toHaveBeenCalledTimes(1)
    expect(sendReset).toHaveBeenCalledWith('a@b.dev', {
      redirectTo: `${window.location.origin}/resetar-senha`,
    })
    expect(await screen.findByRole('note')).toHaveTextContent(
      'Se este e-mail estiver cadastrado',
    )
  })

  it('always shows the neutral notice even when the request fails', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    sendReset.mockResolvedValue({ data: null, error: new Error('network down') })
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/recuperar-senha']}>
        <ForgotPassword locale="pt" />
      </MemoryRouter>,
    )
    await user.type(screen.getByLabelText('E-mail'), 'a@b.dev')
    await user.click(screen.getByRole('button', { name: 'Enviar link de recuperação' }))
    expect(sendReset).toHaveBeenCalledTimes(1)
    expect(await screen.findByRole('note')).toHaveTextContent(
      'Se este e-mail estiver cadastrado',
    )
    expect(errorSpy).toHaveBeenCalled()
  })
})