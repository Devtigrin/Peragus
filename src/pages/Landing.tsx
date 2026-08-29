import { Link } from 'react-router-dom'
import type { Locale } from '@/i18n/routing'
import { homePath, sandboxPath, sectionPath } from '@/i18n/routing'
import { homeContent } from '@/content/home'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { Notice } from '@/components/ui/notice'
import { SectionHeading } from '@/components/ui/section-heading'
import { SettlementEventPanel } from '@/components/marketing/SettlementEventPanel'
import { InfrastructureDiagram } from '@/components/marketing/InfrastructureDiagram'
import { WireReveal } from '@/components/marketing/WireReveal'
import { PageMetadata } from '@/components/seo/PageMetadata'

export function Landing({ locale }: { locale: Locale }) {
  const content = homeContent[locale]
  return (
    <>
      <PageMetadata
        locale={locale}
        title={content.seo.title}
        description={content.seo.description}
        canonicalPath={homePath(locale)}
        alternates={{ pt: homePath('pt'), es: homePath('es'), en: homePath('en') }}
      />
      <main id="main-content" tabIndex={-1}>
      {/* 1. Hero — the settlement instrument */}
      <section className="relative overflow-hidden pb-16 pt-16 sm:pb-20 sm:pt-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(180deg,transparent_0px,transparent_63px,var(--color-hairline)_63px,var(--color-hairline)_64px)] opacity-50"
        />
        <Container className="relative">
          <div className="flex items-center justify-between gap-4 border-b border-hairline pb-4 font-mono text-[11px] uppercase tracking-[.14em] text-tertiary">
            <span className="flex items-center gap-2.5">
              <span aria-hidden="true" className="h-px w-6 bg-mint/70" />
              {content.hero.label}
            </span>
            <span className="hidden font-mono text-tertiary sm:inline">BRL → MOCKUSDT</span>
          </div>

          <div className="mt-10 grid items-start gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
            <div>
              <h1 className="max-w-2xl font-display text-[clamp(2rem,5vw,4.25rem)] font-semibold leading-[1.06] tracking-[-0.02em] text-primary">
                {content.hero.title}
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-secondary sm:text-lg">
                {content.hero.description}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link to={sandboxPath(locale, 'register')}>{content.hero.primaryCta}</Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link to={sectionPath(locale, 'como-funciona')}>{content.hero.secondaryCta}</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div aria-hidden="true" className="hero-glow absolute inset-x-2 inset-y-4 -z-10 rounded-(--radius-panel) sm:inset-x-6 sm:inset-y-10" />
              <SettlementEventPanel content={content.eventPanel} />
            </div>
          </div>
        </Container>
      </section>

      {/* 2. Verification ledger */}
      <section aria-label={content.transparency[0].title} className="border-y border-line bg-surface/40">
        <Container className="py-10 sm:py-12">
          <dl className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
            {content.transparency.map((item) => (
              <div key={item.title} className="lg:border-l lg:border-hairline lg:px-6 lg:first:border-l-0 lg:first:pl-0">
                <dt className="flex items-start gap-2.5">
                  <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full border border-mint/70" />
                  <span className="font-mono text-[13px] font-semibold uppercase tracking-[.08em] text-primary">{item.title}</span>
                </dt>
                <dd className="mt-2 pl-4 text-sm leading-6 text-tertiary">{item.body}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {/* 3. Flow — a genuine sequence */}
      <section id="como-funciona" className="scroll-mt-24 py-24 sm:py-32">
        <Container>
          <WireReveal className="mb-10" />
          <SectionHeading track eyebrow={content.howItWorks.eyebrow} title={content.howItWorks.title} description={content.howItWorks.description} />
          <ol className="mt-14 grid gap-x-8 gap-y-10 border-t border-hairline pt-10 md:grid-cols-3">
            {content.howItWorks.steps.map((step, index) => (
              <li key={step.title} className="md:border-l md:border-hairline md:pl-8 md:first:border-l-0 md:first:pl-0">
                <span className="font-mono text-xs font-medium text-mint">0{index + 1}</span>
                <h3 className="mt-4 font-display text-lg font-semibold tracking-[-0.01em] text-primary">{step.title}</h3>
                <p className="mt-3 max-w-xs text-sm leading-6 text-tertiary">{step.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* 4. Operational Control — capabilities, not a sequence */}
      <section id="produto" className="scroll-mt-24 bg-surface/25 py-24 sm:py-32">
        <Container className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:gap-20">
          <div className="flex flex-col">
            <WireReveal className="mb-8" />
            <SectionHeading track eyebrow={content.operations.eyebrow} title={content.operations.title} description={content.operations.description} />
          </div>
          <ul className="border-t border-line">
            {content.operations.items.map((item) => (
              <li key={item.title} className="flex gap-4 border-b border-hairline py-5 first:pt-6 last:border-b-0 last:pb-0">
                <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-mint/70" />
                <div>
                  <h3 className="font-semibold text-primary">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-tertiary">{item.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* 5. Who can test */}
      <section className="py-24 sm:py-32">
        <Container>
          <WireReveal className="mb-10" />
          <SectionHeading track eyebrow={content.useCases.eyebrow} title={content.useCases.title} />
          <div className="mt-12 grid gap-x-12 gap-y-10 md:grid-cols-2">
            {[content.useCases.merchant, content.useCases.acquirer].map((useCase) => (
              <div key={useCase.title} className="border-t border-hairline pt-6">
                <h3 className="text-lg font-semibold text-primary">{useCase.title}</h3>
                <p className="mt-3 max-w-md text-sm leading-6 text-secondary">{useCase.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* 6. Infrastructure — the settlement route */}
      <section id="infraestrutura" className="scroll-mt-24 border-y border-line bg-surface/25 py-24 sm:py-32">
        <Container>
          <WireReveal className="mb-10" />
          <SectionHeading track eyebrow={content.infrastructure.eyebrow} title={content.infrastructure.title} description={content.infrastructure.description} />
          <InfrastructureDiagram nodes={content.infrastructure.nodes} />
        </Container>
      </section>

      {/* 7. Limits + final CTA */}
      <section id="seguranca" className="scroll-mt-24 py-24 sm:py-32">
        <Container>
          <WireReveal className="mb-10" />
          <SectionHeading track eyebrow={content.disclosure.eyebrow} title={content.disclosure.title} />
          <Notice tone="sandbox" className="mt-8 max-w-2xl">{content.disclosure.body}</Notice>

          <div className="mt-16 flex flex-col gap-8 border-y border-line py-10 sm:py-12 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <p className="font-mono text-[11px] uppercase tracking-[.12em] text-tertiary">{content.finalCta.eyebrow}</p>
              <h2 className="mt-3 font-display text-[clamp(1.4rem,3vw,2rem)] font-semibold leading-[1.15] tracking-[-0.01em] text-primary">
                {content.finalCta.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-secondary">{content.finalCta.body}</p>
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link to={sandboxPath(locale, 'register')}>{content.finalCta.primary}</Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link to={sandboxPath(locale, 'docs')}>{content.finalCta.secondary}</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>
      </main>
    </>
  )
}