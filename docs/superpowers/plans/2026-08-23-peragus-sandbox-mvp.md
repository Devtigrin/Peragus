# Peragus Sandbox MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the static B2B site into a working sandbox: email+password auth, API keys, `/docs`, and the full MockUSDT operation flow (create → simulated Pix → Amoy settlement) powered by consolidated Supabase Edge Functions.

**Architecture:** Existing React Router 7 SPA gains localized auth pages and an authenticated `/app` dashboard backed by Supabase Auth (JS SDK, cookie-less SPA session). Six legacy Edge Functions consolidate to five in the `peragus_*` house style (remote-JWKS JWT **or** hashed API-key auth, strict input validation, JSON errors). Settlement executes from the owner's pre-configured MetaMask hot wallet via secrets. Schema changes ship as a SQL migration applied through the Management API (no Docker available).

**Tech Stack:** React 19 + TS + Vite + Tailwind 4 + react-router-dom 7 · Vitest + Testing Library · Playwright · @supabase/supabase-js v2 · Deno Edge Functions (`jose`, `ethers@6.13.5`) · MDX (`@mdx-js/rollup`)

**Spec:** `docs/superpowers/specs/2026-08-23-peragus-sandbox-mvp-design.md`

## Global Constraints

- Token is always "**MockUSDT**"; never "USDT"; never claims of backing/redemption/parity.
- Every new screen ships in **pt/es/en** using `src/i18n/routing.ts` helpers and the content-module pattern (`src/content/**/{pt,es,en}.ts`), except docs pages which are MDX files per locale.
- Accessibility: AA contrast, touch targets ≥44px (`min-h-11`), visible focus.
- Forbidden effects: backdrop-blur, heavy decorative animation.
- Supabase project ref: `iifcwnumpccoucxggxjb` (sa-east-1). Linked already (`supabase/config.toml`).
- No Docker on this machine: schema changes go through `POST https://api.supabase.com/v1/projects/iifcwnumpccoucxggxjb/database/query` with a personal access token supplied interactively; the SQL file in `supabase/migrations/` is the durable record.
- Edge Functions deploy with `--no-verify-jwt`: authentication happens inside each function (JWT via remote JWKS **or** `pk_live_…` API key). Never rely on the platform gateway check.
- Hot wallet secrets (`AMOY_RPC_URL`, `HOT_WALLET_PRIVATE_KEY`, `MOCKUSDT_CONTRACT_ADDRESS`, `MOCKUSDT_DECIMALS`) already exist in cloud secrets; never echo their values into logs or files.
- Status vocabulary everywhere: `created → pix_pending → pix_confirmed → settling → confirmed | failed`.
- Source of truth for value: column `usdt_amount_text`; `amount` numeric is legacy, no new writes.
- Commits: conventional, lowercase English (`feat: …`, `test: …`, matching repo history). One commit per task checkpoint.
- Windows PowerShell environment; use `;` / `if ($?)` chaining, quote paths.

---

### Task 1: Supabase JS client and environment plumbing

**Files:**
- Create: `src/lib/supabase.ts`
- Create: `.env.example`
- Modify: `.gitignore` (ensure `.env.local`)
- Test: `src/lib/supabase.test.ts`

**Interfaces:**
- Produces: `supabase: SupabaseClient` and `SUPABASE_URL: string` from `@/lib/supabase` — consumed by every auth/dashboard task below.

- [ ] **Step 1: Install dependency**

```powershell
npm install "@supabase/supabase-js@^2"
```

- [ ] **Step 2: Obtain anon key and write `.env.local`**

```powershell
supabase projects api-keys --project-ref iifcwnumpccoucxggxjb
```

Pick the `anon` `publishable`-style key (NOT service_role). Create `.env.local`:

```
VITE_SUPABASE_URL=https://iifcwnumpccoucxggxjb.supabase.co
VITE_SUPABASE_ANON_KEY=<paste-anon-key>
```

Create `.env.example` with the same shape but `<placeholder>` values.

- [ ] **Step 3: Verify `.gitignore` contains `.env.local`** (append if missing).

- [ ] **Step 4: Write the failing test**

`src/lib/supabase.test.ts`:

```ts
import { describe, expect, it } from 'vitest'

describe('supabase client', () => {
  it('exposes url and client', async () => {
    const mod = await import('./supabase')
    expect(mod.SUPABASE_URL).toMatch(/^https:\/\/[a-z]+\.supabase\.co$/)
    expect(mod.supabase).toBeTruthy()
    expect(typeof mod.supabase.auth.onAuthStateChange).toBe('function')
  })
})
```

- [ ] **Step 5: Run it — expect FAIL** (`Cannot find module './supabase'`)

```powershell
npx vitest run src/lib/supabase.test.ts
```

- [ ] **Step 6: Implement `src/lib/supabase.ts`**

```ts
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

if (!url || !anonKey) {
  throw new Error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY')
}

export const SUPABASE_URL = url.replace(/\/$/, '')
export const supabase = createClient(SUPABASE_URL, anonKey, {
  auth: { persistSession: true, autoRefreshToken: true },
})
```

Note: vitest loads `.env.local` automatically via Vite. jsdom tests import lazily inside the test to let env resolution happen.

- [ ] **Step 7: Run test — expect PASS**, then full suite `npm test`.

- [ ] **Step 8: Commit**

```powershell
git add package.json package-lock.json .env.example .gitignore src/lib/supabase.ts src/lib/supabase.test.ts; git commit -m "feat: add supabase client foundation"
```

---

### Task 2: Routing extensions for auth, app and docs

**Files:**
- Modify: `src/i18n/routing.ts`
- Test: `src/i18n/routing.test.ts` (extend existing)

**Interfaces:**
- Produces:
  - `type AppSlug = 'app' | 'chaves-api' | 'configuracoes'`
  - `type AuthSlug = 'login' | 'register' | 'recuperar-senha' | 'resetar-senha'`
  - `authPath(locale, slug): string` → e.g. `/es/login`
  - `appPath(locale, slug?): string` → `/app`, `/es/chaves-api`
  - `docsPath(locale): string` → `/en/docs`
- Consumes: nothing new (extends existing helpers).

- [ ] **Step 1: Failing tests** — append to `src/i18n/routing.test.ts`:

```ts
import { appPath, authPath, docsPath } from './routing'

describe('sandbox routing', () => {
  it('builds auth paths', () => {
    expect(authPath('pt', 'login')).toBe('/login')
    expect(authPath('es', 'register')).toBe('/es/register')
    expect(authPath('en', 'recuperar-senha')).toBe('/en/recuperar-senha')
  })
  it('builds app paths', () => {
    expect(appPath('pt')).toBe('/app')
    expect(appPath('es', 'chaves-api')).toBe('/es/chaves-api')
    expect(appPath('en', 'configuracoes')).toBe('/en/configuracoes')
  })
  it('builds docs paths', () => {
    expect(docsPath('pt')).toBe('/docs')
    expect(docsPath('en')).toBe('/en/docs')
  })
})
```

Run: `npx vitest run src/i18n/routing.test.ts` → FAIL (exports missing).

- [ ] **Step 2: Implement** — add to `src/i18n/routing.ts`:

```ts
export type AppSlug = 'app' | 'chaves-api' | 'configuracoes'
export type AuthSlug = 'login' | 'register' | 'recuperar-senha' | 'resetar-senha'

export function authPath(locale: Locale, slug: AuthSlug): string {
  return `${PREFIX[locale]}/${slug}`
}

export function appPath(locale: Locale, slug?: Exclude<AppSlug, 'app'>): string {
  return slug ? `${PREFIX[locale]}/app/${slug}` : `${PREFIX[locale]}/app`
}

export function docsPath(locale: Locale): string {
  return `${PREFIX[locale]}/docs`
}
```

Run again → PASS. Full suite `npm test` green.

- [ ] **Step 3: Commit** `git add -A; git commit -m "feat: add sandbox route helpers"`

---

### Task 3: Database migration — status vocabulary, idempotency index, api_keys

**Files:**
- Create: `supabase/migrations/20260823120000_sandbox_mvp.sql`

No local test cycle (cloud DDL); verification is the post-apply query checks below.

- [ ] **Step 1: Write `supabase/migrations/20260823120000_sandbox_mvp.sql`**

