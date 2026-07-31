import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertTriangle, Check, ArrowRight, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useAuth } from '@/store/useAuth'
import { DEMO_NOTICE } from '@/constants/demo'
import { PeragusLogo } from '@/components/brand/PeragusLogo'
import { TERMS_TEXT } from '@/constants/legalTerms'

export function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false)
  const [acceptanceDate, setAcceptanceDate] = useState<string | null>(null)
  const [justRegistered, setJustRegistered] = useState(false)
  const termsRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { register } = useAuth()

  const handleScroll = () => {
    const el = termsRef.current
    if (!el) return
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 5
    if (isAtBottom && !hasScrolledToEnd) {
      setHasScrolledToEnd(true)
      setAcceptanceDate(new Date().toLocaleString('pt-BR'))
    }
  }

  const handleAcceptTerms = () => {
    if (hasScrolledToEnd) {
      setTermsAccepted(true)
    }
  }

const [error, setError] = useState<string | null>(null)
const [loading, setLoading] = useState(false)

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!termsAccepted || !acceptedPrivacy) return
  setError(null)
  setLoading(true)
  const { error } = await register(email, password, name)
  setLoading(false)
  if (error) {
    setError(error)
  } else {
    setJustRegistered(true)
  }
}

  if (justRegistered) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface px-4 py-8">
        <div className="w-full max-w-lg animate-scale-in">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <PeragusLogo textClassName="text-2xl" tagline />
            </Link>
          </div>
          <Card>
            <CardContent className="flex flex-col items-center py-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-subtle border border-green-border mb-4">
                <Check className="h-8 w-8 text-green-accent" />
              </div>
              <h2 className="text-xl font-bold text-text-primary mb-2">Cadastro criado com sucesso</h2>
              <p className="text-sm text-text-tertiary max-w-sm mb-6">
                Para iniciar uma liquidação, você precisa concluir sua verificação de identidade.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={() => navigate('/verification')}>
                  Iniciar verificação
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={() => navigate('/dashboard')}>
                  <LayoutDashboard className="h-4 w-4" />
                  Ir para o painel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4 py-8">
      <div className="w-full max-w-lg animate-scale-in">
        <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <PeragusLogo textClassName="text-2xl" tagline />
            </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>Criar conta</CardTitle>
            <CardDescription>Comece a usar a Peragus em menos de 2 minutos</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <p className="mb-4 text-center text-sm text-red-500">{error}</p>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>

              <div className="rounded-lg border border-border bg-surface-elevated">
                <div className="p-4 border-b border-border">
                  <p className="text-sm font-medium text-text-primary">Termos de Uso</p>
                  <p className="text-xs text-text-tertiary">Role até o final para aceitar</p>
                </div>
                <div
                  ref={termsRef}
                  onScroll={handleScroll}
                  className="h-48 overflow-y-auto p-4 text-xs text-text-secondary leading-relaxed space-y-2"
                  style={{ whiteSpace: 'pre-wrap' }}
                >
                  {TERMS_TEXT}
                </div>
                {hasScrolledToEnd && !termsAccepted && (
                  <div className="p-4 border-t border-border animate-slide-down">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full text-sm"
                      onClick={handleAcceptTerms}
                    >
                      Li e aceito os Termos de Uso
                    </Button>
                  </div>
                )}
                {termsAccepted && (
                  <div className="p-4 border-t border-border bg-green-subtle/60 animate-fade-in">
                    <div className="flex items-center gap-2 text-sm text-green-accent">
                      <Check className="h-4 w-4" />
                      <span>Termos aceitos em {acceptanceDate}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="privacy"
                  checked={acceptedPrivacy}
                  onCheckedChange={(v) => setAcceptedPrivacy(v as boolean)}
                />
                <Label htmlFor="privacy" className="text-sm text-text-secondary leading-5 cursor-pointer">
                  Li e concordo com a{' '}
                  <Link to="/privacy" className="text-green-accent hover:text-green-accent-hover underline">
                    Política de Privacidade
                  </Link>
                </Label>
              </div>

              <p className="text-xs text-text-tertiary leading-relaxed">
                Ao continuar, você declara que leu e concorda com os Termos de Uso e a Política de Privacidade da Peragus.
              </p>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={!termsAccepted || !acceptedPrivacy || loading}
              >
                {loading ? 'Criando conta...' : 'Criar conta'}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-2 text-text-tertiary">ou</span>
              </div>
            </div>

            <Button variant="outline" className="w-full" disabled>
              Continuar com Google
            </Button>

            <div className="mt-6 rounded-lg bg-yellow-50/40 border border-yellow-200/20 p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5 shrink-0" />
                <div className="space-y-1 text-xs text-yellow-500">
                  <p>{DEMO_NOTICE}</p>
                  <p>A Peragus nunca solicita seed phrase ou chave privada. Seus ativos permanecem sob seu controle.</p>
                </div>
              </div>
            </div>

            <p className="mt-6 text-center text-sm text-text-tertiary">
              Já tem conta?{' '}
              <Link to="/login" className="text-green-accent hover:text-green-accent-hover font-medium">
                Entrar
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
