"use client";

import { useFormState } from "react-dom";
import { signIn, type LoginFormState } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";

const initialState: LoginFormState = {};

export function LoginForm({ middlewareError }: { middlewareError?: string }) {
  const [state, formAction] = useFormState(signIn, initialState);

  const message =
    state.error ??
    (middlewareError === "not_authorized"
      ? "That account isn't on the admin allowlist."
      : undefined);

  return (
    <form action={formAction} className="mt-8 space-y-5">
      {message && (
        <div className="rounded-md border border-flare-600/30 bg-flare-500/10 px-4 py-3 text-sm text-flare-600">
          {message}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-ink-950">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-1.5 w-full rounded-md border border-ink-800/20 bg-white px-3 py-2 text-ink-950 focus:border-flare-500 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-ink-950">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mt-1.5 w-full rounded-md border border-ink-800/20 bg-white px-3 py-2 text-ink-950 focus:border-flare-500 focus:outline-none"
        />
      </div>

      <SubmitButton pendingLabel="Signing in…">Sign in</SubmitButton>
    </form>
  );
}
