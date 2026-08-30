import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  /** Label curto para contextualizar o erro em logs. */
  context?: string
  fallback?: ReactNode
}

interface State {
  error: Error | null
}

const labels = {
  title: 'Algo deu errado',
  message: 'Ocorreu um erro inesperado. Recarregue a página para continuar.',
  reload: 'Recarregar',
} as const

/**
 * Captura erros de renderização nos níveis de árvore em que for montado e
 * exibe um fallback explícito em vez de deixar a tela em branco. Registra o
 * erro em console para diagnósticos sem expor dados sensíveis.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error) {
    if (typeof console !== 'undefined') {
      // Não logamos a stack completa de componentes para evitar informações
      // sensíveis; apenas o erro e o contexto.
      console.error(`[peragus:error-boundary]${this.props.context ? ` ${this.props.context}` : ''}`, error?.message)
    }
  }

  private reset = () => {
    if (typeof window !== 'undefined') {
      window.location.reload()
      return
    }
    this.setState({ error: null })
  }

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div role="alert" className="grid min-h-screen place-items-center bg-midnight p-6 text-primary">
          <div className="max-w-md rounded-(--radius-panel) border border-line bg-surface/60 p-8 text-center">
            <p className="font-mono text-[11px] uppercase tracking-[.14em] text-error">Erro</p>
            <h1 className="mt-3 font-display text-2xl font-semibold tracking-[-0.02em]">{labels.title}</h1>
            <p className="mt-3 text-sm leading-6 text-secondary">{labels.message}</p>
            <button
              type="button"
              onClick={this.reset}
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-(--radius-control) bg-mint px-5 font-semibold text-midnight hover:opacity-90"
            >
              {labels.reload}
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
