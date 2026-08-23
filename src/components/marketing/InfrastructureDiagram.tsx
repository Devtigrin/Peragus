import type { HomeContent } from '@/content/home'

export function InfrastructureDiagram({ nodes }: { nodes: HomeContent['infrastructure']['nodes'] }) {
  return (
    <ol className="mt-12 grid gap-4 md:grid-cols-4">
      {nodes.map((node, index) => (
        <li key={node} className="relative rounded-lg border border-line bg-midnight p-5 font-mono text-sm text-secondary md:not-last:after:absolute md:not-last:after:-right-4 md:not-last:after:top-1/2 md:not-last:after:h-px md:not-last:after:w-4 md:not-last:after:bg-mint">
          <span className="mb-3 block text-xs text-mint">0{index + 1}</span>
          {node}
        </li>
      ))}
    </ol>
  )
}
