import { cn } from '@/lib/utils'
import type { Locale } from '@/i18n/routing'
import { appContent } from '@/content/app'
import type { OperationStatus } from '@/types/operation'

const VARIANT: Record<OperationStatus, string> = {
  confirmed: 'bg-mint/15 text-mint border-mint/30',
  failed: 'bg-error/10 text-error border-error/30',
  created: 'bg-surface text-secondary border-line',
  pix_pending: 'bg-surface text-secondary border-line',
  pix_confirmed: 'bg-amber-400/10 text-amber-300 border-amber-400/30',
  settling: 'bg-sky-400/10 text-sky-300 border-sky-400/30',
}

export function StatusBadge({ status, locale }: { status: OperationStatus; locale: Locale }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-xs uppercase tracking-wide',
        VARIANT[status],
      )}
    >
      {appContent[locale].statuses[status]}
    </span>
  )
}
