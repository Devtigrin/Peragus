import { describe, it, expect, vi } from 'vitest'
import { coordinateSettlement, type SettlementStore, type SettlementOperation, type BroadcastRecord } from '../_shared/settlement-coordinator.ts'
import { type TreasuryChain, type TreasuryConfig, type PendingTransfer, type TransferReceipt } from '../_shared/treasury-transfer.ts'

const TREASURY = '0x1111111111111111111111111111111111111111'
const CONTRACT = '0x2222222222222222222222222222222222222222'
const DESTINATION = '0x3333333333333333333333333333333333333333'
const TX_HASH = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
const OPERATION_ID = '550e8400-e29b-41d4-a716-446655440000'

const CONFIG: TreasuryConfig = {
  expectedChainId: 80002,
  treasuryAddress: TREASURY,
  expectedDecimals: 6,
  gasSafetyBps: 12_000n,
}

function operation(status: string, txHash: string | null = null): SettlementOperation {
  return {
    id: OPERATION_ID,
    status,
    amount: '100',
    destination: DESTINATION,
    txHash,
  }
}

function createDeferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

class FakeTreasuryChain implements TreasuryChain {
  readonly signerAddress = TREASURY
  readonly contractAddress = CONTRACT
  chainId = 80002
  decimals = 6
  totalSupply = 1_000_000_000n
  nativeBalance = 10_000_000n
  feePerGas = 10n
  estimatedGas = 100_000n
  transferCalls = 0
  mintCalls = 0
  getReceiptCalls = 0
  balances = new Map<string, bigint>([
    [TREASURY.toLowerCase(), 1_000_000_000n],
    [DESTINATION.toLowerCase(), 0n],
  ])
  // controllable receipt
  receipt: TransferReceipt | null = { hash: TX_HASH, status: 1, blockNumber: 42, gasUsed: 90_000n }
  receiptShouldThrow = false
  // deferred wait for hash-before-wait test
  deferredWait: ReturnType<typeof createDeferred<TransferReceipt | null>> | null = null

  async getChainId() { return this.chainId }
  parseUnits(amount: string, decimals: number) {
    const [whole, fraction = ''] = amount.split('.')
    return BigInt(whole) * 10n ** BigInt(decimals) + BigInt(fraction.padEnd(decimals, '0'))
  }
  async getDecimals() { return this.decimals }
  async getTokenBalance(address: string) { return this.balances.get(address.toLowerCase()) ?? 0n }
  async estimateTransferGas() { return this.estimatedGas }
  async getFeePerGas() { return this.feePerGas }
  async getNativeBalance() { return this.nativeBalance }
  async getReceipt(_hash: string): Promise<TransferReceipt | null> {
    void _hash
    this.getReceiptCalls += 1
    if (this.receiptShouldThrow) throw new Error('rpc error')
    return this.receipt
  }
  async transfer(destination: string, amount: bigint): Promise<PendingTransfer> {
    this.transferCalls += 1
    const treasuryKey = TREASURY.toLowerCase()
    const destinationKey = destination.toLowerCase()
    this.balances.set(treasuryKey, this.balances.get(treasuryKey)! - amount)
    this.balances.set(destinationKey, (this.balances.get(destinationKey) ?? 0n) + amount)
    if (this.deferredWait) {
      return {
        hash: TX_HASH,
        wait: () => this.deferredWait!.promise,
      }
    }
    return {
      hash: TX_HASH,
      wait: async () => ({ hash: TX_HASH, status: 1, blockNumber: 42, gasUsed: 90_000n }),
    }
  }
}

class FakeSettlementStore implements SettlementStore {
  operation: SettlementOperation | null
  claimCalls = 0
  persistBroadcastCalls = 0
  persistReceiptCalls = 0
  failCalls = 0
  lastFailCode: string | null = null
  claimShouldFail = false
  persistShouldFail = false
  findShouldFail = false

  constructor(op: SettlementOperation | null) {
    this.operation = op ? { ...op } : null
  }

