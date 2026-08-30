# Treasury Settlement Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Harden the existing Polygon Amoy settlement so one claimed operation transfers pre-existing MockUSDT from an explicitly verified treasury at most once, with deterministic business errors and transaction persistence.

**Architecture:** Keep the HTTP Edge Functions as adapters and extract blockchain orchestration into a pure TypeScript treasury service plus an at-most-once settlement coordinator. The ethers adapter remains backend-only, the database claim is conditional, the transaction hash is saved immediately after broadcast, and retries reconcile an existing hash without retransmitting.

**Tech Stack:** TypeScript, Supabase Edge Functions/Deno, Supabase JS 2, ethers 6.13.5, Zod 3.23.8, Vitest 4.

**Spec:** `docs/superpowers/specs/2026-08-30-treasury-settlement-hardening-design.md`

## Global Constraints

- Polygon Amoy only; expected chain ID is exactly `80002`.
- Keep ethers 6.13.5; do not introduce another blockchain library.
- Keep `HOT_WALLET_PRIVATE_KEY` as the existing backend-only signer secret.
- Add backend-only `TREASURY_ADDRESS` and reject a mismatch with the derived signer.
- Never place signer, RPC, contract, or treasury configuration in `VITE_*` variables.
- The normal settlement interface and flow must not expose or call `mint`.
- Never mint automatically for a destination, liquidity shortfall, gas failure, RPC failure, or retry.
- Use `ethers.parseUnits`; never use JavaScript floating point for token or gas units.
- Preserve existing operation states: `created`, `pix_pending`, `pix_confirmed`, `settling`, `confirmed`, `failed`.
- A claimed `settling` operation is never automatically retransmitted.
- Persist `tx_hash` immediately after broadcast and before waiting for a receipt.
- Post-broadcast uncertainty leaves the operation `settling`; only a reverted receipt marks it `failed`.
- Do not alter or redeploy the MockUSDT contract.
- Do not make on-chain writes, move tokens, mint inventory, change production secrets, deploy Edge Functions, commit, or push without separate authorization.
- Preserve the pre-existing `.gitignore` modification; do not stage, revert, or edit it.

## File Structure

- Create `supabase/functions/_shared/treasury-transfer.ts`: pure treasury preflight, stable errors, chain interfaces, and one broadcast operation.
- Create `supabase/functions/_shared/settlement-coordinator.ts`: atomic claim/reconciliation orchestration and persistence sequencing.
- Create `supabase/functions/_shared/ethers-treasury.ts`: minimal ethers implementation of the treasury chain interface.
- Modify `supabase/functions/settle-operation/index.ts`: internal HTTP adapter and checked Supabase store implementation.
- Modify `supabase/functions/_shared/validation.ts`: add `settleOperationSchema`.
- Create `supabase/functions/_shared/operation-idempotency.ts`: safe PostgREST error-code extraction and create-request comparison.
- Modify `supabase/functions/create-operation/index.ts`: correct duplicate handling and payload-conflict behavior.
- Create `supabase/functions/_shared/pix-confirmation.ts`: testable one-time Pix transition decision.
- Modify `supabase/functions/confirm-pix/index.ts`: conditional claim and one-time settlement dispatch.
- Create `supabase/functions/__tests__/treasury-transfer.test.ts`: balances, supply, decimals, liquidity, gas, network, and RPC tests.
- Create `supabase/functions/__tests__/settlement-coordinator.test.ts`: concurrency, hash ordering, reconciliation, and receipt tests.
- Create `supabase/functions/__tests__/operation-idempotency.test.ts`: duplicate-key and payload-comparison tests.
- Create `supabase/functions/__tests__/pix-confirmation.test.ts`: concurrent confirmation tests.
- Modify `supabase/functions/__tests__/security.test.ts`: settlement schema validation.
- Modify `.env.example`: document backend-only treasury and chain configuration without real values.

---

### Task 1: Pure Treasury Transfer Service

**Files:**
- Create: `supabase/functions/_shared/treasury-transfer.ts`
- Create: `supabase/functions/__tests__/treasury-transfer.test.ts`

**Interfaces:**
- Consumes: no project service; this is the foundational domain boundary.
- Produces:

