import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

if (!url || !anonKey) {
  throw new Error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY')
}

export const SUPABASE_URL = url.replace(/\/$/, '')
export const supabase = createClient(SUPABASE_URL, anonKey, {
  auth: { persistSession: true, autoRefreshToken: true },
})
