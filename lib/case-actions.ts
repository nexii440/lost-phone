"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CASE_ID_PATTERN, normalizeCaseId } from "@/lib/case-id";
import { isCaseStatus } from "@/lib/status";

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

/**
 * Updates a case's status (active / not_active). Bound via
 * updateStatus.bind(null, caseId). Authorization is RLS ("admins can
 * update cases"), same as every other admin write in this file.
 */
export async function updateStatus(caseId: string, formData: FormData) {
  const normalized = normalizeCaseId(caseId);
  if (!CASE_ID_PATTERN.test(normalized)) {
    throw new Error("Invalid case ID.");
  }

  const status = formData.get("status");
  if (typeof status !== "string" || !isCaseStatus(status)) {
    throw new Error("Invalid status value.");
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("cases")
    .update({ status })
    .eq("case_id", normalized);

  if (error) {
    throw new Error(`Failed to update status: ${error.message}`);
  }

  revalidatePath(`/admin/cases/${normalized}`);
  revalidatePath("/admin");
}

/**
 * Saves an admin-only remark on a case (e.g. "Owner contacted"). Never
 * visible to the public — RLS on `cases` already restricts SELECT to
 * admins, same as contact_email/contact_phone always have been, and
 * public_case_status never includes this column.
 */
export async function updateRemark(caseId: string, formData: FormData) {
  const normalized = normalizeCaseId(caseId);
  if (!CASE_ID_PATTERN.test(normalized)) {
    throw new Error("Invalid case ID.");
  }

  const raw = formData.get("admin_remark");
  const remark = typeof raw === "string" ? raw.trim() : "";

  if (remark.length > 2000) {
    throw new Error("Remark must be under 2000 characters.");
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("cases")
    .update({ admin_remark: remark || null })
    .eq("case_id", normalized);

  if (error) {
    throw new Error(`Failed to save remark: ${error.message}`);
  }

  revalidatePath(`/admin/cases/${normalized}`);
  revalidatePath("/admin");
}
