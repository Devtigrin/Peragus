import { QueryClient } from '@tanstack/react-query'
import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { supportedNetworks } from './networks'

const localProjectId = 'b56e18d47c72ab683b10814fe9495694'

export const reownProjectId = import.meta.env.VITE_REOWN_PROJECT_ID || localProjectId

export const queryClient = new QueryClient()

export const wagmiAdapter = new WagmiAdapter({
  networks: supportedNetworks,
  projectId: reownProjectId,
  ssr: false,
})

export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  networks: supportedNetworks,
  projectId: reownProjectId,
  metadata: {
    name: 'Peragus',
    description: 'Infraestrutura de liquidação Peragus',
    url: typeof window !== 'undefined' ? window.location.origin : 'https://peragus.com.br',
    icons: ['https://peragus.com.br/favicon.svg'],
  },
  features: {
    analytics: false,
    email: true,
    socials: ['google', 'apple', 'github', 'discord', 'x', 'facebook'],
  },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#14B8A6',
    '--w3m-color-mix': '#0A1F44',
    '--w3m-color-mix-strength': 30,
  },
})
