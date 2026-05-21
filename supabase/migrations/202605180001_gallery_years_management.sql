create table if not exists public.gallery_years (
  year integer primary key check (year between 1900 and 2100),
  created_at timestamptz not null default timezone('utc', now())
);

insert into public.gallery_years (year)
select generate_series(2017, 2026)
on conflict (year) do nothing;

alter table public.gallery_images
add column if not exists gallery_year integer;

update public.gallery_images
set gallery_year = extract(year from created_at at time zone 'utc')::integer
where gallery_year is null;

insert into public.gallery_years (year)
select distinct gallery_year
from public.gallery_images
where gallery_year is not null
on conflict (year) do nothing;

alter table public.gallery_images
alter column gallery_year set default extract(year from timezone('utc', now()))::integer;

alter table public.gallery_images
alter column gallery_year set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'gallery_images_gallery_year_check'
  ) then
    alter table public.gallery_images
    add constraint gallery_images_gallery_year_check
    check (gallery_year between 1900 and 2100);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'gallery_images_gallery_year_fkey'
  ) then
    alter table public.gallery_images
    add constraint gallery_images_gallery_year_fkey
    foreign key (gallery_year)
    references public.gallery_years(year)
    on update cascade
    on delete restrict;
  end if;
end
$$;

create index if not exists gallery_images_gallery_year_idx
on public.gallery_images (gallery_year desc, created_at desc);
