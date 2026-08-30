import { z } from 'npm:zod@3.23.8'

export const uuidSchema = z.string().uuid('Invalid UUID format')

export const amountSchema = z
  .string()
  .regex(/^\d+(\.\d{1,2})?$/, 'amount must be a positive decimal string with at most 2 decimal places')
  .refine((s) => Number(s) > 0, 'amount must be greater than 0')

export const evmAddressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, 'must be a valid EVM address (0x + 40 hex chars)')

export const chainSchema = z.string().default('polygon-amoy')

export const createOperationSchema = z.object({
  amount: amountSchema,
  receiver_wallet: evmAddressSchema,
  request_id: z.string().trim().min(1).optional(),
  chain: chainSchema,
})

export const confirmPixSchema = z.object({
  operation_id: uuidSchema,
})

export const getOperationStatusSchema = z.object({
  id: uuidSchema,
})

export const listOperationsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  before: z.string().optional(),
})

export const settleOperationSchema = z.object({ operation_id: uuidSchema })

export function validate<T extends z.ZodType>(
  schema: T,
  data: unknown,
): z.infer<T> {
  const result = schema.safeParse(data)
  if (!result.success) {
    const messages = result.error.issues.map((i) => i.message).join('; ')
    throw new Error(`Validation error: ${messages}`)
  }
  return result.data
}
