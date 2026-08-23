import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const sendReset = vi.fn()
vi.mock('@/auth/AuthProvider', () => ({
  useAuth: () => ({ sendReset, loading: false, session: null, user: null }),
}))

import { ForgotPassword } from './ForgotPassword'

describe('ForgotPassword', () => {
  beforeEach(() => sendReset.mockReset())

  it('sends the recovery link once and shows the neutral notice', async () => {
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
    expect(sendReset).toHaveBeenCalledWith('a@b.dev', expect.anything())
    expect(await screen.findByRole('note')).toHaveTextContent(
      'Se este e-mail estiver cadastrado',
    )
  })
})
