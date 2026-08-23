import { Link } from 'react-router-dom'
import type { Locale } from '@/i18n/routing'
import { homePath, pagePath, sandboxPath, sectionPath } from '@/i18n/routing'
import type { HomeContent } from '@/content/home'
import { Container } from '@/components/ui/container'

type FooterProps = {
  locale: Locale
  content: HomeContent
}

export function Footer({ locale, content }: FooterProps) {
  return (
    <footer className="border-t border-line bg-surface/35 py-12">
      <Container>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to={homePath(locale)} className="inline-flex min-h-11 items-center text-lg font-semibold text-primary">Peragus</Link>
            <p className="mt-3 text-sm leading-6 text-tertiary">{content.footer.description}</p>
            <p className="mt-4 font-mono text-xs text-tertiary">peragus.com.br</p>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-primary">{content.footer.product}</h2>
            <ul className="mt-3 grid gap-1">
              <li>
                <Link to={sectionPath(locale, 'como-funciona')} className="flex min-h-11 items-center text-sm text-tertiary hover:text-primary transition-colors">
                  {content.nav.howItWorks}
                </Link>
              </li>
              <li>
                <Link to={sectionPath(locale, 'infraestrutura')} className="flex min-h-11 items-center text-sm text-tertiary hover:text-primary transition-colors">
                  {content.nav.infrastructure}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-primary">{content.footer.resources}</h2>
            <ul className="mt-3 grid gap-1">
              <li>
                <Link to={sandboxPath(locale, 'docs')} className="flex min-h-11 items-center text-sm text-tertiary hover:text-primary transition-colors">
                  {content.footer.documentation}
                </Link>
              </li>
              <li>
                <Link to={pagePath(locale, 'security')} className="flex min-h-11 items-center text-sm text-tertiary hover:text-primary transition-colors">
                  {content.nav.security}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-primary">{content.footer.legal}</h2>
            <ul className="mt-3 grid gap-1">
              <li>
                <Link to={pagePath(locale, 'terms')} className="flex min-h-11 items-center text-sm text-tertiary hover:text-primary transition-colors">
                  {content.footer.terms}
                </Link>
              </li>
              <li>
                <Link to={pagePath(locale, 'privacy')} className="flex min-h-11 items-center text-sm text-tertiary hover:text-primary transition-colors">
                  {content.footer.privacy}
                </Link>
              </li>
              <li>
                <Link to={pagePath(locale, 'compliance')} className="flex min-h-11 items-center text-sm text-tertiary hover:text-primary transition-colors">
                  {content.footer.compliance}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-line pt-6 text-center text-xs text-tertiary">
          &copy; {new Date().getFullYear()} Peragus. Todos os direitos reservados.
        </div>
      </Container>
    </footer>
  )
}
