import { ArrowRight, Clock3, CreditCard, Globe2, ShieldCheck, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FAQAccordion } from '@/components/features/FAQAccordion'
import { BuyUsdtWidget } from '@/components/features/BuyUsdtWidget'

const benefits = [
  {
    icon: Wallet,
    title: 'Direto para a carteira',
    desc: 'USDT entregue diretamente na carteira do cliente. Sem saldo interno ou custódia na plataforma.',
  },
  {
    icon: Clock3,
    title: 'Processamento rápido',
    desc: 'Fluxo Pix para USDT desenhado para confirmação e entrega em poucos minutos.',
  },
  {
    icon: CreditCard,
    title: 'Taxas competitivas',
    desc: 'Cotação clara, taxas transparentes e quantidade estimada de USDT antes do pagamento.',
  },
  {
    icon: ShieldCheck,
    title: 'Infraestrutura segura',
    desc: 'Infraestrutura robusta de pagamentos e stablecoins para operações internacionais.',
  },
]

const walletOptions = ['MetaMask', 'Trust Wallet', 'Rabby', 'Coinbase Wallet', 'WalletConnect']

export function Landing() {
  return (
    <div className="min-h-screen bg-surface text-text-primary">
      <section className="relative overflow-hidden pt-28 pb-20 sm:pt-36 sm:pb-28">
        <div className="absolute inset-0 subtle-grid opacity-60" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-300/60 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1fr_0.92fr] lg:items-center">
            <div className="animate-fade-in">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-teal-200">
                <Globe2 className="h-3.5 w-3.5" />
                Infraestrutura de pagamentos cross-border
              </div>
              <h1 className="max-w-4xl text-5xl font-extrabold tracking-[-0.055em] text-white sm:text-6xl lg:text-7xl">
                Compre USDT direto para sua carteira
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-text-secondary sm:text-xl">
                Acesso rápido, simples e seguro a dólares digitais pela Peragus.
              </p>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-text-tertiary">
                A Peragus conecta moedas fiduciárias locais por meio de liquidação baseada em stablecoins.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <a href="#buy-usdt">
                  <Button size="lg" className="w-full sm:w-auto">
                    Comprar USDT
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
                <a href="#learn-more">
                  <Button variant="outline" size="lg" className="w-full border-white/20 bg-white/8 text-white hover:bg-white/14 sm:w-auto">
                    Saiba mais
                  </Button>
                </a>
              </div>
            </div>

            <BuyUsdtWidget />
          </div>
        </div>
      </section>

      <section id="learn-more" className="border-y border-white/10 bg-[#0d2754] py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-200">Entrega na carteira</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">Conecte sua carteira ou informe um endereço.</h2>
            <p className="mt-5 text-lg leading-8 text-text-secondary">
              Clientes podem conectar MetaMask, Trust Wallet, Rabby, Coinbase Wallet, WalletConnect ou informar manualmente outro endereço compatível.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {walletOptions.map((wallet) => (
              <div key={wallet} className="rounded-2xl border border-white/12 bg-white/8 p-4 text-sm font-bold text-white">
                {wallet}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="benefits" className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-200">Benefícios</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">Criado para acesso simples e confiável a dólares digitais.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => {
              const Icon = benefit.icon
              return (
                <Card key={benefit.title} className="border-white/12 bg-white/8">
                  <CardContent className="p-6">
                    <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-teal-400/15 text-teal-200">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold text-white">{benefit.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-text-secondary">{benefit.desc}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white py-20 text-[#0f172a] sm:py-28">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl">Transforme moeda local em dólares digitais com confiança.</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-[#475569]">A Peragus combina acesso a pagamentos locais, liquidação baseada em stablecoins e entrega direta na carteira.</p>
          <div className="mt-8">
            <a href="#buy-usdt">
              <Button size="lg">
                Comprar USDT
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      <section id="faq" className="py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Perguntas frequentes</h2>
            <p className="mt-4 text-lg text-text-secondary">Saiba mais sobre comprar USDT pela Peragus.</p>
          </div>
          <FAQAccordion />
        </div>
      </section>
    </div>
  )
}
