import { HttpError } from './http.ts'

const VALID_TRANSITIONS: Record<string, string[]> = {
  created: ['pix_pending', 'pix_confirmed', 'failed'],
  pix_pending: ['pix_confirmed', 'failed'],
  pix_confirmed: ['settling', 'failed'],
  settling: ['confirmed', 'failed'],
  confirmed: [],
  failed: [],
}

export function assertValidTransition(from: string, to: string): void {
  const allowed = VALID_TRANSITIONS[from]
  if (!allowed) {
    throw new HttpError(409, `Unknown current status: ${from}`)
  }
  if (!allowed.includes(to)) {
    throw new HttpError(409, `Cannot transition from ${from} to ${to}`)
  }
}

export function isTerminal(status: string): boolean {
  return !VALID_TRANSITIONS[status] || VALID_TRANSITIONS[status].length === 0
}
