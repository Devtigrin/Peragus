import type { Locale } from '@/i18n/routing'
import type { DocsContent } from './types'
import { pt } from './pt'
import { es } from './es'
import { en } from './en'

export const docsContent: Record<Locale, DocsContent> = { pt, es, en }
