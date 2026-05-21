alter table public.posts
add column if not exists show_on_home boolean not null default false;

create index if not exists posts_show_on_home_idx
on public.posts (show_on_home, created_at desc);
