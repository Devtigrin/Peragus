export interface TermsSection {
  id: string
  title: string
  paragraphs: string[]
  items?: string[]
  closing?: string[]
  quote?: string
}

export const TERMS_HIGHLIGHTS = [
  {
    title: 'Interface não custodial',
    body: 'A Peragus organiza o fluxo tecnológico e não guarda ativos, chaves privadas ou seed phrase.',
  },
  {
    title: 'KYC e prevenção à fraude',
    body: 'Operações podem exigir identificação, validações adicionais e análise de risco antes da conclusão.',
  },
  {
    title: 'Transações irreversíveis',
    body: 'O usuário deve revisar rede, carteira, valor e taxas antes de confirmar qualquer operação.',
  },
]

export const TERMS_SECTIONS: TermsSection[] = [
  {
    id: 'natureza-do-servico',
    title: 'Natureza do Serviço e Funcionamento da Plataforma',
    paragraphs: [
      'A Peragus é uma interface tecnológica não custodial que conecta usuários interessados na compra de ativos digitais a vendedores, provedores de liquidez ou parceiros independentes que ofertam tais ativos.',
      'A atuação da Peragus limita-se à disponibilização de uma camada tecnológica para organização do fluxo da operação, exibição de informações, coleta de dados necessários, verificação de identidade, prevenção à fraude, direcionamento de etapas operacionais e conexão entre o usuário comprador e os vendedores ou provedores de liquidez disponíveis na plataforma.',
      'A Peragus não atua como banco, não é instituição financeira, não é corretora de valores mobiliários, não é distribuidora de valores mobiliários, não é consultora de investimentos, não realiza gestão de recursos de terceiros, não oferece conta de pagamento, não oferece conta corrente e não mantém conta de custódia em nome do usuário.',
      'A Peragus também não realiza custódia dos ativos digitais dos usuários, não guarda chaves privadas, não possui acesso à seed phrase, não administra carteiras digitais e não mantém saldo cripto pertencente ao usuário.',
      'Os ativos digitais adquiridos por meio da plataforma são enviados para a carteira digital indicada pelo próprio usuário, conforme as condições da operação, a confirmação do pagamento, a validação de segurança e os procedimentos de KYC, prevenção à fraude e compliance aplicáveis.',
      'O usuário reconhece que a Peragus não controla a carteira digital informada, não possui acesso aos ativos após o envio para a carteira indicada e não se responsabiliza por perdas decorrentes de erro no endereço informado, escolha de rede incompatível, uso de carteira de terceiros, perda de chave privada, perda de seed phrase, falha de aplicativo de carteira, bloqueio por terceiros ou qualquer evento fora do controle direto da Peragus.',
    ],
  },
  {
    id: 'o-que-a-peragus-faz',
    title: 'O que a Peragus Faz',
    paragraphs: [
      'A Peragus disponibiliza uma interface tecnológica para que o usuário possa iniciar, acompanhar e concluir operações de compra de ativos digitais junto a vendedores, provedores de liquidez ou parceiros independentes.',
      'Dentro dessa função tecnológica, a Peragus poderá:',
    ],
    items: [
      'Organizar o fluxo da operação na plataforma.',
      'Exibir informações sobre o ativo digital, valor, cotação, taxas, rede e carteira de destino.',
      'Coletar dados cadastrais e documentos do usuário.',
      'Realizar ou contratar procedimentos de KYC, KYB, verificação de identidade e prevenção à fraude.',
      'Verificar titularidade de conta bancária, chave Pix ou carteira digital informada.',
      'Aplicar limites de operação conforme perfil, risco e nível de verificação.',
      'Direcionar o usuário para etapas de pagamento, confirmação e recebimento.',
      'Registrar logs, comprovantes, consentimentos, IPs, dispositivos e demais evidências operacionais.',
      'Bloquear, suspender ou recusar operações em caso de suspeita de fraude, inconsistência cadastral, má-fé, risco regulatório ou violação destes Termos.',
    ],
    closing: [
      'A atuação da Peragus como interface tecnológica não custodial não implica custódia, administração de recursos, promessa de liquidação própria, recomendação de investimento ou assunção de responsabilidade por atos praticados por vendedores, provedores de liquidez, carteiras digitais, redes blockchain, instituições financeiras, parceiros externos ou terceiros fora de seu controle direto.',
    ],
  },
  {
    id: 'o-que-a-peragus-nao-faz',
    title: 'O que a Peragus Não Faz',
    paragraphs: ['Para evitar qualquer dúvida, o usuário reconhece que a Peragus:'],
    items: [
      'Não vende ativos digitais em nome próprio, salvo se houver indicação expressa em operação específica.',
      'Não atua como custodiante dos ativos digitais do usuário.',
      'Não guarda chaves privadas, seed phrase, senhas ou credenciais de carteiras digitais.',
      'Não administra recursos, patrimônio ou ativos de usuários.',
      'Não oferece conta de pagamento, conta corrente ou saldo armazenado em nome do usuário.',
      'Não presta consultoria financeira, jurídica, tributária, cambial ou de investimentos.',
      'Não recomenda compra, venda ou manutenção de qualquer ativo digital.',
      'Não promete rentabilidade, valorização, estabilidade, paridade ou liquidez.',
      'Não garante recuperação de ativos enviados para endereço errado, rede errada ou carteira de terceiros.',
      'Não se responsabiliza por decisões de terceiros, incluindo vendedores, provedores de liquidez, bancos, instituições de pagamento, carteiras digitais, emissores de stablecoins, redes blockchain ou autoridades públicas.',
      'Não permite que usuários utilizem a plataforma em nome de terceiros não identificados ou para ocultar beneficiário final.',
    ],
  },
  {
    id: 'cadastro-identificacao-e-kyc',
    title: 'Cadastro, Identificação e KYC',
    paragraphs: [
      'O uso da Peragus poderá exigir cadastro, validação de e-mail, telefone, CPF/CNPJ, biometria, envio de documentos, prova de vida, verificação de titularidade bancária, análise de carteira digital, análise transacional e demais procedimentos de identificação.',
      'O usuário concorda que a Peragus poderá solicitar informações adicionais a qualquer momento, antes, durante ou após uma operação, inclusive para fins de:',
    ],
    items: [
      'Confirmação de identidade.',
      'Prevenção à fraude.',
      'Prevenção à lavagem de dinheiro e financiamento do terrorismo.',
      'Cumprimento de obrigações legais, regulatórias e contratuais.',
      'Validação de titularidade da conta bancária utilizada.',
      'Validação de titularidade ou controle da carteira digital informada.',
      'Análise de origem e destino de recursos.',
      'Investigação de comportamento suspeito ou incompatível com o perfil do usuário.',
    ],
    closing: [
      'A recusa no envio de informações, o envio de informações falsas, incompletas, divergentes, adulteradas ou inconsistentes poderá resultar em bloqueio da conta, cancelamento de operações, retenção temporária para análise, comunicação a autoridades competentes, encerramento definitivo da relação com a Peragus e adoção de medidas judiciais e extrajudiciais cabíveis.',
    ],
  },
  {
    id: 'politica-de-conta-unica',
    title: 'Política de Conta Única',
    paragraphs: [
      'Cada usuário poderá manter apenas uma única conta na Peragus, vinculada à sua identidade, CPF/CNPJ, e-mail, telefone, dispositivo, dados bancários, identificadores técnicos e demais elementos de verificação.',
      'É expressamente proibido:',
    ],
    items: [
      'Criar múltiplas contas.',
      'Utilizar conta de terceiros.',
      'Emprestar, vender, alugar ou ceder conta da Peragus.',
      'Criar contas em nome de familiares, amigos, empresas ou terceiros para burlar limites.',
      'Utilizar dados de terceiros, ainda que com autorização informal.',
      'Operar por procuração sem autorização expressa da Peragus.',
      'Tentar contornar bloqueios, limites, verificações ou regras de compliance.',
    ],
    closing: [
      'A identificação de múltiplas contas, contas relacionadas, contas laranja, contas de passagem ou qualquer tentativa de burlar os controles da plataforma poderá resultar em bloqueio imediato de todas as contas envolvidas, cancelamento de operações pendentes, inclusão em listas internas de restrição, perda de acesso à plataforma e adoção de medidas legais.',
    ],
  },
  {
    id: 'operacoes-cotacoes-taxas-e-limites',
    title: 'Operações, Cotações, Taxas e Limites',
    paragraphs: [
      'As operações realizadas por meio da interface da Peragus estarão sujeitas a limites mínimos e máximos, que poderão variar conforme perfil do usuário, nível de verificação, histórico de uso, risco transacional, disponibilidade de vendedores ou provedores de liquidez, condições de mercado e critérios internos de compliance.',
      'A Peragus poderá alterar limites, taxas, prazos, métodos de pagamento, ativos disponíveis e funcionalidades da plataforma a qualquer momento, mediante atualização na interface, comunicação ao usuário ou alteração destes Termos.',
      'As cotações exibidas poderão variar em razão de volatilidade de mercado, spread, taxas de rede, taxas operacionais, disponibilidade de liquidez, tempo de confirmação do pagamento e condições oferecidas pelos vendedores, provedores de liquidez ou parceiros independentes conectados à plataforma.',
      'A confirmação de uma operação pelo usuário representa aceitação da cotação, das taxas, dos riscos e das condições exibidas no momento da operação.',
      'A Peragus poderá recusar, suspender ou submeter uma operação à análise manual sempre que identificar risco de fraude, inconsistência cadastral, divergência de titularidade, suspeita de uso por terceiros, tentativa de burlar limites, risco regulatório ou qualquer violação destes Termos.',
    ],
  },
  {
    id: 'titularidade-bancaria-e-carteira',
    title: 'Verificação de Titularidade Bancária e Carteira Digital',
    paragraphs: [
      'O usuário declara que todos os pagamentos realizados via Pix, TED, boleto ou qualquer outro meio aceito na plataforma deverão partir de conta de sua própria titularidade.',
      'A Peragus poderá rejeitar pagamentos oriundos de terceiros, contas incompatíveis, contas empresariais não verificadas, contas recém-criadas, contas sinalizadas por risco, contas com inconsistência cadastral ou qualquer origem considerada suspeita.',
      'O usuário também declara que a carteira digital informada para recebimento dos ativos digitais está sob seu controle legítimo.',
      'Antes de confirmar qualquer operação, o usuário deverá revisar cuidadosamente:',
    ],
    items: [
      'O ativo digital escolhido.',
      'A rede blockchain utilizada.',
      'O endereço da carteira.',
      'O valor da operação.',
      'As taxas aplicáveis.',
      'A cotação informada.',
      'O prazo estimado.',
      'Os riscos de irreversibilidade da transação.',
    ],
    closing: [
      'A Peragus não se responsabiliza por perdas decorrentes de endereço informado incorretamente, rede blockchain incompatível, carteira sem suporte ao ativo, erro do usuário, perda de chave privada, bloqueio de carteira externa, falha de aplicativo de terceiros ou envio para endereço de terceiros.',
    ],
  },
  {
    id: 'nao-devolucao-e-contestacao-indevida',
    title: 'Política de Não-Devolução e Contestação Indevida',
    paragraphs: [
      'As operações concluídas de forma legítima, com pagamento confirmado, verificação aprovada e envio dos ativos digitais para a carteira indicada pelo usuário, serão consideradas finais.',
      'O usuário não poderá solicitar devolução, estorno, chargeback, MED, contestação bancária, disputa fraudulenta ou qualquer mecanismo semelhante quando a operação tiver sido corretamente executada e os ativos digitais tiverem sido enviados para a carteira por ele informada.',
      'A abertura de contestação, pedido de devolução, MED, chargeback ou reclamação bancária de má-fé após o recebimento dos ativos digitais será considerada violação grave destes Termos e poderá caracterizar tentativa de fraude.',
      'Nesses casos, a Peragus poderá:',
    ],
    items: [
      'Bloquear a conta do usuário.',
      'Suspender novas operações.',
      'Reter operações pendentes para análise.',
      'Incluir o usuário em listas internas de restrição.',
      'Comunicar instituições financeiras, parceiros, bureaus antifraude e autoridades competentes.',
      'Fornecer registros técnicos, logs, comprovantes, endereços blockchain, IPs, horários, dados de dispositivo, comprovantes de consentimento e demais evidências.',
      'Cobrar perdas, custos operacionais, honorários, taxas, danos e prejuízos causados.',
      'Adotar medidas judiciais e extrajudiciais para reparação integral.',
    ],
    closing: [
      'Esta cláusula não limita direitos legais obrigatórios do consumidor em hipóteses de erro comprovado, falha operacional diretamente imputável à Peragus ou determinação de autoridade competente. Porém, o uso abusivo ou fraudulento de mecanismos de contestação será tratado como má-fé.',
    ],
  },
  {
    id: 'uso-indevido-da-plataforma',
    title: 'Uso Indevido da Plataforma',
    paragraphs: ['É proibido utilizar a Peragus para:'],
    items: [
      'Lavagem de dinheiro.',
      'Financiamento do terrorismo.',
      'Fraude, golpe, estelionato ou simulação de operações.',
      'Triangulação indevida de pagamentos.',
      'Uso de contas de terceiros.',
      'Ocultação de beneficiário final.',
      'Burla de KYC, limites ou controles internos.',
      'Compra de ativos para terceiros não identificados.',
      'Uso de documentos falsos, adulterados ou de terceiros.',
      'Operações com origem de recursos ilícita ou incompatível com o perfil do usuário.',
      'Manipulação de comprovantes.',
      'Tentativa de reversão indevida de operação legítima.',
      'Exploração de falhas técnicas, bugs, brechas ou inconsistências.',
      'Uso automatizado não autorizado, bots, scraping ou engenharia reversa.',
      'Qualquer atividade contrária à lei, à boa-fé, à segurança da plataforma ou aos interesses legítimos da Peragus.',
    ],
    closing: [
      'A Peragus poderá suspender ou encerrar imediatamente a conta de usuários envolvidos em uso indevido, independentemente de aviso prévio.',
    ],
  },
  {
    id: 'parceiros-vendedores-e-provedores',
    title: 'Parceiros, Vendedores e Provedores de Liquidez',
    paragraphs: [
      'A Peragus poderá conectar o usuário a vendedores, provedores de liquidez, parceiros de pagamento, provedores de KYC, ferramentas antifraude, fornecedores tecnológicos, redes blockchain, carteiras digitais e demais terceiros necessários ao funcionamento da plataforma.',
      'A participação desses terceiros não altera a natureza da Peragus como interface tecnológica não custodial.',
      'A Peragus não se responsabiliza por falhas, bloqueios, atrasos, recusas, indisponibilidades, políticas internas ou decisões tomadas por vendedores, provedores de liquidez, instituições financeiras, instituições de pagamento, redes blockchain, emissores de stablecoins, carteiras digitais, provedores externos ou autoridades públicas, salvo quando houver responsabilidade legal comprovada da própria Peragus.',
    ],
  },
  {
    id: 'responsabilidade-do-usuario',
    title: 'Responsabilidade do Usuário',
    paragraphs: ['O usuário é integralmente responsável por:'],
    items: [
      'Fornecer dados verdadeiros e atualizados.',
      'Proteger sua senha, e-mail, telefone e autenticação de dois fatores.',
      'Garantir que sua conta Peragus não seja usada por terceiros.',
      'Conferir todos os dados antes de confirmar uma operação.',
      'Utilizar apenas conta bancária de sua titularidade.',
      'Utilizar carteira digital própria, legítima e compatível.',
      'Manter suas chaves privadas e seed phrase em segurança.',
      'Cumprir obrigações fiscais.',
      'Respeitar a legislação aplicável.',
      'Indenizar a Peragus por prejuízos decorrentes de fraude, má-fé, uso indevido ou violação destes Termos.',
    ],
    closing: [
      'O usuário reconhece que, por se tratar de uma interface tecnológica não custodial, a Peragus não possui controle sobre os ativos digitais após o envio para a carteira indicada pelo usuário.',
    ],
  },
  {
    id: 'declaracao-final',
    title: 'Declaração Final Antes da Operação',
    paragraphs: ['Antes de concluir uma operação, o usuário poderá ser obrigado a confirmar expressamente que:'],
    quote: 'Declaro que sou o titular da conta bancária utilizada para pagamento, que controlo legitimamente a carteira digital informada, que conferi o endereço de recebimento, que selecionei a rede correta, que compreendo a irreversibilidade das transações com ativos digitais e que não solicitarei chargeback, MED, estorno, contestação ou devolução de má-fé após a execução legítima da operação.',
  },
]

export const TERMS_TEXT = [
  'TERMOS DE USO:',
  '',
  ...TERMS_SECTIONS.flatMap((section, index) => [
    `${index + 1}. ${section.title}`,
    '',
    ...section.paragraphs,
    ...(section.items?.map((item, itemIndex) => `${String.fromCharCode(97 + itemIndex)}) ${item}`) ?? []),
    ...(section.closing ?? []),
    ...(section.quote ? [`“${section.quote}”`] : []),
    '',
  ]),
].join('\n')
