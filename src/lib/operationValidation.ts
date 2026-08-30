// Validacoes do formulario de criacao alinhadas ao schema do backend
// (supabase/functions/_shared/validation.ts), para falhar cedo no cliente sem
// reinventar o contrato: amount e EVM address usam as mesmas regras/regra.

export const AMOUNT_RE = /^\d+(\.\d{1,2})?$/
export const EVM_ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/

export function validateAmount(value: string): boolean {
  const normalized = value.trim().replace(',', '.')
  if (!AMOUNT_RE.test(normalized)) return false
  return Number(normalized) > 0
}

export function validateEvmWallet(value: string): boolean {
  return EVM_ADDRESS_RE.test(value.trim())
}
