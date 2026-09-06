create table if not exists public.blocked_emails (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  reason text,
  source text,
  created_at timestamptz not null default timezone('utc', now()),
  constraint blocked_emails_email_lowercase check (email = lower(trim(email)))
);

create unique index if not exists blocked_emails_email_idx
  on public.blocked_emails (email);

create index if not exists blocked_emails_created_at_idx
  on public.blocked_emails (created_at desc);
