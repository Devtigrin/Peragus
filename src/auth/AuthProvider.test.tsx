import { act, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { AuthProvider, useAuth } from './AuthProvider'

const { mockSupabase } = vi.hoisted(() => {
  const auth = {
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    updateUser: vi.fn(),
    signOut: vi.fn(),
  }
  return { mockSupabase: { auth } }
})

vi.mock('@/lib/supabase', () => ({ supabase: mockSupabase }))

function Probe() {
  const { loading, user, recovering, clearRecovery } = useAuth()
  if (loading) return <p>loading</p>
  return (
    <>
      <p>{user ? user.email : 'anonymous'}</p>
      <p>{recovering ? 'recovering' : 'idle'}</p>
      <button type="button" onClick={clearRecovery}>
        clear
      </button>
    </>
  )
}

function setup(getSessionResult: { session: null }) {
  mockSupabase.auth.getSession.mockResolvedValue({ data: getSessionResult, error: null })
  mockSupabase.auth.onAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: vi.fn() } },
  })
}

function renderProvider() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <AuthProvider>
        <Probe />
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('AuthProvider', () => {
  it('starts anonymous when no session exists', async () => {
    setup({ session: null })
    renderProvider()
    await waitFor(() => expect(screen.queryByText('loading')).not.toBeInTheDocument())
    expect(screen.getByText('anonymous')).toBeInTheDocument()
  })

  it('flags a password-recovery event so the reset page can run', async () => {
    setup({ session: null })
    renderProvider()
    await waitFor(() => expect(screen.getByText('idle')).toBeInTheDocument())

    const calls = mockSupabase.auth.onAuthStateChange.mock.calls
    const [listener] = calls[calls.length - 1]
    act(() => listener('PASSWORD_RECOVERY', null))

    expect(await screen.findByText('recovering')).toBeInTheDocument()
  })

  it('clearRecovery resets the recovery flag', async () => {
    setup({ session: null })
    renderProvider()
    await waitFor(() => expect(screen.getByText('idle')).toBeInTheDocument())

    const calls = mockSupabase.auth.onAuthStateChange.mock.calls
    const [listener] = calls[calls.length - 1]
    act(() => listener('PASSWORD_RECOVERY', null))
    await screen.findByText('recovering')

    await act(async () => {
      await screen.getByRole('button', { name: 'clear' }).click()
    })
    expect(screen.getByText('idle')).toBeInTheDocument()
  })
})