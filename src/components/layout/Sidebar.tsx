import { Link, useLocation } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { dashboardLinks } from '@/constants/navigation'
import { cn } from '@/lib/utils'
import { PeragusLogo } from '@/components/brand/PeragusLogo'

export function Sidebar() {
  const location = useLocation()
  const isLanding = location.pathname === '/'

  if (isLanding) return null

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-border bg-surface-secondary lg:block">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <Link to="/dashboard" className="flex items-center gap-2">
            <PeragusLogo textClassName="text-lg" />
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {dashboardLinks.map((link) => {
            const Icon = link.icon
            const isActive = link.to === '/dashboard'
              ? location.pathname === '/dashboard'
              : location.pathname.startsWith(link.to)
            return (
              <Link
                key={link.to}
                to={link.to}
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
        </nav>

        <div className="border-t border-border p-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-text-tertiary hover:text-text-secondary transition-colors follow-through-fast"
          >
            <ChevronLeft className="h-4 w-4" />
            Voltar ao site
          </Link>
        </div>
      </div>
    </aside>
  )
}
