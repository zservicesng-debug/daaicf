create or replace function public.handle_auth_user_profile_sync()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  metadata jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  next_role text;
  next_status text;
  next_display_name text;
  next_org_name text;
  next_phone text;
  next_is_admin boolean;
begin
  next_role := case
    when metadata ->> 'role' in ('admin', 'sponsor', 'partner') then metadata ->> 'role'
    else 'sponsor'
  end;

  next_status := case
    when metadata ->> 'status' in ('active', 'inactive') then metadata ->> 'status'
    else 'inactive'
  end;

  next_display_name := coalesce(
    nullif(metadata ->> 'display_name', ''),
    nullif(metadata ->> 'full_name', ''),
    nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
    coalesce(new.email, 'Portal User')
  );

  next_org_name := nullif(metadata ->> 'org_name', '');
  next_phone := coalesce(nullif(metadata ->> 'phone', ''), '');
  next_is_admin := lower(coalesce(metadata ->> 'is_admin', 'false')) in ('true', '1', 'yes');

  insert into public.user_profiles (
    id,
    role,
    display_name,
    org_name,
    email,
    phone,
    is_admin,
    status
  )
  values (
    new.id,
    next_role,
    next_display_name,
    next_org_name,
    lower(coalesce(new.email, '')),
    next_phone,
    next_is_admin,
    next_status
  )
  on conflict (id) do update
  set
    email = excluded.email,
    display_name = case
      when public.user_profiles.display_name is null or public.user_profiles.display_name = ''
        then excluded.display_name
      else public.user_profiles.display_name
    end,
    org_name = coalesce(public.user_profiles.org_name, excluded.org_name),
    phone = case
      when public.user_profiles.phone is null or public.user_profiles.phone = ''
        then excluded.phone
      else public.user_profiles.phone
    end,
    is_admin = public.user_profiles.is_admin or excluded.is_admin;

  return new;
end;
$$;

drop trigger if exists auth_user_profile_sync on auth.users;
create trigger auth_user_profile_sync
after insert or update on auth.users
for each row
execute function public.handle_auth_user_profile_sync();

insert into public.user_profiles (
  id,
  role,
  display_name,
  org_name,
  email,
  phone,
  is_admin,
  status
)
select
  users.id,
  case
    when coalesce(users.raw_user_meta_data ->> 'role', '') in ('admin', 'sponsor', 'partner')
      then users.raw_user_meta_data ->> 'role'
    else 'sponsor'
  end as role,
  coalesce(
    nullif(users.raw_user_meta_data ->> 'display_name', ''),
    nullif(users.raw_user_meta_data ->> 'full_name', ''),
    nullif(split_part(coalesce(users.email, ''), '@', 1), ''),
    coalesce(users.email, 'Portal User')
  ) as display_name,
  nullif(users.raw_user_meta_data ->> 'org_name', '') as org_name,
  lower(coalesce(users.email, '')) as email,
  coalesce(nullif(users.raw_user_meta_data ->> 'phone', ''), '') as phone,
  lower(coalesce(users.raw_user_meta_data ->> 'is_admin', 'false')) in ('true', '1', 'yes') as is_admin,
  case
    when coalesce(users.raw_user_meta_data ->> 'status', '') in ('active', 'inactive')
      then users.raw_user_meta_data ->> 'status'
    else 'inactive'
  end as status
from auth.users as users
left join public.user_profiles as profiles
  on profiles.id = users.id
where profiles.id is null;
