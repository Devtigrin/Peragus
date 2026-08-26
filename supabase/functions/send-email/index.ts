import { authenticate, adminClient } from '../_shared/auth.ts'
import { fail, handleOptions, HttpError, json, rateLimit, readJson } from '../_shared/http.ts'
import { sendEmail } from '../_shared/email.ts'
import { passwordResetEmail, welcomeEmail, operationConfirmedEmail } from '../_shared/templates.ts'
import { logger } from '../_shared/logger.ts'

const INTERNAL_SECRET = Deno.env.get('INTERNAL_SETTLE_SECRET')

type TemplateName = 'password_reset' | 'welcome' | 'operation_confirmed'

function isInternal(req: Request): boolean {
  const s = req.headers.get('x-internal-secret')
  return !!INTERNAL_SECRET && s === INTERNAL_SECRET
}

function render(name: TemplateName, params: Record<string, string>) {
  switch (name) {
    case 'password_reset':
      return passwordResetEmail(params.url ?? '')
    case 'welcome':
      return welcomeEmail(params.userName)
    case 'operation_confirmed':
      return operationConfirmedEmail({
        operationId: params.operationId ?? '',
        amount: params.amount ?? '',
        receiverWallet: params.receiverWallet ?? '',
      })
    default:
      throw new HttpError(400, `Unknown template: ${name}`)
  }
}

Deno.serve(async (req) => {
  const opts = handleOptions(req)
  if (opts) return opts
  if (req.method !== 'POST') return fail(new HttpError(405, 'Method Not Allowed'))

  try {
    if (!isInternal(req)) {
      const admin = adminClient()
      const { userId } = await authenticate(req, admin)
      rateLimit(userId)
    }

    const body = await readJson(req)
    const to = body.to as string | undefined
    const template = body.template as TemplateName | undefined
    const params = (body.params ?? {}) as Record<string, string>

    if (!to || typeof to !== 'string') throw new HttpError(400, '"to" is required')
    if (!template) throw new HttpError(400, '"template" is required')

    const rendered = render(template, params)
    const result = await sendEmail({ to, subject: rendered.subject, html: rendered.html })

    logger.info('Email dispatched', { template, to, id: result.id })
    return json({ ok: true, id: result.id })
  } catch (err) {
    return fail(err)
  }
})
