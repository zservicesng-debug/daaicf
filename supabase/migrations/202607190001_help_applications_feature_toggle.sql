alter table public.site_settings
add column if not exists help_applications_enabled boolean not null default true;

update public.site_settings
set help_applications_enabled = true
where help_applications_enabled is null;
