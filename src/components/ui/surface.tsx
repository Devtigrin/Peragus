import { cn } from '@/lib/utils'

export type SurfaceProps = React.HTMLAttributes<HTMLDivElement> & {
  elevation?: 'base' | 'raised'
}

export function Surface({ className, elevation = 'base', ...props }: SurfaceProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-line',
        elevation === 'base' ? 'bg-surface' : 'bg-surface-raised',
        className,
      )}
      {...props}
    />
  )
}
