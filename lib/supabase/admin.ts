import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { requireEnv } from "@/lib/env";

/**
 * Service-role Supabase client. Bypasses RLS entirely — this must never be
 * imported into a Client Component or anything that ships to the browser.
 * The `server-only` import above turns any accidental client-side import
 * into a build-time error rather than a leaked secret.
 *
 * Used exclusively from server actions (app/report/actions.ts) to write
 * case rows and upload report photos to the private "case-uploads" bucket —
 * privileges the anon-key client intentionally doesn't have.
 */
export function createAdminClient() {
  return createSupabaseClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
