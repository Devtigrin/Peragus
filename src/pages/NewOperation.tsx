import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, DollarSign, ExternalLink, FileText, QrCode, Send, ShieldAlert, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { WalletConnectBox } from '@/components/features/WalletConnectBox'
import { PixPaymentBox } from '@/components/features/PixPaymentBox'
import { OperationTimeline } from '@/components/features/OperationTimeline'
import { TransactionHash } from '@/components/features/TransactionHash'
import { useOperations } from '@/store/useOperations'
import { useVerification } from '@/store/useVerification'
import { NETWORKS, USDT_ASK } from '@/constants'
import { DEMO_NOTICE } from '@/constants/demo'
import { formatCurrency, generateId } from '@/lib/utils'
import type { NetworkType, Operation } from '@/types'

const steps = [
  { id: 0, label: 'Carteira', icon: Wallet },
  { id: 1, label: 'Valor', icon: DollarSign },
  { id: 2, label: 'Resumo', icon: FileText },
  { id: 3, label: 'Confirmação', icon: QrCode },
  { id: 4, label: 'Envio', icon: Send },
]

const REQUIRE_IDENTITY_VERIFICATION_FOR_OPERATIONS = false

const isEvmAddress = (address: string) => /^0x[a-fA-F0-9]{40}$/.test(address.trim())