```ts
export type SettlementErrorCode =
  | 'INVALID_SETTLEMENT_INPUT'
  | 'WRONG_NETWORK'
  | 'TREASURY_ADDRESS_MISMATCH'
  | 'INVALID_SETTLEMENT_CONFIG'
  | 'INSUFFICIENT_TREASURY_BALANCE'
  | 'INSUFFICIENT_TREASURY_GAS'
  | 'RPC_UNAVAILABLE'
  | 'TX_HASH_PERSISTENCE_FAILED'
  | 'SETTLEMENT_RECONCILIATION_REQUIRED'

export class SettlementError extends Error {
  constructor(
    public readonly code: SettlementErrorCode,
    public readonly status: number,
  ) {
    super(code)
    this.name = 'SettlementError'
  }
}

export interface TransferReceipt {
  hash: string
  status: number
  blockNumber: number
  gasUsed: bigint
}

export interface PendingTransfer {
  hash: string
  wait(): Promise<TransferReceipt | null>
}

export interface TreasuryChain {
  readonly signerAddress: string
  readonly contractAddress: string
  getChainId(): Promise<number>
  parseUnits(amount: string, decimals: number): bigint
  getDecimals(): Promise<number>
  getTokenBalance(address: string): Promise<bigint>
  estimateTransferGas(destination: string, amount: bigint): Promise<bigint>
  getFeePerGas(): Promise<bigint>
  getNativeBalance(address: string): Promise<bigint>
  transfer(destination: string, amount: bigint): Promise<PendingTransfer>
  getReceipt(hash: string): Promise<TransferReceipt | null>
}

export interface TreasuryConfig {
  expectedChainId: number
  treasuryAddress: string
  expectedDecimals: number
  gasSafetyBps: bigint
}

export interface TreasuryTransferRequest {
  destination: string
  amount: string
}

export function errorCode(err: unknown): SettlementErrorCode

export async function broadcastTreasuryTransfer(
  chain: TreasuryChain,
  config: TreasuryConfig,
  request: TreasuryTransferRequest,
): Promise<PendingTransfer>
```

- [ ] **Step 1: Write the failing treasury balance and supply invariant test**

Create a deterministic fake ledger with these exact observable fields and
methods:

```ts
class FakeTreasuryChain implements TreasuryChain {
  readonly signerAddress = TREASURY
  readonly contractAddress = CONTRACT
  chainId = 80002
  decimals = 6
  totalSupply = 1_000_000_000n
  nativeBalance = 10_000_000n
  feePerGas = 10n
  estimatedGas = 100_000n
  transferCalls = 0
  mintCalls = 0
  balances = new Map<string, bigint>([
    [TREASURY.toLowerCase(), 1_000_000_000n],
    [DESTINATION.toLowerCase(), 0n],
  ])

  async getChainId() { return this.chainId }
  parseUnits(amount: string, decimals: number) {
    const [whole, fraction = ''] = amount.split('.')
    return BigInt(whole) * 10n ** BigInt(decimals) + BigInt(fraction.padEnd(decimals, '0'))
  }
  async getDecimals() { return this.decimals }
  async getTokenBalance(address: string) { return this.balances.get(address.toLowerCase()) ?? 0n }
  async estimateTransferGas() { return this.estimatedGas }
  async getFeePerGas() { return this.feePerGas }
  async getNativeBalance() { return this.nativeBalance }
  async getReceipt() { return null }

  async transfer(destination: string, amount: bigint): Promise<PendingTransfer> {
    this.transferCalls += 1
    const treasuryKey = TREASURY.toLowerCase()
    const destinationKey = destination.toLowerCase()
    this.balances.set(treasuryKey, this.balances.get(treasuryKey)! - amount)
    this.balances.set(destinationKey, (this.balances.get(destinationKey) ?? 0n) + amount)
    return {
      hash: TX_HASH,
      wait: async () => ({ hash: TX_HASH, status: 1, blockNumber: 42, gasUsed: 90_000n }),
    }
  }
}
```

Write the test with human units represented by six-decimal integer units:

```ts
it('moves existing treasury tokens without changing totalSupply', async () => {
  const chain = new FakeTreasuryChain()
  const supplyBefore = chain.totalSupply

  await broadcastTreasuryTransfer(chain, CONFIG, {
    destination: DESTINATION,
    amount: '100',
  })

  expect(chain.balances.get(TREASURY.toLowerCase())).toBe(900_000_000n)
  expect(chain.balances.get(DESTINATION.toLowerCase())).toBe(100_000_000n)
  expect(chain.totalSupply).toBe(supplyBefore)
  expect(chain.transferCalls).toBe(1)
  expect(chain.mintCalls).toBe(0)
})
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```text
npx vitest run supabase/functions/__tests__/treasury-transfer.test.ts
```

Expected: FAIL because `treasury-transfer.ts` and
`broadcastTreasuryTransfer` do not exist.

- [ ] **Step 3: Implement the minimal domain types and happy-path preflight**

Implement `broadcastTreasuryTransfer` in this exact order:

```ts
const EVM_ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/
const BPS_DENOMINATOR = 10_000n

