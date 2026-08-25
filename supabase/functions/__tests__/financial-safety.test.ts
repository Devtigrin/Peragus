import { describe, it, expect } from 'vitest'
import { assertValidTransition, isTerminal } from '../_shared/state-machine.ts'

describe('State Machine - Happy Path', () => {
  it('allows created → pix_confirmed', () => {
    expect(() => assertValidTransition('created', 'pix_confirmed')).not.toThrow()
  })

  it('allows pix_confirmed → settling', () => {
    expect(() => assertValidTransition('pix_confirmed', 'settling')).not.toThrow()
  })

  it('allows settling → confirmed', () => {
    expect(() => assertValidTransition('settling', 'confirmed')).not.toThrow()
  })
})

describe('State Machine - Failure Paths', () => {
  it('allows created → failed', () => {
    expect(() => assertValidTransition('created', 'failed')).not.toThrow()
  })

  it('allows pix_confirmed → failed', () => {
    expect(() => assertValidTransition('pix_confirmed', 'failed')).not.toThrow()
  })

  it('allows settling → failed', () => {
    expect(() => assertValidTransition('settling', 'failed')).not.toThrow()
  })
})

describe('State Machine - Invalid Transitions', () => {
  it('rejects skipping states (created → settling)', () => {
    expect(() => assertValidTransition('created', 'settling')).toThrow()
  })

  it('rejects skipping states (created → confirmed)', () => {
    expect(() => assertValidTransition('created', 'confirmed')).toThrow()
  })

  it('rejects going backwards (confirmed → created)', () => {
    expect(() => assertValidTransition('confirmed', 'created')).toThrow()
  })

  it('rejects going backwards (settling → pix_confirmed)', () => {
    expect(() => assertValidTransition('settling', 'pix_confirmed')).toThrow()
  })

  it('rejects unknown status', () => {
    expect(() => assertValidTransition('unknown', 'created')).toThrow()
  })
})

describe('State Machine - Terminal States', () => {
  it('confirmed is terminal', () => {
    expect(isTerminal('confirmed')).toBe(true)
  })

  it('failed is terminal', () => {
    expect(isTerminal('failed')).toBe(true)
  })

  it('created is not terminal', () => {
    expect(isTerminal('created')).toBe(false)
  })

  it('pix_confirmed is not terminal', () => {
    expect(isTerminal('pix_confirmed')).toBe(false)
  })

  it('settling is not terminal', () => {
    expect(isTerminal('settling')).toBe(false)
  })
})
