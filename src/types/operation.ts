export const OPERATION_STATUSES = [
  'created',
  'pix_pending',
  'pix_confirmed',
  'settling',
  'confirmed',
  'failed',
] as const
export type OperationStatus = (typeof OPERATION_STATUSES)[number]
export const ACTIVE_STATUSES: OperationStatus[] = [
  'created',
  'pix_pending',
  'pix_confirmed',
  'settling',
]

export interface Operation {
  id: string
  status: OperationStatus
  chain: string
  token_symbol: string
  usdt_amount_text: string | null
  receiver_wallet: string | null
  sender_wallet: string | null
  tx_hash: string | null
  error_message: string | null
  created_at: string
  updated_at: string
  pix_code?: string | null
}
