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

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(`Failed to verify your session: ${userError.message}`);
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
