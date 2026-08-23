import { cn } from '@/lib/utils'

export type SectionHeadingProps = {
  eyebrow?: string
  title: string
  description?: string
  as?: 'h1' | 'h2' | 'h3'
  align?: 'left' | 'center'
  className?: string
}

export function SectionHeading({ eyebrow, title, description, as: Tag = 'h2', align = 'left', className }: SectionHeadingProps) {
  return (
    <div className={cn(align === 'center' && 'text-center', className)}>
      {eyebrow && (
        <p className="font-mono text-xs uppercase tracking-[.14em] text-mint">{eyebrow}</p>
      )}
      <Tag className="mt-3 text-3xl font-semibold tracking-[-.04em] sm:text-4xl">{title}</Tag>
      {description && (
        <p className="mt-4 max-w-2xl text-base leading-7 text-secondary">{description}</p>
      )}
    </div>
  )
}
