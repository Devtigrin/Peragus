import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthProvider'
import { authPath, localeFromPathname } from '@/i18n/routing'
import { describeRecoveryUrl, logRecoveryDiagnostics } from '@/auth/recovery-url'

export function RecoveryHandler() {
  const navigate = useNavigate()
  const { recovering, verifyRecoveryOtp } = useAuth()
  const attempted = useRef<string | null>(null)

  useEffect(() => {
    const info = describeRecoveryUrl(window.location.href)
    if (info.isRecoveryPayload) logRecoveryDiagnostics(info)
  }, [])

  useEffect(() => {
    const hash = window.location.hash
    if (!hash) return
    const params = new URLSearchParams(hash.replace(/^#/, ''))
    const hasError =
      params.get('error') ?? params.get('error_code') ?? params.get('error_description')
    if (hasError) {
      const locale = localeFromPathname(window.location.pathname)
      navigate(authPath(locale, 'resetar-senha'), { replace: true })
    }
  }, [navigate])

  // Cover the GoTrue fallback callback (?token_hash=...&type=recovery), which the
  // supabase client does not detect automatically. Completing it emits
  // PASSWORD_RECOVERY so the auth hook flips the recovery flag normally.
  useEffect(() => {
    const info = describeRecoveryUrl(window.location.href)
    if (info.hashError) return
    if (info.tokenHash === null || info.type !== 'recovery') return
    if (attempted.current === info.tokenHash) return
    attempted.current = info.tokenHash
    verifyRecoveryOtp(info.tokenHash).then(({ error }) => {
      if (error) return
      const url = new URL(window.location.href)
      url.searchParams.delete('token_hash')
      url.searchParams.delete('type')
      window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash)
    })
  }, [verifyRecoveryOtp])

  // Keep the recovery flag: the reset page reads it to render the form.
  // Only orient the user to the reset page; the form clears it after success.
  useEffect(() => {
    if (!recovering) return
    const locale = localeFromPathname(window.location.pathname)
    const resetPath = authPath(locale, 'resetar-senha')
    if (window.location.pathname === resetPath) return
    navigate(resetPath, { replace: true })
  }, [recovering, navigate])

  return null
}