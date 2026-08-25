"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Full detail (message + stack) lands in Vercel's function logs even
    // though Next.js redacts the message shown to the browser in
    // production, on purpose, to avoid leaking server internals.
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-start px-6 py-24">
      <span className="font-mono text-xs uppercase tracking-[0.16em] text-flare-600">
        Error
      </span>
      <h1 className="mt-4 font-display text-3xl font-semibold text-ink-950">
        Something went wrong.
      </h1>
      <p className="mt-3 max-w-md text-ink-700">
        {error.message || "An unexpected error occurred."}
      </p>
      {error.digest && (
        <p className="mt-2 font-mono text-xs text-ink-500">Error ID: {error.digest}</p>
      )}
      <div className="mt-8 flex flex-wrap gap-4">
        <button
          onClick={reset}
          className="rounded-md bg-ink-950 px-5 py-2.5 text-sm font-medium text-paper-50 hover:bg-ink-900"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-md border border-ink-800/20 px-5 py-2.5 text-sm font-medium text-ink-800 hover:border-ink-800/40 hover:text-ink-950"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
