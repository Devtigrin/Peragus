import type { NetworkInfo, OperationStatus } from '@/types'

export const NETWORKS: NetworkInfo[] = [
  {
    id: 'ethereum',
    name: 'Ethereum',
    shortName: 'ERC-20',
    icon: 'ETH',
    fee: 2.50,
    confirmationTime: '~5 min',
    explorerUrl: 'https://etherscan.io/tx/',
  },
  {
    id: 'polygon',
    name: 'Polygon',
    shortName: 'MATIC',
    icon: 'POL',
    fee: 0.10,
    confirmationTime: '~2 min',
    explorerUrl: 'https://polygonscan.com/tx/',
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum',
    shortName: 'ARB',
    icon: 'ARB',
    fee: 0.15,
    confirmationTime: '~3 min',
    explorerUrl: 'https://arbiscan.io/tx/',
  },
  {
    id: 'optimism',
    name: 'Optimism',
    shortName: 'OP',
    icon: 'OP',
    fee: 0.12,
    confirmationTime: '~2 min',
    explorerUrl: 'https://optimistic.etherscan.io/tx/',
  },
]

export const STATUS_LABELS: Record<OperationStatus, string> = {
  pending_payment: 'Aguardando pagamento',
  payment_confirmed: 'Pagamento confirmado',
  processing: 'Enviando USDT',
  sent: 'Transação enviada',
  completed: 'Concluída',
  failed: 'Falha',
  analysis: 'Em análise',
}

export const STATUS_COLORS: Record<OperationStatus, string> = {
  pending_payment: 'bg-yellow-100 text-yellow-800',
  payment_confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-indigo-100 text-indigo-800',
  sent: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  analysis: 'bg-orange-100 text-orange-800',
}

export const USDT_BID = 5.87
export const USDT_ASK = 5.92
export const ESTIMATED_TIME = '5 a 15 minutos'
export const SUPPORTED_NETWORK = 'Ethereum, Polygon, Arbitrum, Optimism'
