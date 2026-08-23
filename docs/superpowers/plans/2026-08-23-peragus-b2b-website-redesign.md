# Peragus B2B Website Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current retail USDT application with a multilingual B2B sandbox website that communicates the simulated Pix-to-MockUSDT flow clearly, accessibly and without unsupported financial claims.

**Architecture:** Reduce the current SPA to a public React Router application with typed locale content and no runtime dependency on Supabase, Reown, Wagmi or Polygon. Build the approved B1 midnight system as Tailwind 4 tokens, compose the homepage from explicit operational sections, and keep legal and metadata behavior driven by the same URL locale.

**Tech Stack:** React 19, TypeScript 6, Vite 8, Tailwind CSS 4, React Router 7, Radix Dialog/Slot, Manrope, IBM Plex Mono, Vitest, Testing Library, Playwright and axe-core.

**Spec:** `docs/superpowers/specs/2026-08-23-peragus-b2b-website-redesign-design.md`

## Global Constraints

- Preserve only the current Peragus name and logo as fixed brand assets.
- Keep React, TypeScript, Vite and Tailwind CSS 4.
- Use `https://peragus.com.br` for canonical URLs and institutional identity.
- Publish complete Portuguese, Spanish and English variants.
- Use correct Portuguese and Spanish diacritics in every user-facing string; ASCII-only fallbacks are not acceptable for published copy.
- Optimize the first read for finance and operations; technical proof follows business clarity.
- Describe only the sandbox flow: simulated Pix/BRL to MockUSDT on Polygon Amoy.
- State that MockUSDT has no financial value and is not USDT.
- State that Polygon Amoy is a test network.
- State that the customer controls the destination wallet.
- Do not name a Pix gateway or BaaS; no provider has been selected.
- Do not claim production availability, real Pix processing, real USDT settlement, custody, licensing, certification, SLA, speed, price, clients, partners or operational metrics.
- Remove the B2C purchase product completely.
- Do not load Supabase, Reown, Wagmi, Viem, Ethers or Polygon RPC code on public marketing routes.
- Use Manrope for interface/editorial text and IBM Plex Mono only for machine-readable values.
- Use the B1 token values from the approved spec verbatim.
- Main body copy must not render below 14 px; touch targets must be at least 44 px.
- Respect `prefers-reduced-motion` and WCAG AA contrast.
- Do not publish the website until `/login`, `/register` and `/docs` are implemented by the separate sandbox initiative.
- Commit commands in this plan are checkpoints. Execute them only when the user has authorized commits for the implementation session.

---

## File Structure

### Create

- `src/test/setup.ts` - shared Vitest DOM matchers and cleanup.
- `src/i18n/routing.ts` - locale parsing and localized URL generation.
- `src/i18n/routing.test.ts` - locale route contract tests.
- `src/content/home/types.ts` - homepage content contract.
- `src/content/home/pt.ts` - Portuguese homepage copy.
- `src/content/home/es.ts` - Spanish homepage copy.
- `src/content/home/en.ts` - English homepage copy.
- `src/content/home/index.ts` - locale-to-content lookup.
- `src/content/home/content.test.ts` - parity and prohibited-claim tests.
- `src/content/legal/types.ts` - legal page content contract.
- `src/content/legal/pt.ts` - Portuguese editorial drafts.
- `src/content/legal/es.ts` - Spanish editorial drafts.
- `src/content/legal/en.ts` - English editorial drafts.
- `src/content/legal/index.ts` - locale-to-legal-content lookup.
- `src/components/ui/container.tsx` - page width and horizontal gutters.
- `src/components/ui/surface.tsx` - B1 panel boundaries.
- `src/components/ui/notice.tsx` - information, sandbox and error notices.
- `src/components/ui/status-badge.tsx` - compact semantic status.
- `src/components/ui/section-heading.tsx` - eyebrow/title/description hierarchy.
- `src/components/layout/MarketingLayout.tsx` - skip link, header, outlet and footer.
- `src/components/layout/LocaleSwitcher.tsx` - localized route links.
- `src/components/layout/Header.tsx` - localized desktop and Radix mobile navigation.
- `src/components/layout/Footer.tsx` - localized B2B and legal navigation.
- `src/components/marketing/SettlementEventPanel.tsx` - fixed sandbox event demonstration.
- `src/components/marketing/InfrastructureDiagram.tsx` - operational settlement flow.
- `src/components/seo/PageMetadata.tsx` - localized document metadata lifecycle.
- `src/pages/NotFound.tsx` - accessible localized 404.
- `src/pages/Landing.test.tsx` - homepage content and claim tests.
- `src/pages/Legal.test.tsx` - legal draft and routing tests.
- `src/App.test.tsx` - public route and removed-route tests.
- `src/components/layout/Header.test.tsx` - navigation and mobile menu tests.
- `src/components/seo/PageMetadata.test.tsx` - metadata tests.
- `playwright.config.ts` - browser test configuration.
- `e2e/home.spec.ts` - mobile, tablet, desktop and console checks.
- `e2e/accessibility.spec.ts` - axe and keyboard checks.
- `public/robots.txt` - crawler policy.
- `public/sitemap.xml` - localized public route list.
- `public/og-peragus.svg` - 1200x630 social preview.

### Modify

- `.gitignore` - ignore local Superpowers companion artifacts.
- `package.json` and `package-lock.json` - remove product-only dependencies and add test/font dependencies.
- `vite.config.ts` - add Vitest configuration.
- `src/main.tsx` - remove AppKit and mount BrowserRouter only.
- `src/App.tsx` - public localized routes only.
- `src/index.css` - replace legacy palette and motion system with B1 tokens.
- `src/lib/utils.ts` - retain only `cn`; remove retail formatters.
- `src/components/ui/button.tsx` - B1 variants and valid `asChild` usage.
- `src/components/ui/input.tsx` - B1 field styling for later sandbox integration.
- `src/components/ui/label.tsx` - explicit accessible label primitive.
- `src/components/brand/PeragusLogo.tsx` - remove retail tagline and align sizing with B1 header.
- `src/pages/Landing.tsx` - approved eight-section homepage.
- `src/pages/Legal.tsx` - generic localized legal/security template.
- `index.html` - correct default metadata and domain.
- `public/manifest.webmanifest` - B1 colors and current identity.

### Delete

- `src/App.css`
- `src/abi/`
- `src/config/`
- `src/hooks/`
- `src/mock/`
- `src/providers/`
- `src/store/`
- `src/web3/`
- `src/lib/contracts/`
- `src/lib/web3/`
- `src/lib/supabase.ts`
- `src/types/index.ts`
- `src/constants/demo.ts`
- `src/constants/index.ts`
- `src/constants/navigation.ts`
- `src/constants/legalTerms.ts`
- `src/constants/securityGuidance.ts`
- `src/components/features/`
- `src/components/layout/DashboardLayout.tsx`
- `src/components/layout/DashboardTopBar.tsx`
- `src/components/layout/Header.tsx` (delete the auth/wallet implementation in Task 1; recreate the B2B implementation in Task 6)
- `src/components/layout/Footer.tsx` (delete the retail implementation in Task 1; recreate the B2B implementation in Task 6)
- `src/components/layout/Sidebar.tsx`
- `src/components/ui/badge.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/checkbox.tsx`
- `src/components/ui/select.tsx`
- `src/components/ui/separator.tsx`
- `src/pages/Dashboard.tsx`
- `src/pages/History.tsx`
- `src/pages/Liquidations.tsx`
- `src/pages/Login.tsx`
- `src/pages/Networks.tsx`
- `src/pages/NewOperation.tsx`
- `src/pages/OperationDetail.tsx`
- `src/pages/PainelOperacional.tsx`
- `src/pages/Register.tsx`
- `src/pages/Security.tsx`
- `src/pages/Settings.tsx`
- `src/pages/Verification.tsx`
- `src/pages/Wallets.tsx`
- `src/assets/hero.png`
- `src/assets/react.svg`
- `public/icons.svg`

---

### Task 1: Establish a Public-Only, Testable Baseline

**Files:**
- Modify: `.gitignore`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `vite.config.ts`
- Modify: `src/main.tsx`
- Modify: `src/App.tsx`
- Modify: `src/pages/Landing.tsx`
- Create: `src/pages/NotFound.tsx`
- Create: `src/test/setup.ts`
- Create: `src/App.test.tsx`
- Delete: every B2C/Web3/Supabase file listed in the global Delete map, including the auth-dependent Header and retail Footer, except old legal constants and unused UI primitives that Task 8/10 remove after replacement

**Interfaces:**
- Consumes: existing React/Vite application entrypoint.
- Produces: `App` as router-independent route content, mounted by `main.tsx` inside `BrowserRouter`; a buildable public-only source tree; Vitest scripts used by every later task.

- [ ] **Step 1: Install the test and local-font toolchain**

Run:

```powershell
npm install @fontsource-variable/manrope @fontsource/ibm-plex-mono
npm install --save-dev vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @playwright/test @axe-core/playwright
```

Expected: `package.json` and `package-lock.json` include the new packages.

- [ ] **Step 2: Add test scripts and Vitest configuration**

Add these scripts to `package.json`:

```json
"test": "vitest run",
"test:watch": "vitest",
"test:e2e": "playwright test"
```

Change `vite.config.ts` to:

```ts
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
  },
})
```

Create `src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(cleanup)
```

- [ ] **Step 3: Write the failing public-route test**

Create `src/App.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from './App'

function renderPath(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

describe('public routes', () => {
  it('renders the B2B sandbox proposition at the root', () => {
    renderPath('/')
    expect(screen.getByRole('heading', { name: /pix no brasil/i })).toBeInTheDocument()
    expect(screen.getByText(/mockusdt/i)).toBeInTheDocument()
  })

  it('does not expose the former retail dashboard', () => {
    renderPath('/dashboard')
    expect(screen.getByRole('heading', { name: /página não encontrada/i })).toBeInTheDocument()
    expect(screen.queryByText(/painel operacional/i)).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 4: Run the test to prove the current app fails the new route contract**

Run:

```powershell
npm test -- src/App.test.tsx
```

Expected: FAIL because `App` currently creates its own `BrowserRouter`, renders retail copy and redirects `/dashboard` through auth.

- [ ] **Step 5: Remove runtime providers and create the minimal approved public shell**

Change `src/main.tsx` to:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
```

Create `src/pages/NotFound.tsx`:

```tsx
import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <main id="main-content" className="min-h-screen px-6 py-32">
      <p className="text-sm text-text-tertiary">404</p>
      <h1 className="mt-3 text-4xl font-semibold">Página não encontrada</h1>
      <Link className="mt-8 inline-flex text-mint" to="/">Voltar para a Peragus</Link>
    </main>
  )
}
```

Replace `src/pages/Landing.tsx` with a baseline that already uses approved factual copy:

```tsx
export function Landing() {
  return (
    <main id="main-content" className="min-h-screen px-6 py-32">
      <p>Sandbox B2B - Polygon Amoy</p>
      <h1>Pix no Brasil. Liquidação na sua carteira.</h1>
      <p>
        Valide o fluxo entre uma cobrança Pix simulada e o envio de MockUSDT
        para sua carteira na Polygon Amoy.
      </p>
    </main>
  )
}
```

Replace `src/App.tsx` with:

```tsx
import { Route, Routes } from 'react-router-dom'
import { Landing } from '@/pages/Landing'
import { NotFound } from '@/pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
```

- [ ] **Step 6: Delete the B2C and runtime-integration source**

