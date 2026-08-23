import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthProvider'
import { appContent } from '@/content/app'
import { authPath, type Locale } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Notice } from '@/components/ui/notice'
import { PageMetadata } from '@/components/seo/PageMetadata'

export function Settings({ locale }: { locale: Locale }) {
  const c = appContent[locale].settings
  const { user, updatePassword, signOut } = useAuth()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<'success' | 'mismatch' | 'generic' | null>(null)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setNotice(null)
    const form = new FormData(e.currentTarget)
    const password = String(form.get('password'))
    const confirm = String(form.get('confirm'))
    if (password.length < 8 || password !== confirm) {
      setNotice('mismatch')
      return
    }
    setBusy(true)
    try {
      await updatePassword(password)
      setNotice('success')
    } catch {
      setNotice('generic')
    } finally {
      setBusy(false)
    }
  }

  async function onSignOut() {
    await signOut()
    navigate(authPath(locale, 'login'))
  }

  return (
    <>
      <PageMetadata
        locale={locale}
        title={c.title}
        description={c.passwordTitle}
        canonicalPath={locale === 'pt' ? '/app/configuracoes' : `/${locale}/app/configuracoes`}
        alternates={{
          pt: '/app/configuracoes',
          es: '/es/app/configuracoes',
          en: '/en/app/configuracoes',
        }}
      />
      <h1 className="text-2xl font-bold">{c.title}</h1>

      <div className="mt-6 max-w-lg space-y-6">
        <div className="rounded-xl border border-line bg-surface p-5">
          <Label htmlFor="settings-email">{c.emailLabel}</Label>
          <Input id="settings-email" value={user?.email ?? ''} readOnly className="mt-1" />
        </div>

        <form onSubmit={onSubmit} aria-label={c.passwordTitle} className="space-y-4 rounded-xl border border-line bg-surface p-5">
          <h2 className="font-semibold">{c.passwordTitle}</h2>
          <div>
            <Label htmlFor="settings-password">{c.newPasswordLabel}</Label>
            <Input
              id="settings-password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="settings-confirm">{c.confirmPasswordLabel}</Label>
            <Input
              id="settings-confirm"
              name="confirm"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="mt-1"
            />
          </div>
          <Button type="submit" disabled={busy} className="w-full">
            {c.savePassword}
          </Button>
        </form>

        {notice && (
          <div role="status" aria-live="polite">
            {notice === 'success' && <Notice tone="info">{c.successNotice}</Notice>}
            {notice === 'mismatch' && <Notice tone="error">{c.mismatchError}</Notice>}
            {notice === 'generic' && <Notice tone="error">{c.genericError}</Notice>}
          </div>
        )}

        <Button variant="secondary" onClick={onSignOut}>
          {c.signOut}
        </Button>
      </div>
    </>
  )
}
