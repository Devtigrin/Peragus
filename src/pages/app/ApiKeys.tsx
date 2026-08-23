import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '@/lib/supabase'
import { appContent } from '@/content/app'
import type { Locale } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Notice } from '@/components/ui/notice'
import { PageMetadata } from '@/components/seo/PageMetadata'

interface ApiKey {
  id: string
  name: string
  key_prefix: string
  created_at: string
  last_used_at: string | null
  revoked_at: string | null
}

function formatDate(iso: string, locale: Locale) {
  const tag = locale === 'pt' ? 'pt-BR' : locale === 'es' ? 'es-419' : 'en-US'
  return new Intl.DateTimeFormat(tag, { dateStyle: 'short', timeStyle: 'short' }).format(
    new Date(iso),
  )
}

export function ApiKeys({ locale }: { locale: Locale }) {
  const c = appContent[locale].apiKeys
  const [keys, setKeys] = useState<ApiKey[] | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [freshKey, setFreshKey] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  async function load() {
    const { data, error: err } = await supabase
      .from('api_keys')
      .select('id,name,key_prefix,created_at,last_used_at,revoked_at')
      .order('created_at', { ascending: false })
    if (err) {
      setError(err.message)
    } else {
      setKeys(data as ApiKey[])
    }
  }

  useEffect(() => {
    void load()
  }, [])

  async function onCreate(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const { data, error: err } = await supabase.rpc('create_api_key', { p_name: name })
      if (err) throw err
      setFreshKey(data as unknown as string)
      setFormOpen(false)
      setName('')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  async function onRevoke(id: string) {
    setConfirmId(null)
    await supabase
      .from('api_keys')
      .update({ revoked_at: new Date().toISOString() })
      .eq('id', id)
    await load()
  }

  return (
    <>
      <PageMetadata
        locale={locale}
        title={c.title}
        description={c.description}
        canonicalPath={locale === 'pt' ? '/app/chaves-api' : `/${locale}/app/chaves-api`}
        alternates={{
          pt: '/app/chaves-api',
          es: '/es/app/chaves-api',
          en: '/en/app/chaves-api',
        }}
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{c.title}</h1>
          <p className="mt-1 max-w-prose text-sm text-secondary">{c.description}</p>
        </div>
        <Button onClick={() => setFormOpen((v) => !v)}>{formOpen ? c.cancel : c.create}</Button>
      </div>

      {formOpen && (
        <form
          onSubmit={onCreate}
          aria-label={c.create}
          className="mt-6 max-w-lg space-y-4 rounded-xl border border-line bg-surface p-5"
        >
          <div>
            <Label htmlFor="key-name">{c.nameLabel}</Label>
            <Input
              id="key-name"
              required
              maxLength={60}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="off"
            />
          </div>
          <Button type="submit" disabled={busy} className="w-full">
            {c.submitCreate}
          </Button>
        </form>
      )}

      {error && (
        <div className="mt-4 max-w-lg">
          <Notice tone="error">{error}</Notice>
        </div>
      )}

      {freshKey && (
        <div className="mt-6 max-w-xl rounded-xl border border-mint/40 bg-surface p-5">
          <Notice tone="sandbox">{c.revealWarning}</Notice>
          <code className="mt-3 block break-all rounded-lg bg-midnight p-3 font-mono text-xs text-mint">
            {freshKey}
          </code>
          <Button variant="secondary" size="sm" className="mt-3" onClick={() => setFreshKey(null)}>
            OK
          </Button>
        </div>
      )}

      {keys && keys.length === 0 && !error && (
        <p className="mt-10 rounded-xl border border-line bg-surface p-8 text-center text-secondary">
          {c.empty}{' '}
          <a href={`/${locale === 'pt' ? '' : locale + '/'}docs`} className="underline underline-offset-4">
            Docs
          </a>{' '}
          — {c.docsLink}
        </p>
      )}

      {keys && keys.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-surface text-xs uppercase tracking-wide text-secondary">
              <tr>
                {[c.headName, c.headPrefix, c.headCreated, c.headLastUsed, c.headActions].map((h) => (
                  <th key={h} scope="col" className="px-4 py-3 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(keys ?? []).map((k) => (
                <tr key={k.id} className="border-t border-line">
                  <td className="px-4 py-3">{k.name}</td>
                  <td className="px-4 py-3 font-mono text-xs">{k.key_prefix}…</td>
                  <td className="px-4 py-3 text-secondary">{formatDate(k.created_at, locale)}</td>
                  <td className="px-4 py-3 text-secondary">
                    {k.last_used_at ? formatDate(k.last_used_at, locale) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {k.revoked_at ? (
                      <span className="rounded-full border border-line px-2.5 py-0.5 font-mono text-xs uppercase text-tertiary">
                        {c.revokedChip}
                      </span>
                    ) : confirmId === k.id ? (
                      <span className="flex items-center gap-2">
                        {c.revokeConfirm}
                        <Button variant="destructive" size="sm" onClick={() => onRevoke(k.id)}>
                          {c.revoke}
                        </Button>
                      </span>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={() => setConfirmId(k.id)}>
                        {c.revoke}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
