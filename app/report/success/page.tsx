import Link from "next/link";
import { redirect } from "next/navigation";
import { CASE_ID_PATTERN } from "@/lib/case-id";
import { CopyableCaseId } from "@/components/CopyableCaseId";

export default function ReportSuccessPage({
  searchParams,
}: {
  searchParams: { case?: string };
}) {
  const caseId = searchParams.case ?? "";

  if (!CASE_ID_PATTERN.test(caseId)) {
    redirect("/report");
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-20 text-center sm:py-28">
      <span className="font-mono text-xs uppercase tracking-[0.16em] text-signal-found">
        Report filed
      </span>
      <h1 className="mt-3 font-display text-3xl font-semibold text-ink-950">
        Your case is on record.
      </h1>
      <p className="mt-3 max-w-md text-ink-700">
        Save this ID — it&apos;s the only way to check this case&apos;s status later. It
        won&apos;t be emailed or shown again.
      </p>

      <div className="mt-8">
        <CopyableCaseId caseId={caseId} />
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link
          href={`/case?id=${caseId}`}
          className="rounded-md bg-ink-950 px-5 py-2.5 text-sm font-medium text-paper-50 hover:bg-ink-900"
        >
          View case status
        </Link>
        <Link
          href="/"
          className="rounded-md border border-ink-800/20 px-5 py-2.5 text-sm font-medium text-ink-800 hover:border-ink-800/40 hover:text-ink-950"
        >
          Back home
        </Link>
      </div>
    </div>
  );
}
