import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

type WireRevealProps = {
  label?: string
  className?: string
}

export function WireReveal({ label, className }: WireRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [revealed, setRevealed] = useState(() => typeof IntersectionObserver === 'undefined')

  useEffect(() => {
    const node = ref.current
    if (!node || revealed) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setRevealed(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [revealed])

  return (
    <div ref={ref} aria-hidden="true" className={cn('flex items-center gap-3', className)}>
      {label && (
        <span className="shrink-0 font-mono text-[11px] uppercase tracking-[.14em] text-tertiary">
          {label}
        </span>
      )}
      <span
        className={cn(
          'h-px min-w-8 flex-1 origin-left bg-mint/60 opacity-0',
          !revealed && 'bg-hairline',
          revealed && 'settle-wire--left',
        )}
      />
      <span
        className={cn(
          'h-2 w-2 shrink-0 rounded-full border border-mint/70',
          revealed && 'settle-node--live bg-mint',
          !revealed && 'border-line',
        )}
      />
    </div>
  )
}