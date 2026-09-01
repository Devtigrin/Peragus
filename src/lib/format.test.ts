import { describe, it, expect } from 'vitest'
import { formatTokenAmount, formatOperationAmount } from './format'

describe('formatTokenAmount', () => {
  it('formata inteiros com separador de milhar pt-BR', () => {
    expect(formatTokenAmount('1000')).toBe('1.000')
    expect(formatTokenAmount('10000')).toBe('10.000')
    expect(formatTokenAmount('1000000')).toBe('1.000.000')
    expect(formatTokenAmount('1000000000')).toBe('1.000.000.000')
    expect(formatTokenAmount('125')).toBe('125')
    expect(formatTokenAmount('20')).toBe('20')
    expect(formatTokenAmount(1000)).toBe('1.000')
  })

  it('formata decimais com vírgula e ponto de milhar', () => {
    expect(formatTokenAmount('10000.25')).toBe('10.000,25')
    expect(formatTokenAmount('1000.00')).toBe('1.000,00')
    expect(formatTokenAmount('25.00')).toBe('25,00')
  })

  it('padroniza 1 casa decimal para 2 (125.5 -> 125,50)', () => {
    expect(formatTokenAmount('125.5')).toBe('125,50')
    expect(formatTokenAmount('0.5')).toBe('0,50')
    expect(formatTokenAmount(125.5)).toBe('125,50')
  })

  it('preserva precisão original sem arredondar quando >2 casas', () => {
    expect(formatTokenAmount('25.000000')).toBe('25,000000')
    expect(formatTokenAmount('10.123')).toBe('10,123')
  })

  it('retorna vazio para null/undefined/vazio', () => {
    expect(formatTokenAmount(null)).toBe('')
    expect(formatTokenAmount(undefined)).toBe('')
    expect(formatTokenAmount('')).toBe('')
  })

  it('não altera valor armazenado — apenas formatação visual', () => {
    const raw = '10000.25'
    const formatted = formatTokenAmount(raw)
    expect(raw).toBe('10000.25')
    expect(formatted).toBe('10.000,25')
    // garante que número original não foi convertido para cálculo
    expect(Number(raw)).toBe(10000.25)
  })

  it('usa Intl.NumberFormat pt-BR internamente (ponto milhar, vírgula decimal)', () => {
    // sanity: compara com Intl direto para inteiro
    const intl = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(1000)
    expect(intl).toBe('1.000')
    expect(formatTokenAmount('1000')).toBe(intl)
  })
})

describe('formatOperationAmount', () => {
  it('combina valor formatado com símbolo', () => {
    expect(formatOperationAmount('1000', 'MockUSDT')).toBe('1.000 MockUSDT')
    expect(formatOperationAmount('10000.25', 'MockUSDT')).toBe('10.000,25 MockUSDT')
    expect(formatOperationAmount('125.5', 'MockUSDT')).toBe('125,50 MockUSDT')
    expect(formatOperationAmount(null, 'MockUSDT')).toBe('MockUSDT')
  })
})