function VerificationGate({ onBack, onGoToVerification }: { onBack: () => void; onGoToVerification: () => void }) {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1 text-sm text-text-tertiary hover:text-text-secondary mb-4 follow-through-fast"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao painel
        </button>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100/30 border border-yellow-200/20 mb-4">
            <ShieldAlert className="h-8 w-8 text-yellow-400" />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Verificação de identidade necessária</h2>
          <p className="text-sm text-text-tertiary max-w-md mb-6">
            Para criar uma liquidação, conclua sua verificação de identidade. Esse processo é feito apenas uma vez.
          </p>
          <Button onClick={onGoToVerification}>
            Ir para verificação
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export function NewOperation() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { addOperation, updateOperation, updateOperationStatus } = useOperations()
  const { status: verificationStatus } = useVerification()
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [walletAddress, setWalletAddress] = useState('')
  const [usdtAmount, setUsdtAmount] = useState(() => {
    const amount = Number(searchParams.get('usdt'))
    return Number.isFinite(amount) && amount > 0 ? amount.toFixed(2) : ''
  })
  const [network, setNetwork] = useState<NetworkType>('polygon')
  const [operationId, setOperationId] = useState<string | null>(null)
  const [transactionHash, setTransactionHash] = useState<string | null>(null)
  const [status, setStatus] = useState<Operation['status']>('pending_payment')
  const [pixGenerated, setPixGenerated] = useState(false)
  const [pixExpired, setPixExpired] = useState(false)
  const [checkboxOwner, setCheckboxOwner] = useState(false)
  const [checkboxTerms, setCheckboxTerms] = useState(false)

  const networkInfo = NETWORKS.find((n) => n.id === network)
  const brlAmount = usdtAmount ? parseFloat(usdtAmount) * USDT_ASK : 0
  const totalFee = networkInfo ? networkInfo.fee : 0
  const totalToPay = brlAmount + totalFee
  const walletAddressValid = isEvmAddress(walletAddress)
  const explorerUrl = transactionHash && networkInfo ? `${networkInfo.explorerUrl}${transactionHash}` : null

  const handleNextStep = () => {
    if (currentStep < 4) setCurrentStep((s) => s + 1)
  }

  const handlePrevStep = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1)
  }

  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout)
      timersRef.current = []
    }
  }, [])

  const scheduleStatusUpdate = useCallback((callback: () => void, delay: number) => {
    const timer = setTimeout(callback, delay)
    timersRef.current.push(timer)
  }, [])

  const mockSendTransaction = useCallback((id: string) => {
    const hash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`
    setTransactionHash(hash)
    updateOperation(id, { transactionHash: hash })

    scheduleStatusUpdate(() => {
      setStatus('payment_confirmed')
      updateOperationStatus(id, 'payment_confirmed')
    }, 3000)
    scheduleStatusUpdate(() => {
      setStatus('processing')
      updateOperationStatus(id, 'processing')
    }, 6000)
    scheduleStatusUpdate(() => {
      setStatus('sent')
      updateOperation(id, { status: 'sent', transactionHash: hash })
    }, 10000)
    scheduleStatusUpdate(() => {
      setStatus('completed')
      updateOperationStatus(id, 'completed')
    }, 15000)
  }, [scheduleStatusUpdate, updateOperation, updateOperationStatus])

  if (REQUIRE_IDENTITY_VERIFICATION_FOR_OPERATIONS && verificationStatus !== 'approved') {
    return <VerificationGate onBack={() => navigate('/dashboard')} onGoToVerification={() => navigate('/verification')} />
  }

  const handlePaymentComplete = () => {
    const id = generateId()
    setOperationId(id)

    const op: Operation = {
      id,
      createdAt: new Date().toISOString(),
      brlAmount: parseFloat(brlAmount.toFixed(2)),
      usdtAmount: parseFloat(usdtAmount),
      exchangeRate: USDT_ASK,
      network,
      walletAddress,
      status: 'pending_payment',
      estimatedFee: totalFee,
      totalPaid: parseFloat(totalToPay.toFixed(2)),
      pixCode: 'demo-pix-code',
    }
    addOperation(op)

    mockSendTransaction(id)
    handleNextStep()
  }

  const handleGeneratePix = () => {
    setPixExpired(false)
    setPixGenerated(true)
  }

  const handlePixExpired = () => {
    setPixExpired(true)
    setPixGenerated(false)
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 0: return walletAddressValid
      case 1: return parseFloat(usdtAmount) > 0 && !!network
      case 2: return true
      case 3: return pixGenerated
      default: return true
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-1 text-sm text-text-tertiary hover:text-text-secondary mb-4 follow-through-fast"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao painel
        </button>
        <h1 className="text-2xl font-bold text-text-primary">Nova liquidação</h1>
        <p className="text-sm text-text-tertiary mt-1">Compre USDT com Pix e receba diretamente na sua carteira.</p>
      </div>

      <div className="rounded-lg border border-yellow-200/20 bg-yellow-50/30 p-3 text-xs text-yellow-500">
        {DEMO_NOTICE}
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-between">
        {steps.map((step, idx) => {
          const Icon = step.icon
          const isActive = currentStep === idx
          const isPast = currentStep > idx
          return (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                    isPast
                      ? 'bg-green-accent border-green-accent text-actual-white'
                      : isActive
                      ? 'border-green-accent text-green-accent bg-green-subtle animate-breathe'
                      : 'border-border text-text-tertiary'
                  }`}
                >
                  {isPast ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <span
                  className={`text-xs mt-1 hidden sm:block transition-colors duration-200 ${
                    isActive ? 'text-green-accent font-medium' : 'text-text-tertiary'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={`h-0.5 w-8 sm:w-16 mx-2 transition-all duration-500 ${
                    currentStep > idx ? 'bg-green-accent/60' : 'bg-border'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Step content */}
      <Card>
        <CardContent className="p-6">
          {currentStep === 0 && (
            <div className="space-y-4 animate-lift-in" key="step-0">
              <div>
                <h2 className="text-lg font-semibold text-text-primary">Conectar carteira</h2>
                <p className="text-sm text-text-tertiary mt-1">
                  Selecione sua carteira autocustodial ou informe o endereço que receberá os USDT.
                </p>
              </div>
              <WalletConnectBox onConnect={setWalletAddress} selectedAddress={walletAddress} />
              {walletAddress && !walletAddressValid && (
                <p className="text-sm text-red-400">
                  Informe um endereço EVM válido para a rede selecionada, no formato 0x com 40 caracteres hexadecimais.
                </p>
              )}
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6 animate-lift-in" key="step-1">
              <div>
                <h2 className="text-lg font-semibold text-text-primary">Definir valor e rede</h2>
                <p className="text-sm text-text-tertiary mt-1">
                  Escolha o valor em USDT e a rede de destino.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Valor em USDT</Label>
                  <Input type="number" min="10" step="1" placeholder="100" value={usdtAmount} onChange={(e) => setUsdtAmount(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Valor estimado em BRL</Label>
                  <Input value={formatCurrency(brlAmount)} disabled className="bg-surface-elevated text-text-secondary" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Rede de destino</Label>
                <Select value={network} onValueChange={(v) => setNetwork(v as NetworkType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NETWORKS.map((n) => (
                      <SelectItem key={n.id} value={n.id}>
                        <span className="flex items-center gap-2">
                          <span>{n.name}</span>
                          <span className="text-text-tertiary">({n.shortName})</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {networkInfo && (
                <div className="rounded-lg bg-surface-elevated border border-border p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-tertiary">Cotação USDT</span>
                    <span className="text-text-primary font-medium">{formatCurrency(USDT_ASK)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-tertiary">Taxa da rede ({networkInfo.name})</span>
                    <span className="text-text-primary font-medium">{formatCurrency(networkInfo.fee)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-tertiary">Tempo estimado</span>
                    <span className="text-text-primary font-medium">{networkInfo.confirmationTime}</span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between">
                    <span className="text-sm font-semibold text-text-primary">Total a pagar</span>
                    <span className="text-lg font-bold text-green-accent">{formatCurrency(totalToPay)}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6 animate-lift-in" key="step-2">
              <div>
                <h2 className="text-lg font-semibold text-text-primary">Resumo da liquidação</h2>
                <p className="text-sm text-text-tertiary mt-1">Revise os dados antes de confirmar.</p>
              </div>

              <div className="rounded-lg bg-surface-elevated border border-border p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-text-tertiary">Entrada</span>
                  <span className="text-text-primary font-medium">BRL via Pix</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-tertiary">Saída</span>
                  <span className="text-text-primary font-medium">USDT</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-tertiary">Valor em BRL</span>
                  <span className="text-text-primary font-medium">{formatCurrency(brlAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-tertiary">Valor estimado em USDT</span>
                  <span className="text-text-primary font-medium">{usdtAmount} USDT</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-tertiary">Rede escolhida</span>
                  <span className="text-text-primary font-medium">{networkInfo?.name} ({networkInfo?.shortName})</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-tertiary">Carteira destino</span>
                  <span className="text-xs font-mono text-text-primary max-w-[200px] truncate">{walletAddress}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between text-sm">
                  <span className="text-text-tertiary">Cotação aplicada</span>
                  <span className="text-text-primary font-medium">{formatCurrency(USDT_ASK)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-tertiary">Taxa estimada</span>
                  <span className="text-text-primary font-medium">{formatCurrency(totalFee)}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between">
                  <span className="text-sm font-semibold text-text-primary">Total a pagar</span>
                  <span className="text-lg font-bold text-green-accent">{formatCurrency(totalToPay)}</span>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6 animate-lift-in" key="step-3">
              {!pixGenerated ? (
                <>
                  <div>
                    <h2 className="text-lg font-semibold text-text-primary">Confirmação da operação</h2>
                    <p className="text-sm text-text-tertiary mt-1">Marque as confirmações abaixo para gerar o pagamento.</p>
                  </div>
                  {pixExpired && (
                    <div className="rounded-lg border border-red-200/30 bg-red-50/30 p-3 text-sm text-red-400">
                      A cotação anterior expirou. Gere um novo Pix para continuar.
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="ownerCheck"
                        checked={checkboxOwner}
                        onCheckedChange={(v) => setCheckboxOwner(v as boolean)}
                        className="mt-0.5"
                      />
                      <Label htmlFor="ownerCheck" className="text-sm text-text-secondary leading-5 cursor-pointer">
                        Declaro que sou o titular ou responsável pela carteira informada e pela conta bancária utilizada no pagamento.
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="termsCheck"
                        checked={checkboxTerms}
                        onCheckedChange={(v) => setCheckboxTerms(v as boolean)}
                        className="mt-0.5"
                      />
                      <Label htmlFor="termsCheck" className="text-sm text-text-secondary leading-5 cursor-pointer">
                        Li e aceito os termos desta operação, incluindo cotação, taxas, rede escolhida, prazos e irreversibilidade do envio on-chain.
                      </Label>
                    </div>
                  </div>

                  <Button className="w-full" size="lg" disabled={!checkboxOwner || !checkboxTerms} onClick={handleGeneratePix}>
                    <QrCode className="h-4 w-4" />
                    Gerar chave Pix
                  </Button>
                </>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold text-text-primary">Pagamento via Pix</h2>
                    <p className="text-sm text-text-tertiary mt-1">
                      Pague o valor abaixo com o QR Code ou código copia e cola.
                    </p>
                  </div>
                  <PixPaymentBox brlAmount={totalToPay} onPaymentComplete={handlePaymentComplete} onExpired={handlePixExpired} />
                </div>
              )}
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6 animate-lift-in" key="step-4">
              <div>
                <h2 className="text-lg font-semibold text-text-primary">Status da operação</h2>
                <p className="text-sm text-text-tertiary mt-1">
                  Acompanhe o andamento do envio dos USDT para sua carteira.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-text-tertiary">ID da operação</p>
                  <p className="text-sm font-mono text-text-primary">{operationId}</p>
                </div>
                <div>
                  <p className="text-xs text-text-tertiary">Valor</p>
                  <p className="text-sm font-medium text-text-primary">{usdtAmount} USDT ({formatCurrency(brlAmount)})</p>
                </div>
                <div>
                  <p className="text-xs text-text-tertiary">Rede</p>
                  <p className="text-sm text-text-primary">{networkInfo?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-text-tertiary">Carteira destino</p>
                  <p className="text-xs font-mono text-text-secondary break-all">{walletAddress}</p>
                </div>
              </div>

              {transactionHash && <TransactionHash hash={transactionHash} network={network} />}

              <OperationTimeline currentStatus={status} />

              {status === 'completed' && (
                <div className="text-center py-6 space-y-4 animate-scale-in">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-subtle border border-green-border animate-check-pop">
                    <Check className="h-8 w-8 text-green-accent" />
                  </div>
                  <div className="animate-fade-in stagger-2">
                    <p className="text-lg font-semibold text-text-primary">Operação concluída!</p>
                    <p className="text-sm text-text-tertiary">USDT enviados para sua carteira.</p>
                  </div>
                  <div className="flex gap-3 justify-center animate-fade-in stagger-3">
                    {explorerUrl && (
                      <Button asChild>
                        <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
                          Abrir no explorador
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    <Button variant="outline" onClick={() => navigate('/dashboard')}>
                      Voltar ao dashboard
                    </Button>
                    <Button onClick={() => navigate(`/operation/${operationId}`)}>
                      Ver detalhes
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation buttons */}
      {currentStep < 4 && currentStep !== 3 && (
        <div className="flex justify-between animate-fade-in">
          <Button variant="outline" onClick={handlePrevStep} disabled={currentStep === 0}>
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <Button onClick={handleNextStep} disabled={!isStepValid()}>
            Continuar
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
      {currentStep === 3 && !pixGenerated && (
        <div className="flex justify-between animate-fade-in">
          <Button variant="outline" onClick={handlePrevStep}>
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>
      )}
    </div>
  )
}
