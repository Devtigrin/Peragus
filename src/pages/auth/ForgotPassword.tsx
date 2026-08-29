import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/auth/AuthProvider'
import { authContent } from '@/content/auth'
import { authPath, homePath, type Locale } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Notice } from '@/components/ui/notice'
import { AuthShell } from '@/components/auth/AuthShell'

export function ForgotPassword({ locale }: { locale: Locale }) {
  const c = authContent[locale]
  const { sendReset } = useAuth()
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const email = String(new FormData(e.currentTarget).get('email'))
    const redirectTo = `${window.location.origin}${authPath(locale, 'resetar-senha')}`
    setBusy(true)
    try {
      const { error } = await sendReset(email, { redirectTo })
      if (error) throw error
    } catch (err) {
      // Always show the same neutral response (no account enumeration),
      // but never leave the failure silent.
      console.error(
        '[peragus] password reset request failed',
        err instanceof Error ? err.message : String(err),
      )
    }
    setBusy(false)
    setSent(true)
  }

  return (
    <AuthShell title={c.forgot.title} backToHome={c.backToHome} backToHomeHref={homePath(locale)}>
      {sent ? (
        <>
          <Notice tone="info" className="mt-4">
            {c.forgot.sentNotice}
          </Notice>
          <p className="mt-6 text-center text-sm">
            <Link className="text-primary underline underline-offset-4" to={authPath(locale, 'login')}>
              {c.forgot.backToLogin}
            </Link>
          </p>
        </>
      ) : (
        <form onSubmit={onSubmit} aria-busy={busy} className="mt-6">
          <div>
            <Label htmlFor="email">{c.forgot.emailLabel}</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" className="mt-1.5" />
          </div>
          <Button type="submit" disabled={busy} className="mt-6 w-full">
            {c.forgot.submit}
          </Button>
          <p className="mt-6 text-center text-sm">
            <Link className="text-tertiary underline underline-offset-4 hover:text-primary" to={authPath(locale, 'login')}>
              {c.forgot.backToLogin}
            </Link>
          </p>
        </form>
      )}
    </AuthShell>
  )
}