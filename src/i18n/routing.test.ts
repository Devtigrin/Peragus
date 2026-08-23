import { describe, expect, it } from 'vitest'
import {
  appPath,
  authPath,
  docsPath,
  homePath,
  localeFromPathname,
  pagePath,
  sandboxPath,
  sectionPath,
} from './routing'

describe('localized routing', () => {
  it('keeps Portuguese at the root', () => {
    expect(homePath('pt')).toBe('/')
    expect(pagePath('pt', 'terms')).toBe('/terms')
  })

  it('prefixes Spanish and English', () => {
    expect(homePath('es')).toBe('/es')
    expect(pagePath('en', 'privacy')).toBe('/en/privacy')
    expect(sandboxPath('es', 'register')).toBe('/es/register')
    expect(sectionPath('es', 'infraestrutura')).toBe('/es#infraestrutura')
  })

  it('reads locale only from a supported first path segment', () => {
    expect(localeFromPathname('/es/security')).toBe('es')
    expect(localeFromPathname('/en')).toBe('en')
    expect(localeFromPathname('/terms')).toBe('pt')
    expect(localeFromPathname('/fr')).toBe('pt')
  })
})

describe('sandbox routing', () => {
  it('builds auth paths', () => {
    expect(authPath('pt', 'login')).toBe('/login')
    expect(authPath('es', 'register')).toBe('/es/register')
    expect(authPath('en', 'recuperar-senha')).toBe('/en/recuperar-senha')
    expect(authPath('es', 'resetar-senha')).toBe('/es/resetar-senha')
  })

  it('builds app paths', () => {
    expect(appPath('pt')).toBe('/app')
    expect(appPath('es', 'chaves-api')).toBe('/es/app/chaves-api')
    expect(appPath('en', 'configuracoes')).toBe('/en/app/configuracoes')
  })

  it('builds docs paths', () => {
    expect(docsPath('pt')).toBe('/docs')
    expect(docsPath('en')).toBe('/en/docs')
  })
})
