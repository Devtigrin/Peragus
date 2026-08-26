import { logger } from './logger.ts'

interface SendEmailParams {
  to: string | string[]
  subject: string
  html: string
  from?: string
  replyTo?: string
}

export async function sendEmail(params: SendEmailParams): Promise<{ id: string }> {
  const apiKey = Deno.env.get('RESEND_API_KEY')
  if (!apiKey) {
    logger.warn('RESEND_API_KEY not set – skipping email', { to: params.to, subject: params.subject })
    return { id: 'dev-skip' }
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: params.from ?? 'Peragus <noreply@peragus.com.br>',
      to: Array.isArray(params.to) ? params.to : [params.to],
      subject: params.subject,
      html: params.html,
      ...(params.replyTo ? { reply_to: params.replyTo } : {}),
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    logger.error('Resend API error', { status: res.status, body })
    throw new Error(`Email send failed (${res.status})`)
  }

  const data = (await res.json()) as { id: string }
  logger.info('Email sent', { id: data.id, to: params.to })
  return data
}