Delete the directories and files listed for Task 1. Keep only files imported by the public shell or explicitly retained for replacement in later tasks. Do not repair obsolete TypeScript errors before deletion.

- [ ] **Step 7: Remove product-only runtime dependencies**

Run:

```powershell
npm uninstall @reown/appkit @reown/appkit-adapter-wagmi @reown/appkit-wallet-button @supabase/supabase-js @tanstack/react-query ethers viem wagmi zustand
```

Keep all current Radix packages until Task 10 confirms which wrappers remain. Keep React Router, Lucide, CVA, clsx and tailwind-merge.

- [ ] **Step 8: Ignore local visual-companion files**

Append to `.gitignore`:

```gitignore

# Local Superpowers visual companion
.superpowers/
```

- [ ] **Step 9: Verify the public baseline**

Run:

```powershell
npm test -- src/App.test.tsx
npm run build
npm run lint
```

Expected: all three commands exit 0. The build has no Supabase, Reown, wallet or retail imports.

- [ ] **Step 10: Commit the baseline if commits are authorized**

```powershell
git add .gitignore package.json package-lock.json vite.config.ts src
git commit -m "refactor: remove retail product shell"
```

---

### Task 2: Add Typed Locale Routing

**Files:**
- Create: `src/i18n/routing.ts`
- Create: `src/i18n/routing.test.ts`
- Modify: `src/App.tsx`
- Modify: `src/pages/NotFound.tsx`

**Interfaces:**
- Consumes: router-independent `App` from Task 1.
- Produces: `Locale`, `LOCALES`, `homePath(locale)`, `pagePath(locale, slug)`, `sandboxPath(locale, slug)`, `sectionPath(locale, id)` and `localeFromPathname(pathname)` for all layout/content tasks.

- [ ] **Step 1: Write failing locale-route tests**

Create `src/i18n/routing.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import {
  homePath,
  localeFromPathname,
  pagePath,
  sandboxPath,
  sectionPath,
} from './routing'

describe('localized routing', () => {
  it('keeps Portuguese at the root', () => {
    expect(homePath('pt')).toBe('/')
    expect(pagePath('pt', 'terms')).toBe('/terms')
  })

  it('prefixes Spanish and English', () => {
    expect(homePath('es')).toBe('/es')
    expect(pagePath('en', 'privacy')).toBe('/en/privacy')
    expect(sandboxPath('es', 'register')).toBe('/es/register')
    expect(sectionPath('es', 'infraestrutura')).toBe('/es#infraestrutura')
  })

  it('reads locale only from a supported first path segment', () => {
    expect(localeFromPathname('/es/security')).toBe('es')
    expect(localeFromPathname('/en')).toBe('en')
    expect(localeFromPathname('/terms')).toBe('pt')
    expect(localeFromPathname('/fr')).toBe('pt')
  })
})
```

- [ ] **Step 2: Run the test and verify the module is missing**

Run:

```powershell
npm test -- src/i18n/routing.test.ts
```

Expected: FAIL because `src/i18n/routing.ts` does not exist.

- [ ] **Step 3: Implement the route contract**

Create `src/i18n/routing.ts`:

```ts
export const LOCALES = ['pt', 'es', 'en'] as const
export type Locale = (typeof LOCALES)[number]

export type PublicSlug = 'terms' | 'privacy' | 'compliance' | 'security'
export type SandboxSlug = 'login' | 'register' | 'docs'

const PREFIX: Record<Locale, string> = {
  pt: '',
  es: '/es',
  en: '/en',
}

export function homePath(locale: Locale): string {
  return PREFIX[locale] || '/'
}

export function pagePath(locale: Locale, slug: PublicSlug): string {
  return `${PREFIX[locale]}/${slug}`
}

export function sandboxPath(locale: Locale, slug: SandboxSlug): string {
  return `${PREFIX[locale]}/${slug}`
}

export function sectionPath(locale: Locale, id: string): string {
  return `${homePath(locale)}#${id}`
}

export function localeFromPathname(pathname: string): Locale {
  const segment = pathname.split('/').filter(Boolean)[0]
  return segment === 'es' || segment === 'en' ? segment : 'pt'
}
```

- [ ] **Step 4: Make the 404 locale-aware**

Change `NotFound` to accept `locale: Locale` and use these labels:

```ts
const labels = {
  pt: { title: 'Página não encontrada', back: 'Voltar para a Peragus' },
  es: { title: 'Página no encontrada', back: 'Volver a Peragus' },
  en: { title: 'Page not found', back: 'Back to Peragus' },
} satisfies Record<Locale, { title: string; back: string }>
```

The back link must use `homePath(locale)`.

Update the 404 classes now to `text-tertiary` for the `404` label and `text-mint` for the return link; no `text-text-*` class may remain after this task.

- [ ] **Step 5: Register all locale roots and a locale-aware catch-all**

Update `App.tsx` so `/`, `/es` and `/en` render `Landing` with the matching locale, and the catch-all passes `localeFromPathname(location.pathname)` to `NotFound`. Do not add sandbox routes.

- [ ] **Step 6: Verify locale routing**

Run:

```powershell
npm test -- src/i18n/routing.test.ts src/App.test.tsx
npm run build
```

Expected: PASS and build exit 0.

- [ ] **Step 7: Commit locale routing if authorized**

```powershell
git add src/i18n src/App.tsx src/pages/NotFound.tsx src/App.test.tsx
git commit -m "feat: add localized public routing"
```

---

### Task 3: Replace the Legacy CSS with the B1 Design System

**Files:**
- Modify: `src/index.css`
- Modify: `src/lib/utils.ts`
- Create: `src/index.test.ts`

**Interfaces:**
- Consumes: approved B1 values in the spec.
- Produces: Tailwind utilities `bg-midnight`, `bg-surface`, `bg-surface-raised`, `text-primary`, `text-secondary`, `text-tertiary`, `text-mint`, `text-data`, `text-sandbox`, `text-error`, `border-line`, `font-sans`, `font-mono`; global focus and reduced-motion behavior.

- [ ] **Step 1: Write a failing token regression test**

Create `src/index.test.ts`:

```ts
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const css = readFileSync(new URL('./index.css', import.meta.url), 'utf8')

describe('B1 design tokens', () => {
  it.each([
    '#06191d',
    '#0c272c',
    '#12353b',
    '#25474c',
    '#f1f7f5',
    '#a8bcb8',
    '#7f9b97',
    '#4de0bd',
    '#6680e8',
    '#e6c76d',
    '#ff8a8a',
  ])('contains approved token %s', (token) => {
    expect(css.toLowerCase()).toContain(token)
  })

  it('removes legacy Disney and looping animation language', () => {
    expect(css).not.toMatch(/Disney|valueFlow|shimmer|breathe/i)
  })

  it('contains reduced-motion handling', () => {
    expect(css).toContain('prefers-reduced-motion: reduce')
  })
})
```

- [ ] **Step 2: Run the test against the legacy CSS**

Run:

```powershell
npm test -- src/index.test.ts
```

Expected: FAIL because the current navy/blue tokens and legacy animations remain.

- [ ] **Step 3: Replace `src/index.css` with the B1 foundation**

Use this exact token foundation:

```css
@import '@fontsource-variable/manrope';
@import '@fontsource/ibm-plex-mono/400.css';
@import '@fontsource/ibm-plex-mono/500.css';
@import 'tailwindcss';

@theme {
  --color-midnight: #06191d;
  --color-surface: #0c272c;
  --color-surface-raised: #12353b;
  --color-line: #25474c;
  --color-primary: #f1f7f5;
  --color-secondary: #a8bcb8;
  --color-tertiary: #7f9b97;
  --color-mint: #4de0bd;
  --color-data: #6680e8;
  --color-sandbox: #e6c76d;
  --color-error: #ff8a8a;
  --font-sans: 'Manrope Variable', system-ui, sans-serif;
  --font-mono: 'IBM Plex Mono', ui-monospace, monospace;
  --shadow-panel: 0 24px 64px rgb(0 0 0 / 0.28);
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
}

html {
  scroll-behavior: smooth;
  background: var(--color-midnight);
}

