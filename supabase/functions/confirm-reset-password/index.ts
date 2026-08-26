import { adminClient } from '../_shared/auth.ts'
import { fail, handleOptions, HttpError, json, rateLimit, readJson } from '../_shared/http.ts'
import { validate } from '../_shared/validation.ts'
import { logger } from '../_shared/logger.ts'
import { z } from 'npm:zod@3.23.8'

const confirmResetSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

async function sha256Hex(s: string): Promise<string> {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

Deno.serve(async (req) => {
  const opts = handleOptions(req)
  if (opts) return opts
  if (req.method !== 'POST') return fail(new HttpError(405, 'Method Not Allowed'))

  try {
    const admin = adminClient()
    const body = await readJson(req)
    const { token, password } = validate(confirmResetSchema, body)

    const tokenHash = await sha256Hex(token)
    rateLimit(`confirm-reset:${tokenHash}`)

    const { data: reset, error } = await admin
      .from('password_resets')
      .select('id, user_id, expires_at, used_at')
      .eq('token_hash', tokenHash)
      .maybeSingle()

    if (error) throw error
    if (!reset) throw new HttpError(400, 'Token inválido ou expirado')
    if (reset.used_at) throw new HttpError(400, 'Token já utilizado')
    if (new Date(reset.expires_at) < new Date()) throw new HttpError(400, 'Token expirado')

    // Update password via Supabase Auth Admin API
    const res = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/auth/v1/admin/users/${reset.user_id}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          apikey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      },
    )

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.msg ?? 'Failed to update password')
    }

    // Mark token used
    await admin
      .from('password_resets')
      .update({ used_at: new Date().toISOString() })
      .eq('id', reset.id)

    // Clean up expired tokens for this user
    await admin
      .from('password_resets')
      .delete()
      .eq('user_id', reset.user_id)
      .lt('expires_at', new Date().toISOString())

    logger.info('Password reset completed', { userId: reset.user_id })
    return json({ ok: true })
  } catch (err) {
    return fail(err)
  }
})
