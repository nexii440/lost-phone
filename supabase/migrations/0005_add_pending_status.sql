-- Adds a third status value, 'pending', and makes it the default for new
-- cases. Existing cases are NOT reset to pending — their current
-- active/not_active value is preserved exactly; only the DEFAULT applied
-- to future inserts changes. Written defensively: the existing check
-- constraint is located by inspecting its actual definition (not a
-- guessed name) and dropped BEFORE any data is touched, so a
-- normalization step can never be blocked by a constraint that doesn't
-- yet allow the value being written — this handles the case safely even
-- if existing values turn out to be a different case than expected
-- (e.g. 'ACTIVE' instead of 'active').
--
-- Safe to re-run.

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

-- Normalize case defensively (e.g. 'ACTIVE' -> 'active'). No-op for any
-- row that's already lowercase, which is the expected common case.
update public.cases set status = lower(status) where status <> lower(status);

alter table public.cases drop constraint if exists cases_status_check;
alter table public.cases
  add constraint cases_status_check
  check (status in ('pending', 'active', 'not_active'));

alter table public.cases alter column status set default 'pending';

-- public_case_status is unchanged in shape (same columns as before) —
-- rebuilt only so it reflects the new constraint transparently; no new
-- column is exposed.
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
