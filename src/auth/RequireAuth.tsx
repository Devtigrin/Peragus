import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/auth/AuthProvider'
import { authPath, localeFromPathname } from '@/i18n/routing'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()
  const location = useLocation()
  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center text-sm text-secondary" role="status">
        …
      </div>
    )
  }
  if (!session) {
    const locale = localeFromPathname(location.pathname)
    return <Navigate to={authPath(locale, 'login')} replace state={{ from: location.pathname }} />
  }
  return <>{children}</>
}
