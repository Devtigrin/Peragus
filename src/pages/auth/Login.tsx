import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthProvider'
import { authContent } from '@/content/auth'
import { appPath, authPath, homePath, type Locale } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Notice } from '@/components/ui/notice'
import { AuthShell } from '@/components/auth/AuthShell'
import { PageMetadata } from '@/components/seo/PageMetadata'

export function Login({ locale }: { locale: Locale }) {
  const c = authContent[locale]
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setBusy(true)
    setError(null)
    const { error: err } = await signIn(String(fd.get('email')), String(fd.get('password')))
    setBusy(false)
    if (err) {
      setError(c.login.genericError)
      return
    }
    navigate(appPath(locale))
  }

  return (
    <>
      <PageMetadata
        locale={locale}
        title={c.seo.title}
        description={c.seo.description}
        canonicalPath={authPath(locale, 'login')}
        alternates={{ pt: authPath('pt', 'login'), es: authPath('es', 'login'), en: authPath('en', 'login') }}
      />
      <AuthShell title={c.login.title} backToHome={c.backToHome} backToHomeHref={homePath(locale)}>
        {error && (
          <Notice tone="error" className="mt-4">
            {error}
          </Notice>
        )}
        <form onSubmit={onSubmit} aria-busy={busy} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="email">{c.login.emailLabel}</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="password">{c.login.passwordLabel}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="current-password"
              className="mt-1.5"
            />
            <p className="mt-2 text-right text-sm">
              <Link className="text-tertiary underline underline-offset-4 hover:text-primary" to={authPath(locale, 'recuperar-senha')}>
                {c.login.forgotPassword}
              </Link>
            </p>
          </div>
          <Button type="submit" disabled={busy} className="mt-2 w-full">
            {c.login.submit}
          </Button>
          <p className="pt-2 text-center text-sm text-secondary">
            {c.login.footer}{' '}
            <Link className="text-primary underline underline-offset-4" to={authPath(locale, 'register')}>
              {c.login.footerLink}
            </Link>
          </p>
        </form>
      </AuthShell>
    </>
  )
}