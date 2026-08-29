import { Link } from 'react-router-dom'
import { Container } from '@/components/ui/container'
import type { Locale } from '@/i18n/routing'
import { homePath } from '@/i18n/routing'

const labels = {
  pt: { title: 'Página não encontrada', back: 'Voltar para a Peragus', code: 'Código 404' },
  es: { title: 'Página no encontrada', back: 'Volver a Peragus', code: 'Código 404' },
  en: { title: 'Page not found', back: 'Back to Peragus', code: 'Error 404' },
} satisfies Record<Locale, { title: string; back: string; code: string }>

export function NotFound({ locale = 'pt' }: { locale?: Locale }) {
  const { title, back, code } = labels[locale]
  return (
    <main id="main-content" className="min-h-screen px-4 py-32">
      <Container>
        <p className="font-mono text-[11px] uppercase tracking-[.14em] text-tertiary">{code}</p>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-[-0.02em] text-primary sm:text-5xl">{title}</h1>
        <p className="mt-4 max-w-md text-sm leading-6 text-secondary">
          {locale === 'pt'
            ? 'A rota não existe ou foi removida.'
            : locale === 'es'
              ? 'La ruta no existe o fue eliminada.'
              : 'This route does not exist or was removed.'}
        </p>
        <Link
          className="mt-8 inline-flex min-h-11 items-center font-mono text-sm text-mint underline underline-offset-4"
          to={homePath(locale)}
        >
          {back}
        </Link>
      </Container>
    </main>
  )
}