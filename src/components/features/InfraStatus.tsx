import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2 } from 'lucide-react'

const infraItems = [
  { name: 'Pix', status: 'Operacional', avgTime: 'Instantâneo', lastUpdate: '1 min atrás' },
  { name: 'Ethereum', status: 'Operacional', avgTime: '~5 min', lastUpdate: '2 min atrás' },
  { name: 'Polygon', status: 'Operacional', avgTime: '~2 min', lastUpdate: '1 min atrás' },
  { name: 'Arbitrum', status: 'Operacional', avgTime: '~3 min', lastUpdate: '3 min atrás' },
  { name: 'Optimism', status: 'Operacional', avgTime: '~2 min', lastUpdate: '2 min atrás' },
]

export function InfraStatus() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Status da Infraestrutura</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {infraItems.map((item) => (
            <div key={item.name} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-green-accent" />
                <span className="text-sm font-medium text-text-primary">{item.name}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-text-tertiary">
                <span className="text-green-accent font-medium">{item.status}</span>
                <span className="hidden sm:inline">{item.avgTime}</span>
                <span className="hidden md:inline">{item.lastUpdate}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}