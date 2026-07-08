export type DirectWalletId = 'metamask' | 'trust' | 'coinbase' | 'rainbow' | 'walletConnect'

export interface WalletOption {
  id: DirectWalletId | 'rabby'
  name: string
  icon: string
  direct: boolean
}

export const walletOptions: WalletOption[] = [
  { id: 'metamask', name: 'MetaMask', icon: 'MM', direct: true },
  { id: 'trust', name: 'Trust Wallet', icon: 'TW', direct: true },
  { id: 'coinbase', name: 'Coinbase Wallet', icon: 'CB', direct: true },
  { id: 'rainbow', name: 'Rainbow', icon: 'RW', direct: true },
  { id: 'rabby', name: 'Rabby', icon: 'RB', direct: false },
  { id: 'walletConnect', name: 'WalletConnect', icon: 'WC', direct: true },
]
