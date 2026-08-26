import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthProvider'
import { callEdge } from '@/lib/functions'
import { authContent } from '@/content/auth'
import { appPath, authPath, homePath, type Locale } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Notice } from '@/components/ui/notice'
import { PageMetadata } from '@/components/seo/PageMetadata'

export function Register({ locale }: { locale: Locale }) {
  const c = authContent[locale]
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const password = String(fd.get('password'))
    if (password.length < 8) {
      setError(c.register.passwordHint)
      return
    }
    setBusy(true)
    setError(null)
    const { data, error: err } = await signUp(String(fd.get('email')), password)
    setBusy(false)
    if (err) {
      setError(c.register.genericError)
      return
    }
    if (data.session) {
      callEdge('send-email', {
        method: 'POST',
        body: { to: String(fd.get('email')), template: 'welcome' },
      }).catch(() => {})
      navigate(appPath(locale))
    } else setSent(true)
  }

  return (
    <>
      <PageMetadata
        locale={locale}
        title={c.seo.title}
        description={c.seo.description}
        canonicalPath={authPath(locale, 'register')}
        alternates={{
          pt: authPath('pt', 'register'),
          es: authPath('es', 'register'),
          en: authPath('en', 'register'),
        }}
      />
      <main id="main-content" tabIndex={-1} className="grid min-h-[70vh] place-items-center py-20">
        <div className="w-full max-w-md">
          {sent ? (
            <div className="rounded-lg border border-line bg-surface p-8">
              <Notice tone="info">{c.register.successNotice}</Notice>
              <p className="mt-6 text-center text-sm">
                <Link className="underline underline-offset-4" to={authPath(locale, 'login')}>
                  {c.register.footerLink}
                </Link>
              </p>
            </div>
          ) : (
            <form
              onSubmit={onSubmit}
              aria-busy={busy}
              className="rounded-lg border border-line bg-surface p-8"
            >
              <h1 className="text-2xl font-semibold tracking-tight">{c.register.title}</h1>
              {error && (
                <Notice tone="error" className="mt-4">
                  {error}
                </Notice>
              )}
              <div className="mt-6 space-y-4">
                <div>
                  <Label htmlFor="email">{c.register.emailLabel}</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="password">{c.register.passwordLabel}</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    aria-describedby="pw-hint"
                    className="mt-1.5"
                  />
                  <p id="pw-hint" className="mt-1 text-xs text-tertiary">
                    {c.register.passwordHint}
                  </p>
                </div>
              </div>
              <Button type="submit" disabled={busy} className="mt-6 w-full">
                {c.register.submit}
              </Button>
              <p className="mt-6 text-center text-sm text-secondary">
                {c.register.footer}{' '}
                <Link className="underline underline-offset-4" to={authPath(locale, 'login')}>
                  {c.register.footerLink}
                </Link>
              </p>
            </form>
          )}
          <p className="mt-4 text-center">
            <Link
              className="text-sm text-tertiary underline underline-offset-4"
              to={homePath(locale)}
            >
              {c.backToHome}
            </Link>
          </p>
        </div>
      </main>
    </>
  )
}
