import { describe, it, expect } from 'vitest'
import { confirmPixOnce, type PixOperation, type PixConfirmationStore } from '../_shared/pix-confirmation.ts'

const USER_ID = '00000000-0000-4000-a000-000000000001'
const OPERATION_ID = '550e8400-e29b-41d4-a716-446655440000'
const NOW = new Date().toISOString()

const WALLET = '0x' + 'a'.repeat(40)
const AMOUNT = '100.00'

function operation(status: string, requestJson: Record<string, unknown> = {}): PixOperation {
  return {
    id: OPERATION_ID,
    status,
    requestJson,
    amount: AMOUNT,
    receiverWallet: WALLET,
  }
}

class FakePixStore implements PixConfirmationStore {
  operation: PixOperation
  claimCalls = 0

  constructor(op: PixOperation) {
    this.operation = { ...op, requestJson: { ...op.requestJson } }
  }

  async find(_userId: string, _operationId: string): Promise<PixOperation | null> {
    void _userId
    void _operationId
    // simulate async
    return { ...this.operation, requestJson: { ...this.operation.requestJson } }
  }

  async claim(
    _userId: string,
    _operationId: string,
    expectedStatus: 'created' | 'pix_pending',
    requestJson: Record<string, unknown>,
  ): Promise<PixOperation | null> {
    this.claimCalls += 1
    // Apply only when current status still equals expectedStatus (atomic conditional update)
    // microtask delay to allow concurrency interleaving similar to settlement-coordinator test
    await Promise.resolve()
    if (this.operation.status !== expectedStatus) return null
    this.operation = {
      ...this.operation,
      status: 'pix_confirmed',
      requestJson: { ...requestJson },
    }
    return { ...this.operation, requestJson: { ...this.operation.requestJson } }
  }
}

class MissingStore implements PixConfirmationStore {
  async find(): Promise<PixOperation | null> { return null }
  async claim(): Promise<PixOperation | null> { return null }
}

describe('pix-confirmation', () => {
  it('allows concurrent Pix confirmations to dispatch settlement once', async () => {
    const store = new FakePixStore(operation('created'))
    const results = await Promise.all([
      confirmPixOnce(store, USER_ID, OPERATION_ID, NOW),
      confirmPixOnce(store, USER_ID, OPERATION_ID, NOW),
    ])

    expect(results.filter((result) => result.shouldDispatch)).toHaveLength(1)
    expect(store.operation.status).toBe('pix_confirmed')
  })

  it('returns shouldDispatch false for repeated pix_confirmed', async () => {
    const store = new FakePixStore(operation('pix_confirmed', { paid_at: NOW, pix_provider: 'sandbox-simulated' }))
    const result = await confirmPixOnce(store, USER_ID, OPERATION_ID, NOW)
    expect(result.shouldDispatch).toBe(false)
    expect(result.previousStatus).toBe('pix_confirmed')
    expect(result.operation.status).toBe('pix_confirmed')
    expect(store.claimCalls).toBe(0)
  })

  it('returns shouldDispatch false for settling (already advancing)', async () => {
    const store = new FakePixStore(operation('settling'))
    const result = await confirmPixOnce(store, USER_ID, OPERATION_ID, NOW)
    expect(result.shouldDispatch).toBe(false)
    expect(result.previousStatus).toBe('settling')
  })

  it('returns shouldDispatch false for confirmed', async () => {
    const store = new FakePixStore(operation('confirmed'))
    const result = await confirmPixOnce(store, USER_ID, OPERATION_ID, NOW)
    expect(result.shouldDispatch).toBe(false)
    expect(result.previousStatus).toBe('confirmed')
  })

  it('throws for terminal failed', async () => {
    const store = new FakePixStore(operation('failed'))
    await expect(confirmPixOnce(store, USER_ID, OPERATION_ID, NOW)).rejects.toMatchObject({
      status: 409,
    })
  })

  it('throws for unknown status', async () => {
    const store = new FakePixStore(operation('unknown_status'))
    await expect(confirmPixOnce(store, USER_ID, OPERATION_ID, NOW)).rejects.toMatchObject({
      status: 409,
    })
  })

  it('throws 404 for missing operation', async () => {
    const store = new MissingStore()
    await expect(confirmPixOnce(store, USER_ID, OPERATION_ID, NOW)).rejects.toMatchObject({
      status: 404,
      message: 'Operation not found',
    })
  })

  it('dispatches once for created -> pix_confirmed', async () => {
    const store = new FakePixStore(operation('created'))
    const result = await confirmPixOnce(store, USER_ID, OPERATION_ID, NOW)
    expect(result.shouldDispatch).toBe(true)
    expect(result.previousStatus).toBe('created')
    expect(result.operation.status).toBe('pix_confirmed')
    expect(result.operation.requestJson.paid_at).toBe(NOW)
    expect(result.operation.requestJson.pix_provider).toBe('sandbox-simulated')
  })

  it('dispatches once for pix_pending -> pix_confirmed', async () => {
    const store = new FakePixStore(operation('pix_pending'))
    const result = await confirmPixOnce(store, USER_ID, OPERATION_ID, NOW)
    expect(result.shouldDispatch).toBe(true)
    expect(result.previousStatus).toBe('pix_pending')
    expect(result.operation.status).toBe('pix_confirmed')
  })
})
