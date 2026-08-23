import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const signIn = vi.fn()
vi.mock('@/auth/AuthProvider', () => ({
  useAuth: () => ({ signIn, loading: false, user: null }),
}))

import { Login } from './Login'

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Login locale="pt" />
    </MemoryRouter>,
  )
}

describe('Login', () => {
  beforeEach(() => signIn.mockReset())

  it('renders pt labels', () => {
    renderLogin()
    expect(screen.getByRole('heading', { name: 'Entrar no sandbox' })).toBeInTheDocument()
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument()
    expect(screen.getByLabelText('Senha')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeEnabled()
  })

  it('submits typed credentials once', async () => {
    signIn.mockResolvedValue({ data: { session: null }, error: null })
    const user = userEvent.setup()
    renderLogin()
    await user.type(screen.getByLabelText('E-mail'), 'a@b.dev')
    await user.type(screen.getByLabelText('Senha'), 'secret123')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(signIn).toHaveBeenCalledTimes(1)
    expect(signIn).toHaveBeenCalledWith('a@b.dev', 'secret123')
  })

  it('shows the error notice when sign in fails', async () => {
    signIn.mockResolvedValue({ data: {}, error: new Error('bad') })
    const user = userEvent.setup()
    renderLogin()
    await user.type(screen.getByLabelText('E-mail'), 'a@b.dev')
    await user.type(screen.getByLabelText('Senha'), 'secret123')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(await screen.findByRole('note')).toHaveTextContent(
      'Não foi possível entrar. Verifique o e-mail e a senha.',
    )
  })
})
