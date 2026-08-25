import { authenticate, adminClient } from '../_shared/auth.ts'
import { fail, handleOptions, HttpError, json, rateLimit, readJson } from '../_shared/http.ts'
import { validate, confirmPixSchema } from '../_shared/validation.ts'
import { assertValidTransition } from '../_shared/state-machine.ts'
import { writeAuditLog } from '../_shared/audit.ts'

Deno.serve(async (req) => {
  const options = handleOptions(req)
  if (options) return options
  if (req.method !== 'POST') return fail(new HttpError(405, 'Method Not Allowed'))
  const admin = adminClient()
  try {
    const { userId } = await authenticate(req, admin)
    rateLimit(userId)
    const body = await readJson(req)
    const { operation_id } = validate(confirmPixSchema, body)

    const { data: op, error } = await admin
      .from('operations')
      .select('id, status, user_id, request_json')
      .eq('id', operation_id)
      .eq('user_id', userId)
      .maybeSingle()
    if (error) throw error
    if (!op) throw new HttpError(404, 'Operation not found')

    const current = op.status as string
    assertValidTransition(current, 'pix_confirmed')

    // Simulated provider approval: sandbox MVP confirms instantly.
    const requestJson = (op.request_json ?? {}) as Record<string, unknown>
    const updated = {
      ...requestJson,
      paid_at: new Date().toISOString(),
      pix_provider: 'sandbox-simulated',
    }
    const { data: confirmed, error: upErr } = await admin
      .from('operations')
      .update({ status: 'pix_confirmed', request_json: updated })
      .eq('id', operation_id)
      .select('id, status')
      .single()
    if (upErr) throw upErr

    await writeAuditLog(admin, {
      user_id: userId,
      action: 'OPERATION_PIX_CONFIRMED',
      resource_type: 'operation',
      resource_id: operation_id,
      metadata: { previous_status: current },
    })

    // Fire-and-forget settlement.
    EdgeRuntime.waitUntil(
      fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/settle-operation`, {
        method: 'POST',
        headers: {
          'x-internal-secret': Deno.env.get('INTERNAL_SETTLE_SECRET') ?? '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ operation_id }),
      }).catch(() => {}),
    )

    return json({ ok: true, operation: confirmed })
  } catch (err) {
    return fail(err)
  }
})
