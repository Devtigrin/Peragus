import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, ArrowUpDown, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/features/StatusBadge'
import { useOperations } from '@/store/useOperations'
import { formatCurrency, formatDate, formatAddress } from '@/lib/utils'
import { NETWORKS } from '@/constants'

export function Liquidations() {
  const { operations } = useOperations()
  const [search, setSearch] = useState('')
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')

  const filtered = operations
    .filter(
      (op) =>
        op.id.toLowerCase().includes(search.toLowerCase()) ||
        op.walletAddress.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const diff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      return sortOrder === 'desc' ? diff : -diff
    })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Liquidações</h1>
        <p className="text-sm text-text-tertiary mt-1">Acompanhe suas compras de USDT com Pix.</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
          <Input
            placeholder="Buscar por ID ou carteira..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm" onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}>
          <ArrowUpDown className="h-4 w-4" />
          {sortOrder === 'desc' ? 'Mais recentes' : 'Mais antigas'}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-elevated">
                  <th className="text-left py-3 px-4 font-medium text-text-tertiary text-xs uppercase tracking-wider">ID</th>
                  <th className="text-left py-3 px-4 font-medium text-text-tertiary text-xs uppercase tracking-wider">Entrada</th>
                  <th className="text-left py-3 px-4 font-medium text-text-tertiary text-xs uppercase tracking-wider">Saída</th>
                  <th className="text-left py-3 px-4 font-medium text-text-tertiary text-xs uppercase tracking-wider hidden sm:table-cell">Rede</th>
                  <th className="text-left py-3 px-4 font-medium text-text-tertiary text-xs uppercase tracking-wider hidden md:table-cell">Carteira</th>
                  <th className="text-left py-3 px-4 font-medium text-text-tertiary text-xs uppercase tracking-wider">Valor</th>
                  <th className="text-left py-3 px-4 font-medium text-text-tertiary text-xs uppercase tracking-wider hidden lg:table-cell">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-text-tertiary text-xs uppercase tracking-wider hidden lg:table-cell">Horário</th>
                  <th className="text-right py-3 px-4 font-medium text-text-tertiary text-xs uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-sm text-text-disabled">
                      Nenhuma liquidação encontrada
                    </td>
                  </tr>
                ) : (
                  filtered.map((op) => {
                    const networkInfo = NETWORKS.find((n) => n.id === op.network)
                    return (
                      <tr key={op.id} className="border-b border-border/50 hover:bg-surface-hover transition-colors duration-150">
                        <td className="py-3 px-4 text-xs font-mono text-text-tertiary">{op.id}</td>
                        <td className="py-3 px-4 text-xs text-text-secondary">BRL via Pix</td>
                        <td className="py-3 px-4 text-xs text-text-secondary">USDT</td>
                        <td className="py-3 px-4 text-xs text-text-tertiary hidden sm:table-cell">
                          <span className="font-medium">{networkInfo?.shortName || op.network}</span>
                        </td>
                        <td className="py-3 px-4 text-xs font-mono text-text-tertiary hidden md:table-cell">
                          {formatAddress(op.walletAddress)}
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-text-primary">{formatCurrency(op.brlAmount)}</td>
                        <td className="py-3 px-4 hidden lg:table-cell">
                          <StatusBadge status={op.status} />
                        </td>
                        <td className="py-3 px-4 text-xs text-text-tertiary hidden lg:table-cell">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(op.createdAt)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            to={`/operation/${op.id}`}
                            className="text-xs text-green-accent hover:text-green-accent-hover font-medium transition-colors"
                          >
                            Detalhes
                          </Link>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
