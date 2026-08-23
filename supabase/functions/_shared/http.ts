export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

export function handleOptions(req: Request): Response | null {
  return req.method === 'OPTIONS' ? new Response('ok', { headers: corsHeaders }) : null
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
  const message = err instanceof Error ? err.message : String(err)
  return json({ error: message }, status)
}

export async function readJson(req: Request): Promise<Record<string, unknown>> {
  try {
    const body = await req.json()
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('bad json')
    return body as Record<string, unknown>
  } catch {
    throw new HttpError(400, 'Invalid JSON body')
  }
}
