import { authenticate, adminClient } from '../_shared/auth.ts'
import { fail, handleOptions, HttpError, json, rateLimit, readJson, rethrow } from '../_shared/http.ts'
import { generatePixCode } from '../_shared/pix.ts'
import { validate, createOperationSchema } from '../_shared/validation.ts'
import { writeAuditLog } from '../_shared/audit.ts'
import { postgresErrorCode, sameOperationRequest } from '../_shared/operation-idempotency.ts'

Deno.serve(async (req) => {
  const options = handleOptions(req)
  if (options) return options
  if (req.method !== 'POST') return fail(new HttpError(405, 'Method Not Allowed'))
  const admin = adminClient()
  try {
    const { userId } = await authenticate(req, admin)
    rateLimit(userId)
    const body = await readJson(req)
    const parsed = validate(createOperationSchema, body)
    const amount = parsed.amount
    const receiver_wallet = parsed.receiver_wallet
    const request_id = parsed.request_id ?? crypto.randomUUID()
    const chain = parsed.chain
    // Brand rule: the sandbox token is MockUSDT. Never accept "USDT".
    const token_symbol = 'MOCKUSDT'

    // Pre-generate id so the simulated Pix code can be written in the same insert.
    const operationId = crypto.randomUUID()
    const pix_code = generatePixCode(operationId)

    let row: Record<string, unknown> | null = null
    const { data, error } = await admin
      .from('operations')
      .insert({
        id: operationId,
        user_id: userId,
        request_id,
        status: 'created',
        chain,
        token_symbol,
        usdt_amount_text: amount,
        receiver_wallet,
        request_json: {},
        pix_code,
        error_message: null,
      })
      .select('*')
      .single()
    if (error) {
      if (postgresErrorCode(error) !== '23505') rethrow(error)
      const { data: existing, error: existingError } = await admin
        .from('operations')
        .select('*')
        .eq('user_id', userId)
        .eq('request_id', request_id)
        .maybeSingle()
      if (existingError) rethrow(existingError)
      if (!existing) throw new HttpError(409, 'Idempotency collision but operation not found')
      if (!sameOperationRequest(existing, {
        amount,
        receiverWallet: receiver_wallet,
        chain,
      })) {
        throw new HttpError(409, 'request_id already used with different payload')
      }
      return json({
        ok: true,
        idempotent: true,
        operation: {
          id: existing.id,
          status: existing.status,
          pix_code: existing.pix_code ?? null,
        },
      })
    }
    row = data

    await writeAuditLog(admin, {
      user_id: userId,
      action: 'OPERATION_CREATED',
      resource_type: 'operation',
      resource_id: row!.id as string,
      metadata: { amount, receiver_wallet, chain, token_symbol },
      request_id,
    })

    return json(
      {
        ok: true,
        operation: {
          id: row!.id,
          status: 'created',
          pix_code,
          usdt_amount_text: amount,
          receiver_wallet,
        },
      },
      201,
    )
  } catch (err) {
    return fail(err)
  }
})
