alter table public.site_settings
add column if not exists twitter_url text not null default '',
add column if not exists instagram_url text not null default '';

alter table public.posts
add column if not exists facebook_url text,
add column if not exists twitter_url text,
add column if not exists instagram_url text;

alter table public.help_applications
add column if not exists evidence_image_urls text[] not null default '{}',
add column if not exists evidence_image_paths text[] not null default '{}';

alter table public.posts
drop constraint if exists posts_category_check;

alter table public.posts
add constraint posts_category_check
check (category in ('Health', 'Education', 'Empowerment', 'Events', 'Infrastructure'));

alter table public.projects
drop constraint if exists projects_category_check;

alter table public.projects
add constraint projects_category_check
check (
  category in (
    'Health',
    'Education',
    'Empowerment',
    'Events',
    'Infrastructure',
    'Relief'
  )
);

update public.site_settings
set
  tagline = 'Supporting the Backbones',
  years_of_service = greatest(
    years_of_service,
    extract(year from timezone('utc', now()))::integer - 2009
  )
where id = 'primary';
