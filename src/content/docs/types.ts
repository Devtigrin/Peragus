export interface DocEndpoint {
  id: string
  title: string
  description: string
  method: string
  path: string
  request: string
  response: string
}

export interface DocsContent {
  seo: { title: string; description: string }
  intro: string
  authTitle: string
  authBody: string
  authExample: string
  baseUrlLabel: string
  endpointsTitle: string
  endpoints: DocEndpoint[]
  errorsTitle: string
  errors: Array<{ code: string; meaning: string }>
  statusesTitle: string
  statuses: Record<string, string>
}
