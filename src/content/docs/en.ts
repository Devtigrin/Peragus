import type { DocsContent } from './types'

const BASE = 'https://iifcwnumpccoucxggxjb.supabase.co/functions/v1'

export const en: DocsContent = {
  seo: {
    title: 'Peragus Sandbox — API Documentation',
    description:
      'Full reference for Peragus sandbox functions: authentication, operation creation, Pix confirmation and status queries on the Polygon Amoy network.',
  },
  intro:
    'The Peragus sandbox simulates a Pix crypto checkout: you create an operation, "pay" the Pix in a controlled environment, and receive MockUSDT in the provided wallet on the Polygon Amoy test network. All values are fictional.',
  authTitle: 'Authentication',
  authBody:
    'Each function accepts two modes: (1) Supabase JWT token in the Authorization header (browser flow) or (2) API key in the x-api-key header (command-line integrations). Create keys under API keys inside the sandbox.',
  authExample: `curl -H "x-api-key: pk_live_your_key_here" \\
  "${BASE}/list-operations"`,
  baseUrlLabel: 'Functions base URL',
  endpointsTitle: 'Endpoints',
  endpoints: [
    {
      id: 'create-operation',
      title: 'Create operation',
      description:
        'Generates an operation with a simulated Pix code. The request_id field is optional; when provided, the same user + request_id combination returns the original operation instead of creating a new one.',
      method: 'POST',
      path: `${BASE}/create-operation`,
      request: `{
  "amount": "25",
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
      title: 'Confirm Pix',
      description:
        'Confirms the simulated Pix payment. In production this step would come from the PSP; in the sandbox it is triggered explicitly and kicks off the on-chain settlement.',
      method: 'POST',
      path: `${BASE}/confirm-pix`,
      request: `{
  "operation_id": "04183a42-a2c9-4ad9-ba3c-d9f6718dd7f8"
}`,
      response: `{
  "ok": true
}`,
    },
    {
      id: 'list-operations',
      title: 'List operations',
      description: 'Returns the authenticated user operations, newest first.',
      method: 'GET',
      path: `${BASE}/list-operations`,
      request: '(no body)',
      response: `[
  { "id": "f7319d42-…", "status": "confirmed", "usdt_amount_text": "25.000000" }
]`,
    },
    {
      id: 'get-operation-status',
      title: 'Operation status',
      description: 'Point query of the current status for a specific operation.',
      method: 'GET',
      path: `${BASE}/get-operation-status?id={operation_id}`,
      request: '(no body)',
      response: `{
  "id": "f7319d42-…",
  "status": "confirmed",
  "tx_hash": "0x631611716c5a302f542dad1ba47ce506eadb10320c5b8070e3fe294869625c04"
}`,
    },
  ],
  errorsTitle: 'Error codes',
  errors: [
    { code: '401 unauthorized', meaning: 'Missing/invalid JWT token or revoked API key.' },
    { code: '400 validation_error', meaning: 'Required fields missing or invalid.' },
    { code: '404 not_found', meaning: 'Operation does not exist or belongs to another user.' },
    { code: '409 conflict', meaning: 'request_id already used for another operation.' },
    { code: '429 rate_limited', meaning: 'Limit of 30 requests per minute exceeded.' },
  ],
  statusesTitle: 'Operation states',
  statuses: {
    created: 'Operation created; awaiting simulated Pix payment.',
    pix_pending: 'Reserved for future real-PSP reconciliation.',
    pix_confirmed: 'Pix confirmed; on-chain settlement queued.',
    settling: 'Transaction sent to Polygon Amoy; awaiting confirmation.',
    confirmed: 'MockUSDT delivered to the destination wallet.',
    failed: 'Settlement failed; see error_message in the response.',
  },
}
