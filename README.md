# Dr. Andrew A. Igwe Care Foundation

Responsive multi-portal website built with Next.js 16 App Router, Tailwind CSS 4, and env-ready integrations for Supabase, Resend, Tiptap, and Vercel Analytics.

## What is included

- Public website: home, activities, article detail, gallery, about, contact, help applications, sponsor applications, and partner applications
- Admin portal: dashboard, posts, applications, comments, gallery, settings, sponsors, partners, projects, and chat
- Sponsor portal: dashboard, assigned projects, chat, and profile
- Partner portal: dashboard, permitted content, chat, and profile
- Route protection using `proxy.ts` for `/admin/*`, `/sponsor/*`, and `/partner/*`
- Supabase-backed portal authentication with database-backed access checks for admin, sponsor, and partner accounts
- Supabase-backed content, applications, comments, gallery, and chat with a mock fallback when credentials are not configured
- Supabase Storage upload support for gallery images, post cover images, and inline post-editor media uploads through the admin UI

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Portal authentication

- Portal sign-in always uses the password on the user's real Supabase account.
- Admin access additionally requires the `user_profiles.email` value to match `ADMIN_EMAIL` and `user_profiles.is_admin = true`.
- Sponsor and partner access require a matching `user_profiles` record with the correct role and an `active` status.
- When new sponsor or partner users are provisioned without a password, the app sends a Supabase invite instead of creating a hardcoded default password.
- Portal logout clears both the app session cookie and the Supabase auth session.

## Environment

Copy `.env.example` to `.env.local` and fill in real values when you are ready to connect Supabase, email delivery, and production session signing. Set `ADMIN_EMAIL` to the one admin profile that should be able to access the admin portal. Optionally set `PORTAL_INVITE_REDIRECT_TO` if you want Supabase invites to land on a specific URL after acceptance. You can also set `FACEBOOK_URL`, `TWITTER_URL`, and `INSTAGRAM_URL` to provide default foundation social links when the database settings are blank.

## Supabase setup

1. Run the SQL in `supabase/migrations/202605130001_init.sql` in your Supabase project, or apply it with your usual migration workflow.
2. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and optionally `SUPABASE_STORAGE_BUCKET` in `.env.local`.
3. Bootstrap the first admin account:

```bash
npm run supabase:bootstrap-admin -- --email=admin@daaicf.org --password=change-this-now --name="DAAICF Administrator"
```

4. Start the app with `npm run dev`.

Make sure the bootstrap email matches `ADMIN_EMAIL`. Admin sign-in is denied unless the database profile email and `ADMIN_EMAIL` are the same, and the profile also has `is_admin = true`.

If you create users directly in Supabase Auth, apply the later migration `supabase/migrations/202605150001_auth_user_profile_sync.sql` too. It auto-creates a `public.user_profiles` row for each Auth user, but defaults manual users to `role='sponsor'` and `status='inactive'` unless metadata says otherwise. For the first admin, still use the bootstrap script so the profile is marked correctly.

## Notes

- This project targets `next@16`, so route protection is implemented with `proxy.ts` instead of the deprecated `middleware.ts`.
- Without live Supabase credentials, the public content store falls back to the server-side mock store. Portal auth and admin uploads require a real Supabase configuration.
- Admin-managed post covers, gallery images, and inline editor images now use upload-based storage only. Link-based media input has been removed from admin content flows.
