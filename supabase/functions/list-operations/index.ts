import { authenticate, adminClient } from '../_shared/auth.ts'
import { fail, handleOptions, HttpError, json, rateLimit } from '../_shared/http.ts'
import { validate, listOperationsSchema } from '../_shared/validation.ts'

const COLUMNS =
  'id,status,chain,token_symbol,usdt_amount_text,receiver_wallet,sender_wallet,tx_hash,error_message,created_at,updated_at,pix_code'

Deno.serve(async (req) => {
  const options = handleOptions(req)
  if (options) return options
  if (req.method !== 'GET') return fail(new HttpError(405, 'Method Not Allowed'))
  const admin = adminClient()
  try {
    const { userId } = await authenticate(req, admin)
    rateLimit(userId)
    const url = new URL(req.url)
    const { limit, before } = validate(listOperationsSchema, {
      limit: url.searchParams.get('limit'),
      before: url.searchParams.get('before'),
    })

    let query = admin
      .from('operations')
      .select(COLUMNS)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit + 1)
    if (before) query = query.lt('created_at', before)

    const { data, error } = await query
    if (error) throw error
    const rows = (data ?? []) as Array<Record<string, unknown>>
    const hasMore = rows.length > limit
    const page = hasMore ? rows.slice(0, limit) : rows

    return json({
      ok: true,
      operations: page.map((r) => ({
        id: r.id,
        status: r.status,
        chain: r.chain,
        token_symbol: r.token_symbol,
        usdt_amount_text: r.usdt_amount_text,
        receiver_wallet: r.receiver_wallet,
        sender_wallet: r.sender_wallet,
        tx_hash: r.tx_hash,
        error_message: r.error_message,
        created_at: r.created_at,
        updated_at: r.updated_at,
        pix_code: r.pix_code ?? null,
      })),
      next_before: hasMore ? page[page.length - 1].created_at : null,
    })
  } catch (err) {
    return fail(err)
  }
})
