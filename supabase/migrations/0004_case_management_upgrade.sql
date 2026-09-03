-- Case management upgrade: two IMEI fields, admin remarks, and a
-- simplified active/not_active status. Written defensively — every step
-- inspects the actual current schema state rather than assuming a fixed
-- starting point, so it's safe to run regardless of exactly which prior
-- migrations already ran on this database, and existing case data is
-- preserved throughout, never discarded.
--
-- Safe to re-run.

-- ---------------------------------------------------------------------------
-- 1. IMEI: split into imei_1 (required at the app layer) and imei_2
--    (optional). If an existing singular `imei` column is present (from
--    migrations/0002), its data is migrated via RENAME — not copied into a
--    new column while the old one lingers — so there's exactly one column
--    holding that data before and after, with existing values preserved.
-- ---------------------------------------------------------------------------
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'cases' and column_name = 'imei'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'cases' and column_name = 'imei_1'
  ) then
    alter table public.cases rename column imei to imei_1;
  elsif not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'cases' and column_name = 'imei_1'
  ) then
    alter table public.cases add column imei_1 text;
  end if;
end $$;

alter table public.cases add column if not exists imei_2 text;

-- Renaming a column carries its existing constraints/indexes along under
-- their OLD names (Postgres doesn't rename those automatically). Find and
-- drop the old imei check constraint by inspecting its actual definition,
-- rather than assuming its name.
do $$
declare
  old_constraint text;
begin
  select con.conname into old_constraint
  from pg_constraint con
  join pg_class rel on rel.oid = con.conrelid
  join pg_namespace nsp on nsp.oid = rel.relnamespace
  where nsp.nspname = 'public'
    and rel.relname = 'cases'
    and con.contype = 'c'
    and pg_get_constraintdef(con.oid) ilike '%imei%';

  if old_constraint is not null then
    execute format('alter table public.cases drop constraint %I', old_constraint);
  end if;
end $$;

drop index if exists cases_imei_idx;

alter table public.cases drop constraint if exists cases_imei_1_format_check;
alter table public.cases
  add constraint cases_imei_1_format_check
  check (imei_1 is null or imei_1 ~ '^[0-9]{15}$');

alter table public.cases drop constraint if exists cases_imei_2_format_check;
alter table public.cases
  add constraint cases_imei_2_format_check
  check (imei_2 is null or imei_2 ~ '^[0-9]{15}$');

create index if not exists cases_imei_1_idx on public.cases (imei_1);
create index if not exists cases_imei_2_idx on public.cases (imei_2);

-- ---------------------------------------------------------------------------
-- 2. Admin remark — free text, admin-only. Never exposed via
--    public_case_status (rebuilt below with the same column set as
--    before), and RLS on the base `cases` table already restricts SELECT
--    to admins, same as contact_email/contact_phone always have been.
-- ---------------------------------------------------------------------------
alter table public.cases add column if not exists admin_remark text;

-- ---------------------------------------------------------------------------
-- 3. Status: migrate open/found/closed to active/not_active, preserving
--    the meaning of existing rows rather than discarding it — an 'open'
--    case is still active; 'found' and 'closed' cases are no longer
--    active. The existing check constraint is located by its actual
--    definition (not a guessed name) before being replaced.
-- ---------------------------------------------------------------------------
do $$
declare
  old_constraint text;
begin
  select con.conname into old_constraint
  from pg_constraint con
  join pg_class rel on rel.oid = con.conrelid
  join pg_namespace nsp on nsp.oid = rel.relnamespace
  where nsp.nspname = 'public'
    and rel.relname = 'cases'
    and con.contype = 'c'
    and pg_get_constraintdef(con.oid) ilike '%status%';

  if old_constraint is not null then
    execute format('alter table public.cases drop constraint %I', old_constraint);
  end if;
end $$;

update public.cases set status = 'active' where status = 'open';
update public.cases set status = 'not_active' where status in ('found', 'closed');

alter table public.cases drop constraint if exists cases_status_check;
alter table public.cases
  add constraint cases_status_check
  check (status in ('active', 'not_active'));

alter table public.cases alter column status set default 'active';

-- ---------------------------------------------------------------------------
-- public_case_status: rebuilt with the same column set as before (no
-- imei_1/imei_2/admin_remark exposed — unchanged design intent, these
-- stay admin-only). Only the underlying status values change, naturally,
-- since this view just selects the column.
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
