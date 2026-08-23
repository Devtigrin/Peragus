import type { DocsContent } from './types'

const BASE = 'https://iifcwnumpccoucxggxjb.supabase.co/functions/v1'

export const pt: DocsContent = {
  seo: {
    title: 'Peragus Sandbox — Documentação da API',
    description:
      'Referência completa das funções do sandbox Peragus: autenticação, criação de operações, confirmação Pix e consulta de status na rede Polygon Amoy.',
  },
  intro:
    'O sandbox Peragus simula um checkout cripto com Pix: você cria uma operação, "paga" o Pix em ambiente controlado e recebe MockUSDT na carteira informada, na rede de teste Polygon Amoy. Todos os valores são fictícios.',
  authTitle: 'Autenticação',
  authBody:
    'Cada função aceita dois modos de autenticação: (1) token JWT do Supabase no header Authorization (fluxo do navegador) ou (2) chave de API no header x-api-key (integrações via linha de comando). Crie chaves em Chaves de API dentro do sandbox.',
  authExample: `curl -H "x-api-key: pk_live_sua_chave_aqui" \\
  "${BASE}/list-operations"`,
  baseUrlLabel: 'URL base das funções',
  endpointsTitle: 'Endpoints',
  endpoints: [
    {
      id: 'create-operation',
      title: 'Criar operação',
      description:
        'Gera uma operação com código Pix simulado. O campo request_id é opcional; se informado, a mesma combinação usuário + request_id retorna a operação original em vez de criar outra.',
      method: 'POST',
      path: `${BASE}/create-operation`,
      request: `{
  "amount_usdt": 25,
  "receiver_wallet": "0xA15Bb723c2d9d3e0CBfFb6061EbF5a4E4A4D8567",
  "token_symbol": "MockUSDT"
}`,
      response: `{
  "id": "f7319d42-e03f-4e27-b4ce-3a04ccf37d6c",
  "status": "created",
  "pix_code": "00020126PERAGUSSANDBOX52040000...",
  "chain": "polygon_amoy",
  "token_symbol": "MockUSDT",
  "usdt_amount_text": "25.000000"
}`,
    },
    {
      id: 'confirm-pix',
      title: 'Confirmar Pix',
      description:
        'Confirma o pagamento simulado do Pix. Em produção este passo viria do PSP; no sandbox é disparado explicitamente e dispara a liquidação on-chain.',
      method: 'POST',
      path: `${BASE}/confirm-pix/{operation_id}`,
      request: '(corpo vazio)',
      response: `{
  "ok": true
}`,
    },
    {
      id: 'list-operations',
      title: 'Listar operações',
      description: 'Retorna as operações do usuário autenticado, mais recentes primeiro.',
      method: 'GET',
      path: `${BASE}/list-operations`,
      request: '(sem corpo)',
      response: `[
  { "id": "…", "status": "confirmed", "usdt_amount_text": "25.000000", … }
]`,
    },
    {
      id: 'get-operation-status',
      title: 'Status de uma operação',
      description: 'Consulta pontual do status atual de uma operação específica.',
      method: 'GET',
      path: `${BASE}/get-operation-status/{operation_id}`,
      request: '(sem corpo)',
      response: `{
  "id": "f7319d42-…",
  "status": "confirmed",
  "tx_hash": "0x631611716c5a302f542dad1ba47ce506eadb10320c5b8070e3fe294869625c04"
}`,
    },
  ],
  errorsTitle: 'Códigos de erro',
  errors: [
    { code: '401 unauthorized', meaning: 'Token JWT ausente/inválido ou chave de API revogada.' },
    { code: '400 validation_error', meaning: 'Campos obrigatórios ausentes ou inválidos.' },
    { code: '404 not_found', meaning: 'Operação inexistente ou pertencente a outro usuário.' },
    { code: '409 conflict', meaning: 'request_id já utilizado para outra operação.' },
    { code: '429 rate_limited', meaning: 'Limite de 30 requisições por minuto excedido.' },
  ],
  statusesTitle: 'Estados da operação',
  statuses: {
    created: 'Operação criada; aguardando pagamento do Pix simulado.',
    pix_pending: 'Reservado para conciliação futura com PSP real.',
    pix_confirmed: 'Pix confirmado; liquidação on-chain enfileirada.',
    settling: 'Transação enviada à Polygon Amoy; aguardando confirmação.',
    confirmed: 'MockUSDT entregue na carteira de destino.',
    failed: 'Falha na liquidação; veja error_message na resposta.',
  },
}
