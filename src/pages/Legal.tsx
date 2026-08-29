import type { Locale } from '@/i18n/routing'
import type { LegalPageType } from '@/content/legal'
import { legalContent } from '@/content/legal'
import { pagePath } from '@/i18n/routing'
import { Container } from '@/components/ui/container'
import { Notice } from '@/components/ui/notice'
import { PageMetadata } from '@/components/seo/PageMetadata'

export function LegalPage({ locale, type }: { locale: Locale; type: LegalPageType }) {
  const document = legalContent[locale][type]
  return (
    <>
      <PageMetadata
        locale={locale}
        title={`${document.title} | Peragus`}
        description={document.description}
        canonicalPath={pagePath(locale, type)}
        alternates={{ pt: pagePath('pt', type), es: pagePath('es', type), en: pagePath('en', type) }}
      />
      <main id="main-content" tabIndex={-1} className="pb-24 pt-16 sm:pt-20">
      <Container>
        <p className="font-mono text-[11px] uppercase tracking-[.12em] text-sandbox">{document.version}</p>
        <h1 className="mt-4 max-w-3xl font-display text-[clamp(2rem,4.6vw,3.25rem)] font-semibold leading-[1.08] tracking-[-0.02em] text-primary">
          {document.title}
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-secondary">{document.description}</p>
        <p className="mt-3 text-sm text-tertiary">{document.effectiveDate}</p>
        <Notice tone="sandbox" className="mt-8 max-w-3xl">{document.reviewNotice}</Notice>
        <div className="mt-12 grid gap-10 lg:grid-cols-[15rem_1fr]">
          <nav aria-label={document.title} className="lg:border-l lg:border-hairline lg:pl-6 lg:sticky lg:top-24 lg:self-start">
            <ol className="grid gap-1">
              {document.sections.map((section) => (
                <li key={section.id}>
                  <a className="flex min-h-11 items-center rounded-(--radius-control) px-2 text-sm text-tertiary transition-colors hover:text-primary" href={`#${section.id}`}>{section.title}</a>
                </li>
              ))}
            </ol>
          </nav>
          <div className="grid gap-12">
            {document.sections.map((section) => (
              <section id={section.id} key={section.id} className="scroll-mt-24 border-t border-hairline pt-6">
                <h2 className="font-display text-xl font-semibold text-primary">{section.title}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="mt-4 max-w-prose text-base leading-8 text-secondary">{paragraph}</p>
                ))}
              </section>
            ))}
          </div>
        </div>
      </Container>
      </main>
    </>
  )
}