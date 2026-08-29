import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type AuthShellProps = {
  children: ReactNode
  title?: string
  backToHome?: string
  backToHomeHref?: string
}

export function AuthShell({ children, title, backToHome, backToHomeHref }: AuthShellProps) {
  return (
    <main id="main-content" tabIndex={-1} className="grid min-h-[70vh] place-items-center px-4 py-16 sm:py-20">
      <div className="w-full max-w-md">
        <div className="rounded-(--radius-panel) border border-line bg-surface p-7 sm:p-8">
          {title && (
            <h1 className="font-display text-2xl font-semibold tracking-[-0.02em] text-primary">{title}</h1>
          )}
          {children}
        </div>
        {backToHome && (
          <p className="mt-5 text-center">
            <Link className="text-sm text-tertiary underline underline-offset-4 hover:text-primary" to={backToHomeHref ?? '/'}>
              {backToHome}
            </Link>
          </p>
        )}
      </div>
    </main>
  )
}