const ALLOWED_ORIGINS = [
  'https://peragus.com.br',
  'https://www.peragus.com.br',
  'http://localhost:5173',
  'http://localhost:4173',
]

export const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGINS[0],
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-internal-secret, x-api-key',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

export function handleOptions(req: Request): Response | null {
  if (req.method !== 'OPTIONS') return null
  const origin = req.headers.get('origin') ?? ''
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return new Response('ok', {
    headers: { ...corsHeaders, 'Access-Control-Allow-Origin': allowedOrigin },
  })
}

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

// Best-effort per-isolate rate limiter (MVP phase 1). Key = identity string.
const HITS = new Map<string, number[]>()
const WINDOW_MS = 60_000
const MAX_HITS = 30

export function rateLimit(key: string): void {
  const now = Date.now()
  const recent = (HITS.get(key) ?? []).filter((t) => now - t < WINDOW_MS)
  if (recent.length >= MAX_HITS) throw new HttpError(429, 'Too many requests')
  recent.push(now)
  HITS.set(key, recent)
}

export function fail(err: unknown): Response {
  const status = err instanceof HttpError ? err.status : 400
  let message: string
  if (err instanceof HttpError || err instanceof Error) {
    message = err.message
  } else if (typeof err === 'string') {
    message = err
  } else {
    try {
      message = JSON.stringify(err) ?? 'Unknown error'
    } catch {
      message = 'Unknown error'
    }
  }
  return json({ error: message }, status)
}

// Normalize non-Error Supabase/Postgrest failures so their `.message`
// survives instead of collapsing into "[object Object]".
export function rethrow(err: unknown): never {
  if (err instanceof HttpError || err instanceof Error || typeof err === 'string') throw err
  const e = err as { message?: unknown }
  if (e && typeof e.message === 'string' && e.message.length > 0) throw new Error(e.message)
  throw new Error(failSafe(err))
}

function failSafe(err: unknown): string {
  try {
    return JSON.stringify(err) ?? 'Unknown error'
  } catch {
    return 'Unknown error'
  }
}

export async function readJson(req: Request): Promise<Record<string, unknown>> {
  const raw = await req.text()
  // Empty body on POST is a valid "no fields" request (e.g. confirm-pix).
  if (raw.trim().length === 0) return {}
  try {
    const body = JSON.parse(raw)
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('bad json')
    return body as Record<string, unknown>
  } catch {
    throw new HttpError(400, 'Invalid JSON body')
  }
}
