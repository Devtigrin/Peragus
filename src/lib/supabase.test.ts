import { describe, expect, it } from 'vitest'

describe('supabase client', () => {
  it('exposes url and client', async () => {
    const mod = await import('./supabase')
    expect(mod.SUPABASE_URL).toMatch(/^https:\/\/[a-z0-9]+\.supabase\.co$/)
    expect(mod.supabase).toBeTruthy()
    expect(typeof mod.supabase.auth.onAuthStateChange).toBe('function')
  })
})
