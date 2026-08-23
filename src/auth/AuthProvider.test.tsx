import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AuthProvider, useAuth } from './AuthProvider'

function Probe() {
  const { loading, user } = useAuth()
  if (loading) return <p>loading</p>
  return <p>{user ? user.email : 'anonymous'}</p>
}

describe('AuthProvider', () => {
  it('starts anonymous when no session exists', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AuthProvider>
          <Probe />
        </AuthProvider>
      </MemoryRouter>,
    )
    await waitFor(() => expect(screen.queryByText('loading')).not.toBeInTheDocument())
    expect(screen.getByText('anonymous')).toBeInTheDocument()
  })
})