body {
  margin: 0;
  min-width: 320px;
  background: var(--color-midnight);
  color: var(--color-primary);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

:focus-visible {
  outline: 2px solid var(--color-mint);
  outline-offset: 3px;
}

::selection {
  background: var(--color-mint);
  color: #08211e;
}

@keyframes section-enter {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.section-enter {
  animation: section-enter 220ms var(--ease-out) both;
}

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 4: Reduce utilities to the public-site need**

Replace `src/lib/utils.ts` with:

```ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 5: Verify tokens, build and lint**

Run:

```powershell
npm test -- src/index.test.ts
npm run build
npm run lint
```

Expected: all commands exit 0.

- [ ] **Step 6: Commit the design foundation if authorized**

```powershell
git add src/index.css src/index.test.ts src/lib/utils.ts package.json package-lock.json
git commit -m "feat: establish B1 design foundation"
```

---

### Task 4: Build the Reusable B1 Primitives

**Files:**
- Modify: `src/components/ui/button.tsx`
- Modify: `src/components/ui/input.tsx`
- Modify: `src/components/ui/label.tsx`
- Create: `src/components/ui/container.tsx`
- Create: `src/components/ui/surface.tsx`
- Create: `src/components/ui/notice.tsx`
- Create: `src/components/ui/status-badge.tsx`
- Create: `src/components/ui/section-heading.tsx`
- Create: `src/components/ui/primitives.test.tsx`

**Interfaces:**
- Consumes: B1 Tailwind tokens from Task 3 and `cn`.
- Produces: `Button`, `buttonVariants`, `Input`, `Label`, `Container`, `Surface`, `Notice`, `StatusBadge`, and `SectionHeading` for all later page tasks.

- [ ] **Step 1: Write failing primitive tests**

Create `src/components/ui/primitives.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Button } from './button'
import { Notice } from './notice'
import { SectionHeading } from './section-heading'

describe('B1 primitives', () => {
  it('renders a semantic button with the mint primary treatment', () => {
    render(<Button>Acessar sandbox</Button>)
    const button = screen.getByRole('button', { name: 'Acessar sandbox' })
    expect(button).toHaveClass('bg-mint', 'text-[#08211e]')
  })

  it('renders sandbox notices with explicit semantics', () => {
    render(<Notice tone="sandbox">MockUSDT não possui valor financeiro.</Notice>)
    expect(screen.getByRole('note')).toHaveTextContent(/não possui valor financeiro/i)
  })

  it('keeps heading hierarchy configurable', () => {
    render(<SectionHeading eyebrow="Fluxo" title="Tres estados" as="h2" />)
    expect(screen.getByRole('heading', { level: 2, name: 'Tres estados' })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests and verify the new primitives are absent**

Run:

```powershell
npm test -- src/components/ui/primitives.test.tsx
```

Expected: FAIL on missing modules and legacy button classes.

- [ ] **Step 3: Implement the B1 button variants**

Use this variant contract in `button.tsx`:

```ts
const buttonVariants = cva(
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-[7px] px-4 text-sm font-semibold transition-colors duration-150 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40',
  {
    variants: {
      variant: {
        primary: 'bg-mint text-[#08211e] hover:bg-[#67e7c8]',
        secondary: 'border border-line bg-surface text-primary hover:bg-surface-raised',
        ghost: 'text-secondary hover:bg-surface hover:text-primary',
        destructive: 'bg-error text-midnight hover:bg-[#ff9c9c]',
      },
      size: {
        default: 'h-11 px-4',
        sm: 'h-11 px-3 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'h-11 w-11 px-0',
      },
    },
    defaultVariants: { variant: 'primary', size: 'default' },
  },
)
```

Keep `asChild` through Radix Slot so links never wrap buttons.

- [ ] **Step 4: Implement focused primitives**

Use these signatures:

```ts
export type SurfaceProps = React.HTMLAttributes<HTMLDivElement> & {
  elevation?: 'base' | 'raised'
}

export type NoticeProps = React.HTMLAttributes<HTMLDivElement> & {
  tone: 'info' | 'sandbox' | 'error'
}

export type StatusBadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone: 'active' | 'data' | 'sandbox'
}

export type SectionHeadingProps = {
  eyebrow?: string
  title: string
  description?: string
  as?: 'h1' | 'h2' | 'h3'
  align?: 'left' | 'center'
  className?: string
}
```

`Notice` uses `role="note"`, a left border, and these mappings:

```ts
const noticeTone = {
  info: 'border-data bg-data/10 text-secondary',
  sandbox: 'border-sandbox bg-sandbox/10 text-secondary',
  error: 'border-error bg-error/10 text-secondary',
}
```

`Container` uses `mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8`.

`Surface` uses opaque backgrounds and borders, never backdrop blur.

- [ ] **Step 5: Restyle Input and Label without adding form behavior**

`Input` must have `min-h-11`, `bg-midnight`, `border-line`, `text-primary`, `placeholder:text-tertiary`, and `aria-invalid:border-error` classes. `Label` must render a native `<label>` and preserve `htmlFor`.

- [ ] **Step 6: Verify primitive behavior**

Run:

```powershell
npm test -- src/components/ui/primitives.test.tsx
npm run build
npm run lint
```

Expected: all commands exit 0.

- [ ] **Step 7: Commit primitives if authorized**

```powershell
git add src/components/ui
git commit -m "feat: add B1 interface primitives"
```

---

### Task 5: Add Complete Homepage Content in Three Languages

**Files:**
- Create: `src/content/home/types.ts`
- Create: `src/content/home/pt.ts`
- Create: `src/content/home/es.ts`
- Create: `src/content/home/en.ts`
- Create: `src/content/home/index.ts`
- Create: `src/content/home/content.test.ts`

**Interfaces:**
- Consumes: `Locale` from Task 2.
- Produces: `HomeContent`, `homeContent: Record<Locale, HomeContent>` and approved factual copy for layout/homepage tasks.

- [ ] **Step 1: Write failing content-contract tests**

Create `src/content/home/content.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { LOCALES } from '@/i18n/routing'
import { homeContent } from './index'

describe('localized homepage content', () => {
  it('defines every locale', () => {
    expect(Object.keys(homeContent).sort()).toEqual([...LOCALES].sort())
  })

  it.each(LOCALES)('keeps sandbox limits visible in %s', (locale) => {
    const serialized = JSON.stringify(homeContent[locale]).toLowerCase()
    expect(serialized).toContain('mockusdt')
    expect(serialized).toContain('polygon amoy')
  })

  it.each(LOCALES)('does not use unsupported claims in %s', (locale) => {
    const serialized = JSON.stringify(homeContent[locale]).toLowerCase()
    for (const claim of ['99,9%', 'instantâneo', 'instantáneo', 'instant', 'taxas competitivas', 'competitive rates', 'dólares digitais', 'dólares digitales']) {
      expect(serialized).not.toContain(claim)
    }
  })
})
```

- [ ] **Step 2: Run the tests and verify content modules are missing**

Run:

```powershell
npm test -- src/content/home/content.test.ts
```

Expected: FAIL because the content modules do not exist.

- [ ] **Step 3: Define the complete content contract**

Create `src/content/home/types.ts` with:

```ts
export type HomeContent = {
  languageName: string
  nav: {
    product: string
    howItWorks: string
    infrastructure: string
    security: string
    signIn: string
    sandbox: string
    menuOpen: string
    menuClose: string
  }
  hero: {
    label: string
    title: string
    description: string
    primaryCta: string
    secondaryCta: string
  }
  eventPanel: {
    operation: string
    environment: string
    simulated: string
  }
  transparency: Array<{ title: string; body: string }>
  howItWorks: {
    eyebrow: string
    title: string
    description: string
    steps: Array<{ title: string; body: string }>
  }
  operations: {
    eyebrow: string
    title: string
    description: string
    items: Array<{ title: string; body: string }>
  }
  useCases: {
    eyebrow: string
    title: string
    merchant: { title: string; body: string }
    acquirer: { title: string; body: string }
  }
  infrastructure: {
    eyebrow: string
    title: string
    description: string
    nodes: [string, string, string, string]
  }
  disclosure: { eyebrow: string; title: string; body: string }
  finalCta: { eyebrow: string; title: string; body: string; primary: string; secondary: string }
  footer: {
    description: string
    product: string
    resources: string
    legal: string
    documentation: string
    terms: string
    privacy: string
    compliance: string
  }
  seo: { title: string; description: string }
}
```

- [ ] **Step 4: Add exact Portuguese content**

The Portuguese object must use the approved strings:

```ts
export const ptHome = {
  languageName: 'Português',
  nav: {
    product: 'Produto', howItWorks: 'Como funciona', infrastructure: 'Infraestrutura',
    security: 'Segurança', signIn: 'Entrar', sandbox: 'Criar conta sandbox',
    menuOpen: 'Abrir menu', menuClose: 'Fechar menu',
  },
  hero: {
    label: 'Sandbox B2B - Polygon Amoy',
    title: 'Pix no Brasil. Liquidação na sua carteira.',
    description: 'Valide, em um ambiente de testes, o fluxo entre uma cobrança Pix simulada e o envio de MockUSDT para sua carteira na Polygon Amoy.',
    primaryCta: 'Criar conta sandbox', secondaryCta: 'Entender o fluxo',
  },
  eventPanel: { operation: 'OPERAÇÃO #PGS-2048', environment: 'TESTNET', simulated: 'simulado' },
  transparency: [
    { title: 'Ambiente sandbox', body: 'Sem movimentação de fundos reais.' },
    { title: 'MockUSDT', body: 'Token de teste sem valor financeiro.' },
    { title: 'Carteira própria', body: 'A Peragus não mantém o saldo do cliente.' },
    { title: 'Polygon Amoy', body: 'Transações verificáveis em uma rede de testes.' },
  ],
  howItWorks: {
    eyebrow: 'Fluxo operacional', title: 'Três estados. Uma trilha verificável.',
    description: 'Acompanhe o caminho do pagamento de teste até a transação na rede.',
    steps: [
      { title: 'Crie uma cobrança', body: 'Inicie um pagamento de teste em BRL e receba instruções Pix simuladas.' },
      { title: 'Confirme o evento', body: 'Simule a confirmação e acompanhe a mudança de estado da operação.' },
      { title: 'Verifique a liquidação', body: 'Confira o envio de MockUSDT para a carteira informada na Polygon Amoy.' },
    ],
  },
  operations: {
    eyebrow: 'Para financeiro e operações', title: 'Menos abstração. Mais visibilidade sobre cada etapa.',
    description: 'Capacidades demonstráveis no sandbox, sem promessas de produção.',
    items: [
      { title: 'Estados claros', body: 'Acompanhe criação, confirmação e liquidação.' },
      { title: 'Referência entre sistemas', body: 'Relacione o pagamento de teste à transação on-chain.' },
      { title: 'Carteira sob seu controle', body: 'Defina o endereço de recebimento no ambiente de testes.' },
      { title: 'Fluxo preparado para integração', body: 'Valide o modelo antes da escolha de um gateway ou BaaS.' },
    ],
  },
  useCases: {
    eyebrow: 'Quem pode testar', title: 'Infraestrutura para quem vende ao Brasil.',
    merchant: { title: 'Comerciantes internacionais', body: 'Teste uma experiência Pix para compradores brasileiros e o recebimento do ativo de teste em carteira própria.' },
    acquirer: { title: 'Adquirentes e plataformas', body: 'Valide como o fluxo pode ser incorporado a uma operação de pagamentos existente.' },
  },
  infrastructure: {
    eyebrow: 'Tecnologia demonstrável', title: 'Do evento de pagamento à transação na rede.',
    description: 'Uma sequência explícita conecta cada estado do pagamento à liquidação de teste.',
    nodes: ['Cliente B2B', 'Pix simulado', 'Orquestração Peragus', 'MockUSDT na Amoy'],
  },
  disclosure: {
    eyebrow: 'Limites do ambiente', title: 'Um sandbox para validação técnica.',
    body: 'MockUSDT não é USDT, não possui valor financeiro e opera somente na Polygon Amoy. O Pix permanece simulado até a futura integração com um gateway ou BaaS.',
  },
  finalCta: {
    eyebrow: 'Primeiro teste', title: 'Execute sua primeira liquidação de teste.',
    body: 'Crie sua conta, gere uma API key e acompanhe o fluxo até a transação na Polygon Amoy.',
    primary: 'Criar conta sandbox', secondary: 'Explorar documentação',
  },
  footer: {
    description: 'Sandbox B2B para validar fluxos Pix e liquidação on-chain.', product: 'Produto',
    resources: 'Recursos', legal: 'Legal', documentation: 'Documentação', terms: 'Termos',
    privacy: 'Privacidade', compliance: 'Compliance',
  },
  seo: {
    title: 'Peragus | Sandbox B2B para Pix e liquidação on-chain',
    description: 'Valide um fluxo de pagamento Pix simulado e liquidação em MockUSDT na Polygon Amoy.',
  },
} satisfies HomeContent
```

- [ ] **Step 5: Add exact Spanish content**

Create the same structure in `es.ts` using these approved equivalents:

```ts
export const esHome = {
  languageName: 'Español',
  nav: {
    product: 'Producto', howItWorks: 'Cómo funciona', infrastructure: 'Infraestructura',
    security: 'Seguridad', signIn: 'Ingresar', sandbox: 'Crear cuenta sandbox',
    menuOpen: 'Abrir menú', menuClose: 'Cerrar menú',
  },
  hero: {
    label: 'Sandbox B2B - Polygon Amoy',
    title: 'Pix en Brasil. Liquidación en tu billetera.',
    description: 'Valida, en un entorno de pruebas, el flujo entre un cobro Pix simulado y el envío de MockUSDT a tu billetera en Polygon Amoy.',
    primaryCta: 'Crear cuenta sandbox', secondaryCta: 'Entender el flujo',
  },
  eventPanel: { operation: 'OPERACIÓN #PGS-2048', environment: 'TESTNET', simulated: 'simulado' },
  transparency: [
    { title: 'Entorno sandbox', body: 'Sin movimiento de fondos reales.' },
    { title: 'MockUSDT', body: 'Token de prueba sin valor financiero.' },
    { title: 'Billetera propia', body: 'Peragus no mantiene el saldo del cliente.' },
    { title: 'Polygon Amoy', body: 'Transacciones verificables en una red de pruebas.' },
  ],
  howItWorks: {
    eyebrow: 'Flujo operativo', title: 'Tres estados. Un registro verificable.',
    description: 'Sigue el recorrido del pago de prueba hasta la transacción en la red.',
    steps: [
      { title: 'Crea un cobro', body: 'Inicia un pago de prueba en BRL y recibe instrucciones Pix simuladas.' },
      { title: 'Confirma el evento', body: 'Simula la confirmación y sigue el cambio de estado de la operación.' },
      { title: 'Verifica la liquidación', body: 'Comprueba el envío de MockUSDT a la billetera indicada en Polygon Amoy.' },
    ],
  },
  operations: {
    eyebrow: 'Para finanzas y operaciones', title: 'Menos abstracción. Más visibilidad en cada etapa.',
    description: 'Capacidades demostrables en el sandbox, sin promesas de producción.',
    items: [
      { title: 'Estados claros', body: 'Sigue la creación, confirmación y liquidación.' },
      { title: 'Referencia entre sistemas', body: 'Relaciona el pago de prueba con la transacción on-chain.' },
      { title: 'Billetera bajo tu control', body: 'Define la dirección de recepción en el entorno de pruebas.' },
      { title: 'Flujo preparado para integración', body: 'Valida el modelo antes de elegir un gateway o BaaS.' },
    ],
  },
  useCases: {
    eyebrow: 'Quién puede probarlo', title: 'Infraestructura para quienes venden a Brasil.',
    merchant: { title: 'Comercios internacionales', body: 'Prueba una experiencia Pix para compradores brasileños y la recepción del activo de prueba en una billetera propia.' },
    acquirer: { title: 'Adquirentes y plataformas', body: 'Valida cómo el flujo puede incorporarse a una operación de pagos existente.' },
  },
  infrastructure: {
    eyebrow: 'Tecnología demostrable', title: 'Del evento de pago a la transacción en la red.',
    description: 'Una secuencia explícita conecta cada estado del pago con la liquidación de prueba.',
    nodes: ['Cliente B2B', 'Pix simulado', 'Orquestación Peragus', 'MockUSDT en Amoy'],
  },
  disclosure: {
    eyebrow: 'Límites del entorno', title: 'Un sandbox para validación técnica.',
    body: 'MockUSDT no es USDT, no tiene valor financiero y funciona solamente en Polygon Amoy. Pix permanece simulado hasta una futura integración con un gateway o BaaS.',
  },
  finalCta: {
    eyebrow: 'Primera prueba', title: 'Ejecuta tu primera liquidación de prueba.',
    body: 'Crea tu cuenta, genera una API key y sigue el flujo hasta la transacción en Polygon Amoy.',
    primary: 'Crear cuenta sandbox', secondary: 'Explorar documentación',
  },
  footer: {
    description: 'Sandbox B2B para validar flujos Pix y liquidación on-chain.', product: 'Producto',
    resources: 'Recursos', legal: 'Legal', documentation: 'Documentación', terms: 'Términos',
    privacy: 'Privacidad', compliance: 'Cumplimiento',
  },
  seo: {
    title: 'Peragus | Sandbox B2B para Pix y liquidación on-chain',
    description: 'Valida un flujo de pago Pix simulado y liquidación en MockUSDT en Polygon Amoy.',
  },
} satisfies HomeContent
```

- [ ] **Step 6: Add exact English content**

Create the same structure in `en.ts`:

```ts
export const enHome = {
  languageName: 'English',
  nav: {
    product: 'Product', howItWorks: 'How it works', infrastructure: 'Infrastructure',
    security: 'Security', signIn: 'Sign in', sandbox: 'Create sandbox account',
    menuOpen: 'Open menu', menuClose: 'Close menu',
  },
  hero: {
    label: 'B2B sandbox - Polygon Amoy',
    title: 'Pix in Brazil. Settlement to your wallet.',
    description: 'Validate, in a test environment, the flow between a simulated Pix payment and MockUSDT delivery to your wallet on Polygon Amoy.',
    primaryCta: 'Create sandbox account', secondaryCta: 'Understand the flow',
  },
  eventPanel: { operation: 'OPERATION #PGS-2048', environment: 'TESTNET', simulated: 'simulated' },
  transparency: [
    { title: 'Sandbox environment', body: 'No real funds are moved.' },
    { title: 'MockUSDT', body: 'A test token with no financial value.' },
    { title: 'Customer wallet', body: 'Peragus does not hold customer balances.' },
    { title: 'Polygon Amoy', body: 'Transactions are verifiable on a test network.' },
  ],
  howItWorks: {
    eyebrow: 'Operational flow', title: 'Three states. One verifiable trail.',
    description: 'Follow the test payment from creation to the network transaction.',
    steps: [
      { title: 'Create a payment', body: 'Start a BRL test payment and receive simulated Pix instructions.' },
      { title: 'Confirm the event', body: 'Simulate confirmation and follow the operation state change.' },
      { title: 'Verify settlement', body: 'Confirm MockUSDT delivery to the provided wallet on Polygon Amoy.' },
    ],
  },
  operations: {
    eyebrow: 'For finance and operations', title: 'Less abstraction. More visibility at every stage.',
    description: 'Capabilities demonstrated in the sandbox without production claims.',
    items: [
      { title: 'Explicit states', body: 'Follow creation, confirmation and settlement.' },
      { title: 'Cross-system reference', body: 'Connect the test payment to the on-chain transaction.' },
      { title: 'Customer-controlled wallet', body: 'Set the receiving address in the test environment.' },
      { title: 'Integration-ready flow', body: 'Validate the model before selecting a gateway or BaaS.' },
    ],
  },
  useCases: {
    eyebrow: 'Who can test', title: 'Infrastructure for businesses selling to Brazil.',
    merchant: { title: 'International merchants', body: 'Test a Pix experience for Brazilian buyers and receive the test asset in your own wallet.' },
    acquirer: { title: 'Acquirers and platforms', body: 'Validate how the flow could connect to an existing payment operation.' },
  },
  infrastructure: {
    eyebrow: 'Demonstrable technology', title: 'From payment event to network transaction.',
    description: 'An explicit sequence connects each payment state to test settlement.',
    nodes: ['B2B customer', 'Simulated Pix', 'Peragus orchestration', 'MockUSDT on Amoy'],
  },
  disclosure: {
    eyebrow: 'Environment limits', title: 'A sandbox for technical validation.',
    body: 'MockUSDT is not USDT, has no financial value and operates only on Polygon Amoy. Pix remains simulated until a future gateway or BaaS integration.',
  },
  finalCta: {
    eyebrow: 'First test', title: 'Run your first test settlement.',
    body: 'Create your account, generate an API key and follow the flow through the Polygon Amoy transaction.',
    primary: 'Create sandbox account', secondary: 'Explore documentation',
  },
  footer: {
    description: 'A B2B sandbox for validating Pix and on-chain settlement flows.', product: 'Product',
    resources: 'Resources', legal: 'Legal', documentation: 'Documentation', terms: 'Terms',
    privacy: 'Privacy', compliance: 'Compliance',
  },
  seo: {
    title: 'Peragus | B2B sandbox for Pix and on-chain settlement',
    description: 'Validate a simulated Pix payment and MockUSDT settlement flow on Polygon Amoy.',
  },
} satisfies HomeContent
```

- [ ] **Step 7: Export the locale lookup**

Create `src/content/home/index.ts`:

```ts
import type { Locale } from '@/i18n/routing'
import { enHome } from './en'
import { esHome } from './es'
import { ptHome } from './pt'
import type { HomeContent } from './types'

export const homeContent = {
  pt: ptHome,
  es: esHome,
  en: enHome,
} satisfies Record<Locale, HomeContent>
```

- [ ] **Step 8: Verify parity and claims**

Run:

```powershell
npm test -- src/content/home/content.test.ts
npm run build
```

Expected: PASS and build exit 0.

- [ ] **Step 9: Commit localized content if authorized**

```powershell
git add src/content/home
git commit -m "feat: add localized B2B website content"
```

---

### Task 6: Build the Accessible Marketing Layout

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/brand/PeragusLogo.tsx`
- Create: `src/components/layout/Header.tsx`
- Create: `src/components/layout/Footer.tsx`
- Create: `src/components/layout/MarketingLayout.tsx`
- Create: `src/components/layout/LocaleSwitcher.tsx`
- Create: `src/components/layout/Header.test.tsx`

**Interfaces:**
- Consumes: routing helpers from Task 2, `homeContent` from Task 5, `Button` and `Container` from Task 4.
- Produces: `MarketingLayout({ locale })`, `Header({ locale, content })`, `Footer({ locale, content })`, `LocaleSwitcher({ locale })`; an `<Outlet>` for homepage/legal pages.

- [ ] **Step 1: Write failing header tests**

Create `src/components/layout/Header.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { homeContent } from '@/content/home'
import { Header } from './Header'

describe('Header', () => {
  it('links the Spanish sandbox CTA to the reserved registration route', () => {
    render(<MemoryRouter><Header locale="es" content={homeContent.es} /></MemoryRouter>)
    expect(screen.getByRole('link', { name: 'Crear cuenta sandbox' })).toHaveAttribute('href', '/es/register')
  })

  it('opens and closes the mobile dialog accessibly', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><Header locale="pt" content={homeContent.pt} /></MemoryRouter>)
    await user.click(screen.getByRole('button', { name: 'Abrir menu' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests and verify the legacy header fails**

Run:

```powershell
npm test -- src/components/layout/Header.test.tsx
```

Expected: FAIL because the current header depends on auth/wallet state and has no locale contract.

- [ ] **Step 3: Implement the locale switcher**

`LocaleSwitcher` renders three links (`PT`, `ES`, `EN`) using `homePath(targetLocale)`, preserves the current public slug when possible, and marks the active language with `aria-current="page"`. Its accessible label is `Idioma / Idioma / Language`.

Implement:

```tsx
const localeLabel = { pt: 'PT', es: 'ES', en: 'EN' } satisfies Record<Locale, string>
const publicSlugs = new Set<PublicSlug>(['terms', 'privacy', 'compliance', 'security'])

export function LocaleSwitcher({ locale }: { locale: Locale }) {
  const location = useLocation()
  const segments = location.pathname.split('/').filter(Boolean)
  const lastSegment = segments[segments.length - 1]
  const currentSlug = lastSegment && publicSlugs.has(lastSegment as PublicSlug) ? lastSegment as PublicSlug : null
  return (
    <nav aria-label="Idioma / Language" className="flex items-center gap-1">
      {LOCALES.map((target) => {
        const to = currentSlug ? pagePath(target, currentSlug) : homePath(target)
        return <Link key={target} to={to} aria-current={target === locale ? 'page' : undefined} className="flex h-11 min-w-11 items-center justify-center font-mono text-xs text-tertiary aria-[current=page]:text-mint">{localeLabel[target]}</Link>
      })}
    </nav>
  )
}
```

- [ ] **Step 4: Rewrite the header with Radix Dialog**

The desktop navigation uses ordinary links and `Button asChild` for the CTA. Build both navigation variants from this exact data:

```tsx
const navigation = [
  { label: content.nav.product, href: sectionPath(locale, 'produto') },
  { label: content.nav.howItWorks, href: sectionPath(locale, 'como-funciona') },
  { label: content.nav.infrastructure, href: sectionPath(locale, 'infraestrutura') },
  { label: content.nav.security, href: pagePath(locale, 'security') },
]
```

The mobile version uses:

```tsx
<Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
  <Dialog.Trigger asChild>
    <button className="inline-flex h-11 w-11 items-center justify-center lg:hidden" aria-label={content.nav.menuOpen}>
      <Menu aria-hidden="true" />
    </button>
  </Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Overlay className="fixed inset-0 z-40 bg-midnight/80" />
    <Dialog.Content className="fixed inset-x-4 top-4 z-50 rounded-xl border border-line bg-surface p-5 shadow-panel lg:hidden">
      <Dialog.Title className="sr-only">{content.nav.product}</Dialog.Title>
      <Dialog.Close aria-label={content.nav.menuClose} className="ml-auto flex h-11 w-11 items-center justify-center">
        <X aria-hidden="true" />
      </Dialog.Close>
      <nav aria-label={content.nav.product} className="mt-6 grid gap-2">
        {navigation.map((item) => (
          <Link key={item.href} to={item.href} onClick={() => setMobileOpen(false)} className="flex min-h-11 items-center text-secondary">
            {item.label}
          </Link>
        ))}
        <Link to={sandboxPath(locale, 'login')} onClick={() => setMobileOpen(false)} className="flex min-h-11 items-center text-secondary">
          {content.nav.signIn}
        </Link>
        <Button asChild className="mt-3">
          <Link to={sandboxPath(locale, 'register')} onClick={() => setMobileOpen(false)}>
            {content.nav.sandbox}
          </Link>
        </Button>
      </nav>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
```

- [ ] **Step 5: Rewrite the footer and brand treatment**

Use `content.footer` and localized paths. Include `peragus.com.br`, Terms, Privacy, Compliance and Security. Remove the retail USDT sentence. The logo component keeps the current image and accessible `Peragus` text but removes the hardcoded retail/infrastructure tagline option.

The footer link groups use this exact route mapping:

```tsx
const footerGroups = [
  {
    title: content.footer.product,
    links: [
      [content.nav.howItWorks, sectionPath(locale, 'como-funciona')],
      [content.nav.infrastructure, sectionPath(locale, 'infraestrutura')],
    ],
  },
  {
    title: content.footer.resources,
    links: [
      [content.footer.documentation, sandboxPath(locale, 'docs')],
      [content.nav.security, pagePath(locale, 'security')],
    ],
  },
  {
    title: content.footer.legal,
    links: [
      [content.footer.terms, pagePath(locale, 'terms')],
      [content.footer.privacy, pagePath(locale, 'privacy')],
      [content.footer.compliance, pagePath(locale, 'compliance')],
    ],
  },
] as const
```

Render each pair as a React Router `<Link>`, display `content.footer.description` beside the logo, and finish with plain text `peragus.com.br`. Do not add a contact email until it is verified.

- [ ] **Step 6: Create `MarketingLayout`**

```tsx
export function MarketingLayout({ locale }: { locale: Locale }) {
  const content = homeContent[locale]
  return (
    <div className="min-h-screen bg-midnight text-primary">
      <a href="#main-content" className="sr-only z-[100] bg-mint px-4 py-3 text-midnight focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        {locale === 'pt' ? 'Pular para o conteúdo' : locale === 'es' ? 'Saltar al contenido' : 'Skip to content'}
      </a>
      <Header locale={locale} content={content} />
      <Outlet />
      <Footer locale={locale} content={content} />
    </div>
  )
}
```

- [ ] **Step 7: Update route nesting**

For each locale, register a layout route at its locale root and an index `Landing`. Reserve `/login`, `/register` and `/docs` but do not render them in this website plan; CTA destinations are integration contracts and release remains blocked until the sandbox plan implements them.

Use this route structure before Task 8 adds legal children:

```tsx
function LocalizedNotFound() {
  const location = useLocation()
  return <NotFound locale={localeFromPathname(location.pathname)} />
}

export default function App() {
  return (
    <Routes>
      {LOCALES.map((locale) => (
        <Route key={locale} path={homePath(locale)} element={<MarketingLayout locale={locale} />}>
          <Route index element={<Landing locale={locale} />} />
        </Route>
      ))}
      <Route path="*" element={<LocalizedNotFound />} />
    </Routes>
  )
}
```

- [ ] **Step 8: Verify layout behavior**

Run:

```powershell
npm test -- src/components/layout/Header.test.tsx src/App.test.tsx
npm run build
npm run lint
```

Expected: all commands exit 0.

- [ ] **Step 9: Commit the layout if authorized**

```powershell
git add src/App.tsx src/components/brand src/components/layout
git commit -m "feat: add accessible marketing layout"
```

---

### Task 7: Implement the Approved B1 Homepage

**Files:**
- Modify: `src/pages/Landing.tsx`
- Create: `src/components/marketing/SettlementEventPanel.tsx`
- Create: `src/components/marketing/InfrastructureDiagram.tsx`
- Create: `src/pages/Landing.test.tsx`

**Interfaces:**
- Consumes: `HomeContent`, `Locale`, routing helpers, B1 primitives and marketing layout.
- Produces: `Landing({ locale })`, fixed `SettlementEventPanel({ content })`, responsive `InfrastructureDiagram({ nodes })`.

- [ ] **Step 1: Write failing homepage acceptance tests**

Create `src/pages/Landing.test.tsx`:

```tsx
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { Landing } from './Landing'

describe('Landing', () => {
  it('states the tested flow and limits before conversion', () => {
    render(<MemoryRouter><Landing locale="pt" /></MemoryRouter>)
    const main = screen.getByRole('main')
    expect(within(main).getByRole('heading', { level: 1, name: 'Pix no Brasil. Liquidação na sua carteira.' })).toBeInTheDocument()
    expect(within(main).getByText(/sem movimentação de fundos reais/i)).toBeInTheDocument()
    expect(within(main).getByText(/mockusdt não é usdt/i)).toBeInTheDocument()
  })

  it('uses one primary CTA label consistently', () => {
    render(<MemoryRouter><Landing locale="en" /></MemoryRouter>)
    expect(screen.getAllByRole('link', { name: 'Create sandbox account' })).toHaveLength(2)
  })

  it('does not render retail or unsupported claims', () => {
    const { container } = render(<MemoryRouter><Landing locale="pt" /></MemoryRouter>)
    expect(container.textContent).not.toMatch(/compre usdt|taxas competitivas|99,9%|dólares digitais/i)
  })
})
```

- [ ] **Step 2: Run the tests and verify the baseline page is incomplete**

Run:

```powershell
npm test -- src/pages/Landing.test.tsx
```

Expected: FAIL because the eight approved sections are not implemented.

- [ ] **Step 3: Implement the fixed settlement event panel**

Render exactly three rows:

```ts
const events = [
  { index: '01', event: 'payment.created', value: 'BRL 1.250,00' },
  { index: '02', event: 'pix.confirmed', value: content.simulated },
  { index: '03', event: 'settlement.sent', value: '0x71...9c' },
]
```

The panel carries visible `TESTNET`, uses a `<ol>`, and the transaction reference is plain text rather than a link because it is demonstrative.

```tsx
export function SettlementEventPanel({ content }: { content: HomeContent['eventPanel'] }) {
  const events = [
    { index: '01', event: 'payment.created', value: 'BRL 1.250,00' },
    { index: '02', event: 'pix.confirmed', value: content.simulated },
    { index: '03', event: 'settlement.sent', value: '0x71...9c' },
  ]
  return (
    <Surface elevation="raised" className="overflow-hidden shadow-panel">
      <div className="flex justify-between border-b border-line px-4 py-3 font-mono text-xs text-tertiary"><span>{content.operation}</span><StatusBadge tone="sandbox">{content.environment}</StatusBadge></div>
      <ol>{events.map((item) => <li key={item.index} className="grid grid-cols-[2rem_1fr_auto] gap-3 border-b border-line px-4 py-4 font-mono text-xs last:border-0"><span className="text-mint">{item.index}</span><span className="min-w-0 break-all text-secondary">{item.event}</span><span className="break-all text-primary">{item.value}</span></li>)}</ol>
    </Surface>
  )
}
```

- [ ] **Step 4: Implement the infrastructure diagram**

Use an ordered list with four nodes and CSS connectors. On large screens use four columns; below `md`, use one column and vertical connectors. Arrow SVGs are `aria-hidden`; the ordered list preserves the understandable sequence without them.

```tsx
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
```

- [ ] **Step 5: Compose the eight homepage sections**

`Landing` must render, in order:

1. Hero with label, H1, description, primary `/register` CTA, secondary `#como-funciona` CTA and event panel.
2. Four-item transparency strip.
3. Three-step `#como-funciona` section.
4. Asymmetric operational-capability list in `#produto`.
5. Two use cases without a four-card grid.
6. `#infraestrutura` diagram.
7. `#seguranca` sandbox disclosure using `Notice tone="sandbox"`.
8. Final CTA with `/register` and `/docs` links.

Use `Button asChild` for every CTA link. Use `clamp(2.6rem,7vw,5.8rem)` for the H1, a single restricted radial halo in the hero, opaque surfaces and no backdrop blur.

Use this composition as the implementation skeleton; do not replace the explicit sections with a generic card renderer:

```tsx
export function Landing({ locale }: { locale: Locale }) {
  const content = homeContent[locale]
  return (
    <main id="main-content" tabIndex={-1}>
      <section className="relative overflow-hidden pb-20 pt-32 sm:pb-28 sm:pt-40">
        <Container className="grid gap-12 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
          <div>
            <p className="font-mono text-xs uppercase tracking-[.14em] text-mint">{content.hero.label}</p>
            <h1 className="mt-5 max-w-4xl text-[clamp(2.6rem,7vw,5.8rem)] font-semibold leading-[.96] tracking-[-.055em]">{content.hero.title}</h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-secondary sm:text-lg">{content.hero.description}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg"><Link to={sandboxPath(locale, 'register')}>{content.hero.primaryCta}</Link></Button>
              <Button asChild size="lg" variant="secondary"><Link to={sectionPath(locale, 'como-funciona')}>{content.hero.secondaryCta}</Link></Button>
            </div>
          </div>
          <SettlementEventPanel content={content.eventPanel} />
        </Container>
      </section>

      <section aria-label={content.transparency[0].title} className="border-y border-line">
        <Container className="grid sm:grid-cols-2 lg:grid-cols-4">
          {content.transparency.map((item) => <div key={item.title} className="border-line py-6 lg:border-r lg:px-5"><h2 className="text-sm font-semibold">{item.title}</h2><p className="mt-2 text-sm leading-6 text-tertiary">{item.body}</p></div>)}
        </Container>
      </section>

      <section id="como-funciona" className="scroll-mt-24 py-24 sm:py-32">
        <Container><SectionHeading eyebrow={content.howItWorks.eyebrow} title={content.howItWorks.title} description={content.howItWorks.description} /><ol className="mt-12 grid gap-8 md:grid-cols-3">{content.howItWorks.steps.map((step, index) => <li key={step.title} className="border-t-2 border-line pt-5"><span className="font-mono text-xs text-mint">0{index + 1}</span><h3 className="mt-4 text-lg font-semibold">{step.title}</h3><p className="mt-3 text-sm leading-6 text-tertiary">{step.body}</p></li>)}</ol></Container>
      </section>

      <section id="produto" className="scroll-mt-24 border-y border-line bg-surface/35 py-24 sm:py-32">
        <Container className="grid gap-12 lg:grid-cols-[.85fr_1.15fr]"><SectionHeading eyebrow={content.operations.eyebrow} title={content.operations.title} description={content.operations.description} /><div>{content.operations.items.map((item, index) => <article key={item.title} className="grid grid-cols-[2rem_1fr] gap-4 border-t border-line py-5"><span className="font-mono text-xs text-mint">0{index + 1}</span><div><h3 className="font-semibold">{item.title}</h3><p className="mt-2 text-sm leading-6 text-tertiary">{item.body}</p></div></article>)}</div></Container>
      </section>

      <section className="py-24 sm:py-32">
        <Container><SectionHeading eyebrow={content.useCases.eyebrow} title={content.useCases.title} /><div className="mt-10 grid gap-4 md:grid-cols-2">{[content.useCases.merchant, content.useCases.acquirer].map((useCase) => <Surface key={useCase.title} className="p-6 sm:p-8"><h3 className="text-xl font-semibold">{useCase.title}</h3><p className="mt-4 text-sm leading-7 text-secondary">{useCase.body}</p></Surface>)}</div></Container>
      </section>

      <section id="infraestrutura" className="scroll-mt-24 border-y border-line bg-surface/35 py-24 sm:py-32">
        <Container><SectionHeading eyebrow={content.infrastructure.eyebrow} title={content.infrastructure.title} description={content.infrastructure.description} /><InfrastructureDiagram nodes={content.infrastructure.nodes} /></Container>
      </section>

      <section id="seguranca" className="scroll-mt-24 py-24 sm:py-32">
        <Container><SectionHeading eyebrow={content.disclosure.eyebrow} title={content.disclosure.title} /><Notice tone="sandbox" className="mt-8">{content.disclosure.body}</Notice></Container>
      </section>

      <section className="border-t border-line py-24 text-center sm:py-32">
        <Container><SectionHeading align="center" eyebrow={content.finalCta.eyebrow} title={content.finalCta.title} description={content.finalCta.body} /><div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Button asChild size="lg"><Link to={sandboxPath(locale, 'register')}>{content.finalCta.primary}</Link></Button><Button asChild size="lg" variant="secondary"><Link to={sandboxPath(locale, 'docs')}>{content.finalCta.secondary}</Link></Button></div></Container>
      </section>
    </main>
  )
}
```

- [ ] **Step 6: Verify homepage behavior and copy**

Run:

```powershell
npm test -- src/pages/Landing.test.tsx src/content/home/content.test.ts
npm run build
npm run lint
```

Expected: all commands exit 0.

- [ ] **Step 7: Commit the homepage if authorized**

```powershell
git add src/pages/Landing.tsx src/pages/Landing.test.tsx src/components/marketing
git commit -m "feat: build B2B sandbox homepage"
```

---

### Task 8: Replace Legal and Security Content with Localized Editorial Drafts

**Files:**
- Create: `src/content/legal/types.ts`
- Create: `src/content/legal/pt.ts`
- Create: `src/content/legal/es.ts`
- Create: `src/content/legal/en.ts`
- Create: `src/content/legal/index.ts`
- Modify: `src/pages/Legal.tsx`
- Create: `src/pages/Legal.test.tsx`
- Modify: `src/App.tsx`
- Delete: `src/constants/legalTerms.ts`
- Delete: `src/constants/securityGuidance.ts`
- Delete: legacy unused UI wrappers listed in the global Delete map

**Interfaces:**
- Consumes: `Locale`, `PublicSlug`, route helpers and B1 layout primitives.
- Produces: `LegalContent`, `LegalPage({ locale, type })`, localized routes for Terms, Privacy, Compliance and Security.

- [ ] **Step 1: Write failing legal-page tests**

Create `src/pages/Legal.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { LegalPage } from './Legal'

describe('LegalPage', () => {
  it('marks terms as an editorial draft pending qualified review', () => {
    render(<MemoryRouter><LegalPage locale="pt" type="terms" /></MemoryRouter>)
    expect(screen.getByText(/minuta editorial 0.1/i)).toBeInTheDocument()
    expect(screen.getByText(/revisão jurídica qualificada/i)).toBeInTheDocument()
  })

  it('states the sandbox limits on compliance', () => {
    render(<MemoryRouter><LegalPage locale="en" type="compliance" /></MemoryRouter>)
    expect(screen.getByText(/does not move real funds/i)).toBeInTheDocument()
  })

  it('does not retain retail purchase language', () => {
    const { container } = render(<MemoryRouter><LegalPage locale="es" type="privacy" /></MemoryRouter>)
    expect(container.textContent).not.toMatch(/comprar usdt|compra de usdt/i)
  })
})
```

- [ ] **Step 2: Run tests and verify the current legal pages fail**

Run:

```powershell
npm test -- src/pages/Legal.test.tsx
```

Expected: FAIL because current content is PT-only, B2C-oriented and future-tense.

- [ ] **Step 3: Define the legal content contract**

Create `src/content/legal/types.ts`:

```ts
export type LegalPageType = 'terms' | 'privacy' | 'compliance' | 'security'

export type LegalDocument = {
  title: string
  description: string
  version: string
  effectiveDate: string
  reviewNotice: string
  sections: Array<{ id: string; title: string; paragraphs: string[]; items?: string[] }>
}

export type LegalContent = Record<LegalPageType, LegalDocument>

export type LegalRow = readonly [id: string, title: string, paragraph: string]

export function toSections(rows: readonly LegalRow[]): LegalDocument['sections'] {
  return rows.map(([id, title, paragraph]) => ({ id, title, paragraphs: [paragraph] }))
}
```

- [ ] **Step 4: Create factual Portuguese drafts**

Use `version: 'Minuta editorial 0.1'`, `effectiveDate: '23 de agosto de 2026'`, and `reviewNotice: 'Conteúdo editorial sujeito a revisão jurídica qualificada antes da publicação.'` on every document.

Use these Portuguese document headers:

```ts
terms: { title: 'Termos do sandbox', description: 'Condições editoriais para avaliação técnica do ambiente de testes.' }
privacy: { title: 'Privacidade', description: 'Informações factuais sobre dados no site institucional e no futuro sandbox.' }
compliance: { title: 'Compliance', description: 'Limites atuais e critérios para futuras integrações operacionais.' }
security: { title: 'Segurança', description: 'Orientações para domínio, carteira e credenciais no ambiente de testes.' }
```

Required sections and exact factual scope:

```ts
terms: [
  ['escopo', 'Escopo do sandbox', 'O sandbox Peragus demonstra um fluxo de pagamento Pix simulado e liquidação em MockUSDT na Polygon Amoy. Ele não processa fundos reais nem oferece liquidação em USDT.'],
  ['token', 'MockUSDT e rede de testes', 'MockUSDT é um token de teste sem valor financeiro. Polygon Amoy é uma rede de testes e suas transações não representam liquidação financeira.'],
  ['carteira', 'Carteira informada pelo cliente', 'O participante informa uma carteira própria e é responsável por conferir o endereço e a rede antes de executar o teste.'],
  ['uso', 'Uso aceitável', 'O sandbox deve ser usado somente para avaliação técnica, sem pagamentos comerciais, representação de saldo ou promessa a terceiros.'],
  ['disponibilidade', 'Disponibilidade e alterações', 'A Peragus pode alterar ou interromper o sandbox durante o desenvolvimento e não apresenta SLA de produção.'],
]

privacy: [
  ['site', 'Dados do site institucional', 'O site institucional não solicita documentos pessoais nem dados financeiros. Dados técnicos essenciais de acesso podem ser registrados pelo provedor de hospedagem para segurança e operação.'],
  ['sandbox', 'Dados do sandbox', 'Os dados do cadastro empresarial, credenciais e operações de teste serão descritos de forma definitiva quando o sandbox self-service for implementado e submetido a revisão jurídica.'],
  ['wallet', 'Carteira e transações públicas', 'Endereços e transações na Polygon Amoy são públicos por natureza. Não envie chaves privadas ou frases-semente.'],
  ['contact', 'Solicitações', 'Solicitações sobre dados devem usar somente um canal verificado no domínio peragus.com.br.'],
]

compliance: [
  ['environment', 'Ambiente sem fundos reais', 'O sandbox atual não movimenta fundos reais e não executa liquidação em USDT.'],
  ['claims', 'Sem afirmações regulatórias', 'A Peragus não apresenta licença, certificação ou cobertura regulatória que não tenha sido comprovada e revisada.'],
  ['future', 'Integrações futuras', 'Uma futura integração com gateway ou BaaS dependerá da seleção do fornecedor, de controles operacionais e de revisão jurídica aplicável.'],
]

security: [
  ['domain', 'Domínio oficial', 'O domínio institucional definido para a Peragus é peragus.com.br. Confirme o endereço antes de inserir qualquer dado.'],
  ['secrets', 'Nunca compartilhe segredos', 'A Peragus não solicita chave privada, frase-semente ou senha completa da carteira.'],
  ['wallet', 'Confira carteira e rede', 'No sandbox, confira o endereço informado e confirme que a rede selecionada é Polygon Amoy.'],
  ['report', 'Comunicação de incidentes', 'Use somente um canal de segurança verificado no domínio peragus.com.br quando esse canal estiver publicado.'],
]
```

Convert each tuple to the `LegalDocument.sections` shape. Do not add legal promises beyond these sentences.

- [ ] **Step 5: Create exact Spanish and English drafts**

Use these Spanish headers and metadata:

```ts
const esMeta = {
  version: 'Borrador editorial 0.1',
  effectiveDate: '23 de agosto de 2026',
  reviewNotice: 'Contenido editorial sujeto a revisión jurídica cualificada antes de su publicación.',
}

const esHeaders = {
  terms: { title: 'Términos del sandbox', description: 'Condiciones editoriales para la evaluación técnica del entorno de pruebas.' },
  privacy: { title: 'Privacidad', description: 'Información factual sobre datos en el sitio institucional y en el futuro sandbox.' },
  compliance: { title: 'Cumplimiento', description: 'Límites actuales y criterios para futuras integraciones operativas.' },
  security: { title: 'Seguridad', description: 'Orientaciones sobre dominio, billetera y credenciales en el entorno de pruebas.' },
}

const esSections = {
  terms: [
    ['scope', 'Alcance del sandbox', 'El sandbox de Peragus demuestra un flujo de pago Pix simulado y liquidación en MockUSDT en Polygon Amoy. No procesa fondos reales ni ofrece liquidación en USDT.'],
    ['token', 'MockUSDT y red de pruebas', 'MockUSDT es un token de prueba sin valor financiero y Polygon Amoy es una red de pruebas. Sus transacciones no representan una liquidación financiera.'],
    ['wallet', 'Billetera indicada por el cliente', 'El participante indica una billetera propia y es responsable de comprobar la dirección y la red antes de ejecutar la prueba.'],
    ['use', 'Uso aceptable', 'El sandbox debe utilizarse solamente para evaluación técnica, sin pagos comerciales, representación de saldo ni promesas a terceros.'],
    ['availability', 'Disponibilidad y cambios', 'Peragus puede modificar o interrumpir el sandbox durante el desarrollo y no presenta un SLA de producción.'],
  ],
  privacy: [
    ['site', 'Datos del sitio institucional', 'El sitio institucional no solicita documentos personales ni datos financieros. El proveedor de alojamiento puede registrar datos técnicos esenciales de acceso para seguridad y operación.'],
    ['sandbox', 'Datos del sandbox', 'Los datos de registro empresarial, credenciales y operaciones de prueba se describirán definitivamente cuando el sandbox self-service sea implementado y sometido a revisión jurídica.'],
    ['wallet', 'Billetera y transacciones públicas', 'Las direcciones y transacciones en Polygon Amoy son públicas por naturaleza. No envíes claves privadas ni frases semilla.'],
    ['contact', 'Solicitudes', 'Las solicitudes sobre datos deben utilizar únicamente un canal verificado en el dominio peragus.com.br.'],
  ],
  compliance: [
    ['environment', 'Entorno sin fondos reales', 'El sandbox actual no mueve fondos reales ni liquida USDT.'],
    ['claims', 'Sin afirmaciones regulatorias', 'Peragus no presenta licencias, certificaciones ni cobertura regulatoria que no hayan sido comprobadas y revisadas.'],
    ['future', 'Integraciones futuras', 'Una futura integración con un gateway o BaaS dependerá de la selección del proveedor, de controles operativos y de la revisión jurídica aplicable.'],
  ],
  security: [
    ['domain', 'Dominio oficial', 'El dominio institucional definido para Peragus es peragus.com.br. Confirma la dirección antes de introducir cualquier dato.'],
    ['secrets', 'Nunca compartas secretos', 'Peragus no solicita claves privadas, frases semilla ni la contraseña completa de una billetera.'],
    ['wallet', 'Comprueba billetera y red', 'En el sandbox, comprueba la dirección indicada y confirma que la red seleccionada sea Polygon Amoy.'],
    ['report', 'Comunicación de incidentes', 'Utiliza únicamente un canal de seguridad verificado en peragus.com.br cuando dicho canal esté publicado.'],
  ],
}
```

Use these English headers, metadata and sections:

```ts
const enMeta = {
  version: 'Editorial draft 0.1',
  effectiveDate: 'August 23, 2026',
  reviewNotice: 'Editorial content subject to qualified legal review before publication.',
}

const enHeaders = {
  terms: { title: 'Sandbox terms', description: 'Editorial conditions for technical evaluation of the test environment.' },
  privacy: { title: 'Privacy', description: 'Factual information about data on the institutional website and future sandbox.' },
  compliance: { title: 'Compliance', description: 'Current limits and criteria for future operational integrations.' },
  security: { title: 'Security', description: 'Guidance for the official domain, wallets and credentials in the test environment.' },
}

const enSections = {
  terms: [
    ['scope', 'Sandbox scope', 'The Peragus sandbox demonstrates a simulated Pix payment and MockUSDT settlement flow on Polygon Amoy. It does not process real funds or provide USDT settlement.'],
    ['token', 'MockUSDT and test network', 'MockUSDT is a test token with no financial value. Polygon Amoy is a test network and its transactions do not represent financial settlement.'],
    ['wallet', 'Customer-provided wallet', 'The participant provides its own wallet and is responsible for checking the address and network before running a test.'],
    ['use', 'Acceptable use', 'The sandbox is only for technical evaluation, without commercial payments, balance representations or promises to third parties.'],
    ['availability', 'Availability and changes', 'Peragus may change or interrupt the sandbox during development and does not provide a production SLA.'],
  ],
  privacy: [
    ['site', 'Institutional website data', 'The institutional website does not request personal documents or financial data. The hosting provider may record essential technical access data for security and operation.'],
    ['sandbox', 'Sandbox data', 'Business registration data, credentials and test-operation data will be described definitively when the self-service sandbox is implemented and receives qualified legal review.'],
    ['wallet', 'Public wallet and transaction data', 'Addresses and transactions on Polygon Amoy are public by nature. Do not provide private keys or seed phrases.'],
    ['contact', 'Requests', 'Data requests must use only a verified channel on the peragus.com.br domain.'],
  ],
  compliance: [
    ['environment', 'No-real-funds environment', 'The current sandbox does not move real funds and does not settle USDT.'],
    ['claims', 'No unsupported regulatory claims', 'Peragus does not present licenses, certifications or regulatory coverage that have not been substantiated and reviewed.'],
    ['future', 'Future integrations', 'A future gateway or BaaS integration will depend on provider selection, operational controls and applicable legal review.'],
  ],
  security: [
    ['domain', 'Official domain', 'The institutional domain defined for Peragus is peragus.com.br. Check the address before entering any data.'],
    ['secrets', 'Never share secrets', 'Peragus does not request private keys, seed phrases or a complete wallet password.'],
    ['wallet', 'Check wallet and network', 'In the sandbox, check the provided address and confirm that the selected network is Polygon Amoy.'],
    ['report', 'Incident communication', 'Use only a verified security channel on peragus.com.br when that channel is published.'],
  ],
}
```

Map each tuple to `{ id, title, paragraphs: [paragraph] }` and combine it with the matching metadata/header. This mapping is mechanical and must not modify the supplied sentences.

Export `ptLegal`, `esLegal` and `enLegal` from their locale files with `satisfies LegalContent`, then create `src/content/legal/index.ts`:

```ts
import type { Locale } from '@/i18n/routing'
import { enLegal } from './en'
import { esLegal } from './es'
import { ptLegal } from './pt'
import type { LegalContent } from './types'

export const legalContent = {
  pt: ptLegal,
  es: esLegal,
  en: enLegal,
} satisfies Record<Locale, LegalContent>
```

- [ ] **Step 6: Implement the generic legal template**

`LegalPage` accepts `{ locale: Locale; type: LegalPageType }`, reads `legalContent[locale][type]`, renders one H1, version/date metadata, review notice, an accessible section index, and semantic `<section>` blocks. Do not use repetitive marketing cards or gradients.

Use this template structure:

```tsx
export function LegalPage({ locale, type }: { locale: Locale; type: LegalPageType }) {
  const document = legalContent[locale][type]
  return (
    <main id="main-content" tabIndex={-1} className="pb-24 pt-32">
      <Container>
        <p className="font-mono text-xs uppercase tracking-[.12em] text-sandbox">{document.version}</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-.04em] sm:text-6xl">{document.title}</h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-secondary">{document.description}</p>
        <p className="mt-4 text-sm text-tertiary">{document.effectiveDate}</p>
        <Notice tone="sandbox" className="mt-8">{document.reviewNotice}</Notice>
        <div className="mt-12 grid gap-10 lg:grid-cols-[15rem_1fr]">
          <nav aria-label={document.title} className="lg:sticky lg:top-24 lg:self-start">
            <ol className="grid gap-2">{document.sections.map((section, index) => <li key={section.id}><a className="flex min-h-11 items-center text-sm text-tertiary hover:text-primary" href={`#${section.id}`}>{index + 1}. {section.title}</a></li>)}</ol>
          </nav>
          <div className="grid gap-12">{document.sections.map((section) => <section id={section.id} key={section.id} className="scroll-mt-24 border-t border-line pt-6"><h2 className="text-2xl font-semibold">{section.title}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph} className="mt-4 text-base leading-8 text-secondary">{paragraph}</p>)}</section>)}</div>
        </div>
      </Container>
    </main>
  )
}
```

- [ ] **Step 7: Add localized legal routes**

Under each locale layout route, register `terms`, `privacy`, `compliance` and `security`. Remove `/security-info`; unknown old paths should use the normal 404 because no shipped external compatibility requirement is established.

Add these children after the locale index route:

```tsx
{(['terms', 'privacy', 'compliance', 'security'] as const).map((type) => (
  <Route key={type} path={type} element={<LegalPage locale={locale} type={type} />} />
))}
```

- [ ] **Step 8: Verify legal content and routes**

Run:

```powershell
npm test -- src/pages/Legal.test.tsx src/App.test.tsx
npm run build
npm run lint
```

Expected: all commands exit 0.

- [ ] **Step 9: Commit legal pages if authorized**

```powershell
git add src/content/legal src/pages/Legal.tsx src/pages/Legal.test.tsx src/App.tsx src/constants src/components/ui
git commit -m "feat: add localized sandbox legal pages"
```

---

### Task 9: Add Localized Metadata and Static Discovery Files

**Files:**
- Create: `src/components/seo/PageMetadata.tsx`
- Create: `src/components/seo/PageMetadata.test.tsx`
- Modify: `src/pages/Landing.tsx`
- Modify: `src/pages/Legal.tsx`
- Modify: `index.html`
- Modify: `public/favicon.svg`
- Modify: `public/manifest.webmanifest`
- Create: `public/robots.txt`
- Create: `public/sitemap.xml`
- Create: `public/og-peragus.svg`

**Interfaces:**
- Consumes: locale routing and localized `seo` content.
- Produces: `PageMetadata({ locale, title, description, canonicalPath, alternates })` with managed title, description, canonical, Open Graph, Twitter and `hreflang` tags.

- [ ] **Step 1: Write failing metadata tests**

Create `src/components/seo/PageMetadata.test.tsx`:

```tsx
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PageMetadata } from './PageMetadata'

describe('PageMetadata', () => {
  it('updates localized canonical and language metadata', () => {
    render(
      <PageMetadata
        locale="es"
        title="Peragus | Sandbox B2B"
        description="Descripción de prueba"
        canonicalPath="/es"
        alternates={{ pt: '/', es: '/es', en: '/en' }}
      />,
    )
    expect(document.documentElement.lang).toBe('es')
    expect(document.title).toBe('Peragus | Sandbox B2B')
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute('href', 'https://peragus.com.br/es')
    expect(document.querySelector('meta[property="og:locale"]')).toHaveAttribute('content', 'es_419')
    expect(document.querySelectorAll('link[rel="alternate"]')).toHaveLength(3)
  })
})
```

- [ ] **Step 2: Run tests and verify the metadata component is absent**

Run:

```powershell
npm test -- src/components/seo/PageMetadata.test.tsx
```

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement deterministic metadata lifecycle**

`PageMetadata` uses `useEffect` to upsert tags by stable selectors and sets `document.documentElement.lang` to `pt-BR`, `es` or `en`. Reuse the same owned nodes across route changes so metadata never duplicates. Implement:

```tsx
import { useEffect } from 'react'
import type { Locale } from '@/i18n/routing'

const ORIGIN = 'https://peragus.com.br'
const OG_LOCALE = { pt: 'pt_BR', es: 'es_419', en: 'en_US' } satisfies Record<Locale, string>

type PageMetadataProps = {
  locale: Locale
  title: string
  description: string
  canonicalPath: string
  alternates: Record<Locale, string>
}

function upsertMeta(key: 'name' | 'property', value: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${key}="${value}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(key, value)
    element.dataset.peragusMeta = 'true'
    document.head.appendChild(element)
  }
  element.content = content
}

function upsertLink(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector<HTMLLinkElement>(selector)
  if (!element) {
    element = document.createElement('link')
    element.dataset.peragusMeta = 'true'
    document.head.appendChild(element)
  }
  Object.entries(attributes).forEach(([key, value]) => element!.setAttribute(key, value))
}

export function PageMetadata({ locale, title, description, canonicalPath, alternates }: PageMetadataProps) {
  useEffect(() => {
    const canonical = new URL(canonicalPath, ORIGIN).toString()
    document.documentElement.lang = locale === 'pt' ? 'pt-BR' : locale
    document.title = title
    upsertMeta('name', 'description', description)
    upsertMeta('property', 'og:title', title)
    upsertMeta('property', 'og:description', description)
    upsertMeta('property', 'og:type', 'website')
    upsertMeta('property', 'og:url', canonical)
    upsertMeta('property', 'og:locale', OG_LOCALE[locale])
    upsertMeta('property', 'og:image', `${ORIGIN}/og-peragus.svg`)
    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', title)
    upsertMeta('name', 'twitter:description', description)
    upsertLink('link[rel="canonical"]', { rel: 'canonical', href: canonical })

    const hrefLang = { pt: 'pt-BR', es: 'es-419', en: 'en' } satisfies Record<Locale, string>
    for (const target of ['pt', 'es', 'en'] as const) {
      upsertLink(`link[rel="alternate"][hreflang="${hrefLang[target]}"]`, {
        rel: 'alternate',
        hreflang: hrefLang[target],
        href: new URL(alternates[target], ORIGIN).toString(),
      })
    }
  }, [alternates, canonicalPath, description, locale, title])

  return null
}
```

- [ ] **Step 4: Use metadata on homepage and legal pages**

Homepage passes:

```tsx
<PageMetadata
  locale={locale}
  title={content.seo.title}
  description={content.seo.description}
  canonicalPath={homePath(locale)}
  alternates={{ pt: homePath('pt'), es: homePath('es'), en: homePath('en') }}
/>
```

Legal pages pass:

```tsx
<PageMetadata
  locale={locale}
  title={`${document.title} | Peragus`}
  description={document.description}
  canonicalPath={pagePath(locale, type)}
  alternates={{ pt: pagePath('pt', type), es: pagePath('es', type), en: pagePath('en', type) }}
/>
```

- [ ] **Step 5: Correct static fallback metadata**

Set `index.html` defaults to:

```html
<meta name="theme-color" content="#06191D" />
<title>Peragus | Sandbox B2B para Pix e liquidação on-chain</title>
<meta name="description" content="Valide um fluxo de pagamento Pix simulado e liquidação em MockUSDT na Polygon Amoy." />
<link rel="canonical" href="https://peragus.com.br/" />
```

Update JSON-LD exactly as follows; do not use `FinancialService` schema:

```html
<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Peragus",
    "url": "https://peragus.com.br/",
    "description": "Ambiente B2B de testes para validar um fluxo Pix simulado e liquidação em MockUSDT na Polygon Amoy."
  }
</script>
```

Add this factual fallback inside `<body>` before `#root`:

```html
<noscript>
  <main style="max-width:48rem;margin:0 auto;padding:4rem 1.5rem;color:#F1F7F5;background:#06191D;font-family:system-ui,sans-serif">
    <h1>Peragus B2B sandbox</h1>
    <p>Este ambiente demonstra um fluxo Pix simulado e liquidação em MockUSDT na Polygon Amoy. Nenhum fundo real é movimentado.</p>
  </main>
</noscript>
```

- [ ] **Step 6: Add static crawler and social files**

`public/robots.txt`:

```text
User-agent: *
Allow: /
Sitemap: https://peragus.com.br/sitemap.xml
```

`public/sitemap.xml` lists the 15 approved public URLs and excludes sandbox routes:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://peragus.com.br/</loc></url>
  <url><loc>https://peragus.com.br/es</loc></url>
  <url><loc>https://peragus.com.br/en</loc></url>
  <url><loc>https://peragus.com.br/terms</loc></url>
  <url><loc>https://peragus.com.br/privacy</loc></url>
  <url><loc>https://peragus.com.br/compliance</loc></url>
  <url><loc>https://peragus.com.br/security</loc></url>
  <url><loc>https://peragus.com.br/es/terms</loc></url>
  <url><loc>https://peragus.com.br/es/privacy</loc></url>
  <url><loc>https://peragus.com.br/es/compliance</loc></url>
  <url><loc>https://peragus.com.br/es/security</loc></url>
  <url><loc>https://peragus.com.br/en/terms</loc></url>
  <url><loc>https://peragus.com.br/en/privacy</loc></url>
  <url><loc>https://peragus.com.br/en/compliance</loc></url>
  <url><loc>https://peragus.com.br/en/security</loc></url>
</urlset>
```

Update `public/favicon.svg` so the background is `#06191D`, the mark remains white, and the existing teal gradient is replaced by solid `#4DE0BD`. Do not change the mark geometry.

Create `public/og-peragus.svg` with no external asset dependency:

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#06191D"/>
  <svg x="64" y="188" width="220" height="168" viewBox="0 0 1000 760" fill="none">
    <path d="M694 374h201" stroke="#4DE0BD" stroke-width="48" stroke-linecap="round"/>
    <circle cx="898" cy="374" r="60" fill="#4DE0BD"/>
    <path d="M165 100h485c185 0 240 125 225 235-15 100-113 135-220 135H452" stroke="#F1F7F5" stroke-width="74" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M665 270H480c-105 0-198 52-233 142L138 668" stroke="#F1F7F5" stroke-width="72" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M336 705l129-200h225c85 0 140-23 185-83" stroke="#F1F7F5" stroke-width="68" stroke-linejoin="round"/>
    <circle cx="166" cy="100" r="60" fill="#F1F7F5"/>
    <circle cx="138" cy="670" r="60" fill="#F1F7F5"/>
  </svg>
  <text x="340" y="190" fill="#4DE0BD" font-family="monospace" font-size="24" letter-spacing="3">B2B SANDBOX / POLYGON AMOY</text>
  <text x="340" y="275" fill="#F1F7F5" font-family="Arial, sans-serif" font-size="58" font-weight="700">Pix in Brazil.</text>
  <text x="340" y="345" fill="#F1F7F5" font-family="Arial, sans-serif" font-size="58" font-weight="700">Settlement to your wallet.</text>
  <text x="340" y="430" fill="#A8BCB8" font-family="Arial, sans-serif" font-size="28">Peragus test environment</text>
</svg>
```

- [ ] **Step 7: Update the manifest**

Replace `public/manifest.webmanifest` with:

```json
{
  "name": "Peragus",
  "short_name": "Peragus",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#06191D",
  "theme_color": "#06191D",
  "icons": [
    {
      "src": "/favicon.svg",
      "sizes": "any",
      "type": "image/svg+xml"
    }
  ]
}
```

- [ ] **Step 8: Verify metadata and static assets**

Run:

```powershell
npm test -- src/components/seo/PageMetadata.test.tsx
npm run build
npm run lint
```

Expected: all commands exit 0 and `dist` contains `robots.txt`, `sitemap.xml`, `og-peragus.svg`, favicon and manifest.

- [ ] **Step 9: Commit metadata if authorized**

```powershell
git add index.html public src/components/seo src/pages/Landing.tsx src/pages/Legal.tsx
git commit -m "feat: add localized metadata and discovery files"
```

---

### Task 10: Add Browser, Accessibility and Final Quality Gates

**Files:**
- Create: `playwright.config.ts`
- Create: `e2e/home.spec.ts`
- Create: `e2e/accessibility.spec.ts`
- Modify: `package.json`
- Modify: `package-lock.json`
- Delete: remaining unused assets, UI wrappers and packages identified by import search

**Interfaces:**
- Consumes: completed public site.
- Produces: repeatable desktop/tablet/mobile, console, keyboard and axe verification; final dependency graph with no retail or Web3 code.

- [ ] **Step 1: Create Playwright configuration**

Create `playwright.config.ts`:

```ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
    { name: 'tablet', use: { viewport: { width: 820, height: 1180 } } },
    { name: 'desktop', use: { viewport: { width: 1440, height: 1000 } } },
  ],
})
```

- [ ] **Step 2: Write responsive and console browser tests**

Create `e2e/home.spec.ts`:

```ts
import { expect, test } from '@playwright/test'

