import { useState } from 'react'
import { Plus, Trash2, Star, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatAddress } from '@/lib/utils'

interface WalletItem {
  id: string
  name: string
  type: string
  address: string
  network: string
  status: 'default' | 'active'
}

const MOCK_WALLETS: WalletItem[] = [
  { id: '1', name: 'MetaMask', type: 'Conectada', address: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18', network: 'Ethereum', status: 'default' },
  { id: '2', name: 'Rabby', type: 'Conectada', address: '0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db', network: 'Polygon', status: 'active' },
  { id: '3', name: 'Carteira manual', type: 'Manual', address: '0x8Ba1f109551bD432803012645Ac136ddd64DBA72', network: 'Arbitrum', status: 'active' },
]

export function Wallets() {
  const [wallets, setWallets] = useState(MOCK_WALLETS)

  const setDefault = (id: string) => {
    setWallets((prev) => prev.map((w) => ({ ...w, status: w.id === id ? 'default' : 'active' as const })))
  }

  const removeWallet = (id: string) => {
    setWallets((prev) => prev.filter((w) => w.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Carteiras</h1>
          <p className="text-sm text-text-tertiary mt-1">Gerencie carteiras externas usadas para receber USDT.</p>
        </div>
        <Button>
          <Plus className="h-4 w-4" />
          Adicionar carteira
        </Button>
      </div>

      {wallets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Wallet className="h-10 w-10 text-text-disabled mb-3" />
            <p className="text-sm text-text-disabled">Nenhuma carteira cadastrada</p>
            <p className="text-xs text-text-disabled/70 mt-1">Adicione uma carteira para receber USDT.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {wallets.map((w) => (
            <Card key={w.id} className="hover:border-border/80 transition-colors duration-150">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-subtle/60">
                      <Wallet className="h-4 w-4 text-green-accent" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-text-primary">{w.name}</span>
                        {w.status === 'default' ? (
                          <Badge variant="success">Padrão</Badge>
                        ) : (
                          <Badge variant="info">Ativa</Badge>
                        )}
                      </div>
                      <p className="text-xs font-mono text-text-tertiary mt-1 break-all">{formatAddress(w.address)}</p>
                      <p className="text-xs text-text-tertiary mt-0.5">{w.network} — {w.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {w.status !== 'default' && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDefault(w.id)} title="Definir como padrão">
                        <Star className="h-3.5 w-3.5 text-text-tertiary" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeWallet(w.id)} title="Remover" aria-label="Remover carteira">
                      <Trash2 className="h-3.5 w-3.5 text-text-tertiary hover:text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
