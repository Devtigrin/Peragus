import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/auth/AuthProvider'
import { authContent } from '@/content/auth'
import { authPath, type Locale } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Notice } from '@/components/ui/notice'

export function ForgotPassword({ locale }: { locale: Locale }) {
  const c = authContent[locale]
  const { sendReset } = useAuth()
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const email = String(new FormData(e.currentTarget).get('email'))
    const origin = window.location.origin
    const redirectTo = `${origin}${authPath(locale, 'resetar-senha')}`
    setBusy(true)
    await sendReset(email, { redirectTo })
    setBusy(false)
    setSent(true) // always shown: no account enumeration
  }

  return (
    <main id="main-content" tabIndex={-1} className="grid min-h-[70vh] place-items-center py-20">
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-line bg-surface p-8">
          <h1 className="text-2xl font-semibold tracking-tight">{c.forgot.title}</h1>
          {sent ? (
            <>
              <Notice tone="info" className="mt-4">
                {c.forgot.sentNotice}
              </Notice>
              <p className="mt-6 text-center text-sm">
                <Link className="underline underline-offset-4" to={authPath(locale, 'login')}>
                  {c.forgot.backToLogin}
                </Link>
              </p>
            </>
          ) : (
            <form onSubmit={onSubmit} aria-busy={busy}>
              <div className="mt-6">
                <Label htmlFor="email">{c.forgot.emailLabel}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="mt-1.5"
                />
              </div>
              <Button type="submit" disabled={busy} className="mt-6 w-full">
                {c.forgot.submit}
              </Button>
              <p className="mt-6 text-center text-sm">
                <Link className="underline underline-offset-4" to={authPath(locale, 'login')}>
                  {c.forgot.backToLogin}
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}
