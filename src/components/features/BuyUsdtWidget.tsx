import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { USDT_ASK } from '@/constants'
import { formatCurrency } from '@/lib/utils'
import { useAuth } from '@/store/useAuth'
import { cn } from '@/lib/utils'

interface BuyUsdtWidgetProps {
  className?: string
  defaultBrlAmount?: number
}

export function BuyUsdtWidget({ className, defaultBrlAmount = 592 }: BuyUsdtWidgetProps) {
  const { isAuthenticated } = useAuth()
  const [brlAmount, setBrlAmount] = useState(defaultBrlAmount)
  const fee = brlAmount > 0 ? 4.9 : 0
  const netAmount = Math.max(brlAmount - fee, 0)
  const usdtAmount = netAmount / USDT_ASK
  const buyUrl = `/new-liquidation?usdt=${encodeURIComponent(usdtAmount.toFixed(2))}`

  return (
    <Card id="buy-usdt" className={cn('premium-shadow overflow-hidden border-white/10 bg-white text-[#0f172a]', className)}>
      <CardContent className="p-6 sm:p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#64748b]">Comprar USDT</p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#0f172a]">BRL para USDT</h2>
          </div>
          <div className="rounded-2xl bg-[#0A1F44] p-3 text-white">
            <Wallet className="h-6 w-6" />
          </div>
        </div>

        <div className="space-y-4">
          <label className="block rounded-2xl border border-[#dbe3ef] bg-[#f8fafc] p-5">
            <span className="flex items-center justify-between text-sm font-semibold text-[#475569]">
              <span>Você paga</span>
              <span>BRL</span>
            </span>
            <div className="mt-3 flex items-center gap-3">
              <span className="text-3xl font-extrabold text-[#0f172a]">R$</span>
              <input
                type="number"
                min="50"
                step="10"
                value={brlAmount}
                onChange={(event) => setBrlAmount(Number(event.target.value))}
                className="w-full bg-transparent text-4xl font-extrabold tracking-tight text-[#0f172a] outline-none"
              />
            </div>
          </label>

          <div className="grid gap-3 rounded-2xl border border-[#dbe3ef] bg-white p-5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[#64748b]">Cotação</span>
              <span className="font-bold text-[#0f172a]">1 USDT = {formatCurrency(USDT_ASK)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#64748b]">Taxa</span>
              <span className="font-bold text-[#0f172a]">{formatCurrency(fee)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-[#e2e8f0] pt-3">
              <span className="text-[#64748b]">Você recebe</span>
              <span className="text-xl font-extrabold text-[#0f172a]">{usdtAmount.toFixed(2)} USDT</span>
            </div>
          </div>

          <div className="rounded-2xl border border-teal-200 bg-teal-50 p-4 text-sm font-semibold text-teal-900">
            Seus USDT serão entregues diretamente na sua carteira.
          </div>

          <p className="text-xs leading-5 text-[#64748b]">
            No próximo passo você conecta MetaMask, Trust Wallet, Rabby, Coinbase Wallet, WalletConnect ou informa um endereço manualmente.
          </p>

          {isAuthenticated ? (
            <Link to={buyUrl}>
              <Button size="lg" className="w-full">
                Comprar USDT
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <Link to="/login">
                <Button size="lg" className="w-full">Entrar para comprar</Button>
              </Link>
              <Link to="/register">
                <Button variant="outline" size="lg" className="w-full border-[#dbe3ef] bg-white text-[#0f172a] hover:bg-[#f8fafc]">Criar conta</Button>
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
