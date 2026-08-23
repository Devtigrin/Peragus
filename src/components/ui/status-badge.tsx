import { cn } from '@/lib/utils'

export type StatusBadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone: 'active' | 'data' | 'sandbox'
}

const statusTone = {
  active: 'bg-mint/15 text-mint',
  data: 'bg-data/15 text-data',
  sandbox: 'bg-sandbox/15 text-sandbox',
}

export function StatusBadge({ className, tone, ...props }: StatusBadgeProps) {
  return (
    <span
      className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', statusTone[tone], className)}
      {...props}
    />
  )
}
