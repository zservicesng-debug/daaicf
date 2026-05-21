alter table public.user_profiles
add column if not exists is_admin boolean not null default false;

update public.user_profiles
set is_admin = true
where role = 'admin';
