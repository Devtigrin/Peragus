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

  it('renderiza /app/docs autenticado dentro do AppLayout (sidebar + conta preservadas)', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({ data: { session: mockSession }, error: null })
    renderApp('/app/docs')
    await waitAuthReady()
    // AppLayout preservado
    expect(screen.getByText('Sair')).toBeInTheDocument()
    expect(screen.getByText('t@peragus.test')).toBeInTheDocument()
    // DocsContent renderiza dentro do app
    expect(await screen.findByText('API Reference')).toBeInTheDocument()
    // sidebar link Docs existe e aponta para /app/docs
    const docsLink = screen.getByRole('link', { name: 'Docs' })
    expect(docsLink.getAttribute('href')).toBe('/app/docs')
  })

  it('protege /app/docs: sem sessao redireciona para login', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({ data: { session: null }, error: null })
    renderApp('/app/docs')
    await waitAuthReady()
    expect(await screen.findByRole('heading', { name: 'Entrar no sandbox' })).toBeInTheDocument()
  })

  it('/docs publico abre sem exigir login e sem destruir sessao (session continua em /app)', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({ data: { session: mockSession }, error: null })
    const { unmount } = renderApp('/docs')
    await waitFor(() => expect(screen.getByText('API Reference')).toBeInTheDocument())
    expect(screen.queryByText('Sair')).not.toBeInTheDocument()
    // getSession nunca foi chamada com signOut; sessao continua
    expect(supabase.auth.signOut).not.toHaveBeenCalled()
    unmount()
    // navegando depois para /app continua autenticado
    vi.mocked(supabase.auth.getSession).mockResolvedValue({ data: { session: mockSession }, error: null })
    renderApp('/app')
    await waitAuthReady()
    expect(await screen.findByRole('heading', { name: 'Operações' })).toBeInTheDocument()
  })

  it('AppLayout nao usa repeating-linear-gradient (regressao visual)', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({ data: { session: mockSession }, error: null })
    renderApp('/app')
    await waitAuthReady()
    const main = document.getElementById('app-main')
    expect(main).not.toBeNull()
    expect(main!.className).not.toContain('repeating-linear-gradient')
  })
})
