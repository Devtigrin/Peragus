import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold tracking-[-0.01em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 press-effect',
  {
    variants: {
      variant: {
        default: 'bg-[#2563EB] text-actual-white hover:bg-[#1D4ED8] shadow-sm hover:shadow-md',
        destructive: 'bg-red-500 text-actual-white hover:bg-red-600',
        outline: 'border border-border bg-card text-text-secondary hover:bg-surface-hover hover:text-text-primary hover:border-border-hover',
        secondary: 'bg-surface-elevated text-text-primary hover:bg-surface-hover',
        ghost: 'text-text-secondary hover:text-text-primary hover:bg-surface-hover',
        link: 'text-green-accent underline-offset-4 hover:underline',
        navy: 'bg-black text-actual-white hover:bg-gray-800 shadow-sm hover:shadow-md',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-12 rounded-lg px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button }
