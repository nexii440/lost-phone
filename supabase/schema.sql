-- FindMyLost Case Registry — Phase 1 schema
-- Run this once, in full, in the Supabase SQL Editor on a fresh project.
-- Safe to re-run: every statement is idempotent (create-if-not-exists /
-- create-or-replace / on-conflict-do-nothing).
--
-- Already ran this once against a project that has data in it? This file's
-- `create table if not exists` won't retroactively add new columns to an
-- existing table (e.g. `imei_1`/`imei_2`/`admin_remark`, or the
-- active/not_active status rename) — run the numbered files in
-- supabase/migrations/ in order instead.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- admins — allowlist of users who may sign in to /admin.
-- Rows are inserted manually via the SQL editor (see README §2), never via
-- the app itself, so there is no public insert/update/delete path.
-- ---------------------------------------------------------------------------
create table if not exists public.admins (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- cases — one row per lost-device report. The public-facing identifier is
-- case_id (e.g. "FML-7K9QXN"), never the internal uuid.
-- ---------------------------------------------------------------------------
create table if not exists public.cases (
  id uuid primary key default gen_random_uuid(),
  case_id text not null unique,
  device_type text not null,
  brand text not null,
  model text,
  -- imei_1 is required at the application layer (lib/validation.ts / the
  -- report form); imei_2 is always optional. Both are nullable here so a
  -- direct/manual insert is never blocked, and so this definition matches
  -- migrations/0004 exactly for projects that split the original single
  -- `imei` column after cases already had rows.
  imei_1 text,
  imei_2 text,
  color text,
  last_seen_location text not null,
  last_seen_date date not null,
  description text not null,
  contact_email text not null,
  contact_phone text,
  status text not null default 'active' check (status in ('active', 'not_active')),
  -- Admin-only free text (e.g. "Owner contacted", "Device recovered").
  -- Never exposed via public_case_status; RLS on this table already
  -- restricts SELECT to admins, same as contact_email/contact_phone.
  admin_remark text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cases_imei_1_format_check check (imei_1 is null or imei_1 ~ '^[0-9]{15}$'),
  constraint cases_imei_2_format_check check (imei_2 is null or imei_2 ~ '^[0-9]{15}$')
);

create index if not exists cases_created_at_idx on public.cases (created_at desc);
create index if not exists cases_status_idx on public.cases (status);
-- Support the admin dashboard's search-by-IMEI/case-ID feature.
create index if not exists cases_imei_1_idx on public.cases (imei_1);
create index if not exists cases_imei_2_idx on public.cases (imei_2);

-- ---------------------------------------------------------------------------
-- case_files — optional photo(s) attached to a report. Actual bytes live in
-- the private "case-uploads" storage bucket; this row is just the pointer.
-- ---------------------------------------------------------------------------
create table if not exists public.case_files (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases (id) on delete cascade,
  storage_path text not null,
  file_name text,
  content_type text,
  size_bytes bigint,
  uploaded_at timestamptz not null default now()
);

create index if not exists case_files_case_id_idx on public.case_files (case_id);

-- ---------------------------------------------------------------------------
-- keep cases.updated_at current on every update
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists cases_set_updated_at on public.cases;
create trigger cases_set_updated_at
  before update on public.cases
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- is_admin() — security-definer helper so RLS policies (and each other) can
-- check the admins table without recursive-RLS issues. Runs as the function
-- owner, so it bypasses RLS on public.admins internally.
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.admins where id = auth.uid()
  );
$$;

grant execute on function public.is_admin() to authenticated, anon;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.admins enable row level security;
alter table public.cases enable row level security;
alter table public.case_files enable row level security;

-- admins: a signed-in user may see their own admin row (this is what
-- middleware.ts's fast-path check relies on) and nothing else.
drop policy if exists "admins can view own row" on public.admins;
create policy "admins can view own row"
  on public.admins for select
  to authenticated
  using (id = auth.uid());

-- cases: anyone (including anonymous visitors) may file a report.
drop policy if exists "anyone can file a report" on public.cases;
create policy "anyone can file a report"
  on public.cases for insert
  to anon, authenticated
  with check (true);

-- cases: only admins may read the full table (contact_email/contact_phone
-- live here — this is the PII-bearing table).
drop policy if exists "admins can view all cases" on public.cases;
create policy "admins can view all cases"
  on public.cases for select
  to authenticated
  using (public.is_admin());

-- cases: only admins may update status/notes (Phase 2 UI will use this;
-- the policy is in place now so no schema change is needed to ship it).
drop policy if exists "admins can update cases" on public.cases;
create policy "admins can update cases"
  on public.cases for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- cases: only admins may delete a case (used by the admin dashboard's
-- delete-case action).
drop policy if exists "admins can delete cases" on public.cases;
create policy "admins can delete cases"
  on public.cases for delete
  to authenticated
  using (public.is_admin());

-- case_files: anyone may attach a file pointer while filing a report.
drop policy if exists "anyone can attach a case file" on public.case_files;
create policy "anyone can attach a case file"
  on public.case_files for insert
  to anon, authenticated
  with check (true);

-- case_files: only admins may list attached files.
drop policy if exists "admins can view case files" on public.case_files;
create policy "admins can view case files"
  on public.case_files for select
  to authenticated
  using (public.is_admin());

-- case_files: only admins may delete file records. Required for deleting
-- a case to succeed: the ON DELETE CASCADE from cases to case_files is
-- itself subject to RLS on case_files, so without this policy a cascading
-- delete would be silently blocked.
drop policy if exists "admins can delete case files" on public.case_files;
create policy "admins can delete case files"
  on public.case_files for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- public_case_status — the only thing anonymous visitors can query on
-- /case. Deliberately excludes contact_email, contact_phone, and the free-
-- text description so no PII is ever exposed by a case-ID lookup.
--
-- This view is created by the table owner (the role running this script in
-- the SQL editor), which is also the owner of public.cases and therefore
-- bypasses that table's RLS internally. Granting SELECT on the view to
-- anon/authenticated is what actually exposes it — RLS on public.cases
-- itself is untouched and still blocks any direct query against that table.
-- ---------------------------------------------------------------------------
create or replace view public.public_case_status as
select
  case_id,
  device_type,
  brand,
  model,
  color,
  last_seen_location,
  last_seen_date,
  status,
  created_at,
  updated_at
from public.cases;

grant select on public.public_case_status to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Private storage bucket for report photos. No storage.objects policies are
-- added for anon/authenticated on purpose — every read and write goes
-- through the service-role client (lib/supabase/admin.ts) from server-side
-- code only. See README "Security notes for reviewers".
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('case-uploads', 'case-uploads', false)
on conflict (id) do nothing;
