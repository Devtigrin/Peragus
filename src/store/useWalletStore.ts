import { create } from 'zustand'
import { type SupportedChainId, getSupportedNetwork } from '@/lib/web3'

interface WalletState {
  manualAddress: string
  isManualMode: boolean
  isSwitchingNetwork: boolean
  error: string | null
  isWalletSelectorOpen: boolean

  setManualAddress: (address: string) => void
  setSwitchingNetwork: (value: boolean) => void
  setError: (error: string | null) => void
  setWalletSelectorOpen: (open: boolean) => void
  switchToNetwork: (targetChainId: SupportedChainId, walletProvider?: unknown, currentChainId?: number | null) => Promise<boolean>
  reset: () => void
}

const initialState = {
  manualAddress: '',
  isManualMode: false,
  isSwitchingNetwork: false,
  error: null,
  isWalletSelectorOpen: false,
}

export const useWalletStore = create<WalletState>((set) => ({
  ...initialState,

  setManualAddress: (address) =>
    set({ manualAddress: address, isManualMode: true }),

  setSwitchingNetwork: (value) => set({ isSwitchingNetwork: value }),

  setError: (error) => set({ error }),

  setWalletSelectorOpen: (open) => set({ isWalletSelectorOpen: open }),

  switchToNetwork: async (targetChainId, walletProvider, currentChainId) => {
    const targetNetwork = getSupportedNetwork(targetChainId)
    if (!targetNetwork) {
      set({ error: 'Rede nao suportada pela Peragus.' })
      return false
    }

    set({ isSwitchingNetwork: true, error: null })

    try {
      const provider = walletProvider as {
        request?: (args: { method: string; params?: unknown[] }) => Promise<unknown>
      } | null

      if (!provider?.request) {
        set({ isSwitchingNetwork: false })
        return false
      }

      if (currentChainId === targetChainId) {
        set({ isSwitchingNetwork: false })
        return true
      }

      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${targetChainId.toString(16)}` }],
        })
        set({ isSwitchingNetwork: false })
        return true
      } catch (switchError: unknown) {
        const err = switchError as { code?: number; message?: string }
        if (err.code === 4902) {
          try {
            await provider.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: `0x${targetChainId.toString(16)}`,
                  chainName: targetNetwork.name,
                  nativeCurrency: {
                    name: 'Ether',
                    symbol: 'ETH',
                    decimals: 18,
                  },
                  rpcUrls: [],
                  blockExplorerUrls: [],
                },
              ],
            })
            set({ isSwitchingNetwork: false })
            return true
          } catch {
            set({
              error: 'Nao foi possivel adicionar a rede na carteira.',
              isSwitchingNetwork: false,
            })
            return false
          }
        }
        if (err.code === 4001 || err.message?.includes('reject') || err.message?.includes('denied')) {
          set({ error: 'Troca de rede cancelada na carteira.', isSwitchingNetwork: false })
          return false
        }
        set({ error: 'Erro ao trocar rede na carteira.', isSwitchingNetwork: false })
        return false
      }
    } catch {
      set({ error: 'Erro inesperado ao trocar rede.', isSwitchingNetwork: false })
      return false
    }
  },

  reset: () => set({ ...initialState }),
}))