export async function broadcastTreasuryTransfer(
  chain: TreasuryChain,
  config: TreasuryConfig,
  request: TreasuryTransferRequest,
): Promise<PendingTransfer> {
  if (!EVM_ADDRESS_RE.test(request.destination)) {
    throw new SettlementError('INVALID_SETTLEMENT_INPUT', 400)
  }
  if (chain.signerAddress.toLowerCase() !== config.treasuryAddress.toLowerCase()) {
    throw new SettlementError('TREASURY_ADDRESS_MISMATCH', 500)
  }

  try {
    if ((await chain.getChainId()) !== config.expectedChainId) {
      throw new SettlementError('WRONG_NETWORK', 500)
    }
    const decimals = await chain.getDecimals()
    if (decimals !== config.expectedDecimals) {
      throw new SettlementError('INVALID_SETTLEMENT_CONFIG', 500)
    }

    let amount: bigint
    try {
      amount = chain.parseUnits(request.amount, decimals)
    } catch {
      throw new SettlementError('INVALID_SETTLEMENT_INPUT', 400)
    }
    if (amount <= 0n) throw new SettlementError('INVALID_SETTLEMENT_INPUT', 400)

    if ((await chain.getTokenBalance(config.treasuryAddress)) < amount) {
      throw new SettlementError('INSUFFICIENT_TREASURY_BALANCE', 409)
    }
    const estimatedGas = await chain.estimateTransferGas(request.destination, amount)
    const feePerGas = await chain.getFeePerGas()
    const requiredGas = (estimatedGas * feePerGas * config.gasSafetyBps) / BPS_DENOMINATOR
    if ((await chain.getNativeBalance(config.treasuryAddress)) < requiredGas) {
      throw new SettlementError('INSUFFICIENT_TREASURY_GAS', 503)
    }

    return await chain.transfer(request.destination, amount)
  } catch (err) {
    if (err instanceof SettlementError) throw err
    throw new SettlementError('RPC_UNAVAILABLE', 503)
  }
}
```

Use a `SettlementError` constructor that sets the error message to its stable
code and sets `this.name = 'SettlementError'`. Implement `errorCode` so unknown
errors become `RPC_UNAVAILABLE` without returning provider text.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run the same focused Vitest command. Expected: one passing invariant test.

- [ ] **Step 5: Add failing preflight error tests**

Add individual tests with literal expected codes:

```ts
it.each([
  ['wrong network', (c: FakeTreasuryChain) => { c.chainId = 137 }, 'WRONG_NETWORK'],
  ['decimals mismatch', (c: FakeTreasuryChain) => { c.decimals = 18 }, 'INVALID_SETTLEMENT_CONFIG'],
  ['insufficient token', (c: FakeTreasuryChain) => { c.balances.set(TREASURY.toLowerCase(), 99_999_999n) }, 'INSUFFICIENT_TREASURY_BALANCE'],
  ['insufficient gas', (c: FakeTreasuryChain) => { c.nativeBalance = 1n }, 'INSUFFICIENT_TREASURY_GAS'],
] as const)('rejects %s without broadcasting', async (_name, mutate, code) => {
  const chain = new FakeTreasuryChain()
  mutate(chain)
  await expect(
    broadcastTreasuryTransfer(chain, CONFIG, { destination: DESTINATION, amount: '100' }),
  ).rejects.toMatchObject({ code })
  expect(chain.transferCalls).toBe(0)
  expect(chain.mintCalls).toBe(0)
})
```

Add separate tests for treasury mismatch, invalid destination, invalid amount,
and an injected RPC read failure. Every test must assert zero transfer and zero
mint calls.

- [ ] **Step 6: Run the focused test, implement only missing branches, and rerun**

Expected final result for this file: all treasury transfer tests pass.

- [ ] **Step 7: Review the task diff without committing**

Run:

```text
git diff --check -- supabase/functions/_shared/treasury-transfer.ts supabase/functions/__tests__/treasury-transfer.test.ts
git diff -- supabase/functions/_shared/treasury-transfer.ts supabase/functions/__tests__/treasury-transfer.test.ts
```

Do not commit or stage.

---

### Task 2: At-Most-Once Settlement Coordinator

**Files:**
- Create: `supabase/functions/_shared/settlement-coordinator.ts`
- Create: `supabase/functions/__tests__/settlement-coordinator.test.ts`
- Consume: `supabase/functions/_shared/treasury-transfer.ts`

**Interfaces:**
- Consumes: `TreasuryChain`, `TreasuryConfig`, `PendingTransfer`,
  `TransferReceipt`, `SettlementError`, `broadcastTreasuryTransfer`, and
  `errorCode` from Task 1.
- Produces:

```ts
export interface SettlementOperation {
  id: string
  status: string
  amount: string
  destination: string
  txHash: string | null
}

