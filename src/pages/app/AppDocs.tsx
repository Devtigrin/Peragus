import { docsContent } from '@/content/docs'
import type { Locale } from '@/i18n/routing'
import { PageMetadata } from '@/components/seo/PageMetadata'
import { DocsContent } from '@/components/docs/DocsContent'

export function AppDocs({ locale }: { locale: Locale }) {
  const c = docsContent[locale]
  const canonical = locale === 'pt' ? '/app/docs' : `/${locale}/app/docs`
  return (
    <>
      <PageMetadata
        locale={locale}
        title={`${c.seo.title} — App`}
        description={c.seo.description}
        canonicalPath={canonical}
        alternates={{ pt: '/app/docs', es: '/es/app/docs', en: '/en/app/docs' }}
      />
      <div className="flex flex-col gap-10 lg:flex-row">
        <DocsContent locale={locale} />
      </div>
    </>
  )
}
