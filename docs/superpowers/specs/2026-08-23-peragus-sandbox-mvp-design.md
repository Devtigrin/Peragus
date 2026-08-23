# Spec: Peragus Sandbox MVP (auth + API keys + docs + operações MockUSDT)

**Data:** 2026-08-23
**Status:** Rascunho para revisão
**Predecessora:** [Redesign B2B do site](./2026-08-23-peragus-b2b-website-redesign-design.md)

## Missão

Transformar o site institucional B2B em plataforma: usuários se registram, criam
operações de compra de MockUSDT pagas via Pix simulado, recebem os tokens na
carteira na rede de teste Polygon Amoy, gerenciam chaves de API e consultam
documentação funcional — tudo em pt/es/en.

## Restrições globais (herdadas do redesign — continuam válidas)

- **Marca:** o token do sandbox é sempre "MockUSDT"; nunca descrito como "USDT"
  ou como lastreado em nada. Sem promessas de lastro, resgate ou paridade.
- **Idiomas:** pt/es/en obrigatório em toda tela nova, reutilizando
  `src/i18n/routing.ts` e o sistema de dicionários existente.
- **Acessibilidade:** contraste AA, touch targets ≥44px, foco visível.
- **Sem efeitos proibidos:** backdrop-blur, animações decorativas pesadas.
- **Legal:** minutas legais ("Minuta editorial 0.1") seguem pendentes de revisão
  externa; telas novas não criam novas promessas jurídicas.

## Estado atual (ativos existentes no Supabase `iifcwnumpccoucxggxjb`)

### Tabelas

- `operations`: 24 colunas (id, user_id, status, chain, token_symbol, amount,
  wallet_address, request_json, tx_hash, error_message, created_at, updated_at,
  request_id, usdt_amount_text, sender_wallet, receiver_wallet,
  contract_address, block_number, gas_used, transaction_status, metadata…).
  CHECK de status atual: `pending|submitted|confirmed|failed`.
- `profiles`: existe; colunas a confirmar durante implementação.

### Edge Functions (duas gerações, todas verify_jwt=true)

| Geração | Função | Papel | Problema |
|---|---|---|---|
| Antiga | `create-operation` | cria op pending | `token_symbol: "USDT"` viola marca |
| Antiga | `get-operation` | GET por id | padrão antigo |
| Antiga | `process-payments` | liquida lote status=paid | usa colunas inexistentes (`buyer_address`, `tx_explorer_url`); vocabulário de status fora do CHECK |
| Antiga | `pix-webhook` | marca op paid | sem validação de assinatura; inacessível a provedores externos (verify_jwt) |
| Nova | `peragus_mockusdt_transfer` | cria op + liquida async (JWKS, validação rigorosa) | referência de qualidade |
| Nova | `peragus_get_operation_status` | GET por id (JWKS) | referência de qualidade |

### Hot wallet

Carteira MetaMask do dono já configurada nos segredos (`PRIVATE_KEY` /
`HOT_WALLET_PRIVATE_KEY`); é dela que saem os MockUSDT para a carteira do
cliente em cada settlement.

## Decisões travadas com o dono do projeto

1. **Escopo fase 1:** MVP completo — auth email+senha com verificação, API
   keys, `/docs` MDX pt/es/en, fluxo COMPLETO de operações (criar → Pix
   simulado → liquidar MockUSDT na Amoy) **com Edge Functions** (não client-heavy).
2. **Backend:** Supabase projeto existente `iifcwnumpccoucxggxjb` (sa-east-1).
3. **Auth:** email + senha, verificação por email obrigatória, recuperação de senha.
4. **Área logada:** dashboard estruturado com sidebar preparado para seções futuras.
5. **Docs:** MDX em pt/es/en, público, com exemplos curl reais.
6. **Settlement:** sai da MetaMask do dono (hot wallet já configurada) → carteira
   do cliente.

## Arquitetura proposta

### Consolidação das Edge Functions

Padrão único = geração nova (`peragus_*`): JOSE/JWKS para validar JWT,
validação rigorosa de entrada, erros JSON consistentes, CORS explícito.

| Função final | Origem | Papel |
|---|---|---|
| `create-operation` | reescrita | POST autenticado (JWT **ou** API key); valida valor/endereço; gera código Pix simulado; status `created` |
| `confirm-pix` | nova (substitui pix-webhook no MVP) | confirmação simulada pelo próprio usuário autenticado; `created → pix_confirmed`; sem provedor externo ainda |
| `settle-operation` | evolução de peragus_mockusdt_transfer | opera sobre op `pix_confirmed`; transfer da hot wallet; `pix_confirmed → settling → confirmed/failed` com tx_hash/block/gas |
| `list-operations` | nova | GET paginado por usuário |
| `get-operation-status` | mantida (peragus_get_operation_status) | GET ?id= |

