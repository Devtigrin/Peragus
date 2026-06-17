import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { NETWORKS } from '@/constants'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2 } from 'lucide-react'

const NETWORK_META: Record<string, { avgTime: string; lastUpdate: string; availability: string }> = {
  ethereum: { avgTime: '~5 min', lastUpdate: '2 min atrás', availability: '99,9%' },
  polygon: { avgTime: '~2 min', lastUpdate: '1 min atrás', availability: '99,8%' },
  arbitrum: { avgTime: '~3 min', lastUpdate: '3 min atrás', availability: '99,7%' },
  optimism: { avgTime: '~2 min', lastUpdate: '2 min atrás', availability: '99,6%' },
}

export function Networks() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Redes</h1>
        <p className="text-sm text-text-tertiary mt-1">Acompanhe disponibilidade, custos e tempo médio de envio dos USDT.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {NETWORKS.map((network) => {
          const meta = NETWORK_META[network.id]
          return (
            <Card key={network.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base">{network.name}</CardTitle>
                <Badge variant="success">{network.shortName}</Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-accent" />
                    <span className="text-sm text-green-accent font-medium">Operacional</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-text-tertiary">Tempo médio</p>
                      <p className="text-text-primary font-medium">{meta.avgTime}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-tertiary">Taxa estimada</p>
                      <p className="text-text-primary font-medium">{network.fee.toFixed(2)} USDT</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-tertiary">Disponibilidade</p>
                      <p className="text-text-primary font-medium">{meta.availability}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-tertiary">Última atualização</p>
                      <p className="text-text-primary font-medium">{meta.lastUpdate}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
