import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Admin Sign In" };

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <div className="mx-auto max-w-sm px-6 py-16 sm:py-24">
      <span className="font-mono text-xs uppercase tracking-[0.16em] text-ink-500">
        Admin
      </span>
      <h1 className="mt-3 font-display text-2xl font-semibold text-ink-950">Sign in</h1>
      <p className="mt-2 text-sm text-ink-600">Admin access only.</p>

      <LoginForm middlewareError={searchParams.error} />
    </div>
  );
}
