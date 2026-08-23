import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { isCaseStatus } from "@/lib/status";
import { StatusBadge } from "@/components/StatusBadge";

export const metadata: Metadata = { title: "Dashboard" };

type CaseRow = {
  case_id: string;
  device_type: string;
  brand: string;
  model: string | null;
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

export default async function AdminDashboardPage() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("cases")
    .select("case_id, device_type, brand, model, status, last_seen_location, created_at")
    .order("created_at", { ascending: false })
    .limit(25);

  const cases = (data ?? []) as CaseRow[];

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex items-baseline justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink-950">Recent cases</h1>
        <p className="text-sm text-ink-500">Read-only in Phase 1 — showing the latest 25</p>
      </div>

      {error && (
        <div className="mt-6 rounded-md border border-flare-600/30 bg-flare-500/10 px-4 py-3 text-sm text-flare-600">
          Couldn&apos;t load cases right now. Please refresh.
        </div>
      )}

      {!error && cases.length === 0 && (
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
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Last seen</th>
                <th className="px-4 py-3 font-medium">Filed</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => (
                <tr key={c.case_id} className="border-b border-ink-800/5 last:border-0">
                  <td className="px-4 py-3 font-mono text-ink-950">{c.case_id}</td>
                  <td className="px-4 py-3 text-ink-800">
                    {[c.brand, c.model].filter(Boolean).join(" ")}{" "}
                    <span className="text-ink-500">({c.device_type})</span>
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
