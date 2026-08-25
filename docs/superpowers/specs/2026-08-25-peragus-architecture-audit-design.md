# Peragus — Auditoria Arquitetural e Plano de Correções

**Data:** 2026-08-25
**Status:** Draft
**Stack:** React 19 + Vite 8 + Supabase Edge Functions (Deno) + PostgreSQL 17 + Polygon Amoy

---

## 1. Resumo

Auditoria completa do projeto Peragus (sandbox B2B para pagamentos Pix → MockUSDT). Identificadas **2 vulnerabilidades críticas**, **5 altas**, **5 médias** e **4 baixas**. O bug de confirmação de email está na configuração do Supabase remoto, não no código. A arquitetura atual (SPA + Edge Functions) é adequada para o estágio — não é necessário reescrever em DDD ou Modular Monolith.

---

## 2. Arquitetura Atual

```
Frontend (Vercel) → Edge Functions (Supabase Deno) → PostgreSQL → Polygon Amoy
```

- **Frontend:** React 19, TypeScript 6, Vite 8, React Router 7, Tailwind 4
- **Backend:** Supabase Edge Functions (5 functions ativas + 5 legadas vazias)
- **Banco:** PostgreSQL 17 via Supabase, 2 tabelas (`operations`, `api_keys`)
- **Auth:** Supabase Auth (JWT + API Keys com hash SHA-256)
- **Blockchain:** ethers.js 6, Polygon Amoy, MockUSDT ERC-20
- **Deploy:** Vercel (frontend), Supabase (backend + DB)

---

## 3. Problemas Identificados

### CRÍTICOS

| # | Problema | Arquivo | Risco |
|---|---------|---------|-------|
| C1 | `settle-operation` sem autenticação | `supabase/functions/settle-operation/index.ts:26` | Qualquer pessoa com a URL pode transferir MockUSDT da hot wallet |
| C2 | Chave API Resend real em `.env.txt` | `.env.txt:7` | Se commitada, chave de email exposta |

### ALTOS

| # | Problema | Arquivo | Risco |
|---|---------|---------|-------|
| A1 | Sem Security Headers | `vercel.json` | Clickjacking, MIME sniffing |
| A2 | CORS `*` em Edge Functions | `_shared/http.ts:2` | Sites maliciosos interagem |
| A3 | Rate limit in-memory por isolate | `_shared/http.ts:24-35` | Ineficaz em Edge distribuído |
| A4 | `confirm-pix` repassa Authorization header | `confirm-pix/index.ts:49` | API Key do usuário exposta para function interna |
| A5 | `operations` sem RLS habilitado | `migrations/...sql` | Acesso via PostgREST sem isolamento |

### MÉDIOS

| # | Problema | Arquivo | Risco |
|---|---------|---------|-------|
| M1 | `settle-operation` sem rate limit | `settle-operation/index.ts` | Abuso de gas/hot wallet |
| M2 | Gas check binário (`<= 0n`) | `settle-operation/index.ts:80` | Falha sem aviso |
| M3 | `minimum_password_length = 6` | `config.toml:182` | Senhas fracas |
| M4 | `secure_password_change = false` | `config.toml:228` | Troca sem reautenticação |
| M5 | Bug email confirmation | Configuração Supabase remoto | Usuários bloqueados |

### BAIXOS

| # | Problema | Arquivo | Risco |
|---|---------|---------|-------|
| B1 | RPC sem timeout | `settle-operation/index.ts:63-72` | Function pode travar |
| B2 | Sessão em localStorage | `src/lib/supabase.ts` | Padrão Supabase, XSS mitigado |
| B3 | Código legado vazio | `supabase/functions/get-operation/` | Código morto |
| B4 | Double-spend risk no settle stale | `settle-operation/index.ts:52-57` | Tx anterior pode estar pendente |

---

## 4. Bug de Confirmação de Email — Análise

### Causa raiz

O `config.toml` local tem `enable_confirmations = false`. Porém, o **Supabase remoto** (`iifcwnumpccoucxggxjb`) provavelmente tem `enable_confirmations = true`.

Quando habilitado no remoto:
1. `signUp()` cria usuário mas **não retorna sessão** (`data.session = null`)
2. Supabase envia email de confirmação
3. Frontend mostra mensagem de sucesso mas **não há sessão**
4. Usuário não consegue logar — `signInWithPassword()` retorna erro

### Solução

**Desabilitar `enable_confirmations` no dashboard do Supabase remoto:**
1. Acessar https://supabase.com/dashboard/project/iifcwnumpccoucxggxjb/auth/settings
2. Em "Email" → desmarcar "Enable email confirmations"
3. Em produção → reabilitar

**Alternativa (código):** Não é possível forçar pelo código — o Supabase Auth decide no backend se retorna sessão ou não.

---

## 5. Arquitetura Recomendada

### Decisão: Manter SPA + Edge Functions

