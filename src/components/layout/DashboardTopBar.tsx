import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Bell, LogOut, User, X, Circle, Menu, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/store/useAuth'
import { dashboardLinks } from '@/constants/navigation'
import { cn } from '@/lib/utils'

interface Notification {
  id: string
  title: string
  description: string
  time: string
  read: boolean
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'Cotação atualizada',
    description: 'A cotação USDT foi atualizada para R$ 5,92.',
    time: '2 min atrás',
    read: false,
  },
  {
    id: '2',
    title: 'Operação aguardando pagamento',
    description: 'A operação SP-0A2F-B8K1 aguarda pagamento via Pix.',
    time: '15 min atrás',
    read: false,
  },
  {
    id: '3',
    title: 'Carteira conectada com sucesso',
    description: 'Sua carteira foi conectada à Peragus.',
    time: '1 hora atrás',
    read: true,
  },
  {
    id: '4',
    title: 'Nova política de segurança disponível',
    description: 'Revise as recomendações de segurança atualizadas.',
    time: '1 dia atrás',
    read: true,
  },
]

export function DashboardTopBar() {
  const location = useLocation()
  const isLanding = location.pathname === '/'
  const { user, logout } = useAuth()
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)
  const [isOpen, setIsOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter((n) => !n.read).length

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  if (isLanding) return null

  return (
    <div className="fixed top-0 right-0 left-0 z-30 h-16 border-b border-border bg-surface-secondary lg:left-64">
      <div className="flex h-full items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label={mobileMenuOpen ? 'Fechar navegação' : 'Abrir navegação'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-4 w-4 text-text-secondary" /> : <Menu className="h-4 w-4 text-text-secondary" />}
          </Button>
          <h2 className="text-sm font-medium text-text-tertiary">
            Bem-vindo, {user?.name || user?.email?.split('@')[0] || 'Usuário'}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/new-liquidation" className="hidden md:block">
            <Button size="sm">
              <Wallet className="h-4 w-4" />
              Conectar carteira
            </Button>
          </Link>
          <div className="relative" ref={dropdownRef}>
            <Button
              variant="ghost"
              size="icon"
              className="relative press-effect"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Abrir notificações"
              aria-expanded={isOpen}
            >
              <Bell className="h-4 w-4 text-text-secondary" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-scale-in">
                  {unreadCount}
                </span>
              )}
            </Button>

            {isOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-border bg-surface-card shadow-xl animate-scale-in origin-top-right">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <h3 className="text-sm font-semibold text-text-primary">Notificações</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-green-accent hover:text-green-accent-hover font-medium transition-colors"
                    >
                      Marcar todas como lidas
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-text-tertiary">
                      Nenhuma notificação
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={cn(
                          'flex items-start gap-3 px-4 py-3 border-b border-border/50 transition-colors duration-150 cursor-pointer',
                          n.read ? 'hover:bg-surface-hover' : 'bg-green-subtle/30 hover:bg-green-subtle/50'
                        )}
                        onClick={() => markAsRead(n.id)}
                      >
                        <div className="mt-1 shrink-0">
                          {n.read ? (
                            <Circle className="h-2 w-2 text-text-disabled" />
                          ) : (
                            <Circle className="h-2 w-2 text-green-accent fill-green-accent" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn('text-sm', n.read ? 'text-text-secondary' : 'text-text-primary font-medium')}>
                            {n.title}
                          </p>
                          <p className="text-xs text-text-tertiary mt-0.5 line-clamp-2">
                            {n.description}
                          </p>
                          <p className="text-[11px] text-text-disabled mt-1">{n.time}</p>
                        </div>
                        <button
                          className="shrink-0 p-0.5 rounded hover:bg-surface-hover transition-colors opacity-0 group-hover:opacity-100"
                          aria-label="Marcar notificação como lida"
                          onClick={(e) => {
                            e.stopPropagation()
                            markAsRead(n.id)
                          }}
                        >
                          <X className="h-3 w-3 text-text-disabled" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-2 text-sm text-text-tertiary">
            <User className="h-4 w-4" />
            <span>{user?.email}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={logout} aria-label="Sair da conta">
            <LogOut className="h-4 w-4 text-text-secondary" />
          </Button>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-surface-secondary shadow-xl animate-slide-down">
          <nav className="grid gap-1 px-3 py-3">
            {dashboardLinks.map((link) => {
              const Icon = link.icon
              const isActive = link.to === '/dashboard'
                ? location.pathname === '/dashboard'
                : location.pathname.startsWith(link.to)
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-navy-subtle text-green-accent border border-green-border/30'
                      : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              )
            })}
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-2 rounded-lg border border-border px-3 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-hover hover:text-text-primary"
            >
              Voltar ao site
            </Link>
            <Link
              to="/new-liquidation"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg border border-border px-3 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-hover hover:text-text-primary"
            >
              Conectar carteira
            </Link>
          </nav>
        </div>
      )}
    </div>
  )
}
