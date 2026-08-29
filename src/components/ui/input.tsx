import * as React from 'react'
import { cn } from '@/lib/utils'

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex min-h-11 w-full rounded-(--radius-control) border border-line bg-midnight px-4 py-3 text-sm text-primary placeholder:text-tertiary transition-colors duration-150 focus-visible:border-mint/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-mint/40 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-error',
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Input.displayName = 'Input'

export { Input }