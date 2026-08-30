import { supabase, SUPABASE_URL } from '@/lib/supabase'

interface CallOpts {
  method?: 'GET' | 'POST'
  body?: unknown
  query?: Record<string, string>
  apiKey?: string
  /** Skip Bearer token for unauthenticated public edge endpoints. */
  public?: boolean
}

export async function callEdge<T>(name: string, opts: CallOpts = {}): Promise<T> {
  let token = opts.apiKey
  if (!token && !opts.public) {
    const { data } = await supabase.auth.getSession()
    token = data.session?.access_token
  }
  if (!token && !opts.public) throw new Error('unauthenticated')
  // Um request com body nunca pode usar GET/HEAD: o browser rejeitara com
  // "Request with GET/HEAD method cannot have body". Falha cedo e explicito
  // em vez de deixar o contrato invalido passar silenciosamente.
  if (opts.body !== undefined) {
    const method = (opts.method ?? 'GET').toUpperCase()
    if (method === 'GET' || method === 'HEAD') {
      throw new Error(`callEdge('${name}') recebeu body mas usa método ${method}; use POST`)
    }
  }
  const qs = opts.query ? `?${new URLSearchParams(opts.query)}` : ''
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${name}${qs}`, {
    method: opts.method ?? 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      apikey: (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ?? '',
      ...(opts.body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  })
  const payload = (await res.json().catch(() => null)) as ({ error?: string } & T) | null
  if (!res.ok) throw new Error(payload?.error ?? `HTTP ${res.status}`)
  return payload as T
}
