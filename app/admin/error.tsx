"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center">
      <span className="font-mono text-xs uppercase tracking-[0.16em] text-flare-600">
        Dashboard error
      </span>
      <h1 className="mt-3 font-display text-xl font-semibold text-ink-950">
        Couldn&apos;t load the admin dashboard.
      </h1>
      <p className="mt-3 text-ink-700">{error.message || "An unexpected error occurred."}</p>
      {error.digest && (
        <p className="mt-2 font-mono text-xs text-ink-500">Error ID: {error.digest}</p>
      )}
      <button
        onClick={reset}
        className="mt-6 rounded-md bg-ink-950 px-5 py-2.5 text-sm font-medium text-paper-50 hover:bg-ink-900"
      >
        Try again
      </button>
    </div>
  );
}
