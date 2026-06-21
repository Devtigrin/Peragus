export interface SecuritySection {
  id: string
  title: string
  paragraphs: string[]
  items?: string[]
  orderedItems?: string[]
  callout?: string
}

export const SECURITY_HIGHLIGHTS = [
  'Nunca compartilhe chave privada, frase-semente ou códigos de autenticação.',
  'Acesse somente pelo domínio oficial peragus.com.br.',
  'Revise rede, endereço, ativo e valor antes de assinar qualquer transação.',
]

export const SECURITY_SECTIONS: SecuritySection[] = [
  {
    id: 'chaves-privadas-e-frase-semente',
    title: 'Chaves privadas e frase-semente',
    paragraphs: [
      'A Peragus nunca solicita sua chave privada, frase-semente, senha da carteira ou código de recuperação. Essas informações dão acesso total aos seus ativos e não devem ser compartilhadas com ninguém.',
      'Qualquer pessoa ou mensagem que solicite esses dados em nome da Peragus deve ser tratada como tentativa de fraude.',
    ],
  },
  {
    id: 'dominio-oficial',
    title: 'Domínio oficial',
    paragraphs: [
      'Acesse a plataforma somente pelo endereço oficial.',
      'Antes de conectar sua carteira, realizar um pagamento ou informar dados pessoais, confira cuidadosamente o endereço exibido no navegador. Desconfie de links recebidos por mensagens, anúncios, redes sociais ou perfis não verificados.',
    ],
    callout: 'peragus.com.br',
  },
  {
    id: 'conexao-de-carteira',
    title: 'Conexão de carteira',
    paragraphs: [
      'Ao conectar sua carteira, leia atentamente todas as solicitações antes de aprová-las. Verifique a rede, o ativo, o valor e as permissões solicitadas.',
      'A conexão da carteira não transfere automaticamente seus ativos. Uma movimentação somente ocorre após a assinatura de uma transação pelo próprio usuário.',
      'Nunca aprove uma transação cujo conteúdo você não compreenda ou que tenha sido solicitada por uma pessoa desconhecida.',
    ],
  },
  {
    id: 'transacoes-em-blockchain',
    title: 'Transações em blockchain',
    paragraphs: [
      'Transações confirmadas em blockchain são, em regra, irreversíveis. Antes de concluir uma operação, verifique:',
    ],
    items: [
      'O endereço da carteira de destino.',
      'A rede blockchain selecionada.',
      'O ativo e o valor da operação.',
      'As taxas aplicáveis.',
      'A compatibilidade da carteira com a rede utilizada.',
    ],
    callout: 'O envio para um endereço incorreto ou por uma rede incompatível poderá resultar na perda definitiva dos ativos.',
  },
  {
    id: 'pagamentos',
    title: 'Pagamentos',
    paragraphs: [
      'Utilize apenas contas bancárias e meios de pagamento de sua própria titularidade. Confira o valor, os dados da operação e as orientações apresentadas na plataforma antes de confirmar o pagamento.',
      'A Peragus não solicita pagamentos adicionais por mensagens privadas, redes sociais ou canais não oficiais. Não realize transferências para dados bancários recebidos fora do fluxo oficial da plataforma.',
    ],
  },
  {
    id: 'protecao-da-conta',
    title: 'Proteção da conta',
    paragraphs: [
      'Utilize uma senha forte, exclusiva e diferente das utilizadas em outros serviços. Não compartilhe senhas, códigos de autenticação ou links de acesso.',
      'Evite acessar sua conta em dispositivos públicos ou desconhecidos e mantenha seu navegador, sistema operacional e aplicativos de carteira sempre atualizados.',
      'Caso a autenticação em dois fatores esteja disponível, recomendamos que ela seja ativada.',
    ],
  },
  {
    id: 'comunicacoes-e-suporte',
    title: 'Comunicações e suporte',
    paragraphs: ['A equipe da Peragus nunca solicitará:'],
    items: [
      'Chave privada ou frase-semente.',
      'Senha completa da conta ou da carteira.',
      'Código de autenticação.',
      'Instalação de programas de acesso remoto.',
      'Transferência de ativos para “validação”, “proteção” ou “desbloqueio” da conta.',
    ],
    callout: 'Desconfie de mensagens com senso excessivo de urgência, promessas de lucro, ameaças de bloqueio imediato ou pedidos para continuar o atendimento fora dos canais oficiais.',
  },
  {
    id: 'suspeita-de-fraude-ou-acesso-indevido',
    title: 'Suspeita de fraude ou acesso indevido',
    paragraphs: ['Caso identifique uma operação desconhecida, mensagem suspeita ou possível acesso indevido:'],
    orderedItems: [
      'Não aprove novas transações.',
      'Desconecte a carteira da aplicação suspeita.',
      'Altere imediatamente suas senhas.',
      'Revise as permissões concedidas pela carteira.',
      'Entre em contato com o suporte oficial da Peragus.',
    ],
    callout: 'Canal de suporte: contato@peragus.com.br',
  },
]