export interface BroadcastRecord {
  txHash: string
  senderWallet: string
  contractAddress: string
}

export interface SettlementStore {
  claim(operationId: string): Promise<SettlementOperation | null>
  find(operationId: string): Promise<SettlementOperation | null>
  persistBroadcast(operationId: string, record: BroadcastRecord): Promise<void>
  persistReceipt(operationId: string, receipt: TransferReceipt): Promise<void>
  failBeforeBroadcast(operationId: string, code: string): Promise<void>
}

export type SettlementResult =
  | { status: 'confirmed' | 'failed'; txHash: string | null; idempotent: boolean }
  | { status: 'settling'; txHash: string | null; code: 'SETTLEMENT_PENDING'; idempotent: boolean }

export async function coordinateSettlement(
  operationId: string,
  store: SettlementStore,
  chain: TreasuryChain,
  config: TreasuryConfig,
): Promise<SettlementResult>
```

- [ ] **Step 1: Write a failing concurrency test**

Build a `FakeSettlementStore` whose `claim` changes `pix_confirmed` to
`settling` before resolving. Run two calls concurrently:

```ts
it('allows concurrent workers to broadcast at most once', async () => {
  const store = new FakeSettlementStore(operation('pix_confirmed'))
  const chain = new FakeTreasuryChain()

  await Promise.allSettled([
    coordinateSettlement(OPERATION_ID, store, chain, CONFIG),
    coordinateSettlement(OPERATION_ID, store, chain, CONFIG),
  ])

  expect(chain.transferCalls).toBe(1)
  expect(chain.mintCalls).toBe(0)
})
```

- [ ] **Step 2: Run the focused test and verify RED**

```text
npx vitest run supabase/functions/__tests__/settlement-coordinator.test.ts
```

Expected: FAIL because the coordinator does not exist.

- [ ] **Step 3: Implement claim and terminal-state handling**

Implement this control flow:

```ts
const claimed = await store.claim(operationId)
if (!claimed) {
  const existing = await store.find(operationId)
  if (!existing) throw new SettlementError('INVALID_SETTLEMENT_INPUT', 404)
  if (existing.status === 'confirmed' || existing.status === 'failed') {
    return {
      status: existing.status,
      txHash: existing.txHash,
      idempotent: true,
    }
  }
  if (existing.status === 'settling' && !existing.txHash) {
    throw new SettlementError('SETTLEMENT_RECONCILIATION_REQUIRED', 409)
  }
  if (existing.status === 'settling' && existing.txHash) {
    return reconcileExisting(existing, store, chain)
  }
  throw new SettlementError('INVALID_SETTLEMENT_INPUT', 409)
}
```

Only the `claimed` branch may call `broadcastTreasuryTransfer`.

- [ ] **Step 4: Add a failing hash-before-wait test**

Use a deferred `wait()` promise. Start `coordinateSettlement`, then use
`vi.waitFor` to assert `store.operation.txHash === TX_HASH` while `wait()` is
still unresolved. Resolve the deferred receipt and assert `confirmed`.

- [ ] **Step 5: Implement broadcast persistence before receipt waiting**

The claimed branch must be ordered exactly as follows:

```ts
let tx: PendingTransfer
try {
  tx = await broadcastTreasuryTransfer(chain, config, {
    destination: claimed.destination,
    amount: claimed.amount,
  })
} catch (err) {
  await store.failBeforeBroadcast(operationId, errorCode(err))
  throw err
}

try {
  await store.persistBroadcast(operationId, {
    txHash: tx.hash,
    senderWallet: chain.signerAddress,
    contractAddress: chain.contractAddress,
  })
} catch {
  throw new SettlementError('TX_HASH_PERSISTENCE_FAILED', 500)
}

