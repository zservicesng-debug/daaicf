create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  description text not null,
  image_url text,
  image_path text,
  is_featured boolean not null default false,
  sort_order integer not null default 1 check (sort_order >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists team_members_sort_order_idx
on public.team_members (sort_order asc, created_at asc);

create unique index if not exists team_members_single_featured_idx
on public.team_members ((is_featured))
where is_featured = true;

drop trigger if exists team_members_set_updated_at on public.team_members;
create trigger team_members_set_updated_at
before update on public.team_members
for each row
execute function public.set_updated_at();
