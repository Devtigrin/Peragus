export interface OperationRequestFingerprint {
  amount: string
  receiverWallet: string
  chain: string
}

export function postgresErrorCode(error: unknown): string | null {
  if (error === null || error === undefined) return null
  if (typeof error !== 'object') return null
  if (!Object.prototype.hasOwnProperty.call(error, 'code')) return null
  const code = (error as { code: unknown }).code
  return typeof code === 'string' ? code : null
}

export function sameOperationRequest(
  existing: {
    usdt_amount_text?: unknown
    receiver_wallet?: unknown
    chain?: unknown
  },
  requested: OperationRequestFingerprint,
): boolean {
  const a = existing.usdt_amount_text
  const b = existing.receiver_wallet
  const c = existing.chain
  if (typeof a !== 'string' || typeof b !== 'string' || typeof c !== 'string') return false
  if (typeof requested.amount !== 'string' || typeof requested.receiverWallet !== 'string' || typeof requested.chain !== 'string') return false
  if (a !== requested.amount) return false
  if (c !== requested.chain) return false
  return b.toLowerCase() === requested.receiverWallet.toLowerCase()
}
