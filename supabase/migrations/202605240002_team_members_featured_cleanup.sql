alter table if exists public.team_members
add column if not exists is_featured boolean not null default false;

create unique index if not exists team_members_single_featured_idx
on public.team_members ((is_featured))
where is_featured = true;

delete from public.team_members
where id in (
  '00000000-0000-0000-0000-00000000a101',
  '00000000-0000-0000-0000-00000000a102',
  '00000000-0000-0000-0000-00000000a103',
  '00000000-0000-0000-0000-00000000a104'
);
