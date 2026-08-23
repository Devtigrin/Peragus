import { cn } from '@/lib/utils'

export type NoticeProps = React.HTMLAttributes<HTMLDivElement> & {
  tone: 'info' | 'sandbox' | 'error'
}

const noticeTone = {
  info: 'border-data bg-data/10 text-secondary',
  sandbox: 'border-sandbox bg-sandbox/10 text-secondary',
  error: 'border-error bg-error/10 text-secondary',
}

export function Notice({ className, tone, ...props }: NoticeProps) {
  return (
    <div
      role="note"
      className={cn('rounded-lg border-l-4 p-4 text-sm', noticeTone[tone], className)}
      {...props}
    />
  )
}
