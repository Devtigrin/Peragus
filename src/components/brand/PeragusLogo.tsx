import { cn } from '@/lib/utils'

interface PeragusMarkProps {
  className?: string
}

interface PeragusLogoProps extends PeragusMarkProps {
  textClassName?: string
  tagline?: boolean
}

export function PeragusMark({ className }: PeragusMarkProps) {
  return (
    <svg className={cn('h-9 w-9', className)} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <rect width="64" height="64" rx="16" fill="#0A1F44" />
      <path d="M20 16h22c7 0 12 4.8 12 11.6S49 39.5 42 39.5H31V52H20V16Z" fill="url(#p-main)" />
      <path d="M13 34h12c9 0 12-10 20-10h8" stroke="#14B8A6" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M13 25h30" stroke="#2563EB" strokeWidth="4.5" strokeLinecap="round" />
      <circle cx="13" cy="34" r="3.5" fill="#14B8A6" />
      <circle cx="13" cy="25" r="3.5" fill="#2563EB" />
      <defs>
        <linearGradient id="p-main" x1="18" y1="14" x2="45" y2="52" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2563EB" />
          <stop offset="0.62" stopColor="#3B82F6" />
          <stop offset="1" stopColor="#14B8A6" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function PeragusLogo({ className, textClassName, tagline = false }: PeragusLogoProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <PeragusMark />
      <div className="leading-none">
        <span className={cn('block text-xl font-bold tracking-tight text-text-primary', textClassName)}>Peragus</span>
        {tagline && (
          <span className="mt-1 block text-[10px] font-medium uppercase tracking-[0.18em] text-text-tertiary">
            Pagamentos cross-border
          </span>
        )}
      </div>
    </div>
  )
}
