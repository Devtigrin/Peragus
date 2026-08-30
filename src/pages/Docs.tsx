import { docsContent } from '@/content/docs'
import type { Locale } from '@/i18n/routing'
import { PageMetadata } from '@/components/seo/PageMetadata'
import { Container } from '@/components/ui/container'
import { DocsContent } from '@/components/docs/DocsContent'

export function Docs({ locale }: { locale: Locale }) {
  const c = docsContent[locale]
  const canonical = locale === 'pt' ? '/docs' : `/${locale}/docs`

  return (
    <>
      <PageMetadata
        locale={locale}
        title={c.seo.title}
        description={c.seo.description}
        canonicalPath={canonical}
        alternates={{ pt: '/docs', es: '/es/docs', en: '/en/docs' }}
      />
      <main id="main-content" tabIndex={-1}>
        <Container className="mt-10 flex max-w-7xl flex-col gap-10 pb-16 lg:flex-row lg:px-6">
          <DocsContent locale={locale} />
        </Container>
      </main>
    </>
  )
}