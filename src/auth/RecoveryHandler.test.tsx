import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

let recovering = false
const clearRecovery = vi.fn(() => {
  recovering = false
})
vi.mock('@/auth/AuthProvider', () => ({
  useAuth: () => ({ recovering, clearRecovery, session: null, user: null, loading: false }),
}))

import { RecoveryHandler } from './RecoveryHandler'

function renderWithHash(hash: string) {
  window.location.hash = hash
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<p>home</p>} />
        <Route path="/resetar-senha" element={<p>reset-page</p>} />
      </Routes>
      <RecoveryHandler />
    </MemoryRouter>,
  )
}

describe('RecoveryHandler', () => {
  beforeEach(() => {
    recovering = false
    clearRecovery.mockReset()
  })

  it('sends an expired recovery link to the reset page', async () => {
    renderWithHash('#error=access_denied&error_code=otp_expired&error_description=x')
    expect(await screen.findByText('reset-page')).toBeInTheDocument()
  })

  it('opens the reset page when a recovery session arrives', async () => {
    recovering = true
    renderWithHash('')
    expect(await screen.findByText('reset-page')).toBeInTheDocument()
    expect(clearRecovery).toHaveBeenCalledTimes(1)
  })

  it('stays put when there is no recovery payload', () => {
    renderWithHash('')
    expect(screen.getByText('home')).toBeInTheDocument()
  })
})