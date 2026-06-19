update public.gallery_images
set album = 'Health'
where album = 'Health Outreach';

update public.gallery_images
set album = 'Community Service'
where album = 'Relief';

alter table public.gallery_images
drop constraint if exists gallery_images_album_check;

alter table public.gallery_images
add constraint gallery_images_album_check
check (
  album in (
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
