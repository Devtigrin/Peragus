-- Fix api_keys grants: authenticated must have SELECT/UPDATE (RLS enforces ownership)
-- Root cause of "permission denied for table api_keys" was missing GRANTs for the
-- authenticated role after the 20260823120000 table creation (auto_expose_new_tables=false).
-- Service-role keeps full access for edge functions.

-- Ensure RLS still enabled
alter table public.api_keys enable row level security;

-- Grants: authenticated can read/update own rows (policy restricts to auth.uid()).
grant select, update on table public.api_keys to authenticated;

-- Explicitly deny direct access for anon (defense-in-depth). RLS would block anyway,
-- but removing grants prevents "permission denied" confusion leaking schema existence.
revoke all on table public.api_keys from anon;

-- Keep service_role privileges (covers edge functions using admin client).
grant select, update, insert, delete on table public.api_keys to service_role;

-- Recreate policies with explicit TO authenticated role (was TO public).
-- Dropping + recreating keeps idempotency if migration re-applied.
drop policy if exists "api_keys_select_own" on public.api_keys;
create policy "api_keys_select_own" on public.api_keys
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "api_keys_update_own" on public.api_keys;
create policy "api_keys_update_own" on public.api_keys
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Revoke insert/delete via direct table access — lifecycle must go via RPC or service_role.
revoke insert, delete on table public.api_keys from authenticated;
revoke insert, delete, update, select on table public.api_keys from anon;

-- Ensure create_api_key function still SECURITY DEFINER postgres and executable only by authenticated.
-- It inserts as postgres (bypasses RLS/GRANTS) and hashes plaintext before store.
revoke execute on function public.create_api_key(text) from public, anon, authenticated;
grant execute on function public.create_api_key(text) to authenticated;

-- Helper RPC for safe revocation (optional but more auditable than direct update).
create or replace function public.revoke_api_key(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;
  update public.api_keys
     set revoked_at = now()
   where id = p_id
     and user_id = auth.uid()
     and revoked_at is null;
  if not found then
    raise exception 'not found or not owner' using errcode = 'P0002';
  end if;
end $$;

revoke execute on function public.revoke_api_key(uuid) from public, anon;
grant execute on function public.revoke_api_key(uuid) to authenticated;
