import { AlertTriangle, Shield } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface SecurityAlertProps {
  type: 'warning' | 'info' | 'critical'
  title: string
  description: string
}

export function SecurityAlert({ type, title, description }: SecurityAlertProps) {
  const styles = {
    warning: {
      bg: 'bg-yellow-50/40 border-yellow-200/20',
      icon: 'text-yellow-500',
      title: 'text-yellow-500',
      desc: 'text-text-secondary',
    },
    info: {
      bg: 'bg-navy-subtle/60 border-navy-border',
      icon: 'text-navy-500',
      title: 'text-navy-500',
      desc: 'text-text-secondary',
    },
    critical: {
      bg: 'bg-red-50/40 border-red-200/20',
      icon: 'text-red-500',
      title: 'text-red-500',
      desc: 'text-text-secondary',
    },
  }

  const s = styles[type]

  return (
    <Card className={cn('border', s.bg)}>
      <CardContent className="flex items-start gap-3 p-4">
        {type === 'info' ? (
          <Shield className={cn('h-5 w-5 mt-0.5 shrink-0', s.icon)} />
        ) : (
          <AlertTriangle className={cn('h-5 w-5 mt-0.5 shrink-0', s.icon)} />
        )}
        <div className="space-y-1">
          <p className={cn('text-sm font-medium', s.title)}>{title}</p>
          <p className={cn('text-xs', s.desc)}>{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}