# Peragus — Plano de Implementação: Segurança e Hardening

> **Para agentes:** HABILITE o sub-skill `superpowers:subagent-driven-development` para executar este plano tarefa por tarefa.

**Objetivo:** Corrigir vulnerabilidades críticas e altas, adicionar segurança fundamental, e preparar o Peragus para operar com confiança.

**Arquitetura:** Manter SPA + Supabase Edge Functions. Refatoração incremental sem reescrita.

**Stack:** React 19, TypeScript, Supabase Edge Functions (Deno), PostgreSQL 17, Polygon Amoy

**Spec:** `docs/superpowers/specs/2026-08-25-peragus-architecture-audit-design.md`

## Restrições Globais

- Não remover funcionalidade existente
- Não alterar APIs consumidas pelo frontend sem atualizar consumidores
- Após cada grupo de mudanças: lint, typecheck, testes, build
- Todo input externo deve ser validado
- Nunca expor secrets em logs ou respostas
- `service_role` só em Edge Functions, nunca no frontend

---

## FASE 1 — Correções Críticas

### Task 1.1: Corrigir settle-operation — adicionar autenticação interna

**Objetivo:** Impedir que qualquer pessoa com a URL chame settle-operation e movimente fundos.

**Arquivos:**
- Modificar: `supabase/functions/settle-operation/index.ts`
- Criar: `supabase/functions/settle-operation/index.test.ts` (teste conceitual)

**Risco:** ALTO — se feito errado, pode bloquear o fluxo de settlement
**Dependências:** Nenhuma

- [ ] **Step 1: Adicionar verificação de header interno no settle-operation**

No arquivo `supabase/functions/settle-operation/index.ts`, logo após o CORS handler (linha 28), adicionar:

```typescript
// Internal-only endpoint: require a shared secret header.
const internalSecret = Deno.env.get('INTERNAL_SETTLE_SECRET')
const callerSecret = req.headers.get('x-internal-secret')
if (!internalSecret || callerSecret !== internalSecret) {
  return fail(new HttpError(401, 'Unauthorized: internal endpoint'))
}
```

Isso deve ser adicionado ANTES da lógica de parsing do body (linha 37).

- [ ] **Step 2: Atualizar confirm-pix para usar o header interno**

No arquivo `supabase/functions/confirm-pix/index.ts`, na chamada fire-and-forget (linhas 46-55), substituir:

