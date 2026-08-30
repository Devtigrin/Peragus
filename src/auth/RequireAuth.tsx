import { useEffect, useState, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/auth/AuthProvider'
import { authPath, localeFromPathname } from '@/i18n/routing'

const LOADING_TIMEOUT_MS = 15_000

/**
 * Protege rotas autenticadas. Enquanto a sessão e restaurada, exibe um loading
 * explicito; se a restauracao falhar ou travar alem do timeout, nunca deixa o
 * usuario em uma tela vazia (redireciona para o login).
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()
  const location = useLocation()
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    if (!loading) return
    const id = window.setTimeout(() => setTimedOut(true), LOADING_TIMEOUT_MS)
    return () => window.clearTimeout(id)
  }, [loading])

  if (loading && !timedOut) {
    return (
      <div
        className="grid min-h-screen place-items-center bg-midnight text-primary"
        role="status"
        aria-live="polite"
      >
        <div className="flex flex-col items-center gap-3">
          <span aria-hidden="true" className="h-2 w-2 animate-pulse rounded-full bg-mint" />
          <span className="text-sm text-secondary">Carregando…</span>
        </div>
      </div>
    )
  }

  const locale = localeFromPathname(location.pathname)
  if (loading && timedOut) {
    return (
      <div className="grid min-h-screen place-items-center bg-midnight p-6 text-primary" role="alert">
        <div className="flex max-w-md flex-col items-center gap-3 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[.14em] text-error">Erro</p>
          <p className="text-sm leading-6 text-secondary">
            Não foi possível restaurar sua sessão. Tente fazer o login novamente.
          </p>
          <a
            href={authPath(locale, 'login')}
            className="mt-2 inline-flex min-h-11 items-center rounded-(--radius-control) bg-mint px-5 font-semibold text-midnight hover:opacity-90"
          >
            Fazer login
          </a>
        </div>
      </div>
    )
  }

  if (!session) {
    return <Navigate to={authPath(locale, 'login')} replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}
