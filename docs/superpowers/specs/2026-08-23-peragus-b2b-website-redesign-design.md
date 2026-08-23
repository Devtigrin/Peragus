# Peragus B2B Website Redesign

**Date:** 2026-08-23  
**Status:** Approved design, pending written-spec review  
**Initiative:** B2B institutional website and brand system  
**Related future initiative:** Self-service sandbox API and MockUSDT settlement

## 1. Summary

Peragus will replace its current retail-oriented USDT purchase experience with a B2B website for merchants and acquirers in Latin America that want to test a future Pix-to-stablecoin settlement flow.

The website will present an explicit sandbox. Its demonstrable flow is:

```text
Simulated Pix payment in BRL
  -> simulated payment confirmation
  -> Peragus orchestration
  -> MockUSDT transfer
  -> customer-controlled wallet on Polygon Amoy
```

The website must never imply that real Pix processing, real USDT settlement, production availability, regulated activity, or a contracted gateway/BaaS already exists.

The selected visual direction is **B1, continuous midnight**: a dark, technical and premium interface in which operational states, diagrams and transaction data provide visual depth. Decorative futuristic effects, generic benefit-card grids and unsupported trust claims are excluded.

## 2. Product Purpose

### Primary audience

Finance and operations decision-makers at:

- international merchants that sell to Brazilian customers;
- acquirers and payment platforms serving Latin American businesses.

Developers are an important secondary audience. Business and operational clarity must precede API detail in the page hierarchy.

### Primary value proposition

Peragus allows a business to validate how a Brazilian Pix payment could be connected to settlement in a wallet controlled by that business.

During the MVP, this is a test-only proposition. Pix is simulated, settlement uses MockUSDT without financial value, and transactions occur on Polygon Amoy.

### Primary conversion

The public CTA is `Criar conta sandbox`.

The product-level success criterion is not registration alone. Success is a customer completing its first test settlement:

```text
account created
  -> API key generated
  -> simulated Pix payment created
  -> confirmation simulated
  -> MockUSDT received on Polygon Amoy
```

The self-service flow belongs to a separate technical initiative. The redesigned website and the sandbox must be released together so the CTA never leads to a disabled, placeholder or misleading experience.

## 3. Confirmed Constraints

- Preserve only the Peragus name and current logo as fixed brand assets.
- Keep React, TypeScript, Vite and Tailwind CSS 4.
- Use `peragus.com.br` as the official domain in metadata, contact information and security guidance.
- Publish in Portuguese, Spanish and English.
- Focus initial commercial positioning on Latin America.
- Use a customer-provided wallet; Peragus does not present itself as custodian.
- Present `MockUSDT` by its real name and describe it as a test token without financial value.
- Present Polygon Amoy as a test network.
- Do not name a Pix gateway or BaaS because no provider has been selected.
- Do not invent clients, metrics, partners, certifications, licenses, SLAs, rates, corridors or production coverage.
- Remove the existing B2C product completely rather than preserving it as a secondary offer.
- Adapt current legal content editorially for the B2B sandbox without presenting the work as legal advice.
- Create API documentation as a private draft specification during design. Publish it only after implemented endpoints pass verification.
- There is no fixed delivery deadline; quality and factual accuracy take precedence.

## 4. Scope

### Included in the website initiative

- New B2B homepage.
- B1 visual system and reusable marketing primitives.
- Portuguese, Spanish and English route structure.
- Editorial adaptation of Terms, Privacy, Compliance and Security pages.
- Per-route metadata, canonical URLs and social metadata.
- Removal of the retail USDT purchase experience and its unused supporting code.
- Responsive behavior for mobile, tablet and desktop.
- Accessibility and reduced-motion behavior.
- Cleanup required for the remaining frontend to pass build and lint.
- Destinations and interface contracts for future `/login`, `/register` and `/docs` routes.

### Excluded from the website initiative

