import { cn } from '@/lib/utils'
import peragusLogo from '@/assets/peragus-logo.png'

interface PeragusMarkProps {
  className?: string
}

interface PeragusLogoProps extends PeragusMarkProps {
  wordClassName?: string
  tagline?: boolean
}

export function PeragusMark({ className }: PeragusMarkProps) {
  return (
    <img
      src={peragusLogo}
      alt=""
      aria-hidden="true"
      className={cn('h-8 w-auto shrink-0 object-contain', className)}
    />
  )
}

export function PeragusLogo({ className, wordClassName, tagline = false }: PeragusLogoProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <PeragusMark className={tagline ? 'h-12 sm:h-14' : 'h-8'} />
      <div className="leading-none">
        <span aria-hidden="true" className={cn('text-xl font-bold tracking-tight text-primary', wordClassName)}>
          eragus
        </span>
        {tagline && (
          <span aria-hidden="true" className="mt-1.5 block text-[10px] font-medium uppercase tracking-[0.18em] text-tertiary">
            Infraestrutura de liquidação
          </span>
        )}
      </div>
      <span className="sr-only">Peragus</span>
    </div>
  )
}