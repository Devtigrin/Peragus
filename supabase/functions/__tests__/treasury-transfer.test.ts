import { describe, it, expect } from 'vitest'
import { broadcastTreasuryTransfer, errorCode, SettlementError, type TreasuryChain, type TreasuryConfig, type PendingTransfer } from '../_shared/treasury-transfer.ts'

const TREASURY = '0x1111111111111111111111111111111111111111'
const CONTRACT = '0x2222222222222222222222222222222222222222'
const DESTINATION = '0x3333333333333333333333333333333333333333'
const TX_HASH = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'

const CONFIG: TreasuryConfig = {
  expectedChainId: 80002,
  treasuryAddress: TREASURY,
  expectedDecimals: 6,
  gasSafetyBps: 12_000n,
}

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

describe('treasury-transfer', () => {
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

  it('rejects treasury address mismatch without broadcasting', async () => {
    const chain = new FakeTreasuryChain()
    const badConfig: TreasuryConfig = { ...CONFIG, treasuryAddress: '0x4444444444444444444444444444444444444444' }
    await expect(
      broadcastTreasuryTransfer(chain, badConfig, { destination: DESTINATION, amount: '100' }),
    ).rejects.toMatchObject({ code: 'TREASURY_ADDRESS_MISMATCH' })
    expect(chain.transferCalls).toBe(0)
    expect(chain.mintCalls).toBe(0)
  })

  it('rejects invalid destination without broadcasting', async () => {
    const chain = new FakeTreasuryChain()
    await expect(
      broadcastTreasuryTransfer(chain, CONFIG, { destination: 'not-an-address', amount: '100' }),
    ).rejects.toMatchObject({ code: 'INVALID_SETTLEMENT_INPUT' })
    expect(chain.transferCalls).toBe(0)
    expect(chain.mintCalls).toBe(0)
  })

  it('rejects invalid amount without broadcasting', async () => {
    const chain = new FakeTreasuryChain()
    await expect(
      broadcastTreasuryTransfer(chain, CONFIG, { destination: DESTINATION, amount: '0' }),
    ).rejects.toMatchObject({ code: 'INVALID_SETTLEMENT_INPUT' })
    expect(chain.transferCalls).toBe(0)
    expect(chain.mintCalls).toBe(0)
  })

  it('rejects non-numeric amount without broadcasting', async () => {
    const chain = new FakeTreasuryChain()
    await expect(
      broadcastTreasuryTransfer(chain, CONFIG, { destination: DESTINATION, amount: 'abc' }),
    ).rejects.toMatchObject({ code: 'INVALID_SETTLEMENT_INPUT' })
    expect(chain.transferCalls).toBe(0)
    expect(chain.mintCalls).toBe(0)
  })

  it('maps RPC read failure to RPC_UNAVAILABLE without broadcasting', async () => {
    const chain = new FakeTreasuryChain()
    chain.getChainId = async () => { throw new Error('rpc down') }
    await expect(
      broadcastTreasuryTransfer(chain, CONFIG, { destination: DESTINATION, amount: '100' }),
    ).rejects.toMatchObject({ code: 'RPC_UNAVAILABLE' })
    expect(chain.transferCalls).toBe(0)
    expect(chain.mintCalls).toBe(0)
  })

  it('errorCode returns stable code without provider text', () => {
    expect(errorCode(new SettlementError('WRONG_NETWORK', 500))).toBe('WRONG_NETWORK')
    expect(errorCode(new Error('provider boom'))).toBe('RPC_UNAVAILABLE')
    expect(errorCode('string')).toBe('RPC_UNAVAILABLE')
  })
})
