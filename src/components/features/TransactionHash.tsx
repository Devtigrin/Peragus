import { ExternalLink, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NETWORKS } from '@/constants'
import type { NetworkType } from '@/types'
import { useState } from 'react'

interface TransactionHashProps {
  hash: string
  network: NetworkType
}

export function TransactionHash({ hash, network }: TransactionHashProps) {
  const [copied, setCopied] = useState(false)
  const networkInfo = NETWORKS.find((n) => n.id === network)

  const handleCopy = () => {
    navigator.clipboard.writeText(hash)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-lg border border-border bg-surface-elevated p-3">
      <p className="text-xs text-text-tertiary mb-2">Hash da transação</p>
      <div className="flex items-center gap-2">
        <code className="flex-1 text-xs font-mono text-text-secondary break-all">
          {hash}
        </code>
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy} aria-label="Copiar hash da transação">
            <Copy className="h-3.5 w-3.5" />
          </Button>
          {networkInfo && (
            <a
              href={`${networkInfo.explorerUrl}${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-surface-hover transition-colors"
              aria-label="Abrir transação no explorador"
            >
              <ExternalLink className="h-3.5 w-3.5 text-text-tertiary" />
            </a>
          )}
        </div>
      </div>
      {networkInfo && (
        <a
          href={`${networkInfo.explorerUrl}${hash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold text-text-primary hover:bg-surface-hover hover:border-border-hover transition-colors"
        >
          Abrir no explorador de blocos
          <ExternalLink className="h-4 w-4" />
        </a>
      )}
      {copied && <p className="mt-2 text-xs text-green-accent">Hash copiado</p>}
    </div>
  )
}
