# Treasury Settlement Hardening Design

Date: 2026-08-30
Status: approved in chat; awaiting final document review
Scope: backend settlement on Polygon Amoy only

## Objective

Make the normal MockUSDT settlement path explicitly treasury-funded, testable,
and at-most-once:

```text
pre-funded Peragus treasury
  -> validated operation
  -> ERC-20 transfer
  -> destination wallet
```

The normal flow must never call `mint`, must reject insufficient token or gas
balances, must preserve `request_id` idempotency, and must persist the
transaction hash as soon as a transaction is broadcast.

## Investigation Findings

### The normal production flow already transfers

No `mint` call exists in the current repository, the downloaded production
Edge Function sources, or reachable Git history. Both the current and deployed
settlement implementations call:

```ts
token.transfer(receiverWallet, amountInUnits)
```

Recent production transaction
`0xf11d5f764a4b87d7eadd54fc172b88f0d6ce48c831569a02cc7ca3a96230c6ba`
has selector `0xa9059cbb` (`transfer(address,uint256)`) and emitted a `Transfer`
event from the treasury, not from the zero address.

Historical state at blocks 46294896 and 46294897 proves the operation moved
existing tokens:

| Invariant | Before | After | Delta |
| --- | ---: | ---: | ---: |
| `totalSupply` | 1,000,000 MockUSDT | 1,000,000 MockUSDT | 0 |
| Treasury balance | 999,732.5 MockUSDT | 998,732.5 MockUSDT | -1,000 |
| Destination balance | 150 MockUSDT | 1,150 MockUSDT | +1,000 |

The observed treasury address is
`0x84e21D91a24eEa93812707FDB609dabBd1d223A1`. The configured contract is
expected to be `0xcF430Ef1884EBf89F79fC9B9fa445CA85662400a`; the production secret must
still be checked against this public address before deployment.

### Contract risk outside this backend scope

The verified MockUSDT contract has six decimals, mints 1,000,000 tokens to the
deployer in its constructor, and exposes this unrestricted function:

```solidity
function mint(address to, uint256 amount) external {
    _mint(to, amount);
}
```

Anyone can therefore inflate supply outside Peragus. The user selected a
backend-only change, so this design does not redeploy or modify the token.
This remains a known testnet security limitation. A future contract must
restrict mint to an owner or role and keep funding separate from settlement.

### Repository and deployment drift

The deployed `settle-operation` bundle contains an older `_shared/pix.ts` that
exports `requireString`. The repository version removed that export while
`settle-operation/index.ts` still imports it, so deploying the current `HEAD`
would break module loading. Settlement input must use the shared Zod schema.

Production also has an active legacy `peragus_mockusdt_transfer` function that
is absent from `HEAD`. It also uses `transfer`, not `mint`, but duplicates an
obsolete operation path and should be disabled manually after confirming that
no external consumer still calls it.

## Existing Flow

```text
Operations.tsx
  -> POST create-operation
  -> operation(created, request_id)
  -> POST confirm-pix
  -> operation(pix_confirmed)
  -> POST settle-operation (internal, fire-and-forget)
  -> operation(settling)
  -> ethers Wallet(HOT_WALLET_PRIVATE_KEY)
  -> MockUSDT.transfer(destination, parseUnits(amount, decimals))
  -> wait for receipt
  -> persist tx_hash and confirmed|failed
```

Existing safeguards already include backend-only signing, on-chain decimals,
`parseUnits`, treasury token balance, and a positive native balance check.

Existing safety gaps are:

- settlement acquisition is not atomic;
- concurrent workers can both call `transfer`;
- `tx_hash` is persisted only after the receipt;
- stale retries resend if receipt lookup is null or fails;
- a second worker can mark an active settlement failed;
- database update errors are ignored;
- the gas check only verifies that native balance is greater than zero;
- raw provider errors are persisted and may contain sensitive RPC details;
- `create-operation` loses PostgreSQL error code `23505` through `rethrow`;
- `confirm-pix` can dispatch settlement more than once;
- no test executes the settlement behavior.

## Approved Architecture

### Components

1. `settle-operation/index.ts` remains the internal HTTP adapter. It handles
   authentication, input validation, atomic database coordination, response
   mapping, and audit records.
