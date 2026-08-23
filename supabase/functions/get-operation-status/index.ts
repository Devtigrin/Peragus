import { authenticate, adminClient } from '../_shared/auth.ts'
import { fail, handleOptions, HttpError, json, rateLimit } from '../_shared/http.ts'

const COLUMNS =
  'id,user_id,status,chain,token_symbol,usdt_amount_text,wallet_address,pix_code,tx_hash,error_message,created_at,updated_at,request_id,sender_wallet,receiver_wallet,contract_address,block_number,gas_used,transaction_status'

Deno.serve(async (req) => {
  const options = handleOptions(req)
  if (options) return options
  if (req.method !== 'GET') return fail(new HttpError(405, 'Method Not Allowed'))
  const admin = adminClient()
  try {
    const { userId } = await authenticate(req, admin)
    rateLimit(userId)
    const id = new URL(req.url).searchParams.get('id')
    if (!id) return fail(new HttpError(400, 'id is required'))
    const { data, error } = await admin
      .from('operations')
      .select(COLUMNS)
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle()
    if (error) throw error
    if (!data) return fail(new HttpError(404, 'Operation not found'))
    return json({ ok: true, operation: data })
  } catch (err) {
    return fail(err)
  }
})
