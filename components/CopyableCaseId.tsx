"use client";

import { useState } from "react";

export function CopyableCaseId({ caseId }: { caseId: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(caseId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — the ID is already visible to select
      // and copy manually, so this is a silent no-op.
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <span className="rounded-lg border border-ink-800/15 bg-white px-6 py-4 font-mono text-3xl font-medium tracking-wider text-ink-950 sm:text-4xl">
        {caseId}
      </span>
      <button
        type="button"
        onClick={handleCopy}
        className="rounded-md border border-ink-800/20 px-3 py-1.5 text-sm text-ink-800 hover:border-ink-800/40 hover:text-ink-950"
      >
        {copied ? "Copied" : "Copy case ID"}
      </button>
    </div>
  );
}
