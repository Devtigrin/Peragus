import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { Clock, Network } from 'lucide-react'
import { USDT_ASK, ESTIMATED_TIME, SUPPORTED_NETWORK } from '@/constants'

export function QuoteCard() {
  return (
    <Card className="overflow-hidden border-green-border/30">
      <div className="bg-gradient-to-r from-navy-subtle to-green-subtle px-6 py-4 border-b border-border">
        <h3 className="text-sm font-semibold text-text-primary">Peragus Quote</h3>
      </div>
      <CardContent className="p-6">
        <div className="grid gap-6 sm:grid-cols-3">
          <div>
            <p className="text-xs text-text-tertiary mb-1">Compra (BRL {'->'} USDT)</p>
            <p className="text-2xl font-bold text-text-primary">{formatCurrency(USDT_ASK)}</p>
            <p className="text-xs text-text-disabled mt-1">1 USDT</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Clock className="h-4 w-4 text-green-accent" />
              <span>{ESTIMATED_TIME}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Network className="h-4 w-4 text-navy-accent" />
              <span>{SUPPORTED_NETWORK}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