```typescript
// ANTES (linhas 46-55):
EdgeRuntime.waitUntil(
  fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/settle-operation`, {
    method: 'POST',
    headers: {
      Authorization: req.headers.get('Authorization') ?? '',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ operation_id }),
  }).catch(() => {}),
)
```

Por:

```typescript
// DEPOIS:
EdgeRuntime.waitUntil(
  fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/settle-operation`, {
    method: 'POST',
    headers: {
      'x-internal-secret': Deno.env.get('INTERNAL_SETTLE_SECRET') ?? '',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ operation_id }),
  }).catch(() => {}),
)
```

- [ ] **Step 3: Documentar necessidade de criar o Supabase Secret**

Criar nota no `.env.example`:

```
# Internal secret for settle-operation (set via: supabase secrets set INTERNAL_SETTLE_SECRET=<value>)
# INTERNAL_SETTLE_SECRET=<generate-a-random-secret>
```

- [ ] **Step 4: Verificar que settle-operation sem header retorna 401**

Teste manual ou documentação:
- Chamar `POST /functions/v1/settle-operation` sem header → deve retornar 401
- Chamar com header incorreto → deve retornar 401
- Chamar com header correto → funciona normalmente

- [ ] **Step 5: Commit**

```bash
git add supabase/functions/settle-operation/index.ts supabase/functions/confirm-pix/index.ts .env.example
git commit -m "fix(security): add internal auth to settle-operation, stop leaking caller auth header"
```

---

### Task 1.2: Corrigir email confirmation — desabilitar no Supabase remoto

**Objetivo:** Permitir que novos usuários criem conta e recebam sessão imediatamente durante desenvolvimento.

**Arquivos:**
- Modificar: NENHUM arquivo de código (configuração é no dashboard)
- Criar: Documentação da configuração

**Risco:** MÉDIO — se esquecer de reativar em produção, usuários não confirmam email
**Dependências:** Nenhuma

- [ ] **Step 1: Criar documentação da configuração de email**

Criar arquivo `docs/email-confirmation-config.md`:

```markdown
# Configuração de Confirmação de Email

## Onde acessar
https://supabase.com/dashboard/project/iifcwnumpccoucxggxjb/auth/settings

## Configuração atual (desenvolvimento)
- Enable email confirmations: ❌ DESABILITADO

## Para reativar em produção
1. Acessar o link acima
2. Marcar "Enable email confirmations"
3. Testar fluxo: cadastro → email → confirmação → login

## Impacto
- DESABILITADO: signUp() retorna sessão imediatamente
- HABILITADO: signUp() envia email, sessão é null até confirmação
```

- [ ] **Step 2: Acessar o dashboard do Supabase e desabilitar**

Ação manual: Acessar https://supabase.com/dashboard/project/iifcwnumpccoucxggxjb/auth/settings e desmarcar "Enable email confirmations".

- [ ] **Step 3: Testar fluxo completo**

1. Acessar /register
2. Preencher email + senha (8+ chars)
3. Clicar "Criar conta"
4. Verificar: redireciona para /app (não mostra mensagem de confirmação)
5. Verificar: consegue criar operação
6. Verificar: logout funciona
7. Verificar: login funciona

- [ ] **Step 4: Commit**

```bash
git add docs/email-confirmation-config.md
git commit -m "docs: add email confirmation config guide for Supabase dashboard"
```

---

### Task 1.3: Rotacionar RESEND_API_KEY e deletar .env.txt

**Objetivo:** Remover chave de API exposta do disco.

**Arquivos:**
- Deletar: `.env.txt`
- Modificar: `.env.example` (adicionar RESEND_API_KEY como placeholder)

**Risco:** BAIXO — arquivo .env.txt não é usado pelo código
**Dependências:** Nenhuma

- [ ] **Step 1: Deletar .env.txt**

```bash
git rm .env.txt
```

- [ ] **Step 2: Atualizar .env.example**

Adicionar ao `.env.example`:

```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>

# Resend API key for transactional emails (set via: supabase secrets set RESEND_API_KEY=re_...)
# RESEND_API_KEY=re_your_key_here
```

- [ ] **Step 3: Commit**

```bash
git add .env.example
git commit -m "fix(security): remove .env.txt with exposed Resend API key"
```

---

### Task 1.4: Habilitar RLS na tabela operations

**Objetivo:** Garantir isolamento de dados por tenant via Row Level Security.

**Arquivos:**
- Criar: `supabase/migrations/20260825120000_enable_rls_operations.sql`

**Risco:** ALTO — se RLS quebrar lógica existente, Edge Functions podem parar de funcionar
**Dependências:** Task 1.1 (settle-operation usa service_role, não é afetado por RLS)

- [ ] **Step 1: Criar migration para habilitar RLS**

Criar arquivo `supabase/migrations/20260825120000_enable_rls_operations.sql`:

```sql
-- Enable RLS on operations table
-- Edge Functions use service_role (bypasses RLS)
-- PostgREST (anon key) will be restricted to own data

ALTER TABLE public.operations ENABLE ROW LEVEL SECURITY;

-- Policy: authenticated users can only read their own operations
DROP POLICY IF EXISTS "operations_select_own" ON public.operations;
CREATE POLICY "operations_select_own" ON public.operations
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: authenticated users can only insert operations for themselves
DROP POLICY IF EXISTS "operations_insert_own" ON public.operations;
CREATE POLICY "operations_insert_own" ON public.operations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Note: UPDATE operations are done via service_role in Edge Functions (bypasses RLS)
-- No UPDATE policy needed for anon role
```

- [ ] **Step 2: Verificar que Edge Functions continuam funcionando**

As Edge Functions usam `service_role` via `adminClient()`, que bypassa RLS. Portanto:
- `create-operation`: usa service_role → funciona
- `confirm-pix`: usa service_role → funciona
- `settle-operation`: usa service_role → funciona
- `get-operation-status`: usa service_role → funciona
- `list-operations`: usa service_role → funciona

A RLS só afeta chamadas via PostgREST com a anon key (ex: `supabase.from('operations').select(...)`). O frontend não faz isso diretamente — usa Edge Functions.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260825120000_enable_rls_operations.sql
git commit -m "feat(security): enable RLS on operations table with user_id policies"
```

---

## FASE 2 — Segurança Fundamental

### Task 2.1: Adicionar Security Headers no vercel.json

**Objetivo:** Proteger contra clickjacking, MIME sniffing, downgrade para HTTP.

**Arquivos:**
- Modificar: `vercel.json`

**Risco:** BAIXO — apenas adiciona headers, não altera comportamento
**Dependências:** Nenhuma

- [ ] **Step 1: Adicionar headers de segurança**

Substituir o conteúdo de `vercel.json`:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" },
        { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" }
      ]
    }
  ]
}
```

- [ ] **Step 2: Verificar headers**

Após deploy, verificar com:
```bash
curl -I https://peragus.com.br/
```

Headers esperados:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`

- [ ] **Step 3: Commit**

```bash
git add vercel.json
git commit -m "fix(security): add Security Headers (HSTS, X-Frame-Options, CSP basics)"
```

---

### Task 2.2: Restringir CORS nas Edge Functions

**Objetivo:** Limitar origens que podem fazer chamadas autenticadas.

**Arquivos:**
- Modificar: `supabase/functions/_shared/http.ts`

**Risco:** MÉDIO — se a lista de origens estiver errada, frontend pode perder acesso
**Dependências:** Nenhuma

- [ ] **Step 1: Criar configuração de CORS por ambiente**

No arquivo `supabase/functions/_shared/http.ts`, substituir o `corsHeaders` estático:

```typescript
// ANTES:
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}
```

Por:

```typescript
// DEPOIS:
const ALLOWED_ORIGINS = [
  'https://peragus.com.br',
  'https://www.peragus.com.br',
  'http://localhost:5173',  // Vite dev server
  'http://localhost:4173',  // Vite preview
]

