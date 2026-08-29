-- Password recovery now uses Supabase Auth's native reset-password flow
-- (resetPasswordForEmail). The custom token mechanism (edge functions
-- reset-password / confirm-reset-password) was removed; drop its schema.

drop table if exists public.password_resets;
drop function if exists public.get_user_id_by_email(text);