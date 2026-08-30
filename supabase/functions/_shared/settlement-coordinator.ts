import {
  broadcastTreasuryTransfer,
  errorCode,
  SettlementError,
  type TreasuryChain,
  type TreasuryConfig,
  type TransferReceipt,
  type PendingTransfer,
} from './treasury-transfer.ts'

export interface SettlementOperation {
  id: string
  status: string
  amount: string
  destination: string
  txHash: string | null
}

export interface BroadcastRecord {
  txHash: string
  senderWallet: string
  contractAddress: string
}

export interface SettlementStore {
  claim(operationId: string): Promise<SettlementOperation | null>
  find(operationId: string): Promise<SettlementOperation | null>
  persistBroadcast(operationId: string, record: BroadcastRecord): Promise<void>
  persistReceipt(operationId: string, receipt: TransferReceipt): Promise<void>
  failBeforeBroadcast(operationId: string, code: string): Promise<void>
}

export type SettlementResult =
  | { status: 'confirmed' | 'failed'; txHash: string | null; idempotent: boolean }
  | { status: 'settling'; txHash: string | null; code: 'SETTLEMENT_PENDING'; idempotent: boolean }

export async function coordinateSettlement(
  operationId: string,
  store: SettlementStore,
  chain: TreasuryChain,
  config: TreasuryConfig,
): Promise<SettlementResult> {
  const claimed = await store.claim(operationId)
  if (!claimed) {
    const existing = await store.find(operationId)
    if (!existing) throw new SettlementError('INVALID_SETTLEMENT_INPUT', 404)
    if (existing.status === 'confirmed' || existing.status === 'failed') {
      return {
        status: existing.status,
        txHash: existing.txHash,
        idempotent: true,
      }
    }
    if (existing.status === 'settling' && !existing.txHash) {
      throw new SettlementError('SETTLEMENT_RECONCILIATION_REQUIRED', 409)
    }
    if (existing.status === 'settling' && existing.txHash) {
      return reconcileExisting(existing, store, chain)
    }
    throw new SettlementError('INVALID_SETTLEMENT_INPUT', 409)
  }

  let tx: PendingTransfer
  try {
    tx = await broadcastTreasuryTransfer(chain, config, {
      destination: claimed.destination,
      amount: claimed.amount,
    })
  } catch (err) {
    await store.failBeforeBroadcast(operationId, errorCode(err))
    throw err
  }

  try {
    await store.persistBroadcast(operationId, {
      txHash: tx.hash,
      senderWallet: chain.signerAddress,
      contractAddress: chain.contractAddress,
    })
  } catch {
    throw new SettlementError('TX_HASH_PERSISTENCE_FAILED', 500)
  }

  let receipt: TransferReceipt | null
  try {
    receipt = await tx.wait()
  } catch {
    return { status: 'settling', txHash: tx.hash, code: 'SETTLEMENT_PENDING', idempotent: false }
  }
  if (!receipt) {
    return { status: 'settling', txHash: tx.hash, code: 'SETTLEMENT_PENDING', idempotent: false }
  }
  await store.persistReceipt(operationId, receipt)
  return {
    status: receipt.status === 1 ? 'confirmed' : 'failed',
    txHash: receipt.hash,
    idempotent: false,
  }
}

async function reconcileExisting(
  existing: SettlementOperation,
  store: SettlementStore,
  chain: TreasuryChain,
): Promise<SettlementResult> {
  let receipt: TransferReceipt | null
  try {
    receipt = await chain.getReceipt(existing.txHash!)
  } catch {
    return { status: 'settling', txHash: existing.txHash, code: 'SETTLEMENT_PENDING', idempotent: true }
  }
  if (!receipt) {
    return { status: 'settling', txHash: existing.txHash, code: 'SETTLEMENT_PENDING', idempotent: true }
  }
  await store.persistReceipt(existing.id, receipt)
  return {
    status: receipt.status === 1 ? 'confirmed' : 'failed',
    txHash: receipt.hash,
    idempotent: true,
  }
}
