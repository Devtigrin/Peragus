import { bsc, mainnet, polygon, type AppKitNetwork } from '@reown/appkit/networks'

export const supportedNetworks = [mainnet, polygon, bsc] as [AppKitNetwork, ...AppKitNetwork[]]

export type SupportedChainId = 1 | 137 | 56

export const supportedChainIds = supportedNetworks.map((network) => network.id as SupportedChainId)

export const operationNetworkChainIds = {
  ethereum: 1,
  polygon: 137,
  bnb: 56,
} as const

export function getSupportedNetwork(chainId: number) {
  return supportedNetworks.find((network) => network.id === chainId)
}

export function getOperationNetworkByChainId(chainId: number) {
  const entry = Object.entries(operationNetworkChainIds).find(([, id]) => id === chainId)
  return entry?.[0]
}
