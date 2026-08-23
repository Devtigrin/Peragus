import { supabase, SUPABASE_URL } from '@/lib/supabase'

interface CallOpts {
  method?: 'GET' | 'POST'
  body?: unknown
  query?: Record<string, string>
  apiKey?: string
}

export async function callEdge<T>(name: string, opts: CallOpts = {}): Promise<T> {
  let token = opts.apiKey
  if (!token) {
    const { data } = await supabase.auth.getSession()
    token = data.session?.access_token
  }
  if (!token) throw new Error('unauthenticated')
  const qs = opts.query ? `?${new URLSearchParams(opts.query)}` : ''
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${name}${qs}`, {
    method: opts.method ?? 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ?? '',
      ...(opts.body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  })
  const payload = (await res.json().catch(() => null)) as ({ error?: string } & T) | null
  if (!res.ok) throw new Error(payload?.error ?? `HTTP ${res.status}`)
  return payload as T
}
