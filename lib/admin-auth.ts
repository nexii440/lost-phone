import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

/**
 * Verifies the current request belongs to a signed-in user on the admins
 * allowlist, or redirects to /login. Unlike middleware.ts (which fails open
 * on unexpected errors since it has no error boundary available to it),
 * this throws a specific Error on genuine failures — app/error.tsx catches
 * it and shows a real, readable message instead of a blank 500.
 */
export async function requireAdmin(): Promise<User> {
  const supabase = createClient();

  // Deliberately not checking the `error` field getUser() returns
  // alongside `user`: Supabase's client populates it with an
  // AuthSessionMissingError for the entirely normal case of "no active
  // session" (any anonymous visit, or an expired session) — that's not a
  // real failure, it's the expected signal to redirect to /login. Throwing
  // on it turned every logged-out visit to /admin into a hard error. `user`
  // being null/non-null is the only signal that matters here, exactly like
  // middleware.ts already (correctly) treats it. A genuine configuration
  // problem — a missing or malformed Supabase URL/key — still throws
  // clearly, just earlier: requireEnv() in lib/supabase/server.ts catches
  // that before this function is ever reached.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: adminRow, error: adminError } = await supabase
    .from("admins")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (adminError) {
    throw new Error(`Failed to verify admin access: ${adminError.message}`);
  }

  if (!adminRow) {
    redirect("/login?error=not_authorized");
  }

  return user;
}
