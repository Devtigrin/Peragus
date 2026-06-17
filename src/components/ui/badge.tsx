import { forwardRef, type HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors border',
  {
    variants: {
      variant: {
        default: 'bg-gray-100 text-text-secondary border-border',
        success: 'bg-green-subtle text-green-accent border-green-border',
        warning: 'bg-yellow-50 text-yellow-400 border-yellow-200/30',
        error: 'bg-red-50 text-red-400 border-red-200/30',
        info: 'bg-navy-subtle text-navy-accent border-navy-border',
        processing: 'bg-indigo-50 text-indigo-400 border-indigo-200/30',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant }), className)}
        {...props}
      />
    )
  }
)
Badge.displayName = 'Badge'

export { Badge }
