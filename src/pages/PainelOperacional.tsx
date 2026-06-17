import { Link } from 'react-router-dom'
import { ArrowRight, Clock, PlusCircle, ShieldCheck, Wallet, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { BuyUsdtWidget } from '@/components/features/BuyUsdtWidget'
import { InfraStatus } from '@/components/features/InfraStatus'
import { RecentActivity } from '@/components/features/RecentActivity'
import { formatCurrency } from '@/lib/utils'
import { USDT_ASK } from '@/constants'

export function PainelOperacional() {
  const totalBoughtToday = 42380
  const totalBought30d = 318900
  const avgTime = '6m 42s'

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-border bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface-secondary px-3 py-1 text-xs font-semibold text-text-secondary">
              <Wallet className="h-3.5 w-3.5 text-green-accent" />
              Carteira autocustodial
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-black">Compre USDT com Pix</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#334155]">
              Conecte sua carteira, escolha o valor, pague via Pix e receba USDT diretamente nela.
            </p>
          </div>
          <Link to="/new-liquidation">
            <Button size="lg">
              <PlusCircle className="h-4 w-4" />
              Comprar USDT
            </Button>
          </Link>
        </div>
      </div>

      <BuyUsdtWidget />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Cotação USDT', value: formatCurrency(USDT_ASK), icon: Zap },
          { label: 'Comprado hoje', value: formatCurrency(totalBoughtToday), icon: ArrowRight },
          { label: 'Comprado em 30 dias', value: formatCurrency(totalBought30d), icon: Wallet },
          { label: 'Tempo médio', value: avgTime, icon: Clock },
        ].map((metric, idx) => {
          const Icon = metric.icon
          return (
            <Card key={metric.label} className={`animate-fade-in stagger-${idx + 1} card-lift bg-white`}>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-surface-secondary">
                    <Icon className="h-5 w-5 text-green-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-text-tertiary">{metric.label}</p>
                    <p className="text-xl font-bold text-black">{metric.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-black">Sua carteira, seus ativos</h2>
              <p className="text-sm text-text-tertiary">A Peragus entrega USDT diretamente na carteira do cliente.</p>
              </div>
              <ShieldCheck className="h-5 w-5 text-green-accent" />
            </div>
            <div className="space-y-3">
              {['Conexão com carteira compatível', 'Envio direto para o endereço informado', 'Cotação exibida antes do pagamento', 'Pix gerado no momento da compra'].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-xl border border-border bg-surface-secondary px-4 py-3">
                  <ShieldCheck className="h-4 w-4 text-green-accent" />
                  <span className="text-sm text-text-secondary">{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <RecentActivity />
      </div>

      <InfraStatus />
    </div>
  )
}