```sql
-- Peragus Sandbox MVP — applied via Management API (no Docker host)
create extension if not exists pgcrypto;

-- 1. Unify status vocabulary
do $$
declare c text;
begin
  for c in
    select conname from pg_constraint
    where conrelid = 'public.operations'::regclass
      and contype = 'c'
      and lower(pg_get_constraintdef(oid)) like '%status%'
  loop
    execute format('alter table public.operations drop constraint %I', c);
  end loop;
end $$;

update public.operations
set status = case status
  when 'pending' then 'created'
  when 'submitted' then 'settling'
  else status end
where status in ('pending', 'submitted');

alter table public.operations
  add constraint operations_status_check
  check (status in ('created','pix_pending','pix_confirmed','settling','confirmed','failed'));

-- 2. Idempotency guarantee (user_id, request_id)
create unique index if not exists operations_user_request_unique
  on public.operations (user_id, request_id);

-- 3. API keys
create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  key_hash text not null unique,
  key_prefix text not null,
  last_used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.api_keys enable row level security;

drop policy if exists "api_keys_select_own" on public.api_keys;
create policy "api_keys_select_own" on public.api_keys
  for select using (auth.uid() = user_id);

drop policy if exists "api_keys_update_own" on public.api_keys;
create policy "api_keys_update_own" on public.api_keys
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
-- No INSERT/DELETE policies: lifecycle only via RPC (insert) and revoke (update revoked_at).

-- 4. Creation RPC — returns raw key exactly once
create or replace function public.create_api_key(p_name text)
returns table (id uuid, name text, key text, key_prefix text, created_at timestamptz)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_raw text;
  v_hash text;
begin
  if auth.uid() is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;
  if p_name is null or length(btrim(p_name)) = 0 then
    raise exception 'name is required';
  end if;
  v_raw  := 'pk_live_' || encode(gen_random_bytes(24), 'hex');
  v_hash := encode(digest(v_raw, 'sha256'), 'hex');
  insert into public.api_keys (user_id, name, key_hash, key_prefix)
  values (auth.uid(), btrim(p_name), v_hash, left(v_raw, 12));
  return query
    select k.id, k.name, v_raw, k.key_prefix, k.created_at
    from public.api_keys k
    where k.key_hash = v_hash;
end $$;

revoke execute on function public.create_api_key(text) from public, anon;
grant execute on function public.create_api_key(text) to authenticated;
```

- [ ] **Step 2: Apply via Management API** (interactive token, never saved to disk):

```powershell
$t = Read-Host 'Supabase access token (sbp_...)'
$sql = Get-Content -Raw supabase/migrations/20260823120000_sandbox_mvp.sql
$body = @{ query = $sql } | ConvertTo-Json
Invoke-RestMethod -Method Post `
  -Uri "https://api.supabase.com/v1/projects/iifcwnumpccoucxggxjb/database/query" `
  -Headers @{ Authorization = "Bearer $t" } `
  -ContentType 'application/json' -Body $body
```

Expected: empty result array (success). On error, fix SQL and re-run (statements are idempotent).

- [ ] **Step 3: Verify** — run probe query the same way:

```sql
select (select count(*) from pg_constraint where conname='operations_status_check') as status_ok,
       (select count(*) from pg_policies where tablename='api_keys') as policies,
       (select count(*) from pg_proc where proname='create_api_key') as rpc;
```

Expect `2 | 2 | 1` (status_ok=1, policies=2, rpc=1).

- [ ] **Step 4: Commit** `git add supabase/migrations; git commit -m "feat: add sandbox database migration"`

---

### Task 4: Shared Edge Function modules + rewritten `create-operation`

**Files:**
- Create: `supabase/functions/_shared/http.ts`
- Create: `supabase/functions/_shared/auth.ts`
- Create: `supabase/functions/_shared/pix.ts`
- Overwrite: `supabase/functions/create-operation/index.ts`

**Interfaces:**
- Produces (all later function tasks consume):
  - `_shared/http.ts`: `json(data, status?)`, `HttpError(status, message)`, `handleOptions(req)`, `fail(err)` (maps HttpError→status, else 400), `rateLimit(key)` (30 req/min per identity, in-memory per isolate — MVP phase-1 limiter promised in the spec)
  - `_shared/auth.ts`: `authenticate(req, admin) → { userId, via }`, throws `HttpError(401)`; accepts Supabase JWT (remote JWKS, cached) or `pk_live_…` API key (sha256 lookup, bumps `last_used_at`)
  - `_shared/pix.ts`: `generatePixCode(operationId): string`
- Contract of `create-operation`: `POST { amount, receiver_wallet, chain?, token_symbol?, request_id? }` → `201 { ok, operation: { id, status:'created', pix_code }, idempotent? }`; errors `{ error }`.

- [ ] **Step 1: `supabase/functions/_shared/http.ts`**

```ts
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

export function handleOptions(req: Request): Response | null {
  return req.method === 'OPTIONS' ? new Response('ok', { headers: corsHeaders }) : null
}

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

// Best-effort per-isolate rate limiter (MVP phase 1). Key = identity string.
const HITS = new Map<string, number[]>()
const WINDOW_MS = 60_000
const MAX_HITS = 30

export function rateLimit(key: string): void {
  const now = Date.now()
  const recent = (HITS.get(key) ?? []).filter((t) => now - t < WINDOW_MS)
  if (recent.length >= MAX_HITS) throw new HttpError(429, 'Too many requests')
  recent.push(now)
  HITS.set(key, recent)
}

export function fail(err: unknown): Response {
  const status = err instanceof HttpError ? err.status : 400
  const message = err instanceof Error ? err.message : String(err)
  return json({ error: message }, status)
}

export async function readJson(req: Request): Promise<Record<string, unknown>> {
  try {
    const body = await req.json()
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('bad json')
    return body as Record<string, unknown>
  } catch {
    throw new HttpError(400, 'Invalid JSON body')
  }
}
```

- [ ] **Step 2: `supabase/functions/_shared/auth.ts`**

```ts
import { createClient, SupabaseClient } from 'npm:@supabase/supabase-js@2'
import { createRemoteJWKSet, jwtVerify } from 'npm:jose@5'
import { HttpError } from './http.ts'

export type AuthContext = { userId: string; via: 'jwt' | 'api_key' }

function bearer(req: Request): string {
  const h = req.headers.get('Authorization') ?? ''
  if (!h.startsWith('Bearer ')) throw new HttpError(401, 'Unauthorized: missing Bearer token')
  return h.slice(7).trim()
}

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null
async function verifyJwt(req: Request): Promise<string> {
  const url = Deno.env.get('SUPABASE_URL')!
  jwks ??= createRemoteJWKSet(new URL(`${url}/auth/v1/.well-known/jwks.json`))
  try {
    const { payload } = await jwtVerify(bearer(req), jwks, {
      issuer: `${url}/auth/v1`,
      algorithms: ['ES256', 'RS256', 'EdDSA'],
    })
    if (typeof payload.sub === 'string' && payload.sub.length >= 10) return payload.sub
  } catch { /* fall through */ }
  throw new HttpError(401, 'Unauthorized: invalid session token')
}

async function sha256Hex(s: string): Promise<string> {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function verifyApiKey(req: Request, admin: SupabaseClient): Promise<string> {
  const raw = bearer(req)
  if (!raw.startsWith('pk_live_')) throw new HttpError(401, 'Unauthorized: invalid credentials')
  const hash = await sha256Hex(raw)
  const { data, error } = await admin
    .from('api_keys')
    .select('id, user_id')
    .eq('key_hash', hash)
    .is('revoked_at', null)
    .maybeSingle()
  if (error || !data) throw new HttpError(401, 'Unauthorized: unknown or revoked API key')
  await admin.from('api_keys').update({ last_used_at: new Date().toISOString() }).eq('id', data.id)
  return data.user_id as string
}

export function adminClient(): SupabaseClient {
  return createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false },
  })
}

export async function authenticate(req: Request, admin: SupabaseClient): Promise<AuthContext> {
  const raw = (req.headers.get('Authorization') ?? '').slice(7).trim()
  if (raw.startsWith('pk_live_')) return { userId: await verifyApiKey(req, admin), via: 'api_key' }
  return { userId: await verifyJwt(req), via: 'jwt' }
}
```

- [ ] **Step 3: `supabase/functions/_shared/pix.ts`**

```ts
import { HttpError } from './http.ts'

// Simulated Pix copy-and-paste code. NOT a real BR Code; sandbox only.
export function generatePixCode(operationId: string): string {
  return `00020126SANDBOX-PERAGUS${operationId.replace(/-/g, '').slice(0, 20).toUpperCase()}5204000053039865802BR`
}

export function requireString(body: Record<string, unknown>, field: string): string {
  const v = body[field]
  if (typeof v !== 'string' || v.trim().length === 0) throw new HttpError(400, `${field} is required`)
  return v.trim()
}

export function requireWallet(body: Record<string, unknown>, field: string): string {
  const v = requireString(body, field)
  if (!/^0x[a-fA-F0-9]{40}$/.test(v)) throw new HttpError(400, `${field} must be a valid EVM address`)
  return v
}

export function requireAmountText(body: Record<string, unknown>): string {
  const s = requireString(body, 'amount')
  if (!/^\d+(\.\d{1,2})?$/.test(s)) throw new HttpError(400, 'amount must be a positive decimal string')
  if (Number(s) <= 0) throw new HttpError(400, 'amount must be > 0')
  return s
}
```

- [ ] **Step 4: Overwrite `supabase/functions/create-operation/index.ts`**

```ts
import { authenticate, adminClient } from '../_shared/auth.ts'
import { fail, handleOptions, HttpError, json, rateLimit, readJson } from '../_shared/http.ts'
import { generatePixCode, requireAmountText, requireString, requireWallet } from '../_shared/pix.ts'

