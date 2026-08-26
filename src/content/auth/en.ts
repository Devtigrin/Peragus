import type { AuthContent } from './types'

export const en: AuthContent = {
  backToHome: 'Back to the homepage',
  seo: {
    title: 'Sandbox access | Peragus',
    description:
      'Create your Peragus sandbox account and trade MockUSDT on the Polygon Amoy test network.',
  },
  login: {
    title: 'Sign in to the sandbox',
    emailLabel: 'Email',
    passwordLabel: 'Password',
    submit: 'Sign in',
    forgotPassword: 'Forgot my password',
    footer: "Don't have an account?",
    footerLink: 'Create account',
    genericError: 'Could not sign in. Check your email and password.',
  },
  register: {
    title: 'Create your sandbox account',
    emailLabel: 'Email',
    passwordLabel: 'Password',
    passwordHint: 'At least 8 characters.',
    submit: 'Create account',
    footer: 'Already have an account?',
    footerLink: 'Sign in',
    successNotice:
      'Account created! We sent a confirmation link to your email. Confirm it to activate access.',
    genericError: 'Could not create the account. Please try again.',
  },
  forgot: {
    title: 'Reset your password',
    emailLabel: 'Email',
    submit: 'Send recovery link',
    sentNotice:
      'If this email is registered, you will receive a link to set a new password.',
    backToLogin: 'Back to sign in',
    genericError: 'Could not send the link. Please try again.',
  },
  reset: {
    title: 'Set a new password',
    passwordLabel: 'New password',
    confirmLabel: 'Confirm new password',
    submit: 'Save password',
    successNotice: 'Password updated successfully.',
    goToApp: 'Go to dashboard',
    needNewLink: 'This recovery link is no longer valid. Request a new one below.',
    mismatchError: 'Passwords do not match or are too short (minimum 8 characters).',
    genericError: 'Could not update the password. Request a new link.',
  },
}
