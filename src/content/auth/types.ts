import type { Locale } from '@/i18n/routing'

export interface AuthContent {
  backToHome: string
  seo: { title: string; description: string }
  login: {
    title: string
    emailLabel: string
    passwordLabel: string
    submit: string
    footer: string
    footerLink: string
    genericError: string
  }
  register: {
    title: string
    emailLabel: string
    passwordLabel: string
    passwordHint: string
    submit: string
    footer: string
    footerLink: string
    successNotice: string
    genericError: string
  }
  forgot: {
    title: string
    emailLabel: string
    submit: string
    sentNotice: string
    backToLogin: string
    genericError: string
  }
  reset: {
    title: string
    passwordLabel: string
    confirmLabel: string
    submit: string
    successNotice: string
    goToApp: string
    needNewLink: string
    mismatchError: string
    genericError: string
  }
}
