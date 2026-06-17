import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Clock, ArrowUpRight, CreditCard, RefreshCw } from 'lucide-react'

interface ActivityEvent {
  time: string
  type: 'pix' | 'liquidation' | 'sent' | 'completed' | 'rate'
  description: string
  status: 'success' | 'pending' | 'info'
}

const events: ActivityEvent[] = [
  { time: '18:32', type: 'completed', description: 'Compra SP-0A2F concluída — 100 USDT enviados para Polygon', status: 'success' },
  { time: '18:15', type: 'pix', description: 'Pix confirmado — R$ 592,00 recebidos para compra SP-0B3G', status: 'success' },
  { time: '17:58', type: 'liquidation', description: 'Compra SP-0C4H iniciada — 200 USDT via Ethereum', status: 'pending' },
  { time: '17:30', type: 'sent', description: 'USDT enviado — 50 USDT para carteira em Arbitrum', status: 'success' },
  { time: '17:00', type: 'rate', description: 'Cotação USDT atualizada: R$ 5,92', status: 'info' },
]

const iconMap = {
  pix: CreditCard,
  liquidation: RefreshCw,
  sent: ArrowUpRight,
  completed: CheckCircle2,
  rate: RefreshCw,
}

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividade recente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-0">
          {events.map((event, idx) => {
            const Icon = iconMap[event.type]
            return (
              <div key={idx} className="flex gap-3 py-3 border-b border-border/50 last:border-0">
                <div className="mt-0.5 shrink-0">
                  <Icon className="h-4 w-4 text-text-tertiary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary">{event.description}</p>
                  <p className="text-xs text-text-tertiary mt-0.5 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {event.time}
                  </p>
                </div>
                <div className="shrink-0">
                  {event.status === 'success' && <CheckCircle2 className="h-4 w-4 text-green-accent" />}
                  {event.status === 'pending' && <Clock className="h-4 w-4 text-yellow-500" />}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
