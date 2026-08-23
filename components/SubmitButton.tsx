"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  pendingLabel,
}: {
  children: React.ReactNode;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-md bg-ink-950 px-5 py-3 text-sm font-medium text-paper-50 transition hover:bg-ink-900 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
