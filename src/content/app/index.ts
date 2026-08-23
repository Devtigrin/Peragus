import type { Locale } from '@/i18n/routing'
import type { AppContent } from './types'
import { pt } from './pt'
import { es } from './es'
import { en } from './en'

export const appContent: Record<Locale, AppContent> = { pt, es, en }
