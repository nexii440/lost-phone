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

  // Deliberately catching here, not just checking a returned `error`
  // field: Supabase's client can signal "no active session"
  // (AuthSessionMissingError) either as a returned error OR, in some
  // runtimes, as a thrown exception. Both mean the same ordinary thing —
  // no one is signed in — and both must resolve to `user = null` here,
  // never propagate as an uncaught Server Component error. A genuine
  // configuration problem (missing/malformed Supabase URL or key) still
  // throws clearly, just earlier: requireEnv() in lib/supabase/server.ts
  // catches that before this function is ever reached.
  let user: User | null = null;
  try {
    const {
      data: { user: fetchedUser },
    } = await supabase.auth.getUser();
    user = fetchedUser;
  } catch {
    user = null;
  }

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
