import {
  Activity,
  FileText,
  History,
  LayoutDashboard,
  PlusCircle,
  Settings,
  Shield,
  ShieldCheck,
  Wallet,
} from 'lucide-react'

export const dashboardLinks = [
  { to: '/dashboard', label: 'Painel Operacional', icon: LayoutDashboard },
  { to: '/new-liquidation', label: 'Comprar USDT', icon: PlusCircle },
  { to: '/liquidations', label: 'Compras', icon: FileText },
  { to: '/history', label: 'Histórico', icon: History },
  { to: '/wallets', label: 'Carteiras', icon: Wallet },
  { to: '/networks', label: 'Redes', icon: Activity },
  { to: '/verification', label: 'Verificação', icon: ShieldCheck },
  { to: '/security', label: 'Segurança', icon: Shield },
  { to: '/settings', label: 'Configurações', icon: Settings },
]
