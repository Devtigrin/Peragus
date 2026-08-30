import { describe, it, expect } from 'vitest'
import { validate, createOperationSchema, confirmPixSchema, getOperationStatusSchema, listOperationsSchema, settleOperationSchema } from '../_shared/validation.ts'

describe('Validation - createOperationSchema', () => {
  const validWallet = '0x' + 'a'.repeat(40)

  it('rejects non-string amount', () => {
    expect(() => validate(createOperationSchema, { amount: 123, receiver_wallet: validWallet })).toThrow()
  })

  it('rejects negative amount', () => {
    expect(() => validate(createOperationSchema, { amount: '-5', receiver_wallet: validWallet })).toThrow()
  })

  it('rejects amount with >2 decimal places', () => {
    expect(() => validate(createOperationSchema, { amount: '10.999', receiver_wallet: validWallet })).toThrow()
  })

  it('rejects zero amount', () => {
    expect(() => validate(createOperationSchema, { amount: '0', receiver_wallet: validWallet })).toThrow()
  })

  it('rejects invalid wallet address', () => {
    expect(() => validate(createOperationSchema, { amount: '10', receiver_wallet: 'not-an-address' })).toThrow()
  })

  it('rejects wallet without 0x prefix', () => {
    expect(() => validate(createOperationSchema, { amount: '10', receiver_wallet: 'a'.repeat(40) })).toThrow()
  })

  it('accepts valid input', () => {
    const result = validate(createOperationSchema, { amount: '25.50', receiver_wallet: validWallet })
    expect(result.amount).toBe('25.50')
    expect(result.receiver_wallet).toBe(validWallet)
  })

  it('uses default chain', () => {
    const result = validate(createOperationSchema, { amount: '10', receiver_wallet: validWallet })
    expect(result.chain).toBe('polygon-amoy')
  })
})

describe('Validation - confirmPixSchema', () => {
  it('rejects invalid UUID', () => {
    expect(() => validate(confirmPixSchema, { operation_id: 'not-a-uuid' })).toThrow()
  })

  it('accepts valid UUID', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000'
    const result = validate(confirmPixSchema, { operation_id: uuid })
    expect(result.operation_id).toBe(uuid)
  })
})

describe('Validation - getOperationStatusSchema', () => {
  it('rejects missing id', () => {
    expect(() => validate(getOperationStatusSchema, {})).toThrow()
  })

  it('rejects invalid UUID', () => {
    expect(() => validate(getOperationStatusSchema, { id: 'bad' })).toThrow()
  })
})

describe('Validation - listOperationsSchema', () => {
  it('defaults limit to 20', () => {
    const result = validate(listOperationsSchema, {})
    expect(result.limit).toBe(20)
  })

  it('rejects limit > 50', () => {
    expect(() => validate(listOperationsSchema, { limit: 51 })).toThrow()
  })

  it('rejects limit < 1', () => {
    expect(() => validate(listOperationsSchema, { limit: 0 })).toThrow()
  })
})

describe('Validation - settleOperationSchema', () => {
  it('accepts only a UUID operation_id', () => {
    expect(validate(settleOperationSchema, {
      operation_id: '550e8400-e29b-41d4-a716-446655440000',
    })).toEqual({ operation_id: '550e8400-e29b-41d4-a716-446655440000' })
    expect(() => validate(settleOperationSchema, { operation_id: 'bad' })).toThrow()
  })
})