- Account creation and authentication behavior.
- API key generation, display, rotation or revocation.
- Payment API endpoints.
- Pix simulation behavior.
- Gateway or BaaS integration.
- Payment provider webhooks.
- MockUSDT settlement execution.
- Customer dashboard.
- Public API reference.
- Production stablecoin settlement.

These items require a separate sandbox specification and implementation plan.

## 5. Visual Direction

### Concept

B1 uses a continuous midnight environment to communicate financial infrastructure rather than a traditional bank or a retail crypto product. Technical artifacts are the primary visual material:

- operation states;
- event names;
- API actions;
- network identifiers;
- transaction references;
- settlement diagrams.

The visual system must avoid:

- glassmorphism;
- decorative blobs;
- multiple competing gradients;
- neon outlines across every component;
- continuous animations;
- large grids of equivalent cards;
- generic illustrations of globes, coins, rockets or handshakes;
- cryptocurrency trading imagery.

### Color tokens

| Role | Value | Intended use |
|---|---:|---|
| Midnight 950 | `#06191D` | Global background |
| Surface 800 | `#0C272C` | Primary panels |
| Surface 700 | `#12353B` | Elevated and hover surfaces |
| Border | `#25474C` | Dividers and component boundaries |
| Primary text | `#F1F7F5` | Headings and high-emphasis text |
| Secondary text | `#A8BCB8` | Body content |
| Tertiary text | `#7F9B97` | Metadata and supporting labels |
| Mint signal | `#4DE0BD` | Primary CTA, success and active flow |
| Data blue | `#6680E8` | Informational data state only |
| Sandbox yellow | `#E6C76D` | Test-environment warnings |
| Error | `#FF8A8A` | Errors and destructive states |

Verified contrast ratios on Midnight 950:

- Primary text: `16.63:1`.
- Secondary text: `9.06:1`.
- Tertiary text: `6.04:1`.
- Mint signal: `10.92:1`.
- Dark text on Mint signal: `10.20:1`.
- Error: `7.95:1`.

### Typography

- Manrope is the primary interface and editorial family.
- IBM Plex Mono is limited to endpoints, event names, IDs, hashes, network names and machine-readable values.
- Heading distinction comes from scale, spacing and composition, not repeated extra-bold weight.
- Headings use compact tracking only at display sizes.
- Main body copy is never smaller than 14 px.
- Type scales use `clamp()` to prevent oversized mobile headings.

### Components

- Controls use 6-8 px corner radii.
- Technical panels use 10-12 px corner radii.
- Pill shapes are reserved for compact statuses and language controls.
- Shadows are reserved for the elevated event panel in the hero.
- Sections use borders and surface contrast instead of large shadows.
- Non-interactive surfaces do not receive hover styling.
- Lucide icons are used only for actions and states.
- Infrastructure diagrams replace decorative illustrations.

### Motion

- Control transitions: approximately 120 ms.
- Panel state transitions: approximately 180 ms.
- Section entrances: no more than 220 ms.
- Section entrance is limited to opacity and up to 8 px of translation.
- No parallax, continuous glow, shimmer, pulsing background or looping value flow.
- `prefers-reduced-motion` removes displacement and non-essential animation.

## 6. Homepage Information Architecture

### Header

Contains:

- Peragus logo;
- `Produto`;
- `Como funciona`;
- `Infraestrutura`;
- `Seguranca`;
- Portuguese, Spanish and English switcher;
- primary sandbox CTA;
- accessible mobile menu.

The desktop header appears only at a width that can contain all elements without compression. The mobile control has a minimum 44 px target, Escape support and focus management.

### 1. Hero

Label:

> Sandbox B2B - Polygon Amoy

Headline:

> Pix no Brasil. Liquidacao na sua carteira.

Supporting copy:

> Valide, em um ambiente de testes, o fluxo entre uma cobranca Pix simulada e o envio de MockUSDT para sua carteira na Polygon Amoy.

Actions:

- `Criar conta sandbox`.
- `Entender o fluxo`.

The visual companion is an operation event panel showing fixed, explicitly demonstrative states:

