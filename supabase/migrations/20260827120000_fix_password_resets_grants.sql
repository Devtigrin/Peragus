-- Fix: Edge Functions (reset-password / confirm-reset-password) use the
-- service role key to read, insert and update password_resets, but the
-- table was created without explicit grants (new tables are NOT auto-exposed).
grant select, insert, update, delete on table public.password_resets to service_role;