test('homepage exposes the factual sandbox flow without horizontal overflow', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1, name: 'Pix no Brasil. Liquidação na sua carteira.' })).toBeVisible()
  await expect(page.getByText(/mockusdt não é usdt/i)).toBeVisible()
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
  expect(overflow).toBe(false)
  expect(errors).toEqual([])
})

test('localized navigation preserves language', async ({ page }) => {
  await page.goto('/es')
  await page.getByRole('link', { name: 'Seguridad' }).click()
  await expect(page).toHaveURL(/\/es\/security$/)
})
```

- [ ] **Step 3: Write accessibility and keyboard tests**

Create `e2e/accessibility.spec.ts`:

```ts
import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('homepage has no automatically detectable WCAG A/AA violations', async ({ page }) => {
  await page.goto('/')
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
  expect(results.violations).toEqual([])
})

test('skip link and mobile menu work from the keyboard', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Pular para o conteúdo' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('#main-content')).toBeFocused()
  await page.getByRole('button', { name: 'Abrir menu' }).focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).not.toBeVisible()
})
```

- [ ] **Step 4: Run browser tests and observe the first real failures**

Run:

```powershell
npx playwright install chromium
npm run test:e2e
```

Expected before polish: tests may expose focus-target, overflow, contrast or menu-name defects. Record each exact failure; do not suppress axe rules.

- [ ] **Step 5: Fix only observed responsive and accessibility defects**

Use the smallest source changes that address each reported failure. Required intended behavior:

- `#main-content` has `tabIndex={-1}` so skip-link focus is observable.
- Header switches to mobile before links compress.
- Event rows and infrastructure nodes wrap machine values.
- All mobile controls remain at least 44 px.
- Focus is visible against Midnight 950 and Surface 800.
- Decorative arrows and marks are hidden from assistive technology.

