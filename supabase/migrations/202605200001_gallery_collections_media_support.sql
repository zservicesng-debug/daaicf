alter table public.gallery_images
add column if not exists collection_id uuid;

alter table public.gallery_images
add column if not exists collection_title text;

alter table public.gallery_images
add column if not exists media_type text;

update public.gallery_images
set collection_id = id
where collection_id is null;

update public.gallery_images
set collection_title = caption
where collection_title is null;

update public.gallery_images
set media_type = 'image'
where media_type is null or trim(media_type) = '';

alter table public.gallery_images
alter column collection_id set not null;

alter table public.gallery_images
alter column collection_title set not null;

alter table public.gallery_images
alter column media_type set default 'image';

alter table public.gallery_images
alter column media_type set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'gallery_images_media_type_check'
  ) then
    alter table public.gallery_images
    add constraint gallery_images_media_type_check
    check (media_type in ('image', 'video'));
  end if;
end
$$;

create index if not exists gallery_images_collection_id_idx
on public.gallery_images (collection_id, created_at desc);

create index if not exists gallery_images_collection_year_idx
on public.gallery_images (gallery_year desc, album, collection_title, created_at desc);
