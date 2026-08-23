import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Settings } from './Settings'

const updatePassword = vi.fn()
const signOut = vi.fn()

vi.mock('@/auth/AuthProvider', () => ({
  useAuth: () => ({
    user: { email: 't@peragus.test' },
    updatePassword: (...args: unknown[]) => updatePassword(...args),
    signOut: (...args: unknown[]) => signOut(...args),
  }),
}))

function renderPage() {
  return render(
    <MemoryRouter>
      <Settings locale="pt" />
    </MemoryRouter>,
  )
}

describe('Settings page', () => {
  it('shows account email', () => {
    renderPage()
    expect(screen.getByDisplayValue('t@peragus.test')).toBeInTheDocument()
  })

  it('rejects mismatched passwords without calling API', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.type(screen.getByLabelText('Nova senha'), 'longenough1')
    await user.type(screen.getByLabelText('Confirmar nova senha'), 'different999')
    await user.click(screen.getByRole('button', { name: 'Salvar nova senha' }))
    expect(await screen.findByText(/não coincidem/i)).toBeInTheDocument()
    expect(updatePassword).not.toHaveBeenCalled()
  })

  it('saves a valid password and shows success notice', async () => {
    updatePassword.mockResolvedValueOnce({ data: {}, error: null })
    const user = userEvent.setup()
    renderPage()
    await user.type(screen.getByLabelText('Nova senha'), 'validpass123')
    await user.type(screen.getByLabelText('Confirmar nova senha'), 'validpass123')
    await user.click(screen.getByRole('button', { name: 'Salvar nova senha' }))
    expect(await screen.findByText('Senha atualizada com sucesso.')).toBeInTheDocument()
    expect(updatePassword).toHaveBeenCalledWith('validpass123')
  })
})
