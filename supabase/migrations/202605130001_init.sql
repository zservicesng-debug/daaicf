create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.site_settings (
  id text primary key,
  organization_name text not null,
  rc_number text not null,
  tagline text not null,
  country text not null,
  contact_email text not null,
  contact_phone text not null,
  contact_address text not null,
  facebook_url text not null,
  communities_reached integer not null default 0,
  beneficiaries_supported integer not null default 0,
  events_held integer not null default 0,
  years_of_service integer not null default 0,
  updated_at timestamptz not null default timezone('utc', now())
);

insert into public.site_settings (
  id,
  organization_name,
  rc_number,
  tagline,
  country,
  contact_email,
  contact_phone,
  contact_address,
  facebook_url,
  communities_reached,
  beneficiaries_supported,
  events_held,
  years_of_service
)
values (
  'primary',
  'Dr. Andrew A. Igwe Care Foundation',
  '170215',
  '...Supporting the back bones',
  'Nigeria',
  'info@daaicf.org',
  '+234 000 000 0000',
  'Nigeria',
  'https://facebook.com/daaicf',
  40,
  2000,
  85,
  8
)
on conflict (id) do nothing;

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text not null,
  content text not null,
  category text not null check (category in ('Health', 'Education', 'Empowerment', 'Events')),
  cover_image_url text not null,
  cover_image_path text,
  published boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists posts_created_at_idx on public.posts (created_at desc);
create index if not exists posts_published_idx on public.posts (published);

create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  image_path text,
  caption text not null,
  album text not null check (album in ('Health Outreach', 'Education', 'Empowerment', 'Events', 'Relief')),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists gallery_images_created_at_idx on public.gallery_images (created_at desc);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_name text not null,
  author_email text,
  message text not null,
  status text not null default 'pending' check (status in ('pending', 'approved')),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists comments_post_id_idx on public.comments (post_id);
create index if not exists comments_status_idx on public.comments (status);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.help_applications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  location text not null,
  help_type text not null check (help_type in ('Education', 'Medical', 'Food/Relief', 'Empowerment', 'Other')),
  description text not null,
  how_heard text,
  status text not null default 'new' check (status in ('new', 'reviewed', 'approved', 'rejected')),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists help_applications_status_idx on public.help_applications (status);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  category text not null check (category in ('Health', 'Education', 'Empowerment', 'Events', 'Relief')),
  status text not null check (status in ('active', 'completed')),
  budget_goal bigint not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists projects_status_idx on public.projects (status);

create table if not exists public.sponsor_applications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  org_name text not null,
  email text not null,
  phone text not null,
  applicant_type text not null check (applicant_type in ('Individual', 'Corporate')),
  sponsorship_preference text not null check (sponsorship_preference in ('All Projects', 'Specific Project(s)', 'General Financial Support')),
  project_ids uuid[] not null default '{}',
  budget_range text not null,
  message text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.partner_applications (
  id uuid primary key default gen_random_uuid(),
  org_name text not null,
  contact_name text not null,
  email text not null,
  phone text not null,
  org_type text not null,
  partnership_interests text[] not null default '{}',
  description text not null,
  website text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'sponsor', 'partner')),
  display_name text not null,
  org_name text,
  email text not null unique,
  phone text not null default '',
  is_admin boolean not null default false,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists user_profiles_role_idx on public.user_profiles (role);

create table if not exists public.sponsor_project_access (
  id uuid primary key default gen_random_uuid(),
  sponsor_user_id uuid not null references public.user_profiles(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  granted_at timestamptz not null default timezone('utc', now()),
  unique (sponsor_user_id, project_id)
);

create table if not exists public.partner_permissions (
  id uuid primary key default gen_random_uuid(),
  partner_user_id uuid not null references public.user_profiles(id) on delete cascade,
  permission_key text not null,
  granted_at timestamptz not null default timezone('utc', now()),
  unique (partner_user_id, permission_key)
);

create table if not exists public.chat_rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('sponsor', 'partner')),
  created_by uuid not null references public.user_profiles(id) on delete cascade,
  allow_join_requests boolean not null default false,
  linked_user_id uuid not null references public.user_profiles(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.chat_members (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.chat_rooms(id) on delete cascade,
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  role text not null check (role in ('owner', 'member')),
  joined_at timestamptz not null default timezone('utc', now()),
  unique (room_id, user_id)
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.chat_rooms(id) on delete cascade,
  sender_id uuid not null references public.user_profiles(id) on delete cascade,
  message text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists chat_messages_room_id_idx on public.chat_messages (room_id, created_at asc);

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at
before update on public.site_settings
for each row
execute function public.set_updated_at();

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
before update on public.posts
for each row
execute function public.set_updated_at();

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
before update on public.projects
for each row
execute function public.set_updated_at();

drop trigger if exists user_profiles_set_updated_at on public.user_profiles;
create trigger user_profiles_set_updated_at
before update on public.user_profiles
for each row
execute function public.set_updated_at();

drop trigger if exists chat_rooms_set_updated_at on public.chat_rooms;
create trigger chat_rooms_set_updated_at
before update on public.chat_rooms
for each row
execute function public.set_updated_at();

insert into storage.buckets (id, name, public)
values ('site-media', 'site-media', true)
on conflict (id) do nothing;
