import { STATUS_LABEL, type CaseStatus } from "@/lib/status";

const DOT_CLASS: Record<CaseStatus, string> = {
  open: "bg-signal-open",
  found: "bg-signal-found",
  closed: "bg-signal-closed",
};

const TEXT_CLASS: Record<CaseStatus, string> = {
  open: "text-signal-open",
  found: "text-signal-found",
  closed: "text-signal-closed",
};

export function StatusBadge({ status }: { status: CaseStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-current/20 px-2.5 py-1 font-mono text-xs uppercase tracking-wide ${TEXT_CLASS[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${DOT_CLASS[status]}`} aria-hidden="true" />
      {STATUS_LABEL[status]}
    </span>
  );
}