Deno.serve(async (req) => {
  const options = handleOptions(req)
  if (options) return options
  if (req.method !== 'POST') return fail(new HttpError(405, 'Method Not Allowed'))
  const admin = adminClient()
  try {
    const { userId } = await authenticate(req, admin)
    rateLimit(userId)
    const body = await readJson(req)
    const amount = requireAmountText(body)
    const receiver_wallet = requireWallet(body, 'receiver_wallet')
    const request_id = typeof body.request_id === 'string' && body.request_id.trim()
      ? body.request_id.trim()
      : crypto.randomUUID()
    const chain = typeof body.chain === 'string' && body.chain.trim() ? body.chain.trim() : 'polygon-amoy'
    // Brand rule: the sandbox token is MockUSDT. Never accept "USDT".
    const token_symbol = 'MOCKUSDT'

    let row: Record<string, unknown> | null = null
    try {
      const { data, error } = await admin.from('operations').insert({
        user_id: userId,
        request_id,
        status: 'created',
        chain,
        token_symbol,
        usdt_amount_text: amount,
        receiver_wallet,
        request_json: {},
        error_message: null,
      }).select('*').single()
      if (error) throw error
      row = data
    } catch (err) {
      const code = (err as { code?: string })?.code
      if (code !== '23505') throw err
      const { data: existing } = await admin
        .from('operations')
        .select('*')
        .eq('user_id', userId)
        .eq('request_id', request_id)
        .maybeSingle()
      if (!existing) throw new HttpError(409, 'Idempotency collision but operation not found')
      return json({ ok: true, idempotent: true, operation: { id: existing.id, status: existing.status, pix_code: (existing.request_json as Record<string, unknown>)?.pix_code ?? null } })
    }

    const pix_code = generatePixCode(row!.id as string)
    await admin.from('operations').update({ request_json: { pix_code } }).eq('id', row!.id)

    return json({
      ok: true,
      operation: {
        id: row!.id,
        status: 'created',
        pix_code,
        usdt_amount_text: amount,
        receiver_wallet,
      },
    }, 201)
  } catch (err) {
    return fail(err)
  }
})
```

- [ ] **Step 5: Deploy + smoke**

```powershell
supabase functions deploy create-operation --project-ref iifcwnumpccoucxggxjb --no-verify-jwt
curl.exe -s -o - -w "%{http_code}" -X POST "https://iifcwnumpccoucxggxjb.supabase.co/functions/v1/create-operation" -H "Content-Type: application/json" -d "{}"
```

Expected: `401{"error":"Unauthorized: missing Bearer token"}401` — proves auth gate before any DB touch. (Tasks 5–7 include the same `rateLimit(userId)` call after `authenticate`; keep it when writing them.)

- [ ] **Step 6: Commit**

```powershell
git add supabase/functions; git commit -m "feat: consolidate create-operation with shared auth modules"
```

---

### Task 5: `confirm-pix` (simulated provider approval)

**Files:**
- Create: `supabase/functions/confirm-pix/index.ts`

**Interfaces:**
- Consumes: `_shared/*` from Task 4.
- Produces: `POST { operation_id }` → `200 { ok, operation: { id, status } }`; transitions `created|pix_pending → pix_confirmed`, stamps `request_json.paid_at`; then fires settlement (Task 6 deploys the target; until then the background call fails harmlessly and op stays `pix_confirmed`).

- [ ] **Step 1: Implement**

```ts
import { authenticate, adminClient } from '../_shared/auth.ts'
import { fail, handleOptions, HttpError, json, readJson } from '../_shared/http.ts'
import { requireString } from '../_shared/pix.ts'

Deno.serve(async (req) => {
  const options = handleOptions(req)
  if (options) return options
  if (req.method !== 'POST') return fail(new HttpError(405, 'Method Not Allowed'))
  const admin = adminClient()
  try {
    const { userId } = await authenticate(req, admin)
    const body = await readJson(req)
    const operation_id = requireString(body, 'operation_id')

    const { data: op, error } = await admin
      .from('operations')
      .select('id, status, user_id, request_json')
      .eq('id', operation_id)
      .eq('user_id', userId)
      .maybeSingle()
    if (error) throw error
    if (!op) throw new HttpError(404, 'Operation not found')

    const current = op.status as string
    if (!['created', 'pix_pending'].includes(current)) {
      throw new HttpError(409, `Cannot confirm pix from status ${current}`)
    }

    // Simulated provider approval: sandbox MVP confirms instantly.
    const requestJson = (op.request_json ?? {}) as Record<string, unknown>
    const updated = { ...requestJson, paid_at: new Date().toISOString(), pix_provider: 'sandbox-simulated' }
    const { data: confirmed, error: upErr } = await admin
      .from('operations')
      .update({ status: 'pix_confirmed', request_json: updated })
      .eq('id', operation_id)
      .select('id, status')
      .single()
    if (upErr) throw upErr

    // Fire-and-forget settlement (Task 6 provides the endpoint).
    EdgeRuntime.waitUntil(
      fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/settle-operation`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${req.headers.get('Authorization')?.slice(7) ?? ''}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ operation_id }),
      }).catch(() => {}),
    )

    return json({ ok: true, operation: confirmed })
  } catch (err) {
    return fail(err)
  }
})
```

- [ ] **Step 2: Deploy + smoke** — deploy same pattern as Task 4 Step 5; anonymous POST expects 401.

- [ ] **Step 3: Commit** `git add supabase/functions/confirm-pix; git commit -m "feat: add simulated pix confirmation endpoint"`

---

### Task 6: `settle-operation` (hot-wallet ERC-20 transfer)

**Files:**
- Create: `supabase/functions/settle-operation/index.ts`

**Interfaces:**
- Consumes: `_shared/*`; secrets `AMOY_RPC_URL`, `HOT_WALLET_PRIVATE_KEY`, `MOCKUSDT_CONTRACT_ADDRESS`, `MOCKUSDT_DECIMALS` (verify names via `supabase secrets list` first; if a name is absent ask the owner — never guess key material).
- Produces: `POST { operation_id }` → `200 { ok, status }`; `pix_confirmed → settling → confirmed|failed`, persists `tx_hash`, `block_number`, `gas_used`, `transaction_status`, `sender_wallet`, `contract_address`.

- [ ] **Step 1: Implement**

```ts
import { createClient } from 'npm:@supabase/supabase-js@2'
import { ethers } from 'npm:ethers@6.13.5'
import { fail, handleOptions, HttpError, json, readJson } from '../_shared/http.ts'
import { requireString } from '../_shared/pix.ts'

const ERC20_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
]

function requireEnv(name: string): string {
  const v = Deno.env.get(name)
  if (!v) throw new HttpError(500, `${name} is required`)
  return v
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  let t: number | undefined
  const timeout = new Promise<T>((_, reject) => {
    t = setTimeout(() => reject(new Error('timeout waiting transaction receipt')), 180_000)
  })
  return Promise.race([p, timeout]).finally(() => clearTimeout(t))
}

Deno.serve(async (req) => {
  const options = handleOptions(req)
  if (options) return options
  if (req.method !== 'POST') return fail(new HttpError(405, 'Method Not Allowed'))

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const admin = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false },
  })

  try {
    const body = await readJson(req)
    const operation_id = requireString(body, 'operation_id')

    const { data: op, error } = await admin
      .from('operations')
      .select('id, status, usdt_amount_text, receiver_wallet')
      .eq('id', operation_id)
      .maybeSingle()
    if (error) throw error
    if (!op) throw new HttpError(404, 'Operation not found')
    if (op.status !== 'pix_confirmed') throw new HttpError(409, `Cannot settle from status ${op.status}`)
    if (!op.usdt_amount_text || !op.receiver_wallet) throw new HttpError(409, 'Operation missing amount or receiver')

    await admin.from('operations').update({ status: 'settling', error_message: null }).eq('id', operation_id)

    const provider = new ethers.JsonRpcProvider(requireEnv('AMOY_RPC_URL'))
    const wallet = new ethers.Wallet(requireEnv('HOT_WALLET_PRIVATE_KEY'), provider)
    const contractAddress = requireEnv('MOCKUSDT_CONTRACT_ADDRESS')
    const expectedDecimals = Number(requireEnv('MOCKUSDT_DECIMALS'))
    if (!Number.isInteger(expectedDecimals) || expectedDecimals < 0 || expectedDecimals > 18) {
      throw new HttpError(500, 'MOCKUSDT_DECIMALS must be an integer between 0 and 18')
    }

    const token = new ethers.Contract(contractAddress, ERC20_ABI, wallet)
    const decimalsOnChain = Number(await token.decimals())
    if (decimalsOnChain !== expectedDecimals) {
      throw new Error(`decimals mismatch: expected ${expectedDecimals}, got ${decimalsOnChain}`)
    }

    const amountInUnits = ethers.parseUnits(op.usdt_amount_text, decimalsOnChain)
    const balance = await token.balanceOf(wallet.address)
    if (balance < amountInUnits) throw new Error('insufficient MockUSDT balance in hot wallet')
    if ((await provider.getBalance(wallet.address)) <= 0n) {
      throw new Error('insufficient native balance for gas in hot wallet')
    }

    const tx = await token.transfer(op.receiver_wallet, amountInUnits)
    const receipt = await withTimeout(tx.wait(), 180_000)
    const success = receipt.status === 1n

    await admin.from('operations').update({
      status: success ? 'confirmed' : 'failed',
      tx_hash: receipt.hash,
      block_number: receipt.blockNumber,
      gas_used: (receipt as unknown as { gasUsed?: string }).gasUsed ?? null,
      transaction_status: success ? 'success' : 'reverted',
      sender_wallet: wallet.address,
      contract_address: contractAddress,
      error_message: success ? null : 'Transaction reverted',
    }).eq('id', operation_id)

    return json({ ok: true, status: success ? 'confirmed' : 'failed', tx_hash: receipt.hash })
  } catch (err) {
    // Any failure after 'settling' marks the op failed with the reason.
    try {
      const b = await req.clone().json().catch(() => null)
      if (b?.operation_id) {
        await admin.from('operations').update({
          status: 'failed',
          error_message: err instanceof Error ? err.message : String(err),
        }).eq('id', b.operation_id).neq('status', 'confirmed')
      }
    } catch { /* ignore */ }
    return fail(err)
  }
})
```

- [ ] **Step 2: Verify secrets exist** (names only, values never printed):

```powershell
supabase secrets list --project-ref iifcwnumpccoucxggxjb
```

If any of `AMOY_RPC_URL`, `HOT_WALLET_PRIVATE_KEY`, `MOCKUSDT_CONTRACT_ADDRESS`, `MOCKUSDT_DECIMALS` is missing → STOP and ask the owner to set them (`supabase secrets set NAME=value`). Known-good reference for address: `0xcF430Ef1884EBf89F79fC9B9fa445CA85662400a` (from old process-payments); decimals likely 6 but MUST be confirmed against the chain before setting.

- [ ] **Step 3: Deploy + smoke** — deploy as before; anonymous POST `{}` expects 400/401 family, not 500 crash.

- [ ] **Step 4: Commit** `git add supabase/functions/settle-operation; git commit -m "feat: add hot wallet settlement endpoint"`

---

### Task 7: `list-operations`, align `get-operation-status`, retire legacy functions

**Files:**
- Create: `supabase/functions/list-operations/index.ts`
- Modify: `supabase/functions/get-operation-status/index.ts` (response shape only)
- Cloud deletes: `process-payments`, `pix-webhook`, `get-operation`

**Interfaces:**
- `list-operations`: `GET ?limit<=50&before=<iso>` → `200 { ok, operations: [...] , next_before: string|null }`, newest-first, scoped to caller.
- `get-operation-status`: keeps behavior; response becomes `{ ok, operation }` where `operation` omits `request_json` internals except `pix_code`.

- [ ] **Step 1: Implement `list-operations`**

```ts
import { authenticate, adminClient } from '../_shared/auth.ts'
import { fail, handleOptions, HttpError, json } from '../_shared/http.ts'

