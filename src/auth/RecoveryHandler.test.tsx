import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

let recovering = false
vi.mock('@/auth/AuthProvider', () => ({
  useAuth: () => ({ recovering, session: null, user: null, loading: false }),
}))

import { RecoveryHandler } from './RecoveryHandler'

function renderWithPath(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
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
    window.location.hash = ''
  })

  it('sends an expired recovery link to the reset page', async () => {
    window.location.hash = '#error=access_denied&error_code=otp_expired&error_description=x'
    renderWithPath('/')
    expect(await screen.findByText('reset-page')).toBeInTheDocument()
  })

  it('opens the reset page when a recovery session arrives without clearing the flag', async () => {
    recovering = true
    renderWithPath('/')
    expect(await screen.findByText('reset-page')).toBeInTheDocument()
  })

  it('stays on the reset page when the recovery session arrives on it', async () => {
    recovering = true
    renderWithPath('/resetar-senha')
    expect(screen.getByText('reset-page')).toBeInTheDocument()
  })

  it('stays put when there is no recovery payload', () => {
    renderWithPath('/')
    expect(screen.getByText('home')).toBeInTheDocument()
  })
})