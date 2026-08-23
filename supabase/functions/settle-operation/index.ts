import { createClient } from 'npm:@supabase/supabase-js@2'
import { ethers } from 'npm:ethers@6.13.5'
import { fail, handleOptions, HttpError, json, readJson, rethrow } from '../_shared/http.ts'
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
    t = setTimeout(() => reject(new Error('timeout waiting transaction receipt')), ms)
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

  let operationIdRef: string | null = null
  try {
    const body = await readJson(req)
    const operation_id = requireString(body, 'operation_id')
    operationIdRef = operation_id

    const { data: op, error } = await admin
      .from('operations')
      .select('id, status, usdt_amount_text, receiver_wallet, updated_at')
      .eq('id', operation_id)
      .maybeSingle()
    if (error) rethrow(error)
    if (!op) throw new HttpError(404, 'Operation not found')

    // Allow fresh pix_confirmed ops, or orphaned `settling` ops whose worker
    // died mid-flight (> 5 min without progress).
    const stale =
      op.status === 'settling' &&
      (Date.now() - new Date(op.updated_at as string).getTime()) > 5 * 60_000
    if (op.status !== 'pix_confirmed' && !stale) {
      throw new HttpError(409, `Cannot settle from status ${op.status}`)
    }
    if (!op.usdt_amount_text || !op.receiver_wallet)
      throw new HttpError(409, 'Operation missing amount or receiver')

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

    const amountInUnits = ethers.parseUnits(op.usdt_amount_text as string, decimalsOnChain)
    const balance: bigint = await token.balanceOf(wallet.address)
    if (balance < amountInUnits) throw new Error('insufficient MockUSDT balance in hot wallet')
    const native: bigint = await provider.getBalance(wallet.address)
    if (native <= 0n) throw new Error('insufficient native balance for gas in hot wallet')

    const tx = await token.transfer(op.receiver_wallet as string, amountInUnits)
    const receipt = await withTimeout(tx.wait(), 180_000)
    // ethers v6 returns `status` as a plain number (1 = success); comparing
    // against 1n would always be false.
    const success = Number(receipt.status) === 1

    await admin
      .from('operations')
      .update({
        status: success ? 'confirmed' : 'failed',
        tx_hash: receipt.hash,
        block_number: receipt.blockNumber,
        gas_used: (receipt as unknown as { gasUsed?: string }).gasUsed?.toString() ?? null,
        transaction_status: success ? 'success' : 'reverted',
        sender_wallet: wallet.address,
        contract_address: contractAddress,
        error_message: success ? null : 'Transaction reverted',
      })
      .eq('id', operation_id)

    return json({ ok: true, status: success ? 'confirmed' : 'failed', tx_hash: receipt.hash })
  } catch (err) {
    // Any failure after 'settling' marks the op failed with the reason.
    try {
      if (typeof operationIdRef === 'string' && operationIdRef) {
        await admin
          .from('operations')
          .update({
            status: 'failed',
            error_message: err instanceof Error ? err.message : String(err),
          })
          .eq('id', operationIdRef)
          .neq('status', 'confirmed')
      }
    } catch {
      // ignore secondary failure
    }
    return fail(err)
  }
})