let receipt: TransferReceipt | null
try {
  receipt = await tx.wait()
} catch {
  return { status: 'settling', txHash: tx.hash, code: 'SETTLEMENT_PENDING', idempotent: false }
}
if (!receipt) {
  return { status: 'settling', txHash: tx.hash, code: 'SETTLEMENT_PENDING', idempotent: false }
}
await store.persistReceipt(operationId, receipt)
return {
  status: receipt.status === 1 ? 'confirmed' : 'failed',
  txHash: receipt.hash,
  idempotent: false,
}
```

Do not call `failBeforeBroadcast` after `broadcastTreasuryTransfer` returns.

- [ ] **Step 6: Add reconciliation tests**

Add separate tests proving:

```text
settling + successful receipt -> confirmed, transferCalls = 0
settling + reverted receipt -> failed, transferCalls = 0
settling + null receipt -> SETTLEMENT_PENDING, transferCalls = 0
settling + receipt RPC error -> SETTLEMENT_PENDING, transferCalls = 0
settling + no tx_hash -> SETTLEMENT_RECONCILIATION_REQUIRED, transferCalls = 0
confirmed retry -> existing result, transferCalls = 0
failed retry -> existing result, transferCalls = 0
```

Implement `reconcileExisting` so receipt errors and null receipts preserve
`settling` and the original hash.

- [ ] **Step 7: Add database-failure tests**

Test that claim failure and broadcast-persistence failure never cause a second
transfer. The first must produce zero transfers; the second may have one
broadcast but every retry must return reconciliation required and never
broadcast again.

- [ ] **Step 8: Run focused Task 1 and Task 2 tests**

```text
npx vitest run supabase/functions/__tests__/treasury-transfer.test.ts supabase/functions/__tests__/settlement-coordinator.test.ts
```

Expected: all tests pass.

- [ ] **Step 9: Review the task diff without committing**

Run `git diff --check` and inspect the two coordinator files. Do not commit or
stage.

---

### Task 3: Ethers Adapter and `settle-operation` Integration

**Files:**
- Create: `supabase/functions/_shared/ethers-treasury.ts`
- Modify: `supabase/functions/_shared/validation.ts`
- Modify: `supabase/functions/settle-operation/index.ts`
- Modify: `supabase/functions/__tests__/security.test.ts`
- Consume: Tasks 1 and 2 interfaces.

**Interfaces:**
- Consumes: `TreasuryChain`, `PendingTransfer`, `TransferReceipt`,
  `TreasuryConfig`, `SettlementStore`, and `coordinateSettlement`.
- Produces:

```ts
export interface EthersTreasurySettings {
  rpcUrl: string
  privateKey: string
  treasuryAddress: string
  contractAddress: string
}