```text
payment.created
pix.confirmed / simulated
settlement.sent / test transaction reference
```

It does not fetch live blockchain, payment, quote or volume data.

### 2. Transparency Strip

Four factual items appear directly after the hero:

- `Ambiente sandbox`: no real funds.
- `MockUSDT`: test token without financial value.
- `Carteira propria`: Peragus does not hold the customer's balance.
- `Polygon Amoy`: testnet transactions are verifiable.

### 3. How It Works

Heading:

> Tres estados. Uma trilha verificavel.

Steps:

1. Create a test BRL payment and receive simulated Pix instructions.
2. Simulate confirmation and observe the operation state change.
3. Verify MockUSDT delivery to the provided wallet on Polygon Amoy.

### 4. Operational Control

Heading:

> Menos abstracao. Mais visibilidade sobre cada etapa.

Capabilities:

- explicit operation states;
- a reference joining payment and on-chain transaction;
- customer-controlled settlement wallet;
- a flow prepared for later gateway/BaaS integration;
- test history that can be inspected.

This section uses an asymmetric list, not four equivalent marketing cards.

### 5. Applications

Two primary use cases:

- International merchants testing a Pix experience for Brazilian buyers.
- Acquirers and platforms validating how the flow could connect to existing payment operations.

### 6. Infrastructure

Heading:

> Do evento de pagamento a transacao na rede.

Diagram:

```text
B2B customer
  -> simulated Pix payment
  -> payment confirmation event
  -> Peragus orchestration
  -> MockUSDT transfer
  -> wallet on Polygon Amoy
```

The diagram is the principal proprietary visual device of the homepage.

### 7. Security and Sandbox Limits

This is a visually prominent disclosure, not footer fine print:

> MockUSDT nao e USDT, nao possui valor financeiro e opera somente na Polygon Amoy. O Pix permanece simulado ate a futura integracao com um gateway ou BaaS.

No security certification or regulatory statement appears without evidence.

### 8. Final CTA

Heading:

> Execute sua primeira liquidacao de teste.

Supporting copy:

> Crie sua conta, gere uma API key e acompanhe o fluxo ate a transacao na Polygon Amoy.

Actions:

- `Criar conta sandbox`.
- `Explorar documentacao`.

These actions are enabled only when the corresponding sandbox routes are functional.

### Footer

Includes:

- concise sandbox description;
- product links;
- documentation and security links;
- Terms, Privacy and Compliance;
- `peragus.com.br` identity;
- contact channel when a verified address is available.

It does not invent corporate registration details. Company details identified as required by qualified legal review block publication when unavailable rather than being filled with placeholders.

## 7. Editorial System

### Voice

The Peragus voice is:

- direct;
- operational;
- technically precise;
- transparent about maturity;
- calm rather than promotional.

### Preferred vocabulary

- operation;
- settlement;
- test environment;
- provided wallet;
- payment confirmation;
- verifiable transaction;
- integration;
- MockUSDT;
- Polygon Amoy.

### Prohibited or restricted vocabulary

- digital dollars;
- instant;
- completely secure;
- competitive rates;
- robust infrastructure without evidence;
- global infrastructure;
- borderless;
- guaranteed availability;
- receive Pix without operating in Brazil before a provider exists;
- price or speed comparisons without evidence.

### Localization

- Portuguese is available at `/`.
- Spanish is available at `/es`.
- English is available at `/en`.
- Legal and sandbox disclosures preserve the same meaning in all languages.
- Copy is adapted by a fluent editor rather than translated literally.
- Endpoints, event names and protocol identifiers remain in English.
- The selected language persists through navigation, account creation and documentation.

## 8. Routes and SEO

### Public route structure

```text
/
/es
/en

/terms
/es/terms
/en/terms

/privacy
/es/privacy
/en/privacy

/compliance
/es/compliance
/en/compliance

/security
/es/security
/en/security
```

Sandbox integration contracts reserve:

```text
/login
/register
/docs
```

