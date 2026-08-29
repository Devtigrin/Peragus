import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-(--radius-control) px-4 text-sm font-semibold transition-colors duration-150 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40',
  {
    variants: {
      variant: {
        primary: 'bg-mint text-[#08211e] hover:bg-[#67e7c8]',
        secondary: 'border border-line bg-transparent text-primary hover:border-mint/60 hover:bg-surface',
        ghost: 'text-secondary hover:text-primary',
        destructive: 'border border-error/40 bg-error/10 text-error hover:bg-error/20',
      },
      size: {
        default: 'h-11 px-4',
        sm: 'h-11 px-3 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'h-11 w-11 px-0',
      },
    },
    defaultVariants: { variant: 'primary', size: 'default' },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

// eslint-disable-next-line react-refresh/only-export-components
export { Button, buttonVariants }