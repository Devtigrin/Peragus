create table if not exists public.password_resets (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  token_hash text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  used_at    timestamptz
);

create index if not exists idx_password_resets_token_hash
  on public.password_resets (token_hash);

create index if not exists idx_password_resets_user_created
  on public.password_resets (user_id, created_at);

alter table public.password_resets enable row level security;

-- Security-definer function so Edge Functions can look up user by email
-- without exposing auth.users via PostgREST.
create or replace function public.get_user_id_by_email(p_email text)
returns uuid
language sql
security definer
set search_path = public
as $$
  select id from auth.users where email = p_email limit 1;
$$;

grant execute on function public.get_user_id_by_email(text) to service_role;
