import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CASE_ID_PATTERN, normalizeCaseId } from "@/lib/case-id";
import { isCaseStatus, STATUS_DESCRIPTION } from "@/lib/status";
import { StatusBadge } from "@/components/StatusBadge";

type CaseStatusRow = {
  case_id: string;
  device_type: string;
  brand: string;
  model: string | null;
  color: string | null;
  last_seen_location: string;
  last_seen_date: string;
  status: string;
  created_at: string;
  updated_at: string;
};

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function CasePage({
  searchParams,
}: {
  searchParams: { id?: string };
}) {
  const rawId = searchParams.id ?? "";
  const caseId = rawId ? normalizeCaseId(rawId) : "";
  const hasQuery = caseId.length > 0;
  const isValidFormat = hasQuery && CASE_ID_PATTERN.test(caseId);

  let result: CaseStatusRow | null = null;
  let queryFailed = false;

  if (isValidFormat) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("public_case_status")
      .select("*")
      .eq("case_id", caseId)
      .maybeSingle();

    if (error) {
      queryFailed = true;
    } else {
      result = data as CaseStatusRow | null;
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 sm:py-20">
      <span className="font-mono text-xs uppercase tracking-[0.16em] text-ink-500">
        Check a case
      </span>
      <h1 className="mt-3 font-display text-3xl font-semibold text-ink-950">Case status</h1>
      <p className="mt-3 text-ink-700">
        Enter a case ID to see its status. This never shows contact details — just device
        info and status.
      </p>

      <form action="/case" method="get" className="mt-8 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          name="id"
          defaultValue={rawId}
          placeholder="FML-7K9QXN"
          className="w-full rounded-md border border-ink-800/20 bg-white px-4 py-2.5 font-mono text-ink-950 placeholder:text-ink-500/60 focus:border-flare-500 focus:outline-none sm:max-w-xs"
        />
        <button
          type="submit"
          className="rounded-md bg-ink-950 px-6 py-2.5 text-sm font-medium text-paper-50 hover:bg-ink-900"
        >
          Check status
        </button>
      </form>

      <div className="mt-10">
        {hasQuery && !isValidFormat && (
          <div className="rounded-md border border-flare-600/30 bg-flare-500/10 px-4 py-3 text-sm text-flare-600">
            That doesn&apos;t look like a valid case ID. It should look like{" "}
            <span className="font-mono">FML-7K9QXN</span>.
          </div>
        )}

        {isValidFormat && queryFailed && (
          <div className="rounded-md border border-flare-600/30 bg-flare-500/10 px-4 py-3 text-sm text-flare-600">
            Something went wrong looking up that case. Please try again.
          </div>
        )}

        {isValidFormat && !queryFailed && !result && (
          <div className="rounded-lg border border-ink-800/10 bg-white px-6 py-8 text-center">
            <p className="font-medium text-ink-950">No case found for {caseId}.</p>
            <p className="mt-2 text-sm text-ink-600">
              Double-check the ID, or{" "}
              <Link href="/report" className="text-flare-600 hover:underline">
                file a new report
              </Link>
              .
            </p>
          </div>
        )}

        {result && isCaseStatus(result.status) && (
          <div className="rounded-lg border border-ink-800/10 bg-white px-6 py-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-sm text-ink-500">{result.case_id}</p>
                <p className="mt-1 font-display text-xl font-semibold text-ink-950">
                  {[result.color, result.brand, result.model].filter(Boolean).join(" ")}{" "}
                  <span className="font-sans text-base font-normal text-ink-600">
                    ({result.device_type})
                  </span>
                </p>
              </div>
              <StatusBadge status={result.status} />
            </div>

            <p className="mt-4 text-sm leading-relaxed text-ink-700">
              {STATUS_DESCRIPTION[result.status]}
            </p>

            <dl className="mt-6 grid gap-4 border-t border-ink-800/10 pt-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-ink-500">Last seen</dt>
                <dd className="mt-0.5 text-ink-900">{result.last_seen_location}</dd>
              </div>
              <div>
                <dt className="text-ink-500">Last seen date</dt>
                <dd className="mt-0.5 text-ink-900">{formatDate(result.last_seen_date)}</dd>
              </div>
              <div>
                <dt className="text-ink-500">Filed</dt>
                <dd className="mt-0.5 text-ink-900">{formatDate(result.created_at)}</dd>
              </div>
              <div>
                <dt className="text-ink-500">Last updated</dt>
                <dd className="mt-0.5 text-ink-900">{formatDate(result.updated_at)}</dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}