export function createEthersTreasuryChain(
  settings: EthersTreasurySettings,
): TreasuryChain
```

- [ ] **Step 1: Add a failing settlement-input schema test**

Modify `validation.ts` to export a dedicated schema only after this test is
red:

```ts
describe('Validation - settleOperationSchema', () => {
  it('accepts only a UUID operation_id', () => {
    expect(validate(settleOperationSchema, {
      operation_id: '550e8400-e29b-41d4-a716-446655440000',
    })).toEqual({ operation_id: '550e8400-e29b-41d4-a716-446655440000' })
    expect(() => validate(settleOperationSchema, { operation_id: 'bad' })).toThrow()
  })
})
```

Run `npx vitest run supabase/functions/__tests__/security.test.ts` and verify it
fails because the export is missing. Add:

```ts
export const settleOperationSchema = z.object({ operation_id: uuidSchema })
```

Rerun and verify green.

- [ ] **Step 2: Implement the minimal ethers adapter**

Use the current inline ABI and no `mint` entry:

```ts
const ERC20_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
]
```

Map ethers calls exactly:

```ts
getChainId: async () => Number((await provider.getNetwork()).chainId)
parseUnits: (amount, decimals) => ethers.parseUnits(amount, decimals)
getDecimals: async () => Number(await token.decimals())
getTokenBalance: async (address) => BigInt(await token.balanceOf(address))
estimateTransferGas: async (destination, amount) => token.transfer.estimateGas(destination, amount)
getFeePerGas: async () => {
  const fees = await provider.getFeeData()
  const fee = fees.maxFeePerGas ?? fees.gasPrice
  if (fee === null) throw new SettlementError('RPC_UNAVAILABLE', 503)
  return fee
}
getNativeBalance: (address) => provider.getBalance(address)
```

`transfer` returns `{ hash: tx.hash, wait }`, where `wait` maps a null receipt
to null and a real receipt to the shared `TransferReceipt` shape. `getReceipt`
does the same mapping. Never expose `settings.privateKey` or `settings.rpcUrl`
from the returned object.

- [ ] **Step 3: Replace the inline settlement worker with adapters**

In `settle-operation/index.ts`:

1. remove the broken `requireString` import;
2. validate with `settleOperationSchema`;
3. preserve internal-secret authentication before reading sensitive config;
4. implement `requireEnv` without logging values;
5. parse decimals with this complete helper:

```ts
function parseExpectedDecimals(value: string): number {
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 18) {
    throw new SettlementError('INVALID_SETTLEMENT_CONFIG', 500)
  }
  return parsed
}
```

6. build `TreasuryConfig` with:

```ts
{
  expectedChainId: 80002,
  treasuryAddress: requireEnv('TREASURY_ADDRESS'),
  expectedDecimals: parseExpectedDecimals(requireEnv('MOCKUSDT_DECIMALS')),
  gasSafetyBps: 12_000n,
}
```

7. create the ethers adapter from `AMOY_RPC_URL`,
   `HOT_WALLET_PRIVATE_KEY`, `TREASURY_ADDRESS`, and
   `MOCKUSDT_CONTRACT_ADDRESS`;
8. create a checked `SettlementStore` around the admin client;
9. call `coordinateSettlement`;
10. map `SETTLEMENT_PENDING` to HTTP 202 and successful terminal results to 200;
11. map errors without returning raw provider details:

```ts
} catch (err) {
  if (err instanceof SettlementError) {
    return fail(new HttpError(err.status, err.code))
  }
  return fail(new HttpError(500, 'SETTLEMENT_FAILED'))
}
```

The Supabase store must check every `{ error }`. Its atomic claim is:

```ts
admin
  .from('operations')
  .update({ status: 'settling', error_message: null })
  .eq('id', operationId)
  .eq('status', 'pix_confirmed')
  .select('id,status,usdt_amount_text,receiver_wallet,tx_hash')
  .maybeSingle()
```

Map database rows to `SettlementOperation` with `amount`, `destination`, and
`txHash`. `persistBroadcast` must update only a `settling` row with null hash
and must require one returned row. `persistReceipt` must match both operation
ID and expected hash. `failBeforeBroadcast` must match `settling` and store only
the stable code.

- [ ] **Step 4: Preserve audit behavior with safe metadata**

After coordinator completion, write `OPERATION_SETTLEMENT_COMPLETED` for
terminal results and `OPERATION_SETTLEMENT_PENDING` for pending results. Audit
metadata may contain only public `tx_hash`, final status, and stable code.

Logger calls may contain operation ID, public hash, status, and stable code.
They must not contain exception messages from ethers, private key, RPC URL, or
secret headers.

- [ ] **Step 5: Verify the Edge Function type-checks in Deno**

Run:

```text
npx --yes deno check --no-lock supabase/functions/settle-operation/index.ts
```

Expected: exit 0. This check specifically prevents another undeclared shared
import such as the removed `requireString`.

- [ ] **Step 6: Run settlement and security tests**

```text
npx vitest run supabase/functions/__tests__/security.test.ts supabase/functions/__tests__/treasury-transfer.test.ts supabase/functions/__tests__/settlement-coordinator.test.ts
```

Expected: all pass.

- [ ] **Step 7: Review the task diff without committing**

Run `git diff --check` and inspect only the Task 3 files plus imported Task 1/2
interfaces. Do not commit or stage.

---

### Task 4: `request_id` Creation Idempotency

**Files:**
- Create: `supabase/functions/_shared/operation-idempotency.ts`
- Create: `supabase/functions/__tests__/operation-idempotency.test.ts`
- Modify: `supabase/functions/create-operation/index.ts`

**Interfaces:**
- Produces:

```ts
export interface OperationRequestFingerprint {
  amount: string
  receiverWallet: string
  chain: string
}

export function postgresErrorCode(error: unknown): string | null

export function sameOperationRequest(
  existing: {
    usdt_amount_text?: unknown
    receiver_wallet?: unknown
    chain?: unknown
  },
  requested: OperationRequestFingerprint,
): boolean
```

- [ ] **Step 1: Write failing helper tests**

Test these literals:

```ts
expect(postgresErrorCode({ code: '23505', message: 'duplicate' })).toBe('23505')
expect(postgresErrorCode(new Error('duplicate'))).toBeNull()

