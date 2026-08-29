import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { callEdge } from '@/lib/functions'
import { useAuth } from '@/auth/AuthProvider'
import { authContent } from '@/content/auth'
import { appPath, authPath, homePath, type Locale } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Notice } from '@/components/ui/notice'
import { AuthShell } from '@/components/auth/AuthShell'

export function ResetPassword({ locale }: { locale: Locale }) {
  const c = authContent[locale]
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const { recovering, updatePassword, clearRecovery } = useAuth()
  const viaRecoverySession = !token && recovering
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const pw = String(fd.get('password'))
    if (pw.length < 8 || pw !== String(fd.get('confirm'))) {
      setError(c.reset.mismatchError)
      return
    }
    setBusy(true)
    setError(null)
    try {
      if (token) {
        await callEdge<{ ok: boolean }>('confirm-reset-password', {
          method: 'POST',
          body: { token, password: pw },
          public: true,
        })
      } else {
        const { error } = await updatePassword(pw)
        if (error) throw error
        clearRecovery()
      }
      setDone(true)
    } catch {
      setError(c.reset.genericError)
    }
    setBusy(false)
  }

  if (!token && !viaRecoverySession) {
    return (
      <AuthShell title={c.reset.title} backToHome={c.backToHome} backToHomeHref={homePath(locale)}>
        <Notice tone="sandbox" className="mt-4">
          {c.reset.needNewLink}
        </Notice>
        <p className="mt-6 text-center text-sm">
          <Link className="text-primary underline underline-offset-4" to={authPath(locale, 'recuperar-senha')}>
            {c.forgot.submit}
          </Link>
        </p>
      </AuthShell>
    )
  }

  return (
    <AuthShell title={c.reset.title} backToHome={c.backToHome} backToHomeHref={homePath(locale)}>
      {done ? (
        <>
          <Notice tone="info" className="mt-4">
            {c.reset.successNotice}
          </Notice>
          <Button asChild className="mt-6 w-full">
            <Link to={appPath(locale)}>{c.reset.goToApp}</Link>
          </Button>
        </>
      ) : (
        <form onSubmit={onSubmit} aria-busy={busy} className="mt-6 space-y-4">
          {error && (
            <Notice tone="error" className="-mt-2">
              {error}
            </Notice>
          )}
          <div>
            <Label htmlFor="password">{c.reset.passwordLabel}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="confirm">{c.reset.confirmLabel}</Label>
            <Input
              id="confirm"
              name="confirm"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="mt-1.5"
            />
          </div>
          <Button type="submit" disabled={busy} className="mt-2 w-full">
            {c.reset.submit}
          </Button>
        </form>
      )}
    </AuthShell>
  )
}