  async claim(operationId: string): Promise<SettlementOperation | null> {
    this.claimCalls += 1
    if (this.claimShouldFail) throw new Error('claim db failure')
    if (!this.operation || this.operation.id !== operationId) return null
    if (this.operation.status !== 'pix_confirmed') return null
    // simulate atomic conditional update with microtask delay to allow concurrency interleaving
    await Promise.resolve()
    if (this.operation.status !== 'pix_confirmed') return null
    this.operation = { ...this.operation, status: 'settling', txHash: null }
    return { ...this.operation }
  }

  async find(operationId: string): Promise<SettlementOperation | null> {
    if (this.findShouldFail) throw new Error('find db failure')
    if (!this.operation || this.operation.id !== operationId) return null
    return { ...this.operation }
  }

  async persistBroadcast(operationId: string, record: BroadcastRecord): Promise<void> {
    this.persistBroadcastCalls += 1
    if (this.persistShouldFail) throw new Error('persist broadcast failure')
    if (!this.operation || this.operation.id !== operationId) throw new Error('not found')
    this.operation = { ...this.operation, txHash: record.txHash, status: 'settling' }
  }

  async persistReceipt(operationId: string, receipt: TransferReceipt): Promise<void> {
    this.persistReceiptCalls += 1
    if (!this.operation || this.operation.id !== operationId) throw new Error('not found')
    this.operation = {
      ...this.operation,
      txHash: receipt.hash,
      status: receipt.status === 1 ? 'confirmed' : 'failed',
    }
  }

  async failBeforeBroadcast(operationId: string, code: string): Promise<void> {
    this.failCalls += 1
    this.lastFailCode = code
    if (!this.operation || this.operation.id !== operationId) throw new Error('not found')
    this.operation = { ...this.operation, status: 'failed', txHash: null }
  }
}

