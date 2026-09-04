import { STATUS_LABEL, type CaseStatus } from "@/lib/status";

// Reuses the existing signal color tokens from tailwind.config.ts rather
// than introducing new ones.
const DOT_CLASS: Record<CaseStatus, string> = {
  pending: "bg-signal-open",
  active: "bg-signal-found",
  not_active: "bg-signal-closed",
};

const TEXT_CLASS: Record<CaseStatus, string> = {
  pending: "text-signal-open",
  active: "text-signal-found",
  not_active: "text-signal-closed",
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
