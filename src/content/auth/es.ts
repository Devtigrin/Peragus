import type { AuthContent } from './types'

export const es: AuthContent = {
  backToHome: 'Volver a la página inicial',
  seo: {
    title: 'Acceso al sandbox | Peragus',
    description:
      'Crea tu cuenta en el sandbox de Peragus y opera MockUSDT en la red de prueba Polygon Amoy.',
  },
  login: {
    title: 'Entrar al sandbox',
    emailLabel: 'Correo electrónico',
    passwordLabel: 'Contraseña',
    submit: 'Entrar',
    forgotPassword: 'Olvidé mi contraseña',
    footer: '¿Aún no tienes cuenta?',
    footerLink: 'Crear cuenta',
    genericError: 'No fue posible entrar. Verifica el correo y la contraseña.',
  },
  register: {
    title: 'Crear cuenta en el sandbox',
    emailLabel: 'Correo electrónico',
    passwordLabel: 'Contraseña',
    passwordHint: 'Mínimo de 8 caracteres.',
    submit: 'Crear cuenta',
    footer: '¿Ya tienes una cuenta?',
    footerLink: 'Entrar',
    successNotice:
      '¡Cuenta creada! Enviamos un enlace de confirmación a tu correo. Confírmalo para activar el acceso.',
    genericError: 'No fue posible crear la cuenta. Inténtalo de nuevo.',
  },
  forgot: {
    title: 'Recuperar contraseña',
    emailLabel: 'Correo electrónico',
    submit: 'Enviar enlace de recuperación',
    sentNotice:
      'Si este correo está registrado, recibirás un enlace para definir una nueva contraseña.',
    backToLogin: 'Volver al inicio de sesión',
    genericError: 'No fue posible enviar el enlace. Inténtalo de nuevo.',
  },
  reset: {
    title: 'Definir nueva contraseña',
    passwordLabel: 'Nueva contraseña',
    confirmLabel: 'Confirmar nueva contraseña',
    submit: 'Guardar contraseña',
    successNotice: 'Contraseña actualizada con éxito.',
    goToApp: 'Ir al panel',
    needNewLink:
      'Este enlace de recuperación ya no es válido. Solicita uno nuevo en el botón de abajo.',
    mismatchError: 'Las contraseñas no coinciden o son demasiado cortas (mínimo 8 caracteres).',
    genericError: 'No fue posible actualizar la contraseña. Solicita un nuevo enlace.',
  },
}
