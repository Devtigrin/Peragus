import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { callEdge } from '@/lib/functions'
import { authContent } from '@/content/auth'
import { appPath, authPath, type Locale } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Notice } from '@/components/ui/notice'

export function ResetPassword({ locale }: { locale: Locale }) {
  const c = authContent[locale]
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
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
      await callEdge<{ ok: boolean }>('confirm-reset-password', {
        method: 'POST',
        body: { token, password: pw },
        public: true,
      })
      setDone(true)
    } catch {
      setError(c.reset.genericError)
    }
    setBusy(false)
  }

  if (!token) {
    return (
      <main id="main-content" tabIndex={-1} className="grid min-h-[70vh] place-items-center py-20">
        <div className="w-full max-w-md rounded-lg border border-line bg-surface p-8">
          <Notice tone="sandbox">{c.reset.needNewLink}</Notice>
          <p className="mt-6 text-center text-sm">
            <Link className="underline underline-offset-4" to={authPath(locale, 'recuperar-senha')}>
              {c.forgot.submit}
            </Link>
          </p>
        </div>
      </main>
    )
  }

  return (
    <main id="main-content" tabIndex={-1} className="grid min-h-[70vh] place-items-center py-20">
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-line bg-surface p-8">
          <h1 className="text-2xl font-semibold tracking-tight">{c.reset.title}</h1>
          {done ? (
            <>
              <Notice tone="info" className="mt-4">
                {c.reset.successNotice}
              </Notice>
              <Button asChild className="mt-6 w-full">
                <a href={appPath(locale)}>{c.reset.goToApp}</a>
              </Button>
            </>
          ) : (
            <form onSubmit={onSubmit} aria-busy={busy}>
              {error && (
                <Notice tone="error" className="mt-4">
                  {error}
                </Notice>
              )}
              <div className="mt-6 space-y-4">
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
              </div>
              <Button type="submit" disabled={busy} className="mt-6 w-full">
                {c.reset.submit}
              </Button>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}