const COLUMNS = 'id,status,chain,token_symbol,usdt_amount_text,receiver_wallet,sender_wallet,tx_hash,error_message,created_at,updated_at,request_json->pix_code'

Deno.serve(async (req) => {
  const options = handleOptions(req)
  if (options) return options
  if (req.method !== 'GET') return fail(new HttpError(405, 'Method Not Allowed'))
  const admin = adminClient()
  try {
    const { userId } = await authenticate(req, admin)
    const url = new URL(req.url)
    const limitRaw = Number(url.searchParams.get('limit') ?? '20')
    const limit = Math.min(Math.max(Number.isFinite(limitRaw) ? limitRaw : 20, 1), 50)
    const before = url.searchParams.get('before')

    let query = admin
      .from('operations')
      .select(COLUMNS)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit + 1)
    if (before) query = query.lt('created_at', before)

    const { data, error } = await query
    if (error) throw error
    const rows = data ?? []
    const hasMore = rows.length > limit
    const page = hasMore ? rows.slice(0, limit) : rows

    return json({
      ok: true,
      operations: page.map((r) => ({
        id: r.id, status: r.status, chain: r.chain, token_symbol: r.token_symbol,
        usdt_amount_text: r.usdt_amount_text, receiver_wallet: r.receiver_wallet,
        sender_wallet: r.sender_wallet, tx_hash: r.tx_hash, error_message: r.error_message,
        created_at: r.created_at, updated_at: r.updated_at,
        pix_code: (r as Record<string, unknown>)['pix_code'] ?? null,
      })),
      next_before: hasMore ? page[page.length - 1].created_at : null,
    })
  } catch (err) {
    return fail(err)
  }
})
```

- [ ] **Step 2: Align `get-operation-status`** — replace its handler body (keep JOSE-free by switching to shared modules; delete its local `getUserIdFromJwt`):

```ts
import { authenticate, adminClient } from '../_shared/auth.ts'
import { fail, handleOptions, HttpError, json } from '../_shared/http.ts'

const COLUMNS = 'id,user_id,status,chain,token_symbol,usdt_amount_text,wallet_address,request_json->pix_code,tx_hash,error_message,created_at,updated_at,request_id,sender_wallet,receiver_wallet,contract_address,block_number,gas_used,transaction_status'

Deno.serve(async (req) => {
  const options = handleOptions(req)
  if (options) return options
  if (req.method !== 'GET') return fail(new HttpError(405, 'Method Not Allowed'))
  const admin = adminClient()
  try {
    const { userId } = await authenticate(req, admin)
    const id = new URL(req.url).searchParams.get('id')
    if (!id) return fail(new HttpError(400, 'id is required'))
    const { data, error } = await admin
      .from('operations')
      .select(COLUMNS)
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle()
    if (error) throw error
    if (!data) return fail(new HttpError(404, 'Operation not found'))
    return json({ ok: true, operation: data })
  } catch (err) {
    return fail(err)
  }
})
```

- [ ] **Step 3: Deploy both, then delete legacy**

```powershell
supabase functions deploy list-operations --project-ref iifcwnumpccoucxggxjb --no-verify-jwt
supabase functions deploy get-operation-status --project-ref iifcwnumpccoucxggxjb --no-verify-jwt
supabase functions delete process-payments --project-ref iifcwnumpccoucxggxjb
supabase functions delete pix-webhook --project-ref iifcwnumpccoucxggxjb
supabase functions delete get-operation --project-ref iifcwnumpccoucxggxjb
Remove-Item -Recurse -Force supabase/functions/process-payments, supabase/functions/pix-webhook, supabase/functions/get-operation
git rm -r supabase/functions/process-payments supabase/functions/pix-webhook supabase/functions/get-operation
```

- [ ] **Step 4: End-to-end cloud smoke (real money-path proof)**

Temporarily allow instant signup sessions (sandbox has no real users yet), run the full flow, restore:

```powershell
$t = Read-Host 'Supabase access token'
$H = @{ Authorization = "Bearer $t" }
$base = "https://api.supabase.com/v1/projects/iifcwnumpccoucxggxjb"
# 1. snapshot + disable email confirmation
$cfg = Invoke-RestMethod -Uri "$base/config/auth" -Headers $H
$orig = $cfg.mailer_autoconfirm
Invoke-RestMethod -Method Patch -Uri "$base/config/auth" -Headers $H -ContentType 'application/json' -Body '{"mailer_autoconfirm": true}'
try {
  $sb = "https://iifcwnumpccoucxggxjb.supabase.co"
  $email = "smoke-$(Get-Random)@peragus.test"
  $su = Invoke-RestMethod -Method Post -Uri "$sb/auth/v1/signup" -ContentType 'application/json' -Body (@{ email=$email; password="Smoke-Test-123!" } | ConvertTo-Json)
  $jwt = $su.access_token
  $auth = @{ Authorization = "Bearer $jwt"; 'Content-Type'='application/json' }
  $addr = '0x' + ((1..40 | ForEach-Object { '{0:x}' -f (Get-Random -Max 16) }) -join '')
  $op = Invoke-RestMethod -Method Post -Uri "$sb/functions/v1/create-operation" -Headers $auth -Body (@{ amount='10'; receiver_wallet=$addr } | ConvertTo-Json)
  "created: $($op.operation.id) status=$($op.operation.status)"
  Invoke-RestMethod -Method Post -Uri "$sb/functions/v1/confirm-pix" -Headers $auth -Body (@{ operation_id=$op.operation.id } | ConvertTo-Json) | Out-Null
  do {
    Start-Sleep -Seconds 10
    $st = Invoke-RestMethod -Uri "$sb/functions/v1/get-operation-status?id=$($op.operation.id)" -Headers $auth
    "status: $($st.operation.status)"
  } until ($st.operation.status -in @('confirmed','failed'))
  "tx: $($st.operation.tx_hash)"
} finally {
  Invoke-RestMethod -Method Patch -Uri "$base/config/auth" -Headers $H -ContentType 'application/json' -Body (@{ mailer_autoconfirm = $orig } | ConvertTo-Json)
}
```

Expected: `created → pix_confirmed → settling → confirmed` plus an Amoy tx hash. If `failed`, print `error_message` and debug before continuing. This doubles as acceptance criterion 2 evidence.

- [ ] **Step 5: Commit** `git add -A; git commit -m "feat: add list/status endpoints and retire legacy functions"`

---

### Task 8: Front-end session layer (`AuthProvider`, `RequireAuth`, edge caller)

**Files:**
- Create: `src/types/operation.ts`
- Create: `src/lib/functions.ts`
- Create: `src/auth/AuthProvider.tsx`
- Create: `src/auth/RequireAuth.tsx`
- Modify: `src/main.tsx` (wrap `<AuthProvider>` inside BrowserRouter)
- Test: `src/auth/AuthProvider.test.tsx`

**Interfaces:**
- Produces:
  - `useAuth(): { session: Session|null; user: User|null; loading: boolean; signOut(): Promise<void>; signIn(email,password); signUp(email,password); sendReset(email); updatePassword(pw) }` — all returning Supabase SDK results passthrough.
  - `callEdge<T>(name, opts?: { method?; body?; query?: Record<string,string>; apiKey?: string }): Promise<T>`
  - `RequireAuth({ children })` — redirects to `authPath(locale,'login')` preserving locale.

- [ ] **Step 1: Types** `src/types/operation.ts`:

```ts
export const OPERATION_STATUSES = ['created','pix_pending','pix_confirmed','settling','confirmed','failed'] as const
export type OperationStatus = (typeof OPERATION_STATUSES)[number]
export const ACTIVE_STATUSES: OperationStatus[] = ['created','pix_pending','pix_confirmed','settling']

