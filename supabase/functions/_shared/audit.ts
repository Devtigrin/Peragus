import { SupabaseClient } from 'npm:@supabase/supabase-js@2'

export interface AuditEntry {
  user_id?: string
  action: string
  resource_type: string
  resource_id?: string
  metadata?: Record<string, unknown>
  request_id?: string
}

export async function writeAuditLog(
  admin: SupabaseClient,
  entry: AuditEntry,
): Promise<void> {
  const { error } = await admin.from('audit_log').insert({
    user_id: entry.user_id ?? null,
    action: entry.action,
    resource_type: entry.resource_type,
    resource_id: entry.resource_id ?? null,
    metadata: entry.metadata ?? {},
    request_id: entry.request_id ?? null,
  })
  if (error) console.error('audit_log write failed:', error.message)
}
