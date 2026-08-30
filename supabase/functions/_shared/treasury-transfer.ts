export type SettlementErrorCode =
  | 'INVALID_SETTLEMENT_INPUT'
  | 'WRONG_NETWORK'
  | 'TREASURY_ADDRESS_MISMATCH'
  | 'INVALID_SETTLEMENT_CONFIG'
  | 'INSUFFICIENT_TREASURY_BALANCE'
  | 'INSUFFICIENT_TREASURY_GAS'
  | 'RPC_UNAVAILABLE'
  | 'TX_HASH_PERSISTENCE_FAILED'
  | 'SETTLEMENT_RECONCILIATION_REQUIRED'

export class SettlementError extends Error {
  constructor(
    public readonly code: SettlementErrorCode,
    public readonly status: number,
  ) {
    super(code)
    this.name = 'SettlementError'
  }
}

export interface TransferReceipt {
  hash: string
  status: number
  blockNumber: number
  gasUsed: bigint
}

export interface PendingTransfer {
  hash: string
  wait(): Promise<TransferReceipt | null>
}

export interface TreasuryChain {
  readonly signerAddress: string
  readonly contractAddress: string
  getChainId(): Promise<number>
  parseUnits(amount: string, decimals: number): bigint
  getDecimals(): Promise<number>
  getTokenBalance(address: string): Promise<bigint>
  estimateTransferGas(destination: string, amount: bigint): Promise<bigint>
  getFeePerGas(): Promise<bigint>
  getNativeBalance(address: string): Promise<bigint>
  transfer(destination: string, amount: bigint): Promise<PendingTransfer>
  getReceipt(hash: string): Promise<TransferReceipt | null>
}

export interface TreasuryConfig {
  expectedChainId: number
  treasuryAddress: string
  expectedDecimals: number
  gasSafetyBps: bigint
}

export interface TreasuryTransferRequest {
  destination: string
  amount: string
}

export function errorCode(err: unknown): SettlementErrorCode {
  if (err instanceof SettlementError) return err.code
  return 'RPC_UNAVAILABLE'
}

const EVM_ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/
const BPS_DENOMINATOR = 10_000n

export async function broadcastTreasuryTransfer(
  chain: TreasuryChain,
  config: TreasuryConfig,
  request: TreasuryTransferRequest,
): Promise<PendingTransfer> {
  if (!EVM_ADDRESS_RE.test(request.destination)) {
    throw new SettlementError('INVALID_SETTLEMENT_INPUT', 400)
  }
  if (chain.signerAddress.toLowerCase() !== config.treasuryAddress.toLowerCase()) {
    throw new SettlementError('TREASURY_ADDRESS_MISMATCH', 500)
  }

  try {
    if ((await chain.getChainId()) !== config.expectedChainId) {
      throw new SettlementError('WRONG_NETWORK', 500)
    }
    const decimals = await chain.getDecimals()
    if (decimals !== config.expectedDecimals) {
      throw new SettlementError('INVALID_SETTLEMENT_CONFIG', 500)
    }

    let amount: bigint
    try {
      amount = chain.parseUnits(request.amount, decimals)
    } catch {
      throw new SettlementError('INVALID_SETTLEMENT_INPUT', 400)
    }
    if (amount <= 0n) throw new SettlementError('INVALID_SETTLEMENT_INPUT', 400)

    if ((await chain.getTokenBalance(config.treasuryAddress)) < amount) {
      throw new SettlementError('INSUFFICIENT_TREASURY_BALANCE', 409)
    }
    const estimatedGas = await chain.estimateTransferGas(request.destination, amount)
    const feePerGas = await chain.getFeePerGas()
    const requiredGas = (estimatedGas * feePerGas * config.gasSafetyBps) / BPS_DENOMINATOR
    if ((await chain.getNativeBalance(config.treasuryAddress)) < requiredGas) {
      throw new SettlementError('INSUFFICIENT_TREASURY_GAS', 503)
    }

    return await chain.transfer(request.destination, amount)
  } catch (err) {
    if (err instanceof SettlementError) throw err
    throw new SettlementError('RPC_UNAVAILABLE', 503)
  }
}
