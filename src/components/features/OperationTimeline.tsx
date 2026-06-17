import type { OperationStatus } from '@/types'
import { STATUS_LABELS } from '@/constants'
import { CheckCircle2, Circle, Clock, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TimelineStep {
  status: OperationStatus
  label: string
  isReached: boolean
  isCurrent: boolean
}

interface OperationTimelineProps {
  currentStatus: OperationStatus
}

const statusOrder: OperationStatus[] = [
  'pending_payment',
  'payment_confirmed',
  'processing',
  'sent',
  'completed',
]

const failedStatuses: OperationStatus[] = ['failed', 'analysis']

export function OperationTimeline({ currentStatus }: OperationTimelineProps) {
  const isFailed = failedStatuses.includes(currentStatus)
  const currentIdx = statusOrder.indexOf(currentStatus)

  const steps: TimelineStep[] = statusOrder.map((status, idx) => ({
    status,
    label: STATUS_LABELS[status],
    isReached: idx <= currentIdx && !isFailed,
    isCurrent: idx === currentIdx && !isFailed,
  }))

  if (isFailed) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center gap-3 text-red-500">
          <XCircle className="h-6 w-6" />
          <div>
            <p className="font-medium">
              {currentStatus === 'failed' ? 'Operação falhou' : 'Operação em análise'}
            </p>
            <p className="text-sm text-text-secondary">
              {currentStatus === 'failed'
                ? 'Entre em contato com o suporte para mais informações.'
                : 'Nossa equipe está verificando a operação.'}
            </p>
          </div>
        </div>
        {steps.map((step) => (
          <div key={step.status} className="flex items-center gap-3">
            {step.isReached ? (
              <CheckCircle2 className="h-5 w-5 text-green-accent" />
            ) : (
              <Circle className="h-5 w-5 text-text-disabled" />
            )}
            <span className={cn('text-sm', step.isReached ? 'text-text-primary' : 'text-text-tertiary')}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-0">
      {steps.map((step, idx) => (
        <div key={step.status} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all duration-500',
                step.isReached
                  ? 'border-green-accent bg-green-subtle'
                  : 'border-border bg-surface-card',
                step.isCurrent && 'ring-2 ring-green-accent/30 ring-offset-2 ring-offset-surface animate-breathe'
              )}
            >
              {step.isCurrent && !step.isReached ? (
                <Clock className="h-3.5 w-3.5 text-green-accent" />
              ) : step.isReached ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-green-accent animate-check-pop" />
              ) : (
                <div className="h-2 w-2 rounded-full bg-text-disabled" />
              )}
            </div>
            {idx < steps.length - 1 && (
              <div
                className={cn(
                  'h-8 w-0.5 transition-all duration-500',
                  step.isReached ? 'bg-green-accent/50' : 'bg-border'
                )}
              />
            )}
          </div>
          <div className={cn('pb-6', idx === steps.length - 1 && 'pb-0')}>
            <p
              className={cn(
                'text-sm font-medium transition-all duration-300',
                step.isReached ? 'text-text-primary' : 'text-text-tertiary'
              )}
            >
              {step.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
