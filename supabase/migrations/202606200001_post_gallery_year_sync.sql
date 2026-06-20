alter table public.posts
add column if not exists gallery_year integer;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'posts_gallery_year_check'
  ) then
    alter table public.posts
    add constraint posts_gallery_year_check
    check (gallery_year between 1900 and 2100);
  end if;
end
$$;

alter table public.gallery_images
add column if not exists source_post_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'gallery_images_source_post_id_fkey'
  ) then
    alter table public.gallery_images
    add constraint gallery_images_source_post_id_fkey
    foreign key (source_post_id)
    references public.posts(id)
    on delete cascade;
  end if;
end
$$;

create unique index if not exists gallery_images_source_post_url_idx
on public.gallery_images (source_post_id, image_url)
where source_post_id is not null;

create or replace function public.sync_post_images_to_gallery()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.gallery_year is null then
    delete from public.gallery_images
    where source_post_id = new.id;

    return new;
  end if;

  insert into public.gallery_years (year)
  values (new.gallery_year)
  on conflict (year) do nothing;

  delete from public.gallery_images
  where source_post_id = new.id
    and not (
      image_url = any(
        array_prepend(
          new.cover_image_url,
          coalesce(new.gallery_image_urls, array[]::text[])
        )
      )
    );

  insert into public.gallery_images (
    image_url,
    image_path,
    caption,
    collection_id,
    collection_title,
    media_type,
    album,
    gallery_year,
    source_post_id
  )
  select
    source.image_url,
    null,
    new.title,
    new.id,
    new.title,
    'image',
    new.category,
    new.gallery_year,
    new.id
  from (
    select distinct image_url
    from unnest(
      array_prepend(
        new.cover_image_url,
        coalesce(new.gallery_image_urls, array[]::text[])
      )
    ) as source_url(image_url)
    where nullif(trim(image_url), '') is not null
  ) as source
  on conflict (source_post_id, image_url)
    where source_post_id is not null
  do update set
    caption = excluded.caption,
    collection_id = excluded.collection_id,
    collection_title = excluded.collection_title,
    album = excluded.album,
    gallery_year = excluded.gallery_year;

  return new;
end;
$$;

drop trigger if exists sync_post_images_to_gallery_trigger on public.posts;

create trigger sync_post_images_to_gallery_trigger
after insert or update of
  title,
  category,
  cover_image_url,
  gallery_image_urls,
  gallery_year
on public.posts
for each row
execute function public.sync_post_images_to_gallery();
