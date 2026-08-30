import { createClient } from 'npm:@supabase/supabase-js@2'
import { fail, handleOptions, HttpError, json, readJson } from '../_shared/http.ts'
import { validate, settleOperationSchema } from '../_shared/validation.ts'
import { SettlementError, type TreasuryConfig, type TransferReceipt } from '../_shared/treasury-transfer.ts'
import { coordinateSettlement, type SettlementStore, type SettlementOperation, type BroadcastRecord } from '../_shared/settlement-coordinator.ts'
import { createEthersTreasuryChain } from '../_shared/ethers-treasury.ts'
import { writeAuditLog } from '../_shared/audit.ts'
import { logger } from '../_shared/logger.ts'

function requireEnv(name: string): string {
  const v = Deno.env.get(name)
  if (!v) throw new HttpError(500, `${name} is required`)
  return v
}

function parseExpectedDecimals(value: string): number {
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 18) {
    throw new SettlementError('INVALID_SETTLEMENT_CONFIG', 500)
  }
  return parsed
}

Deno.serve(async (req) => {
  const options = handleOptions(req)
  if (options) return options

  const internalSecret = Deno.env.get('INTERNAL_SETTLE_SECRET')
  const callerSecret = req.headers.get('x-internal-secret')
  if (!internalSecret || callerSecret !== internalSecret) {
    return fail(new HttpError(401, 'Unauthorized: internal endpoint'))
  }

  if (req.method !== 'POST') return fail(new HttpError(405, 'Method Not Allowed'))

  const supabaseUrl = requireEnv('SUPABASE_URL')
  const serviceRoleKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY')
  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  })

  let operationIdRef: string | null = null
  try {
    const body = await readJson(req)
    const { operation_id: operationId } = validate(settleOperationSchema, body)
    operationIdRef = operationId
    logger.info('settle-operation started', { operation_id: operationId, function: 'settle-operation' })

    const config: TreasuryConfig = {
      expectedChainId: 80002,
      treasuryAddress: requireEnv('TREASURY_ADDRESS'),
      expectedDecimals: parseExpectedDecimals(requireEnv('MOCKUSDT_DECIMALS')),
      gasSafetyBps: 12_000n,
    }

    const chain = createEthersTreasuryChain({
      rpcUrl: requireEnv('AMOY_RPC_URL'),
      privateKey: requireEnv('HOT_WALLET_PRIVATE_KEY'),
      treasuryAddress: requireEnv('TREASURY_ADDRESS'),
      contractAddress: requireEnv('MOCKUSDT_CONTRACT_ADDRESS'),
    })

    const store: SettlementStore = {
      claim: async (opId: string): Promise<SettlementOperation | null> => {
        const { data, error } = await admin
          .from('operations')
          .update({ status: 'settling', error_message: null })
          .eq('id', opId)
          .eq('status', 'pix_confirmed')
          .select('id,status,usdt_amount_text,receiver_wallet,tx_hash')
          .maybeSingle()
        if (error) throw error
        if (!data) return null
        return {
          id: data.id as string,
          status: data.status as string,
          amount: data.usdt_amount_text as string,
          destination: data.receiver_wallet as string,
          txHash: (data.tx_hash as string | null) ?? null,
        }
      },
      find: async (opId: string): Promise<SettlementOperation | null> => {
        const { data, error } = await admin
          .from('operations')
          .select('id,status,usdt_amount_text,receiver_wallet,tx_hash')
          .eq('id', opId)
          .maybeSingle()
        if (error) throw error
        if (!data) return null
        return {
          id: data.id as string,
          status: data.status as string,
          amount: data.usdt_amount_text as string,
          destination: data.receiver_wallet as string,
          txHash: (data.tx_hash as string | null) ?? null,
        }
      },
      persistBroadcast: async (opId: string, record: BroadcastRecord): Promise<void> => {
        const { data, error } = await admin
          .from('operations')
          .update({
            tx_hash: record.txHash,
            sender_wallet: record.senderWallet,
            contract_address: record.contractAddress,
          })
          .eq('id', opId)
          .eq('status', 'settling')
          .is('tx_hash', null)
          .select('id')
          .maybeSingle()
        if (error) throw error
        if (!data) throw new SettlementError('TX_HASH_PERSISTENCE_FAILED', 500)
      },
      persistReceipt: async (opId: string, receipt: TransferReceipt): Promise<void> => {
        const status = receipt.status === 1 ? 'confirmed' : 'failed'
        const transactionStatus = receipt.status === 1 ? 'success' : 'reverted'
        const { error } = await admin
          .from('operations')
          .update({
            status,
            tx_hash: receipt.hash,
            block_number: receipt.blockNumber,
            gas_used: receipt.gasUsed.toString(),
            transaction_status: transactionStatus,
          })
          .eq('id', opId)
          .eq('tx_hash', receipt.hash)
        if (error) throw error
      },
      failBeforeBroadcast: async (opId: string, code: string): Promise<void> => {
        const { error } = await admin
          .from('operations')
          .update({ status: 'failed', error_message: code })
          .eq('id', opId)
          .eq('status', 'settling')
        if (error) throw error
      },
    }

    const result = await coordinateSettlement(operationId, store, chain, config)

    if (result.status === 'settling') {
      await writeAuditLog(admin, {
        action: 'OPERATION_SETTLEMENT_PENDING',
        resource_type: 'operation',
        resource_id: operationId,
        metadata: { tx_hash: result.txHash, status: result.status, code: result.code },
      })
      logger.info('settle-operation pending', { operation_id: operationId, tx_hash: result.txHash, status: result.status, code: result.code, function: 'settle-operation' })
      return json({ ok: true, status: result.status, tx_hash: result.txHash, code: result.code }, 202)
    }

    await writeAuditLog(admin, {
      action: 'OPERATION_SETTLEMENT_COMPLETED',
      resource_type: 'operation',
      resource_id: operationId,
      metadata: { tx_hash: result.txHash, status: result.status },
    })
    logger.info('settle-operation completed', { operation_id: operationId, tx_hash: result.txHash, status: result.status, function: 'settle-operation' })
    return json({ ok: true, status: result.status, tx_hash: result.txHash }, 200)
  } catch (err) {
    if (err instanceof SettlementError) {
      logger.error('settle-operation failed', { operation_id: operationIdRef ?? undefined, code: err.code, status: err.status, function: 'settle-operation' })
      return fail(new HttpError(err.status, err.code))
    }
    // Include only stable code in logs for non-settlement errors; never include raw provider text
    const opId = operationIdRef ?? undefined
    if (opId) {
      logger.error('settle-operation failed', { operation_id: opId, code: 'SETTLEMENT_FAILED', function: 'settle-operation' })
    } else {
      logger.error('settle-operation failed', { code: 'SETTLEMENT_FAILED', function: 'settle-operation' })
    }
    return fail(new HttpError(500, 'SETTLEMENT_FAILED'))
  }
})
