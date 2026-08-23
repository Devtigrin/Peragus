import { Link } from 'react-router-dom'
import type { Locale } from '@/i18n/routing'
import { homePath } from '@/i18n/routing'

const labels = {
  pt: { title: 'Página não encontrada', back: 'Voltar para a Peragus' },
  es: { title: 'Página no encontrada', back: 'Volver a Peragus' },
  en: { title: 'Page not found', back: 'Back to Peragus' },
} satisfies Record<Locale, { title: string; back: string }>

export function NotFound({ locale = 'pt' }: { locale?: Locale }) {
  const { title, back } = labels[locale]
  return (
    <main id="main-content" className="min-h-screen px-6 py-32">
      <p className="text-sm text-text-tertiary">404</p>
      <h1 className="mt-3 text-4xl font-semibold">{title}</h1>
      <Link className="mt-8 inline-flex text-teal-300" to={homePath(locale)}>{back}</Link>
    </main>
  )
}
