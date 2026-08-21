# FindMyLost Case Registry — Phase 1

A lost-phone case-reporting platform: file a report, get a public case ID,
track status. **This is a case registry, not a tracking tool** — it never
accesses Apple/Google location data, never bypasses device security, and
never fabricates tracking results. See `/privacy` and the homepage for the
full transparency statement.

## What's in Phase 1

- Next.js 14 (App Router) + TypeScript + Tailwind frontend
- Supabase for Postgres, Auth, and private file Storage
- Public homepage, lost-phone report form, case-ID generation
- Public case-status lookup page (privacy-safe view, no PII exposed)
- Admin auth (email/password via Supabase Auth) gated by an `admins` allowlist
- Read-only admin dashboard (recent cases) — full case management ships in
  Phase 2
- Row Level Security on every table; a private storage bucket for uploads
- SEO basics: metadata, `robots.txt`, `sitemap.xml`
- Privacy Policy and Terms of Use pages

**Phase 2** (next): full admin case management (search, filters, status
updates, admin notes, secure file viewing with signed URLs).
**Phase 3**: SEO polish, security hardening pass, official-recovery-resources
page, production deployment guide.

## 1. Prerequisites

- Node.js 20+
- A free [Supabase](https://supabase.com) project

## 2. Set up Supabase

1. Create a new Supabase project.
2. Open **SQL Editor** and run the entire contents of `supabase/schema.sql`.
   This creates all tables, RLS policies, the public-safe view, and the
   private `case-uploads` storage bucket.
3. Create your first admin login:
   - **Authentication → Users → Add user** — create a user with an email/password.
   - Copy that user's UUID.
   - In the SQL Editor, run:
     ```sql
     insert into public.admins (id, email, full_name, role)
     values ('<paste-user-uuid>', '<their-email>', '<Their Name>', 'superadmin');
     ```
   - Until a row exists in `admins`, that user can log in to `/login` but
     will be immediately signed back out of `/admin` (see `middleware.ts`).

## 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in from **Project Settings → API**:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` — **server-only secret**. Never prefix this
  with `NEXT_PUBLIC_`, never commit it, never log it. It's used only inside
  server actions (`app/report/actions.ts`) to write case rows and upload
  files with privileges the anonymous browser client doesn't have.
- `NEXT_PUBLIC_SITE_URL` — your deployed URL (used for metadata/sitemap).

## 4. Run locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`. File a test report at `/report`, then check
its status at `/case`. Sign in to `/admin` with the account you created above.

## 5. Deploy (Vercel, recommended)

1. Push this repo to GitHub.
2. Import it into [Vercel](https://vercel.com/new).
3. Add the four environment variables from step 3 in **Project Settings →
   Environment Variables** (set `NEXT_PUBLIC_SITE_URL` to your production
   domain, e.g. `https://yourdomain.com`).
4. Deploy. Vercel builds with `next build` automatically — the same command
   this project was validated against (`npx next build` completes cleanly
   with no type errors and no broken routes as of Phase 1).
5. Add your production domain to Supabase: **Authentication → URL
   Configuration → Site URL / Redirect URLs**, so admin auth cookies work
   correctly in production.

Any other Node-hosting platform (Render, Railway, Fly.io, self-hosted) works
too — the app has no Vercel-only dependencies.

## Security notes for reviewers

- The Supabase **service role key** is only ever imported in
  `lib/supabase/admin.ts`, which is used exclusively from server actions and
  Route Handlers — never from a Client Component. Double-check this stays
  true as Phase 2 adds admin write actions.
- RLS is enabled on every table. `anon` can only `INSERT` into `cases` and
  `case_files`, and `SELECT` from the `public_case_status` view (which
  exposes no PII). Direct `SELECT` on `cases` requires `is_admin()`.
- The `case-uploads` storage bucket is private with no public or anon
  policies — all reads/writes go through the service-role client
  server-side. Phase 2 will mint short-lived signed URLs for admin file
  viewing rather than exposing the bucket further.
- Before going live: rotate the service role key if it was ever pasted
  anywhere outside `.env.local`/your host's secret manager, and confirm
  `.env.local` is git-ignored (it is, via `.gitignore`).
