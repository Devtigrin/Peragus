import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const css = readFileSync(resolve(__dirname, './index.css'), 'utf8')

describe('B1 design tokens', () => {
  it.each([
    '#06191d',
    '#0c272c',
    '#12353b',
    '#25474c',
    '#f1f7f5',
    '#a8bcb8',
    '#85a09c',
    '#4de0bd',
    '#6680e8',
    '#e6c76d',
    '#ff8a8a',
  ])('contains approved token %s', (token) => {
    expect(css.toLowerCase()).toContain(token)
  })

  it('removes legacy Disney and looping animation language', () => {
    expect(css).not.toMatch(/Disney|valueFlow|shimmer|breathe/i)
  })

  it('contains reduced-motion handling', () => {
    expect(css).toContain('prefers-reduced-motion: reduce')
  })
})
