import { docsContent } from '@/content/docs'
import { docsPath, type Locale } from '@/i18n/routing'
import { PageMetadata } from '@/components/seo/PageMetadata'

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
      <div className="mx-auto flex max-w-7xl flex-col gap-10 lg:flex-row">
        <nav
          aria-label={c.endpointsTitle}
          className="lg:w-56 lg:shrink-0 lg:sticky lg:top-24 lg:self-start"
        >
          <ul className="flex gap-2 overflow-x-auto pb-2 text-sm lg:flex-col lg:overflow-visible">
            {[
              { href: '#intro', label: c.intro.slice(0, 24) + '…' },
              { href: '#auth', label: c.authTitle },
              ...c.endpoints.map((e) => ({ href: `#${e.id}`, label: e.title })),
              { href: '#errors', label: c.errorsTitle },
            ].map((item) => (
              <li key={item.href} className="shrink-0">
                <a
                  href={item.href}
                  className="block min-h-11 rounded-lg px-3 py-2.5 leading-tight text-secondary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <article className="min-w-0 max-w-none flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{c.seo.title}</h1>
          <section id="intro" className="mt-6">
            <p className="max-w-prose text-secondary">{c.intro}</p>
          </section>

          <section id="auth" className="mt-10">
            <h2 className="text-xl font-semibold">{c.authTitle}</h2>
            <p className="mt-3 max-w-prose text-secondary">{c.authBody}</p>
            <p className="mt-4 text-xs font-medium uppercase tracking-wide text-tertiary">
              {c.baseUrlLabel}: <code>{c.endpoints[0].path.replace('/create-operation', '')}</code>
            </p>
            <pre className="mt-3 overflow-x-auto rounded-lg bg-surface p-4 font-mono text-xs leading-relaxed">
              <code>{c.authExample}</code>
            </pre>
          </section>

          <section id="endpoints" className="mt-10">
            <h2 className="text-xl font-semibold">{c.endpointsTitle}</h2>
            {c.endpoints.map((e) => (
              <div key={e.id} id={e.id} className="scroll-mt-24 pt-8">
                <h3 className="text-lg font-semibold">
                  <span className="mr-2 rounded border border-line px-1.5 py-0.5 font-mono text-xs uppercase">
                    {e.method}
                  </span>
                  {e.title}
                </h3>
                <p className="mt-2 max-w-prose text-sm text-secondary">{e.description}</p>
                <pre className="mt-3 overflow-x-auto rounded-lg bg-surface p-4 font-mono text-xs leading-relaxed">
                  <code>
                    {`${e.method === 'POST' ? 'curl -X POST' : 'curl'} "${e.path}"`}
                    {'\n'}
                    {e.request.startsWith('(') ? '' : `  -H "content-type: application/json"\n  -d '${e.request}'`}
                  </code>
                </pre>
                <p className="mt-2 text-xs uppercase tracking-wide text-tertiary">200</p>
                <pre className="mt-1 overflow-x-auto rounded-lg border border-line bg-surface p-4 font-mono text-xs leading-relaxed">
                  <code>{e.response}</code>
                </pre>
              </div>
            ))}
          </section>

          <section id="errors" className="mt-12 scroll-mt-24">
            <h2 className="text-xl font-semibold">{c.errorsTitle}</h2>
            <table className="mt-4 w-full text-left text-sm">
              <tbody>
                {c.errors.map((err) => (
                  <tr key={err.code} className="border-b border-line">
                    <td className="py-2 pr-4 align-top font-mono text-xs whitespace-nowrap">
                      {err.code}
                    </td>
                    <td className="py-2 text-secondary">{err.meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="mt-12">
            <h2 className="text-xl font-semibold">{c.statusesTitle}</h2>
            <dl className="mt-4 space-y-2 text-sm">
              {Object.entries(c.statuses).map(([status, meaning]) => (
                <div key={status} className="flex gap-3">
                  <dt className="w-32 shrink-0 font-mono text-xs uppercase">{status}</dt>
                  <dd className="text-secondary">{meaning}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-8 text-sm text-secondary">
              {locale === 'pt'
                ? 'Pronto para testar? '
                : locale === 'es'
                  ? '¿Listo para probar? '
                  : 'Ready to try it? '}
              <a
                href={locale === 'pt' ? '/register' : `/${locale}/register`}
                className="text-mint underline underline-offset-4"
              >
                {locale === 'pt' ? 'Crie sua conta no sandbox' : locale === 'es' ? 'Crea tu cuenta en el sandbox' : 'Create your sandbox account'}
              </a>{' '}
              ·{' '}
              <a href={docsPath(locale)} className="underline underline-offset-4">
                {docsPath(locale)}
              </a>
            </p>
          </section>
        </article>
      </div>
    </>
  )
}
