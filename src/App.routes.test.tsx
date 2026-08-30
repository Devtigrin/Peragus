import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import type { Session } from '@supabase/supabase-js'

const { mockSupabase, mockSession } = vi.hoisted(() => {
  const session = {
    access_token: 'test-token',
    refresh_token: 'test-refresh',
    expires_in: 3600,
    expires_at: 9999999999,
    token_type: 'bearer',
    user: {
      id: 'u1',
      aud: 'authenticated',
      role: 'authenticated',
      email: 't@peragus.test',
      email_confirmed_at: '2026-01-01T00:00:00.000Z',
      phone: '',
      confirmed_at: '2026-01-01T00:00:00.000Z',
      last_sign_in_at: '2026-01-01T00:00:00.000Z',
      app_metadata: {},
      user_metadata: {},
      identities: [],
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    },
  } satisfies Session
  const query = () => ({
    select: () => ({
      order: () => ({
        then: (cb: (r: { data: unknown[]; error: null }) => void) =>
          Promise.resolve({ data: [], error: null }).then(cb),
      }),
    }),
  })
  return {
    mockSession: session,
    mockSupabase: {
      auth: {
        getSession: vi.fn(),
        onAuthStateChange: vi.fn(() => ({
          data: { subscription: { unsubscribe: vi.fn() } },
        })),
        signOut: vi.fn(async () => {}),
      },
      from: vi.fn(() => query()),
      rpc: vi.fn(async () => ({ data: null, error: null })),
    },
  }
})

vi.mock('@/lib/supabase', () => ({ supabase: mockSupabase }))

vi.mock('@/lib/functions', () => ({
  callEdge: vi.fn(async () => ({ operations: [] })),
}))

import { supabase } from '@/lib/supabase'
import { AuthProvider } from '@/auth/AuthProvider'
import App from './App'

function renderApp(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>,
  )
}

async function waitAuthReady() {
  await waitFor(() => {
    // Assim que nao houver mais loading, o App decide a rota (login ou painel).
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
}

describe('fluxo autenticado /app', () => {
  it('renderiza o dashboard em /app quando existe sessao', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({ data: { session: mockSession }, error: null })
    renderApp('/app')
    await waitAuthReady()
    expect(await screen.findByRole('heading', { name: 'Operações' })).toBeInTheDocument()
    expect(screen.getByText('Sair')).toBeInTheDocument()
    expect(screen.getByText('t@peragus.test')).toBeInTheDocument()
  })

  it('redireciona para /login quando acessa /app sem sessao', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({ data: { session: null }, error: null })
    renderApp('/app')
    await waitAuthReady()
    expect(await screen.findByRole('heading', { name: 'Entrar no sandbox' })).toBeInTheDocument()
  })

  it('renderiza /app/chaves-api quando existe sessao (regressao de sub-rota)', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({ data: { session: mockSession }, error: null })
    renderApp('/app/chaves-api')
    await waitAuthReady()
    expect(await screen.findByRole('heading', { name: 'Chaves de API' })).toBeInTheDocument()
  })

  it('renderiza /app/configuracoes quando existe sessao (regressao de sub-rota)', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({ data: { session: mockSession }, error: null })
    renderApp('/app/configuracoes')
    await waitAuthReady()
    expect(await screen.findByRole('heading', { name: 'Configurações' })).toBeInTheDocument()
  })
})
