import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CASE_ID_PATTERN, normalizeCaseId } from "@/lib/case-id";
import { isCaseStatus, STATUS_DESCRIPTION } from "@/lib/status";
import { StatusBadge } from "@/components/StatusBadge";
import { DeleteCaseButton } from "@/components/DeleteCaseButton";
import { deleteCase } from "./actions";

type CaseDetail = {
  id: string;
  case_id: string;
  device_type: string;
  brand: string;
  model: string | null;
  imei: string | null;
  color: string | null;
  last_seen_location: string;
  last_seen_date: string;
  description: string;
  contact_email: string;
  contact_phone: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

type CaseFile = {
  id: string;
  file_name: string | null;
  uploaded_at: string;
};

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
  // the "admins can view all cases" policy. There's no separate PII
  // filtering to apply here the way /case has for the public view — full
  // detail, including contact_email/contact_phone/description/imei, is
  // exactly what an authorized admin is meant to see.
  const supabase = createClient();

  const { data: caseRow, error: caseError } = await supabase
    .from("cases")
    .select(
      "id, case_id, device_type, brand, model, imei, color, last_seen_location, last_seen_date, description, contact_email, contact_phone, status, created_at, updated_at"
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
    .select("id, file_name, uploaded_at")
    .eq("case_id", record.id)
    .order("uploaded_at", { ascending: false });

  const caseFiles = (files ?? []) as CaseFile[];

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
          <dt className="text-xs uppercase tracking-wide text-ink-500">IMEI</dt>
          <dd className="mt-1 font-mono text-ink-950">{record.imei ?? "Not recorded"}</dd>
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

      {caseFiles.length > 0 && (
        <div className="mt-8 border-t border-ink-800/10 pt-6">
          <h2 className="text-xs uppercase tracking-wide text-ink-500">
            Attached files ({caseFiles.length})
          </h2>
          <ul className="mt-2 space-y-1 text-sm text-ink-800">
            {caseFiles.map((f) => (
              <li key={f.id}>
                {f.file_name ?? "Unnamed file"} — {formatDateTime(f.uploaded_at)}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-ink-500">
            Signed-URL viewing of attached files ships in Phase 2.
          </p>
        </div>
      )}

      <div className="mt-10 border-t border-ink-800/10 pt-6">
        <form action={deleteCase.bind(null, record.case_id)}>
          <DeleteCaseButton caseId={record.case_id} />
        </form>
      </div>
    </div>
  );
}
