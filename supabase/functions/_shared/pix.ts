import { HttpError } from './http.ts'

// Simulated Pix copy-and-paste code. NOT a real BR Code; sandbox only.
export function generatePixCode(operationId: string): string {
  return `00020126SANDBOX-PERAGUS${operationId.replace(/-/g, '').slice(0, 20).toUpperCase()}5204000053039865802BR`
}

export function requireString(body: Record<string, unknown>, field: string): string {
  const v = body[field]
  if (typeof v !== 'string' || v.trim().length === 0) throw new HttpError(400, `${field} is required`)
  return v.trim()
}

export function requireWallet(body: Record<string, unknown>, field: string): string {
  const v = requireString(body, field)
  if (!/^0x[a-fA-F0-9]{40}$/.test(v)) throw new HttpError(400, `${field} must be a valid EVM address`)
  return v
}

export function requireAmountText(body: Record<string, unknown>): string {
  const s = requireString(body, 'amount')
  if (!/^\d+(\.\d{1,2})?$/.test(s)) throw new HttpError(400, 'amount must be a positive decimal string')
  if (Number(s) <= 0) throw new HttpError(400, 'amount must be > 0')
  return s
}
