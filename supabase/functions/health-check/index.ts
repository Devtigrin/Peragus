import { handleOptions, json } from '../_shared/http.ts'

Deno.serve(async (req) => {
  const options = handleOptions(req)
  if (options) return options
  if (req.method !== 'GET') return new Response('Method Not Allowed', { status: 405 })

  try {
    const { createClient } = await import('npm:@supabase/supabase-js@2')
    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } },
    )
    const { error } = await admin.from('operations').select('id').limit(1)

    return json({
      status: error ? 'degraded' : 'healthy',
      timestamp: new Date().toISOString(),
      database: error ? 'unreachable' : 'connected',
    })
  } catch (err) {
    return json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: err instanceof Error ? err.message : 'unknown',
    }, 503)
  }
})
