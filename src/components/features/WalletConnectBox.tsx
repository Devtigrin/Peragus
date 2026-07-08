import { useState, useEffect } from 'react'
import { AlertTriangle, Loader2, LogOut, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DEMO_NOTICE } from '@/constants/demo'
import { useWallet } from '@/hooks/useWallet'
import { walletOptions, type DirectWalletId, type WalletOption } from '@/lib/web3'
import { formatAddress, isEVMAddress } from '@/lib/utils'
import type { NetworkType } from '@/types'

interface WalletConnectBoxProps {
  onConnect: (address: string) => void
  selectedAddress: string
  currentNetwork: NetworkType
}

export function WalletConnectBox({ onConnect, selectedAddress, currentNetwork }: WalletConnectBoxProps) {
  const [manualAddress, setManualAddress] = useState('')
  const [showManual, setShowManual] = useState(false)
  const [showSelector, setShowSelector] = useState(false)
  const [pendingWallet, setPendingWallet] = useState<WalletOption['id'] | null>(null)

  const { address, connected, walletAvatar, walletName, connecting, error, connect, disconnect } = useWallet()

  const isWalletActive = connected && !!address && !showSelector
  const networkLabel = currentNetwork.charAt(0).toUpperCase() + currentNetwork.slice(1)

  useEffect(() => {
    if (connected && address && address !== selectedAddress) {
      onConnect(address)
    }
  }, [connected, address, selectedAddress, onConnect])

  const handleWalletClick = async (wallet: WalletOption) => {
    setPendingWallet(wallet.id)
    try {
      await connect(wallet.direct ? wallet.id as DirectWalletId : undefined)
      setShowSelector(false)
    } finally {
      setPendingWallet(null)
    }
  }

  const handleManualSubmit = () => {
    if (isEVMAddress(manualAddress)) {
      onConnect(manualAddress.trim())
      setShowManual(false)
    }
  }

  const handleDisconnect = async () => {
    await disconnect()
    onConnect('')
    setShowSelector(true)
  }

  if (isWalletActive) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg bg-navy-subtle/60 border border-navy-border p-4 animate-scale-in">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              {walletAvatar ? (
                <img src={walletAvatar} alt="" className="mt-0.5 h-8 w-8 shrink-0 rounded-full" />
              ) : (
                <Wallet className="h-5 w-5 text-green-accent mt-0.5 shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium text-text-primary">
                  {walletName ?? 'Carteira conectada'}
                </p>
                <p className="mt-1 text-xs text-text-secondary font-mono">
                  {formatAddress(address)}
                </p>
                <p className="mt-2 text-xs text-green-500 font-medium">
                  Conectada
                </p>
                <p className="mt-1 text-xs text-text-tertiary">
                  Rede selecionada: {networkLabel}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={handleDisconnect}
              aria-label="Desconectar carteira"
              title="Desconectar carteira"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Button
          className="w-full"
          variant="outline"
          onClick={() => setShowSelector(true)}
        >
          Trocar carteira
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-yellow-200/20 bg-yellow-50/30 p-3 text-xs text-yellow-500">
        {DEMO_NOTICE}
      </div>

      {showSelector && connected && !!address && (
        <Button variant="ghost" size="sm" onClick={() => setShowSelector(false)}>
          Voltar para carteira atual
        </Button>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {walletOptions.map((wallet) => (
          <button
            key={wallet.id}
            onClick={() => handleWalletClick(wallet)}
            disabled={connecting || pendingWallet === wallet.id}
            className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card p-4 card-lift hover:border-green-border hover:bg-green-subtle press-effect disabled:pointer-events-none disabled:opacity-50"
          >
            <span className="flex min-h-7 items-center rounded-md border border-navy-border bg-navy-subtle px-2 py-1 text-xs font-bold text-green-accent">
              {pendingWallet === wallet.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : wallet.icon}
            </span>
            <span className="text-sm font-medium text-text-secondary">{wallet.name}</span>
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200/30 bg-red-50/30 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

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
              disabled={!manualAddress || !isEVMAddress(manualAddress)}
              onClick={handleManualSubmit}
            >
              Confirmar endereço
            </Button>
          </div>
        )}
      </div>

      {selectedAddress && !connected && (
        <div className="rounded-lg bg-navy-subtle/60 border border-navy-border p-4 animate-scale-in">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-navy-accent mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-navy-500">Endereço informado</p>
              <p className="mt-1 text-xs text-text-secondary font-mono">
                {formatAddress(selectedAddress)}
              </p>
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
