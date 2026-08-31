import { authenticate, adminClient } from '../_shared/auth.ts'
import { fail, handleOptions, HttpError, json, rateLimit, readJson } from '../_shared/http.ts'
import { validate, confirmPixSchema } from '../_shared/validation.ts'
import { writeAuditLog } from '../_shared/audit.ts'
import { confirmPixOnce, type PixConfirmationStore, type PixOperation } from '../_shared/pix-confirmation.ts'
import type { SupabaseClient } from 'npm:@supabase/supabase-js@2'

declare const EdgeRuntime: { waitUntil(promise: Promise<unknown>): void }

class SupabasePixStore implements PixConfirmationStore {
  constructor(private admin: SupabaseClient) {}

  async find(userId: string, operationId: string): Promise<PixOperation | null> {
    const { data, error } = await this.admin
      .from('operations')
      .select('id,status,request_json,usdt_amount_text,receiver_wallet')
      .eq('id', operationId)
      .eq('user_id', userId)
      .maybeSingle()
    if (error) throw error
    if (!data) return null
    return {
      id: data.id as string,
      status: data.status as string,
      requestJson: (data.request_json ?? {}) as Record<string, unknown>,
      amount: data.usdt_amount_text as string,
      receiverWallet: data.receiver_wallet as string,
    }
  }

  async claim(
    userId: string,
    operationId: string,
    expectedStatus: 'created' | 'pix_pending',
    requestJson: Record<string, unknown>,
  ): Promise<PixOperation | null> {
    const { data, error } = await this.admin
      .from('operations')
      .update({ status: 'pix_confirmed', request_json: requestJson })
      .eq('id', operationId)
      .eq('user_id', userId)
      .eq('status', expectedStatus)
      .select('id,status,request_json,usdt_amount_text,receiver_wallet')
      .maybeSingle()
    if (error) throw error
    if (!data) return null
    return {
      id: data.id as string,
      status: data.status as string,
      requestJson: (data.request_json ?? {}) as Record<string, unknown>,
      amount: data.usdt_amount_text as string,
      receiverWallet: data.receiver_wallet as string,
    }
  }
}

Deno.serve(async (req) => {
  const options = handleOptions(req)
  if (options) return options
  if (req.method !== 'POST') return fail(new HttpError(405, 'Method Not Allowed'), req)
  const admin = adminClient()
  try {
    const { userId } = await authenticate(req, admin)
    rateLimit(userId)
    const body = await readJson(req)
    const { operation_id } = validate(confirmPixSchema, body)

    const store = new SupabasePixStore(admin)
    const paidAt = new Date().toISOString()
    const { operation, previousStatus, shouldDispatch } = await confirmPixOnce(
      store,
      userId,
      operation_id,
      paidAt,
    )

    if (shouldDispatch) {
      await writeAuditLog(admin, {
        user_id: userId,
        action: 'OPERATION_PIX_CONFIRMED',
        resource_type: 'operation',
        resource_id: operation_id,
        metadata: { previous_status: previousStatus },
      })

      // Fire-and-forget settlement with response.ok check. Log only stable code and operation ID.
      EdgeRuntime.waitUntil(
        fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/settle-operation`, {
          method: 'POST',
          headers: {
            'x-internal-secret': Deno.env.get('INTERNAL_SETTLE_SECRET') ?? '',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ operation_id }),
        })
          .then((res) => {
            if (!res.ok) {
              console.error(
                JSON.stringify({ code: 'PIX_SETTLE_DISPATCH_FAILED', operation_id }),
              )
            }
          })
          .catch(() => {
            console.error(
              JSON.stringify({ code: 'PIX_SETTLE_DISPATCH_FAILED', operation_id }),
            )
          }),
      )

      // Fire-and-forget email notification.
      EdgeRuntime.waitUntil(
        (async () => {
          try {
            const userRes = await fetch(
              `${Deno.env.get('SUPABASE_URL')}/auth/v1/admin/users/${userId}`,
              {
                headers: {
                  Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
                  apikey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
                },
              },
            )
            if (!userRes.ok) return
            const { email } = (await userRes.json()) as { email?: string }
            if (!email) return

            await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-email`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-internal-secret': Deno.env.get('INTERNAL_SETTLE_SECRET') ?? '',
              },
              body: JSON.stringify({
                to: email,
                template: 'operation_confirmed',
                params: {
                  operationId: operation.id,
                  amount: operation.amount,
                  receiverWallet: operation.receiverWallet,
                },
              }),
            })
          } catch {
            // Fire-and-forget: never break settlement
          }
        })(),
      )
    }

    return json({ ok: true, operation }, 200, req)
  } catch (err) {
    return fail(err, req)
  }
})
