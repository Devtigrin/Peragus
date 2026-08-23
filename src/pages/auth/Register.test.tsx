import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const signUp = vi.fn()
vi.mock('@/auth/AuthProvider', () => ({
  useAuth: () => ({ signUp, loading: false, user: null }),
}))

import { Register } from './Register'

function renderRegister() {
  return render(
    <MemoryRouter initialEntries={['/register']}>
      <Register locale="pt" />
    </MemoryRouter>,
  )
}

describe('Register', () => {
  beforeEach(() => signUp.mockReset())

  it('renders pt labels and password hint', () => {
    renderRegister()
    expect(screen.getByRole('heading', { name: 'Criar conta no sandbox' })).toBeInTheDocument()
    expect(screen.getByLabelText('Senha')).toHaveAccessibleDescription('Mínimo de 8 caracteres.')
  })

  it('blocks short passwords client-side without network call', async () => {
    const user = userEvent.setup()
    renderRegister()
    await user.type(screen.getByLabelText('E-mail'), 'a@b.dev')
    await user.type(screen.getByLabelText('Senha'), 'curta1!')
    // minLength blocks submission; force via requestSubmit bypass not needed —
    // assert no signup happened after clicking.
    await user.click(screen.getByRole('button', { name: 'Criar conta' }))
    expect(signUp).not.toHaveBeenCalled()
  })

  it('shows verification notice when signup returns without session', async () => {
    signUp.mockResolvedValue({ data: { session: null }, error: null })
    const user = userEvent.setup()
    renderRegister()
    await user.type(screen.getByLabelText('E-mail'), 'a@b.dev')
    await user.type(screen.getByLabelText('Senha'), 'segura123')
    await user.click(screen.getByRole('button', { name: 'Criar conta' }))
    expect(signUp).toHaveBeenCalledWith('a@b.dev', 'segura123')
    expect(await screen.findByRole('note')).toHaveTextContent('Conta criada! Enviamos um link')
  })
})