**Justificativa:**
- A arquitetura atual funciona e é adequada para MVP
- Supabase Edge Functions já resolvem serverless, auth, banco
- Reescrever em DDD/Modular Monolith seria overengineering
- O `_shared/` já funciona como módulo compartilhado

### Mudanças necessárias (não reescrita)

1. **Segurança:** Corrigir vulnerabilidades críticas e altas
2. **Validação:** Adicionar Zod para schemas de entrada
3. **RLS:** Habilitar na tabela `operations`
4. **Audit log:** Adicionar tabela append-only
5. **Rate limit:** Tornar distribuído
6. **Idempotência:** Adicionar em `confirm-pix`
7. **Blockchain:** Isolar melhor settle-operation

---

## 6. O que NÃO implementar agora

- DDD com layers Domain/Application/Infrastructure
- Modular Monolith com shared module system
- AWS SQS/SNS/EventBridge (Supabase `waitUntil` já resolve)
- AWS Lambda (já temos Edge Functions)
- Terraform/CDK (Supabase + Vercel gerenciam infra)
- Kafka/RabbitMQ
- Kubernetes
- Redis (usar Supabase RPC para rate limit)
- Double-entry ledger
- Transactional Outbox
- WAF dedicado
- API Gateway externo
- Complex RBAC
- Multi-tenancy por schema/database

---

## 7. Plano de Correções

### FASE 1 — Correções Críticas

#### 1.1 Corrigir settle-operation (autenticação interna)
- **Objetivo:** Adicionar autenticação ao endpoint settle-operation
- **Arquivos afetados:** `supabase/functions/settle-operation/index.ts`
- **Alteração:** Adicionar verificação de header secreto interno (ex: `x-internal-secret`) que deve ser configurado como Supabase Secret e verificado na function
- **Alternativa:** Usar `Authorization: Bearer <service_role_key>` mas isso expõe a key no header
- **Melhor opção:** Criar um Supabase Secret `INTERNAL_SETTLE_SECRET` e verificar no settle-operation
- **Critério:** Settle-operation rejeita requisições sem o header secreto

#### 1.2 Corrigir confirm-pix (não repassar Authorization)
- **Objetivo:** Não expor API Key do usuário para settle-operation
- **Arquivos afetados:** `supabase/functions/confirm-pix/index.ts`
- **Alteração:** No fire-and-forget, usar header interno em vez de repassar Authorization do caller
- **Critério:** confirm-pix chama settle-operation com header interno, não com Authorization do usuário

#### 1.3 Rotacionar RESEND_API_KEY
- **Objetivo:** Rotacionar chave exposta
- **Arquivos afetados:** `.env.txt` (deletar), Supabase Secrets (atualizar)
- **Alteração:** Deletar `.env.txt`, gerar nova chave no Resend, atualizar no Supabase
- **Critério:** `.env.txt` não existe mais, chave antiga não funciona

#### 1.4 Habilitar RLS na tabela operations
- **Objetivo:** Isolamento de dados por tenant
- **Arquivos afetados:** Nova migration SQL
- **Alteração:** `ALTER TABLE operations ENABLE ROW LEVEL SECURITY;` + policies por `user_id`
- **Critério:** Usuário autenticado só vê suas próprias operações via PostgREST

#### 1.5 Corrigir email confirmation
- **Objetivo:** Permitir cadastro sem confirmação durante desenvolvimento
- **Arquivos afetados:** Configuração do Supabase remoto (dashboard)
- **Alteração:** Desabilitar `enable_confirmations` no dashboard
- **Critério:** Usuário cria conta e recebe sessão imediatamente

### FASE 2 — Segurança Fundamental

#### 2.1 Security Headers
- **Objetivo:** Proteger contra clickjacking, MIME sniffing, downgrade
- **Arquivos afetados:** `vercel.json`
- **Alteração:** Adicionar headers X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, HSTS
- **Critério:** Headers presentes em todas as respostas

#### 2.2 Restringir CORS
- **Objetivo:** Limitar origens permitidas
- **Arquivos afetados:** `supabase/functions/_shared/http.ts`
- **Alteração:** Em vez de `*`, usar `https://peragus.com.br` (ou configuração por ambiente)
- **Critério:** Apenas o domínio do Peragus pode fazer chamadas

#### 2.3 Rate Limit Distribuído
- **Objetivo:** Rate limit que funcione em Edge Functions distribuídas
- **Arquivos afetados:** `supabase/functions/_shared/http.ts`
- **Alternativa 1:** Usar Supabase RPC com counter (atomic update)
- **Alternativa 2:** Usar tabela `rate_limits` com UNIQUE constraint + upsert
- **Critério:** Rate limit persiste entre isolates

#### 2.4 Validação com Zod
- **Objetivo:** Validação robusta de entrada
- **Arquivos afetados:** Nova pasta `_shared/validation.ts`, todas as Edge Functions
- **Alteração:** Criar schemas Zod para cada endpoint
- **Critério:** Todo input validado via schema antes de processar

