"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CASE_ID_PATTERN, normalizeCaseId } from "@/lib/case-id";

/**
 * Deletes a case permanently. Bound to a form via
 * deleteCase.bind(null, caseId), so the only argument the form itself
 * supplies is formData.
 */
export async function deleteCase(caseId: string, _formData: FormData) {
  const normalized = normalizeCaseId(caseId);
  if (!CASE_ID_PATTERN.test(normalized)) {
    throw new Error("Invalid case ID.");
  }

  // RLS-gated client (anon key + the admin's own session) — this is the
  // real authorization boundary for the delete itself, via the "admins
  // can delete cases" policy in supabase/schema.sql. app/admin/layout.tsx
  // already gates every route under /admin via requireAdmin(), but RLS is
  // the defense-in-depth backstop if that check were ever bypassed —
  // deliberately not using the service-role client here, since it isn't
  // needed: an authorized admin session already has exactly the
  // permission this operation requires.
  const supabase = createClient();

  const { data: caseRow, error: fetchError } = await supabase
    .from("cases")
    .select("id")
    .eq("case_id", normalized)
    .maybeSingle();

  if (fetchError) {
    throw new Error(`Failed to look up case: ${fetchError.message}`);
  }

  if (!caseRow) {
    redirect("/admin");
  }

  // Look up attached files before deleting, so the storage objects can be
  // cleaned up afterward.
  const { data: files } = await supabase
    .from("case_files")
    .select("storage_path")
    .eq("case_id", caseRow.id);

  // Delete the case row. RLS ("admins can delete cases") is what actually
  // authorizes this. Cascades to case_files automatically — the
  // "admins can delete case files" policy exists specifically so that
  // cascade isn't itself blocked by RLS on the child table.
  const { error: deleteError } = await supabase.from("cases").delete().eq("id", caseRow.id);

  if (deleteError) {
    throw new Error(`Failed to delete case: ${deleteError.message}`);
  }

  // Best-effort cleanup of the actual storage objects. The case-uploads
  // bucket intentionally has no anon/authenticated policies (see
  // schema.sql) — every read/write goes through the service-role client —
  // so this genuinely requires it; there's no other way to remove
  // objects from that bucket. The case row is already gone at this point
  // regardless of whether this step succeeds.
  const paths = (files ?? [])
    .map((f) => f.storage_path)
    .filter((p): p is string => Boolean(p));

  if (paths.length > 0) {
    try {
      const admin = createAdminClient();
      const { error: storageError } = await admin.storage.from("case-uploads").remove(paths);
      if (storageError) {
        console.error("Failed to clean up storage objects for deleted case:", storageError);
      }
    } catch (err) {
      console.error("Storage cleanup threw for deleted case:", err);
    }
  }

  redirect("/admin");
}
