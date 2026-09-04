import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isCaseStatus, STATUS_LABEL, type CaseStatus } from "@/lib/status";
import { StatusBadge } from "@/components/StatusBadge";
import { DeleteCaseButton } from "@/components/DeleteCaseButton";
import { deleteCase } from "@/lib/case-actions";

export const metadata: Metadata = { title: "Dashboard" };

type CaseRow = {
  case_id: string;
  device_type: string;
  brand: string;
  model: string | null;
  imei_1: string | null;
  imei_2: string | null;
  contact_phone: string | null;
  status: string;
  admin_remark: string | null;
  created_at: string;
};

const STATUS_FILTERS: Array<{ value: "all" | CaseStatus; label: string }> = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "active", label: "Active" },
  { value: "not_active", label: "Not Active" },
];

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function remarkPreview(remark: string | null): string {
  if (!remark) return "—";
  const trimmed = remark.trim();
  return trimmed.length > 40 ? `${trimmed.slice(0, 40)}…` : trimmed;
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string };
}) {
  const rawQuery = (searchParams.q ?? "").trim();
  // Strip characters that would break PostgREST's .or() filter syntax.
  const safeQuery = rawQuery.replace(/[,()]/g, "").trim();
  const statusFilter =
    searchParams.status === "pending" ||
    searchParams.status === "active" ||
    searchParams.status === "not_active"
      ? searchParams.status
      : "all";

  const supabase = createClient();
  let query = supabase
    .from("cases")
    .select(
      "case_id, device_type, brand, model, imei_1, imei_2, contact_phone, status, admin_remark, created_at"
    )
    .order("created_at", { ascending: false });

  if (safeQuery) {
    query = query.or(
      `case_id.ilike.%${safeQuery}%,imei_1.ilike.%${safeQuery}%,imei_2.ilike.%${safeQuery}%,` +
        `contact_phone.ilike.%${safeQuery}%,brand.ilike.%${safeQuery}%,model.ilike.%${safeQuery}%`
    );
  } else {
    query = query.limit(50);
  }

  if (statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  const { data, error } = await query;

  const cases = (data ?? []) as CaseRow[];

  function filterUrl(next: { q?: string; status?: string }) {
    const params = new URLSearchParams();
    const q = next.q ?? rawQuery;
    const status = next.status ?? statusFilter;
    if (q) params.set("q", q);
    if (status !== "all") params.set("status", status);
    const qs = params.toString();
    return qs ? `/admin?${qs}` : "/admin";
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold text-ink-950">
          {safeQuery || statusFilter !== "all" ? "Search results" : "Recent cases"}
        </h1>
        <p className="text-sm text-ink-500">
          {safeQuery ? `Matching "${safeQuery}"` : "Showing the latest 50"}
        </p>
      </div>

      <form action="/admin" method="get" className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          name="q"
          defaultValue={rawQuery}
          placeholder="Search by case ID, IMEI, phone, or model"
          className="w-full rounded-md border border-ink-800/20 bg-white px-4 py-2 text-sm text-ink-950 placeholder:text-ink-500/60 focus:border-flare-500 focus:outline-none sm:max-w-sm"
        />
        {statusFilter !== "all" && <input type="hidden" name="status" value={statusFilter} />}
        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-md bg-ink-950 px-5 py-2 text-sm font-medium text-paper-50 hover:bg-ink-900"
          >
            Search
          </button>
          {(safeQuery || statusFilter !== "all") && (
            <a
              href="/admin"
              className="rounded-md border border-ink-800/20 px-5 py-2 text-sm font-medium text-ink-800 hover:border-ink-800/40 hover:text-ink-950"
            >
              Clear
            </a>
          )}
        </div>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <a
            key={f.value}
            href={filterUrl({ status: f.value })}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              statusFilter === f.value
                ? "border-ink-950 bg-ink-950 text-paper-50"
                : "border-ink-800/20 text-ink-700 hover:border-ink-800/40"
            }`}
          >
            {f.label}
          </a>
        ))}
      </div>

      {error && (
        <div className="mt-6 rounded-md border border-flare-600/30 bg-flare-500/10 px-4 py-3 text-sm text-flare-600">
          Couldn&apos;t load cases right now. Please refresh.
        </div>
      )}

      {!error && cases.length === 0 && (
        <div className="mt-6 rounded-lg border border-ink-800/10 bg-white px-6 py-10 text-center">
          <p className="font-medium text-ink-950">
            {safeQuery || statusFilter !== "all" ? "No cases match those filters." : "No cases yet."}
          </p>
          <p className="mt-1 text-sm text-ink-600">
            {safeQuery || statusFilter !== "all" ? (
              "Try a different search term or clear the filters."
            ) : (
              <>
                Reports filed at <code className="font-mono">/report</code> will show up here.
              </>
            )}
          </p>
        </div>
      )}

      {!error && cases.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-lg border border-ink-800/10 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink-800/10 text-ink-500">
              <tr>
                <th className="px-4 py-3 font-medium">Case ID</th>
                <th className="px-4 py-3 font-medium">Phone Model</th>
                <th className="px-4 py-3 font-medium">IMEI 1</th>
                <th className="px-4 py-3 font-medium">IMEI 2</th>
                <th className="px-4 py-3 font-medium">Phone Number</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Submitted</th>
                <th className="px-4 py-3 font-medium">Photos</th>
                <th className="px-4 py-3 font-medium">Admin Remark</th>
                <th className="px-4 py-3 font-medium">Edit</th>
                <th className="px-4 py-3 font-medium">Delete</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => {
                const detailHref = `/admin/cases/${encodeURIComponent(c.case_id)}`;
                return (
                  <tr key={c.case_id} className="border-b border-ink-800/5 last:border-0">
                    <td className="px-4 py-3 font-mono text-ink-950">
                      <Link href={detailHref} className="hover:text-flare-600 hover:underline">
                        {c.case_id}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-ink-800">
                      {[c.brand, c.model].filter(Boolean).join(" ") || "—"}
                    </td>
                    <td className="px-4 py-3 font-mono text-ink-800">
                      {c.imei_1 ?? <span className="text-ink-500">—</span>}
                    </td>
                    <td className="px-4 py-3 font-mono text-ink-800">
                      {c.imei_2 ?? <span className="text-ink-500">—</span>}
                    </td>
                    <td className="px-4 py-3 text-ink-800">{c.contact_phone ?? "—"}</td>
                    <td className="px-4 py-3">
                      {isCaseStatus(c.status) && <StatusBadge status={c.status} />}
                    </td>
                    <td className="px-4 py-3 text-ink-600">{formatDate(c.created_at)}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`${detailHref}#photos`}
                        className="text-flare-600 hover:underline"
                      >
                        View
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-ink-700">{remarkPreview(c.admin_remark)}</td>
                    <td className="px-4 py-3">
                      <Link href={detailHref} className="text-ink-700 hover:underline">
                        Edit
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <form action={deleteCase.bind(null, c.case_id)}>
                        <DeleteCaseButton caseId={c.case_id} />
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