**Aposentar** (delete no cloud após migração): `process-payments`,
`pix-webhook`, `create-operation` e `get-operation` atuais.

### Migração de status única

`created → pix_pending → pix_confirmed → settling → confirmed | failed`

Requer ALTER TABLE: ajustar CHECK constraint e backfill de registros legados
(`pending/submitted` → mapear; documentar decisão no migration SQL).

### Tabela `api_keys` (nova migração)

- `id` uuid pk default gen_random_uuid()
- `user_id` uuid not null references auth.users
- `name` text not null (rótulo escolhido pelo usuário)
- `key_hash` text unique not null (SHA-256; chave crua nunca persistida)
- `key_prefix` text not null (8 primeiros chars p/ exibição)
- `last_used_at`, `revoked_at`, `created_at`
- **RLS:** usuário enxerga apenas as próprias linhas
- **RPC `create_api_key(name)` SECURITY DEFINER** (pgcrypto): gera chave
  `pk_live_<32 hex>`, grava hash, retorna crua uma única vez
- Revogação = UPDATE `revoked_at` via client SDK (RLS protege)

### Middleware de autenticação nas funções

Aceita **ou** JWT de sessão Supabase (JWKS) **ou** `Authorization: Bearer
pk_live_…` (hash lookup em api_keys + update last_used_at). É o que permite ao
`/docs` ensinar chamadas curl reais com API key.

### Autenticação no front

Supabase Auth JS nativo; sessão via cookies (helper SSR do React Router 7).
Rotas: `/:locale/login`, `/:locale/register`, `/:locale/recuperar-senha`,
guarda em `/:locale/app/*`.

### Dashboard `/app`

- **Operações:** tabela com status colorido + filtro; detalhe com polling 5s;
  form "Nova operação" (valor, carteira destinatária) dispara fluxo E2E;
  link PolygonScan Amoy quando houver tx_hash.
- **Chaves de API:** lista (nome, prefixo, created_at, last_used_at); criar
  (modal exibe chave crua UMA vez com aviso); revogar com confirmação.
- **Documentação:** link `/docs` + quickstart.
- **Configurações:** perfil, troca de senha (fase futura: dados Pix).

Fluxo E2E: `created` → usuário confirma Pix simulado → `pix_confirmed` →
settlement automático → `confirmed` (tx_hash + explorer).

### `/docs` público (MDX pt/es/en)

Visão geral → Autenticação (JWT vs API key) → Criar operação → Confirmar Pix →
Consultar status → Listar operações → Erros. Exemplos curl com base URL real do
sandbox; nota permanente de rede de teste Amoy; copy segue constraints de marca.

## Segurança

- Chave crua de API aparece uma única vez; só hash persistido.
- Service role key apenas server-side (Edge Functions/secrets), nunca no bundle.
- RLS em toda tabela nova; funções filtram por user_id mesmo com service role.
- Rate limiting básico nas funções públicas (fase 1: simples por IP/user).
- **Pendência do dono:** revogar tokens de acesso `sbp_*` expostos em chat após
  conclusão do trabalho.

## Decisões sobre as perguntas abertas

1. **Coluna de valor:** `usdt_amount_text` é a fonte da verdade; `amount`
   tratado como legado no migration (sem escritas novas).
2. **Emails transacionais:** localizar templates pt/es/en no Supabase desde o
   MVP (via Management API, sem Docker).

## Fora do escopo da fase 1

Provedor Pix real (Mercado Pago/Asaas), webhook assinado, multi-chain,
KYC/AML, dados bancários nas configurações, billing, times/organizações.

## Critérios de aceite

1. Registro/login/logout/recuperação funcionam em pt/es/en.
2. Operação E2E completa: criar → confirmar Pix simulado → MockUSDT sai da hot
   wallet → chega na carteira destino na Amoy → status `confirmed` com tx_hash.
3. Idempotência por request_id preservada.
4. API key criada via dashboard autentica chamada curl às funções.
5. `/docs` completo em 3 idiomas com exemplos funcionais.
6. Gates verdes: unit, lint, build, E2E Playwright (mobile/tablet/desktop),
   auditoria DOM (overflow/console/backdrop/touch/claims).
7. Funções antigas removidas do cloud; nenhuma rota morta.
