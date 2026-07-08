import { Loader2, LogOut, Wallet } from 'lucide-react'
import { Button, type ButtonProps } from '@/components/ui/button'
import { useWallet } from '@/hooks/useWallet'
import { cn, formatAddress } from '@/lib/utils'

interface WalletConnectButtonProps {
  className?: string
  size?: ButtonProps['size']
  variant?: ButtonProps['variant']
}

export function WalletConnectButton({ className, size = 'sm', variant }: WalletConnectButtonProps) {
  const { address, connected, walletAvatar, walletName, connecting, connect, disconnect } = useWallet()

  if (connected && address) {
    return (
      <Button
        variant={variant ?? 'outline'}
        size={size}
        className={cn('min-w-0', className)}
        onClick={disconnect}
        disabled={connecting}
        title="Desconectar carteira"
      >
        {walletAvatar ? (
          <img src={walletAvatar} alt="" className="h-4 w-4 rounded-full" />
        ) : (
          <Wallet className="h-4 w-4" />
        )}
        <span className="hidden max-w-24 truncate sm:inline">{walletName ?? 'Carteira'}</span>
        <span className="font-mono text-xs">{formatAddress(address)}</span>
        <LogOut className="h-3.5 w-3.5" />
      </Button>
    )
  }

  return (
    <Button
      size={size}
      variant={variant}
      className={className}
      onClick={() => connect()}
      disabled={connecting}
    >
      {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
      {connecting ? 'Conectando...' : 'Conectar carteira'}
    </Button>
  )
}