describe('settlement-coordinator', () => {
  it('allows concurrent workers to broadcast at most once', async () => {
    const store = new FakeSettlementStore(operation('pix_confirmed'))
    const chain = new FakeTreasuryChain()

    await Promise.allSettled([
      coordinateSettlement(OPERATION_ID, store, chain, CONFIG),
      coordinateSettlement(OPERATION_ID, store, chain, CONFIG),
    ])

    expect(chain.transferCalls).toBe(1)
    expect(chain.mintCalls).toBe(0)
  })

  it('persists hash before waiting for receipt', async () => {
    const store = new FakeSettlementStore(operation('pix_confirmed'))
    const chain = new FakeTreasuryChain()
    const deferred = createDeferred<TransferReceipt | null>()
    chain.deferredWait = deferred

    const pending = coordinateSettlement(OPERATION_ID, store, chain, CONFIG)

    await vi.waitFor(() => {
      expect(store.operation?.txHash).toBe(TX_HASH)
    })

    // still settling while wait unresolved
    expect(store.operation?.status).toBe('settling')

    deferred.resolve({ hash: TX_HASH, status: 1, blockNumber: 42, gasUsed: 90_000n })
    const result = await pending

    expect(result).toEqual({ status: 'confirmed', txHash: TX_HASH, idempotent: false })
    expect(chain.transferCalls).toBe(1)
    // hash was persisted before receipt
    expect(store.persistBroadcastCalls).toBe(1)
  })

  // reconciliation tests
  it('settling + successful receipt -> confirmed, no transfer', async () => {
    const store = new FakeSettlementStore(operation('settling', TX_HASH))
    const chain = new FakeTreasuryChain()
    chain.receipt = { hash: TX_HASH, status: 1, blockNumber: 42, gasUsed: 90_000n }

    const result = await coordinateSettlement(OPERATION_ID, store, chain, CONFIG)

    expect(result).toEqual({ status: 'confirmed', txHash: TX_HASH, idempotent: true })
    expect(chain.transferCalls).toBe(0)
    expect(chain.mintCalls).toBe(0)
    expect(store.persistReceiptCalls).toBe(1)
    expect(store.operation?.status).toBe('confirmed')
  })

  it('settling + reverted receipt -> failed, no transfer', async () => {
    const store = new FakeSettlementStore(operation('settling', TX_HASH))
    const chain = new FakeTreasuryChain()
    chain.receipt = { hash: TX_HASH, status: 0, blockNumber: 42, gasUsed: 90_000n }

    const result = await coordinateSettlement(OPERATION_ID, store, chain, CONFIG)

    expect(result).toEqual({ status: 'failed', txHash: TX_HASH, idempotent: true })
    expect(chain.transferCalls).toBe(0)
    expect(chain.mintCalls).toBe(0)
  })

  it('settling + null receipt -> SETTLEMENT_PENDING, no transfer', async () => {
    const store = new FakeSettlementStore(operation('settling', TX_HASH))
    const chain = new FakeTreasuryChain()
    chain.receipt = null

    const result = await coordinateSettlement(OPERATION_ID, store, chain, CONFIG)

    expect(result).toEqual({ status: 'settling', txHash: TX_HASH, code: 'SETTLEMENT_PENDING', idempotent: true })
    expect(chain.transferCalls).toBe(0)
  })

  it('settling + receipt RPC error -> SETTLEMENT_PENDING, no transfer', async () => {
    const store = new FakeSettlementStore(operation('settling', TX_HASH))
    const chain = new FakeTreasuryChain()
    chain.receiptShouldThrow = true

    const result = await coordinateSettlement(OPERATION_ID, store, chain, CONFIG)

    expect(result).toEqual({ status: 'settling', txHash: TX_HASH, code: 'SETTLEMENT_PENDING', idempotent: true })
    expect(chain.transferCalls).toBe(0)
  })

  it('settling + no tx_hash -> SETTLEMENT_RECONCILIATION_REQUIRED, no transfer', async () => {
    const store = new FakeSettlementStore(operation('settling', null))
    const chain = new FakeTreasuryChain()

    await expect(coordinateSettlement(OPERATION_ID, store, chain, CONFIG)).rejects.toMatchObject({
      code: 'SETTLEMENT_RECONCILIATION_REQUIRED',
      status: 409,
    })
    expect(chain.transferCalls).toBe(0)
    expect(chain.mintCalls).toBe(0)
  })

  it('confirmed retry -> existing result, no transfer', async () => {
    const store = new FakeSettlementStore(operation('confirmed', TX_HASH))
    const chain = new FakeTreasuryChain()

    const result = await coordinateSettlement(OPERATION_ID, store, chain, CONFIG)

    expect(result).toEqual({ status: 'confirmed', txHash: TX_HASH, idempotent: true })
    expect(chain.transferCalls).toBe(0)
  })

  it('failed retry -> existing result, no transfer', async () => {
    const store = new FakeSettlementStore(operation('failed', TX_HASH))
    const chain = new FakeTreasuryChain()

    const result = await coordinateSettlement(OPERATION_ID, store, chain, CONFIG)

    expect(result).toEqual({ status: 'failed', txHash: TX_HASH, idempotent: true })
    expect(chain.transferCalls).toBe(0)
  })

  it('throws INVALID_SETTLEMENT_INPUT 404 when operation not found', async () => {
    const store = new FakeSettlementStore(null)
    const chain = new FakeTreasuryChain()

    await expect(coordinateSettlement(OPERATION_ID, store, chain, CONFIG)).rejects.toMatchObject({
      code: 'INVALID_SETTLEMENT_INPUT',
      status: 404,
    })
    expect(chain.transferCalls).toBe(0)
  })

  it('throws INVALID_SETTLEMENT_INPUT 409 for invalid status', async () => {
    const store = new FakeSettlementStore(operation('created', null))
    const chain = new FakeTreasuryChain()

    await expect(coordinateSettlement(OPERATION_ID, store, chain, CONFIG)).rejects.toMatchObject({
      code: 'INVALID_SETTLEMENT_INPUT',
      status: 409,
    })
    expect(chain.transferCalls).toBe(0)
  })

  it('returns settling when wait throws', async () => {
    const store = new FakeSettlementStore(operation('pix_confirmed'))
    const chain = new FakeTreasuryChain()
    const deferred = createDeferred<TransferReceipt | null>()
    chain.deferredWait = deferred

    const pending = coordinateSettlement(OPERATION_ID, store, chain, CONFIG)
    await vi.waitFor(() => expect(store.operation?.txHash).toBe(TX_HASH))
    deferred.reject(new Error('wait timeout'))

    const result = await pending
    expect(result).toEqual({ status: 'settling', txHash: TX_HASH, code: 'SETTLEMENT_PENDING', idempotent: false })
    expect(chain.transferCalls).toBe(1)
  })

  it('returns settling when wait returns null', async () => {
    const store = new FakeSettlementStore(operation('pix_confirmed'))
    const chain = new FakeTreasuryChain()
    const deferred = createDeferred<TransferReceipt | null>()
    chain.deferredWait = deferred

    const pending = coordinateSettlement(OPERATION_ID, store, chain, CONFIG)
    await vi.waitFor(() => expect(store.operation?.txHash).toBe(TX_HASH))
    deferred.resolve(null)

    const result = await pending
    expect(result).toEqual({ status: 'settling', txHash: TX_HASH, code: 'SETTLEMENT_PENDING', idempotent: false })
    expect(chain.transferCalls).toBe(1)
  })

  it('marks failed before broadcast when broadcast fails', async () => {
    const store = new FakeSettlementStore(operation('pix_confirmed'))
    const chain = new FakeTreasuryChain()
    chain.chainId = 137 // wrong network

    await expect(coordinateSettlement(OPERATION_ID, store, chain, CONFIG)).rejects.toMatchObject({
      code: 'WRONG_NETWORK',
    })
    expect(chain.transferCalls).toBe(0)
    expect(store.failCalls).toBe(1)
    expect(store.lastFailCode).toBe('WRONG_NETWORK')
    expect(store.operation?.status).toBe('failed')
  })

  // database-failure tests
  it('claim failure never causes a second transfer', async () => {
    const store = new FakeSettlementStore(operation('pix_confirmed'))
    store.claimShouldFail = true
    const chain = new FakeTreasuryChain()

    await expect(coordinateSettlement(OPERATION_ID, store, chain, CONFIG)).rejects.toThrow('claim db failure')
    expect(chain.transferCalls).toBe(0)
    expect(chain.mintCalls).toBe(0)
  })

  it('broadcast-persistence failure blocks retry and never causes second transfer', async () => {
    const store = new FakeSettlementStore(operation('pix_confirmed'))
    store.persistShouldFail = true
    const chain = new FakeTreasuryChain()

    await expect(coordinateSettlement(OPERATION_ID, store, chain, CONFIG)).rejects.toMatchObject({
      code: 'TX_HASH_PERSISTENCE_FAILED',
      status: 500,
    })
    expect(chain.transferCalls).toBe(1)

    // operation remains settling without hash because persist failed
    expect(store.operation?.txHash).toBeNull()
    expect(store.operation?.status).toBe('settling')

    // retry must return reconciliation required and never broadcast again
    await expect(coordinateSettlement(OPERATION_ID, store, chain, CONFIG)).rejects.toMatchObject({
      code: 'SETTLEMENT_RECONCILIATION_REQUIRED',
      status: 409,
    })
    expect(chain.transferCalls).toBe(1) // no second transfer

    // additional retry also reconciliation required
    await expect(coordinateSettlement(OPERATION_ID, store, chain, CONFIG)).rejects.toMatchObject({
      code: 'SETTLEMENT_RECONCILIATION_REQUIRED',
    })
    expect(chain.transferCalls).toBe(1)
  })

  it('never calls mint in any branch', async () => {
    const store1 = new FakeSettlementStore(operation('pix_confirmed'))
    const chain1 = new FakeTreasuryChain()
    await coordinateSettlement(OPERATION_ID, store1, chain1, CONFIG)
    expect(chain1.mintCalls).toBe(0)

    const store2 = new FakeSettlementStore(operation('settling', TX_HASH))
    const chain2 = new FakeTreasuryChain()
    chain2.receipt = { hash: TX_HASH, status: 1, blockNumber: 42, gasUsed: 90_000n }
    await coordinateSettlement(OPERATION_ID, store2, chain2, CONFIG)
    expect(chain2.mintCalls).toBe(0)
  })
})
