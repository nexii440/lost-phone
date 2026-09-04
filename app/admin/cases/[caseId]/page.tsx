import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CASE_ID_PATTERN, normalizeCaseId } from "@/lib/case-id";
import { isCaseStatus, STATUS_DESCRIPTION } from "@/lib/status";
import { StatusBadge } from "@/components/StatusBadge";
import { DeleteCaseButton } from "@/components/DeleteCaseButton";
import { StatusUpdateForm } from "@/components/StatusUpdateForm";
import { RemarkForm } from "@/components/RemarkForm";
import { PhotoLightbox, type LightboxFile } from "@/components/PhotoLightbox";
import { deleteCase } from "@/lib/case-actions";

type CaseDetail = {
  id: string;
  case_id: string;
  device_type: string;
  brand: string;
  model: string | null;
  imei_1: string | null;
  imei_2: string | null;
  color: string | null;
  last_seen_location: string;
  last_seen_date: string;
  description: string;
  contact_email: string;
  contact_phone: string | null;
  status: string;
  admin_remark: string | null;
  created_at: string;
  updated_at: string;
};

type CaseFile = {
  id: string;
  storage_path: string;
  file_name: string | null;
  uploaded_at: string;
};

// Signed URLs are short-lived, scoped tokens — safe to embed directly in
// server-rendered HTML sent to an authenticated admin's browser. This is
// not the same as exposing the bucket publicly: each URL only grants
// read access to one specific object, and only for this long.
const SIGNED_URL_EXPIRY_SECONDS = 3600;

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function AdminCaseDetailPage({
  params,
}: {
  params: { caseId: string };
}) {
  const caseId = normalizeCaseId(decodeURIComponent(params.caseId));

  if (!CASE_ID_PATTERN.test(caseId)) {
    notFound();
  }

  // RLS-gated: this only returns a row because the signed-in user passes
  // the "admins can view all cases" policy. Full detail — including
  // contact_email/contact_phone/description/imei_1/imei_2/admin_remark —
  // is exactly what an authorized admin is meant to see; there's no
  // separate PII filtering to apply here the way /case has for the
  // public view.
  const supabase = createClient();

  const { data: caseRow, error: caseError } = await supabase
    .from("cases")
    .select(
      "id, case_id, device_type, brand, model, imei_1, imei_2, color, last_seen_location, last_seen_date, description, contact_email, contact_phone, status, admin_remark, created_at, updated_at"
    )
    .eq("case_id", caseId)
    .maybeSingle();

  if (caseError) {
    throw new Error(`Failed to load case: ${caseError.message}`);
  }

  if (!caseRow) {
    notFound();
  }

  const record = caseRow as CaseDetail;

  const { data: files } = await supabase
    .from("case_files")
    .select("id, storage_path, file_name, uploaded_at")
    .eq("case_id", record.id)
    .order("uploaded_at", { ascending: false });

  const caseFiles = (files ?? []) as CaseFile[];

  // Signed URLs are generated here, server-side, via the service-role
  // client — the case-uploads bucket has no anon/authenticated storage
  // policies at all (by design; see supabase/schema.sql), so this is the
  // one genuinely-required use of that client on this page. This only
  // runs after requireAdmin() has already authorized the request
  // (app/admin/layout.tsx gates every route under /admin). The resulting
  // signed URLs — not the service-role key itself — are what reach the
  // browser.
  let lightboxFiles: LightboxFile[] = [];
  if (caseFiles.length > 0) {
    const admin = createAdminClient();
    const signed = await Promise.all(
      caseFiles.map(async (f) => {
        const { data, error } = await admin.storage
          .from("case-uploads")
          .createSignedUrl(f.storage_path, SIGNED_URL_EXPIRY_SECONDS);
        if (error || !data) {
          console.error(`Failed to sign URL for ${f.storage_path}:`, error);
          return null;
        }
        return {
          id: f.id,
          url: data.signedUrl,
          fileName: f.file_name ?? "Unnamed file",
          uploadedAt: f.uploaded_at,
        };
      })
    );
    lightboxFiles = signed.filter((f): f is LightboxFile => f !== null);
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link href="/admin" className="text-sm text-ink-600 hover:text-ink-950">
        ← Back to all cases
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-sm text-ink-500">{record.case_id}</p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-ink-950">
            {[record.color, record.brand, record.model].filter(Boolean).join(" ")}{" "}
            <span className="font-sans text-base font-normal text-ink-600">
              ({record.device_type})
            </span>
          </h1>
        </div>
        {isCaseStatus(record.status) && <StatusBadge status={record.status} />}
      </div>

      {isCaseStatus(record.status) && (
        <p className="mt-2 text-sm text-ink-600">{STATUS_DESCRIPTION[record.status]}</p>
      )}

      <dl className="mt-8 grid gap-x-8 gap-y-5 border-t border-ink-800/10 pt-6 sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-wide text-ink-500">IMEI 1</dt>
          <dd className="mt-1 font-mono text-ink-950">{record.imei_1 ?? "Not recorded"}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-ink-500">IMEI 2</dt>
          <dd className="mt-1 font-mono text-ink-950">{record.imei_2 ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-ink-500">Last seen</dt>
          <dd className="mt-1 text-ink-900">{record.last_seen_location}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-ink-500">Last seen date</dt>
          <dd className="mt-1 text-ink-900">{formatDate(record.last_seen_date)}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-ink-500">Filed</dt>
          <dd className="mt-1 text-ink-900">{formatDateTime(record.created_at)}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-ink-500">Last updated</dt>
          <dd className="mt-1 text-ink-900">{formatDateTime(record.updated_at)}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs uppercase tracking-wide text-ink-500">Description</dt>
          <dd className="mt-1 whitespace-pre-wrap text-ink-900">{record.description}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-ink-500">Contact email</dt>
          <dd className="mt-1 text-ink-900">{record.contact_email}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-ink-500">Contact phone</dt>
          <dd className="mt-1 text-ink-900">{record.contact_phone ?? "—"}</dd>
        </div>
      </dl>

      {/* Photos / Documents */}
      <div id="photos" className="mt-8 scroll-mt-6 border-t border-ink-800/10 pt-6">
        <h2 className="text-xs uppercase tracking-wide text-ink-500">
          Photos / Documents ({lightboxFiles.length})
        </h2>
        {lightboxFiles.length === 0 ? (
          <p className="mt-2 text-sm text-ink-600">No files were attached to this report.</p>
        ) : (
          <div className="mt-3">
            <PhotoLightbox files={lightboxFiles} />
          </div>
        )}
      </div>

      {/* Status */}
      <div className="mt-8 border-t border-ink-800/10 pt-6">
        <h2 className="text-xs uppercase tracking-wide text-ink-500">Status</h2>
        {isCaseStatus(record.status) && (
          <StatusUpdateForm caseId={record.case_id} currentStatus={record.status} />
        )}
      </div>

      {/* Admin remark */}
      <div className="mt-8 border-t border-ink-800/10 pt-6">
        <h2 className="text-xs uppercase tracking-wide text-ink-500">
          Admin remark <span className="normal-case text-ink-400">(not visible to the public)</span>
        </h2>
        <RemarkForm caseId={record.case_id} currentRemark={record.admin_remark} />
      </div>

      <div className="mt-10 border-t border-ink-800/10 pt-6">
        <form action={deleteCase.bind(null, record.case_id)}>
          <DeleteCaseButton caseId={record.case_id} />
        </form>
      </div>
    </div>
  );
}
