alter table public.posts
add column if not exists partner_name text;

alter table public.posts
drop constraint if exists posts_category_check;

alter table public.posts
add constraint posts_category_check
check (
  category in (
    'Health',
    'Education',
    'Empowerment',
    'Events',
    'Infrastructure',
    'Community Service',
    'Awards/Recognition',
    'Partnership',
    'Scholarship'
  )
);
