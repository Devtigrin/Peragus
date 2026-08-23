import { authenticate, adminClient } from '../_shared/auth.ts'
import { fail, handleOptions, HttpError, json, rateLimit, readJson, rethrow } from '../_shared/http.ts'
import { generatePixCode, requireAmountText, requireWallet } from '../_shared/pix.ts'

Deno.serve(async (req) => {
  const options = handleOptions(req)
  if (options) return options
  if (req.method !== 'POST') return fail(new HttpError(405, 'Method Not Allowed'))
  const admin = adminClient()
  try {
    const { userId } = await authenticate(req, admin)
    rateLimit(userId)
    const body = await readJson(req)
    const amount = requireAmountText(body)
    const receiver_wallet = requireWallet(body, 'receiver_wallet')
    const request_id =
      typeof body.request_id === 'string' && body.request_id.trim()
        ? body.request_id.trim()
        : crypto.randomUUID()
    const chain =
      typeof body.chain === 'string' && body.chain.trim() ? body.chain.trim() : 'polygon-amoy'
    // Brand rule: the sandbox token is MockUSDT. Never accept "USDT".
    const token_symbol = 'MOCKUSDT'

    // Pre-generate id so the simulated Pix code can be written in the same insert.
    const operationId = crypto.randomUUID()
    const pix_code = generatePixCode(operationId)

    let row: Record<string, unknown> | null = null
    try {
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
      if (error) rethrow(error)
      row = data
    } catch (err) {
      const code = (err as { code?: string })?.code
      if (code !== '23505') rethrow(err)
      const { data: existing, error: exErr } = await admin
        .from('operations')
        .select('*')
        .eq('user_id', userId)
        .eq('request_id', request_id)
        .maybeSingle()
      if (exErr) rethrow(exErr)
      if (!existing) throw new HttpError(409, 'Idempotency collision but operation not found')
      return json({
        ok: true,
        idempotent: true,
        operation: {
          id: existing.id,
          status: existing.status,
          pix_code: (existing as { pix_code?: string }).pix_code ?? null,
        },
      })
    }

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
