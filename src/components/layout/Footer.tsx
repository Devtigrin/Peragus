import { Link } from 'react-router-dom'
import type { Locale } from '@/i18n/routing'
import { homePath, pagePath, sandboxPath, sectionPath } from '@/i18n/routing'
import type { HomeContent } from '@/content/home'
import { Container } from '@/components/ui/container'
import { PeragusLogo } from '@/components/brand/PeragusLogo'

type FooterProps = {
  locale: Locale
  content: HomeContent
}

const columns = (content: HomeContent, locale: Locale) => [
  {
    heading: content.footer.product,
    links: [
      { label: content.nav.howItWorks, to: sectionPath(locale, 'como-funciona') },
      { label: content.nav.infrastructure, to: sectionPath(locale, 'infraestrutura') },
    ],
  },
  {
    heading: content.footer.resources,
    links: [
      { label: content.footer.documentation, to: sandboxPath(locale, 'docs') },
      { label: content.nav.security, to: pagePath(locale, 'security') },
    ],
  },
  {
    heading: content.footer.legal,
    links: [
      { label: content.footer.terms, to: pagePath(locale, 'terms') },
      { label: content.footer.privacy, to: pagePath(locale, 'privacy') },
      { label: content.footer.compliance, to: pagePath(locale, 'compliance') },
    ],
  },
]

export function Footer({ locale, content }: FooterProps) {
  return (
    <footer className="border-t border-hairline">
      <Container className="py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link to={homePath(locale)} className="inline-flex min-h-11 items-center" aria-label="Peragus — Início">
              <PeragusLogo />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-6 text-tertiary">{content.footer.description}</p>
            <p className="mt-5 inline-flex items-center gap-2 font-mono text-xs text-tertiary">
              <span aria-hidden="true" className="h-1 w-1 rounded-full bg-mint/70" />
              peragus.com.br
            </p>
          </div>

          {columns(content, locale).map((col) => (
            <div key={col.heading}>
              <h2 className="font-mono text-xs font-semibold uppercase tracking-[.14em] text-primary">{col.heading}</h2>
              <ul className="mt-4 grid gap-1">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="flex min-h-11 items-center text-sm text-tertiary transition-colors hover:text-primary">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-hairline pt-6 text-xs text-tertiary sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Peragus. Todos os direitos reservados.</p>
          <p className="font-mono">sandbox · polygon amoy · mockusdt</p>
        </div>
      </Container>
    </footer>
  )
}