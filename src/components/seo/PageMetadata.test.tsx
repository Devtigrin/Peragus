import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PageMetadata } from './PageMetadata'

describe('PageMetadata', () => {
  it('updates localized canonical and language metadata', () => {
    render(
      <PageMetadata
        locale="es"
        title="Peragus | Sandbox B2B"
        description="Descripción de prueba"
        canonicalPath="/es"
        alternates={{ pt: '/', es: '/es', en: '/en' }}
      />,
    )
    expect(document.documentElement.lang).toBe('es')
    expect(document.title).toBe('Peragus | Sandbox B2B')
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute('href', 'https://peragus.com.br/es')
    expect(document.querySelector('meta[property="og:locale"]')).toHaveAttribute('content', 'es_419')
    expect(document.querySelectorAll('link[rel="alternate"]')).toHaveLength(3)
  })
})
