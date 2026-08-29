import { Surface } from '@/components/ui/surface'
import { cn } from '@/lib/utils'
import type { HomeContent } from '@/content/home'

type PanelContent = HomeContent['eventPanel']

function FieldRow({ tag, label, value, highlight = false }: { tag: string; label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 border-b border-hairline px-5 py-3 last:border-0">
      <dt className="flex items-center gap-2 font-mono text-xs font-medium text-tertiary">
        <span aria-hidden="true" className={cn('h-1 w-1 rounded-full', highlight ? 'bg-mint' : 'bg-mint/60')} />
        {tag}
      </dt>
      <dt className="font-mono text-[11px] uppercase tracking-[.1em] text-tertiary">{label}</dt>
      <dd
        className={cn(
          'min-w-0 flex-1 basis-full break-words text-right font-mono text-xs leading-relaxed text-primary sm:basis-auto',
          highlight && 'font-display text-[15px] font-semibold tracking-[-0.01em] text-mint',
        )}
      >
        {value}
      </dd>
    </div>
  )
}

export function SettlementEventPanel({ content }: { content: PanelContent }) {
  const fields = [
    { tag: ':20:', label: content.reference, value: content.referenceValue },
    { tag: ':32A:', label: content.amount, value: content.amountValue, highlight: true },
    { tag: ':58A:', label: content.wallet, value: `${content.walletValue} · ${content.walletHint}` },
  ]
  const trail = [
    { event: 'payment.created', note: '' },
    { event: 'pix.confirmed', note: content.simulated },
    { event: 'settlement.sent', note: '' },
  ]

  return (
    <Surface elevation="raised" className="overflow-hidden shadow-panel">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-3.5">
        <p className="font-mono text-xs font-medium tracking-wide text-secondary">{content.operation}</p>
        <p className="font-mono text-[11px] uppercase tracking-[.12em] text-sandbox">
          {content.environment} · {content.network}
        </p>
      </div>

      <dl>
        {fields.map((field) => (
          <FieldRow key={field.tag} {...field} />
        ))}
      </dl>

      <div className="border-t border-line px-5 py-3.5">
        <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[.1em] text-tertiary">
          <span aria-hidden="true" className="h-1 w-1 rounded-full bg-mint/60" />
          :70: {content.trail}
        </p>
        <ol className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1.5 font-mono text-xs">
          {trail.map((step, index) => (
            <li key={step.event} className="flex items-center gap-2">
              {index > 0 && <span aria-hidden="true" className="text-tertiary">→</span>}
              <span className={index === trail.length - 1 ? 'text-mint' : 'text-secondary'}>{step.event}</span>
              {step.note && (
                <span className="text-[10px] uppercase tracking-[.12em] text-sandbox">{step.note}</span>
              )}
            </li>
          ))}
        </ol>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-line bg-surface px-5 py-4">
        <span aria-hidden="true" className="grid h-4 w-4 shrink-0 place-items-center">
          <span className="h-2 w-2 rounded-full border border-mint/70" />
        </span>
        <span aria-hidden="true" className="settle-wire h-px min-w-8 flex-1 bg-mint/60" />
        <span aria-hidden="true" className="settle-node--live h-3 w-3 shrink-0 rounded-full bg-mint" />
        <p className="shrink-0 font-mono text-xs text-secondary">
          {content.settlement} <span className="text-tertiary">· {content.network}</span>
        </p>
      </div>
    </Surface>
  )
}