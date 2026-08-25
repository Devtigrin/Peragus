-- Enable RLS on operations table
-- Edge Functions use service_role (bypasses RLS)
-- PostgREST (anon key) will be restricted to own data

ALTER TABLE public.operations ENABLE ROW LEVEL SECURITY;

-- Policy: authenticated users can only read their own operations
DROP POLICY IF EXISTS "operations_select_own" ON public.operations;
CREATE POLICY "operations_select_own" ON public.operations
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: authenticated users can only insert operations for themselves
DROP POLICY IF EXISTS "operations_insert_own" ON public.operations;
CREATE POLICY "operations_insert_own" ON public.operations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Note: UPDATE operations are done via service_role in Edge Functions (bypasses RLS)
-- No UPDATE policy needed for anon role
