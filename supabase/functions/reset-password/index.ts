import { adminClient } from '../_shared/auth.ts'
import { fail, handleOptions, HttpError, json, rateLimit, readJson } from '../_shared/http.ts'
import { sendEmail } from '../_shared/email.ts'
import { passwordResetEmail } from '../_shared/templates.ts'
import { logger } from '../_shared/logger.ts'

const TOKEN_EXPIRY_MS = 60 * 60 * 1000 // 1 hour
const MAX_RESETS_PER_HOUR = 3

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
    const email = body.email as string | undefined

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      throw new HttpError(400, '"email" is required')
    }

    rateLimit(`reset:${email}`)

    // Lookup user — never reveal existence
    const { data: userId, error: rpcErr } = await admin.rpc('get_user_id_by_email', {
      p_email: email,
    })
    if (rpcErr) throw rpcErr

    if (!userId) {
      logger.warn('Password reset for unknown email', { email })
      return json({ ok: true })
    }

    // Per-user rate limit: count resets in the last hour
    const oneHourAgo = new Date(Date.now() - TOKEN_EXPIRY_MS).toISOString()
    const { count, error: countErr } = await admin
      .from('password_resets')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', oneHourAgo)

    if (countErr) throw countErr
    if (count && count >= MAX_RESETS_PER_HOUR) {
      logger.warn('Password reset rate limit exceeded', { userId })
      return json({ ok: true })
    }

    // Generate token, store hash
    const rawToken = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '')
    const tokenHash = await sha256Hex(rawToken)
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MS).toISOString()

    const { error: insertErr } = await admin.from('password_resets').insert({
      user_id: userId,
      token_hash: tokenHash,
      expires_at: expiresAt,
    })
    if (insertErr) throw insertErr

    // Send email
    const siteUrl = Deno.env.get('SITE_URL') ?? 'https://peragus.com.br'
    const resetUrl = `${siteUrl}/resetar-senha?token=${rawToken}`
    const rendered = passwordResetEmail(resetUrl)
    await sendEmail({ to: email, subject: rendered.subject, html: rendered.html })

    logger.info('Password reset email sent', { userId, email })
    return json({ ok: true })
  } catch (err) {
    return fail(err)
  }
})
