import { docsContent } from '@/content/docs'
import { docsPath, type Locale } from '@/i18n/routing'

const codeStyle =
  'mt-3 overflow-x-auto rounded-(--radius-control) border border-hairline bg-midnight p-4 font-mono text-xs leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint'

export function DocsContent({ locale }: { locale: Locale }) {
  const c = docsContent[locale]
  return (
    <>
      <nav
        aria-label={c.endpointsTitle}
        className="lg:w-56 lg:shrink-0 lg:sticky lg:top-24 lg:self-start"
      >
        <ul className="flex flex-wrap gap-1 border-b border-hairline pb-3 font-mono text-xs uppercase tracking-[.08em] text-tertiary lg:flex-col lg:border-b-0 lg:pb-0 lg:text-[13px] lg:normal-case lg:tracking-normal">
          {[
            { href: '#intro', label: c.intro.slice(0, 24) + '…' },
            { href: '#auth', label: c.authTitle },
            ...c.endpoints.map((e) => ({ href: `#${e.id}`, label: e.title })),
            { href: '#errors', label: c.errorsTitle },
          ].map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="block min-h-11 rounded-(--radius-control) px-2 py-2.5 leading-tight text-secondary transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <article className="min-w-0 max-w-none flex-1">
        <p className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[.14em] text-tertiary">
          <span aria-hidden="true" className="h-px w-6 bg-mint/70" />
          API Reference
        </p>
        <h1 className="mt-4 font-display text-[clamp(1.8rem,3.6vw,2.6rem)] font-semibold leading-[1.12] tracking-[-0.02em] text-primary">
          {c.seo.title}
        </h1>
        <section id="intro" className="mt-8">
          <p className="max-w-prose leading-7 text-secondary">{c.intro}</p>
        </section>

        <section id="auth" className="mt-12 scroll-mt-24">
          <h2 className="font-display text-xl font-semibold text-primary">{c.authTitle}</h2>
          <p className="mt-3 max-w-prose leading-7 text-secondary">{c.authBody}</p>
          <p className="mt-4 text-xs font-medium uppercase tracking-wide text-tertiary">
            {c.baseUrlLabel}: <code className="font-mono">{c.endpoints[0].path.replace('/create-operation', '')}</code>
          </p>
          <pre tabIndex={0} aria-label={c.baseUrlLabel} className={codeStyle}>
            <code>{c.authExample}</code>
          </pre>
        </section>

        <section id="endpoints" className="mt-12 scroll-mt-24">
          <h2 className="font-display text-xl font-semibold text-primary">{c.endpointsTitle}</h2>
          {c.endpoints.map((e) => (
            <div key={e.id} id={e.id} className="scroll-mt-24 pt-8">
              <h3 className="font-display text-lg font-semibold text-primary">
                <span className="mr-2 rounded border border-line px-1.5 py-0.5 font-mono text-xs uppercase">
                  {e.method}
                </span>
                {e.title}
              </h3>
              <p className="mt-2 max-w-prose text-sm leading-6 text-secondary">{e.description}</p>
              <pre tabIndex={0} aria-label={`${e.title} — ${e.method}`} className={codeStyle}>
                <code>
                  {`${e.method === 'POST' ? 'curl -X POST' : 'curl'} "${e.path}"`}
                  {'\n'}
                  {e.request.startsWith('(') ? '' : `  -H "content-type: application/json"\n  -d '${e.request}'`}
                </code>
              </pre>
              <p className="mt-2 font-mono text-[11px] uppercase tracking-[.1em] text-tertiary">200</p>
              <pre tabIndex={0} aria-label={`${e.title} — response`} className={codeStyle}>
                <code>{e.response}</code>
              </pre>
            </div>
          ))}
        </section>

        <section id="errors" className="mt-14 scroll-mt-24">
          <h2 className="font-display text-xl font-semibold text-primary">{c.errorsTitle}</h2>
          <table className="mt-4 w-full text-left text-sm">
            <tbody>
              {c.errors.map((err) => (
                <tr key={err.code} className="border-b border-hairline">
                  <td className="py-2.5 pr-4 align-top font-mono text-xs whitespace-nowrap">{err.code}</td>
                  <td className="py-2.5 text-secondary">{err.meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mt-14">
          <h2 className="font-display text-xl font-semibold text-primary">{c.statusesTitle}</h2>
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
    </>
  )
}
