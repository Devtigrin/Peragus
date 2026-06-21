import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, CheckCircle2, FileText, Shield } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { SECURITY_HIGHLIGHTS, SECURITY_SECTIONS } from '@/constants/securityGuidance'
import { TERMS_HIGHLIGHTS, TERMS_SECTIONS } from '@/constants/legalTerms'

type LegalPageType = 'terms' | 'privacy' | 'compliance' | 'security'
type SimpleLegalPageType = Exclude<LegalPageType, 'terms' | 'security'>

const SIMPLE_PAGES: Record<SimpleLegalPageType, { title: string; description: string; sections: { title: string; body: string }[] }> = {
  privacy: {
    title: 'Política de Privacidade',
    description: 'Como dados pessoais devem ser tratados no produto final.',
    sections: [
      { title: 'Dados coletados', body: 'O fluxo pode solicitar nome, CPF, e-mail, telefone, profissão, origem de recursos e documentos de verificação.' },
      { title: 'Finalidade', body: 'Os dados são usados para autenticação, prevenção a fraude, PLD/FT, suporte e execução das operações solicitadas.' },
      { title: 'Segurança', body: 'Dados sensíveis devem ser protegidos com controles de acesso, criptografia em trânsito e repouso, trilhas de auditoria e retenção limitada.' },
      { title: 'Direitos do titular', body: 'O produto final deve permitir solicitações de acesso, correção, portabilidade e exclusão conforme a LGPD.' },
    ],
  },
  compliance: {
    title: 'Compliance',
    description: 'Diretrizes de prevenção a fraude e lavagem de dinheiro.',
    sections: [
      { title: 'Verificação', body: 'Usuários podem precisar concluir verificação de identidade quando exigido por política operacional ou regulatória.' },
      { title: 'Monitoramento', body: 'Operações podem ser analisadas por valor, recorrência, rede, carteira, origem de recursos e sinais de risco.' },
      { title: 'Limites', body: 'Limites operacionais devem variar conforme nível de verificação, perfil de risco e histórico de uso.' },
      { title: 'Retenção', body: 'Registros de aceite, operação e verificação devem ser armazenados conforme obrigações legais aplicáveis.' },
    ],
  },
}

function BackLink() {
  return (
    <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-text-tertiary hover:text-text-secondary follow-through-fast">
      <ArrowLeft className="h-4 w-4" />
      Voltar ao site
    </Link>
  )
}

