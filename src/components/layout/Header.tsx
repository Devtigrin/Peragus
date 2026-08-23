import { useState } from 'react'
import { Link } from 'react-router-dom'
import * as Dialog from '@radix-ui/react-dialog'
import { Menu, X } from 'lucide-react'
import type { Locale } from '@/i18n/routing'
import { homePath, pagePath, sandboxPath, sectionPath } from '@/i18n/routing'
import type { HomeContent } from '@/content/home'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { LocaleSwitcher } from './LocaleSwitcher'

const navigation = [
  { key: 'product', href: '#produto' },
  { key: 'howItWorks', href: '#como-funciona' },
  { key: 'infrastructure', href: '#infraestrutura' },
  { key: 'security', href: 'security' },
] as const

type HeaderProps = {
  locale: Locale
  content: HomeContent
}

export function Header({ locale, content }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const navLinks = navigation.map((item) => ({
    label: content.nav[item.key],
    href: item.href === 'security' ? pagePath(locale, 'security') : sectionPath(locale, item.href),
  }))

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-midnight">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link to={homePath(locale)} className="flex min-h-11 items-center gap-2 text-lg font-semibold text-primary">
          Peragus
        </Link>

        <nav aria-label={content.nav.product} className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => (
            <Link key={link.href} to={link.href} className="flex min-h-11 items-center text-sm text-secondary hover:text-primary transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <LocaleSwitcher locale={locale} />
          <Link to={sandboxPath(locale, 'login')} className="flex min-h-11 items-center text-sm text-secondary hover:text-primary transition-colors">
            {content.nav.signIn}
          </Link>
          <Button asChild size="sm">
            <Link to={sandboxPath(locale, 'register')}>{content.nav.sandbox}</Link>
          </Button>
        </div>

        <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
          <Dialog.Trigger asChild>
            <button className="inline-flex h-11 w-11 items-center justify-center lg:hidden" aria-label={content.nav.menuOpen}>
              <Menu aria-hidden="true" />
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-40 bg-midnight/80" />
            <Dialog.Content aria-describedby={undefined} className="fixed inset-x-4 top-4 z-50 rounded-xl border border-line bg-surface p-5 shadow-panel lg:hidden">
              <Dialog.Title className="sr-only">{content.nav.product}</Dialog.Title>
              <Dialog.Close aria-label={content.nav.menuClose} className="ml-auto flex h-11 w-11 items-center justify-center">
                <X aria-hidden="true" />
              </Dialog.Close>
              <nav aria-label={content.nav.product} className="mt-6 grid gap-2">
                {navLinks.map((link) => (
                  <Link key={link.href} to={link.href} onClick={() => setMobileOpen(false)} className="flex min-h-11 items-center text-secondary">
                    {link.label}
                  </Link>
                ))}
                <Link to={sandboxPath(locale, 'login')} onClick={() => setMobileOpen(false)} className="flex min-h-11 items-center text-secondary">
                  {content.nav.signIn}
                </Link>
                <Button asChild className="mt-3">
                  <Link to={sandboxPath(locale, 'register')} onClick={() => setMobileOpen(false)}>
                    {content.nav.sandbox}
                  </Link>
                </Button>
                <div className="mt-4 border-t border-line pt-4">
                  <LocaleSwitcher locale={locale} />
                </div>
              </nav>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </Container>
    </header>
  )
}
