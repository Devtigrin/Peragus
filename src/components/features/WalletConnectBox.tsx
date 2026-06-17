import { useState } from 'react'
import { AlertTriangle, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MOCK_WALLET_ADDRESSES } from '@/mock/data'
import { DEMO_NOTICE } from '@/constants/demo'
import type { WalletType } from '@/types'

interface WalletConnectBoxProps {
  onConnect: (address: string) => void
  selectedAddress: string
}

const wallets: { id: WalletType; name: string; icon: string }[] = [
  { id: 'metamask', name: 'MetaMask', icon: 'MM' },
  { id: 'trust', name: 'Trust Wallet', icon: 'TW' },
  { id: 'rabby', name: 'Rabby', icon: 'RB' },
  { id: 'coinbase', name: 'Coinbase Wallet', icon: 'CB' },
  { id: 'walletconnect', name: 'WalletConnect', icon: 'WC' },
]

const isEvmAddress = (address: string) => /^0x[a-fA-F0-9]{40}$/.test(address.trim())

export function WalletConnectBox({ onConnect, selectedAddress }: WalletConnectBoxProps) {
  const [manualAddress, setManualAddress] = useState('')
  const [showManual, setShowManual] = useState(false)

  const handleWalletClick = (id: WalletType) => {
    const address = MOCK_WALLET_ADDRESSES[id]
    onConnect(address)
  }

  const handleManualSubmit = () => {
    if (isEvmAddress(manualAddress)) {
      onConnect(manualAddress.trim())
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-yellow-200/20 bg-yellow-50/30 p-3 text-xs text-yellow-500">
        {DEMO_NOTICE}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {wallets.map((wallet) => (
          <button
            key={wallet.id}
            onClick={() => handleWalletClick(wallet.id)}
            className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card p-4 card-lift hover:border-green-border hover:bg-green-subtle press-effect"
          >
            <span className="rounded-md border border-navy-border bg-navy-subtle px-2 py-1 text-xs font-bold text-green-accent">{wallet.icon}</span>
            <span className="text-sm font-medium text-text-secondary">{wallet.name}</span>
          </button>
        ))}
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-card px-2 text-text-tertiary">ou</span>
        </div>
      </div>

      <div>
        {!showManual ? (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowManual(true)}
          >
            <Wallet className="h-4 w-4" />
            Inserir endereço manualmente
          </Button>
        ) : (
          <div className="space-y-3 animate-slide-down">
            <Input
              placeholder="0x... ou endereço da carteira"
              value={manualAddress}
              onChange={(e) => setManualAddress(e.target.value)}
            />
            <Button
              className="w-full"
              disabled={!isEvmAddress(manualAddress)}
              onClick={handleManualSubmit}
            >
              Confirmar endereço
            </Button>
          </div>
        )}
      </div>

      {selectedAddress && (
        <div className="rounded-lg bg-navy-subtle/60 border border-navy-border p-4 animate-scale-in">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-navy-accent mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-navy-500">Carteira conectada</p>
              <p className="mt-1 text-xs text-text-secondary break-all font-mono">{selectedAddress}</p>
              <p className="mt-2 text-xs text-red-500 font-medium">
                Confira o endereço. Transações on-chain não podem ser revertidas.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
