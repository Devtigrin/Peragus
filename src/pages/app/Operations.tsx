import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { callEdge } from '@/lib/functions'
import { appContent } from '@/content/app'
import type { Locale } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Notice } from '@/components/ui/notice'
import { PageMetadata } from '@/components/seo/PageMetadata'
import { StatusBadge } from '@/components/app/StatusBadge'
import { CopyField } from '@/components/app/CopyField'
import { cn } from '@/lib/utils'
import type { Operation } from '@/types/operation'
import { ACTIVE_STATUSES } from '@/types/operation'
import { validateAmount, validateEvmWallet } from '@/lib/operationValidation'

const POLL_MS = 3000
const ACTIVE = ACTIVE_STATUSES

function formatAmount(op: Operation) {
  return `${op.usdt_amount_text ?? ''} ${op.token_symbol}`.trim()
}

function formatDate(iso: string, locale: Locale) {
  const tag = locale === 'pt' ? 'pt-BR' : locale === 'es' ? 'es-419' : 'en-US'
  return new Intl.DateTimeFormat(tag, { dateStyle: 'short', timeStyle: 'short' }).format(
    new Date(iso),
  )
}

function LedgerRow({ label, value, mono = true }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-t border-hairline pt-2.5">
      <dt className="font-mono text-[11px] uppercase tracking-[.08em] text-tertiary">{label}</dt>
      <dd className={cn('min-w-0 truncate text-xs text-secondary', mono && 'font-mono')}>{value}</dd>
    </div>
  )
}

