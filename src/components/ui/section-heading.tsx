import { cn } from '@/lib/utils'

export type SectionHeadingProps = {
  eyebrow?: string
  title: string
  description?: string
  as?: 'h1' | 'h2' | 'h3'
  align?: 'left' | 'center'
  track?: boolean
  className?: string
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  as: Tag = 'h2',
  align = 'left',
  track = false,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        align === 'center' && 'text-center',
        track && 'flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-14',
        className,
      )}
    >
      <div className={cn(track && 'max-w-2xl')}>
        {eyebrow && (
          <p className={cn('flex items-center gap-2.5 font-mono text-xs uppercase tracking-[.14em] text-tertiary', align === 'center' && 'justify-center')}>
            <span aria-hidden="true" className="h-px w-6 bg-mint/70" />
            {eyebrow}
          </p>
        )}
        <Tag className="mt-4 font-display text-[clamp(1.6rem,3.4vw,2.6rem)] font-semibold leading-[1.12] tracking-[-0.01em] text-primary">
          {title}
        </Tag>
        {description && (
          <p className="mt-4 max-w-2xl text-base leading-7 text-secondary">{description}</p>
        )}
      </div>
      {track && <span aria-hidden="true" className="hidden h-px flex-1 self-center bg-hairline lg:block" />}
    </div>
  )
}