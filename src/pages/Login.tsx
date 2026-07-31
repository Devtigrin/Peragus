import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useAuth } from '@/store/useAuth'
import { DEMO_NOTICE } from '@/constants/demo'
import { PeragusLogo } from '@/components/brand/PeragusLogo'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login(email, password)
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md animate-scale-in">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <PeragusLogo textClassName="text-2xl" tagline />
          </Link>
        </div>

        <Card>
            <CardHeader className="text-center">
              <CardTitle>Entrar</CardTitle>
              <CardDescription>Acesse sua conta Peragus</CardDescription>
            </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                />
              </div>
              <Button type="submit" className="w-full">
                Entrar
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
                  <p>A Peragus nunca solicita seed phrase ou chave privada. O USDT é entregue diretamente na sua carteira.</p>
                </div>
              </div>
            </div>

            <p className="mt-6 text-center text-sm text-text-tertiary">
              Não tem conta?{' '}
              <Link to="/register" className="text-green-accent hover:text-green-accent-hover font-medium">
                Criar conta
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
