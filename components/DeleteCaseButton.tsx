"use client";

import { useFormStatus } from "react-dom";

export function DeleteCaseButton({ caseId }: { caseId: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (!confirm(`Delete case ${caseId}? This permanently removes it and can't be undone.`)) {
          e.preventDefault();
        }
      }}
      className="rounded-md border border-flare-600/40 px-4 py-2 text-sm font-medium text-flare-600 hover:bg-flare-500/10 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Deleting…" : "Delete case"}
    </button>
  );
}
