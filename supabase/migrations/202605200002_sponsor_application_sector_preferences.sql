alter table public.sponsor_applications
add column if not exists sector_interests text[];

update public.sponsor_applications
set sector_interests = '{}'::text[]
where sector_interests is null;

alter table public.sponsor_applications
alter column sector_interests set default '{}'::text[];

alter table public.sponsor_applications
alter column sector_interests set not null;

update public.sponsor_applications
set sponsorship_preference = 'General Support'
where sponsorship_preference in ('All Projects', 'General Financial Support');

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'sponsor_applications_sponsorship_preference_check'
  ) then
    alter table public.sponsor_applications
    drop constraint sponsor_applications_sponsorship_preference_check;
  end if;
end
$$;

alter table public.sponsor_applications
add constraint sponsor_applications_sponsorship_preference_check
check (
  sponsorship_preference in (
    'General Support',
    'Specific Sector(s)',
    'Specific Project(s)'
  )
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'sponsor_applications_sector_interests_check'
  ) then
    alter table public.sponsor_applications
    add constraint sponsor_applications_sector_interests_check
    check (
      sector_interests <@ array[
        'Health',
        'Education',
        'Empowerment',
        'Events',
        'Infrastructure',
        'Relief'
      ]::text[]
    );
  end if;
end
$$;
