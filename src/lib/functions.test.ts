import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mockGetSession = vi.fn()
const mockFetch = vi.fn<typeof fetch>()

vi.mock('@/lib/supabase', () => ({
  SUPABASE_URL: 'https://test.supabase.co',
  supabase: {
    auth: {
      getSession: () => mockGetSession(),
    },
  },
}))

import { callEdge } from './functions'

describe('callEdge', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon')
    mockGetSession.mockResolvedValue({ data: { session: { access_token: 'tok' } }, error: null })
    vi.stubGlobal('fetch', mockFetch)
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('lanca erro quando um body e enviado sem method explicito (impossivel usar GET/HEAD com body)', async () => {
    await expect(callEdge('create-operation', { body: { amount: '1' } })).rejects.toThrow(
      /body.*GET/i,
    )
  })

  it('lanca erro quando um body e enviado com GET explicito', async () => {
    await expect(
      callEdge('create-operation', { method: 'GET', body: { amount: '1' } }),
    ).rejects.toThrow(/body.*GET/i)
  })

  it('envia POST quando method e fornecido com body', async () => {
    mockFetch.mockResolvedValue(new Response(JSON.stringify({ ok: true })))
    const result = await callEdge('create-operation', {
      method: 'POST',
      body: { amount: '1', receiver_wallet: '0x0123456789abcdef0123456789abcdef01234567' },
    })
    expect(fetch).toHaveBeenCalledWith(
      'https://test.supabase.co/functions/v1/create-operation',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Authorization: 'Bearer tok',
        }),
        body: JSON.stringify({
          amount: '1',
          receiver_wallet: '0x0123456789abcdef0123456789abcdef01234567',
        }),
      }),
    )
    expect(result).toEqual({ ok: true })
  })

  it('nao envia body quando method GET e nao ha body', async () => {
    mockFetch.mockResolvedValue(new Response(JSON.stringify({ ok: true })))
    await callEdge('list-operations')
    expect(fetch).toHaveBeenCalledWith(
      'https://test.supabase.co/functions/v1/list-operations',
      expect.objectContaining({ method: 'GET' }),
    )
  })
})
