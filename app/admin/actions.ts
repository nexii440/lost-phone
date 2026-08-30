"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signOutAction() {
  const supabase = createClient();
  try {
    await supabase.auth.signOut();
  } catch {
    // Best-effort: even if the sign-out call itself fails, still send the
    // admin back to /login rather than leaving them on a crashed page.
  }
  redirect("/login");
}
