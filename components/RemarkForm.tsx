"use client";

import { useFormState } from "react-dom";
import { updateRemark, type CaseUpdateState } from "@/lib/case-actions";
import { SubmitButton } from "@/components/SubmitButton";

const initialState: CaseUpdateState = {};

export function RemarkForm({
  caseId,
  currentRemark,
}: {
  caseId: string;
  currentRemark: string | null;
}) {
  const [state, formAction] = useFormState(updateRemark.bind(null, caseId), initialState);

  return (
    <form action={formAction} className="mt-3 space-y-3">
      <textarea
        name="admin_remark"
        rows={3}
        defaultValue={currentRemark ?? ""}
        placeholder="Police complaint verified, owner contacted, device recovered…"
        className="w-full rounded-md border border-ink-800/20 bg-white px-3 py-2 text-sm text-ink-950 placeholder:text-ink-500/60 focus:border-flare-500 focus:outline-none"
      />
      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton pendingLabel="Saving…">Save remark</SubmitButton>
        {state.success && (
          <span className="text-sm text-signal-found" role="status">
            Remark saved.
          </span>
        )}
        {state.error && (
          <span className="text-sm text-flare-600" role="alert">
            {state.error}
          </span>
        )}
      </div>
    </form>
  );
}
