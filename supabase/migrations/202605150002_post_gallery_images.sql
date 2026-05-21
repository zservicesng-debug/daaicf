alter table public.posts
add column if not exists gallery_image_urls text[] not null default '{}',
add column if not exists gallery_image_paths text[] not null default '{}';
