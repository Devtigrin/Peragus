import { Link } from 'react-router-dom'
import { Lock, Eye, AlertTriangle, CheckCircle2, ArrowLeft } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { SecurityAlert } from '@/components/features/SecurityAlert'

export function Security() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-text-tertiary hover:text-text-secondary mb-4 follow-through-fast"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao dashboard
        </Link>
        <h1 className="text-2xl font-bold text-text-primary">Segurança</h1>
        <p className="text-sm text-text-tertiary mt-1">
          Como protegemos seus dados e ativos
        </p>
      </div>

      <SecurityAlert
        type="critical"
        title="Sempre confira o domínio oficial"
        description="Antes de conectar sua carteira, verifique se você está no domínio oficial peragus.com. Golpistas podem tentar imitar nosso site."
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-green-border/30">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-subtle/60 shrink-0">
                <CheckCircle2 className="h-5 w-5 text-green-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary mb-2">Nunca guardamos seed phrases</h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  A Peragus não armazena, processa ou tem qualquer acesso à sua seed phrase ou chave privada.
                  Sua carteira permanece 100% sob seu controle.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-border/30">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-subtle/60 shrink-0">
                <CheckCircle2 className="h-5 w-5 text-green-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary mb-2">Nunca pedimos chave privada</h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Nunca solicitamos sua chave privada em nenhuma etapa. Se alguém pedir, é golpe.
                  A conexão com a carteira é feita de forma segura e revogável.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-navy-border/30">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-subtle/60 shrink-0">
                <Lock className="h-5 w-5 text-navy-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary mb-2">Conexão revogável</h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Você pode revogar a conexão com a Peragus a qualquer momento
                  diretamente pelas configurações da sua carteira.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-navy-border/30">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-subtle/60 shrink-0">
                <Eye className="h-5 w-5 text-navy-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary mb-2">Rastreabilidade total</h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Todas as operações são registradas na blockchain e podem ser verificadas
                  publicamente através dos exploradores de blocos.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-yellow-200/20 bg-yellow-50/30">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 shrink-0" />
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-text-primary mb-2">Boas práticas contra phishing</h3>
                <ul className="space-y-2 text-sm text-text-secondary">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 font-bold">•</span>
                    Sempre verifique o domínio: <strong className="text-text-primary">peragus.com</strong>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 font-bold">•</span>
                    Desconfie de mensagens não solicitadas pedindo conexão de carteira
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 font-bold">•</span>
                    A Peragus nunca entra em contato pedindo seed phrase ou chave privada
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 font-bold">•</span>
                    Use apenas o site oficial para realizar operações
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 font-bold">•</span>
                    Mantenha seu navegador e carteira sempre atualizados
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
