import type { ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthProvider'
import { appContent } from '@/content/app'
import { appPath, docsPath, homePath, type Locale } from '@/i18n/routing'

export function AppLayout({ locale, children }: { locale: Locale; children: ReactNode }) {
  const c = appContent[locale].shell
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  async function onSignOut() {
    await signOut()
    navigate(homePath(locale))
  }

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `flex min-h-11 items-center rounded-lg px-3 text-sm ${
      isActive ? 'bg-surface font-semibold text-primary' : 'text-secondary hover:text-primary'
    }`

  return (
    <div className="min-h-screen bg-midnight text-primary">
      <a
        href="#app-main"
        className="sr-only z-[100] bg-mint px-4 py-3 text-midnight focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        {locale === 'pt' ? 'Pular para o conteúdo' : locale === 'es' ? 'Saltar al contenido' : 'Skip to content'}
      </a>
      <div className="mx-auto flex max-w-7xl flex-col lg:min-h-screen lg:flex-row">
        <aside className="border-b border-line p-4 lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r lg:p-6">
          <NavLink to={homePath(locale)} className="font-mono text-sm font-bold tracking-[.18em] text-mint">
            PERAGUS
          </NavLink>
          <nav aria-label={c.navOperations} className="mt-6 flex gap-1 overflow-x-auto lg:mt-8 lg:flex-col lg:overflow-visible">
            <NavLink to={appPath(locale)} end className={linkCls}>
              {c.navOperations}
            </NavLink>
            <NavLink to={appPath(locale, 'chaves-api')} className={linkCls}>
              {c.navApiKeys}
            </NavLink>
            <NavLink to={docsPath(locale)} className={linkCls}>
              Docs
            </NavLink>
            <NavLink to={appPath(locale, 'configuracoes')} className={linkCls}>
              {c.navSettings}
            </NavLink>
          </nav>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex min-h-11 flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3 lg:px-8">
            <p className="text-xs text-tertiary">
              {c.userLabel}: <span className="font-mono">{user?.email}</span>
            </p>
            <button
              type="button"
              onClick={onSignOut}
              className="min-h-11 rounded-lg border border-line bg-surface px-3 text-sm hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint"
            >
              {c.signOut}
            </button>
          </header>
          <main id="app-main" tabIndex={-1} className="px-4 py-6 lg:px-8 lg:py-10">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
