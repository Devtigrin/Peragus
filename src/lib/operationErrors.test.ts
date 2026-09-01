import { describe, it, expect } from 'vitest'
import { mapOperationErrorToPublicMessage, toPublicOperationError } from './operationErrors'

describe('mapOperationErrorToPublicMessage', () => {
  it('mapeia INSUFFICIENT_TREASURY_BALANCE para mensagem de valor não permitido (pt)', () => {
    const msg = mapOperationErrorToPublicMessage('INSUFFICIENT_TREASURY_BALANCE', 'pt')
    expect(msg).toBe('O valor informado não é permitido para esta operação. Tente um valor menor.')
    expect(msg).not.toContain('treasury')
    expect(msg).not.toContain('INSUFFICIENT')
  })

  it('mapeia todos os idiomas para valor não permitido', () => {
    expect(mapOperationErrorToPublicMessage('INSUFFICIENT_TREASURY_BALANCE', 'en')).toBe('The amount entered is not allowed for this operation. Try a smaller amount.')
    expect(mapOperationErrorToPublicMessage('INSUFFICIENT_TREASURY_BALANCE', 'es')).toBe('El monto ingresado no está permitido para esta operación. Intente con un monto menor.')
  })

  it('não expõe RPC_UNAVAILABLE bruto', () => {
    const msg = mapOperationErrorToPublicMessage('RPC_UNAVAILABLE', 'pt')
    expect(msg).not.toContain('RPC')
    expect(msg).toBe('Não foi possível processar a operação no momento. Tente novamente mais tarde.')
  })

  it('não expõe TX_HASH_PERSISTENCE_FAILED bruto', () => {
    const msg = mapOperationErrorToPublicMessage('TX_HASH_PERSISTENCE_FAILED', 'pt')
    expect(msg).not.toContain('TX_HASH')
    expect(msg).not.toContain('PERSISTENCE')
    expect(msg).toBe('Não foi possível processar a operação no momento. Tente novamente mais tarde.')
  })

  it('não expõe INSUFFICIENT_TREASURY_GAS bruto', () => {
    const msg = mapOperationErrorToPublicMessage('INSUFFICIENT_TREASURY_GAS', 'pt')
    expect(msg).not.toContain('GAS')
    expect(msg).not.toContain('INSUFFICIENT')
    expect(msg).toBe('Não foi possível processar a operação no momento. Tente novamente mais tarde.')
  })

  it('mapeia SETTLEMENT_RECONCILIATION_REQUIRED para mensagem de reconciliação', () => {
    const pt = mapOperationErrorToPublicMessage('SETTLEMENT_RECONCILIATION_REQUIRED', 'pt')
    expect(pt).toBe('Não foi possível concluir a operação automaticamente. Tente novamente mais tarde ou entre em contato com o suporte.')
    expect(pt).not.toContain('SETTLEMENT')
    expect(mapOperationErrorToPublicMessage('SETTLEMENT_RECONCILIATION_REQUIRED', 'en')).not.toContain('SETTLEMENT')
  })

  it('fallback genérico para erro desconhecido sem vazar', () => {
    const msg = mapOperationErrorToPublicMessage('SOME_RANDOM_INTERNAL_CODE_XYZ', 'pt')
    expect(msg).toBe('Não foi possível concluir a operação. Tente novamente.')
    expect(msg).not.toContain('SOME_RANDOM')
  })

  it('não vaza erros postgres/permission denied', () => {
    const msg = mapOperationErrorToPublicMessage('permission denied for table operations 42501', 'pt')
    expect(msg).toBe('Você não tem permissão para realizar esta ação.')
    expect(msg).not.toContain('42501')
    expect(msg).not.toContain('permission')
  })

  it('não vaza erros PGRST', () => {
    const msg = mapOperationErrorToPublicMessage('PGRST116', 'pt')
    expect(msg).toBe('Você não tem permissão para realizar esta ação.')
  })

  it('não vaza ethers/nonce/gas internals', () => {
    const msg = mapOperationErrorToPublicMessage('ethers nonce error gas estimation failed', 'pt')
    expect(msg).not.toContain('ethers')
    expect(msg).not.toContain('nonce')
    expect(msg).toBe('Não foi possível concluir a operação. Tente novamente.')
  })

  it('toPublicOperationError mapeia Error instance', () => {
    const err = new Error('INSUFFICIENT_TREASURY_BALANCE')
    const msg = toPublicOperationError(err, 'pt')
    expect(msg).toBe('O valor informado não é permitido para esta operação. Tente um valor menor.')
  })

  it('toPublicOperationError fallback para string desconhecida', () => {
    const msg = toPublicOperationError('UNKNOWN_INTERNAL_ERROR', 'en')
    expect(msg).toBe('Could not complete the operation. Please try again.')
  })

  it('pt/es/en possuem traduções e nenhuma contém treasury', () => {
    for (const locale of ['pt', 'es', 'en'] as const) {
      const bal = mapOperationErrorToPublicMessage('INSUFFICIENT_TREASURY_BALANCE', locale)
      const gas = mapOperationErrorToPublicMessage('RPC_UNAVAILABLE', locale)
      const rec = mapOperationErrorToPublicMessage('SETTLEMENT_RECONCILIATION_REQUIRED', locale)
      for (const m of [bal, gas, rec]) {
        expect(m.toLowerCase()).not.toContain('treasury')
        expect(m.toLowerCase()).not.toContain('liquidez')
        expect(m.toLowerCase()).not.toContain('hot wallet')
        expect(m.toLowerCase()).not.toContain('private key')
      }
    }
  })
})
