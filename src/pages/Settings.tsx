import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuth } from '@/store/useAuth'

function Toggle({ checked, onChange, id }: { checked: boolean; onChange: (v: boolean) => void; id: string }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
        checked ? 'bg-green-accent' : 'bg-border'
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform ring-0 transition duration-200',
          checked ? 'translate-x-4' : 'translate-x-0'
        )}
      />
    </button>
  )
}

export function Settings() {
  const { user } = useAuth()
  const [emailNotif, setEmailNotif] = useState(true)
  const [liqNotif, setLiqNotif] = useState(true)
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Configurações</h1>
        <p className="text-sm text-text-tertiary mt-1">Ajuste preferências da conta e operação.</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Perfil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" defaultValue={user?.name || ''} placeholder="Seu nome" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" defaultValue={user?.email || ''} placeholder="seu@email.com" />
              </div>
            </div>
            <Button variant="outline" size="sm">Salvar alterações</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferências de operação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Moeda padrão</Label>
                <Select defaultValue="brl">
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brl">BRL</SelectItem>
                    <SelectItem value="usd">USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="network">Rede padrão</Label>
                <Select defaultValue="polygon">
                  <SelectTrigger id="network">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ethereum">Ethereum</SelectItem>
                    <SelectItem value="polygon">Polygon</SelectItem>
                    <SelectItem value="arbitrum">Arbitrum</SelectItem>
                    <SelectItem value="optimism">Optimism</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button variant="outline" size="sm">Salvar preferências</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Segurança da conta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Senha atual</Label>
                <Input id="current-password" type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Nova senha</Label>
                <Input id="new-password" type="password" placeholder="••••••••" />
              </div>
            </div>
            <Button variant="outline" size="sm">Alterar senha</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notificações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-primary">Notificações por e-mail</p>
                <p className="text-xs text-text-tertiary">Receba alertas sobre suas operações.</p>
              </div>
              <Toggle checked={emailNotif} onChange={setEmailNotif} id="email-notif" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-primary">Notificações de liquidação</p>
                <p className="text-xs text-text-tertiary">Alertas quando uma liquidação for concluída.</p>
              </div>
              <Toggle checked={liqNotif} onChange={setLiqNotif} id="liq-notif" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
