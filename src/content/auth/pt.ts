import type { AuthContent } from './types'

export const pt: AuthContent = {
  backToHome: 'Voltar para a página inicial',
  seo: {
    title: 'Acesso ao sandbox | Peragus',
    description:
      'Crie sua conta no sandbox da Peragus e opere MockUSDT na rede de teste Polygon Amoy.',
  },
  login: {
    title: 'Entrar no sandbox',
    emailLabel: 'E-mail',
    passwordLabel: 'Senha',
    submit: 'Entrar',
    forgotPassword: 'Esqueci minha senha',
    footer: 'Ainda não tem conta?',
    footerLink: 'Criar conta',
    genericError: 'Não foi possível entrar. Verifique o e-mail e a senha.',
  },
  register: {
    title: 'Criar conta no sandbox',
    emailLabel: 'E-mail',
    passwordLabel: 'Senha',
    passwordHint: 'Mínimo de 8 caracteres.',
    submit: 'Criar conta',
    footer: 'Já tem uma conta?',
    footerLink: 'Entrar',
    successNotice:
      'Conta criada! Enviamos um link de confirmação para o seu e-mail. Confirme para ativar o acesso.',
    genericError: 'Não foi possível criar a conta. Tente novamente.',
  },
  forgot: {
    title: 'Recuperar senha',
    emailLabel: 'E-mail',
    submit: 'Enviar link de recuperação',
    sentNotice:
      'Se este e-mail estiver cadastrado, você receberá um link para definir uma nova senha.',
    backToLogin: 'Voltar para o login',
    genericError: 'Não foi possível enviar o link. Tente novamente.',
  },
  reset: {
    title: 'Definir nova senha',
    passwordLabel: 'Nova senha',
    confirmLabel: 'Confirmar nova senha',
    submit: 'Salvar senha',
    successNotice: 'Senha atualizada com sucesso.',
    goToApp: 'Ir para o painel',
    needNewLink: 'Este link de recuperação não está mais válido. Solicite um novo link abaixo.',
    mismatchError: 'As senhas não coincidem ou são muito curtas (mínimo 8 caracteres).',
    genericError: 'Não foi possível atualizar a senha. Solicite um novo link.',
  },
}