- [ ] **Step 6: Remove remaining dead code and dependencies**

Search imports and delete files with no retained consumer. Verify the final dependency list contains no AppKit, Supabase, Query, Wagmi, Viem, Ethers, Zustand or unused Radix packages. Delete `src/assets/hero.png`, `src/assets/react.svg`, `public/icons.svg` and any remaining obsolete retail asset.

Run the deterministic package cleanup after the source wrappers are gone:

```powershell
npm uninstall @radix-ui/react-accordion @radix-ui/react-checkbox @radix-ui/react-dropdown-menu @radix-ui/react-label @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-switch @radix-ui/react-tabs autoprefixer postcss
npm ls --depth=0
```

Expected: both commands exit 0; the package list does not contain the prohibited runtime packages. Retain `@radix-ui/react-dialog` and `@radix-ui/react-slot`.

- [ ] **Step 7: Run the complete verification suite**

Run in this order:

```powershell
npm test
npm run lint
npm run build
npm run test:e2e
```

Expected: every command exits 0, Vitest reports zero failures, ESLint reports zero errors, Vite produces `dist`, and all three Playwright projects pass.

- [ ] **Step 8: Perform the required manual review**

Inspect `/`, `/es`, `/en`, all legal pages and the 404 at 375x812, 820x1180 and 1440x1000. Reject the implementation if any of these are present:

