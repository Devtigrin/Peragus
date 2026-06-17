import type { Operation } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from './StatusBadge'
import { formatCurrency, formatDate, formatAddress } from '@/lib/utils'
import { NETWORKS } from '@/constants'

interface OperationCardProps {
  operation: Operation
  onClick?: () => void
}

export function OperationCard({ operation, onClick }: OperationCardProps) {
  const networkInfo = NETWORKS.find((n) => n.id === operation.network)

  return (
    <Card
      className="cursor-pointer card-lift"
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-sm font-medium text-text-primary">
              {formatCurrency(operation.usdtAmount, 'USD')} USDT
            </p>
            <p className="text-xs text-text-tertiary mt-0.5">
              {formatCurrency(operation.brlAmount)}
            </p>
          </div>
          <StatusBadge status={operation.status} />
        </div>

        <div className="flex items-center justify-between text-xs text-text-tertiary">
          <div className="flex items-center gap-1">
            <span className="font-medium text-text-secondary">{networkInfo?.shortName || operation.network}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>{formatAddress(operation.walletAddress)}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>{formatDate(operation.createdAt)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
