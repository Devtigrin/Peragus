import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { describeRecoveryUrl, logRecoveryDiagnostics, type RecoveryUrlInfo } from './recovery-url'

let recovering = false
const { verifyRecoveryOtp } = vi.hoisted(() => ({ verifyRecoveryOtp: vi.fn() }))
vi.mock('@/auth/AuthProvider', () => ({
  useAuth: () => ({
    recovering,
    session: null,
    user: null,
    loading: false,
    verifyRecoveryOtp,
  }),
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

describe('describeRecoveryUrl', () => {
  const base = 'http://localhost/resetar-senha'

  it('reports an expired-link hash as an error payload', () => {
    const info = describeRecoveryUrl(`${base}#error=access_denied&error_code=otp_expired`)
    expect(info.hashError).not.toBeNull()
    expect(info.isRecoveryPayload).toBe(true)
  })

  it('reports an implicit recovery hash without exposing the token', () => {
    const info = describeRecoveryUrl(`${base}#access_token=secret&type=recovery`)
    expect(info.hashAccessToken).toBe(true)
    expect(info.isRecoveryPayload).toBe(true)
  })

  it('reports a token_hash fallback from search params', () => {
    const info = describeRecoveryUrl(`${base}?token_hash=abc&type=recovery`)
    expect(info.tokenHash).toBe('abc')
    expect(info.type).toBe('recovery')
    expect(info.isRecoveryPayload).toBe(true)
  })

  it('ignores a URL without any recovery payload', () => {
    expect(describeRecoveryUrl(base).isRecoveryPayload).toBe(false)
  })
})

describe('logRecoveryDiagnostics', () => {
  it('describes payload presence without leaking tokens', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const info: RecoveryUrlInfo = describeRecoveryUrl(
      'http://localhost/resetar-senha#access_token=secret&type=recovery',
    )
    const line = logRecoveryDiagnostics(info)
    expect(line).toContain('hashAccessToken=true')
    expect(line).not.toContain('secret')
    expect(warn).toHaveBeenCalledWith(line)
    warn.mockRestore()
  })
})

describe('RecoveryHandler', () => {
  beforeEach(() => {
    recovering = false
    verifyRecoveryOtp.mockReset()
    verifyRecoveryOtp.mockResolvedValue({ data: { session: null, user: null }, error: null })
    window.location.hash = ''
    window.history.replaceState(null, '', '/')
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('sends an expired recovery link to the reset page', async () => {
    window.location.hash = '#error=access_denied&error_code=otp_expired&error_description=x'
    renderWithPath('/')
    expect(await screen.findByText('reset-page')).toBeInTheDocument()
    expect(verifyRecoveryOtp).not.toHaveBeenCalled()
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
    expect(verifyRecoveryOtp).not.toHaveBeenCalled()
  })

  it('verifies a token_hash recovery callback and cleans the URL', async () => {
    window.history.replaceState(null, '', '/resetar-senha?token_hash=abc&type=recovery')
    renderWithPath('/resetar-senha')
    await screen.findByText('reset-page')
    expect(verifyRecoveryOtp).toHaveBeenCalledWith('abc')
    await vi.waitFor(() => expect(window.location.search).toBe(''))
  })

  it('does not verify a token_hash when the hash already carries an error', async () => {
    window.history.replaceState(
      null,
      '',
      '/resetar-senha?token_hash=abc&type=recovery#error=access_denied&error_code=otp_expired',
    )
    renderWithPath('/resetar-senha')
    await screen.findByText('reset-page')
    expect(verifyRecoveryOtp).not.toHaveBeenCalled()
  })

  it('does not retry a token_hash that failed to verify', async () => {
    verifyRecoveryOtp.mockResolvedValue({ data: { session: null, user: null }, error: new Error('x') })
    window.history.replaceState(null, '', '/resetar-senha?token_hash=abc&type=recovery')
    const { rerender } = renderWithPath('/resetar-senha')
    await vi.waitFor(() => expect(verifyRecoveryOtp).toHaveBeenCalledTimes(1))
    rerender(<MemoryRouter initialEntries={['/resetar-senha?token_hash=abc&type=recovery']} />)
    expect(verifyRecoveryOtp).toHaveBeenCalledTimes(1)
  })
})