expect(sameOperationRequest(
  { usdt_amount_text: '25.00', receiver_wallet: VALID_WALLET, chain: 'polygon-amoy' },
  { amount: '25.00', receiverWallet: VALID_WALLET.toLowerCase(), chain: 'polygon-amoy' },
)).toBe(true)

expect(sameOperationRequest(
  { usdt_amount_text: '25.00', receiver_wallet: VALID_WALLET, chain: 'polygon-amoy' },
  { amount: '26.00', receiverWallet: VALID_WALLET, chain: 'polygon-amoy' },
)).toBe(false)
```

Run the focused test and verify RED because the helper is absent.

- [ ] **Step 2: Implement safe extraction and fingerprint comparison**

`postgresErrorCode` may inspect only an object with an own string `code`
property. `sameOperationRequest` compares amount and chain exactly and wallet
case-insensitively. It returns false for missing or non-string fields.

Run the focused test and verify GREEN.

- [ ] **Step 3: Correct duplicate handling in `create-operation`**

Do not call `rethrow(error)` before inspecting `error.code`. Replace the insert
branch with this decision:

```ts
if (error) {
  if (postgresErrorCode(error) !== '23505') rethrow(error)
  const { data: existing, error: existingError } = await admin
    .from('operations')
    .select('*')
    .eq('user_id', userId)
    .eq('request_id', request_id)
    .maybeSingle()
  if (existingError) rethrow(existingError)
  if (!existing) throw new HttpError(409, 'Idempotency collision but operation not found')
  if (!sameOperationRequest(existing, {
    amount,
    receiverWallet: receiver_wallet,
    chain,
  })) {
    throw new HttpError(409, 'request_id already used with different payload')
  }
  return json({
    ok: true,
    idempotent: true,
    operation: {
      id: existing.id,
      status: existing.status,
      pix_code: existing.pix_code ?? null,
    },
  })
}
```

Keep the unique `(user_id, request_id)` index and the existing response shape.

- [ ] **Step 4: Deno-check and run focused tests**

```text
npx --yes deno check --no-lock supabase/functions/create-operation/index.ts
npx vitest run supabase/functions/__tests__/operation-idempotency.test.ts supabase/functions/__tests__/security.test.ts
```

Expected: both commands pass.

- [ ] **Step 5: Review the task diff without committing**

Inspect only the helper, helper tests, and create handler. Do not commit or
stage.

---

### Task 5: One-Time Pix Confirmation Dispatch

**Files:**
- Create: `supabase/functions/_shared/pix-confirmation.ts`
- Create: `supabase/functions/__tests__/pix-confirmation.test.ts`
- Modify: `supabase/functions/confirm-pix/index.ts`

**Interfaces:**
- Produces:

```ts
export interface PixOperation {
  id: string
  status: string
  requestJson: Record<string, unknown>
  amount: string
  receiverWallet: string
}

export interface PixConfirmationStore {
  find(userId: string, operationId: string): Promise<PixOperation | null>
  claim(
    userId: string,
    operationId: string,
    expectedStatus: 'created' | 'pix_pending',
    requestJson: Record<string, unknown>,
  ): Promise<PixOperation | null>
}

export interface PixConfirmationResult {
  operation: PixOperation
  previousStatus: string
  shouldDispatch: boolean
}

