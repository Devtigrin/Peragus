import { ethers } from 'npm:ethers@6.13.5'
import { SettlementError, type TreasuryChain, type TransferReceipt, type PendingTransfer } from './treasury-transfer.ts'

export interface EthersTreasurySettings {
  rpcUrl: string
  privateKey: string
  treasuryAddress: string
  contractAddress: string
}

const ERC20_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
]

function toTransferReceipt(raw: { hash: string; status: number | bigint | null; blockNumber: number | bigint | null; gasUsed: bigint | null }): TransferReceipt {
  return {
    hash: raw.hash,
    status: Number(raw.status),
    blockNumber: Number(raw.blockNumber),
    gasUsed: BigInt(raw.gasUsed ?? 0n),
  }
}

export function createEthersTreasuryChain(settings: EthersTreasurySettings): TreasuryChain {
  const provider = new ethers.JsonRpcProvider(settings.rpcUrl)
  const wallet = new ethers.Wallet(settings.privateKey, provider)
  const token = new ethers.Contract(settings.contractAddress, ERC20_ABI, wallet)

  return {
    signerAddress: wallet.address,
    contractAddress: settings.contractAddress,
    getChainId: async () => Number((await provider.getNetwork()).chainId),
    parseUnits: (amount, decimals) => ethers.parseUnits(amount, decimals),
    getDecimals: async () => Number(await token.decimals()),
    getTokenBalance: async (address) => BigInt(await token.balanceOf(address)),
    estimateTransferGas: async (destination, amount) => token.transfer.estimateGas(destination, amount),
    getFeePerGas: async () => {
      const fees = await provider.getFeeData()
      const fee = fees.maxFeePerGas ?? fees.gasPrice
      if (fee === null) throw new SettlementError('RPC_UNAVAILABLE', 503)
      return fee
    },
    getNativeBalance: (address) => provider.getBalance(address),
    transfer: async (destination, amount): Promise<PendingTransfer> => {
      const tx = await token.transfer(destination, amount)
      return {
        hash: tx.hash,
        wait: async (): Promise<TransferReceipt | null> => {
          const receipt = await tx.wait()
          if (!receipt) return null
          return toTransferReceipt(receipt as unknown as { hash: string; status: number; blockNumber: number; gasUsed: bigint })
        },
      }
    },
    getReceipt: async (hash): Promise<TransferReceipt | null> => {
      const receipt = await provider.getTransactionReceipt(hash)
      if (!receipt) return null
      return toTransferReceipt(receipt as unknown as { hash: string; status: number; blockNumber: number; gasUsed: bigint })
    },
  }
}
