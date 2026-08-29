import type { ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthProvider'
import { appContent } from '@/content/app'
import { appPath, docsPath, homePath, type Locale } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { PeragusLogo } from '@/components/brand/PeragusLogo'

export function AppLayout({ locale, children }: { locale: Locale; children: ReactNode }) {
  const c = appContent[locale].shell
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  async function onSignOut() {
    await signOut()
    navigate(homePath(locale))
  }

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex min-h-11 items-center rounded-(--radius-control) px-3 text-sm transition-colors',
      isActive ? 'border border-line bg-surface font-semibold text-primary' : 'text-secondary hover:text-primary',
    )

  return (
    <div className="min-h-screen bg-midnight text-primary">
      <a
        href="#app-main"
        className="sr-only z-[100] bg-mint px-4 py-3 text-midnight focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        {locale === 'pt' ? 'Pular para o conteúdo' : locale === 'es' ? 'Saltar al contenido' : 'Skip to content'}
      </a>
      <div className="mx-auto flex max-w-7xl flex-col lg:min-h-screen lg:flex-row">
        <aside className="border-b border-hairline p-4 lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r lg:p-6">
          <NavLink to={homePath(locale)} className="inline-flex min-h-11 items-center" aria-label="Peragus — Início">
            <PeragusLogo />
          </NavLink>
          <nav aria-label={c.navOperations} className="mt-6 flex gap-1 overflow-x-auto lg:mt-8 lg:flex-col lg:overflow-visible lg:gap-1.5">
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
          <p className="mt-8 hidden border-t border-hairline pt-4 font-mono text-[11px] uppercase tracking-[.12em] text-tertiary lg:block">
            Testnet · Polygon Amoy
          </p>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex min-h-11 flex-wrap items-center justify-between gap-2 border-b border-hairline px-4 py-3 lg:px-8">
            <p className="flex items-center gap-2 text-xs text-tertiary">
              <span aria-hidden="true" className="h-1 w-1 rounded-full bg-mint/70" />
              {c.userLabel}: <span className="font-mono">{user?.email}</span>
            </p>
            <Button type="button" variant="ghost" size="sm" onClick={onSignOut}>
              {c.signOut}
            </Button>
          </header>
          <main
            id="app-main"
            tabIndex={-1}
            className="flex-1 bg-[repeating-linear-gradient(180deg,transparent_0px,transparent_79px,var(--color-hairline)_79px,var(--color-hairline)_80px)] px-4 py-6 lg:px-8 lg:py-10"
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}