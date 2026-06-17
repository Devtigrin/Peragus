import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/features/StatusBadge'
import { OperationTimeline } from '@/components/features/OperationTimeline'
import { TransactionHash } from '@/components/features/TransactionHash'
import { SecurityAlert } from '@/components/features/SecurityAlert'
import { useOperations } from '@/store/useOperations'
import { formatCurrency, formatDate } from '@/lib/utils'
import { NETWORKS } from '@/constants'

export function OperationDetail() {
  const { id } = useParams()
  const { operations } = useOperations()
  const operation = operations.find((op) => op.id === id)

  if (!operation) {
    return (
      <div className="text-center py-16 animate-fade-in">
        <p className="text-text-tertiary">Operação não encontrada</p>
        <Link to="/history">
          <Button variant="outline" className="mt-4">
            Voltar ao histórico
          </Button>
        </Link>
      </div>
    )
  }

  const networkInfo = NETWORKS.find((n) => n.id === operation.network)

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <Link
          to="/history"
          className="inline-flex items-center gap-1 text-sm text-text-tertiary hover:text-text-secondary mb-4 follow-through-fast"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao histórico
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Detalhes da operação</h1>
            <p className="text-sm text-text-tertiary mt-1 font-mono">{operation.id}</p>
          </div>
          <StatusBadge status={operation.status} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-text-tertiary">Data</p>
                <p className="text-sm font-medium text-text-primary">{formatDate(operation.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-text-tertiary">Cotação USDT</p>
                <p className="text-sm font-medium text-text-primary">{formatCurrency(operation.exchangeRate)}</p>
              </div>
              <div>
                <p className="text-xs text-text-tertiary">Valor pago (BRL)</p>
                <p className="text-sm font-medium text-text-primary">{formatCurrency(operation.brlAmount)}</p>
              </div>
              <div>
                <p className="text-xs text-text-tertiary">Valor recebido (USDT)</p>
                <p className="text-sm font-medium text-text-primary">{operation.usdtAmount} USDT</p>
              </div>
              <div>
                <p className="text-xs text-text-tertiary">Taxa da rede</p>
                <p className="text-sm font-medium text-text-primary">{formatCurrency(operation.estimatedFee)}</p>
              </div>
              <div>
                <p className="text-xs text-text-tertiary">Total pago</p>
                <p className="text-sm font-medium text-text-primary">{formatCurrency(operation.totalPaid)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Destino</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-text-tertiary">Rede</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-medium text-text-primary">{networkInfo?.name || operation.network}</span>
                <span className="text-xs text-text-tertiary">({networkInfo?.shortName})</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-text-tertiary">Carteira destino</p>
              <p className="text-sm font-mono text-text-secondary break-all mt-1">{operation.walletAddress}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {operation.transactionHash && (
        <Card>
          <CardHeader>
            <CardTitle>Transação on-chain</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionHash hash={operation.transactionHash} network={operation.network} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <OperationTimeline currentStatus={operation.status} />
        </CardContent>
      </Card>

      <SecurityAlert
        type="warning"
        title="Verifique a transação no explorador"
        description="Confirme que o hash da transação corresponde ao valor e carteira informados. Em caso de dúvidas, entre em contato com o suporte."
      />
    </div>
  )
}
