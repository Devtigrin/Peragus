import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const callEdge = vi.fn()
vi.mock('@/lib/functions', () => ({
  callEdge: (...args: unknown[]) => callEdge(...args),
}))

import { ForgotPassword } from './ForgotPassword'

describe('ForgotPassword', () => {
  beforeEach(() => callEdge.mockReset())

  it('sends the recovery link once and shows the neutral notice', async () => {
    callEdge.mockResolvedValue({ ok: true })
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/recuperar-senha']}>
        <ForgotPassword locale="pt" />
      </MemoryRouter>,
    )
    await user.type(screen.getByLabelText('E-mail'), 'a@b.dev')
    await user.click(screen.getByRole('button', { name: 'Enviar link de recuperação' }))
    expect(callEdge).toHaveBeenCalledTimes(1)
    expect(callEdge).toHaveBeenCalledWith('reset-password', {
      method: 'POST',
      body: { email: 'a@b.dev' },
      public: true,
    })
    expect(await screen.findByRole('note')).toHaveTextContent(
      'Se este e-mail estiver cadastrado',
    )
  })
})
