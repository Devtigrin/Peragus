import { describe, it, expect } from 'vitest'
import { postgresErrorCode, sameOperationRequest } from '../_shared/operation-idempotency.ts'

const VALID_WALLET = '0x' + 'a'.repeat(40)

describe('postgresErrorCode', () => {
  it('extracts string code from object with own code', () => {
    expect(postgresErrorCode({ code: '23505', message: 'duplicate' })).toBe('23505')
  })
  it('returns null for Error without own code', () => {
    expect(postgresErrorCode(new Error('duplicate'))).toBeNull()
  })
  it('returns null for null/undefined/non-object', () => {
    expect(postgresErrorCode(null)).toBeNull()
    expect(postgresErrorCode(undefined)).toBeNull()
    expect(postgresErrorCode('23505')).toBeNull()
    expect(postgresErrorCode(123)).toBeNull()
  })
  it('returns null for object without own code or inherited code', () => {
    expect(postgresErrorCode({})).toBeNull()
    expect(postgresErrorCode({ code: 123 })).toBeNull()
    const proto = { code: '23505' }
    const obj = Object.create(proto)
    expect(postgresErrorCode(obj)).toBeNull()
  })
})

describe('sameOperationRequest', () => {
  it('returns true for same amount/chain and wallet case-insensitive', () => {
    expect(sameOperationRequest(
      { usdt_amount_text: '25.00', receiver_wallet: VALID_WALLET, chain: 'polygon-amoy' },
      { amount: '25.00', receiverWallet: VALID_WALLET.toLowerCase(), chain: 'polygon-amoy' },
    )).toBe(true)
  })
  it('returns false for different amount', () => {
    expect(sameOperationRequest(
      { usdt_amount_text: '25.00', receiver_wallet: VALID_WALLET, chain: 'polygon-amoy' },
      { amount: '26.00', receiverWallet: VALID_WALLET, chain: 'polygon-amoy' },
    )).toBe(false)
  })
  it('returns false for missing or non-string fields', () => {
    expect(sameOperationRequest(
      { usdt_amount_text: undefined, receiver_wallet: VALID_WALLET, chain: 'polygon-amoy' },
      { amount: '25.00', receiverWallet: VALID_WALLET, chain: 'polygon-amoy' },
    )).toBe(false)
    expect(sameOperationRequest(
      { usdt_amount_text: 25 as unknown as string, receiver_wallet: VALID_WALLET, chain: 'polygon-amoy' },
      { amount: '25.00', receiverWallet: VALID_WALLET, chain: 'polygon-amoy' },
    )).toBe(false)
  })
  it('returns false for wallet mismatch case-insensitive check', () => {
    const other = '0x' + 'b'.repeat(40)
    expect(sameOperationRequest(
      { usdt_amount_text: '25.00', receiver_wallet: VALID_WALLET, chain: 'polygon-amoy' },
      { amount: '25.00', receiverWallet: other, chain: 'polygon-amoy' },
    )).toBe(false)
  })
  it('returns false for chain mismatch', () => {
    expect(sameOperationRequest(
      { usdt_amount_text: '25.00', receiver_wallet: VALID_WALLET, chain: 'polygon-amoy' },
      { amount: '25.00', receiverWallet: VALID_WALLET, chain: 'ethereum' },
    )).toBe(false)
  })
})
