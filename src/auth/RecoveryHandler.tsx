import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthProvider'
import { authPath, localeFromPathname } from '@/i18n/routing'

export function RecoveryHandler() {
  const navigate = useNavigate()
  const { recovering, clearRecovery } = useAuth()

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

  useEffect(() => {
    if (!recovering) return
    const locale = localeFromPathname(window.location.pathname)
    navigate(authPath(locale, 'resetar-senha'), { replace: true })
    clearRecovery()
  }, [recovering, navigate, clearRecovery])

  return null
}