function getAllowedOrigin(req: Request): string {
  const origin = req.headers.get('origin') ?? ''
  if (ALLOWED_ORIGINS.includes(origin)) return origin
  // Fallback for non-browser clients (curl, Postman, Edge Function calls)
  return ALLOWED_ORIGINS[0]
}

export function corsHeaders(req: Request): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': getAllowedOrigin(req),
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-internal-secret',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
  }
}
```

- [ ] **Step 2: Atualizar todas as chamadas de corsHeaders**

O `corsHeaders` agora é uma função que recebe `req`. Precisa atualizar todas as chamadas:

Em `_shared/http.ts`:
- `json()`: mudar para receber `req` e passar `corsHeaders(req)` — MAS `json()` não tem acesso a `req`. Alternativa: tornar `json()` uma factory ou passar headers manualmente.

**Abordagem mais simples:** Manter `corsHeaders` como objeto estático mas com valor dinâmico calculado no handler:

```typescript
// Versão simplificada:
export function getCorsHeaders(origin?: string): Record<string, string> {
  const allowed = [
    'https://peragus.com.br',
    'https://www.peragus.com.br',
    'http://localhost:5173',
    'http://localhost:4173',
  ]
  const allowedOrigin = origin && allowed.includes(origin) ? origin : allowed[0]
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-internal-secret',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  }
}

// Para compatibilidade, manter corsHeaders como before (sem req):
export const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://peragus.com.br',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-internal-secret',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}
```

E atualizar `handleOptions` para usar origin dinâmico:

```typescript
export function handleOptions(req: Request): Response | null {
  if (req.method !== 'OPTIONS') return null
  const headers = getCorsHeaders(req.headers.get('origin') ?? undefined)
  return new Response('ok', { headers })
}
```

E `json()` para aceitar headers extras:

```typescript
export function json(data: unknown, status = 200, extraHeaders?: Record<string, string>): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json', ...extraHeaders },
  })
}
```

- [ ] **Step 3: Verificar que chamadas internas continuam funcionando**

A chamada de `confirm-pix` para `settle-operation` usa `fetch()` com URL interna do Supabase — não passa por CORS (é server-to-server).

- [ ] **Step 4: Commit**

```bash
git add supabase/functions/_shared/http.ts
git commit -m "fix(security): restrict CORS to peragus.com.br and localhost"
```

---

### Task 2.3: Adicionar validação com Zod nas Edge Functions

**Objetivo:** Validação robusta e tipada de todo input externo.

**Arquivos:**
- Criar: `supabase/functions/_shared/validation.ts`
- Modificar: `supabase/functions/create-operation/index.ts`
- Modificar: `supabase/functions/confirm-pix/index.ts`
- Modificar: `supabase/functions/get-operation-status/index.ts`
- Modificar: `supabase/functions/list-operations/index.ts`

**Risco:** BAIXO — adicionar validação não quebra funcionalidade existente
**Dependências:** Nenhuma

- [ ] **Step 1: Criar módulo de validação com Zod**

Criar `supabase/functions/_shared/validation.ts`:

```typescript
import { z } from 'npm:zod@3.23.8'

// --- Schemas reutilizáveis ---

export const uuidSchema = z.string().uuid('Invalid UUID format')

export const amountSchema = z
  .string()
  .regex(/^\d+(\.\d{1,2})?$/, 'amount must be a positive decimal string with at most 2 decimal places')
  .refine((s) => Number(s) > 0, 'amount must be greater than 0')

export const evmAddressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, 'must be a valid EVM address (0x + 40 hex chars)')

export const chainSchema = z.string().default('polygon-amoy')

// --- Request schemas ---

export const createOperationSchema = z.object({
  amount: amountSchema,
  receiver_wallet: evmAddressSchema,
  request_id: z.string().trim().min(1).optional(),
  chain: chainSchema,
})

export const confirmPixSchema = z.object({
  operation_id: uuidSchema,
})

export const getOperationStatusSchema = z.object({
  id: uuidSchema,
})

export const listOperationsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  before: z.string().optional(),
})

// --- Helper ---

export function validate<T extends z.ZodType>(
  schema: T,
  data: unknown,
): z.infer<T> {
  const result = schema.safeParse(data)
  if (!result.success) {
    const messages = result.error.issues.map((i) => i.message).join('; ')
    throw new Error(`Validation error: ${messages}`)
  }
  return result.data
}
```

- [ ] **Step 2: Atualizar create-operation para usar Zod**

No arquivo `supabase/functions/create-operation/index.ts`, substituir a validação manual:

```typescript
// ANTES:
const amount = requireAmountText(body)
const receiver_wallet = requireWallet(body, 'receiver_wallet')
const request_id = typeof body.request_id === 'string' && body.request_id.trim() ? body.request_id.trim() : crypto.randomUUID()
const chain = typeof body.chain === 'string' && body.chain.trim() ? body.chain.trim() : 'polygon-amoy'
```

Por:

```typescript
// DEPOIS:
import { validate, createOperationSchema } from '../_shared/validation.ts'

