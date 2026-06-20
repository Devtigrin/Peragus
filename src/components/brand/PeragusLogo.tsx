import { cn } from '@/lib/utils'
import peragusLogo from '@/assets/peragus-logo.png'

interface PeragusMarkProps {
  className?: string
}

interface PeragusLogoProps extends PeragusMarkProps {
  textClassName?: string
  tagline?: boolean
}

export function PeragusMark({ className }: PeragusMarkProps) {
  return (
    <img
      src={peragusLogo}
      alt=""
      aria-hidden="true"
      className={cn('h-9 w-auto shrink-0 object-contain', className)}
    />
  )
}

export function PeragusLogo({ className, textClassName, tagline = false }: PeragusLogoProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <PeragusMark className={tagline ? 'h-14 sm:h-16' : 'h-9'} />
      <div className="leading-none">
        <span aria-hidden="true" className={cn('block text-xl font-bold tracking-tight text-text-primary', textClassName)}>
          eragus
        </span>
        {tagline && (
          <span aria-hidden="true" className="mt-1 block text-[10px] font-medium uppercase tracking-[0.18em] text-text-tertiary">
            Infraestrutura de liquidação
          </span>
        )}
      </div>
      <span className="sr-only">Peragus</span>
    </div>
  )
}