function TermsPage() {
  return (
    <main className="min-h-screen bg-surface pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <BackLink />

        <section className="relative overflow-hidden rounded-3xl border border-border bg-surface-card p-6 shadow-xl sm:p-8 lg:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(20,184,166,0.18),transparent_34rem),radial-gradient(circle_at_90%_10%,rgba(37,99,235,0.22),transparent_30rem)]" />
          <div className="relative max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-green-border bg-green-subtle px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-green-accent">
              <FileText className="h-3.5 w-3.5" />
              Termos de Uso
            </div>
            <h1 className="mt-5 text-3xl font-bold tracking-tight text-text-primary sm:text-5xl">
              Termos claros para uso da Peragus
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-text-secondary sm:text-lg">
              A Peragus opera como interface tecnológica não custodial para conexão entre usuários, vendedores, provedores de liquidez e parceiros independentes.
            </p>
          </div>

          <div className="relative mt-8 grid gap-4 md:grid-cols-3">
            {TERMS_HIGHLIGHTS.map((highlight) => (
              <div key={highlight.title} className="rounded-2xl border border-border-subtle bg-surface/55 p-4 backdrop-blur">
                <h2 className="text-sm font-semibold text-text-primary">{highlight.title}</h2>
                <p className="mt-2 text-sm leading-6 text-text-tertiary">{highlight.body}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <Card className="bg-surface-secondary/80">
              <CardContent className="p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-tertiary">Índice</p>
                <nav className="mt-3 space-y-1" aria-label="Índice dos termos de uso">
                  {TERMS_SECTIONS.map((section, index) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className="block rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
                    >
                      {index + 1}. {section.title}
                    </a>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </aside>

          <div className="space-y-5">
            {TERMS_SECTIONS.map((section, index) => (
              <Card key={section.id} id={section.id} className="scroll-mt-24 bg-surface-card/95">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex flex-col gap-4 sm:flex-row sm:gap-5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-green-border bg-green-subtle text-sm font-bold text-green-accent">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-xl font-bold tracking-tight text-text-primary sm:text-2xl">{section.title}</h2>
                      <div className="mt-5 space-y-4 text-sm leading-7 text-text-secondary sm:text-base sm:leading-8">
                        {section.paragraphs.map((paragraph, paragraphIndex) => (
                          <p key={paragraphIndex}>{paragraph}</p>
                        ))}

                        {section.items && (
                          <ul className="grid gap-2 sm:grid-cols-2">
                            {section.items.map((item) => (
                              <li key={item} className="flex gap-3 rounded-xl border border-border-subtle bg-surface-secondary/55 p-3 text-sm leading-6 text-text-secondary">
                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-accent" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        )}

                        {section.closing?.map((paragraph, paragraphIndex) => (
                          <p key={paragraphIndex}>{paragraph}</p>
                        ))}

                        {section.quote && (
                          <blockquote className="rounded-2xl border border-green-border bg-green-subtle p-5 text-sm font-medium leading-7 text-text-primary sm:text-base sm:leading-8">
                            “{section.quote}”
                          </blockquote>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}

function SecurityInfoPage() {
  return (
    <main className="min-h-screen bg-surface pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <BackLink />

        <section className="relative overflow-hidden rounded-3xl border border-border bg-surface-card p-6 shadow-xl sm:p-8 lg:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(20,184,166,0.18),transparent_34rem),radial-gradient(circle_at_90%_10%,rgba(245,158,11,0.12),transparent_30rem)]" />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_360px] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-green-border bg-green-subtle px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-green-accent">
                <Shield className="h-3.5 w-3.5" />
                Segurança
              </div>
              <h1 className="mt-5 text-3xl font-bold tracking-tight text-text-primary sm:text-5xl">
                Proteja sua conta, carteira e operações
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-text-secondary sm:text-lg">
                Boas práticas para proteger sua conta, seus dados, sua carteira e suas operações na Peragus.
              </p>
            </div>

            <div className="rounded-2xl border border-yellow-200/20 bg-yellow-50/20 p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-400" />
                <div>
                  <h2 className="text-sm font-semibold text-text-primary">Atenção a golpes</h2>
                  <p className="mt-2 text-sm leading-6 text-yellow-500">
                    A Peragus nunca solicita chave privada, frase-semente, senha completa, código de autenticação ou instalação de acesso remoto.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative mt-8 grid gap-3 md:grid-cols-3">
            {SECURITY_HIGHLIGHTS.map((highlight) => (
              <div key={highlight} className="flex gap-3 rounded-2xl border border-border-subtle bg-surface/55 p-4 backdrop-blur">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-accent" />
                <p className="text-sm leading-6 text-text-secondary">{highlight}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <Card className="bg-surface-secondary/80">
              <CardContent className="p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-tertiary">Guia rápido</p>
                <nav className="mt-3 space-y-1" aria-label="Índice de segurança">
                  {SECURITY_SECTIONS.map((section) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className="block rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
                    >
                      {section.title}
                    </a>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </aside>

          <div className="space-y-5">
            {SECURITY_SECTIONS.map((section) => (
              <Card key={section.id} id={section.id} className="scroll-mt-24 bg-surface-card/95">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex flex-col gap-4 sm:flex-row sm:gap-5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-green-border bg-green-subtle">
                      <Shield className="h-5 w-5 text-green-accent" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-xl font-bold tracking-tight text-text-primary sm:text-2xl">{section.title}</h2>
                      <div className="mt-5 space-y-4 text-sm leading-7 text-text-secondary sm:text-base sm:leading-8">
                        {section.paragraphs.map((paragraph, paragraphIndex) => (
                          <p key={paragraphIndex}>{paragraph}</p>
                        ))}

                        {section.items && (
                          <ul className="grid gap-2 sm:grid-cols-2">
                            {section.items.map((item) => (
                              <li key={item} className="flex gap-3 rounded-xl border border-border-subtle bg-surface-secondary/55 p-3 text-sm leading-6 text-text-secondary">
                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-accent" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        )}

                        {section.orderedItems && (
                          <ol className="space-y-2">
                            {section.orderedItems.map((item, itemIndex) => (
                              <li key={item} className="flex gap-3 rounded-xl border border-border-subtle bg-surface-secondary/55 p-3 text-sm leading-6 text-text-secondary">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-subtle text-xs font-bold text-green-accent">
                                  {itemIndex + 1}
                                </span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ol>
                        )}

                        {section.callout && (
                          <div className="rounded-2xl border border-green-border bg-green-subtle p-4 text-sm font-semibold leading-7 text-text-primary sm:text-base">
                            {section.callout}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card className="border-green-border bg-green-subtle">
              <CardContent className="p-6 sm:p-8">
                <p className="text-base font-semibold leading-8 text-text-primary">
                  A segurança também depende da atenção do usuário. Sempre confirme os dados da operação antes de realizar pagamentos ou assinar transações.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}

export function LegalPage({ type }: { type: LegalPageType }) {
  if (type === 'terms') return <TermsPage />
  if (type === 'security') return <SecurityInfoPage />

  const page = SIMPLE_PAGES[type]

  return (
    <main className="min-h-screen bg-surface pt-24 pb-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <BackLink />
        <div className="mb-8 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-subtle border border-green-border">
            <Shield className="h-6 w-6 text-green-accent" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-text-primary sm:text-4xl">{page.title}</h1>
            <p className="mt-3 text-text-secondary">{page.description}</p>
          </div>
        </div>
        <Card>
          <CardContent className="space-y-8 p-6 sm:p-8">
            {page.sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-lg font-semibold text-text-primary">{section.title}</h2>
                <p className="mt-2 text-sm leading-7 text-text-secondary">{section.body}</p>
              </section>
            ))}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