export async function confirmPixOnce(
  store: PixConfirmationStore,
  userId: string,
  operationId: string,
  paidAt: string,
): Promise<PixConfirmationResult>
```

- [ ] **Step 1: Write a failing concurrent confirmation test**

The fake store must apply `claim` only when its current status still equals the
expected status. Test:

```ts
it('allows concurrent Pix confirmations to dispatch settlement once', async () => {
  const store = new FakePixStore(operation('created'))
  const results = await Promise.all([
    confirmPixOnce(store, USER_ID, OPERATION_ID, NOW),
    confirmPixOnce(store, USER_ID, OPERATION_ID, NOW),
  ])

  expect(results.filter((result) => result.shouldDispatch)).toHaveLength(1)
  expect(store.operation.status).toBe('pix_confirmed')
})
```

Run the focused test and verify RED.

- [ ] **Step 2: Implement one-time confirmation**

Algorithm:

1. `find` by operation ID and user ID; absent means HTTP-style not found via
   `HttpError(404, 'Operation not found')`;
2. `pix_confirmed`, `settling`, or `confirmed` returns `shouldDispatch: false`;
3. `created` or `pix_pending` builds `requestJson` with `paid_at` and
   `pix_provider: 'sandbox-simulated'`;
4. `claim` with the exact current status;
5. a successful claim returns `shouldDispatch: true`;
6. a lost claim reloads and returns `shouldDispatch: false` for an already
   advanced state;
7. `failed` and unknown states use `assertValidTransition` and remain errors.

Run the focused test and verify GREEN. Add tests for repeated confirmed,
settling, terminal failed, and missing operation.

- [ ] **Step 3: Integrate the service into `confirm-pix`**

Implement a checked Supabase adapter:

- `find` selects `id,status,request_json,usdt_amount_text,receiver_wallet` by ID
  and user;
- `claim` updates only ID, user, and exact expected status, then selects the
  same fields;
- every query checks its error.

Only when `shouldDispatch` is true:

- write `OPERATION_PIX_CONFIRMED` audit;
- invoke `settle-operation` in `EdgeRuntime.waitUntil`;
- send the operation-confirmation email.

For the settlement fetch, inspect `response.ok`; log only a stable dispatch
code and operation ID. Do not include the internal secret or response body.

- [ ] **Step 4: Deno-check and run focused tests**

```text
npx --yes deno check --no-lock supabase/functions/confirm-pix/index.ts
npx vitest run supabase/functions/__tests__/pix-confirmation.test.ts supabase/functions/__tests__/financial-safety.test.ts
```

Expected: all pass.

- [ ] **Step 5: Review the task diff without committing**

Inspect only the confirmation helper, test, and handler. Do not commit or
stage.

---

### Task 6: Configuration Documentation and Complete Verification

**Files:**
- Modify: `.env.example`
- Review: all files from Tasks 1-5
- Preserve: `.gitignore` pre-existing modification

**Interfaces:**
- Consumes: all completed implementation tasks.
- Produces: documented manual configuration and a fully verified worktree.

- [ ] **Step 1: Document backend-only settings without values**

Add comments to `.env.example` that name these Supabase Edge secrets without
providing actual credentials:

```text
# Backend-only Polygon Amoy settlement settings (Supabase Edge secrets; never VITE_*)
# AMOY_RPC_URL
# HOT_WALLET_PRIVATE_KEY
# TREASURY_ADDRESS
# MOCKUSDT_CONTRACT_ADDRESS
# MOCKUSDT_DECIMALS=6
```

Keep existing frontend URL/anon-key examples and email documentation.

- [ ] **Step 2: Run all Edge Function Deno checks**

```text
npx --yes deno check --no-lock supabase/functions/create-operation/index.ts
npx --yes deno check --no-lock supabase/functions/confirm-pix/index.ts
npx --yes deno check --no-lock supabase/functions/settle-operation/index.ts
```

Expected: all exit 0.

- [ ] **Step 3: Run required validation in exact order**

```text
npm run lint
npx tsc --noEmit
npm run build
npx vitest run
```

Expected: all exit 0; the full Vitest count is at least the current 152 tests
plus the new settlement and idempotency tests.

- [ ] **Step 4: Review the final diff and sensitive-data boundary**

Run:

```text
git status --short --branch
git diff --check
git diff --stat
git diff
```

Verify manually:

- no `.env`, private key, RPC URL, service-role key, token, or secret value was
  added;
- no `VITE_*` private configuration was added;
- no contract, migration, mainnet, or frontend payload change was added;
- no `mint` call exists in the normal backend flow;
- no test uses `.skip`, `.only`, or `todo`;
- `.gitignore` remains an unrelated unstaged modification;
- the two approved design/plan documents are present but uncommitted.

- [ ] **Step 5: Produce the manual production checklist without executing it**

Report exactly:

1. add `TREASURY_ADDRESS` as a Supabase Edge secret equal to the address derived
   from the existing hot-wallet key;
2. confirm Amoy chain ID 80002, contract address, and six decimals;
3. confirm treasury token and native balances;
4. deploy `create-operation`, `confirm-pix`, and `settle-operation` with existing
   custom auth configuration;
5. disable legacy `peragus_mockusdt_transfer` only after confirming no external
   use;
6. run one controlled operation and compare treasury, destination, and supply;
7. acknowledge that unrestricted public mint remains in the existing token and
   requires a future contract redeploy to eliminate.

Do not set secrets, deploy, disable functions, transfer, or mint as part of
this task.
