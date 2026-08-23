import type { DocsContent } from './types'

const BASE = 'https://iifcwnumpccoucxggxjb.supabase.co/functions/v1'

export const es: DocsContent = {
  seo: {
    title: 'Peragus Sandbox — Documentación de la API',
    description:
      'Referencia completa de las funciones del sandbox Peragus: autenticación, creación de operaciones, confirmación Pix y consulta de estado en la red Polygon Amoy.',
  },
  intro:
    'El sandbox Peragus simula un checkout cripto con Pix: creas una operación, "pagas" el Pix en un entorno controlado y recibes MockUSDT en la billetera informada, en la red de prueba Polygon Amoy. Todos los valores son ficticios.',
  authTitle: 'Autenticación',
  authBody:
    'Cada función acepta dos modos: (1) token JWT de Supabase en el header Authorization (flujo del navegador) o (2) clave de API en el header x-api-key (integraciones por línea de comando). Crea claves en Claves de API dentro del sandbox.',
  authExample: `curl -H "x-api-key: pk_live_tu_clave_aqui" \\
  "${BASE}/list-operations"`,
  baseUrlLabel: 'URL base de las funciones',
  endpointsTitle: 'Endpoints',
  endpoints: [
    {
      id: 'create-operation',
      title: 'Crear operación',
      description:
        'Genera una operación con código Pix simulado. El campo request_id es opcional; si se informa, la misma combinación usuario + request_id devuelve la operación original en lugar de crear otra.',
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
        'Confirma el pago simulado del Pix. En producción este paso vendría del PSP; en el sandbox se dispara explícitamente e inicia la liquidación on-chain.',
      method: 'POST',
      path: `${BASE}/confirm-pix/{operation_id}`,
      request: '(cuerpo vacío)',
      response: `{
  "ok": true
}`,
    },
    {
      id: 'list-operations',
      title: 'Listar operaciones',
      description: 'Devuelve las operaciones del usuario autenticado, más recientes primero.',
      method: 'GET',
      path: `${BASE}/list-operations`,
      request: '(sin cuerpo)',
      response: `[
  { "id": "…", "status": "confirmed", "usdt_amount_text": "25.000000", … }
]`,
    },
    {
      id: 'get-operation-status',
      title: 'Estado de una operación',
      description: 'Consulta puntual del estado actual de una operación específica.',
      method: 'GET',
      path: `${BASE}/get-operation-status/{operation_id}`,
      request: '(sin cuerpo)',
      response: `{
  "id": "f7319d42-…",
  "status": "confirmed",
  "tx_hash": "0x631611716c5a302f542dad1ba47ce506eadb10320c5b8070e3fe294869625c04"
}`,
    },
  ],
  errorsTitle: 'Códigos de error',
  errors: [
    { code: '401 unauthorized', meaning: 'Token JWT ausente/inválido o clave de API revocada.' },
    { code: '400 validation_error', meaning: 'Campos obligatorios ausentes o inválidos.' },
    { code: '404 not_found', meaning: 'Operación inexistente o perteneciente a otro usuario.' },
    { code: '409 conflict', meaning: 'request_id ya utilizado para otra operación.' },
    { code: '429 rate_limited', meaning: 'Límite de 30 solicitudes por minuto excedido.' },
  ],
  statusesTitle: 'Estados de la operación',
  statuses: {
    created: 'Operación creada; aguardando el pago del Pix simulado.',
    pix_pending: 'Reservado para conciliación futura con PSP real.',
    pix_confirmed: 'Pix confirmado; liquidación on-chain en cola.',
    settling: 'Transacción enviada a Polygon Amoy; aguardando confirmación.',
    confirmed: 'MockUSDT entregado en la billetera de destino.',
    failed: 'Fallo en la liquidación; ver error_message en la respuesta.',
  },
}
