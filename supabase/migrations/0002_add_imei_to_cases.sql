-- Adds an IMEI field to public.cases for an EXISTING project (one where
-- supabase/schema.sql was already run). Run this once in the SQL Editor.
--
-- The column is nullable at the database layer on purpose: existing case
-- rows were filed before this field existed and have no IMEI, and this
-- migration must not invalidate them. "Required" is enforced at the
-- application layer instead — the report form and its server action
-- (lib/validation.ts, app/report/actions.ts) reject any new submission
-- without a valid 15-digit IMEI. Any value that IS present, old or new, is
-- still constrained to exactly 15 digits by the check constraint below.
--
-- Safe to re-run.

alter table public.cases
  add column if not exists imei text;

alter table public.cases
  drop constraint if exists cases_imei_format_check;

alter table public.cases
  add constraint cases_imei_format_check
  check (imei is null or imei ~ '^[0-9]{15}$');

-- Supports the admin dashboard's "search by IMEI" feature.
create index if not exists cases_imei_idx on public.cases (imei);
