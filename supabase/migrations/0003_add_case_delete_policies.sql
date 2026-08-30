-- Adds admin DELETE policies for the case-management "delete a case"
-- feature. Without a DELETE policy on case_files specifically, deleting a
-- row from cases would fail: Postgres enforces the ON DELETE CASCADE from
-- case_files.case_id under RLS too, so the cascading delete needs its own
-- policy on the child table, not just on cases.
--
-- Safe to re-run.

drop policy if exists "admins can delete cases" on public.cases;
create policy "admins can delete cases"
  on public.cases for delete
  to authenticated
  using (public.is_admin());

drop policy if exists "admins can delete case files" on public.case_files;
create policy "admins can delete case files"
  on public.case_files for delete
  to authenticated
  using (public.is_admin());
