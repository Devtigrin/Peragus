import { createClient } from '@supabase/supabase-js'
import { afterEach, describe, expect, it, vi } from 'vitest'

const SUPABASE_URL = 'https://abc123.supabase.co'

// A valid JWT-ish payload so _getUser() can return a user.
const FAKE_ACCESS_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
  btoa(JSON.stringify({ sub: 'user-1', iss: SUPABASE_URL, aud: 'authenticated', role: 'authenticated' })) +
  '.signature'

const FAKE_USER = {
  id: 'user-1',
  email: 'someone@example.com',
  role: 'authenticated',
  aud: 'authenticated',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  app_metadata: {},
  user_metadata: {},
  identities: [],
}

function setupFetchMock() {
  const seen: string[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      seen.push(url)
      if (url.includes('/auth/v1/user')) {
        return new Response(JSON.stringify(FAKE_USER), { status: 200, headers: { 'Content-Type': 'application/json' } })
      }
      return new Response('{}', { status: 404 })
    }),
  )
  return { seen }
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('supabase-js recovery redirect detection', () => {
  it('emits PASSWORD_RECOVERY for a valid recovery hash', async () => {
    setupFetchMock()
    const events: string[] = []
    const storageKey = `sb-${SUPABASE_URL.replace(/[^a-zA-Z0-9]/g, '')}-auth-token`
    window.localStorage.removeItem(storageKey)

    window.history.replaceState(
      null,
      '',
      `/resetar-senha#access_token=${FAKE_ACCESS_TOKEN}&expires_in=3600&refresh_token=refreshtoken&token_type=bearer&type=recovery`,
    )

    const supabase = createClient(SUPABASE_URL, 'anon-key')
    supabase.auth.onAuthStateChange((event) => {
      events.push(event)
    })

    // Wait for the delayed PASSWORD_RECOVERY notification (setTimeout 0 after init).
    await new Promise((resolve) => setTimeout(resolve, 300))

    expect(events).toContain('PASSWORD_RECOVERY')
  })

  it('does NOT emit PASSWORD_RECOVERY when the recovery hash has an error', async () => {
    setupFetchMock()
    const events: string[] = []
    const storageKey = `sb-${SUPABASE_URL.replace(/[^a-zA-Z0-9]/g, '')}-auth-token`
    window.localStorage.removeItem(storageKey)

    window.history.replaceState(
      null,
      '',
      `/resetar-senha#error=access_denied&error_code=otp_expired&error_description=link%20expirado`,
    )

    const supabase = createClient(SUPABASE_URL, 'anon-key')
    supabase.auth.onAuthStateChange((event) => {
      events.push(event)
    })

    await new Promise((resolve) => setTimeout(resolve, 300))

    expect(events).not.toContain('PASSWORD_RECOVERY')
  })
})