export interface Operation {
  id: string
  status: OperationStatus
  chain: string
  token_symbol: string
  usdt_amount_text: string | null
  receiver_wallet: string | null
  sender_wallet: string | null
  tx_hash: string | null
  error_message: string | null
  created_at: string
  updated_at: string
  pix_code?: string | null
}
```

- [ ] **Step 2: `src/lib/functions.ts`**

```ts
import { supabase, SUPABASE_URL } from '@/lib/supabase'

interface CallOpts {
  method?: 'GET' | 'POST'
  body?: unknown
  query?: Record<string, string>
  apiKey?: string
}

export async function callEdge<T>(name: string, opts: CallOpts = {}): Promise<T> {
  let token = opts.apiKey
  if (!token) {
    const { data } = await supabase.auth.getSession()
    token = data.session?.access_token
  }
  if (!token) throw new Error('unauthenticated')
  const qs = opts.query ? `?${new URLSearchParams(opts.query)}` : ''
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${name}${qs}`, {
    method: opts.method ?? 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ?? '',
      ...(opts.body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  })
  const payload = (await res.json().catch(() => null)) as { error?: string } & T
  if (!res.ok) throw new Error(payload?.error ?? `HTTP ${res.status}`)
  return payload
}
```

- [ ] **Step 3: Failing test** `src/auth/AuthProvider.test.tsx`:

```tsx
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AuthProvider, useAuth } from './AuthProvider'

function Probe() {
  const { loading, user } = useAuth()
  if (loading) return <p>loading</p>
  return <p>{user ? user.email : 'anonymous'}</p>
}

describe('AuthProvider', () => {
  it('starts anonymous when no session exists', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AuthProvider>
          <Probe />
        </AuthProvider>
      </MemoryRouter>,
    )
    await waitFor(() => expect(screen.getByText(/loading|anonymous/)).toBeInTheDocument())
    await waitFor(() => expect(screen.queryByText('loading')).not.toBeInTheDocument())
    expect(screen.getByText('anonymous')).toBeInTheDocument()
  })
})
```

Run `npx vitest run src/auth/AuthProvider.test.tsx` → FAIL (module missing).

- [ ] **Step 4: Implement `src/auth/AuthProvider.tsx`**

```tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthState {
  session: Session | null
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => ReturnType<typeof supabase.auth.signInWithPassword>
  signUp: (email: string, password: string) => ReturnType<typeof supabase.auth.signUp>
  sendReset: (email: string) => ReturnType<typeof supabase.auth.resetPasswordForEmail>
  updatePassword: (password: string) => ReturnType<typeof supabase.auth.updateUser>
  signOut: () => Promise<void>
}

const Ctx = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  const value: AuthState = {
    session,
    user: session?.user ?? null,
    loading,
    signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    signUp: (email, password) => supabase.auth.signUp({ email, password }),
    sendReset: (email) => supabase.auth.resetPasswordForEmail(email),
    updatePassword: (password) => supabase.auth.updateUser({ password }),
    signOut: () => supabase.auth.signOut(),
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth(): AuthState {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth outside AuthProvider')
  return ctx
}
```

- [ ] **Step 5: Implement `src/auth/RequireAuth.tsx`**

```tsx
import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/auth/AuthProvider'
import { authPath, localeFromPathname } from '@/i18n/routing'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()
  const location = useLocation()
  if (loading) {
    return <div className="grid min-h-screen place-items-center text-sm text-secondary">…</div>
  }
  if (!session) {
    const locale = localeFromPathname(location.pathname)
    return <Navigate to={authPath(locale, 'login')} replace state={{ from: location.pathname }} />
  }
  return <>{children}</>
}
```

- [ ] **Step 6: Wire in `src/main.tsx`** — wrap `<App />` with `<AuthProvider>` (inside `BrowserRouter`).

Run tests → PASS. Full suite green.

- [ ] **Step 7: Commit** `git add -A; git commit -m "feat: add session provider and edge function client"`

---

### Task 9: Login and Register pages with dictionaries

**Files:**
- Create: `src/content/auth/types.ts`, `src/content/auth/pt.ts`, `src/content/auth/es.ts`, `src/content/auth/en.ts`, `src/content/auth/index.ts`
- Create: `src/pages/auth/Login.tsx`, `src/pages/auth/Register.tsx`
- Modify: `src/App.tsx` (routes)
- Test: `src/pages/auth/Login.test.tsx`, `src/pages/auth/Register.test.tsx`

**Interfaces:**
- Consumes: `useAuth`, `authPath`, `homePath`, UI primitives (`Button`, `Input`, `Label`, `Notice`, `Container`, `Surface`), `PageMetadata`.
- Produces: `AuthCard` layout pattern reused by Task 10 (centered card, brand header linking home).

- [ ] **Step 1: Content types + pt dictionary** (`src/content/auth/types.ts`):

```ts
export interface AuthContent {
  seo: { title: string; description: string }
  login: {
    title: string; emailLabel: string; passwordLabel: string; submit: string
    footer: string; footerLink: string; genericError: string
  }
  register: {
    title: string; emailLabel: string; passwordLabel: string; passwordHint: string
    submit: string; footer: string; footerLink: string; successNotice: string; genericError: string
  }
}
```

`pt.ts` fills it (all fields; tone matches site copy, always "MockUSDT" when referenced). `index.ts`: `export const authContent: Record<Locale, AuthContent> = { pt, es, en }`.

Write **complete** `pt.ts`, `es.ts`, `en.ts` — every field translated, none omitted (reviewer rejects partial locales).

- [ ] **Step 2: Failing tests**

`Login.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const signIn = vi.fn()
vi.mock('@/auth/AuthProvider', () => ({ useAuth: () => ({ signIn, loading: false, user: null }) }))
vi.mock('@/lib/supabase', () => ({ supabase: {}, SUPABASE_URL: 'https://x.supabase.co' }))

import { Login } from './Login'

describe('Login', () => {
  beforeEach(() => signIn.mockReset())
  it('renders pt labels and submits', async () => {
    const { userEvent } = await import('@testing-library/user-event')
    render(<MemoryRouter><Login locale="pt" /></MemoryRouter>)
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()
    await userEvent.setup().type(screen.getByLabelText(/senha/i), 'secret123')
    await userEvent.setup().click(screen.getByRole('button', { name: /entrar/i }))
    expect(signIn).toHaveBeenCalledWith(expect.any(String), 'secret123')
  })
})
```

`Register.test.tsx` analogous (mock `signUp`; assert weak-password client error notice when typing short password — see validation below). Run → FAIL.

- [ ] **Step 3: Implement `Login.tsx`**

```tsx
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthProvider'
import { authContent } from '@/content/auth'
import { authPath, homePath, type Locale } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Notice } from '@/components/ui/notice'
import { PageMetadata } from '@/components/seo/PageMetadata'

export function Login({ locale }: { locale: Locale }) {
  const c = authContent[locale].login
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setBusy(true)
    setError(null)
    const { error: err } = await signIn(String(fd.get('email')), String(fd.get('password')))
    setBusy(false)
    if (err) { setError(c.genericError); return }
    navigate(appPath(locale))
  }

  return (
    <>
      <PageMetadata locale={locale} title={authContent[locale].seo.title} description={authContent[locale].seo.description} canonicalPath={authPath(locale, 'login')} />
      <main id="main-content" tabIndex={-1} className="grid min-h-[80vh] place-items-center py-20">
        <div className="w-full max-w-md">
          <form onSubmit={onSubmit} className="rounded-lg border border-line bg-surface p-8" aria-busy={busy}>
            <h1 className="text-2xl font-semibold">{c.title}</h1>
            {error && <Notice variant="error" className="mt-4">{error}</Notice>}
            <div className="mt-6 space-y-4">
              <div><Label htmlFor="email">{c.emailLabel}</Label><Input id="email" name="email" type="email" required autoComplete="email" className="mt-1.5 min-h-11 w-full" /></div>
              <div><Label htmlFor="password">{c.passwordLabel}</Label><Input id="password" name="password" type="password" required autoComplete="current-password" minLength={8} className="mt-1.5 min-h-11 w-full" /></div>
            </div>
            <Button type="submit" disabled={busy} className="mt-6 w-full">{c.submit}</Button>
            <p className="mt-4 text-center text-sm text-secondary">
              {c.footer}{' '}<Link className="underline underline-offset-4" to={authPath(locale, 'register')}>{c.footerLink}</Link>
            </p>
          </form>
          <p className="mt-4 text-center"><Link className="text-sm text-tertiary underline underline-offset-4" to={homePath(locale)}>{brand.backToHome}</Link></p>
        </div>
      </main>
    </>
  )
}
```

(`brand.backToHome` — add `backToHome: string` to `AuthContent` top level in all three dicts.) Import `appPath` from routing.

`Register.tsx` (full):

```tsx
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthProvider'
import { authContent } from '@/content/auth'
import { appPath, authPath, homePath, type Locale } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Notice } from '@/components/ui/notice'
import { PageMetadata } from '@/components/seo/PageMetadata'

export function Register({ locale }: { locale: Locale }) {
  const c = authContent[locale].register
  const brand = authContent[locale]
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const password = String(fd.get('password'))
    if (password.length < 8) { setError(c.passwordHint); return }
    setBusy(true); setError(null)
    const { data, error: err } = await signUp(String(fd.get('email')), password)
    setBusy(false)
    if (err) { setError(c.genericError); return }
    if (data.session) navigate(appPath(locale))
    else setSent(true) // email verification required
  }

  return (
    <>
      <PageMetadata locale={locale} title={authContent[locale].seo.title} description={authContent[locale].seo.description} canonicalPath={authPath(locale, 'register')} />
      <main id="main-content" tabIndex={-1} className="grid min-h-[80vh] place-items-center py-20">
        <div className="w-full max-w-md">
          {sent ? (
            <div className="rounded-lg border border-line bg-surface p-8">
              <Notice variant="success">{c.successNotice}</Notice>
              <p className="mt-4 text-center"><Link className="text-sm underline underline-offset-4" to={authPath(locale, 'login')}>{c.footerLink}</Link></p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="rounded-lg border border-line bg-surface p-8" aria-busy={busy}>
              <h1 className="text-2xl font-semibold">{c.title}</h1>
              {error && <Notice variant="error" className="mt-4">{error}</Notice>}
              <div className="mt-6 space-y-4">
                <div><Label htmlFor="email">{c.emailLabel}</Label><Input id="email" name="email" type="email" required autoComplete="email" className="mt-1.5 min-h-11 w-full" /></div>
                <div><Label htmlFor="password">{c.passwordLabel}</Label><Input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" aria-describedby="pw-hint" className="mt-1.5 min-h-11 w-full" /><p id="pw-hint" className="mt-1 text-xs text-tertiary">{c.passwordHint}</p></div>
              </div>
              <Button type="submit" disabled={busy} className="mt-6 w-full">{c.submit}</Button>
              <p className="mt-4 text-center text-sm text-secondary">
                {c.footer}{' '}<Link className="underline underline-offset-4" to={authPath(locale, 'login')}>{c.footerLink}</Link>
              </p>
            </form>
          )}
          <p className="mt-4 text-center"><Link className="text-sm text-tertiary underline underline-offset-4" to={homePath(locale)}>{brand.backToHome}</Link></p>
        </div>
      </main>
    </>
  )
}
```

- [ ] **Step 4: Routes in `src/App.tsx`** — inside each locale layout group:

```tsx
<Route path="login" element={<Login locale={locale} />} />
<Route path="register" element={<Register locale={locale} />} />
```

(Auth pages stay inside `MarketingLayout` so header/footer/nav remain.)

Tests → PASS; suite + lint green.

- [ ] **Step 5: Commit** `git add -A; git commit -m "feat: add localized login and register pages"`

---

### Task 10: Password recovery + localized transactional emails

**Files:**
- Create: `src/pages/auth/ForgotPassword.tsx`, `src/pages/auth/ResetPassword.tsx`
- Modify: `src/App.tsx` (routes `recuperar-senha`, `resetar-senha`)
- Extend: `src/content/auth/{pt,es,en}.ts` (forgot/reset sections)
- Test: `src/pages/auth/ForgotPassword.test.tsx`

Cloud action: set localized-enough templates via Management API.

- [ ] **Step 1: Extend `AuthContent`**: add

```ts
forgot: { title: string; emailLabel: string; submit: string; sentNotice: string; backToLogin: string; genericError: string }
reset: { title: string; passwordLabel: string; submit: string; successNotice: string; genericError: string }
```

All three locales fully translated.

- [ ] **Step 2: Failing test** — render `ForgotPassword`, submit email, assert `sendReset` called once with the typed email and `sentNotice` visible. Run → FAIL.

- [ ] **Step 3: Implement both pages.**

`ForgotPassword.tsx` (core):

```tsx
export function ForgotPassword({ locale }: { locale: Locale }) {
  const c = authContent[locale].forgot
  const { sendReset } = useAuth()
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const email = String(new FormData(e.currentTarget).get('email'))
    setBusy(true)
    await sendReset(email, { redirectTo: `${window.location.origin}${authPath(locale, 'resetar-senha')}` })
    setBusy(false)
    setSent(true) // always: no account enumeration
  }
  // form identical in structure to Login's; when `sent`, render <Notice variant="success">{c.sentNotice}</Notice>
}
```

`ResetPassword.tsx` (core): route is OUTSIDE `RequireAuth`; Supabase absorbs the recovery hash into a session automatically (`detectSessionInUrl` default). Render logic:

```tsx
const { session, loading, updatePassword } = useAuth()
// while loading → skeleton; if !session → hint to request a new recovery email (link back to recuperar-senha)
// if session → new-password form:
async function onSubmit(e: FormEvent<HTMLFormElement>) {
  e.preventDefault()
  const fd = new FormData(e.currentTarget)
  const pw = String(fd.get('password'))
  if (pw !== String(fd.get('confirm'))) { setError(c.genericError); return }
  const { error } = await updatePassword(pw)
  if (!error) setDone(true) // successNotice + link to appPath(locale)
}
```

- [ ] **Step 4: Configure email templates via Management API** (single template carries all three languages side by side — Supabase supports one template per type):

```powershell
$t = Read-Host 'Supabase access token'
$base = "https://api.supabase.com/v1/projects/iifcwnumpccoucxggxjb/config/auth/templates"
$html = @'
<h2>Peragus Sandbox</h2>
<p>PT — Confirme seu e-mail clicando: <a href="{{ .ConfirmationURL }}">Confirmar e-mail</a>. Para redefinir sua senha use o mesmo link quando solicitado.</p>
<p>ES — Confirma tu correo haciendo clic: <a href="{{ .ConfirmationURL }}">Confirmar correo</a>.</p>
<p>EN — Confirm your email by clicking: <a href="{{ .ConfirmationURL }}">Confirm email</a>.</p>
'@
Invoke-RestMethod -Method Put -Uri "$base/signup" -Headers @{ Authorization = "Bearer $t" } -ContentType 'application/json' -Body (@{ subject='Peragus Sandbox — confirme seu e-mail / confirma tu correo / confirm your email'; body_html=$html } | ConvertTo-Json)
$recoverHtml = $html -replace '\{\{ \.ConfirmationURL \}\}','{{ .ConfirmationURL }}' # same link semantics
Invoke-RestMethod -Method Put -Uri "$base/recovery" -Headers @{ Authorization = "Bearer $t" } -ContentType 'application/json' -Body (@{ subject='Peragus Sandbox — redefinição de senha / restablecer contraseña / reset your password'; body_html="<h2>Peragus Sandbox</h2><p>PT — Redefina sua senha: <a href=`"{{ .ConfirmationURL }}`">Redefinir</a></p><p>ES — Restablece tu contraseña: <a href=`"{{ .ConfirmationURL }}`">Restablecer</a></p><p>EN — Reset your password: <a href=`"{{ .ConfirmationURL }}`">Reset</a></p>" } | ConvertTo-Json)
```

Verify with `GET $base/signup` / `GET $base/recovery`.

- [ ] **Step 5: Tests PASS, suite green, commit** `git add -A; git commit -m "feat: add password recovery flows and localized email templates"`

---

### Task 11: App shell + Operations (list, detail with polling, new-operation flow)

**Files:**
- Create: `src/components/app/AppLayout.tsx`, `src/components/app/StatusBadge.tsx`, `src/components/app/CopyField.tsx`
- Create: `src/pages/app/Operations.tsx`
- Modify: `src/App.tsx` (nested `/app` routes wrapped in `RequireAuth`)
- Extend: `src/content/app/{types,pt,es,en,index}.ts` (shell nav + operations copy)
- Test: `src/pages/app/Operations.test.tsx`, `src/components/app/StatusBadge.test.tsx`

**Interfaces:**
- Consumes: `callEdge`, `useAuth`, `Operation`/`ACTIVE_STATUSES`, `appPath`.
- Produces: `AppLayout({ locale, children })` with sidebar (Operações, Chaves de API, Documentação, Configurações) + sign-out; `StatusBadge({ status, locale })`; `CopyField({ label, value })`.

- [ ] **Step 1: `StatusBadge` + failing test** — maps status→variant: `confirmed`→success, `failed`→error, others→neutral; label from dictionary (`content.app[locale].statuses[status]`). Test asserts all six statuses render correct label/variant. FAIL first.

```tsx
import { cn } from '@/i18n/utils'
import type { Locale } from '@/i18n/routing'
import { content as appContent } from '@/content/app'
import type { OperationStatus } from '@/types/operation'

const VARIANT: Record<OperationStatus, string> = {
  confirmed: 'bg-mint/15 text-mint border-mint/30',
  failed: 'bg-red-500/10 text-red-400 border-red-500/30',
  created: 'bg-surface text-secondary border-line',
  pix_pending: 'bg-surface text-secondary border-line',
  pix_confirmed: 'bg-amber-400/10 text-amber-300 border-amber-400/30',
  settling: 'bg-sky-400/10 text-sky-300 border-sky-400/30',
}

export function StatusBadge({ status, locale }: { status: OperationStatus; locale: Locale }) {
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-xs uppercase tracking-wide', VARIANT[status])}>
      {appContent[locale].statuses[status]}
    </span>
  )
}
```

- [ ] **Step 2: `AppLayout`** — semantic landmarks: `<div class="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">`, `<aside>` nav (links via `NavLink` with `aria-current` styling, `min-h-11` items), `<header>` inside main with page title slot + user email + sign-out button, `<main id="main-content" tabIndex={-1}>`. Mobile: sidebar becomes horizontal scrollable top nav (no blur). Sign-out → `signOut()` → `navigate(homePath(locale))`.

- [ ] **Step 3: `CopyField`** — readonly input + button (`aria-label` from dict "Copiar"); copies via `navigator.clipboard.writeText`; shows transient "copiado" state. Touch target `min-h-11`.

- [ ] **Step 4: Failing `Operations.test.tsx`** — mock `callEdge` resolving `{ ok:true, operations:[twoOps], next_before:null }`; assert table renders amounts/statuses; click row → detail panel shows `pix_code` CopyField for a `created` op and tx link for `confirmed` op; "nova operação" button reveals form; submitting calls `callEdge('create-operation', …)` once with parsed values. Run → FAIL.

- [ ] **Step 5: Implement `Operations.tsx`** — three subviews in one page (list / detail / new):

Data hooks:

```tsx
const PAGE_SIZE = 20
function useOperations() {
  const [ops, setOps] = useState<Operation[]>([])
  const [nextBefore, setNextBefore] = useState<string | null>(null)
  const [state, setState] = useState<'idle'|'loading'|'error'>('loading')
  const load = useCallback(async () => {
    setState('loading')
    try {
      const res = await callEdge<{ operations: Operation[]; next_before: string | null }>('list-operations', { query: { limit: String(PAGE_SIZE) } })
      setOps(res.operations); setNextBefore(res.next_before); setState('idle')
    } catch { setState('error') }
  }, [])
  useEffect(() => { void load() }, [load])
  return { ops, nextBefore, state, reload: load, setOps }
}

function usePolling(active: boolean, tick: () => void, ms = 5000) {
  useEffect(() => {
    if (!active) return
    const id = setInterval(tick, ms)
    return () => clearInterval(id)
  }, [active, tick, ms])
}
```

Detail panel: while selected op status ∈ ACTIVE_STATUSES, poll `get-operation-status?id=` every 5s and patch state; stop on terminal. Show: amount (`usdt_amount_text` + "MockUSDT"), wallets truncated mono, `pix_code` via `CopyField` when present, `tx_hash` as `https://amoy.polygonscan.com/tx/{hash}` link, `error_message` in destructive Notice.

New operation form: amount (`inputMode="decimal"`, regex `^\d+(\.\d{1,2})?$`), receiver wallet (regex `^0x[a-fA-F0-9]{40}$`), optional request_id (uuid auto-filled client-side via `crypto.randomUUID()` for retry safety). Submit → `callEdge('create-operation',{method:'POST',body})` → select returned op → refresh list. Errors surface in Notice (map common messages via dict).

Brand guardrail: token column/header literally renders `token_symbol` from API (always MOCKUSDT) and static copy never says USDT.

- [ ] **Step 6: Routes** — nested under locale layouts:

```tsx
<Route path="app" element={<RequireAuth><AppLayout locale={locale}><Outlet /></AppLayout></RequireAuth>}>
  <Route index element={<Operations locale={locale} />} />
  {/* Tasks 12–13 add siblings */}
</Route>
```

Tests → PASS; suite/lint/build green.

- [ ] **Step 7: Manual smoke (dev server)** — register a real user through the running app, confirm email from inbox, log in, land on `/app`, create a real 10-MockUSDT operation to the smoke address, watch it settle on PolygonScan Amoy. Screenshot for the user. (This exercises criteria 1–2 end to end through real UI.)

- [ ] **Step 8: Commit** `git add -A; git commit -m "feat: add app shell and operations workflow"`

---

### Task 12: API keys management page

**Files:**
- Create: `src/pages/app/ApiKeys.tsx`
- Modify: `src/App.tsx` (route `chaves-api`)
- Extend: `src/content/app/*` (apiKeys section)
- Test: `src/pages/app/ApiKeys.test.tsx`

**Interfaces:**
- Consumes: `supabase` client direct queries (`from('api_keys')`, `rpc('create_api_key')`) — RLS-scoped; `Callout`-style modal for one-time key reveal.
- Produces: page at `appPath(locale,'chaves-api')`.

- [ ] **Step 1: Failing test** — mock `supabase.from('api_keys').select()` chain resolving two rows; assert list renders name/prefix/date; clicking "criar" mocks `rpc('create_api_key',{p_name:'ci'})` resolving `{ id, key:'pk_live_abc…', key_prefix, name, created_at }`; assert modal shows the RAW key exactly once and a warning line; closing clears raw key from state (assert subsequent render lacks it). Run → FAIL.

- [ ] **Step 2: Implement** (full component logic):

```tsx
interface ApiKeyRow { id: string; name: string; key_prefix: string; last_used_at: string | null; revoked_at: string | null; created_at: string }

export function ApiKeys({ locale }: { locale: Locale }) {
  const c = appContent[locale].apiKeys
  const [rows, setRows] = useState<ApiKeyRow[] | null>(null)
  const [revealed, setRevealed] = useState<{ key: string; name: string } | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  async function load() {
    const { data } = await supabase.from('api_keys').select('*').order('created_at', { ascending: false })
    setRows((data ?? []) as ApiKeyRow[])
  }
  useEffect(() => { void load() }, [])

  async function create(name: string) {
    const { data, error } = await supabase.rpc('create_api_key', { p_name: name })
    if (!error && data?.[0]) {
      setRevealed({ key: data[0].key as string, name }) // raw key lives in state ONLY until modal closes
      void load()
    }
  }

  async function revoke(id: string) {
    await supabase.from('api_keys').update({ revoked_at: new Date().toISOString() }).eq('id', id)
    setConfirmId(null)
    void load()
  }
  // Render: table (name | key_prefix mono | created date | last_used | chip ativa/revogada | revogar button w/ inline two-step confirm via confirmId)
  // "criar chave" opens small form (name input) -> create()
  // When revealed != null render radix Dialog (focus-trapped): heading with name,
  //   <p>{c.revealWarning}</p> (destructive tone), <CopyField value={revealed.key} />,
  //   close button calls setRevealed(null) — raw key then gone from state/render.
}
```

- [ ] **Step 3: Wire route** `<Route path="chaves-api" element={<ApiKeys locale={locale} />} />` inside app layout; add sidebar entry. Tests PASS; suite green.

- [ ] **Step 4: Real-key smoke** — create a key named `smoke` in the UI, then prove API-key auth works against the cloud:

```powershell
$k = Read-Host 'cole a chave pk_live_'
curl.exe -s "https://iifcwnumpccoucxggxjb.supabase.co/functions/v1/list-operations?limit=3" -H "Authorization: Bearer $k"
```

Expected: `{"ok":true,"operations":[…]}` — acceptance criterion 4 evidence.

- [ ] **Step 5: Commit** `git add -A; git commit -m "feat: add api key management"`

---

### Task 13: Settings page

**Files:**
- Create: `src/pages/app/Settings.tsx`
- Modify: `src/App.tsx`, `src/components/app/AppLayout.tsx` (nav entry)
- Extend: `src/content/app/*` (settings section)
- Test: `src/pages/app/Settings.test.tsx`

- [ ] **Step 1: Failing test** — renders signed-in email (mock `useAuth`), change-password form with mismatched inputs shows dict error and never calls `updatePassword`; matching inputs call it and show success notice. FAIL first.

- [ ] **Step 2: Implement** — read-only email field (`<Input value={user?.email ?? ''} readOnly aria-label={c.emailLabel} />`); new password + confirm inputs (≥8 chars, equality checked client-side before any call); submit handler:

```tsx
async function onSubmit(e: FormEvent<HTMLFormElement>) {
  e.preventDefault()
  const fd = new FormData(e.currentTarget)
  const pw = String(fd.get('password'))
  if (pw.length < 8 || pw !== String(fd.get('confirm'))) { setError(c.mismatchError); return }
  setBusy(true)
  const { error } = await updatePassword(pw)
  setBusy(false)
  setError(error ? c.genericError : null)
  if (!error) setDone(true)
}
```

Success/failure Notices; sign-out button reusing the shell's `signOut` flow. Bank/Pix data explicitly absent (future phase per spec).

- [ ] **Step 3: Wire route + nav; tests PASS; commit** `git add -A; git commit -m "feat: add account settings page"`

---

### Task 14: `/docs` — MDX pipeline, trilingual content, public page

**Files:**
- Create: `src/content/docs/docs.pt.mdx`, `src/content/docs/docs.es.mdx`, `src/content/docs/docs.en.mdx`
- Create: `src/pages/Docs.tsx`
- Create: `src/types/mdx.d.ts`
- Modify: `vite.config.ts`, `src/App.tsx`, `src/components/layout/Header.tsx` (nav "Docs" link)
- Test: `src/pages/Docs.test.tsx`; E2E: `e2e/docs.spec.ts`

- [ ] **Step 1: Install + configure MDX**

```powershell
npm install -D "@mdx-js/rollup" "remark-gfm" "@types/mdx"
```

`vite.config.ts` — MDX plugin BEFORE react, filtered to `.mdx`:

```ts
import mdx from '@mdx-js/rollup'
import remarkGfm from 'remark-gfm'
// plugins: [
//   { enforce: 'pre', plugin: mdx({ remarkPlugins: [remarkGfm] }) },
//   react(), tailwindcss(),
// ]
```

`src/types/mdx.d.ts`: `declare module '*.mdx' { import type { ComponentType } from 'react'; export const MDXContent: ComponentType; const _default: ComponentType; export default _default }`

- [ ] **Step 2: Write `docs.pt.mdx` (source of truth), then translate to `docs.es.mdx` / `docs.en.mdx`** — identical structure, all three complete. Sections:

1. H1 + intro (rede de teste Amoy disclaimer, MockUSDT naming)
2. Autenticação — two tabs-style subsections: sessão (JWT) vs chave de API (`Authorization: Bearer pk_live_…`), how to create a key in the dashboard
3. Criar operação — `curl -X POST https://iifcwnumpccoucxggxjb.supabase.co/functions/v1/create-operation` with body `{ "amount": "10", "receiver_wallet": "0x…" , "request_id": "uuid-opcional" }` + response example + Pix code explanation
4. Confirmar Pix simulado — `confirm-pix` example
5. Consultar status — `get-operation-status?id=` + status table (`created|pix_pending|pix_confirmed|settling|confirmed|failed` with meanings)
6. Listar operações — `list-operations?limit=&before=`
7. Erros — table of `{ error }` codes/messages (401/404/409/400 examples from the actual implementations above)
8. Rodapé — PolygonScan Amoy explorer link; aviso sandbox

Fenced bash/json blocks throughout; base URL literal `https://iifcwnumpccoucxggxjb.supabase.co`.

- [ ] **Step 3: Failing `Docs.test.tsx`** — renders `DocsPage locale="pt"` inside MemoryRouter; asserts H1 present and at least one `pre code` block; same for es/en asserting localized H1 strings differ. FAIL first.

- [ ] **Step 4: Implement `Docs.tsx`**

```tsx
import { lazy, Suspense } from 'react'
import type { Locale } from '@/i18n/routing'
import { docsPath, homePath } from '@/i18n/routing'
import { PageMetadata } from '@/components/seo/PageMetadata'

const modules = {
  pt: lazy(() => import('@/content/docs/docs.pt.mdx')),
  es: lazy(() => import('@/content/docs/docs.es.mdx')),
  en: lazy(() => import('@/content/docs/docs.en.mdx')),
} as const

export function DocsPage({ locale }: { locale: Locale }) {
  const Body = modules[locale]
  // Define alongside: const docsTitles: Record<Locale, string> = { pt: 'Documentação | Peragus', es: 'Documentación | Peragus', en: 'Documentation | Peragus' }
  // and docsDescriptions likewise (one sentence per locale; no product claims).
  return (
    <>
      <PageMetadata locale={locale} title={docsTitles[locale]} description={docsDescriptions[locale]} canonicalPath={docsPath(locale)} alternates={{ pt: docsPath('pt'), es: docsPath('es'), en: docsPath('en') }} />
      <main id="main-content" tabIndex={-1} className="py-20">
        <div className="mx-auto max-w-3xl px-4 [&_a]:underline [&_a]:underline-offset-4 [&_code]:rounded [&_code]:bg-surface [&_code]:px-1 [&_code]:font-mono [&_code]:text-xs [&_h1]:text-4xl [&_h1]:font-semibold [&_h1]:tracking-tight [&_h2]:mt-12 [&_h2]:border-t [&_h2]:border-line [&_h2]:pt-8 [&_h2]:text-2xl [&_h2]:font-semibold [&_li]:my-1 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-4 [&_p]:leading-7 [&_pre]:my-6 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-line [&_pre]:bg-surface [&_pre]:p-4 [&_table]:my-4 [&_table]:w-full [&_td]:border-line [&_td]:border [&_td]:p-2 [&_th]:border-line [&_th]:border [&_th]:bg-surface [&_th]:p-2 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6">
          <Suspense fallback={<p className="text-secondary">…</p>}><Body /></Suspense>
        </div>
      </main>
    </>
  )
}
```

Route: `<Route path="docs" element={<DocsPage locale={locale} />} />` in each locale group (public). Header/Footer nav gains "Docs"/localized label pointing to `docsPath`.

- [ ] **Step 5: E2E `e2e/docs.spec.ts`** — mirror `home.spec.ts` conventions:

```ts
import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

for (const [locale, path, h1] of [['pt', '/docs', /Documentação/i], ['es', '/es/docs', /Documentación/i], ['en', '/en/docs', /Documentation/i]] as const) {
  test(`docs renders in ${locale}`, async ({ page }) => {
    const errors: string[] = []
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
    await page.goto(path)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(h1)
    await expect(page.locator('pre code').first()).toBeVisible()
    expect(errors).toEqual([])
    const axe = await new AxeBuilder({ page }).analyze()
    expect(axe.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')).toEqual([])
  })
}
```

Run `npm run test:e2e` → all pass (12 prior + 3 new = 15 across 3 projects… note: count scales ×3 viewports).

- [ ] **Step 6: Commit** `git add -A; git commit -m "feat: add trilingual mdx documentation"`

---

### Task 15: Final gates, DOM audit, cleanup handoff

**Files:** none new — verification only. Fixes loop back into owning tasks.

- [ ] **Step 1: Full gates**

```powershell
npm test; npm run lint; npm run build; npm run test:e2e
```

All green (fix failures in-place before proceeding).

- [ ] **Step 2: DOM audit across `/`, `/es`, `/en`, `/docs`, `/es/docs`, `/en/docs`, `/pt login` equivalents** — reuse `.superpowers/dom-audit.mjs` pattern (overflow-x, console errors, backdrop-blur classes, touch targets, forbidden claim words: scan rendered text for /\bUSDT\b/ excluding "MockUSDT"). Fix violations at source.

- [ ] **Step 3: Cloud inventory check**

```powershell
supabase functions list --project-ref iifcwnumpccoucxggxjb
```

Expected exactly five ACTIVE functions: `create-operation`, `confirm-pix`, `settle-operation`, `list-operations`, `get-operation-status`.

- [ ] **Step 4: Security handoff notes to owner** (message, not file):
  1. Revoke BOTH exposed personal access tokens: `sbp_ee2b7ce8…` and `sbp_0999cbd8…` (account → access tokens) and issue a fresh one privately.
  2. Consider rotating `HOT_WALLET_PRIVATE_KEY` since it predates this hardening (its exposure risk unchanged, but rotation is cheap on testnet).
  3. Legal review of "Minuta editorial 0.1" remains outstanding — docs/pages make no new promises.

- [ ] **Step 5: Final commit if fixes occurred**; report summary: commits list, gate outputs, smoke evidences (Amoy tx hash, API-key curl), remaining human actions.
