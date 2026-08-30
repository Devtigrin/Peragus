export const LOCALES = ['pt', 'es', 'en'] as const
export type Locale = (typeof LOCALES)[number]

export type PublicSlug = 'terms' | 'privacy' | 'compliance' | 'security'
export type SandboxSlug = 'login' | 'register' | 'docs'

const PREFIX: Record<Locale, string> = {
  pt: '',
  es: '/es',
  en: '/en',
}

export function homePath(locale: Locale): string {
  return PREFIX[locale] || '/'
}

export function pagePath(locale: Locale, slug: PublicSlug): string {
  return `${PREFIX[locale]}/${slug}`
}

export function sandboxPath(locale: Locale, slug: SandboxSlug): string {
  return `${PREFIX[locale]}/${slug}`
}

export function sectionPath(locale: Locale, id: string): string {
  return `${homePath(locale)}#${id}`
}

export type AppSlug = 'chaves-api' | 'configuracoes' | 'docs'
export type AuthSlug = 'login' | 'register' | 'recuperar-senha' | 'resetar-senha'

export function authPath(locale: Locale, slug: AuthSlug): string {
  return `${PREFIX[locale]}/${slug}`
}

export function appPath(locale: Locale, slug?: AppSlug): string {
  return slug ? `${PREFIX[locale]}/app/${slug}` : `${PREFIX[locale]}/app`
}

export function docsPath(locale: Locale): string {
  return `${PREFIX[locale]}/docs`
}

export function appDocsPath(locale: Locale): string {
  return `${PREFIX[locale]}/app/docs`
}

export function localeFromPathname(pathname: string): Locale {
  const segment = pathname.split('/').filter(Boolean)[0]
  return segment === 'es' || segment === 'en' ? segment : 'pt'
}
