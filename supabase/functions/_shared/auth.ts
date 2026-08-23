import { createClient, SupabaseClient } from 'npm:@supabase/supabase-js@2'
import { createRemoteJWKSet, jwtVerify } from 'npm:jose@5'
import { HttpError } from './http.ts'

export type AuthContext = { userId: string; via: 'jwt' | 'api_key' }

function bearer(req: Request): string {
  const h = req.headers.get('Authorization') ?? ''
  if (!h.startsWith('Bearer ')) throw new HttpError(401, 'Unauthorized: missing Bearer token')
  return h.slice(7).trim()
}

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null
async function verifyJwt(req: Request): Promise<string> {
  const url = Deno.env.get('SUPABASE_URL')!
  jwks ??= createRemoteJWKSet(new URL(`${url}/auth/v1/.well-known/jwks.json`))
  try {
    const { payload } = await jwtVerify(bearer(req), jwks, {
      issuer: `${url}/auth/v1`,
      algorithms: ['ES256', 'RS256', 'EdDSA'],
    })
    if (typeof payload.sub === 'string' && payload.sub.length >= 10) return payload.sub
  } catch {
    // fall through to generic rejection below
  }
  throw new HttpError(401, 'Unauthorized: invalid session token')
}

async function sha256Hex(s: string): Promise<string> {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function verifyApiKey(req: Request, admin: SupabaseClient): Promise<string> {
  const raw = req.headers.get('x-api-key') ?? bearer(req)
  if (!raw.startsWith('pk_live_')) throw new HttpError(401, 'Unauthorized: invalid credentials')
  const hash = await sha256Hex(raw)
  const { data, error } = await admin
    .from('api_keys')
    .select('id, user_id')
    .eq('key_hash', hash)
    .is('revoked_at', null)
    .maybeSingle()
  if (error || !data) throw new HttpError(401, 'Unauthorized: unknown or revoked API key')
  await admin.from('api_keys').update({ last_used_at: new Date().toISOString() }).eq('id', data.id)
  return data.user_id as string
}

export function adminClient(): SupabaseClient {
  return createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false },
  })
}

export async function authenticate(req: Request, admin: SupabaseClient): Promise<AuthContext> {
  const apiKey = req.headers.get('x-api-key') ?? ''
  const bearerRaw = (req.headers.get('Authorization') ?? '').slice(7).trim()
  if (apiKey.startsWith('pk_live_') || bearerRaw.startsWith('pk_live_')) {
    return { userId: await verifyApiKey(req, admin), via: 'api_key' }
  }
  return { userId: await verifyJwt(req), via: 'jwt' }
}