2. A shared treasury settlement service contains blockchain orchestration
   behind narrow interfaces. It has no dependency on `Deno.serve` or Supabase,
   so Vitest can exercise it with deterministic fakes.
3. An ethers adapter implements those interfaces using the existing ethers
   dependency. No new blockchain library is introduced.
4. Shared settlement errors expose stable business codes and safe messages.

The normal token interface contains `decimals`, `balanceOf`, gas estimation,
`transfer`, and receipt operations. It does not contain `mint`.

### Treasury configuration

The existing backend-only `HOT_WALLET_PRIVATE_KEY` remains the signer secret to
avoid rotating a working production key. Code names the resulting signer the
treasury signer.

A new backend-only `TREASURY_ADDRESS` is required. Startup derives the address
from `HOT_WALLET_PRIVATE_KEY` and rejects a mismatch with
`TREASURY_ADDRESS_MISMATCH`. This catches an accidental key change before funds
move.

The other backend settings remain:

- `AMOY_RPC_URL`
- `MOCKUSDT_CONTRACT_ADDRESS`
- `MOCKUSDT_DECIMALS`
- `INTERNAL_SETTLE_SECRET`
- platform-provided Supabase server credentials

None may use a `VITE_` prefix. Secret values must not be logged, returned, or
committed.

### Network, amount, liquidity, and gas preflight

Before broadcast, the ethers adapter must:

1. confirm provider `chainId` is exactly `80002`;
2. confirm the derived signer equals `TREASURY_ADDRESS`;
3. connect only to `MOCKUSDT_CONTRACT_ADDRESS`;
4. read `decimals()` and compare it with `MOCKUSDT_DECIMALS`;
5. convert the persisted decimal string with `ethers.parseUnits`;
6. read `balanceOf(TREASURY_ADDRESS)` and require balance >= amount;
7. estimate gas for the exact `transfer(destination, amount)` call;
8. obtain `maxFeePerGas` or `gasPrice` and calculate a bigint gas requirement
   with a small integer safety margin;
9. read native treasury balance and require it to cover that estimate.

No JavaScript floating-point value is used for token or gas units.

### Atomic settlement claim

The right to broadcast is acquired through one conditional database update:

```text
UPDATE operations
SET status = 'settling', error_message = null
WHERE id = operation_id AND status = 'pix_confirmed'
RETURNING settlement fields
```

Only the caller that receives the updated row may call `transfer`. Every
database error blocks broadcast.

If no row is claimed, the handler reloads the operation:

- `confirmed` or `failed`: return its terminal state without transfer;
- `settling` with `tx_hash`: reconcile that hash only;
- `settling` without `tx_hash`: return
  `SETTLEMENT_RECONCILIATION_REQUIRED` without transfer;
- any other state: return the existing transition conflict.

The existing stale path that retransmits after five minutes is removed. This
chooses at-most-once safety over automatic liveness when the transaction
outcome cannot be proven.

### Broadcast and receipt lifecycle

After `transfer()` returns a transaction response, the handler immediately
persists:

- `tx_hash`;
- `sender_wallet = TREASURY_ADDRESS`;
- `contract_address = MOCKUSDT_CONTRACT_ADDRESS`.

The operation remains `settling`. Failure to persist the hash returns a safe
operational error and never authorizes another transfer.

Receipt outcomes are handled as follows:

- receipt status 1: persist block, gas, success and `confirmed`;
- receipt status 0: persist block, gas, reverted and `failed`;
- pending receipt or wait timeout: preserve `settling` and `tx_hash`;
- RPC lookup failure: preserve `settling` and `tx_hash`;
- retry with hash: query only that hash and never call `transfer`.

There remains an unavoidable process-crash window between network broadcast
and the first database hash update. The approved policy still forbids a later
automatic resend when the row is `settling` without a hash. Recovery is manual,
which prevents duplicate transfers at the cost of possible stuck operations.

### Creation and Pix idempotency

`create-operation` handles the PostgREST insert error before wrapping it. On
`23505`, it loads `(user_id, request_id)`:

- same amount, receiver and chain: return the original operation;
- different payload: return HTTP 409.

`confirm-pix` performs a conditional state update. Only the caller that changes
`created|pix_pending` to `pix_confirmed` dispatches settlement. Repeated calls
return the current operation state without dispatching another transfer.