- generic four-card benefit grid;
- excessive glow, gradients, blur or pill badges;
- unclear competition between CTAs;
- retail purchase language;
- unsupported production or regulatory claim;
- MockUSDT described as USDT;
- unreadable machine values;
- header compression;
- inconsistent section spacing;
- non-functional keyboard focus;
- console errors;
- broken localized links.

- [ ] **Step 9: Report release blockers explicitly**

The implementation report must state that publication remains blocked until the separate sandbox initiative provides working `/login`, `/register`, `/docs`, account creation, API key generation, simulated Pix confirmation and MockUSDT settlement. Do not describe the website as launch-ready while those gates remain open.

- [ ] **Step 10: Commit final quality work if authorized**

```powershell
git add package.json package-lock.json playwright.config.ts e2e src public
git commit -m "test: add website quality gates"
```

---

## Final Verification Checklist

- [ ] The current B2C routes and components no longer exist.
- [ ] Public routes do not import Web3, Supabase or authentication code.
- [ ] Portuguese, Spanish and English content pass the same typed contract.
- [ ] The hero and transparency strip identify sandbox, MockUSDT and Polygon Amoy before conversion.
- [ ] The primary CTA is consistent.
- [ ] The homepage implements all eight approved sections in order.
- [ ] Terms, Privacy, Compliance and Security are explicit editorial drafts pending qualified review.
- [ ] `peragus.com.br` is consistent across metadata and institutional content.
- [ ] Unknown routes render an accessible 404.
- [ ] Build, lint, unit, browser and axe checks pass.
- [ ] No fake metric, client, partner, certification, SLA or production capability appears.
- [ ] Publication blockers from the separate sandbox initiative are reported, not hidden.
