import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthProvider'
import { authPath, localeFromPathname } from '@/i18n/routing'

export function RecoveryHandler() {
  const navigate = useNavigate()
  const { recovering } = useAuth()

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