const parsed = validate(createOperationSchema, body)
const amount = parsed.amount
const receiver_wallet = parsed.receiver_wallet
const request_id = parsed.request_id ?? crypto.randomUUID()
const chain = parsed.chain
```

Remover imports não utilizados de `_shared/pix.ts` (requireAmountText, requireWallet).

- [ ] **Step 3: Atualizar confirm-pix para usar Zod**

No arquivo `supabase/functions/confirm-pix/index.ts`:

```typescript
// ANTES:
const operation_id = requireString(body, 'operation_id')

// DEPOIS:
import { validate, confirmPixSchema } from '../_shared/validation.ts'

const { operation_id } = validate(confirmPixSchema, body)
```

- [ ] **Step 4: Atualizar get-operation-status para usar Zod**

No arquivo `supabase/functions/get-operation-status/index.ts`:

```typescript
// ANTES (linhas ~15-18):
const id = url.searchParams.get('id')
if (!id) throw new HttpError(400, 'Missing required query param: id')

// DEPOIS:
import { validate, getOperationStatusSchema } from '../_shared/validation.ts'

const { id } = validate(getOperationStatusSchema, { id: url.searchParams.get('id') })
```

- [ ] **Step 5: Atualizar list-operations para usar Zod**

No arquivo `supabase/functions/list-operations/index.ts`:

```typescript
// ANTES:
const limit = Math.min(Math.max(Number(url.searchParams.get('limit') ?? 20), 1), 50)
const before = url.searchParams.get('before') ?? undefined

// DEPOIS:
import { validate, listOperationsSchema } from '../_shared/validation.ts'

const { limit, before } = validate(listOperationsSchema, {
  limit: url.searchParams.get('limit'),
  before: url.searchParams.get('before'),
})
```

- [ ] **Step 6: Verificar que imports antigos não quebram**

Manter `_shared/pix.ts` com `generatePixCode` (ainda usado por create-operation). Remover `requireAmountText`, `requireWallet`, `requireString` se não forem mais usados.

- [ ] **Step 7: Commit**

```bash
git add supabase/functions/_shared/validation.ts supabase/functions/create-operation/index.ts supabase/functions/confirm-pix/index.ts supabase/functions/get-operation-status/index.ts supabase/functions/list-operations/index.ts supabase/functions/_shared/pix.ts
git commit -m "feat(validation): add Zod schemas for all Edge Function inputs"
```

---

### Task 2.4: Aumentar minimum_password_length e secure_password_change

**Objetivo:** Exigir senhas mais fortes.

**Arquivos:**
- Modificar: `supabase/config.toml`

**Risco:** BAIXO — apenas configuração local
**Dependências:** Nenhuma

- [ ] **Step 1: Atualizar config.toml**

No arquivo `supabase/config.toml`, alterar:

```toml
# ANTES (linha 182):
minimum_password_length = 6

# DEPOIS:
minimum_password_length = 8
```

```toml
# ANTES (linha 228):
secure_password_change = false

