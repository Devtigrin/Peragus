import { Link } from 'react-router-dom'
import { PeragusLogo } from '@/components/brand/PeragusLogo'

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface-secondary">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <PeragusLogo textClassName="text-lg" />
            </div>
            <p className="text-sm text-text-tertiary">
              Infraestrutura de pagamentos cross-border que conecta moedas locais por liquidação baseada em stablecoins.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-text-primary">Produto</h3>
            <ul className="space-y-2">
              <li><a href="/#learn-more" className="text-sm text-text-tertiary hover:text-text-secondary follow-through-fast">Como funciona</a></li>
              <li><a href="/#benefits" className="text-sm text-text-tertiary hover:text-text-secondary follow-through-fast">Benefícios</a></li>
              <li><a href="/#faq" className="text-sm text-text-tertiary hover:text-text-secondary follow-through-fast">FAQ</a></li>
              <li><Link to="/security-info" className="text-sm text-text-tertiary hover:text-text-secondary follow-through-fast">Segurança</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-text-primary">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="/terms" className="text-sm text-text-tertiary hover:text-text-secondary follow-through-fast">Termos de Uso</Link></li>
              <li><Link to="/privacy" className="text-sm text-text-tertiary hover:text-text-secondary follow-through-fast">Política de Privacidade</Link></li>
              <li><Link to="/security-info" className="text-sm text-text-tertiary hover:text-text-secondary follow-through-fast">Segurança</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-text-primary">Contato</h3>
            <ul className="space-y-2">
              <li><a href="mailto:contato@peragus.com.br" className="text-sm text-text-tertiary hover:text-text-secondary follow-through-fast">contato@peragus.com.br</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6">
          <p className="text-center text-xs text-text-disabled">
            &copy; {new Date().getFullYear()} Peragus. Todos os direitos reservados. USDT entregue diretamente na carteira do cliente.
          </p>
        </div>
      </div>
    </footer>
  )
}