export function Operations({ locale }: { locale: Locale }) {
  const c = appContent[locale].operations
  const [operations, setOperations] = useState<Operation[] | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [creating, setCreating] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [wallet, setWallet] = useState('')
  const [createError, setCreateError] = useState('')
  // Idempotencia: request_id e gerado uma vez quando o formulario e aberto e
  // reutilizado em qualquer retry da MESMA tentativa, para o backend deduplicar.
  const [requestId, setRequestId] = useState<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const load = useCallback(async () => {
    try {
      const data = await callEdge<{ operations: Operation[] }>('list-operations')
      setOperations(data.operations)
      setLoadError(false)
      return data.operations
    } catch {
      setLoadError(true)
      return null
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    callEdge<{ operations: Operation[] }>('list-operations')
      .then((data) => {
        if (cancelled) return
        setOperations(data.operations)
        setLoadError(false)
      })
      .catch(() => {
        if (!cancelled) setLoadError(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!operations?.some((op) => ACTIVE.includes(op.status))) {
      if (pollRef.current) clearInterval(pollRef.current)
      pollRef.current = null
      return
    }
    if (!pollRef.current) {
      pollRef.current = setInterval(() => void load(), POLL_MS)
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [operations, load])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    // Double-submit: ignora novos cliques enquanto uma criacao esta em andamento.
    if (creating) return
    if (!validateAmount(amount)) {
      setCreateError(c.createErrorInvalidAmount)
      return
    }
    if (!validateEvmWallet(wallet)) {
      setCreateError(c.createErrorInvalidWallet)
      return
    }
    setCreateError('')
    setCreating(true)
    // Reutiliza o request_id da tentativa em andamento; se nao houver, gera um
    // novo. Isso preserva a idempotencia em retry da MESMA tentativa.
    const idempotencyKey = requestId ?? crypto.randomUUID()
    if (!requestId) setRequestId(idempotencyKey)
    try {
      await callEdge('create-operation', {
        method: 'POST',
        body: {
          amount: amount.trim().replace(',', '.'),
          receiver_wallet: wallet.trim(),
          request_id: idempotencyKey,
        },
      })
      await load()
      setFormOpen(false)
      setAmount('')
      setWallet('')
      setRequestId(null)
    } catch (err) {
      // Mantem o request_id: um retry/re-submit da mesma tentativa nao deve
      // duplicar a operacao no backend.
      setCreateError(err instanceof Error ? err.message : c.createError)
    } finally {
      setCreating(false)
    }
  }

  async function confirmPix(id: string) {
    try {
      await callEdge('confirm-pix', { method: 'POST', body: { operation_id: id } })
      await load()
    } catch {
      await load()
    }
  }

  function openForm() {
    setCreateError('')
    setFormOpen(true)
    setRequestId(crypto.randomUUID())
  }

  function closeForm() {
    if (creating) return
    setFormOpen(false)
    setCreateError('')
    setAmount('')
    setWallet('')
    setRequestId(null)
  }

  return (
    <>
      <PageMetadata
        locale={locale}
        title={c.title}
        description={c.description}
        canonicalPath={locale === 'pt' ? '/app' : `/${locale}/app`}
        alternates={{ pt: '/app', es: '/es/app', en: '/en/app' }}
      />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-[-0.02em] text-primary">{c.title}</h1>
          <p className="mt-1.5 max-w-prose text-sm text-secondary">{c.description}</p>
        </div>
        <Button onClick={formOpen ? closeForm : openForm}>
          {formOpen ? c.cancel : c.newOperation}
        </Button>
      </div>

      {formOpen && (
        <form
          onSubmit={onSubmit}
          className="mt-6 max-w-lg space-y-4 rounded-(--radius-panel) border border-line bg-surface/60 p-5"
          aria-label={c.newOperation}
        >
          <div>
            <Label htmlFor="op-amount">{c.amountLabel}</Label>
            <Input
              id="op-amount"
              inputMode="decimal"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="25.00"
              autoComplete="off"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="op-wallet">{c.receiverWalletLabel}</Label>
            <Input
              id="op-wallet"
              required
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              placeholder="0x…"
              autoComplete="off"
              spellCheck={false}
              className="mt-1.5 font-mono"
            />
            <p className="mt-1.5 text-xs leading-5 text-tertiary">{c.requestIdHint}</p>
          </div>
          {requestId && (
            <div className="rounded-(--radius-control) border border-hairline bg-midnight/40 px-3 py-2.5">
              <dt className="font-mono text-[11px] uppercase tracking-[.08em] text-tertiary">
                {c.requestIdLabel}
              </dt>
              <dd className="mt-1 font-mono text-xs text-secondary">{requestId}</dd>
            </div>
          )}
          <Button type="submit" disabled={creating} className="w-full">
            {creating ? c.creating : c.submit}
          </Button>
        </form>
      )}
      {createError && (
        <div className="mt-4 max-w-lg">
          <Notice tone="error">{createError}</Notice>
        </div>
      )}

      {loadError && (
        <div className="mt-6 flex max-w-lg flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Notice tone="error">{c.loadError}</Notice>
          <Button variant="secondary" size="sm" onClick={() => void load()} className="shrink-0">
            {c.loadErrorCta}
          </Button>
        </div>
      )}

      {operations === null && !loadError && (
        <div aria-hidden="true" className="mt-8 overflow-hidden rounded-(--radius-panel) border border-hairline">
          <p className="sr-only">{c.loading}</p>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse border-b border-hairline p-5 last:border-b-0">
              <div className="h-4 w-40 rounded bg-surface-raised/60" />
              <div className="mt-4 space-y-2.5">
                <div className="h-3 w-full rounded bg-surface" />
                <div className="h-3 w-2/3 rounded bg-surface" />
              </div>
            </div>
          ))}
        </div>
      )}

      {operations && operations.length === 0 && (
        <div className="mt-8 rounded-(--radius-panel) border border-line bg-surface/40 p-8 text-center">
          <p className="mx-auto max-w-sm text-sm leading-6 text-secondary">{c.empty}</p>
          <Button className="mt-5" variant="secondary" onClick={openForm}>
            {c.emptyCta}
          </Button>
        </div>
      )}

      {operations && operations.length > 0 && (
        <ul className="mt-8 overflow-hidden rounded-(--radius-panel) border border-line">
          {(operations ?? []).map((op) => (
            <li key={op.id} className="border-b border-hairline p-5 last:border-b-0 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="font-mono text-sm font-semibold text-primary">{formatAmount(op)}</span>
                <StatusBadge status={op.status} locale={locale} />
              </div>

              <dl className="mt-4 grid gap-x-8 gap-y-2.5">
                <LedgerRow label={appContent[locale].operations.tableHeadCreated} value={formatDate(op.created_at, locale)} mono={false} />
                <LedgerRow label={c.receiverWallet} value={op.receiver_wallet ?? '—'} />
              </dl>

              {ACTIVE.includes(op.status) && op.status !== 'created' && (
                <p className="mt-3 flex items-center gap-2 text-xs text-data" role="status">
                  <span aria-hidden="true" className="h-1 w-1 rounded-full bg-data" />
                  {c.pollingNote}
                </p>
              )}

              {op.pix_code && op.status === 'created' && (
                <div className="mt-4 grid gap-3">
                  <CopyField value={op.pix_code} label={c.pixCode} copyLabel={c.copy} copiedLabel={c.copied} />
                  <Button variant="primary" size="sm" className="justify-self-start" onClick={() => confirmPix(op.id)}>
                    {c.confirmPix}
                  </Button>
                </div>
              )}

              {op.tx_hash && (
                <div className="mt-4 grid gap-3">
                  <CopyField value={op.tx_hash} label={c.txHash} copyLabel={c.copy} copiedLabel={c.copied} />
                  <a
                    href={`https://amoy.polygonscan.com/tx/${op.tx_hash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center py-2.5 font-mono text-xs text-mint underline underline-offset-4"
                  >
                    {c.explorerLink}
                  </a>
                </div>
              )}

              {op.error_message && (
                <p className="mt-3 font-mono text-xs text-error" role="alert">
                  {c.errorDetail}: {op.error_message}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  )
}