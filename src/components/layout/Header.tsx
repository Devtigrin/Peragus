import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, Wallet, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/store/useAuth'
import { PeragusLogo } from '@/components/brand/PeragusLogo'

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuth()
  const location = useLocation()
  const isLanding = location.pathname === '/'
  const isPublicPage = ['/', '/terms', '/privacy', '/compliance', '/security-info'].includes(location.pathname)
  const sectionHref = (id: string) => isLanding ? `#${id}` : `/#${id}`

  if (!isPublicPage) return null

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-surface/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <PeragusLogo />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <a href={sectionHref('learn-more')} className="text-sm text-text-secondary hover:text-text-primary transition-colors follow-through-fast">
              Saiba mais
            </a>
            <a href={sectionHref('benefits')} className="text-sm text-text-secondary hover:text-text-primary transition-colors follow-through-fast">
              Benefícios
            </a>
            <a href={sectionHref('faq')} className="text-sm text-text-secondary hover:text-text-primary transition-colors follow-through-fast">
              Dúvidas
            </a>
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link to="/new-liquidation">
                  <Button size="sm">
                    <Wallet className="h-4 w-4" />
                    Conectar carteira
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm">
                    Dashboard
                  </Button>
                </Link>
                <div className="flex items-center gap-2 text-sm text-text-tertiary">
                  <span>{user?.email}</span>
                  <Button variant="ghost" size="sm" onClick={logout}>
                    Sair
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/new-liquidation">
                  <Button size="sm">
                    <Wallet className="h-4 w-4" />
                    Conectar carteira
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Entrar
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">
                    Criar conta
                  </Button>
                </Link>
              </div>
            )}
          </nav>

          <button
            className="md:hidden p-2 text-text-primary"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-surface-elevated animate-slide-down">
          <div className="space-y-1 px-4 py-4">
            <a href={sectionHref('learn-more')} className="block py-2 text-sm text-text-secondary" onClick={() => setMobileOpen(false)}>
              Saiba mais
            </a>
            <a href={sectionHref('benefits')} className="block py-2 text-sm text-text-secondary" onClick={() => setMobileOpen(false)}>
              Benefícios
            </a>
            <a href={sectionHref('faq')} className="block py-2 text-sm text-text-secondary" onClick={() => setMobileOpen(false)}>
              Dúvidas
            </a>
            <div className="pt-4 space-y-2">
              {isAuthenticated ? (
                <>
                  <Link to="/new-liquidation" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full">
                      <Wallet className="h-4 w-4" />
                      Conectar carteira
                    </Button>
                  </Link>
                  <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full">Dashboard</Button>
                  </Link>
                  <Button variant="ghost" className="w-full" onClick={() => { logout(); setMobileOpen(false); }}>
                    Sair
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/new-liquidation" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full">
                      <Wallet className="h-4 w-4" />
                      Conectar carteira
                    </Button>
                  </Link>
                  <Link to="/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full">Entrar</Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full">Criar conta</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