Unknown routes render a real 404 page. They do not redirect to login or a dashboard.

### Metadata requirements

- Portuguese title and description for `/`.
- Localized metadata for Spanish and English.
- Canonicals under `https://peragus.com.br`.
- `hreflang` for all locale equivalents.
- Route-specific Open Graph and Twitter metadata.
- `og:locale`.
- Social preview image.
- `robots.txt`.
- Sitemap.
- Route-specific metadata for legal pages.
- Private routes excluded from institutional canonical behavior.

## 9. Frontend Architecture

### Layout and sections

```text
MarketingLayout
|- SkipLink
|- Header
|  |- PeragusLogo
|  |- PrimaryNavigation
|  |- LocaleSwitcher
|  |- MobileNavigation
|  `- SandboxCTA
|- Main
|  |- Hero
|  |  `- SettlementEventPanel
|  |- TransparencyStrip
|  |- SettlementSteps
|  |- OperationalBenefits
|  |- UseCases
|  |- InfrastructureDiagram
|  |- SandboxDisclosure
|  `- FinalCTA
`- Footer
```

Reusable primitives are limited to components with actual reuse:

- `Button`;
- `LinkButton` or `Button asChild`;
- `Input`;
- `Label`;
- `StatusBadge`;
- `Notice`;
- `Surface`;
- `Container`;
- `SectionHeading`.

Content-specific homepage sections remain explicit rather than being forced into a universal card abstraction.

### Content model

```text
src/content/
|- pt/
|  |- home.ts
|  `- legal.ts
|- es/
|  |- home.ts
|  `- legal.ts
`- en/
   |- home.ts
   `- legal.ts
```

Each locale implements the same TypeScript contract. Missing keys fail typechecking instead of silently falling back inside a page.

### Homepage data flow

```text
URL locale
  -> typed locale content
  -> semantic page sections
```

The homepage has no dependency on Supabase, Reown, Wagmi, a payment gateway or Polygon RPC.

## 10. Retail Product Removal

Remove the existing retail experience and supporting code when it has no B2B use:

- retail `Comprar USDT` landing content;
- BRL/USDT quotation widget;
- personal-wallet promotional grid;
- retail dashboard and simulated volume metrics;
- retail operation wizard;
- B2C history and transaction detail pages;
- personal wallet management;
- individual verification/KYC UI;
- current fake Pix component;
- mock activity, uptime and notification data;
- retail FAQ and digital-dollar copy;
- orphaned assets and components;
- duplicate operation and contract access implementations made obsolete by removal.

The removal occurs before fixing TypeScript and lint errors in those areas. Only errors remaining in retained code are repaired.

No unrelated refactoring is included.

## 11. Legal Content

Terms, Privacy, Compliance and Security are adapted to the B2B sandbox.

The editorial adaptation must:

- state the experimental environment;
- distinguish MockUSDT from USDT;
- state that no real funds move in the sandbox;
- describe only data actually collected;
- remove B2C purchase language;
- use `peragus.com.br` consistently;
- avoid unsupported regulation, licensing and certification claims;
- avoid future-tense privacy promises presented as current controls;
- include a visible effective date and version;
- identify editorial content as pending professional legal review when applicable.

Legal review by qualified counsel is outside this technical design. Publication is blocked if that review identifies required company identity or legal content that remains unavailable.

## 12. Accessibility and Responsive Behavior

### Semantics and keyboard

- Use `header`, `nav`, `main` and `footer` landmarks.
- Provide a skip link.
- Maintain one page-level `h1` and logical heading order.
- Use visible focus on every interactive control.
- Avoid nested interactive elements.
- Use `aria-current` for active navigation.
- Associate labels with inputs.
- Announce future dynamic status with `aria-live`.
- Support Escape and focus restoration in mobile navigation.
- Never communicate a state through color alone.

### Responsive rules

