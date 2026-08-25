-- Audit log for financial operations (append-only)
CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  metadata jsonb DEFAULT '{}',
  request_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.audit_log (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_resource ON public.audit_log (resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log (created_at DESC);

ALTER TABLE public.audit_log DISABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON TABLE public.audit_log TO service_role;
REVOKE ALL ON TABLE public.audit_log FROM anon, authenticated;
