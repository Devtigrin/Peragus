import { cn } from '@/lib/utils'

export type NoticeProps = React.HTMLAttributes<HTMLDivElement> & {
  tone: 'info' | 'sandbox' | 'error'
}

const noticeTone = {
  info: 'border-data bg-data/10',
  sandbox: 'border-sandbox bg-sandbox/10',
  error: 'border-error bg-error/10',
}

export function Notice({ className, tone, ...props }: NoticeProps) {
  return (
    <div
      role="note"
      className={cn('rounded-(--radius-control) border-l-2 p-4 pl-4 text-sm leading-6 text-secondary', noticeTone[tone], className)}
      {...props}
    />
  )
}