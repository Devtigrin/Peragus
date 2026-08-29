import { cn } from '@/lib/utils'
import type { HomeContent } from '@/content/home'

export function InfrastructureDiagram({ nodes }: { nodes: HomeContent['infrastructure']['nodes'] }) {
  return (
    <ol className="mt-14 flex flex-col items-stretch gap-3 font-mono text-sm lg:flex-row lg:items-center lg:gap-4">
      {nodes.map((node, index) => {
        const last = index === nodes.length - 1
        return (
          <li key={node} className="flex items-center gap-4">
            {index > 0 && (
              <span aria-hidden="true" className="hidden text-xs text-mint lg:inline">→</span>
            )}
            <span
              className={cn(
                'flex items-center gap-2.5 rounded-(--radius-control) border border-line px-4 py-2.5 leading-none',
                last && 'border-mint/50 bg-mint/5 text-mint',
              )}
            >
              <span aria-hidden="true" className={cn('h-1.5 w-1.5 shrink-0 rounded-full', last ? 'bg-mint' : 'bg-mint/50')} />
              {node}
            </span>
          </li>
        )
      })}
    </ol>
  )
}