import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isCaseStatus } from "@/lib/status";
import { StatusBadge } from "@/components/StatusBadge";

export const metadata: Metadata = { title: "Dashboard" };

type CaseRow = {
  case_id: string;
  device_type: string;
  brand: string;
  model: string | null;
  imei: string | null;
  status: string;
  last_seen_location: string;
  created_at: string;
};

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: { imei?: string };
}) {
  const imeiQuery = (searchParams.imei ?? "").trim();

  const supabase = createClient();
  let query = supabase
    .from("cases")
    .select("case_id, device_type, brand, model, imei, status, last_seen_location, created_at")
    .order("created_at", { ascending: false });

  // Digits-only partial match — an admin may only have part of an IMEI on
  // hand (e.g. from a carrier or a buyer), so this doesn't require the
  // full 15 digits the way the report form's own validation does.
  const imeiDigits = imeiQuery.replace(/[^0-9]/g, "");
  query = imeiDigits ? query.ilike("imei", `%${imeiDigits}%`) : query.limit(25);

  const { data, error } = await query;

  const cases = (data ?? []) as CaseRow[];

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold text-ink-950">
          {imeiDigits ? "Search results" : "Recent cases"}
        </h1>
        <p className="text-sm text-ink-500">
          {imeiDigits ? `Matching IMEI containing "${imeiDigits}"` : "Showing the latest 25"}
        </p>
      </div>

      <form action="/admin" method="get" className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          name="imei"
          defaultValue={imeiQuery}
          placeholder="Search by IMEI"
          inputMode="numeric"
          className="w-full rounded-md border border-ink-800/20 bg-white px-4 py-2 font-mono text-sm text-ink-950 placeholder:font-sans placeholder:text-ink-500/60 focus:border-flare-500 focus:outline-none sm:max-w-xs"
        />
        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-md bg-ink-950 px-5 py-2 text-sm font-medium text-paper-50 hover:bg-ink-900"
          >
            Search
          </button>
          {imeiDigits && (
            <a
              href="/admin"
              className="rounded-md border border-ink-800/20 px-5 py-2 text-sm font-medium text-ink-800 hover:border-ink-800/40 hover:text-ink-950"
            >
              Clear
            </a>
          )}
        </div>
      </form>

      {error && (
        <div className="mt-6 rounded-md border border-flare-600/30 bg-flare-500/10 px-4 py-3 text-sm text-flare-600">
          Couldn&apos;t load cases right now. Please refresh.
        </div>
      )}

      {!error && cases.length === 0 && imeiDigits && (
        <div className="mt-6 rounded-lg border border-ink-800/10 bg-white px-6 py-10 text-center">
          <p className="font-medium text-ink-950">No cases match that IMEI.</p>
          <p className="mt-1 text-sm text-ink-600">Double-check the digits and try again.</p>
        </div>
      )}

      {!error && cases.length === 0 && !imeiDigits && (
        <div className="mt-6 rounded-lg border border-ink-800/10 bg-white px-6 py-10 text-center">
          <p className="font-medium text-ink-950">No cases yet.</p>
          <p className="mt-1 text-sm text-ink-600">
            Reports filed at <code className="font-mono">/report</code> will show up here.
          </p>
        </div>
      )}

      {!error && cases.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-lg border border-ink-800/10 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink-800/10 text-ink-500">
              <tr>
                <th className="px-4 py-3 font-medium">Case ID</th>
                <th className="px-4 py-3 font-medium">Device</th>
                <th className="px-4 py-3 font-medium">IMEI</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Last seen</th>
                <th className="px-4 py-3 font-medium">Filed</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => (
                <tr key={c.case_id} className="border-b border-ink-800/5 last:border-0">
                  <td className="px-4 py-3 font-mono text-ink-950">
                    <Link
                      href={`/admin/cases/${encodeURIComponent(c.case_id)}`}
                      className="hover:text-flare-600 hover:underline"
                    >
                      {c.case_id}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-800">
                    {[c.brand, c.model].filter(Boolean).join(" ")}{" "}
                    <span className="text-ink-500">({c.device_type})</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-ink-800">
                    {c.imei ?? <span className="text-ink-500">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {isCaseStatus(c.status) && <StatusBadge status={c.status} />}
                  </td>
                  <td className="px-4 py-3 text-ink-800">{c.last_seen_location}</td>
                  <td className="px-4 py-3 text-ink-600">{formatDate(c.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
