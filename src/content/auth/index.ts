import type { Locale } from '@/i18n/routing'
import type { AuthContent } from './types'
import { pt } from './pt'
import { es } from './es'
import { en } from './en'

export const authContent: Record<Locale, AuthContent> = { pt, es, en }
