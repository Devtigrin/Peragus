import type { Operation } from '@/types'
import { generateId } from '@/lib/utils'

export const MOCK_OPERATIONS: Operation[] = [
  {
    id: generateId(),
    createdAt: '2026-06-13T14:30:00Z',
    brlAmount: 592.00,
    usdtAmount: 100.00,
    exchangeRate: 5.92,
    network: 'polygon',
    walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
    status: 'completed',
    transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    estimatedFee: 0.10,
    totalPaid: 592.10,
  },
  {
    id: generateId(),
    createdAt: '2026-06-12T10:15:00Z',
    brlAmount: 1184.00,
    usdtAmount: 200.00,
    exchangeRate: 5.92,
    network: 'ethereum',
    walletAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    status: 'processing',
    transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    estimatedFee: 2.50,
    totalPaid: 1186.50,
  },
  {
    id: generateId(),
    createdAt: '2026-06-11T16:45:00Z',
    brlAmount: 2960.00,
    usdtAmount: 500.00,
    exchangeRate: 5.92,
    network: 'arbitrum',
    walletAddress: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
    status: 'completed',
    transactionHash: '0x1111111111222222222233333333334444444444555555555566666666667777',
    estimatedFee: 0.15,
    totalPaid: 2960.15,
  },
  {
    id: generateId(),
    createdAt: '2026-06-10T09:20:00Z',
    brlAmount: 5920.00,
    usdtAmount: 1000.00,
    exchangeRate: 5.92,
    network: 'optimism',
    walletAddress: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    status: 'analysis',
    estimatedFee: 0.12,
    totalPaid: 5920.12,
  },
]

export const MOCK_WALLET_ADDRESSES: Record<string, string> = {
  metamask: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18',
  trust: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1',
  walletconnect: '0x8Ba1f109551bD432803012645Ac136ddd64DBA72',
  rabby: '0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db',
  coinbase: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
}