## Error Model

Stable codes include:

- `INSUFFICIENT_TREASURY_BALANCE`
- `INSUFFICIENT_TREASURY_GAS`
- `TREASURY_ADDRESS_MISMATCH`
- `WRONG_NETWORK`
- `INVALID_SETTLEMENT_CONFIG`
- `SETTLEMENT_RECONCILIATION_REQUIRED`
- `SETTLEMENT_PENDING`
- `RPC_UNAVAILABLE`

Pre-broadcast business/configuration failures may mark the claimed operation
`failed`. Post-broadcast uncertainty must leave it `settling`. Only an actual
reverted receipt marks a broadcast transaction `failed`.

Stored errors and logs contain stable codes plus sanitized context such as
operation ID and public transaction hash. They never contain a private key,
secret header, service-role token, or full RPC URL.

## Testing Strategy

### Treasury service tests

A deterministic ledger fake models balances and supply. The main invariant is:

```text
before: treasury=1000, destination=0, totalSupply=1000
transfer: 100
after:  treasury=900,  destination=100, totalSupply=1000
```

The test also requires exactly one `transfer` call and zero `mint` calls.

Additional cases cover:

- insufficient treasury MockUSDT;
- insufficient POL for estimated gas;
- wrong chain ID;
- configured/derived treasury mismatch;
- decimals mismatch;
- invalid destination and amount;
- RPC failure before broadcast;
- transfer failure;
- receipt success and revert;
- no error path invokes mint.

### Coordination and persistence tests

Deterministic database fakes verify:

- concurrent settlement calls produce one successful claim and one transfer;
- `tx_hash` is persisted before a gated `wait()` resolves;
- retry with hash only reconciles the receipt;
- retry without hash returns reconciliation required and performs no transfer;
- RPC error after broadcast leaves `settling` with its hash;
- receipt success persists hash, block, gas and `confirmed`;
- receipt revert persists hash, block, gas and `failed`;
- failed database claim/update prevents transfer.

### API idempotency and validation tests

Tests verify:

- same `request_id` and same payload return the original operation;
- same `request_id` and different payload return 409;
- concurrent Pix confirmation dispatches settlement once;
- invalid destination is rejected;
- invalid, zero, negative, floating-point or over-precision amount is rejected.

### Validation commands

Run in this order:

```text
npm run lint
npx tsc --noEmit
npm run build
npx vitest run
```

No test or implementation step writes to Polygon Amoy.

## Security Boundaries

The frontend may provide only API contract fields such as `amount`,
`receiver_wallet`, and `request_id`. It cannot choose signer, treasury, private
key, RPC, chain, token contract, or token decimals.

The backend ABI used in normal settlement excludes `mint`. No balance failure,
gas failure, RPC failure, retry, or timeout may call mint.

The current token's public mint remains a critical testnet limitation outside
the approved backend-only implementation. Backend hardening cannot prevent an
unrelated caller from invoking that public contract method.

## Manual Production Steps

Implementation and tests do not perform these actions. Before deployment, an
operator must:

1. set `TREASURY_ADDRESS` to the public address derived from the existing
   `HOT_WALLET_PRIVATE_KEY` without exposing the key;
2. confirm `AMOY_RPC_URL` resolves to chain ID 80002;
3. confirm `MOCKUSDT_CONTRACT_ADDRESS` is the intended Amoy contract;
4. confirm `MOCKUSDT_DECIMALS = 6` against the contract;
5. confirm treasury MockUSDT and POL balances are operationally sufficient;
6. deploy the changed Edge Functions with their existing custom authentication
   configuration;
7. disable legacy `peragus_mockusdt_transfer` after confirming it has no
   external consumer;
8. run one controlled production operation and verify treasury decrease,
   destination increase, unchanged supply, persisted hash, and final status.

No new key, key rotation, contract redeploy, permission change, token mint, or
token movement is part of this implementation.

## Out Of Scope

- replacing or redeploying MockUSDT;
- restricting the current contract's public mint;
- minting initial inventory;
- moving existing treasury tokens;
- changing Polygon mainnet or any network other than Amoy;
- introducing a signed-transaction outbox or automated reconciliation worker;
- changing frontend operation fields or exposing backend configuration.