#### 2.5 Senhas mais fortes
- **Objetivo:** Aumentar segurança de senhas
- **Arquivos afetados:** `supabase/config.toml`
- **Alteração:** `minimum_password_length = 8`, `secure_password_change = true`
- **Critério:** Senhas com menos de 8 caracteres são rejeitadas

### FASE 3 — Fintech Safety

#### 3.1 Audit Log
- **Objetivo:** Trilha append-only para operações financeiras
- **Arquivos afetados:** Nova migration SQL, Edge Functions
- **Tabela:** `audit_log (id, user_id, organization_id, action, resource_type, resource_id, metadata, created_at)`
- **Eventos:** PAYMENT_CREATED, PAYMENT_CONFIRMED, SETTLEMENT_STARTED, SETTLEMENT_COMPLETED, SETTLEMENT_FAILED
- **Critério:** Toda mutação financeira gera entrada no audit_log

#### 3.2 State Machine Explícita
- **Objetivo:** Garantir transições válidas de estado
- **Arquivos afetados:** `_shared/operations.ts` (novo)
- **Alteração:** Função `validTransition(from, to)` que valida se a transição é permitida
- **Critério:** Transições inválidas são rejeitadas com erro claro

#### 3.3 Idempotência em confirm-pix
- **Objetivo:** Evitar dupla confirmação
- **Arquivos afetados:** `supabase/functions/confirm-pix/index.ts`
- **Alteração:** Verificar status antes de atualizar (já faz parcialmente, melhorar)
- **Critério:** Dupla chamada com mesmo operation_id retorna conflito 409

#### 3.4 Double-spend prevention no settle stale
- **Objetivo:** Não reenviar se tx anterior está pendente
- **Arquivos afetados:** `supabase/functions/settle-operation/index.ts`
- **Alteração:** Antes de reenviar, verificar se há tx_hash na operação e se a tx foi confirmada/revertida
- **Critério:** Se operação tem tx_hash, não reenvia automaticamente

### FASE 4 — Observabilidade

#### 4.1 Health Check
- **Objetivo:** Endpoint para verificar status do sistema
- **Arquivos afetados:** Nova Edge Function `health-check`
- **Critério:** Retorna status do banco e configurações

#### 4.2 Logging Estruturado
- **Objetivo:** Logs consistentes para debugging
- **Arquivos afetados:** `_shared/http.ts`, todas as Edge Functions
- **Alteração:** Função `log(level, message, context)` com requestId, userId, etc.
- **Critério:** Todos os erros logados com contexto

#### 4.3 Timeout para RPC
- **Objetivo:** Evitar que chamadas RPC travem a function
- **Arquivos afetados:** `supabase/functions/settle-operation/index.ts`
- **Alteração:** Adicionar timeout de 30s para chamadas RPC
- **Critério:** RPC timeout gera erro claro, não trava

### FASE 5 — Testes

#### 5.1 Testes de Segurança
- **Objetivo:** Validar proteções implementadas
- **Critérios:**
  - settle-operation sem auth → 401
  - settle-operation com auth inválida → 401
  - Usuário A não vê operações do usuário B
  - Rate limit retorna 429
  - Input inválido retorna 400
  - Webhook duplicado não causa operação duplicada

#### 5.2 Testes de Finance Safety
- **Objetivo:** Garantir consistência financeira
- **Critérios:**
  - Request duplicada com mesmo request_id retorna operação existente
  - confirm-pix com status inválido retorna 409
  - settle-operation não reenvia se tx está pendente

---

## 8. Configuração do Supabase (Email Confirmation)

### Onde acessar
https://supabase.com/dashboard/project/iifcwnumpccoucxggxjb/auth/settings

### Configuração atual (provavelmente)
```
Enable email confirmations: ✅ (HABILITADO)
```

### Configuração para desenvolvimento
```
Enable email confirmations: ❌ (DESABILITADO)
```

### Configuração para produção
```
Enable Confirmations: ✅ (HABILITADO)
```

### Impacto
- Com `enable_confirmations = false`: `signUp()` retorna sessão imediatamente
- Com `enable_confirmations = true`: `signUp()` envia email, sessão é null

---

## 9. Checklist

- [ ] settle-operation com autenticação interna
- [ ] confirm-pix não repassa Authorization header
- [ ] RESEND_API_KEY rotacionada
- [ ] .env.txt deletado
- [ ] RLS habilitado em operations
- [ ] Email confirmation desabilitada no Supabase remoto
- [ Security Headers no vercel.json
- [ ] CORS restrito ao domínio
- [ ] Rate limit distribuído
- [ ] Validação Zod nas Edge Functions
- [ ] minimum_password_length = 8
- [ ] Audit log table criada
- [ ] State machine explícita
- [ ] Idempotência em confirm-pix
- [ ] Double-spend prevention
- [ ] Health check endpoint
- [ ] Logging estruturado
- [ ] Timeout para RPC
- [ ] Testes de segurança
- [ ] Testes de finance safety
