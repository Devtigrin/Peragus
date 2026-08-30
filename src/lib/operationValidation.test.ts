import { describe, expect, it } from 'vitest'
import { validateAmount, validateEvmWallet } from './operationValidation'

describe('operationValidation', () => {
  describe('validateAmount', () => {
    it.each(['1', '0.5', '25.00', '1000000.99'])('aceita %s', (v) => {
      expect(validateAmount(v)).toBe(true)
    })

    it.each(['0', '0.00', '-5', 'abc', '1.234', '', ' ', '25,5x', 'NaN', 'Infinity'])('rejeita %s', (v) => {
      expect(validateAmount(v)).toBe(false)
    })

    it('aceita virgula como separador decimal', () => {
      expect(validateAmount('25,50')).toBe(true)
    })
  })

  describe('validateEvmWallet', () => {
    it('aceita endereco EVM valido', () => {
      expect(validateEvmWallet('0x0123456789abcdef0123456789abcdef01234567')).toBe(true)
      expect(validateEvmWallet('  0xABCDEF0123456789abcdef0123456789abcdef01  ')).toBe(true)
    })

    it.each([
      '',
      '0x123',
      '0xzzz3456789abcdef0123456789abcdef01234567',
      'x123456789abcdef0123456789abcdef01234567',
      '0x0123456789',
    ])('rejeita %s', (v) => {
      expect(validateEvmWallet(v)).toBe(false)
    })
  })
})