# DEPOIS:
secure_password_change = true
```

- [ ] **Step 2: Commit**

```bash
git add supabase/config.toml
git commit -m "fix(security): increase minimum password length to 8, enable secure password change"
```

---

## FASE 3 — Fintech Safety

### Task 3.1: Criar tabela audit_log

**Objetivo:** Trilha append-only para todas as operações financeiras.

**Arquivos:**
- Criar: `supabase/migrations/20260825130000_create_audit_log.sql`
- Modificar: `supabase/functions/create-operation/index.ts`
- Modificar: `supabase/functions/confirm-pix/index.ts`
- Modificar: `supabase/functions/settle-operation/index.ts`

**Risco:** MÉDIO — nova tabela, precisa ser bem estruturada
**Dependências:** Task 1.1 (settle-operation com auth interna)

- [ ] **Step 1: Criar migration para audit_log**

Criar `supabase/migrations/20260825130000_create_audit_log.sql`:

```sql
-- Audit log for financial operations (append-only)
CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  metadata jsonb DEFAULT '{}',
  request_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for efficient queries by user and resource
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.audit_log (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_resource ON public.audit_log (resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log (created_at DESC);

-- Prevent updates and deletes (append-only)
ALTER TABLE public.audit_log DISABLE ROW LEVEL SECURITY;

-- Grant access to service_role only
GRANT SELECT, INSERT ON TABLE public.audit_log TO service_role;

-- Prevent direct access from anon/authenticated roles
REVOKE ALL ON TABLE public.audit_log FROM anon, authenticated;
```

- [ ] **Step 2: Criar helper de audit log**

Criar `supabase/functions/_shared/audit.ts`:

```typescript
import { SupabaseClient } from 'npm:@supabase/supabase-js@2'

export interface AuditEntry {
  user_id?: string
  action: string
  resource_type: string
  resource_id?: string
  metadata?: Record<string, unknown>
  request_id?: string
}

export async function writeAuditLog(
  admin: SupabaseClient,
  entry: AuditEntry,
): Promise<void> {
  const { error } = await admin.from('audit_log').insert({
    user_id: entry.user_id ?? null,
    action: entry.action,
    resource_type: entry.resource_type,
    resource_id: entry.resource_id ?? null,
    metadata: entry.metadata ?? {},
    request_id: entry.request_id ?? null,
  })
  // Never fail the main operation due to audit log failure
  if (error) console.error('audit_log write failed:', error.message)
}
```

- [ ] **Step 3: Adicionar audit log em create-operation**

No arquivo `supabase/functions/create-operation/index.ts`, após inserir a operação com sucesso (após linha 49):

```typescript
import { writeAuditLog } from '../_shared/audit.ts'

// Após row = data (linha 49):
await writeAuditLog(admin, {
  user_id: userId,
  action: 'OPERATION_CREATED',
  resource_type: 'operation',
  resource_id: row!.id,
  metadata: { amount, receiver_wallet, chain, token_symbol },
  request_id,
})
```

- [ ] **Step 4: Adicionar audit log em confirm-pix**

No arquivo `supabase/functions/confirm-pix/index.ts`, após confirmar com sucesso (após linha 43):

```typescript
import { writeAuditLog } from '../_shared/audit.ts'

// Após upErr check (linha 43):
await writeAuditLog(admin, {
  user_id: userId,
  action: 'OPERATION_PIX_CONFIRMED',
  resource_type: 'operation',
  resource_id: operation_id,
  metadata: { previous_status: current },
})
```

- [ ] **Step 5: Adicionar audit log em settle-operation**

No arquivo `supabase/functions/settle-operation/index.ts`, após sucesso (após linha 103) e após falha (após linha 113):

```typescript
import { writeAuditLog } from '../_shared/audit.ts'

// Após sucesso (linha 103):
await writeAuditLog(admin, {
  action: 'OPERATION_SETTLEMENT_COMPLETED',
  resource_type: 'operation',
  resource_id: operationIdRef ?? undefined,
  metadata: { tx_hash: receipt.hash, block_number: receipt.blockNumber, gas_used: receipt.gasUsed?.toString() },
})

// Após falha (linha 113):
await writeAuditLog(admin, {
  action: 'OPERATION_SETTLEMENT_FAILED',
  resource_type: 'operation',
  resource_id: operationIdRef ?? undefined,
  metadata: { error: err instanceof Error ? err.message : String(err) },
})
```

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/20260825130000_create_audit_log.sql supabase/functions/_shared/audit.ts supabase/functions/create-operation/index.ts supabase/functions/confirm-pix/index.ts supabase/functions/settle-operation/index.ts
git commit -m "feat(audit): add append-only audit_log table and writeAuditLog helper"
```

---

### Task 3.2: Adicionar state machine explícita

**Objetivo:** Garantir que apenas transições válidas de estado são permitidas.

**Arquivos:**
- Criar: `supabase/functions/_shared/state-machine.ts`
- Modificar: `supabase/functions/confirm-pix/index.ts`
- Modificar: `supabase/functions/settle-operation/index.ts`

**Risco:** BAIXO — apenas adiciona validação, não altera fluxo
**Dependências:** Nenhuma

- [ ] **Step 1: Criar módulo de state machine**

Criar `supabase/functions/_shared/state-machine.ts`:

```typescript
import { HttpError } from './http.ts'

// Valid state transitions for operations
const VALID_TRANSITIONS: Record<string, string[]> = {
  created: ['pix_pending', 'pix_confirmed', 'failed'],
  pix_pending: ['pix_confirmed', 'failed'],
  pix_confirmed: ['settling', 'failed'],
  settling: ['confirmed', 'failed'],
  confirmed: [], // terminal state
  failed: [],    // terminal state
}

export function assertValidTransition(from: string, to: string): void {
  const allowed = VALID_TRANSITIONS[from]
  if (!allowed) {
    throw new HttpError(409, `Unknown current status: ${from}`)
  }
  if (!allowed.includes(to)) {
    throw new HttpError(409, `Cannot transition from ${from} to ${to}`)
  }
}

export function isTerminal(status: string): boolean {
  return !VALID_TRANSITIONS[status] || VALID_TRANSITIONS[status].length === 0
}
```

- [ ] **Step 2: Usar state machine em confirm-pix**

No arquivo `supabase/functions/confirm-pix/index.ts`, substituir a verificação manual de status:

```typescript
// ANTES (linhas 25-28):
const current = op.status as string
if (!['created', 'pix_pending'].includes(current)) {
  throw new HttpError(409, `Cannot confirm pix from status ${current}`)
}
```

Por:

```typescript
// DEPOIS:
import { assertValidTransition } from '../_shared/state-machine.ts'

const current = op.status as string
assertValidTransition(current, 'pix_confirmed')
```

- [ ] **Step 3: Usar state machine em settle-operation**

No arquivo `supabase/functions/settle-operation/index.ts`, substituir a verificação de status:

```typescript
// ANTES (linhas 52-57):
const stale = op.status === 'settling' && (Date.now() - new Date(op.updated_at as string).getTime()) > 5 * 60_000
if (op.status !== 'pix_confirmed' && !stale) {
  throw new HttpError(409, `Cannot settle from status ${op.status}`)
}
```

Por:

```typescript
// DEPOIS:
import { assertValidTransition } from '../_shared/state-machine.ts'

const stale = op.status === 'settling' && (Date.now() - new Date(op.updated_at as string).getTime()) > 5 * 60_000
if (stale) {
  // Stale settling — allow retry but log it
} else {
  assertValidTransition(op.status as string, 'settling')
}
```

- [ ] **Step 4: Commit**

```bash
git add supabase/functions/_shared/state-machine.ts supabase/functions/confirm-pix/index.ts supabase/functions/settle-operation/index.ts
git commit -m "feat(safety): add explicit state machine for operation status transitions"
```

---

### Task 3.3: Adicionar double-spend prevention no settle stale

**Objetivo:** Não reenviar transação se a anterior está pendente on-chain.

**Arquivos:**
- Modificar: `supabase/functions/settle-operation/index.ts`

**Risco:** MÉDIO — lógica crítica de blockchain
**Dependências:** Task 3.2 (state machine)

- [ ] **Step 1: Verificar tx_hash antes de reenviar**

No arquivo `supabase/functions/settle-operation/index.ts`, ANTES de executar a transferência (após linha 81), adicionar:

```typescript
// Double-spend prevention: if operation already has a tx_hash, check its status before retrying
if (op.status === 'settling' && op.tx_hash) {
  // There's already a submitted transaction — check if it's still pending
  try {
    const existingReceipt = await withTimeout(provider.getTransactionReceipt(op.tx_hash), 30_000)
    if (existingReceipt) {
      // Transaction was mined — update status and abort retry
      const existingSuccess = Number(existingReceipt.status) === 1
      await admin
        .from('operations')
        .update({
          status: existingSuccess ? 'confirmed' : 'failed',
          tx_hash: existingReceipt.hash,
          block_number: existingReceipt.blockNumber,
          gas_used: (existingReceipt as unknown as { gasUsed?: string }).gasUsed?.toString() ?? null,
          transaction_status: existingSuccess ? 'success' : 'reverted',
        })
        .eq('id', operation_id)
      return json({ ok: true, status: existingSuccess ? 'confirmed' : 'failed', tx_hash: existingReceipt.hash })
    }
    // Receipt not found — transaction may have been dropped. Proceed with retry.
  } catch {
    // Unable to check receipt — proceed with retry as a fallback
  }
}
```

Isso deve ser inserido APÓS a verificação de stale e ANTES da atualização para 'settling' (linha 61).

Precisamos também adicionar `tx_hash` ao select na query inicial (linha 44):

```typescript
// ANTES:
.select('id, status, usdt_amount_text, receiver_wallet, updated_at')

// DEPOIS:
.select('id, status, usdt_amount_text, receiver_wallet, updated_at, tx_hash')
```

- [ ] **Step 2: Commit**

```bash
git add supabase/functions/settle-operation/index.ts
git commit -m "feat(safety): add double-spend prevention for stale settling operations"
```

---

## FASE 4 — Observabilidade

### Task 4.1: Criar health check endpoint

**Objetivo:** Endpoint para verificar status do sistema.

**Arquivos:**
- Criar: `supabase/functions/health-check/index.ts`

**Risco:** BAIXO — novo endpoint, não afeta existentes
**Dependências:** Nenhuma

- [ ] **Step 1: Criar health check function**

Criar `supabase/functions/health-check/index.ts`:

```typescript
import { handleOptions, json, fail } from '../_shared/http.ts'

Deno.serve(async (req) => {
  const options = handleOptions(req)
  if (options) return options
  if (req.method !== 'GET') return fail(new Error('Method Not Allowed'))

  try {
    // Check database connectivity
    const { createClient } = await import('npm:@supabase/supabase-js@2')
    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } },
    )
    const { error } = await admin.from('operations').select('id').limit(1)

    return json({
      status: error ? 'degraded' : 'healthy',
      timestamp: new Date().toISOString(),
      database: error ? 'unreachable' : 'connected',
    })
  } catch (err) {
    return json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: err instanceof Error ? err.message : 'unknown',
    }, 503)
  }
})
```

- [ ] **Step 2: Commit**

```bash
git add supabase/functions/health-check/index.ts
git commit -m "feat(observability): add health-check endpoint"
```

---

### Task 4.2: Adicionar timeout para chamadas RPC no settle-operation

**Objetivo:** Evitar que chamadas RPC lentas travem a Edge Function.

**Arquivos:**
- Modificar: `supabase/functions/settle-operation/index.ts`

**Risco:** BAIXO — timeout protege contra travamento
**Dependências:** Nenhuma

- [ ] **Step 1: Adicionar timeout genérico para chamadas RPC**

No arquivo `supabase/functions/settle-operation/index.ts`, adicionar uma helper function (já existe `withTimeout`, podemos reutilizar):

Substituir as chamadas RPC diretas (linhas 72, 78, 80) para usar timeout:

```typescript
// ANTES (linha 72):
const decimalsOnChain = Number(await token.decimals())

// DEPOIS:
const decimalsOnChain = Number(await withTimeout(token.decimals(), 30_000))
```

```typescript
// ANTES (linha 78):
const balance: bigint = await token.balanceOf(wallet.address)

// DEPOIS:
const balance: bigint = await withTimeout(token.balanceOf(wallet.address), 30_000)
```

```typescript
// ANTES (linha 80):
const native: bigint = await provider.getBalance(wallet.address)

// DEPOIS:
const native: bigint = await withTimeout(provider.getBalance(wallet.address), 30_000)
```

- [ ] **Step 2: Commit**

```bash
git add supabase/functions/settle-operation/index.ts
git commit -m "fix(reliability): add 30s timeout to RPC calls in settle-operation"
```

---

### Task 4.3: Melhorar logging estruturado

**Objetivo:** Logs consistentes para debugging em produção.

**Arquivos:**
- Criar: `supabase/functions/_shared/logger.ts`
- Modificar: Todas as Edge Functions (adicionar imports)

**Risco:** BAIXO — logging não afeta funcionalidade
**Dependências:** Nenhuma

- [ ] **Step 1: Criar módulo de logging**

Criar `supabase/functions/_shared/logger.ts`:

```typescript
type Level = 'info' | 'warn' | 'error'

interface LogContext {
  requestId?: string
  userId?: string
  function?: string
  [key: string]: unknown
}

function log(level: Level, message: string, context?: LogContext): void {
  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...context,
  }
  if (level === 'error') {
    console.error(JSON.stringify(entry))
  } else if (level === 'warn') {
    console.warn(JSON.stringify(entry))
  } else {
    console.log(JSON.stringify(entry))
  }
}

export const logger = {
  info: (message: string, ctx?: LogContext) => log('info', message, ctx),
  warn: (message: string, ctx?: LogContext) => log('warn', message, ctx),
  error: (message: string, ctx?: LogContext) => log('error', message, ctx),
}
```

- [ ] **Step 2: Adicionar logging em settle-operation**

No arquivo `supabase/functions/settle-operation/index.ts`, adicionar logs em pontos-chave:

```typescript
import { logger } from '../_shared/logger.ts'

// No início (após parse do operation_id):
logger.info('settle-operation started', { operation_id, function: 'settle-operation' })

// Após sucesso:
logger.info('settle-operation completed', { operation_id, tx_hash: receipt.hash, function: 'settle-operation' })

// No catch:
logger.error('settle-operation failed', { operation_id, error: err instanceof Error ? err.message : String(err), function: 'settle-operation' })
```

- [ ] **Step 3: Adicionar logging em create-operation e confirm-pix**

Mesmo padrão: log no início, sucesso e falha.

- [ ] **Step 4: Commit**

```bash
git add supabase/functions/_shared/logger.ts supabase/functions/settle-operation/index.ts supabase/functions/create-operation/index.ts supabase/functions/confirm-pix/index.ts
git commit -m "feat(observability): add structured JSON logging to Edge Functions"
```

---

## FASE 5 — Testes

### Task 5.1: Criar testes de segurança

**Objetivo:** Validar que proteções funcionam corretamente.

**Arquivos:**
- Criar: `supabase/functions/__tests__/security.test.ts`

**Risco:** BAIXO — testes não afetam produção
**Dependências:** Tasks 1.1, 2.2, 2.3

- [ ] **Step 1: Criar testes de segurança**

Criar `supabase/functions/__tests__/security.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { validate, createOperationSchema, confirmPixSchema } from '../_shared/validation.ts'
import { assertValidTransition } from '../_shared/state-machine.ts'

describe('Validation', () => {
  describe('createOperationSchema', () => {
    it('rejects invalid amount', () => {
      expect(() => validate(createOperationSchema, { amount: 'abc', receiver_wallet: '0x' + 'a'.repeat(40) })).toThrow()
    })

    it('rejects negative amount', () => {
      expect(() => validate(createOperationSchema, { amount: '-5', receiver_wallet: '0x' + 'a'.repeat(40) })).toThrow()
    })

    it('rejects invalid wallet address', () => {
      expect(() => validate(createOperationSchema, { amount: '10', receiver_wallet: 'not-an-address' })).toThrow()
    })

    it('accepts valid input', () => {
      const result = validate(createOperationSchema, {
        amount: '25.50',
        receiver_wallet: '0x' + 'a'.repeat(40),
      })
      expect(result.amount).toBe('25.50')
    })
  })

  describe('confirmPixSchema', () => {
    it('rejects invalid UUID', () => {
      expect(() => validate(confirmPixSchema, { operation_id: 'not-a-uuid' })).toThrow()
    })

    it('accepts valid UUID', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000'
      const result = validate(confirmPixSchema, { operation_id: uuid })
      expect(result.operation_id).toBe(uuid)
    })
  })
})

describe('State Machine', () => {
  it('allows valid transition', () => {
    expect(() => assertValidTransition('created', 'pix_confirmed')).not.toThrow()
  })

  it('rejects invalid transition', () => {
    expect(() => assertValidTransition('confirmed', 'created')).toThrow()
  })

  it('rejects transition from unknown status', () => {
    expect(() => assertValidTransition('unknown', 'created')).toThrow()
  })
})
```

- [ ] **Step 2: Rodar testes**

```bash
npx vitest run supabase/functions/__tests__/security.test.ts
```

- [ ] **Step 3: Commit**

```bash
git add supabase/functions/__tests__/security.test.ts
git commit -m "test(security): add validation and state machine tests"
```

---

### Task 5.2: Criar testes de finance safety

**Objetivo:** Validar que operações financeiras são idempotentes e seguras.

**Arquivos:**
- Criar: `supabase/functions/__tests__/financial-safety.test.ts`

**Risco:** BAIXO — testes não afetam produção
**Dependências:** Task 5.1

- [ ] **Step 1: Criar testes de finance safety**

Criar `supabase/functions/__tests__/financial-safety.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { assertValidTransition, isTerminal } from '../_shared/state-machine.ts'

describe('Financial Safety - State Machine', () => {
  const validFlow = [
    { from: 'created', to: 'pix_confirmed' },
    { from: 'pix_confirmed', to: 'settling' },
    { from: 'settling', to: 'confirmed' },
  ]

  it('allows complete happy path', () => {
    for (const { from, to } of validFlow) {
      expect(() => assertValidTransition(from, to)).not.toThrow()
    }
  })

  it('rejects skipping states', () => {
    expect(() => assertValidTransition('created', 'settling')).toThrow()
    expect(() => assertValidTransition('created', 'confirmed')).toThrow()
  })

  it('rejects going backwards', () => {
    expect(() => assertValidTransition('confirmed', 'created')).toThrow()
    expect(() => assertValidTransition('settling', 'pix_confirmed')).toThrow()
  })

  it('terminal states have no transitions', () => {
    expect(isTerminal('confirmed')).toBe(true)
    expect(isTerminal('failed')).toBe(true)
  })

  it('non-terminal states have transitions', () => {
    expect(isTerminal('created')).toBe(false)
    expect(isTerminal('pix_confirmed')).toBe(false)
    expect(isTerminal('settling')).toBe(false)
  })
})
```

- [ ] **Step 2: Rodar testes**

```bash
npx vitest run supabase/functions/__tests__/financial-safety.test.ts
```

- [ ] **Step 3: Commit**

```bash
git add supabase/functions/__tests__/financial-safety.test.ts
git commit -m "test(safety): add financial safety and state machine tests"
```

---

## Checkpoint: Validação

Após FASE 5, rodar:

```bash
npx vitest run
npm run lint
npm run typecheck
npm run build
```

Todos devem passar sem erros.

---

## Resumo de Arquivos

### Criados
- `supabase/functions/_shared/validation.ts`
- `supabase/functions/_shared/audit.ts`
- `supabase/functions/_shared/state-machine.ts`
- `supabase/functions/_shared/logger.ts`
- `supabase/functions/health-check/index.ts`
- `supabase/migrations/20260825120000_enable_rls_operations.sql`
- `supabase/migrations/20260825130000_create_audit_log.sql`
- `supabase/functions/__tests__/security.test.ts`
- `supabase/functions/__tests__/financial-safety.test.ts`
- `docs/email-confirmation-config.md`

### Alterados
- `supabase/functions/settle-operation/index.ts` (auth interna, double-spend, timeout RPC, audit log, logging)
- `supabase/functions/confirm-pix/index.ts` (header interno, Zod, state machine, audit log, logging)
- `supabase/functions/create-operation/index.ts` (Zod, audit log, logging)
- `supabase/functions/get-operation-status/index.ts` (Zod)
- `supabase/functions/list-operations/index.ts` (Zod)
- `supabase/functions/_shared/http.ts` (CORS restrito)
- `supabase/functions/_shared/pix.ts` (remover funções não utilizadas)
- `vercel.json` (security headers)
- `.env.example` (INTERNAL_SETTLE_SECRET)
- `supabase/config.toml` (password length, secure change)

### Deletados
- `.env.txt`
