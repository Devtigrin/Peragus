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
  try {
    return new Intl.DateTimeFormat(tag, { dateStyle: 'short', timeStyle: 'short' }).format(
      new Date(iso),
    )
  } catch {
    return iso
  }
}

function toUserMessage(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err ?? '')
  if (/permission denied/i.test(raw)) {
    // never expose internal pg errors to the end user
    if (typeof console !== 'undefined') console.error('[peragus:api_keys] permission denied:', raw)
    return 'Não foi possível realizar a operação. Tente novamente.'
  }
  if (/not authenticated|unauthenticated|jwt/i.test(raw)) {
    return 'Sessão expirada. Faça login novamente.'
  }
  // keep short, safe messages; log full detail for debugging
  if (raw.length > 200) {
    if (typeof console !== 'undefined') console.error('[peragus:api_keys]', raw)
    return 'Não foi possível completar a operação. Tente novamente.'
  }
  return raw || 'Não foi possível completar a operação. Tente novamente.'
}

function extractRawKey(data: unknown): string | null {
  if (!data) return null
  if (typeof data === 'string') return data
  if (Array.isArray(data) && data.length > 0) {
    const first = data[0] as Record<string, unknown>
    if (first && typeof first.key === 'string') return first.key
    if (first && typeof first.key === 'string') return first.key as string
  }
  if (typeof data === 'object' && data !== null && 'key' in data) {
    const v = (data as Record<string, unknown>).key
    if (typeof v === 'string') return v
  }
  return null
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
    try {
      const { data, error: err } = await supabase
        .from('api_keys')
        .select('id,name,key_prefix,created_at,last_used_at,revoked_at')
        .order('created_at', { ascending: false })
      if (err) {
        setError(toUserMessage(err))
        return
      }
      setKeys((data ?? []) as ApiKey[])
      setError('')
    } catch (err) {
      setError(toUserMessage(err))
    }
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { data, error: err } = await supabase
          .from('api_keys')
          .select('id,name,key_prefix,created_at,last_used_at,revoked_at')
          .order('created_at', { ascending: false })
        if (cancelled) return
        if (err) {
          setError(toUserMessage(err))
        } else {
          setKeys((data ?? []) as ApiKey[])
          setError('')
        }
      } catch (err: unknown) {
        if (cancelled) return
        setError(toUserMessage(err))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  async function onCreate(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const trimmed = name.trim()
      if (!trimmed) {
        setError('Informe um nome para a chave.')
        return
      }
      const { data, error: err } = await supabase.rpc('create_api_key', { p_name: trimmed })
      if (err) throw err
      const raw = extractRawKey(data)
      if (!raw) {
        throw new Error('Não foi possível gerar a chave de API. Tente novamente.')
      }
      setFreshKey(raw)
      setFormOpen(false)
      setName('')
      await load()
    } catch (err) {
      setError(toUserMessage(err))
    } finally {
      setBusy(false)
    }
  }

  async function onRevoke(id: string) {
    setConfirmId(null)
    setError('')
    try {
      // Prefer secure RPC; fallback to direct update if RPC not yet deployed (backward compat)
      const rpc = await supabase.rpc('revoke_api_key', { p_id: id })
      if (rpc.error) {
        // If RPC missing (404) fallback to direct update for legacy envs
        const msg = String(rpc.error.message ?? '')
        if (/not found|does not exist|PGRST/i.test(msg)) {
          const { error: updErr } = await supabase
            .from('api_keys')
            .update({ revoked_at: new Date().toISOString() })
            .eq('id', id)
          if (updErr) throw updErr
        } else {
          throw rpc.error
        }
      }
      await load()
    } catch (err) {
      setError(toUserMessage(err))
      try {
        await load()
      } catch {
        // load already surfaces its own error via setError
      }
    }
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
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-[-0.02em] text-primary">{c.title}</h1>
          <p className="mt-1.5 max-w-prose text-sm text-secondary">{c.description}</p>
        </div>
        <Button onClick={() => setFormOpen((v) => !v)}>{formOpen ? c.cancel : c.create}</Button>
      </div>

      {formOpen && (
        <form
          onSubmit={onCreate}
          aria-label={c.create}
          className="mt-6 max-w-lg space-y-4 rounded-(--radius-panel) border border-line bg-surface/60 p-5"
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
              className="mt-1.5"
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
        <div className="mt-6 max-w-xl rounded-(--radius-panel) border border-mint/40 bg-surface p-5">
          <Notice tone="sandbox">{c.revealWarning}</Notice>
          <code className="mt-3 block break-all rounded-(--radius-control) border border-hairline bg-midnight p-3 font-mono text-xs text-mint">
            {freshKey}
          </code>
          <Button variant="secondary" size="sm" className="mt-3" onClick={() => setFreshKey(null)}>
            OK
          </Button>
        </div>
      )}

      {keys && keys.length === 0 && !error && (
        <div className="mt-8 rounded-(--radius-panel) border border-line bg-surface/40 p-8 text-center">
          <p className="mx-auto max-w-sm text-sm leading-6 text-secondary">
            {c.empty}{' '}
            <a href={locale === 'pt' ? '/app/docs' : `/${locale}/app/docs`} className="text-primary underline underline-offset-4">
              Docs
            </a>{' '}
            — {c.docsLink}
          </p>
        </div>
      )}

      {keys && keys.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-(--radius-panel) border border-line">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="font-mono text-[11px] uppercase tracking-[.1em] text-tertiary">
              <tr className="border-b border-line">
                {[c.headName, c.headPrefix, c.headCreated, c.headLastUsed, c.headActions].map((h) => (
                  <th key={h} scope="col" className="px-4 py-3 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(keys ?? []).map((k) => (
                <tr key={k.id} className="border-b border-hairline last:border-b-0">
                  <td className="px-4 py-3.5">{k.name}</td>
                  <td className="px-4 py-3.5 font-mono text-xs">{k.key_prefix}…</td>
                  <td className="px-4 py-3.5 text-secondary">{formatDate(k.created_at, locale)}</td>
                  <td className="px-4 py-3.5 text-secondary">
                    {k.last_used_at ? formatDate(k.last_used_at, locale) : '—'}
                  </td>
                  <td className="px-4 py-3.5">
                    {k.revoked_at ? (
                      <span className="rounded border border-line px-2 py-0.5 font-mono text-[11px] uppercase tracking-[.08em] text-tertiary">
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
