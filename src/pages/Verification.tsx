import { useState } from 'react'
import { Upload, CheckCircle2, Clock, XCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useVerification } from '@/store/useVerification'
import { DEMO_MODE, DEMO_NOTICE } from '@/constants/demo'
import type { VerificationStatus } from '@/types'

interface UploadedFile {
  name: string
  size: number
}

const STATUS_CONFIG: Record<VerificationStatus, { label: string; color: string; icon: typeof Clock }> = {
  not_started: { label: 'Não iniciada', color: 'bg-border text-text-tertiary', icon: Clock },
  in_progress: { label: 'Em preenchimento', color: 'bg-yellow-100/30 text-yellow-600', icon: Clock },
  under_review: { label: 'Em análise', color: 'bg-blue-100/30 text-blue-400', icon: Clock },
  approved: { label: 'Aprovada', color: 'bg-green-subtle/60 text-green-accent', icon: CheckCircle2 },
  rejected: { label: 'Reprovada', color: 'bg-red-100/30 text-red-400', icon: XCircle },
}

function formatFileSize(size: number) {
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

function getFileMetadata(fileList: FileList | null): UploadedFile | null {
  const file = fileList?.[0]
  if (!file) return null
  return { name: file.name, size: file.size }
}

export function Verification() {
  const { status, data, updateData, updateStatus } = useVerification()
  const [idDoc, setIdDoc] = useState<UploadedFile | null>(null)
  const [proofDoc, setProofDoc] = useState<UploadedFile | null>(null)

  const statusInfo = STATUS_CONFIG[status]
  const StatusIcon = statusInfo.icon

  const cpfDigits = data.cpf.replace(/\D/g, '')
  const phoneDigits = data.phone.replace(/\D/g, '')

  const isFormComplete =
    data.fullName.length >= 5 &&
    cpfDigits.length === 11 &&
    data.birthDate &&
    data.email.includes('@') &&
    phoneDigits.length >= 10 &&
    data.profession &&
    data.fundsOrigin &&
    data.monthlyRange

  const handleSubmit = () => {
    if (isFormComplete) {
      updateStatus('under_review')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Verificação de identidade</h1>
        <p className="text-sm text-text-tertiary mt-1">
          Complete sua verificação para liberar operações de liquidação.
        </p>
      </div>

      {/* Status banner */}
      <Card className="border-border">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StatusIcon className="h-5 w-5" />
            <div>
              <p className="text-sm font-medium text-text-primary">Status da verificação</p>
              <p className={`text-xs ${status === 'approved' ? 'text-green-accent' : 'text-text-tertiary'}`}>
                {statusInfo.label}
              </p>
            </div>
          </div>
          {status === 'approved' && (
            <Badge variant="success">Aprovada</Badge>
          )}
          {status === 'rejected' && (
            <Badge variant="error">Reprovada</Badge>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {/* Personal Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-subtle/60 text-xs font-bold text-green-accent">1</span>
              Dados pessoais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome completo</Label>
                <Input id="fullName" placeholder="Seu nome completo" value={data.fullName} onChange={(e) => updateData({ fullName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input id="cpf" placeholder="000.000.000-00" value={data.cpf} onChange={(e) => updateData({ cpf: e.target.value })} maxLength={14} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate">Data de nascimento</Label>
                <Input id="birthDate" type="date" value={data.birthDate} onChange={(e) => updateData({ birthDate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emailVerif">E-mail</Label>
                <Input id="emailVerif" type="email" placeholder="seu@email.com" value={data.email} onChange={(e) => updateData({ email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" placeholder="(11) 99999-9999" value={data.phone} onChange={(e) => updateData({ phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profession">Profissão</Label>
                <Input id="profession" placeholder="Sua profissão" value={data.profession} onChange={(e) => updateData({ profession: e.target.value })} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Document Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-subtle/60 text-xs font-bold text-green-accent">2</span>
              Documento de identificação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="block rounded-lg border-2 border-dashed border-border p-6 text-center hover:border-green-accent/50 transition-colors cursor-pointer">
              <input type="file" accept="image/*,.pdf" className="sr-only" onChange={(event) => setIdDoc(getFileMetadata(event.currentTarget.files))} />
              <Upload className="h-6 w-6 mx-auto text-text-tertiary mb-2" />
              <p className="text-sm text-text-tertiary">Clique para enviar foto do documento (RG ou CNH)</p>
              {idDoc && (
                <div className="mt-2 flex flex-col items-center justify-center gap-1 text-xs text-green-accent">
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Documento selecionado
                  </div>
                  <span className="max-w-full truncate text-text-tertiary">{idDoc.name} · {formatFileSize(idDoc.size)}</span>
                </div>
              )}
            </label>

            <label className="block rounded-lg border-2 border-dashed border-border p-6 text-center hover:border-green-accent/50 transition-colors cursor-pointer">
              <input type="file" accept="image/*,.pdf" className="sr-only" onChange={(event) => setProofDoc(getFileMetadata(event.currentTarget.files))} />
              <Upload className="h-6 w-6 mx-auto text-text-tertiary mb-2" />
              <p className="text-sm text-text-tertiary">Clique para enviar comprovante de residência</p>
              {proofDoc && (
                <div className="mt-2 flex flex-col items-center justify-center gap-1 text-xs text-green-accent">
                  <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                    Comprovante selecionado
                  </div>
                  <span className="max-w-full truncate text-text-tertiary">{proofDoc.name} · {formatFileSize(proofDoc.size)}</span>
                </div>
              )}
            </label>
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-subtle/60 text-xs font-bold text-green-accent">3</span>
              Origem dos recursos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Origem dos recursos</Label>
                <Select value={data.fundsOrigin} onValueChange={(v) => updateData({ fundsOrigin: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="salary">Salário / Renda de trabalho</SelectItem>
                    <SelectItem value="investment">Investimentos / Rendimentos</SelectItem>
                    <SelectItem value="savings">Poupança / Reservas</SelectItem>
                    <SelectItem value="freelance">Freelance / Autônomo</SelectItem>
                    <SelectItem value="other">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Faixa estimada de operação mensal</Label>
                <Select value={data.monthlyRange} onValueChange={(v) => updateData({ monthlyRange: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1000">Até R$ 1.000</SelectItem>
                    <SelectItem value="5000">R$ 1.000 a R$ 5.000</SelectItem>
                    <SelectItem value="20000">R$ 5.000 a R$ 20.000</SelectItem>
                    <SelectItem value="100000">R$ 20.000 a R$ 100.000</SelectItem>
                    <SelectItem value="above">Acima de R$ 100.000</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Review & Submit */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-subtle/60 text-xs font-bold text-green-accent">4</span>
              Revisão e aprovação
            </CardTitle>
          </CardHeader>
          <CardContent>
            {status === 'approved' ? (
              <div className="flex items-center gap-2 text-green-accent">
                <CheckCircle2 className="h-5 w-5" />
                <p className="text-sm font-medium">Verificação aprovada. Você já pode realizar liquidações.</p>
              </div>
            ) : status === 'under_review' ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-blue-400">
                  <Clock className="h-5 w-5" />
                  <p className="text-sm font-medium">Documentos enviados. Sua verificação está em análise.</p>
                </div>
                <p className="text-xs text-text-tertiary">Prazo estimado: até 1 dia útil.</p>
                {DEMO_MODE && (
                  <div className="rounded-lg border border-yellow-200/20 bg-yellow-50/30 p-3">
                    <p className="mb-3 text-xs text-yellow-500">{DEMO_NOTICE}</p>
                    <Button variant="outline" size="sm" onClick={() => updateStatus('approved')}>
                      Aprovar verificação (demo)
                    </Button>
                  </div>
                )}
              </div>
            ) : status === 'rejected' ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-red-400">
                  <XCircle className="h-5 w-5" />
                  <p className="text-sm font-medium">Verificação reprovada. Corrija os dados e envie novamente.</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => updateStatus('in_progress')}>Reenviar documentos</Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-text-tertiary">Revise todas as informações antes de enviar para análise.</p>
                <Button onClick={handleSubmit} disabled={!isFormComplete || !idDoc || !proofDoc}>
                  <ArrowRight className="h-4 w-4" />
                  Enviar para análise
                </Button>
                {(!isFormComplete || !idDoc || !proofDoc) && (
                  <p className="text-xs text-text-tertiary">Preencha todos os campos e envie os documentos para continuar.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
