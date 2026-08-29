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
import { AuthShell } from '@/components/auth/AuthShell'
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
      <AuthShell title={c.register.title} backToHome={c.backToHome} backToHomeHref={homePath(locale)}>
        {sent ? (
          <>
            <Notice tone="info" className="mt-4">
              {c.register.successNotice}
            </Notice>
            <p className="mt-6 text-center text-sm">
              <Link className="text-primary underline underline-offset-4" to={authPath(locale, 'login')}>
                {c.register.footerLink}
              </Link>
            </p>
          </>
        ) : (
          <>
            {error && (
              <Notice tone="error" className="mt-4">
                {error}
              </Notice>
            )}
            <form onSubmit={onSubmit} aria-busy={busy} className="mt-6 space-y-4">
              <div>
                <Label htmlFor="email">{c.register.emailLabel}</Label>
                <Input id="email" name="email" type="email" required autoComplete="email" className="mt-1.5" />
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
                <p id="pw-hint" className="mt-1.5 text-xs leading-5 text-tertiary">
                  {c.register.passwordHint}
                </p>
              </div>
              <Button type="submit" disabled={busy} className="mt-2 w-full">
                {c.register.submit}
              </Button>
              <p className="pt-2 text-center text-sm text-secondary">
                {c.register.footer}{' '}
                <Link className="text-primary underline underline-offset-4" to={authPath(locale, 'login')}>
                  {c.register.footerLink}
                </Link>
              </p>
            </form>
          </>
        )}
      </AuthShell>
    </>
  )
}