- The hero becomes one column on mobile.
- The event panel appears after hero copy on small screens.
- Horizontal settlement flows become vertical.
- Transparency items move from four to two to one column based on available width.
- The desktop header appears only when all controls fit.
- Touch targets are at least 44 px.
- Hashes, addresses and endpoint strings wrap or truncate with accessible full values.
- Footer columns collapse without changing reading order.
- Content text does not fall below 14 px.

### Reduced motion

`prefers-reduced-motion` removes translated section entrances and leaves only immediate or short opacity state changes required for understanding.

## 13. Error Handling

- Unsupported locale paths resolve to the Portuguese canonical route.
- Missing translation keys fail TypeScript validation.
- Missing sandbox destinations block release rather than rendering broken CTAs.
- Unknown paths render an accessible 404 page.
- If JavaScript is unavailable, core institutional content remains readable in the initial HTML shell as far as the Vite SPA architecture permits; the implementation should minimize script-dependent marketing content.
- Future registration failures preserve entered data, show a specific error and provide a verified support path.

## 14. Performance

- Self-host production font files where licensing permits.
- Load only required Manrope and IBM Plex Mono weights.
- Use no video background, WebGL scene or canvas animation.
- Keep the hero event panel as HTML and CSS.
- Do not load Web3 libraries on public marketing routes.
- Lazy-load non-critical social preview or illustration assets.
- Remove unused Radix packages and assets only when confirmed unused after B2C removal.
- Avoid homepage network requests beyond static assets.

## 15. Verification

Required before completion:

- `npm run build` passes.
- `npm run lint` passes.
- Component tests cover navigation, locale selection, CTA destinations and mobile menu behavior.
- Accessibility automation covers the homepage and legal templates.
- Keyboard-only navigation is manually verified.
- Playwright covers representative mobile, tablet and desktop widths.
- The browser console is free of errors and unintended debug logging.
- All internal and legal links resolve.
- Portuguese, Spanish and English content implement the complete contract.
- Metadata, canonical URLs and language alternates are validated.
- No unsupported metric, partner, certification or regulatory statement remains.
- No B2C purchase path remains publicly reachable.
- No content describes MockUSDT as real USDT.
- Reduced motion behavior is verified.
- A final review checks for repetitive cards, excessive decoration, unclear CTAs, weak contrast and template-like copy.

## 16. Release Gates

The website is not published until:

1. The self-service sandbox supports account creation.
2. A customer can obtain an API key.
3. A simulated Pix confirmation can be triggered safely.
4. MockUSDT can be transferred to a customer-provided wallet on Polygon Amoy.
5. The customer can inspect operation and transaction state.
6. `/login`, `/register` and `/docs` are functional.
7. Public API documentation matches tested behavior.
8. Legal and company identity information identified as required by qualified review is available.
9. Build, lint, accessibility and browser verification pass.

## 17. Acceptance Criteria

The redesign is accepted when:

- a finance or operations reader can identify the audience, tested flow and environment without scrolling past the hero and transparency strip;
- the site cannot reasonably be mistaken for a retail crypto purchase product;
- the sandbox limitation is visible before any signup CTA is completed;
- all visual decisions follow the B1 system;
- operational diagrams replace decorative fintech imagery;
- the page provides one clear primary action;
- all three languages preserve the same factual scope;
- the public frontend contains no fake metrics or operational status;
- mobile and keyboard users can complete navigation and reach all content;
- the remaining codebase builds and lints cleanly after B2C removal.

## 18. Follow-Up Initiative

After this specification is approved, the API sandbox requires its own brainstorming and design specification covering:

- authentication and business accounts;
- API key lifecycle;
- payment and settlement data models;
- API endpoints;
- Pix simulation;
- webhook security and idempotency;
- MockUSDT transfer authority;
- Polygon Amoy transaction handling;
- wallet validation;
- operation state machine;
- retries and reconciliation;
- audit logs;
- rate limits;
- dashboard behavior;
- public API documentation;
- gateway/BaaS adapter boundaries for later production integration.

The website implementation plan must not silently absorb these responsibilities.
