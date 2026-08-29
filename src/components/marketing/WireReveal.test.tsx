import { act, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { WireReveal } from './WireReveal'

class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = []
  private callback: IntersectionObserverCallback
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
    FakeIntersectionObserver.instances.push(this)
  }
  observe() {}
  unobserve() {}
  disconnect() {}
  trigger(intersecting: boolean) {
    this.callback(
      [{ isIntersecting: intersecting } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    )
  }
}

describe('WireReveal', () => {
  beforeEach(() => {
    FakeIntersectionObserver.instances = []
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('reveals immediately when IntersectionObserver is unavailable', () => {
    const { container } = render(<WireReveal />)
    expect(container.querySelector('.settle-wire--left')).toBeInTheDocument()
    expect(container.querySelector('.settle-node--live')).toBeInTheDocument()
  })

  it('holds the line until the section enters the viewport', () => {
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver)
    const { container } = render(<WireReveal />)
    expect(container.querySelector('.settle-node--live')).toBeNull()
    act(() => FakeIntersectionObserver.instances[0].trigger(true))
    expect(container.querySelector('.settle-wire--left')).toBeInTheDocument()
    expect(container.querySelector('.settle-node--live')).toBeInTheDocument()
  })

  it('decoration is hidden from assistive technology', () => {
    const { container } = render(<WireReveal label="rota de liquidação" />)
    expect(container.querySelector('[aria-hidden="true"]')).toHaveTextContent('rota de liquidação')
  })
})