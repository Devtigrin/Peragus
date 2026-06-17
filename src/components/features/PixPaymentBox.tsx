import { useEffect, useState } from 'react'
import { Copy, Clock, QrCode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { DEMO_NOTICE } from '@/constants/demo'

interface PixPaymentBoxProps {
  brlAmount: number
  expirationMinutes?: number
  onExpired: () => void
  onPaymentComplete: () => void
}

export function PixPaymentBox({
  brlAmount,
  expirationMinutes = 15,
  onExpired,
  onPaymentComplete,
}: PixPaymentBoxProps) {
  const [timeLeft, setTimeLeft] = useState(expirationMinutes * 60)
  const [copied, setCopied] = useState(false)
  const [status, setStatus] = useState<'waiting' | 'confirmed'>('waiting')

  const fakePixCode = '00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-4266141740005204000053039865802BR5911PERAGUS LTDA6008BRASILIA62070503***6304ABCD'

  useEffect(() => {
    if (timeLeft <= 0) return
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearInterval(timer)
  }, [timeLeft])

  useEffect(() => {
    if (timeLeft === 0) onExpired()
  }, [onExpired, timeLeft])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const isExpired = timeLeft === 0

  const handleCopy = () => {
    navigator.clipboard.writeText(fakePixCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleConfirmPayment = () => {
    if (isExpired) return
    setStatus('confirmed')
    onPaymentComplete()
  }

  if (status === 'confirmed') {
    return (
      <div className="text-center py-8 space-y-4 animate-scale-in">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-subtle border border-green-border animate-check-pop">
          <Clock className="h-8 w-8 text-green-accent" />
        </div>
        <p className="text-lg font-semibold text-text-primary animate-fade-in stagger-2">Pagamento confirmado!</p>
        <p className="text-sm text-text-tertiary animate-fade-in stagger-3">
          Estamos processando o envio dos USDT para sua carteira.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-lg bg-surface-elevated border border-border p-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-text-tertiary" />
          <span className="text-sm text-text-secondary">Tempo restante:</span>
        </div>
        <span
          className={`text-lg font-bold tabular-nums ${
            timeLeft < 60
              ? 'text-red-400 animate-pulse'
              : 'text-text-primary'
          }`}
        >
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="flex h-48 w-48 items-center justify-center rounded-xl border border-border bg-card">
          <QrCode className="h-32 w-32 text-text-primary opacity-80" />
        </div>
        <p className="text-sm text-text-tertiary">Escaneie o QR Code para pagar via Pix</p>
        <p className="text-xs text-yellow-500">{DEMO_NOTICE}</p>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-text-secondary">Valor a pagar:</p>
        <p className="text-2xl font-bold text-text-primary">
          {formatCurrency(brlAmount)}
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-text-tertiary">Código Pix copia e cola:</p>
        <div className="flex gap-2">
          <code className="flex-1 rounded-lg border border-border bg-surface-elevated px-3 py-2 text-xs break-all font-mono text-text-secondary">
            {fakePixCode.slice(0, 60)}...
          </code>
          <Button variant="outline" size="sm" onClick={handleCopy}>
            <Copy className="h-4 w-4" />
            {copied ? 'Copiado' : 'Copiar'}
          </Button>
        </div>
      </div>

      <Button
        className="w-full"
        size="lg"
        onClick={handleConfirmPayment}
        disabled={isExpired}
      >
        {isExpired ? 'Pix expirado' : 'Simular pagamento recebido'}
      </Button>
    </div>
  )
}
