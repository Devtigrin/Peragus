import { useCallback, useMemo, useState } from 'react'
import {
  useAppKit,
  useAppKitAccount,
  useAppKitNetwork,
  useAppKitProvider,
  useAppKitState,
  useDisconnect,
  useWalletInfo,
  type Provider,
} from '@reown/appkit/react'
import { useAppKitWallet } from '@reown/appkit-wallet-button/react'
import { getSupportedNetwork, type DirectWalletId, type SupportedChainId } from '@/lib/web3'

function getWalletErrorMessage(error: unknown) {
  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    if (message.includes('reject') || message.includes('denied') || message.includes('cancel')) {
      return 'Conexão cancelada na carteira.'
    }
    return error.message
  }

  return 'Não foi possível conectar a carteira. Tente novamente.'
}

export function useWallet() {
  const { open } = useAppKit()
  const { address, isConnected, status, embeddedWalletInfo } = useAppKitAccount({ namespace: 'eip155' })
  const { chainId, caipNetwork, switchNetwork: switchAppKitNetwork } = useAppKitNetwork()
  const { walletProvider } = useAppKitProvider<Provider>('eip155')
  const { walletInfo } = useWalletInfo()
  const { disconnect: disconnectAppKit } = useDisconnect()
  const appKitState = useAppKitState()
  const [localLoading, setLocalLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const walletButton = useAppKitWallet({
    namespace: 'eip155',
    onError: (walletError) => setError(getWalletErrorMessage(walletError)),
  })

  const normalizedChainId = useMemo(() => {
    if (typeof chainId === 'number') return chainId
    if (typeof chainId === 'string') {
      const parsed = Number(chainId)
      return Number.isFinite(parsed) ? parsed : undefined
    }
    return undefined
  }, [chainId])

  const connect = useCallback(async (walletId?: DirectWalletId) => {
    setError(null)
    setLocalLoading(true)

    try {
      if (walletId) {
        const connectWallet = walletButton.connect
        await connectWallet(walletId as Parameters<typeof connectWallet>[0])
      } else {
        await open({ view: 'Connect', namespace: 'eip155' })
      }
    } catch (walletError) {
      setError(getWalletErrorMessage(walletError))
    } finally {
      setLocalLoading(false)
    }
  }, [open, walletButton])

  const disconnect = useCallback(async () => {
    setError(null)
    setLocalLoading(true)

    try {
      await disconnectAppKit({ namespace: 'eip155' })
    } catch (walletError) {
      setError(getWalletErrorMessage(walletError))
    } finally {
      setLocalLoading(false)
    }
  }, [disconnectAppKit])

  const switchNetwork = useCallback(async (targetChainId: SupportedChainId): Promise<boolean> => {
    const targetNetwork = getSupportedNetwork(targetChainId)

    if (!targetNetwork) {
      setError('Rede não suportada pela Peragus.')
      return false
    }

    setError(null)
    setLocalLoading(true)

    try {
      await switchAppKitNetwork(targetNetwork)
      return true
    } catch (walletError) {
      setError(getWalletErrorMessage(walletError))
      return false
    } finally {
      setLocalLoading(false)
    }
  }, [switchAppKitNetwork])

  return {
    address,
    connected: isConnected,
    provider: walletProvider,
    chainId: normalizedChainId,
    network: caipNetwork,
    walletName: walletInfo?.name ?? embeddedWalletInfo?.authProvider ?? null,
    walletAvatar: walletInfo?.icon ?? null,
    connecting: localLoading || walletButton.isPending || appKitState.loading || status === 'connecting' || status === 'reconnecting',
    error,
    connect,
    disconnect,
    switchNetwork,
  }
}
