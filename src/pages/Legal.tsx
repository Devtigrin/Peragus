import { Link } from 'react-router-dom'
import { ArrowLeft, Shield } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

type LegalPageType = 'terms' | 'privacy' | 'compliance' | 'security'

const PAGES: Record<LegalPageType, { title: string; description: string; sections: { title: string; body: string }[] }> = {
  terms: {
    title: 'Termos de Uso',
    description: 'Condições gerais para uso da Peragus em ambiente demonstrativo.',
    sections: [
      { title: 'Serviço', body: 'A Peragus conecta moedas fiduciárias locais através de liquidação baseada em stablecoins e entrega USDT diretamente na carteira informada.' },
      { title: 'Carteira do cliente', body: 'A plataforma não solicita seed phrase, chave privada ou autorização para movimentar fundos da carteira do usuário.' },
      { title: 'Responsabilidade do usuário', body: 'O usuário deve conferir rede, endereço, valor, taxas e irreversibilidade da transação antes de confirmar uma operação.' },
      { title: 'Ambiente demo', body: 'Os dados exibidos neste protótipo, incluindo cotações, Pix, carteiras, notificações e métricas, são ilustrativos.' },
    ],
  },
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
  security: {
    title: 'Segurança',
    description: 'Boas práticas para proteger contas, dados e operações.',
    sections: [
      { title: 'Chaves privadas', body: 'A Peragus nunca pede seed phrase ou chave privada. Qualquer solicitação desse tipo deve ser tratada como golpe.' },
      { title: 'Domínio oficial', body: 'Usuários devem conferir o domínio antes de conectar carteira ou iniciar pagamento.' },
      { title: 'Transações on-chain', body: 'Depois de confirmada, uma transação blockchain não pode ser revertida. Rede e endereço devem ser revisados com atenção.' },
      { title: 'Conta', body: 'O produto final deve suportar senha forte, proteção contra sessão indevida e, idealmente, autenticação em dois fatores.' },
    ],
  },
}

export function LegalPage({ type }: { type: LegalPageType }) {
  const page = PAGES[type]

  return (
    <main className="min-h-screen bg-surface pt-24 pb-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-text-tertiary hover:text-text-secondary follow-through-fast">
          <ArrowLeft className="h-4 w-4" />
          Voltar ao site
        </Link>
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
