-- Peragus Sandbox MVP
-- Applied via Management API POST /v1/projects/iifcwnumpccoucxggxjb/database/query
-- (no Docker host available for `supabase db push`)
create extension if not exists pgcrypto;

-- 1. Unify status vocabulary
do $$
declare c text;
begin
  for c in
    select conname from pg_constraint
    where conrelid = 'public.operations'::regclass
      and contype = 'c'
      and lower(pg_get_constraintdef(oid)) like '%status%'
  loop
    execute format('alter table public.operations drop constraint %I', c);
  end loop;
end $$;

update public.operations
set status = case status
  when 'pending' then 'created'
  when 'submitted' then 'settling'
  else status end
where status in ('pending', 'submitted');

alter table public.operations
  add constraint operations_status_check
  check (status in ('created','pix_pending','pix_confirmed','settling','confirmed','failed'));

-- 2. Idempotency guarantee on (user_id, request_id)
create unique index if not exists operations_user_request_unique
  on public.operations (user_id, request_id);

-- 2b. Legacy `amount` numeric is superseded by usdt_amount_text (spec decision):
-- make nullable so new code never writes it.
alter table public.operations alter column amount drop not null;

-- 2c. Edge Functions use the service role key; ensure it can write operations
-- (legacy table predates this project and had no such grant).
grant select, insert, update on table public.operations to service_role;

-- 2d. Legacy denormalized hot-wallet field superseded by sender_wallet /
-- receiver_wallet (spec); make nullable so creation flow never fabricates it.
alter table public.operations alter column wallet_address drop not null;

-- 3. API keys
create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  key_hash text not null unique,
  key_prefix text not null,
  last_used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.api_keys enable row level security;

drop policy if exists "api_keys_select_own" on public.api_keys;
create policy "api_keys_select_own" on public.api_keys
  for select using (auth.uid() = user_id);

drop policy if exists "api_keys_update_own" on public.api_keys;
create policy "api_keys_update_own" on public.api_keys
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- No INSERT/DELETE policies: lifecycle only via RPC (insert) and revoke (update revoked_at).

-- 4. Creation RPC — returns raw key exactly once
create or replace function public.create_api_key(p_name text)
returns table (id uuid, name text, key text, key_prefix text, created_at timestamptz)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_raw text;
  v_hash text;
begin
  if auth.uid() is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;
  if p_name is null or length(btrim(p_name)) = 0 then
    raise exception 'name is required';
  end if;
  v_raw  := 'pk_live_' || encode(gen_random_bytes(24), 'hex');
  v_hash := encode(digest(v_raw, 'sha256'), 'hex');
  insert into public.api_keys (user_id, name, key_hash, key_prefix)
  values (auth.uid(), btrim(p_name), v_hash, left(v_raw, 12));
  return query
    select k.id, k.name, v_raw, k.key_prefix, k.created_at
    from public.api_keys k
    where k.key_hash = v_hash;
end $$;

revoke execute on function public.create_api_key(text) from public, anon;
grant execute on function public.create_api_key(text) to authenticated;

-- Edge Functions resolve API keys and stamp last_used_at with the
-- service role; default privileges on this table omit those grants.
grant select, update on table public.api_keys to service_role;
