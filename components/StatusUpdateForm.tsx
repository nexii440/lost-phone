"use client";

import { useFormState } from "react-dom";
import { updateStatus, type CaseUpdateState } from "@/lib/case-actions";
import { STATUS_LABEL, type CaseStatus } from "@/lib/status";
import { SubmitButton } from "@/components/SubmitButton";

const STATUSES: CaseStatus[] = ["pending", "active", "not_active"];
const initialState: CaseUpdateState = {};

export function StatusUpdateForm({
  caseId,
  currentStatus,
}: {
  caseId: string;
  currentStatus: CaseStatus;
}) {
  const [state, formAction] = useFormState(updateStatus.bind(null, caseId), initialState);

  return (
    <form action={formAction} className="mt-3 flex flex-wrap items-center gap-3">
      <select
        name="status"
        defaultValue={currentStatus}
        className="rounded-md border border-ink-800/20 bg-white px-3 py-2 text-sm text-ink-950 focus:border-flare-500 focus:outline-none"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABEL[s]}
          </option>
        ))}
      </select>
      <SubmitButton pendingLabel="Updating…">Update status</SubmitButton>
      {state.success && (
        <span className="text-sm text-signal-found" role="status">
          Status updated.
        </span>
      )}
      {state.error && (
        <span className="text-sm text-flare-600" role="alert">
          {state.error}
        </span>
      )}
    </form>
  );
}
