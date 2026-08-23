import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export function CopyField({
  value,
  label,
  copyLabel = 'Copy',
  copiedLabel = 'Copied!',
  className,
}: {
  value: string
  label?: string
  copyLabel?: string
  copiedLabel?: string
  className?: string
}) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard unavailable (permissions/insecure context); keep field readable
    }
  }

  return (
    <div className={cn('w-full', className)}>
      {label && <p className="mb-1 text-xs font-medium text-secondary">{label}</p>}
      <div className="flex gap-2">
        <input
          readOnly
          value={value}
          aria-label={label ?? value}
          onFocus={(e) => e.currentTarget.select()}
          className="min-h-11 w-full rounded-lg border border-line bg-midnight px-3 py-2.5 font-mono text-xs text-secondary"
        />
        <Button type="button" variant="secondary" onClick={copy} className="shrink-0">
          {copied ? copiedLabel : copyLabel}
        </Button>
      </div>
    </div>
  )
}
