"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { reportSchema } from "@/lib/validation";
import { generateCaseId } from "@/lib/case-id";

export type ReportFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const MAX_FILES = 5;
const MAX_CASE_ID_ATTEMPTS = 5;
const UNIQUE_VIOLATION = "23505";

export async function submitReport(
  _prevState: ReportFormState,
  formData: FormData
): Promise<ReportFormState> {
  if (formData.get("consent") !== "on") {
    return {
      error: "Please confirm you understand what this registry does before submitting.",
    };
  }

  const parsed = reportSchema.safeParse({
    device_type: formData.get("device_type"),
    brand: formData.get("brand"),
    model: formData.get("model"),
    imei_1: formData.get("imei_1"),
    imei_2: formData.get("imei_2"),
    color: formData.get("color"),
    last_seen_location: formData.get("last_seen_location"),
    last_seen_date: formData.get("last_seen_date"),
    description: formData.get("description"),
    contact_email: formData.get("contact_email"),
    contact_phone: formData.get("contact_phone"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return { error: "Please fix the highlighted fields.", fieldErrors };
  }

  const rawFiles = formData.getAll("photos");
  const files = rawFiles.filter(
    (f): f is File => f instanceof File && f.size > 0
  );

  if (files.length > MAX_FILES) {
    return {
      error: "Please fix the highlighted fields.",
      fieldErrors: { photos: `Attach at most ${MAX_FILES} files.` },
    };
  }

  for (const file of files) {
    if (file.size > MAX_PHOTO_BYTES) {
      return {
        error: "Please fix the highlighted fields.",
        fieldErrors: { photos: `"${file.name}" is over 5MB.` },
      };
    }
    if (!file.type.startsWith("image/")) {
      return {
        error: "Please fix the highlighted fields.",
        fieldErrors: { photos: `"${file.name}" isn't an image file.` },
      };
    }
  }

  const admin = createAdminClient();

  let caseId = "";
  let caseRowId = "";

  for (let attempt = 0; attempt < MAX_CASE_ID_ATTEMPTS; attempt++) {
    const candidate = generateCaseId();
    const { data, error } = await admin
      .from("cases")
      .insert({ ...parsed.data, case_id: candidate })
      .select("id, case_id")
      .single();

    if (!error && data) {
      caseId = data.case_id;
      caseRowId = data.id;
      break;
    }

    if (error && error.code !== UNIQUE_VIOLATION) {
      console.error("Failed to create case:", error);
      return { error: "Something went wrong saving your report. Please try again." };
    }
  }

  if (!caseId) {
    return { error: "Something went wrong generating a case ID. Please try again." };
  }

  for (const file of files) {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${caseId}/${randomUUID()}.${ext}`;
    const bytes = new Uint8Array(await file.arrayBuffer());

    const { error: uploadError } = await admin.storage
      .from("case-uploads")
      .upload(path, bytes, { contentType: file.type, upsert: false });

    if (!uploadError) {
      await admin.from("case_files").insert({
        case_id: caseRowId,
        storage_path: path,
        file_name: file.name,
        content_type: file.type,
        size_bytes: file.size,
      });
    } else {
      // The case itself was created successfully; a failed upload for one
      // file shouldn't block the report or the other files. Log it for
      // admin follow-up.
      console.error("File upload failed (case was still created):", uploadError);
    }
  }

  redirect(`/report/success?case=${caseId}`);
}
