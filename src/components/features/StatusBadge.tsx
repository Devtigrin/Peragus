import { STATUS_LABELS } from '@/constants'
import type { OperationStatus } from '@/types'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: OperationStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const colorMap: Record<OperationStatus, string> = {
    pending_payment: 'bg-yellow-50 text-yellow-400 border-yellow-200/30',
    payment_confirmed: 'bg-navy-subtle text-navy-accent border-navy-border',
    processing: 'bg-indigo-50 text-indigo-400 border-indigo-200/30',
    sent: 'bg-purple-50 text-purple-400 border-purple-200/30',
    completed: 'bg-green-subtle text-green-accent border-green-border',
    failed: 'bg-red-50 text-red-400 border-red-200/30',
    analysis: 'bg-orange-50 text-orange-400 border-orange-200/30',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-all',
        colorMap[status],
        className
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}
